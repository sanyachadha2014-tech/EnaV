import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Database connection string from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/ev_optimizer")

# Create connection engine
if DATABASE_URL.startswith("sqlite"):
    # SQLite specific configuration for local testing
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """
    Dependency generator yielding db session and closing it on request completion.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
