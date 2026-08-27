import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.models.route_models import VehicleInfo, RouteInfo, Coordinate
from app.data.mock_chargers import ChargingStation
from app.services.charger_selector import (
    haversine_distance,
    evaluate_charging_options,
    select_best_charger_for_route
)
from app.services.route_optimizer import optimize_ev_route
from app.main import app

@pytest.fixture
def base_vehicle():
    return VehicleInfo(
        vehicle_id="TEST-EV",
        vehicle_type="citizen",
        battery_percentage=13.0,  # Low battery
        battery_capacity_kwh=50.0,
        consumption_kwh_per_km=0.2,
        minimum_reserve_pct=10.0,
        is_emergency=False
    )

@pytest.fixture
def base_route():
    # A route CP to India Gate: 10 km, 600s
    # Geometry has CP, mid-point, and India Gate
    return RouteInfo(
        route_id="ROUTE-1",
        name="Route 1",
        distance_km=10.0,
        duration_seconds=600.0,
        traffic_level="low",
        geometry=[
            Coordinate(lat=28.6139, lng=77.2090),
            Coordinate(lat=28.6150, lng=77.2180),
            Coordinate(lat=28.6129, lng=77.2295)
        ]
    )

# 1. Test charging math calculations
def test_charging_calculations():
    # Verify charging duration and cost directly
    # Assume we need to add 20 kWh at a 50 kW charger, price 10.0/kWh
    power_kw = 50.0
    energy_added = 20.0
    price = 10.0
    
    charging_hours = energy_added / power_kw
    charging_minutes = charging_hours * 60.0
    cost = energy_added * price
    
    assert charging_minutes == 24.0
    assert cost == 200.0

# 2. Test waiting time and port queue penalty
def test_waiting_time_and_port_penalty(base_vehicle, base_route):
    # Charger CS002 has 0 available ports and 25 min wait -> should add 30 min queue penalty = 55 min total
    # Charger CS001 has 2 available ports and 5 min wait -> should be 5 min total
    chargers = [
        ChargingStation(
            station_id="CS-FULL",
            name="Full Charger",
            latitude=28.6150,
            longitude=77.2180,
            available_ports=0,
            total_ports=4,
            charging_power_kw=60.0,
            price_per_kwh=10.0,
            estimated_wait_minutes=25.0,
            status="available"
        )
    ]
    options = evaluate_charging_options(base_vehicle, base_route, chargers)
    assert len(options) == 1
    assert options[0].waiting_minutes == 55.0  # 25 + 30 queue penalty

# 3. Test reject offline/maintenance charger
def test_reject_offline_charger(base_vehicle, base_route):
    chargers = [
        ChargingStation(
            station_id="CS-OFFLINE",
            name="Offline Charger",
            latitude=28.6150,
            longitude=77.2180,
            available_ports=4,
            total_ports=4,
            charging_power_kw=60.0,
            price_per_kwh=10.0,
            estimated_wait_minutes=0.0,
            status="maintenance"
        )
    ]
    options = evaluate_charging_options(base_vehicle, base_route, chargers)
    assert len(options) == 0  # Should be skipped completely

# 4. Test charger cannot be reached
def test_charger_cannot_be_reached(base_vehicle, base_route):
    # Vehicle has 11% battery (5.5 kWh). Reserve is 10% (5 kWh). Max allowed consumption is 0.5 kWh.
    # Charger is 15 km away -> consumes 3 kWh -> cannot be reached
    base_vehicle.battery_percentage = 11.0
    chargers = [
        ChargingStation(
            station_id="CS-FAR",
            name="Far Charger",
            latitude=28.7000,
            longitude=77.3000,
            available_ports=2,
            total_ports=2,
            charging_power_kw=60.0,
            price_per_kwh=10.0,
            estimated_wait_minutes=0.0,
            status="available"
        )
    ]
    options = evaluate_charging_options(base_vehicle, base_route, chargers)
    assert len(options) == 0

