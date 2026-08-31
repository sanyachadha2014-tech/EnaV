# n8n Integration Guide - 112 Emergency Dispatch Adapter

This directory contains integration resources to connect our FastAPI **EV Route Optimizer** to a municipal **112 Emergency Dispatch** event flow using n8n.

## How it works

```
112 Incident Event
  ↓ (JSON POST payload)
n8n Webhook Node
  ↓ (Validate fields: incident_id, lat, lng)
FastAPI HTTP Request Node (POST /dispatch/112)
  ↓ (Sub-millisecond processing)
FastAPI Response (district, selected vehicle, ETA, route)
  ↓ (IF dispatch successful node check)
slack / Discord / Log Notification Nodes
```

## Setup Instructions

1. **Import the Workflow**:
   * Open your n8n workspace.
   * Create a new empty workflow.
   * Copy the raw JSON contents of [workflow.json](file:///c:/Users/psing/OneDrive/Desktop/ENAV/ev-route-optimizer/n8n/workflow.json) and paste it directly into the n8n canvas (or select **Import from File** in n8n's menu).

2. **Configure FastAPI URL**:
   * In the node named **HTTP Request to FastAPI**, configure the URL parameter to match your running server instance (e.g., `http://localhost:8000/dispatch/112` or your staging/production domain).

3. **Simulate a 112 Incident Hook**:
   * Send a test `POST` query to the n8n **112 Webhook** node using this JSON body format:
   ```json
   {
     "incident_id": "112-DEL-FIRE-99",
     "incident_type": "fire",
     "severity": "critical",
     "location": {
       "lat": 28.6139,
       "lng": 77.2090
     },
     "required_vehicle_type": "fire",
     "reported_at": "2026-08-26T17:15:00"
   }
   ```

4. **Response Parsing in n8n**:
   * The **If Dispatch Successful** node checks if `dispatch_status == "recommended"`.
   * If **True**: It routes to the Slack node, displaying:
     > Dispatch Successful! Recommended Vehicle: FIRE-001 (fire). ETA: 6.8 mins. District: New Delhi.
   * If **False** (e.g., no feasible vehicle was found due to low battery or too far away): It routes to the failure Slack node, displaying:
     > Dispatch Failed! Reason: No feasible available 'fire' vehicles could reach the incident location while maintaining their required minimum battery reserve.
