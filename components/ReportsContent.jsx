import React, { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  Wrench,
  Wallet,
  Coins,
  Users,
  CreditCard,
  Activity,
  Paperclip,
  FileText,
  Clock,
  Timer,
  ScanBarcode,
  Percent,
  PhoneCall,
  CheckSquare,
  Briefcase,
  Plus,
  BarChart3,
  ChevronRight,
  X,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import CreateReportModal from "./CreateReportModal";

export default function ReportsContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("workiz"); // "workiz" | "custom"
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [customReportsList, setCustomReportsList] = useState([]);

  // 15 Standard Report Cards (Exact matching user screenshot)
  const reportCards = [
    { id: "jobs", title: "Jobs", icon: Wrench, count: "142 Jobs Completed", revenue: "$24,850" },
    { id: "sales", title: "Sales", icon: Wallet, count: "38 Closed Sales", revenue: "$48,920" },
    { id: "tips", title: "Tips", icon: Coins, count: "12 Tips Received", revenue: "$450.00" },
    { id: "leads", title: "Leads Report", icon: Users, count: "64 Total Leads", revenue: "32% Conversion" },
    { id: "payments", title: "Payments", icon: CreditCard, count: "89 Transactions", revenue: "$36,400" },
    { id: "activity", title: "Activity", icon: Activity, count: "320 System Logs", revenue: "Live Tracking" },
    { id: "estimates", title: "Estimates", icon: Paperclip, count: "29 Approved", revenue: "$18,200" },
    { id: "invoices", title: "Invoices", icon: FileText, count: "112 Billed", revenue: "$52,100" },
    { id: "aging", title: "Aging invoices", icon: Clock, count: "8 Overdue", revenue: "$3,450" },
    { id: "timesheets", title: "Timesheets", icon: Timer, count: "18 Tech Hours", revenue: "420 hrs total" },
    { id: "items", title: "Items and services", icon: ScanBarcode, count: "48 Catalog Items", revenue: "Top: TV Mount" },
    { id: "tax", title: "Tax", icon: Percent, count: "Q3 Tax Summary", revenue: "$4,210 Tax Collected" },
    { id: "calls", title: "Call Tracking", icon: PhoneCall, count: "215 Calls Logged", revenue: "94% Answered" },
    { id: "tasks", title: "Tasks", icon: CheckSquare, count: "14 Pending Tasks", revenue: "8 Completed Today" },
    { id: "equipment", title: "Equipment", icon: Briefcase, count: "24 Tracked Units", revenue: "All Active" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 pt-6 sm:pt-8 text-slate-800 dark:text-slate-100">
      {/* Top Header Section (Matching User Screenshot) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Reports
        </h1>

        {/* Top Right: + Create report (Solid Red #D31010 Button) */}
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="w-full sm:w-auto px-5 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create report</span>
        </button>
      </div>

      {/* Tabs Switcher Bar (Workiz reports vs Custom reports) */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-8 text-xs font-extrabold">
          <button
            type="button"
            onClick={() => setActiveTab("workiz")}
            className={`pb-3 relative transition-all cursor-pointer ${
              activeTab === "workiz"
                ? "text-slate-900 dark:text-white"
                : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <span>Workiz reports</span>
            {activeTab === "workiz" && (
              <motion.div
                layoutId="reportsTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-white rounded-full"
              />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`pb-3 relative transition-all cursor-pointer ${
              activeTab === "custom"
                ? "text-slate-900 dark:text-white"
                : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <span>Custom reports</span>
            {activeTab === "custom" && (
              <motion.div
                layoutId="reportsTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 dark:bg-white rounded-full"
              />
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: Workiz Reports (Matching 15 Cards Grid in Screenshot) */}
      {activeTab === "workiz" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportCards.map((card) => {
            const IconComp = card.icon;
            return (
              <motion.div
                key={card.id}
                whileHover={{ y: -2 }}
                onClick={() => setSelectedReport(card)}
                className="p-5 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800/90 hover:border-[#D31010]/40 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
              >
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-[#D31010] transition-colors">
                  {card.title}
                </span>

                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400 group-hover:text-[#D31010] transition-colors">
                  <IconComp className="w-5 h-5 stroke-[1.5]" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Custom Reports */}
      {activeTab === "custom" && (
        <div className="space-y-4">
          {customReportsList.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
              <BarChart3 className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                No custom reports built yet
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create custom tailored reports for your business analytics and field service team metrics.
              </p>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-2.5 bg-[#D31010] text-white text-xs font-extrabold rounded-xl shadow-md cursor-pointer inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Build Custom Report</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {customReportsList.map((cr, idx) => (
                <div
                  key={idx}
                  className="p-5 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-2"
                >
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {cr.reportName}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                    <span>{cr.category}</span>
                    <span>{cr.chartType}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Report Summary Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedReport(null)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-md bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl z-10 text-slate-800 dark:text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-50 dark:bg-red-950/30 text-[#D31010] rounded-xl">
                  {React.createElement(selectedReport.icon, { className: "w-5 h-5" })}
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {selectedReport.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="block text-[10px] font-extrabold uppercase text-slate-400">
                  Volume / Count
                </span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-white mt-1 block">
                  {selectedReport.count}
                </span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="block text-[10px] font-extrabold uppercase text-slate-400">
                  Value / Metrics
                </span>
                <span className="text-sm font-extrabold text-[#D31010] mt-1 block">
                  {selectedReport.revenue}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  toast.success(`Exporting ${selectedReport.title} CSV...`);
                  setSelectedReport(null);
                }}
                className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-extrabold rounded-xl shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
              >
                Export CSV Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Custom Report Modal */}
      <CreateReportModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(newRep) => {
          setCustomReportsList((prev) => [...prev, newRep]);
          setActiveTab("custom");
        }}
      />
    </div>
  );
}
