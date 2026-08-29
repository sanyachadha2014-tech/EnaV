"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import {
  Bell,
  UserCircle,
  Activity,
  Siren,
  Zap,
  Clock3,
  Car,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Leaf,
  Radio,
  Navigation,
  BatteryCharging,
  Gauge,
  LogOut,
  Check,
} from "lucide-react";

const CommandMap = dynamic(
  () => import("@/components/CommandMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[390px] items-center justify-center bg-[#071426] text-sm text-slate-500">
        <Activity className="mr-2 h-5 w-5 animate-spin text-emerald-400" />
        Loading city map...
      </div>
    ),
  },
);

/* =========================================================
   PRIORITIES
========================================================= */

type PriorityType =
  | "emergency"
  | "warning"
  | "success";

const priorities: {
  type: PriorityType;
  icon: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  meta: string;
}[] = [
  {
    type: "emergency",
    icon: Siren,
    title: "Emergency #E102",
    description: "Ambulance required",
    meta: "ETA: 6 min",
  },
  {
    type: "warning",
    icon: Zap,
    title: "Station #C42",
    description: "High congestion predicted",
    meta: "Wait: 5 min",
  },
  {
    type: "success",
    icon: CheckCircle2,
    title: "Emergency #E098",
    description: "Police dispatched",
    meta: "En route",
  },
];

/* =========================================================
   PRIORITY STYLES
========================================================= */

const priorityStyles: Record<
  PriorityType,
  {
    icon: string;
    dot: string;
    title: string;
  }
> = {
  emergency: {
    icon:
      "border-red-500/20 bg-red-500/10 text-red-400",
    dot: "bg-red-500",
    title: "text-red-300",
  },

  warning: {
    icon:
      "border-amber-500/20 bg-amber-500/10 text-amber-400",
    dot: "bg-amber-400",
    title: "text-amber-300",
  },

  success: {
    icon:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    dot: "bg-emerald-400",
    title: "text-emerald-300",
  },
};

/* =========================================================
   DASHBOARD STATS
========================================================= */

const stats = [
  {
    label: "ACTIVE EVs",
    value: "1,284",
    detail: "+8.2% today",
    icon: Car,
    iconClass:
      "text-blue-400 bg-blue-500/10 border-blue-500/20",
    valueClass: "text-white",
  },
  {
    label: "CHARGERS",
    value: "342",
    detail: "328 online",
    icon: Zap,
    iconClass:
      "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    valueClass: "text-white",
  },
  {
    label: "EMERGENCIES",
    value: "07",
    detail: "2 high priority",
    icon: Siren,
    iconClass:
      "text-red-400 bg-red-500/10 border-red-500/20",
    valueClass: "text-red-400",
  },
  {
    label: "AVG ETA",
    value: "8.4 min",
    detail: "-12% today",
    icon: Clock3,
    iconClass:
      "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    valueClass: "text-white",
  },
];

/* =========================================================
   MAP LEGEND
========================================================= */

