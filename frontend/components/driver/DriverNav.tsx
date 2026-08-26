"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Navigation, Wallet } from "lucide-react";

export default function DriverNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 border-t border-slate-800 p-3 flex justify-around items-center z-50 backdrop-blur-lg">
      <Link href="/drivers/chargers" className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-400 text-[11px] font-semibold">
        <MapPin className="w-5 h-5" />
        <span>Chargers</span>
      </Link>
      <Link href="/drivers/route-optimizer" className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-400 text-[11px] font-semibold">
        <Navigation className="w-5 h-5" />
        <span>Optimizer</span>
      </Link>
      <Link href="/drivers/wallet" className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-400 text-[11px] font-semibold">
        <Wallet className="w-5 h-5" />
        <span>Wallet</span>
      </Link>
    </nav>
  );
}