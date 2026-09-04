import pytest
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.services.routing_provider import get_routing_provider, MockRoutingProvider
from app.services.database import get_db, Base
from app.data.mock_vehicles import get_mock_vehicles
from app.services.vehicle_repository import SQLEmergencyVehicleRepository

# Configure database overrides for tests using SQLite in-memory
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def init_test_database():
    """
    Creates tables once per test session.
    """
    import app.services.db_models  # Ensure models are registered with Base.metadata
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(autouse=True)
def db_session():
    """
    Binds a database connection per test function, providing transaction isolation.
    """
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    # Register FastAPI dependency override for tests
    app.dependency_overrides[get_db] = lambda: session
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture(autouse=True)
def seed_vehicles_in_test_db(db_session):
    """
    Seeds database with mock vehicles before every test, preserving backwards-compatibility.
    """
    repo = SQLEmergencyVehicleRepository(db_session)
    for vehicle in get_mock_vehicles():
        repo.upsert_vehicle(vehicle)
    db_session.commit()

@pytest.fixture(autouse=True)
def force_mock_env():
    """
    Globally overrides environmental configs and FastAPI DI providers for tests
    to keep execution completely offline, isolated, and deterministic.
    """
    app.dependency_overrides[get_routing_provider] = lambda: MockRoutingProvider()
    os.environ["CHARGER_PROVIDER"] = "mock"
    os.environ["ROUTING_PROVIDER"] = "mock"
