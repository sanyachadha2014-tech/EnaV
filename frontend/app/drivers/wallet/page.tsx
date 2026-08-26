"use client";

import React from "react";
import { Wallet, ArrowDownLeft, ArrowUpRight, Building2, Zap, ArrowRight } from "lucide-react";

export default function DriverWalletMobile() {
  return (
    <div className="w-full max-w-md mx-auto bg-[#070B14] p-4 text-white font-sans space-y-4">
      
      {/* 1. Top Header Card */}
      <div className="bg-[#0B132B] border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#10B981]/15 border border-[#10B981]/40 flex items-center justify-center text-[#10B981]">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-tight text-white leading-tight">
              DRIVER WALLET
            </h2>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              Payouts & Charging Ledger
            </p>
          </div>
        </div>
        <span className="bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-[10px] font-mono px-2.5 py-1 rounded-full font-bold uppercase">
          Active
        </span>
      </div>

      {/* 2. Main Balance Banner Card */}
      <div className="bg-[#0B132B] border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div>
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
            Available Balance
          </span>
          <div className="text-3xl font-black text-white font-mono mt-1">
            ₹4,250<span className="text-slate-500 text-lg font-normal">.00</span>
          </div>
        </div>

        <button className="w-full bg-[#10B981] hover:bg-[#0D9668] active:scale-[0.98] text-slate-950 font-bold py-3 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-[#10B981]/20">
          Withdraw to Bank <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 3. Horizontal Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* EV Subsidy Credit Card */}
        <div className="bg-[#0B132B] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              EV Subsidy Credit
            </span>
            <div className="text-xl font-bold text-[#10B981] font-mono">
              ₹1,200
            </div>
            <p className="text-[10px] text-slate-500">
              Usable at Municipal Fast Chargers
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
        </div>

        {/* Weekly Trips Earned Card */}
        <div className="bg-[#0B132B] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
              Weekly Earnings
            </span>
            <div className="text-xl font-bold text-purple-400 font-mono">
              ₹12,890.00
            </div>
            <p className="text-[10px] text-slate-500">
              42 Completed Dispatches
            </p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 4. Recent Transactions Section */}
      <div className="bg-[#0B132B] border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg font-mono">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Recent Transactions
        </h3>

        <div className="space-y-2">
          {/* Incoming Dispatch Payment */}
          <div className="bg-[#070B14] border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  Emergency Dispatch #112-9842
                </div>
                <div className="text-[10px] text-slate-400">
                  Aug 25, 2026 • 18:40 IST
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-[#10B981]">
              +₹450.00
            </span>
          </div>

          {/* Outgoing Charging Expense */}
          <div className="bg-[#070B14] border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">
                  Fast Charging Node #12 (CP)
                </div>
                <div className="text-[10px] text-slate-400">
                  Aug 25, 2026 • 14:15 IST
                </div>
              </div>
            </div>
            <span className="text-xs font-bold text-red-400">
              -₹180.00
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}