"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  PhoneCall,
  Flame,
  ShieldAlert,
  Ambulance,
  Mic,
  MicOff,
  Keyboard,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Loader2,
  Shield,
  Clock,
  Truck,
  Building2,
  Info
} from "lucide-react";
import { api } from "@/lib/api";

type Step = "HOME" | "CALLING" | "CATEGORY" | "DESCRIPTION" | "LOCATION" | "REVIEW" | "RESULT";

type EmergencyCategory = "FIRE" | "POLICE" | "MEDICAL";

interface SwytchcodeIntelligence {
  provider: string;
  status: "live" | "error";
  model?: string;
  classification_id?: string;
  flagged_high_risk?: boolean | null;
  high_risk_indicators?: string[];
  categories?: Record<string, boolean>;
  category_scores?: Record<string, number>;
  ai_triage_category?: string;
  recommended_priority?: string;
  summary?: string;
  error?: string;
  exit_code?: number;
}

interface AIAnalysisResult {
  summary: string;
  keywords: string[];
  address?: string;
  swytchcode_intelligence?: SwytchcodeIntelligence | null;
}

interface DispatchResult {
  incident_id: string;
  incident_type: string;
  address?: string;
  district: string;
  district_code?: string;
  selected_vehicle?: string | null;
  vehicle_type?: string | null;
  eta_minutes?: number | null;
  distance_km?: number | null;
  status: string;
  summary?: string | null;
  keywords?: string[] | null;
  latitude: number;
  longitude: number;
  created_at: string;
  reason?: string | null;
}

