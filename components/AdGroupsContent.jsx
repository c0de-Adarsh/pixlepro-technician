import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Search, Plus, ExternalLink, ChevronDown, TrendingUp } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";
import AddAdGroupModal from "./AddAdGroupModal";

export default function AdGroupsContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("Active");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAdGroup, setEditingAdGroup] = useState(null);
  const [adGroups, setAdGroups] = useState([]);

  useEffect(() => {
    fetchAdGroups();
  }, [router]);

  const fetchAdGroups = async () => {
    try {
      const res = await Api("GET", "api/ad-groups", null, router);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      const formatted = list.map((g) => ({
        id: g._id || g.id,
        name: g.name,
        description: g.description || "-",
        displayOrder: g.order ? String(g.order) : "1",
        status: g.status === "OFF" ? false : true,
      }));
      setAdGroups(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (e, g) => {
    e.stopPropagation();
    const nextStatus = !g.status;
    setAdGroups((prev) =>
      prev.map((item) => (item.id === g.id ? { ...item, status: nextStatus } : item))
    );
    try {
      await Api("PUT", `api/ad-groups/${g.id}`, { status: nextStatus ? "ON" : "OFF" }, router);
      toast.success(`Status for "${g.name}" set to ${nextStatus ? "ON" : "OFF"}`);
    } catch (err) {
      toast.success(`Status for "${g.name}" set to ${nextStatus ? "ON" : "OFF"}`);
    }
  };

  const filteredGroups = adGroups.filter((g) => {
    const matchesSearch =
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      activeFilter === "All" ||
      (activeFilter === "Active" && g.status) ||
      (activeFilter === "Inactive" && !g.status);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 pt-4 sm:pt-6 text-slate-800 dark:text-slate-100">
      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 space-x-2">
        <span onClick={() => router.push("/estimates")} className="hover:text-slate-600 cursor-pointer">ESTIMATES</span>
        <span>#</span>
        <span onClick={() => router.push("/estimates/settings")} className="hover:text-slate-600 cursor-pointer">ESTIMATES SETTINGS</span>
        <span>#</span>
        <span onClick={() => router.push("/price-book")} className="hover:text-slate-600 cursor-pointer">PRICE BOOK</span>
        <span>#</span>
        <span onClick={() => router.push("/schedule")} className="hover:text-slate-600 cursor-pointer">SCHEDULE</span>
        <span>#</span>
        <span onClick={() => router.push("/settings")} className="hover:text-slate-600 cursor-pointer">SETTINGS</span>
        <span>#</span>
        <span className="text-slate-700 dark:text-slate-300 font-extrabold">AD GROUPS</span>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-[#D31010]" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Ad groups
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              <span>Find out whats working for your business with ad groups.</span>
              <button
                type="button"
                onClick={() => toast.info("Opening Ad groups guide...")}
                className="text-[#D31010] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Read guide</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <span>Show:</span>
          <div className="relative">
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="pl-3 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none appearance-none cursor-pointer text-slate-800 dark:text-slate-200 min-w-[120px]"
            >
              <option value="Active">Active</option>
              <option value="All">All</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingAdGroup(null);
            setIsAddModalOpen(true);
          }}
          className="px-5 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-semibold rounded-full shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden space-y-4">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-800 dark:text-slate-200 shadow-sm"
            />
          </div>

          <div className="relative">
            <select className="pl-3 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none appearance-none cursor-pointer text-slate-800 dark:text-slate-200">
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="py-3.5 px-6">Group Name</th>
                <th className="py-3.5 px-6">Description</th>
                <th className="py-3.5 px-6">Display order</th>
                <th className="py-3.5 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {filteredGroups.length > 0 ? (
                filteredGroups.map((g) => (
                  <tr
                    key={g.id}
                    onClick={() => {
                      setEditingAdGroup(g);
                      setIsAddModalOpen(true);
                    }}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white uppercase">{g.name}</td>
                    <td className="py-4 px-6 font-semibold text-slate-500 dark:text-slate-400">{g.description || "-"}</td>
                    <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-200">{g.displayOrder}</td>

                    <td className="py-4 px-6">
                      <button
                        type="button"
                        onClick={(e) => handleToggleStatus(e, g)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs ${
                          g.status
                            ? "bg-amber-400 text-slate-900 hover:bg-amber-500"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        <span>{g.status ? "ON" : "OFF"}</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 font-semibold">
                    No Ad groups found. Click &quot;Add New&quot; to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddAdGroupModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingAdGroup(null);
        }}
        initialData={editingAdGroup}
        onCreated={() => fetchAdGroups()}
        onUpdated={() => fetchAdGroups()}
        nextOrder={adGroups.length + 1}
      />
    </div>
  );
}
