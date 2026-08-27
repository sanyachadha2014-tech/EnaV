import pytest
from app.models.route_models import VehicleInfo, RouteInfo, Coordinate
from app.services.route_optimizer import optimize_ev_route

# Reusable test vehicle
@pytest.fixture
def test_vehicle():
    return VehicleInfo(
        vehicle_id="TEST-EV",
        vehicle_type="citizen",
        battery_percentage=50.0,
        battery_capacity_kwh=50.0,
        consumption_kwh_per_km=0.2,
        minimum_reserve_pct=20.0,
        is_emergency=False
    )

def test_feasible_route(test_vehicle):
    # Setup candidate route: 10 km, 600s, low traffic.
    # Energy consumed = 10 * 0.2 = 2.0 kWh.
    # Arrival battery = ((25.0 - 2.0) / 50.0) * 100 = 46.0% (feasible, >= 20%)
    routes = [
        RouteInfo(
            route_id="ROUTE-1",
            name="Route 1",
            distance_km=10.0,
            duration_seconds=600.0,
            traffic_level="low",
            geometry=[Coordinate(lat=0.0, lng=0.0), Coordinate(lat=0.1, lng=0.1)]
        )
    ]
    
    response = optimize_ev_route(test_vehicle, routes)
    
    assert response.feasible is True
    assert response.recommended_route_id == "ROUTE-1"
    assert response.arrival_battery_percentage == 46.0
    assert response.distance_km == 10.0
    assert response.eta_minutes == 10.0
    assert "Route 1" in response.reason

def test_infeasible_route(test_vehicle):
    # Setup candidate route: 45 km.
    # Energy consumed = 45 * 0.2 = 9.0 kWh.
    # Arrival battery = ((25.0 - 9.0) / 50.0) * 100 = 32.0% (feasible)
    # Let's adjust vehicle battery percentage to 25% (initial energy = 12.5 kWh)
    # Required reserve = 20% (10 kWh). Max allowed consumption = 2.5 kWh.
    # Route: 20 km -> consumed = 4.0 kWh -> arrival = 17% (violates reserve)
    test_vehicle.battery_percentage = 25.0
    routes = [
        RouteInfo(
            route_id="ROUTE-TOO-LONG",
            name="Too Long Route",
            distance_km=20.0,
            duration_seconds=1200.0,
            traffic_level="low",
            geometry=[Coordinate(lat=0.0, lng=0.0)]
        )
    ]
    
    response = optimize_ev_route(test_vehicle, routes)
    
    assert response.feasible is False
    assert response.recommended_route_id is None
    assert "No feasible routes found" in response.reason
    assert response.evaluated_routes[0].is_feasible is False

def test_faster_infeasible_vs_slower_feasible(test_vehicle):
    # Vehicle has 25% battery (12.5 kWh). Reserve = 20% (10 kWh). Max consumption = 2.5 kWh.
    test_vehicle.battery_percentage = 25.0
    
    # Route 1: 20 km, 600s (Fast but violates reserve) -> Consumes 4 kWh -> Infeasible
    # Route 2: 10 km, 900s (Slower but feasible) -> Consumes 2 kWh -> Feasible
    routes = [
        RouteInfo(
            route_id="ROUTE-FAST",
            name="Fast Route",
            distance_km=20.0,
            duration_seconds=600.0,
            traffic_level="low",
            geometry=[Coordinate(lat=0.0, lng=0.0)]
        ),
        RouteInfo(
            route_id="ROUTE-SLOW",
            name="Slow Route",
            distance_km=10.0,
            duration_seconds=900.0,
            traffic_level="low",
            geometry=[Coordinate(lat=0.0, lng=0.0)]
        )
    ]
    
    response = optimize_ev_route(test_vehicle, routes)
    
    assert response.feasible is True
    assert response.recommended_route_id == "ROUTE-SLOW"
    assert response.arrival_battery_percentage == 21.0 # 12.5 - 2 = 10.5 kWh -> 21%
    assert "Fast Route" in response.reason
    assert "infeasible due to battery constraints" in response.reason

def test_multiple_feasible_routes(test_vehicle):
    # Route 1: 10 km, 600s, low traffic
    # Route 2: 12 km, 720s, low traffic
    routes = [
        RouteInfo(
            route_id="ROUTE-1",
            name="Route 1",
            distance_km=10.0,
            duration_seconds=600.0,
            traffic_level="low",
            geometry=[]
        ),
        RouteInfo(
            route_id="ROUTE-2",
            name="Route 2",
            distance_km=12.0,
            duration_seconds=720.0,
            traffic_level="low",
            geometry=[]
        )
    ]
    
    response = optimize_ev_route(test_vehicle, routes)
    
    assert response.feasible is True
    # Route 1 is faster and consumes less energy -> better score -> selected
    assert response.recommended_route_id == "ROUTE-1"

def test_no_feasible_route(test_vehicle):
    # Initial battery = 5% (2.5 kWh). Reserve = 20% (10 kWh).
    test_vehicle.battery_percentage = 5.0
    
    routes = [
        RouteInfo(
            route_id="ROUTE-1",
            name="Route 1",
            distance_km=5.0, # Consumes 1.0 kWh
            duration_seconds=300.0,
            traffic_level="low",
            geometry=[]
        ),
        RouteInfo(
            route_id="ROUTE-2",
            name="Route 2",
            distance_km=10.0, # Consumes 2.0 kWh
            duration_seconds=600.0,
            traffic_level="low",
            geometry=[]
        )
    ]
    
    response = optimize_ev_route(test_vehicle, routes)
    
    assert response.feasible is False
    assert response.recommended_route_id is None
    assert "No feasible routes found" in response.reason