export default function EmergencyReporterPage() {
  const [step, setStep] = useState<Step>("HOME");

  // Step 2: Simulated Call State
  const [callState, setCallState] = useState<"CONNECTING" | "CONNECTED">("CONNECTING");

  // Step 3: Category
  const [category, setCategory] = useState<EmergencyCategory | null>(null);

  // Step 4: Description (Voice / Text)
  const [description, setDescription] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Step 5: Location
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);

  // Step 6: AI Analysis
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Step 7: Final Dispatch Result
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [dispatchResult, setDispatchResult] = useState<DispatchResult | null>(null);

  // Web Speech API Initialization
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-IN";

      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setDescription(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          setSpeechError("Microphone permission denied. Please type your description below.");
        } else {
          setSpeechError(`Voice input error (${event.error}). Please use text input.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!speechSupported) {
      setSpeechError("Speech recognition is not supported in this browser. Please type below.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setSpeechError(null);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error("Speech start error:", err);
      }
    }
  };

  // Start Call Flow
  const handleStartCall = () => {
    setStep("CALLING");
    setCallState("CONNECTING");

    setTimeout(() => {
      setCallState("CONNECTED");
      setTimeout(() => {
        setStep("CATEGORY");
      }, 1500);
    }, 2200);
  };

  // Acquire Real Browser GPS
  const handleAcquireLocation = () => {
    setLocLoading(true);
    setLocError(null);

    if (!navigator.geolocation) {
      setLocLoading(false);
      setLocError("Geolocation is not supported by your browser. Location access is required.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setLocation(coords);
        setLocLoading(false);
      },
      (err) => {
        setLocLoading(false);
        console.warn("Geolocation error:", err.message);
        if (err.code === err.PERMISSION_DENIED) {
          setLocError("Location permission denied. Please allow GPS location in your browser settings to proceed with emergency dispatch.");
        } else {
          setLocError(`Unable to retrieve GPS coordinates (${err.message}).`);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Trigger AI analysis and transition to review
  const handleProceedToReview = async () => {
    if (!category) return;
    setStep("REVIEW");
    setAnalyzing(true);
    setAnalysisError(null);

    try {
      const categoryParam =
        category === "FIRE" ? "fire" : category === "POLICE" ? "police" : "medical";

      const res = await api.post("/emergency/analyze", {
        incident_type: categoryParam,
        raw_description: description.trim() || `Reported ${categoryParam} incident.`,
        latitude: location?.lat || null,
        longitude: location?.lng || null
      });

      setAiAnalysis({
        summary: res.data.summary,
        keywords: res.data.keywords || [],
        address: res.data.address || undefined,
        swytchcode_intelligence: res.data.swytchcode_intelligence || null
      });
    } catch (err: any) {
      console.warn("Analyze error:", err);
      // Fallback locally if backend fails
      setAiAnalysis({
        summary: description.trim() || `Urgent ${category.toLowerCase()} assistance requested.`,
        keywords: [category.toLowerCase(), "emergency", "dispatch"],
        swytchcode_intelligence: null
      });
      setAnalysisError("AI analysis backend was unreachable. Showing raw report summary.");
    } finally {
      setAnalyzing(false);
    }
  };

  // Final Dispatch Submission to Backend
  const handleConfirmReport = async () => {
    if (!category || !location) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const categoryParam =
        category === "FIRE" ? "fire" : category === "POLICE" ? "police" : "medical";

      const payload = {
        incident_type: categoryParam,
        description: description.trim(),
        summary: aiAnalysis?.summary || null,
        keywords: aiAnalysis?.keywords || [],
        address: aiAnalysis?.address || null,
        latitude: location.lat,
        longitude: location.lng
      };

      const res = await api.post<DispatchResult>("/emergency/report", payload);
      setDispatchResult(res.data);
      setStep("RESULT");
    } catch (err: any) {
      console.error("Dispatch submission error:", err);
      setSubmitError(
        err.response?.data?.detail || "Emergency dispatch service failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Reset entire flow
  const handleReset = () => {
    setStep("HOME");
    setCategory(null);
    setDescription("");
    setLocation(null);
    setAiAnalysis(null);
    setDispatchResult(null);
    setSpeechError(null);
    setLocError(null);
    setSubmitError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Top Emergency Simulation Banner */}
      <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-center text-xs font-mono font-bold text-amber-300 flex items-center justify-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>PROTOTYPE SIMULATION ONLY — DO NOT USE FOR REAL EMERGENCIES. FOR ACTUAL EMERGENCIES IN INDIA, DIAL 112.</span>
      </div>

      {/* Main Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-4 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/50 flex items-center justify-center text-rose-500 font-black text-lg shadow-lg shadow-rose-950">
            🚨
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-wider text-white uppercase">
                112 RESPONSE PORTAL
              </span>
              <span className="text-[10px] font-mono bg-rose-500/20 border border-rose-500/40 text-rose-300 px-2 py-0.5 rounded font-bold">
                SIMULATION
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              EnaV Municipal Emergency Rapid Dispatch Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/gov/dashboard"
            className="text-xs font-mono font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition"
          >
            GOV COMMAND
          </Link>
          <Link
            href="/drivers"
            className="text-xs font-mono font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition"
          >
            DRIVER HOME
          </Link>
        </div>
      </header>

      {/* Content Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center">

        {/* =========================================================
            SCREEN 1: HOME
        ========================================================= */}
        {step === "HOME" && (
          <div className="text-center space-y-8 py-8 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              Direct Municipal Dispatch Simulator
            </div>

            <div className="space-y-3 max-w-2xl mx-auto">
              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight uppercase">
                Emergency <span className="text-rose-500">Response</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed font-sans">
                Immediate AI-assisted emergency dispatch connecting citizens to municipal electric fleets, ambulances, and police units with real-time GPS routing.
              </p>
            </div>

            {/* Primary Action Button */}
            <div className="pt-4">
              <button
                onClick={handleStartCall}
                className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-black text-base sm:text-lg uppercase tracking-wider px-8 sm:px-12 py-5 rounded-2xl shadow-2xl shadow-rose-950 border border-rose-400/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <PhoneCall className="w-6 h-6 animate-bounce" />
                Report an Emergency
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Feature Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-6 text-left">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="text-rose-400 text-sm font-bold">112 Dispatch Call</div>
                <p className="text-xs text-slate-400">Simulated emergency intake with multi-agency routing.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="text-cyan-400 text-sm font-bold">Gemini AI Analysis</div>
                <p className="text-xs text-slate-400">Factual keyword extraction and concise incident summarization.</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="text-emerald-400 text-sm font-bold">EV Fleet Allocation</div>
                <p className="text-xs text-slate-400">Battery-feasible response routing via real-world OSRM.</p>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            SCREEN 2: SIMULATED 112 CALL INTERFACE
        ========================================================= */}
        {step === "CALLING" && (
          <div className="text-center space-y-8 py-12 animate-fadeIn max-w-md mx-auto">
            <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
              <div className={`absolute inset-0 rounded-full border-4 ${
                callState === "CONNECTING"
                  ? "border-amber-500/40 animate-ping"
                  : "border-emerald-500/40 scale-110 transition-all"
              }`} />
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl shadow-2xl transition-all ${
                callState === "CONNECTING"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500 scale-105"
              }`}>
                <PhoneCall className={`w-10 h-10 ${callState === "CONNECTING" ? "animate-pulse" : ""}`} />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white tracking-wide uppercase">
                {callState === "CONNECTING" ? "Connecting to Emergency Services..." : "Emergency Services Connected"}
              </h2>
              <p className="text-xs font-mono text-slate-400">
                {callState === "CONNECTING"
                  ? "Routing through National 112 Simulation Gateway..."
                  : "Dispatcher Ready. Initializing incident intake..."}
              </p>
            </div>

            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-[11px] text-slate-400 font-mono">
              <span className="text-amber-400 font-bold">NOTICE:</span> This is an automated educational simulation. No actual phone lines or emergency operators are contacted.
            </div>
          </div>
        )}

        {/* =========================================================
            SCREEN 3: EMERGENCY TYPE SELECTION
        ========================================================= */}
        {step === "CATEGORY" && (
          <div className="space-y-6 py-6 animate-fadeIn">
            <div className="text-center space-y-2">
              <span className="text-[11px] font-mono font-bold text-rose-400 uppercase tracking-widest">
                STEP 1 OF 4 • CLASSIFICATION
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase">
                What type of emergency is this?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Select the primary response service needed. This selection is authoritative and drives vehicle dispatch.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {/* FIRE */}
              <button
                onClick={() => {
                  setCategory("FIRE");
                  setStep("DESCRIPTION");
                }}
                className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/70 hover:bg-slate-900 hover:border-rose-500/60 transition-all flex flex-col items-center text-center space-y-4 hover:scale-[1.02] shadow-xl"
              >
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-3xl group-hover:scale-110 transition">
                  <Flame className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white group-hover:text-rose-400 transition uppercase">
                    🔥 Fire
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Building fires, chemical hazards, electrical fires, explosions.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                  Select Fire Engine →
                </span>
              </button>

              {/* POLICE */}
              <button
                onClick={() => {
                  setCategory("POLICE");
                  setStep("DESCRIPTION");
                }}
                className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/70 hover:bg-slate-900 hover:border-blue-500/60 transition-all flex flex-col items-center text-center space-y-4 hover:scale-[1.02] shadow-xl"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-3xl group-hover:scale-110 transition">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white group-hover:text-blue-400 transition uppercase">
                    🚔 Police
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Crime in progress, active threats, traffic collisions, civil security.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  Select Police Patrol →
                </span>
              </button>

              {/* MEDICAL */}
              <button
                onClick={() => {
                  setCategory("MEDICAL");
                  setStep("DESCRIPTION");
                }}
                className="group p-6 rounded-2xl border border-slate-800 bg-slate-900/70 hover:bg-slate-900 hover:border-emerald-500/60 transition-all flex flex-col items-center text-center space-y-4 hover:scale-[1.02] shadow-xl"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl group-hover:scale-110 transition">
                  <Ambulance className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition uppercase">
                    🚑 Medical / Ambulance
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Severe medical distress, vehicle injuries, cardiac arrest, trauma.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Select ALS Ambulance →
                </span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            SCREEN 4: EMERGENCY DESCRIPTION
        ========================================================= */}
        {step === "DESCRIPTION" && (
          <div className="space-y-6 py-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[11px] font-mono font-bold text-rose-400 uppercase tracking-widest">
                  STEP 2 OF 4 • INCIDENT DETAILS
                </span>
                <h2 className="text-2xl font-black text-white uppercase mt-1">
                  Please describe what happened.
                </h2>
              </div>

              {category && (
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg border border-slate-700 bg-slate-900 text-slate-300">
                  Category: <strong className="text-white">{category}</strong>
                </span>
              )}
            </div>

            {/* Input Controls: Voice vs Text */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-slate-400" /> Natural Description
                </span>

                {/* Voice button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition border ${
                    isListening
                      ? "bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-900 animate-pulse"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700"
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4" /> Stop Dictating
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-rose-400" /> Dictate via Voice
                    </>
                  )}
                </button>
              </div>

              {/* Speech Error / Notice */}
              {speechError && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300">
                  {speechError}
                </div>
              )}

              {isListening && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2 font-mono">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  Listening... Speak clearly into your microphone.
                </div>
              )}

              {/* Textarea */}
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Example: There is a fire in a building near the market. I can see smoke coming from the second floor..."
                rows={5}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition leading-relaxed font-sans"
              />

              <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
                <span>{description.length} characters</span>
                <span>Simple narrative description accepted</span>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep("CATEGORY")}
                className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-white px-4 py-2.5 rounded-xl border border-slate-800 transition"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Category
              </button>

              <button
                type="button"
                disabled={!description.trim()}
                onClick={() => {
                  setStep("LOCATION");
                  handleAcquireLocation();
                }}
                className="flex items-center gap-2 text-xs font-mono font-bold bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl transition shadow-lg shadow-rose-950 uppercase"
              >
                Next: Verify Location <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            SCREEN 5: LOCATION DETECTION
        ========================================================= */}
        {step === "LOCATION" && (
          <div className="space-y-6 py-6 animate-fadeIn">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[11px] font-mono font-bold text-rose-400 uppercase tracking-widest">
                STEP 3 OF 4 • GPS ACQUISITION
              </span>
              <h2 className="text-2xl font-black text-white uppercase mt-1">
                Real GPS Incident Location
              </h2>
              <p className="text-xs text-slate-400">
                Accurate browser geolocation ensures the nearest available emergency vehicle is dispatched.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              {locLoading ? (
                <div className="py-10 text-center space-y-3 font-mono text-xs text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-rose-400" />
                  <p className="text-sm font-bold text-white">Acquiring current GPS coordinates...</p>
                  <p className="text-slate-500">Querying browser Geolocation API sensor...</p>
                </div>
              ) : location ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                          GPS Fix Acquired
                        </div>
                        <div className="text-base font-mono font-black text-white mt-0.5">
                          {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleAcquireLocation}
                      className="text-xs font-mono font-bold text-slate-400 hover:text-white underline"
                    >
                      Re-scan GPS
                    </button>
                  </div>

                  <p className="text-xs text-slate-400 font-mono leading-relaxed">
                    Coordinates will be resolved against the municipal GIS boundary database (`district_nwic`) to determine the official jurisdiction.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 py-4">
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs space-y-2">
                    <div className="font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Location Permission Notice
                    </div>
                    <p>{locError || "Location access is required to dispatch units to your exact position."}</p>
                  </div>

                  <button
                    onClick={handleAcquireLocation}
                    className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-xs uppercase transition flex items-center justify-center gap-2 border border-slate-700"
                  >
                    <MapPin className="w-4 h-4 text-rose-400" /> Grant Location Access
                  </button>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setStep("DESCRIPTION")}
                className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-white px-4 py-2.5 rounded-xl border border-slate-800 transition"
              >
                <ArrowLeft className="w-4 h-4" /> Edit Description
              </button>

              <button
                type="button"
                disabled={!location}
                onClick={handleProceedToReview}
                className="flex items-center gap-2 text-xs font-mono font-bold bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl transition shadow-lg shadow-rose-950 uppercase"
              >
                Review & Confirm <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            SCREEN 6: AI REVIEW & CONFIRMATION SCREEN
        ========================================================= */}
        {step === "REVIEW" && (
          <div className="space-y-6 py-6 animate-fadeIn">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[11px] font-mono font-bold text-rose-400 uppercase tracking-widest">
                STEP 4 OF 4 • REVIEW & CONFIRM
              </span>
              <h2 className="text-2xl font-black text-white uppercase mt-1">
                Confirm Emergency Report
              </h2>
              <p className="text-xs text-slate-400">
                Verify factual incident details before triggering live municipal dispatch.
              </p>
            </div>

            {analysisError && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs">
                {analysisError}
              </div>
            )}

            {analyzing ? (
              <div className="p-10 rounded-2xl bg-slate-900/90 border border-slate-800 text-center space-y-4 font-mono text-xs">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-400" />
                <p className="text-sm font-bold text-white">Emergency AI Analysis in Progress...</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800 text-cyan-300 text-xs">
                  <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
                  <span>Swytchcode → Mistral → Analyzing...</span>
                </div>
                <p className="text-slate-400">Executing Swytchcode CLI kernel for real Mistral incident triage & risk evaluation...</p>
              </div>
            ) : (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
                {/* Emergency Type (Locked) */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <span className="text-xs font-bold text-slate-400 uppercase">Selected Service</span>
                  <span className="text-xs font-mono font-black px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                    {category} RESPONSE
                  </span>
                </div>

                {/* AI Summary */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" /> AI Factual Summary
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 leading-relaxed font-sans">
                    {aiAnalysis?.summary || description}
                  </div>
                </div>

                {/* Keywords */}
                {aiAnalysis?.keywords && aiAnalysis.keywords.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Extracted Keywords
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {aiAnalysis.keywords.map((kw, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* SWYTCHCODE AI ANALYSIS CARD */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-amber-400">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <span>SWYTCHCODE AI ANALYSIS</span>
                    </div>
                    {aiAnalysis?.swytchcode_intelligence?.status === "live" ? (
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                        Swytchcode → Mistral → Analysis complete
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold">
                        Swytchcode AI unavailable
                      </span>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 space-y-3 text-xs font-mono">
                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div>
                        <span className="text-slate-500 uppercase block text-[10px]">Provider</span>
                        <span className="font-bold text-white">
                          {aiAnalysis?.swytchcode_intelligence?.provider || "Swytchcode → Mistral"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 uppercase block text-[10px]">Mistral Model</span>
                        <span className="font-bold text-slate-200">
                          {aiAnalysis?.swytchcode_intelligence?.model || "mistral-moderation-latest"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 uppercase block text-[10px]">Classification</span>
                        <span className="font-bold text-slate-200 uppercase">
                          {aiAnalysis?.swytchcode_intelligence?.ai_triage_category || "Not provided"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 uppercase block text-[10px]">Priority / Severity</span>
                        <span className="font-bold text-slate-200 uppercase">
                          {aiAnalysis?.swytchcode_intelligence?.recommended_priority || "Not provided"}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-slate-500 uppercase block text-[10px]">High-Risk Indicators</span>
                        <span className="font-bold text-slate-200">
                          {aiAnalysis?.swytchcode_intelligence?.high_risk_indicators &&
                          aiAnalysis.swytchcode_intelligence.high_risk_indicators.length > 0
                            ? aiAnalysis.swytchcode_intelligence.high_risk_indicators.join(", ")
                            : aiAnalysis?.swytchcode_intelligence?.flagged_high_risk
                            ? "High Risk Flagged"
                            : aiAnalysis?.swytchcode_intelligence?.status === "live"
                            ? "None detected (Normal Risk)"
                            : "Not provided"}
                        </span>
                      </div>
                      {aiAnalysis?.swytchcode_intelligence?.category_scores && (
                        <div className="col-span-2">
                          <span className="text-slate-500 uppercase block text-[10px] mb-1">Mistral Risk Scores</span>
                          <div className="flex flex-wrap gap-1.5">
                            {Object.entries(aiAnalysis.swytchcode_intelligence.category_scores)
                              .sort(([, a], [, b]) => Number(b) - Number(a))
                              .map(([k, v]) => (
                                <span
                                  key={k}
                                  className={`px-2 py-0.5 rounded text-[10px] border ${
                                    Number(v) > 0.1
                                      ? "bg-amber-500/10 border-amber-500/30 text-amber-300 font-bold"
                                      : "bg-slate-900 border-slate-800 text-slate-400"
                                  }`}
                                >
                                  {k.replace(/_/g, " ")}: {(Number(v) * 100).toFixed(1)}%
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                      <div className="col-span-2">
                        <span className="text-slate-500 uppercase block text-[10px]">Reasoning / Summary</span>
                        <span className="text-slate-300 font-sans text-xs leading-relaxed block mt-0.5">
                          {aiAnalysis?.swytchcode_intelligence?.summary || "Not provided"}
                        </span>
                      </div>
                    </div>

                    {aiAnalysis?.swytchcode_intelligence?.status === "error" && (
                      <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-[11px] font-mono flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400 mt-0.5" />
                        <div>
                          <strong className="block text-rose-200">Execution Error:</strong>
                          <span>{aiAnalysis.swytchcode_intelligence.error || "Mistral execution failed"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location Display */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Verified Incident Address & Location
                  </span>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-white font-bold font-sans text-sm">
                      <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{aiAnalysis?.address || "Determining verified street address..."}</span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between pt-1 border-t border-slate-900">
                      <span>Coordinates: {location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : "Acquired"}</span>
                      <span className="text-emerald-400 font-bold">GPS Verified</span>
                    </div>
                  </div>
                </div>

                {submitError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300">
                    {submitError}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep("DESCRIPTION")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-white px-5 py-3 rounded-xl border border-slate-800 transition"
              >
                <ArrowLeft className="w-4 h-4" /> Edit Report
              </button>

              <button
                type="button"
                disabled={submitting || analyzing}
                onClick={handleConfirmReport}
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-mono font-bold bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-50 text-white px-8 py-3.5 rounded-xl transition shadow-xl shadow-rose-950 uppercase tracking-wider"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Dispatching Emergency Unit...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> Confirm Emergency Report
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* =========================================================
            SCREEN 7: EMERGENCY DISPATCHED RESULT SCREEN
        ========================================================= */}
        {step === "RESULT" && dispatchResult && (
          <div className="space-y-6 py-6 animate-fadeIn">
            {/* Header Result Card */}
            <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 text-center relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-emerald-950">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">
                  DISPATCH CONFIRMED • INCIDENT RECORDED
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase">
                  Emergency Unit Dispatched
                </h2>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Municipal command has locked vehicle allocation and transmitted the optimal emergency route.
                </p>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-mono text-white">
                <span>Incident ID:</span>
                <strong className="text-emerald-400">{dispatchResult.incident_id}</strong>
              </div>
            </div>

            {/* Address Banner */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 text-left">
              <span className="text-[10px] text-slate-400 font-mono uppercase flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Confirmed Street Address & Location
              </span>
              <div className="text-base font-bold text-white font-sans">
                📍 {dispatchResult.address || `${dispatchResult.district || "Delhi NCR"}`}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Coordinates: {dispatchResult.latitude.toFixed(6)}, {dispatchResult.longitude.toFixed(6)} • GIS & Geocoding Verified
              </div>
            </div>

            {/* Real Data Attributes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
              {/* District */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" /> GIS District
                </span>
                <div className="text-lg font-bold text-white">
                  {dispatchResult.district || "Not available yet"}
                </div>
                <div className="text-[10px] text-slate-500">
                  {dispatchResult.district_code ? `Code: ${dispatchResult.district_code}` : "Boundary Verified"}
                </div>
              </div>

              {/* Selected Vehicle */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-cyan-400" /> Assigned Unit
                </span>
                <div className="text-lg font-bold text-cyan-400">
                  {dispatchResult.selected_vehicle || "Not available yet"}
                </div>
                <div className="text-[10px] text-slate-500">
                  {dispatchResult.vehicle_type ? `Type: ${dispatchResult.vehicle_type}` : "Electric Fleet Unit"}
                </div>
              </div>

              {/* Estimated ETA */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" /> Estimated ETA
                </span>
                <div className="text-lg font-bold text-emerald-400">
                  {dispatchResult.eta_minutes != null
                    ? `${dispatchResult.eta_minutes.toFixed(1)} mins`
                    : "Not available yet"}
                </div>
                <div className="text-[10px] text-slate-500">
                  {dispatchResult.distance_km != null
                    ? `Distance: ${dispatchResult.distance_km.toFixed(1)} km`
                    : "OSRM Route Evaluated"}
                </div>
              </div>

              {/* Status */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-rose-400" /> Dispatch Status
                </span>
                <div className="text-lg font-bold text-white">
                  {dispatchResult.status || "Not available yet"}
                </div>
                <div className="text-[10px] text-slate-500">Live Telemetry Synced</div>
              </div>
            </div>

            {/* AI Summary Reminder */}
            {dispatchResult.summary && (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-xs">
                <span className="font-bold text-cyan-400 text-[10px] uppercase font-mono">Logged Incident Summary</span>
                <p className="text-slate-200 leading-relaxed font-sans">{dispatchResult.summary}</p>
              </div>
            )}

            {/* Navigation Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-mono font-bold text-slate-400 hover:text-white px-5 py-3 rounded-xl border border-slate-800 transition"
              >
                <RotateCcw className="w-4 h-4" /> Report Another Emergency
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  href="/gov/dashboard"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 text-xs font-mono font-bold bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl transition border border-slate-700"
                >
                  View in Gov Dashboard →
                </Link>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
