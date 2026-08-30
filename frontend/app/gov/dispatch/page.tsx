"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import {
  Siren,
  MapPin,
  Navigation,
  Radio,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Ambulance,
  Route,
  Activity,
  Car,
} from "lucide-react";

const CommandMap = dynamic(() => import("@/components/CommandMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-0 items-center justify-center bg-white text-emerald-900">
      <div className="flex items-center gap-2 text-sm">
        <Radio className="h-4 w-4 animate-pulse text-emerald-700" />
        Loading emergency map...
      </div>
    </div>
  ),
});

/* -------------------------------------------------------------------------- */
/* INCIDENT DATA                                                              */
/* -------------------------------------------------------------------------- */

const incidents = [
  {
    id: "E102",
    type: "Medical Emergency",
    location: "Janakpuri Sector 7",
    distance: "3.2 km",
    received: "14:28 IST",
    priority: "CRITICAL",
    source: "112 Emergency Network",
    status: "awaited",
  },
  {
    id: "E104",
    type: "Fire Hazard",
    location: "Connaught Place",
    distance: "7.8 km",
    received: "14:30 IST",
    priority: "HIGH",
    source: "112 Emergency Network",
    status: "awaited",
  },
  {
    id: "E098",
    type: "Traffic Collision",
    location: "Ring Road / AIIMS",
    distance: "5.1 km",
    received: "14:21 IST",
    priority: "HIGH",
    source: "Traffic Control",
    status: "assigned",
  },
  {
    id: "E091",
    type: "Public Safety Support",
    location: "Dwarka Sector 14",
    distance: "9.4 km",
    received: "14:16 IST",
    priority: "MEDIUM",
    source: "112 Emergency Network",
    status: "assigned",
  },
  {
    id: "E087",
    type: "Medical Assistance",
    location: "Rohini Sector 11",
    distance: "11.2 km",
    received: "14:11 IST",
    priority: "HIGH",
    source: "112 Emergency Network",
    status: "awaited",
  },
  {
    id: "E081",
    type: "Road Obstruction",
    location: "Outer Ring Road",
    distance: "13.6 km",
    received: "14:05 IST",
    priority: "MEDIUM",
    source: "Traffic Control",
    status: "completed",
  },
];

/* -------------------------------------------------------------------------- */
/* VEHICLE DATA                                                               */
/* -------------------------------------------------------------------------- */

