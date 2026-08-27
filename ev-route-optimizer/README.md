# EV Smart Route Optimizer (Phase 1 Prototype)

This is the Smart Route Optimizer module for the EV Mobility Intelligence Platform. It acts as an EV intelligence layer on top of conventional routing to evaluate battery feasibility and score route options.

## Features (Phase 1)
- **Constraint-Aware EV Feasibility**: Verifies if the EV can reach its destination while maintaining the required minimum battery reserve.
- **Traffic-Adjusted Energy Model**: Estimating EV battery depletion based on distance, vehicle consumption, and traffic congestion.
- **Deterministic Multi-Factor Scoring**: Ranks routes based on configurable weights (travel time, traffic levels, battery risk).
- **FastAPI Endpoints**: Fully-typed APIs for health status and route optimization.
- **Unit Tests**: Coverage for energy models, scoring, feasibility scenarios, and API requests.

---

## Getting Started

### 1. Create a Virtual Environment
From the `ev-route-optimizer/` directory:
```bash
python -m venv .venv
```

### 2. Activate the Virtual Environment
- **Windows (PowerShell):**
  ```powershell
  .venv\Scripts\Activate.ps1
  ```
- **Windows (CMD):**
  ```cmd
  .venv\Scripts\activate.bat
  ```
- **Linux/macOS:**
  ```bash
  source .venv/bin/activate
  ```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

---

## Running the Application

Start the FastAPI development server:
```bash
uvicorn app.main:app --reload
```

The server will be available at `http://127.0.0.1:8000`. You can access the interactive API docs (Swagger UI) at `http://127.0.0.1:8000/docs`.

---

## Running Tests

Run the complete test suite using `pytest`:
```bash
pytest
```

---

## API Documentation

### 1. Health Check
- **Endpoint**: `GET /health`
- **Response**:
  ```json
  {
    "status": "ok"
  }
  ```

### 2. Optimize Route
- **Endpoint**: `POST /route/optimize`
- **Request Payload**:
  ```json
  {
    "source": {
      "lat": 28.6139,
      "lng": 77.2090
    },
    "destination": {
      "lat": 28.6129,
      "lng": 77.2295
    },
    "vehicle": {
      "vehicle_id": "CITIZEN-001",
      "vehicle_type": "citizen",
      "battery_percentage": 30.0,
      "battery_capacity_kwh": 60.0,
      "consumption_kwh_per_km": 0.2,
      "minimum_reserve_pct": 15.0,
      "is_emergency": false
    },
    "emergency": false
  }
  ```

- **Response Payload**:
  ```json
  {
    "recommended_route_id": "ROUTE-B",
    "distance_km": 12.0,
    "eta_minutes": 12.0,
    "arrival_battery_percentage": 26.0,
    "feasible": true,
    "score": 150.0,
    "reason": "Selected 'Outer Ring Road (Eco & Smooth)' because the fastest candidate 'Central Boulevard (Direct & Fast)' is infeasible due to battery constraints.",
    "evaluated_routes": [
      {
        "route_id": "ROUTE-A",
        "name": "Central Boulevard (Direct & Fast)",
        "distance_km": 10.0,
        "duration_seconds": 600.0,
        "traffic_level": "heavy",
        "energy_consumed_kwh": 2.3,
        "arrival_battery_percentage": 26.17,
        "is_feasible": true,
        "score": 167.67,
        "reason": "Feasible",
        "geometry": [...]
      },
      ...
    ]
  }
  ```
