"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Download,
  Search,
  Zap,
  ShieldCheck,
} from "lucide-react";

interface SubsidyClaim {
  id: string;
  driverId: string;
  vehicleType: string;
  energyKwh: number;
  grossAmount: number;
  subsidyAmount: number;
  netAmount: number;
  status: "Approved" | "Pending" | "Flagged";
  timestamp: string;
}

export default function SubsidyManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const claims: SubsidyClaim[] = [
    {
      id: "SUB-8801",
      driverId: "EV-AMBU-04",
      vehicleType: "Emergency (112)",
      energyKwh: 45,
      grossAmount: 405,
      subsidyAmount: 405,
      netAmount: 0,
      status: "Approved",
      timestamp: "18:42 IST",
    },
    {
      id: "SUB-8802",
      driverId: "DL-01-EV-3921",
      vehicleType: "Commercial Cargo",
      energyKwh: 80,
      grossAmount: 720,
      subsidyAmount: 216,
      netAmount: 504,
      status: "Approved",
      timestamp: "18:35 IST",
    },
    {
      id: "SUB-8803",
      driverId: "DL-04-E-1029",
      vehicleType: "Public Transit Bus",
      energyKwh: 150,
      grossAmount: 1350,
      subsidyAmount: 675,
      netAmount: 675,
      status: "Pending",
      timestamp: "18:20 IST",
    },
    {
      id: "SUB-8804",
      driverId: "DL-09-EV-9920",
      vehicleType: "Private Passenger",
      energyKwh: 60,
      grossAmount: 540,
      subsidyAmount: 108,
      netAmount: 432,
      status: "Flagged",
      timestamp: "17:55 IST",
    },
  ];

  const filteredClaims = claims.filter(
    (c) =>
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.driverId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.vehicleType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 font-sans p-6 selection:bg-blue-500 selection:text-white">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* Navigation Header */}
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
                <CreditCard className="w-5 h-5 text-blue-400" />
                <h1 className="text-lg font-black tracking-wider text-white uppercase">
                  MUNICIPAL EV SUBSIDY DISBURSEMENT
                </h1>
                <span className="bg-blue-500/20 border border-blue-500/40 text-blue-400 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">
                  AUTOMATED DISBURSER
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Direct State Incentive Clearance & Fraud Telemetry Ledger
              </p>
            </div>
          </div>

          <button className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-2 rounded-lg text-xs font-mono flex items-center gap-2 transition">
            <Download className="w-3.5 h-3.5" /> AUDIT REPORT
          </button>
        </div>

        {/* Subsidy Allocation Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          <div className="bg-[#0B132B] border border-slate-800 rounded-xl p-5 shadow-md">
            <span className="text-xs text-slate-400 uppercase">Total Subsidies Budget</span>
            <div className="text-2xl font-black text-white mt-1">₹50,00,000</div>
            <div className="mt-2 text-[10px] text-slate-400">NCT Delhi EV Policy Fiscal Year</div>
          </div>

          <div className="bg-[#0B132B] border border-slate-800 rounded-xl p-5 shadow-md">
            <span className="text-xs text-slate-400 uppercase">Disbursed To Date</span>
            <div className="text-2xl font-black text-blue-400 mt-1">₹12,40,000</div>
            <div className="mt-2 text-[10px] text-emerald-400 font-bold">98% Verified Audit Rate</div>
          </div>

          <div className="bg-[#0B132B] border border-slate-800 rounded-xl p-5 shadow-md">
            <span className="text-xs text-slate-400 uppercase">100% Covered Emergency EV</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">₹2,84,500</div>
            <div className="mt-2 text-[10px] text-slate-400">112 Fleet Auto-Approved</div>
          </div>

          <div className="bg-[#0B132B] border border-slate-800 rounded-xl p-5 shadow-md">
            <span className="text-xs text-slate-400 uppercase">Flagged Fraud Telemetry</span>
            <div className="text-2xl font-black text-red-400 mt-1">12 Claims</div>
            <div className="mt-2 text-[10px] text-red-400 font-bold">Held for Manual Review</div>
          </div>
        </div>

        {/* Subsidy Tiers Breakdown */}
        <div className="bg-[#0B132B] border border-slate-800 rounded-xl p-5 shadow-md space-y-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Active Municipal Subsidy Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-3 bg-[#070B14] rounded-lg border border-slate-800">
              <span className="text-emerald-400 font-bold">Tier 1: Emergency & Municipal</span>
              <p className="text-white font-bold text-sm mt-1">100% Tariff Subsidy (₹0/kWh)</p>
              <p className="text-slate-500 text-[10px] mt-1">Applies to 112 Smart Dispatch & Municipal EV Fleets</p>
            </div>

            <div className="p-3 bg-[#070B14] rounded-lg border border-slate-800">
              <span className="text-blue-400 font-bold">Tier 2: Heavy Commercial Transit</span>
              <p className="text-white font-bold text-sm mt-1">50% Tariff Subsidy</p>
              <p className="text-slate-500 text-[10px] mt-1">Applies to DTC Electric Buses & Commercial Carriers</p>
            </div>

            <div className="p-3 bg-[#070B14] rounded-lg border border-slate-800">
              <span className="text-purple-400 font-bold">Tier 3: Registered Consumer EV</span>
              <p className="text-white font-bold text-sm mt-1">20% Tariff Subsidy</p>
              <p className="text-slate-500 text-[10px] mt-1">Applies to verified private passenger vehicles</p>
            </div>
          </div>
        </div>

        {/* Claims Table & Telemetry */}
        <div className="bg-[#0B132B] border border-slate-800 rounded-xl p-5 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white">Live Subsidy Ledger & Verification</h2>
              <p className="text-xs text-slate-400 font-mono">Real-time session authorization and benefit payout status</p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search Vehicle ID or Claim..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#070B14] border border-slate-800 text-xs font-mono text-slate-200 pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">CLAIM ID</th>
                  <th className="pb-3 font-semibold">VEHICLE / DRIVER</th>
                  <th className="pb-3 font-semibold">CATEGORY</th>
                  <th className="pb-3 font-semibold">DISPENSED</th>
                  <th className="pb-3 font-semibold">GROSS TARIFF</th>
                  <th className="pb-3 font-semibold">STATE SUBSIDY</th>
                  <th className="pb-3 font-semibold">NET DRIVER PAY</th>
                  <th className="pb-3 font-semibold text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-slate-900/40">
                    <td className="py-3 font-bold text-white">{claim.id}</td>
                    <td className="py-3 text-slate-300 font-bold">{claim.driverId}</td>
                    <td className="py-3 text-slate-400">{claim.vehicleType}</td>
                    <td className="py-3">{claim.energyKwh} kWh</td>
                    <td className="py-3">₹{claim.grossAmount}</td>
                    <td className="py-3 text-blue-400 font-bold">-₹{claim.subsidyAmount}</td>
                    <td className="py-3 text-emerald-400 font-bold">₹{claim.netAmount}</td>
                    <td className="py-3 text-right">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                          claim.status === "Approved"
                            ? "bg-emerald-950 border border-emerald-500/40 text-emerald-400"
                            : claim.status === "Pending"
                            ? "bg-amber-950 border border-amber-500/40 text-amber-400"
                            : "bg-red-950 border border-red-500/40 text-red-400"
                        }`}
                      >
                        {claim.status === "Approved" && <CheckCircle2 className="w-3 h-3" />}
                        {claim.status === "Pending" && <Clock className="w-3 h-3" />}
                        {claim.status === "Flagged" && <AlertTriangle className="w-3 h-3" />}
                        {claim.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}