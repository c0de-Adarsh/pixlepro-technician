import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Phone,
  Headphones,
  Calendar,
  MapPin,
  Users,
  Briefcase,
  User,
  Zap,
  Settings,
  Plus,
  Moon,
  Sun,
  X,
  LogOut,
  BarChart3,
  FileSpreadsheet,
  Receipt,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const adminNavItems = [
  { id: "home", label: "Home", icon: Home, href: "/" },
  { id: "phone", label: "PiXL Phone", icon: Phone, href: "/phone" },
  { id: "answering", label: "Answering", icon: Headphones, href: "/answering" },
  { id: "schedule", label: "Schedule", icon: Calendar, href: "/schedule" },
  { id: "map", label: "Map", icon: MapPin, href: "/map" },
  { id: "leads", label: "Leads", icon: Users, href: "/leads" },
  { id: "jobs", label: "Jobs", icon: Briefcase, href: "/jobs" },
  { id: "clients", label: "Clients", icon: User, href: "/clients" },
  { id: "estimates", label: "Estimates", icon: FileSpreadsheet, href: "/estimates" },
  { id: "invoices", label: "Invoices", icon: Receipt, href: "/invoices" },
  { id: "price-book", label: "Price book", icon: BookOpen, href: "/price-book" },
  { id: "reports", label: "Reports", icon: BarChart3, href: "/reports" },
];

const techNavItems = [
  { id: "schedule", label: "Schedule", icon: Calendar, href: "/schedule" },
  { id: "map", label: "Map", icon: MapPin, href: "/map" },
  { id: "jobs", label: "Jobs", icon: Briefcase, href: "/jobs" },
  { id: "clients", label: "Clients", icon: User, href: "/clients" },
  { id: "estimates", label: "Estimates", icon: FileSpreadsheet, href: "/estimates" },
  { id: "invoices", label: "Invoices", icon: Receipt, href: "/invoices" },
  { id: "price-book", label: "Price book", icon: BookOpen, href: "/price-book" },
  { id: "reports", label: "Reports", icon: BarChart3, href: "/reports" },
];

