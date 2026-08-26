import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Phone,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Search,
  UserCheck,
  DollarSign,
  Briefcase,
  FileText,
  MapPin,
  CheckSquare,
  ArrowLeft,
  ChevronLeft,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";
import EditClientModal from "./EditClientModal";

export default function ClientDetailContent({ clientId }) {
  const router = useRouter();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("jobs");
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Expandable Left Accordions State
  const [isAddressesOpen, setIsAddressesOpen] = useState(true);
  const [isContactsOpen, setIsContactsOpen] = useState(false);
  const [isPaymentsOpen, setIsPaymentsOpen] = useState(false);

  // Tags State
  const [tags, setTags] = useState(["VIP Client"]);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTagText, setNewTagText] = useState("");

  // Initial fallback client data matching reference screenshots
  const sampleClient = {
    id: clientId || "2551",
    name: "bill church",
    email: "wjchurch@hotmail.com",
    phone: "(403) 585 - 2099",
    company: "",
    address: "1400 Greenbriar Dr, Oakville, ON",
    city: "Oakville",
    state: "ON",
    zipcode: "L6H 2B4",
    pastDue: "$0.00",
    due: "$0.00",
    totalRevenue: "$0.00",
    estimatesCount: 1,
    jobsCount: 0,
    invoicesCount: 0,
    paymentsCount: 0,
    addressesCount: 1,
    leadsCount: 0,
  };

  const fetchClientDetail = () => {
    if (!clientId) return;
    Api("GET", `api/clients/${clientId}`, null, router).then((res) => {
      if (res && res.data) {
        const c = res.data;
        setClient({
          _id: c._id,
          id: c._id ? c._id.substring(c._id.length - 4) : clientId,
          name: `${c.first_name || ""} ${c.last_name || ""}`.trim() || "Client",
          first_name: c.first_name || "",
          last_name: c.last_name || "",
          email: c.email || "wjchurch@hotmail.com",
          phone: c.phone || "(403) 585 - 2099",
          company: c.company_name || "",
          address: c.address ? `${c.address.street || ""} ${c.address.city || ""}`.trim() : "1400 Greenbriar Dr, Oakville, ON",
          city: c.address?.city || "Oakville",
          state: c.address?.region || "ON",
          zipcode: c.address?.postal_code || "L6H 2B4",
          pastDue: "$0.00",
          due: "$0.00",
          totalRevenue: "$0.00",
          estimatesCount: 1,
          jobsCount: 0,
          invoicesCount: 0,
          paymentsCount: 0,
          addressesCount: 1,
          leadsCount: 0,
        });
      }
    });
  };

  useEffect(() => {
    let isMounted = true;
    if (!clientId) {
      Promise.resolve().then(() => {
        if (isMounted) {
          setClient(sampleClient);
          setLoading(false);
        }
      });
      return;
    }
    Promise.resolve().then(() => {
      if (isMounted) setLoading(true);
      Api("GET", `api/clients/${clientId}`, null, router)
        .then((res) => {
          if (!isMounted) return;
          if (res && res.data) {
            const c = res.data;
            setClient({
              _id: c._id,
              id: c._id ? c._id.substring(c._id.length - 4) : clientId,
              name: `${c.first_name || ""} ${c.last_name || ""}`.trim() || "Client",
              first_name: c.first_name || "",
              last_name: c.last_name || "",
              email: c.email || "—",
              phone: c.phone || "—",
              company: c.company_name || "",
              address: c.address && (c.address.street || c.address.city)
                ? `${c.address.street || ""} ${c.address.city || ""}`.trim()
                : "—",
              city: c.address?.city || "—",
              state: c.address?.region || "—",
              zipcode: c.address?.postal_code || "—",
              pastDue: "$0.00",
              due: "$0.00",
              totalRevenue: "$0.00",
              estimatesCount: 1,
              jobsCount: 0,
              invoicesCount: 0,
              paymentsCount: 0,
              addressesCount: 1,
              leadsCount: 0,
            });
          } else {
            setClient(sampleClient);
          }
        })
        .catch(() => {
          if (isMounted) setClient(sampleClient);
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    });

    return () => {
      isMounted = false;
    };
  }, [clientId, router]);

  const handleDeleteClient = async () => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        const targetId = client?._id || clientId;
        if (targetId) {
          await Api("DELETE", `api/clients/${targetId}`, null, router);
        }
        toast.success("Client deleted successfully");
        router.push("/clients");
      } catch (err) {
        toast.error("Error deleting client");
      }
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (newTagText.trim()) {
      setTags([...tags, newTagText.trim()]);
      setNewTagText("");
      setShowTagInput(false);
      toast.success("Tag added!");
    }
  };

  const currentClient = client || sampleClient;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 pt-6 sm:pt-8 text-slate-800 dark:text-slate-100">
      {/* Back to Clients Link */}
      <div>
        <button
          type="button"
          onClick={() => router.push("/clients")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#D31010] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Clients</span>
        </button>
      </div>

      {/* Header Action Bar (Matching Screenshot 1 & 2) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 relative">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {currentClient.name}
          </h1>

          {/* Three Dots Options Button (Screenshot 1) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowOptionsDropdown(!showOptionsDropdown)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Three Dots Options Popover Menu (Screenshot 1) */}
            <AnimatePresence>
              {showOptionsDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.95 }}
                  className="absolute left-0 top-full mt-1.5 w-44 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl py-1.5 z-50 text-slate-800 dark:text-slate-100 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowOptionsDropdown(false);
                      setIsEditModalOpen(true);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-2.5 cursor-pointer text-slate-800 dark:text-slate-200"
                  >
                    <Pencil className="w-3.5 h-3.5 text-slate-500" />
                    <span>Edit client info</span>
                  </button>

                  <div className="border-t border-slate-100 dark:border-slate-800" />

                  <button
                    type="button"
                    onClick={() => {
                      setShowOptionsDropdown(false);
                      handleDeleteClient();
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center gap-2.5 cursor-pointer text-[#D31010]"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#D31010]" />
                    <span>Delete client</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <a
            href="https://quickbooks.intuit.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>View in QuickBooks</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* + Create New Popover Action Button */}
        <div className="relative w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowCreateDropdown(!showCreateDropdown)}
            className="w-full sm:w-auto bg-[#D31010] hover:bg-[#b00d0d] text-white font-extrabold px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg shadow-red-500/20 transition-all duration-200 cursor-pointer text-xs"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create new</span>
          </button>

          {/* Floating Dropdown Menu (Screenshot 1) */}
          <AnimatePresence>
            {showCreateDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-slate-800 dark:text-slate-100 overflow-hidden"
              >
                {[
                  { label: "Lead", icon: UserCheck },
                  { label: "Estimate", icon: DollarSign },
                  { label: "Job", icon: Briefcase },
                  { label: "Invoice", icon: FileText },
                  { label: "Message", icon: MessageSquare },
                  { label: "Address", icon: MapPin },
                  { label: "Service Plan", icon: CheckSquare },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setShowCreateDropdown(false);
                        toast.success(`Opening ${item.label} form...`);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center gap-3 cursor-pointer"
                    >
                      <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Grid: Left Panel + Right Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT PANEL: Contact & Account Accordions */}
        <div className="lg:col-span-1 space-y-4">
          {/* CONTACT Box */}
          <div className="p-5 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
            <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              CONTACT
            </span>

            <div className="space-y-3">
              {/* Phone & Call/Message Icons */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {currentClient.phone}
                </span>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${currentClient.phone}`}
                    className="p-1.5 text-[#D31010] hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a
                    href={`sms:${currentClient.phone}`}
                    className="p-1.5 text-[#D31010] hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Email */}
              <div>
                <a
                  href={`mailto:${currentClient.email}`}
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#D31010] truncate block"
                >
                  {currentClient.email}
                </a>
              </div>

              {/* Tags Display & + Add Tag Link */}
              <div className="pt-1 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold rounded-lg"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {showTagInput ? (
                  <form onSubmit={handleAddTag} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Tag name"
                      value={newTagText}
                      onChange={(e) => setNewTagText(e.target.value)}
                      className="w-full px-2.5 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1 bg-[#D31010] text-white text-xs font-bold rounded-lg"
                    >
                      Add
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowTagInput(true)}
                    className="text-xs font-bold text-[#D31010] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add tag</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Accordion 1: Addresses */}
          <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setIsAddressesOpen(!isAddressesOpen)}
              className="w-full p-4 text-left flex items-center justify-between font-extrabold text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ChevronRight className={`w-4 h-4 transition-transform ${isAddressesOpen ? "rotate-90" : ""}`} />
                <span>Addresses</span>
              </div>
            </button>
            {isAddressesOpen && (
              <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-400 space-y-1 border-t border-slate-100 dark:border-slate-800 pt-3">
                <p className="font-bold text-slate-900 dark:text-white">Primary Address</p>
                <p>{currentClient.address}</p>
              </div>
            )}
          </div>

          {/* Accordion 2: Additional contacts (0) */}
          <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setIsContactsOpen(!isContactsOpen)}
              className="w-full p-4 text-left flex items-center justify-between font-extrabold text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ChevronRight className={`w-4 h-4 transition-transform ${isContactsOpen ? "rotate-90" : ""}`} />
                <span>Additional contacts (0)</span>
              </div>
              <Plus className="w-4 h-4 text-[#D31010]" />
            </button>
            {isContactsOpen && (
              <div className="px-4 pb-4 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                No additional contacts added yet.
              </div>
            )}
          </div>

          {/* Accordion 3: Payment methods (0) */}
          <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <button
              type="button"
              onClick={() => setIsPaymentsOpen(!isPaymentsOpen)}
              className="w-full p-4 text-left flex items-center justify-between font-extrabold text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ChevronRight className={`w-4 h-4 transition-transform ${isPaymentsOpen ? "rotate-90" : ""}`} />
                <span>Payment methods (0)</span>
              </div>
            </button>
            {isPaymentsOpen && (
              <div className="px-4 pb-4 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                No payment methods saved.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT CONTENT AREA: Metrics Cards + Tabs + Datatable */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Metrics Cards Bar (4 Cards) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Card 1: PAST DUE */}
            <div className="p-4 sm:p-5 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
              <span className="block text-[10px] font-extrabold uppercase text-slate-400">
                PAST DUE
              </span>
              <span className="text-xl sm:text-2xl font-black text-[#D31010]">
                {currentClient.pastDue}
              </span>
            </div>

            {/* Card 2: DUE */}
            <div className="p-4 sm:p-5 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
              <span className="block text-[10px] font-extrabold uppercase text-slate-400">
                DUE
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {currentClient.due}
              </span>
            </div>

            {/* Card 3: TOTAL REVENUE */}
            <div className="p-4 sm:p-5 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
              <span className="block text-[10px] font-extrabold uppercase text-slate-400">
                TOTAL REVENUE
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {currentClient.totalRevenue}
              </span>
            </div>

            {/* Card 4: ESTIMATES */}
            <div className="p-4 sm:p-5 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
              <span className="block text-[10px] font-extrabold uppercase text-slate-400">
                ESTIMATES
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {currentClient.estimatesCount}
              </span>
            </div>
          </div>

          {/* Sub-Tabs Navigation Bar (Screenshot 1 & 2) */}
          <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center gap-1 sm:gap-2 px-4 border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
              {[
                { id: "jobs", label: "Jobs", count: currentClient.jobsCount },
                { id: "custom_fields", label: "Custom fields" },
                { id: "estimates", label: "Estimates", count: currentClient.estimatesCount },
                { id: "invoices", label: "Invoices", count: currentClient.invoicesCount },
                { id: "payments", label: "Payments", count: currentClient.paymentsCount },
                { id: "addresses", label: "Addresses", count: currentClient.addressesCount },
                { id: "leads", label: "Leads", count: currentClient.leadsCount },
              ].map((tab) => {
                const isActive = activeSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveSubTab(tab.id)}
                    className={`py-3.5 px-3 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? "border-[#D31010] text-[#D31010]"
                        : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                          isActive
                            ? "bg-red-100 dark:bg-red-950/60 text-[#D31010]"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Datatable Area */}
            <div className="p-4 space-y-4">
              {/* Search Bar & Rows Selector (Matching Screenshot) */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="relative">
                  <select className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 appearance-none cursor-pointer pr-8">
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* 13-Column Workiz Grid Table (Matching Screenshot) */}
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0E1E31]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-50/80 dark:bg-slate-900/60">
                      <th className="py-3 px-3 border-r border-slate-200 dark:border-slate-800 font-extrabold">
                        Id
                      </th>
                      <th className="py-3 px-3 border-r border-slate-200 dark:border-slate-800 font-extrabold">
                        Job Name
                      </th>
                      <th className="py-3 px-3 border-r border-slate-200 dark:border-slate-800 font-extrabold">
                        Name
                      </th>
                      <th className="py-3 px-3 border-r border-slate-200 dark:border-slate-800 font-extrabold">
                        Address
                      </th>
                      <th className="py-3 px-3 border-r border-slate-200 dark:border-slate-800 font-extrabold">
                        City
                      </th>
                      <th className="py-3 px-3 border-r border-slate-200 dark:border-slate-800 font-extrabold">
                        State
                      </th>
                      <th className="py-3 px-3 border-r border-slate-200 dark:border-slate-800 font-extrabold">
                        Zipcode
                      </th>
                      <th className="py-3 px-3 border-r border-slate-200 dark:border-slate-800 font-extrabold border-b-2 border-slate-700 dark:border-slate-200 text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800/50">
                        Job Date
                      </th>
                      <th className="py-3 px-3 border-r border-slate-200 dark:border-slate-800 font-extrabold">
                        Job Type
                      </th>
                      <th className="py-3 px-3 border-r border-slate-200 dark:border-slate-800 font-extrabold">
                        Status
                      </th>
                      <th className="py-3 px-3 border-r border-slate-200 dark:border-slate-800 font-extrabold">
                        Total
                      </th>
                      <th className="py-3 px-3 border-r border-slate-200 dark:border-slate-800 font-extrabold">
                        Amount Due
                      </th>
                      <th className="py-3 px-3 font-extrabold">
                        Past Due
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(6)].map((_, rIdx) => (
                      <tr
                        key={rIdx}
                        className={`h-11 border-b border-slate-100 dark:border-slate-800/40 ${
                          rIdx % 2 === 1 ? "bg-slate-50/50 dark:bg-slate-900/30" : "bg-white dark:bg-[#0E1E31]"
                        }`}
                      >
                        {[...Array(13)].map((_, cIdx) => (
                          <td
                            key={cIdx}
                            className="px-3 border-r border-dashed border-slate-200 dark:border-slate-800/60 text-center relative"
                          >
                            {rIdx === 2 && cIdx === 4 && (
                              <div className="absolute inset-0 flex items-center justify-center whitespace-nowrap text-xs font-semibold text-slate-500 dark:text-slate-400 z-10">
                                No Records Found
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Footer (Matching Screenshot) */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                <span>Showing 1 to 0 of 0 entries</span>
                <div className="flex items-center gap-2">
                  <button type="button" disabled className="p-1 text-slate-300">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Page 1 of 1
                  </span>
                  <button type="button" disabled className="p-1 text-slate-300">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Client Info Modal (Screenshot 2) */}
      <EditClientModal
        key={currentClient._id || currentClient.id || "edit-modal"}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        clientData={currentClient}
        onUpdated={fetchClientDetail}
        onDelete={handleDeleteClient}
      />
    </div>
  );
}
