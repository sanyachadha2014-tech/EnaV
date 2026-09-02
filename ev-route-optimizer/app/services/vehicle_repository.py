from abc import ABC, abstractmethod
from typing import List, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.route_models import EmergencyVehicle, Coordinate
from app.services.db_models import EmergencyVehicleModel

class BaseEmergencyVehicleRepository(ABC):
    @abstractmethod
    def get_all_vehicles(self) -> List[EmergencyVehicle]:
        pass

    @abstractmethod
    def get_vehicle_by_id(self, vehicle_id: str) -> Optional[EmergencyVehicle]:
        pass

    @abstractmethod
    def get_vehicles_by_type(self, vehicle_type: str) -> List[EmergencyVehicle]:
        pass

    @abstractmethod
    def upsert_vehicle(self, vehicle: EmergencyVehicle) -> EmergencyVehicle:
        pass

class SQLEmergencyVehicleRepository(BaseEmergencyVehicleRepository):
    def __init__(self, db_session: Session):
        self.db_session = db_session

    def _to_pydantic(self, model: EmergencyVehicleModel) -> EmergencyVehicle:
        return EmergencyVehicle(
            vehicle_id=model.vehicle_id,
            vehicle_type=model.vehicle_type,
            current_location=Coordinate(lat=model.latitude, lng=model.longitude),
            battery_percentage=model.battery_percentage,
            battery_capacity_kwh=model.battery_capacity_kwh,
            consumption_kwh_per_km=model.consumption_kwh_per_km,
            minimum_reserve_pct=model.minimum_reserve_pct,
            availability_status=model.availability_status
        )

    def get_all_vehicles(self) -> List[EmergencyVehicle]:
        models = self.db_session.query(EmergencyVehicleModel).all()
        return [self._to_pydantic(m) for m in models]

    def get_vehicle_by_id(self, vehicle_id: str) -> Optional[EmergencyVehicle]:
        model = self.db_session.query(EmergencyVehicleModel).filter(
            EmergencyVehicleModel.vehicle_id == vehicle_id
        ).first()
        return self._to_pydantic(model) if model else None

    def get_vehicles_by_type(self, vehicle_type: str) -> List[EmergencyVehicle]:
        models = self.db_session.query(EmergencyVehicleModel).filter(
            EmergencyVehicleModel.vehicle_type == vehicle_type
        ).all()
        return [self._to_pydantic(m) for m in models]

    def upsert_vehicle(self, vehicle: EmergencyVehicle) -> EmergencyVehicle:
        model = self.db_session.query(EmergencyVehicleModel).filter(
            EmergencyVehicleModel.vehicle_id == vehicle.vehicle_id
        ).first()
        
        if model:
            model.vehicle_type = vehicle.vehicle_type
            model.latitude = vehicle.current_location.lat
            model.longitude = vehicle.current_location.lng
            model.battery_percentage = vehicle.battery_percentage
            model.battery_capacity_kwh = vehicle.battery_capacity_kwh
            model.consumption_kwh_per_km = vehicle.consumption_kwh_per_km
            model.minimum_reserve_pct = vehicle.minimum_reserve_pct
            model.availability_status = vehicle.availability_status
            model.updated_at = datetime.now(timezone.utc)
        else:
            model = EmergencyVehicleModel(
                vehicle_id=vehicle.vehicle_id,
                vehicle_type=vehicle.vehicle_type,
                latitude=vehicle.current_location.lat,
                longitude=vehicle.current_location.lng,
                battery_percentage=vehicle.battery_percentage,
                battery_capacity_kwh=vehicle.battery_capacity_kwh,
                consumption_kwh_per_km=vehicle.consumption_kwh_per_km,
                minimum_reserve_pct=vehicle.minimum_reserve_pct,
                availability_status=vehicle.availability_status
            )
            self.db_session.add(model)
        
        self.db_session.commit()
        self.db_session.refresh(model)
        return self._to_pydantic(model)

from fastapi import Depends
from app.services.database import get_db

def get_vehicle_repository(db: Session = Depends(get_db)) -> BaseEmergencyVehicleRepository:
    """
    FastAPI dependency injection provider returning concrete repository instance.
    """
    return SQLEmergencyVehicleRepository(db)