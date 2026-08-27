import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from app.main import app
from app.models.route_models import Coordinate, EmergencyVehicle, EmergencyIncident
from app.services.vehicle_repository import SQLEmergencyVehicleRepository
from app.services.db_models import EmergencyVehicleModel
from app.services.routing_provider import BaseRoutingProvider, get_routing_provider, RoutingAPIError

client = TestClient(app)

# A failing routing provider for test validation
class FailingRoutingProvider(BaseRoutingProvider):
    def get_candidate_routes(self, source: Coordinate, destination: Coordinate):
        raise RoutingAPIError("Connection timeout to routing service")

@pytest.fixture(autouse=True)
def clear_charger_caches():
    from app.services.ocm_charger_service import OCMChargerService
    from app.services.osm_charger_service import OSMChargerService
    OCMChargerService().clear_cache()
    OSMChargerService().clear_cache()
    yield
    OCMChargerService().clear_cache()
    OSMChargerService().clear_cache()

def test_n8n_style_telemetry_ingest(db_session):
    """
    1. Tests that n8n-style telemetry payload can be successfully posted
    to /vehicles/ingest and returns HTTP 200.
    """
    db_session.query(EmergencyVehicleModel).delete()
    db_session.commit()

    payload = [
        {
            "vehicle_id": "AMB-N8N-TEST",
            "vehicle_type": "ambulance",
            "current_location": {"lat": 28.6130, "lng": 77.2150},
            "battery_percentage": 90.0,
            "battery_capacity_kwh": 50.0,
            "consumption_kwh_per_km": 0.20,
            "minimum_reserve_pct": 15.0,
            "availability_status": "available"
        }
    ]

    response = client.post("/vehicles/ingest", json=payload)
    assert response.status_code == 200
    assert response.json()["status"] == "success"
    assert response.json()["upserted_count"] == 1

def test_database_update_after_telemetry(db_session):
    """
    2. Tests that sending updated vehicle telemetry for an existing vehicle id
    correctly modifies the stored coordinates, battery percentage, and availability status.
    """
    db_session.query(EmergencyVehicleModel).delete()
    db_session.commit()

    repo = SQLEmergencyVehicleRepository(db_session)
    # Seed initial state
    vehicle = EmergencyVehicle(
        vehicle_id="FIRE-UPD",
        vehicle_type="fire",
        current_location=Coordinate(lat=28.6130, lng=77.2150),
        battery_percentage=80.0,
        battery_capacity_kwh=60.0,
        consumption_kwh_per_km=0.25,
        minimum_reserve_pct=20.0,
        availability_status="available"
    )
    repo.upsert_vehicle(vehicle)

    # Post telemetry update modifying location, battery, and status
    payload = [
        {
            "vehicle_id": "FIRE-UPD",
            "vehicle_type": "fire",
            "current_location": {"lat": 28.6250, "lng": 77.2300},
            "battery_percentage": 45.0,
            "battery_capacity_kwh": 60.0,
            "consumption_kwh_per_km": 0.25,
            "minimum_reserve_pct": 20.0,
            "availability_status": "busy"
        }
    ]

    response = client.post("/vehicles/ingest", json=payload)
    assert response.status_code == 200

    # Retrieve from DB and verify updates
    updated = repo.get_vehicle_by_id("FIRE-UPD")
    assert updated is not None
    assert updated.current_location.lat == 28.6250
    assert updated.current_location.lng == 77.2300
    assert updated.battery_percentage == 45.0
    assert updated.availability_status == "busy"

