from typing import List
from app.models.route_models import EmergencyVehicle, Coordinate

MOCK_EMERGENCY_VEHICLES: List[EmergencyVehicle] = [
    # Fire Vehicles
    EmergencyVehicle(
        vehicle_id="FIRE-001",
        vehicle_type="fire",
        current_location=Coordinate(lat=28.6250, lng=77.2150),  # Close
        battery_percentage=80.0,
        battery_capacity_kwh=60.0,
        consumption_kwh_per_km=0.25,
        minimum_reserve_pct=20.0,
        availability_status="available"
    ),
    EmergencyVehicle(
        # Closest but low battery -> violates reserve limit!
        vehicle_id="FIRE-002",
        vehicle_type="fire",
        current_location=Coordinate(lat=28.6150, lng=77.2100),  # Very Close
        battery_percentage=11.0,
        battery_capacity_kwh=60.0,
        consumption_kwh_per_km=0.25,
        minimum_reserve_pct=20.0,
        availability_status="available"
    ),
    EmergencyVehicle(
        vehicle_id="FIRE-003",
        # Very close but currently busy!
        vehicle_type="fire",
        current_location=Coordinate(lat=28.6160, lng=77.2080),  # Very Close
        battery_percentage=90.0,
        battery_capacity_kwh=60.0,
        consumption_kwh_per_km=0.25,
        minimum_reserve_pct=20.0,
        availability_status="busy"
    ),
    EmergencyVehicle(
        vehicle_id="FIRE-004",
        # Further away but fully available and feasible!
        vehicle_type="fire",
        current_location=Coordinate(lat=28.6350, lng=77.2300),  # Far
        battery_percentage=90.0,
        battery_capacity_kwh=60.0,
        consumption_kwh_per_km=0.25,
        minimum_reserve_pct=20.0,
        availability_status="available"
    ),
    
    # Police Vehicles
    EmergencyVehicle(
        vehicle_id="POLICE-001",
        vehicle_type="police",
        current_location=Coordinate(lat=28.6140, lng=77.2080),
        battery_percentage=85.0,
        battery_capacity_kwh=50.0,
        consumption_kwh_per_km=0.20,
        minimum_reserve_pct=15.0,
        availability_status="available"
    ),
    EmergencyVehicle(
        vehicle_id="POLICE-002",
        vehicle_type="police",
        current_location=Coordinate(lat=28.6300, lng=77.2200),
        battery_percentage=40.0,
        battery_capacity_kwh=50.0,
        consumption_kwh_per_km=0.20,
        minimum_reserve_pct=15.0,
        availability_status="available"
    ),
    
    # Ambulance Vehicles
    EmergencyVehicle(
        vehicle_id="AMB-001",
        vehicle_type="ambulance",
        current_location=Coordinate(lat=28.6120, lng=77.2150),
        battery_percentage=75.0,
        battery_capacity_kwh=55.0,
        consumption_kwh_per_km=0.22,
        minimum_reserve_pct=15.0,
        availability_status="available"
    ),
    EmergencyVehicle(
        vehicle_id="AMB-002",
        vehicle_type="ambulance",
        current_location=Coordinate(lat=28.6200, lng=77.2000),
        battery_percentage=80.0,
        battery_capacity_kwh=55.0,
        consumption_kwh_per_km=0.22,
        minimum_reserve_pct=15.0,
        availability_status="available"
    ),
    EmergencyVehicle(
        vehicle_id="AMB-003",
        # Offline vehicle
        vehicle_type="ambulance",
        current_location=Coordinate(lat=28.6130, lng=77.2080),
        battery_percentage=90.0,
        battery_capacity_kwh=55.0,
        consumption_kwh_per_km=0.22,
        minimum_reserve_pct=15.0,
        availability_status="offline"
    )
]

def get_mock_vehicles() -> List[EmergencyVehicle]:
    """
    Returns a copy of mock emergency vehicles.
    """
    return [ev.model_copy(deep=True) for ev in MOCK_EMERGENCY_VEHICLES]
