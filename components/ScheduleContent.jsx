import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  SlidersHorizontal,
  Plus,
  Clock,
  User,
  CheckCircle,
  Edit2,
  ExternalLink,
  X,
  Phone,
  MessageSquare,
  MapPin,
  Trash2,
  CalendarPlus,
  GripVertical,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";
import CreateChoiceModal from "./CreateChoiceModal";
import AddEventDrawer from "./AddEventDrawer";
import EditJobDrawer from "./EditJobDrawer";
import AddTimeOffModal from "./AddTimeOffModal";
import ViewTimeOffModal from "./ViewTimeOffModal";

export default function ScheduleContent() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 20));

  const [jobsList, setJobsList] = useState([]);
  const [timeOffList, setTimeOffList] = useState([]);
  const [isUnscheduledDrawerOpen, setIsUnscheduledDrawerOpen] = useState(false);

  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isEventDrawerOpen, setIsEventDrawerOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEditJobDrawerOpen, setIsEditJobDrawerOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const [isAddTimeOffOpen, setIsAddTimeOffOpen] = useState(false);
  const [editingTimeOff, setEditingTimeOff] = useState(null);
  const [selectedTimeOff, setSelectedTimeOff] = useState(null);
  const [isViewTimeOffOpen, setIsViewTimeOffOpen] = useState(false);

  const [selectedSlotInfo, setSelectedSlotInfo] = useState("Thu, Aug 20 • 07:45 AM - 07:50 AM");
  const [selectedSlotDate, setSelectedSlotDate] = useState("2026-08-20");
  const [selectedSlotTime, setSelectedSlotTime] = useState("13:00");
  const [selectedSlotTime12, setSelectedSlotTime12] = useState("01:00 PM");
  const [selectedJobDetails, setSelectedJobDetails] = useState(null);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const [availableSubStatuses, setAvailableSubStatuses] = useState([]);

  useEffect(() => {
    const fetchSubStatuses = async () => {
      try {
        const res = await Api("GET", "api/sub-statuses", null, router);
        const data = res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(data)) {
          setAvailableSubStatuses(data);
        }
      } catch (e) {
        console.error("SubStatus fetch error:", e);
      }
    };
    fetchSubStatuses();
  }, [router]);

  const formatToYMD = (dNum) => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, "0");
    const d = String(dNum).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const convertHourTo24 = (hStr) => {
    let hour = parseInt(hStr, 10);
    const upper = String(hStr).toUpperCase();
    if (upper.includes("PM") && hour < 12) hour += 12;
    if (upper.includes("AM") && hour === 12) hour = 0;
    return `${String(hour).padStart(2, "0")}:00`;
  };

  const convertHourTo12 = (hStr) => {
    const upper = String(hStr).toUpperCase();
    if (upper.includes("AM") || upper.includes("PM")) {
      let num = parseInt(hStr, 10);
      return `${String(num).padStart(2, "0")}:00 ${upper.includes("PM") ? "PM" : "AM"}`;
    }
    let num = parseInt(hStr, 10);
    const period = num >= 12 ? "PM" : "AM";
    let h12 = num % 12;
    if (h12 === 0) h12 = 12;
    return `${String(h12).padStart(2, "0")}:00 ${period}`;
  };

  const handleCellClick = (slotText, dNum = 20, hStr = "7 AM", customDateStr = null) => {
    const dateStr = customDateStr || formatToYMD(dNum);
    const time24 = convertHourTo24(hStr);
    const time12 = convertHourTo12(hStr);
    setSelectedSlotInfo(slotText);
    setSelectedSlotDate(dateStr);
    setSelectedSlotTime(time24);
    setSelectedSlotTime12(time12);
    setIsChoiceModalOpen(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!eventId) return;
    try {
      const res = await Api("DELETE", `api/events/${eventId}`, null, router);
      if (res && (res.success || res.message)) {
        toast.success("Event deleted successfully!");
        setSelectedEventDetails(null);
        fetchEvents();
      } else {
        toast.error("Failed to delete event");
      }
    } catch (err) {
      toast.error("Error deleting event");
    }
  };

  const fetchEvents = async () => {
    try {
      const res = await Api("GET", "api/events", null, router);
      if (res) {
        const raw = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
        const nonLeads = raw.filter((e) => !e.is_lead && e.type !== "lead" && e.status !== "lead");
        if (nonLeads.length > 0) {
          const mapped = nonLeads.map((e) => {
            const isEvent = Boolean(e.is_event || (!e.client_name && !e.job_type));
            const addr = e.address;
            const formattedAddr = typeof addr === "object"
              ? `${addr.street || ""} ${addr.unit || ""}, ${addr.city || ""}, ${addr.region || ""} ${addr.postal_code || ""}`.trim()
              : (e.address || "");
            const isUnscheduled = e.is_scheduled === false || String(e.status).toLowerCase() === "unscheduled" || e.schedule_status === "unscheduled" || (!e.schedule?.start_date && !e.schedule?.start_time);
            return {
              id: e._id || e.id || "1065",
              _id: e._id || e.id || "1065",
              jobId: e._id ? e._id.substring(e._id.length - 4) : "1065",
              title: e.title || e.event_name || (isEvent ? "Event" : "Job"),
              clientName: e.client_name || "",
              companyName: e.company_name || "",
              phone: e.phone || "",
              address: formattedAddr || "",
              tech: e.assigned_tech || (Array.isArray(e.assigned_techs) ? e.assigned_techs[0] : (Array.isArray(e.team_members) ? e.team_members[0] : "PIXL TECHNICIAN")),
              assignedTechs: Array.isArray(e.assigned_techs) && e.assigned_techs.length > 0 ? e.assigned_techs : (Array.isArray(e.team_members) ? e.team_members : ["PIXL TECHNICIAN"]),
              status: e.status || (isEvent ? "Open" : "Submitted"),
              status_color: e.status_color || "",
              sub_status: e.sub_status || "",
              isEvent,
              isUnscheduled,
              is_scheduled: !isUnscheduled,
              schedule_status: isUnscheduled ? "unscheduled" : "scheduled",
              jobType: e.job_type || "",
              serviceArea: e.service_area || "Edmonton",
              total_amount: e.total_amount || 0,
              balance_due: e.total_amount || 0,
              notes: e.description || "",
              description: e.description || "",
              startDate: e.schedule?.start_date ? String(e.schedule.start_date).split("T")[0] : (isUnscheduled ? "" : "2026-08-20"),
              startTime: e.schedule?.start_time || "07:45 AM",
              endDate: e.schedule?.end_date ? String(e.schedule.end_date).split("T")[0] : (isUnscheduled ? "" : "2026-08-20"),
              endTime: e.schedule?.end_time || "07:50 AM",
              isAllDay: e.schedule?.is_all_day || false,
            };
          });
          setJobsList(mapped);
        }
      }
    } catch (err) {
      console.error("Error fetching schedule events:", err);
    }
  };

  const [scheduleSettings, setScheduleSettings] = useState({
    always_open: true,
    open_on_holidays: true,
    visible_start_hour: "5:00 am",
    visible_end_hour: "7:00 pm",
    show_done_jobs: false,
    appointment_color_by: "Tech",
    schedule_template: "{{tags}}{{client_name}} {{company_name}} {{job_type}} - {{job_address}}",
    business_days: [],
  });

  const fetchScheduleSettings = async () => {
    try {
      const res = await Api("GET", "api/schedule-settings", null, router);
      if (res && (res.data || res.success)) {
        const data = res.data || res;
        setScheduleSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {}
  };

  const fetchTimeOffs = async () => {
    try {
      const res = await Api("GET", "api/time-off", null, router);
      if (res && res.success && Array.isArray(res.data)) {
        setTimeOffList(res.data);
      }
    } catch (err) {
      console.error("Error fetching time off:", err);
    }
  };

  const handleDeleteTimeOff = async (to) => {
    try {
      const id = to._id || to.id;
      const res = await Api("DELETE", `api/time-off/${id}`);
      if (res && res.success) {
        toast.success("Time off deleted");
        setIsViewTimeOffOpen(false);
        fetchTimeOffs();
      } else {
        toast.error(res?.message || "Failed to delete time off");
      }
    } catch (err) {
      toast.error("Error deleting time off");
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchScheduleSettings();
    fetchTimeOffs();
  }, [router]);

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "day" || viewMode === "timeline") {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === "week" || viewMode === "timeline_week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "day" || viewMode === "timeline") {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === "week" || viewMode === "timeline_week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 7, 20));
  };

  const getHeaderDateText = () => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  const hours = useMemo(() => {
    const parseToHourNum = (str) => {
      const clean = String(str || "").toLowerCase().trim();
      let h = parseInt(clean, 10);
      if (clean.includes("pm") && h < 12) h += 12;
      if (clean.includes("am") && h === 12) h = 0;
      return isNaN(h) ? 5 : h;
    };

    let startH = parseToHourNum(scheduleSettings.visible_start_hour || "5:00 am");
    let endH = parseToHourNum(scheduleSettings.visible_end_hour || "7:00 pm");
    if (endH < startH) endH = Math.min(23, startH + 12);

    const list = [];
    for (let h = startH; h <= endH; h++) {
      const period = h >= 12 ? "PM" : "AM";
      let h12 = h % 12;
      if (h12 === 0) h12 = 12;
      list.push(`${h12} ${period}`);
    }
    return list.length > 0
      ? list
      : [
          "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM",
          "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM"
        ];
  }, [scheduleSettings.visible_start_hour, scheduleSettings.visible_end_hour]);

  const unscheduledJobs = useMemo(() => {
    return jobsList.filter((j) => j.isUnscheduled || j.is_scheduled === false || String(j.status).toLowerCase() === "unscheduled" || !j.startDate);
  }, [jobsList]);

  const scheduledJobs = useMemo(() => {
    return jobsList.filter((j) => !j.isUnscheduled && j.is_scheduled !== false && String(j.status).toLowerCase() !== "unscheduled" && Boolean(j.startDate));
  }, [jobsList]);

  const visibleJobs = useMemo(() => {
    const list = scheduledJobs;
    if (scheduleSettings.show_done_jobs) return list;
    return list.filter((j) => {
      const st = String(j.status || "").toLowerCase();
      return st !== "done" && st !== "completed";
    });
  }, [scheduledJobs, scheduleSettings.show_done_jobs]);

  const timelineHours = [
    "01 AM", "02 AM", "03 AM", "04 AM", "05 AM", "06 AM", "07 AM", "08 AM",
    "09 AM", "10 AM", "11 AM", "12 PM", "01 PM", "02 PM", "03 PM", "04 PM"
  ];

  const getWeekDays = (baseDate) => {
    const d = new Date(baseDate);
    const dayOfWeek = d.getDay();
    const sun = new Date(d);
    sun.setDate(d.getDate() - dayOfWeek);

    const daysArr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return daysArr.map((dayName, idx) => {
      const curr = new Date(sun);
      curr.setDate(sun.getDate() + idx);
      const isCurrent =
        curr.getDate() === d.getDate() &&
        curr.getMonth() === d.getMonth() &&
        curr.getFullYear() === d.getFullYear();
      const y = curr.getFullYear();
      const m = String(curr.getMonth() + 1).padStart(2, "0");
      const dayNumStr = String(curr.getDate()).padStart(2, "0");
      return {
        day: dayName,
        date: curr.getDate(),
        dateStr: `${y}-${m}-${dayNumStr}`,
        isCurrent,
      };
    });
  };

  const getMonthGrid = (baseDate) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const grid = [];
    let row = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dNum = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, dNum);
      const y = prevDate.getFullYear();
      const m = String(prevDate.getMonth() + 1).padStart(2, "0");
      const dStr = String(dNum).padStart(2, "0");
      row.push({
        date: dNum,
        isOutside: true,
        dateStr: `${y}-${m}-${dStr}`,
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const y = year;
      const m = String(month + 1).padStart(2, "0");
      const dStr = String(i).padStart(2, "0");
      const isCurrent =
        i === currentDate.getDate() &&
        month === currentDate.getMonth() &&
        year === currentDate.getFullYear();
      row.push({
        date: i,
        isOutside: false,
        isCurrent,
        dateStr: `${y}-${m}-${dStr}`,
      });
      if (row.length === 7) {
        grid.push(row);
        row = [];
      }
    }

    let nextDay = 1;
    while (row.length > 0 && row.length < 7) {
      const nextDate = new Date(year, month + 1, nextDay);
      const y = nextDate.getFullYear();
      const m = String(nextDate.getMonth() + 1).padStart(2, "0");
      const dStr = String(nextDay).padStart(2, "0");
      row.push({
        date: nextDay,
        isOutside: true,
        dateStr: `${y}-${m}-${dStr}`,
      });
      nextDay++;
    }
    if (row.length === 7) grid.push(row);

    while (grid.length < 6) {
      const extraRow = [];
      for (let i = 0; i < 7; i++) {
        const nextDate = new Date(year, month + 1, nextDay);
        const y = nextDate.getFullYear();
        const m = String(nextDate.getMonth() + 1).padStart(2, "0");
        const dStr = String(nextDay).padStart(2, "0");
        extraRow.push({
          date: nextDay,
          isOutside: true,
          dateStr: `${y}-${m}-${dStr}`,
        });
        nextDay++;
      }
      grid.push(extraRow);
    }
    return grid;
  };

  const weekDays = getWeekDays(currentDate);
  const monthGridDays = getMonthGrid(currentDate);

  const getJobsForCell = (hStr, wd) => {
    return visibleJobs.filter((job) => {
      let jobHour = null;
      const rawTime = String(job.startTime || "").trim();
      if (rawTime) {
        if (rawTime.includes(":")) {
          const [hPart] = rawTime.split(":");
          let parsedH = parseInt(hPart, 10);
          const upper = rawTime.toUpperCase();
          if (upper.includes("PM") && parsedH < 12) {
            parsedH += 12;
          } else if (upper.includes("AM") && parsedH === 12) {
            parsedH = 0;
          }
          jobHour = parsedH;
        } else {
          jobHour = parseInt(rawTime, 10);
        }
      }
      if (jobHour === null || isNaN(jobHour)) jobHour = 7;

      let cellHour = parseInt(hStr, 10);
      const upperHStr = String(hStr).toUpperCase();
      if (upperHStr.includes("PM") && cellHour < 12) cellHour += 12;
      if (upperHStr.includes("AM") && cellHour === 12) cellHour = 0;

      const hourMatch = jobHour === cellHour;
      if (!wd) return hourMatch;

      if (job.startDate && wd.dateStr) {
        const cleanJobDate = String(job.startDate).split("T")[0];
        return hourMatch && cleanJobDate === wd.dateStr;
      }

      let jobDateNum = null;
      if (job.startDate) {
        const cleanStr = String(job.startDate).split("T")[0];
        const parts = cleanStr.split("-");
        if (parts.length === 3) {
          jobDateNum = parseInt(parts[2], 10);
        }
      }
      if (jobDateNum === null || isNaN(jobDateNum)) {
        jobDateNum = 20;
      }

      const targetDateNum = typeof wd === "object" ? wd.date : parseInt(wd, 10);
      const dayMatch = jobDateNum === targetDateNum;

      return hourMatch && dayMatch;
    });
  };

  const handleJobDrop = async (draggedJob, targetDateNum, targetHourStr, customDateStr = null) => {
    if (!draggedJob?.id && !draggedJob?._id) return;
    const targetId = draggedJob._id || draggedJob.id;
    const newDateStr = customDateStr || formatToYMD(targetDateNum);
    const newTime24 = convertHourTo24(targetHourStr);
    const newTime12 = convertHourTo12(targetHourStr);

    const updatedTime = draggedJob.isEvent ? newTime24 : newTime12;
    const updatedEndTime = draggedJob.isEvent
      ? `${String((parseInt(newTime24, 10) + 1) % 24).padStart(2, "0")}:00`
      : `${String((parseInt(newTime12, 10) + 1) % 12 || 12).padStart(2, "0")}:00 ${newTime12.includes("PM") ? "PM" : "AM"}`;

    setJobsList((prev) =>
      prev.map((j) => {
        if ((j._id || j.id) === targetId) {
          return {
            ...j,
            isUnscheduled: false,
            is_scheduled: true,
            schedule_status: "scheduled",
            status: j.status === "Unscheduled" ? "Submitted" : j.status,
            startDate: newDateStr,
            endDate: newDateStr,
            startTime: updatedTime,
            endTime: updatedEndTime,
          };
        }
        return j;
      })
    );

    try {
      const payload = {
        is_scheduled: true,
        schedule_status: "scheduled",
        status: draggedJob.status === "Unscheduled" ? "Submitted" : draggedJob.status,
        schedule: {
          start_date: newDateStr,
          start_time: updatedTime,
          end_date: newDateStr,
          end_time: updatedEndTime,
          is_all_day: draggedJob.isAllDay || false,
        },
      };
      const res = await Api("PUT", `api/events/${targetId}`, payload, router);
      if (res && (res.success || res.data || res._id)) {
        toast.success(`Scheduled to ${newDateStr} at ${targetHourStr}`);
        fetchEvents();
      } else {
        toast.error(res?.message || "Failed to update schedule");
        fetchEvents();
      }
    } catch (err) {
      toast.error("Error updating schedule");
      fetchEvents();
    }
  };

  const [draggedJobId, setDraggedJobId] = useState(null);

  const formatJobCardText = (job) => {
    if (job.isEvent) {
      return `${job.title || "Event"}${job.notes ? ` - ${job.notes}` : ""}`;
    }
    const template = scheduleSettings.schedule_template || "{{tags}}{{client_name}} {{company_name}} {{job_type}} - {{job_address}}";
    const cleanTags = Array.isArray(job.tags) ? job.tags.join(", ") : (job.tags || "");
    const map = {
      "{{job_id}}": job.jobId || job.id || "",
      "{{client_name}}": job.clientName || "",
      "{{first_name}}": (job.clientName || "").split(" ")[0] || "",
      "{{last_name}}": (job.clientName || "").split(" ").slice(1).join(" ") || "",
      "{{company_name}}": job.companyName || "",
      "{{phone_number}}": job.phone || "",
      "{{job_type}}": job.jobType || "Service",
      "{{job_address}}": job.address || "",
      "{{city}}": "",
      "{{state}}": "",
      "{{zip_code}}": "",
      "{{tech_assigned}}": job.tech || "PIXL TECHNICIAN",
      "{{tags}}": cleanTags ? `${cleanTags} ` : "",
      "{{job_name}}": job.title || "",
    };
    let text = template;
    Object.keys(map).forEach((k) => {
      text = text.replaceAll(k, map[k]);
    });
    return text.trim() || `${job.clientName} ${job.companyName}`;
  };

  const getJobStatusColorHex = (job) => {
    if (job.isEvent) return "#334155";
    if (job.status_color) return job.status_color;

    const st = String(job.status || "").toLowerCase().trim();
    const subSt = String(job.sub_status || "").toLowerCase().trim();

    const foundSub = availableSubStatuses.find(
      (s) =>
        (s.name || "").toLowerCase().trim() === st ||
        (s.name || "").toLowerCase().trim() === subSt
    );
    if (foundSub && foundSub.color) return foundSub.color;

    if (st.includes("progress")) return "#8B5CF6";
    if (st.includes("cancel")) return "#EF4444";
    if (st.includes("complete") || st === "done") return "#10B981";
    if (st === "pending" || (st.includes("pending") && !st.includes("approval"))) return "#F59E0B";
    if (st.includes("approval") || st.includes("done pending")) return "#2563EB";
    if (st.includes("submit") || st === "open" || st === "new") return "#3B82F6";

    return "#3B82F6";
  };

  const getJobCardColor = (job) => {
    return "";
  };

  const renderTimeOffPill = (to, dayObj) => {
    const sStr = String(new Date(to.start_date).toISOString()).split("T")[0];
    const eStr = to.end_date ? String(new Date(to.end_date).toISOString()).split("T")[0] : sStr;

    const targetDate = dayObj?.dateStr;
    const isStart = !targetDate || targetDate === sStr;
    const isEnd = !targetDate || targetDate === eStr;
    const isSun = dayObj?.day === "SUN" || dayObj?.day === "Sun";
    const isSat = dayObj?.day === "SAT" || dayObj?.day === "Sat";

    const isLeftCap = isStart || (isSun && targetDate > sStr);
    const isRightCap = isEnd || (isSat && targetDate < eStr);
    const showLabel = isLeftCap;

    let marginClasses = "-mx-1 px-1.5";
    let borderClasses = "border-y border-slate-300 dark:border-slate-600";
    let roundedClasses = "rounded-none";

    if (isLeftCap && isRightCap) {
      marginClasses = "mx-0 px-2";
      borderClasses = "border border-slate-300 dark:border-slate-600";
      roundedClasses = "rounded-xl";
    } else if (isLeftCap) {
      marginClasses = "-mr-1 ml-0 pl-2 pr-1";
      borderClasses = "border-y border-l border-slate-300 dark:border-slate-600";
      roundedClasses = "rounded-l-xl";
    } else if (isRightCap) {
      marginClasses = "-ml-1 mr-0 pl-1 pr-2";
      borderClasses = "border-y border-r border-slate-300 dark:border-slate-600";
      roundedClasses = "rounded-r-xl";
    }

    return (
      <div
        key={to._id || to.id}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedTimeOff(to);
          setIsViewTimeOffOpen(true);
        }}
        className={`h-7 flex items-center gap-1.5 py-1 bg-[repeating-linear-gradient(135deg,#e2e8f0,#e2e8f0_8px,#f1f5f9_8px,#f1f5f9_16px)] dark:bg-[repeating-linear-gradient(135deg,#334155,#334155_8px,#1e293b_8px,#1e293b_16px)] text-slate-900 dark:text-white text-[11px] font-extrabold cursor-pointer transition-all shadow-xs my-0.5 select-none overflow-hidden ${marginClasses} ${borderClasses} ${roundedClasses}`}
        title={`${to.reason} - ${to.user_name}`}
      >
        <span className="w-2 h-2 rounded-full bg-slate-900 dark:bg-slate-100 flex-shrink-0" />
        {showLabel && (
          <span className="truncate whitespace-nowrap">
            Time off | {to.user_name}
          </span>
        )}
      </div>
    );
  };

  const renderMonthTimeOffBar = (to, cellObj) => {
    const sStr = String(new Date(to.start_date).toISOString()).split("T")[0];
    const eStr = to.end_date ? String(new Date(to.end_date).toISOString()).split("T")[0] : sStr;

    const isStart = cellObj.dateStr === sStr;
    const isEnd = cellObj.dateStr === eStr;
    const isSunday = cellObj.day === "Sun";
    const isSaturday = cellObj.day === "Sat";

    const isLeftCap = isStart || (isSunday && cellObj.dateStr > sStr);
    const isRightCap = isEnd || (isSaturday && cellObj.dateStr < eStr);
    const showLabel = isStart || (isSunday && cellObj.dateStr > sStr);

    let marginClasses = "-mx-2 px-1";
    let borderClasses = "border-y border-slate-300 dark:border-slate-700";
    let roundedClasses = "rounded-none";

    if (isLeftCap && isRightCap) {
      marginClasses = "mx-0 px-2";
      borderClasses = "border border-slate-300 dark:border-slate-700";
      roundedClasses = "rounded-md";
    } else if (isLeftCap) {
      marginClasses = "-mr-2 ml-0 pl-2 pr-1";
      borderClasses = "border-y border-l border-slate-300 dark:border-slate-700";
      roundedClasses = "rounded-l-md";
    } else if (isRightCap) {
      marginClasses = "-ml-2 mr-0 pl-1 pr-2";
      borderClasses = "border-y border-r border-slate-300 dark:border-slate-700";
      roundedClasses = "rounded-r-md";
    }

    return (
      <div
        key={to._id || to.id}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedTimeOff(to);
          setIsViewTimeOffOpen(true);
        }}
        className={`h-6 flex items-center bg-[repeating-linear-gradient(135deg,#e2e8f0,#e2e8f0_8px,#f1f5f9_8px,#f1f5f9_16px)] dark:bg-[repeating-linear-gradient(135deg,#334155,#334155_8px,#1e293b_8px,#1e293b_16px)] text-slate-800 dark:text-slate-100 text-[11px] font-bold cursor-pointer transition-all shadow-xs my-1 select-none overflow-hidden ${marginClasses} ${borderClasses} ${roundedClasses}`}
        title={`${to.reason} - ${to.user_name}`}
      >
        {showLabel && (
          <span className="truncate whitespace-nowrap font-extrabold text-slate-900 dark:text-white pl-0.5">
            Time off | {to.user_name}
          </span>
        )}
      </div>
    );
  };

  const parseHourNumber = (str) => {
    if (!str) return 0;
    const s = String(str).toUpperCase().trim();
    const match = s.match(/(\d+)(?::(\d+))?\s*(AM|PM)?/);
    if (!match) return 0;
    let hr = parseInt(match[1], 10);
    const ampm = match[3];
    if (ampm === "PM" && hr < 12) hr += 12;
    if (ampm === "AM" && hr === 12) hr = 0;
    return hr;
  };

  const getTimeOffsForCell = (h, dayObj) => {
    if (!dayObj?.dateStr) return [];
    return timeOffList.filter((to) => {
      if (!to.start_date) return false;
      const sStr = String(new Date(to.start_date).toISOString()).split("T")[0];
      const eStr = to.end_date ? String(new Date(to.end_date).toISOString()).split("T")[0] : sStr;
      if (dayObj.dateStr < sStr || dayObj.dateStr > eStr) return false;
      if (to.is_all_day) return true;

      const cellH = parseHourNumber(h);
      const startH = parseHourNumber(to.start_time || "12:00 AM");
      const endH = parseHourNumber(to.end_time || to.start_time || "12:15 AM");

      if (dayObj.dateStr === sStr && cellH < startH) return false;
      if (dayObj.dateStr === eStr && cellH > endH) return false;
      return true;
    });
  };

  const renderJobPill = (job) => {
    const isEv = job.isEvent;
    const isCurrentlyDragged = draggedJobId === (job._id || job.id);
    return (
      <div
        key={job.id}
        draggable
        onDragStart={(e) => {
          setDraggedJobId(job._id || job.id);
          e.dataTransfer.setData("application/json", JSON.stringify(job));
          e.dataTransfer.effectAllowed = "move";
          try {
            const blankImg = new Image();
            blankImg.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1' height='1'></svg>";
            e.dataTransfer.setDragImage(blankImg, 0, 0);
          } catch (err) {}
        }}
        onDragEnd={() => {
          setDraggedJobId(null);
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (isEv) {
            setSelectedEventDetails(job);
          } else {
            setSelectedJobDetails(job);
          }
        }}
        style={{ backgroundColor: getJobStatusColorHex(job) }}
        className={`p-2 rounded-xl text-[11px] font-bold shadow-md cursor-grab active:cursor-grabbing border-l-4 border-white/40 hover:brightness-110 transition-all z-10 my-0.5 select-none text-white ${
          isCurrentlyDragged ? "opacity-30 scale-95" : "opacity-100"
        }`}
      >
        <div className="font-extrabold text-white text-xs">
          {isEv ? "Event" : `Job ID: ${job.jobId}`}
        </div>
        <div className="text-[10px] truncate text-white/90 font-semibold">
          {formatJobCardText(job)}
        </div>
      </div>
    );
  };

  const renderMonthJobItem = (job) => {
    const isEv = job.isEvent;
    const colorHex = getJobStatusColorHex(job);
    const timeStr = job.startTime || "09:00 AM";
    const badgeText = job.jobType || job.status || (isEv ? "Event" : "Job");
    const titleText = job.clientName || job.title || "";

    return (
      <div
        key={job._id || job.id}
        onClick={(e) => {
          e.stopPropagation();
          if (isEv) setSelectedEventDetails(job);
          else setSelectedJobDetails(job);
        }}
        className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer group truncate"
      >
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: colorHex }}
        />
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
          {timeStr}
        </span>
        <span
          className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded text-white shrink-0 shadow-2xs"
          style={{ backgroundColor: colorHex }}
        >
          {badgeText}
        </span>
        {titleText && (
          <span className="text-[10px] text-slate-700 dark:text-slate-300 font-medium truncate">
            {titleText}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-4 text-slate-800 dark:text-slate-100">
      {/* Top Header Control Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white dark:bg-[#0E1E31] p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToday}
            className="px-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-extrabold text-slate-800 dark:text-slate-200 hover:border-slate-400 transition-colors cursor-pointer"
          >
            Today
          </button>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight ml-2">
            {getHeaderDateText()}
          </h2>
        </div>

        {/* 5 View Modes Switcher */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <div className="p-1 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center gap-1 text-xs font-bold">
            {[
              { id: "day", label: "Day" },
              { id: "week", label: "Week" },
              { id: "month", label: "Month" },
              { id: "timeline", label: "Timeline" },
              { id: "timeline_week", label: "Timeline Week" },
            ].map((tab) => {
              const isActive = viewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setViewMode(tab.id)}
                  className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-white dark:bg-[#0E1E31] text-slate-900 dark:text-white shadow-sm"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
            <button
              type="button"
              onClick={() => setIsUnscheduledDrawerOpen(!isUnscheduledDrawerOpen)}
              className={`p-2 rounded-xl transition-all relative cursor-pointer flex items-center justify-center ${
                isUnscheduledDrawerOpen
                  ? "bg-[#D31010] text-white shadow-md shadow-red-500/20"
                  : "text-slate-500 hover:text-[#D31010] hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              title="Unscheduled Jobs"
            >
              <CalendarIcon className="w-4 h-4" />
              {unscheduledJobs.length > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 text-[10px] font-black bg-[#D31010] text-white rounded-full min-w-[17px] text-center border-2 border-white dark:border-[#0E1E31] shadow-xs">
                  {unscheduledJobs.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => toast.success("Calendar filter view")}
              className="p-2 text-slate-500 hover:text-[#D31010] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => router.push("/settings/schedule")}
              className="p-2 text-slate-500 hover:text-[#D31010] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CALENDAR VIEW CONTAINER (FULL WIDTH) */}
      <div className="w-full bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {/* VIEW 1: DAY VIEW */}
        {viewMode === "day" && (
          <div className="overflow-x-auto">
            <div className="border-b border-slate-200 dark:border-slate-800 py-3 text-center bg-slate-50/50 dark:bg-slate-900/40">
              <span className="block text-xs font-bold text-slate-500 uppercase">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][currentDate.getDay()]}
              </span>
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 font-extrabold text-xs mt-0.5">
                {currentDate.getDate()}
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[600px] overflow-y-auto">
              {hours.map((h, i) => {
                const dayDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`;
                const dayCellObj = {
                  day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][currentDate.getDay()],
                  date: currentDate.getDate(),
                  dateStr: dayDateStr,
                  isCurrent: true,
                };
                const cellJobs = getJobsForCell(h, dayCellObj);
                return (
                  <div
                    key={i}
                    onClick={() => handleCellClick(`${dayCellObj.day}, ${getHeaderDateText()} ${dayCellObj.date} • ${h}`, dayCellObj.date, h, dayDateStr)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                    }}
                    onDragEnter={(e) => {
                      e.currentTarget.classList.add("bg-red-50/60", "dark:bg-red-950/30");
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove("bg-red-50/60", "dark:bg-red-950/30");
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove("bg-red-50/60", "dark:bg-red-950/30");
                      const raw = e.dataTransfer.getData("application/json");
                      if (!raw) return;
                      try {
                        const item = JSON.parse(raw);
                        handleJobDrop(item, dayCellObj.date, h, dayDateStr);
                      } catch (err) {}
                    }}
                    className="flex min-h-[56px] group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <div className="w-20 p-2 text-right text-[11px] font-bold text-slate-400 border-r border-slate-200 dark:border-slate-800 select-none">
                      {h}
                    </div>
                    <div className="flex-1 relative p-1.5 space-y-1">
                      {getTimeOffsForCell(h, dayCellObj).map((to) => renderTimeOffPill(to, dayCellObj))}
                      {cellJobs.map(renderJobPill)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 2: WEEK VIEW (User Screenshot Match) */}
        {viewMode === "week" && (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-center">
              <div className="p-3 border-r border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-400">
                Time
              </div>
              {weekDays.map((wd) => (
                <div key={wd.day} className="py-2.5 border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                  <span className="block text-[11px] font-bold text-slate-500 uppercase">{wd.day}</span>
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-extrabold mt-0.5 ${
                      wd.isCurrent
                        ? "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900"
                        : "text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {wd.date}
                  </span>
                </div>
              ))}
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[600px] overflow-y-auto">
              {hours.map((h, hIdx) => (
                <div key={hIdx} className="grid grid-cols-8 min-h-[56px]">
                  <div className="p-2 text-right text-[11px] font-bold text-slate-400 border-r border-slate-200 dark:border-slate-800 select-none">
                    {h}
                  </div>
                  {weekDays.map((wd, dIdx) => {
                    const cellJobs = getJobsForCell(h, wd);
                    const cellTimeOffs = getTimeOffsForCell(h, wd);
                    return (
                      <div
                        key={dIdx}
                        onClick={() => handleCellClick(`${wd.day}, ${wd.dateStr} • ${h}`, wd.date, h, wd.dateStr)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                        }}
                        onDragEnter={(e) => {
                          e.currentTarget.classList.add("bg-red-50/60", "dark:bg-red-950/30");
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove("bg-red-50/60", "dark:bg-red-950/30");
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove("bg-red-50/60", "dark:bg-red-950/30");
                          const raw = e.dataTransfer.getData("application/json");
                          if (!raw) return;
                          try {
                            const item = JSON.parse(raw);
                            handleJobDrop(item, wd.date, h, wd.dateStr);
                          } catch (err) {}
                        }}
                        className="border-r border-slate-100 dark:border-slate-800/60 last:border-r-0 p-1 relative hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer space-y-1"
                      >
                        {cellTimeOffs.map((to) => renderTimeOffPill(to, wd))}
                        {cellJobs.map(renderJobPill)}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: MONTH VIEW */}
        {viewMode === "month" && (
          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-center py-2.5 font-extrabold text-xs text-slate-600 dark:text-slate-400">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {monthGridDays.map((wRow, rIdx) => (
                <div key={rIdx} className="grid grid-cols-7 min-h-[95px]">
                  {wRow.map((cellObj, cIdx) => {
                    const dayJobs = visibleJobs.filter((job) => {
                      if (!job.startDate || cellObj.isOutside) return false;
                      const cleanStr = String(job.startDate).split("T")[0];
                      return cleanStr === cellObj.dateStr;
                    });
                    const dayTimeOffs = timeOffList.filter((to) => {
                      if (!to.start_date || cellObj.isOutside) return false;
                      const sStr = String(new Date(to.start_date).toISOString()).split("T")[0];
                      const eStr = to.end_date ? String(new Date(to.end_date).toISOString()).split("T")[0] : sStr;
                      return cellObj.dateStr >= sStr && cellObj.dateStr <= eStr;
                    });
                    return (
                      <div
                        key={cIdx}
                        onClick={() => handleCellClick(`${cellObj.dateStr} • 09:00 AM`, cellObj.date, "9 AM", cellObj.dateStr)}
                        onDragOver={(e) => {
                          if (!cellObj.isOutside) {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "move";
                          }
                        }}
                        onDragEnter={(e) => {
                          if (!cellObj.isOutside) e.currentTarget.classList.add("bg-red-50/60", "dark:bg-red-950/30");
                        }}
                        onDragLeave={(e) => {
                          if (!cellObj.isOutside) e.currentTarget.classList.remove("bg-red-50/60", "dark:bg-red-950/30");
                        }}
                        onDrop={(e) => {
                          if (cellObj.isOutside) return;
                          e.preventDefault();
                          e.currentTarget.classList.remove("bg-red-50/60", "dark:bg-red-950/30");
                          const raw = e.dataTransfer.getData("application/json");
                          if (!raw) return;
                          try {
                            const item = JSON.parse(raw);
                            handleJobDrop(item, cellObj.date, "9 AM", cellObj.dateStr);
                          } catch (err) {}
                        }}
                        className={`p-2 border-r border-slate-200 dark:border-slate-800 last:border-r-0 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${
                          cellObj.isOutside ? "bg-slate-50/40 dark:bg-slate-900/30 text-slate-300 dark:text-slate-600" : ""
                        }`}
                      >
                        <span
                          className={`text-xs font-bold block text-right ${
                            cellObj.isCurrent ? "text-[#D31010] font-black" : "text-slate-500"
                          }`}
                        >
                          {cellObj.date < 10 ? `0${cellObj.date}` : cellObj.date}
                        </span>

                        {dayJobs.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {dayJobs.slice(0, 3).map(renderMonthJobItem)}
                            {dayJobs.length > 3 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCellClick(`${cellObj.dateStr}`, cellObj.date, "9 AM", cellObj.dateStr);
                                }}
                                className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 hover:underline pl-1 cursor-pointer block"
                              >
                                View more ({dayJobs.length - 3})
                              </button>
                            )}
                          </div>
                        )}

                        {dayTimeOffs.length > 0 && (
                          <div className="mt-1 space-y-0.5">
                            {dayTimeOffs.map((to) => renderMonthTimeOffBar(to, cellObj))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: TIMELINE VIEW */}
        {viewMode === "timeline" && (
          <div className="overflow-x-auto">
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 min-w-[1200px]">
              <div className="w-56 p-3 font-extrabold text-xs text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 flex-shrink-0">
                Edit Order
              </div>
              <div className="flex-1 grid grid-cols-16 text-center text-xs font-extrabold text-slate-500">
                {timelineHours.map((th, i) => (
                  <div key={i} className="py-3 border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                    {th}
                  </div>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 min-w-[1200px] min-h-[450px]">
              <div
                onClick={() => handleCellClick("Thu, Aug 20 • Unassigned Slot")}
                className="flex min-h-[140px] hover:bg-slate-50/40 cursor-pointer"
              >
                <div className="w-56 p-4 border-r border-slate-200 dark:border-slate-800 flex-shrink-0 font-extrabold text-xs text-slate-700 dark:text-slate-300">
                  Unassigned
                </div>
                <div className="flex-1 grid grid-cols-16 divide-x divide-slate-100 dark:divide-slate-800/60" />
              </div>

              <div
                onClick={() => handleCellClick("Thu, Aug 20 • Tech Slot")}
                className="flex min-h-[140px] bg-slate-50/30 dark:bg-slate-900/20 hover:bg-slate-50/60 cursor-pointer"
              >
                <div className="w-56 p-4 border-r border-slate-200 dark:border-slate-800 flex-shrink-0 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-700 text-white flex items-center justify-center font-black text-xs">
                    P
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                      PIXL TECHNI...
                    </h4>
                    <span className="text-[11px] text-slate-400 font-semibold">tech</span>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-16 divide-x divide-slate-100 dark:divide-slate-800/60 p-2 relative">
                  <div className="absolute left-[38%] top-4 w-[22%]">
                    {jobsList.map(renderJobPill)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: TIMELINE WEEK VIEW */}
        {viewMode === "timeline_week" && (
          <div className="overflow-x-auto relative">
            <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 min-w-[900px]">
              <div className="w-56 p-3 font-extrabold text-xs text-slate-600 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 flex-shrink-0">
                Edit Order
              </div>
              <div className="flex-1 grid grid-cols-7 text-center">
                {weekDays.map((wd) => (
                  <div key={wd.day} className="py-2.5 border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                    <span className="block text-[11px] font-bold text-slate-500 uppercase">{wd.day}</span>
                    <span className="inline-flex items-center justify-center text-xs font-extrabold mt-0.5 text-slate-800 dark:text-slate-200">
                      {wd.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 min-w-[900px] min-h-[450px] relative">
              <div className="absolute left-[72.5%] top-0 bottom-0 w-0.5 bg-[#D31010] z-20 pointer-events-none shadow-sm" />

              <div
                onClick={() => handleCellClick("Sun, Aug 16 • 12:00am - 12:15am")}
                className="flex min-h-[150px] hover:bg-slate-50/40 cursor-pointer"
              >
                <div className="w-56 p-4 border-r border-slate-200 dark:border-slate-800 flex-shrink-0 font-extrabold text-xs text-slate-700 dark:text-slate-300">
                  Unassigned
                </div>
                <div className="flex-1 grid grid-cols-7 divide-x divide-slate-100 dark:divide-slate-800/60" />
              </div>

              <div
                onClick={() => handleCellClick("Thu, Aug 20")}
                className="flex min-h-[150px] bg-slate-50/30 dark:bg-slate-900/20 hover:bg-slate-50/60 cursor-pointer"
              >
                <div className="w-56 p-4 border-r border-slate-200 dark:border-slate-800 flex-shrink-0 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-700 text-white flex items-center justify-center font-black text-xs">
                    P
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                      PIXL TE...
                    </h4>
                    <span className="text-[11px] text-slate-400 font-semibold">tech</span>
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-7 divide-x divide-slate-100 dark:divide-slate-800/60 p-2 relative">
                  <div className="absolute left-[60%] top-4 w-[13%]">
                    {jobsList.map(renderJobPill)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>

        {/* UNSCHEDULED JOBS SLIDE-OVER DRAWER (MATCHING SCREENSHOT 3) */}
        <AnimatePresence>
          {isUnscheduledDrawerOpen && (
            <div className="fixed inset-0 z-50 flex justify-end overflow-hidden pointer-events-none">
              {/* Optional transparent backdrop for mobile click-outside */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsUnscheduledDrawerOpen(false)}
                className="fixed inset-0 bg-black/20 backdrop-blur-xs lg:hidden pointer-events-auto"
              />

              {/* Right Slide-over Panel (Compact ~300px width matching Workiz screenshot) */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
                className="relative w-72 sm:w-80 bg-white dark:bg-[#0E1E31] border-l border-slate-200 dark:border-slate-800 shadow-2xl z-10 pointer-events-auto flex flex-col h-full overflow-hidden"
              >
                <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                      Unscheduled jobs
                    </h3>
                    <span className="w-5 h-5 flex items-center justify-center text-[11px] font-black bg-[#D31010] text-white rounded-full shadow-xs">
                      {unscheduledJobs.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsUnscheduledDrawerOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-3 space-y-2.5 overflow-y-auto flex-1">
                  {unscheduledJobs.length === 0 ? (
                    <div className="py-16 px-4 text-center">
                      <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <CalendarIcon className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        No unscheduled jobs
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        All jobs are scheduled
                      </p>
                    </div>
                  ) : (
                    unscheduledJobs.map((job, idx) => {
                      const cardColor = getJobStatusColorHex(job);
                      
                      const hex = (cardColor || "#3B82F6").replace("#", "");
                      const r = parseInt(hex.substring(0, 2), 16) || 59;
                      const g = parseInt(hex.substring(2, 4), 16) || 130;
                      const b = parseInt(hex.substring(4, 6), 16) || 246;

                      const pastelStyle = {
                        backgroundColor: `rgba(${r}, ${g}, ${b}, 0.18)`,
                        borderColor: `rgba(${r}, ${g}, ${b}, 0.55)`,
                      };

                      return (
                        <div
                          key={job._id || job.id || idx}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData("application/json", JSON.stringify(job));
                            setDraggedJobId(job._id || job.id);
                          }}
                          onDragEnd={() => setDraggedJobId(null)}
                          onClick={() => setSelectedJobDetails(job)}
                          style={pastelStyle}
                          className="p-3 rounded-xl border shadow-2xs hover:shadow-md transition-all cursor-pointer space-y-1 group select-none relative"
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                              Job #{job.jobId} {job.title ? `– ${job.title}` : ""}
                            </div>
                            <div className="flex-shrink-0 text-slate-400 group-hover:text-[#D31010] transition-colors">
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                              </svg>
                            </div>
                          </div>

                          <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                            {job.jobType || "Service Call"}
                          </div>

                          <div className="text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate">
                            {job.clientName} {job.companyName ? `(${job.companyName})` : ""}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      {/* Choice Modal */}
      <CreateChoiceModal
        isOpen={isChoiceModalOpen}
        onClose={() => setIsChoiceModalOpen(false)}
        slotInfo={selectedSlotInfo}
        onContinueJob={() => router.push(`/jobs/new?date=${selectedSlotDate}&time=${selectedSlotTime12}`)}
        onContinueLead={() => router.push(`/leads?create=true&date=${selectedSlotDate}&time=${selectedSlotTime12}`)}
        onContinueEvent={() => {
          setEditingEvent(null);
          setIsEventDrawerOpen(true);
        }}
        onContinueTimeOff={() => {
          setEditingTimeOff(null);
          setIsAddTimeOffOpen(true);
        }}
      />

      {/* Add / Edit Time Off Modal */}
      <AddTimeOffModal
        isOpen={isAddTimeOffOpen}
        onClose={() => {
          setIsAddTimeOffOpen(false);
          setEditingTimeOff(null);
        }}
        initialDate={selectedSlotDate}
        initialTime={selectedSlotTime12}
        timeOffToEdit={editingTimeOff}
        onSaved={() => {
          fetchTimeOffs();
        }}
      />

      {/* View Time Off Details Popover Modal */}
      <ViewTimeOffModal
        isOpen={isViewTimeOffOpen}
        onClose={() => {
          setIsViewTimeOffOpen(false);
          setSelectedTimeOff(null);
        }}
        timeOff={selectedTimeOff}
        onEdit={(to) => {
          setIsViewTimeOffOpen(false);
          setEditingTimeOff(to);
          setIsAddTimeOffOpen(true);
        }}
        onDelete={handleDeleteTimeOff}
      />

      {/* Side Event Drawer */}
      <AddEventDrawer
        isOpen={isEventDrawerOpen}
        onClose={() => {
          setEditingEvent(null);
          setIsEventDrawerOpen(false);
        }}
        eventToEdit={editingEvent}
        initialDate={selectedSlotDate}
        initialTime={selectedSlotTime}
        onEventSaved={() => {
          fetchEvents();
        }}
      />

      {/* Side Edit Job Drawer */}
      <EditJobDrawer
        isOpen={isEditJobDrawerOpen}
        onClose={() => setIsEditJobDrawerOpen(false)}
        job={editingJob}
        onJobUpdated={() => {
          fetchEvents();
        }}
      />

      {/* JOB QUICK DETAILS POPUP MODAL (User Screenshot Match) */}
      <AnimatePresence>
        {selectedJobDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJobDetails(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 text-slate-800 dark:text-slate-100"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Job ID: {selectedJobDetails.jobId || "426"}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingJob(selectedJobDetails);
                      setSelectedJobDetails(null);
                      setIsEditJobDrawerOpen(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer transition-colors"
                    title="Edit Job"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`/jobs/${selectedJobDetails._id || selectedJobDetails.id}`)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer transition-colors"
                    title="Open full page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedJobDetails(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-3.5 text-xs font-semibold">
                {/* CLIENT */}
                <div>
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1 tracking-wider">
                    CLIENT
                  </span>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-extrabold text-slate-900 dark:text-white text-xs">
                        {selectedJobDetails.clientName || "UR CHANNEL UR-OPP-01098"} {selectedJobDetails.companyName ? `(${selectedJobDetails.companyName})` : "(UR-OPP-01110)"}
                      </div>
                      {selectedJobDetails.phone && (
                        <div className="text-[#4B9EFF] font-bold mt-0.5">
                          {selectedJobDetails.phone}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => router.push("/messages")}
                        className="p-1.5 text-[#4B9EFF] hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Send Message"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      {selectedJobDetails.phone && (
                        <a
                          href={`tel:${selectedJobDetails.phone}`}
                          className="p-1.5 text-[#4B9EFF] hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Call Client"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* STATUS */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1 tracking-wider">
                    STATUS
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold">
                    <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
                    <span>{selectedJobDetails.status || "done pending approval"}</span>
                  </div>
                </div>

                {/* ADDRESS */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1 tracking-wider">
                    ADDRESS
                  </span>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(selectedJobDetails.address || "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-slate-700 dark:text-slate-300 font-bold leading-relaxed hover:text-[#D31010] dark:hover:text-[#D31010] transition-colors"
                  >
                    {selectedJobDetails.address || "295 Regional Road 77 #F1, St. Catharines, Ontario L2R 6P9"}
                  </a>
                </div>

                {/* ASSIGNED TECH */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1 tracking-wider">
                    ASSIGNED TECH
                  </span>
                  <div className="flex items-center justify-between">
                    <div className="text-slate-900 dark:text-white font-extrabold">
                      {selectedJobDetails.tech || "Gbenga"}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => router.push("/messages")}
                        className="p-1.5 text-[#4B9EFF] hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                        title="Send Message"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      {selectedJobDetails.phone && (
                        <a
                          href={`tel:${selectedJobDetails.phone}`}
                          className="p-1.5 text-[#4B9EFF] hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Call Tech"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* TAGS */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1.5 tracking-wider">
                    TAGS
                  </span>
                  <span className="px-3 py-1 bg-amber-400 text-slate-900 font-extrabold text-[11px] rounded-md inline-block uppercase">
                    {selectedJobDetails.tag || "UR-CHANNEL"}
                  </span>
                </div>

                {/* Add tasks to this job */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => router.push(`/jobs/${selectedJobDetails._id || selectedJobDetails.id}?tab=tasks`)}
                    className="w-full py-2.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#4B9EFF] text-xs font-extrabold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    Add tasks to this job
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EVENT QUICK DETAILS POPUP MODAL (User Screenshot Match) */}
      <AnimatePresence>
        {selectedEventDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEventDetails(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-800 dark:text-slate-100"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Event
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(selectedEventDetails.id || selectedEventDetails._id)}
                    className="p-1 text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEvent(selectedEventDetails);
                      setSelectedEventDetails(null);
                      setIsEventDrawerOpen(true);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer transition-colors"
                    title="Edit Event"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedEventDetails(null)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-3.5 text-xs font-semibold">
                {/* TITLE */}
                <div>
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase mb-0.5 tracking-wider">
                    TITLE
                  </span>
                  <div className="text-slate-900 dark:text-white font-extrabold">
                    {selectedEventDetails.title}
                  </div>
                </div>

                {/* DESCRIPTION */}
                {selectedEventDetails.notes && (
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                    <span className="block text-[10px] font-extrabold text-slate-400 uppercase mb-0.5 tracking-wider">
                      DESCRIPTION
                    </span>
                    <div className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-line">
                      {selectedEventDetails.notes}
                    </div>
                  </div>
                )}

                {/* SCHEDULED */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase mb-0.5 tracking-wider">
                    SCHEDULED
                  </span>
                  <div className="text-slate-800 dark:text-slate-200 font-extrabold">
                    {selectedEventDetails.startDate ? new Date(selectedEventDetails.startDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "Today"} {selectedEventDetails.startTime} - {selectedEventDetails.endTime}
                  </div>
                </div>

                {/* STATUS */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase mb-0.5 tracking-wider">
                    STATUS
                  </span>
                  <div className="text-slate-900 dark:text-white font-extrabold">
                    {selectedEventDetails.status}
                  </div>
                </div>

                {/* ASSIGNED */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase mb-0.5 tracking-wider">
                    ASSIGNED
                  </span>
                  <div className="text-slate-900 dark:text-white font-extrabold uppercase">
                    {selectedEventDetails.tech || "PIXL TECHNICIAN"}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
