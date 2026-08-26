import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  VolumeX,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  MessageSquare,
  Phone,
  ArrowDownLeft,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Grid,
  Download
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const answeringData = [
  {
    id: 1,
    callerName: "Larry Jacobson",
    phone: "(604) 764-7915",
    jobId: "No job",
    date: "Sat Mar 8th, 09:10AM",
    adSource: "Organic Search",
    from: "(416) 555-0198",
    totalPrice: "--",
    lastActivity: "10m ago",
    callStatus: "No-answer",
    callFlow: "Forward to Charanpal",
    tagsCount: 0,
    duration: "0:21",
    transcript: "Greeting ...",
    isHighlighted: true,
  },
  {
    id: 2,
    callerName: "David Miller",
    phone: "(905) 555-8742",
    jobId: "JOB-8291",
    date: "Fri Mar 7th, 02:45PM",
    adSource: "Google Ads",
    from: "(905) 555-8742",
    totalPrice: "$450.00",
    lastActivity: "1d ago",
    callStatus: "Answered",
    callFlow: "Sales Queue",
    tagsCount: 2,
    duration: "1:45",
    transcript: "Hello, I need an estimate for residential repair...",
    isHighlighted: false,
  },
  {
    id: 3,
    callerName: "Sarah Jenkins",
    phone: "(416) 555-3321",
    jobId: "JOB-8290",
    date: "Fri Mar 7th, 11:20AM",
    adSource: "Direct",
    from: "(416) 555-3321",
    totalPrice: "$1,200.00",
    lastActivity: "1d ago",
    isMuted: true,
    callStatus: "Voicemail",
    callFlow: "Support Queue",
    tagsCount: 1,
    duration: "0:50",
    transcript: "Left a voicemail regarding emergency service...",
    isHighlighted: false,
  },
  {
    id: 4,
    callerName: "Michael Chang",
    phone: "(647) 555-9001",
    jobId: "No job",
    date: "Thu Mar 6th, 04:15PM",
    adSource: "Yelp",
    from: "(647) 555-9001",
    totalPrice: "--",
    lastActivity: "2d ago",
    callStatus: "No-answer",
    callFlow: "Main IVR",
    tagsCount: 0,
    duration: "0:15",
    transcript: "Call disconnected...",
    isHighlighted: false,
  },
  {
    id: 5,
    callerName: "Emily Davis",
    phone: "(416) 555-1122",
    jobId: "JOB-8285",
    date: "Wed Mar 5th, 08:30AM",
    adSource: "Google Ads",
    from: "(416) 555-1122",
    totalPrice: "$85.00",
    lastActivity: "3d ago",
    callStatus: "Answered",
    callFlow: "Direct Dispatch",
    tagsCount: 3,
    duration: "2:10",
    transcript: "Confirmed appointment time for Wednesday morning...",
    isHighlighted: false,
  },
];

