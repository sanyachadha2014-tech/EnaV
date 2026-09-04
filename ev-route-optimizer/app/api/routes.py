from typing import List
from fastapi import APIRouter, HTTPException, status, Depends, Body
from app.models.route_models import (
    RouteOptimizationRequest, RouteOptimizationResponse,
    EmergencyOptimizeRequest, EmergencyOptimizeResponse,
    GisLocateRequest, GisLocateResponse,
    EmergencyDispatchEvent, EmergencyDispatchResponse, EmergencyIncident, EmergencyVehicle
)
from app.services.gis_service import GISService
from app.services.route_optimizer import optimize_ev_route
from app.services.emergency_router import optimize_emergency_dispatch
from app.services.routing_provider import BaseRoutingProvider, get_routing_provider, RoutingAPIError
from app.services.charger_provider import BaseChargerProvider, get_charger_provider
from app.services.vehicle_repository import BaseEmergencyVehicleRepository, get_vehicle_repository
from app.services.swytchcode_service import get_swytchcode_service

router = APIRouter()

@router.post(
    "/route/optimize",
    response_model=RouteOptimizationResponse,
    status_code=status.HTTP_200_OK,
    summary="Optimize route for EV journey",
    description="Evaluates candidate routes and returns the best feasible route based on battery level, traffic, and duration."
)
def optimize_route(
    request: RouteOptimizationRequest,
    provider: BaseRoutingProvider = Depends(get_routing_provider),
    charger_provider: BaseChargerProvider = Depends(get_charger_provider)
) -> RouteOptimizationResponse:
    """
    HTTP POST endpoint that receives the vehicle's parameters and routing coordinates,
    runs the deterministic route optimization engine, and responds with results.
    """
    try:
        candidate_routes = provider.get_candidate_routes(request.source, request.destination)
        
        if not candidate_routes:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No candidate routes available for evaluation."
            )
            
        response = optimize_ev_route(request.vehicle, candidate_routes, provider, charger_provider)
        return response
        
    except RoutingAPIError as api_err:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Routing service failure: {str(api_err)}"
        )
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(val_err)
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An internal error occurred during route optimization: {str(err)}"
        )

@router.post(
    "/emergency/optimize",
    response_model=EmergencyOptimizeResponse,
    status_code=status.HTTP_200_OK,
    summary="Optimize dispatch for 112 emergency vehicles",
    description="Ranks eligible available emergency vehicles and returns the fastest battery-feasible option."
)
def emergency_optimize(
    request: EmergencyOptimizeRequest,
    provider: BaseRoutingProvider = Depends(get_routing_provider),
    vehicle_repository: BaseEmergencyVehicleRepository = Depends(get_vehicle_repository)
) -> EmergencyOptimizeResponse:
    """
    Evaluates available emergency vehicles against the incident's required type,
    calculates road route feasibilities, and selects the vehicle with the fastest ETA.
    """
    try:
        # Enriches incident intelligence via Swytchcode (Mistral AI classification & OpenWeather context)
        swytchcode_intel = None
        try:
            swytchcode_service = get_swytchcode_service()
            swytchcode_intel = swytchcode_service.get_emergency_intelligence(
                incident_id=request.incident.incident_id,
                incident_type=request.incident.incident_type,
                severity=request.incident.severity,
                lat=request.incident.location.lat,
                lng=request.incident.location.lng,
                details=getattr(request.incident, 'description', None)
            )
        except Exception as swy_err:
            # Graceful fallback: never crash emergency routing on external service issues
            swytchcode_intel = {
                "integration": "Swytchcode Ecosystem (Fallback)",
                "error": str(swy_err),
                "incident_analysis": {"status": "fallback", "recommended_priority": request.incident.severity},
                "weather_context": {"status": "fallback", "road_surface": "dry"}
            }

        response = optimize_emergency_dispatch(
            incident=request.incident,
            routing_provider=provider,
            vehicle_repository=vehicle_repository
        )
        response.swytchcode_intelligence = swytchcode_intel
        return response
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An internal error occurred during emergency dispatch optimization: {str(err)}"
        )

