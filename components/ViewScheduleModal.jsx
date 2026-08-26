import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Sparkles, ChevronDown } from "lucide-react";
import { goeyToast as toast } from "goey-toast";

export default function ViewScheduleModal({ isOpen, onClose, onSetSchedule }) {
  const [activeTab, setActiveTab] = useState("timeline");
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 18));
  const [duration, setDuration] = useState("2 hours");
  const [selectedHourIndex, setSelectedHourIndex] = useState(5);
  const [selectedCell, setSelectedCell] = useState({ dayIdx: 1, slotIdx: 2 });
  const [selectedSlotTime, setSelectedSlotTime] = useState("Aug 18, 2026 6:00 AM");

  const timelineHours = [
    "01 AM", "02 AM", "03 AM", "04 AM", "05 AM", "06 AM", "07 AM", "08 AM",
    "09 AM", "10 AM", "11 AM", "12 PM", "01 PM", "02 PM", "03 PM", "04 PM", "05 PM"
  ];

  const availabilityTimeRanges = [
    "1:00 AM - 3:00 AM",
    "3:00 AM - 5:00 AM",
    "5:00 AM - 7:00 AM",
    "7:00 AM - 9:00 AM",
    "9:00 AM - 11:00 AM",
    "11:00 AM - 1:00 PM",
  ];

  const formatTimelineHeader = (date) => {
    const day = date.toLocaleDateString("en-US", { weekday: "short" });
    const month = date.toLocaleDateString("en-US", { month: "long" });
    const dayNum = date.getDate();
    let suffix = "th";
    if (dayNum === 1 || dayNum === 21 || dayNum === 31) suffix = "st";
    else if (dayNum === 2 || dayNum === 22) suffix = "nd";
    else if (dayNum === 3 || dayNum === 23) suffix = "rd";
    return `${day}, ${month} ${dayNum}${suffix}, ${date.getFullYear()}`;
  };

  const formatAvailabilityHeader = (date) => {
    return `${date.toLocaleDateString("en-US", { month: "long" })} ${date.getFullYear()}`;
  };

  const getWeekDays = (baseDate) => {
    const days = [];
    const temp = new Date(baseDate);
    for (let i = 0; i < 7; i++) {
      const d = new Date(temp);
      d.setDate(temp.getDate() + i);
      days.push({
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        date: String(d.getDate()),
        fullDate: d,
      });
    }
    return days;
  };

  const weekDays = getWeekDays(currentDate);

  const updateSelectedSlotTime = (dateObj, hourIdx) => {
    const timeStr = timelineHours[hourIdx] || "06 AM";
    const monthShort = dateObj.toLocaleDateString("en-US", { month: "short" });
    const formatted = `${monthShort} ${dateObj.getDate()}, ${dateObj.getFullYear()} ${timeStr.replace(" ", ":00 ")}`;
    setSelectedSlotTime(formatted);
  };

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (activeTab === "timeline") {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
    updateSelectedSlotTime(newDate, selectedHourIndex);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (activeTab === "timeline") {
      newDate.setDate(newDate.getDate() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
    updateSelectedSlotTime(newDate, selectedHourIndex);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    updateSelectedSlotTime(today, selectedHourIndex);
  };

  const handleSelectTimelineHour = (hourIdx) => {
    setSelectedHourIndex(hourIdx);
    updateSelectedSlotTime(currentDate, hourIdx);
    toast.success(`Selected time: ${timelineHours[hourIdx]}`);
  };

  const handleSelectAvailabilityCell = (dayIdx, slotIdx, dObj, rangeStr) => {
    setSelectedCell({ dayIdx, slotIdx });
    const startTime = rangeStr.split(" - ")[0];
    const monthShort = dObj.fullDate.toLocaleDateString("en-US", { month: "short" });
    const fullTimeStr = `${monthShort} ${dObj.date}, ${dObj.fullDate.getFullYear()} ${startTime}`;
    setSelectedSlotTime(fullTimeStr);
    toast.success(`Selected slot: ${fullTimeStr}`);
  };

  const handleSetTime = () => {
    toast.success(`Schedule set for ${selectedSlotTime}`);
    if (onSetSchedule) onSetSchedule(selectedSlotTime);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative w-full max-w-6xl bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 text-slate-800 dark:text-slate-100 max-h-[92vh] flex flex-col"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Schedule
                </h3>

                <button
                  type="button"
                  onClick={handleToday}
                  className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:border-slate-400 transition-colors cursor-pointer"
                >
                  Today
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                  {activeTab === "availability"
                    ? formatAvailabilityHeader(currentDate)
                    : formatTimelineHeader(currentDate)}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
                <div className="p-1 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center gap-1 text-xs font-bold border border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab("timeline")}
                    className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeTab === "timeline"
                        ? "bg-[#D31010] text-white shadow-sm font-extrabold"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold"
                    }`}
                  >
                    Timeline
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("availability")}
                    className={`px-4 py-1.5 rounded-lg transition-all cursor-pointer ${
                      activeTab === "availability"
                        ? "bg-[#D31010] text-white shadow-sm font-extrabold"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold"
                    }`}
                  >
                    Availability
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {activeTab === "timeline" ? (
              <div className="overflow-x-auto p-4 flex-1">
                <div className="min-w-[1100px] border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden">
                  <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 text-xs font-extrabold text-slate-500">
                    <div className="w-52 p-3 border-r border-slate-200 dark:border-slate-800 flex-shrink-0" />
                    <div className="flex-1 grid grid-cols-[repeat(17,minmax(0,1fr))] text-center">
                      {timelineHours.map((th, i) => (
                        <div key={i} className="py-2.5 border-r border-slate-200 dark:border-slate-800 last:border-r-0 text-[11px]">
                          {th}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="min-h-[320px] divide-y divide-slate-100 dark:divide-slate-800">
                    <div className="flex min-h-[160px] relative">
                      <div className="w-52 p-4 border-r border-slate-200 dark:border-slate-800 flex-shrink-0 font-extrabold text-xs text-slate-700 dark:text-slate-300 flex items-center justify-center">
                        Unassigned
                      </div>
                      <div className="flex-1 grid grid-cols-[repeat(17,minmax(0,1fr))] divide-x divide-slate-100 dark:divide-slate-800/60 relative">
                        {timelineHours.map((_, i) => (
                          <div
                            key={i}
                            onClick={() => handleSelectTimelineHour(i)}
                            className={`h-full cursor-pointer transition-colors ${
                              selectedHourIndex === i
                                ? "bg-red-50/70 dark:bg-red-950/30"
                                : "hover:bg-slate-50 dark:hover:bg-slate-800/20"
                            }`}
                          />
                        ))}

                        <div
                          style={{
                            left: `${(selectedHourIndex / 17) * 100}%`,
                            width: `${(2 / 17) * 100}%`,
                          }}
                          className="absolute top-2 bottom-2 bg-[#D31010] text-white rounded-xl shadow-lg border border-red-700 p-2.5 flex flex-col justify-between text-xs font-extrabold z-10 transition-all duration-300 ease-out pointer-events-none"
                        >
                          <div>New job {timelineHours[selectedHourIndex] || "06 AM"}</div>
                          <div className="text-[11px] opacity-90">
                            - {timelineHours[Math.min(selectedHourIndex + 2, 16)] || "08 AM"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-y-auto p-4 flex-1 space-y-3">
                <div className="flex items-center justify-between pb-2">
                  <div className="relative">
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="pl-3.5 pr-8 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-extrabold focus:outline-none appearance-none cursor-pointer text-slate-800 dark:text-slate-200 shadow-xs min-w-[120px]"
                    >
                      <option value="2 hours">2 hours</option>
                      <option value="1 hour">1 hour</option>
                      <option value="3 hours">3 hours</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                  <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 text-center bg-slate-50/80 dark:bg-slate-900/80 text-xs font-extrabold">
                    <div className="p-3 border-r border-slate-200 dark:border-slate-800 text-slate-400" />
                    {weekDays.map((d, idx) => (
                      <div key={idx} className="p-3 border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                        <div className="text-slate-500 font-bold text-[11px]">{d.day}</div>
                        <div className="text-slate-900 dark:text-white font-extrabold text-sm">{d.date}</div>
                      </div>
                    ))}
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {availabilityTimeRanges.map((range, sIdx) => (
                      <div key={sIdx} className="grid grid-cols-8 text-center items-center">
                        <div className="p-3 border-r border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400 text-[11px] bg-slate-50/40 dark:bg-slate-900/40">
                          {range}
                        </div>
                        {weekDays.map((dObj, dIdx) => {
                          const isSelected = selectedCell.dayIdx === dIdx && selectedCell.slotIdx === sIdx;
                          return (
                            <button
                              key={dIdx}
                              type="button"
                              onClick={() => handleSelectAvailabilityCell(dIdx, sIdx, dObj, range)}
                              className={`p-3.5 border-r border-slate-200 dark:border-slate-800 last:border-r-0 text-center transition-all cursor-pointer min-h-[52px] flex items-center justify-center font-extrabold text-xs ${
                                isSelected
                                  ? "bg-[#D31010] text-white shadow-md scale-[0.98] rounded-xl font-black"
                                  : "text-slate-600 dark:text-slate-300 hover:bg-red-50/60 dark:hover:bg-red-950/30 hover:text-[#D31010]"
                              }`}
                            >
                              <span>{isSelected ? "1 available slots" : "2 available slots"}</span>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer Bar */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/40 flex-shrink-0">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>0 tech work in edmonton and can perform any job type</span>
                <button
                  type="button"
                  onClick={() => toast.success("Finding scheduling suggestions...")}
                  className="text-[#D31010] font-extrabold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Scheduling suggestions</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleSetTime}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer"
              >
                Set on {selectedSlotTime}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