const vehicles = [
  {
    id: "EV-AMB-21",
    type: "Advanced Life Support",
    distance: "3.2 km",
    battery: 74,
    eta: "14 min",
    traffic: "Moderate",
    score: 98.4,
    recommended: true,
    status: "AVAILABLE",
  },
  {
    id: "EV-AMB-18",
    type: "Basic Life Support",
    distance: "2.4 km",
    battery: 8,
    eta: "14 min",
    traffic: "Low",
    score: 71.2,
    recommended: false,
    status: "LOW BATTERY",
  },
  {
    id: "EV-AMB-09",
    type: "Advanced Life Support",
    distance: "5.1 km",
    battery: 91,
    eta: "14 min",
    traffic: "Moderate",
    score: 89.6,
    recommended: false,
    status: "AVAILABLE",
  },
  {
    id: "EV-RR-02",
    type: "Rapid Response Unit",
    distance: "5.8 km",
    battery: 67,
    eta: "14 min",
    traffic: "Low",
    score: 82.4,
    recommended: false,
    status: "AVAILABLE",
  },
  {
    id: "EV-AMB-14",
    type: "Advanced Life Support",
    distance: "7.2 km",
    battery: 81,
    eta: "14 min",
    traffic: "High",
    score: 78.8,
    recommended: false,
    status: "AVAILABLE",
  },
  {
    id: "EV-RR-07",
    type: "Rapid Response Unit",
    distance: "8.4 km",
    battery: 56,
    eta: "14 min",
    traffic: "Moderate",
    score: 74.5,
    recommended: false,
    status: "AVAILABLE",
  },
];

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function EmergencyPage() {
  const [selectedIncidentId, setSelectedIncidentId] = useState("E102");
  const [selectedVehicleId, setSelectedVehicleId] =
    useState("EV-AMB-21");

  const selectedIncident =
    incidents.find(
      (incident) => incident.id === selectedIncidentId,
    ) ?? incidents[0];

  const selectedVehicle =
    vehicles.find(
      (vehicle) => vehicle.id === selectedVehicleId,
    ) ?? vehicles[0];

  const availableVehicles = useMemo(
    () =>
      vehicles.filter(
        (vehicle) => vehicle.status === "AVAILABLE",
      ),
    [],
  );

  const openIncidents = incidents.filter(
    (incident) => incident.status !== "completed",
  ).length;

  const awaitedCount = incidents.filter(i => i.status === "awaited").length;
  const assignedCount = incidents.filter(i => i.status === "assigned").length;
  const completedCount = incidents.filter(i => i.status === "completed").length;

  return (
    <div className="h-screen min-h-0 w-full overflow-hidden bg-white text-emerald-950">
      {/* ================================================================== */}
      {/* HEADER                                                             */}
      {/* ================================================================== */}

      <header className="h-[68px] shrink-0 border-b border-emerald-200 bg-white">
        <div className="flex h-full min-w-0 items-center justify-between px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-700/30 bg-emerald-50">
              <Siren className="h-5 w-5 text-emerald-700" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-base font-bold tracking-tight text-emerald-950">
                  Emergency Response
                </h1>

                <span className="shrink-0 rounded-full border border-emerald-700/30 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                  LIVE
                </span>
              </div>

              <div className="mt-0.5 flex items-center gap-2 text-[12px] text-emerald-700">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>Delhi NCR</span>
                <span className="text-emerald-300">•</span>
                <span>Emergency Operations</span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-5">
            <div className="hidden text-right md:block">
              <p className="text-[10px] uppercase tracking-wider text-emerald-600">
                CURRENT TIME
              </p>

              <p className="text-sm font-bold text-emerald-900">
                14:32 IST
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ================================================================== */}
      {/* MAIN                                                               */}
      {/* ================================================================== */}

      <main className="h-[calc(100vh-68px)] min-h-0 w-full overflow-hidden p-3">
        <div
          className="
            grid
            h-full
            min-h-0
            w-full
            min-w-0
            grid-cols-[minmax(300px,0.95fr)_minmax(0,1.55fr)_minmax(330px,1fr)]
            gap-3
          "
        >
          {/* ============================================================ */}
          {/* LEFT — INCIDENTS                                             */}
          {/* ============================================================ */}

          <section className="flex min-h-0 min-w-0 flex-col gap-3">
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-emerald-200 bg-white">
              <div className="shrink-0 border-b border-emerald-200 px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-700" />

                      <h2 className="text-[15px] font-bold text-emerald-950">
                        Active Incidents
                      </h2>
                    </div>

                    <p className="mt-1 text-[11px] text-emerald-700">
                      Emergency calls requiring monitoring
                    </p>
                  </div>

                  <span className="shrink-0 rounded-md border border-emerald-700/20 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700">
                    {openIncidents} OPEN
                  </span>
                </div>
              </div>

              <div
                className="
                  min-h-0
                  flex-1
                  space-y-2
                  overflow-y-auto
                  overscroll-contain
                  p-3
                  [scrollbar-width:none]
                  [&::-webkit-scrollbar]:hidden
                "
              >
                {incidents.map((incident) => {
                  const active =
                    incident.id === selectedIncidentId;

                  return (
                    <div
                      key={incident.id}
                      onClick={() =>
                        setSelectedIncidentId(incident.id)
                      }
                      className={`w-full rounded-lg border p-3.5 text-left transition cursor-pointer ${
                        active
                          ? "border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-100"
                          : "border-emerald-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-[13px] font-bold ${
                                active
                                  ? "text-emerald-950"
                                  : "text-emerald-900"
                              }`}
                            >
                              #{incident.id}
                            </span>

                            <PriorityBadge
                              priority={incident.priority}
                            />
                          </div>

                          <p className="mt-1.5 text-[13px] font-semibold text-emerald-900">
                            {incident.type}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-emerald-700">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />

                        <span className="truncate">
                          {incident.location}
                        </span>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-emerald-100 pt-2.5 text-[10px]">
                        <span className="text-emerald-600">
                          {incident.received}
                        </span>

                        <span
                          className={
                            incident.status === "assigned"
                              ? "font-semibold text-amber-700"
                              : incident.status === "completed"
                              ? "font-semibold text-emerald-700"
                              : "font-semibold text-red-600"
                          }
                        >
                          {incident.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RESPONSE STATUS (Only 3 types: awaited, assigned, completed) */}

            <div className="shrink-0 rounded-xl border border-emerald-200 bg-white p-3.5">
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />

                <h3 className="text-[14px] font-bold text-emerald-950">
                  Response Status
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <StatusBox
                  label="Awaited"
                  value={String(awaitedCount)}
                  tone="amber"
                />

                <StatusBox
                  label="Assigned"
                  value={String(assignedCount)}
                  tone="blue"
                />

                <StatusBox
                  label="Completed"
                  value={String(completedCount)}
                  tone="green"
                />
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* CENTER — MAP                                                 */}
          {/* ============================================================ */}

          <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-emerald-200 bg-white">
            <div className="flex h-[60px] shrink-0 items-center justify-between border-b border-emerald-200 px-4">
              <div className="min-w-0">
                <h2 className="text-[15px] font-bold text-emerald-950">
                  Live Response Map
                </h2>

                <p className="mt-0.5 truncate text-[11px] text-emerald-700">
                  {selectedIncident.location} · emergency units · response
                  corridor
                </p>
              </div>

              <div className="hidden shrink-0 items-center gap-3 text-[10px] lg:flex">
                <MapLegend
                  color="bg-red-500"
                  label="Incident"
                />

                <MapLegend
                  color="bg-emerald-600"
                  label="EV Unit"
                />

                <MapLegend
                  color="bg-amber-500"
                  label="Traffic"
                />
              </div>
            </div>

            <div className="relative min-h-0 flex-1 overflow-hidden">
              <iframe
                title="Delhi OpenStreetMap"
                className="w-full h-full border-0 filter contrast-125"
                src="https://www.openstreetmap.org/export/embed.html?bbox=76.84%2C28.40%2C77.35%2C28.88&layer=mapnik"
                loading="lazy"
              />

              {/* INCIDENT MAP CARD */}

              <div className="absolute left-3 top-3 z-[400] max-w-[calc(100%-24px)] rounded-lg border border-red-200 bg-white/95 px-3.5 py-2.5 shadow-xl backdrop-blur">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-red-500" />

                  <span className="text-[12px] font-bold text-red-600">
                    INCIDENT #{selectedIncident.id}
                  </span>
                </div>

                <p className="mt-1 truncate text-[11px] text-emerald-700">
                  {selectedIncident.location} ·{" "}
                  {selectedIncident.type}
                </p>
              </div>

              {/* RESPONSE CORRIDOR */}

              <div className="absolute bottom-3 left-3 right-3 z-[400] rounded-lg border border-emerald-200 bg-white/95 p-3.5 shadow-xl backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Navigation className="h-4 w-4 shrink-0 text-emerald-700" />

                    <div className="min-w-0">
                      <p className="mt-0.5 truncate text-[10px] text-emerald-800 font-medium">
                        Optimized for emergency priority and vehicle battery
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-[15px] font-bold text-emerald-700">
                      14 min
                    </p>

                    <p className="text-[9px] uppercase tracking-wide text-emerald-600">
                      ETA
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex h-[42px] shrink-0 items-center justify-between border-t border-emerald-200 px-4 bg-emerald-50/50">
              <div className="flex items-center gap-2 text-[10px] text-emerald-800">
                <Activity className="h-3.5 w-3.5 text-emerald-700" />
                Live telemetry connected
              </div>

              <div className="flex items-center gap-2 text-[10px] text-emerald-800">
                <Route className="h-3.5 w-3.5 text-emerald-700" />
                Route intelligence
              </div>
            </div>
          </section>

          {/* ============================================================ */}
          {/* RIGHT — AVAILABLE UNITS                                      */}
          {/* ============================================================ */}

          <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-emerald-200 bg-white">
            <div className="shrink-0 border-b border-emerald-200 px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-[15px] font-bold text-emerald-950">
                    Available Units
                  </h2>

                  <p className="mt-1 text-[11px] text-emerald-700">
                    Ranked by emergency feasibility
                  </p>
                </div>

                <span className="shrink-0 rounded-md bg-emerald-100 px-2 py-1 text-[10px] font-bold text-emerald-800">
                  {availableVehicles.length} ONLINE
                </span>
              </div>
            </div>

            <div
              className="
                min-h-0
                flex-1
                overflow-y-auto
                overscroll-contain
                p-3
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
              "
            >
              <div className="space-y-2.5">
                {vehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    selected={
                      selectedVehicleId === vehicle.id
                    }
                    onSelect={() =>
                      setSelectedVehicleId(vehicle.id)
                    }
                  />
                ))}
              </div>

              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3.5">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 shrink-0 text-emerald-700" />

                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-emerald-900">
                      Fleet availability
                    </p>

                    <p className="mt-0.5 text-[10px] text-emerald-700">
                      {vehicles.length} units monitored ·{" "}
                      {availableVehicles.length} dispatchable
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="shrink-0 border-t border-emerald-200 p-3.5">
              <div className="mb-2.5 flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase tracking-wide text-emerald-600">
                  Selected unit
                </span>

                <span className="truncate text-[12px] font-bold text-emerald-700">
                  {selectedVehicle.id}
                </span>
              </div>

              <button
                disabled={
                  selectedVehicle.status !== "AVAILABLE"
                }
                className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-3 text-[12px] font-bold transition ${
                  selectedVehicle.status === "AVAILABLE"
                    ? "bg-emerald-700 text-white shadow-lg shadow-emerald-700/10 hover:bg-emerald-800"
                    : "cursor-not-allowed bg-emerald-100 text-emerald-400"
                }`}
              >
                <Siren className="h-4 w-4" />

                {selectedVehicle.status === "AVAILABLE"
                  ? `ASSIGN ${selectedVehicle.id}`
                  : "UNIT NOT DISPATCHABLE"}
              </button>

              <p className="mt-2 text-center text-[10px] text-emerald-600">
                Dispatch creates an emergency route for the selected unit.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* PRIORITY BADGE                                                             */
/* -------------------------------------------------------------------------- */

function PriorityBadge({
  priority,
}: {
  priority: string;
}) {
  const styles =
    priority === "CRITICAL"
      ? "border-red-200 bg-red-50 text-red-600"
      : priority === "HIGH"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <span
      className={`rounded border px-1.5 py-0.5 text-[9px] font-bold ${styles}`}
    >
      {priority}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* STATUS BOX                                                                 */
/* -------------------------------------------------------------------------- */

function StatusBox({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "green" | "blue" | "amber";
}) {
  const styles = {
    green: {
      border: "border-emerald-200",
      value: "text-emerald-700",
      icon: "bg-emerald-600",
    },
    blue: {
      border: "border-blue-200",
      value: "text-blue-700",
      icon: "bg-blue-600",
    },
    amber: {
      border: "border-amber-200",
      value: "text-amber-700",
      icon: "bg-amber-500",
    },
  }[tone];

  return (
    <div
      className={`rounded-lg border ${styles.border} bg-emerald-50/30 px-3 py-2.5`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${styles.icon}`}
        />

        <span className="text-[10px] text-emerald-700">
          {label}
        </span>
      </div>

      <p
        className={`mt-1 text-[12px] font-bold ${styles.value}`}
      >
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* MAP LEGEND                                                                 */
/* -------------------------------------------------------------------------- */

function MapLegend({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5 whitespace-nowrap text-emerald-700">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* VEHICLE CARD                                                               */
/* -------------------------------------------------------------------------- */

function VehicleCard({
  vehicle,
  selected,
  onSelect,
}: {
  vehicle: {
    id: string;
    type: string;
    distance: string;
    battery: number;
    eta: string;
    traffic: string;
    score: number;
    recommended: boolean;
    status: string;
  };
  selected: boolean;
  onSelect: () => void;
}) {
  const lowBattery = vehicle.battery < 20;

  return (
    <div
      onClick={onSelect}
      className={`w-full rounded-xl border p-3.5 text-left transition cursor-pointer ${
        selected
          ? "border-emerald-500 bg-emerald-50/60 shadow-md shadow-emerald-100"
          : "border-emerald-200 bg-white hover:border-emerald-300"
      }`}
    >
      {/* TITLE */}

      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              lowBattery
                ? "bg-red-50 text-red-600 border border-red-200"
                : selected
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-emerald-50 text-emerald-700"
            }`}
          >
            <Ambulance className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="text-[13px] font-bold text-emerald-950">
                {vehicle.id}
              </h3>

              {vehicle.recommended && (
                <span className="rounded bg-emerald-700 px-1.5 py-0.5 text-[8px] font-black text-white">
                  BEST MATCH
                </span>
              )}
            </div>

            <p className="mt-0.5 truncate text-[10px] text-emerald-700">
              {vehicle.type}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p
            className={`text-[15px] font-bold ${
              vehicle.score >= 90
                ? "text-emerald-700"
                : vehicle.score >= 80
                  ? "text-emerald-600"
                  : "text-amber-600"
            }`}
          >
            {vehicle.score}%
          </p>

          <p className="text-[9px] text-emerald-600">
            MATCH
          </p>
        </div>
      </div>

      {/* METRICS */}

      <div className="mt-3 grid grid-cols-3 gap-2">
        <VehicleMetric
          label="Distance"
          value={vehicle.distance}
        />

        <VehicleMetric
          label="ETA"
          value={vehicle.eta}
        />

        <VehicleMetric
          label="Battery"
          value={`${vehicle.battery}%`}
          danger={lowBattery}
        />
      </div>

      {/* TRAFFIC */}

      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-emerald-100 pt-2.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
              vehicle.traffic === "Low"
                ? "bg-emerald-600"
                : "bg-amber-500"
            }`}
          />

          <span className="truncate text-[10px] text-emerald-700">
            Traffic:{" "}
            <span className="text-emerald-900 font-medium">
              {vehicle.traffic}
            </span>
          </span>
        </div>

        <span
          className={`shrink-0 text-[9px] font-bold ${
            lowBattery
              ? "text-red-600"
              : "text-emerald-700"
          }`}
        >
          {vehicle.status}
        </span>
      </div>

      {/* RECOMMENDATION */}

      {vehicle.recommended && (
        <div className="mt-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50 px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-emerald-700" />

            <span className="text-[10px] font-bold text-emerald-800">
              WHY THIS UNIT
            </span>
          </div>

          <div className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-1 text-[9px] text-emerald-700">
            <span>✓ Feasible route</span>
            <span>✓ Battery sufficient</span>
            <span>✓ No charging needed</span>
            <span>✓ Emergency compatible</span>
          </div>
        </div>
      )}

      {/* SELECTED */}

      {selected && (
        <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[9px] font-bold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" />
          SELECTED FOR DISPATCH
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* VEHICLE METRIC                                                             */
/* -------------------------------------------------------------------------- */

function VehicleMetric({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-md bg-emerald-50/50 border border-emerald-100 px-2.5 py-2">
      <p className="text-[9px] uppercase tracking-wide text-emerald-600">
        {label}
      </p>

      <p
        className={`mt-0.5 text-[11px] font-bold ${
          danger
            ? "text-red-600"
            : "text-emerald-950"
        }`}
      >
        {value}
      </p>
    </div>
  );
}