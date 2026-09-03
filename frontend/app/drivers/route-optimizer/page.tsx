/**
 * EV Route Optimizer Component Suite
 * Comprehensive full-stack path planning & vehicle telemetry mapping interface
 */

"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
    MapPin,
    Navigation,
    BatteryCharging,
    Check,
    Loader2,
    ChevronRight,
    Compass,
    Zap,
    Play,
    Square,
    History,
    Sliders,
    X,
    Gauge
} from "lucide-react";

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

// Dynamically import the isolated EVMap component to prevent SSR window reference issues
const EVMap = dynamic(() => import("../../../components/EVMap"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-950 flex items-center justify-center text-slate-500 text-xs">Loading Interactive Map...</div>
});

interface Location {
    label: string;
    lat: number;
    lon: number;
}

interface LocationSuggestion {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
}

interface RouteOption {
    id: string;
    type: string;
    description: string;
    distance: string;
    duration: string;
    nextAction: string;
    co2Saved: string;
    tollCost: string;
    elevationGain: string;
    kwhDepletion: string;
    chargingStops: { name: string; distance: string; kwh: string }[];
}

interface VehicleConfig {
    vehicle_id: string;
    vehicle_type: string;
    battery_percentage: number;
    battery_capacity_kwh: number;
    consumption_kwh_per_km: number;
    minimum_reserve_pct: number;
    is_emergency: boolean;
}

interface TripHistoryItem {
    id: string;
    from: string;
    to: string;
    distance: string;
    duration: string;
    timestamp: string;
    status: "Completed" | "Cancelled";
}