export default function Sidebar({
  isOpen,
  onClose,
  onCreateClick,
  onOpenAddClient,
  onOpenAddEvent,
  activeTab = "home",
}) {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [userRole, setUserRole] = useState("admin");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("userDetail");
      if (stored) {
        const u = JSON.parse(stored);
        if (u && (u.role === "tech" || u.role === "technician")) {
          setUserRole("tech");
        } else {
          setUserRole("admin");
        }
      }
    } catch (e) {}
  }, []);

  const isTech = userRole === "tech";
  const navItems = isTech ? techNavItems : adminNavItems;

  const handleNavClick = (href) => {
    router.push(href);
    if (onClose) {
      onClose();
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full w-full py-5 px-4 text-slate-700 dark:text-slate-200 overflow-y-auto space-y-5">
      {/* Logo */}
      <div className="flex items-center justify-between px-2 mb-1">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(isTech ? "/schedule" : "/")}>
          <div className="relative h-16 w-52 flex items-center justify-start">
            <img
              src={theme === "dark" ? "/transparentlogo.png" : "/Margin (1).png"}
              alt="PiXL Pro Logo"
              className="h-14 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.nextElementSibling;
                if (fallback) fallback.style.display = "flex";
              }}
            />
            <div className="hidden items-center gap-1.5 font-bold text-2xl tracking-tight text-slate-900 dark:text-white">
              <span className="text-[#D31010]">PIXL</span>PRO
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Create New Button */}
      <div className="px-1 relative">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowCreateMenu(!showCreateMenu)}
          className="w-full bg-[#D31010] hover:bg-[#b00d0d] text-white font-medium py-3 px-4 rounded-xl flex items-center justify-start gap-2.5 shadow-md hover:shadow-lg shadow-[#D31010]/20 transition-all duration-200 cursor-pointer"
        >
          <div className="bg-white/20 p-1 rounded-md">
            <Plus className="w-4 h-4 text-white stroke-[3]" />
          </div>
          <span className="text-sm font-semibold tracking-wide">Create new</span>
        </motion.button>

        {/* Create New Popover Dropdown Menu */}
        <AnimatePresence>
          {showCreateMenu && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowCreateMenu(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.95 }}
                className="absolute left-1 right-1 top-full mt-2 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl py-1.5 z-40 text-slate-800 dark:text-slate-100 overflow-hidden min-w-[170px]"
              >
                {!isTech && (
                  <button
                    onClick={() => {
                      setShowCreateMenu(false);
                      router.push("/leads/new");
                      if (onClose) onClose();
                    }}
                    className="w-full text-left px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#D31010] dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Lead
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowCreateMenu(false);
                    router.push("/jobs/new");
                    if (onClose) onClose();
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#D31010] dark:hover:text-white transition-colors cursor-pointer"
                >
                  Job
                </button>

                <button
                  onClick={() => {
                    setShowCreateMenu(false);
                    if (onOpenAddClient) onOpenAddClient();
                    else router.push("/clients?create=true");
                    if (onClose) onClose();
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#D31010] dark:hover:text-white transition-colors cursor-pointer"
                >
                  Client
                </button>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                <button
                  onClick={() => {
                    setShowCreateMenu(false);
                    router.push("/estimates?create=true");
                    if (onClose) onClose();
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#D31010] dark:hover:text-white transition-colors cursor-pointer"
                >
                  Estimate
                </button>

                <button
                  onClick={() => {
                    setShowCreateMenu(false);
                    router.push("/invoices?create=true");
                    if (onClose) onClose();
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#D31010] dark:hover:text-white transition-colors cursor-pointer"
                >
                  Invoice
                </button>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                <button
                  onClick={() => {
                    setShowCreateMenu(false);
                    if (onOpenAddEvent) onOpenAddEvent();
                    else if (onCreateClick) onCreateClick();
                    if (onClose) onClose();
                  }}
                  className="w-full text-left px-4 py-2 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#D31010] dark:hover:text-white transition-colors cursor-pointer"
                >
                  Event
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Main Navigation Items */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || router.pathname === item.href;
          return (
            <motion.button
              key={item.id}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavClick(item.href)}
              className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 overflow-hidden ${
                isActive
                  ? "bg-[#FFF0F0] text-[#D31010] font-semibold dark:bg-white/10 dark:text-white border-l-[4px] border-l-[#D31010]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? "text-[#D31010] dark:text-[#F87171]" : "text-slate-400 dark:text-slate-500"
                }`}
              />
              <span>{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom Features & Settings Section */}
      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/10">
        {isTech ? (
          /* Technician Features Section (Matching Screenshot) */
          <div className="space-y-2">
            <div className="px-3.5 text-[11px] font-extrabold tracking-wider uppercase text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <span>Features</span>
            </div>
            <div className="px-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <ChevronDown className="w-3 h-3 text-slate-400" />
              <span>MY FEATURES</span>
            </div>
            <motion.button
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleNavClick("/automations")}
              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === "automations" || router.pathname === "/automations"
                  ? "bg-[#FFF0F0] text-[#D31010] dark:bg-white/10 dark:text-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100"
              }`}
            >
              <Zap className="w-4 h-4 text-slate-400" />
              <span>Automations</span>
            </motion.button>
          </div>
        ) : (
          /* Admin Bottom Nav Items */
          <nav className="space-y-1">
            {[
              { id: "automations", label: "Automations", icon: Zap, href: "/automations" },
              { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || router.pathname === item.href;
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleNavClick(item.href)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 overflow-hidden ${
                    isActive
                      ? "bg-[#FFF0F0] text-[#D31010] font-semibold dark:bg-white/10 dark:text-white border-l-[4px] border-l-[#D31010]"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-white/5"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isActive ? "text-[#D31010] dark:text-[#F87171]" : "text-slate-400 dark:text-slate-500"
                    }`}
                  />
                  <span>{item.label}</span>
                </motion.button>
              );
            })}
          </nav>
        )}

        {/* Theme Toggle */}
        <div className="p-3 bg-slate-100/80 dark:bg-black/30 rounded-2xl flex items-center justify-between border border-slate-200/60 dark:border-white/10">
          <div className="flex items-center gap-2.5">
            {theme === "dark" ? (
              <Moon className="w-4 h-4 text-amber-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              {theme === "dark" ? "Dark Mode" : "Light Mode"}
            </span>
          </div>

          <button
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              theme === "dark" ? "bg-[#D31010]" : "bg-slate-300"
            }`}
            aria-label="Toggle theme"
          >
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ${
                theme === "dark" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <button
          onClick={() => router.push("/login")}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400" />
          <span>Switch to Login Screen</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 h-full bg-white/95 dark:bg-[#061322]/80 backdrop-blur-xl border-r border-slate-200/80 dark:border-white/10 shrink-0 z-30 transition-colors duration-300">
        {sidebarContent}
      </aside>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden fixed top-0 left-0 bottom-0 w-72 max-w-[85vw] bg-white dark:bg-[#061322] border-r border-slate-200 dark:border-white/10 z-50 shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
