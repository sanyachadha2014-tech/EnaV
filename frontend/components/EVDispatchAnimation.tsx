"use client";

import React, { useState, useEffect } from "react";
import { Zap, ShieldAlert, Building2, Navigation } from "lucide-react";

export default function EVDispatchAnimation() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let animationFrame: number;
    let startTime: number | null = null;
    const duration = 6000;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      
      const p = (elapsed % duration) / duration;
      setProgress(p);

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Compute normalized Bezier point on standard 100x100 relative grid
  const getRelativePoint = (t: number) => {
    const p0 = { x: 10, y: 70 };
    const p1 = { x: 35, y: 20 };
    const p2 = { x: 65, y: 80 };
    const p3 = { x: 90, y: 30 };

    const cx = 3 * (p1.x - p0.x);
    const bx = 3 * (p2.x - p1.x) - cx;
    const ax = p3.x - p0.x - cx - bx;

    const cy = 3 * (p1.y - p0.y);
    const by = 3 * (p2.y - p1.y) - cy;
    const ay = p3.y - p0.y - cy - by;

    const x = ax * Math.pow(t, 3) + bx * Math.pow(t, 2) + cx * t + p0.x;
    const y = ay * Math.pow(t, 3) + by * Math.pow(t, 2) + cy * t + p0.y;

    const dx = 3 * ax * Math.pow(t, 2) + 2 * bx * t + cx;
    const dy = 3 * ay * Math.pow(t, 2) + 2 * by * t + cy;
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

    return { x, y, angle };
  };

  const carPos = getRelativePoint(progress);

  return (
    <div className="w-full font-mono flex flex-col justify-between">
      
      {/* Dynamic Header */}
      <div className="flex items-center justify-between pb-3 z-10 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-[#10B981]" />
            <h3 className="text-white text-xs font-bold uppercase tracking-wider">
              SMART ROUTE OPTIMIZATION
            </h3>
          </div>
          <p className="text-slate-400 text-[10px] mt-0.5">
            Vector: Central ICCC ➔ Dwarka Sec-14
          </p>
        </div>

        <button
          onClick={() => setProgress(0)}
          className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#10B981] hover:bg-[#0D9668] active:scale-95 text-slate-950 transition flex items-center gap-1.5 shadow-lg shadow-[#10B981]/20 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          Trigger Dispatch
        </button>
      </div>

      {/* SVG Map Canvas Viewport */}
      <div className="relative w-full h-[240px] bg-[#0B132B]/60 border border-slate-800/80 rounded-xl overflow-hidden backdrop-blur">
        
        {/* Grid Background */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#10B981 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Scalable ViewBox SVG */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Green Route Trajectory */}
          <path
            d="M 10 70 C 35 20, 65 80, 90 30"
            stroke="#10B981"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Dynamic Top-Down EV Car */}
          <g transform={`translate(${carPos.x}, ${carPos.y}) rotate(${carPos.angle})`}>
            <circle cx="0" cy="0" r="4.5" fill="#10B981" opacity="0.35" />
            <rect x="-3.5" y="-2" width="7" height="4" rx="1" fill="#10B981" stroke="#FFFFFF" strokeWidth="0.4" />
            <rect x="-1" y="-1.2" width="2.5" height="2.4" rx="0.4" fill="#070B14" />
            <polygon points="3.5,-1.2 6,-2 6,2 3.5,1.2" fill="#6EE7B7" opacity="0.8" />
          </g>
        </svg>

        {/* Station Markers */}

        {/* 1. Origin HQ Node */}
        <div className="absolute left-[10%] top-[70%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center pointer-events-none">
          <div className="w-7 h-7 rounded-full bg-emerald-950 border-2 border-[#10B981] flex items-center justify-center text-[#10B981] shadow-lg shadow-[#10B981]/30">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <span className="text-[8px] text-slate-300 font-bold mt-1 bg-[#070B14] px-1.5 py-0.5 rounded border border-slate-800">
            ICCC HQ
          </span>
        </div>

        {/* 2. EV Hub #01 Node */}
        <div className="absolute left-[33%] top-[40%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center pointer-events-none">
          <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400">
            <Zap className="w-3 h-3" />
          </div>
          <span className="text-[8px] text-slate-400 mt-0.5 bg-slate-900/90 px-1 py-0.5 rounded border border-slate-800">
            EV Hub #01
          </span>
        </div>

        {/* 3. EV Hub #02 Node */}
        <div className="absolute left-[54%] top-[60%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center pointer-events-none">
          <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400">
            <Zap className="w-3 h-3" />
          </div>
          <span className="text-[8px] text-slate-400 mt-0.5 bg-slate-900/90 px-1 py-0.5 rounded border border-slate-800">
            EV Hub #02
          </span>
        </div>

        {/* 4. EV Hub #03 Node */}
        <div className="absolute left-[74%] top-[48%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center pointer-events-none">
          <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400">
            <Zap className="w-3 h-3" />
          </div>
          <span className="text-[8px] text-slate-400 mt-0.5 bg-slate-900/90 px-1 py-0.5 rounded border border-slate-800">
            EV Hub #03
          </span>
        </div>

        {/* 5. Destination SOS Incident Node */}
        <div className="absolute left-[90%] top-[30%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center pointer-events-none">
          <div className="w-7 h-7 rounded-full bg-red-950 border-2 border-red-500 flex items-center justify-center text-red-400 animate-pulse shadow-lg shadow-red-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <span className="text-[8px] text-red-400 font-bold mt-1 bg-[#070B14] px-1.5 py-0.5 rounded border border-red-900/50">
            INCIDENT
          </span>
        </div>

      </div>

    </div>
  );
}