import os
from unittest.mock import patch, MagicMock
import httpx
import pytest

from app.models.route_models import Coordinate
from app.data.mock_chargers import ChargingStation
from app.services.ocm_charger_service import OCMChargerService
from app.services.osm_charger_service import OSMChargerService
from app.services.charger_provider import get_charger_provider

@pytest.fixture(autouse=True)
def reset_ocm_singleton():
    service = OCMChargerService()
    service.clear_cache()
    yield
    service.clear_cache()

@pytest.fixture
def ocm_service():
    # Force API key presence for OCM testing
    with patch.dict(os.environ, {"OPENCHARGEMAP_API_KEY": "test-ocm-key-12345", "CHARGER_PROVIDER": "ocm"}):
        service = OCMChargerService()
        # Reset cached entries
        service.clear_cache()
        yield service

@pytest.fixture
def mock_ocm_poi_response():
    return [
        {
            "ID": 10001,
            "OperatorInfo": {
                "Title": "Tata Power"
            },
            "UsageType": {
                "Title": "Public"
            },
            "StatusType": {
                "IsOperational": True,
                "Title": "Operational"
            },
            "AddressInfo": {
                "Title": "Tata Power Charging Station CP",
                "AddressLine1": "Outer Circle, Connaught Place",
                "Town": "New Delhi",
                "StateOrProvince": "Delhi",
                "Postcode": "110001",
                "Latitude": 28.6180,
                "Longitude": 77.2150
            },
            "Connections": [
                {
                    "Quantity": 2,
                    "PowerKW": 50.0,
                    "ConnectionType": {
                        "Title": "CCS (Type 2)"
                    },
                    "Voltage": 400,
                    "Amps": 125,
                    "CurrentType": {
                        "Title": "DC"
                    }
                },
                {
                    "Quantity": 1,
                    "PowerKW": 22.0,
                    "ConnectionType": {
                        "Title": "Type 2 (Socket Only)"
                    },
                    "Voltage": 230,
                    "Amps": 32,
                    "CurrentType": {
                        "Title": "AC (Three Phase)"
                    }
                }
            ]
        }
    ]

def test_get_charger_provider_factory():
    with patch.dict(os.environ, {"CHARGER_PROVIDER": "ocm"}):
        provider = get_charger_provider()
        assert isinstance(provider, OCMChargerService)

    with patch.dict(os.environ, {"CHARGER_PROVIDER": "osm"}):
        provider = get_charger_provider()
        assert isinstance(provider, OSMChargerService)

