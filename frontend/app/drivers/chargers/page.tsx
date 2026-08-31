"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  ArrowLeft,
  BatteryCharging,
  CheckCircle2,
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

type Station = {
  id: string;
  name: string;
  location: string;
  type: string;
  available: number;
  total: number;
  distance: string;
  status: "Available" | "Limited";
};

/* =========================================================
    PAGE
========================================================= */

export default function ChargersPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [search, setSearch] = useState("");
  const [chargerType, setChargerType] = useState<string>("ALL");
  const [maxDistance, setMaxDistance] = useState<string>("ALL");
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          api.get(`/stations/?latitude=${lat}&longitude=${lon}`)
            .then((res: any) => setStations(res.data))
            .catch((err: any) => console.error("Failed to fetch stations", err));
        },
        (error) => {
          console.warn("Geolocation permission denied or error. Using default location.", error);
          fetchDefaultStations();
        }
      );
    } else {
      fetchDefaultStations();
    }
  }, []);

  const fetchDefaultStations = () => {
    api.get("/stations/")
      .then((res: any) => setStations(res.data))
      .catch((err: any) => console.error("Failed to fetch stations", err));
  };

  const availableChargerTypes = useMemo(() => {
    const types = stations.map((s) => s.type);
    return Array.from(new Set(types));
  }, [stations]);

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

      let matchesDistance = true;
      if (maxDistance !== "ALL") {
        const distNum = parseFloat(station.distance);
        const maxNum = parseFloat(maxDistance);
        if (!isNaN(distNum) && !isNaN(maxNum)) {
          matchesDistance = distNum <= maxNum;
        }
      }

      return (
        matchesSearch &&
        matchesType &&
        matchesDistance
      );
    });
  }, [stations, search, chargerType, maxDistance]);

  const selectedStation = stations.find(
    (station) =>
      station.id === selectedStationId,
  );

  function clearFilters() {
    setSearch("");
    setChargerType("ALL");
    setMaxDistance("ALL");
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <section className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-bold uppercase tracking-[0.2em] text-emerald-400">
            Charging
          </div>

          <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Charging Stations
          </h1>

          <p className="mt-1 max-w-xl text-sm leading-relaxed text-slate-300">
            Find charging stations by location, charger type and distance.
          </p>
        </div>

        <Link
          href="/drivers"
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-700 bg-[#050A13] px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </section>

      {/* SEARCH / FILTERS */}
      <section className="rounded-2xl border border-slate-700 bg-[#07101d] p-4 sm:p-5 shadow-lg">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
          <span className="text-sm font-bold uppercase tracking-widest text-slate-300">
            Find a station
          </span>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search station or location..."
              className="h-12 w-full rounded-xl border border-slate-700 bg-[#050A13] pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-400 focus:border-emerald-400"
            />
          </div>

          <select
            value={chargerType}
            onChange={(event) => setChargerType(event.target.value)}
            className="h-12 rounded-xl border border-slate-700 bg-[#050A13] px-4 text-sm font-bold text-slate-200 outline-none"
          >
            <option value="ALL">All charger types</option>
            {availableChargerTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <select
            value={maxDistance}
            onChange={(event) => setMaxDistance(event.target.value)}
            className="h-12 rounded-xl border border-slate-700 bg-[#050A13] px-4 text-sm font-bold text-slate-200 outline-none"
          >
            <option value="ALL">All distances</option>
            <option value="2">Within 2 km</option>
            <option value="5">Within 5 km</option>
            <option value="10">Within 10 km</option>
            <option value="20">Within 20 km</option>
          </select>

          {(search || chargerType !== "ALL" || maxDistance !== "ALL") && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex h-12 items-center justify-center gap-1.5 rounded-xl border border-slate-700 px-4 text-sm font-bold text-slate-300 transition hover:text-white hover:bg-slate-800"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>
      </section>

      {/* RESULT HEADER */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-white">Available stations</h2>
          <p className="mt-1 text-sm text-slate-300">
            {filteredStations.length} station{filteredStations.length === 1 ? "" : "s"} found
          </p>
        </div>

        <div className="hidden items-center gap-2 text-sm text-slate-300 sm:flex">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          Connector availability
        </div>
      </div>

      {/* STATION GRID */}
      {filteredStations.length > 0 ? (
        <section className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filteredStations.map((station) => (
            <StationCard
              key={station.id}
              station={station}
              onSelect={() => setSelectedStationId(station.id)}
            />
          ))}
        </section>
      ) : (
        <section className="rounded-2xl border border-slate-700 bg-[#07101d] px-6 py-14 text-center">
          <Search className="mx-auto h-8 w-8 text-slate-400" />
          <h3 className="mt-4 text-base font-black text-white">No stations found</h3>
          <p className="mt-2 text-sm text-slate-300">
            Try a different station name, location or filter.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-5 rounded-lg border border-slate-700 px-4 py-2 text-sm font-bold text-slate-300 hover:text-white"
          >
            Clear filters
          </button>
        </section>
      )}

      {/* STATION DETAIL DRAWER */}
      {selectedStation && (
        <>
          <button
            type="button"
            aria-label="Close station details"
            onClick={() => setSelectedStationId(null)}
            className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm lg:hidden"
          />

          <aside className="fixed bottom-0 right-0 top-0 z-[90] flex w-full max-w-[440px] flex-col border-l border-slate-700 bg-[#07101d] shadow-2xl shadow-black/50">
            <div className="shrink-0 border-b border-slate-700 px-5 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                      {selectedStation.status}
                    </span>
                  </div>

                  <h2 className="mt-2 text-xl font-black text-white">
                    {selectedStation.name}
                  </h2>

                  <div className="mt-1.5 flex items-start gap-1.5 text-sm leading-relaxed text-slate-300">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    {selectedStation.location}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStationId(null)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-3">
                <DetailBox
                  label="Charger type"
                  value={selectedStation.type}
                  icon={<Zap className="h-4 w-4 text-blue-400" />}
                />

                <DetailBox
                  label="Distance"
                  value={selectedStation.distance}
                  icon={<MapPin className="h-4 w-4 text-emerald-400" />}
                />

                <DetailBox
                  label="Available"
                  value={`${selectedStation.available}`}
                  icon={<BatteryCharging className="h-4 w-4 text-emerald-400" />}
                />

                <DetailBox
                  label="Total"
                  value={`${selectedStation.total}`}
                  icon={<BatteryCharging className="h-4 w-4 text-slate-400" />}
                />
              </div>

              <div className="mt-5 rounded-xl border border-slate-700 bg-[#050A13] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Connector availability
                    </div>
                    <div className="mt-1 text-base font-black text-white">
                      {selectedStation.available} of {selectedStation.total} available
                    </div>
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                </div>

                <div className="mt-4 flex gap-1.5">
                  {Array.from({ length: selectedStation.total }).map((_, index) => {
                    const available = index < selectedStation.available;
                    return (
                      <span
                        key={index}
                        className={`h-3 flex-1 rounded-sm ${
                          available ? "bg-emerald-400" : "bg-slate-700"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">
                  Station information
                </div>

                <div className="rounded-xl border border-slate-700 bg-[#050A13] divide-y divide-slate-700">
                  <InfoRow label="Station ID" value={selectedStation.id} />
                  <InfoRow label="Location" value={selectedStation.location} />
                  <InfoRow label="Charger" value={selectedStation.type} />
                  <InfoRow label="Availability" value={`${selectedStation.available} available`} />
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-slate-700 bg-[#06101c] p-4">
              <div className="rounded-xl border border-slate-700 bg-[#050A13] p-3.5 text-xs leading-relaxed text-slate-300">
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
    (station.available / station.total) * 100,
  );

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group rounded-2xl border border-slate-700 bg-[#07101d] p-5 text-left transition hover:border-emerald-400 hover:bg-[#08121f] shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-400/15">
            <BatteryCharging className="h-6 w-6 text-emerald-400" />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-base font-black text-white">
              {station.name}
            </h3>

            <div className="mt-1 flex items-start gap-1.5 text-xs leading-relaxed text-slate-300">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
              <span className="line-clamp-2">{station.location}</span>
            </div>
          </div>
        </div>

        <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-400" />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2.5">
        <SmallValue label="Type" value={station.type} />
        <SmallValue label="Available" value={`${station.available}/${station.total}`} />
        <SmallValue label="Distance" value={station.distance} />
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
            Availability
          </span>
          <span className="text-xs font-bold text-emerald-400">
            {station.status}
          </span>
        </div>

        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-700">
          <div
            className="h-full rounded-full bg-emerald-400 transition-all duration-500"
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
    <div className="rounded-xl border border-slate-700 bg-[#050A13] p-3">
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </div>
      <div className="mt-1.5 truncate text-sm font-black text-slate-100">
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
    <div className="rounded-xl border border-slate-700 bg-[#050A13] p-4">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          {label}
        </span>
      </div>
      <div className="mt-2 text-base font-black text-white">{value}</div>
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
    <div className="flex items-start justify-between gap-5 px-4 py-3.5">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-bold text-slate-100">
        {value}
      </span>
    </div>
  );
}