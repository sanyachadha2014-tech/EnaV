import logging
import random
import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.models.route_models import Coordinate, EmergencyIncident
from app.services.emergency_router import optimize_emergency_dispatch
from app.services.routing_provider import BaseRoutingProvider, get_routing_provider
from app.services.vehicle_repository import BaseEmergencyVehicleRepository, get_vehicle_repository
from app.services.gemini_service import analyze_emergency_description
from app.services.reverse_geocoder import reverse_geocode
from app.services.swytchcode_service import get_swytchcode_service

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/emergency",
    tags=["Emergency Response"]
)

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class EmergencyAnalyzeRequest(BaseModel):
    incident_type: str = Field(..., description="Selected category: fire, police, or medical")
    raw_description: str = Field(..., description="Raw text description from user/reporter")
    latitude: Optional[float] = Field(None, description="Optional latitude for reverse geocoding")
    longitude: Optional[float] = Field(None, description="Optional longitude for reverse geocoding")

class EmergencyAnalyzeResponse(BaseModel):
    incident_type: str
    summary: str
    keywords: List[str]
    address: Optional[str] = None
    swytchcode_intelligence: Optional[Dict[str, Any]] = None

class EmergencyReportCreate(BaseModel):
    incident_id: Optional[str] = Field(None, description="Optional incident ID (generated if not provided)")
    incident_type: str = Field(..., description="Category: fire, police, medical")
    description: str = Field(..., description="Raw or dictated description")
    summary: Optional[str] = Field(None, description="AI summary generated in review step")
    keywords: Optional[List[str]] = Field(None, description="Keywords extracted in review step")
    address: Optional[str] = Field(None, description="Optional pre-resolved human readable address")
    latitude: float = Field(..., description="Latitude from browser GPS")
    longitude: float = Field(..., description="Longitude from browser GPS")

class EmergencyReportResponse(BaseModel):
    incident_id: str
    incident_type: str
    address: str
    district: str
    district_code: str
    selected_vehicle: Optional[str] = None
    vehicle_type: Optional[str] = None
    eta_minutes: Optional[float] = None
    distance_km: Optional[float] = None
    status: str
    summary: Optional[str] = None
    keywords: Optional[List[str]] = None
    latitude: float
    longitude: float
    created_at: str
    reason: Optional[str] = None

class EmergencyAlertItem(BaseModel):
    incident_id: str
    incident_type: str
    summary: str
    keywords: List[str]
    address: str
    district: str
    latitude: float
    longitude: float
    status: str
    selected_vehicle: Optional[str] = None
    vehicle_type: Optional[str] = None
    eta_minutes: Optional[float] = None
    distance_km: Optional[float] = None
    route_geometry: Optional[List[List[float]]] = None
    assigned_vehicle_location: Optional[Dict[str, float]] = None
    created_at: str

class EmergencyDispatchAssignRequest(BaseModel):
    incident_id: str
    vehicle_id: str
    vehicle_type: Optional[str] = None
    eta_minutes: Optional[float] = None
    distance_km: Optional[float] = None

class EmergencyDispatchAssignResponse(BaseModel):
    success: bool
    incident_id: str
    status: str
    selected_vehicle: str
    vehicle_type: str
    eta_minutes: float
    distance_km: float
    assigned_vehicle_location: Dict[str, float]
    route_geometry: List[List[float]]
    message: str

