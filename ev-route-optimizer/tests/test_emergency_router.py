import pytest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient

from app.models.route_models import (
    Coordinate, EmergencyIncident, RouteInfo, EmergencyOptimizeResponse
)
from app.services.emergency_router import optimize_emergency_dispatch
from app.services.routing_provider import BaseRoutingProvider
from app.main import app

class CustomMockRoutingProvider(BaseRoutingProvider):
    """
    Custom routing provider for tests that returns different distances/durations
    depending on the vehicle's starting coordinates to simulate spatial routing.
    """
    def get_candidate_routes(self, source: Coordinate, destination: Coordinate):
        # We can calculate straight line distance as a mock route distance
        lat_diff = abs(source.lat - destination.lat)
        lng_diff = abs(source.lng - destination.lng)
        distance = (lat_diff + lng_diff) * 100.0  # scale up for testing
        
        # speed = 10 m/s (36 km/h) -> duration = distance * 1000 / 10 = distance * 100 seconds
        duration = distance * 100.0
        
        return [
            RouteInfo(
                route_id="ROUTE-MOCK",
                name="Mock Emergency Route",
                distance_km=round(distance, 2),
                duration_seconds=round(duration, 2),
                traffic_level="low",
                geometry=[source, destination]
            )
        ]

@pytest.fixture
def mock_provider():
    return CustomMockRoutingProvider()

def test_correct_vehicle_type_and_availability(mock_provider):
    # Incident requires fire vehicle
    incident = EmergencyIncident(
        incident_id="INC-001",
        incident_type="fire",
        severity="critical",
        location=Coordinate(lat=28.6139, lng=77.2090),
        required_vehicle_type="fire"
    )
    
    response = optimize_emergency_dispatch(incident, mock_provider)
    
    # Selected vehicle must be FIRE
    assert response.selected_vehicle is not None
    assert response.selected_vehicle.vehicle_type == "fire"
    assert response.selected_vehicle.vehicle_id == "FIRE-001"  # FIRE-001 has battery, available, closest feasible
    
    # Assert dynamic coordinate fields
    assert response.route is not None
    assert response.route.geometry is not None
    assert len(response.route.geometry) == 2
    assert response.route.source.lat == 28.6250
    assert response.route.source.lng == 77.2150
    assert response.route.destination.lat == 28.6139
    assert response.route.destination.lng == 77.2090
    
    # Verify that wrong type POLICE-001 and busy FIRE-003 are logged in evaluated_vehicles
    police_eval = next(x for x in response.evaluated_vehicles if x.vehicle_id == "POLICE-001")
    assert police_eval.is_type_match is False
    assert "Excluded because the incident requires a" in police_eval.reason
    
    busy_eval = next(x for x in response.evaluated_vehicles if x.vehicle_id == "FIRE-003")
    assert busy_eval.is_available is False
    assert busy_eval.status == "busy"
    assert "Excluded because it is currently 'busy'" in busy_eval.reason

def test_offline_vehicle_excluded(mock_provider):
    # Requires ambulance
    incident = EmergencyIncident(
        incident_id="INC-002",
        incident_type="medical",
        severity="medium",
        location=Coordinate(lat=28.6139, lng=77.2090),
        required_vehicle_type="ambulance"
    )
    
    response = optimize_emergency_dispatch(incident, mock_provider)
    
    assert response.selected_vehicle is not None
    assert response.selected_vehicle.vehicle_type == "ambulance"
    # AMB-003 is offline, so it must be excluded
    offline_eval = next(x for x in response.evaluated_vehicles if x.vehicle_id == "AMB-003")
    assert offline_eval.is_available is False
    assert offline_eval.status == "offline"
    assert "Excluded because it is currently 'offline'" in offline_eval.reason

def test_fastest_feasible_selected_and_infeasible_rejected(mock_provider):
    # FIRE-002 is very close (lat=28.6150, lng=77.2100) -> distance to CP (28.6139, 77.2090) is ~0.2 km.
    # FIRE-001 is further (lat=28.6250, lng=77.2150) -> distance is ~1.5 km.
    # But FIRE-002 has only 11% battery and reserve is 20%. It is infeasible.
    # FIRE-001 has 80% battery and reserve is 20%. It is feasible.
    incident = EmergencyIncident(
        incident_id="INC-003",
        incident_type="fire",
        severity="high",
        location=Coordinate(lat=28.6139, lng=77.2090),
        required_vehicle_type="fire"
    )
    
    response = optimize_emergency_dispatch(incident, mock_provider)
    
    assert response.selected_vehicle is not None
    # FIRE-001 is chosen over the closer FIRE-002
    assert response.selected_vehicle.vehicle_id == "FIRE-001"
    
    # Verify FIRE-002 is marked infeasible
    infeasible_eval = next(x for x in response.evaluated_vehicles if x.vehicle_id == "FIRE-002")
    assert infeasible_eval.is_feasible is False
    assert "Rejected because its estimated arrival battery" in infeasible_eval.reason
    assert "emergency reserve" in infeasible_eval.reason

def test_no_feasible_vehicle_case(mock_provider):
    # Incident location is extremely far away (e.g. lat=35.0, lng=85.0)
    # No vehicle has enough battery to reach this location without violating their reserve.
    incident = EmergencyIncident(
        incident_id="INC-004",
        incident_type="fire",
        severity="critical",
        location=Coordinate(lat=35.0, lng=85.0),
        required_vehicle_type="fire"
    )
    
    response = optimize_emergency_dispatch(incident, mock_provider)
    
    assert response.selected_vehicle is None
    assert response.route is None
    assert "No feasible available" in response.reason
    
    # Confirm they are all marked infeasible
    for v_eval in response.evaluated_vehicles:
        if v_eval.vehicle_type == "fire" and v_eval.status == "available":
            assert v_eval.is_feasible is False
            assert "Rejected because its estimated arrival battery" in v_eval.reason

def test_emergency_api_endpoint():
    client = TestClient(app)
    
    payload = {
        "incident": {
            "incident_id": "INC-101",
            "incident_type": "accident",
            "severity": "critical",
            "location": {"lat": 28.6139, "lng": 77.2090},
            "required_vehicle_type": "police"
        }
    }
    
    response = client.post("/emergency/optimize", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert data["incident_id"] == "INC-101"
    assert data["selected_vehicle"] is not None
    assert data["selected_vehicle"]["vehicle_type"] == "police"
    assert data["selected_vehicle"]["vehicle_id"] in ["POLICE-001", "POLICE-002"]
    assert data["route"] is not None
    assert "distance_km" in data["route"]
    assert "eta_minutes" in data["route"]
    assert "arrival_battery_percentage" in data["route"]
    assert "geometry" in data["route"]
    assert data["route"]["geometry"] is not None
    assert len(data["route"]["geometry"]) > 0
    assert "source" in data["route"]
    assert data["route"]["source"]["lat"] is not None
    assert "destination" in data["route"]
    assert data["route"]["destination"]["lat"] is not None
    assert "reason" in data
    assert len(data["evaluated_vehicles"]) > 0
