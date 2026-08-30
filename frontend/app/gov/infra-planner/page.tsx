"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BatteryCharging,
  Building2,
  ChevronRight,
  Info,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
  Zap,
} from "lucide-react";

type Station = {
  id: string;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  connectorTypes: string[];
  connectors: number;
  healthyConnectors: number;
  defectedConnectors: number;
};

const stations: Station[] = [
  {
    id: "CS-DEL-01",
    name: "Connaught Place Central",
    location: "CP Central",
    latitude: 28.6315,
    longitude: 77.2167,
    connectorTypes: ["CCS (Type 2)", "CHAdeMO"],
    connectors: 12,
    healthyConnectors: 12,
    defectedConnectors: 0,
  },
  {
    id: "CS-DEL-02",
    name: "Janakpuri Ward 7",
    location: "Janakpuri W7",
    latitude: 28.6219,
    longitude: 77.0878,
    connectorTypes: ["CCS (Type 2)", "Type 2"],
    connectors: 10,
    healthyConnectors: 9,
    defectedConnectors: 1,
  },
  {
    id: "CS-DEL-03",
    name: "Okhla Industrial Phase III",
    location: "Okhla Ph-III",
    latitude: 28.5355,
    longitude: 77.2733,
    connectorTypes: ["CCS (Type 2)"],
    connectors: 8,
    healthyConnectors: 8,
    defectedConnectors: 0,
  },
  {
    id: "CS-DEL-04",
    name: "Dwarka Sector 14",
    location: "Sec-14 Dwarka",
    latitude: 28.6028,
    longitude: 77.0322,
    connectorTypes: ["CCS (Type 2)", "CHAdeMO"],
    connectors: 16,
    healthyConnectors: 16,
    defectedConnectors: 0,
  },
  {
    id: "CS-DEL-05",
    name: "Rohini Sector 9",
    location: "Rohini Sec-9",
    latitude: 28.716,
    longitude: 77.116,
    connectorTypes: ["Type 2", "CCS (Type 2)"],
    connectors: 10,
    healthyConnectors: 10,
    defectedConnectors: 0,
  },
  {
    id: "CS-DEL-06",
    name: "RK Puram South",
    location: "RK Puram S4",
    latitude: 28.5631,
    longitude: 77.1773,
    connectorTypes: ["Type 2", "CCS (Type 2)"],
    connectors: 8,
    healthyConnectors: 8,
    defectedConnectors: 0,
  },
  {
    id: "CS-DEL-07",
    name: "Vasant Kunj Hub",
    location: "Vasant Kunj",
    latitude: 28.5423,
    longitude: 77.1547,
    connectorTypes: ["CCS (Type 2)", "Type 2"],
    connectors: 8,
    healthyConnectors: 7,
    defectedConnectors: 1,
  },
  {
    id: "CS-DEL-08",
    name: "Dwarka Transit Hub",
    location: "Dwarka Sector 10",
    latitude: 28.5921,
    longitude: 77.056,
    connectorTypes: ["CCS (Type 2)"],
    connectors: 6,
    healthyConnectors: 6,
    defectedConnectors: 0,
  },
];

function InfoButton({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label="Information"
        onClick={(event) => {
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-500 text-emerald-700 transition hover:border-emerald-600 hover:text-emerald-800"
      >
        <Info className="h-3 w-3" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close information"
            onClick={(event) => {
              event.stopPropagation();
              setOpen(false);
            }}
            className="fixed inset-0 z-30 cursor-default"
          />
          <div className="absolute left-7 top-0 z-40 w-72 rounded-lg border border-emerald-500 bg-white p-3 text-left text-xs leading-5 text-slate-900 shadow-xl">
            {text}
          </div>
        </>
      )}
    </span>
  );
}

function Metric({
  label,
  value,
  icon,
  info,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  info: string;
}) {
  return (
    <div className="rounded-xl border border-emerald-500 bg-[#f0fdf4] p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-950">
            {label}
          </span>
          <InfoButton text={info} />
        </div>
        {icon}
      </div>
      <div className="mt-2 text-2xl font-black text-slate-900">{value}</div>
    </div>
  );
}

function OSMMap({
  stationsToShow,
  onSelectStation,
}: {
  stationsToShow: Station[];
  onSelectStation: (station: Station) => void;
}) {
  const [leafletReady, setLeafletReady] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadLeaflet = async () => {
      if (!document.getElementById("enav-leaflet-css")) {
        const css = document.createElement("link");
        css.id = "enav-leaflet-css";
        css.rel = "stylesheet";
        css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(css);
      }

      if (!window.L) {
        await new Promise<void>((resolve, reject) => {
          const existing = document.getElementById("enav-leaflet-js");

          if (existing) {
            existing.addEventListener("load", () => resolve(), { once: true });
            existing.addEventListener("error", () => reject(), { once: true });
            return;
          }

          const script = document.createElement("script");
          script.id = "enav-leaflet-js";
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject();
          document.body.appendChild(script);
        });
      }

      if (!cancelled) setLeafletReady(true);
    };

    loadLeaflet().catch(() => setMapError(true));

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <LeafletMap
      ready={leafletReady}
      error={mapError}
      stations={stationsToShow}
      onSelectStation={onSelectStation}
    />
  );
}