def test_updated_state_used_by_optimizer(db_session):
    """
    3. Verifies that the route optimizer immediately uses the updated database telemetry.
       If an ambulance is busy and then becomes available, it should then be selectable.
    """
    db_session.query(EmergencyVehicleModel).delete()
    db_session.commit()

    repo = SQLEmergencyVehicleRepository(db_session)
    # Seed busy ambulance
    vehicle = EmergencyVehicle(
        vehicle_id="AMB-DYN",
        vehicle_type="ambulance",
        current_location=Coordinate(lat=28.6130, lng=77.2150),
        battery_percentage=90.0,
        battery_capacity_kwh=55.0,
        consumption_kwh_per_km=0.22,
        minimum_reserve_pct=15.0,
        availability_status="busy"
    )
    repo.upsert_vehicle(vehicle)

    # Dispatch request - should return no feasible vehicle because AMB-DYN is busy
    payload_dispatch = {
        "incident": {
            "incident_id": "INC-DYN-1",
            "incident_type": "medical",
            "severity": "high",
            "location": {"lat": 28.6139, "lng": 77.2090},
            "required_vehicle_type": "ambulance"
        }
    }
    resp1 = client.post("/emergency/optimize", json=payload_dispatch)
    assert resp1.status_code == 200
    assert resp1.json()["selected_vehicle"] is None

    # Telemetry updates AMB-DYN to available
    payload_telemetry = [
        {
            "vehicle_id": "AMB-DYN",
            "vehicle_type": "ambulance",
            "current_location": {"lat": 28.6130, "lng": 77.2150},
            "battery_percentage": 90.0,
            "battery_capacity_kwh": 55.0,
            "consumption_kwh_per_km": 0.22,
            "minimum_reserve_pct": 15.0,
            "availability_status": "available"
        }
    ]
    resp_ingest = client.post("/vehicles/ingest", json=payload_telemetry)
    assert resp_ingest.status_code == 200

    # Dispatch request again - should now select AMB-DYN
    resp2 = client.post("/emergency/optimize", json=payload_dispatch)
    assert resp2.status_code == 200
    assert resp2.json()["selected_vehicle"] is not None
    assert resp2.json()["selected_vehicle"]["vehicle_id"] == "AMB-DYN"

