"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Siren,
  Zap,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ShieldCheck,
  Search,
  Bell,
  UserCircle,
  Check,
} from "lucide-react";

const navigation = [
  {
    label: "Command Center",
    href: "/gov/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Emergency",
    href: "/gov/dispatch",
    icon: Siren,
  },
  {
    label: "Charging & Infrastructure",
    href: "/gov/infra-planner",
    icon: Zap,
  },
  {
    label: "Analytics",
    href: "/gov/revenue",
    icon: BarChart3,
  },
];

export default function GovernmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const sidebarWidth = collapsed
    ? "lg:w-[72px]"
    : "lg:w-64";

  const mainMargin = collapsed
    ? "lg:ml-[72px]"
    : "lg:ml-64";

  /* ========================================================
     SEARCH
  ======================================================== */

  const filteredNavigation = navigation.filter(
    (item) =>
      item.label
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
  );

  const handleSearchChange = (
    value: string,
  ) => {
    setSearchQuery(value);
    setSearchOpen(value.trim().length > 0);
  };

  const handleSearchSelect = (
    href: string,
  ) => {
    setSearchQuery("");
    setSearchOpen(false);
    router.push(href);
  };

  /* ========================================================
     SIGN OUT
  ======================================================== */

  const handleSignOut = () => {
    setProfileOpen(false);
    setNotificationsOpen(false);
    setMobileOpen(false);

    // Clear common client-side auth state if present.
    try {
      localStorage.removeItem("enav-role");
      localStorage.removeItem("enav-user");
      localStorage.removeItem("enav-auth");
    } catch {
      // Ignore storage errors.
    }

    router.push("/auth/signin");
  };

  return (
    <div className="min-h-screen bg-[#040b16] text-slate-100">

      {/* ====================================================
          MOBILE BACKDROP
      ==================================================== */}

      {mobileOpen && (
        <button
          aria-label="Close navigation"
          onClick={() =>
            setMobileOpen(false)
          }
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* ====================================================
          SIDEBAR
      ==================================================== */}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen
          flex-col overflow-visible
          border-r border-slate-800/80
          bg-[#07111f]
          transition-all duration-200 ease-out

          ${sidebarWidth}

          ${
            mobileOpen
              ? "translate-x-0 w-64"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >

        {/* ==================================================
            LOGO
        ================================================== */}

        <div
          className={`
            flex h-[78px] shrink-0 items-center
            border-b border-slate-800/80
            ${collapsed ? "justify-center px-2" : "px-5"}
          `}
        >

          <div
            className={`
              flex items-center
              ${collapsed
                ? "justify-center"
                : "gap-3"}
            `}
          >

            {/* Logo mark */}

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">

              <span className="text-sm font-black tracking-tight text-white">
                E<span className="text-emerald-400">
                  V
                </span>
              </span>

            </div>

            {/* Logo text */}

            {!collapsed && (
              <div className="min-w-0">

                <div className="text-lg font-black tracking-[0.16em] text-white">
                  ENA<span className="text-emerald-400">
                    V
                  </span>
                </div>

                <p className="mt-0.5 whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  City Mobility Command
                </p>

              </div>
            )}

          </div>

          {/* Mobile close */}

          <button
            type="button"
            onClick={() =>
              setMobileOpen(false)
            }
            aria-label="Close sidebar"
            className="ml-auto rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-white lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>

        </div>

        {/* ==================================================
            COLLAPSE
        ================================================== */}

        <button
          type="button"
          onClick={() =>
            setCollapsed(
              (value) => !value,
            )
          }
          aria-label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
          className="
            absolute -right-3 top-[88px]
            hidden h-6 w-6 items-center justify-center
            rounded-full
            border border-slate-700
            bg-[#0b1727]
            text-slate-400
            shadow-lg
            transition
            hover:border-emerald-500/40
            hover:bg-[#102238]
            hover:text-emerald-400
            lg:flex
          "
        >
          {collapsed ? (
            <ChevronRight className="h-3.5 w-3.5" />
          ) : (
            <ChevronLeft className="h-3.5 w-3.5" />
          )}
        </button>

        {/* ==================================================
            NAVIGATION
        ================================================== */}

        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-5">

          {!collapsed && (
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">
              Operations
            </p>
          )}

          {collapsed && (
            <div className="mb-3 h-px bg-slate-800/80" />
          )}

          <div className="space-y-1">

            {navigation.map((item) => {
              const Icon = item.icon;

              const isActive =
                pathname === item.href ||
                (item.href !== "/gov/dashboard" &&
                  pathname.startsWith(
                    item.href,
                  ));

              return (
                <div
                  key={item.href}
                  className="group relative"
                >

                  <Link
                    href={item.href}
                    onClick={() =>
                      setMobileOpen(false)
                    }
                    className={`
                      flex items-center rounded-xl
                      text-sm font-semibold
                      transition-all duration-150

                      ${
                        collapsed
                          ? "justify-center px-2.5 py-3"
                          : "gap-3 px-3 py-3"
                      }

                      ${
                        isActive
                          ? "bg-emerald-500 text-[#03110c] shadow-lg shadow-emerald-500/10"
                          : "text-slate-400 hover:bg-slate-900/80 hover:text-white"
                      }
                    `}
                  >

                    <Icon
                      className={`
                        h-[18px] w-[18px] shrink-0
                        ${
                          isActive
                            ? "text-[#03110c]"
                            : ""
                        }
                      `}
                    />

                    {!collapsed && (
                      <span className="truncate">
                        {item.label}
                      </span>
                    )}

                  </Link>

                  {/* collapsed tooltip */}

                  {collapsed && (
                    <div
                      className="
                        pointer-events-none
                        absolute left-[62px] top-1/2 z-[100]
                        hidden -translate-y-1/2
                        whitespace-nowrap
                        rounded-lg
                        border border-slate-700
                        bg-[#0b1727]
                        px-3 py-2
                        text-xs font-semibold
                        text-white
                        shadow-xl
                        group-hover:block
                      "
                    >
                      {item.label}
                    </div>
                  )}

                </div>
              );
            })}

          </div>

        </nav>

        {/* ==================================================
            SIDEBAR FOOTER
        ================================================== */}

        <div
          className={`
            shrink-0 border-t border-slate-800/80
            ${collapsed ? "p-2" : "p-3"}
          `}
        >

          <div className="group relative">

            <button
              type="button"
              onClick={handleSignOut}
              className={`
                flex w-full items-center rounded-xl
                text-sm font-semibold
                text-slate-400
                transition
                hover:bg-red-950/30
                hover:text-red-400

                ${
                  collapsed
                    ? "justify-center px-2.5 py-3"
                    : "gap-3 px-3 py-3"
                }
              `}
            >

              <LogOut className="h-[18px] w-[18px] shrink-0" />

              {!collapsed && (
                <span>Sign Out</span>
              )}

            </button>

            {collapsed && (
              <div
                className="
                  pointer-events-none
                  absolute left-[62px] top-1/2 z-[100]
                  hidden -translate-y-1/2
                  whitespace-nowrap
                  rounded-lg
                  border border-slate-700
                  bg-[#0b1727]
                  px-3 py-2
                  text-xs font-semibold
                  text-white
                  shadow-xl
                  group-hover:block
                "
              >
                Sign Out
              </div>
            )}

          </div>

          {/* System status */}

          {!collapsed ? (
            <div className="mt-3 rounded-xl border border-emerald-500/15 bg-emerald-950/15 p-3">

              <div className="flex items-center gap-2">

                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />

                <span className="text-[10px] font-bold tracking-wide text-emerald-400">
                  SYSTEM OPERATIONAL
                </span>

              </div>

              <div className="mt-2 flex items-center gap-1.5">

                <ShieldCheck className="h-3 w-3 text-slate-600" />

                <p className="text-[9px] text-slate-500">
                  Government-authorized access
                </p>

              </div>

            </div>
          ) : (
            <div
              className="
                group relative mt-2
                flex justify-center
                rounded-xl
                border border-emerald-500/15
                bg-emerald-950/15
                p-3
              "
            >

              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />

              <div
                className="
                  pointer-events-none
                  absolute left-[62px] bottom-0
                  hidden w-max
                  rounded-lg
                  border border-slate-700
                  bg-[#0b1727]
                  px-3 py-2
                  text-xs font-semibold
                  text-emerald-400
                  shadow-xl
                  group-hover:block
                "
              >
                SYSTEM OPERATIONAL
              </div>

            </div>
          )}

        </div>

      </aside>

      {/* ====================================================
          MAIN CONTENT
      ==================================================== */}

      <main
        className={`
          min-h-screen
          transition-[margin] duration-200 ease-out
          ${mainMargin}
        `}
      >

        {children}

      </main>

    </div>
  );
}