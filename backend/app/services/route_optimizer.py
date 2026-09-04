from typing import List, Tuple, Optional
import logging
from app.models.route_models import (
    VehicleInfo, RouteInfo, RouteOptimizationResponse, EvaluatedRouteDetails, RecommendedChargerDetails
)
from app.services.battery_model import (
    calculate_initial_battery_energy,
    calculate_energy_consumed,
    calculate_remaining_energy,
    calculate_arrival_battery_percentage,
    is_route_feasible
)
from app.services.route_scorer import score_route
from app.services.charger_selector import select_best_charger_for_route

logger = logging.getLogger(__name__)

from app.services.routing_provider import BaseRoutingProvider
from app.services.charger_provider import BaseChargerProvider

def optimize_ev_route(
    vehicle: VehicleInfo,
    candidate_routes: List[RouteInfo],
    routing_provider: Optional[BaseRoutingProvider] = None,
    charger_provider: Optional[BaseChargerProvider] = None
) -> RouteOptimizationResponse:
    """
    Optimizes EV journeys. If direct routes satisfy the reserve, selects the best direct route.
    If direct routes are infeasible, evaluates charging stations along the route to select the
    most optimal charging detour option.
    """
    evaluated_routes: List[EvaluatedRouteDetails] = []
    feasible_direct_routes: List[Tuple[RouteInfo, EvaluatedRouteDetails, float]] = [] # (route, details, score)
    
    # 1. Calculate initial battery energy
    initial_energy_kwh = calculate_initial_battery_energy(
        vehicle.battery_capacity_kwh,
        vehicle.battery_percentage
    )

    # 2. Evaluate all routes for direct feasibility
    for route in candidate_routes:
        consumption_rate = getattr(vehicle, "consumption_kwh_per_km", None) or 0.16
        
        energy_consumed = calculate_energy_consumed(
            route.distance_km,
            consumption_rate,
            route.traffic_level
        )
        
        # Dynamic calculations for tolls and elevation based on route distance and characteristics
        calculated_toll = int(route.distance_km * 2.25) if "Express" in route.name or route.distance_km > 100 else int(route.distance_km * 1.2)
        toll_str = f"₹{calculated_toll}" if calculated_toll > 0 else "₹0"
        
        elevation_gain = int(route.distance_km * 1.4)
        elevation_str = f"+{elevation_gain}m"
        
        remaining_energy = calculate_remaining_energy(initial_energy_kwh, energy_consumed)
        arrival_battery_pct = calculate_arrival_battery_percentage(
            remaining_energy,
            vehicle.battery_capacity_kwh
        )
        
        feasible = is_route_feasible(arrival_battery_pct, vehicle.minimum_reserve_pct)
        
        route_score = None
        if feasible:
            route_score = score_route(
                route.duration_seconds,
                route.traffic_level,
                arrival_battery_pct,
                vehicle.minimum_reserve_pct
            )
            reason = "Feasible directly"
        else:
            reason = (
                f"Infeasible directly: Arrival battery ({arrival_battery_pct:.1f}%) "
                f"falls below the required minimum reserve of {vehicle.minimum_reserve_pct:.1f}%."
            )

        details = EvaluatedRouteDetails(
            route_id=route.route_id,
            name=route.name,
            distance_km=route.distance_km,
            duration_seconds=route.duration_seconds,
            traffic_level=route.traffic_level,
            energy_consumed_kwh=round(energy_consumed, 2),
            arrival_battery_percentage=round(arrival_battery_pct, 2),
            is_feasible=feasible,
            score=route_score,
            reason=reason,
            geometry=route.geometry,
            tolls=toll_str,
            elevation_gain=elevation_str,
            toll_cost_inr=toll_str,
            elevation_gain_m=elevation_str,
            kwh_depletion=f"{round(energy_consumed, 2)} kWh"
        )
        
        evaluated_routes.append(details)
        if feasible:
            feasible_direct_routes.append((route, details, route_score))

    # 3. If direct routes are feasible, choose the best direct route
    if feasible_direct_routes:
        feasible_direct_routes.sort(key=lambda x: x[2])
        best_route, best_details, best_score = feasible_direct_routes[0]
        
        fastest_candidate = min(candidate_routes, key=lambda r: r.duration_seconds)
        fastest_details = next((x for x in evaluated_routes if x.route_id == fastest_candidate.route_id), None)
        fastest_is_feasible = fastest_details.is_feasible if fastest_details else False
        
        if best_route.route_id == fastest_candidate.route_id:
            reason = (
                f"Selected '{best_route.name}' because it is the fastest feasible route "
                f"and satisfies the vehicle's minimum battery reserve."
            )
        elif not fastest_is_feasible:
            reason = (
                f"Selected '{best_route.name}' because the fastest candidate "
                f"'{fastest_candidate.name}' is infeasible due to battery constraints."
            )
        else:
            reason = (
                f"Selected '{best_route.name}' as the optimal route based on travel time, "
                f"traffic conditions, and battery safety, whereas the faster candidate "
                f"'{fastest_candidate.name}' is less optimal due to heavy traffic or battery risk."
            )

        return RouteOptimizationResponse(
            recommended_route_id=best_route.route_id,
            distance_km=best_details.distance_km,
            eta_minutes=round(best_details.duration_seconds / 60.0, 1),
            arrival_battery_percentage=best_details.arrival_battery_percentage,
            feasible=True,
            score=best_score,
            reason=reason,
            charging_required=False,
            recommended_charger=None,
            evaluated_routes=evaluated_routes
        )
    
    # 4. If no direct routes are feasible, evaluate charging detours
    logger.info("Direct routing is infeasible. Initiating charging-aware routing.")
    charging_options = []
    
    for route in candidate_routes:
        charger_option = select_best_charger_for_route(vehicle, route, routing_provider, charger_provider)
        if charger_option:
            charging_options.append((route, charger_option))
            
    if charging_options:
        # Sort charging options by score ascending (lowest score is best)
        charging_options.sort(key=lambda x: x[1].score)
        selected_route, selected_option = charging_options[0]
        
        reason = (
            f"Charging stop recommended at '{selected_option.charger.name}' because the vehicle "
            f"cannot reach the destination directly with its current battery ({vehicle.battery_percentage:.1f}%). "
            f"Charger selected to optimize detour travel time, queue wait time, and cost."
        )
        has_unknowns = (
            selected_option.charger.charging_power_kw is None or
            selected_option.charger.price_per_kwh is None or
            selected_option.charger.estimated_wait_minutes is None
        )
        if has_unknowns:
            import os
            provider_name = os.getenv("CHARGER_PROVIDER", "ocm").lower()
            source_name = "OpenChargeMap" if provider_name in ("ocm", "openchargemap") else "OpenStreetMap"
            reason += f" Note: Detour calculations use neutral defaults (50kW power, 12.0/kWh price, 0m queue) because some station parameters are unknown in {source_name}."
        
        charger_details = RecommendedChargerDetails(
            station_id=selected_option.charger.station_id,
            name=selected_option.charger.name,
            waiting_minutes=selected_option.waiting_minutes,
            charging_minutes=selected_option.charging_minutes,
            charging_cost=selected_option.charging_cost,
            ocm_id=selected_option.charger.ocm_id,
            address=selected_option.charger.address,
            connector_info=selected_option.charger.connector_info,
            charging_power_kw=selected_option.charger.charging_power_kw,
            operator=selected_option.charger.operator
        )
        
        # Update evaluated routes details to show feasibility with charging
        for route_details in evaluated_routes:
            if route_details.route_id == selected_route.route_id:
                route_details.is_feasible = True
                route_details.arrival_battery_percentage = selected_option.final_arrival_battery_pct
                route_details.reason = f"Feasible with charging stop at {selected_option.charger.name}"
        
        return RouteOptimizationResponse(
            recommended_route_id=selected_route.route_id,
            distance_km=selected_option.total_distance,
            eta_minutes=selected_option.total_journey_minutes,
            arrival_battery_percentage=selected_option.final_arrival_battery_pct,
            feasible=True,
            score=selected_option.score,
            reason=reason,
            charging_required=True,
            recommended_charger=charger_details,
            evaluated_routes=evaluated_routes
        )
    
    # 5. Handle the case where no route is feasible even with charging stops
    closest_route = max(evaluated_routes, key=lambda x: x.arrival_battery_percentage)
    
    reason = (
        f"No feasible routes found. All candidate routes violate the vehicle's "
        f"minimum battery reserve of {vehicle.minimum_reserve_pct:.1f}% and no feasible "
        f"charging station detour could be determined."
    )
    
    return RouteOptimizationResponse(
        recommended_route_id=None,
        distance_km=None,
        eta_minutes=None,
        arrival_battery_percentage=None,
        feasible=False,
        score=None,
        reason=reason,
        charging_required=False,
        recommended_charger=None,
        evaluated_routes=evaluated_routes
    )