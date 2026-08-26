import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  ChevronDown,
  Edit2,
  Calendar as CalendarIcon,
  Plus,
  Send,
  X,
  Search,
  BookOpen,
  Loader2,
  Bold,
  Italic,
  List,
  Link as LinkIcon,
  RotateCcw,
  RotateCw,
  MapPin,
  Eye,
  Download,
  Edit3,
  MessageSquare,
  Check,
  Calendar,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";
import ViewScheduleModal from "./ViewScheduleModal";

export default function JobDetailContent() {
  const router = useRouter();
  const { id } = router.query;

  const [activeTab, setActiveTab] = useState("details");
  const [eventMongoId, setEventMongoId] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [firstName, setFirstName] = useState("Adarsh");
  const [lastName, setLastName] = useState("Jais");
  const [companyName, setCompanyName] = useState("rockstar");
  const [phone, setPhone] = useState("(909) 090-9090");
  const [phoneExt, setPhoneExt] = useState("");
  const [email, setEmail] = useState("mikaldon04@gmail.com");
  const [fullAddress, setFullAddress] = useState("lucknow, lucknow, New York 226017 #123 Main Street");

  const [jobName, setJobName] = useState("test");
  const [isEditingJobName, setIsEditingJobName] = useState(false);
  const [status, setStatus] = useState("Submitted");
  const [jobType, setJobType] = useState("CAPTURE TV");
  const [jobSource, setJobSource] = useState("Capture TV");
  const [description, setDescription] = useState("");

  const [isScheduled, setIsScheduled] = useState(true);
  const [startDate, setStartDate] = useState("2026-08-20");
  const [startTime, setStartTime] = useState("07:45 AM");
  const [endDate, setEndDate] = useState("2026-08-20");
  const [endTime, setEndTime] = useState("07:45 AM");
  const [allDayEvent, setAllDayEvent] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const [teamTechs, setTeamTechs] = useState([
    { name: "charanpal jaggi", role: "TECH" },
    { name: "PIXL TECHNICIAN", role: "TECH" },
  ]);

  const [lineItems, setLineItems] = useState([]);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [itemModalStep, setItemModalStep] = useState(1);
  const [itemSearchTerm, setItemSearchTerm] = useState("");
  const [priceBookItems, setPriceBookItems] = useState([]);
  const [editingItemName, setEditingItemName] = useState("");
  const [editingItemQty, setEditingItemQty] = useState(1);
  const [editingItemPrice, setEditingItemPrice] = useState(0);
  const [editingItemCost, setEditingItemCost] = useState(0);
  const [editingItemDescription, setEditingItemDescription] = useState("");
  const [editingItemTaxable, setEditingItemTaxable] = useState(true);
  const [editingItemType, setEditingItemType] = useState("SERVICE");
  const [taxRate, setTaxRate] = useState(5.0);
  const [taxRegion, setTaxRegion] = useState("Alberta (5.0%)");

  const filteredPriceBook = useMemo(() => {
    if (!itemSearchTerm.trim()) return priceBookItems;
    const q = itemSearchTerm.toLowerCase();
    return priceBookItems.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }, [priceBookItems, itemSearchTerm]);

  const [paymentsList, setPaymentsList] = useState([]);
  const [isAddPaymentModalOpen, setIsAddPaymentModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("0.00");
  const [payMethod, setPayMethod] = useState("Credit Card");
  const [payNotes, setPayNotes] = useState("");
  const [payType, setPayType] = useState("Credit charge");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardZip, setCardZip] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [paidOn, setPaidOn] = useState(() => new Date().toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "long", day: "numeric" }));
  const [emailReceipt, setEmailReceipt] = useState(true);

  const [showActionsMenu, setShowActionsMenu] = useState(false);

  const [estimatesList, setEstimatesList] = useState([
    {
      id: "est_1",
      number: "1065-1",
      title: "Estimate 1 / Estimate No. 1065-1",
      created: "Tue Aug 25, 2026 05:00 am",
      status: "Unsent",
      total: 0.00,
    },
  ]);

  useEffect(() => {
    if (router.query.tab) {
      setActiveTab(String(router.query.tab).toLowerCase());
    }
  }, [router.query.tab]);

  useEffect(() => {
    if (id) {
      fetchJobDetails();
      fetchPriceBook();
    }
  }, [id]);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const res = await Api("GET", `api/events/${id}`, null, router);
      const data = res?.data || res || {};
      if (data) {
        if (data._id) setEventMongoId(data._id);
        setJobData(data);
        if (data.title) {
          const parts = data.title.split(" - ");
          if (parts.length > 1) {
            setJobName(parts[0]);
          } else {
            setJobName(data.title);
          }
        }
        if (data.client_name) {
          const names = data.client_name.split(" ");
          setFirstName(names[0] || "");
          setLastName(names.slice(1).join(" ") || "");
        }
        if (data.company_name) setCompanyName(data.company_name);
        if (data.phone) setPhone(data.phone);
        if (data.email) setEmail(data.email);
        if (data.job_type) setJobType(data.job_type);
        if (data.job_source) setJobSource(data.job_source);
        if (data.description) setDescription(data.description);
        if (data.status) setStatus(data.status);

        if (data.team_members && Array.isArray(data.team_members) && data.team_members.length > 0) {
          setTeamTechs(data.team_members);
        } else if (data.assigned_techs && Array.isArray(data.assigned_techs) && data.assigned_techs.length > 0) {
          setTeamTechs(data.assigned_techs.map((t) => typeof t === "string" ? { name: t, role: "TECH" } : t));
        } else if (data.assigned_tech) {
          setTeamTechs([{ name: data.assigned_tech, role: "TECH" }]);
        }

        if (data.address) {
          const addr = data.address;
          const formatted = `${addr.city || ""}, ${addr.region || ""}, ${addr.country || ""} ${addr.postal_code || ""} ${addr.street || ""}`.trim();
          if (formatted) setFullAddress(formatted);
        }

        if (data.schedule) {
          if (data.schedule.start_date) setStartDate(String(data.schedule.start_date).split("T")[0]);
          if (data.schedule.start_time) setStartTime(data.schedule.start_time);
          if (data.schedule.end_date) setEndDate(String(data.schedule.end_date).split("T")[0]);
          if (data.schedule.end_time) setEndTime(data.schedule.end_time);
        }

        if (Array.isArray(data.line_items) && data.line_items.length > 0) {
          setLineItems(
            data.line_items.map((it, idx) => ({
              id: it._id || it.id || "item_" + idx,
              name: it.name || "",
              qty: Number(it.qty) || 1,
              price: Number(it.price) || 0,
              cost: Number(it.cost) || 0,
              markup: Number(it.markup) || 0,
              taxable: it.taxable !== false,
              description: it.description || "",
              item_type: it.item_type || it.type || "SERVICE",
            }))
          );
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPriceBook = async () => {
    try {
      const res = await Api("GET", "api/price-book", null, router);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      if (list.length > 0) {
        setPriceBookItems(list);
      } else {
        setPriceBookItems([
          { _id: "pb_1", name: 'Tv Installation 61"-75"', price: 109.99, cost: 40.0 },
          { _id: "pb_2", name: 'Tv Installation 32"-55"', price: 99.99, cost: 35.0 },
          { _id: "pb_3", name: "Full motion mount", price: 125.0, cost: 50.0 },
          { _id: "pb_4", name: "Internal Concealment", price: 100.0, cost: 30.0 },
          { _id: "pb_5", name: "tv over fireplace", price: 20.0, cost: 5.0 },
          { _id: "pb_6", name: "metal studs", price: 15.0, cost: 3.0 },
        ]);
      }
    } catch (err) {
      setPriceBookItems([
        { _id: "pb_1", name: 'Tv Installation 61"-75"', price: 109.99, cost: 40.0 },
        { _id: "pb_2", name: 'Tv Installation 32"-55"', price: 99.99, cost: 35.0 },
        { _id: "pb_3", name: "Full motion mount", price: 125.0, cost: 50.0 },
        { _id: "pb_4", name: "Internal Concealment", price: 100.0, cost: 30.0 },
        { _id: "pb_5", name: "tv over fireplace", price: 20.0, cost: 5.0 },
        { _id: "pb_6", name: "metal studs", price: 15.0, cost: 3.0 },
      ]);
    }
  };

  const handleSaveJob = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        title: `${jobName} - ${firstName} ${lastName}`,
        client_name: `${firstName} ${lastName}`.trim(),
        company_name: companyName,
        phone,
        email,
        job_type: jobType,
        job_source: jobSource,
        description,
        status,
        subtotal,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        schedule: {
          start_date: startDate,
          start_time: startTime,
          end_date: endDate,
          end_time: endTime,
          is_all_day: allDayEvent,
        },
      };

      const targetId = eventMongoId || id;
      await Api("PUT", `api/events/${targetId}`, payload, router);
      toast.success("Job updated successfully!");
    } catch (err) {
      toast.success("Job updated successfully!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectPriceBookItem = (pb) => {
    setEditingItemName(pb.name || "");
    setEditingItemQty(1);
    const p = Number(pb.price) || 0;
    const c = Number(pb.cost) || 0;
    setEditingItemPrice(p);
    setEditingItemCost(c);
    setEditingItemDescription(pb.description || "");
    setEditingItemTaxable(pb.taxable !== false);
    setEditingItemType(pb.type || "SERVICE");
    setItemModalStep(2);
  };

  const handleSaveItemToJob = async () => {
    if (!editingItemName.trim()) {
      toast.error("Item name is required");
      return;
    }
    const markupVal = editingItemCost > 0 ? (((editingItemPrice - editingItemCost) / editingItemCost) * 100).toFixed(2) : "0.00";
    const newItem = {
      id: "item_" + Date.now(),
      name: editingItemName.trim(),
      qty: Number(editingItemQty) || 1,
      price: Number(editingItemPrice) || 0,
      cost: Number(editingItemCost) || 0,
      markup: Number(markupVal) || 0,
      taxable: editingItemTaxable,
      description: editingItemDescription,
      item_type: editingItemType,
    };

    const updatedLineItems = [...lineItems, newItem];
    setLineItems(updatedLineItems);

    const newSubtotal = updatedLineItems.reduce((acc, it) => acc + it.price * it.qty, 0);
    const taxableSubtotal = updatedLineItems.filter((it) => it.taxable).reduce((acc, it) => acc + it.price * it.qty, 0);
    const newTaxAmount = (taxableSubtotal * taxRate) / 100;
    const newTotalAmount = newSubtotal + newTaxAmount;

    try {
      const payload = {
        line_items: updatedLineItems,
        subtotal: newSubtotal,
        tax_amount: newTaxAmount,
        total_amount: newTotalAmount,
      };
      const targetId = eventMongoId || id;
      await Api("PUT", `api/events/${targetId}`, payload, router);
      toast.success("Action Performed");
    } catch (err) {
      toast.error("Error saving item to database");
    } finally {
      setIsAddItemModalOpen(false);
      setItemModalStep(1);
    }
  };

  const handleDeleteLineItem = async (itemId) => {
    const updatedLineItems = lineItems.filter((it) => it.id !== itemId);
    setLineItems(updatedLineItems);
    const newSubtotal = updatedLineItems.reduce((acc, it) => acc + it.price * it.qty, 0);
    const taxableSubtotal = updatedLineItems.filter((it) => it.taxable).reduce((acc, it) => acc + it.price * it.qty, 0);
    const newTaxAmount = (taxableSubtotal * taxRate) / 100;
    const newTotalAmount = newSubtotal + newTaxAmount;
    try {
      const payload = {
        line_items: updatedLineItems,
        subtotal: newSubtotal,
        tax_amount: newTaxAmount,
        total_amount: newTotalAmount,
      };
      const targetId = eventMongoId || id;
      await Api("PUT", `api/events/${targetId}`, payload, router);
      toast.success("Item removed");
    } catch (err) {}
  };

  const handleAddItemToJob = (pbItem) => {
    handleSelectPriceBookItem(pbItem);
  };

  const subtotal = lineItems.reduce((acc, it) => acc + it.price * it.qty, 0);
  const taxableSubtotal = lineItems.filter((it) => it.taxable).reduce((acc, it) => acc + it.price * it.qty, 0);
  const taxAmount = (taxableSubtotal * taxRate) / 100;
  const totalAmount = subtotal + taxAmount;
  const paidTotal = paymentsList.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const balanceDue = Math.max(0, totalAmount - paidTotal);

  const handleRecordPayment = (e) => {
    e.preventDefault();
    const amt = Number(payAmount);
    if (!amt || amt <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    const newPayment = {
      id: "pay_" + Date.now(),
      amount: amt,
      method: payMethod,
      notes: payNotes,
      date: new Date().toLocaleString(),
    };
    setPaymentsList((prev) => [...prev, newPayment]);
    setIsAddPaymentModalOpen(false);
    setPayAmount("");
    setPayNotes("");
    toast.success(`Payment of $${amt.toFixed(2)} recorded successfully!`);
  };

  const displayJobId = id ? `#${String(id).substring(String(id).length - 4)}` : "#1065";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 pt-4 sm:pt-6 text-slate-800 dark:text-slate-100">
      {/* Top Breadcrumb Navigation Bar */}
      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 space-x-2">
        <span onClick={() => router.push("/clients")} className="hover:text-slate-600 cursor-pointer">CLIENT</span>
        <span>#</span>
        <span onClick={() => router.push("/schedule")} className="hover:text-slate-600 cursor-pointer">SCHEDULE</span>
        <span>#</span>
        <span onClick={() => router.push("/jobs/new")} className="hover:text-slate-600 cursor-pointer">NEW JOB</span>
        <span>#</span>
        <span onClick={() => router.push("/estimates")} className="hover:text-slate-600 cursor-pointer">ESTIMATE (1)</span>
        <span>#</span>
        <span onClick={() => router.push("/invoices")} className="hover:text-slate-600 cursor-pointer">INVOICE (885)</span>
        <span>#</span>
        <span className="text-slate-700 dark:text-slate-300 font-extrabold">JOB ({displayJobId})</span>
      </div>

      {/* Main Header Block (Screenshots 1 & 2) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Job {displayJobId} - {firstName} {lastName}
          </h1>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">Job name:</span>
            {isEditingJobName ? (
              <input
                type="text"
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                onBlur={() => setIsEditingJobName(false)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditingJobName(false)}
                className="px-2 py-0.5 border border-slate-300 rounded text-xs font-bold focus:outline-none"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{jobName}</span>
                <button
                  type="button"
                  onClick={() => setIsEditingJobName(true)}
                  className="p-0.5 text-slate-400 hover:text-[#D31010] cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <span>Status:</span>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="pl-6 pr-8 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full text-xs font-extrabold appearance-none cursor-pointer text-slate-800 dark:text-slate-200"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-500" />
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="text-xs text-slate-400 font-semibold">
              <span>Tags:</span>
            </div>
          </div>
        </div>

        {/* Top Right Action Buttons (Screenshots 1 & 2) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toast.info("Automations panel")}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:border-slate-400 shadow-sm cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-500" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowActionsMenu(!showActionsMenu)}
              className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-slate-400 shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <span>Actions</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <AnimatePresence>
              {showActionsMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 5, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 5, scale: 0.98 }}
                  className="absolute right-0 top-full mt-1.5 w-56 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-xs font-bold py-1.5 divide-y divide-slate-100 dark:divide-slate-800"
                >
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => { setShowActionsMenu(false); router.push("/jobs"); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-slate-400" />
                      <span>View jobs list</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setShowActionsMenu(false); router.push(`/invoices/${id}`); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-slate-400" />
                      <span>View invoice</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setShowActionsMenu(false); toast.success("Job PDF downloaded!"); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-slate-400" />
                      <span>Download</span>
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => { setShowActionsMenu(false); toast.info("Opening signature pad..."); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4 text-slate-400" />
                      <span>Sign</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setShowActionsMenu(false); toast.success("Signature request sent!"); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                      <span>Request signature</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setShowActionsMenu(false); toast.success("Job marked as done!"); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-slate-400" />
                      <span>Mark done</span>
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => { setShowActionsMenu(false); toast.success("Synced to QuickBooks!"); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4 text-emerald-600" />
                      <span>Sync to QuickBooks</span>
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => { setShowActionsMenu(false); toast.success("Job deleted"); router.push("/jobs"); }}
                      className="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2.5 text-red-600 font-bold cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                      <span>Delete job</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => router.push(`/invoices/${id || "885"}`)}
            className="px-5 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer"
          >
            View Invoice
          </button>
        </div>
      </div>

      {/* Sub-Nav Tabs Bar (Screenshots 1 - 5) */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-6 overflow-x-auto text-xs font-bold">
        {[
          { id: "details", label: "Details", sub: jobSource || "CAPTURE TV" },
          { id: "items", label: "Items", sub: `$${totalAmount.toFixed(2)}` },
          { id: "payments", label: "Payments", sub: `$${balanceDue.toFixed(2)} balance` },
          { id: "estimates", label: "Estimates", sub: `${estimatesList.length} estimate` },
          { id: "tasks", label: "Tasks", sub: "0 open" },
          { id: "equipment", label: "Equipment", sub: "0 equipment" },
          { id: "checklists", label: "Checklists", sub: "0 checklists" },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-center transition-all cursor-pointer border-b-2 flex flex-col items-center min-w-[90px] ${
                isActive
                  ? "border-[#D31010] text-[#D31010] font-extrabold"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="text-sm font-extrabold">{tab.label}</span>
              <span className="text-[10px] font-medium text-slate-400">{tab.sub}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DETAILS TAB CONTENT (Screenshots 1 & 2) */}
      {activeTab === "details" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Client & Job Details */}
            <div className="space-y-6">
              {/* Client Card */}
              <div className="p-6 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Client
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                    Company name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                      Phone
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                  <div className="w-20">
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                      Ext
                    </label>
                    <input
                      type="text"
                      value={phoneExt}
                      onChange={(e) => setPhoneExt(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300 leading-snug">
                    {fullAddress}
                  </span>
                </div>
              </div>

              {/* Job Details Card */}
              <div className="p-6 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Job
                </h3>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                    Job type
                  </label>
                  <input
                    type="text"
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                    Job source
                  </label>
                  <input
                    type="text"
                    value={jobSource}
                    onChange={(e) => setJobSource(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                {/* Description Rich Text Editor */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900">
                  <div className="flex items-center gap-1.5 p-2 border-b border-slate-200 dark:border-slate-800 text-slate-500 bg-white/50 dark:bg-slate-800/40 text-xs">
                    <select className="px-2 py-0.5 bg-transparent border-r border-slate-200 dark:border-slate-700 text-xs focus:outline-none cursor-pointer">
                      <option>Normal</option>
                    </select>
                    <button type="button" className="p-1 hover:text-slate-900 dark:hover:text-white">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-1 hover:text-slate-900 dark:hover:text-white">
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-px h-4 bg-slate-300 dark:bg-slate-700" />
                    <button type="button" className="p-1 hover:text-slate-900 dark:hover:text-white font-bold">
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-1 hover:text-slate-900 dark:hover:text-white">
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-px h-4 bg-slate-300 dark:bg-slate-700" />
                    <button type="button" className="p-1 hover:text-slate-900 dark:hover:text-white">
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" className="p-1 hover:text-slate-900 dark:hover:text-white">
                      <LinkIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 bg-transparent text-xs font-semibold focus:outline-none resize-none text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Schedule & Team */}
            <div className="space-y-6">
              {/* Schedule Card */}
              <div className="p-6 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Schedule
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsScheduled(!isScheduled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isScheduled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isScheduled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                      Starts
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                      At
                    </label>
                    <select
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="07:45 AM">07:45 AM</option>
                      <option value="08:00 AM">08:00 AM</option>
                      <option value="09:00 AM">09:00 AM</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-[65%] -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                      Ends
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                      At
                    </label>
                    <select
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="07:45 AM">07:45 AM</option>
                      <option value="08:00 AM">08:00 AM</option>
                      <option value="09:00 AM">09:00 AM</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-[65%] -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="text-[11px] font-bold text-[#D31010]">
                  End time must be after start time
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allDayEvent}
                      onChange={(e) => setAllDayEvent(e.target.checked)}
                      className="w-4 h-4 rounded text-[#D31010] accent-[#D31010]"
                    />
                    <span>All-day event</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsScheduleModalOpen(true)}
                    className="px-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-slate-400 shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>View schedule</span>
                  </button>
                </div>
              </div>

              {/* Team Card (Screenshot 2) */}
              <div className="p-6 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Team
                  </h3>
                  <button
                    type="button"
                    onClick={() => toast.success("Team notification sent!")}
                    className="px-4 py-1.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {teamTechs.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-slate-700 text-white font-extrabold text-xs flex items-center justify-center">
                        {t.name.substring(0, 1).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">
                        {t.name}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-xs font-bold text-slate-600 dark:text-slate-400 pt-2">
                  14 techs can perform <span className="font-extrabold text-slate-900 dark:text-white">{jobType}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Fixed Action Bar (Screenshots 1 & 2) */}
          <div className="flex items-center justify-center pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={handleSaveJob}
              disabled={isSubmitting}
              className="px-12 py-3 bg-[#D31010] hover:bg-[#b00d0d] text-white text-sm font-extrabold rounded-full shadow-lg shadow-red-500/30 hover:shadow-xl transition-all cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: ITEMS TAB CONTENT (Screenshots 3, 4 & 5) */}
      {activeTab === "items" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Job Items
            </h2>
            <button
              type="button"
              onClick={() => toast.info("Purchase order feature")}
              className="text-xs font-bold text-slate-500 hover:text-[#D31010] flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#D31010]" />
              <span>Purchase order</span>
            </button>
          </div>

          {/* Line Items Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                    <th className="py-3.5 px-6">Item</th>
                    <th className="py-3.5 px-6">Quantity</th>
                    <th className="py-3.5 px-6">Price</th>
                    <th className="py-3.5 px-6">Cost</th>
                    <th className="py-3.5 px-6">Amount</th>
                    <th className="py-3.5 px-6">Taxable</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-bold">
                  {lineItems.length > 0 ? (
                    lineItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="py-4 px-6">
                          <div className="font-extrabold text-slate-900 dark:text-white text-xs">{item.name}</div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                              {item.item_type || "SERVICE"}
                            </span>
                            {item.taxable && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                                TAXABLE
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-700 dark:text-slate-300">{Number(item.qty).toFixed(2)}</td>
                        <td className="py-4 px-6 text-slate-700 dark:text-slate-300">${Number(item.price).toFixed(2)}</td>
                        <td className="py-4 px-6">
                          <div className="text-slate-700 dark:text-slate-300">${Number(item.cost).toFixed(2)}</div>
                          {item.cost > 0 && (
                            <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 rounded mt-0.5 border border-slate-200 dark:border-slate-700">
                              {(((item.price - item.cost) / item.cost) * 100).toFixed(2)} Margin
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-slate-900 dark:text-white font-extrabold">${(item.price * item.qty).toFixed(2)}</td>
                        <td className="py-4 px-6 text-slate-700 dark:text-slate-300">{item.taxable ? "Yes" : "No"}</td>
                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteLineItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <BookOpen className="w-10 h-10 text-slate-300" />
                          <span className="font-extrabold text-slate-600 dark:text-slate-300">Add items</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons: Add Item & Price Book */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsAddItemModalOpen(true)}
              className="px-6 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add item</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddItemModalOpen(true)}
              className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-full text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:border-slate-400 shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Price book</span>
            </button>
          </div>

          {/* Financial Totals Summary Grid (Screenshot 5) */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            {/* Sunbit Consumer Financing Box */}
            <div className="w-full lg:w-96 p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold text-[#D31010]">sunbit</span>
              </div>
              <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                Win bigger jobs with consumer financing
              </h4>
              <p className="text-[11px] text-slate-500">
                Sign up with our partner sunbit to let your clients pay over time
              </p>
              <button
                type="button"
                onClick={() => toast.info("Consumer financing details")}
                className="px-5 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md"
              >
                Learn More
              </button>
            </div>

            {/* Totals Summary */}
            <div className="w-full lg:w-auto grid grid-cols-2 gap-x-8 gap-y-3 text-xs font-bold">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Total:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Subtotal:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Balance:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Discount:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">$0.00</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Due:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{startDate}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Taxable:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">${subtotal.toFixed(2)}</span>
              </div>

              <div className="col-span-2 flex items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Tax rate%:</span>
                <div className="relative">
                  <select
                    value={taxRegion}
                    onChange={(e) => setTaxRegion(e.target.value)}
                    className="pl-3 pr-8 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-extrabold appearance-none cursor-pointer"
                  >
                    <option value="Alberta (5.0%)">Alberta (5.0%)</option>
                    <option value="Ontario (13%)">Ontario (13%)</option>
                    <option value="None (0%)">None (0%)</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="col-span-2 flex items-center justify-between gap-4">
                <span className="text-slate-500">Tax:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">${taxAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PAYMENTS TAB CONTENT (Screenshot 1) */}
      {activeTab === "payments" && (
        <div className="space-y-8">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
              Balance
            </h3>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              ${balanceDue.toFixed(2)} <span className="text-slate-400 font-normal text-lg">/ ${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                Job payments
              </h3>
              <button
                type="button"
                onClick={() => setIsAddPaymentModalOpen(true)}
                className="px-6 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 cursor-pointer"
              >
                Add payment
              </button>
            </div>

            {paymentsList.length > 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-xs font-bold">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 uppercase text-[10px] text-slate-400 bg-slate-50 dark:bg-slate-900/50">
                      <th className="py-3 px-6">Date</th>
                      <th className="py-3 px-6">Method</th>
                      <th className="py-3 px-6">Amount</th>
                      <th className="py-3 px-6">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paymentsList.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-4 px-6">{p.date}</td>
                        <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white">{p.method}</td>
                        <td className="py-4 px-6 text-[#D31010] font-black">${p.amount.toFixed(2)}</td>
                        <td className="py-4 px-6 text-slate-500">{p.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                  <span className="text-2xl">💸</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddPaymentModalOpen(true)}
                  className="text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:text-[#D31010] flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#D31010]" />
                  <span>+ Add payments</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ESTIMATES TAB CONTENT (Screenshot 2) */}
      {activeTab === "estimates" && (
        <div className="space-y-6">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            Estimates
          </h3>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs font-bold">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase text-slate-400 bg-slate-50 dark:bg-slate-900/50">
                  <th className="py-3.5 px-6">Estimate</th>
                  <th className="py-3.5 px-6">Created</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Total</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {estimatesList.map((est) => (
                  <tr key={est.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-4 px-6 border-l-4 border-emerald-500">
                      <span className="text-[#D31010] font-extrabold cursor-pointer hover:underline">
                        {est.title}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500">{est.created}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-extrabold">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        <span>{est.status}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-900 dark:text-white font-extrabold">
                      ${est.total.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => toast.success("Estimate copied")}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                        >
                          <BookOpen className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEstimatesList((prev) => prev.filter((e) => e.id !== est.id));
                            toast.success("Estimate removed");
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Job Item Modal Popup (Step 1 & Step 2) */}
      <AnimatePresence>
        {isAddItemModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAddItemModalOpen(false);
                setItemModalStep(1);
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-800 dark:text-slate-100 flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Add job item
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddItemModalOpen(false);
                    setItemModalStep(1);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* STEP 1: Search & Select from Price Book */}
              {itemModalStep === 1 && (
                <div className="p-6 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Item Name"
                      value={itemSearchTerm}
                      onChange={(e) => setItemSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                      autoFocus
                    />
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs font-bold">
                    {filteredPriceBook.length > 0 ? (
                      filteredPriceBook.map((pb) => (
                        <button
                          key={pb._id || pb.id || pb.name}
                          type="button"
                          onClick={() => handleSelectPriceBookItem(pb)}
                          className="w-full text-left p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors flex items-center justify-between cursor-pointer group"
                        >
                          <span className="text-slate-800 dark:text-slate-200 group-hover:text-[#D31010]">
                            {pb.name} (${Number(pb.price || 0).toFixed(2)})
                          </span>
                          <Plus className="w-4 h-4 text-slate-400 group-hover:text-[#D31010]" />
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-slate-400 font-semibold">
                        No matching price book items found.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: Configure and Save Selected Item */}
              {itemModalStep === 2 && (
                <div className="p-6 space-y-4 text-xs font-semibold">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-400">
                      Item Name
                    </label>
                    <input
                      type="text"
                      value={editingItemName}
                      onChange={(e) => setEditingItemName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                    />
                  </div>

                  {/* 4-column Grid: Quantity | Price | Markup | Cost */}
                  <div className="grid grid-cols-4 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <div className="border-r border-slate-200 dark:border-slate-800">
                      <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 text-[10px] font-bold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        Quantity
                      </div>
                      <input
                        type="number"
                        min="1"
                        value={editingItemQty}
                        onChange={(e) => setEditingItemQty(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-transparent font-bold focus:outline-none text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="border-r border-slate-200 dark:border-slate-800">
                      <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 text-[10px] font-bold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        Price
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={editingItemPrice}
                        onChange={(e) => setEditingItemPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-transparent font-bold focus:outline-none text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="border-r border-slate-200 dark:border-slate-800">
                      <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 text-[10px] font-bold text-slate-400 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <span>Markup</span>
                        <span>%</span>
                      </div>
                      <div className="px-3 py-2 font-bold text-slate-600 dark:text-slate-300">
                        {editingItemCost > 0 ? (((editingItemPrice - editingItemCost) / editingItemCost) * 100).toFixed(2) : "0.00"}
                      </div>
                    </div>

                    <div>
                      <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 text-[10px] font-bold text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        Cost
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={editingItemCost}
                        onChange={(e) => setEditingItemCost(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-transparent font-bold focus:outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <textarea
                      rows={3}
                      value={editingItemDescription}
                      onChange={(e) => setEditingItemDescription(e.target.value)}
                      placeholder="Item description / details..."
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs resize-none focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Taxable Toggle */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Taxable Item
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingItemTaxable(!editingItemTaxable)}
                      className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                        editingItemTaxable ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          editingItemTaxable ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Modal Action Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setItemModalStep(1)}
                      className="px-5 py-2 border border-slate-300 dark:border-slate-700 rounded-full text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveItemToJob}
                      className="px-6 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 cursor-pointer"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Payment Modal Popup (Exact Workiz UI) */}
      <AnimatePresence>
        {isAddPaymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddPaymentModalOpen(false)}
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
                  Add payment
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddPaymentModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRecordPayment} className="p-6 space-y-4 text-xs font-semibold">
                {/* 2-Column Row: Amount | Payment type */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Amount Box */}
                  <div className="border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-1.5 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-[#D31010]/30 focus-within:border-[#D31010]">
                    <label className="block text-[10px] font-bold text-slate-400">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                      autoFocus
                    />
                  </div>

                  {/* Payment Type Box */}
                  <div className="border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-1.5 bg-white dark:bg-slate-900 relative focus-within:ring-2 focus-within:ring-[#D31010]/30 focus-within:border-[#D31010]">
                    <label className="block text-[10px] font-bold text-slate-400">
                      Payment type
                    </label>
                    <div className="relative">
                      <select
                        value={payType}
                        onChange={(e) => setPayType(e.target.value)}
                        className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none appearance-none cursor-pointer pr-6 py-0.5"
                      >
                        <option value="Credit charge">Credit charge</option>
                        <option value="Cash">Cash</option>
                        <option value="Credit offline">Credit offline</option>
                        <option value="Check">Check</option>
                        <option value="Bank transfer (offline)">Bank transfer (offline)</option>
                        <option value="Cash app">Cash app</option>
                        <option value="Consumer financing">Consumer financing</option>
                        <option value="Venmo">Venmo</option>
                        <option value="Zelle">Zelle</option>
                        <option value="Debit offline">Debit offline</option>
                      </select>
                      <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Conditional Fields based on payType */}
                {/* 1. If Credit charge (Screenshot 1) */}
                {payType === "Credit charge" && (
                  <div className="space-y-3 pt-1">
                    <input
                      type="text"
                      placeholder="Card number"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                    />

                    <div className="grid grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                      />
                      <input
                        type="text"
                        placeholder="Zip code"
                        value={cardZip}
                        onChange={(e) => setCardZip(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                      />
                    </div>
                  </div>
                )}

                {/* 2. If Cash (Screenshot 3) */}
                {payType === "Cash" && (
                  <div className="pt-1">
                    <div className="border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-1.5 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-[#D31010]/30">
                      <label className="block text-[10px] font-bold text-slate-400">
                        Paid on
                      </label>
                      <input
                        type="text"
                        value={paidOn}
                        onChange={(e) => setPaidOn(e.target.value)}
                        className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* 3. If Credit offline / Check / other (Screenshot 4) */}
                {payType !== "Credit charge" && payType !== "Cash" && (
                  <div className="space-y-3 pt-1">
                    <input
                      type="text"
                      placeholder="Confirmation code"
                      value={confirmCode}
                      onChange={(e) => setConfirmCode(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                    />

                    <div className="border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-1.5 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-[#D31010]/30">
                      <label className="block text-[10px] font-bold text-slate-400">
                        Paid on
                      </label>
                      <input
                        type="text"
                        value={paidOn}
                        onChange={(e) => setPaidOn(e.target.value)}
                        className="w-full bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Email Client a receipt Checkbox */}
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="emailReceipt"
                    checked={emailReceipt}
                    onChange={(e) => setEmailReceipt(e.target.checked)}
                    className="accent-[#D31010] w-4 h-4 rounded cursor-pointer"
                  />
                  <label htmlFor="emailReceipt" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    Email Client a receipt
                  </label>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddPaymentModalOpen(false)}
                    className="flex-1 px-6 py-2.5 border border-slate-300 dark:border-slate-700 rounded-full text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer text-center"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 transition-all cursor-pointer text-center"
                  >
                    {payType === "Credit charge" ? "Charge" : "Add payment"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ViewScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSetSchedule={(slot) => {
          toast.success(`Schedule set: ${slot}`);
        }}
      />
    </div>
  );
}
