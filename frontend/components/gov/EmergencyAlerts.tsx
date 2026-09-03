"use client";

import React, { useEffect, useState } from "react";
import { 
  AlertTriangle, 
  Flame, 
  ShieldAlert, 
  Ambulance, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  RefreshCw,
  Truck,
  Sparkles
} from "lucide-react";
import { api } from "@/lib/api";

export interface EmergencyAlert {
  incident_id: string;
  incident_type: string;
  summary: string;
  keywords: string[];
  district: string;
  latitude: number;
  longitude: number;
  status: string;
  selected_vehicle?: string | null;
  eta_minutes?: number | null;
  created_at: string;
}

export default function EmergencyAlerts() {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const response = await api.get<EmergencyAlert[]>("/emergency/alerts");
      setAlerts(response.data || []);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch emergency alerts:", err);
      setError("Unable to sync live alerts. Backend offline or endpoint unreachable.");
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Poll every 12 seconds for live 112 citizen alerts
    const interval = setInterval(() => {
      fetchAlerts();
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const getCategoryTheme = (type: string) => {
    const t = (type || "").toLowerCase();
    if (t.includes("fire")) {
      return {
        label: "FIRE EMERGENCY",
        icon: Flame,
        badgeBg: "bg-rose-500/20 text-rose-300 border-rose-500/40",
        border: "border-rose-500/40",
        iconColor: "text-rose-400"
      };
    }
    if (t.includes("police") || t.includes("crime") || t.includes("security")) {
      return {
        label: "POLICE DISPATCH",
        icon: ShieldAlert,
        badgeBg: "bg-blue-500/20 text-blue-300 border-blue-500/40",
        border: "border-blue-500/40",
        iconColor: "text-blue-400"
      };
    }
    return {
      label: "MEDICAL / AMBULANCE",
      icon: Ambulance,
      badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
      border: "border-emerald-500/40",
      iconColor: "text-emerald-400"
    };
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black uppercase tracking-wider text-white">
                Live 112 Emergency Alerts
              </h2>
              <span className="text-[10px] font-mono font-bold bg-rose-500/20 border border-rose-500/40 text-rose-300 px-2 py-0.5 rounded-full">
                ACTIVE QUEUE ({alerts.length})
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Direct citizen emergency feed with AI factual summarization & smart vehicle dispatch
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchAlerts(true)}
          disabled={refreshing}
          className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-400" : ""}`} />
          {refreshing ? "SYNCING..." : "REFRESH FEED"}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchAlerts(true)} className="underline font-bold text-xs ml-2">Retry</button>
        </div>
      )}

      {/* Loading state */}
      {loading && alerts.length === 0 ? (
        <div className="py-8 text-center text-xs font-mono text-slate-500 space-y-2">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-slate-400" />
          <p>Connecting to Emergency Dispatch Feed...</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500">
          No active emergency reports in the queue. All operational sectors clear.
        </div>
      ) : (
        /* Alerts List */
        <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
          {alerts.map((alert) => {
            const theme = getCategoryTheme(alert.incident_type);
            const IconComponent = theme.icon;

            return (
              <div
                key={alert.incident_id}
                className={`p-4 rounded-xl border bg-slate-950/70 ${theme.border} space-y-3 transition-all hover:bg-slate-950`}
              >
                {/* Top line: Badges & Time */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-black uppercase px-2.5 py-1 rounded border flex items-center gap-1.5 ${theme.badgeBg}`}>
                      <IconComponent className="w-3.5 h-3.5" />
                      {theme.label}
                    </span>
                    <span className="text-xs font-mono font-bold text-white tracking-wider">
                      {alert.incident_id}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                      alert.status === "DISPATCHED"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                    }`}>
                      {alert.status}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* AI Summary */}
                <div className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-2.5">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-400 mb-1">
                    <Sparkles className="w-3 h-3" />
                    AI Factual Incident Summary
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {alert.summary || "Emergency reported by citizen. Response unit allocated."}
                  </p>
                </div>

                {/* Keywords pill list */}
                {alert.keywords && alert.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {alert.keywords.map((kw, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>
                )}

                {/* Location and Assigned Unit Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2 border-t border-slate-800/60 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">
                      <strong className="text-white">{alert.district || "Delhi NCR"}</strong>{" "}
                      <span className="text-slate-500 text-[10px]">
                        ({alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)})
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Truck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>
                      Unit: <strong className="text-white">{alert.selected_vehicle || "Not available yet"}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      ETA:{" "}
                      <strong className="text-emerald-400 font-bold">
                        {alert.eta_minutes ? `${alert.eta_minutes.toFixed(1)} mins` : "Not available yet"}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
