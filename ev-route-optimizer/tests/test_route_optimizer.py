import pytest
from app.models.route_models import VehicleInfo, RouteInfo, Coordinate
from app.services.route_optimizer import optimize_ev_route

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
    routes = [
        RouteInfo(
            route_id="ROUTE-1",
            name="Route 1",
            distance_km=10.0,
            duration_seconds=600.0,
            traffic_level="low",
            geometry=[Coordinate(latitude=0.0, longitude=0.0), Coordinate(latitude=0.1, longitude=0.1)]
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
    test_vehicle.battery_percentage = 25.0
    routes = [
        RouteInfo(
            route_id="ROUTE-TOO-LONG",
            name="Too Long Route",
            distance_km=20.0,
            duration_seconds=1200.0,
            traffic_level="low",
            geometry=[Coordinate(latitude=0.0, longitude=0.0)]
        )
    ]
    
    response = optimize_ev_route(test_vehicle, routes)
    
    assert response.feasible is False
    assert response.recommended_route_id is None
    assert "No feasible routes found" in response.reason
    assert response.evaluated_routes[0].is_feasible is False

def test_faster_infeasible_vs_slower_feasible(test_vehicle):
    test_vehicle.battery_percentage = 25.0
    
    routes = [
        RouteInfo(
            route_id="ROUTE-FAST",
            name="Fast Route",
            distance_km=20.0,
            duration_seconds=600.0,
            traffic_level="low",
            geometry=[Coordinate(latitude=0.0, longitude=0.0)]
        ),
        RouteInfo(
            route_id="ROUTE-SLOW",
            name="Slow Route",
            distance_km=10.0,
            duration_seconds=900.0,
            traffic_level="low",
            geometry=[Coordinate(latitude=0.0, longitude=0.0)]
        )
    ]
    
    response = optimize_ev_route(test_vehicle, routes)
    
    assert response.feasible is True
    assert response.recommended_route_id == "ROUTE-SLOW"
    assert response.arrival_battery_percentage == 21.0
    assert "Fast Route" in response.reason
    assert "infeasible due to battery constraints" in response.reason

def test_multiple_feasible_routes(test_vehicle):
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
    assert response.recommended_route_id == "ROUTE-1"

def test_no_feasible_route(test_vehicle):
    test_vehicle.battery_percentage = 5.0
    
    routes = [
        RouteInfo(
            route_id="ROUTE-1",
            name="Route 1",
            distance_km=5.0,
            duration_seconds=300.0,
            traffic_level="low",
            geometry=[]
        ),
        RouteInfo(
            route_id="ROUTE-2",
            name="Route 2",
            distance_km=10.0,
            duration_seconds=600.0,
            traffic_level="low",
            geometry=[]
        )
    ]
    
    response = optimize_ev_route(test_vehicle, routes)
    
    assert response.feasible is False
    assert response.recommended_route_id is None
    assert "No feasible routes found" in response.reason