"use client";

import React, { useMemo, useState } from "react";
import {
  Activity,
  BatteryCharging,
  Car,
  CircleDollarSign,
  Cloud,
  Fuel,
  Leaf,
  Percent,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type AnalyticsTab =
  | "overview"
  | "charging"
  | "sustainability"
  | "finance";

/* =========================================================
   DATA
========================================================= */

const activityData = [
  { label: "Jan", value: 42 },
  { label: "Feb", value: 48 },
  { label: "Mar", value: 53 },
  { label: "Apr", value: 61 },
  { label: "May", value: 68 },
  { label: "Jun", value: 76 },
  { label: "Jul", value: 84 },
  { label: "Aug", value: 91 },
];

const chargingData = [
  { label: "Jan", value: 34 },
  { label: "Feb", value: 39 },
  { label: "Mar", value: 43 },
  { label: "Apr", value: 49 },
  { label: "May", value: 56 },
  { label: "Jun", value: 61 },
  { label: "Jul", value: 69 },
  { label: "Aug", value: 74 },
];

const carbonData = [
  { label: "Jan", value: 168 },
  { label: "Feb", value: 194 },
  { label: "Mar", value: 218 },
  { label: "Apr", value: 247 },
  { label: "May", value: 281 },
  { label: "Jun", value: 319 },
  { label: "Jul", value: 351 },
  { label: "Aug", value: 386 },
];

const financeData = [
  { label: "Jan", revenue: 18, spending: 12 },
  { label: "Feb", revenue: 21, spending: 14 },
  { label: "Mar", revenue: 24, spending: 15 },
  { label: "Apr", revenue: 28, spending: 17 },
  { label: "May", revenue: 31, spending: 19 },
  { label: "Jun", revenue: 35, spending: 21 },
  { label: "Jul", revenue: 39, spending: 23 },
  { label: "Aug", revenue: 44, spending: 24 },
];

const zoneCarbonData = [
  { zone: "Dwarka", value: 92 },
  { zone: "Janakpuri", value: 78 },
  { zone: "Rohini", value: 65 },
  { zone: "CP Central", value: 58 },
  { zone: "Okhla", value: 51 },
];

/* =========================================================
   HELPERS
========================================================= */

function MetricCard({
  label,
  value,
  unit,
  icon,
  trend,
  trendLabel,
}: {
  label: string;
  value: string;
  unit?: string;
  icon: React.ReactNode;
  trend?: "up" | "down";
  trendLabel?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#091221] p-5">
      <div className="flex items-start justify-between">
        <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">
          {label}
        </span>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-[#050A13]">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-end gap-1">
        <span className="text-2xl font-black tracking-tight text-white">
          {value}
        </span>

        {unit && (
          <span className="mb-1 text-[10px] font-medium text-slate-500">
            {unit}
          </span>
        )}
      </div>

      {trend && trendLabel && (
        <div
          className={`mt-3 flex items-center gap-1.5 text-[9px] font-bold ${
            trend === "up" ? "text-emerald-400" : "text-blue-400"
          }`}
        >
          {trend === "up" ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}

          {trendLabel}
        </div>
      )}
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-5">
      <div className="text-[8px] font-bold uppercase tracking-[0.18em] text-blue-400">
        {eyebrow}
      </div>

      <h2 className="mt-1 text-base font-black uppercase tracking-wider text-white">
        {title}
      </h2>

      <p className="mt-1 max-w-2xl text-[11px] leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   SIMPLE LINE CHART
========================================================= */

function LineChart({
  data,
  suffix = "",
}: {
  data: { label: string; value: number }[];
  suffix?: string;
}) {
  const width = 900;
  const height = 260;
  const paddingX = 35;
  const paddingY = 30;

  const max = Math.max(...data.map((item) => item.value));
  const min = Math.min(...data.map((item) => item.value));

  const range = max - min || 1;

  const points = data.map((item, index) => {
    const x =
      paddingX +
      (index / Math.max(data.length - 1, 1)) *
        (width - paddingX * 2);

    const y =
      height -
      paddingY -
      ((item.value - min) / range) *
        (height - paddingY * 2);

    return {
      ...item,
      x,
      y,
    };
  });

  const path = points
    .map((point, index) =>
      index === 0
        ? `M ${point.x} ${point.y}`
        : `L ${point.x} ${point.y}`,
    )
    .join(" ");

  const areaPath = `
    ${path}
    L ${points[points.length - 1].x} ${height - paddingY}
    L ${points[0].x} ${height - paddingY}
    Z
  `;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#050A13]">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[280px] min-w-[720px] w-full"
          preserveAspectRatio="none"
        >
          {/* GRID */}

          {[0, 1, 2, 3].map((row) => {
            const y =
              paddingY +
              (row / 3) * (height - paddingY * 2);

            return (
              <line
                key={row}
                x1={paddingX}
                x2={width - paddingX}
                y1={y}
                y2={y}
                stroke="currentColor"
                className="text-slate-800"
                strokeWidth="1"
              />
            );
          })}

          {/* AREA */}

          <path
            d={areaPath}
            fill="currentColor"
            className="text-blue-500/5"
          />

          {/* LINE */}

          <path
            d={path}
            fill="none"
            stroke="currentColor"
            className="text-blue-400"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* POINTS */}

          {points.map((point) => (
            <g key={point.label}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="currentColor"
                className="text-blue-400"
              />

              <text
                x={point.x}
                y={height - 8}
                textAnchor="middle"
                className="fill-slate-600 text-[10px]"
              >
                {point.label}
              </text>

              <text
                x={point.x}
                y={point.y - 12}
                textAnchor="middle"
                className="fill-slate-400 text-[9px]"
              >
                {point.value}
                {suffix}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

/* =========================================================
   BAR CHART
========================================================= */

function ZoneBars() {
  const max = Math.max(...zoneCarbonData.map((item) => item.value));

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#050A13] p-5">
      <div className="mb-5">
        <h3 className="text-[10px] font-black uppercase tracking-wider text-white">
          CO₂ Reduction by Zone
        </h3>

        <p className="mt-1 text-[9px] text-slate-600">
          Relative contribution to estimated network carbon reduction.
        </p>
      </div>

      <div className="space-y-4">
        {zoneCarbonData.map((item) => (
          <div key={item.zone}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[9px] font-bold text-slate-400">
                {item.zone}
              </span>

              <span className="text-[9px] font-bold text-slate-500">
                {item.value} t
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-emerald-400"
                style={{
                  width: `${(item.value / max) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   FINANCE CHART
========================================================= */

function FinanceChart() {
  const max = Math.max(
    ...financeData.flatMap((item) => [
      item.revenue,
      item.spending,
    ]),
  );

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#050A13] p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-wider text-white">
            Revenue vs Spending
          </h3>

          <p className="mt-1 text-[9px] text-slate-600">
            Monthly financial movement.
          </p>
        </div>

        <div className="flex items-center gap-4 text-[8px] uppercase tracking-wider text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Revenue
          </span>

          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-400" />
            Spending
          </span>
        </div>
      </div>

      <div className="space-y-5">
        {financeData.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex items-center justify-between">
              <span className="w-8 text-[9px] font-bold text-slate-600">
                {item.label}
              </span>

              <div className="flex flex-1 gap-2">
                <div className="h-3 flex-1 overflow-hidden rounded-sm bg-slate-800">
                  <div
                    className="h-full rounded-sm bg-emerald-400"
                    style={{
                      width: `${(item.revenue / max) * 100}%`,
                    }}
                  />
                </div>

                <div className="h-3 flex-1 overflow-hidden rounded-sm bg-slate-800">
                  <div
                    className="h-full rounded-sm bg-blue-400"
                    style={{
                      width: `${(item.spending / max) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <span className="ml-3 w-14 text-right text-[9px] font-bold text-slate-400">
                ₹{item.revenue}L
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   TAB NAV
========================================================= */

function TabNav({
  activeTab,
  setActiveTab,
}: {
  activeTab: AnalyticsTab;
  setActiveTab: (tab: AnalyticsTab) => void;
}) {
  const tabs: {
    id: AnalyticsTab;
    label: string;
  }[] = [
    {
      id: "overview",
      label: "Overview",
    },
    {
      id: "charging",
      label: "Charging",
    },
    {
      id: "sustainability",
      label: "Sustainability",
    },
    {
      id: "finance",
      label: "Finance",
    },
  ];

  return (
    <div className="overflow-x-auto border-b border-slate-800">
      <div className="flex min-w-max gap-1">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-5 py-4 text-[9px] font-black uppercase tracking-wider transition ${
                active
                  ? "text-white"
                  : "text-slate-600 hover:text-slate-300"
              }`}
            >
              {tab.label}

              {active && (
                <span className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-blue-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   OVERVIEW
========================================================= */

function Overview() {
  return (
    <div className="space-y-7">
      <SectionTitle
        eyebrow="Program performance"
        title="Network Outcomes"
        description="A high-level view of how the EV program is performing across usage, energy, environmental impact and public revenue."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="EV Sessions"
          value="184.6K"
          icon={<Car className="h-4 w-4 text-blue-400" />}
          trend="up"
          trendLabel="+18.4% vs previous period"
        />

        <MetricCard
          label="Energy Delivered"
          value="1.84"
          unit="GWh"
          icon={<Zap className="h-4 w-4 text-amber-400" />}
          trend="up"
          trendLabel="+12.7% vs previous period"
        />

        <MetricCard
          label="CO₂ Avoided"
          value="2,460"
          unit="t"
          icon={<Cloud className="h-4 w-4 text-emerald-400" />}
          trend="up"
          trendLabel="+21.3% vs previous period"
        />

        <MetricCard
          label="Government Revenue"
          value="₹2.84"
          unit="Cr"
          icon={
            <CircleDollarSign className="h-4 w-4 text-purple-400" />
          }
          trend="up"
          trendLabel="+14.1% vs previous period"
        />
      </div>

      <section>
        <SectionTitle
          eyebrow="Network trend"
          title="EV Network Activity"
          description="Monthly growth in overall EV activity across the program."
        />

        <LineChart data={activityData} />
      </section>

      <section>
        <SectionTitle
          eyebrow="Change indicators"
          title="Performance Summary"
          description="The main directional changes currently visible in the program."
        />

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <SummaryItem
            title="EV adoption"
            value="+18%"
            description="Growth in registered EV activity."
            positive
          />

          <SummaryItem
            title="Charging demand"
            value="+12.7%"
            description="Increase in energy delivered."
            positive
          />

          <SummaryItem
            title="Carbon impact"
            value="+21.3%"
            description="Increase in avoided emissions."
            positive
          />

          <SummaryItem
            title="Financial return"
            value="+14.1%"
            description="Growth in government revenue."
            positive
          />
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   CHARGING
========================================================= */

function Charging() {
  return (
    <div className="space-y-7">
      <SectionTitle
        eyebrow="Charging outcomes"
        title="Charging Activity"
        description="Measures how the charging network is being used, without repeating individual station operations."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Charging Sessions"
          value="184.6K"
          icon={
            <BatteryCharging className="h-4 w-4 text-blue-400" />
          }
          trend="up"
          trendLabel="+18.4%"
        />

        <MetricCard
          label="Energy Delivered"
          value="1.84"
          unit="GWh"
          icon={<Zap className="h-4 w-4 text-amber-400" />}
          trend="up"
          trendLabel="+12.7%"
        />

        <MetricCard
          label="Avg Session"
          value="34"
          unit="min"
          icon={<Activity className="h-4 w-4 text-purple-400" />}
        />

        <MetricCard
          label="Peak Demand"
          value="18:00"
          unit="– 21:00"
          icon={<TrendingUp className="h-4 w-4 text-red-400" />}
        />
      </div>

      <section>
        <SectionTitle
          eyebrow="Usage trend"
          title="Charging Activity Over Time"
          description="Monthly charging activity measured by network-wide energy demand."
        />

        <LineChart
          data={chargingData}
          suffix=" GWh"
        />
      </section>

      <div className="grid gap-3 lg:grid-cols-3">
        <InsightBlock
          title="Demand growth"
          value="+12.7%"
          description="Energy delivered has increased consistently over the measured period."
          icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}
        />

        <InsightBlock
          title="Peak period"
          value="18:00–21:00"
          description="The strongest charging demand occurs during the evening period."
          icon={<Activity className="h-4 w-4 text-amber-400" />}
        />

        <InsightBlock
          title="Session duration"
          value="34 min"
          description="Average charging session duration across the network."
          icon={
            <BatteryCharging className="h-4 w-4 text-blue-400" />
          }
        />
      </div>
    </div>
  );
}

/* =========================================================
   SUSTAINABILITY
========================================================= */

function Sustainability() {
  return (
    <div className="space-y-7">
      <SectionTitle
        eyebrow="Environmental outcomes"
        title="Sustainability Impact"
        description="Measures the environmental benefit produced by EV adoption and charging activity."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="EV Kilometres"
          value="18.6M"
          unit="km"
          icon={<Car className="h-4 w-4 text-blue-400" />}
          trend="up"
          trendLabel="+16.8%"
        />

        <MetricCard
          label="CO₂ Avoided"
          value="2,460"
          unit="t"
          icon={<Cloud className="h-4 w-4 text-emerald-400" />}
          trend="up"
          trendLabel="+21.3%"
        />

        <MetricCard
          label="Fuel Displaced"
          value="1.12"
          unit="ML"
          icon={<Fuel className="h-4 w-4 text-amber-400" />}
          trend="up"
          trendLabel="+14.6%"
        />

        <MetricCard
          label="Renewable Energy"
          value="27"
          unit="%"
          icon={<Leaf className="h-4 w-4 text-emerald-400" />}
          trend="up"
          trendLabel="+4.2 percentage points"
        />
      </div>

      <section>
        <SectionTitle
          eyebrow="Carbon impact"
          title="CO₂ Reduction"
          description="Estimated cumulative emissions avoided through EV usage."
        />

        <LineChart
          data={carbonData}
          suffix=" t"
        />
      </section>

      <section>
        <SectionTitle
          eyebrow="Geographic impact"
          title="Reduction by Zone"
          description="Shows where the environmental benefit is contributing most strongly."
        />

        <ZoneBars />
      </section>
    </div>
  );
}

/* =========================================================
   FINANCE
========================================================= */

function Finance() {
  return (
    <div className="space-y-7">
      <SectionTitle
        eyebrow="Financial outcomes"
        title="Program Finance"
        description="Tracks revenue, public collections, infrastructure spending and estimated return."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Charging Revenue"
          value="₹4.82"
          unit="Cr"
          icon={
            <CircleDollarSign className="h-4 w-4 text-emerald-400" />
          }
          trend="up"
          trendLabel="+16.2%"
        />

        <MetricCard
          label="Government Collections"
          value="₹2.84"
          unit="Cr"
          icon={
            <CircleDollarSign className="h-4 w-4 text-purple-400" />
          }
          trend="up"
          trendLabel="+14.1%"
        />

        <MetricCard
          label="Infrastructure Spending"
          value="₹3.18"
          unit="Cr"
          icon={<BuildingIcon />}
        />

        <MetricCard
          label="Estimated ROI"
          value="14.2"
          unit="%"
          icon={<Percent className="h-4 w-4 text-blue-400" />}
          trend="up"
          trendLabel="+1.8 points"
        />
      </div>

      <section>
        <SectionTitle
          eyebrow="Financial movement"
          title="Revenue vs Spending"
          description="Monthly comparison between program revenue and infrastructure expenditure."
        />

        <FinanceChart />
      </section>

      <section>
        <SectionTitle
          eyebrow="Public support"
          title="Subsidy Program"
          description="Current subsidy activity and its relationship to EV adoption."
        />

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Applications"
            value="8,420"
            icon={<Activity className="h-4 w-4 text-blue-400" />}
          />

          <MetricCard
            label="Approved"
            value="6,184"
            icon={<ShieldCheck className="h-4 w-4 text-emerald-400" />}
          />

          <MetricCard
            label="Amount Distributed"
            value="₹1.42"
            unit="Cr"
            icon={
              <CircleDollarSign className="h-4 w-4 text-purple-400" />
            }
          />

          <MetricCard
            label="EV Adoption Impact"
            value="+9.6"
            unit="%"
            icon={<TrendingUp className="h-4 w-4 text-amber-400" />}
            trend="up"
            trendLabel="associated growth"
          />
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   SMALL CONTENT COMPONENTS
========================================================= */

function SummaryItem({
  title,
  value,
  description,
  positive,
}: {
  title: string;
  value: string;
  description: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#091221] p-4">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
          {title}
        </span>

        {positive && (
          <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
        )}
      </div>

      <div className="mt-3 text-lg font-black text-white">
        {value}
      </div>

      <p className="mt-1 text-[9px] leading-4 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function InsightBlock({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#091221] p-4">
      <div className="flex items-center gap-2">
        {icon}

        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
          {title}
        </span>
      </div>

      <div className="mt-3 text-lg font-black text-white">
        {value}
      </div>

      <p className="mt-1 text-[9px] leading-4 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function BuildingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4 text-blue-400"
    >
      <path d="M3 21h18" />
      <path d="M6 21V5l6-3 6 3v16" />
      <path d="M9 9h1" />
      <path d="M14 9h1" />
      <path d="M9 13h1" />
      <path d="M14 13h1" />
      <path d="M9 17h1" />
      <path d="M14 17h1" />
    </svg>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] =
    useState<AnalyticsTab>("overview");

  const content = useMemo(() => {
    switch (activeTab) {
      case "charging":
        return <Charging />;

      case "sustainability":
        return <Sustainability />;

      case "finance":
        return <Finance />;

      case "overview":
      default:
        return <Overview />;
    }
  }, [activeTab]);

  return (
    <main className="min-h-screen bg-[#050912] text-slate-100">
      <div className="mx-auto max-w-[1450px] px-4 py-6 sm:px-6 lg:px-8">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
              <Activity className="h-5 w-5 text-blue-400" />
            </div>

            <div>
              <h1 className="text-lg font-black uppercase tracking-[0.16em] text-white">
                Analytics
              </h1>

              <p className="mt-1 text-[10px] text-slate-600">
                EV program performance, impact and financial outcomes
              </p>
            </div>
          </div>
        </header>

        {/* =====================================================
            TAB CONTAINER
        ===================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-[#070D18]">
          <TabNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <div className="p-5 sm:p-6 lg:p-7">
            {content}
          </div>
        </section>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4">
          <span className="text-[8px] uppercase tracking-widest text-slate-700">
            Program analytics
          </span>

          <span className="flex items-center gap-1.5 text-[8px] uppercase tracking-widest text-slate-700">
            <ShieldCheck className="h-3 w-3 text-emerald-500" />
            Verified reporting data
          </span>
        </footer>
      </div>
    </main>
  );
}