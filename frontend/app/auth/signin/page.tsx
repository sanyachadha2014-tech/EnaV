"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Car,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Siren,
  UserRound,
  Zap,
} from "lucide-react";

type Role = "drivers" | "government";

export default function SignInPage() {
  const router = useRouter();

  const [role, setRole] = useState<Role>("drivers");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setError("Enter your email address.");
      return;
    }

    if (!cleanEmail.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Enter your password.");
      return;
    }

    setIsLoading(true);

    /*
      Demo routing for now.

      drivers  -> /drivers
      Government -> /gov

      Replace this later with your real authentication.
    */

    setTimeout(() => {
      if (role === "government") {
        router.push("/gov/dashboard");
      } else {
        router.push("/drivers");
      }
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

          {/* Glow */}
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

                ENAV PLATFORM

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

                <FeatureCard
                  icon={
                    <Siren className="h-5 w-5 text-emerald-400" />
                  }
                  title={
                    <>
                      Emergency
                      <br />
                      Response
                    </>
                  }
                  description="Faster coordination."
                />

                <FeatureCard
                  icon={
                    <Car className="h-5 w-5 text-blue-400" />
                  }
                  title={
                    <>
                      EV
                      <br />
                      Mobility
                    </>
                  }
                  description="Smarter electric fleets."
                />

                <FeatureCard
                  icon={
                    <Zap className="h-5 w-5 text-emerald-400" />
                  }
                  title={
                    <>
                      Charging
                      <br />
                      Network
                    </>
                  }
                  description="Intelligent infrastructure."
                />

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
            RIGHT — LOGIN
        ===================================================== */}

        <section className="flex h-screen items-center justify-center overflow-hidden px-5 py-6 sm:px-8">

          <div className="w-full max-w-[540px]">

            {/* Heading */}

            <div className="mb-6">

              <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">

                Welcome back to{" "}

                <span className="text-emerald-400">
                  EnaV
                </span>

              </h2>

              <p className="mt-1.5 text-xs text-slate-500">
                Sign in to access your EnaV mobility services.
              </p>

            </div>

            {/* Login card */}

            <div className="rounded-2xl border border-slate-800 bg-[#07101d] p-5 shadow-2xl sm:p-6">

              {/* Account type */}

              <div className="mb-5">

                <label className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Account type
                </label>

                <div className="grid grid-cols-2 gap-2">

                  <RoleButton
                    active={role === "drivers"}
                    icon={
                      <UserRound className="h-4 w-4" />
                    }
                    label="Driver"
                    onClick={() => {
                      setRole("drivers");
                      setError("");
                    }}
                  />

                  <RoleButton
                    active={role === "government"}
                    icon={
                      <ShieldCheck className="h-4 w-4" />
                    }
                    label="Government"
                    onClick={() => {
                      setRole("government");
                      setError("");
                    }}
                  />

                </div>

              </div>

              {/* Form */}

              <form
                onSubmit={handleSubmit}
                className="space-y-3.5"
              >

                {/* Email */}

                <div>

                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400"
                  >
                    Email address
                  </label>

                  <div className="relative">

                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="you@example.com"
                      className="h-11 w-full rounded-lg border border-slate-800 bg-[#07101d] pl-10 pr-4 text-xs text-white outline-none placeholder:text-slate-600 focus:border-emerald-400/50"
                    />

                  </div>

                </div>

                {/* Password */}

                <div>

                  <label
                    htmlFor="password"
                    className="mb-1.5 block text-[9px] font-bold uppercase tracking-widest text-slate-400"
                  >
                    Password
                  </label>

                  <div className="relative">

                    <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Enter your password"
                      className="h-11 w-full rounded-lg border border-slate-800 bg-[#07101d] pl-10 pr-11 text-xs text-white outline-none placeholder:text-slate-600 focus:border-emerald-400/50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) => !current
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute right-3.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-slate-500 transition hover:text-white"
                    >

                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}

                    </button>

                  </div>

                </div>

                {/* Error */}

                {error && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-[10px] text-red-400">
                    {error}
                  </div>
                )}

                {/* Sign in */}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-400 to-blue-600 text-[10px] font-black tracking-wide text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {isLoading ? (
                    <>
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      SIGNING IN
                    </>
                  ) : (
                    <>
                      SIGN IN
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}

                </button>

              </form>

              {/* Create account */}

              <div className="mt-5 border-t border-slate-800 pt-4 text-center">

                <span className="text-[10px] text-slate-600">
                  Don't have an account?{" "}
                </span>

                <Link
                  href="/auth/signup"
                  className="text-[10px] font-bold text-emerald-400 transition hover:text-emerald-300"
                >
                  Create account
                </Link>

              </div>

            </div>

            {/* Security */}

            <div className="mt-4 flex items-center justify-center gap-2 text-[8px] uppercase tracking-[0.15em] text-slate-700">

              <LockKeyhole className="h-3 w-3" />

              Your account information is protected

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}

/* =========================================================
   FEATURE CARD
========================================================= */

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: React.ReactNode;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#07101d]/90 p-4">

      {icon}

      <div className="mt-3 text-xs font-black text-white">
        {title}
      </div>

      <p className="mt-1.5 text-[9px] leading-4 text-slate-500">
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   ROLE BUTTON
========================================================= */

function RoleButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-11 items-center justify-center gap-2 rounded-lg border text-[10px] font-black uppercase tracking-wider transition ${
        active
          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-400"
          : "border-slate-800 bg-[#07101d] text-slate-600 hover:text-slate-300"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}