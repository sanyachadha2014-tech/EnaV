"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Zap, ShieldCheck, User, ArrowRight, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [role, setRole] = useState<"driver" | "gov">("driver");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (role === "gov") {
      window.location.href = "/gov/dispatch";
    } else {
      window.location.href = "/drivers/chargers";
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col justify-center items-center px-4 font-sans selection:bg-[#10B981] selection:text-slate-950">
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-[#10B981] transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      <div className="w-full max-w-md bg-[#0B132B] border border-[#10B981]/30 rounded-3xl p-8 shadow-[0_0_40px_rgba(7,11,20,0.9)] space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#10B981] flex items-center justify-center text-slate-950 font-black shadow-[0_0_20px_#10B981]">
              <Zap className="w-6 h-6 fill-slate-950" />
            </div>
            <span className="text-2xl font-black text-white tracking-wider">
              Ena<span className="text-[#10B981]">V</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold text-white tracking-wide">Welcome Back</h1>
          <p className="text-xs text-slate-400">Sign in to access your portal</p>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#070B14] border border-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole("driver")}
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              role === "driver"
                ? "bg-[#10B981] text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <User className="w-3.5 h-3.5" /> EV Driver
          </button>
          <button
            type="button"
            onClick={() => setRole("gov")}
            className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              role === "gov"
                ? "bg-[#10B981] text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Gov Authority
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="login-email" className="text-[11px] font-mono text-slate-400">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === "gov" ? "official@gov.in" : "driver@email.com"}
              className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#10B981] transition"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label htmlFor="login-password" className="text-[11px] font-mono text-slate-400">
                Password
              </label>
              <button type="button" className="text-[10px] text-[#10B981] hover:underline">
                Forgot?
              </button>
            </div>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#070B14] border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#10B981] transition"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#10B981] hover:bg-[#34D399] text-slate-950 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-[0_0_20px_rgba(16,185,129,0.4)]"
          >
            Sign In to {role === "gov" ? "Command Hub" : "Driver Portal"}{" "}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          Don&apos;t have an account?{" "}
          <button type="button" className="text-[#10B981] font-bold hover:underline">
            Register here
          </button>
        </div>
      </div>
    </div>
  );
}