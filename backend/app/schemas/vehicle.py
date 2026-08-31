from pydantic import BaseModel

class VehicleTelemetryCreate(BaseModel):
    vehicle_id: str
    latitude: float
    longitude: float
    battery_percentage: float
    speed: float
    motor_temperature: float