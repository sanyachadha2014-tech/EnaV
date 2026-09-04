"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useEffect } from "react";
import { api } from "@/lib/api";
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
  AlertTriangle,
  Loader2,
  Flame,
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
/* INCIDENT STATUS & CLASSIFICATION LOGIC                                     */
/* -------------------------------------------------------------------------- */

export const isAwaitedStatus = (status?: string | null) => {
  const s = (status || "").toLowerCase();
  return s === "awaited" || s.includes("pending") || s === "new";
};

export const isAssignedStatus = (status?: string | null) => {
  const s = (status || "").toLowerCase();
  return s === "assigned" || s === "dispatched" || s.includes("route");
};

export const isCompletedStatus = (status?: string | null) => {
  const s = (status || "").toLowerCase();
  return s === "completed" || s === "resolved" || s === "closed";
};

export const isActiveIncident = (status?: string | null) => !isCompletedStatus(status);

/* -------------------------------------------------------------------------- */
/* INCIDENT DATA                                                              */
/* -------------------------------------------------------------------------- */

const initialIncidents = [
  {
    id: "INC-112-4590",
    incident_id: "INC-112-4590",
    type: "Medical Emergency",
    incident_type: "medical",
    location: "Janakpuri District Centre, West Delhi",
    address: "Janakpuri District Centre, West Delhi",
    district: "West Delhi",
    distance: "2.8 km",
    received: "14:32 IST",
    priority: "HIGH",
    source: "112 Emergency Network",
    status: "PENDING_RESOURCES",
    selected_vehicle: null,
    vehicle_type: null,
    eta_minutes: null,
    distance_km: null,
    latitude: 28.6290,
    longitude: 77.0780,
    assigned_vehicle_location: null,
    route_geometry: null,
    summary: "Two-vehicle collision with passenger injury at Janakpuri District Centre.",
  },
  {
    id: "INC-112-9842",
    incident_id: "INC-112-9842",
    type: "Fire Hazard",
    incident_type: "fire",
    location: "Outer Ring Road, Janakpuri, West Delhi",
    address: "Outer Ring Road, Janakpuri, West Delhi",
    district: "West Delhi",
    distance: "3.2 km",
    received: "14:28 IST",
    priority: "CRITICAL",
    source: "112 Emergency Network",
    status: "DISPATCHED",
    selected_vehicle: "FIRE-001",
    vehicle_type: "Electric Fire Engine",
    eta_minutes: 6.8,
    distance_km: 3.2,
    latitude: 28.6328,
    longitude: 77.0854,
    assigned_vehicle_location: { lat: 28.6250, lng: 77.2150 },
    route_geometry: null,
    summary: "Electrical transformer flare-up reported near Outer Ring Road.",
  },
  {
    id: "INC-112-9811",
    incident_id: "INC-112-9811",
    type: "Medical Emergency",
    incident_type: "medical",
    location: "Connaught Place Central, New Delhi",
    address: "Connaught Place Central, New Delhi",
    district: "New Delhi",
    distance: "5.1 km",
    received: "14:21 IST",
    priority: "HIGH",
    source: "112 Emergency Network",
    status: "DISPATCHED",
    selected_vehicle: "AMB-001",
    vehicle_type: "Advanced Life Support",
    eta_minutes: 4.5,
    distance_km: 2.1,
    latitude: 28.6139,
    longitude: 77.2090,
    assigned_vehicle_location: { lat: 28.6120, lng: 77.2150 },
    route_geometry: null,
    summary: "Pedestrian heat exhaustion near transit junction.",
  },
];

/* -------------------------------------------------------------------------- */
/* VEHICLE DATA                                                               */
/* -------------------------------------------------------------------------- */

