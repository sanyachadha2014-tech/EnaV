from fastapi.testclient import TestClient
from app.main import app
from app.services.routing_provider import get_routing_provider, MockRoutingProvider

# Force MockRoutingProvider for all API unit tests
app.dependency_overrides[get_routing_provider] = lambda: MockRoutingProvider()

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "charger_provider" in data

def test_optimize_route_valid_input():
    payload = {
        "source": {"lat": 28.6139, "lng": 77.2090},
        "destination": {"lat": 28.6129, "lng": 77.2295},
        "vehicle": {
            "vehicle_id": "POLICE-101",
            "vehicle_type": "police",
            "battery_percentage": 50.0,
            "battery_capacity_kwh": 60.0,
            "consumption_kwh_per_km": 0.2,
            "minimum_reserve_pct": 15.0,
            "is_emergency": True
        },
        "emergency": True
    }
    
    response = client.post("/route/optimize", json=payload)
    assert response.status_code == 200
    
    data = response.json()
    assert "feasible" in data
    assert "evaluated_routes" in data
    assert len(data["evaluated_routes"]) > 0
    assert "reason" in data

def test_optimize_route_invalid_input():
    # Invalid battery percentage (150%)
    payload = {
        "source": {"lat": 28.6139, "lng": 77.2090},
        "destination": {"lat": 28.6129, "lng": 77.2295},
        "vehicle": {
            "vehicle_id": "POLICE-101",
            "vehicle_type": "police",
            "battery_percentage": 150.0,  # Invalid!
            "battery_capacity_kwh": 60.0,
            "consumption_kwh_per_km": 0.2,
            "minimum_reserve_pct": 15.0
        }
    }
    
    response = client.post("/route/optimize", json=payload)
    assert response.status_code == 422 # Unprocessable Entity
    
    # Missing vehicle_id
    payload = {
        "source": {"lat": 28.6139, "lng": 77.2090},
        "destination": {"lat": 28.6129, "lng": 77.2295},
        "vehicle": {
            "vehicle_type": "citizen",
            "battery_percentage": 50.0,
            "battery_capacity_kwh": 60.0,
            "consumption_kwh_per_km": 0.2
        }
    }
    response = client.post("/route/optimize", json=payload)
    assert response.status_code == 422
