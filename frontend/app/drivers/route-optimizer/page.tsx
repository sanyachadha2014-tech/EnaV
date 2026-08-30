"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    BatteryCharging,
    Check,
    ChevronRight,
    Crosshair,
    LocateFixed,
    Loader2,
    MapPin,
    Navigation,
    Route,
    Search,
    X,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type JourneyState =
    | "planning"
    | "routes"
    | "selected"
    | "active"
    | "completed";

type LocationMode = "gps" | "manual";

type LocationSuggestion = {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
};

type SelectedLocation = {
    label: string;
    lat: number;
    lon: number;
};

type RouteOption = {
    id: number;
    type: "Fastest" | "Shortest" | "Alternative";
    distance: string;
    duration: string;
    description: string;
    nextAction: string;
};

/* =========================================================
   HELPERS
========================================================= */

function makeRouteOptions(
    start: SelectedLocation,
    destination: SelectedLocation,
): RouteOption[] {
    const distance = haversineDistance(
        start.lat,
        start.lon,
        destination.lat,
        destination.lon,
    );

    const baseMinutes = Math.max(
        8,
        Math.round((distance / 32) * 60),
    );

    const shortestDistance = Math.max(
        1,
        Math.round(distance * 10) / 10,
    );

    return [
        {
            id: 1,
            type: "Fastest",
            distance: `${Math.max(
                1,
                Math.round(shortestDistance * 1.08 * 10) / 10,
            )} km`,
            duration: `${Math.max(5, baseMinutes - 4)} min`,
            description: "Prioritises travel time.",
            nextAction: "Follow the fastest available route.",
        },
        {
            id: 2,
            type: "Shortest",
            distance: `${shortestDistance} km`,
            duration: `${Math.max(5, baseMinutes + 1)} min`,
            description: "Prioritises shorter distance.",
            nextAction: "Follow the shortest available route.",
        },
        {
            id: 3,
            type: "Alternative",
            distance: `${Math.max(
                1,
                Math.round(shortestDistance * 1.15 * 10) / 10,
            )} km`,
            duration: `${Math.max(6, baseMinutes + 6)} min`,
            description: "Alternative route option.",
            nextAction: "Follow the alternative route.",
        },
    ];
}

function haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
) {
    const earthRadius = 6371;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return (
        earthRadius *
        2 *
        Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    );
}

function toRadians(value: number) {
    return (value * Math.PI) / 180;
}

/* =========================================================
   PAGE
========================================================= */

