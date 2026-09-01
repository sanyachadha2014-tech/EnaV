from typing import List, Optional
from pydantic import BaseModel, Field
from app.models.route_models import Coordinate

class ChargingStation(BaseModel):
    station_id: str = Field(..., description="Unique charger ID")
    name: str = Field(..., description="Name of the charging station")
    latitude: float = Field(..., description="Latitude of the charger")
    longitude: float = Field(..., description="Longitude of the charger")
    available_ports: Optional[int] = Field(None, description="Number of currently free ports")
    total_ports: Optional[int] = Field(None, description="Total ports installed")
    charging_power_kw: Optional[float] = Field(None, description="Charger output rate in kW")
    price_per_kwh: Optional[float] = Field(None, description="Electricity price per kWh")
    estimated_wait_minutes: Optional[float] = Field(None, description="Wait queue time in minutes")
    status: str = Field("available", description="Status: available, full, maintenance")
    
    # OSM fields
    operator: Optional[str] = Field(None, description="OSM operator/brand")
    connector_info: Optional[str] = Field(None, description="OSM connector/socket information")
    access: Optional[str] = Field(None, description="OSM access restrictions")
    opening_hours: Optional[str] = Field(None, description="OSM opening hours")
    osm_id: Optional[int] = Field(None, description="OSM element ID")
    
    # OCM fields
    ocm_id: Optional[int] = Field(None, description="OCM POI ID")
    address: Optional[str] = Field(None, description="OCM address info")
    status_source: Optional[str] = Field(None, description="Source of the status information (e.g. openchargemap)")

MOCK_CHARGING_STATIONS: List[ChargingStation] = [
    ChargingStation(
        station_id="CS001",
        name="Delhi CP EV Hub (Fast)",
        latitude=28.6180,
        longitude=77.2150,
        available_ports=2,
        total_ports=6,
        charging_power_kw=60.0,
        price_per_kwh=12.0,
        estimated_wait_minutes=5.0,
        status="available"
    ),
    ChargingStation(
        station_id="CS002",
        name="India Gate Supercharger",
        latitude=28.6110,
        longitude=77.2250,
        available_ports=0,  # Full! Will require waiting queue penalty
        total_ports=4,
        charging_power_kw=120.0,  # Very high power
        price_per_kwh=18.0,
        estimated_wait_minutes=25.0,
        status="available"
    ),
    ChargingStation(
        station_id="CS003",
        name="Rajpath Metro EV Station",
        latitude=28.6050,
        longitude=77.2180,
        available_ports=4,
        total_ports=8,
        charging_power_kw=50.0,
        price_per_kwh=10.0,
        estimated_wait_minutes=2.0,
        status="available"
    ),
    ChargingStation(
        station_id="CS004",
        name="Barakhamba Road EV Charger (Offline)",
        latitude=28.6150,
        longitude=77.2200,
        available_ports=0,
        total_ports=2,
        charging_power_kw=22.0,
        price_per_kwh=8.0,
        estimated_wait_minutes=0.0,
        status="maintenance"  # Under maintenance, must be rejected
    )
]

def get_mock_chargers() -> List[ChargingStation]:
    """
    Returns a copy of mock charging stations.
    """
    return [cs.model_copy(deep=True) for cs in MOCK_CHARGING_STATIONS]
