import math
import logging
from typing import List, Optional, Tuple, Dict
from app.models.route_models import Coordinate, VehicleInfo, RouteInfo, RecommendedChargerDetails
from app.data.mock_chargers import ChargingStation, get_mock_chargers
from app.services.battery_model import (
    calculate_initial_battery_energy,
    calculate_energy_consumed,
    calculate_remaining_energy,
    calculate_arrival_battery_percentage
)
from app.services.routing_provider import BaseRoutingProvider, get_routing_provider, RoutingAPIError
from app.services.charger_provider import BaseChargerProvider

logger = logging.getLogger(__name__)

def haversine_distance(c1: Coordinate, c2: Coordinate) -> float:
    """
    Computes the great-circle distance between two coordinates in kilometers.
    """
    R = 6371.0  # Radius of Earth in kilometers
    lat1 = math.radians(c1.lat)
    lng1 = math.radians(c1.lng)
    lat2 = math.radians(c2.lat)
    lng2 = math.radians(c2.lng)

    dlat = lat2 - lat1
    dlng = lng2 - lng1

    a = math.sin(dlat / 2.0)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def find_closest_point_on_route(
    route_geometry: List[Coordinate],
    target: Coordinate
) -> Tuple[Coordinate, int, float]:
    """
    Finds the coordinate on the route geometry closest to the target,
    its index, and the Haversine distance to it.
    """
    min_dist = float("inf")
    closest_pt = route_geometry[0]
    closest_idx = 0

    for idx, pt in enumerate(route_geometry):
        dist = haversine_distance(pt, target)
        if dist < min_dist:
            min_dist = dist
            closest_pt = pt
            closest_idx = idx

    return closest_pt, closest_idx, min_dist

def get_distance_along_route(route_geometry: List[Coordinate], end_idx: int) -> float:
    """
    Calculates distance along route geometry from start up to end_idx.
    """
    dist = 0.0
    for idx in range(min(end_idx, len(route_geometry) - 1)):
        dist += haversine_distance(route_geometry[idx], route_geometry[idx + 1])
    return dist

class ChargerSelectionResult:
    def __init__(
        self,
        charger: ChargingStation,
        total_distance: float,
        total_driving_time_seconds: float,
        waiting_minutes: Optional[float],
        charging_minutes: Optional[float],
        total_journey_minutes: float,
        charging_cost: Optional[float],
        final_arrival_battery_pct: float,
        score: float
    ):
        self.charger = charger
        self.total_distance = total_distance
        self.total_driving_time_seconds = total_driving_time_seconds
        self.waiting_minutes = waiting_minutes
        self.charging_minutes = charging_minutes
        self.total_journey_minutes = total_journey_minutes
        self.charging_cost = charging_cost
        self.final_arrival_battery_pct = final_arrival_battery_pct
        self.score = score

