import Link from "next/link";
import {
  ArrowRight,
  BatteryCharging,
  CircleUserRound,
  Route,
  Wallet,
} from "lucide-react";

export default function DriverHomePage() {
  return (
    <div className="min-h-[calc(100vh-145px)]">
      {/* GREETING */}

      <section className="pt-4">
        <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-400">
          Driver
        </div>

        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
          Hello, Driver.
        </h1>

        <p className="mt-2 max-w-lg text-[11px] leading-5 text-slate-500">
          Choose what you want to do.
        </p>
      </section>

      {/* MAIN ACTIONS */}

      <section className="mt-8 grid gap-5 lg:grid-cols-2">
        {/* JOURNEY */}

        <Link
          href="/drivers/route-optimizer"
          className="group relative overflow-hidden rounded-2xl border border-blue-400/20 bg-[#07101d] p-6 transition hover:border-blue-400/40"
        >
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-blue-500/5 blur-3xl" />

          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-400/10">
                <Route className="h-5 w-5 text-blue-400" />
              </div>

              <ArrowRight className="h-5 w-5 text-slate-700 transition group-hover:translate-x-1 group-hover:text-blue-400" />
            </div>

            <h2 className="mt-6 text-lg font-black text-white">
              Plan a journey
            </h2>

            <p className="mt-2 max-w-md text-[10px] leading-5 text-slate-500">
              Enter your destination, compare three route options,
              select a route and start your journey.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <Tag text="Fastest" />
              <Tag text="Energy Efficient" />
              <Tag text="Balanced" />
            </div>
          </div>
        </Link>

        {/* CHARGING */}

        <Link
          href="/drivers/chargers"
          className="group relative overflow-hidden rounded-2xl border border-emerald-400/20 bg-[#07101d] p-6 transition hover:border-emerald-400/40"
        >
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl" />

          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10">
                <BatteryCharging className="h-5 w-5 text-emerald-400" />
              </div>

              <ArrowRight className="h-5 w-5 text-slate-700 transition group-hover:translate-x-1 group-hover:text-emerald-400" />
            </div>

            <h2 className="mt-6 text-lg font-black text-white">
              Charging
            </h2>

            <p className="mt-2 max-w-md text-[10px] leading-5 text-slate-500">
              Find charging stations and check connector
              availability for your journey.
            </p>

            <div className="mt-6 text-[9px] font-bold uppercase tracking-widest text-emerald-400">
              Charging options
            </div>
          </div>
        </Link>
      </section>

      {/* SMALL ACCESS CARDS */}

      <section className="mt-5 grid gap-4 sm:grid-cols-2">
        <Link
          href="/drivers/wallet"
          className="group rounded-2xl border border-slate-800 bg-[#07101d] p-5 transition hover:border-slate-700"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <Wallet className="h-4 w-4" />

              <span className="text-[9px] font-bold uppercase tracking-wider">
                Wallet
              </span>
            </div>

            <ArrowRight className="h-3.5 w-3.5 text-slate-700 transition group-hover:translate-x-1 group-hover:text-white" />
          </div>

          <div className="mt-4 text-sm font-black text-white">
            Manage wallet
          </div>

          <div className="mt-1 text-[9px] text-slate-600">
            Balance and transactions
          </div>
        </Link>

        <Link
          href="/drivers/profile"
          className="group rounded-2xl border border-slate-800 bg-[#07101d] p-5 transition hover:border-slate-700"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <CircleUserRound className="h-4 w-4" />

              <span className="text-[9px] font-bold uppercase tracking-wider">
                Profile
              </span>
            </div>

            <ArrowRight className="h-3.5 w-3.5 text-slate-700 transition group-hover:translate-x-1 group-hover:text-white" />
          </div>

          <div className="mt-4 text-sm font-black text-white">
            Driver profile
          </div>

          <div className="mt-1 text-[9px] text-slate-600">
            Personal and vehicle information
          </div>
        </Link>
      </section>
    </div>
  );
}

function Tag({ text }: { text: string }) {
  return (
    <span className="rounded-full border border-slate-800 bg-[#050A13] px-2.5 py-1 text-[7px] font-bold uppercase tracking-wider text-slate-500">
      {text}
    </span>
  );
}