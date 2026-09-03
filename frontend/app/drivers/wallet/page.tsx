"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Info, Leaf, Sparkles, X } from "lucide-react";

const WALLET_KEY = "ev_carbon_wallet_v2";

interface WalletTransaction {
    id: string;
    journeyId?: string;
    type: string;
    location: string;
    distance: string;
    creditsEarned: string;
    costComparison: string;
    date: string;
    co2Saved?: number;
}

export default function CarbonWalletPage() {
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [carbonBalance, setCarbonBalance] = useState(0);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

    useEffect(() => {
        const loadWallet = () => {
            try {
                const savedWallet = localStorage.getItem(WALLET_KEY);

                if (!savedWallet) {
                    setCarbonBalance(0);
                    setTransactions([]);
                    return;
                }

                const wallet = JSON.parse(savedWallet);
                const balance = Number(wallet.balance);

                setCarbonBalance(Number.isFinite(balance) ? balance : 0);
                setTransactions(Array.isArray(wallet.transactions) ? wallet.transactions : []);
            } catch (error) {
                console.error("Failed to load Carbon Credit wallet:", error);
                setCarbonBalance(0);
                setTransactions([]);
            }
        };

        loadWallet();

        const handleWalletUpdate = () => loadWallet();
        const handleStorage = (event: StorageEvent) => {
            if (event.key === WALLET_KEY) loadWallet();
        };

        window.addEventListener("ev-carbon-wallet-updated", handleWalletUpdate);
        window.addEventListener("storage", handleStorage);
        window.addEventListener("focus", handleWalletUpdate);

        return () => {
            window.removeEventListener("ev-carbon-wallet-updated", handleWalletUpdate);
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener("focus", handleWalletUpdate);
        };
    }, []);

    return (
        <div className="space-y-6">
            <section className="flex items-start justify-between gap-4">
                <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                        Sustainability Ledger
                    </div>
                    <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                        Carbon Credits Wallet
                    </h1>
                    <p className="mt-1.5 max-w-xl text-xs leading-6 text-slate-400">
                        Track your emissions saved, green travel rewards, and environmental impact.
                    </p>
                </div>

                <Link
                    href="/drivers"
                    className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-800 px-3.5 py-2.5 text-[10px] font-bold text-slate-400 transition hover:text-white"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Dashboard
                </Link>
            </section>

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
                            Total CO₂ avoided: <span className="text-slate-200 font-bold">{carbonBalance.toFixed(2)} kg</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowInfoModal(true)}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-[#050A13] text-slate-400 transition hover:border-emerald-500/40 hover:text-emerald-400"
                        title="How are credits calculated?"
                        aria-label="How are credits calculated?"
                    >
                        <Info className="h-4 w-4" />
                    </button>
                </div>

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

            <section className="space-y-3">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">
                    Recent Credit Activity
                </h2>

                {transactions.length === 0 ? (
                    <div className="rounded-2xl border border-slate-800 bg-[#07101d] p-8 text-center">
                        <Leaf className="mx-auto h-8 w-8 text-slate-600" />
                        <p className="mt-3 text-sm font-black text-slate-300">No Carbon Credits yet</p>
                        <p className="mt-1 text-xs text-slate-500">
                            Complete an EV journey in Route Optimizer to earn Carbon Credits.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2.5">
                        {transactions.map((tx) => (
                            <div
                                key={tx.id}
                                className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-[#07101d] p-4.5 transition hover:border-slate-700 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex items-center gap-3.5">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                                        <Leaf className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-white">{tx.type}</div>
                                        <div className="mt-1 text-[10px] text-slate-400">
                                            {tx.location} • <span className="font-medium text-slate-300">{tx.distance}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-800/60 pt-2.5 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                                    <div className="text-xs font-black text-emerald-400">{tx.creditsEarned}</div>
                                    <div className="mt-1 text-[10px] font-medium text-slate-400">{tx.costComparison}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {showInfoModal && (
                <div className="fixed inset-0 z-[11000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
                    <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-[#07101d] p-6 shadow-2xl sm:p-8">
                        <button
                            type="button"
                            onClick={() => setShowInfoModal(false)}
                            className="absolute right-5 top-5 text-slate-400 transition hover:text-white"
                            aria-label="Close"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex items-center gap-2.5 text-emerald-400">
                            <Info className="h-5 w-5" />
                            <h3 className="text-base font-black text-white">Carbon Credit Calculation Engine</h3>
                        </div>

                        <p className="mt-2.5 text-xs leading-5 text-slate-300">
                            Carbon Credits are generated from the estimated CO₂ avoided by completing an EV journey instead of using the project ICE benchmark.
                        </p>

                        <div className="mt-5 rounded-xl border border-emerald-500/20 bg-[#050A13] p-4 font-mono text-xs leading-6">
                            <p className="font-bold text-slate-200">Formula:</p>
                            <p className="mt-1 text-emerald-300">CO₂ Avoided = Distance × (0.15 − 0.05)</p>
                            <p className="text-white">CO₂ Avoided = Distance × 0.10 kg/km</p>
                            <p className="mt-3 border-t border-slate-800 pt-3 text-emerald-400">1 CC = 1 kg CO₂ avoided</p>
                        </div>

                        <div className="mt-5 space-y-3 text-xs text-slate-300">
                            <div><span className="font-bold text-white">ICE benchmark:</span> 0.15 kg CO₂/km</div>
                            <div><span className="font-bold text-white">EV benchmark:</span> 0.05 kg CO₂/km</div>
                            <div><span className="font-bold text-white">Credit conversion:</span> 1 kg CO₂ avoided = 1 CC</div>
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