export default function RouteOptimizerPage() {
    const [journeyState, setJourneyState] =
        useState<JourneyState>("planning");

    const [startMode, setStartMode] =
        useState<LocationMode>("gps");

    const [start, setStart] =
        useState<SelectedLocation | null>(null);

    const [destination, setDestination] =
        useState<SelectedLocation | null>(null);

    const [destinationQuery, setDestinationQuery] =
        useState("");

    const [destinationSuggestions, setDestinationSuggestions] =
        useState<LocationSuggestion[]>([]);

    const [manualStartQuery, setManualStartQuery] =
        useState("");

    const [manualStartSuggestions, setManualStartSuggestions] =
        useState<LocationSuggestion[]>([]);

    const [selectedRoute, setSelectedRoute] =
        useState<RouteOption | null>(null);

    const [routes, setRoutes] =
        useState<RouteOption[]>([]);

    const [gpsLoading, setGpsLoading] =
        useState(false);

    const [gpsMessage, setGpsMessage] =
        useState("");

    const [searchLoading, setSearchLoading] =
        useState(false);

    const [manualStartLoading, setManualStartLoading] =
        useState(false);

    const [locationReady, setLocationReady] =
        useState(false);

    /* =======================================================
       AUTO DETECT GPS ON FIRST LOAD
    ======================================================= */

    useEffect(() => {
        detectCurrentLocation();
    }, []);

    /* =======================================================
       GPS
    ======================================================= */

    function detectCurrentLocation() {
        if (!navigator.geolocation) {
            setStartMode("manual");
            setGpsMessage(
                "GPS is not supported. Enter your location manually.",
            );
            return;
        }

        setGpsLoading(true);
        setGpsMessage("");

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                try {
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
                        {
                            headers: {
                                "Accept-Language": "en",
                            },
                        },
                    );

                    if (!response.ok) {
                        throw new Error("Reverse geocoding failed");
                    }

                    const data = await response.json();

                    const readableLocation =
                        data.display_name ||
                        "Current location";

                    setStart({
                        label: readableLocation,
                        lat,
                        lon,
                    });

                    setLocationReady(true);
                    setGpsMessage(
                        "Your current location has been detected.",
                    );
                } catch {
                    /*
                      GPS itself worked, but readable address lookup failed.
                      We keep the coordinates internally and display a neutral
                      readable label instead of exposing raw coordinates.
                    */

                    setStart({
                        label: "Current location",
                        lat,
                        lon,
                    });

                    setLocationReady(true);
                    setGpsMessage(
                        "Current location detected.",
                    );
                } finally {
                    setGpsLoading(false);
                }
            },
            (error) => {
                setGpsLoading(false);
                setLocationReady(false);

                if (error.code === 1) {
                    setGpsMessage(
                        "Location permission was denied. Enter your location manually.",
                    );
                } else if (error.code === 2) {
                    setGpsMessage(
                        "Your location could not be detected. Enter it manually.",
                    );
                } else {
                    setGpsMessage(
                        "Location detection timed out. Enter it manually.",
                    );
                }

                setStartMode("manual");
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 30000,
            },
        );
    }

    /* =======================================================
       SEARCH HELPER
    ======================================================= */

    async function searchPlaces(
        query: string,
        type: "destination" | "start",
    ) {
        if (!query.trim()) {
            if (type === "destination") {
                setDestinationSuggestions([]);
            } else {
                setManualStartSuggestions([]);
            }

            return;
        }

        if (type === "destination") {
            setSearchLoading(true);
        } else {
            setManualStartLoading(true);
        }

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(
                    query,
                )}`,
                {
                    headers: {
                        "Accept-Language": "en",
                    },
                },
            );

            if (!response.ok) {
                throw new Error("Search failed");
            }

            const data: LocationSuggestion[] =
                await response.json();

            if (type === "destination") {
                setDestinationSuggestions(data);
            } else {
                setManualStartSuggestions(data);
            }
        } catch {
            if (type === "destination") {
                setDestinationSuggestions([]);
            } else {
                setManualStartSuggestions([]);
            }
        } finally {
            if (type === "destination") {
                setSearchLoading(false);
            } else {
                setManualStartLoading(false);
            }
        }
    }

    /* =======================================================
       DESTINATION SELECT
    ======================================================= */

    function selectDestination(
        suggestion: LocationSuggestion,
    ) {
        setDestination({
            label: suggestion.display_name,
            lat: Number(suggestion.lat),
            lon: Number(suggestion.lon),
        });

        setDestinationQuery("");
        setDestinationSuggestions([]);
    }

    /* =======================================================
       MANUAL START SELECT
    ======================================================= */

    function selectManualStart(
        suggestion: LocationSuggestion,
    ) {
        setStart({
            label: suggestion.display_name,
            lat: Number(suggestion.lat),
            lon: Number(suggestion.lon),
        });

        setLocationReady(true);
        setManualStartQuery("");
        setManualStartSuggestions([]);
    }

    /* =======================================================
       OPTIMIZE
    ======================================================= */

    function optimizeRoute() {
        if (!start || !destination) return;

        const options = makeRouteOptions(
            start,
            destination,
        );

        setRoutes(options);
        setSelectedRoute(null);
        setJourneyState("routes");
    }

    /* =======================================================
       SELECT ROUTE
    ======================================================= */

    function selectRoute(route: RouteOption) {
        setSelectedRoute(route);
        setJourneyState("selected");
    }

    /* =======================================================
       START JOURNEY
    ======================================================= */

    function startJourney() {
        if (!selectedRoute) return;

        setJourneyState("active");
    }

    /* =======================================================
       COMPLETE JOURNEY
    ======================================================= */

    function completeJourney() {
        setJourneyState("completed");
    }

    /* =======================================================
       RESET
    ======================================================= */

    function resetJourney() {
        setStartMode("gps");
        setStart(null);
        setDestination(null);
        setDestinationQuery("");
        setManualStartQuery("");
        setDestinationSuggestions([]);
        setManualStartSuggestions([]);
        setSelectedRoute(null);
        setRoutes([]);
        setLocationReady(false);
        setGpsMessage("");
        setJourneyState("planning");

        detectCurrentLocation();
    }

    /* =======================================================
       STEP-BY-STEP BACK
    ======================================================= */

    function handleBack() {
        switch (journeyState) {
            case "completed":
                setJourneyState("active");
                break;

            case "active":
                setJourneyState("selected");
                break;

            case "selected":
                setJourneyState("routes");
                break;

            case "routes":
                setJourneyState("planning");
                break;

            case "planning":
                window.location.href = "/drivers";
                break;
        }
    }

    const isPlanning =
        journeyState === "planning";

    const isRoutes =
        journeyState === "routes";

    const isSelected =
        journeyState === "selected";

    const isActive =
        journeyState === "active";

    const isCompleted =
        journeyState === "completed";

    return (
        <div className="space-y-6">

            {/* =====================================================
          HEADER
      ===================================================== */}

            <section className="flex items-start justify-between gap-4">

                <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                        Journey
                    </div>

                    <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                        Route Optimization
                    </h1>

                    <p className="mt-1 max-w-xl text-[10px] leading-5 text-slate-500">
                        Choose your starting point, destination and route.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleBack}
                    className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-800 px-3 py-2 text-[8px] font-bold text-slate-500 transition hover:text-white"
                >
                    <ArrowLeft className="h-3 w-3" />

                    {isPlanning ? "Dashboard" : "Back"}
                </button>

            </section>

            {/* =====================================================
          PLANNING
      ===================================================== */}

            {isPlanning && (
                <section className="rounded-2xl border border-slate-800 bg-[#07101d] p-5 sm:p-6">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10">
                            <Route className="h-5 w-5 text-blue-400" />
                        </div>

                        <div>
                            <h2 className="text-sm font-black text-white">
                                Plan your journey
                            </h2>

                            <p className="mt-1 text-[9px] text-slate-600">
                                Choose a start point and destination.
                            </p>
                        </div>

                    </div>

                    {/* =================================================
              START LOCATION
          ================================================= */}

                    <div className="mt-6">

                        <div className="mb-2 text-[8px] font-bold uppercase tracking-widest text-slate-600">
                            Start location
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">

                            {/* GPS OPTION */}

                            <button
                                type="button"
                                onClick={() => {
                                    setStartMode("gps");
                                    detectCurrentLocation();
                                }}
                                className={`rounded-xl border p-4 text-left transition ${startMode === "gps"
                                    ? "border-emerald-400/30 bg-emerald-400/5"
                                    : "border-slate-800 bg-[#050A13] hover:border-slate-700"
                                    }`}
                            >

                                <div className="flex items-center gap-3">

                                    <div
                                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${startMode === "gps"
                                            ? "bg-emerald-400/10 text-emerald-400"
                                            : "bg-slate-800 text-slate-500"
                                            }`}
                                    >
                                        {gpsLoading ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <LocateFixed className="h-4 w-4" />
                                        )}
                                    </div>

                                    <div>

                                        <div className="text-[10px] font-black text-white">
                                            Use current location
                                        </div>

                                        <div className="mt-1 text-[8px] text-slate-600">
                                            Detect using GPS
                                        </div>

                                    </div>

                                </div>

                            </button>

                            {/* MANUAL OPTION */}

                            <button
                                type="button"
                                onClick={() => {
                                    setStartMode("manual");
                                    setGpsMessage("");
                                }}
                                className={`rounded-xl border p-4 text-left transition ${startMode === "manual"
                                    ? "border-blue-400/30 bg-blue-400/5"
                                    : "border-slate-800 bg-[#050A13] hover:border-slate-700"
                                    }`}
                            >

                                <div className="flex items-center gap-3">

                                    <div
                                        className={`flex h-9 w-9 items-center justify-center rounded-lg ${startMode === "manual"
                                            ? "bg-blue-400/10 text-blue-400"
                                            : "bg-slate-800 text-slate-500"
                                            }`}
                                    >
                                        <Search className="h-4 w-4" />
                                    </div>

                                    <div>

                                        <div className="text-[10px] font-black text-white">
                                            Enter manually
                                        </div>

                                        <div className="mt-1 text-[8px] text-slate-600">
                                            Search address or place
                                        </div>

                                    </div>

                                </div>

                            </button>

                        </div>

                    </div>

                    {/* =================================================
              GPS START
          ================================================= */}

                    {startMode === "gps" && (
                        <div className="mt-4 rounded-xl border border-slate-800 bg-[#050A13] p-4">

                            <div className="flex items-center gap-3">

                                <MapPin className="h-4 w-4 shrink-0 text-emerald-400" />

                                <div className="min-w-0">

                                    <div className="text-[7px] font-bold uppercase tracking-widest text-slate-700">
                                        Current location
                                    </div>

                                    <div className="mt-1 truncate text-[10px] font-bold text-white">
                                        {start?.label ||
                                            "Detecting your location..."}
                                    </div>

                                </div>

                            </div>

                            {gpsMessage && (
                                <div className="mt-2 text-[8px] text-slate-600">
                                    {gpsMessage}
                                </div>
                            )}

                            {!gpsLoading && !locationReady && (
                                <button
                                    type="button"
                                    onClick={detectCurrentLocation}
                                    className="mt-3 text-[8px] font-bold text-emerald-400 hover:text-emerald-300"
                                >
                                    Try again
                                </button>
                            )}

                        </div>
                    )}

                    {/* =================================================
              MANUAL START
          ================================================= */}

                    {startMode === "manual" && (
                        <div className="relative mt-4">

                            <LocationSearch
                                label="Starting point"
                                value={manualStartQuery}
                                placeholder="Search starting location"
                                icon={
                                    <MapPin className="h-4 w-4 text-emerald-400" />
                                }
                                onChange={(value) => {
                                    setManualStartQuery(value);

                                    window.clearTimeout(
                                        (window as any).__startSearchTimer,
                                    );

                                    (window as any).__startSearchTimer =
                                        window.setTimeout(() => {
                                            searchPlaces(value, "start");
                                        }, 350);
                                }}
                                loading={manualStartLoading}
                            />

                            {manualStartSuggestions.length > 0 && (
                                <SuggestionBox
                                    suggestions={manualStartSuggestions}
                                    onSelect={selectManualStart}
                                />
                            )}

                        </div>
                    )}

                    {/* =================================================
              DESTINATION
          ================================================= */}

                    <div className="relative mt-3">

                        <LocationSearch
                            label="Destination"
                            value={destinationQuery}
                            placeholder={
                                destination
                                    ? destination.label
                                    : "Search destination"
                            }
                            icon={
                                <Navigation className="h-4 w-4 text-blue-400" />
                            }
                            onChange={(value) => {
                                setDestinationQuery(value);

                                setDestination(null);

                                window.clearTimeout(
                                    (window as any).__destinationSearchTimer,
                                );

                                (window as any).__destinationSearchTimer =
                                    window.setTimeout(() => {
                                        searchPlaces(
                                            value,
                                            "destination",
                                        );
                                    }, 350);
                            }}
                            loading={searchLoading}
                        />

                        {destination && !destinationQuery && (
                            <button
                                type="button"
                                onClick={() => {
                                    setDestination(null);
                                    setDestinationQuery("");
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white"
                                aria-label="Clear destination"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}

                        {destinationSuggestions.length > 0 && (
                            <SuggestionBox
                                suggestions={destinationSuggestions}
                                onSelect={selectDestination}
                            />
                        )}

                    </div>

                    {/* =================================================
              SELECTED LOCATIONS
          ================================================= */}

                    {(start || destination) && (
                        <div className="mt-4 rounded-xl border border-slate-800 bg-[#050A13] p-4">

                            <div className="grid gap-3 sm:grid-cols-2">

                                <SelectedLocationRow
                                    label="From"
                                    value={
                                        start?.label ||
                                        "Starting point not selected"
                                    }
                                    selected={!!start}
                                />

                                <SelectedLocationRow
                                    label="To"
                                    value={
                                        destination?.label ||
                                        "Destination not selected"
                                    }
                                    selected={!!destination}
                                />

                            </div>

                        </div>
                    )}

                    {/* =================================================
              FIND ROUTES
          ================================================= */}

                    <button
                        type="button"
                        onClick={optimizeRoute}
                        disabled={!start || !destination}
                        className="mt-5 h-11 w-full rounded-lg bg-gradient-to-r from-emerald-400 to-blue-500 text-[9px] font-black uppercase tracking-wider text-[#020712] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Find Routes
                    </button>

                </section>
            )}

            {/* =====================================================
          ROUTE OPTIONS
      ===================================================== */}

            {isRoutes && (
                <section>

                    <div className="rounded-xl border border-slate-800 bg-[#07101d] p-4">

                        <div className="text-[7px] font-bold uppercase tracking-widest text-slate-600">
                            Journey
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-black text-white">

                            <span className="max-w-[250px] truncate">
                                {start?.label}
                            </span>

                            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-700" />

                            <span className="max-w-[250px] truncate">
                                {destination?.label}
                            </span>

                        </div>

                    </div>

                    <div className="mt-6">

                        <h2 className="text-sm font-black text-white">
                            Choose your route
                        </h2>

                        <p className="mt-1 text-[9px] text-slate-600">
                            Compare available route options before starting.
                        </p>

                    </div>

                    <div className="mt-4 flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory lg:grid lg:grid-cols-3 lg:overflow-visible">

                        {routes.map((route) => (
                            <RouteCard
                                key={route.id}
                                route={route}
                                onSelect={selectRoute}
                            />
                        ))}

                    </div>

                </section>
            )}

            {/* =====================================================
          SELECTED / ACTIVE JOURNEY
      ===================================================== */}

            {(isSelected || isActive) &&
                selectedRoute && (
                    <section>

                        {/* ROUTE VIEW EMBEDDED OPENSTREETMAP */}

                        <div className="relative h-[290px] overflow-hidden rounded-2xl border border-slate-800 bg-[#08111e] sm:h-[380px]">
                            {start && destination ? (
                                <iframe
                                    title="OpenStreetMap Route View"
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    scrolling="no"
                                    marginHeight={0}
                                    marginWidth={0}
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${Math.min(start.lon, destination.lon) - 0.05}%2C${Math.min(start.lat, destination.lat) - 0.05}%2C${Math.max(start.lon, destination.lon) + 0.05}%2C${Math.max(start.lat, destination.lat) + 0.05}&layer=mapnik&marker=${start.lat}%2C${start.lon}`}
                                    className="w-full h-full filter contrast-125 invert opacity-80"
                                />
                            ) : (
                                <div
                                    className="absolute inset-0 opacity-30"
                                    style={{
                                        backgroundImage:
                                            "linear-gradient(rgba(100,116,139,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,.15) 1px, transparent 1px)",
                                        backgroundSize: "36px 36px",
                                    }}
                                />
                            )}

                            {/* selected route */}

                            <div className="absolute left-4 top-4 rounded-lg border border-slate-700 bg-[#050A13]/90 px-3 py-2 backdrop-blur">

                                <div className="text-[7px] uppercase tracking-widest text-slate-600">
                                    Selected route
                                </div>

                                <div className="mt-1 text-[10px] font-black text-white">
                                    {selectedRoute.type}
                                </div>

                            </div>

                            {isActive && (
                                <div className="absolute right-4 top-4 flex items-center gap-2 rounded-full border border-emerald-400/20 bg-[#050A13]/90 px-3 py-1.5">

                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

                                    <span className="text-[8px] font-black uppercase tracking-wider text-emerald-400">
                                        Active
                                    </span>

                                </div>
                            )}

                        </div>

                        {/* NEXT ACTION */}

                        <section className="mt-4 rounded-2xl border border-slate-800 bg-[#07101d] p-5">

                            <div className="text-[8px] font-bold uppercase tracking-widest text-slate-600">
                                {isActive
                                    ? "Next action"
                                    : "Route selected"}
                            </div>

                            <div className="mt-2 text-sm font-black text-white">
                                {isActive
                                    ? selectedRoute.nextAction
                                    : "Ready to start your journey"}
                            </div>

                        </section>

                        {/* JOURNEY DATA */}

                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">

                            <InfoValue
                                label="Distance"
                                value={selectedRoute.distance}
                            />

                            <InfoValue
                                label="ETA"
                                value={selectedRoute.duration}
                            />

                            <InfoValue
                                label="Battery"
                                value="84%"
                            />

                            <InfoValue
                                label="Range"
                                value="240 km"
                            />

                        </div>

                        {/* CHARGING NOTE */}

                        <div className="mt-4 rounded-xl border border-slate-800 bg-[#07101d] p-4">

                            <div className="flex items-start gap-3">

                                <BatteryCharging className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />

                                <div>
                                    <div className="text-[8px] font-bold uppercase tracking-widest text-slate-600">
                                        Charging
                                    </div>

                                    <div className="mt-1 text-[10px] font-bold text-white">
                                        No intermediate charging stop 
                                    </div>

                                    <p className="mt-1 text-[8px] leading-4 text-slate-600">
                                        Battery status is optimal (84%). You can complete this trip on current charge.
                                    </p>
                                </div>

                            </div>

                        </div>

                        {/* CONTROL */}

                        <button
                            type="button"
                            onClick={
                                isActive
                                    ? completeJourney
                                    : startJourney
                            }
                            className="mt-4 h-11 w-full rounded-lg bg-gradient-to-r from-emerald-400 to-blue-500 text-[9px] font-black uppercase tracking-wider text-[#020712] transition hover:brightness-110"
                        >
                            {isActive
                                ? "Complete Journey"
                                : "Start Journey"}
                        </button>

                    </section>
                )}

            {/* =====================================================
          COMPLETED SUMMARY
      ===================================================== */}

            {isCompleted && selectedRoute && (
                <section className="rounded-2xl border border-emerald-400/20 bg-[#07101d] p-6 sm:p-8">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-400/10">
                            <Check className="h-5 w-5 text-emerald-400" />
                        </div>

                        <div>

                            <div className="text-sm font-black text-white">
                                Journey completed
                            </div>

                            <div className="mt-1 text-[9px] text-slate-600">
                                {start?.label} → {destination?.label}
                            </div>

                        </div>

                    </div>

                    <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">

                        <InfoValue
                            label="Distance travelled"
                            value={selectedRoute.distance}
                        />

                        <InfoValue
                            label="Journey time"
                            value={selectedRoute.duration}
                        />

                        <InfoValue
                            label="Energy consumed"
                            value="3.2 kWh"
                        />

                        <InfoValue
                            label="Charging used"
                            value="Not needed"
                        />

                    </div>

                    <div className="mt-5 rounded-xl border border-slate-800 bg-[#050A13] p-4">

                        <div className="text-[8px] font-bold uppercase tracking-widest text-slate-600">
                            Route followed
                        </div>

                        <div className="mt-2 text-[10px] font-black text-white">
                            {selectedRoute.type}
                        </div>

                    </div>

                    <button
                        type="button"
                        onClick={resetJourney}
                        className="mt-6 h-11 w-full rounded-lg bg-gradient-to-r from-emerald-400 to-blue-500 text-[9px] font-black uppercase tracking-wider text-[#020712]"
                    >
                        Plan Another Journey
                    </button>

                </section>
            )}

        </div>
    );
}

/* =========================================================
   LOCATION SEARCH
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

            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                {icon}
            </div>

            <div className="absolute left-10 top-2 text-[6px] font-bold uppercase tracking-widest text-slate-700">
                {label}
            </div>

            <input
                value={value}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                placeholder={placeholder}
                className="h-14 w-full rounded-xl border border-slate-800 bg-[#050A13] pl-10 pr-10 pt-4 text-[10px] font-bold text-white outline-none placeholder:text-slate-700 focus:border-blue-400/40"
            />

            {loading && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-500" />
            )}

        </div>
    );
}

/* =========================================================
   SUGGESTIONS
========================================================= */

function SuggestionBox({
    suggestions,
    onSelect,
}: {
    suggestions: LocationSuggestion[];
    onSelect: (suggestion: LocationSuggestion) => void;
}) {
    return (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 overflow-hidden rounded-xl border border-slate-800 bg-[#07101d] shadow-2xl">

            {suggestions.map((suggestion) => (
                <button
                    key={suggestion.place_id}
                    type="button"
                    onClick={() => onSelect(suggestion)}
                    className="flex w-full items-start gap-3 border-b border-slate-800/70 px-4 py-3 text-left last:border-b-0 hover:bg-slate-900"
                >

                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" />

                    <span className="text-[9px] leading-4 text-slate-300">
                        {suggestion.display_name}
                    </span>

                </button>
            ))}

        </div>
    );
}

/* =========================================================
   SELECTED LOCATION
========================================================= */

function SelectedLocationRow({
    label,
    value,
    selected,
}: {
    label: string;
    value: string;
    selected: boolean;
}) {
    return (
        <div className="min-w-0">

            <div className="text-[7px] font-bold uppercase tracking-widest text-slate-700">
                {label}
            </div>

            <div className="mt-1 flex items-center gap-2">

                <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${selected
                        ? "bg-emerald-400"
                        : "bg-slate-700"
                        }`}
                />

                <span className="truncate text-[9px] font-bold text-slate-300">
                    {value}
                </span>

            </div>

        </div>
    );
}

/* =========================================================
   ROUTE CARD
========================================================= */

function RouteCard({
    route,
    onSelect,
}: {
    route: RouteOption;
    onSelect: (route: RouteOption) => void;
}) {
    return (
        <article className="min-w-[285px] snap-start rounded-2xl border border-slate-800 bg-[#07101d] p-5 lg:min-w-0">

            <div className="flex items-center justify-between gap-3">

                <h3 className="text-sm font-black text-white">
                    {route.type}
                </h3>

                <span className="rounded-full border border-slate-800 bg-[#050A13] px-2 py-1 text-[7px] font-bold uppercase tracking-wider text-slate-600">
                    Option {route.id}
                </span>

            </div>

            <p className="mt-2 text-[9px] leading-4 text-slate-600">
                {route.description}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2">

                <InfoValue
                    label="Distance"
                    value={route.distance}
                />

                <InfoValue
                    label="ETA"
                    value={route.duration}
                />

            </div>

            <button
                type="button"
                onClick={() => onSelect(route)}
                className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/5 text-[9px] font-black uppercase tracking-wider text-emerald-400 transition hover:bg-emerald-400/10"
            >
                Select Route
                <ChevronRight className="h-3.5 w-3.5" />
            </button>

        </article>
    );
}

/* =========================================================
   INFO VALUE
========================================================= */

function InfoValue({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-slate-800 bg-[#050A13] p-3">

            <div className="text-[7px] uppercase tracking-widest text-slate-600">
                {label}
            </div>

            <div className="mt-1.5 truncate text-[10px] font-black text-white">
                {value}
            </div>

        </div>
    );
}