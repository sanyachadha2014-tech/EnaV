'use client';

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BatteryCharging,
  CircleUserRound,
  Route,
  Wallet,
  Calculator,
  FileText,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";

/* =========================================================
   ENAV INTERACTIVE DRIVER DASHBOARD (ENHANCED UI & UX)
   - Fully responsive, accessible, and interactive
   - Includes real-time subsidy calculator and official gov schemes
========================================================= */

export default function DriverHomePage() {
  const [selectedScheme, setSelectedScheme] = useState<any | null>(null);
  const [vehicleType, setVehicleType] = useState<"2W" | "4W" | "commercial">("2W");
  const [dailyKm, setDailyKm] = useState<number>(45);

  const govSchemes = [
    {
      id: "pm-e-drive",
      title: "PM E-DRIVE Scheme",
      ministry: "Ministry of Heavy Industries",
      benefit: "Up to ₹10,000/kWh upfront subsidy for electric 2-wheelers, ambulances & fleets.",
      deadline: "Active FY 2026-27",
      description: "Accelerates EV adoption nationwide through direct purchase incentives and massive public fast-charging station deployment.",
      eligibility: "All registered EV owners holding valid identification."
    },
    {
      id: "delhi-ev-2",
      title: "Delhi EV Policy 2.0 & Aggregator Mandate",
      ministry: "Transport Department, GNCTD",
      benefit: "100% road tax/registration fee waiver + scrappage bonuses.",
      deadline: "Ongoing Scheme",
      description: "Promotes cleaner commercial fleets and delivery networks within the capital with special financial rewards for women drivers.",
      eligibility: "Vehicles registered within Delhi NCR."
    },
    {
      id: "pli-acc",
      title: "PLI Scheme for Advanced Chemistry Cell (ACC)",
      ministry: "Ministry of Power & NITI Aayog",
      benefit: "Subsidized battery replacement and green energy charging credits.",
      deadline: "Long-term Support",
      description: "Encourages domestic battery production to lower long-term maintenance overheads for commercial electric operators.",
      eligibility: "Commercial transport drivers and fleet operators."
    }
  ];

  const calculateSavings = () => {
    const petrolCostPerKm = 3.5;
    const evCostPerKm = 0.9;
    const monthlySavings = Math.round((petrolCostPerKm - evCostPerKm) * dailyKm * 30);
    
    let subsidy = 15000;
    if (vehicleType === "4W") subsidy = 150000;
    if (vehicleType === "commercial") subsidy = 60000;

    return { monthlySavings, subsidy };
  };

  const stats = calculateSavings();

  return (
    <div className="min-h-[calc(100vh-145px)] pb-16 space-y-8">
      
      {/* GREETING HEADER BANNER */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-[#07101d] via-[#0b182c] to-[#07101d] p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase tracking-widest mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Verified Driver Portal
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Hello, Driver.
            </h1>
            <p className="mt-1.5 max-w-xl text-xs sm:text-sm text-slate-400 leading-relaxed">
              Manage your mobility operations, track wallet earnings, and access government EV incentives seamlessly.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl backdrop-blur-md self-start md:self-auto">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase text-slate-400 font-bold">System Status</div>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                All Networks Online
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRIMARY ACTION CARDS */}
      <section className="grid gap-6 lg:grid-cols-2">
        
        {/* JOURNEY CARD */}
        <Link
          href="/drivers/route-optimizer"
          className="group relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-[#07101d] to-[#040810] p-6 sm:p-7 transition-all duration-300 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/10 block"
        >
          <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-blue-500/10 blur-3xl pointer-events-none transition group-hover:scale-125" />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 group-hover:scale-110 transition shadow-inner">
                <Route className="h-6 w-6 text-blue-400" />
              </div>

              <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition shadow-sm">
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </div>
            </div>

            <h2 className="mt-6 text-xl font-black text-white group-hover:text-blue-400 transition">
              Plan a journey
            </h2>

            <p className="mt-2 max-w-md text-xs sm:text-sm leading-relaxed text-slate-400">
              Enter your destination, compare intelligent route options, select the best path and start your trip.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Tag text="Fastest" />
              <Tag text="Energy Efficient" />
              <Tag text="Balanced" />
            </div>
          </div>
        </Link>

        {/* CHARGING CARD */}
        <Link
          href="/drivers/chargers"
          className="group relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-[#07101d] to-[#040810] p-6 sm:p-7 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 block"
        >
          <div className="absolute -right-20 -top-20 h-44 w-44 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none transition group-hover:scale-125" />

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 group-hover:scale-110 transition shadow-inner">
                <BatteryCharging className="h-6 w-6 text-emerald-400" />
              </div>

              <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-black transition shadow-sm">
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </div>
            </div>

            <h2 className="mt-6 text-xl font-black text-white group-hover:text-emerald-400 transition">
              Charging
            </h2>

            <p className="mt-2 max-w-md text-xs sm:text-sm leading-relaxed text-slate-400">
              Find verified charging stations and check real-time connector availability for your journey.
            </p>

            <div className="mt-6 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              <span>View live charging network</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </Link>
      </section>

      {/* SECONDARY NAVIGATION CARDS */}
      <section className="grid gap-5 sm:grid-cols-2">
        <Link
          href="/drivers/wallet"
          className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#07101d] p-5 sm:p-6 transition-all hover:border-slate-700 hover:bg-slate-900/60 block"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-cyan-400">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <Wallet className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-300">
                Wallet Ledger
              </span>
            </div>

            <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-cyan-500 group-hover:text-black transition">
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="mt-4 text-base font-black text-white group-hover:text-cyan-400 transition">
            Manage wallet
          </div>

          <div className="mt-1 text-xs text-slate-400">
            Check balance, carbon rewards, and secure transaction logs
          </div>
        </Link>

        <Link
          href="/drivers/profile"
          className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-[#07101d] p-5 sm:p-6 transition-all hover:border-slate-700 hover:bg-slate-900/60 block"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-purple-400">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <CircleUserRound className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-300">
                Operator Account
              </span>
            </div>

            <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-purple-500 group-hover:text-white transition">
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>

          <div className="mt-4 text-base font-black text-white group-hover:text-purple-400 transition">
            Driver profile
          </div>

          <div className="mt-1 text-xs text-slate-400">
            View personal credentials and verified vehicle information
          </div>
        </Link>
      </section>

      {/* ================= INTERACTIVE TOOLS & GOV SCHEMES ================= */}
      <section className="grid gap-6 lg:grid-cols-2 pt-2">
        
        {/* EV Subsidy & Savings Calculator */}
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-[#07101d] to-[#040810] p-6 sm:p-7 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  EV Subsidy & Savings Calculator
                </h3>
                <p className="text-xs text-slate-400">Estimate your monthly fuel savings & government incentive</p>
              </div>
            </div>

            <div className="space-y-4 my-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Vehicle Category</label>
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    type="button"
                    onClick={() => setVehicleType("2W")}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition ${vehicleType === "2W" ? "border-cyan-400 bg-cyan-500/20 text-white shadow-lg shadow-cyan-500/10" : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"}`}
                  >
                    2-Wheeler
                  </button>
                  <button 
                    type="button"
                    onClick={() => setVehicleType("4W")}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition ${vehicleType === "4W" ? "border-cyan-400 bg-cyan-500/20 text-white shadow-lg shadow-cyan-500/10" : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"}`}
                  >
                    4-Wheeler Car
                  </button>
                  <button 
                    type="button"
                    onClick={() => setVehicleType("commercial")}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-bold transition ${vehicleType === "commercial" ? "border-cyan-400 bg-cyan-500/20 text-white shadow-lg shadow-cyan-500/10" : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700"}`}
                  >
                    Commercial
                  </button>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-2">
                  <span className="text-[10px] text-slate-400 uppercase">Daily Commute Distance</span>
                  <span className="text-cyan-400 font-mono text-xs bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">{dailyKm} km/day</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="150" 
                  step="5"
                  value={dailyKm} 
                  onChange={(e) => setDailyKm(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer bg-slate-800 h-2 rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-800/80">
            <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Est. Monthly Savings</div>
              <div className="text-lg font-black text-emerald-400 mt-0.5">₹{stats.monthlySavings.toLocaleString()}</div>
            </div>
            <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Max Subsidy Grant</div>
              <div className="text-lg font-black text-cyan-400 mt-0.5">₹{stats.subsidy.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Government EV Schemes Directory */}
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-[#07101d] to-[#040810] p-6 sm:p-7 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Government EV Schemes & Grants
                </h3>
                <p className="text-xs text-slate-400">Official central & state policy benefits</p>
              </div>
            </div>

            <div className="space-y-3 my-4">
              {govSchemes.map((scheme) => (
                <div 
                  key={scheme.id}
                  onClick={() => setSelectedScheme(scheme)}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-emerald-500/40 transition cursor-pointer group"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition flex items-center gap-1.5">
                      {scheme.title}
                      <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400" />
                    </div>
                    <div className="text-[10px] text-slate-400">{scheme.ministry}</div>
                  </div>
                  <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-xl border border-emerald-500/20 shrink-0">
                    {scheme.deadline}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verified Central Portals
            </span>
            <span className="text-emerald-400 font-bold">Active FY 2026</span>
          </div>
        </div>

      </section>

      {/* ================= SCHEME DETAILS MODAL ================= */}
      {selectedScheme && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl border border-emerald-500/30 bg-[#07101d] p-6 sm:p-8 shadow-2xl">
            <button 
              type="button"
              onClick={() => setSelectedScheme(null)}
              className="absolute right-5 top-5 w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition"
            >
              ✕
            </button>

            <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">
              {selectedScheme.ministry}
            </div>

            <h3 className="text-xl font-extrabold text-white mb-4">
              {selectedScheme.title}
            </h3>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mb-4">
              <div className="text-[10px] font-extrabold text-emerald-300 uppercase tracking-wider">Financial Benefit:</div>
              <div className="text-xs sm:text-sm font-bold text-white mt-1">{selectedScheme.benefit}</div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 mb-6">
              <div>
                <strong className="text-white block mb-1">Scheme Overview:</strong>
                <p className="text-slate-400 leading-relaxed text-xs">{selectedScheme.description}</p>
              </div>
              <div>
                <strong className="text-white block mb-1">Eligibility Criteria:</strong>
                <p className="text-slate-400 leading-relaxed text-xs">{selectedScheme.eligibility}</p>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => {
                alert("Redirecting to official government authentication portal...");
                setSelectedScheme(null);
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-black text-xs uppercase tracking-widest hover:brightness-110 transition shadow-lg shadow-emerald-500/20"
            >
              Apply via EnaV Secure Portal →
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

function Tag({ text }: { text: string }) {
  return (
    <span className="rounded-xl border border-slate-800 bg-[#050A13] px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 shadow-inner">
      {text}
    </span>
  );
}