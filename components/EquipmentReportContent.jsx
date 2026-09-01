import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Download,
  Search,
  ChevronDown,
  Calendar,
  Filter,
  Check,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Tag,
  Clock,
  Briefcase,
  RefreshCw,
  Trash2,
  Edit2,
  History,
  ShieldCheck,
  ShieldAlert,
  Wrench,
  Layers,
  CheckCircle2,
  Tv,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";
import AddEquipmentModal from "./AddEquipmentModal";
import EquipmentHistoryModal from "./EquipmentHistoryModal";
import ConfirmationModal from "./ConfirmationModal";

export default function EquipmentReportContent() {
  const { theme } = useTheme();
  const router = useRouter();

  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState("All Clients");
  const [selectedManufacturer, setSelectedManufacturer] = useState("All Manufacturers");
  const [warrantyFilter, setWarrantyFilter] = useState("all");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const [allManufacturers, setAllManufacturers] = useState([]);
  const [allClientsList, setAllClientsList] = useState([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [historyModalEquipment, setHistoryModalEquipment] = useState(null);

  const [equipmentToDelete, setEquipmentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEquipment = async () => {
    try {
      setLoading(true);
      let queryUrl = `api/equipment?search=${encodeURIComponent(searchQuery)}&page=${currentPage}&limit=${rowsPerPage}`;
      if (selectedClient !== "All Clients") queryUrl += `&client_name=${encodeURIComponent(selectedClient)}`;
      if (selectedManufacturer !== "All Manufacturers") queryUrl += `&manufacturer=${encodeURIComponent(selectedManufacturer)}`;
      if (warrantyFilter !== "all") queryUrl += `&warranty_status=${warrantyFilter}`;

      const res = await Api("GET", queryUrl);
      if (res && (res.data || res.success)) {
        const list = Array.isArray(res.data) ? res.data : [];
        setEquipmentList(list);
        if (Array.isArray(res.manufacturers)) setAllManufacturers(res.manufacturers.filter(Boolean));
        if (Array.isArray(res.clients)) setAllClientsList(res.clients.filter(Boolean));
      }
    } catch (err) {
      console.error("Error fetching equipment:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [searchQuery, selectedClient, selectedManufacturer, warrantyFilter, rowsPerPage, currentPage]);

  const metrics = useMemo(() => {
    const total = equipmentList.length;
    let inWarranty = 0;
    let expired = 0;
    let servicedTotal = 0;

    const now = new Date();
    equipmentList.forEach((eq) => {
      if (eq.labor_warranty_exp && new Date(eq.labor_warranty_exp) >= now) {
        inWarranty++;
      } else {
        expired++;
      }
      if (Array.isArray(eq.history)) {
        servicedTotal += eq.history.filter((h) => h.event_type === "Serviced").length;
      }
    });

    return { total, inWarranty, expired, servicedTotal };
  }, [equipmentList]);

  const handleDelete = (id, name) => {
    setEquipmentToDelete({ id, name });
  };

  const confirmDelete = async () => {
    if (!equipmentToDelete) return;
    setIsDeleting(true);
    try {
      const res = await Api("DELETE", `api/equipment/${equipmentToDelete.id}`);
      if (res && res.success) {
        toast.success("Equipment deleted successfully!");
        setEquipmentToDelete(null);
        fetchEquipment();
      } else {
        toast.error("Failed to delete equipment");
      }
    } catch (err) {
      toast.error("Error deleting equipment");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExport = () => {
    if (equipmentList.length === 0) {
      toast.info("No equipment to export");
      return;
    }
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Equipment Name,Model #,Serial #,Manufacturer,Client Name,Phone,Address,Installation Date,Labor Warranty,Parts Warranty,History Count"]
        .concat(
          equipmentList.map((eq) => {
            const addr = typeof eq.address === "object" ? `${eq.address.street || ""} ${eq.address.city || ""}`.trim() : (eq.address || "");
            const inst = eq.installation_date ? new Date(eq.installation_date).toLocaleDateString() : "";
            const lab = eq.labor_warranty_exp ? new Date(eq.labor_warranty_exp).toLocaleDateString() : "";
            const prt = eq.parts_warranty_exp ? new Date(eq.parts_warranty_exp).toLocaleDateString() : "";
            return `"${eq.name}","${eq.model_number}","${eq.serial_number || ""}","${eq.manufacturer || ""}","${eq.client_name}","${eq.phone || ""}","${addr}","${inst}","${lab}","${prt}",${eq.history?.length || 0}`;
          })
        )
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `pixlpro_equipment_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Equipment report exported successfully!");
  };

  const isDateActive = (dateStr) => {
    if (!dateStr) return false;
    return new Date(dateStr) >= new Date();
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto space-y-6 pt-6 sm:pt-8 pb-16 px-3 sm:px-6 md:px-8 text-slate-800 dark:text-slate-100">
      <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap space-x-1.5">
        <span onClick={() => router.push("/settings")} className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">JOB SUB STATUS</span>
        <span>#</span>
        <span onClick={() => router.push("/settings/custom-fields")} className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">CUSTOM FIELDS</span>
        <span>#</span>
        <span onClick={() => router.push("/settings/taxes")} className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">TAX SETTINGS</span>
        <span>#</span>
        <span onClick={() => router.push("/reports/timesheets")} className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">TIMESHEET</span>
        <span>#</span>
        <span onClick={() => router.push("/settings")} className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">SETTINGS</span>
        <span>#</span>
        <span onClick={() => router.push("/reports")} className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">REPORTS</span>
        <span>#</span>
        <span className="text-slate-800 dark:text-white font-bold">EQUIPMENT</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Equipment Tracking & History
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Keep track of all installed client equipment, warranties, serial numbers, and lifetime service histories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingEquipment(null);
              setIsAddModalOpen(true);
            }}
            className="px-5 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Equipment</span>
          </button>

          <button
            onClick={handleExport}
            className="px-4 py-2.5 bg-white dark:bg-[#0E1E31] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:border-[#D31010] text-xs sm:text-sm font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-[#0E1E31] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Tracked</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {metrics.total}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Units across all clients</div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0E1E31] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Under Warranty</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {metrics.inWarranty}
          </div>
          <div className="text-[11px] text-emerald-600/80 mt-0.5">Active coverage</div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0E1E31] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Warranty Expired</span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {metrics.expired}
          </div>
          <div className="text-[11px] text-amber-600/80 mt-0.5">Out of warranty</div>
        </div>

        <div className="p-4 bg-white dark:bg-[#0E1E31] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs border-l-4 border-l-[#D31010]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#D31010]">Services Logged</span>
            <Wrench className="w-4 h-4 text-[#D31010]" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {metrics.servicedTotal}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Service history events</div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search equipment, model, serial..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-hidden focus:border-[#D31010]"
            />
          </div>

          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl outline-hidden cursor-pointer"
          >
            <option value="All Clients">All Clients</option>
            {allClientsList.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={selectedManufacturer}
            onChange={(e) => setSelectedManufacturer(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl outline-hidden cursor-pointer"
          >
            <option value="All Manufacturers">All Manufacturers</option>
            {allManufacturers.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={warrantyFilter}
            onChange={(e) => setWarrantyFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl outline-hidden cursor-pointer"
          >
            <option value="all">All Warranties</option>
            <option value="in_warranty">In Warranty</option>
            <option value="expired">Expired Warranty</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchEquipment();
              toast.success("Equipment report refreshed");
            }}
            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl outline-hidden cursor-pointer"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 select-none">
                <th className="py-3.5 px-4 min-w-[200px]">Equipment & Model</th>
                <th className="py-3.5 px-4 min-w-[180px]">Client & Location</th>
                <th className="py-3.5 px-3">Manufacturer</th>
                <th className="py-3.5 px-3">Serial #</th>
                <th className="py-3.5 px-3">Installed</th>
                <th className="py-3.5 px-3">Labor Warranty</th>
                <th className="py-3.5 px-3">Parts Warranty</th>
                <th className="py-3.5 px-4 text-right min-w-[160px]">History & Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800/80 text-xs font-medium text-slate-800 dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                      <span>Loading equipment records...</span>
                    </div>
                  </td>
                </tr>
              ) : equipmentList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No equipment found. Click "Add Equipment" to register one.
                  </td>
                </tr>
              ) : (
                equipmentList.map((eq) => {
                  const addr = typeof eq.address === "object" ? `${eq.address.street || ""} ${eq.address.city || ""}`.trim() : (eq.address || "");
                  const isLaborActive = isDateActive(eq.labor_warranty_exp);
                  const isPartsActive = isDateActive(eq.parts_warranty_exp);
                  const historyCount = Array.isArray(eq.history) ? eq.history.length : 0;

                  return (
                    <tr
                      key={eq._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {eq.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          Model: {eq.model_number}
                        </div>
                        {eq.location_in_property && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            📍 {eq.location_in_property}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {eq.client_name}
                        </div>
                        {addr && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[170px] mt-0.5">
                            {addr}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                          {eq.manufacturer || "General"}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                        {eq.serial_number || "—"}
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap text-[11px] text-slate-600 dark:text-slate-400">
                        {eq.installation_date ? new Date(eq.installation_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                      </td>

                      <td className="py-3.5 px-3">
                        {eq.labor_warranty_exp ? (
                          <div>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                isLaborActive
                                  ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                              }`}
                            >
                              {isLaborActive ? "Active" : "Expired"}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(eq.labor_warranty_exp).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        {eq.parts_warranty_exp ? (
                          <div>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                isPartsActive
                                  ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                              }`}
                            >
                              {isPartsActive ? "Active" : "Expired"}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {new Date(eq.parts_warranty_exp).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setHistoryModalEquipment(eq)}
                            className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            title="View Installation & Service History"
                          >
                            <History className="w-3.5 h-3.5" />
                            <span>{historyCount} logs</span>
                          </button>

                          <button
                            onClick={() => {
                              setEditingEquipment(eq);
                              setIsAddModalOpen(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(eq._id, eq.name)}
                            className="p-1.5 text-slate-400 hover:text-[#D31010] rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 sm:p-4 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>Showing {equipmentList.length} equipment entries</span>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-bold text-slate-700 dark:text-slate-300">
              {currentPage}
            </span>

            <button
              disabled={equipmentList.length < rowsPerPage}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <AddEquipmentModal
        isOpen={isAddModalOpen}
        initialData={editingEquipment}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingEquipment(null);
        }}
        onSaved={() => fetchEquipment()}
      />

      <EquipmentHistoryModal
        isOpen={Boolean(historyModalEquipment)}
        equipment={historyModalEquipment}
        onClose={() => setHistoryModalEquipment(null)}
        onHistoryUpdated={(updated) => {
          setHistoryModalEquipment(updated);
          fetchEquipment();
        }}
      />

      <ConfirmationModal
        isOpen={Boolean(equipmentToDelete)}
        title="Delete Equipment"
        message={
          equipmentToDelete
            ? `Are you sure you want to delete "${equipmentToDelete.name}"? This will permanently remove its warranty and service history records.`
            : "Are you sure you want to delete this equipment?"
        }
        confirmText="Delete Equipment"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setEquipmentToDelete(null)}
      />
    </div>
  );
}
