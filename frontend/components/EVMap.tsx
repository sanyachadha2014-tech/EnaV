"use client";

import React, { useEffect } from "react";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    Polyline,
    useMap
} from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons in Next.js
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
}

interface Location {
    label: string;
    lat: number;
    lon: number;
}

interface EVMapProps {
    center: [number, number];
    start: Location | null;
    destination: Location | null;
    currentVehiclePos: [number, number] | null;
    travelledPath: [number, number][];
}

function MapController({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom(), { animate: true });
        }
    }, [center, map]);
    return null;
}

export default function EVMap({
    center,
    start,
    destination,
    currentVehiclePos,
    travelledPath
}: EVMapProps) {
    return (
        <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom={true}
            style={{ width: "100%", height: "100%", background: "#030712" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController center={center} />

            {start && (
                <Marker position={[start.lat, start.lon]}>
                    <Popup>
                        <div className="text-xs font-sans">
                            <strong className="text-emerald-600">Start Point:</strong>
                            <p>{start.label}</p>
                        </div>
                    </Popup>
                </Marker>
            )}

            {destination && (
                <Marker position={[destination.lat, destination.lon]}>
                    <Popup>
                        <div className="text-xs font-sans">
                            <strong className="text-cyan-600">Destination:</strong>
                            <p>{destination.label}</p>
                        </div>
                    </Popup>
                </Marker>
            )}

            {start && destination && (
                <Polyline
                    positions={[
                        [start.lat, start.lon],
                        [destination.lat, destination.lon]
                    ]}
                    color="#06b6d4"
                    weight={4}
                    opacity={0.6}
                    dashArray="8, 8"
                />
            )}

            {travelledPath.length > 1 && (
                <Polyline
                    positions={travelledPath}
                    color="#10b981"
                    weight={6}
                    opacity={0.9}
                />
            )}

            {currentVehiclePos && (
                <Marker position={currentVehiclePos}>
                    <Popup>
                        <div className="text-xs font-sans">
                            <strong className="text-emerald-500">Live Vehicle Telemetry</strong>
                            <p>Lat: {currentVehiclePos[0].toFixed(4)}, Lon: {currentVehiclePos[1].toFixed(4)}</p>
                        </div>
                    </Popup>
                </Marker>
            )}
        </MapContainer>
    );
}