"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BatteryCharging,
  CircleUserRound,
  Gauge,
  Navigation,
  Wallet,
  Zap,
} from "lucide-react";

const navItems = [
  {
    href: "/drivers",
    label: "Dashboard",
    icon: Gauge,
  },
  {
    href: "/drivers/chargers",
    label: "Charging",
    icon: BatteryCharging,
  },
  {
    href: "/drivers/route-optimizer",
    label: "Journey",
    icon: Navigation,
  },
  {
    href: "/drivers/wallet",
    label: "Wallet",
    icon: Wallet,
  },
  {
    href: "/drivers/profile",
    label: "Profile",
    icon: CircleUserRound,
  },
];

export default function DriversLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#020712] text-white">
      {/* TOP BAR */}

      <header className="sticky top-0 z-50 border-b border-slate-800 bg-[#050A13]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-4 sm:px-6">
          <Link
            href="/drivers"
            className="flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
              <Zap className="h-4 w-4 text-emerald-400" />
            </div>

            <div>
              <div className="text-sm font-black tracking-tight">
                Ena<span className="text-emerald-400">V</span>
              </div>

              <div className="hidden text-[7px] font-bold uppercase tracking-[0.2em] text-slate-600 sm:block">
                Driver
              </div>
            </div>
          </Link>

          <Link
            href="/drivers/profile"
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-slate-900"
          >
            <div className="hidden text-right sm:block">
              <div className="text-[10px] font-bold text-white">
                Driver
              </div>

              <div className="text-[8px] text-slate-600">
                EV-2048
              </div>
            </div>

            <CircleUserRound className="h-7 w-7 text-slate-500" />
          </Link>
        </div>
      </header>

      {/* ONLY ONE ACTIVE PAGE */}

      <main className="mx-auto max-w-[1400px] px-4 pb-28 pt-6 sm:px-6 lg:pb-28">
        {children}
      </main>

      {/* BOTTOM NAVIGATION */}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-[#050A13]/95 backdrop-blur-xl">
        <div className="mx-auto grid h-[72px] max-w-[800px] grid-cols-5">
          {navItems.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              (item.href !== "/drivers" &&
                pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1.5 transition ${
                  active
                    ? "text-emerald-400"
                    : "text-slate-600 hover:text-slate-300"
                }`}
              >
                <Icon className="h-4 w-4" />

                <span className="text-[7px] font-bold uppercase tracking-wider">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}