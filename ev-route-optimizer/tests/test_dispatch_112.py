import pytest
from fastapi.testclient import TestClient

from typing import List
from app.models.route_models import Coordinate, RouteInfo
from app.services.routing_provider import BaseRoutingProvider, get_routing_provider
from app.main import app

client = TestClient(app)

class CustomDispatchMockRoutingProvider(BaseRoutingProvider):
    def get_candidate_routes(self, source: Coordinate, destination: Coordinate) -> List[RouteInfo]:
        if destination.lat > 30.0:
            return [
                RouteInfo(
                    route_id="ROUTE-FAR",
                    name="Far Mock Route",
                    distance_km=1500.0,
                    duration_seconds=36000.0,
                    traffic_level="low",
                    geometry=[source, destination]
                )
            ]
        from app.data.mock_routes import get_mock_routes
        return get_mock_routes()

@pytest.fixture(autouse=True)
def setup_overrides():
    app.dependency_overrides[get_routing_provider] = lambda: CustomDispatchMockRoutingProvider()
    yield
    app.dependency_overrides.clear()

# 1. Test successful fire dispatch
def test_successful_fire_dispatch():
    payload = {
        "incident_id": "112-DEL-FIRE-001",
        "incident_type": "fire",
        "severity": "critical",
        "location": {
            "lat": 28.6139,
            "lng": 77.2090
        },
        "required_vehicle_type": "fire",
        "reported_at": "2026-08-26T16:00:00"
    }
    response = client.post("/dispatch/112", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["incident_id"] == "112-DEL-FIRE-001"
    assert data["dispatch_status"] == "recommended"
    assert data["district"] is not None
    assert data["district"]["district_name"] == "New Delhi"
    assert data["selected_vehicle"] is not None
    assert data["selected_vehicle"]["vehicle_type"] == "fire"
    assert data["selected_vehicle"]["vehicle_id"] == "FIRE-001"
    assert data["route"] is not None
    assert "distance_km" in data["route"]
    assert "eta_minutes" in data["route"]

# 2. Test successful police dispatch
def test_successful_police_dispatch():
    payload = {
        "incident_id": "112-DEL-POLICE-001",
        "incident_type": "crime",
        "severity": "high",
        "location": {
            "lat": 28.6139,
            "lng": 77.2090
        },
        "required_vehicle_type": "police",
        "reported_at": "2026-08-26T16:05:00"
    }
    response = client.post("/dispatch/112", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["dispatch_status"] == "recommended"
    assert data["selected_vehicle"]["vehicle_type"] == "police"
    assert data["selected_vehicle"]["vehicle_id"] in ["POLICE-001", "POLICE-002"]

# 3. Test successful ambulance dispatch
def test_successful_ambulance_dispatch():
    payload = {
        "incident_id": "112-DEL-AMB-001",
        "incident_type": "medical",
        "severity": "medium",
        "location": {
            "lat": 28.6139,
            "lng": 77.2090
        },
        "required_vehicle_type": "ambulance",
        "reported_at": "2026-08-26T16:10:00"
    }
    response = client.post("/dispatch/112", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["dispatch_status"] == "recommended"
    assert data["selected_vehicle"]["vehicle_type"] == "ambulance"
    assert data["selected_vehicle"]["vehicle_id"] in ["AMB-001", "AMB-002"]

# 4. Test invalid coordinates are validated and rejected
def test_invalid_coordinates():
    payload = {
        "incident_id": "112-BAD-COORD",
        "incident_type": "fire",
        "severity": "critical",
        "location": {
            "lat": 150.0,  # Invalid latitude!
            "lng": 77.2090
        },
        "required_vehicle_type": "fire"
    }
    response = client.post("/dispatch/112", json=payload)
    assert response.status_code == 422  # Unprocessable Entity

# 5. Test unsupported vehicle type is rejected
def test_unsupported_vehicle_type():
    payload = {
        "incident_id": "112-BAD-VEHICLE",
        "incident_type": "fire",
        "severity": "critical",
        "location": {
            "lat": 28.6139,
            "lng": 77.2090
        },
        "required_vehicle_type": "helicopter",  # Unsupported!
        "reported_at": "2026-08-26T16:00:00"
    }
    response = client.post("/dispatch/112", json=payload)
    assert response.status_code == 422

# 6. Test invalid severity is rejected
def test_invalid_severity():
    payload = {
        "incident_id": "112-BAD-SEVERITY",
        "incident_type": "fire",
        "severity": "extreme",  # Invalid severity!
        "location": {
            "lat": 28.6139,
            "lng": 77.2090
        },
        "required_vehicle_type": "fire"
    }
    response = client.post("/dispatch/112", json=payload)
    assert response.status_code == 422

# 7. Test no feasible vehicle case (too far)
def test_no_feasible_vehicle_dispatch():
    payload = {
        "incident_id": "112-FAR-FIRE-001",
        "incident_type": "fire",
        "severity": "critical",
        "location": {
            "lat": 35.0000,  # Too far!
            "lng": 85.0000
        },
        "required_vehicle_type": "fire",
        "reported_at": "2026-08-26T16:00:00"
    }
    response = client.post("/dispatch/112", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["dispatch_status"] == "no_feasible_vehicle"
    assert data["selected_vehicle"] is None
    assert data["route"] is None

# 8. Test GIS district metadata is included
def test_gis_district_metadata_included():
    # Noida: 28.5700, 77.3200 (Gautam Buddha Nagar, UP)
    payload = {
        "incident_id": "112-NOIDA-FIRE-001",
        "incident_type": "fire",
        "severity": "critical",
        "location": {
            "lat": 28.5700,
            "lng": 77.3200
        },
        "required_vehicle_type": "fire",
        "reported_at": "2026-08-26T16:00:00"
    }
    response = client.post("/dispatch/112", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["district"] is not None
    assert data["district"]["district_name"] == "Gautam Buddha Nagar"
    assert data["district"]["state_name"] == "Uttar Pradesh"

# 9. Test that the existing emergency optimizer still works
def test_existing_emergency_optimizer_still_works():
    payload = {
        "incident": {
            "incident_id": "INC-OLD-101",
            "incident_type": "fire",
            "severity": "critical",
            "location": {"lat": 28.6139, "lng": 77.2090},
            "required_vehicle_type": "fire"
        }
    }
    response = client.post("/emergency/optimize", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["incident_id"] == "INC-OLD-101"
    assert data["selected_vehicle"] is not None
    assert data["selected_vehicle"]["vehicle_id"] == "FIRE-001"
    assert data["district"] is not None
    assert data["district"]["district_name"] == "New Delhi"
