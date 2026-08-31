from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load configuration from .env file
load_dotenv()

from app.api.routes import router as route_router

app = FastAPI(
    title="EV Smart Route Optimizer API",
    description="An EV-intelligence layer for constraint-aware routing and emergency dispatch selection.",
    version="1.0.0"
)

# Enable CORS for frontend integrations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import RedirectResponse

# Register routes
app.include_router(route_router)

@app.get("/")
def redirect_to_docs():
    """
    Redirects the root URL to the interactive API documentation (/docs).
    """
    return RedirectResponse(url="/docs")

@app.on_event("startup")
def startup_event():
    # Eagerly load GIS boundaries on startup
    from app.services.gis_service import GISService
    GISService()

    # Create database tables if they do not exist
    try:
        from app.services.database import Base, engine
        import app.services.db_models  # Ensure models are imported
        Base.metadata.create_all(bind=engine)
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Error initializing database tables on startup: {e}")

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
