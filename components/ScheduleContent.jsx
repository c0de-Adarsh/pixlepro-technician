import React, { useState, useEffect } from "react";
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
  MapPin,
  Trash2,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";
import CreateChoiceModal from "./CreateChoiceModal";
import AddEventDrawer from "./AddEventDrawer";
import EditJobDrawer from "./EditJobDrawer";

export default function ScheduleContent() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 20));

  const [jobsList, setJobsList] = useState([]);

  const [isChoiceModalOpen, setIsChoiceModalOpen] = useState(false);
  const [isEventDrawerOpen, setIsEventDrawerOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEditJobDrawerOpen, setIsEditJobDrawerOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [selectedSlotInfo, setSelectedSlotInfo] = useState("Thu, Aug 20 • 07:45 AM - 07:50 AM");
  const [selectedSlotDate, setSelectedSlotDate] = useState("2026-08-20");
  const [selectedSlotTime, setSelectedSlotTime] = useState("13:00");
  const [selectedSlotTime12, setSelectedSlotTime12] = useState("01:00 PM");
  const [selectedJobDetails, setSelectedJobDetails] = useState(null);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);

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
        if (raw.length > 0) {
          const mapped = raw.map((e) => {
            const isEvent = Boolean(e.is_event || (!e.client_name && !e.job_type));
            const addr = e.address;
            const formattedAddr = typeof addr === "object"
              ? `${addr.street || ""} ${addr.unit || ""}, ${addr.city || ""}, ${addr.region || ""} ${addr.postal_code || ""}`.trim()
              : (e.address || "");
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
              isEvent,
              jobType: e.job_type || "",
              serviceArea: e.service_area || "Edmonton",
              total_amount: e.total_amount || 0,
              balance_due: e.total_amount || 0,
              notes: e.description || "",
              description: e.description || "",
              startDate: e.schedule?.start_date ? String(e.schedule.start_date).split("T")[0] : "2026-08-20",
              startTime: e.schedule?.start_time || "07:45 AM",
              endDate: e.schedule?.end_date ? String(e.schedule.end_date).split("T")[0] : "2026-08-20",
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

  useEffect(() => {
    fetchEvents();
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

  const hours = [
    "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM",
    "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM"
  ];

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
    return jobsList.filter((job) => {
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
        toast.success(`Rescheduled to ${newDateStr} at ${targetHourStr}`);
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

  const renderJobPill = (job) => {
    const isEv = job.isEvent;
    return (
      <div
        key={job.id}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("application/json", JSON.stringify(job));
          e.dataTransfer.effectAllowed = "move";
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (isEv) {
            setSelectedEventDetails(job);
          } else {
            setSelectedJobDetails(job);
          }
        }}
        className={`p-2 rounded-xl text-[11px] font-bold shadow-md cursor-grab active:cursor-grabbing border-l-4 transition-all z-10 my-0.5 select-none ${
          isEv
            ? "bg-slate-700 hover:bg-slate-800 text-white border-slate-400 hover:ring-2 hover:ring-slate-400"
            : "bg-[#D31010] hover:bg-[#b00d0d] text-white shadow-red-500/20 hover:ring-2 hover:ring-red-400 border-white/50"
        }`}
      >
        <div className="font-extrabold text-white text-xs">
          {isEv ? "Event" : `Job ID: ${job.jobId}`}
        </div>
        <div className={`text-[10px] truncate ${isEv ? "text-slate-300 font-semibold" : "text-red-100"}`}>
          {isEv ? `${job.title} ${job.notes ? `- ${job.notes}` : ""}` : `${job.clientName} ${job.companyName}`}
        </div>
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
              onClick={() => toast.success("Calendar filter view")}
              className="p-2 text-slate-500 hover:text-[#D31010] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => toast.success("Calendar settings")}
              className="p-2 text-slate-500 hover:text-[#D31010] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CALENDAR VIEW CONTAINER */}
      <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
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
                    <div className="flex-1 relative p-1.5">
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
                        className="border-r border-slate-100 dark:border-slate-800/60 last:border-r-0 p-1 relative hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                      >
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
                    const dayJobs = jobsList.filter((job) => {
                      if (!job.startDate || cellObj.isOutside) return false;
                      const cleanStr = String(job.startDate).split("T")[0];
                      return cleanStr === cellObj.dateStr;
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
                          <div className="mt-1 space-y-1">{dayJobs.map(renderJobPill)}</div>
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

      {/* Choice Modal */}
      <CreateChoiceModal
        isOpen={isChoiceModalOpen}
        onClose={() => setIsChoiceModalOpen(false)}
        slotInfo={selectedSlotInfo}
        onContinueJob={() => router.push(`/jobs/new?date=${selectedSlotDate}&time=${selectedSlotTime12}`)}
        onContinueEvent={() => {
          setEditingEvent(null);
          setIsEventDrawerOpen(true);
        }}
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
              className="relative w-full max-w-sm bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-800 dark:text-slate-100"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  Job ID: {selectedJobDetails.jobId} {selectedJobDetails.title}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingJob(selectedJobDetails);
                      setSelectedJobDetails(null);
                      setIsEditJobDrawerOpen(true);
                    }}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`/jobs/${selectedJobDetails.id}`)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedJobDetails(null)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4 text-xs font-semibold">
                {/* CLIENT */}
                <div>
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase mb-0.5">
                    CLIENT
                  </span>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-slate-900 dark:text-white">
                        {selectedJobDetails.clientName}
                      </div>
                      <div className="text-slate-500 font-bold">
                        ({selectedJobDetails.companyName})
                      </div>
                      <div className="text-[#4B9EFF] font-bold mt-0.5">
                        {selectedJobDetails.phone}
                      </div>
                    </div>
                    <a
                      href={`tel:${selectedJobDetails.phone}`}
                      className="p-2 border border-slate-200 dark:border-slate-700 rounded-full text-[#4B9EFF] hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase mb-0.5">
                    SCHEDULED
                  </span>
                  <div className="text-slate-800 dark:text-slate-200 font-extrabold">
                    Thu Aug 20th 7:45 AM - 7:50 AM
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase mb-0.5">
                    STATUS
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-extrabold">
                    <span className="w-2 h-2 rounded-full bg-[#4B9EFF]" />
                    <span>{selectedJobDetails.status}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase mb-0.5">
                    ADDRESS
                  </span>
                  <div className="text-slate-700 dark:text-slate-300 font-bold leading-relaxed">
                    {selectedJobDetails.address}
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="block text-[10px] font-extrabold text-slate-400 uppercase mb-0.5">
                    ASSIGNED TECH
                  </span>
                  <div className="flex items-center justify-between">
                    <div className="text-slate-900 dark:text-white font-extrabold uppercase">
                      {selectedJobDetails.tech}
                    </div>
                    <a
                      href={`tel:${selectedJobDetails.phone}`}
                      className="p-2 border border-slate-200 dark:border-slate-700 rounded-full text-[#4B9EFF] hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => toast.success("Tasks section opened")}
                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#4B9EFF] text-xs font-extrabold rounded-xl transition-colors cursor-pointer"
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
