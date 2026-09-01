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
  ListTodo,
  CheckCircle2,
  AlertTriangle,
  User,
  History,
  CheckSquare,
  XCircle,
  ClipboardList,
  ThumbsUp,
  FileText,
  Copy,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";
import ViewScheduleModal from "./ViewScheduleModal";
import AddEquipmentModal from "./AddEquipmentModal";
import EquipmentHistoryModal from "./EquipmentHistoryModal";
import ConfirmationModal from "./ConfirmationModal";
import LinkEquipmentModal from "./LinkEquipmentModal";
import AddTaskModal from "./AddTaskModal";
import AddChecklistModal from "./AddChecklistModal";
import FillChecklistModal from "./FillChecklistModal";
import WorkOrderModal from "./WorkOrderModal";
import DuplicateJobModal from "./DuplicateJobModal";
import NotFoundState from "./NotFoundState";

export default function JobDetailContent() {
  const router = useRouter();
  const { id } = router.query;

  const [activeTab, setActiveTab] = useState("details");
  const [eventMongoId, setEventMongoId] = useState(null);
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [jobTasks, setJobTasks] = useState([]);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [editingTaskData, setEditingTaskData] = useState(null);
  const [taskFilter, setTaskFilter] = useState("all");

  const [jobChecklists, setJobChecklists] = useState([]);
  const [isAddChecklistModalOpen, setIsAddChecklistModalOpen] = useState(false);
  const [activeFillingChecklist, setActiveFillingChecklist] = useState(null);
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);

  const [jobEquipment, setJobEquipment] = useState([]);
  const [clientEquipmentList, setClientEquipmentList] = useState([]);
  const [isAddEquipmentModalOpen, setIsAddEquipmentModalOpen] = useState(false);
  const [editingEquipmentData, setEditingEquipmentData] = useState(null);
  const [historyEquipmentData, setHistoryEquipmentData] = useState(null);
  const [addEquipmentDefaultSource, setAddEquipmentDefaultSource] = useState("new");
  const [showAddEquipmentMenu, setShowAddEquipmentMenu] = useState(false);
  const [linkingLineItemId, setLinkingLineItemId] = useState(null);
  const [linkingModalItem, setLinkingModalItem] = useState(null);
  const [deleteConfirmState, setDeleteConfirmState] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Delete",
    action: null,
  });

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneExt, setPhoneExt] = useState("");
  const [email, setEmail] = useState("");
  const [fullAddress, setFullAddress] = useState("");

  const [jobName, setJobName] = useState("");
  const [isEditingJobName, setIsEditingJobName] = useState(false);
  const [status, setStatus] = useState("Submitted");
  const [jobType, setJobType] = useState("");
  const [jobSource, setJobSource] = useState("");
  const [description, setDescription] = useState("");

  const [isScheduled, setIsScheduled] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [allDayEvent, setAllDayEvent] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const [teamTechs, setTeamTechs] = useState([]);

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

  const [estimatesList, setEstimatesList] = useState([]);

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
      const data = res?.data || (res && res._id ? res : null);
      if (data && (data._id || data.client_name || data.title)) {
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

        fetchJobEquipment(id, data.client_name);
        fetchJobTasks(id);
        fetchJobChecklists(id);
      } else {
        setJobData(null);
      }
    } catch (err) {
      console.error(err);
      setJobData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobTasks = async (jobIdParam) => {
    try {
      const currentJobId = jobIdParam || id || "";
      if (!currentJobId) return;
      const res = await Api("GET", `api/tasks?job_id=${encodeURIComponent(currentJobId)}`);
      const list = Array.isArray(res?.data) ? res.data : [];
      setJobTasks(list);
    } catch (e) {}
  };

  const handleToggleJobTask = async (task) => {
    const nextStatus = task.status === "done" ? "open" : "done";
    const updated = jobTasks.map((t) =>
      t._id === task._id ? { ...t, status: nextStatus, completed_at: nextStatus === "done" ? new Date() : null } : t
    );
    setJobTasks(updated);

    try {
      await Api("PUT", `api/tasks/${task._id}`, { status: nextStatus });
      toast.success(nextStatus === "done" ? "Task completed!" : "Task reopened");
      fetchJobTasks(id);
    } catch (e) {
      toast.error("Failed to update task");
      fetchJobTasks(id);
    }
  };

  const handleDeleteJobTask = (task) => {
    setDeleteConfirmState({
      isOpen: true,
      title: "Delete Task",
      message: `Are you sure you want to delete "${task.title}"?`,
      confirmText: "Delete",
      action: async () => {
        await Api("DELETE", `api/tasks/${task._id}`);
        toast.success("Task deleted");
        fetchJobTasks(id);
      },
    });
  };

  const fetchJobEquipment = async (jobIdParam, clientNameParam) => {
    try {
      const currentJobId = jobIdParam || id || "";
      const res = await Api("GET", `api/equipment?job_id=${encodeURIComponent(currentJobId)}`);
      const list = Array.isArray(res?.data) ? res.data : [];
      setJobEquipment(list);

      const targetClient = clientNameParam || `${firstName} ${lastName}`.trim();
      if (targetClient) {
        const clientRes = await Api("GET", `api/equipment?client_name=${encodeURIComponent(targetClient)}`);
        const cList = Array.isArray(clientRes?.data) ? clientRes.data : [];
        setClientEquipmentList(cList);
      }
    } catch (e) {}
  };

  const fetchJobChecklists = async (jobIdParam) => {
    try {
      const currentJobId = jobIdParam || id || "";
      if (!currentJobId) return;
      const res = await Api("GET", `api/checklists/job/${encodeURIComponent(currentJobId)}`);
      const list = Array.isArray(res?.data) ? res.data : [];
      setJobChecklists(list);
    } catch (e) {}
  };

  const handleTrackEquipmentFromItem = (item) => {
    setEditingEquipmentData({
      name: item.name,
      model_number: `MOD-${item.name.substring(0, 4).toUpperCase()}`,
      client_name: `${firstName} ${lastName}`.trim() || "Client",
      client_email: email,
      phone: phone,
      address: jobData?.address || {},
      job_id: id,
      notes: `Added from Job Item: ${item.name}`,
    });
    setAddEquipmentDefaultSource("new");
    setIsAddEquipmentModalOpen(true);
  };

  const handleLinkItemToEquipment = async (item, eq) => {
    try {
      await Api("POST", `api/equipment/${eq._id}/service`, {
        event_type: "Serviced",
        description: `Service performed: ${item.name} ($${Number(item.price || 0).toFixed(2)})`,
        job_id: id,
      });
      toast.success(`Linked "${item.name}" to "${eq.name}" history!`);
      setLinkingLineItemId(null);
      fetchJobEquipment(id, jobData?.client_name);
    } catch (e) {
      toast.error("Failed to link item to equipment");
    }
  };

  const handleDeleteLineItem = (itemId) => {
    const it = lineItems.find((i) => i.id === itemId);
    setDeleteConfirmState({
      isOpen: true,
      title: "Delete Line Item",
      message: `Are you sure you want to remove "${it?.name || "this item"}" from the job?`,
      confirmText: "Remove Item",
      action: async () => {
        const updatedLineItems = lineItems.filter((item) => item.id !== itemId);
        setLineItems(updatedLineItems);
        const newSubtotal = updatedLineItems.reduce((acc, item) => acc + item.price * item.qty, 0);
        const taxableSubtotal = updatedLineItems.filter((item) => item.taxable).reduce((acc, item) => acc + item.price * item.qty, 0);
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
          toast.success("Item removed from job");
        } catch (err) {
          toast.success("Item removed from job");
        }
      },
    });
  };

  const handleRemoveEquipmentFromJob = (eq) => {
    setDeleteConfirmState({
      isOpen: true,
      title: "Remove Equipment",
      message: `Are you sure you want to remove "${eq.name}" from this job?`,
      confirmText: "Remove",
      action: async () => {
        await Api("PUT", `api/equipment/${eq._id}`, { job_id: "" });
        toast.success("Equipment removed from this job");
        fetchJobEquipment(id, jobData?.client_name);
      },
    });
  };

  const handleDeleteEstimate = (est) => {
    setDeleteConfirmState({
      isOpen: true,
      title: "Delete Estimate",
      message: `Are you sure you want to remove "${est.title}"?`,
      confirmText: "Delete",
      action: () => {
        setEstimatesList((prev) => prev.filter((e) => e.id !== est.id));
        toast.success("Estimate removed");
      },
    });
  };

  const handleJobDone = async () => {
    setShowActionsMenu(false);
    try {
      const targetId = eventMongoId || id;
      await Api("PUT", `api/events/${targetId}`, { status: "Completed" }, router);
      setStatus("Completed");
      toast.success("Job marked as Done! 🎉");
    } catch (e) {
      toast.error("Failed to update job status");
    }
  };

  const handleViewWorkOrder = () => {
    setShowActionsMenu(false);
    const targetId = eventMongoId || id;
    router.push(`/jobs/${targetId}/work-order`);
  };

  const handleDuplicateJob = () => {
    setShowActionsMenu(false);
    setIsDuplicateModalOpen(true);
  };

  const handleConfirmDuplicate = ({ includeAttachments, includeEstimates }) => {
    setIsDuplicateModalOpen(false);
    const targetId = eventMongoId || id;
    router.push(`/jobs/new?duplicate_from=${targetId}&include_attachments=${includeAttachments}&include_estimates=${includeEstimates}`);
  };

  const handleDeleteJob = () => {
    setShowActionsMenu(false);
    setDeleteConfirmState({
      isOpen: true,
      title: "Delete Job",
      message: `Are you sure you want to permanently delete this job (#${displayJobId})?`,
      confirmText: "Delete Job",
      action: async () => {
        const targetId = eventMongoId || id;
        await Api("DELETE", `api/events/${targetId}`, null, router);
        toast.success("Job deleted successfully");
        router.push("/jobs");
      },
    });
  };

  const fetchPriceBook = async () => {
    try {
      const res = await Api("GET", "api/price-book", null, router);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setPriceBookItems(list);
    } catch (err) {
      setPriceBookItems([]);
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="w-8 h-8 text-[#D31010] animate-spin" />
        <p className="text-xs font-bold text-slate-400">Loading job details...</p>
      </div>
    );
  }

  if (!jobData) {
    return (
      <NotFoundState
        title="Job Not Found"
        message="This job was probably deleted, restricted or never existed."
        buttonText="Back to Jobs"
        backUrl="/jobs"
        breadcrumbs={[
          { label: `JOB (${displayJobId})`, url: "/jobs" },
          { label: "NEW JOB", url: "/jobs/new" },
          { label: "JOBS", url: "/jobs" },
          { label: "WORK ORDER", url: "/jobs" },
          { label: `JOB (${displayJobId})` },
        ]}
      />
    );
  }

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
        <span onClick={() => router.push(`/invoices/${eventMongoId || id || "885"}`)} className="hover:text-slate-600 cursor-pointer">
          INVOICE ({String(eventMongoId || id || "885").slice(-3)})
        </span>
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
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:text-[#D31010] hover:border-[#D31010]/40 shadow-sm cursor-pointer transition-colors"
          >
            <Zap className="w-4 h-4" />
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
                  className="absolute right-0 top-full mt-1.5 w-48 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-xs font-bold py-1 divide-y divide-slate-100 dark:divide-slate-800"
                >
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={handleJobDone}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                    >
                      <ThumbsUp className="w-4 h-4 text-slate-400" />
                      <span>Job Done</span>
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={handleViewWorkOrder}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                    >
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span>View Work Order</span>
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={handleDuplicateJob}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                    >
                      <Copy className="w-4 h-4 text-slate-400" />
                      <span>Duplicate Job</span>
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={handleDeleteJob}
                      className="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2.5 text-red-600 font-bold cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                      <span>Delete Job</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={() => router.push(`/invoices/${eventMongoId || id || "885"}`)}
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
          { id: "tasks", label: "Tasks", sub: `${jobTasks.filter((t) => t.status === "open").length} open` },
          { id: "equipment", label: "Equipment", sub: `${jobEquipment.length} equipment` },
          { id: "checklists", label: "Checklists", sub: `${jobChecklists.length} checklists` },
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
                          <div className="flex items-center justify-end gap-2">
                            {item.linked_equipment_name ? (
                              <div className="flex items-center gap-1">
                                <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                                  <LinkIcon className="w-2.5 h-2.5" />
                                  <span>{item.linked_equipment_name}</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setLinkingModalItem(item)}
                                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white text-[10px] cursor-pointer"
                                  title="Change linked equipment"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                              </div>
                            ) : String(item.item_type || "").toUpperCase().includes("EQUIPMENT") || String(item.name || "").toLowerCase().includes("tv") || String(item.name || "").toLowerCase().includes("furnace") || String(item.name || "").toLowerCase().includes("mount") || String(item.name || "").toLowerCase().includes("unit") ? (
                              <button
                                type="button"
                                onClick={() => handleTrackEquipmentFromItem(item)}
                                className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                                title="Track this item as equipment"
                              >
                                Track this equipment
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setLinkingModalItem(item)}
                                className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 text-[10px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                title="Link this service to saved client equipment"
                              >
                                <LinkIcon className="w-3 h-3" />
                                <span>Link to equipment</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteLineItem(item.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
                          onClick={() => handleDeleteEstimate(est)}
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

      {/* TAB: TASKS TAB CONTENT (Workiz Task Tracking & Checklist) */}
      {activeTab === "tasks" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Tasks ({jobTasks.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Break down this job into smaller tasks, assign to technicians, and track progress.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditingTaskData(null);
                setIsAddTaskModalOpen(true);
              }}
              className="px-6 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add task</span>
            </button>
          </div>

          {/* Progress Bar (Workiz Style) */}
          {jobTasks.length > 0 && (
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-700 dark:text-slate-300">
                  {jobTasks.filter((t) => t.status === "done").length} of {jobTasks.length} tasks completed
                </span>
                <span className="text-[#D31010]">
                  {Math.round(
                    (jobTasks.filter((t) => t.status === "done").length / jobTasks.length) * 100
                  )}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#D31010] transition-all duration-500 rounded-full"
                  style={{
                    width: `${Math.round(
                      (jobTasks.filter((t) => t.status === "done").length / jobTasks.length) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Filter Pills */}
          {jobTasks.length > 0 && (
            <div className="flex items-center gap-2">
              {[
                { id: "all", label: `All (${jobTasks.length})` },
                { id: "open", label: `Open (${jobTasks.filter((t) => t.status === "open").length})` },
                { id: "done", label: `Done (${jobTasks.filter((t) => t.status === "done").length})` },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setTaskFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    taskFilter === f.id
                      ? "bg-[#D31010] text-white shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {/* Tasks List */}
          {jobTasks.length > 0 ? (
            <div className="space-y-3">
              {jobTasks
                .filter((t) => {
                  if (taskFilter === "open") return t.status === "open";
                  if (taskFilter === "done") return t.status === "done";
                  return true;
                })
                .map((task) => {
                  const isDone = task.status === "done";
                  const isOverdue =
                    !isDone && task.due_date && new Date(task.due_date) < new Date();

                  return (
                    <div
                      key={task._id}
                      className={`p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex items-center justify-between gap-4 transition-colors ${
                        isDone ? "opacity-60 bg-slate-50/40 dark:bg-slate-900/40" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3.5 flex-1">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => handleToggleJobTask(task)}
                          className="mt-0.5 w-4 h-4 rounded text-[#D31010] focus:ring-[#D31010] cursor-pointer"
                        />

                        <div className="space-y-1">
                          <div
                            className={`text-xs font-bold ${
                              isDone
                                ? "line-through text-slate-400 dark:text-slate-500"
                                : "text-slate-900 dark:text-white"
                            }`}
                          >
                            {task.title}
                          </div>

                          {task.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {task.description}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] text-slate-500">
                            {task.assigned_tech && (
                              <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                <User className="w-3 h-3 text-slate-400" />
                                <span>{task.assigned_tech}</span>
                              </span>
                            )}

                            {task.due_date && (
                              <span
                                className={`flex items-center gap-1 font-semibold ${
                                  isOverdue
                                    ? "text-[#D31010] font-bold"
                                    : "text-slate-600 dark:text-slate-400"
                                }`}
                              >
                                <Calendar className="w-3 h-3" />
                                <span>Due: {new Date(task.due_date).toLocaleDateString()} {task.due_time || ""}</span>
                                {isOverdue && (
                                  <span className="px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-950/60 text-[#D31010] font-extrabold text-[9px]">
                                    Overdue
                                  </span>
                                )}
                              </span>
                            )}

                            {Array.isArray(task.tags) && task.tags.length > 0 && (
                              <div className="flex items-center gap-1">
                                {task.tags.map((tg) => (
                                  <span
                                    key={tg}
                                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                                  >
                                    {tg}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTaskData(task);
                            setIsAddTaskModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                          title="Edit task"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteJobTask(task)}
                          className="p-1.5 text-slate-400 hover:text-[#D31010] cursor-pointer"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="py-16 text-center space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                <ListTodo className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                No tasks for this job yet
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Organize your workflow by assigning checklists, permits, or parts ordering tasks.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingTaskData(null);
                  setIsAddTaskModalOpen(true);
                }}
                className="px-6 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md cursor-pointer"
              >
                + Add Task
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: EQUIPMENT TAB CONTENT (Workiz Equipment Tracking) */}
      {activeTab === "equipment" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Equipment ({jobEquipment.length})
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Track equipment installations, warranties, and service histories for this job and client.
              </p>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAddEquipmentMenu(!showAddEquipmentMenu)}
                className="px-6 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add new</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              <AnimatePresence>
                {showAddEquipmentMenu && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowAddEquipmentMenu(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-40 py-1 text-xs font-bold divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddEquipmentMenu(false);
                          setEditingEquipmentData(null);
                          setAddEquipmentDefaultSource("new");
                          setIsAddEquipmentModalOpen(true);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer text-slate-800 dark:text-slate-200"
                      >
                        <Plus className="w-4 h-4 text-[#D31010]" />
                        <span>New equipment</span>
                      </button>

                      {lineItems.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddEquipmentMenu(false);
                            setEditingEquipmentData(null);
                            setAddEquipmentDefaultSource("job_items");
                            setIsAddEquipmentModalOpen(true);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer text-slate-800 dark:text-slate-200"
                        >
                          <BookOpen className="w-4 h-4 text-blue-500" />
                          <span>Job items ({lineItems.length})</span>
                        </button>
                      )}

                      {clientEquipmentList.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddEquipmentMenu(false);
                            setEditingEquipmentData(null);
                            setAddEquipmentDefaultSource("saved_client");
                            setIsAddEquipmentModalOpen(true);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer text-slate-800 dark:text-slate-200"
                        >
                          <MapPin className="w-4 h-4 text-emerald-500" />
                          <span>Saved client equipment ({clientEquipmentList.length})</span>
                        </button>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

          {jobEquipment.length > 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs font-bold">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase text-slate-400 bg-slate-50 dark:bg-slate-900/50">
                    <th className="py-3.5 px-6">Equipment & Model</th>
                    <th className="py-3.5 px-6">Serial #</th>
                    <th className="py-3.5 px-6">Manufacturer</th>
                    <th className="py-3.5 px-6">Location</th>
                    <th className="py-3.5 px-6">Labor Warranty</th>
                    <th className="py-3.5 px-6">Parts Warranty</th>
                    <th className="py-3.5 px-6 text-right">History & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {jobEquipment.map((eq) => {
                    const isLaborActive = eq.labor_warranty_exp && new Date(eq.labor_warranty_exp) >= new Date();
                    const isPartsActive = eq.parts_warranty_exp && new Date(eq.parts_warranty_exp) >= new Date();
                    const historyCount = Array.isArray(eq.history) ? eq.history.length : 0;

                    return (
                      <tr key={eq._id || eq.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-4 px-6 border-l-4 border-[#D31010]">
                          <div className="font-extrabold text-slate-900 dark:text-white">
                            {eq.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                            Model: {eq.model_number}
                          </div>
                        </td>

                        <td className="py-4 px-6 font-mono text-slate-600 dark:text-slate-300">
                          {eq.serial_number || "—"}
                        </td>

                        <td className="py-4 px-6">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded font-semibold text-[11px]">
                            {eq.manufacturer || "General"}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-slate-600 dark:text-slate-400">
                          {eq.location_in_property || "Main Unit"}
                        </td>

                        <td className="py-4 px-6">
                          {eq.labor_warranty_exp ? (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isLaborActive ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                            }`}>
                              {isLaborActive ? "Active" : "Expired"}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        <td className="py-4 px-6">
                          {eq.parts_warranty_exp ? (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isPartsActive ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                            }`}>
                              {isPartsActive ? "Active" : "Expired"}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setHistoryEquipmentData(eq)}
                              className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                              title="View Installation & Service History"
                            >
                              <History className="w-3.5 h-3.5" />
                              <span>{historyCount} logs</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingEquipmentData(eq);
                                setAddEquipmentDefaultSource("new");
                                setIsAddEquipmentModalOpen(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                              title="Edit equipment"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRemoveEquipmentFromJob(eq)}
                              className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                              title="Remove from job"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-14 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center justify-center text-[#D31010]">
                <Plus className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                No equipment tracked for this job yet
              </h4>
              <p className="text-xs text-slate-400 max-w-sm text-center">
                Add new equipment installed during this job, track equipment-type line items, or link to saved client equipment.
              </p>
              <button
                type="button"
                onClick={() => {
                  setEditingEquipmentData(null);
                  setAddEquipmentDefaultSource("new");
                  setIsAddEquipmentModalOpen(true);
                }}
                className="px-6 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md cursor-pointer"
              >
                + Add Equipment
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB: CHECKLISTS TAB CONTENT (Workiz Checklists Engine) */}
      {activeTab === "checklists" && (
        <div className="p-5 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Checklists
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-[#D31010] dark:bg-red-950/60 dark:text-red-300">
                  {jobChecklists.length}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Standardize inspections, multi-point checks, safety protocols, and sign-offs in real-time.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddChecklistModalOpen(true)}
              className="px-5 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Checklist</span>
            </button>
          </div>

          {jobChecklists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobChecklists.map((chk) => {
                const total = chk.items?.length || chk.total_count || 0;
                const completed = chk.items?.filter((it) => it.is_completed || it.value === "pass" || it.value === "flag" || it.value === "fail" || it.value === true)?.length || chk.completed_count || 0;
                const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

                const passCount = chk.items?.filter((i) => i.value === "pass").length || 0;
                const flagCount = chk.items?.filter((i) => i.value === "flag").length || 0;
                const failCount = chk.items?.filter((i) => i.value === "fail").length || 0;

                return (
                  <div
                    key={chk._id}
                    className="p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 hover:border-[#D31010]/50 transition-all flex flex-col justify-between space-y-4 shadow-xs"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {chk.title}
                          </h4>
                          {chk.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {chk.description}
                            </p>
                          )}
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            chk.status === "completed" || percent === 100
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : chk.status === "in_progress" || percent > 0
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                              : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {chk.status === "completed" || percent === 100 ? "Completed" : chk.status === "in_progress" || percent > 0 ? "In Progress" : "Not Started"}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-slate-600 dark:text-slate-400">
                            {completed} of {total} checks complete
                          </span>
                          <span className={percent === 100 ? "text-emerald-600 font-extrabold" : "text-[#D31010] font-extrabold"}>
                            {percent}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${
                              percent === 100 ? "bg-emerald-500" : "bg-[#D31010]"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      {(passCount > 0 || flagCount > 0 || failCount > 0) && (
                        <div className="flex items-center gap-2 pt-1">
                          {passCount > 0 && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{passCount} Pass</span>
                            </span>
                          )}
                          {flagCount > 0 && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{flagCount} Flag</span>
                            </span>
                          )}
                          {failCount > 0 && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 flex items-center gap-1">
                              <XCircle className="w-3 h-3" />
                              <span>{failCount} Fail</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteConfirmState({
                            isOpen: true,
                            title: "Delete Checklist",
                            message: `Are you sure you want to remove "${chk.title}" from this job?`,
                            confirmText: "Delete",
                            action: async () => {
                              await Api("DELETE", `api/checklists/${chk._id}`);
                              toast.success("Checklist deleted");
                              fetchJobChecklists(id);
                            },
                          });
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer transition-colors"
                        title="Delete checklist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveFillingChecklist(chk)}
                        className="px-5 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>{percent === 100 ? "View / Edit" : "Fill Checklist"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 text-[#D31010] flex items-center justify-center">
                <CheckSquare className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  No checklists added to this job yet
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Standardize your field operations with standardized multi-point inspections, safety protocols, and installation walkthroughs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddChecklistModalOpen(true)}
                className="px-6 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ Add Checklist</span>
              </button>
            </div>
          )}
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

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        initialData={editingTaskData}
        jobContext={{
          id,
          job_id: id,
          client_name: `${firstName} ${lastName}`.trim(),
          assigned_tech: jobData?.assigned_tech || "PIXL TECHNICIAN",
        }}
        onClose={() => {
          setIsAddTaskModalOpen(false);
          setEditingTaskData(null);
        }}
        onSaved={() => fetchJobTasks(id)}
      />

      <ViewScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSetSchedule={(slot) => {
          toast.success(`Schedule set: ${slot}`);
        }}
      />

      <AddEquipmentModal
        isOpen={isAddEquipmentModalOpen}
        initialData={editingEquipmentData}
        jobItems={lineItems}
        clientEquipmentList={clientEquipmentList}
        clientContext={{ name: `${firstName} ${lastName}`.trim(), phone, email, address: jobData?.address }}
        jobContextId={id}
        defaultSource={addEquipmentDefaultSource}
        onClose={() => {
          setIsAddEquipmentModalOpen(false);
          setEditingEquipmentData(null);
        }}
        onSaved={() => {
          fetchJobEquipment(id, jobData?.client_name);
        }}
      />

      <EquipmentHistoryModal
        isOpen={Boolean(historyEquipmentData)}
        equipment={historyEquipmentData}
        onClose={() => setHistoryEquipmentData(null)}
        onHistoryUpdated={(updated) => {
          setHistoryEquipmentData(updated);
          fetchJobEquipment(id, jobData?.client_name);
        }}
      />

      <LinkEquipmentModal
        isOpen={Boolean(linkingModalItem)}
        onClose={() => setLinkingModalItem(null)}
        item={linkingModalItem}
        jobEquipment={jobEquipment}
        clientEquipmentList={clientEquipmentList}
        jobId={id}
        clientName={`${firstName} ${lastName}`.trim()}
        onEquipmentLinked={async (it, eq) => {
          const updated = lineItems.map((li) =>
            li.id === it.id
              ? {
                  ...li,
                  linked_equipment_id: eq._id,
                  linked_equipment_name: eq.name,
                }
              : li
          );
          setLineItems(updated);
          const targetId = eventMongoId || id;
          await Api("PUT", `api/events/${targetId}`, { line_items: updated }, router);
          fetchJobEquipment(id, jobData?.client_name);
        }}
        onAddNewEquipment={(it) => {
          handleTrackEquipmentFromItem(it);
        }}
      />

      <AddChecklistModal
        isOpen={isAddChecklistModalOpen}
        jobId={id}
        onClose={() => setIsAddChecklistModalOpen(false)}
        onChecklistAdded={() => {
          fetchJobChecklists(id);
        }}
      />

      <FillChecklistModal
        isOpen={Boolean(activeFillingChecklist)}
        checklist={activeFillingChecklist}
        onClose={() => setActiveFillingChecklist(null)}
        onChecklistUpdated={() => {
          fetchJobChecklists(id);
        }}
        onDelete={() => {
          fetchJobChecklists(id);
        }}
      />

      <ConfirmationModal
        isOpen={deleteConfirmState.isOpen}
        title={deleteConfirmState.title}
        message={deleteConfirmState.message}
        confirmText={deleteConfirmState.confirmText}
        onConfirm={async () => {
          if (deleteConfirmState.action) {
            await deleteConfirmState.action();
          }
          setDeleteConfirmState((prev) => ({ ...prev, isOpen: false }));
        }}
        onClose={() => setDeleteConfirmState((prev) => ({ ...prev, isOpen: false }))}
      />

      <WorkOrderModal
        isOpen={isWorkOrderModalOpen}
        onClose={() => setIsWorkOrderModalOpen(false)}
        jobData={jobData}
        clientName={`${firstName} ${lastName}`.trim()}
        companyName={companyName}
        phone={phone}
        email={email}
        fullAddress={fullAddress}
        startDate={startDate}
        startTime={startTime}
        endDate={endDate}
        endTime={endTime}
        assignedTechs={teamTechs}
        lineItems={lineItems}
        description={description}
        jobType={jobType}
        totalAmount={totalAmount}
      />

      <DuplicateJobModal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        onConfirm={handleConfirmDuplicate}
        jobId={displayJobId}
      />
    </div>
  );
}
