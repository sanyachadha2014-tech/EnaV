"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Car,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  Siren,
  UserRound,
  Zap,
} from "lucide-react";

type AccountType = "driver" | "government";

export default function SignUpPage() {
  const router = useRouter();

  const [accountType, setAccountType] =
    useState<AccountType>("driver");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [driverId, setDriverId] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateAccount = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!driverId.trim()) {
      setError("Please enter your Driver / Employee ID.");
      return;
    }

    if (!department.trim()) {
      setError("Please enter your department.");
      return;
    }

    if (!password) {
      setError("Please create a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    /*
      Temporary demo registration flow.

      Account type is saved so the login/dashboard flow
      can identify whether the account is a driver
      or government user.
    */

    localStorage.setItem(
      "enav_registered_user",
      JSON.stringify({
        accountType,
        fullName: fullName.trim(),
        email: email.trim(),
        driverId: driverId.trim(),
        department: department.trim(),
      }),
    );

    setTimeout(() => {
      setIsLoading(false);
      router.push("/auth/signin");
    }, 500);
  };

  return (
    <main className="h-screen overflow-hidden bg-[#020712] text-white">
      <div className="grid h-screen lg:grid-cols-2">

        {/* =====================================================
            LEFT — ENAV BRANDING
        ===================================================== */}

        <section className="relative hidden h-screen overflow-hidden border-r border-slate-800 lg:flex">

          {/* Grid */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "linear-gradient(rgba(100,116,139,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(100,116,139,.12) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          {/* Background glow */}
          <div className="absolute left-[55%] top-[25%] h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="absolute bottom-[10%] left-[20%] h-64 w-64 rounded-full bg-emerald-400/5 blur-3xl" />

          {/* Network */}
          <div className="absolute right-[5%] top-[20%] h-[430px] w-[430px] opacity-60">

            <div className="absolute left-[18%] top-[20%] h-2 w-2 rounded-full bg-cyan-400" />
            <div className="absolute left-[42%] top-[12%] h-1.5 w-1.5 rounded-full bg-blue-400" />
            <div className="absolute left-[68%] top-[30%] h-2 w-2 rounded-full bg-emerald-400" />
            <div className="absolute left-[34%] top-[48%] h-2 w-2 rounded-full bg-cyan-400" />
            <div className="absolute left-[75%] top-[58%] h-1.5 w-1.5 rounded-full bg-blue-400" />
            <div className="absolute left-[20%] top-[70%] h-2 w-2 rounded-full bg-emerald-400" />

            <div className="absolute left-[18%] top-[21%] h-px w-32 rotate-[18deg] bg-cyan-400/40" />
            <div className="absolute left-[43%] top-[13%] h-px w-28 rotate-[35deg] bg-blue-400/30" />
            <div className="absolute left-[35%] top-[49%] h-px w-40 rotate-[-20deg] bg-emerald-400/30" />
            <div className="absolute left-[35%] top-[49%] h-px w-32 rotate-[30deg] bg-cyan-400/30" />
            <div className="absolute left-[21%] top-[71%] h-px w-40 rotate-[-12deg] bg-blue-400/30" />

            <div className="absolute left-[42%] top-[36%] flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/60 bg-emerald-400/5 shadow-[0_0_40px_rgba(52,211,153,0.18)]">
              <Zap className="h-6 w-6 text-emerald-400" />
            </div>
          </div>

          <div className="relative z-10 flex h-full w-full flex-col px-10 py-8 xl:px-14">

            {/* Logo */}
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-500/10">
                <Zap className="h-5 w-5 text-blue-400" />
              </div>

              <div>
                <div className="text-xl font-black tracking-tight">
                  Ena<span className="text-emerald-400">V</span>
                </div>

                <div className="text-[8px] font-bold tracking-[0.2em] text-slate-500">
                  AI-POWERED MOBILITY INTELLIGENCE
                </div>
              </div>

            </div>

            {/* Main content */}
            <div className="my-auto max-w-xl">

              <div className="mb-4 flex items-center gap-2 text-[9px] font-bold tracking-[0.2em] text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                JOIN ENAV
              </div>

              <h1 className="text-5xl font-black leading-[0.98] tracking-tight xl:text-6xl">
                Mobility intelligence
                <br />
                for{" "}
                <span className="text-blue-400">
                  real-world response.
                </span>
              </h1>

              <p className="mt-5 max-w-md text-sm leading-6 text-slate-400">
                EnaV connects emergency mobility, electric vehicles and
                charging infrastructure through one intelligent platform.
              </p>

              {/* Feature cards */}
              <div className="mt-8 grid grid-cols-3 gap-3">

                <div className="rounded-xl border border-slate-800 bg-[#07101d]/90 p-4">
                  <Siren className="h-5 w-5 text-emerald-400" />

                  <div className="mt-3 text-xs font-black text-white">
                    Emergency
                    <br />
                    Response
                  </div>

                  <p className="mt-1.5 text-[9px] leading-4 text-slate-500">
                    Faster coordination.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#07101d]/90 p-4">
                  <Car className="h-5 w-5 text-blue-400" />

                  <div className="mt-3 text-xs font-black text-white">
                    EV
                    <br />
                    Mobility
                  </div>

                  <p className="mt-1.5 text-[9px] leading-4 text-slate-500">
                    Smarter electric fleets.
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#07101d]/90 p-4">
                  <Zap className="h-5 w-5 text-emerald-400" />

                  <div className="mt-3 text-xs font-black text-white">
                    Charging
                    <br />
                    Network
                  </div>

                  <p className="mt-1.5 text-[9px] leading-4 text-slate-500">
                    Intelligent infrastructure.
                  </p>
                </div>

              </div>

            </div>

            {/* Bottom */}
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Secure. Reliable. Always.
            </div>

          </div>
        </section>

        {/* =====================================================
            RIGHT — SIGN UP
        ===================================================== */}

        <section className="flex h-screen items-center justify-center overflow-hidden px-5 py-6 sm:px-8">

          <div className="w-full max-w-[540px]">

            {/* Back */}
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 text-[10px] font-bold text-slate-500 transition hover:text-emerald-400"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign in
            </Link>

            {/* Heading */}
            <div className="mt-5">

              <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Create your{" "}
                <span className="text-emerald-400">EnaV</span> account
              </h2>

              <p className="mt-1.5 text-xs text-slate-500">
                Register to access EnaV mobility services.
              </p>

            </div>

            {/* Form */}
            <form
              onSubmit={handleCreateAccount}
              className="mt-5 space-y-3.5"
            >

              {/* =================================================
                  ACCOUNT TYPE — NEW
              ================================================= */}

              <div>

                <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Account type
                </label>

                <div className="grid grid-cols-2 gap-2">

                  <button
                    type="button"
                    onClick={() => {
                      setAccountType("driver");
                      setError("");
                    }}
                    className={`flex h-11 items-center justify-center gap-2 rounded-lg border text-[10px] font-black uppercase tracking-wide transition ${
                      accountType === "driver"
                        ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-400"
                        : "border-slate-800 bg-[#07101d] text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <UserRound className="h-4 w-4" />
                    Driver
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAccountType("government");
                      setError("");
                    }}
                    className={`flex h-11 items-center justify-center gap-2 rounded-lg border text-[10px] font-black uppercase tracking-wide transition ${
                      accountType === "government"
                        ? "border-blue-400/50 bg-blue-400/10 text-blue-400"
                        : "border-slate-800 bg-[#07101d] text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                    Government
                  </button>

                </div>

              </div>

              {/* Full name */}
              <div>

                <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Full name
                </label>

                <div className="relative">

                  <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter your full name"
                    className="h-11 w-full rounded-lg border border-slate-800 bg-[#07101d] pl-10 pr-4 text-xs text-white outline-none placeholder:text-slate-600 focus:border-emerald-400/50"
                  />

                </div>

              </div>

              {/* Email */}
              <div>

                <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Email address
                </label>

                <div className="relative">

                  <BadgeCheck className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="you@example.com"
                    className="h-11 w-full rounded-lg border border-slate-800 bg-[#07101d] pl-10 pr-4 text-xs text-white outline-none placeholder:text-slate-600 focus:border-emerald-400/50"
                  />

                </div>

              </div>

              {/* Driver ID */}
              <div>

                <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Driver / Employee ID
                </label>

                <div className="relative">

                  <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                  <input
                    type="text"
                    value={driverId}
                    onChange={(e) => {
                      setDriverId(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter your driver or employee ID"
                    className="h-11 w-full rounded-lg border border-slate-800 bg-[#07101d] pl-10 pr-4 text-xs text-white outline-none placeholder:text-slate-600 focus:border-emerald-400/50"
                  />

                </div>

              </div>

              {/* Department */}
              <div>

                <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Department
                </label>

                <div className="relative">

                  <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                  <input
                    type="text"
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter your department"
                    className="h-11 w-full rounded-lg border border-slate-800 bg-[#07101d] pl-10 pr-4 text-xs text-white outline-none placeholder:text-slate-600 focus:border-emerald-400/50"
                  />

                </div>

              </div>

              {/* Password */}
              <div>

                <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Password
                </label>

                <div className="relative">

                  <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Create a password"
                    className="h-11 w-full rounded-lg border border-slate-800 bg-[#07101d] pl-10 pr-11 text-xs text-white outline-none placeholder:text-slate-600 focus:border-emerald-400/50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                    aria-label="Toggle password visibility"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>

                </div>

                <p className="mt-1 text-[8px] text-slate-600">
                  Minimum 6 characters.
                </p>

              </div>

              {/* Confirm password */}
              <div>

                <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Confirm password
                </label>

                <div className="relative">

                  <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                  <input
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Confirm your password"
                    className="h-11 w-full rounded-lg border border-slate-800 bg-[#07101d] pl-10 pr-11 text-xs text-white outline-none placeholder:text-slate-600 focus:border-emerald-400/50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        !showConfirmPassword,
                      )
                    }
                    aria-label="Toggle confirm password visibility"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>

                </div>

              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-[10px] font-medium text-red-400"
                >
                  {error}
                </div>
              )}

              {/* Create account */}
              <button
                type="submit"
                disabled={isLoading}
                className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-400 to-blue-600 text-[10px] font-black tracking-wide text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {isLoading ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    CREATING ACCOUNT
                  </>
                ) : (
                  <>
                    CREATE ACCOUNT
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}

              </button>

            </form>

            {/* Login */}
            <div className="mt-5 border-t border-slate-800 pt-4 text-center">

              <span className="text-[10px] text-slate-600">
                Already have an account?{" "}
              </span>

              <Link
                href="/auth/signin"
                className="text-[10px] font-bold text-emerald-400 transition hover:text-emerald-300"
              >
                Sign in
              </Link>

            </div>

          </div>
        </section>
      </div>
    </main>
  );
}