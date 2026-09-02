from unittest.mock import MagicMock, patch
import pytest
import httpx
from app.models.route_models import Coordinate
from app.services.routing_provider import (
    MockRoutingProvider,
    OSRMQueryRoutingProvider,
    MapboxRoutingProvider,
    RoutingAPIError,
    get_routing_provider
)

def test_mock_routing_provider():
    provider = MockRoutingProvider()
    routes = provider.get_candidate_routes(
        Coordinate(latitude=28.6139, longitude=77.2090),
        Coordinate(latitude=28.6129, longitude=77.2295)
    )
    assert len(routes) > 0
    assert routes[0].route_id.startswith("ROUTE-")
    assert len(routes[0].geometry) > 0

@patch("httpx.Client.get")
def test_osrm_routing_provider_success(mock_get):
    # Mock OSRM success JSON response
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "code": "Ok",
        "routes": [
            {
                "distance": 3980.0,
                "duration": 400.0,
                "geometry": {
                    "type": "LineString",
                    "coordinates": [[77.2090, 28.6139], [77.2295, 28.6129]]
                }
            }
        ]
    }
    mock_get.return_value = mock_response

    provider = OSRMQueryRoutingProvider()
    routes = provider.get_candidate_routes(
        Coordinate(latitude=28.6139, longitude=77.2090),
        Coordinate(latitude=28.6129, longitude=77.2295)
    )

    assert len(routes) == 1
    assert routes[0].route_id == "OSRM-1"
    assert routes[0].distance_km == 3.98
    assert routes[0].duration_seconds == 400.0
    assert len(routes[0].geometry) == 2
    assert routes[0].geometry[0].latitude == 28.6139
    assert routes[0].geometry[0].longitude == 77.2090
    assert routes[0].geometry[1].latitude == 28.6129
    assert routes[0].geometry[1].longitude == 77.2295

@patch("httpx.Client.get")
def test_osrm_routing_provider_network_error(mock_get):
    # Simulate a network timeout or connection refuse
    mock_get.side_effect = httpx.RequestError("Connection refused")

    provider = OSRMQueryRoutingProvider()
    with pytest.raises(RoutingAPIError) as exc_info:
        provider.get_candidate_routes(
            Coordinate(latitude=0.0, longitude=0.0),
            Coordinate(latitude=1.0, longitude=1.0)
        )
    assert "Failed to connect to public OSRM API" in str(exc_info.value)

@patch("httpx.Client.get")
def test_mapbox_routing_provider_traffic_detection(mock_get):
    # Mock Mapbox driving-traffic success JSON response
    # Typical duration = 1000s, Actual duration = 1450s (Ratio = 1.45, > 1.35 = heavy traffic)
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "code": "Ok",
        "routes": [
            {
                "distance": 8000.0,
                "duration": 1450.0,
                "duration_typical": 1000.0,
                "geometry": {
                    "type": "LineString",
                    "coordinates": [[77.2090, 28.6139]]
                }
            }
        ]
    }
    mock_get.return_value = mock_response

    provider = MapboxRoutingProvider(access_token="fake-token")
    routes = provider.get_candidate_routes(
        Coordinate(latitude=28.6139, longitude=77.2090),
        Coordinate(latitude=28.6129, longitude=77.2295)
    )

    assert len(routes) == 1
    assert routes[0].route_id == "MAPBOX-1"
    assert routes[0].traffic_level == "heavy"

@patch.dict("os.environ", {"ROUTING_PROVIDER": "mapbox", "MAPBOX_ACCESS_TOKEN": ""})
def test_factory_fallback():
    # If Mapbox is chosen but token is empty, it should fall back to OSRM
    provider = get_routing_provider()
    assert isinstance(provider, OSRMQueryRoutingProvider)

@patch.dict("os.environ", {"OSRM_BASE_URL": "http://my-custom-osrm.local/route"})
def test_osrm_provider_custom_url():
    provider = OSRMQueryRoutingProvider()
    assert provider.base_url == "http://my-custom-osrm.local/route"