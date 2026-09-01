import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Calendar as CalendarIcon,
  Minus,
  Plus,
  Loader2,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
  RotateCcw,
  RotateCw,
  User,
  Search,
  Wrench,
  X,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { countries } from "../constants/countries";
import { Api } from "../services/service";
import ViewScheduleModal from "./ViewScheduleModal";
import AddClientModal from "./AddClientModal";
import AddJobTypeModal from "./AddJobTypeModal";
import AddAdGroupModal from "./AddAdGroupModal";

export default function NewJobContent() {
  const router = useRouter();
  const isLead = router.pathname.includes("/leads") || router.query.type === "lead";

  const [clientName, setClientName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneExt, setPhoneExt] = useState("");
  const [email, setEmail] = useState("");

  const [address, setAddress] = useState("");
  const [unit, setUnit] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("United States");
  const [serviceArea, setServiceArea] = useState("");

  const [allClients, setAllClients] = useState([]);
  const [allServiceAreas, setAllServiceAreas] = useState([]);
  const [allJobTypes, setAllJobTypes] = useState([]);
  const [allJobSources, setAllJobSources] = useState([]);
  const [allTechs, setAllTechs] = useState([]);

  const [showClientMenu, setShowClientMenu] = useState(false);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isAddJobTypeModalOpen, setIsAddJobTypeModalOpen] = useState(false);
  const [isAddAdGroupModalOpen, setIsAddAdGroupModalOpen] = useState(false);

  const [jobType, setJobType] = useState("");
  const [jobSource, setJobSource] = useState("");
  const [description, setDescription] = useState("");

  const [isScheduled, setIsScheduled] = useState(true);
  const [startDate, setStartDate] = useState("2026-08-20");
  const [startTime, setStartTime] = useState("06:15 PM");
  const [endDate, setEndDate] = useState("2026-08-20");
  const [endTime, setEndTime] = useState("07:15 PM");
  const [allDayEvent, setAllDayEvent] = useState(false);
  const [assignedTech, setAssignedTech] = useState("");
  const [availableTechs, setAvailableTechs] = useState([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [duplicatedFrom, setDuplicatedFrom] = useState(null);
  const [isDuplicatedBannerVisible, setIsDuplicatedBannerVisible] = useState(false);

  useEffect(() => {
    if (router.query.duplicate_from) {
      fetchSourceJob(router.query.duplicate_from);
    }
  }, [router.query.duplicate_from]);

  const fetchSourceJob = async (sourceId) => {
    try {
      const res = await Api("GET", `api/events/${sourceId}`, null, router);
      const data = res?.data || res || {};
      if (data && (data._id || data.client_name)) {
        setDuplicatedFrom(data);
        setIsDuplicatedBannerVisible(true);

        if (data.client_name) setClientName(data.client_name);
        if (data.company_name) setCompanyName(data.company_name);
        if (data.phone) {
          const phoneStr = data.phone;
          const extMatch = phoneStr.match(/ext\s*(\w+)/i);
          if (extMatch) {
            setPhone(phoneStr.replace(/ext\s*(\w+)/i, "").trim());
            setPhoneExt(extMatch[1]);
          } else {
            setPhone(phoneStr);
          }
        }
        if (data.email) setEmail(data.email);
        if (data.address) {
          setAddress(data.address.street || "");
          setUnit(data.address.unit || "");
          setCity(data.address.city || "");
          setState(data.address.region || "");
          setZip(data.address.postal_code || "");
          setCountry(data.address.country || "United States");
        }
        if (data.service_area) setServiceArea(data.service_area);
        if (data.job_type) setJobType(data.job_type);
        if (data.job_source) setJobSource(data.job_source);
        if (data.description) setDescription(data.description);
        if (data.assigned_tech) setAssignedTech(data.assigned_tech);

        toast.success(
          `Loaded duplicate details from job #${String(data._id).substring(String(data._id).length - 4)}`
        );
      }
    } catch (err) {
      console.error("Failed to load source job for duplicate:", err);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchServiceAreas();
    fetchJobTypes();
    fetchJobSources();
    fetchTechs();
  }, [router]);

  useEffect(() => {
    if (router.query.date) {
      setStartDate(String(router.query.date));
      setEndDate(String(router.query.date));
    }
    if (router.query.time) {
      setStartTime(String(router.query.time));
    }
  }, [router.query]);

  const fetchClients = async () => {
    try {
      const res = await Api("GET", "api/clients", null, router);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setAllClients(list);
    } catch (err) {
      console.error("Error fetching clients:", err);
    }
  };

  const fetchServiceAreas = async () => {
    try {
      const res = await Api("GET", "api/service-areas", null, router);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setAllServiceAreas(list);
    } catch (err) {
      console.error("Error fetching service areas:", err);
    }
  };

  const fetchJobTypes = async () => {
    try {
      const res = await Api("GET", "api/job-types", null, router);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setAllJobTypes(list);
    } catch (err) {
      console.error("Error fetching job types:", err);
    }
  };

  const fetchJobSources = async () => {
    try {
      const res = await Api("GET", "api/ad-groups", null, router);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setAllJobSources(list);
    } catch (err) {
      console.error("Error fetching ad groups:", err);
    }
  };

  const fetchTechs = async () => {
    try {
      const res = await Api("GET", "api/teams", null, router);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      if (list.length > 0) {
        const names = list.map((t) => t.name || `${t.first_name || ""} ${t.last_name || ""}`.trim()).filter(Boolean);
        if (names.length > 0) setAvailableTechs(names);
      }
    } catch (err) {}
  };

  const filteredClients = useMemo(() => {
    if (!clientName.trim()) return allClients;
    const q = clientName.toLowerCase();
    return allClients.filter((c) => {
      const name = `${c.first_name || ""} ${c.last_name || ""}`.toLowerCase();
      const comp = (c.company_name || "").toLowerCase();
      const em = (c.email || "").toLowerCase();
      return name.includes(q) || comp.includes(q) || em.includes(q);
    });
  }, [allClients, clientName]);

  const handleSelectClientItem = (c) => {
    const fullName = `${c.first_name || ""} ${c.last_name || ""}`.trim();
    setClientName(fullName || c.company_name || "Client");
    setCompanyName(c.company_name || "");
    setPhone(c.phone || "");
    setPhoneExt(c.phone_ext || "");
    setEmail(c.email || "");
    if (c.address) {
      setAddress(c.address.street || "");
      setUnit(c.address.unit || "");
      setCity(c.address.city || "");
      setState(c.address.region || "");
      setZip(c.address.postal_code || "");
      setCountry(c.address.country || "United States");
    }
    setShowClientMenu(false);
    toast.success(`Loaded client: ${fullName || c.company_name}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientName.trim()) {
      toast.error("Please enter a client name");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: jobType ? `${jobType} - ${clientName}` : `${isLead ? "Lead" : "Job"} for ${clientName}`,
        client_name: clientName,
        company_name: companyName,
        phone: phone + (phoneExt ? ` ext ${phoneExt}` : ""),
        email,
        address: {
          street: address,
          unit,
          city,
          region: state,
          postal_code: zip,
          country,
        },
        service_area: serviceArea,
        job_type: jobType,
        job_source: jobSource,
        description,
        assigned_tech: assignedTech || "",
        assigned_techs: assignedTech ? [assignedTech] : [],
        team_member_names: assignedTech ? [assignedTech] : [],
        status: isLead ? "new" : "Submitted",
        is_lead: Boolean(isLead),
        lead_status: isLead ? "new" : undefined,
        is_scheduled: isScheduled,
        schedule_status: isScheduled ? "scheduled" : "unscheduled",
        schedule: isScheduled ? {
          start_date: startDate,
          start_time: startTime,
          end_date: endDate,
          end_time: endTime,
          is_all_day: allDayEvent,
        } : null,
      };

      const res = await Api("POST", "api/events", payload, router);
      const createdObj = res?.data || res || {};
      const newId = createdObj._id || createdObj.id || "1065";
      if (isLead) {
        toast.success("New Lead created successfully!");
        router.push("/leads");
      } else {
        toast.success("New Job created successfully!");
        router.push(`/jobs/${newId}`);
      }
    } catch (err) {
      console.error("Error creating record:", err);
      toast.error(err?.message || "Failed to create record");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 pt-6 sm:pt-8 text-slate-800 dark:text-slate-100">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {isLead ? "New Lead" : "New Job"}
        </h1>
        <button
          type="button"
          onClick={() => router.push(isLead ? "/leads" : "/jobs")}
          className="text-xs font-bold text-slate-500 hover:text-[#D31010] flex items-center gap-1 cursor-pointer"
        >
          <Minus className="w-4 h-4" />
          <span>Minimize</span>
        </button>
      </div>

      {/* Conditional Duplicated Job Banner (Screenshot 2) */}
      <AnimatePresence>
        {isDuplicatedBannerVisible && duplicatedFrom && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm flex items-center justify-between"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-300">
                <Wrench className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Duplicated job
                </h4>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  From job #{duplicatedFrom._id ? String(duplicatedFrom._id).substring(String(duplicatedFrom._id).length - 4) : router.query.duplicate_from} - {duplicatedFrom.job_type || duplicatedFrom.title || "Tv Installation"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsDuplicatedBannerVisible(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CARD 1: Client Details */}
          <div className="p-5 sm:p-6 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
              Client Details
            </h3>

            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Client name"
                  value={clientName}
                  onChange={(e) => {
                    setClientName(e.target.value);
                    setShowClientMenu(true);
                  }}
                  onFocus={() => setShowClientMenu(true)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                />

                <AnimatePresence>
                  {showClientMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 5, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.98 }}
                      className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs"
                    >
                      {clientName.trim() !== "" && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowClientMenu(false);
                            toast.success(`New client "${clientName}" selected for this job`);
                          }}
                          className="w-full text-left px-4 py-3 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-extrabold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Plus className="w-4 h-4 text-[#D31010]" />
                          <span>+ Add new &quot;{clientName}&quot;</span>
                        </button>
                      )}

                      {filteredClients.length > 0 ? (
                        filteredClients.map((c) => {
                          const shortId = c._id ? `#${c._id.substring(c._id.length - 4)}` : `#2550`;
                          const fullName = `${c.first_name || ""} ${c.last_name || ""}`.trim() || "Client";
                          const fullAddr = c.address
                            ? `${c.address.street || ""} ${c.address.city || ""}`.trim()
                            : "";

                          return (
                            <button
                              key={c._id || c.id}
                              type="button"
                              onClick={() => handleSelectClientItem(c)}
                              className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors flex items-start gap-2.5 cursor-pointer group"
                            >
                              <User className="w-4 h-4 text-slate-400 group-hover:text-[#D31010] flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <div className="font-extrabold text-slate-900 dark:text-white group-hover:text-[#D31010]">
                                  {fullName} <span className="text-slate-400 font-normal">({shortId})</span>
                                </div>
                                {(fullAddr || c.email || c.company_name) && (
                                  <div className="text-[11px] text-slate-400 dark:text-slate-400 truncate mt-0.5">
                                    {fullAddr || c.email || c.company_name}
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        !clientName.trim() && (
                          <div className="p-4 text-center text-slate-400 font-semibold">
                            No clients found. Type to search or add.
                          </div>
                        )
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Company name"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Ext"
                    value={phoneExt}
                    onChange={(e) => setPhoneExt(e.target.value)}
                    className="w-16 px-2 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => toast.success("Added phone field")}
                  className="text-xs font-bold text-[#D31010] hover:underline cursor-pointer"
                >
                  + Add phone
                </button>
              </div>
            </div>
          </div>

          {/* CARD 2: Service Location */}
          <div className="p-5 sm:p-6 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
              Service Location
            </h3>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <input
                    type="text"
                    placeholder="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input
                    type="text"
                    placeholder="Zip"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <span className="block text-[9px] font-extrabold uppercase text-slate-400 absolute left-3.5 top-1 pointer-events-none">
                    COUNTRY
                  </span>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3.5 pt-4 pb-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none appearance-none cursor-pointer text-slate-800 dark:text-slate-200"
                  >
                    {country && !countries.includes(country) && (
                      <option value={country}>{country}</option>
                    )}
                    {countries.map((cName) => (
                      <option key={cName} value={cName}>
                        {cName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="relative">
                <select
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none appearance-none cursor-pointer text-slate-800 dark:text-slate-200"
                >
                  <option value="">Service area</option>
                  {allServiceAreas.length > 0 ? (
                    allServiceAreas.map((sa) => (
                      <option key={sa._id || sa.id || sa.name} value={sa.name}>
                        {sa.name}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="North Region">North Region</option>
                      <option value="Central Metro">Central Metro</option>
                    </>
                  )}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* CARD 3: Job Details */}
          <div className="p-5 sm:p-6 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
              Job Details
            </h3>

            <div className="space-y-3">
              <div className="relative">
                <select
                  value={jobType}
                  onChange={(e) => {
                    if (e.target.value === "ADD_NEW_JOB_TYPE") {
                      setIsAddJobTypeModalOpen(true);
                    } else {
                      setJobType(e.target.value);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none appearance-none cursor-pointer text-slate-800 dark:text-slate-200 font-semibold"
                >
                  <option value="">Job type</option>
                  <option value="ADD_NEW_JOB_TYPE" className="text-[#D31010] font-extrabold bg-red-50 dark:bg-red-950/50">
                    + Add new
                  </option>
                  {allJobTypes.length > 0
                    ? allJobTypes.map((jt) => (
                        <option key={jt._id || jt.id || jt.name} value={jt.name}>
                          {jt.name}
                        </option>
                      ))
                    : [
                        "Tv Installation",
                        "Mounting",
                        "Security Camera",
                        "Electrical",
                        "Plumbing",
                      ].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={jobSource}
                  onChange={(e) => {
                    if (e.target.value === "ADD_NEW_JOB_SOURCE") {
                      setIsAddAdGroupModalOpen(true);
                    } else {
                      setJobSource(e.target.value);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none appearance-none cursor-pointer text-slate-800 dark:text-slate-200 font-semibold"
                >
                  <option value="">Job source</option>
                  <option value="ADD_NEW_JOB_SOURCE" className="text-[#D31010] font-extrabold bg-red-50 dark:bg-red-950/50">
                    + Add new
                  </option>
                  {allJobSources.length > 0
                    ? allJobSources.map((js) => (
                        <option key={js._id || js.id || js.name} value={js.name}>
                          {js.name}
                        </option>
                      ))
                    : [
                        "UR CHANNEL",
                        "Google",
                        "Capture TV",
                        "COMMERCIAL TV INSTALLATION",
                        "Yelp",
                        "Facebook",
                        "Home Advisor",
                      ].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                </select>
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {/* Rich Text Editor Toolbar + Textarea (Screenshot 2) */}
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
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" className="p-1 hover:text-slate-900 dark:hover:text-white">
                    <LinkIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
                <textarea
                  rows={4}
                  placeholder="Job description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-transparent text-xs focus:outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* CARD 4: Scheduled Section */}
          <div className="p-5 sm:p-6 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isScheduled ? "Scheduled" : "Unscheduled"}
              </h3>
              <button
                type="button"
                onClick={() => setIsScheduled(!isScheduled)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  isScheduled ? "bg-slate-400 dark:bg-slate-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    isScheduled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {isScheduled ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <span className="block text-[9px] font-extrabold uppercase text-slate-400 absolute left-3 top-1 pointer-events-none">
                      STARTS
                    </span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 pt-4 pb-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div className="relative">
                    <span className="block text-[9px] font-extrabold uppercase text-slate-400 absolute left-3 top-1 pointer-events-none">
                      AT
                    </span>
                    <select
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 pt-4 pb-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="05:15 PM">05:15 PM</option>
                      <option value="06:15 PM">06:15 PM</option>
                      <option value="11:00 AM">11:00 AM</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <span className="block text-[9px] font-extrabold uppercase text-slate-400 absolute left-3 top-1 pointer-events-none">
                      ENDS
                    </span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 pt-4 pb-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div className="relative">
                    <span className="block text-[9px] font-extrabold uppercase text-slate-400 absolute left-3 top-1 pointer-events-none">
                      AT
                    </span>
                    <select
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 pt-4 pb-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="06:15 PM">06:15 PM</option>
                      <option value="07:15 PM">07:15 PM</option>
                      <option value="12:00 PM">12:00 PM</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allDayEvent}
                      onChange={(e) => setAllDayEvent(e.target.checked)}
                      className="w-4 h-4 rounded text-[#D31010] accent-[#D31010]"
                    />
                    <span>All-day event</span>
                  </label>
                </div>

                <div className="relative">
                  <select
                    value={assignedTech}
                    onChange={(e) => setAssignedTech(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none appearance-none cursor-pointer text-slate-800 dark:text-slate-200"
                  >
                    <option value="">Assign team members</option>
                    {availableTechs.map((techName) => (
                      <option key={techName} value={techName}>
                        {techName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                <div className="flex items-center justify-between pt-2">
                  {!serviceArea ? (
                    <span className="text-[11px] font-bold text-[#D31010] max-w-[220px]">
                      Please select a service area to display available techs
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-800 dark:text-slate-200 max-w-[280px]">
                      <strong className="font-extrabold">{availableTechs.length} techs</strong> work in{" "}
                      <strong className="font-extrabold text-[#D31010]">{serviceArea}</strong> and can perform{" "}
                      <strong className="font-extrabold">{jobType || "any job type"}</strong>
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsScheduleModalOpen(true)}
                    className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-slate-400 flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-500" />
                    <span>View schedule</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-10 flex flex-col items-center justify-center text-center">
                <div className="relative w-32 h-32 flex items-center justify-center mb-2">
                  <svg viewBox="0 0 140 140" className="w-28 h-28 drop-shadow-sm">
                    <ellipse cx="70" cy="120" rx="40" ry="6" fill="#000" opacity="0.08" />
                    <rect x="25" y="38" width="80" height="74" rx="10" fill="#E2E8F0" stroke="#334155" strokeWidth="2.5" transform="rotate(-3 65 75)" />
                    <rect x="28" y="34" width="80" height="74" rx="10" fill="#FFFFFF" stroke="#334155" strokeWidth="2.5" />
                    <path d="M28 44 C28 38.5 32.5 34 38 34 L98 34 C103.5 34 108 38.5 108 44 L108 56 L28 56 Z" fill="#FBBF24" stroke="#334155" strokeWidth="2.5" />
                    <circle cx="44" cy="30" r="5.5" fill="#FFFFFF" stroke="#334155" strokeWidth="2.5" />
                    <circle cx="68" cy="30" r="5.5" fill="#FFFFFF" stroke="#334155" strokeWidth="2.5" />
                    <circle cx="92" cy="30" r="5.5" fill="#FFFFFF" stroke="#334155" strokeWidth="2.5" />
                    <line x1="28" y1="74" x2="108" y2="74" stroke="#CBD5E1" strokeWidth="2" />
                    <line x1="28" y1="92" x2="108" y2="92" stroke="#CBD5E1" strokeWidth="2" />
                    <line x1="55" y1="56" x2="55" y2="108" stroke="#CBD5E1" strokeWidth="2" />
                    <line x1="81" y1="56" x2="81" y2="108" stroke="#CBD5E1" strokeWidth="2" />
                  </svg>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                  This job is unscheduled
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Bar (Cancel & Solid Red #D31010 Save Job Button) */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => router.push(isLead ? "/leads" : "/jobs")}
            className="px-6 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>{isLead ? "Saving Lead..." : "Saving Job..."}</span>
              </>
            ) : (
              <span>{isLead ? "Save Lead" : "Save Job"}</span>
            )}
          </button>
        </div>
      </form>

      {/* View Schedule Modal */}
      <ViewScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onSetSchedule={(slot) => {
          toast.success(`Schedule set: ${slot}`);
        }}
      />

      {/* Add New Client Modal */}
      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => {
          setIsAddClientModalOpen(false);
          fetchClients();
        }}
      />

      {/* Add New Job Type Modal */}
      <AddJobTypeModal
        isOpen={isAddJobTypeModalOpen}
        onClose={() => setIsAddJobTypeModalOpen(false)}
        onCreated={(newType) => {
          fetchJobTypes();
          if (newType?.name) setJobType(newType.name);
        }}
      />

      {/* Add New Ad Group / Job Source Modal */}
      <AddAdGroupModal
        isOpen={isAddAdGroupModalOpen}
        onClose={() => setIsAddAdGroupModalOpen(false)}
        onCreated={(newSource) => {
          fetchJobSources();
          if (newSource?.name) setJobSource(newSource.name);
        }}
      />
    </div>
  );
}
