import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  Calendar,
  ChevronDown,
  Info,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useTheme } from "../context/ThemeContext";
import { Api } from "../services/service";

export default function TechnicianDashboardContent({ searchQuery = "" }) {
  const router = useRouter();
  const { theme } = useTheme();
  const [dateRange, setDateRange] = useState("Last 30 days");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(false);

  const isDark = theme === "dark";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await Api(
          "GET",
          `api/dashboard/stats?range=${encodeURIComponent(dateRange)}`,
          null,
          router
        );
        if (res && res.success && res.data) {
          setStatsData(res.data);
        }
      } catch (err) {
        console.error("Dashboard stats error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [dateRange, router]);

  const rev = statsData?.revenueAndFinancials || {};
  const est = statsData?.estimateBreakdown || {};

  const doneJobsVal = rev.doneJobs !== undefined ? rev.doneJobs : 17;
  const bookedJobsVal = rev.bookedJobs !== undefined ? rev.bookedJobs : 99;
  const totalCollectedVal = rev.totalCollected !== undefined ? rev.totalCollected : 37986;
  const avgJobVal = rev.avgJobValue !== undefined ? rev.avgJobValue : 558;
  const totalSalesVal = rev.totalSales !== undefined ? rev.totalSales : 28089;

  const wonAmount = est.won?.amount !== undefined ? est.won.amount : 31306;
  const wonCount = est.won?.count !== undefined ? est.won.count : 80;
  const pendingAmount = est.pending?.amount !== undefined ? est.pending.amount : 5962;
  const pendingCount = est.pending?.count !== undefined ? est.pending.count : 2;
  const lostAmount = est.lost?.amount !== undefined ? est.lost.amount : 1215;
  const lostCount = est.lost?.count !== undefined ? est.lost.count : 4;

  const totalEstCount = wonCount + pendingCount + lostCount || 86;

  const barChartData =
    rev.salesBarChartData && rev.salesBarChartData.length > 0
      ? rev.salesBarChartData
      : [
          { date: "Jul 13", sales: 1350 },
          { date: "Jul 15", sales: 380 },
          { date: "Jul 17", sales: 120 },
          { date: "Jul 19", sales: 750 },
          { date: "Jul 20", sales: 3100 },
          { date: "Jul 22", sales: 940 },
          { date: "Jul 25", sales: 760 },
          { date: "Jul 28", sales: 2320 },
          { date: "Jul 31", sales: 1540 },
          { date: "Aug 2", sales: 380 },
          { date: "Aug 5", sales: 1150 },
          { date: "Aug 8", sales: 580 },
          { date: "Aug 10", sales: 2750 },
          { date: "Aug 12", sales: 370 },
        ];

  const pieChartData = [
    { name: "Won", value: wonCount || 80, amount: `$${Number(wonAmount).toLocaleString()}`, color: "#10B981" },
    { name: "Pending", value: pendingCount || 2, amount: `$${Number(pendingAmount).toLocaleString()}`, color: "#F59E0B" },
    { name: "Lost", value: lostCount || 1, amount: `$${Number(lostAmount).toLocaleString()}`, color: "#EF4444" },
  ];

  const kpiCards = [
    {
      title: "DONE JOBS",
      value: doneJobsVal > 0 ? String(doneJobsVal) : "No data available",
      change: "+1600%",
      isPositive: true,
      info: "Completed jobs in this period",
    },
    {
      title: "BOOKED JOBS",
      value: String(bookedJobsVal),
      change: "+8%",
      isPositive: true,
      info: "Newly booked jobs scheduled",
    },
    {
      title: "TOTAL COLLECTED",
      value: `$${Number(totalCollectedVal).toLocaleString()}`,
      change: "-2%",
      isPositive: false,
      info: "Total revenue collected",
    },
    {
      title: "AVG. JOB VALUE",
      value: `$${Number(avgJobVal).toLocaleString()}`,
      change: "+2%",
      isPositive: true,
      info: "Average dollar value per job",
    },
  ];

  const filteredKpis = searchQuery
    ? kpiCards.filter((card) =>
        card.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : kpiCards;

  const dateOptions = [
    "Today",
    "Yesterday",
    "Last 7 days",
    "Last 30 days",
    "This month",
    "This year",
  ];

  const maxBarSales = Math.max(...barChartData.map((b) => Number(b.sales) || 0), 1000);
  const niceYMax = maxBarSales > 3000 ? Math.ceil(maxBarSales / 1000) * 1000 : 3000;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h1>
        </div>

        {/* Date Filter Selector */}
        <div className="relative self-start sm:self-auto">
          <button
            onClick={() => setShowDateDropdown(!showDateDropdown)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#0E1E31] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-colors text-sm font-medium cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>{dateRange}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showDateDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-30">
              {dateOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setDateRange(option);
                    setShowDateDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer ${
                    dateRange === option
                      ? "text-[#D31010] font-semibold dark:text-red-400 bg-red-50/50 dark:bg-red-950/20"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Revenue and Financials Section */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-slate-800 dark:text-slate-200 tracking-wide">
          Revenue and financials
        </h2>

        {/* 4 KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredKpis.map((kpi, idx) => (
            <motion.div
              key={kpi.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              whileHover={{ y: -3 }}
              className="bg-white dark:bg-[#0E1E31]/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                <div className="flex items-center gap-1.5 uppercase">
                  <span>{kpi.title}</span>
                  <div className="group relative cursor-pointer">
                    <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-900 text-white text-[11px] py-1 px-2.5 rounded shadow-lg whitespace-nowrap z-20">
                      {kpi.info}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {kpi.value}
                </span>

                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                    kpi.isPositive
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50"
                      : "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200/50 dark:border-red-800/50"
                  }`}
                >
                  {kpi.isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {kpi.change}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Charts Section (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Total Sales Bar Chart (7 Cols on desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-7 bg-white dark:bg-[#0E1E31]/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              <span>Total sales</span>
              <Info className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
              TOTAL
            </p>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#3B82F6] dark:text-[#3B82F6] tracking-tight">
                ${Number(totalSalesVal).toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                <TrendingUp className="w-3 h-3" />
                17%
              </span>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="h-64 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: isDark ? "#64748B" : "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: isDark ? "#64748B" : "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `$${val}`}
                  domain={[0, niceYMax]}
                />
                <Tooltip
                  cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl text-xs border border-slate-700">
                          <p className="font-semibold">{payload[0].payload.date}</p>
                          <p className="text-blue-400 font-bold mt-0.5">
                            Sales: ${Number(payload[0].value).toLocaleString()}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="sales"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Right Column: Estimate Breakdown Donut Chart (5 Cols on desktop) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="lg:col-span-5 bg-white dark:bg-[#0E1E31]/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
                <span>Estimate breakdown</span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <button
                type="button"
                onClick={() => router.push("/estimates")}
                className="flex items-center gap-1 text-xs font-semibold text-[#D31010] dark:text-red-400 hover:underline cursor-pointer"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Donut Chart with Center Metric */}
            <div className="relative h-56 flex items-center justify-center my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl text-xs border border-slate-700">
                            <p className="font-semibold">{data.name}</p>
                            <p className="font-bold text-emerald-400 mt-0.5">
                              {data.amount} ({data.value} estimates)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Donut Center Number Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {totalEstCount}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Total
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown Legend List */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Won</span>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900 dark:text-white">
                  ${Number(wonAmount).toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">{wonCount} estimates</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Pending</span>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900 dark:text-white">
                  ${Number(pendingAmount).toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">{pendingCount} estimates</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">Lost</span>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900 dark:text-white">
                  ${Number(lostAmount).toLocaleString()}
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">{lostCount} estimates</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
