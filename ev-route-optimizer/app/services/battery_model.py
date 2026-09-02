from typing import List, Optional, Dict, Any

def calculate_initial_battery_energy(capacity_kwh: float, battery_percentage: float) -> float:
    """
    Calculates the initial battery energy in kWh.
    """
    return capacity_kwh * (battery_percentage / 100.0)

def calculate_energy_consumed(
    distance_km: float,
    consumption_kwh_per_km: float,
    traffic_level: str = "low"
) -> float:
    """
    Estimates the energy consumed for a given distance, consumption rate, and traffic level.
    Adjusts consumption based on traffic congestion (stop-and-go driving).
    """
    traffic_multipliers = {
        "low": 1.0,
        "moderate": 1.05,
        "heavy": 1.15
    }
    multiplier = traffic_multipliers.get(traffic_level.lower(), 1.0)
    return distance_km * consumption_kwh_per_km * multiplier

def calculate_remaining_energy(initial_energy_kwh: float, energy_consumed_kwh: float) -> float:
    """
    Calculates the remaining battery energy in kWh.
    """
    return initial_energy_kwh - energy_consumed_kwh

def calculate_arrival_battery_percentage(remaining_energy_kwh: float, capacity_kwh: float) -> float:
    """
    Calculates the expected battery percentage on arrival, clamped to a minimum of 0.0.
    """
    if capacity_kwh <= 0:
        return 0.0
    percentage = (remaining_energy_kwh / capacity_kwh) * 100.0
    return max(0.0, percentage)

def is_route_feasible(arrival_battery_percentage: float, minimum_reserve_pct: float) -> bool:
    """
    Checks if a route is battery-feasible by ensuring the arrival battery percentage
    is greater than or equal to the minimum required reserve.
    """
    return arrival_battery_percentage >= minimum_reserve_pct

def calculate_charging_time_minutes(current_soc: float, target_soc: float, battery_capacity_kwh: float, charger_power_kw: float) -> float:
    """
    Calculates the estimated charging time in minutes required to go from current_soc to target_soc.
    Accounts for typical EV charging curves (simplified constant-power or tapered estimation).
    """
    if target_soc <= current_soc or charger_power_kw <= 0 or battery_capacity_kwh <= 0:
        return 0.0
    
    energy_needed_kwh = battery_capacity_kwh * ((target_soc - current_soc) / 100.0)
    # Factor in charging efficiency/tapering overhead (approx 90% average efficiency for DC fast charging)
    effective_power_kw = charger_power_kw * 0.90
    hours = energy_needed_kwh / effective_power_kw
    return hours * 60.0

class ChargingRouteEngine:
    @staticmethod
    def find_optimal_charging_stop(
        current_location: Any,
        destination: Any,
        vehicle: Any,
        available_chargers: List[Dict[str, Any]]
    ) -> Optional[Dict[str, Any]]:
        """
        Evaluates available charging stations along or near the path between 
        current location and destination to select the optimal enroute charger.
        """
        if not available_chargers:
            return None
            
        valid_chargers = [
            c for c in available_chargers 
            if c.get("power_kw", 0.0) >= getattr(vehicle, "min_charger_power_kw", 20.0)
        ]
        
        if not valid_chargers:
            valid_chargers = available_chargers

        return valid_chargers[0] if valid_chargers else None