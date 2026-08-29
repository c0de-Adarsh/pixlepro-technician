import React, { useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  Zap,
  FileText,
  Calendar,
  ListChecks,
  ListOrdered,
  Shield,
  FileEdit,
  Users,
  UserCheck,
  Map,
  Wrench,
  FolderKanban,
  ListFilter,
  ClipboardList,
  Barcode,
  Tag,
  Percent,
  MessageSquare,
  Hash,
  GitFork,
  PhoneCall,
  PhoneOff,
  Search,
  ExternalLink,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";

export default function SettingsContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const settingsCategories = [
    {
      title: "General Settings",
      cards: [
        {
          id: "account",
          title: "Account",
          icon: UserCheck,
          onClick: () => router.push("/settings/account"),
        },
        {
          id: "automation",
          title: "Automation Center",
          icon: Zap,
          onClick: () => toast.success("Opening Automation Center..."),
        },
        {
          id: "documents",
          title: "Documents",
          icon: FileText,
          onClick: () => toast.success("Opening Documents Settings..."),
        },
        {
          id: "schedule",
          title: "Schedule Settings",
          icon: Calendar,
          onClick: () => router.push("/settings/schedule"),
        },
        {
          id: "lead_status",
          title: "Lead Status",
          icon: ListChecks,
          onClick: () => toast.success("Opening Lead Status Settings..."),
        },
        {
          id: "numbering",
          title: "Numbering",
          icon: ListOrdered,
          onClick: () => toast.success("Opening Numbering Settings..."),
        },
        {
          id: "security",
          title: "Security Center",
          icon: Shield,
          onClick: () => toast.success("Opening Security Center..."),
        },
        {
          id: "estimates",
          title: "Estimates",
          icon: FileEdit,
          onClick: () => router.push("/estimates/settings"),
        },
      ],
    },
    {
      title: "Users & Roles",
      cards: [
        {
          id: "team_management",
          title: "Team Management",
          icon: Users,
          onClick: () => router.push("/team"),
        },
        {
          id: "roles_permissions",
          title: "Roles & Permissions",
          icon: UserCheck,
          onClick: () => toast.success("Opening Roles & Permissions..."),
        },
      ],
    },
    {
      title: "Job Settings",
      cards: [
        {
          id: "service_areas",
          title: "Service Areas",
          icon: Map,
          onClick: () => router.push("/settings/service-areas"),
        },
        {
          id: "job_types",
          title: "Job Types",
          icon: Wrench,
          onClick: () => router.push("/settings/job-types"),
        },
        {
          id: "ad_groups",
          title: "Ad Groups",
          icon: FolderKanban,
          onClick: () => router.push("/settings/ad-groups"),
        },
        {
          id: "field_validation",
          title: "Field Validation",
          icon: ListFilter,
          onClick: () => toast.success("Opening Field Validation..."),
        },
        {
          id: "custom_fields",
          title: "Custom Fields",
          icon: ClipboardList,
          onClick: () => router.push("/settings/custom-fields"),
        },
        {
          id: "price_book",
          title: "Price Book",
          icon: Barcode,
          onClick: () => router.push("/price-book"),
        },
        {
          id: "sub_status",
          title: "Sub-Status",
          icon: Tag,
          onClick: () => toast.success("Opening Sub-Status..."),
        },
        {
          id: "taxes",
          title: "Taxes",
          icon: Percent,
          onClick: () => router.push("/settings/taxes"),
        },
      ],
    },
    {
      title: "Calls & Text",
      rightLink: {
        label: "View phone plans",
        onClick: () => toast.success("Opening Phone Plans..."),
      },
      cards: [
        {
          id: "text_messages",
          title: "Text Messages",
          icon: MessageSquare,
          onClick: () => toast.success("Opening Text Messages Settings..."),
        },
        {
          id: "numbers",
          title: "Numbers",
          icon: Hash,
          onClick: () => toast.success("Opening Phone Numbers..."),
        },
        {
          id: "call_flows",
          title: "Call Flows",
          icon: GitFork,
          onClick: () => toast.success("Opening Call Flows..."),
        },
        {
          id: "call_groups",
          title: "Call Groups",
          icon: PhoneCall,
          onClick: () => toast.success("Opening Call Groups..."),
        },
        {
          id: "call_masking",
          title: "Call Masking",
          icon: PhoneOff,
          onClick: () => toast.success("Opening Call Masking..."),
        },
      ],
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8 pt-6 sm:pt-8 text-slate-800 dark:text-slate-100">
      {/* Top Breadcrumbs Navigation Bar (Exact Match Screenshots 1 & 2) */}
      <div className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 overflow-x-auto whitespace-nowrap">
        ACCOUNT # ROLES # TEAM # JOB ADMIN # WEB FORMS # <span className="text-slate-800 dark:text-slate-200">SETTINGS</span>
      </div>

      {/* Header Bar + Search Filter */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure system options, workflow rules, integrations, and user permissions
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search settings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 shadow-sm"
          />
        </div>
      </div>

      {/* Settings Directory Categories & Cards Grid (Exact Match Screenshots 1 & 2) */}
      <div className="space-y-8">
        {settingsCategories.map((category, catIdx) => {
          const filteredCards = category.cards.filter((c) =>
            c.title.toLowerCase().includes(searchTerm.toLowerCase())
          );

          if (searchTerm && filteredCards.length === 0) return null;

          return (
            <div key={catIdx} className="space-y-4">
              {/* Category Header */}
              <div className="flex items-center justify-between pb-1">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {category.title}
                </h2>
                {category.rightLink && (
                  <button
                    type="button"
                    onClick={category.rightLink.onClick}
                    className="text-xs font-bold text-[#2563EB] dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{category.rightLink.label}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Category Cards Grid (3 Columns on Large Screens matching Screenshots) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <motion.div
                      key={card.id}
                      whileHover={{ scale: 1.015, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={card.onClick}
                      className="p-4 bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 group-hover:text-[#D31010] dark:group-hover:text-red-400 transition-colors">
                        {card.title}
                      </span>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 group-hover:bg-red-50 dark:group-hover:bg-red-950/40 group-hover:text-[#D31010] transition-colors">
                        <Icon className="w-5 h-5 stroke-[1.75]" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
