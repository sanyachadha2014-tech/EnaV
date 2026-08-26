"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ArrowLeft,
  TrendingUp,
  Leaf,
  CreditCard,
  Download,
  Calendar,
  Building2,
  PieChart,
  CheckCircle2,
} from "lucide-react";

export default function RevenueSustainabilityPage() {
  const [timeframe, setTimeframe] = useState<"daily" | "monthly" | "yearly">("monthly");

  const revenueStats = [
    { title: "Municipal Tariff Yield", amount: "₹42,85,000", change: "+14.2%", icon: DollarSign, color: "text-emerald-400" },
    { title: "Carbon Offsets Value", amount: "1,480 Tons", change: "₹18.5L Equiv.", icon: Leaf, color: "text-green-400" },
    { title: "Public EV Subsidies Paid", amount: "₹12,40,000", change: "98% Claimed", icon: CreditCard, color: "text-blue-400" },
    { title: "Net Municipal Profit", amount: "₹30,45,000", change: "+8.6% Target", icon: TrendingUp, color: "text-purple-400" },
  ];

  const transactionLogs = [
    { id: "TXN-9041", zone: "Connaught Place Hub 01", energy: "450 kWh", tariff: "₹4,050", carbon: "382 kg CO₂", status: "Settled" },
    { id: "TXN-9042", zone: "Janakpuri Ward 7", energy: "820 kWh", tariff: "₹7,380", carbon: "697 kg CO₂", status: "Settled" },
    { id: "TXN-9043", zone: "Okhla Ind. Phase III", energy: "1,200 kWh", tariff: "₹10,800", carbon: "1,020 kg CO₂", status: "Processing" },
    { id: "TXN-9044", zone: "RK Puram Sector 4", energy: "310 kWh", tariff: "₹2,790", carbon: "263 kg CO₂", status: "Settled" },
  ];

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 font-sans p-6 selection:bg-emerald-500 selection:text-slate-950">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0B132B] border border-slate-800 rounded-xl px-5 py-4 shadow-lg">
          <div className="flex items-center gap-4">
            <Link
              href="/gov"
              className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-white bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg transition"
            >
              <ArrowLeft className="w-4 h-4" /> BACK TO COMMAND
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h1 className="text-lg font-black tracking-wider text-white uppercase">
                  REVENUE & SUSTAINABILITY DASHBOARD
                </h1>
                <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">
                  FINANCIAL TELEMETRY
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Municipal Tariff Collection, Carbon Credits & Economic Offsets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-[#070B14] border border-slate-800 p-1 rounded-lg text-xs font-mono">
              {(["daily", "monthly", "yearly"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1 rounded-md capitalize transition ${
                    timeframe === t ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-2 rounded-lg text-xs font-mono flex items-center gap-2 transition">
              <Download className="w-3.5 h-3.5" /> EXPORT REPORT
            </button>
          </div>
        </div>

        {/* 4 Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {revenueStats.map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <div key={idx} className="bg-[#0B132B] border border-slate-800 rounded-xl p-5 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400 uppercase">{stat.title}</span>
                  <IconComponent className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="mt-2 flex items-baseline justify-between font-mono">
                  <span className="text-2xl font-black text-white">{stat.amount}</span>
                  <span className="text-xs font-bold text-emerald-400">{stat.change}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Main Transaction Table */}
          <div className="lg:col-span-8 bg-[#0B132B] border border-slate-800 rounded-xl p-5 shadow-md space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-white">Live Municipal Tariff & Energy Ledger</h2>
                <p className="text-xs text-slate-400">Real-time revenue capture from public fast-charging nodes</p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded">
                Live Audit Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">TXN ID</th>
                    <th className="pb-3 font-semibold">LOCATION ZONE</th>
                    <th className="pb-3 font-semibold">DISPENSED</th>
                    <th className="pb-3 font-semibold">TARIFF</th>
                    <th className="pb-3 font-semibold">CARBON SAVED</th>
                    <th className="pb-3 font-semibold text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {transactionLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40">
                      <td className="py-3 font-bold text-white">{log.id}</td>
                      <td className="py-3 text-slate-400">{log.zone}</td>
                      <td className="py-3">{log.energy}</td>
                      <td className="py-3 text-emerald-400 font-bold">{log.tariff}</td>
                      <td className="py-3 text-green-400">{log.carbon}</td>
                      <td className="py-3 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === "Settled"
                              ? "bg-emerald-950 border border-emerald-500/40 text-emerald-400"
                              : "bg-amber-950 border border-amber-500/40 text-amber-400"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Carbon Credit & Subsidies Breakdown */}
          <div className="lg:col-span-4 space-y-4">
            
            <div className="bg-[#0B132B] border border-slate-800 rounded-xl p-5 shadow-md space-y-3">
              <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
                <Leaf className="w-4 h-4 text-green-400" />
                <span>Environmental Carbon Offsets</span>
              </div>
              <p className="text-xs text-slate-400">
                Calculated against diesel/petrol municipal baseline transit emissions across NCT Delhi.
              </p>

              <div className="space-y-2 pt-2 font-mono text-xs">
                <div className="flex justify-between p-2.5 bg-[#070B14] rounded-lg border border-slate-800">
                  <span className="text-slate-400">Fleet Reductions</span>
                  <span className="text-white font-bold">1,120 Tons</span>
                </div>
                <div className="flex justify-between p-2.5 bg-[#070B14] rounded-lg border border-slate-800">
                  <span className="text-slate-400">Private EV Offsets</span>
                  <span className="text-white font-bold">360 Tons</span>
                </div>
                <div className="flex justify-between p-2.5 bg-[#070B14] rounded-lg border border-slate-800">
                  <span className="text-slate-400">Carbon Trading Value</span>
                  <span className="text-emerald-400 font-bold">₹18,50,000</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0B132B] border border-slate-800 rounded-xl p-5 shadow-md space-y-3">
              <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
                <PieChart className="w-4 h-4 text-purple-400" />
                <span>Municipal Subsidies Allocation</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden flex">
                <div className="bg-emerald-500 h-full w-[65%]" title="Public Chargers" />
                <div className="bg-purple-500 h-full w-[25%]" title="Grid Upgrades" />
                <div className="bg-amber-500 h-full w-[10%]" title="Admin" />
              </div>
              <div className="flex justify-between text-[11px] font-mono text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Chargers (65%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500" /> Grid (25%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Admin (10%)
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}