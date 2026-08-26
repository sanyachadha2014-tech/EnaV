"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Custom Leaflet marker icon configuration for dark theme UI
const customIcon = L.divIcon({
  className: "custom-map-pin",
  html: `<div style="background-color: #10B981; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 0 10px #10B981;"></div>`,
  iconSize: [14, 14],
});


export default function ChargingStationsMap() {
  return (
    <div className="w-full h-full min-h-[380px] rounded-xl overflow-hidden relative z-10">
      <MapContainer
        center={[28.6139, 77.2090]} // Delhi NCR center
        zoom={13}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%", background: "#040812" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <Marker position={[28.6139, 77.2090]} icon={customIcon}>
          <Popup className="font-mono text-xs">
            <div className="p-1">
              <strong>Connaught Place Hub</strong><br />
              Status: 120 kW (Available)
            </div>
          </Popup>
        </Marker>
        <Marker position={[28.6300, 77.1900]} icon={customIcon}>
          <Popup className="font-mono text-xs">
            <div className="p-1">
              <strong>Janakpuri Station</strong><br />
              Status: 60 kW (Reserved)
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}