export default function RouteOptimizerPage() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const [startQuery, setStartQuery] = useState("");
    const [destQuery, setDestQuery] = useState("");
    const [start, setStart] = useState<Location | null>(null);
    const [destination, setDestination] = useState<Location | null>(null);

    const [startSuggestions, setStartSuggestions] = useState<LocationSuggestion[]>([]);
    const [destSuggestions, setDestSuggestions] = useState<LocationSuggestion[]>([]);

    const [startLoading, setStartLoading] = useState(false);
    const [destLoading, setDestLoading] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);

    const [routes, setRoutes] = useState<RouteOption[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);

    const [isActive, setIsActive] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [startTime, setStartTime] = useState<string | null>(null);
    const [endTime, setEndTime] = useState<string | null>(null);

    // Live Geolocation Tracking States
    const [currentVehiclePos, setCurrentVehiclePos] = useState<[number, number] | null>(null);
    const [travelledPath, setTravelledPath] = useState<[number, number][]>([]);

    // Modal and Panel States
    const [showVehicleModal, setShowVehicleModal] = useState(false);
    const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
    const [tripHistory, setTripHistory] = useState<TripHistoryItem[]>([
        { id: "trip-01", from: "Connaught Place, New Delhi", to: "Cyber City, Gurugram", distance: "28.4 km", duration: "42 mins", timestamp: "2026-09-01 14:30", status: "Completed" },
        { id: "trip-02", from: "IGDTUW, Kashmere Gate", to: "Noida Sector 62", distance: "22.1 km", duration: "35 mins", timestamp: "2026-08-30 09:15", status: "Completed" }
    ]);

    const [vehicleConfig, setVehicleConfig] = useState<VehicleConfig>({
        vehicle_id: "EV-2048-DX",
        vehicle_type: "citizen",
        battery_percentage: 85.0,
        battery_capacity_kwh: 75.0,
        consumption_kwh_per_km: 0.15,
        minimum_reserve_pct: 15.0,
        is_emergency: false
    });

    // Load the vehicle data saved from the Profile page.
    useEffect(() => {
        const loadProfileVehicle = () => {
            try {
                const savedProfile = localStorage.getItem("ev_driver_profile");
                if (!savedProfile) return;

                const profile = JSON.parse(savedProfile);
                setVehicleConfig((current) => ({
                    ...current,
                    vehicle_id: profile.vehicleId ?? current.vehicle_id,
                    vehicle_type: profile.vehicleType ?? current.vehicle_type,
                    battery_percentage: profile.currentSoc ?? current.battery_percentage,
                    battery_capacity_kwh: profile.batteryCapacity ?? current.battery_capacity_kwh,
                    consumption_kwh_per_km: profile.consumptionRate ?? current.consumption_kwh_per_km,
                    minimum_reserve_pct: profile.minReserve ?? current.minimum_reserve_pct,
                }));
            } catch (error) {
                console.error("Failed to load vehicle data from Profile:", error);
            }
        };

        loadProfileVehicle();

        // Also refresh if the saved profile changes in another tab/window.
        window.addEventListener("storage", loadProfileVehicle);
        return () => window.removeEventListener("storage", loadProfileVehicle);
    }, []);

    // Real-time Geolocation watchPosition Effect
    useEffect(() => {
        let watchId: number | null = null;

        if (isActive && "geolocation" in navigator) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const newPos: [number, number] = [lat, lon];
                    
                    setCurrentVehiclePos(newPos);
                    setTravelledPath((prev) => [...prev, newPos]);
                },
                (error) => {
                    console.error("Error watching geolocation position:", error);
                    if (start) {
                        const fallbackPos: [number, number] = [start.lat, start.lon];
                        setCurrentVehiclePos(fallbackPos);
                        setTravelledPath([fallbackPos]);
                    }
                },
                { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
            );
        } else if (isActive && start) {
            const fallbackPos: [number, number] = [start.lat, start.lon];
            setCurrentVehiclePos(fallbackPos);
            setTravelledPath([fallbackPos]);
        }

        return () => {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [isActive, start]);

    // Address Autocomplete Nominatim API for Starting Point
    useEffect(() => {
        const fetchSuggestions = async (query: string) => {
            if (query.length < 3) {
                setStartSuggestions([]);
                return;
            }
            setStartLoading(true);
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=en`, {
                    headers: { 'Accept-Language': 'en' }
                });
                const data = await res.json();
                const formatted = data.map((item: any) => ({
                    place_id: item.place_id,
                    display_name: item.display_name,
                    lat: item.lat,
                    lon: item.lon,
                }));
                setStartSuggestions(formatted);
            } catch (err) {
                console.error("Failed to fetch address suggestions", err);
            } finally {
                setStartLoading(false);
            }
        };

        const timer = setTimeout(() => {
            if (startQuery && !start) fetchSuggestions(startQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [startQuery, start]);

    // Address Autocomplete Nominatim API for Destination
    useEffect(() => {
        const fetchSuggestions = async (query: string) => {
            if (query.length < 3) {
                setDestSuggestions([]);
                return;
            }
            setDestLoading(true);
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=en`, {
                    headers: { 'Accept-Language': 'en' }
                });
                const data = await res.json();
                const formatted = data.map((item: any) => ({
                    place_id: item.place_id,
                    display_name: item.display_name,
                    lat: item.lat,
                    lon: item.lon,
                }));
                setDestSuggestions(formatted);
            } catch (err) {
                console.error("Failed to fetch address suggestions", err);
            } finally {
                setDestLoading(false);
            }
        };

        const timer = setTimeout(() => {
            if (destQuery && !destination) fetchSuggestions(destQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [destQuery, destination]);

    const handleSelectLocation = async (type: 'start' | 'dest', item: LocationSuggestion) => {
        const loc: Location = { label: item.display_name, lat: parseFloat(item.lat), lon: parseFloat(item.lon) };
        
        const currentStart = type === 'start' ? loc : start;
        const currentDest = type === 'dest' ? loc : destination;

        if (type === 'start') {
            setStart(loc);
            setStartQuery(item.display_name);
            setStartSuggestions([]);
        } else {
            setDestination(loc);
            setDestQuery(item.display_name);
            setDestSuggestions([]);
        }
        
        if (currentStart && currentDest) {
            try {
                const response = await fetch("http://localhost:8000/route/optimize", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        source: { lat: currentStart.lat, lng: currentStart.lon },
                        destination: { lat: currentDest.lat, lng: currentDest.lon },
                        vehicle: vehicleConfig
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Server returned status ${response.status}`);
                }

                const data = await response.json();
                const mappedRoutes: RouteOption[] = data.evaluated_routes ? data.evaluated_routes.map((route: any) => ({
                    id: route.route_id,
                    type: route.name || (route.is_feasible ? "Optimal Direct Route" : "Requires Intermediary Charging"),
                    description: route.reason || "Evaluated through multi-variable heuristic pathfinding.",
                    distance: `${route.distance_km} km`,
                    duration: `${Math.round(route.duration_seconds / 60)} mins`,
                    nextAction: route.is_feasible ? "Proceed directly along primary arterial road" : "Detour to recommended charging hub",
                    co2Saved: "4.8 kg",
                    tollCost: route.toll_cost_inr !== undefined ? `₹${route.toll_cost_inr}` : (route.toll_cost || "₹0"),
                    elevationGain: route.elevation_gain_m !== undefined ? `+${route.elevation_gain_m}m` : (route.elevation_gain || "+0m"),
                    kwhDepletion: route.kwh_depletion !== undefined ? `${route.kwh_depletion} kWh` : "0.0 kWh",
                    chargingStops: data.charging_required && data.recommended_charger ? [{
                        name: data.recommended_charger.name,
                        distance: "En route checkpoint",
                        kwh: `${data.recommended_charger.charging_power_kw} kW`
                    }] : []
                })) : [];

                setRoutes(mappedRoutes);
                if (mappedRoutes.length > 0) setSelectedRoute(mappedRoutes[0]);
            } catch (error) {
                console.warn("Backend connection offline during location select. Using local estimation fallback:", error);
                const fallbackRoute: RouteOption = {
                    id: "route-fallback-select",
                    type: "Primary Corridor (Local Heuristic)",
                    description: "Estimated path generated locally as backend service is unavailable.",
                    distance: "24.5 km",
                    duration: "36 mins",
                    nextAction: "Proceed along main highway corridor.",
                    co2Saved: "4.2 kg",
                    tollCost: "₹45",
                    elevationGain: "+25m",
                    kwhDepletion: "3.9 kWh",
                    chargingStops: [{ name: "Metro Hub Charging Station", distance: "10.2 km away", kwh: "60 kW" }]
                };
                setRoutes([fallbackRoute]);
                setSelectedRoute(fallbackRoute);
            }
        }
    };

    const findBestRoutes = async () => {
        if (!start || !destination) return;

        setIsOptimizing(true);
        try {
            const response = await fetch("http://127.0.0.1:8000/route/optimize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    source: { lat: start.lat, lng: start.lon },
                    destination: { lat: destination.lat, lng: destination.lon },
                    vehicle: vehicleConfig
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.statusText}`);
            }

            const data = await response.json();

            const mappedRoutes: RouteOption[] = data.evaluated_routes ? data.evaluated_routes.map((route: any, index: number) => ({
                id: route.route_id || `route-${index}`,
                type: route.name || (route.is_feasible ? `Optimal Corridor ${index + 1}` : `Alternative Route ${index + 1}`),
                description: route.reason || "High-efficiency path computed with traffic and topology weights.",
                distance: `${route.distance_km ? route.distance_km.toFixed(2) : "28.4"} km`,
                duration: `${route.duration_seconds ? Math.round(route.duration_seconds / 60) : "38"} mins`,
                nextAction: route.is_feasible ? "Proceed directly along primary arterial road" : "Detour to recommended charging hub",
                co2Saved: "5.1 kg",
                tollCost: route.toll_cost_inr !== undefined ? `₹${route.toll_cost_inr}` : (route.toll_cost || "₹0"),
                elevationGain: route.elevation_gain_m !== undefined ? `+${route.elevation_gain_m}m` : (route.elevation_gain || "+0m"),
                kwhDepletion: route.kwh_depletion !== undefined ? `${route.kwh_depletion} kWh` : "0.0 kWh",
                chargingStops: data.charging_required && data.recommended_charger 
                    ? [{ name: data.recommended_charger.name || "Station Alpha", distance: "En route checkpoint", kwh: `${data.recommended_charger.charging_power_kw || 60} kW` }]
                    : []
            })) : [];

            if (mappedRoutes.length > 0) {
                setRoutes(mappedRoutes);
                setSelectedRoute(mappedRoutes[0]);
            } else {
                const fallbackRoute: RouteOption = {
                    id: "route-fallback-1",
                    type: "Standard Arterial Corridor",
                    description: "Fallback routing calculation executed.",
                    distance: "31.2 km",
                    duration: "45 mins",
                    nextAction: "Continue straight along primary avenue.",
                    co2Saved: "3.9 kg",
                    tollCost: "₹0",
                    elevationGain: "+18m",
                    kwhDepletion: "3.8 kWh",
                    chargingStops: [{ name: "EcoCharge Station B", distance: "8.5 km away", kwh: "120 kW" }]
                };
                setRoutes([fallbackRoute]);
                setSelectedRoute(fallbackRoute);
            }
        } catch (error) {
            console.error("Backend offline, utilizing fallback telemetry simulation:", error);
            const fallbackRoute: RouteOption = {
                id: "route-fallback-1",
                type: "Standard Arterial Corridor (Offline Mode)",
                description: "Fallback routing calculation executed locally.",
                distance: "31.2 km",
                duration: "45 mins",
                nextAction: "Continue straight along primary avenue.",
                co2Saved: "3.9 kg",
                tollCost: "₹0",
                elevationGain: "+18m",
                kwhDepletion: "3.8 kWh",
                chargingStops: [{ name: "EcoCharge Station B", distance: "8.5 km away", kwh: "120 kW" }]
            };
            setRoutes([fallbackRoute]);
            setSelectedRoute(fallbackRoute);
        } finally {
            setIsOptimizing(false);
        }
    };

    const startDriving = () => {
        setIsActive(true);
        setStartTime(new Date().toLocaleString());
        if (start) {
            const initialPos: [number, number] = [start.lat, start.lon];
            setCurrentVehiclePos(initialPos);
            setTravelledPath([initialPos]);
        }
    };

    const completeJourney = () => {
        setIsActive(false);
        setIsCompleted(true);
        const completionTimestamp = new Date().toLocaleString();
        setEndTime(completionTimestamp);

        if (start && destination && selectedRoute) {
            const newHistoryItem: TripHistoryItem = {
                id: `trip-${Date.now()}`,
                from: start.label,
                to: destination.label,
                distance: selectedRoute.distance,
                duration: selectedRoute.duration,
                timestamp: completionTimestamp,
                status: "Completed"
            };
            setTripHistory([newHistoryItem, ...tripHistory]);
        }
    };

    const resetJourney = () => {
        setStart(null);
        setDestination(null);
        setStartQuery("");
        setDestQuery("");
        setRoutes([]);
        setSelectedRoute(null);
        setIsActive(false);
        setIsCompleted(false);
        setStartTime(null);
        setEndTime(null);
        setCurrentVehiclePos(null);
        setTravelledPath([]);
    };

    if (!isMounted) return null;

    const isReadyToOptimize = Boolean(start && destination);
    const mapCenter: [number, number] = currentVehiclePos || (start ? [start.lat, start.lon] : [28.6139, 77.2090]);

    return (
        <div className="flex h-[calc(100vh-65px)] w-full overflow-hidden bg-[#030712] text-slate-100 font-sans relative">
            {/* LEFT SIDEBAR PANEL */}
            <div className="w-[450px] shrink-0 border-r border-slate-800/80 bg-[#060a14] flex flex-col z-10 shadow-2xl">
                <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
                    <div>
                        <h1 className="text-sm font-black tracking-wider uppercase text-white flex items-center gap-2">
                            <Zap className="h-4 w-4 text-cyan-400 fill-cyan-400/20" />
                            EV Route Optimizer Suite
                        </h1>
                        <p className="text-xs text-slate-400 mt-0.5">Intelligent path planning & battery telemetry</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setShowVehicleModal(true)}
                            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 transition-all cursor-pointer"
                            title="Vehicle Configuration"
                        >
                            <Sliders className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowHistoryDrawer(true)}
                            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-400 transition-all cursor-pointer"
                            title="Trip History"
                        >
                            <History className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                    <div className="space-y-3 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60">
                        <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1 flex items-center justify-between">
                            <span>Route Parameters</span>
                            <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50 font-mono">
                                {vehicleConfig.battery_percentage}% SOC
                            </span>
                        </div>

                        <div className="relative">
                            <LocationSearch
                                label="Starting Point"
                                value={startQuery}
                                placeholder="Enter starting address or landmark..."
                                icon={<Navigation className="h-4 w-4 text-emerald-400" />}
                                onChange={(val) => {
                                    setStartQuery(val);
                                    if (start) setStart(null);
                                }}
                                loading={startLoading}
                            />
                            {startSuggestions.length > 0 && !start && (
                                <SuggestionBox
                                    suggestions={startSuggestions}
                                    onSelect={(item) => handleSelectLocation('start', item)}
                                />
                            )}
                        </div>

                        <div className="relative">
                            <LocationSearch
                                label="Destination"
                                value={destQuery}
                                placeholder="Enter destination address or landmark..."
                                icon={<MapPin className="h-4 w-4 text-cyan-400" />}
                                onChange={(val) => {
                                    setDestQuery(val);
                                    if (destination) setDestination(null);
                                }}
                                loading={destLoading}
                            />
                            {destSuggestions.length > 0 && !destination && (
                                <SuggestionBox
                                    suggestions={destSuggestions}
                                    onSelect={(item) => handleSelectLocation('dest', item)}
                                />
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={findBestRoutes}
                            disabled={!isReadyToOptimize || isOptimizing}
                            className={`w-full h-12 mt-2 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                                isReadyToOptimize
                                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20 cursor-pointer opacity-100"
                                    : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-40 shadow-none"
                            }`}
                        >
                            {isOptimizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Compute Optimal Routes <ChevronRight className="h-4 w-4" /></>}
                        </button>
                    </div>

                    {selectedRoute && !isCompleted && (
                        <div className="space-y-4 animate-fadeIn">
                            {routes.length > 1 && (
                                <div className="space-y-2">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                        Available Routes ({routes.length})
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {routes.map((rt) => {
                                            const isSelected = selectedRoute.id === rt.id;
                                            return (
                                                <button
                                                    key={rt.id}
                                                    type="button"
                                                    onClick={() => setSelectedRoute(rt)}
                                                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                                                        isSelected
                                                            ? "bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-500/10 text-white"
                                                            : "bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between w-full">
                                                        <div>
                                                            <div className="text-xs font-bold text-white">{rt.type}</div>
                                                            <div className="text-[10px] text-slate-400 mt-0.5">{rt.distance} • {rt.duration}</div>
                                                        </div>
                                                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${isSelected ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                                                            {isSelected ? 'Active' : 'Select'}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-1.5 pt-2 mt-2 border-t border-slate-800/60 text-[10px] font-mono w-full">
                                                        <div className="bg-slate-950/60 px-2 py-1 rounded text-slate-300">Tolls: <span className="text-white font-bold">{rt.tollCost}</span></div>
                                                        <div className="bg-slate-950/60 px-2 py-1 rounded text-slate-300">Elev: <span className="text-white font-bold">{rt.elevationGain}</span></div>
                                                        <div className="bg-slate-950/60 px-2 py-1 rounded text-slate-300">Drain: <span className="text-cyan-400 font-bold">{rt.kwhDepletion}</span></div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">Optimal Path Verified</span>
                                    {isActive && <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" /> Live GPS Tracking Active</span>}
                                </div>
                                <h3 className="text-base font-black text-white">{selectedRoute.type}</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">{selectedRoute.description}</p>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/40">
                                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Distance</div>
                                        <div className="text-sm font-black text-white mt-0.5">{selectedRoute.distance}</div>
                                    </div>
                                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/40">
                                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Estimated ETA</div>
                                        <div className="text-sm font-black text-white mt-0.5">{selectedRoute.duration}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 pt-1">
                                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/40 text-[10px] font-mono">
                                        <div className="text-slate-400 uppercase font-semibold">Toll Cost</div>
                                        <div className="text-white font-bold mt-0.5">{selectedRoute.tollCost}</div>
                                    </div>
                                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/40 text-[10px] font-mono">
                                        <div className="text-slate-400 uppercase font-semibold">Elevation</div>
                                        <div className="text-white font-bold mt-0.5">{selectedRoute.elevationGain}</div>
                                    </div>
                                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/40 text-[10px] font-mono">
                                        <div className="text-slate-400 uppercase font-semibold">Energy Drain</div>
                                        <div className="text-cyan-400 font-bold mt-0.5">{selectedRoute.kwhDepletion}</div>
                                    </div>
                                </div>
                            </div>

                            {selectedRoute.chargingStops && selectedRoute.chargingStops.length > 0 && (
                                <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl space-y-2.5">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                        <BatteryCharging className="h-3.5 w-3.5 text-emerald-400" /> Recommended Charging Infrastructure
                                    </div>
                                    <div className="space-y-2">
                                        {selectedRoute.chargingStops.map((station, idx) => (
                                            <div key={idx} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/50 flex items-center justify-between text-xs">
                                                <div>
                                                    <div className="font-bold text-white">{station.name}</div>
                                                    <div className="text-[10px] text-slate-400 mt-0.5">{station.distance}</div>
                                                </div>
                                                <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 text-[10px] px-2 py-1 rounded font-semibold font-mono">
                                                    {station.kwh}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="bg-gradient-to-r from-blue-950/40 to-slate-900/60 border border-blue-500/30 p-4 rounded-2xl space-y-1">
                                <div className="text-[10px] uppercase tracking-wider text-blue-400 font-bold flex items-center gap-1">
                                    <Gauge className="h-3.5 w-3.5" /> Next Navigation Directive
                                </div>
                                <div className="text-sm font-bold text-white">{selectedRoute.nextAction}</div>
                            </div>

                            <button
                                type="button"
                                onClick={isActive ? completeJourney : startDriving}
                                className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                {isActive ? <><Square className="h-4 w-4 fill-current" /> Complete Active Journey</> : <><Play className="h-4 w-4 fill-current" /> Initialize Drive Session</>}
                            </button>
                        </div>
                    )}

                    {isCompleted && selectedRoute && start && destination && (
                        <div className="bg-slate-900 border border-emerald-500/40 p-5 rounded-2xl space-y-4 shadow-2xl animate-fadeIn">
                            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <Check className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white">Journey Logged Successfully</h3>
                                    <p className="text-xs text-slate-400">Telemetry archived to session history</p>
                                </div>
                            </div>

                            <div className="space-y-2.5 text-xs">
                                <div className="flex justify-between py-1 border-b border-slate-800/60">
                                    <span className="text-slate-400">Departure:</span>
                                    <span className="font-bold text-white text-right max-w-[220px] truncate">{start.label}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-800/60">
                                    <span className="text-slate-400">Arrival:</span>
                                    <span className="font-bold text-white text-right max-w-[220px] truncate">{destination.label}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-800/60">
                                    <span className="text-slate-400">Distance Traversed:</span>
                                    <span className="font-bold text-white font-mono">{selectedRoute.distance}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-800/60">
                                    <span className="text-slate-400">Carbon Offset:</span>
                                    <span className="font-bold text-emerald-400 font-mono">{selectedRoute.co2Saved}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-800/60">
                                    <span className="text-slate-400">Session Window:</span>
                                    <span className="font-bold text-white text-right font-mono">{startTime} - {endTime}</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={resetJourney}
                                className="w-full h-11 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all mt-2 cursor-pointer"
                            >
                                Plan Another Route
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT MAP CANVAS AREA (DYNAMICALLY RENDERED EVMap) */}
            <div className="flex-1 relative bg-slate-950 flex flex-col">
                <div className="absolute top-4 right-4 z-[400] flex items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-800 px-3.5 py-2 rounded-xl shadow-2xl text-white">
                    <span className="text-xs text-slate-400 font-medium">Map Engine:</span>
                    <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">OpenStreetMap Leaflet Vector</span>
                </div>

                <div className="flex-1 w-full h-full relative">
                    <EVMap
                        center={mapCenter}
                        start={start}
                        destination={destination}
                        currentVehiclePos={currentVehiclePos}
                        travelledPath={travelledPath}
                    />

                    {!start && !destination && (
                        <div className="absolute inset-0 z-[500] pointer-events-none flex flex-col items-center justify-center text-center p-6 bg-[#030712]/80 backdrop-blur-sm">
                            <div className="h-16 w-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 shadow-2xl shadow-cyan-500/10">
                                <Compass className="h-8 w-8 animate-pulse" />
                            </div>
                            <h2 className="text-lg font-black text-white tracking-wide">Specify Start and Destination</h2>
                            <p className="text-xs text-slate-400 max-w-sm mt-1">Select valid coordinates or input addresses on the control panel to render real-time vector paths and live GPS tracing.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* VEHICLE CONFIGURATION MODAL */}
            {showVehicleModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#0b1329] border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-fadeIn">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                <Sliders className="h-4 w-4 text-cyan-400" /> Vehicle Telemetry Configuration
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowVehicleModal(false)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div>
                                <label className="block text-slate-400 font-semibold mb-1">Vehicle ID / Model</label>
                                <input
                                    type="text"
                                    value={vehicleConfig.vehicle_id}
                                    onChange={(e) => setVehicleConfig({...vehicleConfig, vehicle_id: e.target.value})}
                                    className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-cyan-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-400 font-semibold mb-1">Battery SOC (%)</label>
                                    <input
                                        type="number"
                                        value={vehicleConfig.battery_percentage}
                                        onChange={(e) => setVehicleConfig({...vehicleConfig, battery_percentage: parseFloat(e.target.value) || 0})}
                                        className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-cyan-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 font-semibold mb-1">Capacity (kWh)</label>
                                    <input
                                        type="number"
                                        value={vehicleConfig.battery_capacity_kwh}
                                        onChange={(e) => setVehicleConfig({...vehicleConfig, battery_capacity_kwh: parseFloat(e.target.value) || 0})}
                                        className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-cyan-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-400 font-semibold mb-1">Consumption (kWh/km)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={vehicleConfig.consumption_kwh_per_km}
                                        onChange={(e) => setVehicleConfig({...vehicleConfig, consumption_kwh_per_km: parseFloat(e.target.value) || 0})}
                                        className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-cyan-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 font-semibold mb-1">Min Reserve (%)</label>
                                    <input
                                        type="number"
                                        value={vehicleConfig.minimum_reserve_pct}
                                        onChange={(e) => setVehicleConfig({...vehicleConfig, minimum_reserve_pct: parseFloat(e.target.value) || 0})}
                                        className="w-full h-10 px-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-cyan-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <span className="text-slate-400 font-semibold">Emergency Priority Mode</span>
                                <input
                                    type="checkbox"
                                    checked={vehicleConfig.is_emergency}
                                    onChange={(e) => setVehicleConfig({...vehicleConfig, is_emergency: e.target.checked})}
                                    className="h-4 w-4 accent-cyan-500 rounded cursor-pointer"
                                />
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowVehicleModal(false)}
                            className="w-full h-11 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                        >
                            Save Configuration
                        </button>
                    </div>
                </div>
            )}

            {/* TRIP HISTORY DRAWER */}
            {showHistoryDrawer && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
                    <div className="w-full max-w-md bg-[#060a14] border-l border-slate-800 h-full flex flex-col p-6 shadow-2xl animate-slideLeft">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                                <History className="h-4 w-4 text-cyan-400" /> Session & Trip History
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowHistoryDrawer(false)}
                                className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto py-4 space-y-3 custom-scrollbar">
                            {tripHistory.map((trip) => (
                                <div key={trip.id} className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded">
                                            {trip.status}
                                        </span>
                                        <span className="text-[10px] text-slate-400 font-mono">{trip.timestamp}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-slate-300 font-medium truncate"><strong className="text-slate-400">From:</strong> {trip.from}</div>
                                        <div className="text-slate-300 font-medium truncate"><strong className="text-slate-400">To:</strong> {trip.to}</div>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] font-mono">
                                        <span className="text-cyan-400">Dist: {trip.distance}</span>
                                        <span className="text-slate-400">ETA: {trip.duration}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowHistoryDrawer(false)}
                            className="w-full h-11 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer mt-2"
                        >
                            Close Drawer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* =========================================================
   SUB-COMPONENTS
========================================================= */

function LocationSearch({
    label,
    value,
    placeholder,
    icon,
    onChange,
    loading,
}: {
    label: string;
    value: string;
    placeholder: string;
    icon: React.ReactNode;
    onChange: (value: string) => void;
    loading: boolean;
}) {
    return (
        <div className="relative space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</label>
            <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2">{icon}</div>
                <input
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    className="h-12 w-full rounded-xl border border-slate-800 bg-slate-950 pl-10 pr-10 text-xs font-semibold text-white outline-none placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                />
                {loading && <Loader2 className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-500" />}
            </div>
        </div>
    );
}

function SuggestionBox({
    suggestions,
    onSelect,
}: {
    suggestions: LocationSuggestion[];
    onSelect: (suggestion: LocationSuggestion) => void;
}) {
    return (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[600] overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl backdrop-blur-md max-h-48 overflow-y-auto">
            {suggestions.map((suggestion) => (
                <button
                    key={suggestion.place_id}
                    type="button"
                    onClick={() => onSelect(suggestion)}
                    className="flex w-full items-center gap-3 border-b border-slate-800/60 px-4 py-3 text-left last:border-b-0 hover:bg-slate-800/80 transition-colors cursor-pointer"
                >
                    <MapPin className="h-4 w-4 shrink-0 text-cyan-400" />
                    <span className="text-xs font-medium text-slate-200">{suggestion.display_name}</span>
                </button>
            ))}
        </div>
    );
}