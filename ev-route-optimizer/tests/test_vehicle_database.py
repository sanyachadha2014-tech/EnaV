import pytest
import os
from fastapi.testclient import TestClient

from app.main import app
from app.models.route_models import EmergencyVehicle, Coordinate
from app.services.vehicle_repository import SQLEmergencyVehicleRepository
from app.services.db_models import EmergencyVehicleModel

client = TestClient(app)

def test_empty_database(db_session):
    """
    Verifies database behaves correctly when empty.
    """
    # Clear seeded mock vehicles
    db_session.query(EmergencyVehicleModel).delete()
    db_session.commit()

    repo = SQLEmergencyVehicleRepository(db_session)
    vehicles = repo.get_all_vehicles()
    assert len(vehicles) == 0

    vehicle = repo.get_vehicle_by_id("FIRE-001")
    assert vehicle is None

    typed_vehicles = repo.get_vehicles_by_type("fire")
    assert len(typed_vehicles) == 0

def test_repository_crud_operations(db_session):
    """
    Tests creation, retrieval, and update/upsert actions on the repository.
    """
    # Clear seeded mock vehicles
    db_session.query(EmergencyVehicleModel).delete()
    db_session.commit()

    repo = SQLEmergencyVehicleRepository(db_session)
    
    # 1. Create
    new_v = EmergencyVehicle(
        vehicle_id="FIRE-TEST",
        vehicle_type="fire",
        current_location=Coordinate(lat=28.61, lng=77.22),
        battery_percentage=80.0,
        battery_capacity_kwh=60.0,
        consumption_kwh_per_km=0.25,
        minimum_reserve_pct=20.0,
        availability_status="available"
    )
    repo.upsert_vehicle(new_v)

    # 2. Retrieve
    retrieved = repo.get_vehicle_by_id("FIRE-TEST")
    assert retrieved is not None
    assert retrieved.vehicle_id == "FIRE-TEST"
    assert retrieved.current_location.lat == 28.61
    assert retrieved.battery_percentage == 80.0

    # 3. Update / Upsert
    updated_v = EmergencyVehicle(
        vehicle_id="FIRE-TEST",
        vehicle_type="fire",
        current_location=Coordinate(lat=28.62, lng=77.23),
        battery_percentage=75.0,
        battery_capacity_kwh=60.0,
        consumption_kwh_per_km=0.25,
        minimum_reserve_pct=20.0,
        availability_status="busy"
    )
    repo.upsert_vehicle(updated_v)

    retrieved_updated = repo.get_vehicle_by_id("FIRE-TEST")
    assert retrieved_updated.current_location.lat == 28.62
    assert retrieved_updated.battery_percentage == 75.0
    assert retrieved_updated.availability_status == "busy"

def test_ingestion_endpoint_success(db_session):
    """
    Verifies that the /vehicles/ingest endpoint accepts valid telemetry payload and upserts correctly.
    """
    db_session.query(EmergencyVehicleModel).delete()
    db_session.commit()

    payload = [
        {
            "vehicle_id": "AMB-TELEMETRY-1",
            "vehicle_type": "ambulance",
            "current_location": {"lat": 28.59, "lng": 77.20},
            "battery_percentage": 95.0,
            "battery_capacity_kwh": 55.0,
            "consumption_kwh_per_km": 0.22,
            "minimum_reserve_pct": 15.0,
            "availability_status": "available"
        }
    ]

    response = client.post("/vehicles/ingest", json=payload)
    assert response.status_code == 200
    assert response.json() == {"status": "success", "upserted_count": 1}

    # Verify database state
    repo = SQLEmergencyVehicleRepository(db_session)
    retrieved = repo.get_vehicle_by_id("AMB-TELEMETRY-1")
    assert retrieved is not None
    assert retrieved.battery_percentage == 95.0
    assert retrieved.availability_status == "available"

def test_ingestion_endpoint_validation_errors():
    """
    Verifies ingestion endpoint rejects malformed input coordinates or invalid status values.
    """
    # 1. Malformed latitude (> 90.0)
    payload_bad_lat = [
        {
            "vehicle_id": "AMB-BAD",
            "vehicle_type": "ambulance",
            "current_location": {"lat": 120.0, "lng": 77.20},
            "battery_percentage": 95.0,
            "battery_capacity_kwh": 55.0,
            "consumption_kwh_per_km": 0.22,
            "minimum_reserve_pct": 15.0,
            "availability_status": "available"
        }
    ]
    response = client.post("/vehicles/ingest", json=payload_bad_lat)
    assert response.status_code == 422

    # 2. Invalid status string ("resting")
    payload_bad_status = [
        {
            "vehicle_id": "AMB-BAD",
            "vehicle_type": "ambulance",
            "current_location": {"lat": 28.59, "lng": 77.20},
            "battery_percentage": 95.0,
            "battery_capacity_kwh": 55.0,
            "consumption_kwh_per_km": 0.22,
            "minimum_reserve_pct": 15.0,
            "availability_status": "resting"
        }
    ]
    response = client.post("/vehicles/ingest", json=payload_bad_status)
    assert response.status_code == 422

def test_n8n_telemetry_flow_integration(db_session):
    """
    Simulates a full n8n telemetry payload ingestion followed by emergency route optimization.
    """
    db_session.query(EmergencyVehicleModel).delete()
    db_session.commit()

    # 1. Telemetry Ingest (represents an n8n webhook push)
    telemetry_payload = [
        {
            "vehicle_id": "FIRE-N8N-999",
            "vehicle_type": "fire",
            "current_location": {"lat": 28.6250, "lng": 77.2150},
            "battery_percentage": 90.0,
            "battery_capacity_kwh": 60.0,
            "consumption_kwh_per_km": 0.25,
            "minimum_reserve_pct": 20.0,
            "availability_status": "available"
        }
    ]

    ingest_resp = client.post("/vehicles/ingest", json=telemetry_payload)
    assert ingest_resp.status_code == 200

    # 2. Run Route Optimization
    optimize_payload = {
        "incident": {
            "incident_id": "INC-N8N-101",
            "incident_type": "fire",
            "severity": "critical",
            "location": {"lat": 28.6139, "lng": 77.2090},
            "required_vehicle_type": "fire"
        }
    }

    optimize_resp = client.post("/emergency/optimize", json=optimize_payload)
    assert optimize_resp.status_code == 200
    
    data = optimize_resp.json()
    assert data["selected_vehicle"] is not None
    assert data["selected_vehicle"]["vehicle_id"] == "FIRE-N8N-999"
    assert data["selected_vehicle"]["vehicle_type"] == "fire"
