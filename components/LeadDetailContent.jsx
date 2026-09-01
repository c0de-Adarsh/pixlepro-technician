import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  ChevronDown,
  Phone,
  MessageSquare,
  Calendar,
  Clock,
  MapPin,
  Plus,
  Check,
  Edit2,
  Trash2,
  ThumbsDown,
  FilePlus,
  Briefcase,
  Upload,
  User,
  Loader2,
  CheckCircle2,
  FileText,
  Copy,
  X,
  Send,
  Camera,
  BookOpen,
  ArrowLeft,
  DollarSign,
  AlertTriangle,
  FileSpreadsheet,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";
import ViewScheduleModal from "./ViewScheduleModal";
import AddTaskModal from "./AddTaskModal";
import AddChecklistModal from "./AddChecklistModal";
import FillChecklistModal from "./FillChecklistModal";
import ConfirmationModal from "./ConfirmationModal";
import NotFoundState from "./NotFoundState";

const ESTIMATE_COLORS = [
  "border-emerald-500",
  "border-blue-500",
  "border-purple-500",
  "border-amber-500",
  "border-rose-500",
  "border-indigo-500",
];

export default function LeadDetailContent() {
  const router = useRouter();
  const { id } = router.query;

  const [leadData, setLeadData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const [activeTab, setActiveTab] = useState("details");
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [leadStatuses, setLeadStatuses] = useState([]);

  const [status, setStatus] = useState("New");
  const [leadTitle, setLeadTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneExt, setPhoneExt] = useState("");
  const [phone2, setPhone2] = useState("");
  const [phoneExt2, setPhoneExt2] = useState("");
  const [email, setEmail] = useState("");
  const [fullAddress, setFullAddress] = useState("");

  const [streetAddress, setStreetAddress] = useState("");
  const [unit, setUnit] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  const [jobType, setJobType] = useState("Tv Installation");
  const [jobSource, setJobSource] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTech, setAssignedTech] = useState("");

  const [isScheduled, setIsScheduled] = useState(true);
  const [startDate, setStartDate] = useState("2026-08-01");
  const [startTime, setStartTime] = useState("03:15 PM");
  const [endDate, setEndDate] = useState("2026-08-01");
  const [endTime, setEndTime] = useState("03:15 PM");
  const [allDayEvent, setAllDayEvent] = useState(false);

  const [estimatesList, setEstimatesList] = useState([]);
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [isSavingEstimate, setIsSavingEstimate] = useState(false);
  const [priceBookItems, setPriceBookItems] = useState([]);
  const [isPriceBookOpen, setIsPriceBookOpen] = useState(false);

  const [attachmentsList, setAttachmentsList] = useState([]);
  const [leadTasks, setLeadTasks] = useState([]);
  const [leadChecklists, setLeadChecklists] = useState([]);
  const [allJobTypes, setAllJobTypes] = useState([]);
  const [allJobSources, setAllJobSources] = useState([]);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isAddChecklistModalOpen, setIsAddChecklistModalOpen] = useState(false);
  const [activeFillingChecklist, setActiveFillingChecklist] = useState(null);
  const [deleteConfirmState, setDeleteConfirmState] = useState({ isOpen: false, title: "", message: "", confirmText: "", action: null });

  useEffect(() => {
    fetchLeadStatuses();
    fetchPriceBook();
    fetchJobTypesAndSources();
  }, []);

  const fetchJobTypesAndSources = async () => {
    try {
      const [resTypes, resSources] = await Promise.allSettled([
        Api("GET", "api/job-types", null, router),
        Api("GET", "api/ad-groups", null, router),
      ]);
      if (resTypes.status === "fulfilled") {
        const types = Array.isArray(resTypes.value?.data) ? resTypes.value.data : [];
        setAllJobTypes(types);
      }
      if (resSources.status === "fulfilled") {
        const sources = Array.isArray(resSources.value?.data) ? resSources.value.data : [];
        setAllJobSources(sources);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (id) {
      fetchLeadDetails();
      fetchLeadEstimates(id);
    }
  }, [id]);

  const fetchPriceBook = async () => {
    try {
      const res = await Api("GET", "api/price-book", null, router);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setPriceBookItems(list);
    } catch (e) {}
  };

  const fetchLeadStatuses = async () => {
    try {
      const res = await Api("GET", "api/lead-statuses", null, router);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      if (list.length > 0) {
        setLeadStatuses(list);
      } else {
        setLeadStatuses([
          { name: "New", color: "#3B82F6" },
          { name: "In Progress", color: "#F59E0B" },
          { name: "Estimated", color: "#10B981" },
          { name: "Approved", color: "#065F46" },
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLeadEstimates = async (leadIdParam) => {
    try {
      const targetId = leadIdParam || id;
      const res = await Api("GET", `api/estimates?lead_id=${targetId}`, null, router);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setEstimatesList(list);
      if (selectedEstimate) {
        const updated = list.find((e) => e._id === selectedEstimate._id);
        if (updated) setSelectedEstimate(updated);
      }
    } catch (e) {}
  };

  const fetchLeadDetails = async () => {
    setLoading(true);
    try {
      const res = await Api("GET", `api/events/${id}`, null, router);
      const data = res?.data || (res && res._id ? res : null);
      if (data && (data._id || data.client_name || data.title)) {
        setLeadData(data);
        setStatus(data.lead_status || data.status || "New");
        setLeadTitle(data.title || `Lead #${String(data._id).substring(String(data._id).length - 4)}`);

        if (data.client_name) {
          const names = data.client_name.split(" ");
          setFirstName(names[0] || "");
          setLastName(names.slice(1).join(" ") || "");
        }
        if (data.company_name) setCompanyName(data.company_name);
        if (data.phone) {
          const p = data.phone;
          const extMatch = p.match(/ext\s*(\w+)/i);
          if (extMatch) {
            setPhone(p.replace(/ext\s*(\w+)/i, "").trim());
            setPhoneExt(extMatch[1]);
          } else {
            setPhone(p);
          }
        }
        if (data.email) setEmail(data.email);
        if (data.job_type) setJobType(data.job_type);
        if (data.job_source) setJobSource(data.job_source);
        if (data.description) setDescription(data.description);
        if (data.assigned_tech) setAssignedTech(data.assigned_tech);

        if (data.address) {
          const addr = data.address;
          if (typeof addr === "object") {
            setStreetAddress(addr.street || "");
            setUnit(addr.unit || "");
            setCity(addr.city || "");
            setState(addr.region || addr.state || "");
            setZip(addr.postal_code || addr.zip || "");
            const formatted = `${addr.city || ""}, ${addr.region || ""} ${addr.postal_code || ""} ${addr.street || ""}`.trim();
            if (formatted) setFullAddress(formatted);
          } else {
            setFullAddress(String(addr));
          }
        }

        if (data.is_scheduled !== undefined) setIsScheduled(Boolean(data.is_scheduled));
        if (data.schedule) {
          if (data.schedule.start_date) setStartDate(String(data.schedule.start_date).split("T")[0]);
          if (data.schedule.start_time) setStartTime(data.schedule.start_time);
          if (data.schedule.end_date) setEndDate(String(data.schedule.end_date).split("T")[0]);
          if (data.schedule.end_time) setEndTime(data.schedule.end_time);
          if (data.schedule.is_all_day !== undefined) setAllDayEvent(data.schedule.is_all_day);
        }

        if (Array.isArray(data.attachments)) setAttachmentsList(data.attachments);
        fetchLeadTasks(id);
        fetchLeadChecklists(id);
      } else {
        setLeadData(null);
      }
    } catch (err) {
      console.error(err);
      setLeadData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeadTasks = async (leadIdParam) => {
    try {
      const res = await Api("GET", `api/tasks/job/${leadIdParam || id}`);
      const list = Array.isArray(res?.data) ? res.data : [];
      setLeadTasks(list);
    } catch (e) {}
  };

  const fetchLeadChecklists = async (leadIdParam) => {
    try {
      const res = await Api("GET", `api/checklists/job/${leadIdParam || id}`);
      const list = Array.isArray(res?.data) ? res.data : [];
      setLeadChecklists(list);
    } catch (e) {}
  };

  const shortLeadId = leadData?._id
    ? String(leadData._id).substring(String(leadData._id).length - 4)
    : id || "49";

  const handleUpdateLead = async (e) => {
    if (e) e.preventDefault();
    setIsUpdating(true);
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const payload = {
        title: leadTitle || `Lead #${shortLeadId} - ${fullName}`,
        client_name: fullName || "Client",
        company_name: companyName,
        phone: phone + (phoneExt ? ` ext ${phoneExt}` : ""),
        email,
        job_type: jobType,
        job_source: jobSource,
        description,
        assigned_tech: assignedTech,
        address: {
          street: streetAddress,
          unit,
          city,
          region: state,
          postal_code: zip,
        },
        status,
        lead_status: status,
        is_scheduled: isScheduled,
        schedule_status: isScheduled ? "scheduled" : "unscheduled",
        schedule: isScheduled
          ? {
              start_date: startDate,
              start_time: startTime,
              end_date: endDate,
              end_time: endTime,
              is_all_day: allDayEvent,
            }
          : null,
      };

      await Api("PUT", `api/events/${id}`, payload, router);
      toast.success("Lead updated successfully!");
      fetchLeadDetails();
    } catch (err) {
      toast.error(err.message || "Failed to update lead");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateLeadEstimate = async () => {
    try {
      const nextIndex = estimatesList.length + 1;
      const fullName = `${firstName} ${lastName}`.trim() || leadData?.client_name || "Client";
      const payload = {
        name: `Estimate ${nextIndex}`,
        estimate_number: `${shortLeadId}-${nextIndex}`,
        lead_id: id,
        client_name: fullName,
        company_name: companyName || leadData?.company_name || "",
        client_email: email || leadData?.email || "",
        phone: phone || leadData?.phone || "",
        service_address: fullAddress || `${streetAddress} ${city} ${state}`.trim() || "Same as billing address",
        description: description || "Tv Installation Service",
        status: "Unsent",
        source_job: `Lead #${shortLeadId}`,
        line_items: [],
        subtotal: 0,
        tax_rate: 5.0,
        tax_amount: 0,
        total_amount: 0,
      };

      const res = await Api("POST", "api/estimates", payload, router);
      const created = res?.data || res;
      toast.success(`Estimate ${nextIndex} created for this lead!`);
      await fetchLeadEstimates(id);
      setActiveTab("estimates");
      setSelectedEstimate(created);
    } catch (err) {
      toast.error(err.message || "Failed to create estimate");
    }
  };

  const handleDuplicateEstimate = async (estToDup, e) => {
    if (e) e.stopPropagation();
    try {
      const nextIndex = estimatesList.length + 1;
      const payload = {
        name: `Estimate ${nextIndex}`,
        estimate_number: `${shortLeadId}-${nextIndex}`,
        lead_id: id,
        client_name: estToDup.client_name,
        company_name: estToDup.company_name,
        client_email: estToDup.client_email,
        phone: estToDup.phone,
        service_address: estToDup.service_address,
        description: estToDup.description,
        status: "Unsent",
        source_job: `Lead #${shortLeadId}`,
        line_items: estToDup.line_items || [],
        subtotal: estToDup.subtotal || 0,
        discount: estToDup.discount || 0,
        tax_rate: estToDup.tax_rate || 5.0,
        tax_amount: estToDup.tax_amount || 0,
        total_amount: estToDup.total_amount || 0,
        notes: estToDup.notes || "",
      };

      const res = await Api("POST", "api/estimates", payload, router);
      const created = res?.data || res;
      toast.success(`Duplicated to Estimate ${nextIndex}!`);
      await fetchLeadEstimates(id);
      setSelectedEstimate(created);
    } catch (err) {
      toast.error("Failed to duplicate estimate");
    }
  };

  const handleDeleteEstimate = (estToDelete, e) => {
    if (e) e.stopPropagation();
    setDeleteConfirmState({
      isOpen: true,
      title: "Delete Estimate",
      message: `Are you sure you want to permanently delete "${estToDelete.name || "this estimate"}"?`,
      confirmText: "Delete Estimate",
      action: async () => {
        await Api("DELETE", `api/estimates/${estToDelete._id}`, null, router);
        toast.success("Estimate deleted successfully");
        if (selectedEstimate?._id === estToDelete._id) {
          setSelectedEstimate(null);
        }
        fetchLeadEstimates(id);
      },
    });
  };

  const handleSaveSelectedEstimate = async () => {
    if (!selectedEstimate) return;
    setIsSavingEstimate(true);
    try {
      const items = selectedEstimate.line_items || [];
      const sub = items.reduce((acc, it) => acc + (Number(it.price || 0) * Number(it.qty || 1)), 0);
      const discountVal = Number(selectedEstimate.discount || 0);
      const discountedSub = Math.max(0, sub - discountVal);
      const taxableItemsSub = items.filter((it) => it.taxable !== false).reduce((acc, it) => acc + (Number(it.price || 0) * Number(it.qty || 1)), 0);
      const taxRateVal = Number(selectedEstimate.tax_rate !== undefined ? selectedEstimate.tax_rate : 5.0);
      const taxAmt = (taxableItemsSub * taxRateVal) / 100;
      const total = discountedSub + taxAmt;

      const payload = {
        ...selectedEstimate,
        subtotal: sub,
        tax_amount: taxAmt,
        total_amount: total,
        amount: total,
      };

      await Api("PUT", `api/estimates/${selectedEstimate._id}`, payload, router);
      toast.success("Estimate saved successfully!");
      fetchLeadEstimates(id);
    } catch (err) {
      toast.error("Failed to save estimate");
    } finally {
      setIsSavingEstimate(false);
    }
  };

  const handleAddLineItemToEstimate = (itemData = {}) => {
    if (!selectedEstimate) return;
    const newItem = {
      name: itemData.name || "New Item",
      qty: itemData.qty || 1,
      price: itemData.price || 0,
      cost: itemData.cost || 0,
      amount: (itemData.price || 0) * (itemData.qty || 1),
      taxable: true,
      description: itemData.description || "",
    };
    const updatedItems = [...(selectedEstimate.line_items || []), newItem];
    const sub = updatedItems.reduce((acc, it) => acc + (Number(it.price || 0) * Number(it.qty || 1)), 0);
    const taxRateVal = Number(selectedEstimate.tax_rate !== undefined ? selectedEstimate.tax_rate : 5.0);
    const taxAmt = (sub * taxRateVal) / 100;
    const total = sub + taxAmt;

    setSelectedEstimate({
      ...selectedEstimate,
      line_items: updatedItems,
      subtotal: sub,
      tax_amount: taxAmt,
      total_amount: total,
    });
  };

  const handleUpdateLineItem = (idx, field, value) => {
    if (!selectedEstimate) return;
    const nextItems = [...(selectedEstimate.line_items || [])];
    nextItems[idx] = { ...nextItems[idx], [field]: value };
    if (field === "price" || field === "qty") {
      nextItems[idx].amount = Number(nextItems[idx].price || 0) * Number(nextItems[idx].qty || 1);
    }
    const sub = nextItems.reduce((acc, it) => acc + (Number(it.price || 0) * Number(it.qty || 1)), 0);
    const taxRateVal = Number(selectedEstimate.tax_rate !== undefined ? selectedEstimate.tax_rate : 5.0);
    const taxAmt = (sub * taxRateVal) / 100;
    const total = sub + taxAmt;

    setSelectedEstimate({
      ...selectedEstimate,
      line_items: nextItems,
      subtotal: sub,
      tax_amount: taxAmt,
      total_amount: total,
    });
  };

  const handleRemoveLineItem = (idx) => {
    if (!selectedEstimate) return;
    const nextItems = selectedEstimate.line_items.filter((_, i) => i !== idx);
    const sub = nextItems.reduce((acc, it) => acc + (Number(it.price || 0) * Number(it.qty || 1)), 0);
    const taxRateVal = Number(selectedEstimate.tax_rate !== undefined ? selectedEstimate.tax_rate : 5.0);
    const taxAmt = (sub * taxRateVal) / 100;
    const total = sub + taxAmt;

    setSelectedEstimate({
      ...selectedEstimate,
      line_items: nextItems,
      subtotal: sub,
      tax_amount: taxAmt,
      total_amount: total,
    });
  };

  const handleConvertToJob = async () => {
    setIsConverting(true);
    try {
      const res = await Api("POST", `api/events/${id}/convert`, {}, router);
      if (res && (res.success || res.data)) {
        toast.success("Lead converted to Job! 🚀");
        router.push(`/jobs/${id}`);
      } else {
        toast.error(res?.message || "Failed to convert lead");
      }
    } catch (err) {
      toast.error(err.message || "Error converting lead to job");
    } finally {
      setIsConverting(false);
    }
  };

  const handleMarkAsLost = async () => {
    setShowActionsMenu(false);
    try {
      await Api("PUT", `api/events/${id}`, { status: "Lost", lead_status: "Lost" }, router);
      setStatus("Lost");
      toast.success("Lead marked as lost");
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteLead = () => {
    setShowActionsMenu(false);
    setDeleteConfirmState({
      isOpen: true,
      title: "Delete Lead",
      message: `Are you sure you want to permanently delete Lead #${shortLeadId}?`,
      confirmText: "Delete Lead",
      action: async () => {
        await Api("DELETE", `api/events/${id}`, null, router);
        toast.success("Lead deleted successfully");
        router.push("/leads");
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 space-y-4">
        <Loader2 className="w-8 h-8 text-[#D31010] animate-spin" />
        <p className="text-xs font-bold text-slate-400">Loading lead details...</p>
      </div>
    );
  }

  if (!leadData) {
    return (
      <NotFoundState
        title="Lead Not Found"
        message="This lead was probably deleted, converted or never existed."
        buttonText="Back to Leads"
        backUrl="/leads"
        breadcrumbs={[
          { label: "LEADS", url: "/leads" },
          { label: "NOT FOUND" },
        ]}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 pt-4 sm:pt-6 text-slate-800 dark:text-slate-100">
      {/* Top Breadcrumb Navigation Bar */}
      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 space-x-2">
        <span onClick={() => router.push("/settings/sub-status")} className="hover:text-slate-600 cursor-pointer">
          JOB SUB STATUS
        </span>
        <span>#</span>
        <span onClick={() => setActiveTab("estimates")} className="hover:text-slate-600 cursor-pointer">
          ESTIMATE ({estimatesList.length || 1})
        </span>
        <span>#</span>
        <span onClick={() => router.push("/leads")} className="hover:text-slate-600 cursor-pointer">
          LEAD ({shortLeadId})
        </span>
        <span>#</span>
        <span onClick={() => router.push("/leads")} className="hover:text-slate-600 cursor-pointer">
          LEADS
        </span>
        <span>#</span>
        <span onClick={() => router.push("/leads/new")} className="hover:text-slate-600 cursor-pointer">
          NEW LEAD
        </span>
        <span>#</span>
        <span className="text-slate-700 dark:text-slate-300 font-extrabold">LEAD ({shortLeadId})</span>
      </div>

      {/* Main Header Block */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Lead #{shortLeadId} - {firstName} {lastName}
          </h1>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">Lead name:</span>
            {isEditingTitle ? (
              <input
                type="text"
                value={leadTitle}
                onChange={(e) => setLeadTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === "Enter" && setIsEditingTitle(false)}
                className="px-2 py-0.5 border border-slate-300 rounded text-xs font-bold focus:outline-none"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {leadTitle || `Lead #${shortLeadId} - ${firstName} ${lastName}`}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingTitle(true)}
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
                  onChange={(e) => {
                    setStatus(e.target.value);
                    Api("PUT", `api/events/${id}`, { status: e.target.value, lead_status: e.target.value }, router);
                    toast.success(`Status updated to ${e.target.value}`);
                  }}
                  className="pl-6 pr-8 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full text-xs font-extrabold appearance-none cursor-pointer text-slate-800 dark:text-slate-200 capitalize"
                >
                  {leadStatuses.map((ls) => (
                    <option key={ls._id || ls.name} value={ls.name}>
                      {ls.name}
                    </option>
                  ))}
                </select>
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#D31010]" />
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="text-xs text-slate-400 font-semibold">
              <span>Tags:</span>
            </div>
          </div>
        </div>

        {/* Top Right Action Buttons */}
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
                      onClick={handleMarkAsLost}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                    >
                      <ThumbsDown className="w-4 h-4 text-slate-400" />
                      <span>Mark as lost</span>
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowActionsMenu(false);
                        handleCreateLeadEstimate();
                      }}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                    >
                      <FilePlus className="w-4 h-4 text-slate-400" />
                      <span>Add Estimate</span>
                    </button>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={handleDeleteLead}
                      className="w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2.5 text-red-600 font-bold cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                      <span>Delete Lead</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={handleConvertToJob}
            disabled={isConverting}
            className="px-6 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            {isConverting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Convert To Job</span>}
          </button>
        </div>
      </div>

      {/* Sub-Nav Tabs Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-6 overflow-x-auto text-xs font-bold">
        {[
          { id: "details", label: "Details", sub: jobType || "Tv Installation" },
          { id: "estimates", label: "Estimates", sub: `${estimatesList.length} estimates` },
          { id: "attachments", label: "Attachments", sub: `${attachmentsList.length} attachments` },
          { id: "tasks", label: "Tasks", sub: `${leadTasks.filter((t) => t.status === "open").length} open` },
          { id: "checklists", label: "Checklists", sub: `${leadChecklists.length} checklists` },
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

      {/* TAB 1: DETAILS TAB CONTENT */}
      {activeTab === "details" && (
        <form onSubmit={handleUpdateLead} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Client & Lead Details */}
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
                    {fullAddress || `${streetAddress} ${city} ${state} ${zip}`.trim() || "No location address specified"}
                  </span>
                </div>
              </div>

              {/* Lead Details Card */}
              <div className="p-6 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Lead Details
                </h3>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                    Job type
                  </label>
                  <div className="relative">
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none appearance-none cursor-pointer"
                    >
                      {allJobTypes.length > 0 ? (
                        allJobTypes.map((jt) => (
                          <option key={jt._id || jt.name} value={jt.name}>
                            {jt.name}
                          </option>
                        ))
                      ) : (
                        <option value={jobType}>{jobType || "Tv Installation"}</option>
                      )}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                    Job source
                  </label>
                  <div className="relative">
                    <select
                      value={jobSource}
                      onChange={(e) => setJobSource(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none appearance-none cursor-pointer"
                    >
                      {allJobSources.length > 0 ? (
                        allJobSources.map((js) => (
                          <option key={js._id || js.name} value={js.name}>
                            {js.name}
                          </option>
                        ))
                      ) : (
                        <option value={jobSource}>{jobSource || "UR CHANNEL"}</option>
                      )}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter lead details, notes or instructions..."
                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Schedule & Techs */}
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
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
                      isScheduled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                        isScheduled ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {isScheduled && (
                  <div className="space-y-4 pt-1">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                          Starts
                        </label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                          At
                        </label>
                        <div className="relative">
                          <select
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none appearance-none cursor-pointer"
                          >
                            {["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:15 PM", "04:00 PM", "05:00 PM", "06:00 PM"].map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                          Ends
                        </label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                          At
                        </label>
                        <div className="relative">
                          <select
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none appearance-none cursor-pointer"
                          >
                            {["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:15 PM", "04:00 PM", "05:00 PM", "06:00 PM"].map((t) => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={allDayEvent}
                          onChange={(e) => setAllDayEvent(e.target.checked)}
                          className="w-4 h-4 rounded text-[#D31010] accent-[#D31010] cursor-pointer"
                        />
                        <span>All-day event</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => setIsScheduleModalOpen(true)}
                        className="px-4 py-1.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>View schedule</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Assigned Techs Card */}
              <div className="p-6 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Assigned Technician
                </h3>
                <input
                  type="text"
                  value={assignedTech}
                  onChange={(e) => setAssignedTech(e.target.value)}
                  placeholder="e.g. John Doe, Alex Smith"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-14 py-3 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs sm:text-sm font-extrabold rounded-full shadow-lg shadow-red-500/25 hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 min-w-[200px]"
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Update Lead</span>}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: ESTIMATES TAB (Screenshots 3, 4, 5 Match) */}
      {activeTab === "estimates" && (
        <div className="space-y-6">
          {!selectedEstimate ? (
            /* Screenshot 3: Estimates Table List View */
            <div className="p-6 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Estimates
                </h3>
                <button
                  type="button"
                  onClick={() => toast.success("Proposal sent to client!")}
                  className="px-6 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-full shadow-md shadow-red-500/20 cursor-pointer"
                >
                  Send all (Proposal)
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-4">Estimate</th>
                      <th className="py-3 px-4">Created</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {estimatesList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold">
                          No estimates created for this lead yet. Click &quot;+ Add Estimate&quot; below.
                        </td>
                      </tr>
                    ) : (
                      estimatesList.map((est, idx) => {
                        const colorBorder = ESTIMATE_COLORS[idx % ESTIMATE_COLORS.length];
                        const createdStr = est.createdAt
                          ? new Date(est.createdAt).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Today";

                        return (
                          <tr
                            key={est._id || idx}
                            onClick={() => setSelectedEstimate(est)}
                            className="hover:bg-slate-50/60 dark:hover:bg-slate-900/40 transition-colors cursor-pointer group font-semibold text-slate-800 dark:text-slate-200"
                          >
                            <td className={`py-4 px-4 border-l-4 ${colorBorder}`}>
                              <span className="font-bold text-[#4B9EFF] hover:underline">
                                {est.name || `Estimate ${idx + 1}`} / Estimate No. {est.estimate_number || `${shortLeadId}-${idx + 1}`}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                              {createdStr}
                            </td>
                            <td className="py-4 px-4">
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                                <span className="w-2 h-2 rounded-full bg-purple-500" />
                                <span>{est.status || "Unsent"}</span>
                              </span>
                            </td>
                            <td className="py-4 px-4 font-extrabold text-slate-900 dark:text-white">
                              ${Number(est.total_amount || est.amount || 0).toFixed(2)}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-2 text-slate-400">
                                <button
                                  type="button"
                                  title="Duplicate Estimate"
                                  onClick={(e) => handleDuplicateEstimate(est, e)}
                                  className="p-1.5 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  title="Delete Estimate"
                                  onClick={(e) => handleDeleteEstimate(est, e)}
                                  className="p-1.5 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
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

              {/* Bottom Add Estimate Button */}
              <div>
                <button
                  type="button"
                  onClick={handleCreateLeadEstimate}
                  className="px-6 py-2.5 border border-slate-300 dark:border-slate-700 hover:border-[#D31010] text-slate-800 dark:text-slate-200 text-xs font-bold rounded-full flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Estimate</span>
                </button>
              </div>
            </div>
          ) : (
            /* Screenshot 4 & 5: Nested Lead Estimate Editor */
            <div className="space-y-6">
              {/* Back to Lead Estimates Link */}
              <button
                type="button"
                onClick={() => setSelectedEstimate(null)}
                className="text-xs font-extrabold text-slate-500 hover:text-[#D31010] flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Lead ID: {shortLeadId}</span>
              </button>

              {/* Estimate Sub-Tabs & Actions Header (Screenshot 4) */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
                {/* Horizontal Estimate Tabs */}
                <div className="flex items-center gap-4 overflow-x-auto text-xs font-bold">
                  {estimatesList.map((est, idx) => {
                    const isSelected = selectedEstimate?._id === est._id;
                    return (
                      <button
                        key={est._id || idx}
                        type="button"
                        onClick={() => setSelectedEstimate(est)}
                        className={`pb-2 transition-all relative whitespace-nowrap cursor-pointer ${
                          isSelected
                            ? "text-slate-900 dark:text-white font-extrabold border-b-2 border-slate-900 dark:border-white"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-800"
                        }`}
                      >
                        <span>{est.name || `Estimate ${idx + 1}`}</span>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={handleCreateLeadEstimate}
                    className="pb-2 text-[#4B9EFF] hover:underline font-bold whitespace-nowrap cursor-pointer"
                  >
                    + Add estimate
                  </button>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toast.info("Automations panel")}
                    className="p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:text-[#D31010] cursor-pointer"
                  >
                    <Zap className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => toast.success("Estimate sent to client!")}
                    className="px-5 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-full shadow-md shadow-red-500/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </div>

              {/* Estimate Meta Header Box (Screenshot 4) */}
              <div className="p-6 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                {/* Upload Image Circle */}
                <div className="flex flex-col items-center justify-center">
                  <div
                    onClick={() => toast.info("Upload image")}
                    className="w-24 h-24 rounded-full bg-slate-800 dark:bg-slate-700 text-white flex flex-col items-center justify-center cursor-pointer hover:opacity-90 relative transition-opacity"
                  >
                    <Camera className="w-6 h-6 mb-1 text-slate-300" />
                    <span className="text-[10px] font-bold">Upload Image</span>
                    <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-[#D31010] text-white flex items-center justify-center text-xs font-bold">
                      +
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <div className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Description</div>
                  <textarea
                    rows={3}
                    value={selectedEstimate.description || ""}
                    onChange={(e) => setSelectedEstimate({ ...selectedEstimate, description: e.target.value })}
                    placeholder="(+Add description)"
                    className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                {/* Client Details */}
                <div className="space-y-1 text-xs">
                  <div className="font-extrabold text-slate-700 dark:text-slate-300">Client details</div>
                  <div className="font-bold text-slate-900 dark:text-white capitalize">{selectedEstimate.client_name || `${firstName} ${lastName}`}</div>
                  <div className="text-slate-500 dark:text-slate-400">{selectedEstimate.company_name || companyName || "No company"}</div>
                  <div className="text-slate-500 dark:text-slate-400">{selectedEstimate.client_email || email || "No email"}</div>
                </div>

                {/* Service Address & Estimate No. */}
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="font-extrabold text-slate-700 dark:text-slate-300">Service address</div>
                    <div className="text-slate-400 text-[10px]">(Same as billing address)</div>
                    <div className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                      {selectedEstimate.service_address || fullAddress || `${streetAddress} ${city} ${state}`.trim() || "123 Main Street"}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Status:</span>
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      <span className="font-bold">{selectedEstimate.status || "Unsent"}</span>
                    </div>
                    <div className="font-bold text-slate-500 text-[11px]">
                      Estimate no. {selectedEstimate.estimate_number || `${shortLeadId}-1`}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Section (Screenshot 4 & 5) */}
              <div className="p-6 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Items
                  </h3>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddLineItemToEstimate({ name: "Service Item", qty: 1, price: 150.0, cost: 50.0 })}
                      className="px-4 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Item</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsPriceBookOpen(true)}
                      className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Price book</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedEstimate({ ...selectedEstimate, status: "Won" });
                        toast.success("Estimate marked as Won!");
                      }}
                      className="px-4 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors"
                    >
                      <span>Mark as won</span>
                    </button>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold text-[11px] uppercase tracking-wider">
                        <th className="py-3 px-3">Item</th>
                        <th className="py-3 px-3 w-20">Quantity</th>
                        <th className="py-3 px-3 w-28">Price</th>
                        <th className="py-3 px-3 w-24">Cost</th>
                        <th className="py-3 px-3 w-28">Amount</th>
                        <th className="py-3 px-3 w-20">Taxable</th>
                        <th className="py-3 px-3 text-right w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                      {(!selectedEstimate.line_items || selectedEstimate.line_items.length === 0) ? (
                        <tr>
                          <td colSpan={7} className="py-10 text-center text-slate-400 font-semibold">
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <FileSpreadsheet className="w-8 h-8 text-slate-300" />
                              <span>No items added yet. Click &quot;+ Add Item&quot; or select from &quot;Price book&quot;.</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        selectedEstimate.line_items.map((it, idx) => (
                          <tr key={idx} className="font-semibold text-slate-800 dark:text-slate-200">
                            <td className="py-3 px-3">
                              <input
                                type="text"
                                value={it.name}
                                onChange={(e) => handleUpdateLineItem(idx, "name", e.target.value)}
                                className="w-full p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold focus:outline-none"
                              />
                            </td>
                            <td className="py-3 px-3">
                              <input
                                type="number"
                                min="1"
                                value={it.qty}
                                onChange={(e) => handleUpdateLineItem(idx, "qty", Number(e.target.value))}
                                className="w-full p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-center font-bold focus:outline-none"
                              />
                            </td>
                            <td className="py-3 px-3">
                              <input
                                type="number"
                                step="0.01"
                                value={it.price}
                                onChange={(e) => handleUpdateLineItem(idx, "price", Number(e.target.value))}
                                className="w-full p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold focus:outline-none"
                              />
                            </td>
                            <td className="py-3 px-3">
                              <input
                                type="number"
                                step="0.01"
                                value={it.cost || 0}
                                onChange={(e) => handleUpdateLineItem(idx, "cost", Number(e.target.value))}
                                className="w-full p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold focus:outline-none"
                              />
                            </td>
                            <td className="py-3 px-3 font-extrabold text-slate-900 dark:text-white">
                              ${((Number(it.price || 0)) * (Number(it.qty || 1))).toFixed(2)}
                            </td>
                            <td className="py-3 px-3">
                              <input
                                type="checkbox"
                                checked={it.taxable !== false}
                                onChange={(e) => handleUpdateLineItem(idx, "taxable", e.target.checked)}
                                className="w-4 h-4 rounded text-[#D31010] accent-[#D31010] cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveLineItem(idx)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Bottom Summary & Notes 2-Column Grid (Screenshot 5) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                  {/* Left Column: Notes & Deposits */}
                  <div className="space-y-6">
                    {/* Notes Box */}
                    <div className="space-y-2">
                      <div className="text-xs font-extrabold text-slate-700 dark:text-slate-300">Notes</div>
                      <textarea
                        rows={4}
                        value={selectedEstimate.notes || ""}
                        onChange={(e) => setSelectedEstimate({ ...selectedEstimate, notes: e.target.value })}
                        placeholder="(+Add notes for this estimate)"
                        className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-medium focus:outline-none"
                      />
                    </div>

                    {/* Deposits Box */}
                    <div className="p-5 bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
                          <DollarSign className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">Deposits</div>
                          <div className="text-[11px] text-slate-400">Record a deposit payment for this estimate</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => toast.info("Add payment modal")}
                        className="px-4 py-1.5 border border-slate-300 dark:border-slate-700 hover:border-[#D31010] rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                      >
                        Add payment
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Pricing Calculations (Screenshot 5) */}
                  <div className="space-y-3 bg-slate-50/50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-600 dark:text-slate-400">
                      <span>Subtotal :</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        ${Number(selectedEstimate.subtotal || 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-600 dark:text-slate-400">Discount :</span>
                      <input
                        type="number"
                        step="0.01"
                        value={selectedEstimate.discount || 0}
                        onChange={(e) => {
                          const disc = Number(e.target.value);
                          const sub = Number(selectedEstimate.subtotal || 0);
                          const discounted = Math.max(0, sub - disc);
                          const taxRateVal = Number(selectedEstimate.tax_rate !== undefined ? selectedEstimate.tax_rate : 5.0);
                          const taxAmt = (discounted * taxRateVal) / 100;
                          setSelectedEstimate({
                            ...selectedEstimate,
                            discount: disc,
                            tax_amount: taxAmt,
                            total_amount: discounted + taxAmt,
                          });
                        }}
                        className="w-28 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-right font-bold text-xs"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-600 dark:text-slate-400">Tax rate % :</span>
                      <select
                        value={selectedEstimate.tax_rate !== undefined ? selectedEstimate.tax_rate : 5.0}
                        onChange={(e) => {
                          const tr = Number(e.target.value);
                          const sub = Number(selectedEstimate.subtotal || 0);
                          const disc = Number(selectedEstimate.discount || 0);
                          const discounted = Math.max(0, sub - disc);
                          const taxAmt = (discounted * tr) / 100;
                          setSelectedEstimate({
                            ...selectedEstimate,
                            tax_rate: tr,
                            tax_amount: taxAmt,
                            total_amount: discounted + taxAmt,
                          });
                        }}
                        className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-bold text-xs cursor-pointer"
                      >
                        <option value={0}>0.0%</option>
                        <option value={5}>Alberta (5.0%)</option>
                        <option value={9}>LA (9.0%)</option>
                        <option value={13}>Ontario HST (13.0%)</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between font-bold text-slate-600 dark:text-slate-400">
                      <span>Tax :</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        ${Number(selectedEstimate.tax_amount || 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-base font-extrabold text-slate-900 dark:text-white">
                      <span>Total :</span>
                      <span className="text-xl text-[#D31010]">
                        ${Number(selectedEstimate.total_amount || 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={handleSaveSelectedEstimate}
                        disabled={isSavingEstimate}
                        className="px-8 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                      >
                        {isSavingEstimate ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Save Estimate</span>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ATTACHMENTS TAB */}
      {activeTab === "attachments" && (
        <div className="p-6 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Attachments</h3>
            <button
              type="button"
              onClick={() => toast.info("Opening upload file dialog...")}
              className="px-4 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>
          </div>
          {attachmentsList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-semibold text-xs">
              No attachments uploaded for this lead.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {attachmentsList.map((att, idx) => (
                <div key={idx} className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-center font-bold">
                  {att.original_name || "Attachment " + (idx + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: TASKS TAB */}
      {activeTab === "tasks" && (
        <div className="p-6 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Tasks</h3>
            <button
              type="button"
              onClick={() => setIsAddTaskModalOpen(true)}
              className="px-4 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Task</span>
            </button>
          </div>
          {leadTasks.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-semibold text-xs">
              No tasks assigned for this lead.
            </div>
          ) : (
            <div className="space-y-2">
              {leadTasks.map((t) => (
                <div key={t._id || t.id} className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-bold">{t.title}</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">{t.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CHECKLISTS TAB */}
      {activeTab === "checklists" && (
        <div className="p-6 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Checklists</h3>
            <button
              type="button"
              onClick={() => setIsAddChecklistModalOpen(true)}
              className="px-4 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Checklist</span>
            </button>
          </div>
          {leadChecklists.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-semibold text-xs">
              No checklists attached to this lead.
            </div>
          ) : (
            <div className="space-y-2">
              {leadChecklists.map((c) => (
                <div
                  key={c._id}
                  onClick={() => setActiveFillingChecklist(c)}
                  className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs cursor-pointer hover:border-[#D31010] transition-colors"
                >
                  <span className="font-bold">{c.name}</span>
                  <span className="text-[10px] font-extrabold text-[#D31010]">Fill Checklist →</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Price Book Modal */}
      <AnimatePresence>
        {isPriceBookOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPriceBookOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0E1E31] rounded-3xl p-6 shadow-2xl z-10 space-y-4 max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Select from Price Book</h3>
                <button type="button" onClick={() => setIsPriceBookOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 divide-y divide-slate-100 dark:divide-slate-800">
                {priceBookItems.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">No items in price book.</div>
                ) : (
                  priceBookItems.map((pb, idx) => (
                    <div
                      key={pb._id || idx}
                      onClick={() => {
                        handleAddLineItemToEstimate({
                          name: pb.name,
                          price: Number(pb.price || 0),
                          cost: Number(pb.cost || 0),
                          qty: 1,
                        });
                        setIsPriceBookOpen(false);
                        toast.success(`Added "${pb.name}" to estimate!`);
                      }}
                      className="pt-2 flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 p-2 rounded-xl"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">{pb.name}</div>
                        <div className="text-[10px] text-slate-400">{pb.category || "Service"}</div>
                      </div>
                      <div className="font-extrabold text-[#D31010]">${Number(pb.price || 0).toFixed(2)}</div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <ViewScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        leadDate={startDate}
        leadTime={startTime}
      />

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        jobId={id}
        onClose={() => setIsAddTaskModalOpen(false)}
        onSaved={() => fetchLeadTasks(id)}
      />

      <AddChecklistModal
        isOpen={isAddChecklistModalOpen}
        jobId={id}
        onClose={() => setIsAddChecklistModalOpen(false)}
        onChecklistAdded={() => fetchLeadChecklists(id)}
      />

      <FillChecklistModal
        isOpen={Boolean(activeFillingChecklist)}
        checklist={activeFillingChecklist}
        onClose={() => setActiveFillingChecklist(null)}
        onChecklistUpdated={() => fetchLeadChecklists(id)}
        onDelete={() => fetchLeadChecklists(id)}
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
    </div>
  );
}
