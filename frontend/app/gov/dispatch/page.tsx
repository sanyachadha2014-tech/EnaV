"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Radio,
  Zap,
  MapPin,
  Clock,
  BatteryCharging,
  ArrowLeft,
  CheckCircle2,
  Siren,
  ChevronDown,
  Navigation,
  GitCommit,
  Truck,
  Flame,
  Activity,
  BatteryCharging as ChargingIcon,
} from "lucide-react";

export default function SmartDispatchPage() {
  const [selectedIncident, setSelectedIncident] = useState("INC-112-9842");
  const [signalPriorityActive, setSignalPriorityActive] = useState(true);

  // Mock Incident Data
  const incidents = [
    {
      id: "INC-112-9842",
      type: "Medical Critical Call",
      location: "Sector 14, Dwarka",
      distance: "3.2 km",
      timeReceived: "18:52 IST",
      severity: "CRITICAL",
      status: "Unassigned",
      isFire: false,
    },
    {
      id: "INC-112-9845",
      type: "Fire Hazard Alert",
      location: "Connaught Place Inner Circle",
      distance: "7.8 km",
      timeReceived: "18:55 IST",
      severity: "HIGH",
      status: "Unassigned",
      isFire: true,
    },
    {
      id: "INC-112-9839",
      type: "Traffic Collision Support",
      location: "Ring Road - AIIMS Flyover",
      distance: "5.1 km",
      timeReceived: "18:40 IST",
      severity: "In Progress",
      isFire: false,
    },
  ];

  const currentIncident = incidents.find((inc) => inc.id === selectedIncident) || incidents[0];

  // Feasible Response Vehicles for the selected incident
  const feasibleVehicles = [
    {
      id: currentIncident.isFire ? "EV-FIRE-01" : "EV-AMBU-04",
      type: currentIncident.isFire ? "EV Fire Bus (Heavy Rescue)" : "EV Ambulance (Advanced Life Support)",
      batt: 84,
      eta: "6 mins",
      score: 98.4,
      status: "AVAILABLE",
      dist: "3.2 km",
    },
    {
      id: currentIncident.isFire ? "EV-FIRE-03" : "EV-AMBU-11",
      type: currentIncident.isFire ? "EV Fire Support Unit" : "EV Ambulance (Basic)",
      batt: 92,
      eta: "9 mins",
      score: 89.1,
      status: "AVAILABLE",
      dist: "4.8 km",
    },
    {
      id: "EV-RR-02",
      type: "Rapid Response Unit",
      batt: 65,
      eta: "11 mins",
      score: 76.5,
      status: "CHARGING (Hub 04)",
      dist: "5.0 km",
    },
  ];

  // Updated Flowchart Steps based on user instructions
  const flowchartSteps = [
    {
      step: "01",
      title: "112 Call Received",
      desc: `Emergency alert logged for ${currentIncident.type}.`,
      icon: <Siren className="w-3.5 h-3.5 text-red-400" />,
      active: true,
    },
    {
      step: "02",
      title: `Dispatched: ${currentIncident.isFire ? "Fire Bus" : "Ambulance"}`,
      desc: `Assigned unit ${feasibleVehicles[0].id} responding to site.`,
      icon: currentIncident.isFire ? <Flame className="w-3.5 h-3.5 text-amber-500" /> : <Truck className="w-3.5 h-3.5 text-emerald-400" />,
      active: true,
    },
    {
      step: "03",
      title: "En Route Tracking (Milestones)",
      desc: "3.2 km away → 2.1 km away → 0.8 km away from target.",
      icon: <Navigation className="w-3.5 h-3.5 text-blue-400" />,
      active: true,
    },
    {
      step: "04",
      title: "Intermediate Charging Stop",
      desc: "Battery optimization: Quick-boost session active at Hub 02.",
      icon: <ChargingIcon className="w-3.5 h-3.5 text-amber-400" />,
      active: false, // Set to true if charging stage applies
    },
    {
      step: "05",
      title: "Reached Final Destination",
      desc: `Unit arrived securely at ${currentIncident.location}.`,
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />,
      active: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 font-sans p-4 sm:p-6 selection:bg-red-500 selection:text-white">
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Header Bar */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0B132B] border border-red-500/30 rounded-xl px-5 py-3 shadow-lg">
          <div className="flex items-center gap-3">
            <Link
              href="/gov"
              className="p-2 rounded-lg bg-[#070B14] border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-red-500">
              <Siren className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-wider text-white uppercase">
                  112 SMART DISPATCH COMMAND
                </h1>
                <span className="bg-red-500/20 border border-red-500/40 text-red-400 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">
                  Priority Access
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Automated Feasibility Engine • Real-Time Traffic Preemption
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#070B14] border border-red-500/40 px-3 py-1.5 rounded-full text-xs font-mono text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              2 Active Emergency Calls
            </div>
          </div>
        </header>

        {/* 3-Column Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Live Emergency Feed */}
          <div className="lg:col-span-4 bg-[#0B132B] border border-slate-800 rounded-xl p-4 space-y-4 shadow-md flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" /> Incoming 112 Feed
                </span>
                <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                  Live Stream
                </span>
              </div>

              {/* Incidents Queue */}
              <div className="space-y-2">
                {incidents.map((inc) => (
                  <button
                    key={inc.id}
                    onClick={() => setSelectedIncident(inc.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition flex flex-col gap-2 ${
                      selectedIncident === inc.id
                        ? "bg-slate-900 border-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                        : "bg-[#070B14] border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {inc.id}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                          inc.severity === "CRITICAL"
                            ? "bg-red-500/20 border border-red-500/40 text-red-400"
                            : inc.severity === "HIGH"
                            ? "bg-amber-500/20 border border-amber-500/40 text-amber-400"
                            : "bg-blue-500/20 border border-blue-500/40 text-blue-400"
                        }`}
                      >
                        {inc.severity}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-white">{inc.type}</h4>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-500" /> {inc.location} ({inc.distance})
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-slate-800/60 pt-2 mt-1">
                      <span>Logged: {inc.timeReceived}</span>
                      <span className="text-slate-400 font-semibold">{inc.status}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Filter / Override Controls */}
            <div className="bg-[#070B14] border border-slate-800 p-3 rounded-lg space-y-2">
              <div className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                Automated Signal Override
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Traffic Preemption Protocol</span>
                <button
                  onClick={() => setSignalPriorityActive(!signalPriorityActive)}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold transition ${
                    signalPriorityActive
                      ? "bg-[#10B981] text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {signalPriorityActive ? "ENABLED" : "DISABLED"}
                </button>
              </div>
            </div>
          </div>

          {/* Middle Column: Vertical Pipeline Flowchart + Map Telemetry */}
          <div className="lg:col-span-5 bg-[#0B132B] border border-slate-800 rounded-xl p-4 flex flex-col gap-4 shadow-md">
            {/* Incident Header */}
            <div className="bg-[#070B14] border border-slate-800 p-3 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase">Selected Incident</span>
                <h3 className="text-sm font-bold text-white">{currentIncident.id} • {currentIncident.type}</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 uppercase">Target Corridor</span>
                <div className="text-xs font-mono text-[#10B981] font-bold">{currentIncident.location}</div>
              </div>
            </div>

            {/* VERTICAL FLOWCHART CONTAINER WITH UPDATED STAGES */}
            <div className="bg-[#070B14] border border-cyan-500/30 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[11px] font-mono text-cyan-400 uppercase font-bold flex items-center gap-1.5">
                  <GitCommit className="w-3.5 h-3.5 text-cyan-400" /> Dispatch & Transit Lifecycle Flowchart
                </span>
                <span className="text-[9px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-1.5 py-0.5 rounded">
                  Live Tracking
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                {flowchartSteps.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <div
                      className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 transition ${
                        item.active
                          ? "bg-slate-900/85 border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.1)]"
                          : "bg-slate-900/30 border-slate-800 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-md bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-2">
                            {item.title}
                            <span className="text-[9px] font-mono text-cyan-400 font-normal">
                              ({item.step})
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-tight">{item.desc}</p>
                        </div>
                      </div>
                      <span className={`w-2 h-2 rounded-full shrink-0 ${item.active ? "bg-cyan-400 animate-pulse" : "bg-slate-700"}`} />
                    </div>

                    {/* Vertical Connector Arrow */}
                    {idx < flowchartSteps.length - 1 && (
                      <div className="flex justify-center my-0.5 text-cyan-500/50">
                        <ChevronDown className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Simulated Tactical Map View */}
            <div className="relative bg-[#050913] rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center min-h-[160px]">
              {/* Radar Grid Lines */}
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage: `radial-[#10B981] 1px, transparent 1px)`,
                  backgroundSize: "28px 28px",
                }}
              />

              {/* Map Route Telemetry Visualization */}
              <div className="relative z-10 flex flex-col items-center justify-center gap-2.5 p-3">
                <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500 text-red-400 px-2.5 py-1 rounded-md text-[11px] font-mono shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                  <MapPin className="w-3.5 h-3.5 animate-bounce" /> INCIDENT SITE: {currentIncident.location}
                </div>

                <div className="w-36 h-0.5 bg-gradient-to-r from-red-500 via-amber-400 to-[#10B981] my-1 relative">
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#070B14] border border-slate-700 text-[8px] font-mono px-1.5 py-0.2 rounded text-slate-300 whitespace-nowrap">
                    Green Wave Priority
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-[#070B14]/90 border border-[#10B981]/60 text-[#10B981] px-2.5 py-1 rounded-full text-[11px] font-mono shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <Radio className="w-3 h-3 animate-pulse" /> {feasibleVehicles[0].id} En Route
                </div>
              </div>
            </div>

            {/* Bottom Corridor Telemetry Status */}
            <div className="bg-[#070B14] border border-slate-800 p-3 rounded-xl flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Green Wave Corridor status:</span>
              <span className="text-[#10B981] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 6 Traffic Signals Overridden
              </span>
            </div>
          </div>

          {/* Right Column: AI Recommended Vehicle Match & Dispatch Execute */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-[#0B132B] border border-slate-800 rounded-xl p-4 space-y-3 shadow-md">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                RECOMMENDED RESPONSE UNITS
              </div>

              <div className="space-y-3">
                {feasibleVehicles.map((veh, idx) => (
                  <div
                    key={veh.id}
                    className={`p-3.5 rounded-xl border space-y-2.5 transition ${
                      idx === 0
                        ? "bg-[#070B14] border-[#10B981]/60 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                        : "bg-[#070B14] border-slate-800 opacity-80"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-black text-white font-mono flex items-center gap-1.5">
                          {veh.id}
                          {idx === 0 && (
                            <span className="text-[9px] bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] px-1.5 py-0.2 rounded font-normal">
                              TOP MATCH
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400">{veh.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-[#10B981]">
                          {veh.score}%
                        </div>
                        <div className="text-[9px] text-slate-500">Score</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-800/80 py-2 text-center text-[10px] font-mono">
                      <div>
                        <div className="text-slate-400 flex items-center justify-center gap-0.5">
                          <BatteryCharging className="w-3 h-3 text-[#10B981]" /> Batt
                        </div>
                        <div className="font-bold text-slate-200 mt-0.5">{veh.batt}%</div>
                      </div>
                      <div>
                        <div className="text-slate-400 flex items-center justify-center gap-0.5">
                          <Clock className="w-3 h-3 text-amber-400" /> ETA
                        </div>
                        <div className="font-bold text-slate-200 mt-0.5">{veh.eta}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 flex items-center justify-center gap-0.5">
                          <Navigation className="w-3 h-3 text-blue-400" /> Dist
                        </div>
                        <div className="font-bold text-slate-200 mt-0.5">{veh.dist}</div>
                      </div>
                    </div>

                    {idx === 0 ? (
                      <button
                        type="button"
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                      >
                        <Zap className="w-3.5 h-3.5 fill-current" /> Dispatch Unit Now
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2 rounded-lg text-xs transition"
                      >
                        Assign Secondary
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Telemetry Log */}
            <div className="bg-[#0B132B] border border-slate-800 rounded-xl p-4 space-y-2 shadow-md">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                PREEMPTION TELEMETRY
              </div>

              <ul className="text-xs font-mono text-slate-400 space-y-1.5">
                <li className="flex items-start gap-1">
                  <span className="text-[#10B981]">•</span> <span>18:53:10 - Emergency route locked.</span>
                </li>
                <li className="flex items-start gap-1">
                  <span className="text-[#10B981]">•</span> <span>18:53:14 - Signal #1402 green phase extended.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}