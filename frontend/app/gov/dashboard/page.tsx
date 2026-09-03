'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { api } from "@/lib/api";

const CommandMap = dynamic(() => import("@/components/CommandMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-slate-100 text-xs font-mono text-slate-500">
      Loading Live Map...
    </div>
  ),
});

export default function GovDashboard() {
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
  const [metrics, setMetrics] = useState({
    registered_evs: 4820,
    ev_stations: 142,
    emergencies_count: 3,
    avg_eta_minutes: 4.2,
    ev_adoption_rate: 18.5,
    co2_avoided_tons: 1240,
  });

  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get("/gov/dashboard-stats");
        if (res.data) {
          if (res.data.metrics) {
            setMetrics(res.data.metrics);
          }
          if (res.data.incidents && res.data.incidents.length > 0) {
            setAlerts(res.data.incidents);
          }
        }
      } catch (err) {
        console.warn("Backend unavailable, using fallback preview data:", err);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col relative">
      
      {/* Top Navbar */}
      <header className="h-16 border-b border-emerald-200/80 px-8 flex items-center justify-between bg-white sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-700/10 border border-emerald-700 flex items-center justify-center text-emerald-800 font-bold">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-wider text-slate-900">ENAV</span>
              <span className="text-[10px] bg-emerald-700 text-white font-semibold px-1.5 py-0.5 rounded">GOV</span>
            </div>
            <p className="text-[10px] text-emerald-800 font-medium tracking-tight">Smart Mobility Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-4 relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications" 
            className="w-9 h-9 rounded-xl border border-emerald-200 flex items-center justify-center text-gray-600 hover:bg-emerald-50 transition relative"
          >
            🔔
            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-700 rounded-full animate-pulse" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-24 top-12 w-80 bg-white rounded-2xl border border-emerald-200 shadow-xl p-4 z-50">
              <div className="flex justify-between items-center pb-3 border-b border-emerald-100 mb-3">
                <h3 className="font-bold text-xs text-slate-900 uppercase">System Notifications</h3>
                <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded font-bold">{alerts.length} ACTIVE</span>
              </div>
              <div className="space-y-2.5 text-xs max-h-[240px] overflow-y-auto">
                {alerts.map((alt) => (
                  <div key={alt.incident_id} className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-200">
                    <span className="font-bold text-slate-800 block">Incident #{alt.incident_id} ({alt.status})</span>
                    <span className="text-[11px] text-gray-500">{alt.summary || alt.address}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Officer Profile Button */}
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-200 hover:bg-emerald-50 transition text-xs font-semibold text-slate-700"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs">👤</div>
            Officer Profile
          </button>

          {/* Officer Profile Popup Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-emerald-200 shadow-xl p-5 z-50">
              <div className="flex items-center gap-3 pb-4 border-b border-emerald-100">
                <div className="w-10 h-10 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold">
                  👤
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Government Officer</h3>
                  <p className="text-xs text-emerald-800 font-medium">Government Account</p>
                </div>
              </div>

              <div className="py-4 space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Full Name</span>
                  <span className="font-semibold text-slate-800">Government Officer</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Email Address</span>
                  <span className="font-semibold text-slate-800">officer@enav.com</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Driver / Employee ID</span>
                  <span className="font-semibold text-slate-800">MUNICIPAL-ADMIN-01</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Department</span>
                  <span className="font-semibold text-slate-800">City Mobility Operations</span>
                </div>
              </div>

              <div className="pt-3 border-t border-emerald-100">
                <button 
                  onClick={() => router.push('/auth/login')}
                  className="w-full py-2 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition text-xs"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}

          <button 
            onClick={() => router.push('/auth/login')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 transition text-xs font-semibold text-red-600"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-emerald-200">
          <div>
            <h1 className="text-sm font-bold tracking-wide text-slate-800 uppercase">CITY MOBILITY COMMAND</h1>
            <p className="text-[11px] text-gray-500">Delhi NCR • Live Grid Feed</p>
          </div>
          <h2 className="text-xl font-black tracking-tight text-slate-900">City Operations Overview</h2>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col justify-between relative">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                Registered EVs
                <button 
                  onClick={() => setActiveTooltip(activeTooltip === 'evs' ? null : 'evs')}
                  className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold flex items-center justify-center hover:bg-emerald-300 transition"
                >
                  i
                </button>
              </span>
              <span className="text-lg">🔋</span>
            </div>
            <div className="text-3xl font-black text-slate-900">
              {metrics.registered_evs.toLocaleString()}
            </div>
            {activeTooltip === 'evs' && (
              <div className="absolute top-12 left-4 right-4 bg-white border border-emerald-200 p-3 rounded-xl shadow-lg text-[11px] text-gray-600 z-30">
                Total active electric vehicles registered and tracked across Delhi NCR grid.
              </div>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col justify-between relative">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                EV Stations
                <button 
                  onClick={() => setActiveTooltip(activeTooltip === 'stations' ? null : 'stations')}
                  className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold flex items-center justify-center hover:bg-emerald-300 transition"
                >
                  i
                </button>
              </span>
              <span className="text-lg">⚡</span>
            </div>
            <div className="text-3xl font-black text-slate-900">
              {metrics.ev_stations}
            </div>
            {activeTooltip === 'stations' && (
              <div className="absolute top-12 left-4 right-4 bg-white border border-emerald-200 p-3 rounded-xl shadow-lg text-[11px] text-gray-600 z-30">
                Number of public and municipal EV charging stations currently operational.
              </div>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col justify-between relative">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                Emergencies
                <button 
                  onClick={() => setActiveTooltip(activeTooltip === 'emergencies' ? null : 'emergencies')}
                  className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold flex items-center justify-center hover:bg-emerald-300 transition"
                >
                  i
                </button>
              </span>
              <span className="text-lg">🚨</span>
            </div>
            <div className="text-3xl font-black text-slate-900">
              {String(metrics.emergencies_count).padStart(2, '0')}
            </div>
            {activeTooltip === 'emergencies' && (
              <div className="absolute top-12 left-4 right-4 bg-white border border-emerald-200 p-3 rounded-xl shadow-lg text-[11px] text-gray-600 z-30">
                Active emergency response incidents requiring municipal dispatch or tracking.
              </div>
            )}
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col justify-between relative">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                Avg ETA
                <button 
                  onClick={() => setActiveTooltip(activeTooltip === 'eta' ? null : 'eta')}
                  className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold flex items-center justify-center hover:bg-emerald-300 transition"
                >
                  i
                </button>
              </span>
              <span className="text-lg">⏱️</span>
            </div>
            <div className="text-3xl font-black text-slate-900">
              {metrics.avg_eta_minutes.toFixed(1)} min
            </div>
            {activeTooltip === 'eta' && (
              <div className="absolute top-12 left-4 right-4 bg-white border border-emerald-200 p-3 rounded-xl shadow-lg text-[11px] text-gray-600 z-30">
                Average estimated time of arrival for emergency vehicles across active routes.
              </div>
            )}
          </div>

        </div>
        
        {/* Map & Alerts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 bg-slate-100 rounded-2xl border border-emerald-200 overflow-hidden flex flex-col h-[450px]">
            <div className="bg-white px-4 py-3 border-b border-emerald-200 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700">DELHI NCR LIVE INCIDENT MAP</span>
              <span className="text-[10px] bg-emerald-700 text-white px-2 py-0.5 rounded font-medium">
                {alerts.length} Incidents Active
              </span>
            </div>
            <div className="flex-1 w-full relative">
              <CommandMap incidents={alerts} />
            </div>
          </div>

          <div className="bg-emerald-50/30 rounded-2xl border border-emerald-200 p-5 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">VIEW ALERTS</h3>
                  <span className="text-[10px] text-emerald-800">112 Live Incident Feed</span>
                </div>
                <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-bold uppercase animate-pulse">
                  {metrics.emergencies_count} ACTIVE
                </span>
              </div>
              
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {alerts.map((alt) => {
                  const isFire = (alt.incident_type || "").toLowerCase().includes("fire");
                  const isPolice = (alt.incident_type || "").toLowerCase().includes("police");
                  const emoji = isFire ? "🔥" : isPolice ? "🚔" : "🚑";

                  return (
                    <div
                      key={alt.incident_id}
                      onClick={() => router.push("/gov/dispatch")}
                      className="p-3 bg-white rounded-xl border border-emerald-200 space-y-1 shadow-sm hover:border-emerald-400 cursor-pointer transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1 font-mono">
                          <span>{emoji}</span> #{alt.incident_id}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {alt.status}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-700 font-medium leading-snug line-clamp-2">
                        {alt.summary}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100 font-mono">
                        <span className="truncate max-w-[140px]">📍 {alt.address}</span>
                        <span>ETA: <strong className="text-emerald-700">{alt.eta_minutes}m</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => router.push("/gov/dispatch")}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-xs transition shadow-md shadow-emerald-700/20 mt-3 flex items-center justify-center gap-1.5"
            >
              <span>View All Emergency Incidents ({metrics.emergencies_count})</span> →
            </button>
          </div>

        </div>

        {/* City Performance Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <h3 className="text-base font-bold text-slate-900">CITY PERFORMANCE</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col justify-between relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Emergency Response</span>
                <span className="text-lg">🚨</span>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {metrics.avg_eta_minutes.toFixed(1)} min
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col justify-between relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">EV Adoption</span>
                <span className="text-lg">📈</span>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {metrics.ev_adoption_rate}%
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-col justify-between relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">CO2 Avoided</span>
                <span className="text-lg">🌱</span>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {metrics.co2_avoided_tons} t
              </div>
            </div>

          </div>
        </div>

      </main>

    </div>
  );
}