# ---------------------------------------------------------------------------
# In-Memory Active Alerts Store (Demo Session Ledger)
# ---------------------------------------------------------------------------
EMERGENCY_ALERTS_LEDGER: List[Dict[str, Any]] = [
    {
        "incident_id": "INC-112-4590",
        "incident_type": "medical",
        "summary": "Two-vehicle collision with passenger injury at Janakpuri District Centre.",
        "keywords": ["collision", "injury", "janakpuri", "medical"],
        "address": "Janakpuri District Centre, West Delhi",
        "district": "West Delhi",
        "latitude": 28.6290,
        "longitude": 77.0780,
        "status": "PENDING_RESOURCES",
        "selected_vehicle": None,
        "vehicle_type": None,
        "eta_minutes": None,
        "distance_km": None,
        "route_geometry": None,
        "assigned_vehicle_location": None,
        "created_at": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=5)).isoformat()
    },
    {
        "incident_id": "INC-112-9842",
        "incident_type": "fire",
        "summary": "Electrical transformer flare-up reported near Outer Ring Road.",
        "keywords": ["transformer", "flare-up", "ring road", "hazard"],
        "address": "Outer Ring Road, Janakpuri, West Delhi",
        "district": "West Delhi",
        "latitude": 28.6328,
        "longitude": 77.0854,
        "status": "DISPATCHED",
        "selected_vehicle": "FIRE-001",
        "vehicle_type": "Electric Fire Engine",
        "eta_minutes": 6.8,
        "distance_km": 3.2,
        "assigned_vehicle_location": {"lat": 28.6250, "lng": 77.2150},
        "route_geometry": None,
        "created_at": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=14)).isoformat()
    },
    {
        "incident_id": "INC-112-9811",
        "incident_type": "medical",
        "summary": "Pedestrian heat exhaustion near transit junction.",
        "keywords": ["exhaustion", "transit junction", "pedestrian"],
        "address": "Connaught Place Central, New Delhi",
        "district": "New Delhi",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "status": "DISPATCHED",
        "selected_vehicle": "AMB-001",
        "vehicle_type": "Advanced Life Support",
        "eta_minutes": 4.5,
        "distance_km": 2.1,
        "assigned_vehicle_location": {"lat": 28.6120, "lng": 77.2150},
        "route_geometry": None,
        "created_at": (datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(minutes=32)).isoformat()
    }
]

# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post(
    "/analyze",
    response_model=EmergencyAnalyzeResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze Raw Emergency Description using Backend Gemini AI"
)
async def analyze_emergency(request: EmergencyAnalyzeRequest):
    """
    Accepts raw description and selected category. Invokes backend-only Gemini processing
    to return a 1-2 line factual summary, keywords, and reverse geocoded address without hallucination.
    """
    try:
        summary, keywords = await analyze_emergency_description(
            raw_text=request.raw_description,
            emergency_category=request.incident_type
        )
        address = None
        if request.latitude is not None and request.longitude is not None:
            address = await reverse_geocode(request.latitude, request.longitude)

        # Real Swytchcode Mistral AI Emergency Analysis
        swytchcode_svc = get_swytchcode_service()
        swytchcode_intel = swytchcode_svc.classify_incident_mistral(
            incident_type=request.incident_type,
            description=request.raw_description
        )

        return EmergencyAnalyzeResponse(
            incident_type=request.incident_type,
            summary=summary,
            keywords=keywords,
            address=address,
            swytchcode_intelligence=swytchcode_intel
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Emergency analysis error: {str(exc)}"
        )

