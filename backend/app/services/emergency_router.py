import logging
from typing import List, Optional, Tuple

from app.models.route_models import (
    Coordinate, EmergencyIncident, EmergencyVehicle, SelectedVehicleDetails,
    EmergencyRouteDetails, EvaluatedVehicleDetails, EmergencyOptimizeResponse, DistrictInfo
)
from app.services.gis_service import GISService
from app.data.mock_vehicles import get_mock_vehicles
from app.services.routing_provider import get_routing_provider
from app.services.battery_model import (
    calculate_initial_battery_energy,
    calculate_energy_consumed,
    calculate_remaining_energy,
    calculate_arrival_battery_percentage,
    is_route_feasible
)

logger = logging.getLogger(__name__)

def optimize_emergency_dispatch(
    incident: EmergencyIncident,
    routing_provider = None,
    vehicle_repository = None
) -> EmergencyOptimizeResponse:
    """
    Ranks available emergency vehicles for a dispatch incident, prioritizing the shortest response
    time (ETA) while guaranteeing battery reserve feasibility. Reuses the core routing and battery logic.
    """
    if routing_provider is None:
        routing_provider = get_routing_provider()

    # Look up administrative district of the incident
    gis_service = GISService()
    gis_res = gis_service.locate_point(incident.location)
    district_info = DistrictInfo(
        district_id=gis_res["district_id"],
        district_name=gis_res["district_name"],
        state_name=gis_res["state_name"]
    )

    if vehicle_repository is not None:
        vehicles = vehicle_repository.get_all_vehicles()
    else:
        vehicles = get_mock_vehicles()

    if not vehicles:
        reason = "No registered emergency vehicles found in the database."
        return EmergencyOptimizeResponse(
            incident_id=incident.incident_id,
            district=district_info,
            selected_vehicle=None,
            route=None,
            reason=reason,
            evaluated_vehicles=[]
        )

    evaluated_vehicles: List[EvaluatedVehicleDetails] = []
    feasible_candidates: List[Tuple[EmergencyVehicle, float, float, float, any]] = [] # (vehicle, distance_km, eta_min, arrival_pct, route)

    for vehicle in vehicles:
        is_type_match = vehicle.vehicle_type == incident.required_vehicle_type
        is_available = vehicle.availability_status == "available"

        # Check vehicle eligibility
        if not is_type_match:
            reason = f"Excluded because the incident requires a '{incident.required_vehicle_type}' vehicle."
            evaluated_vehicles.append(
                EvaluatedVehicleDetails(
                    vehicle_id=vehicle.vehicle_id,
                    vehicle_type=vehicle.vehicle_type,
                    is_available=is_available,
                    is_type_match=is_type_match,
                    is_feasible=False,
                    status=vehicle.availability_status,
                    reason=reason
                )
            )
            continue

        if not is_available:
            reason = f"Excluded because it is currently '{vehicle.availability_status}'."
            evaluated_vehicles.append(
                EvaluatedVehicleDetails(
                    vehicle_id=vehicle.vehicle_id,
                    vehicle_type=vehicle.vehicle_type,
                    is_available=is_available,
                    is_type_match=is_type_match,
                    is_feasible=False,
                    status=vehicle.availability_status,
                    reason=reason
                )
            )
            continue

        # Fetch candidate routes between vehicle location and incident location
        try:
            routes = routing_provider.get_candidate_routes(vehicle.current_location, incident.location)
        except Exception as exc:
            logger.error(f"Failed to fetch routes for vehicle {vehicle.vehicle_id}: {exc}")
            routes = []

        if not routes:
            reason = "Rejected because no routes could be calculated from its current location."
            evaluated_vehicles.append(
                EvaluatedVehicleDetails(
                    vehicle_id=vehicle.vehicle_id,
                    vehicle_type=vehicle.vehicle_type,
                    is_available=is_available,
                    is_type_match=is_type_match,
                    is_feasible=False,
                    status=vehicle.availability_status,
                    reason=reason
                )
            )
            continue

        # Evaluate routes for this vehicle to find the fastest feasible one
        initial_energy = calculate_initial_battery_energy(
            vehicle.battery_capacity_kwh,
            vehicle.battery_percentage
        )

        feasible_routes = []
        for route in routes:
            consumed = calculate_energy_consumed(
                route.distance_km,
                vehicle.consumption_kwh_per_km,
                route.traffic_level
            )
            remaining = calculate_remaining_energy(initial_energy, consumed)
            arrival_pct = calculate_arrival_battery_percentage(remaining, vehicle.battery_capacity_kwh)
            
            feasible = is_route_feasible(arrival_pct, vehicle.minimum_reserve_pct)
            if feasible:
                feasible_routes.append((route, arrival_pct))

        if not feasible_routes:
            # All routes are infeasible (violates reserve limits)
            # Find the best attempt for logging
            best_route = min(routes, key=lambda r: r.distance_km)
            consumed = calculate_energy_consumed(best_route.distance_km, vehicle.consumption_kwh_per_km, best_route.traffic_level)
            remaining = calculate_remaining_energy(initial_energy, consumed)
            arrival_pct = calculate_arrival_battery_percentage(remaining, vehicle.battery_capacity_kwh)
            
            reason = (
                f"Rejected because its estimated arrival battery ({arrival_pct:.1f}%) "
                f"would fall below the emergency reserve of {vehicle.minimum_reserve_pct:.1f}%."
            )
            evaluated_vehicles.append(
                EvaluatedVehicleDetails(
                    vehicle_id=vehicle.vehicle_id,
                    vehicle_type=vehicle.vehicle_type,
                    is_available=is_available,
                    is_type_match=is_type_match,
                    is_feasible=False,
                    status=vehicle.availability_status,
                    reason=reason
                )
            )
        else:
            # Sort routes by duration to select the fastest feasible route
            feasible_routes.sort(key=lambda x: x[0].duration_seconds)
            fastest_route, arrival_pct = feasible_routes[0]
            
            distance_km = fastest_route.distance_km
            eta_min = fastest_route.duration_seconds / 60.0
            
            reason = f"Available and feasible (ETA: {eta_min:.1f} min, Arrival Battery: {arrival_pct:.1f}%)."
            
            evaluated_vehicles.append(
                EvaluatedVehicleDetails(
                    vehicle_id=vehicle.vehicle_id,
                    vehicle_type=vehicle.vehicle_type,
                    is_available=is_available,
                    is_type_match=is_type_match,
                    is_feasible=True,
                    eta_minutes=round(eta_min, 1),
                    arrival_battery_percentage=round(arrival_pct, 1),
                    status=vehicle.availability_status,
                    reason=reason
                )
            )
            
            feasible_candidates.append(
                (vehicle, distance_km, eta_min, arrival_pct, fastest_route)
            )

    # 5. Select the best vehicle based on shortest ETA
    if feasible_candidates:
        # Sort candidates by ETA ascending (lowest travel duration is best)
        feasible_candidates.sort(key=lambda x: x[2])
        best_vehicle, dist_km, eta_min, arrival_pct, best_route = feasible_candidates[0]
        
        selected_details = SelectedVehicleDetails(
            vehicle_id=best_vehicle.vehicle_id,
            vehicle_type=best_vehicle.vehicle_type
        )
        
        route_details = EmergencyRouteDetails(
            distance_km=round(dist_km, 2),
            eta_minutes=round(eta_min, 1),
            arrival_battery_percentage=round(arrival_pct, 1),
            geometry=best_route.geometry,
            source=best_vehicle.current_location,
            destination=incident.location
        )
        
        reason = (
            f"'{best_vehicle.vehicle_id}' selected because it provides the fastest feasible "
            f"response among available {best_vehicle.vehicle_type} vehicles (ETA: {eta_min:.1f} min)."
        )
        
        return EmergencyOptimizeResponse(
            incident_id=incident.incident_id,
            district=district_info,
            selected_vehicle=selected_details,
            route=route_details,
            reason=reason,
            evaluated_vehicles=evaluated_vehicles
        )

    # 6. No feasible candidates
    reason = (
        f"No feasible available '{incident.required_vehicle_type}' vehicles could reach the "
        f"incident location while maintaining their required minimum battery reserve."
    )
    return EmergencyOptimizeResponse(
        incident_id=incident.incident_id,
        district=district_info,
        selected_vehicle=None,
        route=None,
        reason=reason,
        evaluated_vehicles=evaluated_vehicles
    )