function LeafletMap({
  ready,
  error,
  stations: stationsToShow,
  onSelectStation,
}: {
  ready: boolean;
  error: boolean;
  stations: Station[];
  onSelectStation: (station: Station) => void;
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<any>(null);
  const markerLayerRef = React.useRef<any>(null);

  useEffect(() => {
    if (!ready || error || !containerRef.current || !window.L) return;

    const L = window.L;

    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([28.61, 77.12], 11);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      markerLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;

      setTimeout(() => map.invalidateSize(), 150);
    }

    const layer = markerLayerRef.current;
    if (!layer) return;

    layer.clearLayers();

    stationsToShow.forEach((station) => {
      const icon = L.divIcon({
        className: "",
        html: `
          <div style="
            min-width:46px;
            padding:7px 9px;
            border:2px solid white;
            border-radius:999px;
            background:#065f46;
            color:#ffffff;
            font-weight:900;
            font-size:12px;
            line-height:1;
            text-align:center;
            box-shadow:0 5px 16px rgba(0,0,0,.15);
          ">
            ${station.healthyConnectors}/${station.connectors}
          </div>
        `,
        iconAnchor: [23, 18],
      });

      const marker = L.marker(
        [station.latitude, station.longitude],
        { icon },
      ).addTo(layer);

      marker.bindTooltip(station.location, {
        direction: "top",
        offset: [0, -16],
      });

      marker.on("click", () => onSelectStation(station));
    });

    if (stationsToShow.length > 0) {
      const bounds = L.latLngBounds(
        stationsToShow.map((station) => [
          station.latitude,
          station.longitude,
        ]),
      );

      mapRef.current.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 12,
      });

      setTimeout(() => mapRef.current.invalidateSize(), 50);
    }
  }, [ready, error, stationsToShow, onSelectStation]);

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white text-sm text-slate-700">
        Map could not be loaded.
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-white text-sm text-slate-700">
        Loading OpenStreetMap…
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full" />;
}

