from sqlalchemy import Column, Integer, String, Float
from app.database import Base

class EVStation(Base):
    __tablename__ = "ev_stations"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    type = Column(String, nullable=False) # "DC Fast", "Ultra Fast", "AC + DC"
    available = Column(Integer, nullable=False)
    total = Column(Integer, nullable=False)
    distance = Column(String, nullable=False)
    status = Column(String, nullable=False) # "Available" | "Limited"