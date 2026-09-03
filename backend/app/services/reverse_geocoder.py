import logging
from typing import Optional, Dict, Any
import httpx

logger = logging.getLogger(__name__)

NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse"

async def reverse_geocode(
    latitude: float,
    longitude: float,
    fallback_district: Optional[str] = None
) -> str:
    """
    Converts latitude and longitude into a concise, human-readable address
    using OpenStreetMap Nominatim. Falls back to verified GIS district or Delhi NCR
    if the service is unreachable or does not return a precise address.
    Strict accuracy rule: Does NOT fabricate fake building or society names.
    """
    params = {
        "format": "jsonv2",
        "lat": str(latitude),
        "lon": str(longitude),
        "zoom": "18",
        "addressdetails": "1"
    }
    headers = {
        "User-Agent": "EnaV-Emergency-Response-Platform/1.0 (urban-mobility-intelligence)"
    }

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            res = await client.get(NOMINATIM_REVERSE_URL, params=params, headers=headers)
            if res.status_code == 200:
                data = res.json()
                addr = data.get("address", {})

                # Extract most specific to broader components
                specific = (
                    addr.get("road")
                    or addr.get("pedestrian")
                    or addr.get("neighbourhood")
                    or addr.get("residential")
                    or addr.get("suburb")
                )
                locality = (
                    addr.get("suburb")
                    or addr.get("city_district")
                    or addr.get("county")
                )
                city = addr.get("city") or addr.get("town") or addr.get("state_district") or "Delhi"

                # Combine without duplication
                parts = []
                if specific:
                    parts.append(specific)
                if locality and locality != specific:
                    parts.append(locality)
                if city and city not in parts:
                    parts.append(city)

                if parts:
                    clean_address = ", ".join(parts)
                    logger.info(f"Reverse geocoded ({latitude}, {longitude}) -> '{clean_address}'")
                    return clean_address

                # Fallback to display_name snippet
                display_name = data.get("display_name", "")
                if display_name:
                    snippet = ", ".join(display_name.split(", ")[:3])
                    return snippet

    except Exception as exc:
        logger.warning(f"Reverse geocode lookup failed for ({latitude}, {longitude}): {exc}")

    # Fallback to verified GIS district name if available
    if fallback_district and fallback_district != "Outside Configured Boundaries":
        return f"{fallback_district}, Delhi NCR"

    return f"Near Coordinate ({latitude:.4f}, {longitude:.4f}), Delhi NCR"
