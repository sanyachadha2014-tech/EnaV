"use client";

import { useState } from "react";
import {
  Shield,
  Award,
  CheckCircle,
  MapPin,
  Phone,
  Mail,
  Truck,
  Navigation,
  FileCheck,
  Settings,
  Zap,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* GOV DRIVER DATA & EDITABLE PARAMETERS CONFIGURATION                        */
/* -------------------------------------------------------------------------- */

const initialDriverData = {
  name: "Rajesh Kumar",
  id: "GOV-DL-88241",
  department: "Delhi Transport Infrastructure Development Corporation (DTIDC)",
  designation: "Senior Official Fleet Driver",
  zone: "Central & New Delhi Zone",
  status: "On Duty / Active",
  phone: "+91 98712 34567",
  email: "rajesh.kumar@dtidc.gov.in",
  licenseNo: "DL-0420180098231",
  licenseValidTill: "14 March 2031",
  badgeNumber: "DTIDC-DRV-409",
  medicalFitness: "Verified & Cleared (May 2026)",
  assignedVehicle: {
    model: "Electric Fleet Sedan (EV-04)",
    regNo: "DL 1C AB 4421",
    batteryStatus: "84%",
    lastInspection: "Today, 06:30 AM",
  },
  metrics: {
    totalTrips: "1,420+",
    safetyScore: "99.4%",
    punctuality: "99.8%",
    accidents: "0",
  },
  certifications: [
    "Govt. Advanced EV Fleet Handling",
    "VIP Protocol & Defensive Driving",
    "First Aid & Emergency Response Certified",
  ],
  recentLogs: [
    { task: "Transported delegation from Secretariat to IGDTUW Zone", time: "Today, 03:30 PM", status: "Completed" },
    { task: "Scheduled weekly vehicle battery & safety audit", time: "Today, 07:00 AM", status: "Passed" },
    { task: "Inter-department transit duty (Planning Committee)", time: "Yesterday", status: "Completed" },
  ],
};

export default function GovDriverProfilePage() {
  const [activeTab, setActiveTab] = useState<"overview" | "vehicle" | "logs" | "parameters">("overview");

  // Editable routing parameters state requested for the driver profile
  const [routingParams, setRoutingParams] = useState({
    batteryCapacityKwh: 75.0,
    currentSocPct: 84.0,
    consumptionRateKwhPerKm: 0.15,
    minReservePct: 15.0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Validation check: ensure all parameters are filled and valid numbers
  const isFormComplete = Boolean(
    routingParams.currentSocPct !== undefined &&
    routingParams.batteryCapacityKwh !== undefined &&
    routingParams.consumptionRateKwhPerKm !== undefined &&
    routingParams.minReservePct !== undefined
  );

  const handleOptimizeRoute = async () => {
    setIsLoading(true);
    setSuccessMessage("");
    try {
      // Retrieve stored source/destination or use defaults
      const storedSource = JSON.parse(localStorage.getItem("optimizer_source") || '{"lat": 28.6139, "lng": 77.2090}');
      const storedDest = JSON.parse(localStorage.getItem("optimizer_destination") || '{"lat": 28.6562, "lng": 77.2410}');

      const response = await fetch("http://localhost:8000/route/optimize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: storedSource,
          destination: storedDest,
          vehicle: {
            vehicle_id: "EV-GOV-01",
            vehicle_type: "citizen",
            battery_percentage: routingParams.currentSocPct,
            battery_capacity_kwh: routingParams.batteryCapacityKwh,
            consumption_kwh_per_km: routingParams.consumptionRateKwhPerKm,
            minimum_reserve_pct: routingParams.minReservePct,
          },
          emergency: false,
        }),
      });
      const data = await response.json();
      
      // Store result globally so ss1 handles display without rendering any summary cards here
      localStorage.setItem("latest_route_evaluation", JSON.stringify(data));
      setSuccessMessage("Parameters synced successfully! Check your main routing view for updated paths.");
    } catch (error) {
      console.error("Failed to optimize route:", error);
    } finally {
      setIsLoading(false);
    }	
  };

  const handleParamChange = (field: string, value: number) => {
    setRoutingParams((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="min-h-screen w-full bg-[#030712] text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* ================================================================== */}
      {/* HEADER                                                             */}
      {/* ================================================================== */}

      <header className="sticky top-0 z-50 border-b border-emerald-900/40 bg-[#030712]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-white block">
                GOVERNMENT FLEET PORTAL
              </span>
              <span className="text-[10px] tracking-wider uppercase text-emerald-400 font-semibold">
                Official Driver Profile & Optimizer Inputs
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {initialDriverData.status}
            </span>
          </div>
        </div>
      </header>

      {/* ================================================================== */}
      {/* MAIN CONTAINER                                                     */}
      {/* ================================================================== */}

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* ================================================================ */}
        {/* HERO CARD                                                        */}
        {/* ================================================================ */}

        <section className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/30 p-8 shadow-2xl">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-600 to-emerald-800 p-1 shadow-xl shadow-emerald-950">
                  <div className="flex h-full w-full items-center justify-center rounded-xl bg-slate-950 text-2xl font-black text-emerald-400">
                    RK
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-900 bg-emerald-500 text-slate-950">
                  <CheckCircle className="h-3.5 w-3.5 fill-emerald-500 text-slate-950" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    {initialDriverData.name}
                  </h1>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-bold text-emerald-400">
                    ID: {initialDriverData.id}
                  </span>
                </div>
                <p className="text-sm font-medium text-emerald-300/80">
                  {initialDriverData.designation} • <span className="text-slate-300">{initialDriverData.department}</span>
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                    {initialDriverData.zone}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-emerald-400" />
                    {initialDriverData.phone}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-emerald-400" />
                    {initialDriverData.email}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================ */}
        {/* METRICS GRID                                                     */}
        {/* ================================================================ */}

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Missions</span>
            <p className="mt-3 text-3xl font-black text-white">{initialDriverData.metrics.totalTrips}</p>
            <p className="mt-1 text-[11px] text-emerald-400 font-medium">Zero security incidents</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Safety Score</span>
            <p className="mt-3 text-3xl font-black text-white">{initialDriverData.metrics.safetyScore}</p>
            <p className="mt-1 text-[11px] text-emerald-400 font-medium">Top tier rating</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Punctuality</span>
            <p className="mt-3 text-3xl font-black text-white">{initialDriverData.metrics.punctuality}</p>
            <p className="mt-1 text-[11px] text-emerald-400 font-medium">Verified logs</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Incidents</span>
            <p className="mt-3 text-3xl font-black text-emerald-400">{initialDriverData.metrics.accidents}</p>
            <p className="mt-1 text-[11px] text-slate-400 font-medium">Flawless record</p>
          </div>
        </div>

        {/* ================================================================ */}
        {/* NAVIGATION TABS                                                  */}
        {/* ================================================================ */}

        <div className="space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-px overflow-x-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
                activeTab === "overview"
                  ? "border-emerald-400 text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Credentials & Medical
            </button>
            <button
              onClick={() => setActiveTab("vehicle")}
              className={`border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
                activeTab === "vehicle"
                  ? "border-emerald-400 text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Assigned Vehicle
            </button>
            <button
              onClick={() => setActiveTab("parameters")}
              className={`border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === "parameters"
                  ? "border-emerald-400 text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Settings className="h-3.5 w-3.5" />
              Optimizer Inputs & Telemetry
            </button>
            <button
              onClick={() => setActiveTab("logs")}
              className={`border-b-2 px-4 py-3 text-xs font-bold uppercase tracking-wider transition whitespace-nowrap ${
                activeTab === "logs"
                  ? "border-emerald-400 text-emerald-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Duty Logs & History
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/40 p-6 space-y-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Official Certifications & Training
                </h3>
                <div className="space-y-3">
                  {initialDriverData.certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                      <Award className="h-5 w-5 text-emerald-400 shrink-0" />
                      <span className="text-xs font-semibold text-slate-200">{cert}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Medical & Fitness Clearance
                  </h3>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center justify-between">
                    <span className="text-xs font-medium text-emerald-300">{initialDriverData.medicalFitness}</span>
                    <FileCheck className="h-5 w-5 text-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  License Credentials
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3.5">
                    <p className="text-slate-400">License Number</p>
                    <p className="font-bold text-white mt-0.5">{initialDriverData.licenseNo}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3.5">
                    <p className="text-slate-400">Valid Till</p>
                    <p className="font-bold text-emerald-400 mt-0.5">{initialDriverData.licenseValidTill}</p>
                  </div>
                  <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3.5">
                    <p className="text-slate-400">Official Badge</p>
                    <p className="font-bold text-white mt-0.5">{initialDriverData.badgeNumber}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VEHICLE */}
          {activeTab === "vehicle" && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Truck className="h-6 w-6 text-emerald-400" />
                  <h3 className="text-base font-bold text-white">Assigned Fleet Asset</h3>
                </div>
                <div className="space-y-3 text-xs pt-2">
                  <div className="flex justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                    <span className="text-slate-400">Vehicle Model</span>
                    <span className="font-bold text-white">{initialDriverData.assignedVehicle.model}</span>
                  </div>
                  <div className="flex justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                    <span className="text-slate-400">Registration No.</span>
                    <span className="font-bold text-emerald-400">{initialDriverData.assignedVehicle.regNo}</span>
                  </div>
                  <div className="flex justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                    <span className="text-slate-400">Battery / Fuel Status</span>
                    <span className="font-bold text-emerald-400">{initialDriverData.assignedVehicle.batteryStatus}</span>
                  </div>
                  <div className="flex justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                    <span className="text-slate-400">Last Inspection</span>
                    <span className="font-bold text-white">{initialDriverData.assignedVehicle.lastInspection}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ROUTING & OPTIMIZER PARAMETERS INPUTS */}
          {activeTab === "parameters" && (
            <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/40 p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-emerald-400" />
                    Route Optimizer Profile Inputs
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Configure your EV specifications and battery thresholds. These parameters feed directly into the backend optimizer payload for calculating feasible route metrics.
                  </p>
                </div>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-400">
                  Live Synced to Optimizer
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Parameter 1: Battery Capacity */}
                <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Battery Capacity (kWh)
                    </label>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {routingParams.batteryCapacityKwh} kWh
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Total energy storage capacity of your assigned vehicle's pack.</p>
                  <input
                    type="number"
                    step="1"
                    value={routingParams.batteryCapacityKwh}
                    onChange={(e) => handleParamChange("batteryCapacityKwh", parseFloat(e.target.value) || 0)}
                    className="w-full mt-2 h-11 px-4 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>

                {/* Parameter 2: Current State of Charge (SOC) */}
                <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Current State of Charge (SOC %)
                    </label>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {routingParams.currentSocPct}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">The current live battery percentage at trip initiation.</p>
                  <input
                    type="number"
                    step="1"
                    max="100"
                    min="0"
                    value={routingParams.currentSocPct}
                    onChange={(e) => handleParamChange("currentSocPct", parseFloat(e.target.value) || 0)}
                    className="w-full mt-2 h-11 px-4 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>

                {/* Parameter 3: Energy Consumption Rate */}
                <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Consumption Rate (kWh/km)
                    </label>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {routingParams.consumptionRateKwhPerKm} kWh/km
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Average energy drain rate per kilometer driven.</p>
                  <input
                    type="number"
                    step="0.01"
                    value={routingParams.consumptionRateKwhPerKm}
                    onChange={(e) => handleParamChange("consumptionRateKwhPerKm", parseFloat(e.target.value) || 0)}
                    className="w-full mt-2 h-11 px-4 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>

                {/* Parameter 4: Minimum Reserve Threshold */}
                <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Minimum Reserve Floor (%)
                    </label>
                    <span className="font-mono font-bold text-emerald-400 text-sm">
                      {routingParams.minReservePct}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">Strict safety floor percentage that arrival SOC must never cross.</p>
                  <input
                    type="number"
                    step="1"
                    max="50"
                    min="0"
                    value={routingParams.minReservePct}
                    onChange={(e) => handleParamChange("minReservePct", parseFloat(e.target.value) || 0)}
                    className="w-full mt-2 h-11 px-4 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm focus:border-emerald-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800 flex flex-col gap-4">
                <button
                  onClick={handleOptimizeRoute}
                  disabled={isLoading || !isFormComplete}
                  className={`w-full h-12 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg ${
                    isFormComplete && !isLoading
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-950 cursor-pointer"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  {isLoading ? "Syncing Parameters & Evaluating..." : "Evaluate Routes with Current Parameters"}
                </button>

                {successMessage && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-400 text-center">
                    {successMessage}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: LOGS */}
          {activeTab === "logs" && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Recent Duty Logs
              </h3>
              <div className="space-y-3">
                {initialDriverData.recentLogs.map((log, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                    <div className="flex items-center gap-3">
                      <Navigation className="h-4 w-4 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{log.task}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{log.time}</p>
                      </div>
                    </div>
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}