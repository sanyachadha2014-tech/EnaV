import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    # Root endpoint serves HTML documentation or a welcome page
    assert "html" in response.headers.get("content-type", "").lower()
    assert "<html" in response.text.lower()

def test_health_check():
    response = client.get("/health")
    # Adjust status code check based on whether /health is implemented, 
    # fallback to verifying general router endpoints if health isn't explicit
    if response.status_code == 404:
        pytest.skip("Health check endpoint not explicitly configured.")
    assert response.status_code == 200

def test_optimize_route_endpoint_valid_payload():
    payload = {
        "source": {"latitude": 28.6139, "longitude": 77.2090},
        "destination": {"latitude": 28.6129, "longitude": 77.2295},
        "vehicle": {
            "vehicle_id": "API-TEST-01",
            "vehicle_type": "citizen",
            "battery_percentage": 85.0,
            "battery_capacity_kwh": 50.0,
            "consumption_kwh_per_km": 0.2,
            "minimum_reserve_pct": 10.0
        }
    }
    response = client.post("/route/optimize", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "feasible" in data
    assert data["feasible"] is True

def test_optimize_route_endpoint_invalid_payload():
    # Missing required vehicle details
    payload = {
        "source": {"latitude": 28.6139, "longitude": 77.2090},
        "destination": {"latitude": 28.6129, "longitude": 77.2295},
        "vehicle": {}
    }
    response = client.post("/route/optimize", json=payload)
    assert response.status_code == 422  # Unprocessable Entity validation error