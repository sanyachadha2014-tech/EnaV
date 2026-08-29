"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  BatteryCharging,
  Building2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Cpu,
  Gauge,
  MapPin,
  Navigation,
  Power,
  Search,
  ShieldCheck,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type StationStatus = "HEALTHY" | "DEGRADED" | "OFFLINE";
type Layer = "demand" | "grid";

type Station = {
  id: string;
  name: string;
  location: string;
  status: StationStatus;
  type: string;
  connectors: number;
  available: number;
  occupied: number;
  offline: number;
  utilization: number;
  currentPower: number;
  maxPower: number;
  lastEvent: string;
  lastEventTime: string;
};

type SpatialZone = {
  zone: string;
  demandScore: number;
  gridLoad: number;
  suitabilityScore: number;
  status: "Critical" | "High" | "Medium" | "Low";
  recommendation: string;
  reason: string;
};

/* =========================================================
   DATA
========================================================= */

const stations: Station[] = [
  {
    id: "CS-DEL-01",
    name: "Connaught Place Central",
    location: "CP Central",
    status: "HEALTHY",
    type: "DC Fast",
    connectors: 12,
    available: 5,
    occupied: 7,
    offline: 0,
    utilization: 82,
    currentPower: 148,
    maxPower: 180,
    lastEvent: "Session completed",
    lastEventTime: "14:42",
  },
  {
    id: "CS-DEL-02",
    name: "Janakpuri Ward 7",
    location: "Janakpuri W7",
    status: "DEGRADED",
    type: "DC Fast",
    connectors: 10,
    available: 2,
    occupied: 7,
    offline: 1,
    utilization: 91,
    currentPower: 172,
    maxPower: 200,
    lastEvent: "Connector derated",
    lastEventTime: "14:37",
  },
  {
    id: "CS-DEL-03",
    name: "Okhla Industrial Phase III",
    location: "Okhla Ph-III",
    status: "HEALTHY",
    type: "DC Fast",
    connectors: 8,
    available: 3,
    occupied: 5,
    offline: 0,
    utilization: 74,
    currentPower: 116,
    maxPower: 160,
    lastEvent: "Session completed",
    lastEventTime: "14:28",
  },
  {
    id: "CS-DEL-04",
    name: "Dwarka Sector 14",
    location: "Sec-14 Dwarka",
    status: "HEALTHY",
    type: "Ultra Fast",
    connectors: 16,
    available: 3,
    occupied: 13,
    offline: 0,
    utilization: 94,
    currentPower: 236,
    maxPower: 280,
    lastEvent: "High demand detected",
    lastEventTime: "14:24",
  },
  {
    id: "CS-DEL-05",
    name: "Rohini Sector 9",
    location: "Rohini Sec-9",
    status: "HEALTHY",
    type: "AC + DC",
    connectors: 10,
    available: 5,
    occupied: 5,
    offline: 0,
    utilization: 79,
    currentPower: 92,
    maxPower: 140,
    lastEvent: "Normal operation",
    lastEventTime: "14:19",
  },
  {
    id: "CS-DEL-06",
    name: "RK Puram South",
    location: "RK Puram S4",
    status: "HEALTHY",
    type: "AC + DC",
    connectors: 8,
    available: 5,
    occupied: 3,
    offline: 0,
    utilization: 61,
    currentPower: 67,
    maxPower: 110,
    lastEvent: "Session started",
    lastEventTime: "14:11",
  },
  {
    id: "CS-DEL-07",
    name: "Vasant Kunj Hub",
    location: "Vasant Kunj",
    status: "DEGRADED",
    type: "DC Fast",
    connectors: 8,
    available: 3,
    occupied: 4,
    offline: 1,
    utilization: 54,
    currentPower: 71,
    maxPower: 120,
    lastEvent: "Connector maintenance",
    lastEventTime: "13:56",
  },
  {
    id: "CS-DEL-08",
    name: "Dwarka Transit Hub",
    location: "Dwarka Sector 10",
    status: "OFFLINE",
    type: "DC Fast",
    connectors: 6,
    available: 0,
    occupied: 0,
    offline: 6,
    utilization: 0,
    currentPower: 0,
    maxPower: 100,
    lastEvent: "Station offline",
    lastEventTime: "13:41",
  },
];