@router.post(
    "/report",
    response_model=EmergencyReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest Confirmed Emergency Report & Run Dispatch Optimization"
)
async def submit_emergency_report(
    report: EmergencyReportCreate,
    provider: BaseRoutingProvider = Depends(get_routing_provider),
    vehicle_repository: BaseEmergencyVehicleRepository = Depends(get_vehicle_repository)
):
    """
    Ingests confirmed emergency report, converts coordinates to human-readable address,
    maps category to required vehicle type, executes optimize_emergency_dispatch,
    logs the alert for the Government Dashboard, and returns the live response.
    """
    try:
        incident_id = report.incident_id or f"INC-112-{random.randint(1000, 9999)}"
        category_clean = report.incident_type.lower().strip()

        # Map user category strictly to valid required_vehicle_type
        if "fire" in category_clean:
            req_type = "fire"
        elif "police" in category_clean:
            req_type = "police"
        else:
            req_type = "ambulance"

        # If summary was not pre-generated, generate it now
        summary = report.summary
        keywords = report.keywords or []
        if not summary:
            summary, auto_kw = await analyze_emergency_description(report.description, req_type)
            if not keywords:
                keywords = auto_kw

        # Prepare incident for the existing optimize_emergency_dispatch engine
        incident = EmergencyIncident(
            incident_id=incident_id,
            incident_type=req_type,
            severity="high",
            location=Coordinate(lat=report.latitude, lng=report.longitude),
            required_vehicle_type=req_type
        )

        # Call existing emergency dispatch optimization engine
        opt_res = optimize_emergency_dispatch(incident, provider, vehicle_repository)

        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        district_name = opt_res.district.district_name if opt_res.district else "Delhi NCR"
        district_code = opt_res.district.district_id if opt_res.district else "DEL"

        # Reverse geocode to get a verified, human-readable address
        address = (report.address or "").strip()
        if not address:
            address = await reverse_geocode(
                latitude=report.latitude,
                longitude=report.longitude,
                fallback_district=district_name
            )

        selected_veh_id = opt_res.selected_vehicle.vehicle_id if opt_res.selected_vehicle else None
        selected_veh_type = opt_res.selected_vehicle.vehicle_type if opt_res.selected_vehicle else None
        eta_min = opt_res.route.eta_minutes if opt_res.route else None
        dist_km = opt_res.route.distance_km if opt_res.route else None
        dispatch_status = "PENDING_RESOURCES"

        veh_location = None
        route_points = None
        if selected_veh_id and opt_res.route:
            veh_location = {"lat": opt_res.route.source.lat, "lng": opt_res.route.source.lng}
            route_points = [[c.lat, c.lng] for c in opt_res.route.geometry]

        # Record in Government Alerts Ledger as PENDING_RESOURCES for operator dispatch
        alert_entry = {
            "incident_id": incident_id,
            "incident_type": req_type,
            "summary": summary,
            "keywords": keywords,
            "address": address,
            "district": district_name,
            "latitude": report.latitude,
            "longitude": report.longitude,
            "status": "PENDING_RESOURCES",
            "selected_vehicle": None,
            "vehicle_type": None,
            "eta_minutes": None,
            "distance_km": None,
            "assigned_vehicle_location": None,
            "route_geometry": None,
            "created_at": now_iso
        }
        EMERGENCY_ALERTS_LEDGER.insert(0, alert_entry)

        return EmergencyReportResponse(
            incident_id=incident_id,
            incident_type=req_type,
            address=address,
            district=district_name,
            district_code=district_code,
            selected_vehicle=selected_veh_id,
            vehicle_type=selected_veh_type,
            eta_minutes=eta_min,
            distance_km=dist_km,
            status=dispatch_status,
            summary=summary,
            keywords=keywords,
            latitude=report.latitude,
            longitude=report.longitude,
            created_at=now_iso,
            reason=opt_res.reason
        )

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process emergency report: {str(exc)}"
        )

