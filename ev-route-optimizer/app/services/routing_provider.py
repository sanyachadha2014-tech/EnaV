import os
import logging
from abc import ABC, abstractmethod
from typing import List, Dict, Any
import httpx

from app.models.route_models import RouteInfo, Coordinate
from app.data.mock_routes import get_mock_routes

logger = logging.getLogger(__name__)

class RoutingAPIError(Exception):
    """Custom exception raised when an external routing API fails or is unreachable."""
    pass

class BaseRoutingProvider(ABC):
    @abstractmethod
    def get_candidate_routes(
        self,
        source: Coordinate,
        destination: Coordinate
    ) -> List[RouteInfo]:
        """
        Fetches candidate routes between the source and destination.
        """
        pass

class MockRoutingProvider(BaseRoutingProvider):
    """
    Returns pre-defined mock candidate routes. Good for offline testing and development.
    """
    def get_candidate_routes(
        self,
        source: Coordinate,
        destination: Coordinate
    ) -> List[RouteInfo]:
        logger.info("Using MockRoutingProvider to fetch candidate routes.")
        return get_mock_routes()

class BaseOSRMStyleProvider(BaseRoutingProvider):
    """
    Base class containing common OSRM-style JSON parsing logic used by OSRM and Mapbox.
    """
    def __init__(self, base_url: str, params: Dict[str, Any] = None):
        self.base_url = base_url
        self.params = params or {}

    def _parse_routes(self, data: Dict[str, Any], provider_name: str) -> List[RouteInfo]:
        routes = data.get("routes", [])
        if not routes:
            raise RoutingAPIError(f"No routes returned by {provider_name} API.")

        candidate_routes = []
        traffic_levels = ["low", "moderate", "heavy"]

        for idx, route_data in enumerate(routes):
            distance_m = route_data.get("distance", 0.0)
            duration_s = route_data.get("duration", 0.0)
            
            # OSRM distance is in meters, convert to km
            distance_km = round(distance_m / 1000.0, 2)
            
            # Parse geometry coordinates (GeoJSON LineString)
            geometry_data = route_data.get("geometry", {})
            coords = []
            if geometry_data.get("type") == "LineString":
                # GeoJSON is [longitude, latitude]
                for pt in geometry_data.get("coordinates", []):
                    if len(pt) >= 2:
                        coords.append(Coordinate(lat=pt[1], lng=pt[0]))
            
            # Determine traffic level
            traffic_level = "low"
            if provider_name == "Mapbox":
                # Mapbox returns 'duration' (with traffic) and 'duration_typical' (typical base time)
                duration_typical = route_data.get("duration_typical", duration_s)
                if duration_typical > 0:
                    traffic_ratio = duration_s / duration_typical
                    if traffic_ratio > 1.35:
                        traffic_level = "heavy"
                    elif traffic_ratio > 1.10:
                        traffic_level = "moderate"
            else:
                # OSRM fallback: cycle traffic levels to make testing diverse and interesting
                traffic_level = traffic_levels[idx % len(traffic_levels)]

            route_name = f"{provider_name} Alternative {idx + 1}"
            if idx == 0:
                route_name = f"{provider_name} Primary Route"

            candidate_routes.append(
                RouteInfo(
                    route_id=f"{provider_name.upper()}-{idx + 1}",
                    name=route_name,
                    distance_km=distance_km,
                    duration_seconds=duration_s,
                    traffic_level=traffic_level,
                    geometry=coords
                )
            )
        
        return candidate_routes

class OSRMQueryRoutingProvider(BaseOSRMStyleProvider):
    """
    Queries the OSRM API. Requires no API keys.
    """
    def __init__(self):
        base_url = os.getenv("OSRM_BASE_URL", "http://router.project-osrm.org/route/v1/driving").strip()
        super().__init__(
            base_url=base_url,
            params={"alternatives": "true", "geometries": "geojson", "overview": "full"}
        )

    def get_candidate_routes(
        self,
        source: Coordinate,
        destination: Coordinate
    ) -> List[RouteInfo]:
        url = f"{self.base_url}/{source.lng},{source.lat};{destination.lng},{destination.lat}"
        logger.info(f"OSRM Query URL: {url}")
        
        try:
            with httpx.Client(timeout=10.0) as client:
                response = client.get(url, params=self.params)
                
            if response.status_code != 200:
                raise RoutingAPIError(
                    f"OSRM API returned status code {response.status_code}: {response.text}"
                )
                
            data = response.json()
            if data.get("code") != "Ok":
                raise RoutingAPIError(f"OSRM Routing failed with code: {data.get('code')}")
                
            return self._parse_routes(data, "OSRM")
            
        except httpx.RequestError as exc:
            logger.error(f"OSRM connection failed: {exc}")
            raise RoutingAPIError(f"Failed to connect to public OSRM API: {str(exc)}")

class MapboxRoutingProvider(BaseOSRMStyleProvider):
    """
    Queries the Mapbox Directions API (traffic-aware driving). Requires an access token.
    """
    def __init__(self, access_token: str):
        super().__init__(
            base_url="https://api.mapbox.com/directions/v5/mapbox/driving-traffic",
            params={
                "alternatives": "true",
                "geometries": "geojson",
                "overview": "full",
                "annotations": "duration,distance,speed",
                "access_token": access_token
            }
        )

    def get_candidate_routes(
        self,
        source: Coordinate,
        destination: Coordinate
    ) -> List[RouteInfo]:
        url = f"{self.base_url}/{source.lng},{source.lat};{destination.lng},{destination.lat}"
        logger.info(f"Mapbox Query URL (excluding token): {self.base_url}/{source.lng},{source.lat};{destination.lng},{destination.lat}")
        
        try:
            with httpx.Client(timeout=10.0) as client:
                response = client.get(url, params=self.params)
                
            if response.status_code != 200:
                raise RoutingAPIError(
                    f"Mapbox API returned status code {response.status_code}: {response.text}"
                )
                
            data = response.json()
            if data.get("code") != "Ok":
                raise RoutingAPIError(f"Mapbox Routing failed with code: {data.get('code')}")
                
            return self._parse_routes(data, "Mapbox")
            
        except httpx.RequestError as exc:
            logger.error(f"Mapbox connection failed: {exc}")
            raise RoutingAPIError(f"Failed to connect to Mapbox Directions API: {str(exc)}")

def get_routing_provider() -> BaseRoutingProvider:
    """
    Factory function instantiating the configured routing provider.
    Falls back to OSRM if Mapbox is selected but the token is missing.
    """
    provider_name = os.getenv("ROUTING_PROVIDER", "osrm").lower()
    
    if provider_name == "mapbox":
        token = os.getenv("MAPBOX_ACCESS_TOKEN", "").strip()
        if not token:
            logger.warning("Mapbox routing selected but MAPBOX_ACCESS_TOKEN is empty. Falling back to OSRM.")
            return OSRMQueryRoutingProvider()
        return MapboxRoutingProvider(access_token=token)
        
    elif provider_name == "osrm":
        return OSRMQueryRoutingProvider()
        
    return MockRoutingProvider()
