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
    <div className="rounded-xl border border-emerald-500 bg-[#f0fdf4] p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-950">
          {label}
        </span>

        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500 bg-white shadow-sm">
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-end gap-1">
        <span className="text-2xl font-black tracking-tight text-slate-900">
          {value}
        </span>

        {unit && (
          <span className="mb-1 text-[10px] font-medium text-slate-700">
            {unit}
          </span>
        )}
      </div>

      {trend && trendLabel && (
        <div
          className={`mt-3 flex items-center gap-1.5 text-[9px] font-bold ${trend === "up" ? "text-emerald-700" : "text-emerald-800"
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
      <div className="text-[8px] font-bold uppercase tracking-[0.18em] text-emerald-700">
        {eyebrow}
      </div>

      <h2 className="mt-1 text-base font-black uppercase tracking-wider text-slate-900">
        {title}
      </h2>

      <p className="mt-1 max-w-2xl text-[11px] font-medium leading-5 text-slate-700">
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
    <div className="overflow-hidden rounded-2xl border border-emerald-500 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[280px] min-w-[720px] w-full"
          preserveAspectRatio="none"
        >
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
                className="text-emerald-100"
                strokeWidth="1"
              />
            );
          })}

          <path
            d={areaPath}
            fill="currentColor"
            className="text-blue-500/10"
          />

          <path
            d={path}
            fill="none"
            stroke="currentColor"
            className="text-blue-600"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {points.map((point) => (
            <g key={point.label}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="currentColor"
                className="text-blue-600"
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
                className="fill-slate-700 font-bold text-[9px]"
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
    <div className="rounded-2xl border border-emerald-500 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-900">
          CO₂ Reduction by Zone
        </h3>

        <p className="mt-1 text-[9px] font-medium text-slate-700">
          Relative contribution to estimated network carbon reduction.
        </p>
      </div>

      <div className="space-y-4">
        {zoneCarbonData.map((item) => (
          <div key={item.zone}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[9px] font-bold text-slate-800">
                {item.zone}
              </span>

              <span className="text-[9px] font-bold text-slate-700">
                {item.value} t
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full border border-blue-300 bg-blue-100">
              <div
                className="h-full rounded-full bg-blue-600"
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
  const [selectedYear, setSelectedYear] = useState("2026");
  const [fromMonth, setFromMonth] = useState("Jan");
  const [toMonth, setToMonth] = useState("Aug");

  // Years for which actual finance data is currently available.
  // Add future years here when actual year-wise data is available.
  const availableYears = ["2026"];

  const monthOrder = financeData.map((item) => item.label);

  const fromIndex = monthOrder.indexOf(fromMonth);
  const toIndex = monthOrder.indexOf(toMonth);

  const startIndex = Math.min(fromIndex, toIndex);
  const endIndex = Math.max(fromIndex, toIndex);

  const filteredData = financeData.slice(
    startIndex,
    endIndex + 1,
  );

  const max = Math.max(
    ...filteredData.flatMap((item) => [
      item.revenue,
      item.spending,
    ]),
  );

  return (
    <div className="rounded-2xl border border-emerald-500 bg-white p-5 shadow-sm">
      {/* HEADER */}
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-900">
            Revenue vs Spending
          </h3>

          <p className="mt-1 text-[9px] font-medium text-slate-700">
            Monthly comparison between revenue collected and program spending.
          </p>
        </div>

        {/* FILTERS + LEGEND */}
        <div className="flex flex-wrap items-end gap-3">
          {/* YEAR */}
          <div>
            <label className="mb-1 block text-[8px] font-black uppercase tracking-wider text-slate-600">
              Year
            </label>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="h-8 rounded-md border border-emerald-400 bg-white px-2 text-[9px] font-bold text-slate-800 outline-none focus:border-emerald-700"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* FROM */}
          <div>
            <label className="mb-1 block text-[8px] font-black uppercase tracking-wider text-slate-600">
              From
            </label>

            <select
              value={fromMonth}
              onChange={(e) => setFromMonth(e.target.value)}
              className="h-8 rounded-md border border-emerald-400 bg-white px-2 text-[9px] font-bold text-slate-800 outline-none focus:border-emerald-700"
            >
              {monthOrder.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          {/* TO */}
          <div>
            <label className="mb-1 block text-[8px] font-black uppercase tracking-wider text-slate-600">
              To
            </label>

            <select
              value={toMonth}
              onChange={(e) => setToMonth(e.target.value)}
              className="h-8 rounded-md border border-emerald-400 bg-white px-2 text-[9px] font-bold text-slate-800 outline-none focus:border-emerald-700"
            >
              {monthOrder.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          {/* LEGEND */}
          <div className="flex h-8 items-center gap-4 text-[8px] font-semibold uppercase tracking-wider text-slate-700">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              Revenue
            </span>

            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Spending
            </span>
          </div>
        </div>
      </div>

      {/* SELECTED PERIOD */}
      <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
        <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-800">
          Showing {selectedYear} · {fromMonth} – {toMonth}
        </span>
      </div>

      {/* CHART */}
      <div className="space-y-6">
        {filteredData.map((item) => (
          <div key={item.label}>
            {/* MONTH */}
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-slate-800">
                {item.label}
              </span>
            </div>

            {/* REVENUE */}
            <div className="mb-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-600">
                  Revenue
                </span>

                <span className="text-[9px] font-black text-emerald-700">
                  ₹{item.revenue}L
                </span>
              </div>

              <div className="h-3 w-full overflow-hidden rounded-sm border border-emerald-300 bg-emerald-100">
                <div
                  className="h-full rounded-sm bg-emerald-600"
                  style={{
                    width: `${(item.revenue / max) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* SPENDING */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-[8px] font-bold uppercase tracking-wider text-slate-600">
                  Spending
                </span>

                <span className="text-[9px] font-black text-blue-700">
                  ₹{item.spending}L
                </span>
              </div>

              <div className="h-3 w-full overflow-hidden rounded-sm border border-blue-300 bg-blue-100">
                <div
                  className="h-full rounded-sm bg-blue-600"
                  style={{
                    width: `${(item.spending / max) * 100}%`,
                  }}
                />
              </div>
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
    <div className="overflow-x-auto border-b border-emerald-500 bg-[#f0fdf4]">
      <div className="flex min-w-max gap-1 px-4">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative rounded-t-lg px-5 py-4 text-[9px] font-black uppercase tracking-wider transition ${active
                ? "border-t border-x border-emerald-700 bg-emerald-800 text-white"
                : "text-slate-700 hover:text-slate-900"
                }`}
            >
              {tab.label}
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
          icon={<Car className="h-4 w-4 text-emerald-700" />}
        />

        <MetricCard
          label="Energy Delivered"
          value="1.84"
          unit="GWh"
          icon={<Zap className="h-4 w-4 text-emerald-700" />}
        />

        <MetricCard
          label="CO₂ Avoided"
          value="2,460"
          unit="t"
          icon={<Cloud className="h-4 w-4 text-emerald-700" />}
        />

        <MetricCard
          label="Government Revenue"
          value="₹2.84"
          unit="Cr"
          icon={
            <Activity className="h-4 w-4 text-emerald-700" />
          }
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
            <BatteryCharging className="h-4 w-4 text-emerald-700" />
          }
        />

        <MetricCard
          label="Energy Delivered"
          value="1.84"
          unit="GWh"
          icon={<Zap className="h-4 w-4 text-emerald-700" />}
        />

        <MetricCard
          label="Avg Session"
          value="34"
          unit="min"
          icon={<Activity className="h-4 w-4 text-emerald-700" />}
        />

        <MetricCard
          label="Peak Demand"
          value="18:00"
          unit="– 21:00"
          icon={<TrendingUp className="h-4 w-4 text-emerald-700" />}
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
          icon={<TrendingUp className="h-4 w-4 text-emerald-700" />}
        />

        <InsightBlock
          title="Peak period"
          value="18:00–21:00"
          description="The strongest charging demand occurs during the evening period."
          icon={<Activity className="h-4 w-4 text-emerald-700" />}
        />

        <InsightBlock
          title="Session duration"
          value="34 min"
          description="Average charging session duration across the network."
          icon={
            <BatteryCharging className="h-4 w-4 text-emerald-700" />
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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="EV Kilometres"
          value="18.6M"
          unit="km"
          icon={<Car className="h-4 w-4 text-emerald-700" />}
        />

        <MetricCard
          label="CO₂ Avoided"
          value="2,460"
          unit="t"
          icon={<Cloud className="h-4 w-4 text-emerald-700" />}
        />

        <MetricCard
          label="Fuel Displaced"
          value="1.12"
          unit="ML"
          icon={<Fuel className="h-4 w-4 text-emerald-700" />}
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
            <Activity className="h-4 w-4 text-emerald-700" />
          }
        />

        <MetricCard
          label="Government Collections"
          value="₹2.84"
          unit="Cr"
          icon={
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
          }
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
          icon={<Percent className="h-4 w-4 text-emerald-700" />}
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
            icon={<Activity className="h-4 w-4 text-emerald-700" />}
          />

          <MetricCard
            label="Approved"
            value="6,184"
            icon={<ShieldCheck className="h-4 w-4 text-emerald-700" />}
          />

          <MetricCard
            label="Amount Distributed"
            value="₹1.42"
            unit="Cr"
            icon={
              <Activity className="h-4 w-4 text-emerald-700" />
            }
          />

          <MetricCard
            label="EV Adoption Impact"
            value="+9.6"
            unit="%"
            icon={<TrendingUp className="h-4 w-4 text-emerald-700" />}
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
    <div className="rounded-xl border border-emerald-500 bg-[#f0fdf4] p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-950">
          {title}
        </span>

        {positive && (
          <TrendingUp className="h-3.5 w-3.5 text-emerald-700" />
        )}
      </div>

      <div className="mt-3 text-lg font-black text-slate-900">
        {value}
      </div>

      <p className="mt-1 text-[9px] font-medium leading-4 text-slate-700">
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
    <div className="rounded-xl border border-emerald-500 bg-[#f0fdf4] p-4 shadow-sm">
      <div className="flex items-center gap-2">
        {icon}

        <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-950">
          {title}
        </span>
      </div>

      <div className="mt-3 text-lg font-black text-slate-900">
        {value}
      </div>

      <p className="mt-1 text-[9px] font-medium leading-4 text-slate-700">
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
      className="h-4 w-4 text-emerald-700"
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
    <main className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto max-w-[1500px] space-y-7 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-emerald-500 bg-[#f0fdf4] shadow-sm">
          <div className="p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500 bg-white shadow-sm">
                <Activity className="h-5 w-5 text-emerald-700" />
              </div>

              <div>
                <h1 className="text-lg font-black uppercase tracking-[0.16em] text-slate-900">
                  Analytics
                </h1>

                <p className="mt-1 text-[10px] font-medium text-slate-700">
                  EV program performance, impact and financial outcomes
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="overflow-hidden rounded-2xl border border-emerald-500 bg-[#f0fdf4] shadow-sm">
          <TabNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          <div className="bg-white p-5 sm:p-6 lg:p-7">
            {content}
          </div>
        </section>

        <footer className="flex items-center justify-between border-t border-emerald-500 px-1 pt-4">
          <span className="text-[8px] font-semibold uppercase tracking-widest text-slate-700">
            Program analytics
          </span>

          <span className="flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-widest text-slate-700">
            <ShieldCheck className="h-3 w-3 text-emerald-700" />
            Verified reporting data
          </span>
        </footer>
      </div>
    </main>
  );
}