@router.post(
    "/dispatch",
    response_model=EmergencyDispatchAssignResponse,
    status_code=status.HTTP_200_OK,
    summary="Assign and Dispatch Emergency Vehicle to Incident"
)
async def assign_emergency_dispatch(
    request: EmergencyDispatchAssignRequest,
    provider: BaseRoutingProvider = Depends(get_routing_provider),
    vehicle_repository: BaseEmergencyVehicleRepository = Depends(get_vehicle_repository)
):
    """
    Executes actual EV dispatch assignment. Updates the incident status from PENDING_RESOURCES
    to DISPATCHED, calculates the real emergency route and ETA using the vehicle's real database
    coordinates and OSRM, updates the assigned vehicle status to busy/en route, and persists
    this state across the ledger.
    """
    try:
        # 1. Locate the incident in the ledger
        incident_entry = None
        for alert in EMERGENCY_ALERTS_LEDGER:
            if alert.get("incident_id") == request.incident_id:
                incident_entry = alert
                break

        if not incident_entry:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Incident '{request.incident_id}' not found in active alerts ledger."
            )

        inc_lat = incident_entry.get("latitude")
        inc_lng = incident_entry.get("longitude")
        if inc_lat is None or inc_lng is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Incident '{request.incident_id}' is missing valid GPS coordinates."
            )

        # 2. Retrieve the real vehicle from the vehicle repository
        dispatched_vehicle = vehicle_repository.get_vehicle_by_id(request.vehicle_id)
        if not dispatched_vehicle:
            for v in vehicle_repository.get_all_vehicles():
                if v.vehicle_id.upper() == request.vehicle_id.upper():
                    dispatched_vehicle = v
                    break

        if not dispatched_vehicle:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Vehicle '{request.vehicle_id}' not found in active fleet registry."
            )

        # Real vehicle source coordinates from vehicle telemetry / database
        veh_lat = dispatched_vehicle.current_location.lat
        veh_lng = dispatched_vehicle.current_location.lng
        veh_location = {"lat": veh_lat, "lng": veh_lng}

        v_type_clean = (dispatched_vehicle.vehicle_type or "").lower()
        if "fire" in v_type_clean:
            veh_type = "Electric Fire Engine"
        elif "police" in v_type_clean:
            veh_type = "Police Interceptor"
        else:
            veh_type = "Advanced Life Support"

        # 3. Calculate real OSRM road route geometry, distance, and ETA
        source_coord = Coordinate(lat=veh_lat, lng=veh_lng)
        dest_coord = Coordinate(lat=inc_lat, lng=inc_lng)
        
        candidate_routes = provider.get_candidate_routes(source_coord, dest_coord)
        if not candidate_routes:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Unable to calculate OSRM road route between vehicle '{request.vehicle_id}' and incident location."
            )

        best_route = candidate_routes[0]
        geom = getattr(best_route, "geometry", None)
        if not geom or len(geom) < 2:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"OSRM returned insufficient road geometry points."
            )

        route_points = [[c.lat, c.lng] for c in geom]
        distance_km = round(best_route.distance_km, 2)
        eta_minutes = round(best_route.duration_seconds / 60.0, 1)

        # 4. Update the vehicle status in the vehicle repository
        dispatched_vehicle.availability_status = "busy"
        try:
            vehicle_repository.upsert_vehicle(dispatched_vehicle)
        except Exception as exc:
            logger.warning(f"Could not update vehicle availability in repository: {exc}")

        # 5. Update the incident status in the single source of truth ledger
        incident_entry["status"] = "DISPATCHED"
        incident_entry["selected_vehicle"] = dispatched_vehicle.vehicle_id
        incident_entry["vehicle_type"] = veh_type
        incident_entry["eta_minutes"] = eta_minutes
        incident_entry["distance_km"] = distance_km
        incident_entry["assigned_vehicle_location"] = veh_location
        incident_entry["route_geometry"] = route_points

        return EmergencyDispatchAssignResponse(
            success=True,
            incident_id=incident_entry["incident_id"],
            status="DISPATCHED",
            selected_vehicle=dispatched_vehicle.vehicle_id,
            vehicle_type=veh_type,
            eta_minutes=eta_minutes,
            distance_km=distance_km,
            assigned_vehicle_location=veh_location,
            route_geometry=route_points,
            message=f"Unit {dispatched_vehicle.vehicle_id} successfully dispatched to incident {incident_entry['incident_id']}."
        )

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign emergency dispatch: {str(exc)}"
        )

@router.get(
    "/vehicles",
    summary="Get Emergency Vehicle Fleet Status"
)
async def get_emergency_vehicles(
    repository: BaseEmergencyVehicleRepository = Depends(get_vehicle_repository)
):
    """
    Returns the real-time emergency vehicle fleet statuses from the vehicle repository
    for the Government Dashboard.
    """
    try:
        vehicles = repository.get_all_vehicles()
    except Exception as exc:
        logger.warning(f"Error fetching vehicles from repository: {exc}")
        from app.data.mock_vehicles import get_mock_vehicles
        vehicles = get_mock_vehicles()

    fleet = []
    for v in vehicles:
        type_clean = (v.vehicle_type or "").lower()
        if "fire" in type_clean:
            type_label = "Electric Fire Engine"
        elif "police" in type_clean:
            type_label = "Police Interceptor"
        else:
            type_label = "Advanced Life Support"

        status_label = "AVAILABLE" if v.availability_status == "available" else v.availability_status.upper().replace("_", " ")

        fleet.append({
            "id": v.vehicle_id,
            "type": type_label,
            "vehicle_type": v.vehicle_type,
            "distance": "Monitored",
            "battery": int(round(v.battery_percentage)),
            "latitude": v.current_location.lat,
            "longitude": v.current_location.lng,
            "eta": "Ready" if status_label == "AVAILABLE" else "En Route",
            "traffic": "Normal",
            "recommended": status_label == "AVAILABLE" and v.battery_percentage >= v.minimum_reserve_pct,
            "status": status_label,
        })
    return fleet

@router.get(
    "/alerts",
    response_model=List[EmergencyAlertItem],
    status_code=status.HTTP_200_OK,
    summary="Get Active Emergency Alerts for Government Command Center"
)
async def get_emergency_alerts():
    """
    Returns active emergency reports for the Government Dashboard in reverse chronological order.
    Both Command Center View Alerts and Emergency Live Alerts consume this exact same list.
    """
    return EMERGENCY_ALERTS_LEDGER