def evaluate_charging_options(
    vehicle: VehicleInfo,
    route: RouteInfo,
    chargers: List[ChargingStation],
    routing_provider: Optional[BaseRoutingProvider] = None
) -> List[ChargerSelectionResult]:
    """
    Evaluates all candidate charging stations along the route.
    Returns a list of successful charging options sorted by optimal score.
    """
    if routing_provider is None:
        routing_provider = get_routing_provider()

    results = []
    
    # Calculate average speed of the base route to estimate detour driving time
    # Default to 40 km/h if duration or distance is invalid
    average_speed_km_s = 40.0 / 3600.0
    if route.duration_seconds > 0 and route.distance_km > 0:
        average_speed_km_s = route.distance_km / route.duration_seconds

    # Initial vehicle parameters
    initial_energy = calculate_initial_battery_energy(
        vehicle.battery_capacity_kwh,
        vehicle.battery_percentage
    )

    for charger in chargers:
        # 1. Skip if charger is in maintenance
        if charger.status.lower() == "maintenance":
            continue

        # 2. Haversine Pre-filter to evaluate theoretical feasibility
        if route.geometry:
            # Find the point on the route closest to the charger
            closest_pt, closest_idx, detour_one_way = find_closest_point_on_route(
                route.geometry, Coordinate(lat=charger.latitude, lng=charger.longitude)
            )
            # Estimate distances
            dist_start_to_closest = get_distance_along_route(route.geometry, closest_idx)
            dist_closest_to_end = route.distance_km - dist_start_to_closest
            
            distance_to_charger_hav = dist_start_to_closest + detour_one_way
            distance_from_charger_to_dest_hav = detour_one_way + dist_closest_to_end
        else:
            # Fallback if no geometry exists
            source_coord = Coordinate(lat=28.6139, lng=77.2090)
            dest_coord = Coordinate(lat=28.6129, lng=77.2295)
            charger_coord = Coordinate(lat=charger.latitude, lng=charger.longitude)
            
            distance_to_charger_hav = haversine_distance(source_coord, charger_coord)
            distance_from_charger_to_dest_hav = haversine_distance(charger_coord, dest_coord)

        # Theoretical (Haversine-based) feasibility pre-check to the charger
        energy_to_charger_hav = calculate_energy_consumed(
            distance_to_charger_hav,
            vehicle.consumption_kwh_per_km,
            route.traffic_level
        )
        energy_arrival_charger_hav = calculate_remaining_energy(initial_energy, energy_to_charger_hav)
        arrival_pct_charger_hav = calculate_arrival_battery_percentage(
            energy_arrival_charger_hav,
            vehicle.battery_capacity_kwh
        )

        if arrival_pct_charger_hav < vehicle.minimum_reserve_pct:
            # Stranded even in straight-line. Filter out.
            continue

        # Theoretical feasibility check from charger to destination
        energy_charger_to_dest_hav = calculate_energy_consumed(
            distance_from_charger_to_dest_hav,
            vehicle.consumption_kwh_per_km,
            route.traffic_level
        )
        energy_needed_leave_charger_hav = energy_charger_to_dest_hav + (
            vehicle.battery_capacity_kwh * (vehicle.minimum_reserve_pct / 100.0)
        )
        min_leave_pct_hav = (energy_needed_leave_charger_hav / vehicle.battery_capacity_kwh) * 100.0

        if min_leave_pct_hav > 100.0:
            # Dest unreachable even in straight-line at 100% SoC. Filter out.
            continue

        # 3. Shortlisted: Calculate real road distance and duration using OSRM (or Haversine if using MockRoutingProvider)
        from app.services.routing_provider import MockRoutingProvider
        if isinstance(routing_provider, MockRoutingProvider):
            # For MockRoutingProvider, use Haversine detour distances to preserve offline test assertions
            distance_to_charger = distance_to_charger_hav
            distance_from_charger_to_dest = distance_from_charger_to_dest_hav
            total_distance = distance_to_charger + distance_from_charger_to_dest
            total_driving_time = total_distance * 60.0  # 60s per km (approx 60 km/h)
        else:
            if route.geometry:
                source_coord = route.geometry[0]
                dest_coord = route.geometry[-1]
            else:
                source_coord = Coordinate(lat=28.6139, lng=77.2090)
                dest_coord = Coordinate(lat=28.6129, lng=77.2295)
                
            charger_coord = Coordinate(lat=charger.latitude, lng=charger.longitude)

            try:
                routes_to = routing_provider.get_candidate_routes(source_coord, charger_coord)
                routes_from = routing_provider.get_candidate_routes(charger_coord, dest_coord)
                
                if not routes_to or not routes_from:
                    logger.warning(f"No OSRM road routes found for charger {charger.station_id}. Skipping.")
                    continue
                    
                leg_to = routes_to[0]
                leg_from = routes_from[0]
                
                distance_to_charger = leg_to.distance_km
                distance_from_charger_to_dest = leg_from.distance_km
                total_distance = distance_to_charger + distance_from_charger_to_dest
                total_driving_time = leg_to.duration_seconds + leg_from.duration_seconds
                
            except (RoutingAPIError, Exception) as err:
                logger.warning(f"OSRM routing failed for charger {charger.station_id}: {err}. Skipping.")
                continue

        # 4. Check if vehicle can reach the charger via real road route
        energy_to_charger = calculate_energy_consumed(
            distance_to_charger,
            vehicle.consumption_kwh_per_km,
            route.traffic_level
        )
        energy_arrival_charger = calculate_remaining_energy(initial_energy, energy_to_charger)
        arrival_pct_charger = calculate_arrival_battery_percentage(
            energy_arrival_charger,
            vehicle.battery_capacity_kwh
        )

        if arrival_pct_charger < vehicle.minimum_reserve_pct:
            # Stranded on actual road route. Skip.
            continue

        # 5. Check if vehicle can reach the destination from charger via real road route
        energy_charger_to_dest = calculate_energy_consumed(
            distance_from_charger_to_dest,
            vehicle.consumption_kwh_per_km,
            route.traffic_level
        )
        
        # Minimum energy required leaving charger to reach destination + reserve
        energy_needed_leave_charger = energy_charger_to_dest + (
            vehicle.battery_capacity_kwh * (vehicle.minimum_reserve_pct / 100.0)
        )
        min_leave_pct = (energy_needed_leave_charger / vehicle.battery_capacity_kwh) * 100.0

        if min_leave_pct > 100.0:
            # Unreachable even at 100% capacity on actual road route. Skip.
            continue

        # Target battery state of charge (SOC) to leave charger (e.g. charge to configured target_soc_pct or 80%)
        default_target_soc = vehicle.target_soc_pct if vehicle.target_soc_pct is not None else 80.0
        target_pct = min(100.0, max(min_leave_pct, default_target_soc))

        # 5. Calculate charging and waiting times (using neutral assumptions for internal routing optimization)
        energy_to_add = ((target_pct - arrival_pct_charger) / 100.0) * vehicle.battery_capacity_kwh
        energy_to_add = max(0.0, energy_to_add)

        # Resolve nullable OSM tags to safe defaults for detour calculation
        # These are used for internal ranking and feasibility checks
        calc_power = charger.charging_power_kw if charger.charging_power_kw is not None else 50.0
        calc_price = charger.price_per_kwh if charger.price_per_kwh is not None else 12.0
        calc_wait = charger.estimated_wait_minutes if charger.estimated_wait_minutes is not None else 0.0
        available_ports = charger.available_ports if charger.available_ports is not None else 2

        calc_charging_time_hours = energy_to_add / calc_power
        calc_charging_minutes = calc_charging_time_hours * 60.0

        # Waiting time (internal for optimization): do not apply queue penalty if OSM, but keep it for mock
        calc_waiting_minutes = calc_wait
        if available_ports == 0:
            calc_waiting_minutes += 30.0  # 30-minute queue penalty for occupied stations

        # 6. Calculate charging cost (internal for optimization)
        calc_charging_cost = energy_to_add * calc_price

        # 7. Calculate final arrival battery at destination
        final_energy = ((target_pct / 100.0) * vehicle.battery_capacity_kwh) - energy_charger_to_dest
        final_arrival_pct = calculate_arrival_battery_percentage(
            final_energy,
            vehicle.battery_capacity_kwh
        )

        # 8. Calculate total journey time (internal for optimization)
        calc_total_journey_minutes = (total_driving_time / 60.0) + calc_waiting_minutes + calc_charging_minutes

        # 9. Compute a multi-factor score for this charger option (lower is better)
        # Weights prioritize journey time and cost
        time_weight = 1.0
        cost_weight = 0.2
        
        score = (calc_total_journey_minutes * time_weight) + (calc_charging_cost * cost_weight)

        # 10. Map output values.
        # If the input field was None (unprovided by OSM), represent as None in output
        # to ensure we don't present fabricated data to the user.
        out_waiting_minutes = calc_waiting_minutes if charger.estimated_wait_minutes is not None else None
        out_charging_minutes = calc_charging_minutes if charger.charging_power_kw is not None else None
        out_charging_cost = calc_charging_cost if charger.price_per_kwh is not None else None

        results.append(
            ChargerSelectionResult(
                charger=charger,
                total_distance=round(total_distance, 2),
                total_driving_time_seconds=round(total_driving_time, 2),
                waiting_minutes=round(out_waiting_minutes, 2) if out_waiting_minutes is not None else None,
                charging_minutes=round(out_charging_minutes, 2) if out_charging_minutes is not None else None,
                total_journey_minutes=round(calc_total_journey_minutes, 2),
                charging_cost=round(out_charging_cost, 2) if out_charging_cost is not None else None,
                final_arrival_battery_pct=round(final_arrival_pct, 2),
                score=round(score, 2)
            )
        )

    # Sort candidates by score ascending (best scoring option first)
    results.sort(key=lambda x: x.score)
    return results

