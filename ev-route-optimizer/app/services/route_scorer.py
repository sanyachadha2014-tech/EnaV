import os
from typing import Dict, Optional

# Default weights if not specified in environment
DEFAULT_WEIGHTS = {
    "time_weight": 1.0,          # Weight for travel time (per minute)
    "traffic_weight": 10.0,      # Weight for traffic penalty level
    "battery_risk_weight": 2.0   # Weight for battery risk (lower arrival charge = higher risk)
}

def get_scoring_weights() -> Dict[str, float]:
    """
    Loads weights from environment variables or falls back to defaults.
    """
    return {
        "time_weight": float(os.getenv("TIME_WEIGHT", DEFAULT_WEIGHTS["time_weight"])),
        "traffic_weight": float(os.getenv("TRAFFIC_WEIGHT", DEFAULT_WEIGHTS["traffic_weight"])),
        "battery_risk_weight": float(os.getenv("BATTERY_RISK_WEIGHT", DEFAULT_WEIGHTS["battery_risk_weight"]))
    }

def calculate_traffic_penalty(traffic_level: str) -> float:
    """
    Translates a traffic level into a numeric penalty.
    """
    traffic_level = traffic_level.lower()
    if traffic_level == "heavy":
        return 50.0
    elif traffic_level == "moderate":
        return 20.0
    else:  # low or other
        return 0.0

def calculate_battery_risk_penalty(arrival_battery_pct: float, minimum_reserve_pct: float) -> float:
    """
    Calculates a risk penalty based on how close the arrival battery percentage is to the minimum reserve.
    Arriving with lower battery yields a higher penalty.
    """
    margin = arrival_battery_pct - minimum_reserve_pct
    # If it violates the reserve, we should return a massive penalty
    if margin < 0:
        return 10000.0
    
    # Otherwise, penalty is higher if the margin is small.
    # Risk increases as we get closer to the reserve.
    # E.g., arriving exactly at reserve (margin=0) gives penalty of 100.
    # Arriving with margin of 80 gives penalty of 20.
    return max(0.0, 100.0 - margin)

def score_route(
    duration_seconds: float,
    traffic_level: str,
    arrival_battery_pct: float,
    minimum_reserve_pct: float,
    custom_weights: Optional[Dict[str, float]] = None
) -> float:
    """
    Computes a deterministic cost score for a route. Lower score is better.
    """
    weights = custom_weights or get_scoring_weights()
    
    duration_minutes = duration_seconds / 60.0
    time_cost = duration_minutes * weights.get("time_weight", 1.0)
    
    traffic_penalty = calculate_traffic_penalty(traffic_level)
    traffic_cost = traffic_penalty * weights.get("traffic_weight", 1.0)
    
    battery_risk = calculate_battery_risk_penalty(arrival_battery_pct, minimum_reserve_pct)
    battery_cost = battery_risk * weights.get("battery_risk_weight", 1.0)
    
    total_score = time_cost + traffic_cost + battery_cost
    return round(total_score, 2)
