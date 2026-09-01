import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Users,
  Filter,
  Search,
  User,
  Phone,
  Paperclip,
  Sparkles,
  Send,
  ChevronDown,
  ArrowLeft,
  Star,
  Copy,
  CornerUpLeft,
  Check,
  CheckCheck,
  Plus,
  X,
  Sidebar as SidebarIcon,
  Archive,
  Inbox,
  Clock,
  Briefcase,
  FileText,
  Loader2,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";
import AddNewGroupModal from "./AddNewGroupModal";

export default function MessagesContent() {
  const { theme } = useTheme();
  const router = useRouter();

  const [activeFolder, setActiveFolder] = useState("all");
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sendMode, setSendMode] = useState("Send Text");
  const [showSendModeMenu, setShowSendModeMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [folderCounts, setFolderCounts] = useState({
    all: 1228,
    clients: 1147,
    team: 81,
    requests: 0,
    archived: 22,
    unreadClients: 1,
  });

  const chatEndRef = useRef(null);

  const quickReplies = [
    { label: "Reschedule", text: "Hi! We'd be happy to reschedule your appointment. What time works best for you?" },
    { label: "Price inquiry", text: "Thanks for reaching out! Our standard TV mounting starts at $49. Would you like a detailed quote?" },
    { label: "Scheduling inquiry", text: "We have availability this week on Thursday and Friday. Would morning or afternoon suit you?" },
    { label: "Appointment Confirmation", text: "Your appointment is confirmed! Our technician will arrive within the scheduled arrival window." },
    { label: "Inventory", text: "We carry heavy-duty tilt and full-motion TV brackets in stock on our service vans." },
  ];

  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      let queryUrl = `api/messages/conversations?folder=${activeFolder}`;
      if (searchQuery) queryUrl += `&search=${encodeURIComponent(searchQuery)}`;

      const res = await Api("GET", queryUrl);
      if (res && res.data) {
        const list = Array.isArray(res.data) ? res.data : [];
        setConversations(list);
        if (res.counts) setFolderCounts(res.counts);

        if (!activeConversation && list.length > 0) {
          setActiveConversation(list[0]);
        } else if (activeConversation) {
          const current = list.find((c) => c._id === activeConversation._id);
          if (current) setActiveConversation(current);
        }
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    if (!conversationId) return;
    try {
      setLoadingMessages(true);
      const res = await Api("GET", `api/messages/${conversationId}`);
      if (res && res.data) {
        setMessages(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [activeFolder, searchQuery]);

  useEffect(() => {
    if (activeConversation?._id) {
      fetchMessages(activeConversation._id);
      if (activeConversation.unread_count > 0) {
        Api("PUT", `api/messages/${activeConversation._id}/read`).catch(() => {});
      }
    }
  }, [activeConversation?._id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    setIsMobileChatOpen(true);
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !activeConversation?._id || isSending) return;

    const channelMap = {
      "Send Text": "Text",
      "Send In App": "In-App",
      "Send Email": "Email",
    };

    const textToSend = messageText.trim();
    setMessageText("");

    const optimisticMessage = {
      _id: `temp_${Date.now()}`,
      conversation_id: activeConversation._id,
      sender_name: "Admin",
      sender_role: "Admin",
      sender_type: "user",
      text: textToSend,
      message_type: "text",
      channel: channelMap[sendMode] || "Text",
      delivery_status: "sent",
      is_read: true,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      setIsSending(true);
      await Api("POST", `api/messages/${activeConversation._id}`, {
        text: textToSend,
        channel: channelMap[sendMode] || "Text",
      });
      fetchConversations();
    } catch (err) {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  const handleQuickReplyClick = (reply) => {
    setMessageText(reply.text);
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Message copied to clipboard!");
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50 dark:bg-[#07111E] text-slate-800 dark:text-slate-100 overflow-hidden font-sans">
      {/* Top Breadcrumb Bar (Screenshot 1 & 3 Match) */}
      <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0E1E31] text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 overflow-x-auto whitespace-nowrap space-x-1.5 flex items-center shrink-0">
        <span onClick={() => router.push("/reports")} className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
          REPORTS
        </span>
        <span>#</span>
        <span onClick={() => router.push("/jobs")} className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
          NEW JOB
        </span>
        <span>#</span>
        <span onClick={() => router.push("/reports/aging-invoices")} className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
          AGING INVOICES
        </span>
        <span>#</span>
        <span className="text-[#D31010] font-extrabold">MESSAGES</span>
      </div>

      {/* Main 3-Column Chat Layout Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Column 1: Left Folder Navigation (Collapsible) */}
        <div
          className={`${
            isSidebarOpen ? "w-56" : "w-14"
          } transition-all duration-300 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1E31] flex flex-col shrink-0 hidden md:flex`}
        >
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            {isSidebarOpen && (
              <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                Messages
              </h2>
            )}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer mx-auto"
              title="Toggle folders sidebar"
            >
              <SidebarIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="p-2 space-y-1 overflow-y-auto flex-1 text-xs font-bold">
            {[
              { id: "all", label: "All", count: folderCounts.all, hasDot: false },
              { id: "clients", label: "Clients", count: folderCounts.clients, hasDot: true },
              { id: "team", label: "Team", count: folderCounts.team, hasDot: false },
              { id: "requests", label: "Requests", count: folderCounts.requests, hasDot: false },
              { id: "archived", label: "Archived", count: folderCounts.archived, hasDot: false },
            ].map((folder) => {
              const isActive = activeFolder === folder.id;
              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => setActiveFolder(folder.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {folder.hasDot && (
                      <span className="w-2 h-2 rounded-full bg-[#D31010] shrink-0" />
                    )}
                    {isSidebarOpen && <span>{folder.label}</span>}
                  </div>
                  {isSidebarOpen && (
                    <span
                      className={`text-[11px] font-semibold ${
                        isActive ? "text-slate-900 dark:text-white" : "text-slate-400"
                      }`}
                    >
                      {folder.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 2: Conversations / Threads List */}
        <div
          className={`${
            isMobileChatOpen ? "hidden md:flex" : "flex"
          } w-full md:w-80 lg:w-96 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1E31] flex-col shrink-0`}
        >
          {/* Action Header & Tabs */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveFolder("all")}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                title="All Messages"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsGroupModalOpen(true)}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                title="Create Group Chat"
              >
                <Users className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => toast.info("Filter applied")}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Filter className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowSearch(!showSearch)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Input Bar (Screenshot 3 Style Match) */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 pt-2 border-b border-slate-100 dark:border-slate-800"
              >
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border-2 border-emerald-500/80 rounded-xl text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {loadingConversations ? (
              <div className="p-8 text-center text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#D31010] mb-2" />
                <span className="text-xs font-bold">Loading chats...</span>
              </div>
            ) : conversations.length > 0 ? (
              conversations.map((conv) => {
                const isActive = activeConversation?._id === conv._id;
                const initial = (conv.name || "U").substring(0, 1).toUpperCase();
                const hasUnread = conv.unread_count > 0;

                return (
                  <div
                    key={conv._id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`flex items-start gap-3 p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors relative border-l-4 ${
                      isActive
                        ? "border-l-[#D31010] bg-slate-50/80 dark:bg-slate-800/40"
                        : "border-l-transparent"
                    }`}
                  >
                    {/* Circle Initial Avatar */}
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-full bg-[#1e293b] text-white text-xs font-extrabold flex items-center justify-center shadow-xs">
                        {initial}
                      </div>
                      {hasUnread && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#D31010] border-2 border-white dark:border-[#0E1E31]" />
                      )}
                    </div>

                    {/* Sender Name, Role & Message Preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {conv.name}{" "}
                          <span className="text-slate-400 font-normal">
                            ({conv.role || "Client"})
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                          {new Date(conv.last_message_at || conv.updatedAt || Date.now()).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                        {conv.last_message || "No messages yet"}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                No conversations found
              </div>
            )}
          </div>
        </div>

        {/* Column 3: Active Chat Window (Main Conversation Stream) */}
        <div
          className={`${
            isMobileChatOpen ? "flex" : "hidden md:flex"
          } flex-1 flex-col bg-white dark:bg-[#07111E] overflow-hidden`}
        >
          {activeConversation ? (
            <>
              {/* Chat Top Header */}
              <div className="p-3.5 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1E31] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => setIsMobileChatOpen(false)}
                    className="p-1.5 -ml-2 text-slate-600 dark:text-slate-300 md:hidden hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="w-8 h-8 rounded-full bg-[#1e293b] text-white text-xs font-extrabold flex items-center justify-center">
                    {(activeConversation.name || "U").substring(0, 1).toUpperCase()}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {activeConversation.name}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {activeConversation.role || "Client"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeConversation.client_id) {
                        router.push(`/clients/${activeConversation.client_id}`);
                      } else {
                        toast.info(`Contact profile for ${activeConversation.name}`);
                      }
                    }}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer transition-colors"
                    title="View Profile"
                  >
                    <User className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      toast.success(`Calling ${activeConversation.name}...`);
                    }}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer transition-colors"
                    title="Phone Call"
                  >
                    <Phone className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Stream / Message Feed */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50 dark:bg-[#07111E]">
                {/* Date Separator Pill */}
                <div className="flex justify-center my-2">
                  <span className="px-3 py-1 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-full text-[10px] font-bold text-slate-500 dark:text-slate-300 shadow-2xs">
                    {new Date(activeConversation.last_message_at || Date.now()).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {loadingMessages ? (
                  <div className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#D31010]" />
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isUser = msg.sender_type === "user" || msg.sender_name === "Admin";

                    // Card Bubble Type 1: System / Welcome Bubble (Screenshot 1 Match)
                    if (msg.message_type === "system_card") {
                      return (
                        <div key={msg._id} className="max-w-xl">
                          <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                                {msg.sender_name}
                              </span>
                              <div className="flex items-center gap-1.5 text-slate-400">
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(msg.text)}
                                  className="p-1 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                                  title="Copy"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toast.success("Starred message")}
                                  className="p-1 hover:text-amber-500 cursor-pointer"
                                  title="Star"
                                >
                                  <Star className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">
                              {msg.text}
                            </p>
                          </div>

                          <div className="text-[10px] text-slate-400 mt-1 pl-2 font-semibold">
                            {new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • {msg.channel || "Text"}
                          </div>
                        </div>
                      );
                    }

                    // Card Bubble Type 2: Job Notification Bubble (Screenshot 1 Match)
                    if (msg.message_type === "job_card") {
                      return (
                        <div key={msg._id} className="max-w-xl">
                          <div className="p-4 bg-[#1E293B] text-white rounded-3xl shadow-md space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">
                                {msg.card_data?.title || msg.sender_name}
                              </span>
                              <div className="flex items-center gap-1.5 text-slate-300">
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(msg.card_data?.details || "")}
                                  className="p-1 hover:text-white cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toast.success("Starred")}
                                  className="p-1 hover:text-amber-400 cursor-pointer"
                                >
                                  <Star className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <p className="text-xs text-slate-200 font-medium leading-relaxed">
                              {msg.card_data?.details}
                            </p>

                            {msg.card_data?.action_label && (
                              <div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (msg.card_data?.action_url) {
                                      router.push(msg.card_data.action_url);
                                    }
                                  }}
                                  className="px-4 py-1.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-xl shadow-xs cursor-pointer transition-colors"
                                >
                                  {msg.card_data.action_label}
                                </button>
                              </div>
                            )}
                          </div>

                          <div className="text-[10px] text-slate-400 mt-1 pl-2 font-semibold flex items-center gap-1">
                            <CheckCheck className="w-3 h-3 text-blue-500" />
                            <span>Message opened • {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} {msg.channel}</span>
                          </div>
                        </div>
                      );
                    }

                    // Card Bubble Type 3: Estimate Notification Bubble (Screenshot 3 Match)
                    if (msg.message_type === "estimate_card") {
                      return (
                        <div key={msg._id} className="max-w-xl">
                          <div className="p-4 bg-[#1E293B] text-white rounded-3xl shadow-md space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-extrabold text-white">
                                {msg.card_data?.title}
                              </span>
                              <div className="flex items-center gap-1.5 text-slate-300">
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(msg.card_data?.details || "")}
                                  className="p-1 hover:text-white cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toast.success("Starred")}
                                  className="p-1 hover:text-amber-400 cursor-pointer"
                                >
                                  <Star className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <p className="text-xs text-slate-200 font-medium whitespace-pre-line leading-relaxed">
                              {msg.card_data?.details}
                            </p>
                          </div>

                          <div className="text-[10px] text-slate-400 mt-1 pl-2 font-semibold flex items-center gap-1">
                            <CheckCheck className="w-3 h-3 text-emerald-500" />
                            <span>Message opened • {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} {msg.channel}</span>
                          </div>
                        </div>
                      );
                    }

                    // Standard Chat Message Bubble
                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${
                          isUser ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs font-semibold shadow-xs ${
                            isUser
                              ? "bg-[#D31010] text-white rounded-br-xs"
                              : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 rounded-bl-xs"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 px-1 font-semibold flex items-center gap-1">
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {isUser && <Check className="w-3 h-3 text-slate-400" />}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Reply Chips Bar (Screenshots 1 & 3 Match) */}
              <div className="p-3 px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1E31] overflow-x-auto whitespace-nowrap flex items-center gap-2 shrink-0">
                {quickReplies.map((qr) => (
                  <button
                    key={qr.label}
                    type="button"
                    onClick={() => handleQuickReplyClick(qr)}
                    className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    {qr.label}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => toast.info("More replies available")}
                  className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  More replies
                </button>
              </div>

              {/* Message Input Form Area (Screenshots 1 & 3 Match) */}
              <div className="p-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1E31] shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                  {/* Message Input Box with Icons Inside */}
                  <div className="flex-1 relative flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-[#D31010]/30 transition-all">
                    <input
                      type="text"
                      placeholder="Type your message here..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      className="w-full bg-transparent text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none pr-16"
                    />

                    {/* Inside Action Buttons */}
                    <div className="absolute right-3 flex items-center gap-1.5 text-slate-400">
                      <button
                        type="button"
                        onClick={() => {
                          setMessageText(
                            (prev) =>
                              prev +
                              " Thank you for contacting Pixl Canada Ltd. Let us know if you need any assistance!"
                          );
                        }}
                        className="p-1 hover:text-blue-500 cursor-pointer"
                        title="AI Smart Assist"
                      >
                        <Sparkles className="w-4 h-4 text-blue-500" />
                      </button>

                      <button
                        type="button"
                        onClick={() => toast.info("Attach file / image")}
                        className="p-1 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                        title="Attach file"
                      >
                        <Paperclip className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Send Button with Mode Dropdown (Brand Red #D31010) */}
                  <div className="relative">
                    <div className="flex items-center bg-[#D31010] hover:bg-[#b00d0d] text-white rounded-2xl shadow-md shadow-red-500/20 overflow-hidden transition-colors">
                      <button
                        type="submit"
                        disabled={isSending || !messageText.trim()}
                        className="px-5 py-2.5 text-xs font-extrabold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isSending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span>{sendMode}</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowSendModeMenu(!showSendModeMenu)}
                        className="px-2 py-2.5 border-l border-red-700/50 hover:bg-red-800/40 cursor-pointer"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Send Mode Dropdown */}
                    <AnimatePresence>
                      {showSendModeMenu && (
                        <>
                          <div
                            className="fixed inset-0 z-30"
                            onClick={() => setShowSendModeMenu(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 5, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.95 }}
                            className="absolute right-0 bottom-full mb-2 w-40 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-40 py-1 text-xs font-bold divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden"
                          >
                            {["Send Text", "Send In App", "Send Email"].map((mode) => (
                              <button
                                key={mode}
                                type="button"
                                onClick={() => {
                                  setSendMode(mode);
                                  setShowSendModeMenu(false);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between text-slate-800 dark:text-slate-200 cursor-pointer"
                              >
                                <span>{mode}</span>
                                {sendMode === mode && (
                                  <Check className="w-3.5 h-3.5 text-[#D31010]" />
                                )}
                              </button>
                            ))}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">
                Select a conversation
              </h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Choose a client or team member from the list to start messaging or view history.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add New Group Modal */}
      <AddNewGroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onGroupCreated={(group) => {
          fetchConversations();
          if (group) setActiveConversation(group);
        }}
      />
    </div>
  );
}