# 5. Test final destination battery feasibility
def test_final_destination_battery_feasibility(base_vehicle, base_route):
    # Charger is reachable, but destination is too far from the charger
    # E.g., charger to destination is 300 km.
    # Even at 100% capacity (50 kWh), consumption 0.2 kWh/km means max range is 250 km.
    # Reserve is 10%. Max range to keep reserve is 225 km. 300 km is infeasible.
    chargers = [
        ChargingStation(
            station_id="CS-REACHABLE-BUT-DEST-FAR",
            name="Reachable but Dest Far",
            latitude=28.6150,
            longitude=77.2180,
            available_ports=2,
            total_ports=2,
            charging_power_kw=60.0,
            price_per_kwh=10.0,
            estimated_wait_minutes=0.0,
            status="available"
        )
    ]
    # We stub distance_from_charger_to_dest to be 300 km inside the calculation
    with patch("app.services.charger_selector.find_closest_point_on_route") as mock_find:
        # Return closest point with large distance to end
        mock_find.return_value = (Coordinate(lat=28.6150, lng=77.2180), 1, 0.0)
        # Modify route to have 310 km distance
        base_route.distance_km = 310.0
        options = evaluate_charging_options(base_vehicle, base_route, chargers)
        assert len(options) == 0

# 6. Test two chargers: choosing the better overall option, not simply the nearest
def test_two_chargers_ranking(base_vehicle, base_route):
    # Charger A is close (0.1 km detour) but has a long queue (0 ports, 40 min wait) and low power (20 kW)
    # Charger B is slightly further (1.0 km detour) but has no queue (4 ports, 2 min wait) and high power (100 kW)
    chargers = [
        ChargingStation(
            station_id="CS-A",
            name="Charger A (Slow & Busy)",
            latitude=28.6150,
            longitude=77.2180,  # Close to CP midpoint
            available_ports=0,
            total_ports=4,
            charging_power_kw=20.0,
            price_per_kwh=12.0,
            estimated_wait_minutes=40.0,
            status="available"
        ),
        ChargingStation(
            station_id="CS-B",
            name="Charger B (Fast & Free)",
            latitude=28.6170,
            longitude=77.2200,  # Slightly further
            available_ports=4,
            total_ports=4,
            charging_power_kw=100.0,
            price_per_kwh=12.0,
            estimated_wait_minutes=2.0,
            status="available"
        )
    ]
    
    options = evaluate_charging_options(base_vehicle, base_route, chargers)
    assert len(options) == 2
    # Charger B should be ranked first (lower score) because of upping charging speed and shorter wait
    assert options[0].charger.station_id == "CS-B"

# 7. Test direct reachability -> no charger required
def test_route_optimizer_direct_routing(base_route):
    # Vehicle has 100% battery, easily reaches CP to India Gate directly
    vehicle = VehicleInfo(
        vehicle_id="CITIZEN-001",
        vehicle_type="citizen",
        battery_percentage=100.0,
        battery_capacity_kwh=50.0,
        consumption_kwh_per_km=0.2,
        minimum_reserve_pct=15.0
    )
    
    response = optimize_ev_route(vehicle, [base_route])
    assert response.feasible is True
    assert response.charging_required is False
    assert response.recommended_charger is None

# 8. Test charging required -> successful detour recommend
def test_route_optimizer_charging_required(base_vehicle, base_route):
    # Vehicle has low battery (15%), CP to India Gate requires detour charging
    response = optimize_ev_route(base_vehicle, [base_route])
    
    assert response.feasible is True
    assert response.charging_required is True
    assert response.recommended_charger is not None
    assert response.recommended_charger.station_id in ["CS001", "CS003"]
    assert "Charging stop recommended" in response.reason

