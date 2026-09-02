from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
import logging

# Load configuration from .env file
load_dotenv()

logger = logging.getLogger(__name__)

from app.api.routes import router as route_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Eagerly load GIS boundaries on startup
    try:
        from app.services.gis_service import GISService
        GISService()
    except Exception as e:
        logger.error(f"Error initializing GIS Service on startup: {e}")

    # Create database tables if they do not exist
    try:
        from app.services.database import Base, engine
        import app.services.db_models  # Ensure models are imported
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        logger.error(f"Error initializing database tables on startup: {e}")
    yield

app = FastAPI(
    title="EV Smart Route Optimizer API",
    description="An EV-intelligence layer for constraint-aware routing and emergency dispatch selection.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend integrations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(route_router)

@app.get("/")
def redirect_to_docs():
    """
    Redirects the root URL to the interactive API documentation (/docs).
    """
    return RedirectResponse(url="/docs")

@app.get(
    "/health",
    summary="Health check endpoint",
    description="Returns the status of the API and charger provider diagnostics."
)
def health_check():
    """
    Simple health check endpoint returning status 'ok' and charger diagnostics.
    """
    from app.services.charger_provider import get_charger_provider_diagnostics
    try:
        diagnostics = get_charger_provider_diagnostics()
    except Exception as e:
        diagnostics = {"error": str(e)}
        
    return {
        "status": "ok",
        "charger_provider": diagnostics
    }