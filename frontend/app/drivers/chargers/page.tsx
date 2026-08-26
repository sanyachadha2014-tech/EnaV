"use client";

import React, { useState } from "react";
import { MapPin, Zap, Navigation, Clock, Search, ShieldCheck } from "lucide-react";

interface Station {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  availablePorts: number;
  totalPorts: number;
  kwPower: number;
  pricePerKw: number;
  status: "AVAILABLE" | "BUSY" | "OFFLINE";
}

export default function DriverChargersPage() {
  const [stations] = useState<Station[]>([
    {
      id: "ST-01",
      name: "TATA Power Fast Charge Hub",
      address: "District Centre, Janakpuri West",
      distanceKm: 1.2,
      availablePorts: 3,
      totalPorts: 4,
      kwPower: 120,
      pricePerKw: 14.5,
      status: "AVAILABLE",
    },
    {
      id: "ST-02",
      name: "Static EV Supercharging Spot",
      address: "Block B Parking, Dwarka Sec 10",
      distanceKm: 3.4,
      availablePorts: 1,
      totalPorts: 6,
      kwPower: 60,
      pricePerKw: 12.0,
      status: "AVAILABLE",
    },
    {
      id: "ST-03",
      name: "Zeon Charging Point",
      address: "Rohini Sector 7 Metro Complex",
      distanceKm: 5.8,
      availablePorts: 0,
      totalPorts: 2,
      kwPower: 30,
      pricePerKw: 11.5,
      status: "BUSY",
    },
  ]);

  const [bookingConfirmed, setBookingConfirmed] = useState<string | null>(null);

  const handleBookSlot = (id: string) => {
    setBookingConfirmed(id);
    setTimeout(() => setBookingConfirmed(null), 3500);
  };

  return (
    <div className="space-y-4">
      {/* Header & Search */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white uppercase tracking-wider">
              Find Fast Chargers
            </h1>
            <p className="text-xs text-slate-400">Live port availability & reservation</p>
          </div>
          <span className="text-[10px] font-mono bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-full font-bold">
            Live Feed
          </span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by area or station name..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
          />
        </div>
      </div>

      {/* Chargers List */}
      <div className="space-y-3">
        {stations.map((st) => (
          <div
            key={st.id}
            className="bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 rounded-xl p-4 text-xs space-y-3 transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-sm text-white">{st.name}</h3>
                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-blue-400" /> {st.address} ({st.distanceKm} km away)
                </p>
              </div>
              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold border ${
                  st.status === "AVAILABLE"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : st.status === "BUSY"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : "bg-slate-800 text-slate-400 border-slate-700"
                }`}
              >
                {st.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-400">
              <div>
                Ports: <span className="text-white font-bold">{st.availablePorts}/{st.totalPorts}</span>
              </div>
              <div>
                Speed: <span className="text-blue-400 font-bold">{st.kwPower} kW</span>
              </div>
              <div>
                Rate: <span className="text-emerald-400 font-bold">₹{st.pricePerKw}/kWh</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                disabled={st.status === "BUSY"}
                onClick={() => handleBookSlot(st.id)}
                className={`flex-1 py-2 rounded-lg font-bold transition text-xs font-mono uppercase ${
                  bookingConfirmed === st.id
                    ? "bg-emerald-500 text-slate-950"
                    : st.status === "BUSY"
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40"
                }`}
              >
                {bookingConfirmed === st.id ? "Slot Reserved!" : st.status === "BUSY" ? "Full Queue" : "Reserve 15-Min Slot"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}