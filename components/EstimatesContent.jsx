import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Search,
  Filter,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  ThumbsUp,
  XCircle,
  CheckCircle2,
  Archive,
  Download,
  Link2,
  Trash2,
  Send,
  RefreshCw,
  Settings,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";
import AddEstimateModal from "./AddEstimateModal";

export default function EstimatesContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (router.query.create === "true") {
      setIsAddModalOpen(true);
    }
  }, [router.query]);

  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchEstimates = async () => {
      setLoading(true);
      try {
        const res = await Api("GET", "api/estimates", null, router);
        const dataArray = res?.data || (Array.isArray(res) ? res : null);
        if (isMounted && dataArray && Array.isArray(dataArray)) {
          const mapped = dataArray.map((e) => ({
            id: e._id || e.id,
            estimateNumber: e.estimate_number || "EST-" + String(e._id || "").slice(-4),
            name: e.name || "Estimate",
            clientName: e.client_name || "Client",
            clientEmail: e.client_email || "client@example.com",
            createdDate: e.createdAt ? new Date(e.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent",
            createdBy: e.created_by_name || "System",
            amount: e.amount || 0,
            status: e.status || "PENDING",
            sourceJob: e.source_job || "No linked job",
            depositDue: e.deposit_due || "-",
          }));
          setEstimates(mapped);
        }
      } catch (err) {
        console.error("Error fetching estimates:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchEstimates();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const kpis = [
    { label: "UNSENT", icon: FileText, count: 42, worth: "$8,240.00", border: "border-l-slate-400" },
    { label: "PENDING", icon: Clock, count: 18, worth: "$14,415.80", border: "border-l-amber-500" },
    { label: "APPROVED", icon: ThumbsUp, count: 8, worth: "$5,100.50", border: "border-l-blue-500" },
    { label: "DECLINED", icon: XCircle, count: 3, worth: "$1,250.00", border: "border-l-[#D31010]" },
    { label: "WON", icon: CheckCircle2, count: 124, worth: "$145,890.00", border: "border-l-emerald-500" },
    { label: "ARCHIVED", icon: Archive, count: 89, worth: "$67,300.00", border: "border-l-slate-700" },
  ];

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredEstimates.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select estimates to delete");
      return;
    }
    setEstimates((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    toast.success(`Deleted ${selectedIds.length} estimates`);
    setSelectedIds([]);
  };

  const filteredEstimates = estimates.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.estimateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.clientName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All Statuses" ||
      item.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "APPROVED":
        return "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      case "UNSENT":
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700";
      case "WON":
        return "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800";
      case "DECLINED":
        return "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 pt-6 sm:pt-8 text-slate-800 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Estimates Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review and manage all financial estimates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => toast.success("Exporting estimates to CSV...")}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-full text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
          >
            Export
          </button>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-semibold rounded-full shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Estimate</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi) => {
          const IconComponent = kpi.icon;
          return (
            <div
              key={kpi.label}
              className={`p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl border-l-4 ${kpi.border} shadow-sm space-y-2`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-400 uppercase">
                  {kpi.label}
                </span>
                <IconComponent className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900 dark:text-white">
                  {kpi.count} <span className="text-xs font-normal text-slate-400">Worth</span>
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {kpi.worth}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter estimates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-3 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none appearance-none cursor-pointer text-slate-800 dark:text-slate-200"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="UNSENT">UNSENT</option>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="DECLINED">DECLINED</option>
                <option value="WON">WON</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="pl-3 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none appearance-none cursor-pointer text-slate-800 dark:text-slate-200"
              >
                <option value="All Time">All Time</option>
                <option value="This Month">This Month</option>
                <option value="This Year">This Year</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-red-50/30 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={
                  filteredEstimates.length > 0 &&
                  selectedIds.length === filteredEstimates.length
                }
                className="accent-[#D31010] w-4 h-4 rounded cursor-pointer"
              />
              <span>Select All</span>
            </label>

            <button
              type="button"
              onClick={() => toast.info("Change Status clicked")}
              className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Change Status</span>
            </button>

            <button
              type="button"
              onClick={() => toast.success("Reminder sent!")}
              className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Reminder</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 text-[#D31010] hover:text-[#b00d0d] font-bold cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/estimates/settings")}
              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-semibold cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Estimates settings</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="py-3.5 px-4 w-10"></th>
                <th className="py-3.5 px-4">Estimate</th>
                <th className="py-3.5 px-4">Name</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Source Job</th>
                <th className="py-3.5 px-4">Deposit Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredEstimates.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-semibold">
                    No estimates found matching search query
                  </td>
                </tr>
              ) : (
                filteredEstimates.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => router.push(`/estimates/${item.id}`)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors text-xs cursor-pointer"
                  >
                    <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => handleSelectOne(item.id)}
                        className="accent-[#D31010] w-4 h-4 rounded cursor-pointer"
                      />
                    </td>

                    <td className="py-4 px-4 font-extrabold text-[#D31010]">
                      {item.estimateNumber}
                    </td>

                    <td className="py-4 px-4 font-bold text-slate-900 dark:text-white max-w-[200px]">
                      {item.name}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {item.clientName}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {item.clientEmail}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {item.createdDate}
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          by {item.createdBy}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-extrabold text-slate-900 dark:text-white">
                      ${item.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(
                          item.status
                        )}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        <span>{item.status}</span>
                      </span>
                    </td>

                    <td className="py-4 px-4 font-semibold">
                      {item.sourceJob.startsWith("JOB") ? (
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            toast.info(`Opening ${item.sourceJob}`);
                          }}
                          className="text-[#D31010] hover:underline flex items-center gap-1 font-bold"
                        >
                          <Link2 className="w-3 h-3" />
                          <span>{item.sourceJob}</span>
                        </a>
                      ) : (
                        <span className="italic text-slate-400 font-normal">
                          {item.sourceJob}
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 font-bold">
                      {item.depositDue === "Paid" ? (
                        <span className="text-emerald-600 dark:text-emerald-400">Paid</span>
                      ) : (
                        <span className="text-slate-700 dark:text-slate-300">
                          {item.depositDue}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing 1 to {filteredEstimates.length} of 248 entries</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled
              className="p-1 text-slate-300 dark:text-slate-600 cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button type="button" className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#D31010] text-white font-bold text-xs shadow-sm">
              1
            </button>
            <button type="button" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 text-xs">
              2
            </button>
            <button type="button" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 text-xs">
              3
            </button>
            <span className="px-1 text-slate-400">...</span>
            <button type="button" className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 text-xs">
              62
            </button>

            <button
              type="button"
              className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <AddEstimateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreated={(newEst) => {
          setEstimates((prev) => [newEst, ...prev]);
        }}
      />
    </div>
  );
}