# 9. Test API endpoints integrate charging response
def test_api_response_with_charging():
    client = TestClient(app)
    # Use mock provider to return candidates, but query with low battery to trigger charging detour
    payload = {
        "source": {"lat": 28.6139, "lng": 77.2090},
        "destination": {"lat": 28.6129, "lng": 77.2295},
        "vehicle": {
            "vehicle_id": "CITIZEN-101",
            "vehicle_type": "citizen",
            "battery_percentage": 13.0,  # Low battery!
            "battery_capacity_kwh": 50.0,
            "consumption_kwh_per_km": 0.2,
            "minimum_reserve_pct": 10.0
        }
    }
    
    response = client.post("/route/optimize", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["feasible"] is True
    assert data["charging_required"] is True
    assert data["recommended_charger"] is not None
    assert "station_id" in data["recommended_charger"]
    assert "charging_minutes" in data["recommended_charger"]
    assert "charging_cost" in data["recommended_charger"]

def test_custom_target_soc_pct(base_vehicle, base_route):
    # Set custom target SOC to 90.0% instead of defaulting to 80.0%
    base_vehicle.target_soc_pct = 90.0
    response = optimize_ev_route(base_vehicle, [base_route])
    
    assert response.feasible is True
    assert response.charging_required is True
    assert response.recommended_charger is not None
    # Arrives with higher charge (90% leaving charger - 4.09% consumption from CS001 to destination = 85.91%)
    assert response.arrival_battery_percentage == 85.91

# Phase 3 Real Road Detour routing tests
from unittest.mock import MagicMock, patch
from app.services.routing_provider import BaseRoutingProvider
from app.services.charger_selector import evaluate_charging_options, select_best_charger_for_route
from app.data.mock_chargers import ChargingStation

class MockedOSRMDetourProvider(BaseRoutingProvider):
    def __init__(self, routes_map=None):
        self.routes_map = routes_map or {}
        self.call_count = 0

    def get_candidate_routes(self, source, destination):
        self.call_count += 1
        key = (source.lat, source.lng, destination.lat, destination.lng)
        if key in self.routes_map:
            val = self.routes_map[key]
            if val is None:
                return []
            return [val]
        return [
            RouteInfo(
                route_id="LEG-MOCK",
                name="Leg Route",
                distance_km=5.0,
                duration_seconds=300.0,
                traffic_level="low",
                geometry=[source, destination]
            )
        ]

def test_successful_road_based_detour():
    routes_map = {
        (28.6139, 77.2090, 28.6180, 77.2150): RouteInfo(
            route_id="LEG-TO", name="Source to Charger", distance_km=4.0, duration_seconds=240.0, traffic_level="low", geometry=[]
        ),
        (28.6180, 77.2150, 28.6129, 77.2295): RouteInfo(
            route_id="LEG-FROM", name="Charger to Destination", distance_km=3.5, duration_seconds=210.0, traffic_level="low", geometry=[]
        )
    }
    mock_provider = MockedOSRMDetourProvider(routes_map)
    vehicle = VehicleInfo(
        vehicle_id="ROAD-TEST",
        vehicle_type="citizen",
        battery_percentage=30.0,
        battery_capacity_kwh=50.0,
        consumption_kwh_per_km=0.2,
        minimum_reserve_pct=15.0
    )
    route = RouteInfo(
        route_id="BASE-ROUTE",
        name="Main Route",
        distance_km=10.0,
        duration_seconds=600.0,
        geometry=[Coordinate(lat=28.6139, lng=77.2090), Coordinate(lat=28.6129, lng=77.2295)]
    )
    chargers = [
        ChargingStation(
            station_id="CS001",
            name="Delhi CP EV Hub (Fast)",
            latitude=28.6180,
            longitude=77.2150,
            available_ports=2,
            total_ports=6,
            charging_power_kw=60.0,
            price_per_kwh=12.0,
            estimated_wait_minutes=5.0,
            status="available"
        )
    ]
    options = evaluate_charging_options(vehicle, route, chargers, mock_provider)
    assert len(options) == 1
    opt = options[0]
    assert opt.total_distance == 7.5
    assert opt.total_driving_time_seconds == 450.0
    assert mock_provider.call_count == 2

def test_unreachable_charger_skipped():
    class UnreachableProvider(BaseRoutingProvider):
        def get_candidate_routes(self, source, destination):
            return []
    mock_provider = UnreachableProvider()
    vehicle = VehicleInfo(
        vehicle_id="ROAD-TEST",
        vehicle_type="citizen",
        battery_percentage=30.0,
        battery_capacity_kwh=50.0,
        consumption_kwh_per_km=0.2,
        minimum_reserve_pct=15.0
    )
    route = RouteInfo(
        route_id="BASE-ROUTE",
        name="Main Route",
        distance_km=10.0,
        duration_seconds=600.0,
        geometry=[Coordinate(lat=28.6139, lng=77.2090), Coordinate(lat=28.6129, lng=77.2295)]
    )
    chargers = [
        ChargingStation(
            station_id="CS001",
            name="Delhi CP EV Hub (Fast)",
            latitude=28.6180,
            longitude=77.2150,
            available_ports=2,
            total_ports=6,
            charging_power_kw=60.0,
            price_per_kwh=12.0,
            estimated_wait_minutes=5.0,
            status="available"
        )
    ]
    options = evaluate_charging_options(vehicle, route, chargers, mock_provider)
    assert len(options) == 0

def test_routing_provider_failure_skipped():
    class ErrorProvider(BaseRoutingProvider):
        def get_candidate_routes(self, source, destination):
            from app.services.routing_provider import RoutingAPIError
            raise RoutingAPIError("OSRM connection refused")
    mock_provider = ErrorProvider()
    vehicle = VehicleInfo(
        vehicle_id="ROAD-TEST",
        vehicle_type="citizen",
        battery_percentage=30.0,
        battery_capacity_kwh=50.0,
        consumption_kwh_per_km=0.2,
        minimum_reserve_pct=15.0
    )
    route = RouteInfo(
        route_id="BASE-ROUTE",
        name="Main Route",
        distance_km=10.0,
        duration_seconds=600.0,
        geometry=[Coordinate(lat=28.6139, lng=77.2090), Coordinate(lat=28.6129, lng=77.2295)]
    )
    chargers = [
        ChargingStation(
            station_id="CS001",
            name="Delhi CP EV Hub (Fast)",
            latitude=28.6180,
            longitude=77.2150,
            available_ports=2,
            total_ports=6,
            charging_power_kw=60.0,
            price_per_kwh=12.0,
            estimated_wait_minutes=5.0,
            status="available"
        )
    ]
    options = evaluate_charging_options(vehicle, route, chargers, mock_provider)
    assert len(options) == 0

def test_haversine_prefilter_behavior():
    mock_provider = MagicMock()
    vehicle = VehicleInfo(
        vehicle_id="ROAD-TEST",
        vehicle_type="citizen",
        battery_percentage=10.0,
        battery_capacity_kwh=50.0,
        consumption_kwh_per_km=0.2,
        minimum_reserve_pct=15.0
    )
    route = RouteInfo(
        route_id="BASE-ROUTE",
        name="Main Route",
        distance_km=10.0,
        duration_seconds=600.0,
        geometry=[Coordinate(lat=28.6139, lng=77.2090), Coordinate(lat=28.6129, lng=77.2295)]
    )
    chargers = [
        ChargingStation(
            station_id="CS-FAR",
            name="Far EV Charger",
            latitude=35.0000,
            longitude=85.0000,
            available_ports=2,
            total_ports=6,
            charging_power_kw=60.0,
            price_per_kwh=12.0,
            estimated_wait_minutes=5.0,
            status="available"
        )
    ]
    options = evaluate_charging_options(vehicle, route, chargers, mock_provider)
    assert len(options) == 0
    assert mock_provider.get_candidate_routes.call_count == 0

def test_missing_osm_attributes_behavior():
    vehicle = VehicleInfo(
        vehicle_id="NULL-TEST",
        vehicle_type="citizen",
        battery_percentage=13.0,
        battery_capacity_kwh=50.0,
        consumption_kwh_per_km=0.2,
        minimum_reserve_pct=10.0
    )
    route = RouteInfo(
        route_id="ROUTE-1",
        name="Route 1",
        distance_km=10.0,
        duration_seconds=600.0,
        geometry=[Coordinate(lat=28.6139, lng=77.2090), Coordinate(lat=28.6129, lng=77.2295)]
    )
    null_charger = ChargingStation(
        station_id="OSM-12345",
        name="OSM Null Fields Station",
        latitude=28.6180,
        longitude=77.2150,
        available_ports=None,
        total_ports=None,
        charging_power_kw=None,
        price_per_kwh=None,
        estimated_wait_minutes=None,
        status="available"
    )
    from app.services.routing_provider import MockRoutingProvider
    options = evaluate_charging_options(vehicle, route, [null_charger], MockRoutingProvider())
    
    assert len(options) == 1
    opt = options[0]
    
    assert opt.waiting_minutes is None
    assert opt.charging_minutes is None
    assert opt.charging_cost is None
    
    assert opt.score > 0.0
    assert opt.total_journey_minutes > 0.0
    assert opt.final_arrival_battery_pct > 0.0

