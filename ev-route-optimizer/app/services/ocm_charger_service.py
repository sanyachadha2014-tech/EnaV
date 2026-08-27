import os
import math
import logging
from typing import List, Dict, Tuple, Optional
import httpx

from app.models.route_models import Coordinate
from app.data.mock_chargers import ChargingStation
from app.services.charger_provider import BaseChargerProvider

logger = logging.getLogger(__name__)

class OCMChargerService(BaseChargerProvider):
    _instance = None
    _cache: Dict[Tuple[float, float], List[ChargingStation]] = {}

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(OCMChargerService, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def __init__(self):
        self.ocm_url = "https://api.openchargemap.io/v3/poi/"
        self.grid_size = 0.5  # 0.5 degrees grid cell cache size
        self.api_key = os.getenv("OPENCHARGEMAP_API_KEY", "").strip()
        if not hasattr(self, "fallback_triggered"):
            self.fallback_triggered = False

    def clear_cache(self):
        """Clears the internal cache. Useful for tests."""
        self._cache.clear()
        self.fallback_triggered = False

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

    def _query_ocm_for_cell(self, cell_lat: float, cell_lng: float) -> List[ChargingStation]:
        """
        Queries the Open Charge Map POI API for charging stations in a specific grid cell.
        """
        if not self.api_key:
            raise ValueError("OPENCHARGEMAP_API_KEY is not configured.")

        lat_min = cell_lat
        lng_min = cell_lng
        lat_max = cell_lat + self.grid_size
        lng_max = cell_lng + self.grid_size

        # OCM expects boundingbox in format: (lat1,lng1),(lat2,lng2)
        # where lat1,lng1 is top-left, and lat2,lng2 is bottom-right
        boundingbox = f"({lat_max},{lng_min}),({lat_min},{lng_max})"

        params = {
            "boundingbox": boundingbox,
            "output": "json",
            "maxresults": 200,
            "compact": "true",
            "verbose": "false"
        }

        # Restrict to India if within India coordinates range
        if 5.0 <= lat_min <= 40.0 and 65.0 <= lng_min <= 100.0:
            params["countrycode"] = "IN"

        headers = {
            "User-Agent": "EVRouteOptimizer/1.0",
            "Accept": "application/json",
            "X-API-Key": self.api_key
        }

        logger.info(f"Querying Open Charge Map for cell {cell_lat},{cell_lng} (Bbox: {boundingbox})")

        with httpx.Client(timeout=15.0) as client:
            response = client.get(self.ocm_url, params=params, headers=headers)
        
        if response.status_code != 200:
            raise httpx.HTTPStatusError(
                f"OCM API returned status {response.status_code}: {response.text}",
                request=response.request,
                response=response
            )

        data = response.json()
        if not isinstance(data, list):
            raise ValueError("OCM API response is not a valid JSON list.")

        chargers = []
        for item in data:
            ocm_id = item.get("ID")
            address_info = item.get("AddressInfo") or {}
            
            lat = address_info.get("Latitude")
            lng = address_info.get("Longitude")
            
            if lat is None or lng is None or ocm_id is None:
                continue

            # 1. Parse Name
            name = address_info.get("Title") or f"OCM Station {ocm_id}"

            # 2. Parse Address
            addr_parts = []
            for f in ["AddressLine1", "AddressLine2", "Town", "StateOrProvince", "Postcode"]:
                val = address_info.get(f)
                if val:
                    addr_parts.append(str(val).strip())
            address_str = ", ".join(addr_parts) if addr_parts else None

            # 3. Parse Operator
            operator_info = item.get("OperatorInfo") or {}
            operator = operator_info.get("Title")

            # 4. Parse Access
            usage_type = item.get("UsageType") or {}
            access = usage_type.get("Title")

            # 5. Parse Status
            status_type = item.get("StatusType") or {}
            is_operational = status_type.get("IsOperational")
            status_title = status_type.get("Title") or ""
            
            if is_operational is False or "broken" in status_title.lower() or "offline" in status_title.lower():
                status = "maintenance"
            else:
                status = "available"

            # 6. Parse Connections details (Total Ports, Charging Power, Sockets)
            connections = item.get("Connections") or []
            
            total_ports = 0
            powers = []
            conn_descs = []
            
            for conn in connections:
                qty = conn.get("Quantity")
                # Default quantity to 1 if not specified but connection exists
                qty_val = int(qty) if qty is not None else 1
                total_ports += qty_val
                
                power_kw = conn.get("PowerKW")
                if power_kw is not None:
                    try:
                        powers.append(float(power_kw))
                    except ValueError:
                        pass
                
                conn_type = conn.get("ConnectionType") or {}
                conn_title = conn_type.get("Title")
                
                voltage = conn.get("Voltage")
                amps = conn.get("Amps")
                current_type = conn.get("CurrentType") or {}
                current_title = current_type.get("Title")
                
                parts = []
                if conn_title:
                    parts.append(conn_title)
                if power_kw:
                    parts.append(f"{power_kw} kW")
                
                extra = []
                if voltage:
                    extra.append(f"{voltage}V")
                if amps:
                    extra.append(f"{amps}A")
                if current_title:
                    extra.append(current_title)
                    
                extra_str = ", ".join(extra)
                desc = ""
                if qty:
                    desc += f"{qty}x "
                desc += " - ".join(parts)
                if extra_str:
                    desc += f" ({extra_str})"
                if desc:
                    conn_descs.append(desc)

            connector_info = "; ".join(conn_descs) if conn_descs else None
            charging_power_kw = max(powers) if powers else None
            ports_count = total_ports if total_ports > 0 else None

            # Construct the ChargingStation Pydantic object
            # Missing values set to None (no fabrication)
            charger = ChargingStation(
                station_id=f"OCM-{ocm_id}",
                name=name,
                latitude=lat,
                longitude=lng,
                available_ports=None,  # No real-time occupancy in OCM
                total_ports=ports_count,
                charging_power_kw=charging_power_kw,
                price_per_kwh=None,  # No price information in standard POI API
                estimated_wait_minutes=None,  # No wait queue status in OCM
                status=status,
                operator=operator,
                connector_info=connector_info,
                access=access,
                opening_hours=None,  # Not reliably provided as standard POI field
                ocm_id=ocm_id,
                address=address_str,
                status_source="openchargemap"
            )
            chargers.append(charger)

        return chargers

    def get_chargers_in_bbox(self, min_lat: float, min_lng: float, max_lat: float, max_lng: float) -> List[ChargingStation]:
        """
        Retrieves all charging stations that fall inside the bounding box.
        Queries the grid cell cache, and calls Open Charge Map for uncached cells.
        If any OCM API error, timeout, or missing key occurs, falls back to OSM.
        """
        # If API key is missing, fall back to OSM immediately
        if not self.api_key:
            logger.warning("OPENCHARGEMAP_API_KEY is missing. Falling back to OSMChargerService.")
            self.fallback_triggered = True
            from app.services.osm_charger_service import OSMChargerService
            return OSMChargerService().get_chargers_in_bbox(min_lat, min_lng, max_lat, max_lng)

        try:
            grid_cells = self.get_grid_cells_for_bbox(min_lat, min_lng, max_lat, max_lng)
            all_chargers: Dict[str, ChargingStation] = {}

            for cell in grid_cells:
                if cell not in self._cache:
                    chargers = self._query_ocm_for_cell(cell[0], cell[1])
                    self._cache[cell] = chargers
                
                for charger in self._cache[cell]:
                    all_chargers[charger.station_id] = charger

            # Filter to return only chargers actually inside the requested bbox bounds
            bbox_chargers = []
            for charger in all_chargers.values():
                if min_lat <= charger.latitude <= max_lat and min_lng <= charger.longitude <= max_lng:
                    bbox_chargers.append(charger)

            return bbox_chargers

        except Exception as e:
            logger.error(f"Open Charge Map query failed: {e}. Falling back to OSMChargerService.")
            self.fallback_triggered = True
            from app.services.osm_charger_service import OSMChargerService
            return OSMChargerService().get_chargers_in_bbox(min_lat, min_lng, max_lat, max_lng)
