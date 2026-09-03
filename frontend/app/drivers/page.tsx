"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
    ArrowRight,
    BatteryCharging,
    CarFront,
    CircleAlert,
    Gauge,
    Leaf,
    Map,
    Navigation,
    UserRound,
    Zap,
} from "lucide-react";

const WALLET_KEY = "ev_carbon_wallet_v2";

export default function DriverDashboardPage() {
    const [carbonBalance, setCarbonBalance] = useState(0);
    const [soc, setSoc] = useState(85);
    const [vehicleId, setVehicleId] = useState("EV-2048-DX");

    useEffect(() => {
        const loadDashboardData = () => {
            try {
                const wallet = localStorage.getItem(WALLET_KEY);

                if (wallet) {
                    const parsed = JSON.parse(wallet);
                    const balance = Number(parsed?.balance);

                    setCarbonBalance(
                        Number.isFinite(balance) && balance >= 0
                            ? balance
                            : 0
                    );
                } else {
                    setCarbonBalance(0);
                }

                const profile = localStorage.getItem("ev_driver_profile");

                if (profile) {
                    const parsedProfile = JSON.parse(profile);

                    if (parsedProfile?.vehicleId) {
                        setVehicleId(parsedProfile.vehicleId);
                    }

                    if (
                        Number.isFinite(
                            Number(parsedProfile?.currentSoc)
                        )
                    ) {
                        setSoc(
                            Math.max(
                                0,
                                Math.min(
                                    100,
                                    Number(parsedProfile.currentSoc)
                                )
                            )
                        );
                    }
                }
            } catch (error) {
                console.error(
                    "Failed to load dashboard data:",
                    error
                );
            }
        };

        loadDashboardData();

        window.addEventListener(
            "ev-carbon-wallet-updated",
            loadDashboardData
        );

        window.addEventListener("focus", loadDashboardData);

        const handleStorage = (event: StorageEvent) => {
            if (
                event.key === WALLET_KEY ||
                event.key === "ev_driver_profile"
            ) {
                loadDashboardData();
            }
        };

        window.addEventListener("storage", handleStorage);

        return () => {
            window.removeEventListener(
                "ev-carbon-wallet-updated",
                loadDashboardData
            );
            window.removeEventListener("focus", loadDashboardData);
            window.removeEventListener("storage", handleStorage);
        };
    }, []);

    const estimatedRange = Math.round(
        (soc / 100) * 420
    );

    return (
        <div className="min-h-[calc(100vh-65px)] bg-[#030712] text-slate-100">
            <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-7">

                {/* HEADER */}
                <section className="flex flex-col gap-4 border-b border-slate-800/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-400">
                            <Zap className="h-3.5 w-3.5" />
                            EnaV Driver Console
                        </div>

                        <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                            EV Mobility Dashboard
                        </h1>

                        <p className="mt-1.5 max-w-2xl text-xs leading-6 text-slate-400">
                            Plan smarter routes, monitor your EV, find charging infrastructure, and track your environmental impact.
                        </p>
                    </div>

                    <Link
                        href="/drivers/profile"
                        className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-300 transition hover:border-cyan-500/40 hover:text-white sm:self-auto"
                    >
                        <UserRound className="h-4 w-4" />
                        Vehicle Profile
                    </Link>
                </section>

                {/* TOP STATS */}
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                    <div className="rounded-2xl border border-cyan-500/20 bg-[#07101d] p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Battery SOC
                            </span>
                            <BatteryCharging className="h-4 w-4 text-cyan-400" />
                        </div>

                        <div className="mt-4 text-3xl font-black text-white">
                            {soc.toFixed(0)}%
                        </div>

                        <div className="mt-2 text-[10px] text-slate-500">
                            Estimated range:{" "}
                            <span className="text-slate-300">
                                {estimatedRange} km
                            </span>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-500/20 bg-[#07101d] p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Carbon Wallet
                            </span>
                            <Leaf className="h-4 w-4 text-emerald-400" />
                        </div>

                        <div className="mt-4 text-3xl font-black text-white">
                            {carbonBalance.toFixed(2)}
                            <span className="ml-2 text-sm text-emerald-400">
                                CC
                            </span>
                        </div>

                        <div className="mt-2 text-[10px] text-slate-500">
                            {carbonBalance.toFixed(2)} kg CO₂ avoided
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-[#07101d] p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Vehicle
                            </span>
                            <CarFront className="h-4 w-4 text-slate-400" />
                        </div>

                        <div className="mt-4 text-xl font-black text-white">
                            {vehicleId}
                        </div>

                        <div className="mt-2 text-[10px] text-slate-500">
                            Connected EV telemetry
                        </div>
                    </div>

                    <div className="rounded-2xl border border-amber-500/20 bg-[#07101d] p-5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Safety Reserve
                            </span>
                            <Gauge className="h-4 w-4 text-amber-400" />
                        </div>

                        <div className="mt-4 text-3xl font-black text-white">
                            15%
                        </div>

                        <div className="mt-2 text-[10px] text-slate-500">
                            Minimum recommended reserve
                        </div>
                    </div>
                </section>

                {/* MAIN ACTIONS */}
                <section className="grid gap-4 lg:grid-cols-3">

                    <Link
                        href="/drivers/route-optimizer"
                        className="group rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/40 to-[#07101d] p-6 transition hover:border-cyan-400/50"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                            <Navigation className="h-5 w-5" />
                        </div>

                        <h2 className="mt-5 text-base font-black text-white">
                            Route Optimizer
                        </h2>

                        <p className="mt-2 text-xs leading-5 text-slate-400">
                            Find a battery-aware route and get charging recommendations.
                        </p>

                        <div className="mt-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-cyan-400">
                            Plan Journey
                            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                        </div>
                    </Link>

                    <Link
                        href="/drivers/wallet"
                        className="group rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/30 to-[#07101d] p-6 transition hover:border-emerald-400/50"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                            <Leaf className="h-5 w-5" />
                        </div>

                        <h2 className="mt-5 text-base font-black text-white">
                            Carbon Credit Wallet
                        </h2>

                        <p className="mt-2 text-xs leading-5 text-slate-400">
                            View your earned Carbon Credits and completed journey rewards.
                        </p>

                        <div className="mt-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-emerald-400">
                            Open Wallet
                            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                        </div>
                    </Link>

                    <Link
                        href="/drivers/chargers"
                        className="group rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/30 to-[#07101d] p-6 transition hover:border-violet-400/50"
                    >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                            <Map className="h-5 w-5" />
                        </div>

                        <h2 className="mt-5 text-base font-black text-white">
                            Charging Network
                        </h2>

                        <p className="mt-2 text-xs leading-5 text-slate-400">
                            Explore charging infrastructure and find compatible charging options.
                        </p>

                        <div className="mt-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-violet-400">
                            Find Chargers
                            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                        </div>
                    </Link>
                </section>

                {/* QUICK STATUS */}
                <section className="grid gap-4 lg:grid-cols-2">

                    <div className="rounded-2xl border border-slate-800 bg-[#07101d] p-6">
                        <div className="flex items-center gap-2">
                            <Gauge className="h-4 w-4 text-cyan-400" />
                            <h2 className="text-xs font-black uppercase tracking-wider text-slate-300">
                                Vehicle Readiness
                            </h2>
                        </div>

                        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800">
                            <div
                                className="h-full rounded-full bg-cyan-400 transition-all"
                                style={{ width: `${soc}%` }}
                            />
                        </div>

                        <div className="mt-3 flex justify-between text-[10px]">
                            <span className="text-slate-500">
                                Current SOC
                            </span>
                            <span className="font-bold text-cyan-400">
                                {soc.toFixed(0)}%
                            </span>
                        </div>

                        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                                <CircleAlert className="h-4 w-4" />
                                Routing Safety
                            </div>

                            <p className="mt-2 text-[10px] leading-5 text-slate-400">
                                Routes are evaluated against your battery reserve before a journey is started.
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-[#07101d] p-6">
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-400" />
                            <h2 className="text-xs font-black uppercase tracking-wider text-slate-300">
                                Smart Mobility
                            </h2>
                        </div>

                        <div className="mt-5 space-y-3">
                            <div className="flex items-center justify-between rounded-xl bg-slate-950/50 p-4">
                                <div>
                                    <div className="text-xs font-bold text-white">
                                        Battery-aware routing
                                    </div>
                                    <div className="mt-1 text-[10px] text-slate-500">
                                        Active
                                    </div>
                                </div>
                                <span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-[9px] font-black uppercase text-emerald-400">
                                    Ready
                                </span>
                            </div>

                            <div className="flex items-center justify-between rounded-xl bg-slate-950/50 p-4">
                                <div>
                                    <div className="text-xs font-bold text-white">
                                        EV charging intelligence
                                    </div>
                                    <div className="mt-1 text-[10px] text-slate-500">
                                        Charger compatibility + route context
                                    </div>
                                </div>
                                <BatteryCharging className="h-4 w-4 text-cyan-400" />
                            </div>

                            <div className="flex items-center justify-between rounded-xl bg-slate-950/50 p-4">
                                <div>
                                    <div className="text-xs font-bold text-white">
                                        Environmental rewards
                                    </div>
                                    <div className="mt-1 text-[10px] text-slate-500">
                                        1 CC = 1 kg CO₂ avoided
                                    </div>
                                </div>
                                <Leaf className="h-4 w-4 text-emerald-400" />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
