from sqlalchemy import Column, String, Float, DateTime, Integer
from datetime import datetime
from app.services.database import Base

class EmergencyVehicleModel(Base):
    __tablename__ = "emergency_vehicles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    vehicle_id = Column(String(50), unique=True, nullable=False, index=True)
    vehicle_type = Column(String(20), nullable=False)  # police, fire, ambulance
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    battery_percentage = Column(Float, nullable=False)
    battery_capacity_kwh = Column(Float, nullable=False)
    consumption_kwh_per_km = Column(Float, nullable=False)
    minimum_reserve_pct = Column(Float, default=20.0, nullable=False)
    availability_status = Column(String(20), default="available", nullable=False)  # available, busy, offline
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