const spatialZones: SpatialZone[] = [
  {
    zone: "Sec-14 Dwarka",
    demandScore: 94,
    gridLoad: 88,
    suitabilityScore: 92,
    status: "Critical",
    recommendation: "High priority expansion",
    reason:
      "Very high EV demand with strong infrastructure need. Existing utilization indicates additional fast-charging capacity is justified.",
  },
  {
    zone: "Janakpuri W7",
    demandScore: 89,
    gridLoad: 92,
    suitabilityScore: 84,
    status: "High",
    recommendation: "Expand after grid upgrade",
    reason:
      "Demand is high, but grid loading is also high. Additional charging capacity should follow transformer or substation reinforcement.",
  },
  {
    zone: "CP Central",
    demandScore: 78,
    gridLoad: 82,
    suitabilityScore: 76,
    status: "Medium",
    recommendation: "Monitor capacity",
    reason:
      "Strong charging demand exists, but the current network already provides substantial capacity.",
  },
  {
    zone: "Okhla Ph-III",
    demandScore: 65,
    gridLoad: 75,
    suitabilityScore: 69,
    status: "Medium",
    recommendation: "Conditional expansion",
    reason:
      "Commercial charging demand is meaningful, but grid conditions should be checked before adding major capacity.",
  },
  {
    zone: "RK Puram S4",
    demandScore: 42,
    gridLoad: 61,
    suitabilityScore: 48,
    status: "Low",
    recommendation: "No immediate expansion",
    reason:
      "Demand does not currently justify a high-priority charging expansion.",
  },
  {
    zone: "Rohini Sec-9",
    demandScore: 81,
    gridLoad: 79,
    suitabilityScore: 78,
    status: "High",
    recommendation: "Consider expansion",
    reason:
      "Demand is high and grid loading remains manageable, making this a potential secondary expansion area.",
  },
  {
    zone: "Vasant Kunj",
    demandScore: 58,
    gridLoad: 54,
    suitabilityScore: 64,
    status: "Low",
    recommendation: "Monitor",
    reason:
      "Grid capacity is available, but current demand does not warrant immediate infrastructure expansion.",
  },
];

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function StatusDot({ status }: { status: StationStatus }) {
  const style =
    status === "HEALTHY"
      ? "bg-emerald-400"
      : status === "DEGRADED"
        ? "bg-amber-400"
        : "bg-red-400";

  return <span className={`h-2 w-2 rounded-full ${style}`} />;
}

