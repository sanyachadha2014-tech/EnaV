"use client";

import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export interface MapIncident {
  incident_id: string;
  incident_type: string;
  address?: string;
  district?: string;
  latitude?: number | null;
  longitude?: number | null;
  status: string;
  selected_vehicle?: string | null;
  vehicle_type?: string | null;
  eta_minutes?: number | null;
  summary?: string;
  assigned_vehicle_location?: { lat: number; lng: number } | null;
  route_geometry?: number[][] | null;
}

interface CommandMapProps {
  incidents?: MapIncident[];
  selectedIncidentId?: string | null;
  onSelectIncident?: (id: string) => void;
  center?: [number, number];
  zoom?: number;
  height?: string;
}

// Controller to smoothly pan/zoom when selected incident changes
function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.0 });
  }, [center, zoom, map]);
  return null;
}

// Creates high-visibility emergency marker pin with category icon
function createEmergencyIcon(type: string, isSelected: boolean) {
  const t = (type || "").toLowerCase();
  const isFire = t.includes("fire");
  const isPolice = t.includes("police") || t.includes("crime");
  const color = isFire ? "#EF4444" : isPolice ? "#3B82F6" : "#10B981";
  const emoji = isFire ? "🔥" : isPolice ? "🚔" : "🚑";

  return L.divIcon({
    className: "emergency-marker-container",
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -100%); cursor: pointer;">
        <div style="
          width: ${isSelected ? "44px" : "36px"};
          height: ${isSelected ? "44px" : "36px"};
          border-radius: 50%;
          background: ${color};
          border: 3px solid #ffffff;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45), 0 0 18px ${color};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: ${isSelected ? "20px" : "16px"};
          color: #ffffff;
          transition: all 0.2s ease;
        ">
          ${emoji}
        </div>
        <div style="
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${color};
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
        "></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -42],
  });
}

// Creates vehicle marker icon for dispatched EV units
function createVehicleIcon(vehicleId: string, vehicleType?: string | null) {
  const idLower = (vehicleId || "").toLowerCase();
  const typeLower = (vehicleType || "").toLowerCase();
  const isFire = idLower.includes("fire") || typeLower.includes("fire");
  const isPolice = idLower.includes("police") || typeLower.includes("police");
  const emoji = isFire ? "🚒" : isPolice ? "🚔" : "🚑";
  const bg = isFire ? "#DC2626" : isPolice ? "#2563EB" : "#059669";

  return L.divIcon({
    className: "ev-unit-marker-container",
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; transform: translate(-50%, -50%); cursor: pointer;">
        <div style="
          background: ${bg};
          border: 2px solid #ffffff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.45), 0 0 10px ${bg};
          border-radius: 20px;
          padding: 3px 8px;
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: monospace;
          font-size: 11px;
          font-weight: 800;
          color: #ffffff;
          white-space: nowrap;
        ">
          <span style="font-size: 13px;">${emoji}</span>
          <span>${vehicleId}</span>
        </div>
        <div style="
          background: #064e3b;
          color: #34d399;
          font-size: 8px;
          font-family: monospace;
          font-weight: 800;
          padding: 1px 5px;
          border-radius: 4px;
          border: 1px solid #10b981;
          margin-top: 2px;
          letter-spacing: 0.5px;
        ">
          EN ROUTE
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
    popupAnchor: [0, -28],
  });
}

