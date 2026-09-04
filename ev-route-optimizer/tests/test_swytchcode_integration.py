import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.services.swytchcode_service import SwytchcodeService, get_swytchcode_service
from app.models.route_models import Coordinate, EmergencyIncident, EmergencyVehicle
from app.services.vehicle_repository import SQLEmergencyVehicleRepository
from app.services.db_models import EmergencyVehicleModel

client = TestClient(app)

def test_swytchcode_mistral_incident_classification():
    """
    1. Verifies that Swytchcode Mistral AI tool executes and returns structured
       triage information (live or resilient fallback).
    """
    service = get_swytchcode_service()
    result = service.classify_incident_mistral(
        incident_id="INC-TEST-01",
        incident_type="fire",
        severity="critical",
        description="Major electrical fire reported at commercial charging hub near Connaught Place"
    )

    assert "provider" in result
    assert "status" in result
    assert result["status"] in ("live", "fallback")
    assert result["ai_triage_category"] == "fire"
    assert result["recommended_priority"] in ("critical", "high")

def test_swytchcode_openweather_context():
    """
    2. Verifies that Swytchcode OpenWeather tool executes and returns meteorological
       and road-hazard context for the incident coordinates.
    """
    service = get_swytchcode_service()
    result = service.get_weather_context_openweather(lat=28.6139, lng=77.2090)

    assert "provider" in result
    assert "status" in result
    assert result["status"] in ("live", "fallback")
    assert "temperature_c" in result
    assert "road_surface" in result
    assert "ev_consumption_multiplier" in result
    assert result["ev_consumption_multiplier"] >= 1.0

def test_swytchcode_emergency_intelligence_composite():
    """
    3. Verifies that get_emergency_intelligence combines Mistral AI and OpenWeather
       context into a complete intelligence payload.
    """
    service = get_swytchcode_service()
    intel = service.get_emergency_intelligence(
        incident_id="INC-COMPOSITE-99",
        incident_type="accident",
        severity="high",
        lat=28.6250,
        lng=77.2180,
        details="Two EV cabs collided on main arterial road; battery coolant leak suspected."
    )

    assert intel["integration"] == "Swytchcode Ecosystem"
    assert "incident_analysis" in intel
    assert "weather_context" in intel
    assert "route_impact_assessment" in intel
    assert intel["incident_analysis"]["ai_triage_category"] == "accident"

def test_emergency_optimize_with_swytchcode_intelligence(db_session):
    """
    4. End-to-end integration test: POST /emergency/optimize triggers Swytchcode
       incident intelligence enrichment while preserving existing OSRM dispatch routing.
    """
    db_session.query(EmergencyVehicleModel).delete()
    db_session.commit()

    repo = SQLEmergencyVehicleRepository(db_session)
    repo.upsert_vehicle(EmergencyVehicle(
        vehicle_id="FIRE-SWY-01",
        vehicle_type="fire",
        current_location=Coordinate(lat=28.6150, lng=77.2100),
        battery_percentage=85.0,
        battery_capacity_kwh=60.0,
        consumption_kwh_per_km=0.25,
        minimum_reserve_pct=20.0,
        availability_status="available"
    ))

    payload = {
        "incident": {
            "incident_id": "INC-SWY-FIRE",
            "incident_type": "fire",
            "severity": "critical",
            "location": {"lat": 28.6139, "lng": 77.2090},
            "required_vehicle_type": "fire",
            "description": "Urgent transformer fire in dense market area."
        }
    }

    response = client.post("/emergency/optimize", json=payload)
    assert response.status_code == 200, response.json()
    data = response.json()

    # Verify Swytchcode intelligence is populated
    assert "swytchcode_intelligence" in data
    assert data["swytchcode_intelligence"] is not None
    assert "incident_analysis" in data["swytchcode_intelligence"]
    assert "weather_context" in data["swytchcode_intelligence"]

    # Verify existing emergency vehicle selection and OSRM routing remain functional
    assert data["selected_vehicle"] is not None
    assert data["selected_vehicle"]["vehicle_id"] == "FIRE-SWY-01"
    assert data["route"] is not None
    assert data["route"]["distance_km"] > 0

def test_dispatch_112_with_swytchcode_intelligence(db_session):
    """
    5. End-to-end integration test: POST /dispatch/112 adapter returns Swytchcode
       intelligence to the caller (n8n, municipal dashboard).
    """
    db_session.query(EmergencyVehicleModel).delete()
    db_session.commit()

    repo = SQLEmergencyVehicleRepository(db_session)
    repo.upsert_vehicle(EmergencyVehicle(
        vehicle_id="AMB-SWY-02",
        vehicle_type="ambulance",
        current_location=Coordinate(lat=28.6150, lng=77.2100),
        battery_percentage=90.0,
        battery_capacity_kwh=50.0,
        consumption_kwh_per_km=0.20,
        minimum_reserve_pct=15.0,
        availability_status="available"
    ))

    payload = {
        "incident_id": "112-DEL-AMB-404",
        "incident_type": "medical",
        "severity": "high",
        "location": {"lat": 28.6139, "lng": 77.2090},
        "required_vehicle_type": "ambulance"
    }

    response = client.post("/dispatch/112", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["dispatch_status"] == "recommended"
    assert data["selected_vehicle"]["vehicle_id"] == "AMB-SWY-02"
    assert "swytchcode_intelligence" in data
    assert data["swytchcode_intelligence"] is not None

def test_swytchcode_graceful_fallback_on_failure(db_session):
    """
    6. Verifies that even if Swytchcode CLI fails or encounters an unhandled exception,
       the core emergency dispatch and OSRM routing continues without error.
    """
    service = get_swytchcode_service()
    with patch.object(service, "_exec_swytchcode", side_effect=Exception("Simulated CLI error")):
        intel = service.get_emergency_intelligence(
            incident_id="INC-FAIL-TEST",
            incident_type="police",
            severity="medium",
            lat=28.6139,
            lng=77.2090
        )
        assert intel["incident_analysis"]["status"] == "fallback"
        assert intel["weather_context"]["status"] == "fallback"
