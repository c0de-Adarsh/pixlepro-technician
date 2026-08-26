import React, { useState } from "react";
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
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { goeyToast as toast } from "goey-toast";

export default function Header({ onMenuClick, onSearchChange }) {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [searchVal, setSearchVal] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [onScreenNotifs, setOnScreenNotifs] = useState(true);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearchVal(val);
    if (onSearchChange) onSearchChange(val);
  };

  return (
    <header className="sticky top-0 z-20 w-full h-16 bg-white/95 dark:bg-[#061322]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-white/10 px-4 lg:px-8 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-400" />
          <input
            type="text"
            value={searchVal}
            onChange={handleSearch}
            placeholder="Search operations..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-100/80 dark:bg-white/10 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 border border-slate-200/80 dark:border-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 focus:border-[#D31010] transition-all"
          />
        </div>
      </div>

      {/* Right Action Icons & User Profile Avatar (Matching Screenshot) */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Theme Toggle Header Icon */}
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

        {/* Phone Action Icon with Red Badge "39" */}
        <button className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors relative">
          <Phone className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-black bg-[#D31010] text-white rounded-full min-w-[18px] text-center shadow-sm">
            39
          </span>
        </button>

        {/* Chat Messages Icon with Red Badge "99" */}
        <button className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors relative">
          <MessageSquare className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-black bg-[#D31010] text-white rounded-full min-w-[18px] text-center shadow-sm">
            99
          </span>
        </button>

        {/* Lightning / Zap Icon */}
        <button className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
          <Zap className="w-5 h-5" />
        </button>

        {/* Apps Grid Icon */}
        <button className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
          <LayoutGrid className="w-5 h-5" />
        </button>

        {/* Help Circle Icon */}
        <button className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Green Profile Avatar Badge "PT" (Exact Match Screenshot) */}
        <div className="relative ml-1">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-9 h-9 rounded-full bg-[#10B981] text-white text-xs font-extrabold flex items-center justify-center shadow-sm hover:ring-2 hover:ring-[#10B981]/50 transition-all cursor-pointer"
          >
            PT
          </button>

          {/* User Profile Popover Dropdown Menu (Screenshot Exact Match) */}
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-50 text-slate-800 dark:text-slate-100 p-4 space-y-3"
              >
                {/* Header Title: PIXL TECHNICIAN & Red Clock Icon */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-xs font-extrabold tracking-wider uppercase text-slate-700 dark:text-slate-200">
                    PIXL TECHNICIAN
                  </span>
                  <div className="p-1 rounded-full bg-red-50 dark:bg-red-950/40 text-[#D31010]">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>

                {/* Option 1: On-screen notifications */}
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

                {/* Option 2: Account */}
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

                {/* Option 3: Manage team */}
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

                {/* Option 4: Billing + Upgrade plan Button */}
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

                {/* Option 5: Settings */}
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

                {/* Option 6: Log Out */}
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    router.push("/login");
                  }}
                  className="w-full flex items-center gap-3 py-2 px-2 rounded-xl text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    Log Out
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

