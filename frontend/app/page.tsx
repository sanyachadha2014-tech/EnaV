"use client";

import React, {
  useRef,
  useState,
  useEffect,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowRight,
  BatteryCharging,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Layers,
  MapPin,
  Menu,
  Navigation,
  Route,
  ShieldCheck,
  Sparkles,
  Star,
  X,
  Zap,
  Send,
  MessageSquare,
  Car,
} from "lucide-react";

/* =========================================================
   FEATURE SLIDES
========================================================= */

const features = [
  {
    badge: "DRIVER JOURNEY",
    title: "Plan the journey before you drive.",
    description:
      "Choose your current location or enter a starting point manually, select a destination and compare route choices before starting the journey.",
    points: [
      "GPS or manual starting location",
      "Three route choices",
      "Active journey and completion summary",
    ],
    href: "/drivers/route-optimizer",
    accent: "emerald",
  },
  {
    badge: "CHARGING DISCOVERY",
    title: "Find charging when you need it.",
    description:
      "Search charging stations and review the information available for each location before deciding where to stop.",
    points: [
      "Station search",
      "Charger type",
      "Connector availability",
    ],
    href: "/drivers/chargers",
    accent: "blue",
  },
  {
    badge: "DRIVER PROFILE",
    title: "Keep your vehicle and driver information organised.",
    description:
      "Manage personal details, driver or employee information, vehicle details and your own journey and charging history.",
    points: [
      "Personal information",
      "Vehicle and EV details",
      "Journey and charging history",
    ],
    href: "/drivers/profile",
    accent: "emerald",
  },
  {
    badge: "GOVERNMENT",
    title: "A separate workspace for mobility operations.",
    description:
      "Government users have their own environment for mobility and infrastructure workflows rather than sharing the driver's interface.",
    points: [
      "Government workspace",
      "Mobility operations",
      "Infrastructure workflows",
    ],
    href: "/gov",
    accent: "purple",
  },
];

/* =========================================================
   EV SCHEMES / POLICIES
========================================================= */

const schemes = [
  {
    tag: "CENTRAL SCHEME",
    title: "PM E-DRIVE",
    description:
      "The PM Electric Drive Revolution in Innovative Vehicle Enhancement scheme supports eligible electric mobility categories and includes support related to public EV charging infrastructure.",
    source:
      "Ministry of Heavy Industries · Government of India",
    href: "https://pmedrive.heavyindustries.gov.in/",
  },
  {
    tag: "DELHI POLICY",
    title: "Delhi EV Policy 2026",
    description:
      "Delhi's current EV policy framework covers electric mobility adoption and charging infrastructure within the National Capital Territory.",
    source:
      "Transport Department · Government of NCT of Delhi",
    href: "https://transport.delhi.gov.in/",
  },
  {
    tag: "NATIONAL GUIDELINES",
    title: "EV Charging Infrastructure 2024",
    description:
      "The Ministry of Power's guidelines provide a framework for the installation and operation of EV charging infrastructure in public, semi-public and other applicable settings.",
    source:
      "Ministry of Power · Government of India",
    href: "https://powermin.gov.in/",
  },
  {
    tag: "PM E-DRIVE",
    title: "Public Charging Infrastructure",
    description:
      "PM E-DRIVE includes guidelines for deployment of public EV charging stations and related infrastructure support.",
    source:
      "Ministry of Heavy Industries · Government of India",
    href: "https://pmedrive.heavyindustries.gov.in/policy_procedure",
  },
];

/* =========================================================
   ILLUSTRATIVE FEEDBACK
========================================================= */

