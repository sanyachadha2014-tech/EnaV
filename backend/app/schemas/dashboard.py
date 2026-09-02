from pydantic import BaseModel
from datetime import datetime

class DashboardSummaryResponse(BaseModel):
    registeredEVs: int
    evStations: int
    activeEmergencies: int
    averageETA: float
    lastUpdated: datetime

    class Config:
        from_attributes = True