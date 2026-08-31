import pytest
from fastapi.testclient import TestClient

from app.models.route_models import Coordinate
from app.services.gis_service import GISService
from app.main import app

client = TestClient(app)

@pytest.fixture
def gis_service():
    service = GISService()
    # Force reload default production KMZ dataset
    service.load_kml()
    return service

# 1. Test KMZ loads successfully and contains the real district polygons
def test_kmz_loads_successfully(gis_service):
    # Verify default production load (district_nwic.kmz) parses 730+ polygon shapes
    num_zones = gis_service.load_kml()
    assert num_zones > 700
    assert len(gis_service.zones) > 700

# 2. Test metadata extraction from the real dataset
def test_district_metadata_extraction(gis_service):
    assert len(gis_service.zones) > 0
    # Let's inspect a loaded zone
    zone = gis_service.zones[0]
    assert "district_id" in zone
    assert "district_name" in zone
    assert "state_name" in zone
    assert "polygon" in zone
    assert zone["polygon"] is not None

# 3. Test Delhi coordinate 1 (CP) falls in New Delhi district
def test_delhi_coordinate_1_cp(gis_service):
    # CP: 28.6139, 77.2090
    coord = Coordinate(lat=28.6139, lng=77.2090)
    result = gis_service.locate_point(coord)
    assert result["inside_boundary"] is True
    assert result["district_name"] == "New Delhi"
    assert result["district_id"] == "079"
    assert result["state_name"] == "Delhi"

# 4. Test Delhi coordinate 2 (East Delhi) falls in East Delhi district
def test_delhi_coordinate_2_east(gis_service):
    # East Delhi coordinate: 28.6412, 77.3109
    coord = Coordinate(lat=28.6412, lng=77.3109)
    result = gis_service.locate_point(coord)
    assert result["inside_boundary"] is True
    assert result["district_name"] == "East"
    assert result["district_id"] == "078"
    assert result["state_name"] == "Delhi"

# 5. Test coordinate outside Delhi but inside India (Noida)
def test_coordinate_outside_delhi_noida(gis_service):
    # Noida: 28.5700, 77.3200 (Gautam Buddha Nagar, UP)
    coord = Coordinate(lat=28.5700, lng=77.3200)
    result = gis_service.locate_point(coord)
    assert result["inside_boundary"] is True
    assert result["district_name"] == "Gautam Buddha Nagar"
    assert result["state_name"] == "Uttar Pradesh"
    assert result["district_id"] == "144"

# 6. Test coordinate outside all boundaries (0.0, 0.0)
def test_coordinate_outside_all(gis_service):
    coord = Coordinate(lat=0.0, lng=0.0)
    result = gis_service.locate_point(coord)
    assert result["inside_boundary"] is False
    assert result["district_id"] == "OUTSIDE"
    assert result["state_name"] == "Unknown State"

# 7. Test invalid coordinates are rejected by model validator
def test_invalid_coordinates_rejected():
    with pytest.raises(ValueError):
        Coordinate(lat=120.0, lng=77.2090)
        
    with pytest.raises(ValueError):
        Coordinate(lat=28.6139, lng=-190.0)

# 8. Test standalone KML fallback load works correctly
def test_kml_fallback_loading(gis_service):
    # Load sample boundaries KML directly
    import os
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    kml_path = os.path.join(base_dir, "app", "data", "gis", "administrative_boundaries.kml")
    
    num_zones = gis_service.load_kml(kml_path)
    assert num_zones == 3
    
    # Check that CP coordinate now resolves to the sample ZONE-A Central Zone
    coord = Coordinate(lat=28.6139, lng=77.2090)
    result = gis_service.locate_point(coord)
    assert result["inside_boundary"] is True
    assert result["district_id"] == "ZONE-A"
    assert result["district_name"] == "Central Zone"
    
    # Reset singleton state to default production KMZ for other tests
    gis_service.load_kml()

# 9. Test POST /gis/locate API endpoint works
def test_gis_locate_endpoint():
    # Query CP -> should locate New Delhi
    payload = {
        "location": {
            "lat": 28.6139,
            "lng": 77.2090
        }
    }
    response = client.post("/gis/locate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["inside_boundary"] is True
    assert data["district_name"] == "New Delhi"
    assert data["district_id"] == "079"
    assert data["state_name"] == "Delhi"

# 10. Test POST /emergency/optimize includes district information
def test_emergency_optimize_includes_district():
    payload = {
        "incident": {
            "incident_id": "INC-301",
            "incident_type": "accident",
            "severity": "high",
            "location": {"lat": 28.6139, "lng": 77.2090},
            "required_vehicle_type": "police"
        }
    }
    response = client.post("/emergency/optimize", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "district" in data
    assert data["district"] is not None
    assert data["district"]["district_name"] == "New Delhi"
    assert data["district"]["district_id"] == "079"
    assert data["district"]["state_name"] == "Delhi"
