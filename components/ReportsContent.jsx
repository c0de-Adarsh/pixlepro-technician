import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Wrench,
  Wallet,
  Coins,
  BarChart3,
  Receipt,
  CreditCard,
  Users,
  Paperclip,
  FileText,
  FileClock,
  Clock,
  Barcode,
  Globe,
  Percent,
  Phone,
  CheckSquare,
  FileSpreadsheet,
  Plus,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";

export default function ReportsContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("workiz");
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

  const adminReportCards = [
    {
      id: "jobs",
      title: "Jobs",
      icon: Wrench,
      onClick: () => toast.success("Opening Jobs Report..."),
    },
    {
      id: "sales",
      title: "Sales",
      icon: Wallet,
      onClick: () => router.push("/reports/sales"),
    },
    {
      id: "tips",
      title: "Tips",
      icon: Coins,
      onClick: () => toast.success("Opening Tips Report..."),
    },
    {
      id: "job_statistics",
      title: "Job Statistics",
      icon: BarChart3,
      onClick: () => router.push("/reports/job-statistics"),
    },
    {
      id: "leads_report",
      title: "Leads Report",
      icon: Receipt,
      onClick: () => toast.success("Opening Leads Report..."),
    },
    {
      id: "payments",
      title: "Payments",
      icon: CreditCard,
      onClick: () => toast.success("Opening Payments Report..."),
    },
    {
      id: "activity",
      title: "Activity",
      icon: Users,
      onClick: () => router.push("/reports/activity"),
    },
    {
      id: "estimates",
      title: "Estimates",
      icon: Paperclip,
      onClick: () => toast.success("Opening Estimates Report..."),
    },
    {
      id: "invoices",
      title: "Invoices",
      icon: FileText,
      onClick: () => toast.success("Opening Invoices Report..."),
    },
    {
      id: "aging_invoices",
      title: "Aging invoices",
      icon: FileClock,
      onClick: () => router.push("/reports/aging-invoices"),
    },
    {
      id: "timesheets",
      title: "Timesheets",
      icon: Clock,
      onClick: () => router.push("/reports/timesheets"),
    },
    {
      id: "items_services",
      title: "Items and services",
      icon: Barcode,
      onClick: () => toast.success("Opening Items and Services Report..."),
    },
    {
      id: "website_requests",
      title: "Website requests",
      icon: Globe,
      onClick: () => toast.success("Opening Website Requests Report..."),
    },
    {
      id: "tax",
      title: "Tax",
      icon: Percent,
      onClick: () => router.push("/settings/taxes"),
    },
    {
      id: "call_tracking",
      title: "Call Tracking",
      icon: Phone,
      onClick: () => toast.success("Opening Call Tracking Report..."),
    },
    {
      id: "tasks",
      title: "Tasks",
      icon: CheckSquare,
      onClick: () => router.push("/reports/tasks"),
    },
    {
      id: "equipment",
      title: "Equipment",
      icon: FileSpreadsheet,
      onClick: () => router.push("/reports/equipment"),
    },
  ];

  const techReportCards = [
    {
      id: "job_statistics",
      title: "Job Statistics",
      icon: BarChart3,
      onClick: () => router.push("/reports/job-statistics"),
    },
    {
      id: "estimates",
      title: "Estimates",
      icon: Paperclip,
      onClick: () => toast.success("Opening Estimates Report..."),
    },
    {
      id: "invoices",
      title: "Invoices",
      icon: FileText,
      onClick: () => toast.success("Opening Invoices Report..."),
    },
    {
      id: "aging_invoices",
      title: "Aging invoices",
      icon: FileClock,
      onClick: () => router.push("/reports/aging-invoices"),
    },
    {
      id: "items_services",
      title: "Items and services",
      icon: Barcode,
      onClick: () => toast.success("Opening Items and Services Report..."),
    },
    {
      id: "tax",
      title: "Tax",
      icon: Percent,
      onClick: () => router.push("/settings/taxes"),
    },
    {
      id: "tasks",
      title: "Tasks",
      icon: CheckSquare,
      onClick: () => router.push("/reports/tasks"),
    },
    {
      id: "equipment",
      title: "Equipment",
      icon: FileSpreadsheet,
      onClick: () => router.push("/reports/equipment"),
    },
  ];

  const visibleCards = userRole === "tech" ? techReportCards : adminReportCards;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 pt-6 sm:pt-8 text-slate-800 dark:text-slate-100">
      {userRole === "tech" ? (
        <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 overflow-x-auto whitespace-nowrap">
          TWO FACTOR AUTHENTICATION # SCHEDULE # SETTINGS # <span className="text-slate-800 dark:text-slate-200 font-bold">REPORTS</span>
        </div>
      ) : (
        <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 overflow-x-auto whitespace-nowrap">
          TEAM # USER # LEADS # MAP # SETTINGS # <span className="text-slate-800 dark:text-slate-200 font-bold">REPORTS</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/90 dark:border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Reports
          </h1>
        </div>

        {userRole === "admin" && (
          <button
            type="button"
            onClick={() => toast.success("Create custom report...")}
            className="px-6 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-full shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create report</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 text-xs font-extrabold">
        <button
          type="button"
          onClick={() => setActiveTab("workiz")}
          className={`pb-3 transition-colors cursor-pointer border-b-2 ${
            activeTab === "workiz"
              ? "border-[#D31010] text-slate-900 dark:text-white font-bold"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          }`}
        >
          Workiz reports
        </button>
        {userRole === "admin" && (
          <button
            type="button"
            onClick={() => setActiveTab("custom")}
            className={`pb-3 transition-colors cursor-pointer border-b-2 ${
              activeTab === "custom"
                ? "border-[#D31010] text-slate-900 dark:text-white font-bold"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            Custom reports
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {visibleCards.map((card) => {
          const IconComp = card.icon;
          return (
            <div
              key={card.id}
              onClick={card.onClick}
              className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-2xl p-4 flex items-center justify-between shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <span className="font-semibold text-sm text-slate-800 dark:text-slate-200 group-hover:text-[#D31010] dark:group-hover:text-red-400 transition-colors">
                {card.title}
              </span>
              <div className="text-slate-400 group-hover:text-[#D31010] transition-colors">
                <IconComp className="w-5 h-5 stroke-[1.75]" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
