import os
import math
import logging
from typing import List, Dict, Tuple, Optional
import httpx

from app.models.route_models import Coordinate
from app.data.mock_chargers import ChargingStation
from app.services.charger_provider import BaseChargerProvider

logger = logging.getLogger(__name__)

class OSMChargerService(BaseChargerProvider):
    _instance = None
    _cache: Dict[Tuple[float, float], List[ChargingStation]] = {}

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(OSMChargerService, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def __init__(self):
        self.overpass_url = os.getenv("OVERPASS_URL", "https://overpass-api.de/api/interpreter").strip()
        self.grid_size = 0.5  # 0.5 degrees grid cell cache size

    def clear_cache(self):
        """Clears the internal cache. Useful for tests."""
        self._cache.clear()

    def get_grid_cells_for_bbox(self, min_lat: float, min_lng: float, max_lat: float, max_lng: float) -> List[Tuple[float, float]]:
        """
        Calculates the grid cells (bottom-left coordinate) that intersect the bounding box.
        """
        start_lat = math.floor(min_lat / self.grid_size) * self.grid_size
        end_lat = math.ceil(max_lat / self.grid_size) * self.grid_size
        start_lng = math.floor(min_lng / self.grid_size) * self.grid_size
        end_lng = math.ceil(max_lng / self.grid_size) * self.grid_size

        cells = []
        lat = start_lat
        while lat < end_lat:
            lng = start_lng
            while lng < end_lng:
                cells.append((round(lat, 2), round(lng, 2)))
                lng += self.grid_size
            lat += self.grid_size
        return cells

    def _query_overpass_for_cell(self, cell_lat: float, cell_lng: float) -> List[ChargingStation]:
        """
        Queries the Overpass API for charging stations in a specific 0.5x0.5 degree grid cell.
        """
        lat_min = cell_lat
        lng_min = cell_lng
        lat_max = cell_lat + self.grid_size
        lng_max = cell_lng + self.grid_size

        # Query all nodes, ways, and relations tagged as amenity=charging_station inside the bbox
        query = f"""
        [out:json][timeout:25];
        (
          node["amenity"="charging_station"]({lat_min},{lng_min},{lat_max},{lng_max});
          way["amenity"="charging_station"]({lat_min},{lng_min},{lat_max},{lng_max});
          relation["amenity"="charging_station"]({lat_min},{lng_min},{lat_max},{lng_max});
        );
        out center;
        """

        logger.info(f"Querying Overpass for cell {cell_lat},{cell_lng} (Bbox: {lat_min},{lng_min},{lat_max},{lng_max})")
        
        try:
            with httpx.Client(timeout=30.0) as client:
                response = client.post(self.overpass_url, data={"data": query})
            
            if response.status_code != 200:
                logger.error(f"Overpass API returned status {response.status_code}: {response.text}")
                return []

            data = response.json()
            elements = data.get("elements", [])
            chargers = []

            for element in elements:
                osm_id = element.get("id")
                # Parse geometry coordinates
                lat = element.get("lat")
                lng = element.get("lon")
                
                # For ways or relations, Overpass center query returns "center" dictionary
                if lat is None or lng is None:
                    center = element.get("center", {})
                    lat = center.get("lat")
                    lng = center.get("lon")

                if lat is None or lng is None:
                    continue

                tags = element.get("tags", {})
                
                # 1. Parse Name
                name = tags.get("name")
                operator = tags.get("operator") or tags.get("brand")
                if not name:
                    if operator:
                        name = f"{operator} Charging Station"
                    else:
                        name = f"OSM Station {osm_id}"

                # 2. Parse Capacity (total ports)
                capacity = None
                capacity_tag = tags.get("capacity")
                if capacity_tag:
                    try:
                        capacity = int(capacity_tag)
                    except ValueError:
                        pass
                
                if capacity is None:
                    # Alternative check for specific socket counts
                    socket_count = 0
                    for tag_key, tag_val in tags.items():
                        if tag_key.startswith("socket:") and not tag_key.endswith(":output") and not tag_key.endswith(":voltage") and not tag_key.endswith(":amperage"):
                            try:
                                socket_count += int(tag_val)
                            except ValueError:
                                pass
                    if socket_count > 0:
                        capacity = socket_count

                # 3. Parse Connector Info
                connectors = []
                for tag_key, tag_val in tags.items():
                    if tag_key.startswith("socket:") and not tag_key.endswith(":output") and not tag_key.endswith(":voltage") and not tag_key.endswith(":amperage"):
                        socket_type = tag_key.split(":", 1)[1]
                        connectors.append(f"{socket_type}: {tag_val}")
                
                connector_info = ", ".join(connectors) if connectors else tags.get("socket")

                # 4. Parse Charging Power (kW)
                power = None
                power_tag = tags.get("charging_power") or tags.get("capacity:kw") or tags.get("power")
                if power_tag:
                    try:
                        # Extract digits/decimal
                        num_str = "".join(c for c in str(power_tag) if c.isdigit() or c == '.')
                        if num_str:
                            power = float(num_str)
                    except ValueError:
                        pass
                
                if power is None:
                    # Look for socket outputs
                    max_power = 0.0
                    for tag_key, tag_val in tags.items():
                        if tag_key.startswith("socket:") and tag_key.endswith(":output"):
                            try:
                                num_str = "".join(c for c in str(tag_val) if c.isdigit() or c == '.')
                                if num_str:
                                    max_power = max(max_power, float(num_str))
                            except ValueError:
                                pass
                    if max_power > 0.0:
                        power = max_power

                # Construct the ChargingStation Pydantic object
                # Missing parameters mapped to None (no fabrication)
                charger = ChargingStation(
                    station_id=f"OSM-{osm_id}",
                    name=name,
                    latitude=lat,
                    longitude=lng,
                    available_ports=None,  # No real-time status in OSM
                    total_ports=capacity,
                    charging_power_kw=power,
                    price_per_kwh=None,  # No standard pricing in OSM
                    estimated_wait_minutes=None,  # No live queue status
                    status="available",
                    operator=operator,
                    connector_info=connector_info,
                    access=tags.get("access"),
                    opening_hours=tags.get("opening_hours"),
                    osm_id=osm_id
                )
                chargers.append(charger)

            return chargers
        except Exception as e:
            logger.error(f"Error querying Overpass for cell {cell_lat},{cell_lng}: {e}")
            return []

    def get_chargers_in_bbox(self, min_lat: float, min_lng: float, max_lat: float, max_lng: float) -> List[ChargingStation]:
        """
        Retrieves all charging stations that fall inside the bounding box.
        Queries the grid cell cache, and calls Overpass for uncached cells.
        """
        grid_cells = self.get_grid_cells_for_bbox(min_lat, min_lng, max_lat, max_lng)
        
        all_chargers: Dict[str, ChargingStation] = {}

        for cell in grid_cells:
            if cell not in self._cache:
                chargers = self._query_overpass_for_cell(cell[0], cell[1])
                self._cache[cell] = chargers
            
            # Add to elements dictionary to filter duplicates across adjacent cells
            for charger in self._cache[cell]:
                all_chargers[charger.station_id] = charger

        # Final filter to return only chargers actually inside the requested bbox bounds
        bbox_chargers = []
        for charger in all_chargers.values():
            if min_lat <= charger.latitude <= max_lat and min_lng <= charger.longitude <= max_lng:
                bbox_chargers.append(charger)

        return bbox_chargers
