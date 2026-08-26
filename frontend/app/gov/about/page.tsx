"use client";

import React from "react";
import Link from "next/link";
import {
  Globe,
  ShieldCheck,
  Zap,
  TrendingUp,
  Cpu,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Users,
} from "lucide-react";

export default function AboutPage() {
  const corePillars = [
    {
      icon: ShieldCheck,
      title: "112 Smart Dispatch",
      description:
        "Real-time emergency fleet routing for municipal electric vehicles and ambulances, reducing incident response times with predictive traffic bypass.",
      color: "text-red-400",
    },
    {
      icon: TrendingUp,
      title: "AI Infrastructure Planner",
      description:
        "Spatial machine learning models that analyze EV transit density, transformer load, and municipal land availability to optimize charging hub placement.",
      color: "text-purple-400",
    },
    {
      icon: Zap,
      title: "Grid Balancing & Telemetry",
      description:
        "Live grid load monitoring and power distribution optimization across sub-stations to prevent localized brownouts during peak EV charging hours.",
      color: "text-amber-400",
    },
    {
      icon: Building2,
      title: "Revenue & Sustainability",
      description:
        "Automated municipal tariff ledgers, public subsidy distribution tracking, and carbon offset reporting mapped against urban environmental targets.",
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 font-sans p-6 selection:bg-[#10B981] selection:text-slate-950">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between bg-[#0B132B] border border-slate-800 rounded-xl px-5 py-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#10B981]/20 border border-[#10B981] flex items-center justify-center text-[#10B981]">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-wider text-white uppercase">
                ENAV CITY COMMAND
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Municipal Urban Mobility Platform
              </p>
            </div>
          </div>

          <Link
            href="/gov"
            className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 px-4 py-2 rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4" /> GOV PORTAL
          </Link>
        </div>

        {/* Hero Section */}
        <div className="bg-[#0B132B] border border-slate-800 rounded-2xl p-8 shadow-xl text-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(#10B981 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />
          
          <span className="inline-flex items-center gap-2 bg-[#10B981]/10 border border-[#10B981]/30 text-[#10B981] text-xs font-mono font-bold px-3 py-1 rounded-full uppercase mb-4">
            <Cpu className="w-3.5 h-3.5" /> Next-Gen Smart City Infrastructure
          </span>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Powering Urban Electric Transit & Grid Intelligence
          </h2>

          <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed font-sans">
            ENAV City Command is an Integrated Command & Control Center (ICCC) platform designed for metropolitan government bodies. It unifies municipal EV fleet management, emergency dispatching, energy grid monitoring, and AI-driven infrastructure expansion into a single command system.
          </p>
        </div>

        {/* Core Pillars Grid */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
            Platform Capabilities
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {corePillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#0B132B] border border-slate-800 rounded-xl p-6 shadow-md hover:border-slate-700 transition space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg">
                      <Icon className={`w-5 h-5 ${pillar.color}`} />
                    </div>
                    <h4 className="text-base font-bold text-white">{pillar.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Specifications Card */}
        <div className="bg-[#0B132B] border border-slate-800 rounded-xl p-6 shadow-md space-y-4">
          <h3 className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold">
            System Specifications & Security
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="flex items-start gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white">Real-Time GIS Sync</strong>
                <span className="text-[#10B981]">Sub-second updates</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white">Grid Interoperability</strong>
                <span className="text-[#10B981]">OCPP 2.0.1 Protocol</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white">Role-Based Access</strong>
                <span className="text-[#10B981]">Encrypted Dispatch Clearance</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-500 border-t border-slate-800 pt-6">
          <span>ENAV Operational Platform</span>
          <span>Integrated Command & Control Center (ICCC)</span>
        </div>

      </div>
    </div>
  );
}