"use client";

import React from "react";
import Link from "next/link";
import { LayoutDashboard, AlertCircle, Cpu, TrendingUp, ShieldCheck, Info } from "lucide-react";

export default function GovHeader() {
  return (
    <header className="bg-slate-900/80 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md px-6 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-lg text-emerald-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide uppercase">EnaV Gov Command</h1>
            <p className="text-[10px] text-slate-400">Delhi NCR Region • Municipal Admin Portal</p>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800 text-xs">
          <Link href="/gov/dashboard" className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 font-medium transition">Dashboard</Link>
          <Link href="/gov/dispatch" className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 font-medium transition">112 Dispatch</Link>
          <Link href="/gov/planner" className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 font-medium transition">AI Planner</Link>
          <Link href="/gov/revenue" className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 font-medium transition">Revenue ROI</Link>
          <Link href="/gov/subsidies" className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 font-medium transition font-medium">Subsidies</Link>
          <Link href="/gov/about" className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 font-medium transition">About</Link>
        </nav>
      </div>
    </header>
  );
}