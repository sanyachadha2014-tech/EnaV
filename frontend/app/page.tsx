"use client";

import React, { useState, useEffect } from "react";
import EVDispatchAnimation from "@/components/EVDispatchAnimation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Zap,
  ShieldAlert,
  MapPin,
  Star,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Send,
  Navigation,
  Activity,
  Sparkles,
  Phone,
  Mail,
  TrendingUp,
} from "lucide-react";

// Dynamically import the Leaflet map to prevent SSR window issues
const ChargingStationsMap = dynamic(() => import("@/components/ChargingStationsMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[380px] bg-[#070B14] flex items-center justify-center text-slate-500 font-mono text-xs">
      LOADING INTERACTIVE MAP...
    </div>
  ),
});

export default function WelcomePage() {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setHeroVisible(true);
  }, []);

  // 1. App Feature Showcase Demo Slider State
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  const features = [
    {
      title: "112 Emergency EV Dispatch Engine",
      tagline: "Instant SOS response & mobile charging support during breakdown emergencies.",
      ctaText: "Explore Emergency Dispatch",
      ctaLink: "/gov/dispatch",
      badge: "Gov Command",
    },
    {
      title: "Smart Route & Range Planner",
      tagline: "Calculate route battery draw, topographic elevation, and optimal charger stops.",
      ctaText: "Plan Your Route",
      ctaLink: "/drivers/chargers",
      badge: "Driver Intelligence",
    },
    {
      title: "Nearest Charging Station",
      tagline: "Locate real-time charging stations, predicted waiting times, and public emergency chargers.",
      ctaText: "Locate Chargers",
      ctaLink: "/drivers/chargers",
      badge: "Real-time Grid",
    },
  ];

  // 2. Government Subsidies Slider State
  const [activeSubsidyIndex, setActiveSubsidyIndex] = useState(0);

  const subsidies = [
    {
      title: "PM E-DRIVE Scheme 2026",
      desc: "Up to ₹10,000 upfront purchase incentive for electric two-wheelers and ₹50,000 for three-wheelers across India as per MoHD guidelines.",
      tag: "Central Policy",
      amount: "₹10,000 - ₹50,000",
    },
    {
      title: "Delhi EV Policy 2.0 Waiver",
      desc: "100% exemption on Road Tax and Registration Fees for all battery-electric vehicles registered in Delhi NCR.",
      tag: "State Framework",
      amount: "100% Tax Exemption",
    },
    {
      title: "FAME Charger Capital Subsidy",
      desc: "Up to 70% capital grant for installation of public commercial fast-charging infrastructure.",
      tag: "Infra Allocation",
      amount: "70% Installation Rebate",
    },
  ];

  // 3. User Feedback State
  const [feedback, setFeedback] = useState("");
  const [userRating, setUserRating] = useState(5);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedback.trim()) {
      setFeedbackSubmitted(true);
      setTimeout(() => {
        setFeedback("");
        setFeedbackSubmitted(false);
      }, 4000);
    }
  };

  const reviews = [
    {
      name: "Rohan Sharma",
      location: "New Delhi",
      vehicle: "Tata Nexon EV",
      duration: "Driving 8 months",
      review:
        "Switching to an EV cut my monthly commute cost from ₹14,000 to under ₹1,800. EnaV made finding emergency fast-charging points effortless!",
      rating: 5,
    },
    {
      name: "Priya Nair",
      location: "Bengaluru",
      vehicle: "MG Windsor EV",
      duration: "Driving 5 months",
      review:
        "Silent ride, instant torque, zero emissions. The range predictor on EnaV prevented range anxiety on my long expressway drives.",
      rating: 5,
    },
    {
      name: "Anish Verma",
      location: "Mumbai",
      vehicle: "Mahindra BE 6",
      duration: "Driving 1 year",
      review:
        "The live station booking and government subsidy tracker helped me calculate my precise ROI before purchasing my electric vehicle.",
      rating: 5,
    },
  ];

  return (
    <main className="min-h-screen bg-[#070B14] text-slate-100 font-sans selection:bg-[#10B981] selection:text-slate-950">
      {/* ----------------- 1. FLOATING NAV BAR ----------------- */}
      <div className="sticky top-4 z-50 max-w-7xl mx-auto px-4">
        <nav className="bg-[#0B132B]/90 backdrop-blur-md border border-[#10B981]/30 rounded-full px-6 py-3 flex items-center justify-between shadow-[0_0_20px_rgba(7,11,20,0.8)]">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-[#10B981] flex items-center justify-center text-slate-950 font-black shadow-[0_0_15px_#10B981]">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <span className="text-xl font-black text-white tracking-wider">
              Ena<span className="text-[#10B981]">V</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6 font-medium text-xs text-slate-300">
            <Link href="/" className="hover:text-[#10B981] transition text-[#10B981] font-bold">
              Home
            </Link>
            <Link href="#features" className="hover:text-[#10B981] transition">
              Features
            </Link>
            <Link href="/drivers/chargers" className="hover:text-[#10B981] transition flex items-center gap-1 text-[#10B981]/90">
              <Navigation className="w-3.5 h-3.5" /> Route Optimization
            </Link>
            <Link href="#subsidies" className="hover:text-[#10B981] transition">
              Subsidies
            </Link>
            <Link href="#chargers" className="hover:text-[#10B981] transition">
              Charging Map
            </Link>
            <Link href="#about" className="hover:text-[#10B981] transition">
              About
            </Link>
            <Link href="#contact" className="hover:text-[#10B981] transition">
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono bg-[#070B14] border border-slate-800 px-3 py-1.5 rounded-full text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-[#10B981]" /> Delhi NCR
            </span>
            <Link
              href="/auth/signin"
              className="bg-[#10B981] hover:bg-[#34D399] text-slate-950 px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition shadow-[0_0_15px_rgba(16,185,129,0.4)]"
            >
              Sign In
            </Link>
          </div>
        </nav>
      </div>

      {/* ----------------- 2. HERO HEADER ----------------- */}
      <section className="bg-gradient-to-b from-[#070B14] via-[#0B132B] to-[#070B14] text-white pt-24 pb-16 border-b border-[#10B981]/15">
        <div
          className={`max-w-4xl mx-auto text-center px-4 transition-all duration-1000 transform ${
            heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="inline-flex items-center gap-2 bg-[#10B981]/10 border border-[#10B981]/30 px-4 py-1.5 rounded-full text-[#10B981] text-xs font-mono font-bold tracking-wider uppercase mb-6 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <Sparkles className="w-3.5 h-3.5" /> Empowering EV Drivers & Government Authorities
          </div>

          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight text-white mb-6">
            Ready When Every Second Matters.
          </h1>

          <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-8 font-medium">
            Bridging real-time roadside assistance for EV drivers with centralized command analytics for municipal and emergency authorities.
          </p>

          <Link
            href="/gov/dashboard"
            className="inline-flex items-center gap-2 bg-[#10B981] hover:bg-[#34D399] text-slate-950 font-bold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider transition shadow-[0_0_25px_rgba(16,185,129,0.4)] transform hover:scale-105"
          >
            Launch Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ----------------- 3. FEATURE SHOWCASE SLIDER ----------------- */}
      <section id="features" className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-[#0B132B] border border-[#10B981]/30 rounded-3xl p-6 md:p-10 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="inline-block text-xs font-mono bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/30 px-3 py-1 rounded-full font-bold tracking-widest uppercase">
                  {features[activeFeatureIndex].badge}
                </span>
                <h2 className="text-3xl md:text-4xl font-black leading-tight text-white">
                  {features[activeFeatureIndex].title}
                </h2>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {features[activeFeatureIndex].tagline}
                </p>
              </div>

              <div className="space-y-6">
                <Link
                  href={features[activeFeatureIndex].ctaLink}
                  className="inline-flex items-center gap-2 bg-[#10B981] hover:bg-[#34D399] text-slate-950 font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  {features[activeFeatureIndex].ctaText} <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() =>
                      setActiveFeatureIndex((prev) => (prev === 0 ? features.length - 1 : prev - 1))
                    }
                    className="w-9 h-9 rounded-full border border-slate-700 hover:border-[#10B981] flex items-center justify-center text-slate-300 hover:text-[#10B981] transition bg-[#070B14]"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="flex gap-2">
                    {features.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveFeatureIndex(idx)}
                        className={`h-2 rounded-full transition-all ${
                          activeFeatureIndex === idx ? "w-8 bg-[#10B981]" : "w-2 bg-slate-700"
                        }`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      setActiveFeatureIndex((prev) => (prev === features.length - 1 ? 0 : prev + 1))
                    }
                    className="w-9 h-9 rounded-full border border-slate-700 hover:border-[#10B981] flex items-center justify-center text-slate-300 hover:text-[#10B981] transition bg-[#070B14]"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Clean Telemetry Dashboard Card */}
            <div className="lg:col-span-7">
              <div className="w-full bg-[#070B14] border border-slate-800 rounded-2xl p-6 shadow-2xl font-mono flex flex-col gap-4">
                
                {/* Top Header */}
                <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
                    <span className="text-xs text-[#10B981] font-bold tracking-wider uppercase">GRID SYNC: ACTIVE</span>
                  </div>
                  <div className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded">
                    LATENCY: <strong className="text-slate-200">12ms</strong>
                  </div>
                </div>

                {/* Simulator Title Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B132B]/60 p-3 rounded-xl border border-slate-800/60">
                  <div>
                    <div className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-[#10B981]" /> SMART ROUTE OPTIMIZATION SIMULATOR
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Dispatch Vector: <span className="text-slate-200">Central ICCC → Dwarka Sec-14</span>
                    </div>
                  </div>
                  <button className="bg-[#10B981] hover:bg-[#34D399] text-slate-950 font-bold px-4 py-2 rounded-lg text-xs tracking-wider flex items-center gap-1.5 transition shadow-[0_0_15px_rgba(16,185,129,0.3)] whitespace-nowrap">
                    <Zap className="w-3.5 h-3.5 fill-slate-950" /> Trigger Dispatch
                  </button>
                </div>

                {/* Dedicated Canvas Viewport with Auto-Scaling */}
                <div className="w-full h-[300px] bg-[#050810] border border-slate-800/80 rounded-xl p-4 overflow-hidden relative flex items-center justify-center">
                  <EVDispatchAnimation />
                </div>

                {/* Bottom Telemetry Metrics */}
                <div className="grid grid-cols-3 gap-3 text-center pt-1">
                  <div className="bg-[#0B132B] border border-slate-800 p-3 rounded-xl">
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider">AVAILABLE HUBS</div>
                    <div className="text-sm font-bold text-[#10B981] mt-0.5">844 Active</div>
                  </div>
                  <div className="bg-[#0B132B] border border-slate-800 p-3 rounded-xl">
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider">RESPONSE TIME</div>
                    <div className="text-sm font-bold text-blue-400 mt-0.5">&lt; 4.2 Mins</div>
                  </div>
                  <div className="bg-[#0B132B] border border-slate-800 p-3 rounded-xl">
                    <div className="text-[9px] text-slate-400 uppercase tracking-wider">SYSTEM STATUS</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">100% Online</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ----------------- 4. CATCHY CTA SECTION ----------------- */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-gradient-to-r from-[#0B132B] to-[#111C3A] border border-[#10B981]/30 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide text-white">
              Start Your EV Journey With Us
            </h2>
            <p className="text-slate-300 text-xs md:text-sm">
              Calculate your route range, check government subsidy eligibility, and locate fast-charging hubs in seconds.
            </p>
          </div>
          <Link
            href="/drivers/chargers"
            className="bg-[#10B981] hover:bg-[#34D399] text-slate-950 font-bold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider flex items-center gap-2 transition whitespace-nowrap shadow-[0_0_20px_rgba(16,185,129,0.4)]"
          >
            Start Journey Now <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ----------------- 5. GOV SUBSIDIES SLIDER SECTION ----------------- */}
      <section id="subsidies" className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-mono text-[#10B981] uppercase font-bold tracking-widest">
              Financial Incentives
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider mt-1">
              Government Subsidies & Schemes
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setActiveSubsidyIndex((prev) => (prev === 0 ? subsidies.length - 1 : prev - 1))
              }
              className="w-9 h-9 rounded-full border border-slate-800 hover:border-[#10B981] flex items-center justify-center text-slate-300 hover:text-[#10B981] transition bg-[#0B132B]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() =>
                setActiveSubsidyIndex((prev) => (prev === subsidies.length - 1 ? 0 : prev + 1))
              }
              className="w-9 h-9 rounded-full border border-slate-800 hover:border-[#10B981] flex items-center justify-center text-slate-300 hover:text-[#10B981] transition bg-[#0B132B]"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="bg-[#0B132B] border border-[#10B981]/30 rounded-2xl p-6 md:p-8 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3">
              <span className="text-[10px] font-mono bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/40 px-3 py-1 rounded-full font-bold">
                {subsidies[activeSubsidyIndex].tag}
              </span>
              <h3 className="text-2xl font-bold text-white">
                {subsidies[activeSubsidyIndex].title}
              </h3>
              <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {subsidies[activeSubsidyIndex].desc}
              </p>
            </div>
            <div className="bg-[#070B14] border border-slate-800 rounded-xl p-4 text-center min-w-[200px]">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Incentive Framework</div>
              <div className="text-xl font-black text-[#10B981] font-mono mt-1">
                {subsidies[activeSubsidyIndex].amount}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- 6. CHARGING STATIONS MAP SECTION (UPDATED) ----------------- */}
      <section id="chargers" className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider">
            Explore Charging Stations Near You
          </h2>
          <p className="text-xs md:text-sm text-slate-400">
            Real-time port availability, fast DC chargers, and smart slot reservations
          </p>
        </div>

        <div className="relative bg-[#0B132B] border border-[#10B981]/30 rounded-3xl p-4 overflow-hidden shadow-2xl">
          {/* Rectangular container embedding the interactive Leaflet map */}
          <div className="w-full h-[420px] bg-[#070B14] rounded-2xl border border-slate-800 relative overflow-hidden">
            <ChargingStationsMap />
          </div>
        </div>
      </section>

      {/* ----------------- 7. IMPACT STATS ----------------- */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider">
            India is Going Electric. Are You Too?
          </h2>
          <p className="text-xs md:text-sm text-slate-400">
            Join thousands of drivers making the switch to cleaner, smarter mobility with EnaV.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative bg-[#0B132B] border border-slate-800 hover:border-[#10B981]/60 p-7 rounded-2xl text-center transition-all duration-300 transform hover:-translate-y-1.5 shadow-lg overflow-hidden">
            <div className="text-3xl font-black text-white font-mono tracking-tight group-hover:text-[#10B981] transition-colors">
              2.05M+
            </div>
            <div className="text-[11px] font-bold text-slate-400 group-hover:text-slate-200 uppercase tracking-widest mt-2 flex items-center justify-center gap-1">
              <Activity className="w-3.5 h-3.5 text-[#10B981]" /> EVs Sold (FY2025)
            </div>
          </div>

          <div className="group relative bg-[#0B132B] border border-slate-800 hover:border-[#10B981]/60 p-7 rounded-2xl text-center transition-all duration-300 transform hover:-translate-y-1.5 shadow-lg overflow-hidden">
            <div className="text-3xl font-black text-white font-mono tracking-tight group-hover:text-[#10B981] transition-colors">
              22%
            </div>
            <div className="text-[11px] font-bold text-slate-400 group-hover:text-slate-200 uppercase tracking-widest mt-2 flex items-center justify-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" /> Annual EV Growth
            </div>
          </div>

          <div className="group relative bg-[#0B132B] border border-slate-800 hover:border-[#10B981]/60 p-7 rounded-2xl text-center transition-all duration-300 transform hover:-translate-y-1.5 shadow-lg overflow-hidden">
            <div className="text-3xl font-black text-white font-mono tracking-tight group-hover:text-[#10B981] transition-colors">
              29.1K+
            </div>
            <div className="text-[11px] font-bold text-slate-400 group-hover:text-slate-200 uppercase tracking-widest mt-2 flex items-center justify-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[#10B981]" /> Public Charging Stations
            </div>
          </div>

          <div className="group relative bg-[#0B132B] border border-slate-800 hover:border-[#10B981]/60 p-7 rounded-2xl text-center transition-all duration-300 transform hover:-translate-y-1.5 shadow-lg overflow-hidden">
            <div className="text-3xl font-black text-white font-mono tracking-tight group-hover:text-[#10B981] transition-colors">
              ₹2K Cr
            </div>
            <div className="text-[11px] font-bold text-slate-400 group-hover:text-slate-200 uppercase tracking-widest mt-2 flex items-center justify-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-[#10B981]" /> Infra Investment
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- 8. REVIEWS & FEEDBACK FORM ----------------- */}
      <section className="max-w-7xl mx-auto px-4 py-12 space-y-10">
        <div>
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wider">
              Hear From EV Owners
            </h2>
            <p className="text-xs md:text-sm text-slate-400">
              Real experiences from drivers using EnaV for daily commutes & highway trips.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev, idx) => (
              <div
                key={idx}
                className="bg-[#0B132B] border border-slate-800 p-6 rounded-2xl space-y-4 hover:border-[#10B981]/50 transition flex flex-col justify-between shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#10B981]/20 border border-[#10B981] flex items-center justify-center font-bold text-[#10B981]">
                      {rev.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white flex items-center gap-1">
                        {rev.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {rev.location} • {rev.vehicle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex text-amber-400">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="bg-[#070B14] border border-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                      {rev.duration}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 italic leading-relaxed">
                    "{rev.review}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0B132B] border border-[#10B981]/30 rounded-2xl p-6 md:p-8 max-w-2xl mx-auto shadow-xl">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Star className="w-5 h-5 text-[#10B981] fill-[#10B981]" /> Submit Your Experience
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Are you an EV owner? Help us improve EnaV network dispatch and charging accuracy.
          </p>

          {feedbackSubmitted ? (
            <div className="bg-[#10B981]/15 border border-[#10B981]/40 text-[#34D399] text-xs p-4 rounded-xl text-center font-bold">
              Thank you for your feedback! Your review helps build a stronger EV ecosystem.
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setUserRating(star)}
                      className="p-1 text-amber-400 transition hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= userRating ? "fill-amber-400 text-amber-400" : "text-slate-700"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  Your Feedback or Review
                </label>
                <textarea
                  rows={3}
                  required
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your charging, dispatch, or range planning experience..."
                  className="w-full bg-[#070B14] border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#10B981] hover:bg-[#34D399] text-slate-950 font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition"
              >
                Submit Feedback <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ----------------- 9. FOOTER ----------------- */}
      <footer id="about" className="bg-[#070B14] border-t border-slate-800 pt-16 pb-12">
        <div id="contact" className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center text-slate-950 font-black shadow-[0_0_15px_#10B981]">
                <Zap className="w-4 h-4 fill-slate-950" />
              </div>
              <span className="text-xl font-black text-white tracking-wider">
                Ena<span className="text-[#10B981]">V</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              EnaV is India's premier EV grid platform—powering 112 emergency breakdown dispatch,
              live charger booking, and intelligent range routing.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase text-[#10B981] font-bold tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <Link href="#features" className="hover:text-[#10B981] transition">
                  Platform Features
                </Link>
              </li>
              <li>
                <Link href="#subsidies" className="hover:text-[#10B981] transition">
                  State EV Incentives
                </Link>
              </li>
              <li>
                <Link href="/drivers/chargers" className="hover:text-[#10B981] transition">
                  Charger Locator
                </Link>
              </li>
              <li>
                <Link href="/gov/dispatch" className="hover:text-[#10B981] transition">
                  112 SOS Command Engine
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase text-[#10B981] font-bold tracking-wider">
              Contact Us
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#10B981]" /> support@enav.in
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#10B981]" /> 1800-112-ENAV (Toll Free)
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#10B981]" /> New Delhi, Delhi NCR, India
              </li>
            </ul>
          </div>

          <div className="bg-[#0B132B] border border-slate-800 p-4 rounded-xl space-y-2">
            <h5 className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#10B981]" /> 24/7 Grid Support
            </h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Integrated directly with city energy grids and emergency EV response units for uninterrupted journey safety.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 mt-12 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500">
          <div>© 2026 EnaV Infrastructure Platform. All rights reserved.</div>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>
    </main>
  );
}