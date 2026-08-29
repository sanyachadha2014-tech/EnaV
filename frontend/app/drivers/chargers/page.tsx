"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BatteryCharging,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  MapPin,
  Search,
  SlidersHorizontal,
  X,
  Zap,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type ChargerType = "DC Fast" | "Ultra Fast" | "AC + DC";

type Station = {
  id: string;
  name: string;
  location: string;
  type: ChargerType;
  available: number;
  total: number;
  distance: string;
  status: "Available" | "Limited";
};

/* =========================================================
   DATA
========================================================= */

const stations: Station[] = [
  {
    id: "CS-DEL-01",
    name: "Janakpuri Mobility Hub",
    location: "Janakpuri Sector 7, New Delhi",
    type: "DC Fast",
    available: 4,
    total: 8,
    distance: "2.4 km",
    status: "Available",
  },
  {
    id: "CS-DEL-02",
    name: "Dwarka Sector 14",
    location: "Dwarka Sector 14, New Delhi",
    type: "Ultra Fast",
    available: 3,
    total: 10,
    distance: "6.8 km",
    status: "Available",
  },
  {
    id: "CS-DEL-03",
    name: "Connaught Place Central",
    location: "Connaught Place, New Delhi",
    type: "DC Fast",
    available: 2,
    total: 12,
    distance: "10.2 km",
    status: "Available",
  },
  {
    id: "CS-DEL-04",
    name: "Okhla Mobility Point",
    location: "Okhla Phase III, New Delhi",
    type: "AC + DC",
    available: 1,
    total: 8,
    distance: "11.6 km",
    status: "Limited",
  },
  {
    id: "CS-DEL-05",
    name: "Rohini Sector 9",
    location: "Rohini Sector 9, New Delhi",
    type: "DC Fast",
    available: 5,
    total: 10,
    distance: "15.4 km",
    status: "Available",
  },
  {
    id: "CS-DEL-06",
    name: "RK Puram South",
    location: "RK Puram, New Delhi",
    type: "AC + DC",
    available: 3,
    total: 8,
    distance: "16.1 km",
    status: "Available",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function ChargersPage() {
  const [search, setSearch] = useState("");
  const [chargerType, setChargerType] =
    useState<"ALL" | ChargerType>("ALL");

  const [availability, setAvailability] =
    useState<"ALL" | "AVAILABLE" | "LIMITED">("ALL");

  const [selectedStationId, setSelectedStationId] =
    useState<string | null>(null);

  const filteredStations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return stations.filter((station) => {
      const matchesSearch =
        !query ||
        station.name.toLowerCase().includes(query) ||
        station.location.toLowerCase().includes(query) ||
        station.type.toLowerCase().includes(query);

      const matchesType =
        chargerType === "ALL" ||
        station.type === chargerType;

      const matchesAvailability =
        availability === "ALL" ||
        (availability === "AVAILABLE" &&
          station.available > 0) ||
        (availability === "LIMITED" &&
          station.available === 1);

      return (
        matchesSearch &&
        matchesType &&
        matchesAvailability
      );
    });
  }, [search, chargerType, availability]);

  const selectedStation = stations.find(
    (station) =>
      station.id === selectedStationId,
  );

  function clearFilters() {
    setSearch("");
    setChargerType("ALL");
    setAvailability("ALL");
  }

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400">
            Charging
          </div>

          <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Charging Stations
          </h1>

          <p className="mt-1 max-w-xl text-[10px] leading-5 text-slate-500">
            Find charging stations by location, charger type and current connector availability.
          </p>
        </div>

        <Link
          href="/drivers"
          className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-800 bg-[#050A13] px-3 py-2 text-[8px] font-bold text-slate-500 transition hover:text-white"
        >
          <ArrowLeft className="h-3 w-3" />
          Back
        </Link>
      </section>

      {/* =====================================================
          SEARCH / FILTERS
      ===================================================== */}

      <section className="rounded-2xl border border-slate-800 bg-[#07101d] p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-500" />

          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
            Find a station
          </span>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
          {/* Search */}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search station or location..."
              className="h-11 w-full rounded-xl border border-slate-800 bg-[#050A13] pl-10 pr-4 text-[10px] text-white outline-none placeholder:text-slate-700 focus:border-emerald-400/30"
            />
          </div>

          {/* Charger type */}

          <select
            value={chargerType}
            onChange={(event) =>
              setChargerType(
                event.target.value as
                  | "ALL"
                  | ChargerType,
              )
            }
            className="h-11 rounded-xl border border-slate-800 bg-[#050A13] px-3 text-[9px] font-bold text-slate-400 outline-none"
          >
            <option value="ALL">
              All charger types
            </option>
            <option value="DC Fast">
              DC Fast
            </option>
            <option value="Ultra Fast">
              Ultra Fast
            </option>
            <option value="AC + DC">
              AC + DC
            </option>
          </select>

          {/* Availability */}

          <select
            value={availability}
            onChange={(event) =>
              setAvailability(
                event.target.value as
                  | "ALL"
                  | "AVAILABLE"
                  | "LIMITED",
              )
            }
            className="h-11 rounded-xl border border-slate-800 bg-[#050A13] px-3 text-[9px] font-bold text-slate-400 outline-none"
          >
            <option value="ALL">
              All availability
            </option>
            <option value="AVAILABLE">
              Available
            </option>
            <option value="LIMITED">
              Limited
            </option>
          </select>

          {/* Clear */}

          {(search ||
            chargerType !== "ALL" ||
            availability !== "ALL") && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-800 px-4 text-[9px] font-bold text-slate-500 transition hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </button>
          )}
        </div>
      </section>

      {/* =====================================================
          RESULT HEADER
      ===================================================== */}

      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-sm font-black text-white">
            Available stations
          </h2>

          <p className="mt-1 text-[9px] text-slate-600">
            {filteredStations.length} station
            {filteredStations.length === 1 ? "" : "s"} found
          </p>
        </div>

        <div className="hidden items-center gap-2 text-[8px] text-slate-600 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Connector availability
        </div>
      </div>

      {/* =====================================================
          STATION GRID
      ===================================================== */}

      {filteredStations.length > 0 ? (
        <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filteredStations.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              onSelect={() =>
                setSelectedStationId(
                  station.id,
                )
              }
            />
          ))}
        </section>
      ) : (
        <section className="rounded-2xl border border-slate-800 bg-[#07101d] px-6 py-14 text-center">
          <Search className="mx-auto h-6 w-6 text-slate-700" />

          <h3 className="mt-4 text-sm font-black text-white">
            No stations found
          </h3>

          <p className="mt-2 text-[9px] text-slate-600">
            Try a different station name, location or filter.
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="mt-5 rounded-lg border border-slate-800 px-4 py-2 text-[9px] font-bold text-slate-500 hover:text-white"
          >
            Clear filters
          </button>
        </section>
      )}

      {/* =====================================================
          STATION DETAIL DRAWER
      ===================================================== */}

      {selectedStation && (
        <>
          {/* Mobile backdrop */}

          <button
            type="button"
            aria-label="Close station details"
            onClick={() =>
              setSelectedStationId(null)
            }
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm lg:hidden"
          />

          <aside className="fixed bottom-0 right-0 top-0 z-[90] flex w-full max-w-[440px] flex-col border-l border-slate-800 bg-[#07101d] shadow-2xl shadow-black/50">
            {/* Header */}

            <div className="shrink-0 border-b border-slate-800 px-5 py-5">

              <div className="flex items-start justify-between gap-4">

                <div className="min-w-0">

                  <div className="flex items-center gap-2">

                    <span
                      className={`h-2 w-2 rounded-full ${
                        selectedStation.available > 0
                          ? "bg-emerald-400"
                          : "bg-red-400"
                      }`}
                    />

                    <span className="text-[8px] font-bold uppercase tracking-widest text-slate-600">
                      {selectedStation.status}
                    </span>

                  </div>

                  <h2 className="mt-2 text-lg font-black text-white">
                    {selectedStation.name}
                  </h2>

                  <div className="mt-1 flex items-start gap-1.5 text-[9px] leading-4 text-slate-500">

                    <MapPin className="mt-0.5 h-3 w-3 shrink-0" />

                    {selectedStation.location}

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedStationId(null)
                  }
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-800 text-slate-500 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>

              </div>

            </div>

            {/* Content */}

            <div className="min-h-0 flex-1 overflow-y-auto p-5">

              <div className="grid grid-cols-2 gap-3">

                <DetailBox
                  label="Charger type"
                  value={selectedStation.type}
                  icon={
                    <Zap className="h-3.5 w-3.5 text-blue-400" />
                  }
                />

                <DetailBox
                  label="Distance"
                  value={selectedStation.distance}
                  icon={
                    <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                  }
                />

                <DetailBox
                  label="Available"
                  value={`${selectedStation.available}`}
                  icon={
                    <BatteryCharging className="h-3.5 w-3.5 text-emerald-400" />
                  }
                />

                <DetailBox
                  label="Total"
                  value={`${selectedStation.total}`}
                  icon={
                    <BatteryCharging className="h-3.5 w-3.5 text-slate-500" />
                  }
                />

              </div>

              {/* Connector view */}

              <div className="mt-5 rounded-xl border border-slate-800 bg-[#050A13] p-4">

                <div className="flex items-center justify-between">

                  <div>
                    <div className="text-[8px] font-bold uppercase tracking-widest text-slate-600">
                      Connector availability
                    </div>

                    <div className="mt-1 text-[11px] font-black text-white">
                      {selectedStation.available} of{" "}
                      {selectedStation.total} available
                    </div>
                  </div>

                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />

                </div>

                <div className="mt-4 flex gap-1">

                  {Array.from({
                    length: selectedStation.total,
                  }).map((_, index) => {
                    const available =
                      index <
                      selectedStation.available;

                    return (
                      <span
                        key={index}
                        className={`h-2 flex-1 rounded-sm ${
                          available
                            ? "bg-emerald-400"
                            : "bg-slate-800"
                        }`}
                      />
                    );
                  })}

                </div>

              </div>

              {/* Station info */}

              <div className="mt-5">

                <div className="mb-3 text-[8px] font-bold uppercase tracking-widest text-slate-600">
                  Station information
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#050A13] divide-y divide-slate-800/80">

                  <InfoRow
                    label="Station ID"
                    value={selectedStation.id}
                  />

                  <InfoRow
                    label="Location"
                    value={selectedStation.location}
                  />

                  <InfoRow
                    label="Charger"
                    value={selectedStation.type}
                  />

                  <InfoRow
                    label="Availability"
                    value={`${selectedStation.available} available`}
                  />

                </div>

              </div>

            </div>

            {/* Footer */}

            <div className="shrink-0 border-t border-slate-800 bg-[#06101c] p-4">

              <div className="rounded-xl border border-slate-800 bg-[#050A13] p-3 text-[8px] leading-4 text-slate-600">
                This station view shows the charging data currently available to EnaV. Vehicle battery and charging-session controls are not connected.
              </div>

            </div>
          </aside>
        </>
      )}

    </div>
  );
}

