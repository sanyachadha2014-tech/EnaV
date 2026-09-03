"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Globe,
  Siren,
  TrendingUp,
  DollarSign,
  ExternalLink,
  Zap,
  Activity,
  AlertTriangle,
  CheckSquare,
  Square,
  MapPin,
  Radio,
} from "lucide-react";

// Dynamic import for Leaflet map component to prevent SSR window issues
const CommandMap = dynamic(() => import("@/components/CommandMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[450px] bg-[#040812] rounded-xl flex items-center justify-center text-slate-500 font-mono text-xs">
      <Activity className="w-5 h-5 animate-spin mr-2 text-emerald-400" />
      LOADING REAL-TIME GIS MAP...
    </div>
  ),
});

export default function GovernmentDashboardPage() {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get("/emergency/alerts");
        setAlerts(res.data || []);
      } catch (err) {
        console.warn("Could not fetch alerts:", err);
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  const latestAlert = alerts.length > 0 ? alerts[0] : null;

  // Layer Toggles
  const [layers, setLayers] = useState({
    emergency: true,
    hubs: true,
    transit: true,
    private: false,
  });

  const [selectedZone, setSelectedZone] = useState("NDMC-CENTRAL");

  const toggleLayer = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Municipal Zones Data
  const zones = [
    { id: "NDMC-CENTRAL", name: "Connaught Place / NDMC", gridLoad: "82%", status: "Optimal", activeEVs: 1420 },
    { id: "ZONE-07-JKP", name: "Janakpuri Ward 7", gridLoad: "94%", status: "High Demand", activeEVs: 2150 },
    { id: "ZONE-12-OKH", name: "Okhla Ind. Phase III", gridLoad: "78%", status: "Normal", activeEVs: 1890 },
    { id: "ZONE-03-RKN", name: "RK Puram Sector 4", gridLoad: "61%", status: "Normal", activeEVs: 940 },
  ];

  return (
    <div className="min-h-screen bg-[#040812] text-slate-100 font-mono p-4 md:p-6 space-y-4 selection:bg-[#10B981] selection:text-slate-950">
      
      {/* 1. TOP HEADER BAR */}
      <header className="w-full bg-[#070B14] border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-white text-base font-black tracking-wider uppercase">
                ENAV CITY COMMAND
              </h1>
              <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] border border-emerald-800 font-bold">
                Gov Portal
              </span>
            </div>
            <p className="text-slate-400 text-xs">
              Delhi NCR Metropolitan Region • ID: MUNICIPAL-ADMIN-01
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 bg-[#0B132B] px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-bold">Grid Operational</span>
          </div>
          <span className="text-slate-400 hidden sm:inline">
            26 Aug 2026, 12:31 IST
          </span>
        </div>
      </header>

      {/* 2. TOP METRICS ROW (5 Cards Grid) */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-[#070B14] border border-slate-800/80 rounded-xl p-3.5 shadow-lg">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            ACTIVE MUNICIPAL EVS
          </div>
          <div className="text-xl font-black text-white mt-1">
            1,420 <span className="text-xs font-normal text-emerald-400">(89% Active)</span>
          </div>
        </div>

        <div className="bg-[#070B14] border border-slate-800/80 rounded-xl p-3.5 shadow-lg">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            CHARGING HUBS ONLINE
          </div>
          <div className="text-xl font-black text-white mt-1">
            88 / 95 <span className="text-xs font-normal text-emerald-400">(92%)</span>
          </div>
        </div>

        <div className="bg-[#070B14] border border-slate-800/80 rounded-xl p-3.5 shadow-lg">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            ACTIVE 112 DISPATCHES
          </div>
          <div className="text-xl font-black text-red-500 mt-1">
            2 <span className="text-xs font-normal text-red-400">Urgent</span>
          </div>
        </div>

        <div className="bg-[#070B14] border border-slate-800/80 rounded-xl p-3.5 shadow-lg">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            CITY GRID LOAD
          </div>
          <div className="text-xl font-black text-amber-400 mt-1">
            4.2 MW <span className="text-xs font-normal text-slate-400">/ 6.0 MW</span>
          </div>
        </div>

        <div className="bg-[#070B14] border border-slate-800/80 rounded-xl p-3.5 shadow-lg col-span-2 md:col-span-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            TODAY'S CO₂ OFFSET
          </div>
          <div className="text-xl font-black text-emerald-400 mt-1">
            14.2 <span className="text-xs font-normal text-slate-300">Tons</span>
          </div>
        </div>
      </section>

      {/* 3. MAIN WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN: NAVIGATION, LAYERS & SECTORS */}
        <aside className="lg:col-span-3 space-y-4">
          
          {/* NAVIGATION MODULES */}
          <div className="bg-[#070B14] border border-slate-800/80 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              NAVIGATION MODULES
            </div>

            <Link
              href="/gov"
              className="w-full bg-[#10B981] text-slate-950 font-bold text-xs p-3 rounded-xl flex items-center justify-between shadow-lg shadow-[#10B981]/20 transition"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>1. City Overview</span>
              </div>
            </Link>

            <Link
              href="/gov/dispatch"
              className="w-full bg-[#0B132B] hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs p-3 rounded-xl flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-2">
                <Siren className="w-4 h-4 text-red-400" />
                <span>2. 112 Smart Dispatch</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
            </Link>

            <Link
              href="/gov/infra-planner"
              className="w-full bg-[#0B132B] hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs p-3 rounded-xl flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span>3. AI Infra Planner</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
            </Link>

            <Link
              href="/gov/revenue"
              className="w-full bg-[#0B132B] hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs p-3 rounded-xl flex items-center justify-between transition group"
            >
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>4. Revenue & Sustainability</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-white" />
            </Link>
          </div>

          {/* MAP DISPLAY LAYERS */}
          <div className="bg-[#070B14] border border-slate-800/80 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              MAP OVERLAY LAYERS
            </div>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => toggleLayer("emergency")}
                className="w-full flex items-center justify-between text-slate-300 hover:text-white py-1 cursor-pointer"
              >
                <span>Emergency EV Fleets</span>
                {layers.emergency ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-600" />
                )}
              </button>

              <button
                onClick={() => toggleLayer("hubs")}
                className="w-full flex items-center justify-between text-slate-300 hover:text-white py-1 cursor-pointer"
              >
                <span>Municipal Charging Hubs</span>
                {layers.hubs ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-600" />
                )}
              </button>

              <button
                onClick={() => toggleLayer("transit")}
                className="w-full flex items-center justify-between text-slate-300 hover:text-white py-1 cursor-pointer"
              >
                <span>GTFS Bus Transit Lines</span>
                {layers.transit ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-600" />
                )}
              </button>

              <button
                onClick={() => toggleLayer("private")}
                className="w-full flex items-center justify-between text-slate-300 hover:text-white py-1 cursor-pointer"
              >
                <span>Private Fleet Vectors</span>
                {layers.private ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-600" />
                )}
              </button>
            </div>
          </div>

          {/* MUNICIPAL SECTOR SELECTOR */}
          <div className="bg-[#070B14] border border-slate-800/80 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              MUNICIPAL SECTORS
            </div>
            <div className="space-y-2">
              {zones.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZone(zone.id)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition cursor-pointer ${
                    selectedZone === zone.id
                      ? "bg-[#0B132B] border-emerald-500/80 text-white shadow-md shadow-emerald-500/10"
                      : "bg-[#040812] border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">{zone.name}</span>
                    <span className="text-[10px] text-amber-400 font-bold">{zone.gridLoad} Load</span>
                  </div>
                  <div className="flex justify-between mt-1 text-[10px] text-slate-500">
                    <span>Status: {zone.status}</span>
                    <span>EVs: {zone.activeEVs}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </aside>

        {/* CENTER COLUMN: GIS MAP VIEWPORT */}
        <main className="lg:col-span-6 bg-[#070B14] border border-slate-800/80 rounded-2xl p-3 flex flex-col justify-between shadow-2xl min-h-[550px]">
          
          {/* MAP HEADER CONTROL BAR */}
          <div className="flex items-center justify-between pb-3 px-2 border-b border-slate-800/60 mb-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              GIS VIEWPORT: <strong className="text-white">{selectedZone}</strong>
            </span>

            <div className="flex items-center gap-1 bg-[#0B132B] p-1 rounded-lg border border-slate-800 text-[10px]">
              <button className="px-2 py-0.5 rounded bg-slate-800 text-white font-bold">2D/3D</button>
              <button className="px-2 py-0.5 rounded text-slate-400 hover:text-white">Traffic</button>
              <button className="px-2 py-0.5 rounded text-slate-400 hover:text-white">Heatmap</button>
            </div>
          </div>

          {/* DYNAMIC LEAFLET MAP VIEWPORT & OVERLAYS */}
          <div className="relative w-full flex-1 rounded-xl overflow-hidden border border-slate-800 bg-[#040812] min-h-[420px]">
            <CommandMap incidents={alerts} />

            {/* FLOATING INCIDENT BADGES */}
            <div className="absolute bottom-4 left-4 z-[400] flex flex-col gap-2 pointer-events-none text-xs">
              <div className="bg-red-950/90 border border-red-500/50 text-red-400 px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 backdrop-blur pointer-events-auto">
                <AlertTriangle className="w-4 h-4 animate-pulse" />
                <span>
                  {latestAlert ? `INCIDENT #${latestAlert.incident_id}: ${latestAlert.summary || latestAlert.incident_type}` : "INCIDENT #INC-8921: Low Battery Dispatch Priority (Janakpuri)"}
                </span>
              </div>

              <div className="bg-[#070B14]/90 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 backdrop-blur pointer-events-auto">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-ping" />
                <span>Selected Zone: <strong className="text-white">{selectedZone}</strong></span>
                <span className="text-slate-500">|</span>
                <span className="text-emerald-400 font-bold">Telemetry Nominal</span>
              </div>
            </div>
          </div>

          {/* BOTTOM COMMAND TOOLBAR */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80 z-10 text-xs">
            <span className="text-slate-500">Integrated Command Terminal Ready</span>
            <div className="flex items-center gap-2">
              <Link
                href="/gov/dispatch"
                className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition text-[11px] shadow-lg shadow-red-600/20"
              >
                <Siren className="w-3.5 h-3.5" /> Launch Dispatch Hub
              </Link>
              <Link
                href="/gov/infra-planner"
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition text-[11px] shadow-lg shadow-purple-600/20"
              >
                <TrendingUp className="w-3.5 h-3.5" /> Launch AI Planner
              </Link>
            </div>
          </div>

        </main>

        {/* RIGHT COLUMN: DISPATCH, RECOMMENDATIONS & AUDIT */}
        <aside className="lg:col-span-3 space-y-4">
          
          {/* ACTIVE 112 EMERGENCY ACTION CARD */}
          <div className="bg-[#070B14] border border-red-900/40 rounded-2xl p-4 shadow-xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4" />
                <span>ACTIVE 112 EMERGENCY</span>
              </div>
              <span className="px-2 py-0.5 bg-red-950 text-red-400 border border-red-800 text-[9px] font-bold rounded">
                HIGH URGENCY
              </span>
            </div>

            <div>
              <h4 className="text-white text-xs font-bold">
                Incident #{latestAlert?.incident_id || "112-9842"} ({latestAlert?.incident_type?.toUpperCase() || "Response"})
              </h4>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Location: {latestAlert?.address || latestAlert?.district || "Sector 14, Dwarka, New Delhi"}
              </p>
            </div>

            <div className="bg-[#0B132B] border border-slate-800 rounded-xl p-3 space-y-1">
              <div className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-current" />
                Assigned EV: {latestAlert?.selected_vehicle || "EV-Ambu-04"}
              </div>
              <p className="text-slate-400 text-[10px] flex items-center gap-2">
                <span>Status: <strong className="text-white uppercase">{latestAlert?.status || "Dispatched"}</strong></span>
                <span>•</span>
                <span>Est. ETA: <strong className="text-emerald-400">{latestAlert?.eta_minutes ? `${latestAlert.eta_minutes.toFixed(1)} mins` : "6.0 mins"}</strong></span>
              </p>
            </div>

            <Link
              href="/gov/dispatch"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition cursor-pointer"
            >
              <Siren className="w-4 h-4" />
              DISPATCH & SIGNAL OVERWRITE
            </Link>
          </div>

          {/* AI PLACEMENT RECOMMENDATION */}
          <div className="bg-[#070B14] border border-slate-800/80 rounded-2xl p-4 shadow-xl space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              AI PLACEMENT RECOMMENDATION
            </div>

            <div className="bg-[#0B132B] border border-slate-800 rounded-xl p-3 space-y-1">
              <h5 className="text-xs font-bold text-white">
                High Demand Deficit: Ward 7 (Janakpuri)
              </h5>
              <p className="text-[11px] text-slate-400">
                Recommended: Add 2 Fast Charging Hubs
              </p>
              <div className="flex items-center justify-between text-[10px] pt-1 text-slate-400 border-t border-slate-800/80 mt-2">
                <span>Est. Utilization: <strong className="text-emerald-400">88%</strong></span>
                <span>ROI: <strong className="text-emerald-400">14.2%</strong></span>
              </div>
            </div>
          </div>

          {/* SYSTEM LOG & AUDIT */}
          <div className="bg-[#070B14] border border-slate-800/80 rounded-2xl p-4 shadow-xl space-y-2 text-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              SYSTEM LOG & AUDIT
            </div>

            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span><strong className="text-slate-200">18:52</strong> - Charger Hub #12 reboot complete.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                <span><strong className="text-slate-200">18:45</strong> - Ward 7 boundary operational.</span>
              </li>
            </ul>
          </div>

        </aside>

      </div>
    </div>
  );
}