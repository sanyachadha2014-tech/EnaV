"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Shield, Car, ArrowRight } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();
  const [role, setRole] = useState<"driver" | "gov">("gov");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Explicit route destination matching the App Router directory
    if (role === "gov") {
      router.push("/gov/dashboard");
    } else {
      router.push("/drivers/chargers");
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 font-sans flex items-center justify-center p-4 selection:bg-[#10B981] selection:text-slate-950">
      <div className="w-full max-w-md bg-[#0B132B] border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
        {/* Logo Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#10B981] flex items-center justify-center text-slate-950 font-black shadow-[0_0_15px_#10B981]">
              <Zap className="w-6 h-6 fill-slate-950" />
            </div>
            <span className="text-2xl font-black text-white tracking-wider">
              Ena<span className="text-[#10B981]">V</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-white tracking-wide">Sign In to Command</h1>
          <p className="text-xs text-slate-400">Select your account profile to access the portal</p>
        </div>

        {/* Role Selection Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#070B14] border border-slate-800 rounded-xl text-xs font-mono">
          <button
            type="button"
            onClick={() => setRole("gov")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition font-bold ${
              role === "gov"
                ? "bg-[#10B981] text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Shield className="w-4 h-4" /> Government
          </button>
          <button
            type="button"
            onClick={() => setRole("driver")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition font-bold ${
              role === "driver"
                ? "bg-[#10B981] text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Car className="w-4 h-4" /> EV Driver
          </button>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gov.enav.in"
              className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#10B981] transition font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 uppercase mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#10B981] transition font-mono"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#10B981] hover:bg-[#34D399] text-slate-950 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            Enter Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}