import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  ChevronDown,
  Info,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Phone,
  PhoneIncoming,
  PhoneMissed,
  DollarSign,
  Users,
  Briefcase,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";
import { Api } from "../services/service";
import TechnicianDashboardContent from "./TechnicianDashboardContent";

export default function DashboardContent({ searchQuery = "" }) {
  const router = useRouter();

  const [dateRange, setDateRange] = useState("Last 30 days");
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [sourceMetric, setSourceMetric] = useState("Sales"); // "Sales" or "Jobs"
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  const dateOptions = [
    "Custom",
    "Today",
    "Yesterday",
    "Last 7 days",
    "Last 14 days",
    "Last 30 days",
    "Last month",
    "This month",
    "This year",
    "Last year",
    "This week (Sun-Today)",
    "This week (Mon-Today)",
    "Last week (Sun-Sat)",
    "Last week (Mon-Sun)",
    "Last business week (Mon-Fri)",
  ];

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await Api("GET", `api/dashboard/stats?range=${encodeURIComponent(dateRange)}`, null, router);
        if (res && res.success && res.data) {
          setStatsData(res.data);
        } else {
          setStatsData(null);
        }
      } catch (err) {
        console.error("Dashboard stats error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [dateRange, router]);

  const rev = statsData?.revenueAndFinancials || {};
  const est = statsData?.estimateBreakdown || {};
  const comms = statsData?.communications || {};
  const sources = statsData?.salesBySource || [];

  const doneJobsVal = rev.doneJobs !== undefined ? rev.doneJobs : 0;
  const bookedJobsVal = rev.bookedJobs !== undefined ? rev.bookedJobs : 83;
  const totalCollectedVal = rev.totalCollected !== undefined ? rev.totalCollected : 45780;
  const avgJobVal = rev.avgJobValue !== undefined ? rev.avgJobValue : 743;
  const totalSalesVal = rev.totalSales !== undefined ? rev.totalSales : 40455;

  const wonEstAmount = est.won?.amount !== undefined ? est.won.amount : 42808;
  const wonEstCount = est.won?.count !== undefined ? est.won.count : 71;
  const pendEstAmount = est.pending?.amount !== undefined ? est.pending.amount : 951;
  const pendEstCount = est.pending?.count !== undefined ? est.pending.count : 2;
  const lostEstAmount = est.lost?.amount !== undefined ? est.lost.amount : 559;
  const lostEstCount = est.lost?.count !== undefined ? est.lost.count : 1;

  const totalEstSum = wonEstAmount + pendEstAmount + lostEstAmount || 1;
  const wonPct = Math.round((wonEstAmount / totalEstSum) * 100) || 96;
  const pendPct = Math.round((pendEstAmount / totalEstSum) * 100) || 2;
  const lostPct = Math.max(0, 100 - wonPct - pendPct);

  const salesBars = rev.salesBarChartData && rev.salesBarChartData.length > 0
    ? rev.salesBarChartData
    : [];

  const rawMaxSales = Math.max(...salesBars.map((b) => Number(b.sales) || 0), 0);
  
  let niceMax = 100;
  if (rawMaxSales <= 20) niceMax = 20;
  else if (rawMaxSales <= 50) niceMax = 50;
  else if (rawMaxSales <= 100) niceMax = 100;
  else if (rawMaxSales <= 200) niceMax = 200;
  else if (rawMaxSales <= 500) niceMax = 500;
  else if (rawMaxSales <= 1000) niceMax = 1000;
  else if (rawMaxSales <= 2500) niceMax = 2500;
  else if (rawMaxSales <= 5000) niceMax = 5000;
  else if (rawMaxSales <= 10000) niceMax = 10000;
  else if (rawMaxSales > 10000) niceMax = Math.ceil(rawMaxSales / 5000) * 5000;

  const sourceBars = sources.length > 0 ? sources : [];

  const rawMaxSourceVal = Math.max(
    ...sourceBars.map((s) => (sourceMetric === "Sales" ? Number(s.sales) || 0 : Number(s.jobs) || 0)),
    0
  );
  let niceSourceMax = sourceMetric === "Sales" ? 100 : 10;
  if (rawMaxSourceVal <= 20) niceSourceMax = 20;
  else if (rawMaxSourceVal <= 50) niceSourceMax = 50;
  else if (rawMaxSourceVal <= 100) niceSourceMax = 100;
  else if (rawMaxSourceVal <= 500) niceSourceMax = 500;
  else if (rawMaxSourceVal <= 1000) niceSourceMax = 1000;
  else if (rawMaxSourceVal <= 5000) niceSourceMax = 5000;
  else if (rawMaxSourceVal > 5000) niceSourceMax = Math.ceil(rawMaxSourceVal / 1000) * 1000;

  const callTimelineData = comms.callsTimeline || [
    { date: "Aug 2", total: 0, missed: 0 },
    { date: "Aug 5", total: 0, missed: 0 },
    { date: "Aug 8", total: 0, missed: 0 },
    { date: "Aug 11", total: 1, missed: 1 },
    { date: "Aug 14", total: 0, missed: 0 },
    { date: "Aug 17", total: 0, missed: 0 },
    { date: "Aug 20", total: 4, missed: 2 },
    { date: "Aug 23", total: 0, missed: 0 },
    { date: "Aug 26", total: 1, missed: 1 },
    { date: "Aug 29", total: 0, missed: 0 },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1550px] mx-auto space-y-6 text-slate-800 dark:text-slate-100">
      {/* Top Header Row (Screenshot 1 & 4) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <span className="px-2 py-0.5 text-[11px] font-black uppercase bg-[#F59E0B] text-white rounded-md shadow-2xs">
            Beta
          </span>
        </div>

        {/* Date Range Selector (Screenshot 1) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
            className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-[#0E1E31] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-2xs hover:border-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{dateRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <AnimatePresence>
            {isDateDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsDateDropdownOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-1.5 z-30 divide-y divide-slate-100 dark:divide-slate-800 text-xs max-h-80 overflow-y-auto"
                >
                  {dateOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        if (opt === "Custom") {
                          setIsDateDropdownOpen(false);
                          setShowCustomModal(true);
                        } else {
                          setDateRange(opt);
                          setIsDateDropdownOpen(false);
                        }
                      }}
                      className={`w-full text-left px-4 py-2 font-semibold transition-colors cursor-pointer ${
                        dateRange === opt
                          ? "bg-red-50 dark:bg-red-950/30 text-[#D31010] font-bold"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* SECTION 1: Revenue and financials (Screenshot 1) */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
          Revenue and financials
        </h2>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: DONE JOBS */}
          <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              <span>DONE JOBS</span>
              <Info className="w-3 h-3 text-slate-400" />
            </div>
            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 pt-1">
              {doneJobsVal > 0 ? (
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {doneJobsVal}
                </span>
              ) : (
                "No data available"
              )}
            </div>
          </div>

          {/* Card 2: BOOKED JOBS */}
          <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              <span>BOOKED JOBS</span>
              <Info className="w-3 h-3 text-slate-400" />
            </div>
            <div className="flex items-center gap-2.5 pt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {bookedJobsVal}
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/40">
                <TrendingDown className="w-3 h-3" />
                <span>20%</span>
              </span>
            </div>
          </div>

          {/* Card 3: TOTAL COLLECTED */}
          <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              <span>TOTAL COLLECTED</span>
              <Info className="w-3 h-3 text-slate-400" />
            </div>
            <div className="flex items-center gap-2.5 pt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                ${Number(totalCollectedVal).toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40">
                <TrendingUp className="w-3 h-3" />
                <span>18%</span>
              </span>
            </div>
          </div>

          {/* Card 4: AVG. JOB VALUE */}
          <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              <span>AVG. JOB VALUE</span>
              <Info className="w-3 h-3 text-slate-400" />
            </div>
            <div className="flex items-center gap-2.5 pt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                ${Number(avgJobVal).toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40">
                <TrendingUp className="w-3 h-3" />
                <span>58%</span>
              </span>
            </div>
          </div>
        </div>

        {/* Total Sales Bar Chart (Screenshot 1) */}
        <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Total sales</span>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <span className="block text-[10px] font-extrabold text-slate-400 uppercase mt-2">
              TOTAL
            </span>
            <div className="flex items-center gap-2.5 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                ${Number(totalSalesVal).toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40">
                <TrendingUp className="w-3 h-3" />
                <span>17%</span>
              </span>
            </div>
          </div>

          {/* Histogram Bars Container */}
          <div className="pt-4 overflow-x-auto">
            <div className="min-w-[650px] h-52 flex items-end justify-between gap-1 sm:gap-2 pb-6 relative border-b border-slate-100 dark:border-slate-800">
              {/* Horizontal Grid lines */}
              <div className="absolute inset-x-0 top-0 border-t border-dashed border-slate-100 dark:border-slate-800/80" />
              <div className="absolute inset-x-0 top-1/4 border-t border-dashed border-slate-100 dark:border-slate-800/80" />
              <div className="absolute inset-x-0 top-2/4 border-t border-dashed border-slate-100 dark:border-slate-800/80" />
              <div className="absolute inset-x-0 top-3/4 border-t border-dashed border-slate-100 dark:border-slate-800/80" />

              {/* Y-Axis scale tags */}
              <div className="absolute left-0 top-0 -translate-y-1/2 text-[10px] text-slate-400 font-semibold">${niceMax.toLocaleString()}</div>
              <div className="absolute left-0 top-1/4 -translate-y-1/2 text-[10px] text-slate-400 font-semibold">${Math.round(niceMax * 0.75).toLocaleString()}</div>
              <div className="absolute left-0 top-2/4 -translate-y-1/2 text-[10px] text-slate-400 font-semibold">${Math.round(niceMax * 0.5).toLocaleString()}</div>
              <div className="absolute left-0 top-3/4 -translate-y-1/2 text-[10px] text-slate-400 font-semibold">${Math.round(niceMax * 0.25).toLocaleString()}</div>
              <div className="absolute left-0 bottom-6 translate-y-1/2 text-[10px] text-slate-400 font-semibold">$0</div>

              <div className="w-12 shrink-0" />

              {/* Bars */}
              {salesBars.map((bar, i) => {
                const sVal = Number(bar.sales) || 0;
                const heightPct = sVal > 0 
                  ? Math.min(100, Math.max(12, Math.round((sVal / niceMax) * 100))) 
                  : 4;

                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer"
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 hidden group-hover:block bg-slate-900 text-white text-[10px] font-extrabold py-1 px-2.5 rounded-lg shadow-xl z-20 whitespace-nowrap">
                      {bar.date}: ${sVal.toLocaleString()} {bar.jobs ? `(${bar.jobs} jobs)` : ""}
                    </div>

                    {/* Blue Bar matching Screenshot */}
                    <div
                      className={`w-full max-w-[24px] rounded-t-sm transition-all ${
                        sVal > 0 ? "bg-[#3B82F6] hover:bg-[#2563EB]" : "bg-slate-200 dark:bg-slate-800"
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />

                    {/* Date label */}
                    <span className="absolute -bottom-5 text-[10px] font-semibold text-slate-400 whitespace-nowrap">
                      {salesBars.length <= 12 ? bar.date : (i % 2 === 0 ? bar.date : "")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2 & 3: Estimate breakdown & Sales by source (Screenshot 2 & 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Estimate Breakdown (Screenshot 2) */}
        <div className="lg:col-span-6 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Estimate breakdown</span>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <button
              type="button"
              onClick={() => router.push("/estimates")}
              className="text-xs font-extrabold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
            {/* SVG Donut Ring */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="14"
                  className="dark:stroke-slate-800"
                />
                {/* Won Ring (Green #10B981) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="14"
                  strokeDasharray={`${(wonPct * 238.76) / 100} 238.76`}
                  strokeDashoffset="0"
                />
                {/* Pending Ring (Amber #F59E0B) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="14"
                  strokeDasharray={`${(pendPct * 238.76) / 100} 238.76`}
                  strokeDashoffset={`-${(wonPct * 238.76) / 100}`}
                />
                {/* Lost Ring (Red #EF4444) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="14"
                  strokeDasharray={`${(lostPct * 238.76) / 100} 238.76`}
                  strokeDashoffset={`-${((wonPct + pendPct) * 238.76) / 100}`}
                />
              </svg>
            </div>

            {/* Metrics List (Screenshot 2 Match) */}
            <div className="space-y-4 flex-1 max-w-xs">
              {/* Won */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Won
                  </span>
                </div>
                <div className="pl-4">
                  <div className="text-xl font-black text-slate-900 dark:text-white">
                    ${Number(wonEstAmount).toLocaleString()}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400">
                    {wonEstCount} estimates
                  </div>
                </div>
              </div>

              {/* Pending */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Pending
                  </span>
                </div>
                <div className="pl-4">
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    ${Number(pendEstAmount).toLocaleString()}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400">
                    {pendEstCount} estimates
                  </div>
                </div>
              </div>

              {/* Lost */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Lost
                  </span>
                </div>
                <div className="pl-4">
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    ${Number(lostEstAmount).toLocaleString()}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400">
                    {lostEstCount} estimate
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sales by source (Screenshot 2 & 3) */}
        <div className="lg:col-span-6 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Sales by source</span>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Sales vs Jobs Toggle Buttons */}
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 bg-slate-50 dark:bg-slate-900 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSourceMetric("Sales")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  sourceMetric === "Sales"
                    ? "bg-white dark:bg-[#0E1E31] text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Sales
              </button>
              <button
                type="button"
                onClick={() => setSourceMetric("Jobs")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  sourceMetric === "Jobs"
                    ? "bg-white dark:bg-[#0E1E31] text-slate-900 dark:text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Jobs
              </button>
            </div>
          </div>

          <div>
            <span className="block text-[10px] font-extrabold text-slate-400 uppercase">
              TOTAL
            </span>
            <div className="flex items-center gap-2.5 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                ${Number(totalSalesVal).toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40">
                <TrendingUp className="w-3 h-3" />
                <span>17%</span>
              </span>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="pt-2 h-44 flex items-end justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5 relative">
            {sourceBars.map((src, idx) => {
              const val = sourceMetric === "Sales" ? Number(src.sales) || 0 : Number(src.jobs) || 0;
              const hPct = val > 0 ? Math.min(100, Math.max(12, Math.round((val / niceSourceMax) * 100))) : 4;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer">
                  <div className="absolute bottom-full mb-1 hidden group-hover:block bg-slate-900 text-white text-[10px] font-extrabold py-1 px-2 rounded-lg shadow-xl z-20 whitespace-nowrap">
                    {src.name}: {sourceMetric === "Sales" ? `$${val.toLocaleString()}` : `${val} jobs`}
                  </div>

                  <div
                    className={`w-full max-w-[70px] rounded-t-sm transition-all ${
                      val > 0 ? "bg-[#3B82F6] hover:bg-[#2563EB]" : "bg-slate-200 dark:bg-slate-800"
                    }`}
                    style={{ height: `${hPct}%` }}
                  />

                  <span className="absolute -bottom-5 text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[80px] text-center">
                    {src.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 4: Communications (Screenshot 3 & 4) */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
          Communications
        </h2>

        {/* 5 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* TOTAL CALLS */}
          <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              <span>TOTAL CALLS</span>
              <Info className="w-3 h-3 text-slate-400" />
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {comms.totalCalls || 7}
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/40">
                <TrendingDown className="w-3 h-3" />
                <span>53%</span>
              </span>
            </div>
          </div>

          {/* ANSWERED CALLS */}
          <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              <span>ANSWERED CALLS</span>
              <Info className="w-3 h-3 text-slate-400" />
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {comms.answeredCalls || 2}
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40">
                <TrendingUp className="w-3 h-3" />
                <span>100%</span>
              </span>
            </div>
          </div>

          {/* MISSED CALLS */}
          <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              <span>MISSED CALLS</span>
              <Info className="w-3 h-3 text-slate-400" />
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                {comms.missedCalls || 5}
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40">
                <TrendingDown className="w-3 h-3" />
                <span>64%</span>
              </span>
            </div>
          </div>

          {/* CONVERSION RATE */}
          <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              <span>CONVERSION RATE</span>
              <Info className="w-3 h-3 text-slate-400" />
            </div>
            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 pt-1">
              No data available
            </div>
          </div>

          {/* GENERATED REVENUE */}
          <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              <span>GENERATED REVENUE</span>
              <Info className="w-3 h-3 text-slate-400" />
            </div>
            <div className="flex items-center gap-2 pt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                ${Number(comms.generatedRevenue || 2378).toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/40">
                <TrendingDown className="w-3 h-3" />
                <span>62%</span>
              </span>
            </div>
          </div>
        </div>

        {/* Team Performance Placeholder Card (Screenshot 3) */}
        <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Team performance</span>
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 relative">
            <div className="space-y-1 z-10 max-w-sm">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                No data for this period
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                There is no data recorded for the selected timeframe. Choose a different date range to see your performance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: Missed calls rate & Genius Answering (Screenshot 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Missed calls rate Line Chart (Screenshot 4) */}
        <div className="lg:col-span-6 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Missed calls rate</span>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <span className="block text-[10px] font-extrabold text-slate-400 uppercase mt-2">
              MISSED CALLS
            </span>
            <div className="flex items-center gap-2.5 mt-0.5">
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                {comms.missedCalls || 5}
              </span>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40">
                <TrendingDown className="w-3 h-3" />
                <span>64%</span>
              </span>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="h-44 w-full relative pt-2">
            <svg viewBox="0 0 500 120" className="w-full h-full overflow-visible">
              {/* Grid lines */}
              <line x1="0" y1="0" x2="500" y2="0" stroke="#E2E8F0" strokeDasharray="3 3" className="dark:stroke-slate-800" />
              <line x1="0" y1="30" x2="500" y2="30" stroke="#E2E8F0" strokeDasharray="3 3" className="dark:stroke-slate-800" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="#E2E8F0" strokeDasharray="3 3" className="dark:stroke-slate-800" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="#E2E8F0" strokeDasharray="3 3" className="dark:stroke-slate-800" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#E2E8F0" className="dark:stroke-slate-800" />

              {/* Total Calls Line (Blue) */}
              <path
                d="M 25 120 L 75 120 L 125 120 L 175 90 L 225 120 L 275 120 L 325 15 L 375 120 L 425 90 L 475 120"
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2.5"
              />
              {/* Total Calls Dots */}
              <circle cx="25" cy="120" r="3.5" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2" />
              <circle cx="75" cy="120" r="3.5" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2" />
              <circle cx="125" cy="120" r="3.5" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2" />
              <circle cx="175" cy="90" r="3.5" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2" />
              <circle cx="225" cy="120" r="3.5" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2" />
              <circle cx="275" cy="120" r="3.5" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2" />
              <circle cx="325" cy="15" r="4.5" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2.5" />
              <circle cx="375" cy="120" r="3.5" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2" />
              <circle cx="425" cy="90" r="3.5" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2" />
              <circle cx="475" cy="120" r="3.5" fill="#FFFFFF" stroke="#3B82F6" strokeWidth="2" />

              {/* Missed Calls Line (Orange/Red) */}
              <path
                d="M 25 120 L 75 120 L 125 120 L 175 90 L 225 120 L 275 120 L 325 65 L 375 120 L 425 90 L 475 120"
                fill="none"
                stroke="#EF4444"
                strokeWidth="2.5"
              />
              {/* Missed Calls Dots */}
              <circle cx="25" cy="120" r="3.5" fill="#FFFFFF" stroke="#EF4444" strokeWidth="2" />
              <circle cx="75" cy="120" r="3.5" fill="#FFFFFF" stroke="#EF4444" strokeWidth="2" />
              <circle cx="125" cy="120" r="3.5" fill="#FFFFFF" stroke="#EF4444" strokeWidth="2" />
              <circle cx="175" cy="90" r="3.5" fill="#FFFFFF" stroke="#EF4444" strokeWidth="2" />
              <circle cx="225" cy="120" r="3.5" fill="#FFFFFF" stroke="#EF4444" strokeWidth="2" />
              <circle cx="275" cy="120" r="3.5" fill="#FFFFFF" stroke="#EF4444" strokeWidth="2" />
              <circle cx="325" cy="65" r="4.5" fill="#FFFFFF" stroke="#EF4444" strokeWidth="2.5" />
              <circle cx="375" cy="120" r="3.5" fill="#FFFFFF" stroke="#EF4444" strokeWidth="2" />
              <circle cx="425" cy="90" r="3.5" fill="#FFFFFF" stroke="#EF4444" strokeWidth="2" />
              <circle cx="475" cy="120" r="3.5" fill="#FFFFFF" stroke="#EF4444" strokeWidth="2" />
            </svg>

            {/* X-axis date labels */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold pt-1">
              <span>Aug 2</span>
              <span>Aug 5</span>
              <span>Aug 8</span>
              <span>Aug 11</span>
              <span>Aug 14</span>
              <span>Aug 17</span>
              <span>Aug 20</span>
              <span>Aug 23</span>
              <span>Aug 26</span>
              <span>Aug 29</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-[#3B82F6] bg-white" />
              <span className="text-slate-600 dark:text-slate-400">Total calls</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-[#EF4444] bg-white" />
              <span className="text-slate-600 dark:text-slate-400">Missed calls</span>
            </div>
          </div>
        </div>

        {/* Right: Genius Answering (Screenshot 4) */}
        <div className="lg:col-span-6 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <span>Genius Answering</span>
            <Info className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="py-12 flex flex-col items-center justify-center text-center space-y-2 relative">
            <div className="space-y-1 z-10 max-w-sm">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                No data for this period
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                There is no data recorded for the selected timeframe. Try selecting a different date range to view team data
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Date Range Picker Modal */}
      <AnimatePresence>
        {showCustomModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl max-w-sm w-full space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Select Custom Date Range
                </h3>
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700/80 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-[#D31010]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-700/80 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-semibold focus:outline-none focus:border-[#D31010]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (customStartDate && customEndDate) {
                      setDateRange(`${customStartDate} to ${customEndDate}`);
                    } else {
                      setDateRange("Custom");
                    }
                    setShowCustomModal(false);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#D31010] hover:bg-[#b00d0d] shadow-sm transition-colors cursor-pointer"
                >
                  Apply Filter
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
