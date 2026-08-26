"use client";

import React, { useState } from "react";
import {
  Cpu,
  Layers,
  Zap,
  FileText,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Building,
  Download
} from "lucide-react";

interface WardData {
  id: string;
  name: string;
  evDensity: number; // EVs per day
  chargerRatio: string;
  gridSurplusKw: number;
  avgQueueMin: number;
  status: "OPTIMAL" | "MODERATE_DEFICIT" | "SEVERE_DEFICIT";
}

export default function AIInfraPlannerPage() {
  const [wards] = useState<WardData[]>([
    {
      id: "WARD-07",
      name: "Janakpuri West",
      evDensity: 1420,
      chargerRatio: "1:48",
      gridSurplusKw: 450,
      avgQueueMin: 24,
      status: "SEVERE_DEFICIT",
    },
    {
      id: "WARD-14",
      name: "Dwarka Sector 10",
      evDensity: 1890,
      chargerRatio: "1:32",
      gridSurplusKw: 620,
      avgQueueMin: 18,
      status: "MODERATE_DEFICIT",
    },
    {
      id: "WARD-03",
      name: "Rohini Sector 7",
      evDensity: 820,
      chargerRatio: "1:15",
      gridSurplusKw: 890,
      avgQueueMin: 6,
      status: "OPTIMAL",
    },
  ]);

  const [selectedWard, setSelectedWard] = useState<WardData>(wards[0]);
  const [activeLayers, setActiveLayers] = useState({
    ddaLand: true,
    substationProximity: true,
    geofence: false,
  });
  const [isTenderGenerated, setIsTenderGenerated] = useState(false);

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleGenerateTender = () => {
    setIsTenderGenerated(true);
    setTimeout(() => setIsTenderGenerated(false), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Module Title & Map Layer Toggles */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-white uppercase tracking-wider">
              AI Infrastructure Planner
            </h2>
            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
              GRID OVERLAY INTEGRATED
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Ward Deficit Evaluation, Transformer Capacity Estimator & Land Zoning Map Overlays
          </p>
        </div>

        {/* Integrated GIS Overlay Controls */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800 text-xs">
          <span className="text-slate-400 font-mono text-[11px] px-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-emerald-400" /> Layers:
          </span>
          <button
            onClick={() => toggleLayer("ddaLand")}
            className={`px-2.5 py-1 rounded transition text-[11px] font-medium ${
              activeLayers.ddaLand
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            DDA Land Bank
          </button>
          <button
            onClick={() => toggleLayer("substationProximity")}
            className={`px-2.5 py-1 rounded transition text-[11px] font-medium ${
              activeLayers.substationProximity
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            Substation Grid
          </button>
        </div>
      </div>

      {/* Main Grid: Left Deficit Math vs Right AI Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT PANEL: Ward Deficit Scoreboard (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Ward Priority Scorecard
              </span>
              <span className="text-[10px] font-mono text-emerald-400">4-Factor Deficit Math</span>
            </div>

            <div className="space-y-2.5">
              {wards.map((ward) => (
                <div
                  key={ward.id}
                  onClick={() => setSelectedWard(ward)}
                  className={`p-3.5 rounded-xl border text-xs cursor-pointer transition ${
                    selectedWard.id === ward.id
                      ? "bg-slate-800/90 border-emerald-500/50 text-white"
                      : "bg-slate-950/50 border-slate-800/80 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-bold text-sm text-white">{ward.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 block">{ward.id}</span>
                    </div>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold border ${
                        ward.status === "SEVERE_DEFICIT"
                          ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                          : ward.status === "MODERATE_DEFICIT"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      }`}
                    >
                      {ward.status.replace("_", " ")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
                    <div>EV Traffic: <span className="text-white font-bold">{ward.evDensity}/day</span></div>
                    <div>Charger Ratio: <span className="text-white font-bold">{ward.chargerRatio}</span></div>
                    <div>Grid Surplus: <span className="text-emerald-400 font-bold">{ward.gridSurplusKw} kW</span></div>
                    <div>Queue Time: <span className="text-amber-400 font-bold">{ward.avgQueueMin} mins</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: AI Feasibility & Actions (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          
          {/* AI Recommended Sites */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400" /> Site Feasibility Recommendations ({selectedWard.name})
              </span>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">
                Top AI Match
              </span>
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-white">MCD Public Parking Lot (Plot 14B)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">DDA Land Clearance Approved • 45m from Transformer Substation</p>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-mono font-bold text-sm">94.2%</span>
                  <span className="text-[10px] text-slate-500 block">Feasibility</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-white">Janakpuri West Metro Gate 2 Parking</span>
                  </div>
                  <p className="text-[11px] text-slate-400">High Footfall Transit Hub • Dedicated 11kV Feeder Line Available</p>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-mono font-bold text-sm">88.7%</span>
                  <span className="text-[10px] text-slate-500 block">Feasibility</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid Load Estimator & Capex Tender Generation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Grid Load Expansion Impact
              </span>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Proposed Fast Chargers:</span>
                  <span className="text-white font-bold">2x 120 kW CCS2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Est. Peak Grid Draw:</span>
                  <span className="text-amber-400 font-bold">240 kW</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-1">
                  <span className="text-slate-400">Substation Capacity Left:</span>
                  <span className="text-emerald-400 font-bold">
                    {selectedWard.gridSurplusKw - 240} kW
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" /> Municipal Procurement
                </span>
                <p className="text-slate-400 text-[11px] mt-1">
                  Generate automated Tender/RFQ draft specifications for {selectedWard.name}.
                </p>
              </div>

              <button
                onClick={handleGenerateTender}
                className={`w-full py-2 rounded-lg font-bold transition flex items-center justify-center gap-2 text-xs font-mono uppercase ${
                  isTenderGenerated
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40"
                }`}
              >
                {isTenderGenerated ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> RFQ Draft Exported
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Export Tender RFQ Draft
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}