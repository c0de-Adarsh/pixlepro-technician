import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Percent,
  Plus,
  Search,
  ExternalLink,
  ChevronDown,
  X,
  Edit2,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";

export default function TaxesContent() {
  const router = useRouter();

  const [taxesList, setTaxesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("Active");
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTax, setEditingTax] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [taxName, setTaxName] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [isDefaultRate, setIsDefaultRate] = useState(false);
  const [agencyInfo, setAgencyInfo] = useState("");
  const [isGrouped, setIsGrouped] = useState(false);
  const [selectedSubTaxIds, setSelectedSubTaxIds] = useState([]);
  const [isSubTaxDropdownOpen, setIsSubTaxDropdownOpen] = useState(false);

  const fetchTaxes = async () => {
    try {
      setIsLoading(true);
      const queryParam = statusFilter === "All" ? "" : `?status=${statusFilter}`;
      const res = await Api("GET", `api/taxes${queryParam}`, null, router);
      if (res && (res.data || res.success)) {
        const list = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        setTaxesList(list);
      }
    } catch (err) {
      toast.error("Error fetching taxes");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTaxes();
  }, [statusFilter]);

  const openAddModal = () => {
    setEditingTax(null);
    setTaxName("");
    setTaxRate("");
    setIsDefaultRate(false);
    setAgencyInfo("");
    setIsGrouped(false);
    setSelectedSubTaxIds([]);
    setIsSubTaxDropdownOpen(false);
    setIsModalOpen(true);
  };

  const openEditModal = (tax) => {
    setEditingTax(tax);
    setTaxName(tax.name || "");
    setTaxRate(String(tax.rate ?? ""));
    setIsDefaultRate(Boolean(tax.is_default));
    setAgencyInfo(tax.agency_info || "");
    setIsGrouped(Boolean(tax.is_grouped));
    const subIds = Array.isArray(tax.sub_taxes)
      ? tax.sub_taxes.map((st) => (typeof st === "object" ? st._id : st))
      : [];
    setSelectedSubTaxIds(subIds);
    setIsSubTaxDropdownOpen(false);
    setIsModalOpen(true);
  };

  const individualTaxes = useMemo(() => {
    return taxesList.filter((t) => !t.is_grouped && t.status === "Active");
  }, [taxesList]);

  const handleSubTaxToggle = (subTaxId) => {
    let nextIds;
    if (selectedSubTaxIds.includes(subTaxId)) {
      nextIds = selectedSubTaxIds.filter((id) => id !== subTaxId);
    } else {
      nextIds = [...selectedSubTaxIds, subTaxId];
    }
    setSelectedSubTaxIds(nextIds);

    const sumRate = individualTaxes
      .filter((t) => nextIds.includes(t._id || t.id))
      .reduce((acc, t) => acc + Number(t.rate || 0), 0);
    setTaxRate(String(sumRate));
  };

  const handleToggleStatus = async (tax) => {
    try {
      const taxId = tax._id || tax.id;
      const res = await Api("PATCH", `api/taxes/${taxId}/status`, {}, router);
      if (res && (res.success || res.data)) {
        toast.success(`Tax rate status updated`);
        fetchTaxes();
      } else {
        toast.error(res?.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Error updating tax status");
    }
  };

  const handleSaveTax = async (e) => {
    e.preventDefault();
    if (!taxName.trim()) {
      toast.error("Please enter a tax name");
      return;
    }

    if (isGrouped && selectedSubTaxIds.length < 2) {
      toast.error("Minimum of two sub-tax rates required for a tax group");
      return;
    }

    const numericRate = Number(taxRate);
    if (isNaN(numericRate) || numericRate < 0) {
      toast.error("Please enter a valid tax rate percentage");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        name: taxName.trim(),
        rate: numericRate,
        is_default: isDefaultRate,
        agency_info: agencyInfo.trim(),
        is_grouped: isGrouped,
        sub_taxes: isGrouped ? selectedSubTaxIds : [],
      };

      let res;
      if (editingTax) {
        const taxId = editingTax._id || editingTax.id;
        res = await Api("PUT", `api/taxes/${taxId}`, payload, router);
      } else {
        res = await Api("POST", "api/taxes", payload, router);
      }

      if (res && (res.success || res.data)) {
        toast.success(editingTax ? "Tax rate updated successfully" : "Tax rate created successfully");
        setIsModalOpen(false);
        fetchTaxes();
      } else {
        toast.error(res?.message || "Failed to save tax rate");
      }
    } catch (err) {
      toast.error("Error saving tax rate");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTax = async () => {
    if (!editingTax) return;
    try {
      const taxId = editingTax._id || editingTax.id;
      const res = await Api("DELETE", `api/taxes/${taxId}`, {}, router);
      if (res && (res.success || res.data)) {
        toast.success("Tax rate deleted successfully");
        setIsModalOpen(false);
        fetchTaxes();
      } else {
        toast.error(res?.message || "Failed to delete tax rate");
      }
    } catch (err) {
      toast.error("Error deleting tax rate");
    }
  };

  const filteredTaxes = useMemo(() => {
    return taxesList.filter((t) => {
      if (!searchTerm.trim()) return true;
      return t.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [taxesList, searchTerm]);

  const paginatedTaxes = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredTaxes.slice(start, start + rowsPerPage);
  }, [filteredTaxes, currentPage, rowsPerPage]);

  const totalPages = Math.ceil(filteredTaxes.length / rowsPerPage) || 1;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 pt-6 sm:pt-8 text-slate-800 dark:text-slate-100">
      {/* Top Breadcrumb Navigation */}
      <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap space-x-1.5">
        <span onClick={() => router.push("/schedule")} className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">SCHEDULE</span>
        <span>#</span>
        <span onClick={() => router.push("/leads")} className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">ONLINE BOOKING</span>
        <span>#</span>
        <span onClick={() => router.push("/settings")} className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">JOB SUB STATUS</span>
        <span>#</span>
        <span onClick={() => router.push("/settings/custom-fields")} className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">CUSTOM FIELDS</span>
        <span>#</span>
        <span onClick={() => router.push("/settings")} className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">SETTINGS</span>
        <span>#</span>
        <span className="text-slate-800 dark:text-slate-200 font-bold">TAX SETTINGS</span>
      </div>

      {/* Main Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/90 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-900/40 rounded-2xl text-[#D31010]">
            <Percent className="w-6 h-6 stroke-[1.75]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Taxes
            </h1>
            <div className="flex items-center gap-3 mt-0.5">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage different tax rates and set your default taxes.
              </p>
              <a
                href="https://help.workiz.com/hc/en-us/articles/18055855564433-How-to-set-and-manage-tax-rates-for-jobs-and-invoices"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-[#D31010] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Read guide</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Add New Button */}
        <button
          type="button"
          onClick={openAddModal}
          className="px-6 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add New</span>
        </button>
      </div>

      {/* Toolbar: Show Filter, Search, Rows Per Page */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Show:</span>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D31010]/20 focus:border-[#D31010]"
              >
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
                <option value="All">All</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#D31010]/20 focus:border-[#D31010]"
            />
          </div>
        </div>

        {/* Rows Per Page */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="relative">
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 appearance-none pr-7 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D31010]/20 focus:border-[#D31010]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Tax Rates Datatable */}
      <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs font-semibold">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-4 px-6">Name</th>
              <th className="py-4 px-6">Rate</th>
              <th className="py-4 px-6 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="py-12 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#D31010] mb-2" />
                  <span>Loading tax rates...</span>
                </td>
              </tr>
            ) : paginatedTaxes.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-900/40 flex items-center justify-center text-[#D31010]">
                      <Percent className="w-7 h-7 stroke-[1.75]" />
                    </div>
                    <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      No tax rates found
                    </div>
                    <p className="text-xs text-slate-400 max-w-xs">
                      {searchTerm ? "No tax rates matching your search" : "Get started by adding your first business tax rate."}
                    </p>
                    {!searchTerm && (
                      <button
                        type="button"
                        onClick={openAddModal}
                        className="mt-2 px-5 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md cursor-pointer"
                      >
                        + Add Tax Rate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedTaxes.map((tax) => {
                const isActive = tax.status === "Active";
                return (
                  <tr
                    key={tax._id || tax.id}
                    onClick={() => openEditModal(tax)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    {/* Tax Name (Clickable to Edit) */}
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 dark:text-white group-hover:text-[#D31010] inline-flex items-center gap-2">
                        <span>{tax.name}</span>
                        {tax.is_default && (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-red-100 dark:bg-red-950/60 text-[#D31010] rounded-full">
                            Default
                          </span>
                        )}
                        {tax.is_grouped && (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">
                            Grouped
                          </span>
                        )}
                      </div>
                      {tax.agency_info && (
                        <div className="text-[11px] text-slate-400 font-normal mt-0.5 truncate max-w-sm">
                          {tax.agency_info}
                        </div>
                      )}
                    </td>

                    {/* Tax Rate Percentage */}
                    <td className="py-4 px-6 text-slate-700 dark:text-slate-200 font-bold text-sm">
                      {tax.rate}%
                    </td>

                    {/* Status Toggle Button */}
                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(tax);
                        }}
                        className={`inline-flex items-center justify-between w-14 h-7 rounded-full p-1 transition-colors cursor-pointer ${
                          isActive ? "bg-[#D31010]" : "bg-slate-300 dark:bg-slate-700"
                        }`}
                      >
                        <span className={`text-[10px] font-extrabold px-1 text-white ${isActive ? "order-1" : "order-2 opacity-0"}`}>
                          ON
                        </span>
                        <div
                          className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                            isActive ? "translate-x-0 order-2" : "translate-x-0 order-1"
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>
              Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
              {Math.min(currentPage * rowsPerPage, filteredTaxes.length)} of{" "}
              {filteredTaxes.length} taxes
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span className="px-3 py-1 bg-[#D31010] text-white rounded-lg">
                {currentPage}
              </span>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Tax Modal Popup (Exact Workiz UI) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-800 dark:text-slate-100 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {editingTax ? "Edit Tax" : "Add new Tax"}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTax} className="p-6 space-y-4 text-xs font-semibold">
                {/* Name input */}
                <div>
                  <input
                    type="text"
                    placeholder="Name"
                    value={taxName}
                    onChange={(e) => setTaxName(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D31010]/20 focus:border-[#D31010]"
                    autoFocus
                  />
                </div>

                {/* Tax rate % input */}
                <div>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="Tax rate %"
                    value={taxRate}
                    disabled={isGrouped}
                    onChange={(e) => setTaxRate(e.target.value)}
                    className={`w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D31010]/20 focus:border-[#D31010] ${
                      isGrouped ? "opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-800/40" : ""
                    }`}
                  />
                </div>

                {/* Is default tax rate? dropdown */}
                <div className="border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-1.5 bg-white dark:bg-slate-900 relative focus-within:ring-2 focus-within:ring-[#D31010]/20 focus-within:border-[#D31010]">
                  <label className="block text-[10px] font-bold text-slate-400">
                    Is default tax rate?
                  </label>
                  <div className="relative">
                    <select
                      value={isDefaultRate ? "true" : "false"}
                      onChange={(e) => setIsDefaultRate(e.target.value === "true")}
                      className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none appearance-none cursor-pointer pr-6 py-0.5"
                    >
                      <option value="true">Use this rate as default</option>
                      <option value="false">Don't use this rate as default</option>
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Tax agency information textarea */}
                <div>
                  <textarea
                    rows={3}
                    placeholder="Enter tax agency information"
                    value={agencyInfo}
                    onChange={(e) => setAgencyInfo(e.target.value)}
                    className="w-full p-3.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D31010]/20 focus:border-[#D31010] resize-none"
                  />
                </div>

                {/* Is this a grouped tax rate? toggle switch */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Is this a grouped tax rate?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isGrouped;
                      setIsGrouped(next);
                      if (!next) {
                        setSelectedSubTaxIds([]);
                      }
                    }}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      isGrouped ? "bg-[#D31010]" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        isGrouped ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Grouped Tax Rates Selector (Screenshots 3 & 4) */}
                {isGrouped && (
                  <div className="space-y-2 pt-1">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsSubTaxDropdownOpen(!isSubTaxDropdownOpen)}
                        className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between cursor-pointer text-left"
                      >
                        <span className="truncate">
                          {selectedSubTaxIds.length === 0
                            ? "Select sub-tax rates"
                            : `${selectedSubTaxIds.length} sub-tax rate(s) selected`}
                        </span>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </button>

                      {/* Dropdown Menu */}
                      {isSubTaxDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-20 max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                          {individualTaxes.length === 0 ? (
                            <div className="p-3 text-center text-xs text-slate-400 font-bold">
                              No active individual tax rates available
                            </div>
                          ) : (
                            individualTaxes.map((st) => {
                              const isSelected = selectedSubTaxIds.includes(st._id || st.id);
                              return (
                                <div
                                  key={st._id || st.id}
                                  onClick={() => handleSubTaxToggle(st._id || st.id)}
                                  className={`p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                                    isSelected ? "bg-red-50/50 dark:bg-red-950/20 text-[#D31010]" : ""
                                  }`}
                                >
                                  <div>
                                    <div className="font-bold text-xs">
                                      {st.name} - {st.rate}%
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      {Number(st.rate).toFixed(5)}
                                    </div>
                                  </div>
                                  {isSelected && (
                                    <Check className="w-4 h-4 text-[#D31010] stroke-[3]" />
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-semibold italic">
                      Minimum of two sub-tax rates required for tax group
                    </p>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {editingTax ? (
                    <button
                      type="button"
                      onClick={handleDeleteTax}
                      className="px-4 py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  ) : <div />}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-2.5 border border-slate-300 dark:border-slate-700 rounded-full text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-8 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