@router.post(
    "/gis/locate",
    response_model=GisLocateResponse,
    status_code=status.HTTP_200_OK,
    summary="Locate zone containing the coordinate",
    description="Loads KML boundaries and performs point-in-polygon lookup."
)
def gis_locate(request: GisLocateRequest) -> GisLocateResponse:
    """
    HTTP POST endpoint that accepts a coordinate and checks if it falls inside any
    administrative/service zones loaded from the KML boundary file.
    """
    try:
        gis_service = GISService()
        result = gis_service.locate_point(request.location)
        return GisLocateResponse(
            district_id=result["district_id"],
            district_name=result["district_name"],
            state_name=result["state_name"],
            inside_boundary=result["inside_boundary"]
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An internal error occurred during KML zone search: {str(err)}"
        )

@router.post(
    "/dispatch/112",
    response_model=EmergencyDispatchResponse,
    status_code=status.HTTP_200_OK,
    summary="112 Emergency Event Dispatch Adapter",
    description="Receives simulated 112 event, resolves district boundary, and recommends the best available vehicle."
)
def dispatch_112(
    request: EmergencyDispatchEvent,
    provider: BaseRoutingProvider = Depends(get_routing_provider),
    vehicle_repository: BaseEmergencyVehicleRepository = Depends(get_vehicle_repository)
) -> EmergencyDispatchResponse:
    """
    HTTP POST endpoint that processes an emergency event from 112, resolves the district,
    determines the fastest available matching vehicle, and optimizes the dispatch route.
    """
    try:
        incident = EmergencyIncident(
            incident_id=request.incident_id,
            incident_type=request.incident_type,
            severity=request.severity,
            location=request.location,
            required_vehicle_type=request.required_vehicle_type
        )

        # Enriches 112 dispatch event via Swytchcode
        swytchcode_intel = None
        try:
            swytchcode_service = get_swytchcode_service()
            swytchcode_intel = swytchcode_service.get_emergency_intelligence(
                incident_id=request.incident_id,
                incident_type=request.incident_type,
                severity=request.severity,
                lat=request.location.lat,
                lng=request.location.lng,
                details=f"112 Emergency Dispatch Event: {request.incident_type} (Severity: {request.severity})"
            )
        except Exception as swy_err:
            swytchcode_intel = {
                "integration": "Swytchcode Ecosystem (Fallback)",
                "error": str(swy_err),
                "incident_analysis": {"status": "fallback", "recommended_priority": request.severity},
                "weather_context": {"status": "fallback", "road_surface": "dry"}
            }
        
        opt_res = optimize_emergency_dispatch(
            incident=incident,
            routing_provider=provider,
            vehicle_repository=vehicle_repository
        )
        
        dispatch_status = "recommended" if opt_res.selected_vehicle is not None else "no_feasible_vehicle"
        
        return EmergencyDispatchResponse(
            incident_id=request.incident_id,
            dispatch_status=dispatch_status,
            district=opt_res.district,
            selected_vehicle=opt_res.selected_vehicle,
            route=opt_res.route,
            reason=opt_res.reason,
            swytchcode_intelligence=swytchcode_intel
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An internal error occurred during 112 dispatch processing: {str(err)}"
        )

@router.post(
    "/vehicles/ingest",
    status_code=status.HTTP_200_OK,
    summary="Ingest emergency vehicle updates",
    description="Accepts telemetry updates for emergency vehicles and upserts them into the database."
)
def ingest_vehicles(
    vehicles: List[EmergencyVehicle] = Body(...),
    repository: BaseEmergencyVehicleRepository = Depends(get_vehicle_repository)
):
    """
    Ingests or updates multiple emergency vehicles in the database.
    """
    try:
        upserted_count = 0
        for vehicle in vehicles:
            repository.upsert_vehicle(vehicle)
            upserted_count += 1
        return {"status": "success", "upserted_count": upserted_count}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to ingest vehicle data: {str(e)}"
        )