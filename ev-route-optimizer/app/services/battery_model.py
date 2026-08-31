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
    By default, it uses the deterministic formula: distance_km * consumption_kwh_per_km.
    It can adjust consumption based on traffic congestion (stop-and-go driving).
    """
    # Simple traffic adjustment multiplier (can be extended or disabled)
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
    percentage = (remaining_energy_kwh / capacity_kwh) * 100.0
    return max(0.0, percentage)

def is_route_feasible(arrival_battery_percentage: float, minimum_reserve_pct: float) -> bool:
    """
    Checks if a route is battery-feasible by ensuring the arrival battery percentage
    is greater than or equal to the minimum required reserve.
    """
    return arrival_battery_percentage >= minimum_reserve_pct
