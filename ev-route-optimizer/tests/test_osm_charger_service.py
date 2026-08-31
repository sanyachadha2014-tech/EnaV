import pytest
from unittest.mock import patch, MagicMock
import httpx

from app.models.route_models import Coordinate
from app.services.osm_charger_service import OSMChargerService

@pytest.fixture(autouse=True)
def clean_cache():
    # Make sure we start with a clean cache for each test
    OSMChargerService().clear_cache()

def test_grid_cells_calculation():
    service = OSMChargerService()
    # CP bbox: 28.61 to 28.63, 77.20 to 77.22
    # Fits inside a single 0.5x0.5 grid cell (bottom left: 28.5, 77.0)
    cells = service.get_grid_cells_for_bbox(28.61, 77.20, 28.63, 77.22)
    assert len(cells) == 1
    assert cells[0] == (28.5, 77.0)

    # Large bbox crossing multiple cells
    cells = service.get_grid_cells_for_bbox(28.4, 76.8, 29.1, 77.6)
    assert len(cells) == 9

@patch("httpx.Client.post")
def test_overpass_query_and_parsing(mock_post):
    # Mock successful Overpass response with varying tag formats
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "elements": [
            {
                "type": "node",
                "id": 100001,
                "lat": 28.6180,
                "lon": 77.2150,
                "tags": {
                    "amenity": "charging_station",
                    "name": "Tata CP fast charger",
                    "operator": "Tata Power",
                    "capacity": "4",
                    "socket:type2": "2",
                    "socket:ccs": "2",
                    "socket:type2:output": "22kW",
                    "socket:ccs:output": "50kW",
                    "access": "yes",
                    "opening_hours": "24/7"
                }
            },
            {
                "type": "node",
                "id": 100002,
                "lat": 28.6050,
                "lon": 77.2180,
                "tags": {
                    "amenity": "charging_station",
                    # No name, should use operator brand or default
                    "brand": "Ather",
                    # No capacity tag, should sum sockets
                    "socket:type2": "2",
                    # No output tags, capacity:kw tag
                    "capacity:kw": "15"
                }
            },
            {
                "type": "node",
                "id": 100003,
                "lat": 28.9999,  # Way outside bounds
                "lon": 77.9999,
                "tags": {
                    "amenity": "charging_station"
                }
            }
        ]
    }
    mock_post.return_value = mock_response

    service = OSMChargerService()
    # Query CP bbox
    chargers = service.get_chargers_in_bbox(28.60, 77.20, 28.62, 77.22)

    # Elements inside bbox check (100001 and 100002 are inside, 100003 is filtered out)
    assert len(chargers) == 2
    
    c1 = next(c for c in chargers if c.station_id == "OSM-100001")
    assert c1.name == "Tata CP fast charger"
    assert c1.operator == "Tata Power"
    assert c1.total_ports == 4
    assert c1.charging_power_kw == 50.0  # ccs output max
    assert c1.access == "yes"
    assert c1.opening_hours == "24/7"
    assert "type2: 2" in c1.connector_info
    assert "ccs: 2" in c1.connector_info
    assert c1.price_per_kwh is None  # No fabrication

    c2 = next(c for c in chargers if c.station_id == "OSM-100002")
    assert c2.name == "Ather Charging Station"
    assert c2.operator == "Ather"
    assert c2.total_ports == 2  # sockets sum
    assert c2.charging_power_kw == 15.0  # capacity:kw

@patch("httpx.Client.post")
def test_caching_mechanism(mock_post):
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"elements": []}
    mock_post.return_value = mock_response

    service = OSMChargerService()
    
    # Query 1
    service.get_chargers_in_bbox(28.61, 77.20, 28.62, 77.22)
    assert mock_post.call_count == 1

    # Query 2 (identical area, should hit cache)
    service.get_chargers_in_bbox(28.61, 77.20, 28.62, 77.22)
    assert mock_post.call_count == 1  # Still 1 call!

    # Query 3 (different area, crosses cell border)
    service.get_chargers_in_bbox(29.1, 77.20, 29.2, 77.22)
    assert mock_post.call_count == 2  # Increments to 2!