def test_multiple_vehicle_selection(db_session):
    """
    4. Tests that when multiple matching vehicles are available in the database,
       the optimizer selects the one that is closest/provides the fastest response (ETA).
    """
    db_session.query(EmergencyVehicleModel).delete()
    db_session.commit()

    repo = SQLEmergencyVehicleRepository(db_session)
    # FIRE-CLOSE: lat=28.6150, lng=77.2100 (CP is 28.6139, 77.2090 -> ~0.2 km)
    repo.upsert_vehicle(EmergencyVehicle(
        vehicle_id="FIRE-CLOSE",
        vehicle_type="fire",
        current_location=Coordinate(lat=28.6150, lng=77.2100),
        battery_percentage=90.0,
        battery_capacity_kwh=60.0,
        consumption_kwh_per_km=0.25,
        minimum_reserve_pct=20.0,
        availability_status="available"
    ))
    # FIRE-FAR: lat=28.6350, lng=77.2300 (Farther away -> ~3.0 km)
    repo.upsert_vehicle(EmergencyVehicle(
        vehicle_id="FIRE-FAR",
        vehicle_type="fire",
        current_location=Coordinate(lat=28.6350, lng=77.2300),
        battery_percentage=95.0,
        battery_capacity_kwh=60.0,
        consumption_kwh_per_km=0.25,
        minimum_reserve_pct=20.0,
        availability_status="available"
    ))

    # Dispatch request
    payload = {
        "incident": {
            "incident_id": "INC-MULTIPLE",
            "incident_type": "fire",
            "severity": "critical",
            "location": {"lat": 28.6139, "lng": 77.2090},
            "required_vehicle_type": "fire"
        }
    }
    response = client.post("/emergency/optimize", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["selected_vehicle"] is not None
    # Verify FIRE-CLOSE is selected over FIRE-FAR
    assert data["selected_vehicle"]["vehicle_id"] == "FIRE-CLOSE"

def test_battery_constrained_vehicle_selection(db_session):
    """
    5. Tests the scenario where Vehicle A is closer but lacks sufficient battery to reach
       the incident without violating the reserve limit, while Vehicle B is farther away
       but has sufficient battery. The optimizer must choose Vehicle B.
    """
    db_session.query(EmergencyVehicleModel).delete()
    db_session.commit()

    repo = SQLEmergencyVehicleRepository(db_session)
    # FIRE-CLOSE-LOW-BATT: Closest (~0.2km) but battery is 11% (reserve limit is 20%) -> infeasible!
    repo.upsert_vehicle(EmergencyVehicle(
        vehicle_id="FIRE-CLOSE-LOW-BATT",
        vehicle_type="fire",
        current_location=Coordinate(lat=28.6150, lng=77.2100),
        battery_percentage=11.0,
        battery_capacity_kwh=60.0,
        consumption_kwh_per_km=0.25,
        minimum_reserve_pct=20.0,
        availability_status="available"
    ))
    # FIRE-FAR-HIGH-BATT: Farther (~3.0km) but battery is 90% -> feasible!
    repo.upsert_vehicle(EmergencyVehicle(
        vehicle_id="FIRE-FAR-HIGH-BATT",
        vehicle_type="fire",
        current_location=Coordinate(lat=28.6350, lng=77.2300),
        battery_percentage=90.0,
        battery_capacity_kwh=60.0,
        consumption_kwh_per_km=0.25,
        minimum_reserve_pct=20.0,
        availability_status="available"
    ))

    # Dispatch request
    payload = {
        "incident": {
            "incident_id": "INC-BATT-LIMITS",
            "incident_type": "fire",
            "severity": "critical",
            "location": {"lat": 28.6139, "lng": 77.2090},
            "required_vehicle_type": "fire"
        }
    }
    response = client.post("/emergency/optimize", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["selected_vehicle"] is not None
    # Verify FIRE-FAR-HIGH-BATT is selected because FIRE-CLOSE-LOW-BATT is battery-infeasible
    assert data["selected_vehicle"]["vehicle_id"] == "FIRE-FAR-HIGH-BATT"

def test_charger_required_scenario():
    """
    6. Verifies that the route optimizer detects when a citizen journey cannot be completed
       directly and recommends a charging detour.
    """
    # Request with low battery (22%) and a high reserve limit (20%) for a long route
    # CP to Noida: lat=28.6139, lng=77.2090 -> lat=28.5700, lng=77.3200 (distance ~15 km)
    # Energy consumed = 15km * 0.25 kWh/km = 3.75 kWh.
    # 22% of 60kWh = 13.2 kWh initial. 13.2 - 3.75 = 9.45 kWh remaining = 15.75% arrival battery.
    # Violates minimum reserve of 20.0%. Triggering detour charging stop.
    payload = {
        "source": {"lat": 28.6139, "lng": 77.2090},
        "destination": {"lat": 28.5700, "lng": 77.3200},
        "vehicle": {
            "vehicle_id": "CIVIL-LOW-BATT",
            "vehicle_type": "ambulance",
            "battery_percentage": 22.0,
            "battery_capacity_kwh": 60.0,
            "consumption_kwh_per_km": 0.25,
            "minimum_reserve_pct": 20.0
        }
    }
    response = client.post("/route/optimize", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["feasible"] is True
    assert data["charging_required"] is True
    assert data["recommended_charger"] is not None

@patch("app.services.ocm_charger_service.OCMChargerService._query_ocm_for_cell")
def test_ocm_charger_retrieval_integration(mock_ocm_query):
    """
    7. Tests that citizen route optimization queries Open Charge Map and uses OCM station data.
    """
    from app.data.mock_chargers import ChargingStation
    mock_ocm_query.return_value = [
        ChargingStation(
            station_id="OCM-9999",
            name="OCM Supercharger Delhi",
            latitude=28.6140,
            longitude=77.2100,
            available_ports=4,
            total_ports=4,
            charging_power_kw=100.0,
            price_per_kwh=15.0,
            estimated_wait_minutes=5.0,
            status="available",
            operator="Tata Power EZ Charge",
            connector_info="CCS (Type 2)",
            access="Public",
            ocm_id=9999,
            address="Connaught Place Radial Road"
        )
    ]

    payload = {
        "source": {"lat": 28.6139, "lng": 77.2090},
        "destination": {"lat": 28.5700, "lng": 77.3200},
        "vehicle": {
            "vehicle_id": "CIVIL-OCM-TEST",
            "vehicle_type": "police",
            "battery_percentage": 22.0,
            "battery_capacity_kwh": 60.0,
            "consumption_kwh_per_km": 0.25,
            "minimum_reserve_pct": 20.0
        }
    }

    # Force OCM provider
    with patch.dict(pytest.importorskip("os").environ, {"CHARGER_PROVIDER": "ocm", "OPENCHARGEMAP_API_KEY": "dummy-key"}):
        response = client.post("/route/optimize", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["charging_required"] is True
    assert data["recommended_charger"]["ocm_id"] == 9999
    assert data["recommended_charger"]["name"] == "OCM Supercharger Delhi"
    assert data["recommended_charger"]["charging_power_kw"] == 100.0
    assert data["recommended_charger"]["operator"] == "Tata Power EZ Charge"

@patch("app.services.ocm_charger_service.OCMChargerService._query_ocm_for_cell")
@patch("app.services.osm_charger_service.OSMChargerService._query_overpass_for_cell")
def test_osm_fallback_integration(mock_osm_query, mock_ocm_query):
    """
    8. Tests that when OCM fails or returns exceptions, route optimizer fallback to OSM queries works.
    """
    from app.data.mock_chargers import ChargingStation
    mock_ocm_query.side_effect = Exception("OCM Server Timeout Exception")
    mock_osm_query.return_value = [
        ChargingStation(
            station_id="OSM-12345",
            name="OSM Fallback Station",
            latitude=28.6145,
            longitude=77.2105,
            available_ports=2,
            total_ports=2,
            charging_power_kw=50.0,
            price_per_kwh=12.0,
            estimated_wait_minutes=0.0,
            status="available",
            operator="Delhi Transco Limited",
            connector_info="socket:charger=2",
            access="Public",
            osm_id=12345
        )
    ]

    payload = {
        "source": {"lat": 28.6139, "lng": 77.2090},
        "destination": {"lat": 28.5700, "lng": 77.3200},
        "vehicle": {
            "vehicle_id": "CIVIL-OSM-FALLBACK",
            "vehicle_type": "police",
            "battery_percentage": 22.0,
            "battery_capacity_kwh": 60.0,
            "consumption_kwh_per_km": 0.25,
            "minimum_reserve_pct": 20.0
        }
    }

    # Force OCM provider but mock triggers fallback to OSM
    with patch.dict(pytest.importorskip("os").environ, {"CHARGER_PROVIDER": "ocm", "OPENCHARGEMAP_API_KEY": "dummy-key"}):
        response = client.post("/route/optimize", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["charging_required"] is True
    # The selected station should be the OSM fallback station
    assert data["recommended_charger"]["name"] == "OSM Fallback Station"
    assert data["recommended_charger"]["operator"] == "Delhi Transco Limited"

def test_malformed_telemetry_rejection():
    """
    9. Tests that malformed telemetry inputs are rejected with HTTP 422.
    """
    # 1. Invalid status "sleeping"
    payload1 = [
        {
            "vehicle_id": "FIRE-BAD",
            "vehicle_type": "fire",
            "current_location": {"lat": 28.6130, "lng": 77.2150},
            "battery_percentage": 80.0,
            "battery_capacity_kwh": 60.0,
            "consumption_kwh_per_km": 0.25,
            "minimum_reserve_pct": 20.0,
            "availability_status": "sleeping"
        }
    ]
    response1 = client.post("/vehicles/ingest", json=payload1)
    assert response1.status_code == 422

    # 2. Invalid vehicle type "drone"
    payload2 = [
        {
            "vehicle_id": "FIRE-BAD",
            "vehicle_type": "drone",
            "current_location": {"lat": 28.6130, "lng": 77.2150},
            "battery_percentage": 80.0,
            "battery_capacity_kwh": 60.0,
            "consumption_kwh_per_km": 0.25,
            "minimum_reserve_pct": 20.0,
            "availability_status": "available"
        }
    ]
    response2 = client.post("/vehicles/ingest", json=payload2)
    assert response2.status_code == 422

def test_backend_routing_failure_handling():
    """
    10. Tests that routing service timeout exceptions are handled gracefully,
        returning a clean selection-failed response rather than crashing the API.
    """
    # Temporarily override dependency provider
    app.dependency_overrides[get_routing_provider] = lambda: FailingRoutingProvider()

    payload = {
        "incident": {
            "incident_id": "INC-FAIL-ROUTING",
            "incident_type": "fire",
            "severity": "critical",
            "location": {"lat": 28.6139, "lng": 77.2090},
            "required_vehicle_type": "fire"
        }
    }

    try:
        response = client.post("/emergency/optimize", json=payload)
        # Should return HTTP 200 with selected_vehicle = None because all vehicles failed to route
        assert response.status_code == 200
        data = response.json()
        assert data["selected_vehicle"] is None
        # Confirms routing exceptions were handled and logged for the candidate vehicles
        eval_v = data["evaluated_vehicles"][0]
        assert "Rejected because no routes could be calculated" in eval_v["reason"]
    finally:
        # Clear override
        app.dependency_overrides.pop(get_routing_provider, None)
