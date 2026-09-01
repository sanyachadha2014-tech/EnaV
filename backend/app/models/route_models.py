from typing import List, Optional
from pydantic import BaseModel, Field, field_validator

class Coordinate(BaseModel):
    lat: float = Field(..., description="Latitude of the coordinate")
    lng: float = Field(..., description="Longitude of the coordinate")

    @field_validator("lat")
    @classmethod
    def validate_lat(cls, v: float) -> float:
        if not -90.0 <= v <= 90.0:
            raise ValueError("Latitude must be between -90 and 90 degrees")
        return v

    @field_validator("lng")
    @classmethod
    def validate_lng(cls, v: float) -> float:
        if not -180.0 <= v <= 180.0:
            raise ValueError("Longitude must be between -180 and 180 degrees")
        return v

class VehicleInfo(BaseModel):
    vehicle_id: str = Field(..., description="Unique identifier for the vehicle")
    vehicle_type: str = Field(..., description="Type of vehicle (e.g., citizen, police, fire, ambulance)")
    battery_percentage: float = Field(..., description="Current battery state of charge (0-100)")
    battery_capacity_kwh: float = Field(..., description="Total battery capacity in kWh")
    consumption_kwh_per_km: float = Field(..., description="Base energy consumption rate in kWh/km")
    minimum_reserve_pct: float = Field(15.0, description="Minimum battery reserve percentage required (0-100)")
    is_emergency: bool = Field(False, description="Whether the vehicle is currently on an emergency mission")
    target_soc_pct: Optional[float] = Field(None, description="Target battery percentage to charge to (e.g., 80.0)")

    @field_validator("battery_percentage", "minimum_reserve_pct", "target_soc_pct")
    @classmethod
    def validate_percentage(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and not 0.0 <= v <= 100.0:
            raise ValueError("Percentage values must be between 0.0 and 100.0")
        return v

    @field_validator("battery_capacity_kwh", "consumption_kwh_per_km")
    @classmethod
    def validate_positive(cls, v: float) -> float:
        if v <= 0.0:
            raise ValueError("Battery capacity and consumption rate must be greater than zero")
        return v

class RouteInfo(BaseModel):
    route_id: str = Field(..., description="Unique identifier for the candidate route")
    name: str = Field(..., description="Human-readable name of the route")
    distance_km: float = Field(..., description="Distance of the route in kilometers")
    duration_seconds: float = Field(..., description="Estimated travel time in seconds without traffic penalties")
    traffic_level: str = Field("low", description="Traffic level: low, moderate, or heavy")
    geometry: List[Coordinate] = Field(default_factory=list, description="List of coordinates representing the route geometry")

    @field_validator("distance_km", "duration_seconds")
    @classmethod
    def validate_positive(cls, v: float) -> float:
        if v <= 0.0:
            raise ValueError("Distance and duration must be greater than zero")
        return v

    @field_validator("traffic_level")
    @classmethod
    def validate_traffic(cls, v: str) -> str:
        valid_levels = {"low", "moderate", "heavy"}
        if v.lower() not in valid_levels:
            raise ValueError(f"Traffic level must be one of {valid_levels}")
        return v.lower()

class RouteOptimizationRequest(BaseModel):
    source: Coordinate = Field(..., description="Starting coordinate")
    destination: Coordinate = Field(..., description="Destination coordinate")
    vehicle: VehicleInfo = Field(..., description="Vehicle specifications and current status")
    emergency: bool = Field(False, description="Whether the request is for emergency dispatch routing")

class EvaluatedRouteDetails(BaseModel):
    route_id: str
    name: str
    distance_km: float
    duration_seconds: float
    traffic_level: str
    energy_consumed_kwh: float
    arrival_battery_percentage: float
    is_feasible: bool
    score: Optional[float] = None
    reason: str
    geometry: List[Coordinate] = Field(default_factory=list)

class RecommendedChargerDetails(BaseModel):
    station_id: str = Field(..., description="ID of the recommended charging station")
    name: str = Field(..., description="Name of the charging station")
    waiting_minutes: Optional[float] = Field(None, description="Estimated waiting queue time in minutes")
    charging_minutes: Optional[float] = Field(None, description="Calculated active charging time in minutes")
    charging_cost: Optional[float] = Field(None, description="Calculated cost of charging")
    
    # Metadata fields
    ocm_id: Optional[int] = Field(None, description="OCM POI ID")
    address: Optional[str] = Field(None, description="OCM address")
    connector_info: Optional[str] = Field(None, description="Connector details")
    charging_power_kw: Optional[float] = Field(None, description="Charging speed in kW")
    operator: Optional[str] = Field(None, description="Operator name")

class RouteOptimizationResponse(BaseModel):
    recommended_route_id: Optional[str] = Field(None, description="The ID of the best feasible route, if any")
    distance_km: Optional[float] = Field(None, description="Distance of the recommended route")
    eta_minutes: Optional[float] = Field(None, description="Estimated time of arrival/journey duration in minutes for the recommended route")
    arrival_battery_percentage: Optional[float] = Field(None, description="Expected battery percentage on arrival")
    feasible: bool = Field(..., description="True if at least one route is battery feasible (either directly or with charging)")
    score: Optional[float] = Field(None, description="Score of the recommended route")
    reason: str = Field(..., description="Explanation for the selection (or rejection)")
    charging_required: bool = Field(False, description="True if a charging stop is recommended along the route")
    recommended_charger: Optional[RecommendedChargerDetails] = Field(None, description="Recommended charger details if charging is required")
    evaluated_routes: List[EvaluatedRouteDetails] = Field(..., description="Detailed list of all candidate routes evaluated")

class EmergencyIncident(BaseModel):
    incident_id: str = Field(..., description="Unique incident ID")
    incident_type: str = Field(..., description="Type of incident (e.g., accident, fire, crime)")
    severity: str = Field(..., description="Severity: low, medium, high, critical")
    location: Coordinate = Field(..., description="Location coordinate of the incident")
    required_vehicle_type: str = Field(..., description="Required emergency vehicle type (police, fire, ambulance)")

    @field_validator("required_vehicle_type")
    @classmethod
    def validate_vehicle_type(cls, v: str) -> str:
        valid_types = {"police", "fire", "ambulance"}
        if v.lower() not in valid_types:
            raise ValueError(f"Vehicle type must be one of {valid_types}")
        return v.lower()

    @field_validator("severity")
    @classmethod
    def validate_severity(cls, v: str) -> str:
        valid_severities = {"low", "medium", "high", "critical"}
        if v.lower() not in valid_severities:
            raise ValueError(f"Severity must be one of {valid_severities}")
        return v.lower()

class EmergencyVehicle(BaseModel):
    vehicle_id: str = Field(..., description="Unique vehicle ID")
    vehicle_type: str = Field(..., description="Vehicle type (police, fire, ambulance)")
    current_location: Coordinate = Field(..., description="Current coordinates of the vehicle")
    battery_percentage: float = Field(..., description="Current battery percentage (0-100)")
    battery_capacity_kwh: float = Field(..., description="Total battery capacity in kWh")
    consumption_kwh_per_km: float = Field(..., description="Energy consumption rate in kWh/km")
    minimum_reserve_pct: float = Field(20.0, description="Minimum emergency reserve percentage required (0-100)")
    availability_status: str = Field("available", description="Status: available, busy, offline")

    @field_validator("vehicle_type")
    @classmethod
    def validate_vehicle_type(cls, v: str) -> str:
        valid_types = {"police", "fire", "ambulance"}
        if v.lower() not in valid_types:
            raise ValueError(f"Vehicle type must be one of {valid_types}")
        return v.lower()

    @field_validator("battery_percentage", "minimum_reserve_pct")
    @classmethod
    def validate_percentage(cls, v: float) -> float:
        if not 0.0 <= v <= 100.0:
            raise ValueError("Percentage values must be between 0.0 and 100.0")
        return v

    @field_validator("availability_status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        valid_statuses = {"available", "busy", "offline"}
        if v.lower() not in valid_statuses:
            raise ValueError(f"Status must be one of {valid_statuses}")
        return v.lower()

class SelectedVehicleDetails(BaseModel):
    vehicle_id: str
    vehicle_type: str

class EmergencyRouteDetails(BaseModel):
    distance_km: float
    eta_minutes: float
    arrival_battery_percentage: float
    geometry: Optional[List[Coordinate]] = None
    source: Optional[Coordinate] = None
    destination: Optional[Coordinate] = None

class EvaluatedVehicleDetails(BaseModel):
    vehicle_id: str
    vehicle_type: str
    is_available: bool
    is_type_match: bool
    is_feasible: bool
    eta_minutes: Optional[float] = None
    arrival_battery_percentage: Optional[float] = None
    status: str
    reason: str

class EmergencyOptimizeRequest(BaseModel):
    incident: EmergencyIncident

class DistrictInfo(BaseModel):
    district_id: str = Field(..., description="ID of the administrative district")
    district_name: str = Field(..., description="Name of the administrative district")
    state_name: str = Field(..., description="Name of the state")

class GisLocateRequest(BaseModel):
    location: Coordinate = Field(..., description="The geographical coordinate to query")

class GisLocateResponse(BaseModel):
    district_id: str = Field(..., description="The ID of the containing district")
    district_name: str = Field(..., description="The name of the containing district")
    state_name: str = Field(..., description="The name of the containing state")
    inside_boundary: bool = Field(..., description="True if coordinates fall inside any defined district")

class EmergencyOptimizeResponse(BaseModel):
    incident_id: str
    district: Optional[DistrictInfo] = Field(None, description="The identified administrative district for the incident")
    selected_vehicle: Optional[SelectedVehicleDetails] = Field(None, description="Selected dispatch vehicle details")
    route: Optional[EmergencyRouteDetails] = Field(None, description="Dispatch route summary")
    reason: str
    evaluated_vehicles: List[EvaluatedVehicleDetails]

class EmergencyDispatchEvent(BaseModel):
    incident_id: str = Field(..., description="Unique incident ID from 112")
    incident_type: str = Field(..., description="Type of incident (e.g., accident, fire, crime)")
    severity: str = Field(..., description="Severity: low, medium, high, critical")
    location: Coordinate = Field(..., description="Location coordinate of the incident")
    required_vehicle_type: str = Field(..., description="Required emergency vehicle type (police, fire, ambulance)")
    reported_at: Optional[str] = Field(None, description="ISO timestamp from 112 system")

    @field_validator("required_vehicle_type")
    @classmethod
    def validate_vehicle_type(cls, v: str) -> str:
        valid_types = {"police", "fire", "ambulance"}
        if v.lower() not in valid_types:
            raise ValueError(f"Vehicle type must be one of {valid_types}")
        return v.lower()

    @field_validator("severity")
    @classmethod
    def validate_severity(cls, v: str) -> str:
        valid_severities = {"low", "medium", "high", "critical"}
        if v.lower() not in valid_severities:
            raise ValueError(f"Severity must be one of {valid_severities}")
        return v.lower()

class EmergencyDispatchResponse(BaseModel):
    incident_id: str
    dispatch_status: str  # "recommended" or "no_feasible_vehicle"
    district: Optional[DistrictInfo] = None
    selected_vehicle: Optional[SelectedVehicleDetails] = None
    route: Optional[EmergencyRouteDetails] = None
    reason: str
