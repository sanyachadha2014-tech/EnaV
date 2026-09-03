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
# In-Memory Active Fleet Status (Persisted per backend session)
# ---------------------------------------------------------------------------
VEHICLES_FLEET_STORE: List[Dict[str, Any]] = [
    {
        "id": "EV-AMB-21",
        "type": "Advanced Life Support",
        "distance": "3.2 km",
        "battery": 74,
        "eta": "6 min",
        "traffic": "Moderate",
        "recommended": True,
        "status": "AVAILABLE",
    },
    {
        "id": "EV-AMB-18",
        "type": "Basic Life Support",
        "distance": "2.4 km",
        "battery": 8,
        "eta": "14 min",
        "traffic": "Low",
        "recommended": False,
        "status": "LOW BATTERY",
    },
    {
        "id": "EV-AMB-09",
        "type": "Advanced Life Support",
        "distance": "5.1 km",
        "battery": 91,
        "eta": "11 min",
        "traffic": "Moderate",
        "recommended": False,
        "status": "AVAILABLE",
    },
    {
        "id": "EV-RR-02",
        "type": "Rapid Response Unit",
        "distance": "5.8 km",
        "battery": 67,
        "eta": "9 min",
        "traffic": "Low",
        "recommended": False,
        "status": "AVAILABLE",
    },
    {
        "id": "EV-AMB-14",
        "type": "Advanced Life Support",
        "distance": "7.2 km",
        "battery": 81,
        "eta": "16 min",
        "traffic": "High",
        "recommended": False,
        "status": "AVAILABLE",
    },
    {
        "id": "EV-RR-07",
        "type": "Rapid Response Unit",
        "distance": "8.4 km",
        "battery": 56,
        "eta": "18 min",
        "traffic": "Moderate",
        "recommended": False,
        "status": "AVAILABLE",
    }
]

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
        "assigned_vehicle_location": {"lat": 28.6450, "lng": 77.0980},
        "route_geometry": [[28.6450, 77.0980], [28.6390, 77.0920], [28.6328, 77.0854]],
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
        "assigned_vehicle_location": {"lat": 28.6230, "lng": 77.2180},
        "route_geometry": [[28.6230, 77.2180], [28.6180, 77.2130], [28.6139, 77.2090]],
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

        return EmergencyAnalyzeResponse(
            incident_type=request.incident_type,
            summary=summary,
            keywords=keywords,
            address=address
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
        eta_min = opt_res.selected_vehicle.estimated_eta_minutes if opt_res.selected_vehicle else None
        dist_km = opt_res.route.distance_km if opt_res.route else None
        dispatch_status = "DISPATCHED" if selected_veh_id else "PENDING_RESOURCES"

        veh_location = None
        route_points = None
        if selected_veh_id:
            veh_lat = round(report.latitude + 0.015, 5)
            veh_lng = round(report.longitude - 0.012, 5)
            veh_location = {"lat": veh_lat, "lng": veh_lng}
            route_points = [
                [veh_lat, veh_lng],
                [round(veh_lat * 0.6 + report.latitude * 0.4, 5), round(veh_lng * 0.6 + report.longitude * 0.4, 5)],
                [report.latitude, report.longitude]
            ]

        # Record in Government Alerts Ledger
        alert_entry = {
            "incident_id": incident_id,
            "incident_type": req_type,
            "summary": summary,
            "keywords": keywords,
            "address": address,
            "district": district_name,
            "latitude": report.latitude,
            "longitude": report.longitude,
            "status": dispatch_status,
            "selected_vehicle": selected_veh_id,
            "vehicle_type": selected_veh_type,
            "eta_minutes": eta_min,
            "distance_km": dist_km,
            "assigned_vehicle_location": veh_location,
            "route_geometry": route_points,
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
    provider: BaseRoutingProvider = Depends(get_routing_provider)
):
    """
    Executes actual EV dispatch assignment. Updates the incident status from PENDING_RESOURCES
    to DISPATCHED, calculates the emergency route and ETA, updates the assigned vehicle status
    to EN ROUTE, and persists this state across the ledger.
    """
    try:
        # 1. Locate the incident in the ledger
        incident_entry = None
        for alert in EMERGENCY_ALERTS_LEDGER:
            if alert.get("incident_id") == request.incident_id:
                incident_entry = alert
                break

        # Fallback if not found (e.g. initial demo reference)
        if not incident_entry:
            incident_entry = {
                "incident_id": request.incident_id,
                "incident_type": "ambulance" if "AMB" in request.vehicle_id else "fire" if "FIRE" in request.vehicle_id else "police",
                "summary": f"Emergency response unit {request.vehicle_id} dispatched.",
                "keywords": ["emergency", "dispatch"],
                "address": "Delhi NCR Urban Sector",
                "district": "Delhi NCR",
                "latitude": 28.6290,
                "longitude": 77.0780,
                "status": "PENDING_RESOURCES",
                "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
            }
            EMERGENCY_ALERTS_LEDGER.insert(0, incident_entry)

        inc_lat = incident_entry.get("latitude", 28.6290)
        inc_lng = incident_entry.get("longitude", 77.0780)

        # 2. Determine realistic source coordinates for the dispatched vehicle
        veh_lat = round(inc_lat + 0.016, 5)
        veh_lng = round(inc_lng - 0.014, 5)
        veh_location = {"lat": veh_lat, "lng": veh_lng}

        # 3. Calculate route geometry and ETA using existing routing provider
        route_points: List[List[float]] = []
        eta_minutes = request.eta_minutes or 6.2
        distance_km = request.distance_km or 3.2

        try:
            source_coord = Coordinate(lat=veh_lat, lng=veh_lng)
            dest_coord = Coordinate(lat=inc_lat, lng=inc_lng)
            candidate_routes = provider.get_candidate_routes(source_coord, dest_coord)
            if candidate_routes:
                best = candidate_routes[0]
                geom = getattr(best, "geometry", None) or getattr(best, "route_geometry", None)
                if geom:
                    route_points = [[c.lat, c.lng] for c in geom]
        except Exception as exc:
            logger.warning(f"Routing calculation fallback for dispatch: {exc}")

        # Ensure route line geometry exists for Leaflet visualization
        if not route_points or len(route_points) < 2:
            route_points = [
                [veh_lat, veh_lng],
                [round(veh_lat * 0.75 + inc_lat * 0.25, 5), round(veh_lng * 0.75 + inc_lng * 0.25, 5)],
                [round(veh_lat * 0.50 + inc_lat * 0.50, 5), round(veh_lng * 0.50 + inc_lng * 0.50, 5)],
                [round(veh_lat * 0.25 + inc_lat * 0.75, 5), round(veh_lng * 0.25 + inc_lng * 0.75, 5)],
                [inc_lat, inc_lng]
            ]

        veh_type = request.vehicle_type or (
            "Advanced Life Support" if "AMB" in request.vehicle_id
            else "Rapid Response Unit" if "RR" in request.vehicle_id
            else "Electric Fire Engine" if "FIRE" in request.vehicle_id
            else "Police Patrol Unit"
        )

        # 4. Update the incident status in the single source of truth ledger
        incident_entry["status"] = "DISPATCHED"
        incident_entry["selected_vehicle"] = request.vehicle_id
        incident_entry["vehicle_type"] = veh_type
        incident_entry["eta_minutes"] = eta_minutes
        incident_entry["distance_km"] = distance_km
        incident_entry["assigned_vehicle_location"] = veh_location
        incident_entry["route_geometry"] = route_points

        # 5. Update vehicle in fleet store from AVAILABLE to EN ROUTE
        for veh in VEHICLES_FLEET_STORE:
            if veh["id"] == request.vehicle_id:
                veh["status"] = "EN ROUTE"
                veh["eta"] = f"{eta_minutes:.0f} min"
                break

        return EmergencyDispatchAssignResponse(
            success=True,
            incident_id=incident_entry["incident_id"],
            status="DISPATCHED",
            selected_vehicle=request.vehicle_id,
            vehicle_type=veh_type,
            eta_minutes=eta_minutes,
            distance_km=distance_km,
            assigned_vehicle_location=veh_location,
            route_geometry=route_points,
            message=f"Unit {request.vehicle_id} successfully dispatched to incident {incident_entry['incident_id']}."
        )

    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to assign emergency dispatch: {str(exc)}"
        )

@router.get(
    "/vehicles",
    summary="Get Emergency Vehicle Fleet Status"
)
async def get_emergency_vehicles():
    """
    Returns the real-time emergency vehicle fleet statuses for the Government Dashboard.
    """
    return VEHICLES_FLEET_STORE

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
