from typing import List
from app.models.route_models import RouteInfo, Coordinate

# Predefined candidate routes to simulate routing API responses
MOCK_CANDIDATE_ROUTES: List[RouteInfo] = [
    RouteInfo(
        route_id="ROUTE-A",
        name="Central Boulevard (Direct & Fast)",
        distance_km=10.0,
        duration_seconds=600.0,  # 10 minutes
        traffic_level="heavy",
        geometry=[
            Coordinate(lat=28.6139, lng=77.2090),
            Coordinate(lat=28.6145, lng=77.2150),
            Coordinate(lat=28.6129, lng=77.2295)
        ]
    ),
    RouteInfo(
        route_id="ROUTE-B",
        name="Outer Ring Road (Eco & Smooth)",
        distance_km=12.0,
        duration_seconds=720.0,  # 12 minutes
        traffic_level="low",
        geometry=[
            Coordinate(lat=28.6139, lng=77.2090),
            Coordinate(lat=28.6080, lng=77.2120),
            Coordinate(lat=28.6129, lng=77.2295)
        ]
    ),
    RouteInfo(
        route_id="ROUTE-C",
        name="Green Bypass (Scenic & Long)",
        distance_km=18.0,
        duration_seconds=1080.0,  # 18 minutes
        traffic_level="moderate",
        geometry=[
            Coordinate(lat=28.6139, lng=77.2090),
            Coordinate(lat=28.6250, lng=77.2200),
            Coordinate(lat=28.6129, lng=77.2295)
        ]
    ),
    RouteInfo(
        route_id="ROUTE-D",
        name="Industrial Highway (Heavy Traffic)",
        distance_km=15.0,
        duration_seconds=1200.0,  # 20 minutes
        traffic_level="heavy",
        geometry=[
            Coordinate(lat=28.6139, lng=77.2090),
            Coordinate(lat=28.6100, lng=77.2300),
            Coordinate(lat=28.6129, lng=77.2295)
        ]
    )
]

def get_mock_routes() -> List[RouteInfo]:
    """
    Returns the list of mock candidate routes.
    """
    # Return a copy to prevent mutation issues in tests
    return [route.model_copy(deep=True) for route in MOCK_CANDIDATE_ROUTES]