export default function InfraPlannerPage() {
  const [search, setSearch] = useState("");
  const [connectorFilter, setConnectorFilter] = useState("ALL");
  const [selectedStationId, setSelectedStationId] = useState<string | null>(
    null,
  );

  const selectedStation = stations.find(
    (station) => station.id === selectedStationId,
  );

  const connectorTypes = useMemo(
    () =>
      [...new Set(stations.flatMap((station) => station.connectorTypes))].sort(),
    [],
  );

  const filteredStations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return stations.filter((station) => {
      const matchesSearch =
        !query ||
        station.name.toLowerCase().includes(query) ||
        station.location.toLowerCase().includes(query) ||
        station.id.toLowerCase().includes(query);

      const matchesConnector =
        connectorFilter === "ALL" ||
        station.connectorTypes.includes(connectorFilter);

      return matchesSearch && matchesConnector;
    });
  }, [search, connectorFilter]);

  const totalStations = stations.length;
  const totalConnectors = stations.reduce(
    (sum, station) => sum + station.connectors,
    0,
  );
  const healthyConnectors = stations.reduce(
    (sum, station) => sum + station.healthyConnectors,
    0,
  );
  const defectedConnectors = stations.reduce(
    (sum, station) => sum + station.defectedConnectors,
    0,
  );

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-[1500px] space-y-7 px-4 py-5 sm:px-6 lg:px-8">
        {/* HEADER */}

        <header className="rounded-2xl border border-emerald-500 bg-[#f0fdf4] shadow-sm">
          <div className="p-5">
            <div className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-emerald-700" />
              <h1 className="text-lg font-black tracking-widest text-slate-900 sm:text-xl">
                CHARGING INFRASTRUCTURE PLANNER
              </h1>
            </div>

            <p className="mt-1 text-xs text-slate-800 font-medium">
              Government view of charging-network coverage and infrastructure
              condition.
            </p>
          </div>
        </header>

        {/* OVERVIEW */}

        <section>
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-700" />
            <h2 className="text-base font-black uppercase tracking-wider text-slate-900">
              Network Overview
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Metric
              label="Charging Stations"
              value={String(totalStations)}
              icon={<BatteryCharging className="h-5 w-5 text-emerald-700" />}
              info="Number of charging stations recorded in the current planning dataset."
            />

            <Metric
              label="Total Connectors"
              value={String(totalConnectors)}
              icon={<Zap className="h-5 w-5 text-purple-700" />}
              info="Total connector count recorded across the listed charging stations."
            />

            <Metric
              label="Healthy Connectors"
              value={String(healthyConnectors)}
              icon={<ShieldCheck className="h-5 w-5 text-emerald-700" />}
              info="Connectors recorded as healthy in the infrastructure dataset. This does not mean they are currently free or available."
            />

            <Metric
              label="Defected Connectors"
              value={String(defectedConnectors)}
              icon={<Building2 className="h-5 w-5 text-amber-600" />}
              info="Connectors recorded with an infrastructure-condition issue in the current dataset."
            />
          </div>
        </section>

        {/* STATIONS */}

        <section className="overflow-hidden rounded-2xl border border-emerald-500 bg-[#f0fdf4] shadow-sm">
          <div className="border-b border-emerald-500 p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-emerald-700" />
                  <h2 className="text-base font-black uppercase tracking-wider text-slate-900">
                    Charging Stations
                  </h2>
                </div>

                <p className="mt-1 text-xs text-slate-800 font-medium">
                  Recorded station inventory and connector condition.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search stations..."
                    className="w-56 rounded-lg border border-emerald-500 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none placeholder:text-slate-500 focus:border-emerald-700 font-medium"
                  />
                </div>

                <div className="flex items-center gap-1 rounded-lg border border-emerald-500 bg-white px-2">
                  <SlidersHorizontal className="h-4 w-4 text-slate-600" />

                  <select
                    value={connectorFilter}
                    onChange={(event) => setConnectorFilter(event.target.value)}
                    className="rounded-lg bg-transparent px-1 py-2 text-xs font-bold text-slate-900 outline-none"
                    aria-label="Filter by connector type"
                  >
                    <option value="ALL">All connectors</option>
                    {connectorTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-emerald-500 bg-[#dcfce7]">
                  <th className="px-5 py-3 text-left">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-950">
                      Station
                      <InfoButton text="Station name and recorded planning location." />
                    </div>
                  </th>

                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-950">
                      Connector Types
                      <InfoButton text="A station can support multiple connector types. All connector categories recorded for the station are listed here." />
                    </div>
                  </th>

                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-950">
                      Connectors
                      <InfoButton text="Healthy connectors / total listed connectors." />
                    </div>
                  </th>

                  <th className="px-4 py-3 text-left">
                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-950">
                      Action
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredStations.map((station) => (
                  <tr
                    key={station.id}
                    onClick={() => setSelectedStationId(station.id)}
                    className="cursor-pointer border-b border-emerald-200 bg-white transition hover:bg-[#dcfce7]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500 bg-white shadow-sm">
                          <BatteryCharging className="h-5 w-5 text-emerald-700" />
                        </div>

                        <div>
                          <div className="text-sm font-bold text-slate-900">
                            {station.name}
                          </div>

                          <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-700 font-medium">
                            <MapPin className="h-3 w-3" />
                            {station.location}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {station.connectorTypes.map((type) => (
                          <span
                            key={type}
                            className="rounded-md border border-emerald-500 bg-white px-2.5 py-1 text-xs font-bold text-slate-800 shadow-sm"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="text-sm font-black text-slate-900">
                        {station.healthyConnectors}/{station.connectors}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedStationId(station.id);
                        }}
                        className="flex items-center gap-1.5 rounded-lg border border-emerald-700 bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-emerald-800 hover:border-emerald-800"
                      >
                        Inspect
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredStations.length === 0 && (
              <div className="p-12 text-center bg-white">
                <Search className="mx-auto h-6 w-6 text-emerald-500" />
                <p className="mt-3 text-sm text-slate-700 font-medium">
                  No stations match the current search/filter.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-emerald-500 px-5 py-3">
            <span className="text-xs text-slate-800 font-medium">
              Showing {filteredStations.length} of {stations.length} stations
            </span>

           
          </div>
        </section>

        {/* MAP */}

        <section className="rounded-2xl border border-emerald-500 bg-[#f0fdf4] p-5 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-emerald-500 pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-700" />

                <h2 className="text-base font-black uppercase tracking-wider text-slate-900">
                  Infrastructure Planning Map
                </h2>
              </div>

              <p className="mt-1 text-xs text-slate-800 font-medium">
                OpenStreetMap with station markers at their recorded geographic
                locations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-800 font-medium">
                Marker = healthy / total connectors
              </span>

              <InfoButton text="Markers use the station latitude/longitude from the planning dataset. The marker value represents recorded connector condition, not live occupancy." />
            </div>
          </div>

          <div className="mt-4 h-[560px] overflow-hidden rounded-2xl border border-emerald-500 bg-white p-2">
            <div className="h-full w-full overflow-hidden rounded-xl">
              <OSMMap
                stationsToShow={filteredStations}
                onSelectStation={(station) =>
                  setSelectedStationId(station.id)
                }
              />
            </div>
          </div>
        </section>
      </div>

      {/* STATION INSPECTOR */}

      {selectedStation && (
        <>
          <button
            type="button"
            aria-label="Close station analysis"
            onClick={() => setSelectedStationId(null)}
            className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm"
          />

          <aside className="fixed right-0 top-0 z-[1000] flex h-screen w-full max-w-[440px] flex-col border-l border-emerald-500 bg-white shadow-2xl">
            <div className="shrink-0 border-b border-emerald-500 bg-white px-5 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-700" />

                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-950">
                      Station Analysis
                    </span>
                  </div>

                  <h2 className="mt-2 text-xl font-black text-slate-900">
                    {selectedStation.name}
                  </h2>

                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-800 font-medium">
                    <MapPin className="h-3.5 w-3.5" />
                    {selectedStation.location}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStationId(null)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500 bg-white text-slate-700 shadow-sm hover:text-slate-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-lg border border-emerald-500 bg-[#f0fdf4] px-3 py-2.5 shadow-sm">
                <span className="text-xs uppercase tracking-widest text-slate-700 font-semibold">
                  Station ID
                </span>

                <span className="font-mono text-xs font-bold text-slate-900">
                  {selectedStation.id}
                </span>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-white p-5 space-y-5">
              {/* STATION PERFORMANCE */}

              <div className="rounded-2xl border border-emerald-500 bg-[#f0fdf4] p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <BatteryCharging className="h-5 w-5 text-emerald-700" />

                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Station Performance
                    </div>

                    <div className="mt-1 text-xs text-slate-700 font-medium">
                      Recorded infrastructure condition for this station.
                    </div>
                  </div>
                </div>
              </div>

              {/* CONNECTOR CONDITION */}

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-700" />

                  <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Connector Condition
                  </span>

                  <InfoButton text="Total, healthy and defected counts describe the recorded infrastructure condition. They do not indicate whether a connector is currently occupied or available." />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl border border-emerald-500 bg-[#f0fdf4] p-3.5 shadow-sm">
                    <div className="text-xs text-slate-700 font-semibold">TOTAL</div>
                    <div className="mt-1 text-xl font-black text-slate-900">
                      {selectedStation.connectors}
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-500 bg-[#f0fdf4] p-3.5 shadow-sm">
                    <div className="text-xs text-slate-700 font-semibold">HEALTHY</div>
                    <div className="mt-1 text-xl font-black text-emerald-700">
                      {selectedStation.healthyConnectors}
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-500 bg-[#f0fdf4] p-3.5 shadow-sm">
                    <div className="text-xs text-slate-700 font-semibold">DEFECTED</div>
                    <div className="mt-1 text-xl font-black text-amber-600">
                      {selectedStation.defectedConnectors}
                    </div>
                  </div>
                </div>
              </div>

              {/* CONNECTOR HEALTH */}

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-700" />

                  <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Connector Health
                  </span>

                  <InfoButton text="Healthy / total = healthy connectors divided by total listed connectors. This is an infrastructure-condition measure, not live availability." />
                </div>

                <div className="rounded-xl border border-emerald-500 bg-[#f0fdf4] p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-800 font-medium">
                      Operational connectors
                    </span>

                    <span className="text-base font-black text-emerald-700">
                      {selectedStation.healthyConnectors}/
                      {selectedStation.connectors}
                    </span>
                  </div>
                </div>
              </div>

              {/* STATION DETAILS */}

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-emerald-700" />

                  <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Station Details
                  </span>

                  <InfoButton text="Station details include the connector categories recorded for this station. Coordinates are intentionally omitted from this panel." />
                </div>

                <div className="rounded-xl border border-emerald-500 bg-[#f0fdf4] p-4 shadow-sm">
                  <div className="text-xs uppercase tracking-widest text-slate-700 font-semibold">
                    Connector Types
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {selectedStation.connectorTypes.map((type) => (
                      <span
                        key={type}
                        className="rounded-md border border-emerald-500 bg-white px-2.5 py-1 text-xs font-bold text-slate-900"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-emerald-500 bg-white p-4">
              <button
                type="button"
                onClick={() => setSelectedStationId(null)}
                className="flex w-full items-center justify-center rounded-xl border border-emerald-700 bg-emerald-700 px-4 py-3.5 text-xs font-black text-white shadow-md transition hover:bg-emerald-800"
              >
                CLOSE ANALYSIS
              </button>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}