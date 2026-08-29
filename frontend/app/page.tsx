"use client";

import React, {
  useRef,
  useState,
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
} from "lucide-react";

/* =========================================================
   CHARGING MAP
========================================================= */

const ChargingStationsMap = dynamic(
  () => import("@/components/ChargingStationsMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[350px] items-center justify-center bg-[#050A13]">
        <div className="text-center">
          <MapPin className="mx-auto h-5 w-5 text-emerald-400" />

          <p className="mt-3 text-[8px] font-bold uppercase tracking-[0.2em] text-slate-600">
            Loading charging map
          </p>
        </div>
      </div>
    ),
  },
);

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

  const minSwipeDistance = 50;

  const currentFeature =
    features[featureIndex];

  const currentScheme =
    schemes[schemeIndex];

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

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070B14] text-slate-100 selection:bg-emerald-400 selection:text-slate-950">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <div className="sticky top-3 z-50 mx-auto max-w-7xl px-4">

        <nav className="rounded-full border border-emerald-400/20 bg-[#0B132B]/90 px-4 py-2.5 shadow-2xl shadow-black/50 backdrop-blur-xl sm:px-6">

          <div className="flex h-10 items-center justify-between">

            {/* BRAND */}

            <Link
              href="/"
              className="group flex items-center gap-2.5"
            >

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 text-slate-950 shadow-[0_0_18px_rgba(16,185,129,.35)] transition group-hover:scale-105">
                <Zap className="h-4 w-4 fill-current" />
              </div>

              <div>

                <div className="text-lg font-black tracking-tight">
                  Ena<span className="text-emerald-400">
                    V
                  </span>
                </div>

                <div className="hidden text-[6px] font-bold uppercase tracking-[0.23em] text-slate-600 sm:block">
                  Intelligent Mobility Platform
                </div>

              </div>

            </Link>

            {/* DESKTOP NAV */}

            <div className="hidden items-center gap-6 md:flex">

              <a
                href="#platform"
                className="text-[8px] font-bold uppercase tracking-widest text-slate-400 transition hover:text-emerald-400"
              >
                Platform
              </a>

              <a
                href="#charging"
                className="text-[8px] font-bold uppercase tracking-widest text-slate-400 transition hover:text-emerald-400"
              >
                Charging
              </a>

              <a
                href="#schemes"
                className="text-[8px] font-bold uppercase tracking-widest text-slate-400 transition hover:text-emerald-400"
              >
                Schemes
              </a>

              <a
                href="#government"
                className="text-[8px] font-bold uppercase tracking-widest text-slate-400 transition hover:text-emerald-400"
              >
                Government
              </a>

              <a
                href="#drivers"
                className="text-[8px] font-bold uppercase tracking-widest text-slate-400 transition hover:text-emerald-400"
              >
                Drivers
              </a>

            </div>

            {/* ONLY CTA */}

            <Link
              href="/auth/signup"
              className="hidden items-center gap-1.5 rounded-full bg-emerald-400 px-4 py-2 text-[8px] font-black uppercase tracking-wider text-slate-950 shadow-[0_0_16px_rgba(16,185,129,.25)] transition hover:bg-emerald-300 sm:flex"
            >
              Get started
              <ArrowRight className="h-2.5 w-2.5" />
            </Link>

            {/* MOBILE */}

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(
                  (current) => !current,
                )
              }
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-800 text-slate-400 sm:hidden"
              aria-label={
                mobileMenuOpen
                  ? "Close menu"
                  : "Open menu"
              }
            >
              {mobileMenuOpen ? (
                <X className="h-3.5 w-3.5" />
              ) : (
                <Menu className="h-3.5 w-3.5" />
              )}
            </button>

          </div>

          {mobileMenuOpen && (
            <div className="border-t border-slate-800 py-3 md:hidden">

              {[
                ["Platform", "#platform"],
                ["Charging", "#charging"],
                ["Schemes", "#schemes"],
                ["Government", "#government"],
                ["Drivers", "#drivers"],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  onClick={() =>
                    setMobileMenuOpen(false)
                  }
                  className="block rounded-lg px-3 py-2.5 text-[8px] font-bold uppercase tracking-wider text-slate-400 transition hover:bg-slate-900 hover:text-white"
                >
                  {label}
                </a>
              ))}

              <div className="mt-3 border-t border-slate-800 pt-3">

                <Link
                  href="/auth/signup"
                  className="flex h-9 w-full items-center justify-center gap-2 rounded-full bg-emerald-400 text-[8px] font-black uppercase tracking-wider text-slate-950"
                >
                  Get started
                  <ArrowRight className="h-3 w-3" />
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

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 sm:px-6 lg:pb-20">

          {/* HERO */}

          <div className="mx-auto max-w-4xl text-center">

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-[7px] font-bold uppercase tracking-[0.2em] text-emerald-400">
              <Sparkles className="h-3 w-3" />
              Intelligent mobility platform
            </div>

            {/* SMALLER ENAV */}

            <div className="mt-6">

              <div className="text-5xl font-black leading-none tracking-[-0.07em] text-white sm:text-6xl md:text-7xl">
                Ena<span className="text-emerald-400">
                  V
                </span>
              </div>

              <div className="mt-2 text-[7px] font-bold uppercase tracking-[0.4em] text-slate-600">
                Intelligent Mobility
              </div>

            </div>

            <h1 className="mt-7 text-4xl font-black leading-[1.04] tracking-tight sm:text-5xl md:text-6xl">

              Smarter journeys.
              <br />

              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
                Connected mobility.
              </span>

            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-xs leading-6 text-slate-400 sm:text-sm">
              Journey planning, charging discovery and mobility
              operations brought together in one focused platform.
            </p>

            <div className="mt-7 flex justify-center">

              <Link
                href="/auth/signup"
                className="flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-400 px-7 text-[8px] font-black uppercase tracking-wider text-slate-950 shadow-[0_0_24px_rgba(16,185,129,.25)] transition hover:bg-emerald-300"
              >
                Get started
                <ArrowRight className="h-3 w-3" />
              </Link>

            </div>

          </div>

          {/* =================================================
              HERO PRODUCT PREVIEW
          ================================================= */}

          <div className="relative mx-auto mt-12 max-w-5xl">

            <div className="absolute -inset-5 rounded-[34px] bg-gradient-to-r from-emerald-400/10 via-blue-500/5 to-emerald-400/10 blur-2xl" />

            <div className="relative rounded-[28px] border border-slate-800 bg-[#0B132B]/95 p-3 shadow-2xl sm:p-4">

              <div className="flex items-center justify-between border-b border-slate-800 px-2 pb-3">

                <div className="flex items-center gap-2">

                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                  <span className="text-[7px] font-bold uppercase tracking-widest text-slate-500">
                    EnaV mobility workspace
                  </span>

                </div>

                <div className="flex items-center gap-2 text-[6px] uppercase tracking-widest text-slate-700">

                  <Layers className="h-3 w-3" />

                  Preview

                </div>

              </div>

              <div className="relative mt-3 h-[310px] overflow-hidden rounded-2xl border border-slate-800 bg-[#050810] sm:h-[370px]">

                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(100,116,139,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,.12) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />

                {/* roads */}

                <div className="absolute left-[4%] top-[64%] h-[2px] w-[91%] rotate-[-12deg] bg-slate-700" />

                <div className="absolute left-[19%] top-[41%] h-[2px] w-[63%] rotate-[18deg] bg-slate-700/80" />

                <div className="absolute left-[51%] top-[8%] h-[2px] w-[50%] rotate-[68deg] bg-slate-700/50" />

                <div className="absolute left-[0%] top-[27%] h-[2px] w-[44%] rotate-[71deg] bg-slate-800" />

                {/* route */}

                <div className="absolute left-[10%] top-[63%] h-[4px] w-[73%] rotate-[-12deg] rounded-full bg-gradient-to-r from-emerald-400 to-blue-400 shadow-[0_0_18px_rgba(52,211,153,.4)]" />

                {/* start */}

                <div className="absolute left-[7%] top-[58%] flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#050810] bg-emerald-400">

                  <MapPin className="h-4 w-4 text-slate-950" />

                </div>

                {/* vehicle */}

                <div className="absolute left-[46%] top-[53%] flex h-11 w-11 items-center justify-center rounded-full border border-emerald-400/40 bg-[#0B132B]">

                  <Navigation className="h-4 w-4 text-emerald-400" />

                </div>

                {/* destination */}

                <div className="absolute right-[8%] top-[42%] flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#050810] bg-blue-400">

                  <MapPin className="h-4 w-4 text-slate-950" />

                </div>

                {/* product card */}

                <div className="absolute left-4 top-4 w-[275px] rounded-xl border border-slate-800 bg-[#0B132B]/95 p-3 shadow-xl backdrop-blur">

                  <div className="text-[6px] font-bold uppercase tracking-widest text-emerald-400">
                    Driver journey
                  </div>

                  <div className="mt-1.5 text-[11px] font-black text-white">
                    Plan your next journey
                  </div>

                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-800 bg-[#070B14] p-2">

                    <MapPin className="h-3 w-3 text-emerald-400" />

                    <span className="text-[7px] text-slate-400">
                      Current location
                    </span>

                  </div>

                  <div className="my-2 ml-1 h-2 border-l border-dashed border-slate-700" />

                  <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-[#070B14] p-2">

                    <Navigation className="h-3 w-3 text-blue-400" />

                    <span className="text-[7px] text-slate-400">
                      Search destination
                    </span>

                  </div>

                </div>

                {/* tiles */}

                <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2 sm:left-auto sm:right-4 sm:w-[390px]">

                  <HeroTile
                    icon={<Route className="h-3 w-3" />}
                    title="Journey"
                    value="Plan"
                  />

                  <HeroTile
                    icon={
                      <BatteryCharging className="h-3 w-3" />
                    }
                    title="Charging"
                    value="Discover"
                  />

                  <HeroTile
                    icon={
                      <ShieldCheck className="h-3 w-3" />
                    }
                    title="Government"
                    value="Operate"
                  />

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          PLATFORM — SHORT OVERVIEW
      ===================================================== */}

      <section
        id="platform"
        className="border-y border-slate-800 bg-[#0A0F1A] py-16"
      >

        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          <SectionTitle
            eyebrow="Platform"
            title="One ecosystem. Clear roles."
            description="Each side of EnaV has a focused purpose instead of putting every workflow on the same screen."
          />

          <div className="mt-9 grid gap-3 md:grid-cols-3">

            <PlatformPill
              icon={
                <CircleUserRound className="h-4 w-4" />
              }
              title="Drivers"
              text="Journey and driver workflow"
            />

            <PlatformPill
              icon={
                <BatteryCharging className="h-4 w-4" />
              }
              title="Charging"
              text="Station discovery"
            />

            <PlatformPill
              icon={
                <ShieldCheck className="h-4 w-4" />
              }
              title="Government"
              text="Mobility operations"
            />

          </div>

        </div>

      </section>

      {/* =====================================================
          REAL FEATURE CAROUSEL
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

          <SectionTitle
            eyebrow="Explore EnaV"
            title="See the platform in action."
            description="Swipe through the modules on mobile or use the controls to move between them."
          />

          <div className="flex gap-2">

            <button
              type="button"
              onClick={previousFeature}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 bg-[#0B132B] text-slate-400 transition hover:border-emerald-400/30 hover:text-white"
              aria-label="Previous feature"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={nextFeature}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 bg-[#0B132B] text-slate-400 transition hover:border-emerald-400/30 hover:text-white"
              aria-label="Next feature"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

          </div>

        </div>

        {/* viewport */}

        <div
          className="mt-8 overflow-hidden rounded-2xl"
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

                  <article className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0B132B]">

                    <div className="grid lg:grid-cols-[0.85fr_1.15fr]">

                      {/* TEXT */}

                      <div className="p-6 sm:p-8 lg:p-10">

                        <span
                          className={`inline-flex rounded-full border px-3 py-1.5 text-[7px] font-bold uppercase tracking-[0.2em] ${
                            feature.accent ===
                            "blue"
                              ? "border-blue-400/20 bg-blue-400/10 text-blue-400"
                              : feature.accent ===
                                  "purple"
                                ? "border-purple-400/20 bg-purple-400/10 text-purple-300"
                                : "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                          }`}
                        >
                          {feature.badge}
                        </span>

                        <h3 className="mt-5 text-2xl font-black leading-tight text-white sm:text-3xl">
                          {feature.title}
                        </h3>

                        <p className="mt-4 text-xs leading-6 text-slate-400">
                          {feature.description}
                        </p>

                        <div className="mt-6 space-y-3">

                          {feature.points.map(
                            (point) => (
                              <div
                                key={point}
                                className="flex items-center gap-3 text-[9px] font-bold text-slate-300"
                              >

                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/10">

                                  <Check
                                    className="h-3 w-3 text-emerald-400"
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
                          className="mt-7 inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-3 text-[8px] font-black uppercase tracking-wider text-slate-950 transition hover:bg-emerald-300"
                        >
                          Open module
                          <ArrowRight className="h-3 w-3" />
                        </Link>

                      </div>

                      {/* VISUAL */}

                      <div className="border-t border-slate-800 bg-[#070B14] p-3 lg:border-l lg:border-t-0 sm:p-4">

                        <div className="relative h-[330px] overflow-hidden rounded-xl border border-slate-800 bg-[#050810]">

                          <div
                            className="absolute inset-0 opacity-20"
                            style={{
                              backgroundImage:
                                "linear-gradient(rgba(100,116,139,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,.12) 1px, transparent 1px)",
                              backgroundSize:
                                "28px 28px",
                            }}
                          />

                          {/* road */}

                          <div className="absolute left-[8%] top-[65%] h-[3px] w-[74%] rotate-[-10deg] rounded-full bg-gradient-to-r from-emerald-400 to-blue-400 shadow-[0_0_14px_rgba(52,211,153,.4)]" />

                          {/* start */}

                          <div className="absolute left-[8%] top-[59%] flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400">

                            <MapPin className="h-3.5 w-3.5 text-slate-950" />

                          </div>

                          {/* centre icon */}

                          <div className="absolute left-[46%] top-[52%] flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/30 bg-[#0B132B] shadow-[0_0_20px_rgba(52,211,153,.12)]">

                            {feature.badge ===
                              "DRIVER JOURNEY" && (
                              <Route className="h-4 w-4 text-emerald-400" />
                            )}

                            {feature.badge ===
                              "CHARGING DISCOVERY" && (
                              <BatteryCharging className="h-4 w-4 text-blue-400" />
                            )}

                            {feature.badge ===
                              "DRIVER PROFILE" && (
                              <CircleUserRound className="h-4 w-4 text-emerald-400" />
                            )}

                            {feature.badge ===
                              "GOVERNMENT" && (
                              <ShieldCheck className="h-4 w-4 text-purple-300" />
                            )}

                          </div>

                          {/* destination */}

                          <div className="absolute right-[9%] top-[42%] flex h-8 w-8 items-center justify-center rounded-full bg-blue-400">

                            <MapPin className="h-3.5 w-3.5 text-slate-950" />

                          </div>

                          {/* top panel */}

                          <div className="absolute left-4 right-4 top-4 rounded-xl border border-slate-800 bg-[#0B132B]/95 p-4 backdrop-blur">

                            <div className="text-[6px] font-bold uppercase tracking-widest text-slate-600">
                              {feature.badge}
                            </div>

                            <div className="mt-1.5 text-sm font-black text-white">
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

        <div className="mt-5 flex justify-center gap-1.5">

          {features.map(
            (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() =>
                  setFeatureIndex(index)
                }
                className={`h-1.5 rounded-full transition-all ${
                  featureIndex === index
                    ? "w-8 bg-emerald-400"
                    : "w-1.5 bg-slate-700"
                }`}
                aria-label={`Go to feature ${index + 1}`}
              />
            ),
          )}

        </div>

      </section>

      {/* =====================================================
          CHARGING MAP
      ===================================================== */}

      <section
        id="charging"
        className="border-y border-slate-800 bg-[#0A0F1A] py-16"
      >

        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">

            <div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10">

                <MapPin className="h-5 w-5 text-blue-400" />

              </div>

              <div className="mt-5 text-[7px] font-bold uppercase tracking-[0.22em] text-blue-400">
                Charging network
              </div>

              <h2 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">
                Find charging around your journey.
              </h2>

              <p className="mt-4 max-w-md text-xs leading-6 text-slate-400">
                Explore charging locations and review the station
                information available through EnaV.
              </p>

              <Link
                href="/drivers/chargers"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-blue-400 px-5 py-3 text-[8px] font-black uppercase tracking-wider text-slate-950 transition hover:bg-blue-300"
              >
                Open charging
                <ArrowRight className="h-3 w-3" />
              </Link>

            </div>

            <div className="rounded-[24px] border border-slate-800 bg-[#0B132B] p-3 sm:p-4">

              <div className="h-[390px] overflow-hidden rounded-2xl border border-slate-800">

                <ChargingStationsMap />

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
        className="border-b border-slate-800 bg-[#070B14] py-16"
      >

        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

            <SectionTitle
              eyebrow="EV schemes & policies"
              title="Government EV schemes, in one place."
              description="Browse verified policy and scheme information instead of generic subsidy claims."
            />

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={previousScheme}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 bg-[#0B132B] text-slate-400 transition hover:border-emerald-400/30 hover:text-white"
                aria-label="Previous scheme"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="min-w-[42px] text-center text-[7px] font-bold uppercase tracking-widest text-slate-600">
                {schemeIndex + 1} / {schemes.length}
              </div>

              <button
                type="button"
                onClick={nextScheme}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 bg-[#0B132B] text-slate-400 transition hover:border-emerald-400/30 hover:text-white"
                aria-label="Next scheme"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

            </div>

          </div>

          <div className="relative mt-8 overflow-hidden rounded-2xl border border-emerald-400/15 bg-[#0B132B]">

            <div className="grid min-h-[270px] lg:grid-cols-[1fr_270px]">

              {/* TEXT */}

              <div className="p-6 sm:p-8">

                <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[7px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                  {currentScheme.tag}
                </span>

                <h3 className="mt-5 text-2xl font-black text-white sm:text-3xl">
                  {currentScheme.title}
                </h3>

                <p className="mt-4 max-w-2xl text-xs leading-6 text-slate-400">
                  {currentScheme.description}
                </p>

                <div className="mt-6 flex items-start gap-3 rounded-xl border border-slate-800 bg-[#070B14] p-3">

                  <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600" />

                  <div>

                    <div className="text-[7px] font-bold uppercase tracking-widest text-slate-600">
                      Source
                    </div>

                    <div className="mt-1 text-[8px] leading-4 text-slate-500">
                      {currentScheme.source}
                    </div>

                  </div>

                </div>

                <a
                  href={currentScheme.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-slate-700 bg-[#070B14] px-4 py-2.5 text-[8px] font-bold uppercase tracking-wider text-slate-300 transition hover:border-emerald-400/30 hover:text-emerald-400"
                >
                  Official information
                  <ArrowRight className="h-3 w-3" />
                </a>

              </div>

              {/* VISUAL */}

              <div className="hidden items-center justify-center border-l border-slate-800 bg-[#070B14] p-6 lg:flex">

                <div className="text-center">

                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/20 bg-emerald-400/5 shadow-[0_0_30px_rgba(52,211,153,.08)]">

                    <Zap className="h-8 w-8 text-emerald-400" />

                  </div>

                  <div className="mt-5 text-[7px] font-bold uppercase tracking-[0.18em] text-slate-600">
                    Government source
                  </div>

                  <div className="mt-1 text-[10px] font-black text-white">
                    EV policy information
                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* scheme dots */}

          <div className="mt-5 flex justify-center gap-1.5">

            {schemes.map(
              (_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() =>
                    setSchemeIndex(index)
                  }
                  className={`h-1.5 rounded-full transition-all ${
                    schemeIndex === index
                      ? "w-8 bg-emerald-400"
                      : "w-1.5 bg-slate-700"
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
        className="border-b border-slate-800 bg-[#0A0F1A] py-16"
      >

        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">

            <div>

              <div className="inline-flex rounded-full border border-purple-400/20 bg-purple-400/10 px-3 py-1.5 text-[7px] font-bold uppercase tracking-[0.2em] text-purple-300">
                Government mobility
              </div>

              <h2 className="mt-5 text-3xl font-black leading-tight text-white sm:text-4xl">
                A dedicated workspace for government teams.
              </h2>

              <p className="mt-4 max-w-xl text-xs leading-6 text-slate-400">
                Government-facing mobility and infrastructure workflows
                stay separate from the driver's everyday experience.
              </p>

              <Link
                href="/gov"
                className="mt-7 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-400/5 px-5 py-3 text-[8px] font-black uppercase tracking-wider text-purple-300 transition hover:bg-purple-400/10"
              >
                Open government platform
                <ArrowRight className="h-3 w-3" />
              </Link>

            </div>

            <div className="rounded-2xl border border-slate-800 bg-[#0B132B] p-5">

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
          DRIVER SECTION — LAST MAJOR PRODUCT SECTION
      ===================================================== */}

      <section
        id="drivers"
        className="border-b border-slate-800 bg-[#070B14] py-16"
      >

        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">

            <div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">
                <CircleUserRound className="h-5 w-5 text-emerald-400" />
              </div>

              <div className="mt-5 text-[7px] font-bold uppercase tracking-[0.22em] text-emerald-400">
                Driver experience
              </div>

              <h2 className="mt-2 text-3xl font-black leading-tight text-white sm:text-4xl">
                Everything important for the journey.
              </h2>

              <p className="mt-4 max-w-xl text-xs leading-6 text-slate-400">
                The driver side of EnaV keeps route planning, charging
                discovery, active journeys and profile information
                together without unnecessary dashboard clutter.
              </p>

              <Link
                href="/drivers"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-3 text-[8px] font-black uppercase tracking-wider text-slate-950 transition hover:bg-emerald-300"
              >
                Open driver platform
                <ArrowRight className="h-3 w-3" />
              </Link>

            </div>

            <div className="grid gap-3 sm:grid-cols-2">

              <DriverCard
                icon={<Route className="h-4 w-4" />}
                title="Route planning"
                text="Compare routes before beginning the journey."
              />

              <DriverCard
                icon={
                  <BatteryCharging className="h-4 w-4" />
                }
                title="Charging"
                text="Find stations and review available connectors."
              />

              <DriverCard
                icon={
                  <Navigation className="h-4 w-4" />
                }
                title="Active journey"
                text="Keep the selected route and next action in focus."
              />

              <DriverCard
                icon={
                  <CircleUserRound className="h-4 w-4" />
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

      <section className="border-b border-slate-800 bg-[#0A0F1A] py-16">

        <div className="mx-auto max-w-7xl px-4 sm:px-6">

          <SectionTitle
            eyebrow="Driver perspective"
            title="Designed around the road."
            description="These are illustrative prototype testimonials and should be replaced with verified driver feedback."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">

            {driverFeedback.map(
              (review, index) => (
                <article
                  key={index}
                  className="rounded-2xl border border-slate-800 bg-[#0B132B] p-5"
                >

                  {/* GOLDEN STARS */}

                  <div className="flex gap-1">

                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <Star
                          key={star}
                          className="h-4 w-4 fill-[#FBBF24] text-[#FBBF24]"
                          strokeWidth={1.8}
                        />
                      ),
                    )}

                  </div>

                  <p className="mt-5 text-xs leading-6 text-slate-400">
                    “{review.quote}”
                  </p>

                  <div className="mt-5 border-t border-slate-800 pt-4">

                    <div className="text-[9px] font-bold text-slate-300">
                      Sample driver feedback
                    </div>

                    <div className="mt-1 text-[7px] uppercase tracking-widest text-slate-700">
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
          FINAL CTA
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">

        <div className="relative overflow-hidden rounded-[28px] border border-emerald-400/20 bg-gradient-to-br from-[#0B132B] to-[#08101d] px-6 py-14 text-center shadow-2xl sm:px-10">

          <div className="pointer-events-none absolute left-1/2 top-0 h-60 w-60 -translate-x-1/2 rounded-full bg-emerald-400/5 blur-3xl" />

          <div className="relative">

            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">
              <Zap className="h-4 w-4 text-emerald-400" />
            </div>

            <div className="mt-5 text-[7px] font-bold uppercase tracking-[0.22em] text-emerald-400">
              EnaV
            </div>

            <h2 className="mx-auto mt-2 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-5xl">
              Connected mobility without unnecessary complexity.
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-xs leading-6 text-slate-500">
              One platform for driver journeys, charging discovery
              and government mobility workflows.
            </p>

            <div className="mt-7 flex justify-center">

              <Link
                href="/auth/signup"
                className="flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-400 px-7 text-[8px] font-black uppercase tracking-wider text-slate-950 transition hover:bg-emerald-300"
              >
                Get started
                <ArrowRight className="h-3 w-3" />
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-800 bg-[#050810]">

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">

          <div className="grid gap-8 md:grid-cols-4">

            <div className="md:col-span-2">

              <Link
                href="/"
                className="flex items-center gap-2.5"
              >

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 text-slate-950">
                  <Zap className="h-3.5 w-3.5 fill-current" />
                </div>

                <div className="text-sm font-black">
                  Ena<span className="text-emerald-400">
                    V
                  </span>
                </div>

              </Link>

              <p className="mt-3 max-w-md text-[10px] leading-5 text-slate-600">
                Intelligent mobility platform for journey planning,
                charging discovery and government mobility workflows.
              </p>

            </div>

            <div>

              <div className="text-[7px] font-bold uppercase tracking-widest text-slate-500">
                Platform
              </div>

              <div className="mt-4 space-y-3">

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

              <div className="text-[7px] font-bold uppercase tracking-widest text-slate-500">
                Explore
              </div>

              <div className="mt-4 space-y-3">

                <a
                  href="#platform"
                  className="block text-[9px] text-slate-600 transition hover:text-white"
                >
                  Platform
                </a>

                <a
                  href="#schemes"
                  className="block text-[9px] text-slate-600 transition hover:text-white"
                >
                  EV Schemes
                </a>

                <a
                  href="#charging"
                  className="block text-[9px] text-slate-600 transition hover:text-white"
                >
                  Charging
                </a>

              </div>

            </div>

          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-slate-800 pt-5 text-[7px] uppercase tracking-widest text-slate-700 sm:flex-row sm:items-center sm:justify-between">

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

      <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-3 py-1 text-[7px] font-bold uppercase tracking-[0.2em] text-emerald-400">

        <Sparkles className="h-2.5 w-2.5" />

        {eyebrow}

      </div>

      <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
        {title}
      </h2>

      <p className="mt-2 text-xs leading-relaxed text-slate-400">
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
    <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-[#0B132B] p-4">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
        {icon}
      </div>

      <div>

        <div className="text-[10px] font-black text-white">
          {title}
        </div>

        <div className="mt-1 text-[8px] text-slate-600">
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
    <div className="rounded-lg border border-slate-800 bg-[#0B132B]/95 p-2.5 backdrop-blur">

      <div className="flex items-center gap-1.5 text-slate-500">

        {icon}

        <span className="text-[6px] font-bold uppercase tracking-wider">
          {title}
        </span>

      </div>

      <div className="mt-1 text-[8px] font-black text-white">
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
    <div className="flex gap-3 border-b border-slate-800 py-4 last:border-b-0">

      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-400/10">

        <Check
          className="h-3.5 w-3.5 text-purple-300"
          strokeWidth={3}
        />

      </div>

      <div>

        <div className="text-[10px] font-bold text-white">
          {title}
        </div>

        <div className="mt-1 text-[8px] leading-4 text-slate-600">
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
    <div className="rounded-2xl border border-slate-800 bg-[#0B132B] p-4 transition hover:border-emerald-400/20">

      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-400">
        {icon}
      </div>

      <h3 className="mt-4 text-xs font-black text-white">
        {title}
      </h3>

      <p className="mt-1.5 text-[9px] leading-5 text-slate-500">
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
      className="block text-[9px] text-slate-600 transition hover:text-white"
    >
      {children}
    </Link>
  );
}