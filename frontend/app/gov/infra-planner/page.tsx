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
  healthyConnectors: number | null;
  defectedConnectors: number | null;
  status?: string | null;
  operator?: string | null;
  ocmId?: number | null;
  source?: string;
};

declare global {
  interface Window {
    L: any;
  }
}

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
      try {
        if (!document.getElementById("enav-leaflet-css")) {
          const css = document.createElement("link");

          css.id = "enav-leaflet-css";
          css.rel = "stylesheet";
          css.href =
            "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

          document.head.appendChild(css);
        }

        if (!window.L) {
          await new Promise<void>((resolve, reject) => {
            const existing =
              document.getElementById("enav-leaflet-js");

            if (existing) {
              existing.addEventListener(
                "load",
                () => resolve(),
                { once: true },
              );

              existing.addEventListener(
                "error",
                () => reject(),
                { once: true },
              );

              return;
            }

            const script = document.createElement("script");

            script.id = "enav-leaflet-js";
            script.src =
              "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
            script.async = true;

            script.onload = () => resolve();
            script.onerror = () => reject();

            document.body.appendChild(script);
          });
        }

        if (!cancelled) {
          setLeafletReady(true);
        }
      } catch {
        if (!cancelled) {
          setMapError(true);
        }
      }
    };

    loadLeaflet();

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
    if (
      !ready ||
      error ||
      !containerRef.current ||
      !window.L
    ) {
      return;
    }

    const L = window.L;

    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([28.61, 77.12], 11);

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        },
      ).addTo(map);

      markerLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 150);
    }

    const layer = markerLayerRef.current;

    if (!layer) {
      return;
    }

    layer.clearLayers();

    stationsToShow.forEach((station) => {
      const connectorLabel =
        station.healthyConnectors === null
          ? `${station.connectors}`
          : `${station.healthyConnectors}/${station.connectors}`;

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
            ${connectorLabel}
          </div>
        `,
        iconAnchor: [23, 18],
      });

      const marker = L.marker(
        [station.latitude, station.longitude],
        { icon },
      ).addTo(layer);

      marker.bindTooltip(
        `
          <div style="
            min-width:170px;
            text-align:center;
            font-family:Arial,sans-serif;
          ">
            <div style="
              font-weight:800;
              font-size:13px;
              margin-bottom:5px;
            ">
              ${station.name}
            </div>

            <div style="
              font-size:11px;
              color:#475569;
              margin-bottom:8px;
            ">
              ${station.location}
            </div>

            <div style="
              font-size:12px;
              font-weight:800;
              color:#065f46;
              margin-bottom:8px;
            ">
              ${
                station.healthyConnectors === null
                  ? `Connectors: ${station.connectors}`
                  : `Connectors: ${station.healthyConnectors}/${station.connectors}`
              }
            </div>

            <div style="
              display:inline-block;
              padding:5px 9px;
              border-radius:6px;
              background:#065f46;
              color:white;
              font-size:11px;
              font-weight:800;
            ">
              View Site Analysis
            </div>
          </div>
        `,
        {
          direction: "top",
          offset: [0, -16],
          opacity: 1,
        },
      );

      marker.on("click", () => {
        onSelectStation(station);
      });
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

      setTimeout(() => {
        mapRef.current?.invalidateSize();
      }, 50);
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

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
    />
  );
}

export default function InfraPlannerPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");

  const [search, setSearch] = useState("");
  const [connectorFilter, setConnectorFilter] =
    useState("ALL");

  const [selectedStationId, setSelectedStationId] =
    useState<string | null>(null);

  useEffect(() => {
    const loadStations = async () => {
      try {
        setLoading(true);
        setApiError("");

        const response = await fetch(
          "http://127.0.0.1:8000/infra-planner/stations",
          {
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error(
            `Station API returned ${response.status}`,
          );
        }

        const result = await response.json();

        const mappedStations: Station[] = (
          result.stations ?? []
        )
          .map((station: any) => ({
            id: String(
              station.id ??
                `OCM-${station.ocm_id ?? "UNKNOWN"}`,
            ),

            name:
              station.name ??
              "Unnamed Charging Station",

            location:
              station.location ??
              "Location not provided",

            latitude: Number(station.latitude),
            longitude: Number(station.longitude),

            connectorTypes: Array.isArray(
              station.connector_types,
            )
              ? station.connector_types
              : [],

            connectors:
              typeof station.total_connectors ===
              "number"
                ? station.total_connectors
                : 0,

            healthyConnectors:
              typeof station.healthy_connectors ===
              "number"
                ? station.healthy_connectors
                : null,

            defectedConnectors:
              typeof station.defected_connectors ===
              "number"
                ? station.defected_connectors
                : null,

            status: station.status ?? null,
            operator: station.operator ?? null,

            ocmId:
              typeof station.ocm_id === "number"
                ? station.ocm_id
                : null,

            source: station.source ?? "Open Charge Map",
          }))
          .filter(
            (station: Station) =>
              Number.isFinite(station.latitude) &&
              Number.isFinite(station.longitude),
          );

        setStations(mappedStations);
      } catch (error) {
        console.error(
          "Infra Planner API error:",
          error,
        );

        setApiError(
          "Unable to load charging station data.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadStations();
  }, []);

  const selectedStation = stations.find(
    (station) => station.id === selectedStationId,
  );

  const connectorTypes = useMemo(
    () =>
      [
        ...new Set(
          stations.flatMap(
            (station) => station.connectorTypes,
          ),
        ),
      ].sort(),
    [stations],
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
        station.connectorTypes.includes(
          connectorFilter,
        );

      return (
        matchesSearch &&
        matchesConnector
      );
    });
  }, [
    stations,
    search,
    connectorFilter,
  ]);

  const totalStations = stations.length;

  const totalConnectors = stations.reduce(
    (sum, station) =>
      sum + station.connectors,
    0,
  );

  const hasHealthData = stations.every(
    (station) =>
      station.healthyConnectors !== null,
  );

  const hasDefectData = stations.every(
    (station) =>
      station.defectedConnectors !== null,
  );

  const healthyConnectors = hasHealthData
    ? stations.reduce(
        (sum, station) =>
          sum +
          (station.healthyConnectors ?? 0),
        0,
      )
    : null;

  const defectedConnectors = hasDefectData
    ? stations.reduce(
        (sum, station) =>
          sum +
          (station.defectedConnectors ?? 0),
        0,
      )
    : null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="rounded-xl border border-emerald-500 bg-[#f0fdf4] px-6 py-5 text-center shadow-sm">
          <BatteryCharging className="mx-auto h-7 w-7 text-emerald-700" />

          <p className="mt-3 text-sm font-bold text-slate-900">
            Loading charging station data…
          </p>

          <p className="mt-1 text-xs font-medium text-slate-600">
            Fetching station data from Open Charge Map.
          </p>
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-6">
        <div className="max-w-md rounded-xl border border-red-300 bg-red-50 p-6 text-center shadow-sm">
          <X className="mx-auto h-7 w-7 text-red-600" />

          <p className="mt-3 text-sm font-bold text-red-700">
            {apiError}
          </p>

          <p className="mt-2 text-xs font-medium leading-5 text-red-600">
            Make sure the EnaV backend is running and the
            Open Charge Map API configuration is correct.
          </p>
        </div>
      </div>
    );
  }

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

            <p className="mt-1 text-xs font-medium text-slate-800">
              Government view of charging-network
              coverage and infrastructure condition.
            </p>

            <p className="mt-2 text-[11px] font-bold text-emerald-800">
              Data source: Open Charge Map
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
              icon={
                <BatteryCharging className="h-5 w-5 text-emerald-700" />
              }
              info="Number of charging stations returned by the Open Charge Map dataset for the Delhi search area."
            />

            <Metric
              label="Total Connectors"
              value={String(totalConnectors)}
              icon={
                <Zap className="h-5 w-5 text-purple-700" />
              }
              info="Total connector quantity reported by Open Charge Map for the listed stations. A station may have incomplete connector quantity information."
            />

            <Metric
              label="Healthy Connectors"
              value={
                healthyConnectors === null
                  ? "N/A"
                  : String(healthyConnectors)
              }
              icon={
                <ShieldCheck className="h-5 w-5 text-emerald-700" />
              }
              info="Open Charge Map does not provide reliable live connector-health data for these stations, so this value is shown as N/A rather than estimated."
            />

            <Metric
              label="Defected Connectors"
              value={
                defectedConnectors === null
                  ? "N/A"
                  : String(defectedConnectors)
              }
              icon={
                <Building2 className="h-5 w-5 text-amber-600" />
              }
              info="Open Charge Map does not provide reliable connector defect counts, so this value is shown as N/A rather than fabricated."
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

                <p className="mt-1 text-xs font-medium text-slate-800">
                  Charging station inventory from Open
                  Charge Map.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search stations..."
                    className="w-56 rounded-lg border border-emerald-500 bg-white py-2 pl-9 pr-3 text-xs font-medium text-slate-900 outline-none placeholder:text-slate-500 focus:border-emerald-700"
                  />
                </div>

                <div className="flex items-center gap-1 rounded-lg border border-emerald-500 bg-white px-2">
                  <SlidersHorizontal className="h-4 w-4 text-slate-600" />

                  <select
                    value={connectorFilter}
                    onChange={(event) =>
                      setConnectorFilter(
                        event.target.value,
                      )
                    }
                    className="rounded-lg bg-transparent px-1 py-2 text-xs font-bold text-slate-900 outline-none"
                    aria-label="Filter by connector type"
                  >
                    <option value="ALL">
                      All connectors
                    </option>

                    {connectorTypes.map(
                      (type) => (
                        <option
                          key={type}
                          value={type}
                        >
                          {type}
                        </option>
                      ),
                    )}
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

                      <InfoButton text="Station name and location reported by Open Charge Map." />
                    </div>
                  </th>

                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-950">
                      Connector Types

                      <InfoButton text="Connector categories reported by Open Charge Map for the station." />
                    </div>
                  </th>

                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-950">
                      Connectors

                      <InfoButton text="Total connector quantity reported by Open Charge Map. Live connector health and availability are not inferred." />
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
                {filteredStations.map(
                  (station) => (
                    <tr
                      key={station.id}
                      onClick={() =>
                        setSelectedStationId(
                          station.id,
                        )
                      }
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

                            <div className="mt-0.5 flex items-center gap-1 text-xs font-medium text-slate-700">
                              <MapPin className="h-3 w-3" />

                              {station.location}
                            </div>

                            {station.operator && (
                              <div className="mt-1 text-[10px] font-semibold text-slate-500">
                                Operator:{" "}
                                {station.operator}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {station.connectorTypes
                            .length > 0 ? (
                            station.connectorTypes.map(
                              (type) => (
                                <span
                                  key={type}
                                  className="rounded-md border border-emerald-500 bg-white px-2.5 py-1 text-xs font-bold text-slate-800 shadow-sm"
                                >
                                  {type}
                                </span>
                              ),
                            )
                          ) : (
                            <span className="text-xs font-semibold text-slate-500">
                              Not provided
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-sm font-black text-slate-900">
                          {station.connectors}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();

                            setSelectedStationId(
                              station.id,
                            );
                          }}
                          className="flex items-center gap-1.5 rounded-lg border border-emerald-700 bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-md transition hover:border-emerald-800 hover:bg-emerald-800"
                        >
                          Inspect

                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>

            {filteredStations.length === 0 && (
              <div className="bg-white p-12 text-center">
                <Search className="mx-auto h-6 w-6 text-emerald-500" />

                <p className="mt-3 text-sm font-medium text-slate-700">
                  No stations match the current
                  search/filter.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-emerald-500 px-5 py-3">
            <span className="text-xs font-medium text-slate-800">
              Showing{" "}
              {filteredStations.length} of{" "}
              {stations.length} stations
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

              <p className="mt-1 text-xs font-medium text-slate-800">
                OpenStreetMap with station markers using
                Open Charge Map coordinates.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-800">
                Marker = connector count
              </span>

              <InfoButton text="Markers use the station latitude and longitude returned by Open Charge Map. Connector health and live availability are not inferred." />
            </div>
          </div>

          <div className="mt-4 h-[560px] overflow-hidden rounded-2xl border border-emerald-500 bg-white p-2">
            <div className="h-full w-full overflow-hidden rounded-xl">
              <OSMMap
                stationsToShow={
                  filteredStations
                }
                onSelectStation={(
                  station,
                ) =>
                  setSelectedStationId(
                    station.id,
                  )
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
            onClick={() =>
              setSelectedStationId(null)
            }
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

                  <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-800">
                    <MapPin className="h-3.5 w-3.5" />

                    {selectedStation.location}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedStationId(null)
                  }
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-emerald-500 bg-white text-slate-700 shadow-sm hover:text-slate-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-lg border border-emerald-500 bg-[#f0fdf4] px-3 py-2.5 shadow-sm">
                <span className="text-xs font-semibold uppercase tracking-widest text-slate-700">
                  Station ID
                </span>

                <span className="font-mono text-xs font-bold text-slate-900">
                  {selectedStation.id}
                </span>
              </div>
            </div>

            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-white p-5">

              {/* STATION PERFORMANCE */}

              <div className="rounded-2xl border border-emerald-500 bg-[#f0fdf4] p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <BatteryCharging className="h-5 w-5 text-emerald-700" />

                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Station Performance
                    </div>

                    <div className="mt-1 text-xs font-medium text-slate-700">
                      Station information reported by
                      Open Charge Map.
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

                  <InfoButton text="Open Charge Map does not provide reliable live connector health or defect counts. Unavailable values are shown as N/A." />
                </div>

                <div className="grid grid-cols-3 gap-2">

                  <div className="rounded-xl border border-emerald-500 bg-[#f0fdf4] p-3.5 shadow-sm">
                    <div className="text-xs font-semibold text-slate-700">
                      TOTAL
                    </div>

                    <div className="mt-1 text-xl font-black text-slate-900">
                      {selectedStation.connectors}
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-500 bg-[#f0fdf4] p-3.5 shadow-sm">
                    <div className="text-xs font-semibold text-slate-700">
                      HEALTHY
                    </div>

                    <div className="mt-1 text-xl font-black text-emerald-700">
                      {selectedStation.healthyConnectors ??
                        "N/A"}
                    </div>
                  </div>

                  <div className="rounded-xl border border-emerald-500 bg-[#f0fdf4] p-3.5 shadow-sm">
                    <div className="text-xs font-semibold text-slate-700">
                      DEFECTED
                    </div>

                    <div className="mt-1 text-xl font-black text-amber-600">
                      {selectedStation.defectedConnectors ??
                        "N/A"}
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

                  <InfoButton text="Live connector health and availability are not provided reliably by Open Charge Map." />
                </div>

                <div className="rounded-xl border border-emerald-500 bg-[#f0fdf4] p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-800">
                      Operational connectors
                    </span>

                    <span className="text-base font-black text-emerald-700">
                      {selectedStation.healthyConnectors ===
                      null
                        ? "N/A"
                        : `${selectedStation.healthyConnectors}/${selectedStation.connectors}`}
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

                  <InfoButton text="Station details include connector categories, operator information and OCM station status when available." />
                </div>

                <div className="space-y-3 rounded-xl border border-emerald-500 bg-[#f0fdf4] p-4 shadow-sm">

                  <div>
                    <div className="text-xs font-semibold uppercase tracking-widest text-slate-700">
                      Connector Types
                    </div>

                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {selectedStation
                        .connectorTypes
                        .length > 0 ? (
                        selectedStation.connectorTypes.map(
                          (type) => (
                            <span
                              key={type}
                              className="rounded-md border border-emerald-500 bg-white px-2.5 py-1 text-xs font-bold text-slate-900"
                            >
                              {type}
                            </span>
                          ),
                        )
                      ) : (
                        <span className="text-xs font-semibold text-slate-500">
                          Not provided
                        </span>
                      )}
                    </div>
                  </div>

                  {selectedStation.operator && (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-widest text-slate-700">
                        Operator
                      </div>

                      <div className="mt-1 text-sm font-bold text-slate-900">
                        {selectedStation.operator}
                      </div>
                    </div>
                  )}

                  {selectedStation.status && (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-widest text-slate-700">
                        Reported Status
                      </div>

                      <div className="mt-1 text-sm font-bold text-slate-900">
                        {selectedStation.status}
                      </div>
                    </div>
                  )}

                  {selectedStation.ocmId && (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-widest text-slate-700">
                        OCM ID
                      </div>

                      <div className="mt-1 font-mono text-xs font-bold text-slate-900">
                        {selectedStation.ocmId}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-emerald-500 bg-white p-4">
              <button
                type="button"
                onClick={() =>
                  setSelectedStationId(null)
                }
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