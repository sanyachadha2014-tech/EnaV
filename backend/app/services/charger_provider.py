import os
import logging
from abc import ABC, abstractmethod
from typing import List

from app.data.mock_chargers import ChargingStation

logger = logging.getLogger(__name__)

class BaseChargerProvider(ABC):
    @abstractmethod
    def get_chargers_in_bbox(
        self, 
        min_lat: float, 
        min_lng: float, 
        max_lat: float, 
        max_lng: float
    ) -> List[ChargingStation]:
        """
        Retrieves all charging stations that fall inside the bounding box.
        """
        pass

def get_charger_provider() -> BaseChargerProvider:
    """
    Factory to return the configured charging station provider.
    Defaults to 'ocm' but falls back to 'osm'.
    """
    provider_name = os.getenv("CHARGER_PROVIDER", "ocm").lower()
    
    if provider_name == "osm":
        from app.services.osm_charger_service import OSMChargerService
        logger.info("Initializing OSMChargerService as primary provider.")
        return OSMChargerService()
    elif provider_name in ("ocm", "openchargemap"):
        from app.services.ocm_charger_service import OCMChargerService
        logger.info("Initializing OCMChargerService as primary provider.")
        return OCMChargerService()
    else:
        from app.services.osm_charger_service import OSMChargerService
        logger.warning(f"Unknown CHARGER_PROVIDER '{provider_name}'. Defaulting to OSMChargerService.")
        return OSMChargerService()

def get_charger_provider_diagnostics() -> dict:
    """
    Returns diagnostic information about the configured charger provider.
    Bypasses real network pings in unit testing mode.
    """
    import os
    provider_name = os.getenv("CHARGER_PROVIDER", "ocm").lower()
    api_key = os.getenv("OPENCHARGEMAP_API_KEY", "").strip()
    
    configured_provider = provider_name
    ocm_configured = bool(api_key)
    ocm_reachable = False
    
    # In test mode, we do not perform actual network pings
    is_test = os.getenv("ROUTING_PROVIDER") == "mock" or os.getenv("CHARGER_PROVIDER") == "mock"
    
    if ocm_configured:
        if is_test:
            ocm_reachable = True
        else:
            try:
                import httpx
                headers = {"User-Agent": "EVRouteOptimizer/1.0", "X-API-Key": api_key}
                # Quick reachability check with minimal result payload
                response = httpx.get("https://api.openchargemap.io/v3/poi/?maxresults=1", headers=headers, timeout=2.0)
                if response.status_code == 200:
                    ocm_reachable = True
            except Exception:
                ocm_reachable = False
                
    fallback_active = False
    if provider_name == "ocm":
        if not ocm_configured or not ocm_reachable:
            fallback_active = True
        else:
            try:
                from app.services.ocm_charger_service import OCMChargerService
                ocm_service_instance = OCMChargerService()
                if getattr(ocm_service_instance, "fallback_triggered", False):
                    fallback_active = True
            except Exception:
                pass
        
    return {
        "configured_provider": configured_provider,
        "ocm_configured": ocm_configured,
        "ocm_reachable": ocm_reachable,
        "fallback_active": fallback_active
    }
