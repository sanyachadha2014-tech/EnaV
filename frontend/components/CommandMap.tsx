"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css"; // MUST BE IMPORTED
import L from "leaflet";

// Fix Leaflet marker icon pathing in Next.js
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function CommandMap() {
  const position: [number, number] = [28.5921, 77.046];

  return (
    <div className="w-full h-[450px] relative z-0 rounded-xl overflow-hidden border border-slate-800">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <Marker position={position} icon={customIcon}>
          <Popup>
            <div className="font-mono text-xs text-slate-900">
              <strong>Incident #112-9842</strong>
              <br />
              Location: Dwarka Sector 14
            </div>
          </Popup>
        </Marker>

        <Circle
          center={[28.585, 77.05]}
          radius={600}
          pathOptions={{ color: "#EF4444", fillColor: "#EF4444", fillOpacity: 0.2 }}
        />
      </MapContainer>
    </div>
  );
}