const mapLegend = [
  {
    label: "EVs",
    color: "bg-blue-400",
  },
  {
    label: "Chargers",
    color: "bg-emerald-400",
  },
  {
    label: "Emergency",
    color: "bg-red-500",
  },
  {
    label: "Traffic",
    color: "bg-amber-400",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function GovernmentDashboardOverview() {
  const router = useRouter();

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  /* =======================================================
     NOTIFICATION TOGGLE
  ======================================================= */

  function toggleNotifications() {
    setNotificationsOpen((current) => !current);
    setProfileOpen(false);
  }

  /* =======================================================
     PROFILE TOGGLE
  ======================================================= */

  function toggleProfile() {
    setProfileOpen((current) => !current);
    setNotificationsOpen(false);
  }

  /* =======================================================
     CLOSE DROPDOWNS
  ======================================================= */

  function closeDropdowns() {
    setNotificationsOpen(false);
    setProfileOpen(false);
  }

  /* =======================================================
     SIGN OUT
  ======================================================= */

  function handleSignOut() {
    closeDropdowns();

    try {
      localStorage.removeItem("enav-role");
      localStorage.removeItem("enav-user");
      localStorage.removeItem("enav-auth");
    } catch {
      // Ignore localStorage errors.
    }

    router.push("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-[#040B16] text-slate-100">

      {/* =====================================================
          COMMAND HEADER
      ===================================================== */}

      <header className="border-b border-[#1A304B] bg-[#071426]">

        <div className="flex min-h-[68px] items-center justify-between gap-4 px-5 py-3 xl:px-6">

          {/* =================================================
              LEFT
          ================================================= */}

          <div className="min-w-0">

            <div className="flex items-center gap-2.5">

              <h1 className="truncate text-base font-black uppercase tracking-[0.08em] text-white sm:text-lg">
                ENA V — City Mobility Command
              </h1>

              <span className="hidden rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400 md:inline-flex">
                Government
              </span>

            </div>

            <div className="mt-1.5 flex items-center gap-2 text-[10px] font-medium text-slate-400 sm:text-xs">

              <MapPin className="h-3.5 w-3.5 text-blue-400" />

              <span>Delhi NCR</span>

              <span className="text-slate-600">
                •
              </span>

              <span>
                27 Aug 2026 | 14:32 IST
              </span>

            </div>

          </div>

          {/* =================================================
              RIGHT
          ================================================= */}

          <div className="relative flex shrink-0 items-center gap-2">

            {/* =================================================
                NOTIFICATION
            ================================================= */}

            <div className="relative">

              <button
                type="button"
                aria-label="Notifications"
                onClick={toggleNotifications}
                className={`relative flex h-9 w-9 items-center justify-center rounded-lg border bg-[#091A2D] transition ${
                  notificationsOpen
                    ? "border-emerald-500/40 text-emerald-400"
                    : "border-[#1D3855] text-slate-400 hover:border-blue-500/40 hover:text-white"
                }`}
              >

                <Bell className="h-4 w-4" />

                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />

              </button>

              {/* NOTIFICATION DROPDOWN */}

              {notificationsOpen && (
                <div className="absolute right-0 top-11 z-[100] w-[300px] overflow-hidden rounded-xl border border-[#1D3855] bg-[#071426] shadow-2xl shadow-black/50">

                  <div className="flex items-center justify-between border-b border-[#1A304B] px-4 py-3">

                    <div>

                      <div className="text-[10px] font-black uppercase tracking-wider text-white">
                        Notifications
                      </div>

                      <div className="mt-1 text-[8px] text-slate-600">
                        Recent system updates
                      </div>

                    </div>

                    <span className="rounded-full bg-red-500/10 px-2 py-1 text-[7px] font-bold text-red-400">
                      1 NEW
                    </span>

                  </div>

                  <div className="divide-y divide-[#172A42]">

                    <NotificationItem
                      icon={
                        <Siren className="h-3.5 w-3.5" />
                      }
                      title="Emergency #E102"
                      description="Ambulance required in Janakpuri."
                      time="2 min ago"
                      tone="red"
                    />

                    <NotificationItem
                      icon={
                        <Zap className="h-3.5 w-3.5" />
                      }
                      title="Station #C42"
                      description="High congestion predicted."
                      time="8 min ago"
                      tone="amber"
                    />

                    <NotificationItem
                      icon={
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      }
                      title="Emergency #E098"
                      description="Police unit dispatched."
                      time="14 min ago"
                      tone="green"
                    />

                  </div>

                  <div className="border-t border-[#1A304B] p-2.5">

                    <button
                      type="button"
                      onClick={closeDropdowns}
                      className="w-full rounded-lg border border-[#1D3855] bg-[#091A2D] px-3 py-2 text-[8px] font-bold uppercase tracking-wider text-slate-400 transition hover:border-blue-500/30 hover:text-white"
                    >
                      Close
                    </button>

                  </div>

                </div>
              )}

            </div>

            {/* =================================================
                OFFICER PROFILE
            ================================================= */}

            <div className="relative">

              <button
                type="button"
                onClick={toggleProfile}
                className={`flex h-9 items-center gap-2 rounded-lg border bg-[#091A2D] px-3 text-[10px] font-bold transition ${
                  profileOpen
                    ? "border-emerald-500/40 text-white"
                    : "border-[#1D3855] text-slate-300 hover:border-blue-500/40 hover:text-white"
                }`}
              >

                <UserCircle
                  className={`h-4 w-4 ${
                    profileOpen
                      ? "text-emerald-400"
                      : "text-blue-400"
                  }`}
                />

                <span className="hidden sm:inline">
                  Officer Profile
                </span>

              </button>

              {/* PROFILE DROPDOWN */}

              {profileOpen && (
                <div className="absolute right-0 top-11 z-[100] w-[280px] overflow-hidden rounded-xl border border-[#1D3855] bg-[#071426] shadow-2xl shadow-black/50">

                  {/* PROFILE HEADER */}

                  <div className="border-b border-[#1A304B] px-4 py-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">

                        <UserCircle className="h-5 w-5 text-emerald-400" />

                      </div>

                      <div className="min-w-0">

                        <div className="text-[10px] font-black text-white">
                          Government Officer
                        </div>

                        <div className="mt-1 text-[8px] text-slate-600">
                          Government Account
                        </div>

                      </div>

                    </div>

                  </div>

                  {/* PROFILE INFORMATION */}

                  <div className="space-y-3 px-4 py-4">

                    <ProfileInfo
                      label="Full name"
                      value="Government Officer"
                    />

                    <ProfileInfo
                      label="Email address"
                      value="officer@enav.com"
                    />

                    <ProfileInfo
                      label="Driver / Employee ID"
                      value="MUNICIPAL-ADMIN-01"
                    />

                    <ProfileInfo
                      label="Department"
                      value="City Mobility Operations"
                    />

                  </div>

                  {/* SIGN OUT */}

                  <div className="border-t border-[#1A304B] p-2">

                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[9px] font-semibold text-red-400 transition hover:bg-red-950/20"
                    >

                      <LogOut className="h-3.5 w-3.5" />

                      Sign out

                    </button>

                  </div>

                </div>
              )}

            </div>

          </div>

        </div>

      </header>

      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}

      <main className="px-4 py-4 xl:px-6 xl:py-5">

        {/* ===================================================
            STATUS ROW
        =================================================== */}

        <div className="mb-4 flex items-center justify-between gap-3">

          <div>

            <div className="flex items-center gap-2">

              <Radio className="h-3.5 w-3.5 text-emerald-400" />

              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                COMMAND CENTER
              </span>

            </div>

            <h2 className="mt-1 text-xl font-black tracking-tight text-white">
              City Operations Overview
            </h2>

          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5">

            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />

            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 sm:text-[10px]">
              Systems Operational
            </span>

          </div>

        </div>

        {/* ===================================================
            KPI ROW
        =================================================== */}

        <section className="mb-4 grid grid-cols-2 gap-3 xl:grid-cols-4">

          {stats.map((stat) => {

            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="rounded-xl border border-[#1A304B] bg-[#071426] px-4 py-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.18)]"
              >

                <div className="flex items-center justify-between">

                  <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">
                    {stat.label}
                  </span>

                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border ${stat.iconClass}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                </div>

                <div
                  className={`mt-2 text-2xl font-black tracking-tight ${stat.valueClass}`}
                >
                  {stat.value}
                </div>

                <div className="mt-1 text-[9px] font-semibold text-slate-500">
                  {stat.detail}
                </div>

              </div>
            );
          })}

        </section>

        {/* ===================================================
            MAIN COMMAND AREA
        =================================================== */}

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_310px]">

          {/* =================================================
              MAP
          ================================================= */}

          <div className="overflow-hidden rounded-xl border border-[#1A304B] bg-[#071426] shadow-[0_10px_35px_rgba(0,0,0,0.22)]">

            {/* MAP HEADER */}

            <div className="flex min-h-[58px] items-center justify-between gap-3 border-b border-[#1A304B] px-4 py-3">

              <div>

                <div className="flex items-center gap-2">

                  <Navigation className="h-3.5 w-3.5 text-blue-400" />

                  <h3 className="text-xs font-black uppercase tracking-wider text-white">
                    Delhi NCR Live Map
                  </h3>

                </div>

                <p className="mt-1 text-[9px] text-slate-500">
                  Real-time city mobility intelligence
                </p>

              </div>

              <div className="hidden items-center gap-3 md:flex">

                {mapLegend.map((item) => (
                  <span
                    key={item.label}
                    className="flex items-center gap-1.5 text-[9px] font-medium text-slate-500"
                  >

                    <span
                      className={`h-1.5 w-1.5 rounded-full ${item.color}`}
                    />

                    {item.label}

                  </span>
                ))}

              </div>

            </div>

            {/* MAP */}

            <div className="relative h-[410px] overflow-hidden bg-[#06111F] lg:h-[430px]">

              <CommandMap />

              {/* MAP TOP STATUS */}

              <div className="pointer-events-none absolute left-3 top-3 z-[400]">

                <div className="flex items-center gap-2 rounded-lg border border-[#27405D] bg-[#071426]/90 px-3 py-2 shadow-lg backdrop-blur">

                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />

                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">
                    Live telemetry
                  </span>

                  <span className="text-[9px] text-slate-600">
                    |
                  </span>

                  <span className="text-[9px] text-slate-400">
                    1,284 EV units
                  </span>

                </div>

              </div>

              {/* MAP BOTTOM INCIDENT */}

              <div className="pointer-events-none absolute bottom-3 left-3 z-[400]">

                <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-[#120A12]/95 px-3 py-2 shadow-[0_0_20px_rgba(239,68,68,0.12)] backdrop-blur">

                  <AlertTriangle className="h-3.5 w-3.5 text-red-400" />

                  <div>

                    <div className="text-[9px] font-bold text-red-400">
                      ACTIVE INCIDENT
                    </div>

                    <div className="text-[9px] text-slate-400">
                      Emergency #E102 • Janakpuri
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* MAP FOOTER */}

            <div className="flex items-center justify-between border-t border-[#1A304B] px-4 py-2.5">

              <div className="flex items-center gap-2 text-[9px] text-slate-500">

                <Gauge className="h-3.5 w-3.5 text-blue-400" />

                Traffic layer active

              </div>

              <div className="flex items-center gap-2 text-[9px]">

                <span className="text-slate-600">
                  Last sync
                </span>

                <span className="font-bold text-emerald-400">
                  14:31:58 IST
                </span>

              </div>

            </div>

          </div>

          {/* =================================================
              LIVE PRIORITIES
          ================================================= */}

          <aside className="flex flex-col overflow-hidden rounded-xl border border-[#1A304B] bg-[#071426] shadow-[0_10px_35px_rgba(0,0,0,0.22)]">

            <div className="border-b border-[#1A304B] px-4 py-3.5">

              <div className="flex items-center justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <Activity className="h-3.5 w-3.5 text-emerald-400" />

                    <h3 className="text-xs font-black uppercase tracking-wider text-white">
                      Live Priorities
                    </h3>

                  </div>

                  <p className="mt-1 text-[9px] text-slate-500">
                    Officer attention required
                  </p>

                </div>

                <span className="rounded border border-red-500/20 bg-red-500/10 px-2 py-1 text-[8px] font-bold text-red-400">
                  3 ACTIVE
                </span>

              </div>

            </div>

            <div className="flex-1 divide-y divide-[#172A42]">

              {priorities.map((item) => {

                const Icon = item.icon;
                const styles =
                  priorityStyles[item.type];

                return (
                  <div
                    key={item.title}
                    className="group px-4 py-4 transition hover:bg-[#091A2D]"
                  >

                    <div className="flex gap-3">

                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${styles.icon}`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0 flex-1">

                        <div className="flex items-start justify-between gap-2">

                          <h4
                            className={`text-[11px] font-bold ${styles.title}`}
                          >
                            {item.title}
                          </h4>

                          <span
                            className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${styles.dot}`}
                          />

                        </div>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {item.description}
                        </p>

                        <p className="mt-2 text-[10px] font-bold text-slate-300">
                          {item.meta}
                        </p>

                      </div>

                    </div>

                  </div>
                );
              })}

            </div>

            <div className="border-t border-[#1A304B] p-3">

              <button
                type="button"
                className="w-full rounded-lg border border-[#25415F] bg-[#091A2D] px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-300 transition hover:border-blue-500/40 hover:bg-[#0C2037] hover:text-white"
              >
                View all alerts
              </button>

            </div>

          </aside>

        </section>

        {/* ===================================================
            CITY PERFORMANCE
        =================================================== */}

        <section className="mt-4">

          <div className="mb-3 flex items-end justify-between">

            <div>

              <div className="flex items-center gap-2">

                <TrendingUp className="h-3.5 w-3.5 text-blue-400" />

                <h3 className="text-xs font-black uppercase tracking-wider text-white">
                  City Performance
                </h3>

              </div>

              <p className="mt-1 text-[9px] text-slate-500">
                Key mobility indicators for today
              </p>

            </div>

            <span className="hidden text-[9px] text-slate-600 sm:block">
              TODAY • 27 AUG 2026
            </span>

          </div>

          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">

            {/* CHARGING */}

            <div className="rounded-xl border border-[#1A304B] bg-[#071426] p-3.5">

              <div className="flex items-center justify-between">

                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  Charging Utilization
                </span>

                <Zap className="h-3.5 w-3.5 text-emerald-400" />

              </div>

              <div className="mt-2 text-xl font-black text-white">
                72%
              </div>

              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#102238]">

                <div className="h-full w-[72%] rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />

              </div>

              <p className="mt-2 text-[9px] text-emerald-400">
                +5% vs yesterday
              </p>

            </div>

            {/* EMERGENCY */}

            <div className="rounded-xl border border-[#1A304B] bg-[#071426] p-3.5">

              <div className="flex items-center justify-between">

                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  Emergency Response
                </span>

                <Siren className="h-3.5 w-3.5 text-red-400" />

              </div>

              <div className="mt-2 text-xl font-black text-white">
                8.4 min
              </div>

              <p className="mt-2 flex items-center gap-1 text-[9px] text-emerald-400">

                <TrendingUp className="h-3 w-3" />

                12% faster today

              </p>

            </div>

            {/* EV ADOPTION */}

            <div className="rounded-xl border border-[#1A304B] bg-[#071426] p-3.5">

              <div className="flex items-center justify-between">

                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  EV Adoption
                </span>

                <Car className="h-3.5 w-3.5 text-blue-400" />

              </div>

              <div className="mt-2 text-xl font-black text-white">
                18.6%
              </div>

              <p className="mt-2 text-[9px] text-blue-400">
                +2.4% this quarter
              </p>

            </div>

            {/* CO2 */}

            <div className="rounded-xl border border-[#1A304B] bg-[#071426] p-3.5">

              <div className="flex items-center justify-between">

                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  CO₂ Avoided
                </span>

                <Leaf className="h-3.5 w-3.5 text-emerald-400" />

              </div>

              <div className="mt-2 text-xl font-black text-white">
                642 t
              </div>

              <p className="mt-2 text-[9px] text-emerald-400">
                Estimated from EV activity
              </p>

            </div>

          </div>

        </section>

        {/* ===================================================
            COMMAND STATUS
        =================================================== */}

        <div className="mt-4 flex flex-col gap-2 rounded-lg border border-[#1A304B] bg-[#071426] px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-2">

            <BatteryCharging className="h-3.5 w-3.5 text-emerald-400" />

            <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
              City telemetry
            </span>

            <span className="text-[9px] text-slate-600">
              •
            </span>

            <span className="text-[9px] text-emerald-400">
              All primary systems connected
            </span>

          </div>

          <div className="text-[9px] text-slate-600">
            Demo environment • Simulated city data
          </div>

        </div>

      </main>

    </div>
  );
}

/* =========================================================
   NOTIFICATION ITEM
========================================================= */

function NotificationItem({
  icon,
  title,
  description,
  time,
  tone,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  time: string;
  tone: "red" | "amber" | "green";
}) {
  const toneStyles = {
    red:
      "border-red-500/20 bg-red-500/10 text-red-400",
    amber:
      "border-amber-500/20 bg-amber-500/10 text-amber-400",
    green:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  };

  return (
    <div className="flex gap-3 px-4 py-3.5 transition hover:bg-[#091A2D]">

      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${toneStyles[tone]}`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">

        <div className="text-[9px] font-bold text-slate-200">
          {title}
        </div>

        <div className="mt-1 text-[8px] leading-4 text-slate-500">
          {description}
        </div>

        <div className="mt-1 text-[7px] text-slate-700">
          {time}
        </div>

      </div>

    </div>
  );
}

/* =========================================================
   PROFILE INFO
========================================================= */

function ProfileInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-[7px] font-bold uppercase tracking-wider text-slate-600">
        {label}
      </div>

      <div className="mt-1 text-[9px] font-semibold text-slate-300">
        {value}
      </div>
    </div>
  );
}