const initialVehicles = [
  {
    id: "FIRE-001",
    type: "Electric Fire Engine",
    vehicle_type: "fire",
    distance: "Monitored",
    battery: 80,
    latitude: 28.6250,
    longitude: 77.2150,
    eta: "Ready",
    traffic: "Normal",
    recommended: true,
    status: "AVAILABLE",
  },
  {
    id: "FIRE-002",
    type: "Electric Fire Engine",
    vehicle_type: "fire",
    distance: "Monitored",
    battery: 11,
    latitude: 28.6150,
    longitude: 77.2100,
    eta: "Low Reserve",
    traffic: "Normal",
    recommended: false,
    status: "LOW BATTERY",
  },
  {
    id: "FIRE-004",
    type: "Electric Fire Engine",
    vehicle_type: "fire",
    distance: "Monitored",
    battery: 90,
    latitude: 28.6350,
    longitude: 77.2300,
    eta: "Ready",
    traffic: "Normal",
    recommended: true,
    status: "AVAILABLE",
  },
  {
    id: "POLICE-001",
    type: "Police Interceptor",
    vehicle_type: "police",
    distance: "Monitored",
    battery: 85,
    latitude: 28.6140,
    longitude: 77.2080,
    eta: "Ready",
    traffic: "Normal",
    recommended: true,
    status: "AVAILABLE",
  },
  {
    id: "POLICE-002",
    type: "Police Interceptor",
    vehicle_type: "police",
    distance: "Monitored",
    battery: 40,
    latitude: 28.6300,
    longitude: 77.2200,
    eta: "Ready",
    traffic: "Normal",
    recommended: false,
    status: "AVAILABLE",
  },
  {
    id: "AMB-001",
    type: "Advanced Life Support",
    vehicle_type: "ambulance",
    distance: "Monitored",
    battery: 75,
    latitude: 28.6120,
    longitude: 77.2150,
    eta: "Ready",
    traffic: "Normal",
    recommended: true,
    status: "AVAILABLE",
  },
  {
    id: "AMB-002",
    type: "Advanced Life Support",
    vehicle_type: "ambulance",
    distance: "Monitored",
    battery: 80,
    latitude: 28.6200,
    longitude: 77.2000,
    eta: "Ready",
    traffic: "Normal",
    recommended: true,
    status: "AVAILABLE",
  },
];

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function EmergencyPage() {
  const [incidentsList, setIncidentsList] = useState<any[]>([]);
  const [vehiclesList, setVehiclesList] = useState<any[]>(initialVehicles);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>("INC-112-4590");
  const [selectedVehicleId, setSelectedVehicleId] = useState("FIRE-001");

  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchToast, setDispatchToast] = useState<{
    vehicleId: string;
    incidentId: string;
    eta: string;
    vehicleType: string;
  } | null>(null);
  const [dispatchError, setDispatchError] = useState<string | null>(null);

  const fetchIncidentsAndVehicles = async () => {
    try {
      const [alertsRes, vehiclesRes] = await Promise.allSettled([
        api.get("/emergency/alerts"),
        api.get("/emergency/vehicles"),
      ]);

      if (alertsRes.status === "fulfilled" && alertsRes.value.data && alertsRes.value.data.length > 0) {
        const mapped = alertsRes.value.data.map((item: any) => {
          const isFire = (item.incident_type || "").toLowerCase().includes("fire");
          const isPolice = (item.incident_type || "").toLowerCase().includes("police");
          const typeLabel = isFire ? "Fire Hazard" : isPolice ? "Police Assistance" : "Medical Emergency";

          return {
            id: item.incident_id,
            incident_id: item.incident_id,
            type: typeLabel,
            incident_type: item.incident_type,
            location: item.address || item.district || "Delhi NCR",
            address: item.address || item.district || "Delhi NCR",
            district: item.district || "Delhi NCR",
            distance: item.distance_km
              ? `${item.distance_km.toFixed(1)} km`
              : `${(item.latitude ? Math.abs(item.latitude - 28.6) * 40 + 2.5 : 3.8).toFixed(1)} km`,
            received: new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " IST",
            priority: isFire ? "CRITICAL" : "HIGH",
            source: "112 Emergency Network",
            status: item.status || "AWAITED",
            selected_vehicle: item.selected_vehicle || null,
            vehicle_type: item.vehicle_type || null,
            eta_minutes: item.eta_minutes || null,
            distance_km: item.distance_km || null,
            assigned_vehicle_location: item.assigned_vehicle_location || null,
            route_geometry: item.route_geometry || null,
            latitude: item.latitude || 28.6139,
            longitude: item.longitude || 77.2090,
            summary: item.summary || "Citizen emergency reported.",
          };
        });
        setIncidentsList(mapped);
      }

      if (vehiclesRes.status === "fulfilled" && vehiclesRes.value.data && vehiclesRes.value.data.length > 0) {
        setVehiclesList(vehiclesRes.value.data);
      }
    } catch (err) {
      console.warn("Error synchronizing emergency data:", err);
    }
  };

  useEffect(() => {
    fetchIncidentsAndVehicles();
    const interval = setInterval(fetchIncidentsAndVehicles, 8000);
    return () => clearInterval(interval);
  }, []);

  const incidents = incidentsList.length > 0 ? incidentsList : initialIncidents;
  const vehicles = vehiclesList.length > 0 ? vehiclesList : initialVehicles;

  useEffect(() => {
    if (incidents.length > 0 && (!selectedIncidentId || !incidents.find((i) => i.id === selectedIncidentId))) {
      setSelectedIncidentId(incidents[0].id);
    }
  }, [incidents, selectedIncidentId]);

  const selectedIncident =
    incidents.find((incident) => incident.id === selectedIncidentId) ?? incidents[0];

  const sortedVehicles = useMemo(() => {
    if (!selectedIncident) return vehicles;
    const incType = (selectedIncident.incident_type || selectedIncident.type || "").toLowerCase();
    const reqType = incType.includes("fire") ? "fire" : incType.includes("police") ? "police" : "ambulance";

    return [...vehicles].sort((a, b) => {
      // 1. Available status first
      const aAvail = a.status === "AVAILABLE" ? 1 : 0;
      const bAvail = b.status === "AVAILABLE" ? 1 : 0;
      if (aAvail !== bAvail) return bAvail - aAvail;

      // 2. Matching vehicle type next
      const aType = (a.vehicle_type || a.type || a.id || "").toLowerCase();
      const bType = (b.vehicle_type || b.type || b.id || "").toLowerCase();
      const aMatch = aType.includes(reqType) ? 1 : 0;
      const bMatch = bType.includes(reqType) ? 1 : 0;
      if (aMatch !== bMatch) return bMatch - aMatch;

      // 3. Higher battery next
      return (b.battery || 0) - (a.battery || 0);
    });
  }, [vehicles, selectedIncident]);

  const selectedVehicle =
    vehicles.find(
      (vehicle) => vehicle.id === selectedVehicleId,
    ) ?? sortedVehicles[0] ?? vehicles[0];

  useEffect(() => {
    if (sortedVehicles.length > 0) {
      const match = sortedVehicles.find((v) => v.id === selectedVehicleId);
      if (!match || match.status !== "AVAILABLE") {
        const firstAvailable = sortedVehicles.find((v) => v.status === "AVAILABLE") || sortedVehicles[0];
        if (firstAvailable) {
          setSelectedVehicleId(firstAvailable.id);
        }
      }
    }
  }, [selectedIncidentId, sortedVehicles]);

  const availableVehicles = useMemo(
    () =>
      vehicles.filter(
        (vehicle) => vehicle.status === "AVAILABLE",
      ),
    [vehicles],
  );

  // Status Counts dynamically calculated from the single source of truth
  const openIncidents = incidents.filter((incident) => isActiveIncident(incident.status)).length;
  const awaitedCount = incidents.filter((i) => isAwaitedStatus(i.status)).length;
  const assignedCount = incidents.filter((i) => isAssignedStatus(i.status)).length;
  const completedCount = incidents.filter((i) => isCompletedStatus(i.status)).length;

  // Actual EV Dispatch Assignment Action
  const handleDispatch = async () => {
    if (!selectedIncident || !selectedVehicle || selectedVehicle.status !== "AVAILABLE" || isDispatching) {
      return;
    }

    setIsDispatching(true);
    setDispatchError(null);

    try {
      const res = await api.post("/emergency/dispatch", {
        incident_id: selectedIncident.id,
        vehicle_id: selectedVehicle.id,
        vehicle_type: selectedVehicle.type,
        eta_minutes: parseFloat(selectedVehicle.eta) || 6.2,
        distance_km: parseFloat(selectedVehicle.distance) || 3.2,
      });

      const updatedEta = res.data.eta_minutes ? `${res.data.eta_minutes.toFixed(1)} min` : selectedVehicle.eta;

      // Update incident state locally immediately
      setIncidentsList((prev) =>
        (prev.length > 0 ? prev : initialIncidents).map((inc) =>
          inc.id === selectedIncident.id
            ? {
                ...inc,
                status: "DISPATCHED",
                selected_vehicle: selectedVehicle.id,
                vehicle_type: selectedVehicle.type,
                eta_minutes: res.data.eta_minutes,
                distance_km: res.data.distance_km,
                assigned_vehicle_location: res.data.assigned_vehicle_location,
                route_geometry: res.data.route_geometry,
              }
            : inc
        )
      );

      // Update vehicles state locally immediately
      setVehiclesList((prev) =>
        prev.map((veh) =>
          veh.id === selectedVehicle.id
            ? { ...veh, status: "EN ROUTE", eta: updatedEta }
            : veh
        )
      );

      // Show confirmation toast
      setDispatchToast({
        vehicleId: selectedVehicle.id,
        incidentId: selectedIncident.id,
        eta: updatedEta,
        vehicleType: selectedVehicle.type,
      });

      // Refetch from backend to guarantee complete sync
      fetchIncidentsAndVehicles();
    } catch (err: any) {
      console.error("Dispatch assignment failure:", err);
      setDispatchError("Unable to dispatch vehicle. Please try again or select another available unit.");
    } finally {
      setIsDispatching(false);
    }
  };

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

      <main className="h-[calc(100vh-68px)] min-h-0 w-full overflow-hidden p-3 flex flex-col">
        {/* SUCCESS DISPATCH BANNER */}
        {dispatchToast && (
          <div className="mb-2 shrink-0 rounded-xl border border-emerald-500 bg-emerald-950 p-3 text-white shadow-xl flex items-center justify-between z-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-lg font-bold">
                🚑
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-emerald-300">
                    {dispatchToast.vehicleId} DISPATCHED
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold uppercase border border-emerald-500/40">
                    EN ROUTE
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Unit is now en route to Incident <strong>#{dispatchToast.incidentId}</strong> • Type: {dispatchToast.vehicleType} • ETA: <strong className="text-emerald-300">{dispatchToast.eta}</strong>
                </p>
              </div>
            </div>
            <button
              onClick={() => setDispatchToast(null)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 font-mono"
            >
              ✕
            </button>
          </div>
        )}

        {/* ERROR BANNER */}
        {dispatchError && (
          <div className="mb-2 shrink-0 rounded-xl border border-red-500/50 bg-red-950/90 p-3 text-red-200 text-xs flex items-center justify-between z-50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
              <span>{dispatchError}</span>
            </div>
            <button
              onClick={() => setDispatchError(null)}
              className="text-red-400 hover:text-white font-mono px-2 py-0.5"
            >
              ✕
            </button>
          </div>
        )}

        <div
          className="
            grid
            flex-1
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
                          className={`font-bold uppercase px-1.5 py-0.5 rounded text-[9px] ${
                            isAssignedStatus(incident.status)
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : isCompletedStatus(incident.status)
                              ? "bg-slate-100 text-slate-600 border border-slate-200"
                              : "bg-amber-100 text-amber-800 border border-amber-300"
                          }`}
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
              <CommandMap
                incidents={incidents.map((i) => ({
                  incident_id: i.id,
                  incident_type: i.incident_type || (i.type.toLowerCase().includes("fire") ? "fire" : i.type.toLowerCase().includes("police") ? "police" : "medical"),
                  address: i.address || i.location,
                  district: i.district,
                  latitude: i.latitude || 28.6139,
                  longitude: i.longitude || 77.2090,
                  status: i.status,
                  selected_vehicle: i.selected_vehicle,
                  vehicle_type: i.vehicle_type,
                  eta_minutes: i.eta_minutes,
                  summary: i.summary,
                  assigned_vehicle_location: i.assigned_vehicle_location,
                  route_geometry: i.route_geometry,
                }))}
                selectedIncidentId={selectedIncident?.id}
                onSelectIncident={(id) => setSelectedIncidentId(id)}
              />

              {/* INCIDENT MAP CARD */}
              <div className="absolute left-3 top-3 z-[400] max-w-[calc(100%-24px)] rounded-lg border border-red-200 bg-white/95 px-3.5 py-2.5 shadow-xl backdrop-blur">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-red-500" />
                  <span className="text-[12px] font-bold text-red-600 font-mono">
                    INCIDENT #{selectedIncident?.id}
                  </span>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                    {selectedIncident?.status}
                  </span>
                </div>

                <p className="mt-1 truncate text-[11px] text-emerald-800 font-medium">
                  📍 {selectedIncident?.address || selectedIncident?.location}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  District: {selectedIncident?.district} · Type: {selectedIncident?.type}
                </p>
              </div>

              {/* RESPONSE CORRIDOR */}
              <div className="absolute bottom-3 left-3 right-3 z-[400] rounded-lg border border-emerald-200 bg-white/95 p-3.5 shadow-xl backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Navigation className="h-4 w-4 shrink-0 text-emerald-700" />

                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-900">
                        Assigned Unit: <span className="text-emerald-700 font-mono">{selectedIncident?.selected_vehicle || selectedVehicle?.id}</span>
                      </p>
                      <p className="mt-0.5 truncate text-[10px] text-emerald-800 font-medium">
                        Optimized for emergency priority and vehicle battery reserve
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <p className="text-[15px] font-bold text-emerald-700 font-mono">
                      {selectedIncident?.eta_minutes ? `${selectedIncident.eta_minutes.toFixed(1)} min` : selectedVehicle?.eta || "6 min"}
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
                {sortedVehicles.map((vehicle) => (
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

            <div className="shrink-0 border-t border-emerald-200 p-3.5 space-y-3 bg-white">
              {/* Unit Specifications & Dispatch Context */}
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3 text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                    Selected Unit Dispatch
                  </span>
                  <span className="font-mono font-bold text-emerald-950 text-[11px]">
                    {selectedVehicle?.id || "None Selected"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] font-mono text-slate-700">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-sans">Vehicle Type</span>
                    <strong className="text-slate-900">{selectedVehicle?.type || "Unavailable"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-sans">Battery SOC</span>
                    <strong className={selectedVehicle && selectedVehicle.battery < 20 ? "text-red-600" : "text-emerald-800"}>
                      {selectedVehicle?.battery !== undefined ? `${selectedVehicle.battery}%` : "Unavailable"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-sans">Vehicle Location</span>
                    <strong className="text-slate-900">
                      {selectedVehicle?.latitude !== undefined && selectedVehicle?.longitude !== undefined
                        ? `${Number(selectedVehicle.latitude).toFixed(4)}, ${Number(selectedVehicle.longitude).toFixed(4)}`
                        : "Unavailable"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-sans">Target Incident</span>
                    <strong className="text-slate-900 truncate block">
                      #{selectedIncident?.id}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-sans">Incident Location</span>
                    <strong className="text-slate-900 truncate block" title={selectedIncident?.address || selectedIncident?.location}>
                      {selectedIncident?.address || selectedIncident?.location || "Unavailable"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-sans">Distance / ETA</span>
                    <strong className="text-emerald-700">
                      {selectedIncident?.distance_km && selectedIncident?.eta_minutes
                        ? `${Number(selectedIncident.distance_km).toFixed(1)} km · ${Number(selectedIncident.eta_minutes).toFixed(1)}m`
                        : isAssignedStatus(selectedIncident?.status)
                        ? "Active Dispatch"
                        : "Calculated on Dispatch"}
                    </strong>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDispatch}
                disabled={
                  isDispatching ||
                  selectedVehicle?.status !== "AVAILABLE" ||
                  isAssignedStatus(selectedIncident?.status)
                }
                className={`flex w-full items-center justify-center gap-2 rounded-lg px-3 py-3 text-[12px] font-bold transition shadow-lg ${
                  isDispatching
                    ? "bg-emerald-600 text-white cursor-wait opacity-80"
                    : isAssignedStatus(selectedIncident?.status)
                    ? "bg-slate-100 text-slate-500 border border-slate-300 cursor-not-allowed"
                    : selectedVehicle?.status === "AVAILABLE"
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-emerald-700/20 active:scale-[0.98] cursor-pointer"
                    : "cursor-not-allowed bg-emerald-100 text-emerald-400"
                }`}
              >
                {isDispatching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>DISPATCHING UNIT VIA OSRM...</span>
                  </>
                ) : isAssignedStatus(selectedIncident?.status) ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>✓ UNIT DISPATCHED ({selectedIncident?.selected_vehicle || selectedVehicle?.id})</span>
                  </>
                ) : selectedVehicle?.status === "AVAILABLE" ? (
                  <>
                    <Siren className="h-4 w-4" />
                    <span>DISPATCH {selectedVehicle?.id}</span>
                  </>
                ) : (
                  <span>UNIT NOT DISPATCHABLE ({selectedVehicle?.status})</span>
                )}
              </button>

              <p className="mt-1 text-center text-[10px] text-emerald-600">
                {isAssignedStatus(selectedIncident?.status)
                  ? `Live emergency route active for unit ${selectedIncident?.selected_vehicle || selectedVehicle?.id}.`
                  : "Dispatch creates a live OSRM road route from vehicle coordinates."}
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
  vehicle: any;
  selected: boolean;
  onSelect: () => void;
}) {
  const lowBattery = typeof vehicle.battery === "number" && vehicle.battery < 20;
  const isFire = (vehicle.id || "").toLowerCase().includes("fire") || (vehicle.vehicle_type || vehicle.type || "").toLowerCase().includes("fire");
  const isPolice = (vehicle.id || "").toLowerCase().includes("police") || (vehicle.vehicle_type || vehicle.type || "").toLowerCase().includes("police");

  return (
    <div
      onClick={onSelect}
      className={`w-full rounded-xl border p-3.5 text-left transition cursor-pointer ${
        selected
          ? "border-emerald-500 bg-emerald-50/60 shadow-md shadow-emerald-100"
          : "border-emerald-200 bg-white hover:border-emerald-300"
      }`}
    >
      {/* TITLE & ICON */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              lowBattery
                ? "bg-red-50 text-red-600 border border-red-200"
                : isFire
                ? "bg-red-100 text-red-700"
                : isPolice
                ? "bg-blue-100 text-blue-700"
                : selected
                ? "bg-emerald-100 text-emerald-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {isFire ? (
              <Flame className="h-4 w-4 text-red-600" />
            ) : isPolice ? (
              <ShieldCheck className="h-4 w-4 text-blue-600" />
            ) : (
              <Ambulance className="h-4 w-4 text-emerald-600" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="text-[13px] font-bold text-emerald-950">
                {vehicle.id}
              </h3>

              {vehicle.recommended && (
                <span className="rounded bg-emerald-700 px-1.5 py-0.5 text-[8px] font-black text-white uppercase">
                  RECOMMENDED
                </span>
              )}
            </div>

            <p className="mt-0.5 truncate text-[10px] text-emerald-700">
              {vehicle.type}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right font-mono">
          <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-bold uppercase ${
            vehicle.status === "AVAILABLE"
              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
              : vehicle.status === "EN ROUTE" || vehicle.status === "BUSY"
              ? "bg-blue-100 text-blue-800 border border-blue-300 animate-pulse"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}>
            {vehicle.status}
          </span>
          <p className="text-[11px] text-emerald-800 font-bold mt-1">
            {vehicle.battery !== undefined ? `${vehicle.battery}% SOC` : "Unavailable"}
          </p>
        </div>
      </div>

      {/* METRICS */}
      <div className="mt-3 grid grid-cols-3 gap-2">
        <VehicleMetric
          label="Location"
          value={
            vehicle.latitude !== undefined && vehicle.longitude !== undefined
              ? `${Number(vehicle.latitude).toFixed(2)}, ${Number(vehicle.longitude).toFixed(2)}`
              : "Unavailable"
          }
        />

        <VehicleMetric
          label="Battery"
          value={vehicle.battery !== undefined ? `${vehicle.battery}% SOC` : "Unavailable"}
          danger={lowBattery}
        />

        <VehicleMetric
          label="Status"
          value={vehicle.status || "Unavailable"}
        />
      </div>

      <div className="mt-2 text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <span>Coords: {vehicle.latitude !== undefined && vehicle.longitude !== undefined ? `${Number(vehicle.latitude).toFixed(4)}, ${Number(vehicle.longitude).toFixed(4)}` : "Unavailable"}</span>
        <span>Type: {vehicle.vehicle_type || (isFire ? "fire" : isPolice ? "police" : "ambulance")}</span>
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
            vehicle.status === "EN ROUTE"
              ? "text-blue-700 font-bold"
              : lowBattery
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