from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import vehicle, ev_station
# Yahan saare routers import hone chahiye (Purane + Naye)
from app.routers import telemetry, auth, ev_stations, routes

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

# Aur yeh sabhi include hone chahiye
app.include_router(telemetry.router)
app.include_router(auth.router)
app.include_router(ev_stations.router)
app.include_router(routes.router)  # Yeh route optimizer wala hai

@app.get("/")
def read_root():
    return {"message": "Welcome to EnaV EV Mobility API"}