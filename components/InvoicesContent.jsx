import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Trash2,
  Send,
  RefreshCw,
  FileText,
  Plus,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";
import AddInvoiceModal from "./AddInvoiceModal";

export default function InvoicesContent() {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isAddInvoiceModalOpen, setIsAddInvoiceModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search: searchTerm,
      });
      if (statusFilter !== "All Statuses") {
        params.append("status", statusFilter);
      }

      const res = await Api("GET", `api/invoices?${params.toString()}`, null, router);
      if (res && res.success) {
        setInvoices(res.data || []);
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, limit, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchInvoices();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (router.query.create === "true") {
      setIsAddInvoiceModalOpen(true);
    }
  }, [router.query]);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(invoices.map((i) => i._id || i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error("Please select invoices to delete");
      return;
    }
    try {
      await Promise.all(
        selectedIds.map((id) => Api("DELETE", `api/invoices/${id}`, null, router))
      );
      toast.success(`Deleted ${selectedIds.length} invoice(s)`);
      setSelectedIds([]);
      fetchInvoices();
    } catch (err) {
      toast.error("Error deleting selected invoices");
    }
  };

  const handleExportCSV = () => {
    if (invoices.length === 0) {
      toast.info("No invoices to export");
      return;
    }
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Invoice No,Client Name,Email,Subtotal,Tax,Amount,Due,Status,Job ID,Created Date"]
        .concat(
          invoices.map(
            (inv) =>
              `"${inv.invoice_number || ""}","${inv.client_name || ""}","${inv.client_email || ""}",${inv.subtotal || 0},${inv.tax_amount || 0},${inv.total_amount || 0},${inv.amount_due || 0},"${inv.status || ""}","${inv.job_id || ""}","${inv.created_date ? new Date(inv.created_date).toLocaleDateString() : ""}"`
          )
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `invoices_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Invoices CSV exported successfully!");
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Paid":
        return "text-emerald-600 dark:text-emerald-400 font-bold";
      case "Due":
        return "text-amber-600 dark:text-amber-400 font-bold";
      case "Overdue":
        return "text-[#D31010] font-bold";
      case "Draft":
        return "text-slate-500 font-medium";
      default:
        return "text-slate-600 dark:text-slate-300 font-medium";
    }
  };

  const totalDueAmount = invoices
    .filter((i) => i.status !== "Paid")
    .reduce((acc, i) => acc + Number(i.amount_due || i.total_amount || 0), 0);

  const totalOverdueAmount = invoices
    .filter((i) => i.status === "Overdue")
    .reduce((acc, i) => acc + Number(i.amount_due || i.total_amount || 0), 0);

  const unsentCount = invoices.filter((i) => i.sent_status === "No" || !i.sent_status).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 pt-6 sm:pt-8 text-slate-800 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Invoices Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review and manage all client financial invoices and payments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsAddInvoiceModalOpen(true)}
            className="px-5 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create invoice</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-5 py-2.5 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl border-l-4 border-l-[#D31010] shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Due from {invoices.filter((i) => i.status !== "Paid").length} invoices
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            ${totalDueAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl border-l-4 border-l-slate-400 shadow-xs space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Overdue from {invoices.filter((i) => i.status === "Overdue").length} invoices
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            ${totalOverdueAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Unsent
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {unsentCount} invoices
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Recorded Invoices
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {total} invoices
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by invoice no, client, job ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium outline-hidden focus:border-[#D31010]"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="pl-3 pr-8 py-2 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold outline-hidden appearance-none cursor-pointer text-slate-800 dark:text-slate-200"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Due">Due</option>
                <option value="Overdue">Overdue</option>
                <option value="Draft">Draft</option>
                <option value="Waiting for QuickBooks">Waiting for QuickBooks</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="pl-3 pr-8 py-2 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold outline-hidden appearance-none cursor-pointer text-slate-800 dark:text-slate-200"
              >
                <option value="All Time">All Time</option>
                <option value="This Month">This Month</option>
                <option value="This Year">This Year</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-50/50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={invoices.length > 0 && selectedIds.length === invoices.length}
                className="accent-[#D31010] w-4 h-4 rounded cursor-pointer"
              />
              <span>Select All</span>
            </label>

            <button
              type="button"
              onClick={() => {
                fetchInvoices();
                toast.success("Invoices refreshed");
              }}
              className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 text-[#D31010] hover:text-[#b00d0d] font-bold cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete ({selectedIds.length})</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="py-3.5 px-4 w-10"></th>
                <th className="py-3.5 px-4">Invoice NO.</th>
                <th className="py-3.5 px-4">Invoice Name</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Created</th>
                <th className="py-3.5 px-4">Subtotal</th>
                <th className="py-3.5 px-4">Tax</th>
                <th className="py-3.5 px-4">Discount</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Due</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Job</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                      <span>Loading invoices...</span>
                    </div>
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    No invoices found. Click "Create invoice" to generate one.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const invId = inv._id || inv.id;
                  const formattedCreated = inv.created_date
                    ? new Date(inv.created_date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })
                    : "Today";

                  return (
                    <tr
                      key={invId}
                      onClick={() => router.push(`/invoices/${inv.invoice_number || invId}`)}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      <td
                        className="py-4 px-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectOne(invId);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(invId)}
                          onChange={() => handleSelectOne(invId)}
                          className="accent-[#D31010] w-4 h-4 rounded cursor-pointer"
                        />
                      </td>

                      <td className="py-4 px-4 font-bold text-[#D31010]">
                        <div>#{inv.invoice_number}</div>
                        {inv.status_subtext && (
                          <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                            {inv.status_subtext}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 font-medium text-slate-600 dark:text-slate-300">
                        {inv.invoice_name || "-"}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {inv.client_name}
                          </span>
                          {inv.client_email && (
                            <span className="text-[11px] text-slate-400 font-normal">
                              {inv.client_email}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 font-medium text-slate-600 dark:text-slate-300">
                        {formattedCreated}
                      </td>

                      <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">
                        ${Number(inv.subtotal || 0).toFixed(2)}
                      </td>

                      <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">
                        ${Number(inv.tax_amount || 0).toFixed(2)}
                      </td>

                      <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {inv.discount || "0.00%"}
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-900 dark:text-white">
                        ${Number(inv.total_amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                        ${Number(inv.amount_due !== undefined ? inv.amount_due : inv.total_amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>

                      <td className="py-4 px-4">
                        <span className={getStatusBadgeClass(inv.status)}>
                          {inv.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {inv.job_id ? `#${inv.job_id}` : "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {total === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} entries</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-semibold text-slate-700 dark:text-slate-300">
              {page} / {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <AddInvoiceModal
        isOpen={isAddInvoiceModalOpen}
        onClose={() => {
          setIsAddInvoiceModalOpen(false);
          if (router.query.create) {
            router.replace("/invoices", undefined, { shallow: true });
          }
        }}
        onInvoiceCreated={() => {
          fetchInvoices();
        }}
      />
    </div>
  );
}
