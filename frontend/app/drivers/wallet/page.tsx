"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Info, Leaf, Sparkles, X } from "lucide-react";

/* =========================================================
   CARBON CREDITS WALLET PAGE (ENLARGED TEXT SIZE)
========================================================= */

export default function CarbonWalletPage() {
    const [showInfoModal, setShowInfoModal] = useState(false);

    // Wallet State
    const [carbonBalance, setCarbonBalance] = useState(124.80);
    const [equivalentRupees, setEquivalentRupees] = useState(1240.00);

    const [transactions, setTransactions] = useState([
        {
            id: 1,
            type: "Charging Offset Reward",
            location: "Janakpuri Mobility Hub",
            distance: "14.2 km",
            creditsEarned: "+18.5 CC",
            costComparison: "Saved vs Petrol: ₹112.00",
            date: "Today, 2:45 PM",
        },
        {
            id: 2,
            type: "EV Transit Journey",
            location: "Mobility service",
            distance: "8.5 km",
            creditsEarned: "+12.0 CC",
            costComparison: "Saved vs Petrol: ₹68.00",
            date: "Yesterday",
        },
        {
            id: 3,
            type: "Green Credits Top-up",
            location: "Redeemed community offset",
            distance: "-",
            creditsEarned: "+100.0 CC",
            costComparison: "Direct Offset Grant",
            date: "24 Aug 2026",
        },
    ]);

    return (
        <div className="space-y-6">
            {/* =====================================================
          HEADER SECTION
      ===================================================== */}
            <section className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                        Sustainability Ledger
                    </div>

                    <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                        Carbon Credits Wallet
                    </h1>

                    <p className="mt-1.5 max-w-xl text-xs leading-6 text-slate-400">
                        Track your emissions saved, green travel rewards, and economic offset value.
                    </p>
                </div>

                <Link
                    href="/dashboard"
                    className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-800 px-3.5 py-2.5 text-[10px] font-bold text-slate-400 transition hover:text-white"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Dashboard
                </Link>
            </section>

            {/* =====================================================
          WALLET BALANCE CARD WITH INFO BUTTON
      ===================================================== */}
            <section className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-[#07101d] to-[#040914] p-6 sm:p-8">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                            <Leaf className="h-4 w-4" />
                            Available Carbon Credits
                        </div>

                        <div className="mt-3 flex items-baseline gap-3">
                            <span className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                                {carbonBalance.toFixed(2)}
                            </span>
                            <span className="text-sm font-bold text-emerald-400">CC</span>
                        </div>

                        <div className="mt-2 text-xs text-slate-400">
                            Estimated economic offset value: <span className="text-slate-200 font-bold">₹{equivalentRupees.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Information Button */}
                    <button
                        type="button"
                        onClick={() => setShowInfoModal(true)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-[#050A13] text-slate-400 transition hover:border-emerald-500/40 hover:text-emerald-400"
                        title="How are credits calculated?"
                    >
                        <Info className="h-4 w-4" />
                    </button>
                </div>

                {/* Quick actions inside card */}
                <div className="mt-6 flex flex-wrap gap-3">
                    <button
                        type="button"
                        className="flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-[10px] font-black uppercase tracking-wider text-[#020712] transition hover:brightness-110"
                    >
                        <Sparkles className="h-4 w-4" />
                        Redeem Credits
                    </button>
                </div>
            </section>

            {/* =====================================================
          RECENT TRANSACTIONS / CREDITS EARNED LOG
      ===================================================== */}
            <section className="space-y-3">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Recent Credit Activity
                </h2>

                <div className="space-y-2.5">
                    {transactions.map((tx) => (
                        <div
                            key={tx.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-[#07101d] p-4.5 transition hover:border-slate-700"
                        >
                            <div className="flex items-center gap-3.5">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                                    <Leaf className="h-5 w-5" />
                                </div>

                                <div>
                                    <div className="text-xs font-black text-white">
                                        {tx.type}
                                    </div>
                                    <div className="mt-1 text-[10px] text-slate-400">
                                        {tx.location} • <span className="text-slate-300 font-medium">{tx.distance}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex sm:flex-col items-center sm:items-end justify-between border-t border-slate-800/60 sm:border-t-0 pt-2.5 sm:pt-0">
                                <div className="text-xs font-black text-emerald-400">
                                    {tx.creditsEarned}
                                </div>
                                <div className="mt-1 text-[10px] text-slate-400 font-medium">
                                    {tx.costComparison}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* =====================================================
          INFO MODAL: FORMULA & CALCULATION LOGIC
      ===================================================== */}
            {showInfoModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-[#07101d] p-6 sm:p-8 shadow-2xl">
                        <button
                            type="button"
                            onClick={() => setShowInfoModal(false)}
                            className="absolute right-5 top-5 text-slate-400 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-2.5 text-emerald-400">
                            <Info className="h-5 w-5" />
                            <h3 className="text-base font-black text-white">
                                Carbon Credit Calculation Engine
                            </h3>
                        </div>

                        <p className="mt-2.5 text-xs leading-5 text-slate-300">
                            Credits are computed dynamically by comparing environmental impact, distance traveled, and monetary savings of electric vehicle usage against a benchmark petrol vehicle.
                        </p>

                        <div className="mt-5 rounded-xl border border-slate-800 bg-[#050A13] p-4 font-mono text-[10px] text-emerald-300 leading-relaxed">
                            <p className="font-bold text-slate-200 mb-1">Formula Model:</p>
                            <p className="text-white">Credits = Distance (km) × [ (Petrol Cost/km - EV Cost/km) / Conversion Factor ]</p>
                        </div>

                        <div className="mt-5 space-y-3.5 text-xs text-slate-300">
                            <div>
                                <span className="font-bold text-white">1. Distance Covered:</span> Measured accurately via active GPS route segments or transit logs.
                            </div>
                            <div>
                                <span className="font-bold text-white">2. Petrol Cost Benchmark:</span> Derived from average fuel pricing (~₹105/L) divided by standard vehicle mileage (~15 km/L), averaging <span className="text-slate-100 font-semibold">~₹7.00 per km</span>.
                            </div>
                            <div>
                                <span className="font-bold text-white">3. Electricity Cost:</span> Calculated using home/hub charging tariff (~₹8/kWh) divided by EV energy efficiency (~6 km/kWh), averaging <span className="text-slate-100 font-semibold">~₹1.33 per km</span>.
                            </div>
                            <div>
                                <span className="font-bold text-white">4. Carbon Offset Factor:</span> Each saved rupee and cleaner kilometer offsets approximately <span className="text-slate-100 font-semibold">120g to 150g of CO₂</span> emissions from entering the atmosphere.
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setShowInfoModal(false)}
                            className="mt-7 h-11 w-full rounded-xl bg-emerald-400 text-xs font-black uppercase tracking-wider text-[#020712] transition hover:brightness-110"
                        >
                            Got It
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}