def test_ocm_successful_parsing(ocm_service, mock_ocm_poi_response):
    with patch("httpx.Client.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = mock_ocm_poi_response
        mock_get.return_value = mock_resp

        chargers = ocm_service.get_chargers_in_bbox(28.60, 77.20, 28.63, 77.23)

        assert len(chargers) == 1
        c = chargers[0]
        assert c.station_id == "OCM-10001"
        assert c.name == "Tata Power Charging Station CP"
        assert c.latitude == 28.6180
        assert c.longitude == 77.2150
        assert c.operator == "Tata Power"
        assert c.access == "Public"
        assert c.status == "available"
        assert c.status_source == "openchargemap"
        assert c.total_ports == 3
        assert c.charging_power_kw == 50.0
        assert "CCS (Type 2)" in c.connector_info
        assert "400V" in c.connector_info
        assert "125A" in c.connector_info
        assert "DC" in c.connector_info
        assert c.address == "Outer Circle, Connaught Place, New Delhi, Delhi, 110001"
        assert c.price_per_kwh is None
        assert c.estimated_wait_minutes is None

def test_ocm_missing_optional_fields(ocm_service):
    # Tests OCM POI item with completely missing address elements, operator info, connections, status etc.
    sparse_poi = [
        {
            "ID": 20002,
            "AddressInfo": {
                "Latitude": 28.6110,
                "Longitude": 77.2250
            }
        }
    ]
    with patch("httpx.Client.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = sparse_poi
        mock_get.return_value = mock_resp

        chargers = ocm_service.get_chargers_in_bbox(28.60, 77.20, 28.63, 77.23)

        assert len(chargers) == 1
        c = chargers[0]
        assert c.station_id == "OCM-20002"
        assert c.name == "OCM Station 20002"
        assert c.latitude == 28.6110
        assert c.longitude == 77.2250
        assert c.operator is None
        assert c.access is None
        assert c.status == "available"  # Defaults to available
        assert c.total_ports is None
        assert c.charging_power_kw is None
        assert c.connector_info is None
        assert c.address is None

def test_ocm_bounding_box_format(ocm_service, mock_ocm_poi_response):
    with patch("httpx.Client.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = mock_ocm_poi_response
        mock_get.return_value = mock_resp

        # Delhi search: bounds around Delhi which are within India
        ocm_service.get_chargers_in_bbox(28.60, 77.20, 28.63, 77.23)

        # Check call arguments
        assert mock_get.call_count == 1
        args, kwargs = mock_get.call_args
        params = kwargs.get("params", {})
        headers = kwargs.get("headers", {})

        # Bounding box should be formatted: (lat_max, lng_min),(lat_min, lng_max)
        # For cell (28.5, 77.0) containing Delh (grid size is 0.5)
        # Cell max lat: 29.0, min lat: 28.5. Max lng: 77.5, min lng: 77.0.
        # Format string check:
        assert "boundingbox" in params
        bbox_val = params["boundingbox"]
        assert bbox_val.startswith("(29.0,77.0)")
        assert bbox_val.endswith("(28.5,77.5)")
        assert params.get("countrycode") == "IN"
        assert headers.get("X-API-Key") == "test-ocm-key-12345"

def test_ocm_missing_api_key_fallback():
    # If API key is empty/absent, verify it calls OSM fallback
    with patch.dict(os.environ, {"OPENCHARGEMAP_API_KEY": "", "CHARGER_PROVIDER": "ocm"}):
        service = OCMChargerService()
        # Mock OSMChargerService's response
        mock_osm_charger = ChargingStation(
            station_id="OSM-9999",
            name="OSM Fallback Station",
            latitude=28.6120,
            longitude=77.2200,
            status="available"
        )
        with patch.object(OSMChargerService, "get_chargers_in_bbox", return_value=[mock_osm_charger]) as mock_osm:
            chargers = service.get_chargers_in_bbox(28.60, 77.20, 28.63, 77.23)
            
            assert len(chargers) == 1
            assert chargers[0].station_id == "OSM-9999"
            mock_osm.assert_called_once()

def test_ocm_http_failure_fallback(ocm_service):
    # If OCM API returns 500 or timeout, verify fallback to OSM
    with patch("httpx.Client.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 500
        mock_resp.text = "Internal Server Error"
        mock_get.return_value = mock_resp

        mock_osm_charger = ChargingStation(
            station_id="OSM-8888",
            name="OSM Fallback Station HTTP",
            latitude=28.6120,
            longitude=77.2200,
            status="available"
        )
        with patch.object(OSMChargerService, "get_chargers_in_bbox", return_value=[mock_osm_charger]) as mock_osm:
            chargers = ocm_service.get_chargers_in_bbox(28.60, 77.20, 28.63, 77.23)
            
            assert len(chargers) == 1
            assert chargers[0].station_id == "OSM-8888"
            mock_osm.assert_called_once()

def test_ocm_timeout_fallback(ocm_service):
    with patch("httpx.Client.get", side_effect=httpx.ConnectTimeout("OCM timeout")):
        mock_osm_charger = ChargingStation(
            station_id="OSM-7777",
            name="OSM Fallback Station Timeout",
            latitude=28.6120,
            longitude=77.2200,
            status="available"
        )
        with patch.object(OSMChargerService, "get_chargers_in_bbox", return_value=[mock_osm_charger]) as mock_osm:
            chargers = ocm_service.get_chargers_in_bbox(28.60, 77.20, 28.63, 77.23)
            
            assert len(chargers) == 1
            assert chargers[0].station_id == "OSM-7777"
            mock_osm.assert_called_once()

def test_ocm_malformed_response_fallback(ocm_service):
    with patch("httpx.Client.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"not_a": "list"}  # Malformed
        mock_get.return_value = mock_resp

        mock_osm_charger = ChargingStation(
            station_id="OSM-6666",
            name="OSM Fallback Station Malformed",
            latitude=28.6120,
            longitude=77.2200,
            status="available"
        )
        with patch.object(OSMChargerService, "get_chargers_in_bbox", return_value=[mock_osm_charger]) as mock_osm:
            chargers = ocm_service.get_chargers_in_bbox(28.60, 77.20, 28.63, 77.23)
            
            assert len(chargers) == 1
            assert chargers[0].station_id == "OSM-6666"
            mock_osm.assert_called_once()

from fastapi.testclient import TestClient
from app.main import app

def test_route_optimize_integration_with_ocm_provider(mock_ocm_poi_response):
    client = TestClient(app)
    
    payload = {
        "source": {"lat": 28.6139, "lng": 77.2090},
        "destination": {"lat": 28.6129, "lng": 77.2295},
        "vehicle": {
            "vehicle_id": "OCM-INTEG-1",
            "vehicle_type": "citizen",
            "battery_percentage": 13.0,
            "battery_capacity_kwh": 50.0,
            "consumption_kwh_per_km": 0.2,
            "minimum_reserve_pct": 10.0
        }
    }
    
    with patch("httpx.Client.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = mock_ocm_poi_response
        mock_get.return_value = mock_resp
        
        with patch.dict(os.environ, {"CHARGER_PROVIDER": "ocm", "OPENCHARGEMAP_API_KEY": "test-key-123"}):
            response = client.post("/route/optimize", json=payload)
            assert response.status_code == 200
            data = response.json()
            
            assert data["feasible"] is True
            assert data["charging_required"] is True
            
            charger = data["recommended_charger"]
            assert charger is not None
            assert charger["station_id"] == "OCM-10001"
            assert charger["name"] == "Tata Power Charging Station CP"
            assert charger["ocm_id"] == 10001
            assert charger["operator"] == "Tata Power"
            assert charger["address"] == "Outer Circle, Connaught Place, New Delhi, Delhi, 110001"
            assert "CCS (Type 2)" in charger["connector_info"]
            assert charger["charging_power_kw"] == 50.0

def test_health_check_diagnostics_endpoint():
    client = TestClient(app)
    with patch.dict(os.environ, {"CHARGER_PROVIDER": "ocm", "OPENCHARGEMAP_API_KEY": "test-key-123"}):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "charger_provider" in data
        diag = data["charger_provider"]
        assert diag["configured_provider"] == "ocm"
        assert diag["ocm_configured"] is True
        assert diag["ocm_reachable"] is True
        assert diag["fallback_active"] is False

def test_ocm_dynamic_fallback_diagnostics():
    from app.services.charger_provider import get_charger_provider_diagnostics
    service = OCMChargerService()
    service.clear_cache()
    assert service.fallback_triggered is False

    with patch("httpx.Client.get", side_effect=httpx.ConnectTimeout("OCM timeout")):
        with patch.dict(os.environ, {"CHARGER_PROVIDER": "ocm", "OPENCHARGEMAP_API_KEY": "test-key-123"}):
            with patch.object(OSMChargerService, "get_chargers_in_bbox", return_value=[]):
                service.get_chargers_in_bbox(28.60, 77.20, 28.63, 77.23)
            
            assert service.fallback_triggered is True
            
            diag = get_charger_provider_diagnostics()
            assert diag["fallback_active"] is True

def test_ocm_bbox_filtering(ocm_service, mock_ocm_poi_response):
    with patch("httpx.Client.get") as mock_get:
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = mock_ocm_poi_response
        mock_get.return_value = mock_resp

        # Query that includes the grid cell but filters out the mock station (28.6180, 77.2150)
        # because the query max latitude is 28.61 (below 28.6180)
        chargers = ocm_service.get_chargers_in_bbox(28.60, 77.20, 28.61, 77.21)

        # The station should be filtered out!
        assert len(chargers) == 0
