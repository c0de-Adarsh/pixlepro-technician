import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Plus,
  Download,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";
import AddClientModal from "./AddClientModal";

export default function ClientsContent() {
  const router = useRouter();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [showFranchises, setShowFranchises] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchClients = async () => {
      try {
        setLoading(true);
        const res = await Api("GET", "api/clients", null, router);
        if (isMounted) {
          const clientData = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
          const formatted = clientData.map((c, idx) => ({
            id: c._id ? c._id.substring(c._id.length - 4) : `${2550 - idx}`,
            _id: c._id,
            name: `${c.first_name || ""} ${c.last_name || ""}`.trim() || "Client",
            email: c.email || "",
            company: c.company_name || "",
            address: c.address ? `${c.address.street || ""} ${c.address.city || ""}`.trim() : "",
            phone: c.phone || "",
            created: c.createdAt
              ? new Date(c.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
              : "",
            adSource: c.ad_source || "Direct",
            isFranchise: false,
          }));
          setClients(formatted);
        }
      } catch (err) {
        if (isMounted) setClients([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchClients();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // Filter clients based on search query and franchise filter
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFranchise = showFranchises ? c.isFranchise : true;

    return matchesSearch && matchesFranchise;
  });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredClients.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleExportCSV = () => {
    if (filteredClients.length === 0) {
      toast.error("No clients data available to export");
      return;
    }
    const headers = ["ID", "Name", "Email", "Company", "Address", "Phone", "Created Date", "Ad Source"];
    const csvRows = [headers.join(",")];
    filteredClients.forEach((row) => {
      csvRows.push(
        [
          `"${row.id}"`,
          `"${row.name}"`,
          `"${row.email}"`,
          `"${row.company}"`,
          `"${row.address}"`,
          `"${row.phone}"`,
          `"${row.created}"`,
          `"${row.adSource}"`,
        ].join(",")
      );
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `clients_report_${Date.now()}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("Clients list exported successfully!");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 pt-6 sm:pt-8 text-slate-800 dark:text-slate-100">
      {/* Header Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Clients
          </h1>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsAddClientOpen(true)}
            className="flex-1 sm:flex-none bg-[#D31010] hover:bg-[#b00d0d] text-white font-extrabold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg shadow-red-500/20 transition-all duration-200 cursor-pointer text-xs"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Client</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-red-200 dark:border-slate-800 font-extrabold px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer text-xs shadow-sm"
          >
            <Download className="w-4 h-4 text-[#D31010]" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards Bar (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Clients */}
        <div className="p-5 bg-white dark:bg-[#0E1E31] border border-red-200/80 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden border-l-[4px] border-l-[#7A0000]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
              Clients
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-end">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              {clients.length.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 2: Due from 131 clients */}
        <div className="p-5 bg-white dark:bg-[#0E1E31] border border-red-200/80 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden border-l-[4px] border-l-[#EAB308]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
              Due from 131 clients
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-end">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              $108,552.82
            </span>
          </div>
        </div>

        {/* Card 3: Past due from 129 clients */}
        <div className="p-5 bg-white dark:bg-[#0E1E31] border border-red-200/80 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden border-l-[4px] border-l-[#D31010]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
              Past due from 129 clients
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-end">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              $105,269.44
            </span>
          </div>
        </div>

        {/* Card 4: Estimates Pending */}
        <div className="p-5 bg-white dark:bg-[#0E1E31] border border-red-200/80 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden border-l-[4px] border-l-slate-400">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
              Estimates Pending $438,856.03
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-end">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              377
            </span>
          </div>
        </div>
      </div>

      {/* Show Franchises Clients Toggle Filter (Screenshot 2) */}
      <div className="flex items-center gap-3 pt-1">
        <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
          Show Franchises Clients
        </span>
        <button
          type="button"
          onClick={() => setShowFranchises(!showFranchises)}
          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
            showFranchises ? "bg-[#D31010]" : "bg-slate-300 dark:bg-slate-700"
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
              showFranchises ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Filter Control Box Accordion */}
      <div className="p-4 bg-white dark:bg-[#0E1E31] border border-red-200/80 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-[#D31010] flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              <span>Filter results</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isFilterOpen ? "rotate-180" : ""}`} />
          </button>

          <div className="relative">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold cursor-pointer">
              <Calendar className="w-4 h-4 text-[#D31010]" />
              <div className="flex flex-col">
                <span className="text-[10px] text-red-500 font-bold uppercase">
                  Recent 30 days including today
                </span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">
                  Aug 11th, 2026 - Aug 11th, 2026
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </div>
          </div>
        </div>

        {isFilterOpen && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Ad Source
              </label>
              <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                <option value="">All Sources</option>
                <option value="Google">Google</option>
                <option value="Facebook">Facebook</option>
                <option value="Referral">Referral</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Status
              </label>
              <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                City / Region
              </label>
              <input
                type="text"
                placeholder="e.g. Edmonton"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Datatable Control Bar & Datatable */}
      <div className="bg-white dark:bg-[#0E1E31] border border-red-200/80 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search operations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-semibold text-slate-500">Rows:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Datatable */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-400 bg-slate-50/50 dark:bg-slate-900/40">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === filteredClients.length &&
                      filteredClients.length > 0
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-[#D31010] border-slate-300"
                  />
                </th>
                <th className="py-3 px-4 font-extrabold text-slate-500">Id</th>
                <th className="py-3 px-4 font-extrabold text-slate-500">Name</th>
                <th className="py-3 px-4 font-extrabold text-slate-500">Company</th>
                <th className="py-3 px-4 font-extrabold text-slate-500">Address</th>
                <th className="py-3 px-4 font-extrabold text-slate-500">Phone</th>
                <th className="py-3 px-4 font-extrabold text-slate-500">Created</th>
                <th className="py-3 px-4 font-extrabold text-slate-500">Ad Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No clients found.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const isSelected = selectedIds.includes(client.id);
                  return (
                    <tr
                      key={client.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${
                        isSelected ? "bg-red-50/40 dark:bg-red-950/20" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectOne(client.id)}
                          className="w-4 h-4 rounded text-[#D31010] border-slate-300"
                        />
                      </td>
                      <td
                        onClick={() => router.push(`/clients/${client._id || client.id}`)}
                        className="py-3.5 px-4 font-extrabold text-slate-700 dark:text-slate-300 hover:text-[#D31010]"
                      >
                        {client.id}
                      </td>
                      <td
                        onClick={() => router.push(`/clients/${client._id || client.id}`)}
                        className="py-3.5 px-4"
                      >
                        <div className="flex flex-col">
                          <span className="font-extrabold text-slate-900 dark:text-white hover:text-[#D31010]">
                            {client.name}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {client.email}
                          </span>
                        </div>
                      </td>
                      <td
                        onClick={() => router.push(`/clients/${client._id || client.id}`)}
                        className="py-3.5 px-4 text-slate-600 dark:text-slate-400"
                      >
                        {client.company || "—"}
                      </td>
                      <td
                        onClick={() => router.push(`/clients/${client._id || client.id}`)}
                        className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-[200px] truncate"
                      >
                        {client.address || "—"}
                      </td>
                      <td
                        onClick={() => router.push(`/clients/${client._id || client.id}`)}
                        className="py-3.5 px-4 font-extrabold text-[#D31010]"
                      >
                        {client.phone}
                      </td>
                      <td
                        onClick={() => router.push(`/clients/${client._id || client.id}`)}
                        className="py-3.5 px-4 text-slate-600 dark:text-slate-400"
                      >
                        {client.created}
                      </td>
                      <td
                        onClick={() => router.push(`/clients/${client.id}`)}
                        className="py-3.5 px-4 text-slate-600 dark:text-slate-400"
                      >
                        {client.adSource}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Datatable Pagination Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800 dark:text-slate-200">3</span> of{" "}
            <span className="font-bold text-slate-800 dark:text-slate-200">12</span> entries
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className={`w-7 h-7 rounded-lg text-xs font-bold ${
                currentPage === 1
                  ? "bg-[#D31010] text-white"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              1
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(2)}
              className={`w-7 h-7 rounded-lg text-xs font-bold ${
                currentPage === 2
                  ? "bg-[#D31010] text-white"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              2
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(3)}
              className={`w-7 h-7 rounded-lg text-xs font-bold ${
                currentPage === 3
                  ? "bg-[#D31010] text-white"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}
            >
              3
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(currentPage + 1)}
              className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Client Fullscreen Modal */}
      <AddClientModal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
      />
    </div>
  );
}
