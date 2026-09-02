from sqlalchemy import Column, Integer, Float, String, DateTime
from datetime import datetime
from app.database import Base

class VehicleTelemetry(Base):
    __tablename__ = "vehicle_telemetry"

    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(String, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    battery_percentage = Column(Float)
    speed = Column(Float)
    motor_temperature = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

# Alias to satisfy imports looking for 'Vehicle'
Vehicle = VehicleTelemetry