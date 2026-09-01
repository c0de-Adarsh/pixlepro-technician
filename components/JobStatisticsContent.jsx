import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  ChevronDown,
  RefreshCw,
  Search,
  Filter,
  Check,
  TrendingUp,
  DollarSign,
  Briefcase,
  User,
  MapPin,
  Tag as TagIcon,
  Clock,
  Layers,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";

export default function JobStatisticsContent() {
  const { theme } = useTheme();
  const router = useRouter();

  const [activeSubTab, setActiveSubTab] = useState("overview");
  const [timeMode, setTimeMode] = useState("created");
  const [resolution, setResolution] = useState("day");
  const [selectedServiceArea, setSelectedServiceArea] = useState("All Service Areas");
  const [selectedTag, setSelectedTag] = useState(null);

  const [dateRangePreset, setDateRangePreset] = useState("7days");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);

  const [metrics, setMetrics] = useState({
    done: 0,
    submitted: 0,
    inProgress: 0,
    canceled: 0,
    totalSales: 0,
    totalProfit: 0,
  });
  const [chartDays, setChartDays] = useState([]);
  const [sourcesData, setSourcesData] = useState([]);
  const [techPerformanceData, setTechPerformanceData] = useState([]);
  const [areaPerformanceData, setAreaPerformanceData] = useState([]);
  const [tagsList, setTagsList] = useState([]);
  const [serviceAreasList, setServiceAreasList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [hoveredBar, setHoveredBar] = useState(null);
  const [hoveredSalesBar, setHoveredSalesBar] = useState(null);

  useEffect(() => {
    fetchStatisticsData();
  }, [dateRangePreset, selectedServiceArea, selectedTag, timeMode]);

  const fetchStatisticsData = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        range: dateRangePreset,
        service_area: selectedServiceArea,
        tag: selectedTag || "",
        time_mode: timeMode,
      });

      const res = await Api("GET", `api/reports/job-statistics?${queryParams.toString()}`, null, router);
      if (res && res.success && res.data) {
        const d = res.data;
        if (d.metrics) setMetrics(d.metrics);
        if (Array.isArray(d.chartDays)) setChartDays(d.chartDays);
        if (Array.isArray(d.sourcesData)) setSourcesData(d.sourcesData);
        if (Array.isArray(d.techPerformanceData)) setTechPerformanceData(d.techPerformanceData);
        if (Array.isArray(d.areaPerformanceData)) setAreaPerformanceData(d.areaPerformanceData);
        if (Array.isArray(d.tags)) setTagsList(d.tags);
        if (Array.isArray(d.serviceAreas)) setServiceAreasList(d.serviceAreas);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const dateRangeInfo = useMemo(() => {
    const now = new Date();
    let start = new Date();
    let end = new Date();
    let label = "Last 7 days";

    if (dateRangePreset === "7days") {
      start.setDate(now.getDate() - 6);
      label = "Last 7 days";
    } else if (dateRangePreset === "30days") {
      start.setDate(now.getDate() - 29);
      label = "Last 30 days";
    } else if (dateRangePreset === "thisMonth") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      label = "This Month";
    } else if (dateRangePreset === "thisYear") {
      start = new Date(now.getFullYear(), 0, 1);
      label = "This Year";
    }

    const fmt = (d) =>
      d.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });

    return {
      label,
      displayText: `${fmt(start)} – ${fmt(end)}`,
    };
  }, [dateRangePreset]);

  const maxJobCount = useMemo(() => {
    const maxVal = Math.max(...chartDays.map((d) => Math.max(d.jobs || 0, d.canceled || 0)), 4);
    return Math.max(Math.ceil(maxVal), 6);
  }, [chartDays]);

  const maxSalesAmount = useMemo(() => {
    const maxVal = Math.max(...chartDays.map((d) => Math.max(d.sales || 0, d.profit || 0)), 100);
    return Math.ceil(maxVal / 50) * 50 || 200;
  }, [chartDays]);

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 pt-4 sm:pt-6 pb-20 px-3 sm:px-6 md:px-8 text-slate-800 dark:text-slate-100">
      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 space-x-2">
        <span onClick={() => router.push("/")} className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
          DASHBOARD
        </span>
        <span>#</span>
        <span onClick={() => router.push("/price-book")} className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
          PRICE BOOK
        </span>
        <span>#</span>
        <span onClick={() => router.push("/reports")} className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
          REPORTS
        </span>
        <span>#</span>
        <span className="text-slate-700 dark:text-slate-300 font-extrabold">JOB STATISTICS</span>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAreaDropdownOpen(!isAreaDropdownOpen)}
                className="px-4 py-2 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
              >
                <span>{selectedServiceArea}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <AnimatePresence>
                {isAreaDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute left-0 top-full mt-1.5 w-56 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 py-1.5 overflow-hidden text-xs"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedServiceArea("All Service Areas");
                        setIsAreaDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 font-bold transition-colors cursor-pointer ${
                        selectedServiceArea === "All Service Areas"
                          ? "text-[#D31010] bg-red-50/50 dark:bg-red-950/20"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      All Service Areas
                    </button>
                    {serviceAreasList.map((area) => (
                      <button
                        key={area._id || area.name}
                        type="button"
                        onClick={() => {
                          setSelectedServiceArea(area.name);
                          setIsAreaDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 font-bold transition-colors cursor-pointer ${
                          selectedServiceArea === area.name
                            ? "text-[#D31010] bg-red-50/50 dark:bg-red-950/20"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        {area.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={fetchStatisticsData}
              disabled={loading}
              className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#D31010]" : ""}`} />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <span>By Time:</span>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
                {["created", "scheduled", "closed"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTimeMode(mode)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                      timeMode === mode
                        ? "bg-white dark:bg-[#0E1E31] text-slate-900 dark:text-white shadow-xs font-extrabold"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="text-right flex flex-col items-end px-3.5 py-1.5 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs hover:border-slate-300 transition-all cursor-pointer"
              >
                <span className="text-[10px] font-medium text-slate-400">
                  {dateRangeInfo.label}
                </span>
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-white">
                  <span>{dateRangeInfo.displayText}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </button>

              <AnimatePresence>
                {isDatePickerOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 py-1.5 overflow-hidden text-xs"
                  >
                    {[
                      { id: "7days", label: "Last 7 days" },
                      { id: "30days", label: "Last 30 days" },
                      { id: "thisMonth", label: "This Month" },
                      { id: "thisYear", label: "This Year" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setDateRangePreset(p.id);
                          setIsDatePickerOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 font-bold transition-colors cursor-pointer ${
                          dateRangePreset === p.id
                            ? "text-[#D31010] bg-red-50/50 dark:bg-red-950/20"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {tagsList.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Filter by Tag:
            </span>
            {tagsList.map((tag) => {
              const isSelected = selectedTag === tag.name;
              return (
                <button
                  key={tag.name}
                  type="button"
                  onClick={() => setSelectedTag(isSelected ? null : tag.name)}
                  style={{
                    backgroundColor: tag.color || "#D946EF",
                  }}
                  className={`px-3 py-1 text-white text-[11px] font-bold uppercase rounded-md shadow-xs transition-all cursor-pointer hover:opacity-90 ${
                    isSelected
                      ? "ring-2 ring-offset-2 ring-[#D31010] scale-105"
                      : "opacity-95"
                  }`}
                >
                  {tag.name}
                </button>
              );
            })}
            {selectedTag && (
              <button
                type="button"
                onClick={() => setSelectedTag(null)}
                className="text-xs font-bold text-[#D31010] hover:underline px-2 cursor-pointer"
              >
                Clear Tag Filter ✕
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-8 border-b border-slate-200 dark:border-slate-800 text-sm font-extrabold overflow-x-auto scrollbar-none">
        {[
          { id: "overview", label: "Jobs overview" },
          { id: "sources", label: "Sources" },
          { id: "tech", label: "Tech Performance" },
          { id: "area", label: "Area Performance" },
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`pb-3.5 whitespace-nowrap transition-colors relative cursor-pointer ${
                isActive
                  ? "text-slate-900 dark:text-white"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold"
              }`}
            >
              <span>{tab.label}</span>
              {isActive && (
                <motion.div
                  layoutId="subTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-white"
                />
              )}
            </button>
          );
        })}
      </div>

      {activeSubTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          <div className="lg:col-span-9 space-y-8">
            <div className="flex items-center justify-end">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
                {["day", "week", "month"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setResolution(r)}
                    className={`px-4 py-1 text-xs font-bold rounded-lg capitalize transition-all cursor-pointer ${
                      resolution === r
                        ? "bg-white dark:bg-[#0E1E31] text-slate-900 dark:text-white shadow-xs font-extrabold"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-center gap-6 text-xs font-bold text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-3 bg-[#BAE6FD] dark:bg-[#38BDF8] border border-[#7DD3FC] rounded-xs" />
                  <span>Jobs</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-3 bg-[#FECDD3] dark:bg-[#F43F5E] border border-[#FDA4AF] rounded-xs" />
                  <span>Canceled</span>
                </div>
              </div>

              <div className="w-full h-64 sm:h-72 relative flex">
                <div className="w-10 flex flex-col justify-between items-end pr-2.5 text-[11px] font-bold text-slate-400 select-none pb-7">
                  {[6, 5, 4, 3, 2, 1, 0].map((step) => {
                    const val = Math.round((maxJobCount / 6) * step);
                    return <span key={step}>{val}</span>;
                  })}
                </div>

                <div className="flex-1 flex flex-col justify-between relative h-full">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7">
                    {[6, 5, 4, 3, 2, 1, 0].map((step) => (
                      <div
                        key={step}
                        className="w-full border-b border-slate-100 dark:border-slate-800/80"
                      />
                    ))}
                  </div>

                  <div className="flex-1 flex items-end justify-around relative z-10 pb-7 px-1">
                    {chartDays.map((day, idx) => {
                      const jobHeightPercent = (day.jobs / (maxJobCount || 1)) * 100;
                      const cancelHeightPercent = (day.canceled / (maxJobCount || 1)) * 100;
                      const isHovered = hoveredBar === idx;

                      return (
                        <div
                          key={day.date}
                          onMouseEnter={() => setHoveredBar(idx)}
                          onMouseLeave={() => setHoveredBar(null)}
                          className="flex items-end justify-center gap-1 flex-1 max-w-[60px] h-full relative cursor-pointer group"
                        >
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{
                              height: `${Math.min(Math.max(jobHeightPercent, day.jobs > 0 ? 10 : 0), 100)}%`,
                            }}
                            transition={{ duration: 0.4, delay: idx * 0.03 }}
                            className="w-full max-w-[24px] bg-[#BAE6FD] dark:bg-[#38BDF8]/40 border border-[#7DD3FC] dark:border-[#38BDF8] rounded-t-sm transition-all group-hover:brightness-105"
                          />

                          {day.canceled > 0 && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{
                                height: `${Math.min(Math.max(cancelHeightPercent, 10), 100)}%`,
                              }}
                              transition={{ duration: 0.4, delay: idx * 0.03 }}
                              className="w-full max-w-[24px] bg-[#FECDD3] dark:bg-[#F43F5E]/40 border border-[#FDA4AF] dark:border-[#F43F5E] rounded-t-sm transition-all group-hover:brightness-105"
                            />
                          )}

                          {isHovered && (
                            <div className="absolute -top-12 z-30 bg-slate-900 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap pointer-events-none">
                              <div>{day.label}</div>
                              <div className="text-sky-300">Jobs: {day.jobs}</div>
                              {day.canceled > 0 && (
                                <div className="text-pink-300">Canceled: {day.canceled}</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="h-7 flex items-center justify-around text-[10px] font-bold text-slate-400 select-none border-t border-slate-200 dark:border-slate-800 pt-1.5">
                    {chartDays.map((day, idx) => {
                      const showLabel =
                        chartDays.length <= 10 ||
                        idx % Math.ceil(chartDays.length / 8) === 0 ||
                        idx === chartDays.length - 1;

                      return (
                        <div key={day.date} className="flex-1 text-center truncate">
                          {showLabel ? day.shortLabel || day.label.substring(0, 5) : ""}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-center gap-6 text-xs font-bold text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-3 bg-[#BAE6FD] dark:bg-[#38BDF8] border border-[#7DD3FC] rounded-xs" />
                  <span>Sales</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-3 bg-[#FECDD3] dark:bg-[#F43F5E] border border-[#FDA4AF] rounded-xs" />
                  <span>Profit</span>
                </div>
              </div>

              <div className="w-full h-64 sm:h-72 relative flex">
                <div className="w-12 flex flex-col justify-between items-end pr-2.5 text-[11px] font-bold text-slate-400 select-none pb-7">
                  {[5, 4, 3, 2, 1, 0].map((step) => {
                    const val = Math.round((maxSalesAmount / 5) * step);
                    return <span key={step}>${val}</span>;
                  })}
                </div>

                <div className="flex-1 flex flex-col justify-between relative h-full">
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7">
                    {[5, 4, 3, 2, 1, 0].map((step) => (
                      <div
                        key={step}
                        className="w-full border-b border-slate-100 dark:border-slate-800/80"
                      />
                    ))}
                  </div>

                  <div className="flex-1 flex items-end justify-around relative z-10 pb-7 px-1">
                    {chartDays.map((day, idx) => {
                      const salesPercent = (day.sales / (maxSalesAmount || 1)) * 100;
                      const profitPercent = (day.profit / (maxSalesAmount || 1)) * 100;
                      const isHovered = hoveredSalesBar === idx;

                      return (
                        <div
                          key={day.date}
                          onMouseEnter={() => setHoveredSalesBar(idx)}
                          onMouseLeave={() => setHoveredSalesBar(null)}
                          className="flex items-end justify-center gap-1 flex-1 max-w-[60px] h-full relative cursor-pointer group"
                        >
                          {day.sales > 0 && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{
                                height: `${Math.min(Math.max(salesPercent, 10), 100)}%`,
                              }}
                              transition={{ duration: 0.4, delay: idx * 0.03 }}
                              className="w-full max-w-[24px] bg-[#BAE6FD] dark:bg-[#38BDF8]/40 border border-[#7DD3FC] dark:border-[#38BDF8] rounded-t-sm transition-all group-hover:brightness-105"
                            />
                          )}

                          {day.profit > 0 && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{
                                height: `${Math.min(Math.max(profitPercent, 10), 100)}%`,
                              }}
                              transition={{ duration: 0.4, delay: idx * 0.03 }}
                              className="w-full max-w-[24px] bg-[#FECDD3] dark:bg-[#F43F5E]/40 border border-[#FDA4AF] dark:border-[#F43F5E] rounded-t-sm transition-all group-hover:brightness-105"
                            />
                          )}

                          {isHovered && (
                            <div className="absolute -top-12 z-30 bg-slate-900 text-white text-[10px] font-extrabold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap pointer-events-none">
                              <div>{day.label}</div>
                              <div className="text-sky-300">Sales: ${day.sales.toFixed(2)}</div>
                              <div className="text-pink-300">Profit: ${day.profit.toFixed(2)}</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="h-7 flex items-center justify-around text-[10px] font-bold text-slate-400 select-none border-t border-slate-200 dark:border-slate-800 pt-1.5">
                    {chartDays.map((day, idx) => {
                      const showLabel =
                        chartDays.length <= 10 ||
                        idx % Math.ceil(chartDays.length / 8) === 0 ||
                        idx === chartDays.length - 1;

                      return (
                        <div key={day.date} className="flex-1 text-center truncate">
                          {showLabel ? day.shortLabel || day.label.substring(0, 5) : ""}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-5">
            <div className="p-5 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xs flex items-center justify-between gap-3">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {metrics.done}
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-300 text-right leading-tight">
                Jobs<br />Done
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xs flex items-center justify-between gap-3">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {metrics.submitted}
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-300 text-right leading-tight">
                Jobs<br />Submitted
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xs flex items-center justify-between gap-3">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {metrics.inProgress}
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-300 text-right leading-tight">
                Jobs<br />In Progress
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xs flex items-center justify-between gap-3">
              <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {metrics.canceled}
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-300 text-right leading-tight">
                Jobs<br />Canceled
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xs flex items-center justify-between gap-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                ${Math.round(metrics.totalSales)}
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-300 text-right leading-tight">
                Total<br />Sales
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xs flex items-center justify-between gap-3">
              <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                ${Math.round(metrics.totalProfit)}
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-300 text-right leading-tight">
                Total<br />Profit
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "sources" && (
        <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 font-extrabold text-base">
            Lead & Job Sources Performance
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-[11px] font-bold uppercase text-slate-500">
                  <th className="py-3 px-4">Source Name</th>
                  <th className="py-3 px-4">Total Jobs</th>
                  <th className="py-3 px-4">Completed Jobs</th>
                  <th className="py-3 px-4">Conversion %</th>
                  <th className="py-3 px-4 text-right">Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {sourcesData.map((src) => {
                  const conv = src.total > 0 ? Math.round((src.completed / src.total) * 100) : 0;
                  return (
                    <tr key={src.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {src.name}
                      </td>
                      <td className="py-3.5 px-4">{src.total}</td>
                      <td className="py-3.5 px-4 text-emerald-600 font-bold">{src.completed}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${conv}%` }}
                              className="bg-[#D31010] h-full rounded-full"
                            />
                          </div>
                          <span>{conv}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white">
                        ${src.revenue.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === "tech" && (
        <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 font-extrabold text-base">
            Technician Job Performance & Completion
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-[11px] font-bold uppercase text-slate-500">
                  <th className="py-3 px-4">Technician</th>
                  <th className="py-3 px-4">Assigned Jobs</th>
                  <th className="py-3 px-4">Completed</th>
                  <th className="py-3 px-4">Canceled</th>
                  <th className="py-3 px-4 text-right">Revenue Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {techPerformanceData.map((tech) => (
                  <tr key={tech.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#D31010] text-white flex items-center justify-center text-[10px] font-black">
                        {(tech.name[0] || "T").toUpperCase()}
                      </div>
                      <span>{tech.name}</span>
                    </td>
                    <td className="py-3.5 px-4">{tech.assigned}</td>
                    <td className="py-3.5 px-4 text-emerald-600 font-bold">{tech.done}</td>
                    <td className="py-3.5 px-4 text-rose-500 font-bold">{tech.canceled}</td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white">
                      ${tech.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === "area" && (
        <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 font-extrabold text-base">
            Service Area Breakdown
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-[11px] font-bold uppercase text-slate-500">
                  <th className="py-3 px-4">Service Area</th>
                  <th className="py-3 px-4">Total Jobs</th>
                  <th className="py-3 px-4">Completed</th>
                  <th className="py-3 px-4 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {areaPerformanceData.map((area) => (
                  <tr key={area.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <div
                        style={{ backgroundColor: area.color }}
                        className="w-3 h-3 rounded-full"
                      />
                      <span>{area.name}</span>
                    </td>
                    <td className="py-3.5 px-4">{area.total}</td>
                    <td className="py-3.5 px-4 text-emerald-600 font-bold">{area.done}</td>
                    <td className="py-3.5 px-4 text-right font-black text-slate-900 dark:text-white">
                      ${area.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
