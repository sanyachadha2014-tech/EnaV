import os

import httpx
from fastapi import APIRouter, HTTPException

router = APIRouter(
    prefix="/infra-planner",
    tags=["Infrastructure Planner"],
)

OCM_API_URL = "https://api.openchargemap.io/v3/poi/"


@router.get("/stations")
async def get_stations():
    api_key = os.getenv("OPENCHARGEMAP_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="OPENCHARGEMAP_API_KEY is not configured",
        )

    params = {
        "output": "json",
        "countrycode": "IN",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "distance": 40,
        "distanceunit": "KM",
        "maxresults": 1000,
        "compact": "false",
        "verbose": "false",
        "key": api_key,
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.get(
                OCM_API_URL,
                params=params,
            )

        response.raise_for_status()
        ocm_stations = response.json()

    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Open Charge Map request failed: {exc}",
        )

    stations = []

    for station in ocm_stations:
        address = station.get("AddressInfo") or {}

        latitude = address.get("Latitude")
        longitude = address.get("Longitude")

        if latitude is None or longitude is None:
            continue

        connections = station.get("Connections") or []

        connector_types = []
        total_connectors = 0

        for connection in connections:
            connection_type = connection.get("ConnectionType") or {}
            title = connection_type.get("Title")

            if title and title not in connector_types:
                connector_types.append(title)

            number_of_points = connection.get("Quantity")

            if isinstance(number_of_points, int):
                total_connectors += number_of_points

        # OCM station status is not connector-level health.
        # Therefore we do NOT fabricate healthy/defected counts.
        status_type = station.get("StatusType") or {}

        stations.append(
            {
                "id": f"OCM-{station.get('ID')}",
                "ocm_id": station.get("ID"),
                "name": address.get("Title") or "Unnamed Charging Station",
                "location": ", ".join(
                    value
                    for value in [
                        address.get("AddressLine1"),
                        address.get("Town"),
                        address.get("StateOrProvince"),
                    ]
                    if value
                ),
                "latitude": latitude,
                "longitude": longitude,
                "connector_types": connector_types,
                "total_connectors": total_connectors,
                "healthy_connectors": None,
                "defected_connectors": None,
                "status": status_type.get("Title"),
                "operator": (station.get("OperatorInfo") or {}).get("Title"),
                "source": "Open Charge Map",
            }
        )

    return {
        "source": "Open Charge Map",
        "data_status": "OCM DATA",
        "count": len(stations),
        "stations": stations,
    }
