import pytest
from app.services.battery_model import (
    calculate_initial_battery_energy,
    calculate_energy_consumed,
    calculate_remaining_energy,
    calculate_arrival_battery_percentage,
    is_route_feasible
)

def test_calculate_initial_battery_energy():
    # 60 kWh capacity at 50% charge should be 30.0 kWh
    assert calculate_initial_battery_energy(60.0, 50.0) == 30.0
    # 100 kWh capacity at 100% charge should be 100.0 kWh
    assert calculate_initial_battery_energy(100.0, 100.0) == 100.0
    # 50 kWh capacity at 0% charge should be 0.0 kWh
    assert calculate_initial_battery_energy(50.0, 0.0) == 0.0

def test_calculate_energy_consumed():
    # Base calculation: 10 km * 0.2 kWh/km = 2.0 kWh (low traffic = 1.0x multiplier)
    assert calculate_energy_consumed(10.0, 0.2, "low") == 2.0
    
    # Moderate traffic: 10 km * 0.2 kWh/km * 1.05 multiplier = 2.1 kWh
    assert pytest.approx(calculate_energy_consumed(10.0, 0.2, "moderate")) == 2.1
    
    # Heavy traffic: 10 km * 0.2 kWh/km * 1.15 multiplier = 2.3 kWh
    assert pytest.approx(calculate_energy_consumed(10.0, 0.2, "heavy")) == 2.3

def test_calculate_remaining_energy():
    # 30 kWh starting - 10 kWh consumed = 20 kWh remaining
    assert calculate_remaining_energy(30.0, 10.0) == 20.0
    # 30 kWh starting - 40 kWh consumed = -10 kWh (negative energy)
    assert calculate_remaining_energy(30.0, 40.0) == -10.0

def test_calculate_arrival_battery_percentage():
    # 30 kWh remaining on 60 kWh capacity = 50.0%
    assert calculate_arrival_battery_percentage(30.0, 60.0) == 50.0
    # 0 kWh remaining = 0.0%
    assert calculate_arrival_battery_percentage(0.0, 50.0) == 0.0
    # Negative remaining energy should be clamped to 0.0%
    assert calculate_arrival_battery_percentage(-5.0, 50.0) == 0.0

def test_is_route_feasible():
    # Arrival is 25%, reserve is 20% -> Feasible
    assert is_route_feasible(25.0, 20.0) is True
    # Arrival is 20%, reserve is 20% -> Feasible (edge case)
    assert is_route_feasible(20.0, 20.0) is True
    # Arrival is 19.9%, reserve is 20% -> Infeasible
    assert is_route_feasible(19.9, 20.0) is False