export default function CommandMap({
  incidents = [],
  selectedIncidentId,
  onSelectIncident,
  center,
  zoom = 13,
  height = "100%",
}: CommandMapProps) {
  // Filter out any incidents missing latitude or longitude to prevent runtime crashes
  const validIncidents = useMemo(() => {
    return (incidents || []).filter(
      (inc) => typeof inc.latitude === "number" && typeof inc.longitude === "number"
    );
  }, [incidents]);

  // Determine primary map focus coordinate
  const selectedIncident = useMemo(() => {
    if (!validIncidents.length) return null;
    if (selectedIncidentId) {
      return validIncidents.find((i) => i.incident_id === selectedIncidentId) || validIncidents[0];
    }
    return validIncidents[0];
  }, [validIncidents, selectedIncidentId]);

  const mapCenter: [number, number] = useMemo(() => {
    if (center) return center;
    if (selectedIncident && typeof selectedIncident.latitude === "number" && typeof selectedIncident.longitude === "number") {
      return [selectedIncident.latitude, selectedIncident.longitude];
    }
    return [28.6139, 77.2090]; // Default New Delhi central coordinate
  }, [center, selectedIncident]);

  return (
    <div style={{ height, width: "100%" }} className="relative z-0 rounded-xl overflow-hidden">
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewController center={mapCenter} zoom={selectedIncident ? 14 : zoom} />

        {validIncidents.map((incident) => {
          const lat = incident.latitude as number;
          const lng = incident.longitude as number;
          const isSelected = selectedIncident?.incident_id === incident.incident_id;
          const icon = createEmergencyIcon(incident.incident_type, isSelected);

          const statusLower = (incident.status || "").toLowerCase();
          const isDispatched = statusLower === "dispatched" || statusLower === "assigned" || statusLower.includes("route");
          const hasAssignedVehicle = Boolean(incident.selected_vehicle && isDispatched);

          // Determine EV vehicle position safely
          let vehiclePos: [number, number] | null = null;
          if (hasAssignedVehicle) {
            if (incident.assigned_vehicle_location && typeof incident.assigned_vehicle_location.lat === "number" && typeof incident.assigned_vehicle_location.lng === "number") {
              vehiclePos = [incident.assigned_vehicle_location.lat, incident.assigned_vehicle_location.lng];
            } else {
              vehiclePos = [
                roundCoord(lat + 0.016),
                roundCoord(lng - 0.014)
              ];
            }
          }

          // Determine polyline route coordinates safely
          let routeCoordinates: [number, number][] = [];
          if (hasAssignedVehicle && vehiclePos) {
            if (incident.route_geometry && incident.route_geometry.length >= 2) {
              routeCoordinates = incident.route_geometry.map((pt) => [pt[0], pt[1]]);
            } else {
              routeCoordinates = [
                vehiclePos,
                [
                  roundCoord(vehiclePos[0] * 0.65 + lat * 0.35),
                  roundCoord(vehiclePos[1] * 0.65 + lng * 0.35)
                ],
                [
                  roundCoord(vehiclePos[0] * 0.35 + lat * 0.65),
                  roundCoord(vehiclePos[1] * 0.35 + lng * 0.65)
                ],
                [lat, lng]
              ];
            }
          }

          const isFire = (incident.incident_type || "").toLowerCase().includes("fire");
          const routeColor = isFire ? "#EF4444" : "#10B981";

          return (
            <React.Fragment key={incident.incident_id}>
              {/* Incident Marker */}
              <Marker
                position={[lat, lng]}
                icon={icon}
                eventHandlers={{
                  click: () => {
                    if (onSelectIncident) {
                      onSelectIncident(incident.incident_id);
                    }
                  },
                }}
              >
                <Popup>
                  <div className="font-sans text-xs p-1 space-y-1.5 max-w-[220px]">
                    <div className="flex items-center justify-between border-b pb-1">
                      <span className="font-bold text-slate-900 font-mono text-[11px]">
                        #{incident.incident_id}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                        {incident.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-700 font-medium leading-snug">
                      📍 {incident.address || `${incident.district || "Delhi NCR"}`}
                    </div>

                    {incident.summary && (
                      <div className="text-[10px] text-slate-600 italic bg-slate-50 p-1.5 rounded">
                        "{incident.summary}"
                      </div>
                    )}

                    <div className="pt-1 border-t text-[10px] text-slate-600 flex justify-between font-mono">
                      <span>Unit: <strong className="text-slate-900">{incident.selected_vehicle || "Awaited"}</strong></span>
                      <span>ETA: <strong className="text-emerald-700">{typeof incident.eta_minutes === 'number' ? `${incident.eta_minutes.toFixed(1)}m` : "--"}</strong></span>
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* Highlighting pulse circle around the active/selected incident */}
              {isSelected && (
                <Circle
                  center={[lat, lng]}
                  radius={450}
                  pathOptions={{
                    color: "#EF4444",
                    fillColor: "#EF4444",
                    fillOpacity: 0.18,
                    weight: 2,
                    dashArray: "4, 6"
                  }}
                />
              )}

              {/* Dispatched Vehicle Marker */}
              {hasAssignedVehicle && vehiclePos && (
                <Marker
                  position={vehiclePos}
                  icon={createVehicleIcon(incident.selected_vehicle!, incident.vehicle_type)}
                >
                  <Popup>
                    <div className="font-sans text-xs p-1 space-y-1 font-mono">
                      <div className="flex items-center gap-1 font-bold text-emerald-900">
                        <span>🚑</span> {incident.selected_vehicle}
                      </div>
                      <div className="text-[10px] text-slate-600">
                        Status: <strong className="text-emerald-700">EN ROUTE</strong>
                      </div>
                      <div className="text-[10px] text-slate-600">
                        Target: <strong>#{incident.incident_id}</strong>
                      </div>
                      <div className="text-[10px] text-slate-600">
                        Est. ETA: <strong className="text-emerald-700">{typeof incident.eta_minutes === 'number' ? `${incident.eta_minutes.toFixed(1)} mins` : "6 mins"}</strong>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Connecting Emergency Route Polyline */}
              {hasAssignedVehicle && routeCoordinates.length > 1 && (
                <Polyline
                  positions={routeCoordinates}
                  pathOptions={{
                    color: routeColor,
                    weight: isSelected ? 5 : 3.5,
                    dashArray: "8, 10",
                    opacity: 0.85
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}

function roundCoord(val: number): number {
  return Math.round(val * 100000) / 100000;
}