const driverFeedback = [
  {
    quote:
      "The journey flow keeps the important steps together without putting unrelated information in front of the driver.",
  },
  {
    quote:
      "Separating charging discovery from the driving workflow makes it easier to find the information I actually need.",
  },
  {
    quote:
      "Comparing route options before starting the journey makes the decision much clearer.",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [featureIndex, setFeatureIndex] =
    useState(0);

  const [schemeIndex, setSchemeIndex] =
    useState(0);

  const [touchStartX, setTouchStartX] =
    useState<number | null>(null);

  const [touchEndX, setTouchEndX] =
    useState<number | null>(null);

  // Backend connection status state (kept functional so it stays connected)
  const [backendMessage, setBackendMessage] = useState("");

  // Feedback form state
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const minSwipeDistance = 50;

  const currentFeature =
    features[featureIndex];

  const currentScheme =
    schemes[schemeIndex];

  // Fetch backend status silently on mount without showing the UI banner box
  useEffect(() => {
    fetch("http://localhost:8000/")
      .then((res) => res.json())
      .then((data) => setBackendMessage(data.message))
      .catch((err) => console.error("Error connecting to backend:", err));
  }, []);

  /* =======================================================
     FEATURE CAROUSEL
  ======================================================= */

  function previousFeature() {
    setFeatureIndex((current) =>
      current === 0
        ? features.length - 1
        : current - 1,
    );
  }

  function nextFeature() {
    setFeatureIndex((current) =>
      current === features.length - 1
        ? 0
        : current + 1,
    );
  }

  function handleTouchStart(
    event: React.TouchEvent<HTMLDivElement>,
  ) {
    setTouchStartX(event.targetTouches[0].clientX);
    setTouchEndX(null);
  }

  function handleTouchMove(
    event: React.TouchEvent<HTMLDivElement>,
  ) {
    setTouchEndX(event.targetTouches[0].clientX);
  }

  function handleTouchEnd() {
    if (
      touchStartX === null ||
      touchEndX === null
    ) {
      return;
    }

    const distance =
      touchStartX - touchEndX;

    if (Math.abs(distance) < minSwipeDistance) {
      return;
    }

    if (distance > 0) {
      nextFeature();
    } else {
      previousFeature();
    }

    setTouchStartX(null);
    setTouchEndX(null);
  }

  /* =======================================================
     SCHEME CAROUSEL
  ======================================================= */

  function previousScheme() {
    setSchemeIndex((current) =>
      current === 0
        ? schemes.length - 1
        : current - 1,
    );
  }

  function nextScheme() {
    setSchemeIndex((current) =>
      current === schemes.length - 1
        ? 0
        : current + 1,
    );
  }

  function handleFeedbackSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackName("");
      setFeedbackText("");
    }, 3000);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070B14] text-slate-100 selection:bg-emerald-400 selection:text-slate-950 font-sans">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <div className="sticky top-3 z-50 mx-auto max-w-7xl px-4">

        <nav className="rounded-full border border-emerald-400/25 bg-[#0B132B]/95 px-5 py-3.5 shadow-2xl shadow-black/60 backdrop-blur-xl sm:px-8">

          <div className="flex h-12 items-center justify-between">

            {/* BRAND */}

            <Link
              href="/"
              className="group flex items-center gap-3"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,.4)] transition group-hover:scale-105">
                <Zap className="h-5 w-5 fill-current" />
              </div>

              <div>

                <div className="text-xl font-black tracking-tight">
                  Ena<span className="text-emerald-400">
                    V
                  </span>
                </div>

                <div className="hidden text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 sm:block">
                  Intelligent Mobility Platform
                </div>

              </div>

            </Link>

            {/* DESKTOP NAV */}

            <div className="hidden items-center gap-8 md:flex">

              <a
                href="#platform"
                className="text-xs font-bold uppercase tracking-wider text-slate-300 transition hover:text-emerald-400"
              >
                Platform
              </a>

              <a
                href="#charging"
                className="text-xs font-bold uppercase tracking-wider text-slate-300 transition hover:text-emerald-400"
              >
                Charging
              </a>

              <a
                href="#schemes"
                className="text-xs font-bold uppercase tracking-wider text-slate-300 transition hover:text-emerald-400"
              >
                Schemes
              </a>

              <a
                href="#government"
                className="text-xs font-bold uppercase tracking-wider text-slate-300 transition hover:text-emerald-400"
              >
                Government
              </a>

              <a
                href="#drivers"
                className="text-xs font-bold uppercase tracking-wider text-slate-300 transition hover:text-emerald-400"
              >
                Drivers
              </a>

              <a
                href="#feedback"
                className="text-xs font-bold uppercase tracking-wider text-slate-300 transition hover:text-emerald-400"
              >
                Feedback
              </a>

            </div>

            {/* ACTIONS */}

            <div className="hidden items-center gap-3 sm:flex">
              <Link
                href="/emergency"
                className="flex items-center gap-1.5 rounded-full bg-rose-600/20 border border-rose-500/50 px-3.5 py-2 text-xs font-mono font-bold text-rose-300 transition hover:bg-rose-600/30 shadow-md shadow-rose-950"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                112 Emergency
              </Link>

              <Link
                href="/auth/signup"
                className="flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition hover:bg-emerald-300"
              >
                Get started
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* MOBILE */}

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(
                  (current) => !current,
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 text-slate-300 sm:hidden"
              aria-label={
                mobileMenuOpen
                  ? "Close menu"
                  : "Open menu"
              }
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

          </div>

          {mobileMenuOpen && (
            <div className="border-t border-slate-800 py-4 md:hidden space-y-1">

              {[
                ["Platform", "#platform"],
                ["Charging", "#charging"],
                ["Schemes", "#schemes"],
                ["Government", "#government"],
                ["Drivers", "#drivers"],
                ["Feedback", "#feedback"],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                  className="block rounded-lg px-4 py-3 text-sm font-bold uppercase tracking-wider text-slate-200 transition hover:bg-slate-900 hover:text-emerald-400"
                >
                  {label}
                </a>
              ))}

              <div className="mt-4 border-t border-slate-800 pt-4">

                <Link
                  href="/auth/signup"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-emerald-400 text-xs font-black uppercase tracking-wider text-slate-950"
                >
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>

              </div>

            </div>
          )}

        </nav>

      </div>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden">

        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(100,116,139,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,.18) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        <div className="pointer-events-none absolute left-[5%] top-[25%] h-80 w-80 rounded-full bg-blue-500/10 blur-[120px]" />

        <div className="pointer-events-none absolute right-[5%] top-[22%] h-80 w-80 rounded-full bg-emerald-400/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:pb-20">

          {/* HERO */}

          <div className="mx-auto max-w-4xl text-center">

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              <Sparkles className="h-4 w-4" />
              Intelligent mobility platform
            </div>

            {/* ENAV LOGO TEXT */}

            <div className="mt-6">

              <div className="text-6xl font-black leading-none tracking-[-0.07em] text-white sm:text-7xl md:text-8xl">
                Ena<span className="text-emerald-400">
                  V
                </span>
              </div>

              <div className="mt-3 text-xs font-bold uppercase tracking-[0.4em] text-slate-400">
                Intelligent Mobility
              </div>

            </div>

            <h1 className="mt-8 text-4xl font-black leading-[1.08] tracking-tight sm:text-6xl md:text-7xl">

              Smarter journeys.
              <br />

              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
                Connected mobility.
              </span>

            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              Journey planning, charging discovery and mobility operations brought together in one focused platform.
            </p>

            <div className="mt-8 flex justify-center">

              <Link
                href="/auth/signup"
                className="flex h-13 items-center justify-center gap-2.5 rounded-full bg-emerald-400 px-8 text-sm font-black uppercase tracking-wider text-slate-950 shadow-[0_0_28px_rgba(16,185,129,.3)] transition hover:bg-emerald-300"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>

            </div>

          </div>

          {/* =================================================
              HERO PRODUCT PREVIEW
          ================================================= */}

          <div className="relative mx-auto mt-14 max-w-5xl">

            <div className="absolute -inset-5 rounded-[34px] bg-gradient-to-r from-emerald-400/10 via-blue-500/5 to-emerald-400/10 blur-2xl" />

            <div className="relative rounded-[28px] border border-slate-700 bg-[#0B132B]/95 p-4 shadow-2xl sm:p-6">

              <div className="flex items-center justify-between border-b border-slate-800 px-3 pb-4">

                <div className="flex items-center gap-2.5">

                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />

                  <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                    EnaV mobility workspace (Live Route Animation)
                  </span>

                </div>

                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-slate-400">

                  <Layers className="h-4 w-4" />

                  Preview

                </div>

              </div>

              <div className="relative mt-4 h-[330px] overflow-hidden rounded-2xl border border-slate-800 bg-[#050810] sm:h-[400px]">

                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(100,116,139,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,.12) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />

                {/* Animated SVG Path with Car & Charging Stations */}
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <svg className="w-full h-full" viewBox="0 0 600 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 220 Q 200 60, 350 160 T 550 80" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
                    <path id="mainRoute" d="M50 220 Q 200 60, 350 160 T 550 80" stroke="url(#routeGradient)" strokeWidth="4" strokeLinecap="round" strokeDasharray="8 4" />
                    
                    <defs>
                      <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="50%" stopColor="#38BDF8" />
                        <stop offset="100%" stopColor="#8B5CF6" />
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>

                    <g transform="translate(180, 115)">
                      <circle cx="0" cy="0" r="16" fill="#0B132B" stroke="#38BDF8" strokeWidth="2.5" filter="url(#glow)" />
                      <path d="M-3 -5 L3 -5 L1 0 L4 0 L-2 8 L0 2 L-3 2 Z" fill="#38BDF8" />
                      <text x="0" y="28" fill="#e2e8f0" fontSize="11" fontWeight="bold" textAnchor="middle">Fast Charger #1</text>
                    </g>

                    <g transform="translate(380, 130)">
                      <circle cx="0" cy="0" r="16" fill="#0B132B" stroke="#10B981" strokeWidth="2.5" filter="url(#glow)" />
                      <path d="M-3 -5 L3 -5 L1 0 L4 0 L-2 8 L0 2 L-3 2 Z" fill="#10B981" />
                      <text x="0" y="28" fill="#e2e8f0" fontSize="11" fontWeight="bold" textAnchor="middle">Ultra-Hub #2</text>
                    </g>

                    <g transform="translate(470, 95)">
                      <circle cx="0" cy="0" r="16" fill="#0B132B" stroke="#38BDF8" strokeWidth="2.5" filter="url(#glow)" />
                      <path d="M-3 -5 L3 -5 L1 0 L4 0 L-2 8 L0 2 L-3 2 Z" fill="#38BDF8" />
                      <text x="0" y="28" fill="#e2e8f0" fontSize="11" fontWeight="bold" textAnchor="middle">City DC #3</text>
                    </g>

                    <circle cx="50" cy="220" r="7" fill="#10B981" />
                    <text x="50" y="242" fill="#10B981" fontSize="11" fontWeight="bold" textAnchor="middle">Origin</text>

                    <circle cx="550" cy="80" r="7" fill="#38BDF8" />
                    <text x="550" y="60" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle">Destination</text>

                    <g filter="url(#glow)">
                      <circle r="14" fill="#10B981" opacity="0.3">
                        <animateMotion dur="6s" repeatCount="indefinite" path="M50 220 Q 200 60, 350 160 T 550 80" />
                      </circle>
                      <circle r="7" fill="#10B981">
                        <animateMotion dur="6s" repeatCount="indefinite" path="M50 220 Q 200 60, 350 160 T 550 80" />
                      </circle>
                    </g>
                  </svg>
                </div>

                {/* product card overlay */}
                <div className="absolute left-4 top-4 w-[310px] rounded-2xl border border-slate-700 bg-[#0B132B]/95 p-4 shadow-xl backdrop-blur">

                  <div className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                    Active Navigation
                  </div>

                  <div className="mt-2 text-base font-black text-white">
                    Live Route & 3 Chargers Found
                  </div>

                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-slate-800 bg-[#070B14] p-3">

                    <BatteryCharging className="h-4 w-4 text-emerald-400 animate-pulse" />

                    <span className="text-xs font-medium text-slate-200">
                      Battery Level: 84% (Sufficient)
                    </span>

                  </div>

                </div>

                {/* tiles */}

                <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-3 sm:left-auto sm:right-4 sm:w-[440px]">

                  <HeroTile
                    icon={<Route className="h-4 w-4" />}
                    title="Journey"
                    value="Optimized"
                  />

                  <HeroTile
                    icon={
                      <BatteryCharging className="h-4 w-4" />
                    }
                    title="Stations"
                    value="3 Available"
                  />

                  <HeroTile
                    icon={
                      <ShieldCheck className="h-4 w-4" />
                    }
                    title="Status"
                    value="En Route"
                  />

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          PLATFORM — ROLES
      ===================================================== */}

      <section
        id="platform"
        className="border-y border-slate-800 bg-[#0A0F1A] py-16"
      >

        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          <SectionTitle
            eyebrow="Platform"
            title="One ecosystem. Clear roles."
            description="Tailored interfaces designed specifically for private EV owners, government drivers, and government officials."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">

            <PlatformPill
              icon={
                <CircleUserRound className="h-5 w-5" />
              }
              title="Private EV owners"
              text="Personal journey planning, EV charging discovery & savings tracker"
            />

            <PlatformPill
              icon={
                <Car className="h-5 w-5" />
              }
              title="Gov drivers"
              text="Fleet assignment, official route navigation & status updates"
            />

            <PlatformPill
              icon={
                <ShieldCheck className="h-5 w-5" />
              }
              title="Gov officials"
              text="Policy monitoring, infrastructure oversight & analytics dashboard"
            />

          </div>

        </div>

      </section>

      {/* =====================================================
          REAL FEATURE CAROUSEL
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">

        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

          <SectionTitle
            eyebrow="Explore EnaV"
            title="See the platform in action."
            description="Swipe through the modules on mobile or use the controls to move between them."
          />

          <div className="flex gap-3">

            <button
              type="button"
              onClick={previousFeature}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 bg-[#0B132B] text-slate-300 transition hover:border-emerald-400 hover:text-white"
              aria-label="Previous feature"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={nextFeature}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 bg-[#0B132B] text-slate-300 transition hover:border-emerald-400 hover:text-white"
              aria-label="Next feature"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

          </div>

        </div>

        {/* viewport */}

        <div
          className="mt-10 overflow-hidden rounded-3xl"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >

          {/* track */}

          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${featureIndex * 100}%)`,
            }}
          >

            {features.map(
              (feature) => (
                <div
                  key={feature.badge}
                  className="w-full shrink-0"
                >

                  <article className="overflow-hidden rounded-3xl border border-slate-700 bg-[#0B132B] shadow-xl">

                    <div className="grid lg:grid-cols-[0.85fr_1.15fr]">

                      {/* TEXT */}

                      <div className="p-8 sm:p-10 lg:p-12">

                        <span
                          className={`inline-flex rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] ${
                            feature.accent ===
                            "blue"
                              ? "border-blue-400/30 bg-blue-400/10 text-blue-400"
                              : feature.accent ===
                                  "purple"
                                ? "border-purple-400/30 bg-purple-400/10 text-purple-300"
                                : "border-emerald-400/30 bg-emerald-400/10 text-emerald-400"
                          }`}
                        >
                          {feature.badge}
                        </span>

                        <h3 className="mt-6 text-3xl font-black leading-snug text-white sm:text-4xl">
                          {feature.title}
                        </h3>

                        <p className="mt-5 text-sm sm:text-base leading-relaxed text-slate-300">
                          {feature.description}
                        </p>

                        <div className="mt-8 space-y-4">

                          {feature.points.map(
                            (point) => (
                              <div
                                key={point}
                                className="flex items-center gap-3.5 text-sm sm:text-base font-semibold text-slate-200"
                              >

                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-400/15">

                                  <Check
                                    className="h-4 w-4 text-emerald-400"
                                    strokeWidth={3}
                                  />

                                </span>

                                {point}

                              </div>
                            ),
                          )}

                        </div>

                        <Link
                          href={feature.href}
                          className="mt-10 inline-flex items-center gap-2.5 rounded-full bg-emerald-400 px-7 py-3.5 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:bg-emerald-300 shadow-lg shadow-emerald-400/20"
                        >
                          Open module
                          <ArrowRight className="h-4 w-4" />
                        </Link>

                      </div>

                      {/* VISUAL */}

                      <div className="border-t border-slate-800 bg-[#070B14] p-4 lg:border-l lg:border-t-0 sm:p-6 flex items-center justify-center">

                        <div className="relative w-full h-[360px] overflow-hidden rounded-2xl border border-slate-800 bg-[#050810]">

                          <div
                            className="absolute inset-0 opacity-20"
                            style={{
                              backgroundImage:
                                "linear-gradient(rgba(100,116,139,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,.12) 1px, transparent 1px)",
                              backgroundSize:
                                "28px 28px",
                            }}
                          />

                          <div className="absolute left-[8%] top-[65%] h-[3px] w-[74%] rotate-[-10deg] rounded-full bg-gradient-to-r from-emerald-400 to-blue-400 shadow-[0_0_14px_rgba(52,211,153,.4)]" />

                          <div className="absolute left-[8%] top-[57%] flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 shadow-lg">
                            <MapPin className="h-5 w-5 text-slate-950" />
                          </div>

                          <div className="absolute left-[46%] top-[50%] flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/40 bg-[#0B132B] shadow-[0_0_24px_rgba(52,211,153,.2)]">
                            {feature.badge === "DRIVER JOURNEY" && <Route className="h-5 w-5 text-emerald-400" />}
                            {feature.badge === "CHARGING DISCOVERY" && <BatteryCharging className="h-5 w-5 text-blue-400" />}
                            {feature.badge === "DRIVER PROFILE" && <CircleUserRound className="h-5 w-5 text-emerald-400" />}
                            {feature.badge === "GOVERNMENT" && <ShieldCheck className="h-5 w-5 text-purple-300" />}
                          </div>

                          <div className="absolute right-[9%] top-[40%] flex h-10 w-10 items-center justify-center rounded-full bg-blue-400 shadow-lg">
                            <MapPin className="h-5 w-5 text-slate-950" />
                          </div>

                          <div className="absolute left-4 right-4 top-4 rounded-2xl border border-slate-700 bg-[#0B132B]/95 p-4 backdrop-blur">
                            <div className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                              {feature.badge}
                            </div>
                            <div className="mt-1 text-base font-black text-white">
                              {feature.title}
                            </div>
                          </div>

                        </div>

                      </div>

                    </div>

                  </article>

                </div>
              ),
            )}

          </div>

        </div>

        {/* dots */}

        <div className="mt-8 flex justify-center gap-2">

          {features.map(
            (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() =>
                  setFeatureIndex(index)
                }
                className={`h-2 rounded-full transition-all ${
                  featureIndex === index
                    ? "w-10 bg-emerald-400"
                    : "w-2 bg-slate-700"
                }`}
                aria-label={`Go to feature ${index + 1}`}
              />
            ),
          )}

        </div>

      </section>

      {/* =====================================================
          CHARGING MAP / OPEN STREET MAPS
      ===================================================== */}

      <section
        id="charging"
        className="border-y border-slate-800 bg-[#0A0F1A] py-20"
      >

        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">

            <div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-400/10">

                <MapPin className="h-6 w-6 text-blue-400" />

              </div>

              <div className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-blue-400">
                Charging network
              </div>

              <h2 className="mt-3 text-3xl font-black leading-snug text-white sm:text-4xl">
                Find charging around your journey.
              </h2>

              <p className="mt-5 max-w-md text-sm sm:text-base leading-relaxed text-slate-300">
                Explore real-time charging stations powered by OpenStreetMap and review available station connectors through EnaV.
              </p>

              <Link
                href="/drivers/chargers"
                className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-blue-400 px-7 py-3.5 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:bg-blue-300 shadow-lg shadow-blue-400/20"
              >
                Open charging
                <ArrowRight className="h-4 w-4" />
              </Link>

            </div>

            <div className="rounded-[28px] border border-slate-700 bg-[#0B132B] p-4 sm:p-6 shadow-2xl">

              <div className="h-[420px] overflow-hidden rounded-2xl border border-slate-700 relative">
                <iframe
                  title="OpenStreetMap EV Stations"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src="https://www.openstreetmap.org/export/embed.html?bbox=77.10%2C28.55%2C77.30%2C28.70&amp;layer=mapnik"
                  style={{ filter: "invert(90%) hue-rotate(180deg) contrast(120%) brightness(95%)", border: 0 }}
                />
                <div className="absolute bottom-4 left-4 bg-[#0B132B]/95 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold text-emerald-400 backdrop-blur-md shadow-xl pointer-events-none">
                  Live OpenStreetMap Feed · Delhi NCR Hubs
                </div>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          SCHEME CAROUSEL
      ===================================================== */}

      <section
        id="schemes"
        className="border-b border-slate-800 bg-[#070B14] py-20"
      >

        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

            <SectionTitle
              eyebrow="EV schemes & policies"
              title="Government EV schemes, in one place."
              description="Browse verified policy and scheme information instead of generic subsidy claims."
            />

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={previousScheme}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 bg-[#0B132B] text-slate-300 transition hover:border-emerald-400 hover:text-white"
                aria-label="Previous scheme"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="min-w-[60px] text-center text-xs font-bold uppercase tracking-widest text-slate-400">
                {schemeIndex + 1} / {schemes.length}
              </div>

              <button
                type="button"
                onClick={nextScheme}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-700 bg-[#0B132B] text-slate-300 transition hover:border-emerald-400 hover:text-white"
                aria-label="Next scheme"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

            </div>

          </div>

          <div className="relative mt-10 overflow-hidden rounded-3xl border border-emerald-400/25 bg-[#0B132B] shadow-xl">

            <div className="grid min-h-[310px] lg:grid-cols-[1fr_310px]">

              {/* TEXT */}

              <div className="p-8 sm:p-10 lg:p-12">

                <span className="inline-flex rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
                  {currentScheme.tag}
                </span>

                <h3 className="mt-6 text-3xl font-black text-white sm:text-4xl">
                  {currentScheme.title}
                </h3>

                <p className="mt-5 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-300">
                  {currentScheme.description}
                </p>

                <div className="mt-8 flex items-start gap-3.5 rounded-2xl border border-slate-800 bg-[#070B14] p-4">

                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />

                  <div>

                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Source
                    </div>

                    <div className="mt-1 text-sm font-medium text-slate-300">
                      {currentScheme.source}
                    </div>

                  </div>

                </div>

                <a
                  href={currentScheme.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-slate-700 bg-[#070B14] px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-200 transition hover:border-emerald-400 hover:text-emerald-400"
                >
                  Official information
                  <ArrowRight className="h-4 w-4" />
                </a>

              </div>

              {/* VISUAL */}

              <div className="hidden items-center justify-center border-l border-slate-800 bg-[#070B14] p-8 lg:flex">

                <div className="text-center">

                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/10 shadow-[0_0_35px_rgba(52,211,153,.15)]">

                    <Zap className="h-10 w-10 text-emerald-400" />

                  </div>

                  <div className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    Government source
                  </div>

                  <div className="mt-2 text-sm font-black text-white">
                    EV policy information
                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* scheme dots */}

          <div className="mt-8 flex justify-center gap-2">

            {schemes.map(
              (_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() =>
                    setSchemeIndex(index)
                  }
                  className={`h-2 rounded-full transition-all ${
                    schemeIndex === index
                      ? "w-10 bg-emerald-400"
                      : "w-2 bg-slate-700"
                  }`}
                  aria-label={`Go to scheme ${index + 1}`}
                />
              ),
            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          GOVERNMENT
      ===================================================== */}

      <section
        id="government"
        className="border-b border-slate-800 bg-[#0A0F1A] py-20"
      >

        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

            <div>

              <div className="inline-flex rounded-full border border-purple-400/30 bg-purple-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-purple-300">
                Government mobility
              </div>

              <h2 className="mt-6 text-3xl font-black leading-snug text-white sm:text-4xl">
                A dedicated workspace for government teams.
              </h2>

              <p className="mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-slate-300">
                Government-facing mobility and infrastructure workflows stay separate from the driver's everyday experience.
              </p>

              <Link
                href="/gov/dashboard"
                className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-purple-400/30 bg-purple-400/10 px-7 py-3.5 text-xs font-black uppercase tracking-wider text-purple-300 transition hover:bg-purple-400/20"
              >
                Open government platform
                <ArrowRight className="h-4 w-4" />
              </Link>

            </div>

            <div className="rounded-3xl border border-slate-700 bg-[#0B132B] p-6 sm:p-8 shadow-xl">

              <GovernmentItem
                title="Mobility operations"
                text="Keep government operational information organised."
              />

              <GovernmentItem
                title="Infrastructure workflows"
                text="Work with relevant charging and mobility infrastructure information."
              />

              <GovernmentItem
                title="Planning support"
                text="Keep government-focused mobility information in one workspace."
              />

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          DRIVER SECTION
      ===================================================== */}

      <section
        id="drivers"
        className="border-b border-slate-800 bg-[#070B14] py-20"
      >

        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

            <div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10">
                <CircleUserRound className="h-6 w-6 text-emerald-400" />
              </div>

              <div className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-emerald-400">
                Driver experience
              </div>

              <h2 className="mt-3 text-3xl font-black leading-snug text-white sm:text-4xl">
                Everything important for the journey.
              </h2>

              <p className="mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-slate-300">
                The driver side of EnaV keeps route planning, charging discovery, active journeys and profile information together without unnecessary dashboard clutter.
              </p>

              <Link
                href="/drivers"
                className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-emerald-400 px-7 py-3.5 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:bg-emerald-300 shadow-lg shadow-emerald-400/20"
              >
                Open driver platform
                <ArrowRight className="h-4 w-4" />
              </Link>

            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <DriverCard
                icon={<Route className="h-5 w-5" />}
                title="Route planning"
                text="Compare routes before beginning the journey."
              />

              <DriverCard
                icon={
                  <BatteryCharging className="h-5 w-5" />
                }
                title="Charging"
                text="Find stations and review available connectors."
              />

              <DriverCard
                icon={
                  <Navigation className="h-5 w-5" />
                }
                title="Active journey"
                text="Keep the selected route and next action in focus."
              />

              <DriverCard
                icon={
                  <CircleUserRound className="h-5 w-5" />
                }
                title="Profile"
                text="Manage personal, vehicle and account information."
              />

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          DRIVER REVIEWS
      ===================================================== */}

      <section className="border-b border-slate-800 bg-[#0A0F1A] py-20">

        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          <SectionTitle
            eyebrow="Driver perspective"
            title="Designed around the road."
            description="These are illustrative prototype testimonials and should be replaced with verified driver feedback."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            {driverFeedback.map(
              (review, index) => (
                <article
                  key={index}
                  className="rounded-3xl border border-slate-700 bg-[#0B132B] p-6 sm:p-8 shadow-xl"
                >

                  <div className="flex gap-1.5">

                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <Star
                          key={star}
                          className="h-5 w-5 fill-[#FBBF24] text-[#FBBF24]"
                          strokeWidth={1.8}
                        />
                      ),
                    )}

                  </div>

                  <p className="mt-6 text-sm sm:text-base leading-relaxed text-slate-300">
                    “{review.quote}”
                  </p>

                  <div className="mt-6 border-t border-slate-800 pt-5">

                    <div className="text-xs font-bold text-white">
                      Sample driver feedback
                    </div>

                    <div className="mt-1 text-[10px] uppercase tracking-widest text-slate-400">
                      Prototype content
                    </div>

                  </div>

                </article>
              ),
            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          FEEDBACK SECTION
      ===================================================== */}

      <section id="feedback" className="border-b border-slate-800 bg-[#070B14] py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              <MessageSquare className="h-3.5 w-3.5" />
              User Feedback
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Help us improve EnaV
            </h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-300">
              Share your experience, suggest features, or report issues with our mobility platform.
            </p>
          </div>

          <div className="mt-10 rounded-3xl border border-slate-700 bg-[#0B132B] p-8 sm:p-10 shadow-2xl">
            {feedbackSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-400">
                  <Check className="h-7 w-7" strokeWidth={3} />
                </div>
                <h3 className="text-xl font-black text-white">Thank you for your feedback!</h3>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  Your response has been recorded successfully and helps our team enhance the EnaV experience.
                </p>
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
                      Your Name / Role
                    </label>
                    <input
                      type="text"
                      required
                      value={feedbackName}
                      onChange={(e) => setFeedbackName(e.target.value)}
                      placeholder="e.g. Sanya Chadha (EV Owner)"
                      className="w-full rounded-2xl border border-slate-700 bg-[#070B14] px-5 py-3.5 text-sm sm:text-base text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
                      Rating
                    </label>
                    <div className="flex items-center gap-3 h-[50px] px-4 rounded-2xl border border-slate-700 bg-[#070B14]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className="focus:outline-none transition hover:scale-110"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              star <= feedbackRating
                                ? "fill-[#FBBF24] text-[#FBBF24]"
                                : "text-slate-600"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="ml-auto text-sm font-bold text-slate-200">
                        {feedbackRating}/5
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
                    Your Feedback & Suggestions
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Tell us what you like or what we can improve..."
                    className="w-full rounded-2xl border border-slate-700 bg-[#070B14] p-4 text-sm sm:text-base text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-emerald-400 py-4 text-xs font-black uppercase tracking-widest text-slate-950 transition hover:bg-emerald-300 shadow-xl shadow-emerald-400/25"
                >
                  <Send className="h-4 w-4" />
                  Submit Feedback
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* =====================================================
          FINAL CTA
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">

        <div className="relative overflow-hidden rounded-[32px] border border-emerald-400/30 bg-gradient-to-br from-[#0B132B] to-[#08101d] px-8 py-16 text-center shadow-2xl sm:px-12">

          <div className="pointer-events-none absolute left-1/2 top-0 h-60 w-60 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />

          <div className="relative">

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15">
              <Zap className="h-5 w-5 text-emerald-400" />
            </div>

            <div className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-emerald-400">
              EnaV
            </div>

            <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-5xl">
              Connected mobility without unnecessary complexity.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-slate-300">
              One platform for driver journeys, charging discovery and government mobility workflows.
            </p>

            <div className="mt-8 flex justify-center">

              <Link
                href="/auth/signup"
                className="flex h-13 items-center justify-center gap-2.5 rounded-full bg-emerald-400 px-8 text-xs font-black uppercase tracking-wider text-slate-950 transition hover:bg-emerald-300 shadow-xl shadow-emerald-400/25"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-800 bg-[#050810]">

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">

          <div className="grid gap-10 md:grid-cols-4">

            <div className="md:col-span-2">

              <Link
                href="/"
                className="flex items-center gap-3"
              >

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-slate-950">
                  <Zap className="h-4 w-4 fill-current" />
                </div>

                <div className="text-base font-black">
                  Ena<span className="text-emerald-400">
                    V
                  </span>
                </div>

              </Link>

              <p className="mt-4 max-w-md text-xs sm:text-sm leading-relaxed text-slate-400">
                Intelligent mobility platform for journey planning, charging discovery and government mobility workflows.
              </p>

            </div>

            <div>

              <div className="text-xs font-bold uppercase tracking-widest text-slate-300">
                Platform
              </div>

              <div className="mt-5 space-y-3.5">

                <FooterLink href="/drivers">
                  Drivers
                </FooterLink>

                <FooterLink href="/drivers/route-optimizer">
                  Journey
                </FooterLink>

                <FooterLink href="/drivers/chargers">
                  Charging
                </FooterLink>

                <FooterLink href="/gov">
                  Government
                </FooterLink>

              </div>

            </div>

            <div>

              <div className="text-xs font-bold uppercase tracking-widest text-slate-300">
                Explore
              </div>

              <div className="mt-5 space-y-3.5">

                <a
                  href="#platform"
                  className="block text-xs sm:text-sm text-slate-400 transition hover:text-white"
                >
                  Platform
                </a>

                <a
                  href="#schemes"
                  className="block text-xs sm:text-sm text-slate-400 transition hover:text-white"
                >
                  EV Schemes
                </a>

                <a
                  href="#charging"
                  className="block text-xs sm:text-sm text-slate-400 transition hover:text-white"
                >
                  Charging
                </a>

              </div>

            </div>

          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-slate-800 pt-6 text-xs uppercase tracking-widest text-slate-500 sm:flex-row sm:items-center sm:justify-between">

            <span>
              © {new Date().getFullYear()} EnaV
            </span>

            <span>
              Intelligent Mobility Platform
            </span>

          </div>

        </div>

      </footer>

    </main>
  );
}

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">

      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">

        <Sparkles className="h-3.5 w-3.5" />

        {eyebrow}

      </div>

      <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
        {title}
      </h2>

      <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-300">
        {description}
      </p>

    </div>
  );
}

function PlatformPill({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-700 bg-[#0B132B] p-5 shadow-lg">

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-400">
        {icon}
      </div>

      <div>

        <div className="text-sm font-black text-white">
          {title}
        </div>

        <div className="mt-1 text-xs sm:text-sm leading-snug text-slate-400">
          {text}
        </div>

      </div>

    </div>
  );
}

function HeroTile({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-700 bg-[#0B132B]/95 p-3.5 backdrop-blur shadow-md">

      <div className="flex items-center gap-2 text-slate-400">

        {icon}

        <span className="text-[10px] font-bold uppercase tracking-wider">
          {title}
        </span>

      </div>

      <div className="mt-1.5 text-xs sm:text-sm font-black text-white">
        {value}
      </div>

    </div>
  );
}

function GovernmentItem({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4 border-b border-slate-800 py-5 last:border-b-0">

      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-purple-400/15">

        <Check
          className="h-4 w-4 text-purple-300"
          strokeWidth={3}
        />

      </div>

      <div>

        <div className="text-sm font-bold text-white">
          {title}
        </div>

        <div className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-400">
          {text}
        </div>

      </div>

    </div>
  );
}

function DriverCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-700 bg-[#0B132B] p-6 shadow-xl transition hover:border-emerald-400/40">

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-400">
        {icon}
      </div>

      <h3 className="mt-5 text-base font-black text-white">
        {title}
      </h3>

      <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-400">
        {text}
      </p>

    </div>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block text-xs sm:text-sm text-slate-400 transition hover:text-white"
    >
      {children}
    </Link>
  );
}