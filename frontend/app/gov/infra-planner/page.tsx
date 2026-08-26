"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ArrowLeft,
  Zap,
  Building2,
  AlertCircle,
  BarChart3,
  Cpu,
  Flame,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Data for spatial demand & grid strain simulation graph
const spatialVectorData = [
  { zone: "Sec-14 Dwarka", demandScore: 94, gridLoad: 88, status: "Critical" },
  { zone: "Janakpuri W7", demandScore: 89, gridLoad: 92, status: "High" },
  { zone: "CP Central", demandScore: 78, gridLoad: 82, status: "Medium" },
  { zone: "Okhla Ph-III", demandScore: 65, gridLoad: 75, status: "Medium" },
  { zone: "RK Puram S4", demandScore: 42, gridLoad: 61, status: "Low" },
  { zone: "Rohini Sec-9", demandScore: 81, gridLoad: 79, status: "High" },
  { zone: "Vasant Kunj", demandScore: 58, gridLoad: 54, status: "Low" },
];

export default function InfraPlannerPage() {
  const [activeLayer, setActiveLayer] = useState<"demand" | "grid">("demand");
  const [isSimulating, setIsSimulating] = useState(false);

  const handleRefreshSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 800);
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 font-sans p-6 selection:bg-purple-500 selection:text-white">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between bg-[#0B132B] border border-slate-800 rounded-xl px-5 py-4 shadow-lg">
          <div className="flex items-center gap-4">
            <Link
              href="/gov"
              className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg transition"
            >
              <ArrowLeft className="w-4 h-4" /> BACK TO COMMAND
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <h1 className="text-lg font-black tracking-wider text-white uppercase">
                  AI INFRASTRUCTURE PLANNER
                </h1>
                <span className="bg-purple-500/20 border border-purple-500/40 text-purple-400 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">
                  SPATIAL ML MODEL
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Predictive Charging Demand & Grid Feasibility Analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-slate-900 border border-slate-800 text-xs font-mono text-purple-400 px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 animate-pulse" /> MODEL STATUS: OPTIMAL
            </span>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0B132B] border border-slate-800 rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400 uppercase">Recommended Site #1</span>
              <span className="text-xs font-mono bg-purple-950/60 border border-purple-500/40 text-purple-300 px-2 py-0.5 rounded">High ROI</span>
            </div>
            <h2 className="text-lg font-bold text-white">Janakpuri Ward 7</h2>
            <p className="text-xs text-slate-400 mt-1">Deficit score: 88%. High density EV transit area requiring 2 Fast Charging Hubs.</p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs font-mono">
              <span className="text-slate-400">Est. Utilization</span>
              <span className="text-emerald-400 font-bold">88%</span>
            </div>
          </div>

          <div className="bg-[#0B132B] border border-slate-800 rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400 uppercase">Recommended Site #2</span>
              <span className="text-xs font-mono bg-amber-950/60 border border-amber-500/40 text-amber-300 px-2 py-0.5 rounded">Grid Check Needed</span>
            </div>
            <h2 className="text-lg font-bold text-white">Okhla Ind. Phase III</h2>
            <p className="text-xs text-slate-400 mt-1">Heavy commercial EV route. Upgrade required for Transformer Substation #4.</p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs font-mono">
              <span className="text-slate-400">Est. Utilization</span>
              <span className="text-amber-400 font-bold">74%</span>
            </div>
          </div>

          <div className="bg-[#0B132B] border border-slate-800 rounded-xl p-5 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400 uppercase">Recommended Site #3</span>
              <span className="text-xs font-mono bg-blue-950/60 border border-blue-500/40 text-blue-300 px-2 py-0.5 rounded">Planned Q3</span>
            </div>
            <h2 className="text-lg font-bold text-white">Dwarka Sector 14</h2>
            <p className="text-xs text-slate-400 mt-1">Ideal hub location to support municipal 112 emergency response fleets.</p>
            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs font-mono">
              <span className="text-slate-400">Est. Utilization</span>
              <span className="text-blue-400 font-bold">92%</span>
            </div>
          </div>
        </div>

        {/* Map Simulation Panel with Visual Recharts Overlay */}
        <div className="bg-[#0B132B] border border-slate-800 rounded-xl p-6 min-h-[480px] flex flex-col justify-between shadow-md relative overflow-hidden font-mono">
          
          {/* Top Panel Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10 pb-4 border-b border-slate-800/80">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Spatial Demand Heatmap Simulation</h3>
                <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-400 text-[10px] border border-purple-800/60 font-bold flex items-center gap-1">
                  <Cpu className="w-3 h-3" /> AI Spatial Active
                </span>
              </div>
              <p className="text-xs text-slate-400">AI Placement Optimization Vector Overlay</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                Coordinates: 28.6139° N, 77.2090° E
              </span>
              <button
                onClick={handleRefreshSimulation}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition"
                title="Recalculate Vectors"
              >
                <RefreshCw className={`w-4 h-4 ${isSimulating ? "animate-spin text-purple-400" : ""}`} />
              </button>
            </div>
          </div>

          {/* Layer Selection & Hotspot Indicators */}
          <div className="flex items-center justify-between py-2 text-xs z-10">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveLayer("demand")}
                className={`px-3 py-1 rounded-md border text-xs font-bold transition ${
                  activeLayer === "demand"
                    ? "bg-purple-900/50 border-purple-500 text-purple-300"
                    : "bg-[#050913] border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Spatial EV Traffic
              </button>
              <button
                onClick={() => setActiveLayer("grid")}
                className={`px-3 py-1 rounded-md border text-xs font-bold transition ${
                  activeLayer === "grid"
                    ? "bg-amber-900/50 border-amber-500 text-amber-300"
                    : "bg-[#050913] border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                Substation Grid Strain
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                Max Deficit: Sector-14
              </span>
              <span className="flex items-center gap-1.5 hidden sm:flex">
                <Flame className="w-3.5 h-3.5 text-red-400" />
                Hotspot Index: 0.94
              </span>
            </div>
          </div>

          {/* Graphical Visualization Stage */}
          <div className="relative w-full h-[280px] bg-[#050913] border border-slate-800 rounded-xl p-4 overflow-hidden my-2">
            
            {/* Grid Backdrop Pattern */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(#A855F7 1px, transparent 1px)`,
                backgroundSize: "24px 24px",
              }}
            />

            {/* Scanning Line Animation */}
            <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent animate-[bounce_4s_infinite] pointer-events-none opacity-40" />

            {/* Recharts Data Visualization */}
            <div className="w-full h-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spatialVectorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="zone"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#1e293b" }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#1e293b" }}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#070B14",
                      borderColor: "#334155",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#f8fafc",
                      fontFamily: "monospace",
                    }}
                    formatter={(value: any) => [
                      `${value}% Score`,
                      activeLayer === "demand" ? "Demand" : "Grid Strain",
                    ]}
                  />
                  <Bar dataKey={activeLayer === "demand" ? "demandScore" : "gridLoad"} radius={[4, 4, 0, 0]}>
                    {spatialVectorData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          activeLayer === "demand"
                            ? entry.demandScore > 85
                              ? "#a855f7"
                              : entry.demandScore > 70
                              ? "#8b5cf6"
                              : "#3b82f6"
                            : entry.gridLoad > 85
                            ? "#ef4444"
                            : "#f59e0b"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="z-10 flex justify-between items-center border-t border-slate-800 pt-4 text-xs font-mono text-slate-400">
            <span>Model Version: PyTorch-v2.4-Spatial</span>
            <span>Target ROI Output: 14.2% Net Annual</span>
          </div>

        </div>

      </div>
    </div>
  );
}