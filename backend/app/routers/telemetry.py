from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.vehicle import VehicleTelemetry
from app.schemas.vehicle import VehicleTelemetryCreate

router = APIRouter(prefix="/telemetry", tags=["Telemetry"])

@router.post("/")
def create_telemetry(data: VehicleTelemetryCreate, db: Session = Depends(get_db)):
    db_item = VehicleTelemetry(**data.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return {"status": "success", "data": db_item}

@router.get("/")
def get_telemetry(db: Session = Depends(get_db)):
    return db.query(VehicleTelemetry).all()