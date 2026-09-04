from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from app.database import engine, Base, get_db
from app.models import vehicle, ev_station
from app.routers import telemetry, auth, ev_stations, routes, command_center, emergency_report
from app.schemas.dashboard import DashboardSummaryResponse
from app.routers import telemetry, auth, ev_stations, routes, command_center, emergency_report, infra_planner

# Create database tables
try:
    Base.metadata.create_all(bind=engine)
except Exception as db_err:
    import logging
    logging.getLogger(__name__).warning(f"Database table initialization skipped: {db_err}")

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
app.include_router(emergency_report.router)
app.include_router(infra_planner.router)


@app.get("/")
def read_root():
    return {"message": "Welcome to EnaV EV Mobility API"}


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "EnaV Backend", "timestamp": datetime.utcnow().isoformat()}