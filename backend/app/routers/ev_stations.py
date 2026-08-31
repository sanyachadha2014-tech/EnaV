import requests
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.database import get_db
from app.models.ev_station import EVStation

router = APIRouter(prefix="/stations", tags=["EV Stations"])

# Apni Open Charge Map ki API key yahan daalein
OCM_API_KEY = "e894bdae-c52c-4311-a529-7e71a3ff1515"
OPEN_CHARGE_MAP_URL = "https://api.openchargemap.io/v3/poi/"

class StationResponse(BaseModel):
    id: str
    name: str
    location: str
    type: str
    available: int
    total: int
    distance: str
    status: str

    class Config:
        from_attributes = True

@router.get("/", response_model=List[StationResponse])
def get_stations(
    latitude: float = 28.6139, 
    longitude: float = 77.2090, 
    db: Session = Depends(get_db)
):
    headers = {}
    if OCM_API_KEY and OCM_API_KEY != "YOUR_API_KEY_HERE":
        headers["X-API-Key"] = OCM_API_KEY

    params = {
        "output": "json",
        "countrycode": "IN",
        "maxresults": 10,
        "latitude": latitude,   # Ab yeh dynamic ho gaya
        "longitude": longitude, # Ab yeh dynamic ho gaya
        "distance": 50,
        "distanceunit": "KM"
    }
    
    try:
        response = requests.get(OPEN_CHARGE_MAP_URL, params=params, headers=headers)
        
        # Agar external API fail ho jaye, toh fallback ke liye purana database data bhej sakte hain
        if response.status_code != 200:
            return db.query(EVStation).all()
        
        raw_data = response.json()
        formatted_stations = []
        
        for item in raw_data:
            address_info = item.get("AddressInfo", {})
            connections = item.get("Connections", [{}])

            # Connection type nikalna
            conn_type = "DC Fast"
            if connections and connections[0].get("ConnectionType"):
                conn_type = connections[0].get("ConnectionType", {}).get("Title", "DC Fast")
            
           # Connections ki actual count nikalna
            total_connectors = len(connections) if len(connections) > 0 else 1
            
            # Agar available connectors total se zyada hain, toh unhe adjust kar dete hain
            available_count = min(2, total_connectors)

            station = {
                "id": str(item.get("ID")),
                "name": address_info.get("Title", "EV Charging Station"),
                "location": f"{address_info.get('AddressLine1', '')}, {address_info.get('Town', 'New Delhi')}",
                "type": conn_type,
                "available": available_count,  
                "total": total_connectors,
                "distance": f"{address_info.get('Distance', 0):.1f} km" if "Distance" in address_info else "2.5 km",
                "status": "Available" if item.get("StatusType", {}).get("IsOperational", True) else "Offline"
            }

            formatted_stations.append(station)
            
        # Agar API se koi station na mile toh database wala return kar do
        if not formatted_stations:
            return db.query(EVStation).all()
            
        return formatted_stations

    except Exception as e:
        # Koi bhi error aane par database ka fallback data dega taaki app crash na ho
        return db.query(EVStation).all()