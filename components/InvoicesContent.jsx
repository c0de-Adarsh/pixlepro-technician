import React, { useState } from "react";
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
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";

export default function InvoicesContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [selectedIds, setSelectedIds] = useState([]);

  const invoices = [
    {
      id: "inv_865",
      invoiceNo: "865",
      subtext: "Waiting for QuickBooks",
      name: "",
      clientName: "Unees",
      clientEmail: "uneeshassain123@gmail.com",
      created: "Mon Aug 1...",
      subtotal: 189.99,
      tax: 16.20,
      discount: "0.00%",
      amount: 206.19,
      due: 0.00,
      status: "Paid",
      statusSubtext: "sent on Mon A...",
      job: "1046",
    },
    {
      id: "inv_864",
      invoiceNo: "864",
      subtext: "Waiting for QuickBooks",
      name: "",
      clientName: "Antonio",
      clientEmail: "arcfinancialgroup@gmail.com",
      created: "Mon Aug 1...",
      subtotal: 652.99,
      tax: 78.36,
      discount: "0.00%",
      amount: 731.35,
      due: 0.00,
      status: "Paid",
      statusSubtext: "sent on Mon A...",
      job: "1029",
    },
    {
      id: "inv_863",
      invoiceNo: "863",
      subtext: "",
      name: "",
      clientName: "Ricco Rodriguez",
      clientEmail: "rlricco@gmail.com",
      created: "Mon Aug 1...",
      subtotal: 130.00,
      tax: 6.50,
      discount: "0.00%",
      amount: 136.50,
      due: 136.50,
      status: "Due",
      statusSubtext: "sent on Mon A...",
      job: "1002",
    },
    {
      id: "inv_862",
      invoiceNo: "862",
      subtext: "",
      name: "",
      clientName: "ky",
      clientEmail: "kyjchristiansen@gmail.com",
      created: "Mon Aug 1...",
      subtotal: 3601.63,
      tax: 150.45,
      discount: "15.00%",
      amount: 3211.84,
      due: 2106.04,
      status: "Overdue",
      statusSubtext: "sent on Mon A...",
      job: "1032",
    },
    {
      id: "inv_861",
      invoiceNo: "861",
      subtext: "",
      name: "",
      clientName: "Raya",
      clientEmail: "rayaalhamdan@gmail.com",
      created: "Mon Aug 1...",
      subtotal: 0.00,
      tax: 0.00,
      discount: "0.00%",
      amount: 0.00,
      due: 0.00,
      status: "No amount",
      statusSubtext: "Not sent",
      job: "-",
    },
  ];

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNo.includes(searchTerm) ||
      inv.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.clientEmail.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All Statuses" ||
      inv.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredInvoices.map((i) => i.id));
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
      toast.error("Please select invoices to delete");
      return;
    }
    toast.success(`Deleted ${selectedIds.length} invoices`);
    setSelectedIds([]);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Paid":
        return "text-emerald-600 dark:text-emerald-400 font-bold";
      case "Due":
        return "text-amber-600 dark:text-amber-400 font-bold";
      case "Overdue":
        return "text-[#D31010] font-bold";
      case "No amount":
        return "text-slate-400 font-medium";
      default:
        return "text-slate-600 dark:text-slate-300 font-medium";
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

        <button
          type="button"
          onClick={() => toast.success("Exporting invoices to CSV...")}
          className="px-6 py-2.5 bg-[#990000] hover:bg-[#770000] text-white text-xs font-semibold rounded-xl shadow-md shadow-red-900/20 hover:shadow-lg transition-all cursor-pointer"
        >
          Export
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl border-l-4 border-l-[#990000] shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Due from 227 invoices
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            $110,656.77
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl border-l-4 border-l-slate-400 shadow-sm space-y-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Overdue from 224 invoices
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            $107,236.89
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Unsent
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              20 invoices
            </div>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Need invoices
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              64 jobs
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter results"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
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
                <option value="Paid">Paid</option>
                <option value="Due">Due</option>
                <option value="Overdue">Overdue</option>
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

        <div className="px-5 py-3 bg-red-50/30 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                onChange={handleSelectAll}
                checked={
                  filteredInvoices.length > 0 &&
                  selectedIds.length === filteredInvoices.length
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

            <button
              type="button"
              onClick={() => toast.success("Invoice sent!")}
              className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Send Invoice</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleBulkDelete}
            className="flex items-center gap-1.5 text-[#D31010] hover:text-[#b00d0d] font-bold cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
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
              {filteredInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-4 px-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(inv.id)}
                      onChange={() => handleSelectOne(inv.id)}
                      className="accent-[#D31010] w-4 h-4 rounded cursor-pointer"
                    />
                  </td>

                  <td className="py-4 px-4 font-bold text-[#D31010]">
                    <div>{inv.invoiceNo}</div>
                    {inv.subtext && (
                      <div className="text-[10px] text-slate-400 font-normal mt-0.5">
                        {inv.subtext}
                      </div>
                    )}
                  </td>

                  <td className="py-4 px-4 font-semibold text-slate-400">
                    {inv.name || "-"}
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {inv.clientName}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {inv.clientEmail}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-4 font-semibold text-slate-700 dark:text-slate-300">
                    {inv.created}
                  </td>

                  <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    ${inv.subtotal.toFixed(2)}
                  </td>

                  <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    ${inv.tax.toFixed(2)}
                  </td>

                  <td className="py-4 px-4 font-semibold text-slate-800 dark:text-slate-200">
                    {inv.discount}
                  </td>

                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                    ${inv.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                    ${inv.due.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className={getStatusBadgeClass(inv.status)}>
                        {inv.status}
                      </span>
                      {inv.statusSubtext && (
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                          {inv.statusSubtext}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-4 px-4 font-bold text-slate-700 dark:text-slate-300">
                    {inv.job}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing 1 to {filteredInvoices.length} of 248 entries</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled
              className="p-1 text-slate-300 dark:text-slate-600 cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#D31010] text-white font-bold text-xs shadow-sm"
            >
              1
            </button>
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 text-xs cursor-pointer"
            >
              2
            </button>
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 text-xs cursor-pointer"
            >
              3
            </button>
            <span className="px-1 text-slate-400">...</span>
            <button
              type="button"
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 text-xs cursor-pointer"
            >
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
    </div>
  );
}
