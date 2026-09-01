import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import {
  Search,
  Phone,
  MessageSquare,
  HelpCircle,
  Menu,
  Sun,
  Moon,
  User,
  LogOut,
  Bell,
  Clock,
  Users,
  CreditCard,
  Settings as SettingsIcon,
  Zap,
  LayoutGrid,
  Plus,
  Calendar,
  FileText,
  X,
  Loader2,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";
import ClockModal from "./ClockModal";

export default function Header({ onMenuClick, onSearchChange }) {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [searchVal, setSearchVal] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearchMenu, setShowSearchMenu] = useState(false);
  const [onScreenNotifs, setOnScreenNotifs] = useState(true);
  const [userRole, setUserRole] = useState("admin");
  const [userName, setUserName] = useState("PIXL TECHNICIAN");
  const [userInitials, setUserInitials] = useState("PT");

  const [isClockedIn, setIsClockedIn] = useState(false);
  const [currentShift, setCurrentShift] = useState(null);
  const [showClockModal, setShowClockModal] = useState(false);
  const [clockLoading, setClockLoading] = useState(false);

  const searchContainerRef = useRef(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("userDetail");
      if (stored) {
        const u = JSON.parse(stored);
        if (u) {
          const role = (u.role || "").toLowerCase();
          if (role === "tech" || role === "technician") {
            setUserRole("tech");
          } else {
            setUserRole("admin");
          }
          const fullName = `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.name || "User";
          setUserName(fullName.toUpperCase());
          const initials = (u.first_name?.[0] || u.name?.[0] || "P") + (u.last_name?.[0] || u.name?.[1] || "T");
          setUserInitials(initials.toUpperCase());
        }
      }
    } catch (e) {}
  }, []);

  const isTech = userRole === "tech";

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSearchMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchClockStatus = async () => {
    try {
      const res = await Api("GET", `api/timesheets/status?user_name=${encodeURIComponent(userName)}`, null, router);
      if (res && res.success) {
        setIsClockedIn(Boolean(res.is_clocked_in));
        setCurrentShift(res.current_shift || null);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchClockStatus();
  }, [router, userName]);

  const handleToggleClock = async () => {
    try {
      setClockLoading(true);
      const action = isClockedIn ? "clock_out" : "clock_in";
      const res = await Api("POST", "api/timesheets/clock", { action, user_name: userName }, router);
      if (res && (res.success || res.data)) {
        setIsClockedIn(!isClockedIn);
        setCurrentShift(action === "clock_in" ? res.data : null);
        setShowClockModal(false);
        toast.success(isClockedIn ? "Clocked out successfully" : "Clocked in successfully");
        fetchClockStatus();
      } else {
        toast.error(res?.message || "Failed to update clock status");
      }
    } catch (err) {
      toast.error("Error updating clock status");
    } finally {
      setClockLoading(false);
    }
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchVal(val);
    if (onSearchChange) onSearchChange(val);
  };

  const techSearchActions = [
    {
      id: "create_client",
      label: "Create client",
      icon: Plus,
      onClick: () => {
        setShowSearchMenu(false);
        router.push("/clients?create=true");
      },
    },
    {
      id: "create_invoice",
      label: "Create invoice",
      icon: Plus,
      onClick: () => {
        setShowSearchMenu(false);
        router.push("/invoices?create=true");
      },
    },
    {
      id: "create_estimate",
      label: "Create estimate",
      icon: Plus,
      onClick: () => {
        setShowSearchMenu(false);
        router.push("/estimates?create=true");
      },
    },
    {
      id: "clock_in_out",
      label: "Clock in/out",
      icon: Clock,
      onClick: () => {
        setShowSearchMenu(false);
        setShowClockModal(true);
      },
    },
    {
      id: "view_schedule",
      label: "View schedule",
      icon: Calendar,
      onClick: () => {
        setShowSearchMenu(false);
        router.push("/schedule");
      },
    },
    {
      id: "view_invoices",
      label: "View Invoices",
      icon: FileText,
      onClick: () => {
        setShowSearchMenu(false);
        router.push("/invoices");
      },
    },
  ];

  const adminSearchActions = [
    {
      id: "add_job",
      label: "Add job",
      icon: Plus,
      onClick: () => {
        setShowSearchMenu(false);
        router.push("/jobs/new");
      },
    },
    {
      id: "add_lead",
      label: "Add lead",
      icon: Plus,
      onClick: () => {
        setShowSearchMenu(false);
        router.push("/leads/new");
      },
    },
    {
      id: "create_client",
      label: "Create client",
      icon: Plus,
      onClick: () => {
        setShowSearchMenu(false);
        router.push("/clients?create=true");
      },
    },
    {
      id: "create_invoice",
      label: "Create invoice",
      icon: Plus,
      onClick: () => {
        setShowSearchMenu(false);
        router.push("/invoices?create=true");
      },
    },
    {
      id: "create_estimate",
      label: "Create estimate",
      icon: Plus,
      onClick: () => {
        setShowSearchMenu(false);
        router.push("/estimates?create=true");
      },
    },
    {
      id: "clock_in_out",
      label: "Clock in/out",
      icon: Clock,
      onClick: () => {
        setShowSearchMenu(false);
        setShowClockModal(true);
      },
    },
    {
      id: "view_schedule",
      label: "View schedule",
      icon: Calendar,
      onClick: () => {
        setShowSearchMenu(false);
        router.push("/schedule");
      },
    },
    {
      id: "add_team_member",
      label: "Add team member",
      icon: Users,
      onClick: () => {
        setShowSearchMenu(false);
        router.push("/team");
      },
    },
    {
      id: "view_invoices",
      label: "View Invoices",
      icon: FileText,
      onClick: () => {
        setShowSearchMenu(false);
        router.push("/invoices");
      },
    },
    {
      id: "account_settings",
      label: "Account settings",
      icon: SettingsIcon,
      onClick: () => {
        setShowSearchMenu(false);
        router.push("/settings/account");
      },
    },
    {
      id: "sms_settings",
      label: "SMS settings",
      icon: MessageSquare,
      onClick: () => {
        setShowSearchMenu(false);
        router.push("/settings");
      },
    },
  ];

  const currentActions = isTech ? techSearchActions : adminSearchActions;
  const filteredActions = currentActions.filter((a) =>
    searchVal.trim() === "" ? true : a.label.toLowerCase().includes(searchVal.toLowerCase())
  );

  return (
    <header className="sticky top-0 z-20 w-full h-16 bg-white/95 dark:bg-[#061322]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 px-4 lg:px-8 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="hidden md:flex items-center text-xs font-extrabold text-slate-700 dark:text-slate-200 tracking-wide">
        <span>Pixl Canada Ltd</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="relative w-48 sm:w-64 md:w-72" ref={searchContainerRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-400" />
            <input
              type="text"
              value={searchVal}
              onChange={handleSearch}
              onFocus={() => setShowSearchMenu(true)}
              placeholder="Search everything..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900/90 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 border border-slate-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-[#D31010] focus:border-[#D31010] transition-all"
            />
          </div>

          <AnimatePresence>
            {showSearchMenu && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-b-xl shadow-2xl z-50 overflow-hidden text-xs"
              >
                <div className="px-3.5 py-2 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  Actions
                </div>

                <div className="max-h-80 overflow-y-auto py-1 divide-y divide-slate-50 dark:divide-slate-800/40">
                  {filteredActions.length === 0 ? (
                    <div className="p-3 text-center text-slate-400 text-xs">
                      No matching actions found
                    </div>
                  ) : (
                    filteredActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.id}
                          type="button"
                          onClick={action.onClick}
                          className="w-full text-left px-3.5 py-2.5 flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                          <Icon className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold text-xs">{action.label}</span>
                        </button>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors relative"
          title="Toggle Light/Dark Theme"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600" />
          )}
        </button>

        <button className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors relative">
          <Phone className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-black bg-[#D31010] text-white rounded-full min-w-[18px] text-center shadow-sm">
            41
          </span>
        </button>

        {!isTech && (
          <button
            onClick={() => router.push("/messages")}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors relative cursor-pointer"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-black bg-[#D31010] text-white rounded-full min-w-[18px] text-center shadow-sm">
              99
            </span>
          </button>
        )}

        <button
          onClick={() => router.push("/automations")}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
        >
          <Zap className="w-5 h-5" />
        </button>

        {!isTech && (
          <button className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
            <LayoutGrid className="w-5 h-5" />
          </button>
        )}

        <button className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>

        <div className="relative ml-1">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-9 h-9 rounded-full bg-[#10B981] text-white text-xs font-extrabold flex items-center justify-center shadow-sm hover:ring-2 hover:ring-[#10B981]/50 transition-all cursor-pointer"
          >
            {userInitials || "PT"}
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-50 text-slate-800 dark:text-slate-100 p-4 space-y-3"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-xs font-extrabold tracking-wider uppercase text-slate-700 dark:text-slate-200 truncate max-w-[180px]">
                    {userName}
                  </span>
                  <div className="relative group/clock">
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowClockModal(true);
                      }}
                      className={`p-1.5 rounded-full transition-all cursor-pointer ${
                        isClockedIn
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-300 dark:border-emerald-700 hover:ring-2 hover:ring-emerald-400"
                          : "bg-red-50 dark:bg-red-950/40 text-[#D31010] border border-red-200 dark:border-red-900/40 hover:ring-2 hover:ring-red-400"
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                    </button>
                    <div className="absolute right-0 -bottom-8 pointer-events-none opacity-0 group-hover/clock:opacity-100 transition-opacity bg-slate-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-lg whitespace-nowrap z-50">
                      {isClockedIn ? "Clocked In" : "Clocked Out"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-1 px-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      On-screen notifications
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOnScreenNotifs(!onScreenNotifs)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      onScreenNotifs ? "bg-slate-400 dark:bg-slate-600" : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        onScreenNotifs ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    router.push("/settings/account");
                  }}
                  className="w-full flex items-center gap-3 py-2 px-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    Account
                  </span>
                </button>

                {!isTech && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        router.push("/team");
                      }}
                      className="w-full flex items-center gap-3 py-2 px-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <Users className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                        Manage team
                      </span>
                    </button>

                    <div className="flex items-center justify-between py-1 px-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                        <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                          Billing
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          toast.success("Upgrade plan clicked!");
                        }}
                        className="px-3.5 py-1.5 bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-[11px] font-extrabold rounded-full shadow-sm transition-all cursor-pointer"
                      >
                        Upgrade plan
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        router.push("/settings");
                      }}
                      className="w-full flex items-center gap-3 py-2 px-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      <SettingsIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                        Settings
                      </span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    router.push("/login");
                  }}
                  className="w-full flex items-center gap-3 py-2 px-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer text-red-600 font-bold"
                >
                  <LogOut className="w-5 h-5 text-red-500" />
                  <span className="text-xs font-extrabold">
                    Log Out
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ClockModal
        isOpen={showClockModal}
        onClose={() => setShowClockModal(false)}
        isClockedIn={isClockedIn}
        onToggleClock={handleToggleClock}
        loading={clockLoading}
        currentShift={currentShift}
      />
    </header>
  );
}
