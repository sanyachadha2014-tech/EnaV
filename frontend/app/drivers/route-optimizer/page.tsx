"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import {
  Navigation,
  MapPin,
  Zap,
  ArrowLeftRight,
  ArrowLeft,
  Bell,
  X,
  LocateFixed,
  ExternalLink,
  Play,
  Compass,
} from "lucide-react";

// Dynamically import Leaflet components to avoid SSR errors in Next.js
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);

interface WardNotification {
  id: string;
  wardName: string;
  evId: string;
  timestamp: string;
}

interface RouteOption {
  id: string;
  name: string;
  tag: string;
  distance: string;
  eta: string;
  batteryUsed: string;
  wardStops: number;
  recommended?: boolean;
}

export default function MobileEVJourneyPlanner() {
  const [step, setStep] = useState<"input" | "routes" | "navigating">("input");
  const [isMounted, setIsMounted] = useState(false);

  // Form Inputs
  const [fromLocation, setFromLocation] = useState("Connaught Place, Delhi");
  const [toLocation, setToLocation] = useState("Cyber City, Gurugram");
  const [evRange, setEvRange] = useState(380);

  // Selected Route State
  const [selectedRoute, setSelectedRoute] = useState<RouteOption | null>(null);

  // Ward Notifications State
  const [notifications, setNotifications] = useState<WardNotification[]>([]);

  // Route Options Priority List
  const routeOptions: RouteOption[] = [
    {
      id: "r1",
      name: "NH 48 Expressway Corridor",
      tag: "Fastest • Lowest Traffic",
      distance: "39.2 km",
      eta: "48 mins",
      batteryUsed: "14%",
      wardStops: 2,
      recommended: true,
    },
    {
      id: "r2",
      name: "Ring Road & Mehrauli Route",
      tag: "Eco • Max Regeneration",
      distance: "42.5 km",
      eta: "58 mins",
      batteryUsed: "11%",
      wardStops: 4,
    },
    {
      id: "r3",
      name: "Inner Arterial Ward Bypass",
      tag: "Balanced • High Chargers",
      distance: "37.8 km",
      eta: "54 mins",
      batteryUsed: "13%",
      wardStops: 3,
    },
  ];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (step === "navigating") {
      const timer = setTimeout(() => {
        const newNotification: WardNotification = {
          id: Date.now().toString(),
          wardName: "Ward 42 (Aerocity Zone)",
          evId: "EV-DEL-8921",
          timestamp: "Just now",
        };
        setNotifications((prev) => [newNotification, ...prev]);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [step]);

  const handleSwapLocations = () => {
    const temp = fromLocation;
    setFromLocation(toLocation);
    setToLocation(temp);
  };

  const handlePlanRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromLocation.trim() && toLocation.trim()) {
      setStep("routes");
      setSelectedRoute(routeOptions[0]);
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
    fromLocation
  )}&destination=${encodeURIComponent(toLocation)}&travelmode=driving`;

  /* ================= STAGE 1: INPUT FORM SCREEN (BIGGER FONTS) ================= */
  if (step === "input") {
    return (
      <div className="min-h-screen bg-[#070B14] text-slate-100 font-sans p-6 flex flex-col justify-between selection:bg-[#10B981] selection:text-slate-950">
        <div className="space-y-6 max-w-lg mx-auto w-full pt-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <Link
              href="/drivers/chargers"
              className="inline-flex items-center gap-2 text-sm font-mono text-slate-300 hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Grid
            </Link>
            <div className="flex items-center gap-2 bg-[#10B981]/10 border border-[#10B981]/30 px-3 py-1.5 rounded-full text-xs font-mono text-[#10B981]">
              <Navigation className="w-3.5 h-3.5" /> Trip Planner
            </div>
          </div>

          {/* Hero Title */}
          <div className="text-center space-y-2 pt-2">
            <h1 className="text-4xl font-black text-white tracking-wide">
              EV Route <span className="text-[#00F0FF]">Planner</span>
            </h1>
            <p className="text-sm text-slate-300">
              Enter trip details to evaluate priority-ranked ward charging paths.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handlePlanRoute} className="space-y-5">
            <div className="bg-[#0B132B] border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl relative">
              {/* From Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-mono">
                  <span className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <MapPin className="w-4 h-4" /> Starting Point
                  </span>
                  <button
                    type="button"
                    onClick={() => setFromLocation("Connaught Place, Delhi")}
                    className="text-xs text-[#00F0FF] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <LocateFixed className="w-3.5 h-3.5" /> Use GPS
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={fromLocation}
                  onChange={(e) => setFromLocation(e.target.value)}
                  placeholder="Enter starting location"
                  className="w-full bg-[#070B14] border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#00F0FF] transition font-mono shadow-inner"
                />
              </div>

              {/* Swap Button */}
              <div className="flex justify-center my-[-10px] relative z-10">
                <button
                  type="button"
                  onClick={handleSwapLocations}
                  className="w-10 h-10 rounded-full bg-[#070B14] border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition shadow-lg"
                >
                  <ArrowLeftRight className="w-4 h-4 rotate-90" />
                </button>
              </div>

              {/* To Input */}
              <div className="space-y-2">
                <div className="text-sm font-mono text-red-400 font-bold flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Destination
                </div>
                <input
                  type="text"
                  required
                  value={toLocation}
                  onChange={(e) => setToLocation(e.target.value)}
                  placeholder="Enter destination"
                  className="w-full bg-[#070B14] border border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#00F0FF] transition font-mono shadow-inner"
                />
              </div>

              {/* Battery Range Slider */}
              <div className="bg-[#070B14] border border-slate-800/80 rounded-2xl p-4 space-y-3 mt-3">
                <div className="flex items-center justify-between text-sm font-mono text-slate-300">
                  <span className="flex items-center gap-2 text-amber-400 font-bold">
                    <Zap className="w-4 h-4" /> Est. EV Range
                  </span>
                  <span className="text-[#00F0FF] font-black text-sm">{evRange} km</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="600"
                  step="10"
                  value={evRange}
                  onChange={(e) => setEvRange(Number(e.target.value))}
                  className="w-full accent-[#00F0FF] bg-slate-800 h-2.5 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="submit"
              className="w-full bg-[#00F0FF] hover:bg-[#38f2ff] text-slate-950 font-black py-4 rounded-2xl text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition shadow-[0_0_25px_rgba(0,240,255,0.4)]"
            >
              <Navigation className="w-5 h-5" /> Find Routes & Stops
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ================= STAGE 2 & 3: MAP WITH LHS VERTICAL CONTROL PANEL ================= */
  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#050913] text-slate-100 font-sans overflow-hidden flex">
      {/* BACKGROUND FULLSCREEN MAP */}
      <div className="absolute inset-0 w-full h-full z-0">
        {isMounted && (
          <MapContainer
            center={[28.6139, 77.209]}
            zoom={12}
            scrollWheelZoom={true}
            style={{ width: "100%", height: "100%", background: "#050913" }}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          </MapContainer>
        )}
      </div>

      {/* LHS VERTICAL CONTROL PANEL */}
      <div className="relative z-[1000] w-full max-w-md h-full bg-[#070B14]/95 border-r border-slate-800 backdrop-blur-md flex flex-col justify-between shadow-2xl p-5 overflow-y-auto">
        <div className="space-y-5">
          {/* Top Header & Back */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <button
              onClick={() => setStep("input")}
              className="inline-flex items-center gap-2 text-sm font-mono text-slate-300 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" /> Edit Route
            </button>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold px-3.5 py-2 rounded-xl transition shadow"
            >
              Google Maps <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Journey Path Overview with Bigger Text */}
          <div className="bg-[#0B132B] border border-slate-800 rounded-2xl p-4 space-y-2 font-mono text-sm">
            <div className="flex items-center justify-between text-emerald-400 font-bold truncate">
              <span className="truncate">From: {fromLocation}</span>
            </div>
            <div className="flex items-center justify-between text-red-400 font-bold truncate">
              <span className="truncate">To: {toLocation}</span>
            </div>
          </div>

          {/* Conditional Content based on Step */}
          {step === "routes" ? (
            <div className="space-y-3.5">
              <div className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between px-1">
                <span>Priority Routes ({routeOptions.length})</span>
                <span className="text-[#00F0FF] font-bold">Select one</span>
              </div>

              {routeOptions.map((route) => {
                const isSelected = selectedRoute?.id === route.id;
                return (
                  <div
                    key={route.id}
                    onClick={() => setSelectedRoute(route)}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all relative ${
                      isSelected
                        ? "bg-[#0B132B] border-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.2)]"
                        : "bg-[#0B132B]/50 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {route.recommended && (
                      <span className="absolute -top-2.5 right-4 bg-[#10B981] text-slate-950 text-[10px] font-black uppercase font-mono px-2.5 py-0.5 rounded-full">
                        Best
                      </span>
                    )}
                    <div className="space-y-2">
                      <div className="text-sm font-bold text-white flex items-center gap-2.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? "bg-[#00F0FF]" : "bg-slate-600"}`} />
                        {route.name}
                      </div>
                      <div className="text-xs font-mono text-[#00F0FF] bg-[#00F0FF]/10 inline-block px-2 py-0.5 rounded">
                        {route.tag}
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 pt-1 font-mono text-center">
                        <div className="bg-[#070B14] border border-slate-800 rounded-xl p-1.5">
                          <div className="text-[10px] text-slate-400">Dist</div>
                          <div className="text-xs font-bold text-white">{route.distance}</div>
                        </div>
                        <div className="bg-[#070B14] border border-slate-800 rounded-xl p-1.5">
                          <div className="text-[10px] text-slate-400">ETA</div>
                          <div className="text-xs font-bold text-amber-400">{route.eta}</div>
                        </div>
                        <div className="bg-[#070B14] border border-slate-800 rounded-xl p-1.5">
                          <div className="text-[10px] text-slate-400">Bat</div>
                          <div className="text-xs font-bold text-emerald-400">{route.batteryUsed}</div>
                        </div>
                        <div className="bg-[#070B14] border border-slate-800 rounded-xl p-1.5">
                          <div className="text-[10px] text-slate-400">Wards</div>
                          <div className="text-xs font-bold text-[#00F0FF]">{route.wardStops}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Active Navigation Panel */
            <div className="bg-[#0B132B] border border-[#00F0FF]/40 rounded-2xl p-4 space-y-3.5 shadow-lg">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <div className="space-y-0.5">
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Navigation className="w-4 h-4 text-[#00F0FF]" /> Live Guidance
                  </div>
                  <div className="text-xs font-mono text-slate-300">{selectedRoute?.name}</div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-sm font-black text-amber-400">{selectedRoute?.eta}</div>
                  <div className="text-xs text-slate-400">{selectedRoute?.distance}</div>
                </div>
              </div>

              <div className="space-y-1.5 font-mono text-xs text-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ward Charging Hubs:</span>
                  <span className="text-[#00F0FF] font-bold">{selectedRoute?.wardStops} En-route</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Est. Battery Consumed:</span>
                  <span className="text-emerald-400 font-bold">{selectedRoute?.batteryUsed}</span>
                </div>
              </div>

              <button
                onClick={() => setStep("routes")}
                className="w-full bg-[#070B14] hover:bg-slate-800 text-slate-200 font-mono text-xs py-2.5 rounded-xl border border-slate-800 transition"
              >
                Switch Route Option
              </button>
            </div>
          )}
        </div>

        {/* Bottom Action Footer inside LHS Panel */}
        <div className="pt-4 border-t border-slate-800 space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="bg-[#0B132B] border border-[#00F0FF]/40 rounded-xl p-3 space-y-1.5 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-[#00F0FF] animate-bounce" /> Ward Alert
                </span>
                <button onClick={() => dismissNotification(notif.id)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-200 font-mono">
                EV <strong className="text-white font-bold">{notif.evId}</strong> passed near <span className="text-[#00F0FF] font-bold">{notif.wardName}</span>.
              </p>
            </div>
          ))}

          {step === "routes" ? (
            <div className="space-y-2.5">
              <button
                onClick={() => setStep("navigating")}
                className="w-full bg-[#10B981] hover:bg-[#34D399] text-slate-950 font-black py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                <Play className="w-4 h-4 fill-slate-950" /> Start Navigation
              </button>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow"
              >
                <Compass className="w-4 h-4" /> Get Directions & Open Maps
              </a>
            </div>
          ) : (
            <div className="space-y-2.5">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#10B981] hover:bg-[#34D399] text-slate-950 font-black py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                <Play className="w-4 h-4 fill-slate-950" /> Start Turn-by-Turn
              </a>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow"
              >
                <Compass className="w-4 h-4" /> Open Directions in Maps
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}