function StatusBadge({ status }: { status: StationStatus }) {
  const style =
    status === "HEALTHY"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
      : status === "DEGRADED"
        ? "border-amber-500/20 bg-amber-500/10 text-amber-400"
        : "border-red-500/20 bg-red-500/10 text-red-400";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[9px] font-bold tracking-wide ${style}`}
    >
      <StatusDot status={status} />
      {status}
    </span>
  );
}

function Metric({
  label,
  value,
  suffix,
  icon,
}: {
  label: string;
  value: string;
  suffix?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#070D18] p-4">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
          {label}
        </span>
        {icon}
      </div>

      <div className="mt-2 text-xl font-black text-white">
        {value}
        {suffix && (
          <span className="ml-1 text-xs font-medium text-slate-500">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-black uppercase tracking-wider text-white">
          {title}
        </h2>
      </div>

      <p className="mt-1 text-[11px] text-slate-500">{subtitle}</p>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function InfraPlannerPage() {
  const [activeLayer, setActiveLayer] = useState<Layer>("demand");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "ALL" | StationStatus
  >("ALL");

  const [selectedStationId, setSelectedStationId] =
    useState<string | null>(null);

  const [selectedZoneName, setSelectedZoneName] =
    useState<string | null>(null);

  const selectedStation = stations.find(
    (station) => station.id === selectedStationId,
  );

  const selectedZone = spatialZones.find(
    (zone) => zone.zone === selectedZoneName,
  );

  const filteredStations = useMemo(() => {
    return stations.filter((station) => {
      const matchesSearch =
        station.name.toLowerCase().includes(search.toLowerCase()) ||
        station.location.toLowerCase().includes(search.toLowerCase()) ||
        station.id.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || station.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  const totalStations = stations.length;

  const totalConnectors = stations.reduce(
    (sum, station) => sum + station.connectors,
    0,
  );

  const availableConnectors = stations.reduce(
    (sum, station) => sum + station.available,
    0,
  );

  const avgUtilization = Math.round(
    stations.reduce(
      (sum, station) => sum + station.utilization,
      0,
    ) / stations.length,
  );

  const offlineStations = stations.filter(
    (station) => station.status === "OFFLINE",
  ).length;

  /*
   * Top 3 are explicitly derived from suitability score.
   */
  const topSites = [...spatialZones]
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
    .slice(0, 3);

  const openZoneAnalysis = (zone: SpatialZone) => {
    setSelectedZoneName(zone.zone);
  };

  return (
    <div className="min-h-screen bg-[#050912] text-slate-100">
      <div className="mx-auto max-w-[1500px] space-y-7 px-4 py-5 sm:px-6 lg:px-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="rounded-2xl border border-slate-800 bg-[#091221] shadow-2xl">
          <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />

                <h1 className="text-base font-black tracking-widest text-white sm:text-lg">
                  AI INFRASTRUCTURE PLANNER
                </h1>

                <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[8px] font-bold tracking-wider text-emerald-400">
                  AI READY
                </span>
              </div>

              <p className="mt-1 text-[11px] text-slate-500">
                Charging network planning based on demand, grid feasibility
                and existing infrastructure.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

              <span className="text-[9px] font-bold tracking-wider text-emerald-400">
                PLANNING MODEL READY
              </span>
            </div>
          </div>
        </header>

        {/* =====================================================
            NETWORK SNAPSHOT
        ===================================================== */}

        <section>
          <SectionHeader
            icon={<Gauge className="h-4 w-4 text-blue-400" />}
            title="Network Snapshot"
            subtitle="Current charging infrastructure used as the baseline for site planning."
          />

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

            <Metric
              label="Charging Stations"
              value={String(totalStations)}
              icon={
                <BatteryCharging className="h-4 w-4 text-blue-400" />
              }
            />

            <Metric
              label="Total Connectors"
              value={String(totalConnectors)}
              icon={
                <Zap className="h-4 w-4 text-purple-400" />
              }
            />

            <Metric
              label="Available Connectors"
              value={String(availableConnectors)}
              icon={
                <Power className="h-4 w-4 text-emerald-400" />
              }
            />

            <Metric
              label="Offline Stations"
              value={String(offlineStations)}
              icon={
                <CircleAlert className="h-4 w-4 text-red-400" />
              }
            />

          </div>

          <div className="mt-3 rounded-xl border border-slate-800 bg-[#070D18] px-4 py-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                Network utilization
              </span>

              <span className="text-sm font-black text-purple-400">
                {avgUtilization}%
              </span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-purple-400"
                style={{ width: `${avgUtilization}%` }}
              />
            </div>
          </div>
        </section>

        {/* =====================================================
            AI SITE RECOMMENDATIONS
        ===================================================== */}

        <section>
          <SectionHeader
            icon={<Cpu className="h-4 w-4 text-purple-400" />}
            title="AI Site Recommendations"
            subtitle="Best locations for new charging stations based on EV demand, grid capacity and existing charging coverage."
          />

          <div className="mb-4 rounded-xl border border-purple-500/20 bg-purple-500/5 px-4 py-3">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[9px] text-slate-400">
              <span>
                <b className="text-white">Demand</b> — expected charging need
              </span>

              <span>
                <b className="text-white">Grid</b> — available electrical capacity
              </span>

              <span>
                <b className="text-white">Charging Coverage </b> — existing charging availability
              </span>

              <span className="font-bold text-purple-300">
                Suitability = combined site score / 100
              </span>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">

            {topSites.map((site, index) => (
              <div
                key={site.zone}
                className="rounded-2xl border border-slate-800 bg-[#0A1120] p-5 transition hover:border-purple-500/30"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                    Priority Site #{index + 1}
                  </span>

                  <span className="rounded-md border border-purple-500/30 bg-purple-500/10 px-2 py-1 text-[8px] font-bold text-purple-300">
                    {site.status.toUpperCase()}
                  </span>
                </div>

                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-black text-white">
                      {site.zone}
                    </h3>

                    <p className="mt-1 text-[10px] text-slate-500">
                      {site.recommendation}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-2xl font-black text-purple-400">
                      {site.suitabilityScore}
                    </div>

                    <div className="text-[8px] uppercase tracking-widest text-slate-600">
                      suitability / 100
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-lg border border-slate-800 bg-[#070D18] p-3">
                    <div className="text-[8px] uppercase tracking-widest text-slate-600">
                      EV Demand
                    </div>

                    <div className="mt-1 text-sm font-black text-white">
                      {site.demandScore}
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-800 bg-[#070D18] p-3">
                    <div className="text-[8px] uppercase tracking-widest text-slate-600">
                      Grid Load
                    </div>

                    <div className="mt-1 text-sm font-black text-white">
                      {site.gridLoad}%
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => openZoneAnalysis(site)}
                  className="mt-4 flex w-full items-center justify-between rounded-lg border border-slate-800 bg-[#050A13] px-3 py-3 text-[10px] font-black text-slate-300 transition hover:border-purple-500/30 hover:text-white"
                >
                  <span>VIEW SITE ANALYSIS</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}

          </div>
        </section>

        {/* =====================================================
            CHARGING STATIONS
        ===================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#091221]">

          <div className="border-b border-slate-800 p-5">

            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

              <div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-emerald-400" />

                  <h2 className="text-sm font-black uppercase tracking-wider text-white">
                    Charging Stations
                  </h2>
                </div>

                <p className="mt-1 text-[11px] text-slate-500">
                  Existing charging infrastructure available to the planner.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search stations..."
                    className="w-52 rounded-lg border border-slate-800 bg-[#050A13] py-2 pl-9 pr-3 text-[10px] text-white outline-none placeholder:text-slate-600 focus:border-blue-500/40"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as "ALL" | StationStatus,
                    )
                  }
                  className="rounded-lg border border-slate-800 bg-[#050A13] px-3 py-2 text-[10px] font-bold text-slate-400 outline-none"
                >
                  <option value="ALL">All Status</option>
                  <option value="HEALTHY">Healthy</option>
                  <option value="DEGRADED">Degraded</option>
                  <option value="OFFLINE">Offline</option>
                </select>

              </div>
            </div>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead>
                <tr className="border-b border-slate-800 bg-[#070D18]">

                  <th className="px-5 py-3 text-left text-[8px] font-bold uppercase tracking-widest text-slate-600">
                    Station
                  </th>

                  <th className="px-4 py-3 text-left text-[8px] font-bold uppercase tracking-widest text-slate-600">
                    Status
                  </th>

                  <th className="px-4 py-3 text-left text-[8px] font-bold uppercase tracking-widest text-slate-600">
                    Connectors
                  </th>

                  <th className="px-4 py-3 text-left text-[8px] font-bold uppercase tracking-widest text-slate-600">
                    Utilization
                  </th>

                  <th className="px-4 py-3 text-left text-[8px] font-bold uppercase tracking-widest text-slate-600">
                    Power
                  </th>

                  <th className="px-4 py-3 text-left text-[8px] font-bold uppercase tracking-widest text-slate-600">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredStations.map((station) => (

                  <tr
                    key={station.id}
                    onClick={() => setSelectedStationId(station.id)}
                    className="cursor-pointer border-b border-slate-800/70 transition hover:bg-slate-800/20"
                  >

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-[#050A13]">
                          <BatteryCharging className="h-4 w-4 text-blue-400" />
                        </div>

                        <div>
                          <div className="text-[11px] font-bold text-white">
                            {station.name}
                          </div>

                          <div className="mt-0.5 flex items-center gap-1 text-[9px] text-slate-600">
                            <MapPin className="h-2.5 w-2.5" />
                            {station.location}
                            <span className="mx-1">•</span>
                            {station.id}
                          </div>
                        </div>

                      </div>

                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={station.status} />
                    </td>

                    <td className="px-4 py-4">

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-white">
                          {station.available}
                        </span>

                        <span className="text-[9px] text-slate-600">
                          / {station.connectors} available
                        </span>
                      </div>

                      <div className="mt-2 flex gap-0.5">
                        {Array.from({
                          length: station.connectors,
                        }).map((_, index) => (
                          <span
                            key={index}
                            className={`h-1.5 flex-1 rounded-sm ${
                              index < station.offline
                                ? "bg-red-500/70"
                                : index <
                                    station.offline +
                                      station.occupied
                                  ? "bg-blue-400"
                                  : "bg-emerald-400"
                            }`}
                          />
                        ))}
                      </div>

                    </td>

                    <td className="px-4 py-4">

                      <div className="flex items-center gap-2">

                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="h-full rounded-full bg-purple-400"
                            style={{
                              width: `${station.utilization}%`,
                            }}
                          />
                        </div>

                        <span className="text-[10px] font-bold text-slate-300">
                          {station.utilization}%
                        </span>

                      </div>

                    </td>

                    <td className="px-4 py-4">

                      <div className="text-[11px] font-bold text-white">
                        {station.currentPower}{" "}
                        <span className="text-[9px] font-medium text-slate-600">
                          kW
                        </span>
                      </div>

                      <div className="text-[8px] text-slate-600">
                        / {station.maxPower} kW
                      </div>

                    </td>

                    <td className="px-4 py-4">

                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedStationId(station.id);
                        }}
                        className="flex items-center gap-1 rounded-lg border border-slate-800 bg-[#050A13] px-3 py-2 text-[9px] font-bold text-slate-400 transition hover:border-blue-500/30 hover:text-white"
                      >
                        Inspect
                        <ChevronRight className="h-3 w-3" />
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

            {filteredStations.length === 0 && (
              <div className="p-12 text-center">
                <Search className="mx-auto h-6 w-6 text-slate-700" />

                <p className="mt-3 text-xs text-slate-500">
                  No stations match your search.
                </p>
              </div>
            )}

          </div>

          <div className="flex items-center justify-between border-t border-slate-800 px-5 py-3">

            <span className="text-[9px] text-slate-600">
              Showing {filteredStations.length} of {stations.length} stations
            </span>

            <span className="text-[9px] font-mono text-slate-600">
              NETWORK DATA
            </span>

          </div>

        </section>

        {/* =====================================================
            SPATIAL SITE SUITABILITY
        ===================================================== */}

        <section className="rounded-2xl border border-slate-800 bg-[#091221] p-5">

          <div className="flex flex-col gap-4 border-b border-slate-800 pb-5 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <div className="flex items-center gap-2">

                <BarChart3 className="h-4 w-4 text-purple-400" />

                <h2 className="text-sm font-black uppercase tracking-wider text-white">
                  Spatial Site Suitability
                </h2>

                <span className="rounded-md border border-purple-500/20 bg-purple-500/10 px-2 py-1 text-[8px] font-bold text-purple-400">
                  AI ACTIVE
                </span>

              </div>

              <p className="mt-1 text-[11px] text-slate-500">
                Select a zone to see why it is suitable or unsuitable for
                charging infrastructure.
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-[#050A13] px-3 py-2">
              <span className="text-[9px] text-slate-500">
                Score basis:{" "}
              </span>

              <span className="text-[9px] font-bold text-white">
                Demand + Grid + Existing Coverage
              </span>
            </div>

          </div>

          {/* LAYER CONTROLS */}

          <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex gap-2">

              <button
                onClick={() => setActiveLayer("demand")}
                className={`rounded-lg border px-3 py-2 text-[9px] font-bold transition ${
                  activeLayer === "demand"
                    ? "border-purple-500/50 bg-purple-500/10 text-purple-300"
                    : "border-slate-800 bg-[#050A13] text-slate-500 hover:text-white"
                }`}
              >
                EV DEMAND
              </button>

              <button
                onClick={() => setActiveLayer("grid")}
                className={`rounded-lg border px-3 py-2 text-[9px] font-bold transition ${
                  activeLayer === "grid"
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                    : "border-slate-800 bg-[#050A13] text-slate-500 hover:text-white"
                }`}
              >
                GRID LOAD
              </button>

            </div>

            <div className="text-[9px] text-slate-500">
              Click any zone for detailed site analysis
            </div>

          </div>

          {/* MAP */}

          <div className="rounded-2xl border border-slate-800 bg-[#050A13] p-4">

            <div className="relative h-[390px] overflow-hidden rounded-xl border border-slate-800 bg-[#040812]">

              {/* GRID BACKDROP */}

              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(#64748b 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />

              {/* ROADS */}

              <div className="absolute left-[8%] top-[18%] h-px w-[80%] rotate-[12deg] bg-slate-700/50" />
              <div className="absolute left-[5%] top-[62%] h-px w-[90%] rotate-[-8deg] bg-slate-700/50" />
              <div className="absolute left-[35%] top-[5%] h-[90%] w-px rotate-[8deg] bg-slate-700/40" />
              <div className="absolute left-[67%] top-[5%] h-[90%] w-px rotate-[-15deg] bg-slate-700/40" />

              {/* ZONES */}

              {spatialZones.map((zone, index) => {
                const value =
                  activeLayer === "demand"
                    ? zone.demandScore
                    : zone.gridLoad;

                const leftPositions = [
                  "13%",
                  "28%",
                  "48%",
                  "64%",
                  "76%",
                  "38%",
                  "57%",
                ];

                const topPositions = [
                  "22%",
                  "46%",
                  "22%",
                  "65%",
                  "65%",
                  "77%",
                  "44%",
                ];

                const isSelected =
                  selectedZoneName === zone.zone;

                const isCritical = value >= 85;
                const isHigh = value >= 70;

                return (
                  <button
                    key={zone.zone}
                    onClick={() => openZoneAnalysis(zone)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 text-center outline-none"
                    style={{
                      left: leftPositions[index],
                      top: topPositions[index],
                    }}
                  >
                    <div
                      className={`relative flex h-16 w-16 items-center justify-center rounded-full border transition ${
                        isSelected
                          ? "scale-110 border-white bg-white/10"
                          : isCritical
                            ? "border-red-400/60 bg-red-400/10 hover:scale-110"
                            : isHigh
                              ? "border-purple-400/60 bg-purple-400/10 hover:scale-110"
                              : "border-blue-400/50 bg-blue-400/10 hover:scale-110"
                      }`}
                    >
                      <div
                        className={`absolute inset-1 rounded-full border ${
                          isCritical
                            ? "border-red-400/20"
                            : isHigh
                              ? "border-purple-400/20"
                              : "border-blue-400/20"
                        }`}
                      />

                      <div>
                        <div
                          className={`text-sm font-black ${
                            isCritical
                              ? "text-red-400"
                              : isHigh
                                ? "text-purple-400"
                                : "text-blue-400"
                          }`}
                        >
                          {value}
                        </div>

                        <div className="text-[7px] uppercase tracking-widest text-slate-500">
                          {activeLayer === "demand"
                            ? "demand"
                            : "load"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 w-32 -translate-x-1/2 text-center">

                      <div className="text-[10px] font-bold text-slate-200">
                        {zone.zone}
                      </div>

                      <div className="mt-0.5 text-[8px] text-slate-500">
                        Suitability {zone.suitabilityScore}/100
                      </div>

                    </div>
                  </button>
                );
              })}

              {/* LEGEND */}

              <div className="absolute bottom-4 left-4 rounded-lg border border-slate-800 bg-[#050A13]/95 p-3">

                <div className="mb-2 text-[8px] font-bold uppercase tracking-widest text-slate-600">
                  {activeLayer === "demand"
                    ? "EV demand intensity"
                    : "Grid loading"}
                </div>

                <div className="flex items-center gap-3 text-[8px] text-slate-500">

                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-blue-400" />
                    Low
                  </span>

                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-purple-400" />
                    High
                  </span>

                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    Critical
                  </span>

                </div>

              </div>

              {/* MAP LABEL */}

              <div className="absolute right-4 top-4 rounded-lg border border-slate-800 bg-[#050A13]/95 px-3 py-2">

                <div className="flex items-center gap-2">
                  <Navigation className="h-3 w-3 text-purple-400" />

                  <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">
                    Delhi NCR Planning Zones
                  </span>
                </div>

              </div>

            </div>

          </div>

          {/* WHY THE SCORE EXISTS */}

          <div className="mt-4 grid gap-3 md:grid-cols-3">

            <div className="rounded-xl border border-slate-800 bg-[#070D18] p-4">
              <div className="text-[8px] uppercase tracking-widest text-slate-600">
                Demand contribution
              </div>

              <p className="mt-2 text-[10px] leading-5 text-slate-400">
                Higher expected EV charging demand increases the need for
                additional infrastructure.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#070D18] p-4">
              <div className="text-[8px] uppercase tracking-widest text-slate-600">
                Grid contribution
              </div>

              <p className="mt-2 text-[10px] leading-5 text-slate-400">
                Grid loading determines whether additional charging capacity
                can be added directly or needs electrical upgrades first.
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#070D18] p-4">
              <div className="text-[8px] uppercase tracking-widest text-slate-600">
                Existing coverage
              </div>

              <p className="mt-2 text-[10px] leading-5 text-slate-400">
                Existing station capacity prevents the planner from treating
                every high-demand area as a new-build requirement.
              </p>
            </div>

          </div>

        </section>

      </div>

      {/* =======================================================
          SITE ANALYSIS DRAWER
      ======================================================= */}

      {selectedZone && (
        <>
          <button
            aria-label="Close site analysis"
            onClick={() => setSelectedZoneName(null)}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          <aside className="fixed right-0 top-0 z-[110] flex h-screen w-full max-w-[460px] flex-col border-l border-slate-800 bg-[#07111f] shadow-2xl shadow-black/50">

            <div className="shrink-0 border-b border-slate-800 px-5 py-5">

              <div className="flex items-start justify-between gap-4">

                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-purple-400" />

                    <span className="text-[9px] font-bold uppercase tracking-widest text-purple-400">
                      Site Analysis
                    </span>
                  </div>

                  <h2 className="mt-2 text-xl font-black text-white">
                    {selectedZone.zone}
                  </h2>

                  <p className="mt-1 text-[10px] text-slate-500">
                    AI assessment for charging infrastructure suitability.
                  </p>
                </div>

                <button
                  onClick={() => setSelectedZoneName(null)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-[#050D19] text-slate-500 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>

              </div>

            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">

              {/* SCORE */}

              <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5">

                <div className="flex items-end justify-between">

                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                      Site Suitability Score
                    </div>

                    <p className="mt-1 text-[9px] text-slate-600">
                      Combined planning indicator
                    </p>
                  </div>

                  <div className="text-4xl font-black text-purple-400">
                    {selectedZone.suitabilityScore}
                    <span className="text-sm text-slate-600">
                      /100
                    </span>
                  </div>

                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-purple-400"
                    style={{
                      width: `${selectedZone.suitabilityScore}%`,
                    }}
                  />
                </div>

              </div>

              {/* SCORE INPUTS */}

              <div className="mt-5">

                <div className="mb-3 text-[10px] font-black uppercase tracking-wider text-white">
                  Score Inputs
                </div>

                <div className="space-y-2">

                  <div className="rounded-xl border border-slate-800 bg-[#050D19] p-4">

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">
                        EV Demand
                      </span>

                      <span className="text-sm font-black text-white">
                        {selectedZone.demandScore}/100
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-purple-400"
                        style={{
                          width: `${selectedZone.demandScore}%`,
                        }}
                      />
                    </div>

                  </div>

                  <div className="rounded-xl border border-slate-800 bg-[#050D19] p-4">

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">
                        Grid Load
                      </span>

                      <span className="text-sm font-black text-white">
                        {selectedZone.gridLoad}%
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-amber-400"
                        style={{
                          width: `${selectedZone.gridLoad}%`,
                        }}
                      />
                    </div>

                  </div>

                </div>

              </div>

              {/* INTERPRETATION */}

              <div className="mt-5">

                <div className="mb-3 text-[10px] font-black uppercase tracking-wider text-white">
                  Planning Interpretation
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#050D19] p-4">

                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />

                    <span className="text-sm font-black text-white">
                      {selectedZone.recommendation}
                    </span>
                  </div>

                  <p className="mt-3 text-[11px] leading-6 text-slate-400">
                    {selectedZone.reason}
                  </p>

                </div>

              </div>

              {/* SCORE EXPLANATION */}

              <div className="mt-5 rounded-xl border border-slate-800 bg-[#050D19] p-4">

                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
                  What does the score mean?
                </div>

                <p className="mt-2 text-[10px] leading-5 text-slate-400">
                  The score is a planning suitability indicator, not a
                  financial return. A higher score means the location has a
                  stronger combination of charging demand, infrastructure
                  need and ability to support additional capacity.
                </p>

              </div>

            </div>

          </aside>
        </>
      )}

      {/* =======================================================
          STATION INSPECTOR
      ======================================================= */}

      {selectedStation && (
        <>
          <button
            aria-label="Close station inspector"
            onClick={() => setSelectedStationId(null)}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />

          <aside className="fixed right-0 top-0 z-[110] flex h-screen w-full max-w-[420px] flex-col border-l border-slate-800 bg-[#07111f] shadow-2xl shadow-black/50">

            {/* HEADER */}

            <div className="shrink-0 border-b border-slate-800 px-5 py-4">

              <div className="flex items-start justify-between gap-4">

                <div className="min-w-0">

                  <div className="flex items-center gap-2">

                    <StatusDot status={selectedStation.status} />

                    <span
                      className={`text-[9px] font-bold ${
                        selectedStation.status === "HEALTHY"
                          ? "text-emerald-400"
                          : selectedStation.status === "DEGRADED"
                            ? "text-amber-400"
                            : "text-red-400"
                      }`}
                    >
                      {selectedStation.status}
                    </span>

                  </div>

                  <h2 className="mt-2 text-base font-black text-white">
                    {selectedStation.name}
                  </h2>

                  <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                    <MapPin className="h-3 w-3" />
                    {selectedStation.location}
                  </div>

                </div>

                <button
                  onClick={() => setSelectedStationId(null)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-800 bg-[#050D19] text-slate-500 transition hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>

              </div>

              <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-800 bg-[#050D19] px-3 py-2">

                <span className="text-[8px] uppercase tracking-widest text-slate-600">
                  Station ID
                </span>

                <span className="font-mono text-[10px] font-bold text-slate-300">
                  {selectedStation.id}
                </span>

              </div>

            </div>

            {/* CONTENT */}

            <div className="min-h-0 flex-1 overflow-y-auto p-4">

              {/* PERFORMANCE HEADER */}

              <div className="mb-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">

                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-400" />

                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-white">
                      Station Performance
                    </div>

                    <div className="mt-1 text-[9px] text-slate-500">
                      Current operational performance for this station.
                    </div>
                  </div>
                </div>

              </div>

              {/* CONNECTORS */}

              <div className="mb-5">

                <div className="mb-3 flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-blue-400" />

                  <span className="text-[10px] font-black uppercase tracking-wider text-white">
                    Connectors
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">

                  <div className="rounded-xl border border-slate-800 bg-[#050D19] p-3">
                    <div className="text-[8px] text-slate-600">
                      AVAILABLE
                    </div>

                    <div className="mt-1 text-lg font-black text-emerald-400">
                      {selectedStation.available}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-[#050D19] p-3">
                    <div className="text-[8px] text-slate-600">
                      OCCUPIED
                    </div>

                    <div className="mt-1 text-lg font-black text-blue-400">
                      {selectedStation.occupied}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-800 bg-[#050D19] p-3">
                    <div className="text-[8px] text-slate-600">
                      OFFLINE
                    </div>

                    <div className="mt-1 text-lg font-black text-red-400">
                      {selectedStation.offline}
                    </div>
                  </div>

                </div>

              </div>

              {/* UTILIZATION */}

              <div className="mb-5">

                <div className="mb-3 flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-emerald-400" />

                  <span className="text-[10px] font-black uppercase tracking-wider text-white">
                    Utilization
                  </span>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#050D19] p-4">

                  <div className="flex items-end justify-between">

                    <span className="text-[10px] text-slate-500">
                      Current station utilization
                    </span>

                    <span className="text-xl font-black text-emerald-400">
                      {selectedStation.utilization}%
                    </span>

                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">

                    <div
                      className="h-full rounded-full bg-emerald-400"
                      style={{
                        width: `${selectedStation.utilization}%`,
                      }}
                    />

                  </div>

                </div>

              </div>

              {/* POWER */}

              <div className="mb-5">

                <div className="mb-3 flex items-center gap-2">
                  <Power className="h-4 w-4 text-blue-400" />

                  <span className="text-[10px] font-black uppercase tracking-wider text-white">
                    Power
                  </span>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#050D19] p-4">

                  <div className="flex items-center justify-between">

                    <div>
                      <div className="text-[8px] uppercase tracking-widest text-slate-600">
                        Current draw
                      </div>

                      <div className="mt-1 text-lg font-black text-white">
                        {selectedStation.currentPower}
                        <span className="ml-1 text-xs text-slate-500">
                          kW
                        </span>
                      </div>
                    </div>

                    <div className="text-right">

                      <div className="text-[8px] uppercase tracking-widest text-slate-600">
                        Capacity
                      </div>

                      <div className="mt-1 text-sm font-bold text-slate-300">
                        {selectedStation.maxPower} kW
                      </div>

                    </div>

                  </div>

                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">

                    <div
                      className="h-full rounded-full bg-blue-400"
                      style={{
                        width: `${Math.min(
                          100,
                          (selectedStation.currentPower /
                            selectedStation.maxPower) *
                            100,
                        )}%`,
                      }}
                    />

                  </div>

                </div>

              </div>

              {/* HEALTH */}

              <div className="mb-5">

                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />

                  <span className="text-[10px] font-black uppercase tracking-wider text-white">
                    Connector Health
                  </span>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#050D19] p-4">

                  <div className="flex items-center justify-between">

                    <span className="text-[10px] text-slate-500">
                      Operational connectors
                    </span>

                    <span className="text-sm font-black text-emerald-400">
                      {selectedStation.connectors -
                        selectedStation.offline}{" "}
                      / {selectedStation.connectors}
                    </span>

                  </div>

                  <div className="mt-3 flex gap-1">

                    {Array.from({
                      length: selectedStation.connectors,
                    }).map((_, index) => {

                      const offline =
                        index >=
                        selectedStation.connectors -
                          selectedStation.offline;

                      return (
                        <span
                          key={index}
                          className={`h-2 flex-1 rounded-sm ${
                            offline
                              ? "bg-red-500/70"
                              : "bg-emerald-400"
                          }`}
                        />
                      );
                    })}

                  </div>

                </div>

              </div>

              {/* EVENTS */}

              <div>

                <div className="mb-3 flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-amber-400" />

                  <span className="text-[10px] font-black uppercase tracking-wider text-white">
                    Recent Events
                  </span>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#050D19]">

                  <div className="flex gap-3 border-b border-slate-800 p-3">

                    <span className="font-mono text-[9px] text-slate-600">
                      {selectedStation.lastEventTime}
                    </span>

                    <span className="text-[10px] text-slate-400">
                      {selectedStation.lastEvent}
                    </span>

                  </div>

                  <div className="flex gap-3 border-b border-slate-800 p-3">

                    <span className="font-mono text-[9px] text-slate-600">
                      14:28
                    </span>

                    <span className="text-[10px] text-slate-400">
                      Charging session completed
                    </span>

                  </div>

                  <div className="flex gap-3 p-3">

                    <span className="font-mono text-[9px] text-slate-600">
                      14:02
                    </span>

                    <span className="text-[10px] text-slate-400">
                      Telemetry heartbeat received
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {/* FOOTER */}

            <div className="shrink-0 border-t border-slate-800 bg-[#06101C] p-4">

              <button
                onClick={() => setSelectedStationId(null)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-[#050D19] px-4 py-3 text-[10px] font-black text-slate-400 transition hover:text-white"
              >
                CLOSE PERFORMANCE VIEW
              </button>

            </div>

          </aside>
        </>
      )}

    </div>
  );
}