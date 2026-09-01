import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  RefreshCw,
  Search,
  Download,
  SlidersHorizontal,
  X,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  Briefcase,
  User,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";

export default function SalesReportContent() {
  const router = useRouter();

  const [dateRangePreset, setDateRangePreset] = useState("lastMonth");
  const [timeMode, setTimeMode] = useState("job_date");
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isTimeModeOpen, setIsTimeModeOpen] = useState(false);

  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const filterDropdownRef = useRef(null);

  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
  const [selectedServiceArea, setSelectedServiceArea] = useState("");

  const [searchVal, setSearchVal] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [summary, setSummary] = useState({
    totalSales: 0,
    totalItemCost: 0,
    totalLaborCost: 0,
    totalCardExp: 0,
    totalTechExp: 0,
    totalDue: 0,
    totalTax: 0,
    totalProfit: 0,
    overallMargin: "0.00%",
  });
  const [chartDays, setChartDays] = useState([]);
  const [rows, setRows] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    statuses: [],
    teams: [],
    jobTypes: [],
    paymentStatuses: [],
    sources: [],
    serviceAreas: [],
  });
  const [loading, setLoading] = useState(true);

  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target)) {
        setIsFilterDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchSalesData();
  }, [
    dateRangePreset,
    timeMode,
    selectedStatus,
    selectedTeam,
    selectedJobType,
    selectedPaymentStatus,
    selectedSource,
    selectedServiceArea,
  ]);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        range: dateRangePreset,
        time_mode: timeMode,
        status: selectedStatus,
        team: selectedTeam,
        job_type: selectedJobType,
        payment_status: selectedPaymentStatus,
        source: selectedSource,
        service_area: selectedServiceArea,
      });

      const res = await Api("GET", `api/reports/sales?${params.toString()}`, null, router);
      if (res && res.success && res.data) {
        const d = res.data;
        if (d.summary) setSummary(d.summary);
        if (Array.isArray(d.chartDays)) setChartDays(d.chartDays);
        if (Array.isArray(d.rows)) setRows(d.rows);
        if (d.filterOptions) setFilterOptions(d.filterOptions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const dateRangeDisplay = useMemo(() => {
    const now = new Date();
    let start = new Date();
    let end = new Date();
    let label = "Last month";

    if (dateRangePreset === "lastMonth") {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      label = "Last month";
    } else if (dateRangePreset === "7days") {
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
        day: "numeric",
        year: "numeric",
      });

    return {
      label,
      displayText: `${fmt(start)} – ${fmt(end)}`,
    };
  }, [dateRangePreset]);

  const activeFiltersCount = [
    selectedStatus,
    selectedTeam,
    selectedJobType,
    selectedPaymentStatus,
    selectedSource,
    selectedServiceArea,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setSelectedStatus("");
    setSelectedTeam("");
    setSelectedJobType("");
    setSelectedPaymentStatus("");
    setSelectedSource("");
    setSelectedServiceArea("");
  };

  const filteredRows = useMemo(() => {
    if (!searchVal.trim()) return rows;
    const q = searchVal.toLowerCase().trim();
    return rows.filter(
      (r) =>
        r.clientName?.toLowerCase().includes(q) ||
        r.email?.toLowerCase().includes(q) ||
        r.jobId?.toLowerCase().includes(q) ||
        r.jobType?.toLowerCase().includes(q) ||
        r.status?.toLowerCase().includes(q) ||
        r.source?.toLowerCase().includes(q)
    );
  }, [rows, searchVal]);

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, currentPage, pageSize]);

  const maxChartVal = useMemo(() => {
    const max = Math.max(
      ...chartDays.map((d) => Math.max(d.sales || 0, d.profit || 0)),
      100
    );
    if (max > 10000) return Math.ceil(max / 2000) * 2000;
    if (max > 5000) return Math.ceil(max / 1000) * 1000;
    if (max > 1000) return Math.ceil(max / 200) * 200;
    return Math.ceil(max / 50) * 50 || 200;
  }, [chartDays]);

  const chartSVGPoints = useMemo(() => {
    if (chartDays.length === 0) return { salesPath: "", profitPath: "", salesFill: "", profitFill: "", dots: [] };
    const width = 1000;
    const height = 240;
    const paddingX = 40;
    const paddingY = 20;

    const availableWidth = width - paddingX * 2;
    const availableHeight = height - paddingY * 2;

    const stepX = availableWidth / (chartDays.length - 1 || 1);

    const dots = chartDays.map((d, i) => {
      const x = paddingX + i * stepX;
      const salesY = height - paddingY - (d.sales / (maxChartVal || 1)) * availableHeight;
      const profitY = height - paddingY - (d.profit / (maxChartVal || 1)) * availableHeight;
      return { x, salesY, profitY, day: d, index: i };
    });

    const createSplinePath = (pts, keyY) => {
      if (pts.length === 0) return "";
      let path = `M ${pts[0].x} ${pts[0][keyY]}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i];
        const p1 = pts[i + 1];
        const cx1 = p0.x + (p1.x - p0.x) / 2;
        const cy1 = p0[keyY];
        const cx2 = p0.x + (p1.x - p0.x) / 2;
        const cy2 = p1[keyY];
        path += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${p1.x} ${p1[keyY]}`;
      }
      return path;
    };

    const salesLine = createSplinePath(dots, "salesY");
    const profitLine = createSplinePath(dots, "profitY");

    const bottomY = height - paddingY;
    const salesFill = `${salesLine} L ${dots[dots.length - 1].x} ${bottomY} L ${dots[0].x} ${bottomY} Z`;
    const profitFill = `${profitLine} L ${dots[dots.length - 1].x} ${bottomY} L ${dots[0].x} ${bottomY} Z`;

    return { salesPath: salesLine, profitPath: profitLine, salesFill, profitFill, dots };
  }, [chartDays, maxChartVal]);

  const handleExportCSV = () => {
    if (filteredRows.length === 0) {
      toast.error("No data to export");
      return;
    }
    const headers = [
      "Job ID",
      "Client",
      "Email",
      "Scheduled",
      "Status",
      "Job Type",
      "Total",
      "Item Cost",
      "Labor Cost",
      "Card Expense",
      "Tech Expense",
      "Due",
      "Tax",
      "Profit",
      "Margin",
      "Source",
    ];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...filteredRows.map((r) =>
          [
            `"${r.jobId}"`,
            `"${r.clientName}"`,
            `"${r.email}"`,
            `"${r.scheduled}"`,
            `"${r.status}"`,
            `"${r.jobType}"`,
            `"${r.total.toFixed(2)}"`,
            `"${r.itemCost.toFixed(2)}"`,
            `"${r.laborCost.toFixed(2)}"`,
            `"${r.cardExp.toFixed(2)}"`,
            `"${r.techExp.toFixed(2)}"`,
            `"${r.due.toFixed(2)}"`,
            `"${r.tax.toFixed(2)}"`,
            `"${r.profit.toFixed(2)}"`,
            `"${r.margin}"`,
            `"${r.source}"`,
          ].join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Sales_Report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Sales report exported to CSV");
  };

  return (
    <div className="w-full max-w-[1700px] mx-auto space-y-6 pt-4 sm:pt-6 pb-20 px-3 sm:px-6 md:px-8 text-slate-800 dark:text-slate-100">
      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 space-x-2">
        <span onClick={() => router.push("/")} className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
          ACCOUNT
        </span>
        <span>#</span>
        <span onClick={() => router.push("/calls")} className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
          CALLS
        </span>
        <span>#</span>
        <span onClick={() => router.push("/messages")} className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
          TEXT MESSAGES
        </span>
        <span>#</span>
        <span onClick={() => router.push("/invoices")} className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
          INVOICE (895)
        </span>
        <span>#</span>
        <span onClick={() => router.push("/reports")} className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
          REPORTS
        </span>
        <span>#</span>
        <span className="text-slate-700 dark:text-slate-300 font-extrabold">SALES REPORT</span>
      </div>

      <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-center gap-8 text-xs font-extrabold text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-[#94A3B8]/40 border border-[#475569] rounded-xs" />
            <span>Profit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-3 bg-[#FDE68A]/60 border border-[#F59E0B] rounded-xs" />
            <span>Sales</span>
          </div>
        </div>

        <div className="w-full h-64 sm:h-80 relative flex">
          <div className="w-14 flex flex-col justify-between items-end pr-3 text-[11px] font-bold text-slate-400 select-none pb-8">
            {[7, 6, 5, 4, 3, 2, 1, 0].map((step) => {
              const val = Math.round((maxChartVal / 7) * step);
              return <span key={step}>{val}</span>;
            })}
          </div>

          <div className="flex-1 flex flex-col justify-between relative h-full">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
              {[7, 6, 5, 4, 3, 2, 1, 0].map((step) => (
                <div key={step} className="w-full border-b border-slate-100 dark:border-slate-800/80" />
              ))}
            </div>

            <div className="flex-1 relative pb-8">
              <svg
                viewBox="0 0 1000 240"
                preserveAspectRatio="none"
                className="w-full h-full overflow-visible"
              >
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#64748B" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#64748B" stopOpacity="0.05" />
                  </linearGradient>
                </defs>

                {chartSVGPoints.salesFill && (
                  <path d={chartSVGPoints.salesFill} fill="url(#salesGrad)" />
                )}

                {chartSVGPoints.profitFill && (
                  <path d={chartSVGPoints.profitFill} fill="url(#profitGrad)" />
                )}

                {chartSVGPoints.profitPath && (
                  <path
                    d={chartSVGPoints.profitPath}
                    fill="none"
                    stroke="#475569"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                )}

                {chartSVGPoints.salesPath && (
                  <path
                    d={chartSVGPoints.salesPath}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                )}

                {chartSVGPoints.dots.map((pt, i) => (
                  <g key={i} className="cursor-pointer">
                    <circle
                      cx={pt.x}
                      cy={pt.salesY}
                      r={hoveredIndex === i ? "5.5" : "3.5"}
                      fill="#FFFFFF"
                      stroke="#F59E0B"
                      strokeWidth="2"
                      className="transition-all"
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.profitY}
                      r={hoveredIndex === i ? "5.5" : "3.5"}
                      fill="#FFFFFF"
                      stroke="#475569"
                      strokeWidth="2"
                      className="transition-all"
                    />
                    <rect
                      x={pt.x - 15}
                      y="0"
                      width="30"
                      height="240"
                      fill="transparent"
                      onMouseEnter={() => setHoveredIndex(i)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />
                  </g>
                ))}
              </svg>

              {hoveredIndex !== null && chartDays[hoveredIndex] && (
                <div
                  style={{
                    left: `${(hoveredIndex / (chartDays.length - 1 || 1)) * 90 + 5}%`,
                    top: "15%",
                  }}
                  className="absolute z-30 bg-slate-900 text-white text-[11px] font-extrabold px-3.5 py-2 rounded-xl shadow-2xl pointer-events-none transform -translate-x-1/2 whitespace-nowrap border border-slate-700"
                >
                  <div className="text-slate-300 font-medium pb-1 border-b border-slate-800">
                    {chartDays[hoveredIndex].label}
                  </div>
                  <div className="text-amber-400 font-bold pt-1">
                    Sales: ${chartDays[hoveredIndex].sales.toFixed(2)}
                  </div>
                  <div className="text-slate-300 font-bold">
                    Profit: ${chartDays[hoveredIndex].profit.toFixed(2)}
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 flex items-center justify-between text-[10px] font-bold text-slate-400 select-none border-t border-slate-200 dark:border-slate-800 pt-2 px-2 overflow-hidden">
              {chartDays.map((day, idx) => {
                const show =
                  chartDays.length <= 15 ||
                  idx % Math.ceil(chartDays.length / 15) === 0 ||
                  idx === chartDays.length - 1;
                return (
                  <div key={day.date} className="text-center truncate flex-1">
                    {show ? day.label : ""}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-3xl" ref={filterDropdownRef}>
          <div
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className="w-full px-4 py-2.5 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between shadow-xs cursor-pointer hover:border-slate-300 transition-colors"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400">Filter results</span>
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 bg-[#D31010] text-white text-[10px] font-black rounded-full">
                  {activeFiltersCount} active
                </span>
              )}
              {selectedStatus && (
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px]">
                  Status: {selectedStatus}
                </span>
              )}
              {selectedTeam && (
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px]">
                  Tech: {selectedTeam}
                </span>
              )}
              {selectedJobType && (
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px]">
                  Type: {selectedJobType}
                </span>
              )}
              {selectedServiceArea && (
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px]">
                  Area: {selectedServiceArea}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearAllFilters();
                  }}
                  className="text-slate-400 hover:text-red-500 text-xs font-bold"
                >
                  Clear
                </button>
              )}
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>

          <AnimatePresence>
            {isFilterDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.99 }}
                className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 p-5 overflow-hidden text-xs"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-5 max-h-96 overflow-y-auto pr-1">
                  <div className="space-y-2">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      STATUS
                    </div>
                    <div className="space-y-1">
                      {filterOptions.statuses.map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setSelectedStatus(selectedStatus === st ? "" : st)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg font-bold text-xs truncate transition-colors cursor-pointer ${
                            selectedStatus === st
                              ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      TEAM
                    </div>
                    <div className="space-y-1">
                      {filterOptions.teams.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSelectedTeam(selectedTeam === t ? "" : t)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg font-bold text-xs truncate transition-colors cursor-pointer ${
                            selectedTeam === t
                              ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      JOB TYPE
                    </div>
                    <div className="space-y-1">
                      {filterOptions.jobTypes.map((j) => (
                        <button
                          key={j}
                          type="button"
                          onClick={() => setSelectedJobType(selectedJobType === j ? "" : j)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg font-bold text-xs truncate transition-colors cursor-pointer ${
                            selectedJobType === j
                              ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          {j}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      PAYMENT STATUS
                    </div>
                    <div className="space-y-1">
                      {filterOptions.paymentStatuses.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() =>
                            setSelectedPaymentStatus(selectedPaymentStatus === p ? "" : p)
                          }
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg font-bold text-xs truncate transition-colors cursor-pointer ${
                            selectedPaymentStatus === p
                              ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      SOURCE
                    </div>
                    <div className="space-y-1">
                      {filterOptions.sources.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSelectedSource(selectedSource === s ? "" : s)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg font-bold text-xs truncate transition-colors cursor-pointer ${
                            selectedSource === s
                              ? "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      SERVICE AREAS
                    </div>
                    <div className="space-y-1">
                      {filterOptions.serviceAreas.map((a) => (
                        <button
                          key={a.name}
                          type="button"
                          onClick={() =>
                            setSelectedServiceArea(selectedServiceArea === a.name ? "" : a.name)
                          }
                          style={{
                            backgroundColor: selectedServiceArea === a.name ? a.color : undefined,
                            color: selectedServiceArea === a.name ? "#FFFFFF" : undefined,
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md font-extrabold text-xs truncate transition-all cursor-pointer ${
                            selectedServiceArea === a.name
                              ? "shadow-sm"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          }`}
                        >
                          <span
                            className="inline-block w-2 h-2 rounded-full mr-1.5"
                            style={{ backgroundColor: a.color || "#10B981" }}
                          />
                          {a.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchSalesData}
            disabled={loading}
            className="p-2.5 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shadow-xs cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#D31010]" : ""}`} />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="text-right flex flex-col items-end px-3.5 py-1.5 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs hover:border-slate-300 transition-all cursor-pointer"
            >
              <span className="text-[10px] font-medium text-slate-400">
                {dateRangeDisplay.label}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 dark:text-white">
                <span>{dateRangeDisplay.displayText}</span>
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
                    { id: "lastMonth", label: "Last month" },
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

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsTimeModeOpen(!isTimeModeOpen)}
              className="px-3.5 py-2.5 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
            >
              <span>By: {timeMode === "job_date" ? "Job date" : timeMode === "created" ? "Created date" : "Closed date"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <AnimatePresence>
              {isTimeModeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 top-full mt-1.5 w-44 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 py-1.5 overflow-hidden text-xs"
                >
                  {[
                    { id: "job_date", label: "By: Job date" },
                    { id: "created", label: "By: Created date" },
                    { id: "closed", label: "By: Closed date" },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setTimeMode(m.id);
                        setIsTimeModeOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 font-bold transition-colors cursor-pointer ${
                        timeMode === m.id
                          ? "text-[#D31010] bg-red-50/50 dark:bg-red-950/20"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 text-xs bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D31010] text-slate-800 dark:text-slate-200 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 appearance-none pr-8 cursor-pointer shadow-xs"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={() => toast.info("Fields customizer")}
            className="px-4 py-2 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs cursor-pointer transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span>Fields</span>
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-semibold whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                <th className="py-3.5 px-4 font-black">Job ID</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Scheduled</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Job type</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Item cost</th>
                <th className="py-3.5 px-4">Labor cost</th>
                <th className="py-3.5 px-4">Card Exp...</th>
                <th className="py-3.5 px-4">Tech exp...</th>
                <th className="py-3.5 px-4">Due</th>
                <th className="py-3.5 px-4">Tax</th>
                <th className="py-3.5 px-4">Profit</th>
                <th className="py-3.5 px-4">Source</th>
              </tr>

              <tr className="border-b-2 border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/40 text-xs font-black text-slate-900 dark:text-white">
                <td className="py-3 px-4 font-black">Total:</td>
                <td className="py-3 px-4" />
                <td className="py-3 px-4" />
                <td className="py-3 px-4" />
                <td className="py-3 px-4" />
                <td className="py-3 px-4 font-black text-slate-900 dark:text-white">
                  ${summary.totalSales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">
                  ${summary.totalItemCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">
                  ${summary.totalLaborCost.toFixed(2)}
                </td>
                <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">
                  ${summary.totalCardExp.toFixed(2)}
                </td>
                <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">
                  ${summary.totalTechExp.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">
                  ${summary.totalDue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300">
                  ${summary.totalTax.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4">
                  <div className="font-black text-slate-900 dark:text-white">
                    ${summary.totalProfit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400">
                    {summary.overallMargin} marg
                  </div>
                </td>
                <td className="py-3 px-4" />
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-8 text-center text-slate-400 font-bold">
                    No sales records found for the selected period and filters.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      <button
                        type="button"
                        onClick={() => router.push(`/jobs/${row._id}`)}
                        className="hover:text-[#D31010] hover:underline cursor-pointer"
                      >
                        {row.jobId}
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {row.clientName}
                      </div>
                      {row.email && (
                        <div className="text-[11px] font-medium text-slate-400">
                          {row.email}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {row.scheduled}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {row.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      {row.jobType}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      ${row.total.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      ${row.itemCost.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      ${row.laborCost.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      ${row.cardExp.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      ${row.techExp.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      ${row.due.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      ${row.tax.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        ${row.profit.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {row.margin} marg
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {row.source}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-500">
            <div>
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredRows.length)} of {filteredRows.length} entries
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-800 dark:text-slate-200">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
