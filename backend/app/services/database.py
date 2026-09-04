import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

logger = logging.getLogger(__name__)

# Database connection string from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/ev_optimizer")

def _create_database_engine():
    global DATABASE_URL
    if DATABASE_URL.startswith("sqlite"):
        return create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    
    try:
        eng = create_engine(DATABASE_URL)
        # Attempt immediate ping to verify credentials/connection
        with eng.connect() as conn:
            pass
        return eng
    except Exception as exc:
        fallback_url = "sqlite:///./emergency_vehicles.db"
        logger.warning(
            f"Database connection to '{DATABASE_URL}' failed ({exc}). "
            f"Falling back to local persistent SQLite database at '{fallback_url}'."
        )
        DATABASE_URL = fallback_url
        return create_engine(fallback_url, connect_args={"check_same_thread": False})

engine = _create_database_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Auto-create tables on startup
try:
    import app.services.db_models  # noqa
    Base.metadata.create_all(bind=engine)
except Exception as err:
    logger.warning(f"Could not auto-create database tables: {err}")

def get_db():
    """
    Dependency generator yielding db session and closing it on request completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