export default function AnsweringContent() {
  const { theme } = useTheme();
  const [timeFilter, setTimeFilter] = useState("All time");
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [playingId, setPlayingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [selectedCall, setSelectedCall] = useState(answeringData[0]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [rating, setRating] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState("1x");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const timeOptions = [
    "All time",
    "Today",
    "Yesterday",
    "Last 7 days",
    "Last 30 days",
    "This month",
  ];

  const handleRowClick = (item) => {
    setSelectedCall(item);
    setIsDrawerOpen(true);
    setRating(null);
    setIsPlayingAudio(false);
  };

  const togglePlay = (id, e) => {
    if (e) e.stopPropagation();
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
    }
  };

  const toggleDrawerAudioPlay = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 text-slate-800 dark:text-slate-100 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Answering
        </h1>

        <div className="relative self-start sm:self-auto">
          <button
            onClick={() => setShowTimeDropdown(!showTimeDropdown)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/15 rounded-xl text-xs font-semibold shadow-sm hover:bg-slate-50 dark:hover:bg-white/10 transition-all"
          >
            <span className="text-[#D31010] dark:text-red-400 font-bold">{timeFilter}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#D31010] dark:text-red-400" />
          </button>

          {showTimeDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#0B1A2C] border border-slate-200 dark:border-white/15 rounded-xl shadow-xl py-1 z-30 text-xs">
              {timeOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    setTimeFilter(opt);
                    setShowTimeDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2 font-medium transition-colors ${
                    timeFilter === opt
                      ? "text-[#D31010] font-bold bg-red-50/50 dark:bg-white/10"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-full">
        <div className="bg-white/90 dark:bg-[#0B1A2C]/60 backdrop-blur-xl border border-slate-200 dark:border-white/15 rounded-2xl shadow-xl overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto relative min-w-full">
            <table className="w-full text-left text-xs border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-white/15 text-slate-500 dark:text-slate-300 font-semibold bg-slate-50/50 dark:bg-transparent">
                  <th className="px-6 py-4 w-28">Recording</th>
                  <th className="px-6 py-4">Job ID</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Ad source</th>
                  <th className="px-6 py-4">From</th>
                  <th className="px-6 py-4 text-right">Total price</th>
                  <th className="px-6 py-4 text-right">Last activity</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-white/10">
                {answeringData.map((item) => {
                  const isPlaying = playingId === item.id;
                  const isSelected = selectedCall?.id === item.id && isDrawerOpen;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => handleRowClick(item)}
                      className={`transition-colors cursor-pointer border-b border-slate-100 dark:border-white/10 ${
                        isSelected
                          ? "bg-[#FFF0F0] dark:bg-white/10"
                          : item.isHighlighted
                          ? "bg-[#FFF5F5] dark:bg-white/5"
                          : "hover:bg-slate-50/80 dark:hover:bg-white/5 bg-white dark:bg-transparent"
                      }`}
                    >
                      <td className="px-6 py-4">
                        {item.isMuted ? (
                          <div className="text-slate-400 dark:text-slate-500">
                            <VolumeX className="w-5 h-5 stroke-[1.8]" />
                          </div>
                        ) : (
                          <button
                            onClick={(e) => togglePlay(item.id, e)}
                            className="w-7 h-7 rounded-full flex items-center justify-center border border-slate-300 dark:border-slate-500 text-slate-600 dark:text-slate-200 hover:border-[#D31010] hover:text-[#D31010] dark:hover:border-red-400 dark:hover:text-red-400 transition-colors"
                          >
                            {isPlaying ? (
                              <Pause className="w-3.5 h-3.5 text-[#D31010] fill-[#D31010]" />
                            ) : (
                              <Play className="w-3.5 h-3.5 ml-0.5" />
                            )}
                          </button>
                        )}
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                        {item.jobId}
                      </td>

                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {item.date}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200 border border-transparent dark:border-white/20">
                          {item.adSource}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                        {item.from}
                      </td>

                      <td className="px-6 py-4 text-right font-medium text-slate-700 dark:text-slate-300">
                        {item.totalPrice}
                      </td>

                      <td className="px-6 py-4 text-right text-slate-500 dark:text-slate-400">
                        {item.lastActivity}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-slate-50/60 dark:bg-transparent border-t border-slate-100 dark:border-white/15 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Showing 3 of 12</span>

            <div className="flex items-center gap-1">
              <button className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50">
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCurrentPage(1)}
                className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center transition-colors ${
                  currentPage === 1
                    ? "bg-[#D31010] text-white shadow-sm"
                    : "hover:bg-slate-200 dark:hover:bg-white/10 dark:text-slate-300"
                }`}
              >
                1
              </button>

              <button
                onClick={() => setCurrentPage(2)}
                className={`w-6 h-6 rounded-md font-medium text-xs flex items-center justify-center transition-colors ${
                  currentPage === 2
                    ? "bg-[#D31010] text-white shadow-sm"
                    : "hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300"
                }`}
              >
                2
              </button>

              <button
                onClick={() => setCurrentPage(3)}
                className={`w-6 h-6 rounded-md font-medium text-xs flex items-center justify-center transition-colors ${
                  currentPage === 3
                    ? "bg-[#D31010] text-white shadow-sm"
                    : "hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300"
                }`}
              >
                3
              </button>

              <button className="p-1 text-slate-400 hover:text-slate-600">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isDrawerOpen && selectedCall && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 top-[65px] bg-black/40 backdrop-blur-xs z-40"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="fixed top-[65px] right-0 bottom-0 max-w-[92vw] figma-glass-modal z-50 overflow-y-auto flex flex-col p-6 space-y-6 text-slate-800 dark:text-slate-100"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Incoming Call
                </h3>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedCall.callerName}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedCall.phone}
                  </p>
                  <button className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-[#D31010] dark:text-blue-400 hover:underline">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Link to job</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button className="w-9 h-9 rounded-full bg-slate-800 dark:bg-white/10 text-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform border border-transparent dark:border-white/10">
                    <Plus className="w-4 h-4" />
                  </button>
                  <button className="w-9 h-9 rounded-full bg-slate-800 dark:bg-white/10 text-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform border border-transparent dark:border-white/10">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button className="w-9 h-9 rounded-full bg-slate-800 dark:bg-white/10 text-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform border border-transparent dark:border-white/10">
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-white/10">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                    <ArrowDownLeft className="w-4 h-4 text-emerald-500 dark:text-teal-400 stroke-[2.5]" />
                    <span>{selectedCall.callStatus}</span>
                  </div>
                  <span className="text-slate-400 dark:text-slate-400">{selectedCall.date}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 pl-6">
                  Call flow: {selectedCall.callFlow}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/10">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">
                    Tags ({selectedCall.tagsCount})
                  </span>
                  <button className="text-[#D31010] dark:text-blue-400 flex items-center gap-0.5 hover:underline">
                    <span>+ Edit</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-50/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Rate this conversation
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setRating("like")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      rating === "like"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-400"
                        : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Like</span>
                  </button>

                  <button
                    onClick={() => setRating("dislike")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      rating === "dislike"
                        ? "bg-red-50 border-red-300 text-red-700 dark:bg-red-950/40 dark:border-red-700 dark:text-red-400"
                        : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>Dislike</span>
                  </button>
                </div>
              </div>

              <div className="p-4 bg-slate-100/90 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                  <button
                    onClick={() => setPlaybackSpeed(playbackSpeed === "1x" ? "1.5x" : playbackSpeed === "1.5x" ? "2x" : "1x")}
                    className="px-2 py-0.5 bg-slate-200/80 dark:bg-white/10 rounded text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-300"
                  >
                    {playbackSpeed}
                  </button>

                  <div className="flex items-center gap-4">
                    <button className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
                      <FileText className="w-4 h-4" />
                    </button>
                    <button
                      onClick={toggleDrawerAudioPlay}
                      className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-sm hover:scale-105 transition-transform"
                    >
                      {isPlayingAudio ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 ml-0.5 fill-current" />
                      )}
                    </button>
                    <button className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
                      <Grid className="w-4 h-4" />
                    </button>
                  </div>

                  <button className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white">
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-center">
                  <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">
                    0:00 / {selectedCall.duration}
                  </span>
                  <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="bg-[#D31010] h-full rounded-full transition-all"
                      style={{ width: isPlayingAudio ? "45%" : "0%" }}
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 italic pt-1">
                  {selectedCall.transcript}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