/* =========================================================
   STATION CARD
========================================================= */

function StationCard({
  station,
  onSelect,
}: {
  station: Station;
  onSelect: () => void;
}) {
  const availablePercent = Math.round(
    (station.available / station.total) *
      100,
  );

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group rounded-2xl border border-slate-800 bg-[#07101d] p-5 text-left transition hover:border-emerald-400/25 hover:bg-[#08121f]"
    >
      <div className="flex items-start justify-between gap-4">

        <div className="flex min-w-0 items-start gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10">
            <BatteryCharging className="h-5 w-5 text-emerald-400" />
          </div>

          <div className="min-w-0">

            <h3 className="truncate text-xs font-black text-white">
              {station.name}
            </h3>

            <div className="mt-1 flex items-start gap-1 text-[8px] leading-4 text-slate-600">
              <MapPin className="mt-0.5 h-2.5 w-2.5 shrink-0" />

              <span className="line-clamp-2">
                {station.location}
              </span>
            </div>

          </div>

        </div>

        <ChevronRight className="h-4 w-4 shrink-0 text-slate-700 transition group-hover:translate-x-0.5 group-hover:text-emerald-400" />

      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">

        <SmallValue
          label="Type"
          value={station.type}
        />

        <SmallValue
          label="Available"
          value={`${station.available}/${station.total}`}
        />

        <SmallValue
          label="Distance"
          value={station.distance}
        />

      </div>

      <div className="mt-4">

        <div className="flex items-center justify-between">

          <span className="text-[7px] font-bold uppercase tracking-widest text-slate-700">
            Availability
          </span>

          <span
            className={`text-[8px] font-bold ${
              station.available === 1
                ? "text-amber-400"
                : "text-emerald-400"
            }`}
          >
            {station.status}
          </span>

        </div>

        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">

          <div
            className={`h-full rounded-full ${
              station.available === 1
                ? "bg-amber-400"
                : "bg-emerald-400"
            }`}
            style={{
              width: `${availablePercent}%`,
            }}
          />

        </div>

      </div>

    </button>
  );
}

/* =========================================================
   SMALL VALUE
========================================================= */

function SmallValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-[#050A13] p-2.5">

      <div className="text-[6px] font-bold uppercase tracking-widest text-slate-700">
        {label}
      </div>

      <div className="mt-1.5 truncate text-[9px] font-black text-slate-300">
        {value}
      </div>

    </div>
  );
}

/* =========================================================
   DETAIL BOX
========================================================= */

function DetailBox({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#050A13] p-4">

      <div className="flex items-center gap-2">

        {icon}

        <span className="text-[7px] font-bold uppercase tracking-widest text-slate-600">
          {label}
        </span>

      </div>

      <div className="mt-2 text-[10px] font-black text-white">
        {value}
      </div>

    </div>
  );
}

/* =========================================================
   INFO ROW
========================================================= */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-5 px-4 py-3">

      <span className="text-[8px] text-slate-600">
        {label}
      </span>

      <span className="max-w-[60%] text-right text-[9px] font-bold text-slate-300">
        {value}
      </span>

    </div>
  );
}