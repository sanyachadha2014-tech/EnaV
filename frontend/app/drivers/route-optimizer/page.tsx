"use client";

import React, { useState, useEffect } from "react";
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
    Square
} from "lucide-react";

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
    chargingStops: { name: string; distance: string; kwh: string }[];
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

    // Real-time address autocomplete using Nominatim API with English accept-language header
    useEffect(() => {
        const fetchSuggestions = async (query: string, type: 'start' | 'dest') => {
            if (query.length < 3) {
                if (type === 'start') setStartSuggestions([]);
                else setDestSuggestions([]);
                return;
            }

            if (type === 'start') setStartLoading(true);
            else setDestLoading(true);

            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=en`, {
                    headers: {
                        'Accept-Language': 'en'
                    }
                });
                const data = await res.json();
                const formatted = data.map((item: any) => ({
                    place_id: item.place_id,
                    display_name: item.display_name,
                    lat: item.lat,
                    lon: item.lon,
                }));

                if (type === 'start') setStartSuggestions(formatted);
                else setDestSuggestions(formatted);
            } catch (err) {
                console.error("Failed to fetch address suggestions", err);
            } finally {
                if (type === 'start') setStartLoading(false);
                else setDestLoading(false);
            }
        };

        const timer = setTimeout(() => {
            if (startQuery && !start) fetchSuggestions(startQuery, 'start');
        }, 300);
        return () => clearTimeout(timer);
    }, [startQuery, start]);

    useEffect(() => {
        const fetchSuggestions = async (query: string) => {
            if (query.length < 3) {
                setDestSuggestions([]);
                return;
            }
            setDestLoading(true);
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=en`, {
                    headers: {
                        'Accept-Language': 'en'
                    }
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

    const handleSelectLocation = (type: 'start' | 'dest', item: LocationSuggestion) => {
        const loc: Location = { label: item.display_name, lat: parseFloat(item.lat), lon: parseFloat(item.lon) };
        if (type === 'start') {
            setStart(loc);
            setStartQuery(item.display_name);
            setStartSuggestions([]);
        } else {
            setDestination(loc);
            setDestQuery(item.display_name);
            setDestSuggestions([]);
        }
    };

    const findBestRoutes = async () => {
        if (!start || !destination) return;

        setIsOptimizing(true);
        try {
            const response = await fetch("http://127.0.0.1:8000/route/optimize", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    source: {
                        lat: start.lat,
                        lng: start.lon
                    },
                    destination: {
                        lat: destination.lat,
                        lng: destination.lon
                    },
                    vehicle: {
                        vehicle_id: "EV-2048",
                        vehicle_type: "Standard",
                        battery_capacity_kwh: 75.0,
                        battery_percentage: 85.0,
                        current_battery_soc: 85.0,
                        max_range_km: 400.0,
                        consumption_kwh_per_km: 0.15,
                        energy_consumption_rate_kwh_per_km: 0.15
                    }
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Backend Error Response:", errorText);
                throw new Error(`Failed to fetch: ${errorText}`);
            }

            const data = await response.json();
            console.log("Real-time Backend Data Received:", data);

            // Backend se aane wale real charging stations ko map karna (agar backend bhej raha ho)
            const liveChargingStops = data.charging_stops && data.charging_stops.length > 0
                ? data.charging_stops.map((station: any) => ({
                    name: station.name || "Charging Station",
                    distance: `${station.distance_km || 0} km away`,
                    kwh: station.power_kw ? `${station.power_kw} kW` : "Fast Charger"
                }))
                : [
                    { name: "EcoCharge Station Alpha", distance: "12.5 km away", kwh: "50 kW Fast" }
                ];

            const fetchedRoute: RouteOption = {
                id: data.recommended_route_id || "1",
                type: data.evaluated_routes?.[0]?.name || "Optimal Direct Route",
                description: data.reason || "Optimized path calculated via real-time backend metrics.",
                distance: `${data.distance_km ? data.distance_km.toFixed(2) : "0"} km`,
                duration: `${data.eta_minutes ? Math.round(data.eta_minutes) : "0"} mins`,
                nextAction: "Head toward main boulevard and merge.",
                co2Saved: "4.2 kg",
                chargingStops: data.charging_required && data.recommended_charger 
                    ? [{ name: data.recommended_charger.name || "Charging Station", distance: "On Route", kwh: "Fast Charger" }]
                    : []
            };

            setRoutes([fetchedRoute]);
            setSelectedRoute(fetchedRoute);
        } catch (error) {
            console.error("Backend offline, falling back to default:", error);
            const fallbackRoute: RouteOption = {
                id: "1",
                type: "Direct Navigational Route (Fallback)",
                description: "Standard routing (Backend connection failed).",
                distance: "28.4 km",
                duration: "38 mins",
                nextAction: "Proceed straight on primary route corridor.",
                co2Saved: "4.2 kg",
                chargingStops: [
                    { name: "Metro EV Powerpoint", distance: "10.2 km away", kwh: "60 kW" }
                ]
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
    };

    const completeJourney = () => {
        setIsActive(false);
        setIsCompleted(true);
        setEndTime(new Date().toLocaleString());
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
    };

    if (!isMounted) {
        return null;
    }

    const isReadyToOptimize = Boolean(start && destination);

    return (
        <div className="flex h-[calc(100vh-65px)] w-full overflow-hidden bg-[#030712] text-slate-100 font-sans">

            {/* LEFT SIDEBAR PANEL */}
            <div className="w-[440px] shrink-0 border-r border-slate-800/80 bg-[#060a14] flex flex-col z-10 shadow-2xl">

                {/* Panel Header */}
                <div className="p-5 border-b border-slate-800/60 flex items-center justify-between">
                    <div>
                        <h1 className="text-sm font-black tracking-wider uppercase text-white flex items-center gap-2">
                            <Zap className="h-4 w-4 text-cyan-400 fill-cyan-400/20" />
                            Route Planner
                        </h1>
                        <p className="text-xs text-slate-400 mt-0.5">Select locations to compute optimal paths</p>
                    </div>
                </div>

                {/* Scrollable Form & Content Area */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">

                    {/* INPUT SECTION WITH REAL-TIME ADDRESS FILLING */}
                    <div className="space-y-3 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60">
                        <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Locations</div>

                        <div className="relative">
                            <LocationSearch
                                label="Starting Point"
                                value={startQuery}
                                placeholder="Enter starting address..."
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
                                placeholder="Enter destination address..."
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

                        {/* FIND BEST ROUTES BUTTON */}
                        <button
                            type="button"
                            onClick={findBestRoutes}
                            disabled={!isReadyToOptimize || isOptimizing}
                            className={`w-full h-12 mt-2 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${isReadyToOptimize
                                ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20 cursor-pointer opacity-100"
                                : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-40 shadow-none"
                                }`}
                        >
                            {isOptimizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Find Best Routes <ChevronRight className="h-4 w-4" /></>}
                        </button>
                    </div>

                    {/* ROUTE RESULTS & ACTIONS */}
                    {selectedRoute && !isCompleted && (
                        <div className="space-y-4 animate-fadeIn">
                            <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">Optimal Route Selected</span>
                                    {isActive && <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" /> Driving Active</span>}
                                </div>
                                <h3 className="text-base font-black text-white">{selectedRoute.type}</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">{selectedRoute.description}</p>

                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/40">
                                        <div className="text-[10px] text-slate-400 uppercase">Distance Covered</div>
                                        <div className="text-sm font-black text-white mt-0.5">{selectedRoute.distance}</div>
                                    </div>
                                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/40">
                                        <div className="text-[10px] text-slate-400 uppercase">Estimated ETA</div>
                                        <div className="text-sm font-black text-white mt-0.5">{selectedRoute.duration}</div>
                                    </div>
                                </div>
                            </div>

                            {/* NEARBY CHARGING STATIONS ALONG JOURNEY */}
                            <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl space-y-2.5">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                                    <BatteryCharging className="h-3.5 w-3.5 text-emerald-400" /> Nearby Charging Stations in Journey
                                </div>
                                <div className="space-y-2">
                                    {selectedRoute.chargingStops.map((station, idx) => (
                                        <div key={idx} className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/50 flex items-center justify-between text-xs">
                                            <div>
                                                <div className="font-bold text-white">{station.name}</div>
                                                <div className="text-[10px] text-slate-400">{station.distance}</div>
                                            </div>
                                            <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 text-[10px] px-2 py-0.5 rounded font-semibold">
                                                {station.kwh}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* NEXT TURN BANNER */}
                            <div className="bg-gradient-to-r from-blue-950/40 to-slate-900/60 border border-blue-500/30 p-4 rounded-2xl">
                                <div className="text-[10px] uppercase tracking-wider text-blue-400 font-bold">Guidance Action</div>
                                <div className="text-sm font-bold text-white mt-1">{selectedRoute.nextAction}</div>
                            </div>

                            {/* START DRIVING / COMPLETE BUTTON */}
                            <button
                                type="button"
                                onClick={isActive ? completeJourney : startDriving}
                                className="w-full h-12 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                {isActive ? <><Square className="h-4 w-4 fill-current" /> Complete Journey</> : <><Play className="h-4 w-4 fill-current" /> Start Driving</>}
                            </button>
                        </div>
                    )}

                    {/* JOURNEY SUMMARY CARD */}
                    {isCompleted && selectedRoute && start && destination && (
                        <div className="bg-slate-900 border border-emerald-500/40 p-5 rounded-2xl space-y-4 shadow-2xl animate-fadeIn">
                            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <Check className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white">Journey Summary</h3>
                                    <p className="text-xs text-slate-400">Trip successfully completed</p>
                                </div>
                            </div>

                            <div className="space-y-2.5 text-xs">
                                <div className="flex justify-between py-1 border-b border-slate-800/60">
                                    <span className="text-slate-400">From:</span>
                                    <span className="font-bold text-white text-right max-w-[220px] truncate">{start.label}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-800/60">
                                    <span className="text-slate-400">To:</span>
                                    <span className="font-bold text-white text-right max-w-[220px] truncate">{destination.label}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-800/60">
                                    <span className="text-slate-400">Distance Covered:</span>
                                    <span className="font-bold text-white">{selectedRoute.distance}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-800/60">
                                    <span className="text-slate-400">Equivalent CO2 Saved:</span>
                                    <span className="font-bold text-emerald-400">{selectedRoute.co2Saved}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-slate-800/60">
                                    <span className="text-slate-400">Date & Time Taken:</span>
                                    <span className="font-bold text-white text-right">{startTime} - {endTime}</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={resetJourney}
                                className="w-full h-11 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all mt-2"
                            >
                                Plan New Journey
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT MAP CANVAS AREA */}
            <div className="flex-1 relative bg-slate-100 flex flex-col">
                <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-white/90 backdrop-blur border border-slate-200 px-3 py-2 rounded-xl shadow-xl">
                    <span className="text-xs text-slate-600 font-medium">Map View:</span>
                    <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">OpenStreetMap Light</span>
                </div>

                <div className="flex-1 w-full h-full relative">
                    {start && destination ? (
                        <iframe
                            title="Interactive Route Map"
                            width="100%"
                            height="100%"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${Math.min(start.lon, destination.lon) - 0.05}%2C${Math.min(start.lat, destination.lat) - 0.05}%2C${Math.max(start.lon, destination.lon) + 0.05}%2C${Math.max(start.lat, destination.lat) + 0.05}&layer=mapnik&marker=${start.lat}%2C${start.lon}&marker=${destination.lat}%2C${destination.lon}`}
                            className="w-full h-full border-0"
                        />
                    ) : start ? (
                        <iframe
                            title="Start Point Map"
                            width="100%"
                            height="100%"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(start.lon.toString()) - 0.02}%2C${parseFloat(start.lat.toString()) - 0.02}%2C${parseFloat(start.lon.toString()) + 0.02}%2C${parseFloat(start.lat.toString()) + 0.02}&layer=mapnik&marker=${start.lat}%2C${start.lon}`}
                            className="w-full h-full border-0"
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-200 via-slate-100 to-slate-100">
                            <div className="h-16 w-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 mb-4 shadow-xl shadow-cyan-500/5">
                                <Compass className="h-8 w-8 animate-pulse" />
                            </div>
                            <h2 className="text-lg font-black text-slate-900 tracking-wide">Enter Locations to Pinpoint on Map</h2>
                            <p className="text-xs text-slate-600 max-w-sm mt-1">Select your starting point and destination addresses to visualize routes and nearby charging stations.</p>
                        </div>
                    )}
                </div>
            </div>
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
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-2xl backdrop-blur-md max-h-48 overflow-y-auto">
            {suggestions.map((suggestion) => (
                <button
                    key={suggestion.place_id}
                    type="button"
                    onClick={() => onSelect(suggestion)}
                    className="flex w-full items-center gap-3 border-b border-slate-800/60 px-4 py-3 text-left last:border-b-0 hover:bg-slate-800/80 transition-colors"
                >
                    <MapPin className="h-4 w-4 shrink-0 text-cyan-400" />
                    <span className="text-xs font-medium text-slate-200">{suggestion.display_name}</span>
                </button>
            ))}
        </div>
    );
}