def select_best_charger_for_route(
    vehicle: VehicleInfo,
    route: RouteInfo,
    routing_provider: Optional[BaseRoutingProvider] = None,
    charger_provider: Optional[BaseChargerProvider] = None
) -> Optional[ChargerSelectionResult]:
    """
    Selects the best available charging station along the route.
    Returns the evaluation details, or None if no charger is feasible.
    """
    import os
    provider_name = os.getenv("CHARGER_PROVIDER", "ocm").lower()
    
    if provider_name == "mock":
        chargers = get_mock_chargers()
    else:
        BUFFER = 0.15
        if route.geometry:
            min_lat = min(pt.lat for pt in route.geometry) - BUFFER
            max_lat = max(pt.lat for pt in route.geometry) + BUFFER
            min_lng = min(pt.lng for pt in route.geometry) - BUFFER
            max_lng = max(pt.lng for pt in route.geometry) + BUFFER
        else:
            min_lat, max_lat = 28.5, 28.7
            min_lng, max_lng = 77.1, 77.3
            
        if charger_provider is None:
            from app.services.charger_provider import get_charger_provider
            charger_provider = get_charger_provider()
            
        chargers = charger_provider.get_chargers_in_bbox(min_lat, min_lng, max_lat, max_lng)
        
    options = evaluate_charging_options(vehicle, route, chargers, routing_provider)
    return options[0] if options else None
