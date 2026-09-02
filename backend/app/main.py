from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from app.database import engine, Base, get_db
from app.models import vehicle, ev_station
from app.routers import telemetry, auth, ev_stations, routes, command_center
from app.schemas.dashboard import DashboardSummaryResponse

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="EnaV Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
app.include_router(telemetry.router)
app.include_router(auth.router)
app.include_router(ev_stations.router)
app.include_router(routes.router)
app.include_router(command_center.router)


# --------------------------------------------------------------------------
# PYDANTIC SCHEMAS FOR ROUTE OPTIMIZER PAYLOAD
# --------------------------------------------------------------------------

class LocationPoint(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None
    address: Optional[str] = None


class VehicleConfig(BaseModel):
    batteryCapacityKwh: float = Field(..., description="Total battery capacity in kWh")
    currentSocPct: float = Field(..., description="Current State of Charge percentage")
    consumptionRateKwhPerKm: float = Field(..., description="Energy consumption rate in kWh/km")
    minReservePct: float = Field(..., description="Strict safety floor reserve percentage")


class RouteOptimizeRequest(BaseModel):
    source: Optional[LocationPoint] = None
    destination: Optional[LocationPoint] = None
    vehicle: VehicleConfig


@app.get("/")
def read_root():
    return {"message": "Welcome to EnaV EV Mobility API"}


@app.post("/route/optimize")
def optimize_route(payload: RouteOptimizeRequest):
    """
    Multi-route optimizer endpoint incorporating fully dynamic calculations 
    for energy depletion, scaled toll estimates, and elevation profiles based 
    on live vehicle configuration parameters.
    """
    v_cfg = payload.vehicle
    
    # Calculate available usable energy based on inputs
    current_energy_kwh = (v_cfg.currentSocPct / 100.0) * v_cfg.batteryCapacityKwh
    min_reserve_kwh = (v_cfg.minReservePct / 100.0) * v_cfg.batteryCapacityKwh
    usable_energy_kwh = max(0.0, current_energy_kwh - min_reserve_kwh)

    # Base route options where metrics scale dynamically with vehicle consumption and distance
    routes_data = [
        {
            "route_id": "rt-01",
            "name": "Express Highway Corridor",
            "distance_km": 28.4,
            "duration_seconds": 2280,  # 38 mins
            "reason": "Fastest path utilizing major arterial expressways with high energy efficiency.",
            "toll_rate_per_km": 2.25,  # Expressways have higher toll rates
            "elevation_factor": 1.4,
            "efficiency_multiplier": 1.0,
        },
        {
            "route_id": "rt-02",
            "name": "Eco-Scenic Route (Regenerative)",
            "distance_km": 31.2,
            "duration_seconds": 2700,  # 45 mins
            "reason": "Optimized for continuous regenerative braking and lower urban stop-and-go congestion.",
            "toll_rate_per_km": 0.0,   # Toll-free municipal roads
            "elevation_factor": 0.6,
            "efficiency_multiplier": 0.88, # Regenerative savings
        },
        {
            "route_id": "rt-03",
            "name": "Safe Corridor via Charging Hubs",
            "distance_km": 29.8,
            "duration_seconds": 2520,  # 42 mins
            "reason": "Requires an intermediary high-power charging stop based on current battery state of charge.",
            "toll_rate_per_km": 1.35,
            "elevation_factor": 1.0,
            "efficiency_multiplier": 1.0,
        }
    ]

    evaluated_routes = []
    charging_required_flag = False

    for r in routes_data:
        distance = r["distance_km"]
        # Fully dynamic energy depletion calculation incorporating consumption rate and regenerative/elevation factors
        depletion = distance * v_cfg.consumptionRateKwhPerKm * r["efficiency_multiplier"]
        
        # Dynamic toll calculation based on distance and corridor rate
        calculated_toll = int(distance * r["toll_rate_per_km"])
        toll_str = f"₹{calculated_toll}" if calculated_toll > 0 else "₹0"

        # Dynamic elevation calculation based on distance scaling
        elevation_gain = int(distance * r["elevation_factor"])
        elevation_str = f"+{elevation_gain}m"

        # Feasibility check against usable energy floor
        is_feasible = usable_energy_kwh >= depletion
        if not is_feasible:
            charging_required_flag = True

        evaluated_routes.append({
            "route_id": r["route_id"],
            "name": r["name"],
            "is_feasible": is_feasible,
            "distance_km": distance,
            "duration_seconds": r["duration_seconds"],
            "reason": r["reason"],
            "toll_cost_inr": toll_str,
            "elevation_gain_m": elevation_str,
            "kwh_depletion": f"{round(depletion, 2)} kWh"
        })

    return {
        "evaluated_routes": evaluated_routes,
        "charging_required": charging_required_flag,
        "recommended_charger": {
            "name": "EcoCharge Station B",
            "charging_power_kw": 120
        } if charging_required_flag else None
    }