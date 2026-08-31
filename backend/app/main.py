from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.models import vehicle
from app.routers import telemetry
from app.routers import auth

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="EnaV Backend", version="1.0.0")
app.include_router(telemetry.router)
app.include_router(auth.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to EnaV EV Mobility API"}