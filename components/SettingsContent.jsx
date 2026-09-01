import React, { useState, useEffect } from "react";
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
  Package,
  Layers,
  CreditCard,
  UserPlus,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";

export default function SettingsContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
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

  const allCategories = [
    {
      id: "general",
      title: "General Settings",
      cards: [
        {
          id: "automation",
          title: "Automation Center",
          icon: Zap,
          roles: ["admin", "tech"],
          onClick: () => toast.success("Opening Automation Center..."),
        },
        {
          id: "numbering",
          title: "Numbering",
          icon: ListOrdered,
          roles: ["admin", "tech"],
          onClick: () => toast.success("Opening Numbering Settings..."),
        },
        {
          id: "security",
          title: "Security Center",
          icon: Shield,
          roles: ["admin", "tech"],
          onClick: () => toast.success("Opening Security Center..."),
        },
        {
          id: "estimates",
          title: "Estimates",
          icon: FileEdit,
          roles: ["admin", "tech"],
          onClick: () => router.push("/estimates/settings"),
        },
        {
          id: "account",
          title: "Account",
          icon: UserCheck,
          roles: ["admin"],
          onClick: () => router.push("/settings/account"),
        },
        {
          id: "documents",
          title: "Documents",
          icon: FileText,
          roles: ["admin"],
          onClick: () => toast.success("Opening Documents Settings..."),
        },
        {
          id: "schedule",
          title: "Schedule Settings",
          icon: Calendar,
          roles: ["admin"],
          onClick: () => router.push("/settings/schedule"),
        },
        {
          id: "lead_status",
          title: "Lead Status",
          icon: ListChecks,
          roles: ["admin"],
          onClick: () => router.push("/settings/lead-status"),
        },
        {
          id: "two_factor",
          title: "Two Factor Authentication",
          icon: Shield,
          roles: ["admin"],
          onClick: () => toast.success("Opening 2FA Settings..."),
        },
      ],
    },
    {
      id: "users_roles",
      title: "Users & Roles",
      cards: [
        {
          id: "team_management",
          title: "Team Management",
          icon: Users,
          roles: ["admin"],
          onClick: () => router.push("/team"),
        },
        {
          id: "roles_permissions",
          title: "Roles & Permissions",
          icon: UserCheck,
          roles: ["admin"],
          onClick: () => toast.success("Opening Roles & Permissions..."),
        },
        {
          id: "commission",
          title: "Commission",
          icon: Percent,
          roles: ["admin"],
          onClick: () => toast.success("Opening Commission Settings..."),
        },
      ],
    },
    {
      id: "job_settings",
      title: "Job Settings",
      cards: [
        {
          id: "job_types",
          title: "Job Types",
          icon: Wrench,
          roles: ["admin", "tech"],
          onClick: () => router.push("/settings/job-types"),
        },
        {
          id: "ad_groups",
          title: "Ad Groups",
          icon: FolderKanban,
          roles: ["admin", "tech"],
          onClick: () => router.push("/settings/ad-groups"),
        },
        {
          id: "field_validation",
          title: "Field Validation",
          icon: ListFilter,
          roles: ["admin", "tech"],
          onClick: () => toast.success("Opening Field Validation..."),
        },
        {
          id: "custom_fields",
          title: "Custom Fields",
          icon: ClipboardList,
          roles: ["admin", "tech"],
          onClick: () => router.push("/settings/custom-fields"),
        },
        {
          id: "price_book",
          title: "Price Book",
          icon: Barcode,
          roles: ["admin", "tech"],
          onClick: () => router.push("/price-book"),
        },
        {
          id: "sub_status",
          title: "Sub-Status",
          icon: Tag,
          roles: ["admin", "tech"],
          onClick: () => router.push("/settings/job-sub-status"),
        },
        {
          id: "taxes",
          title: "Taxes",
          icon: Percent,
          roles: ["admin", "tech"],
          onClick: () => router.push("/settings/taxes"),
        },
        {
          id: "service_areas",
          title: "Service Areas",
          icon: Map,
          roles: ["admin"],
          onClick: () => router.push("/settings/service-areas"),
        },
        {
          id: "inventory",
          title: "Inventory",
          icon: Package,
          roles: ["admin"],
          onClick: () => toast.success("Opening Inventory..."),
        },
      ],
    },
    {
      id: "calls_text",
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
          roles: ["admin"],
          onClick: () => toast.success("Opening Text Messages Settings..."),
        },
        {
          id: "numbers",
          title: "Numbers",
          icon: Hash,
          roles: ["admin"],
          onClick: () => toast.success("Opening Phone Numbers..."),
        },
        {
          id: "call_flows",
          title: "Call Flows",
          icon: GitFork,
          roles: ["admin"],
          onClick: () => toast.success("Opening Call Flows..."),
        },
        {
          id: "call_groups",
          title: "Call Groups",
          icon: PhoneCall,
          roles: ["admin"],
          onClick: () => toast.success("Opening Call Groups..."),
        },
        {
          id: "call_masking",
          title: "Call Masking",
          icon: PhoneOff,
          roles: ["admin"],
          onClick: () => toast.success("Opening Call Masking..."),
        },
      ],
    },
    {
      id: "integrations",
      title: "Integrations",
      cards: [
        {
          id: "reserve_google",
          title: "Reserve with Google",
          icon: PhoneCall,
          roles: ["admin", "tech"],
          onClick: () => toast.success("Opening Reserve with Google..."),
        },
        {
          id: "quickbooks",
          title: "QuickBooks Online",
          icon: FileText,
          roles: ["admin"],
          onClick: () => toast.success("Opening QuickBooks Integration..."),
        },
        {
          id: "zapier",
          title: "Zapier",
          icon: Zap,
          roles: ["admin"],
          onClick: () => toast.success("Opening Zapier Integration..."),
        },
        {
          id: "google_calendar",
          title: "Google Calendar",
          icon: Calendar,
          roles: ["admin"],
          onClick: () => toast.success("Opening Google Calendar Integration..."),
        },
        {
          id: "stripe",
          title: "Stripe",
          icon: CreditCard,
          roles: ["admin"],
          onClick: () => toast.success("Opening Stripe Integration..."),
        },
      ],
    },
    {
      id: "import",
      title: "Import",
      cards: [
        {
          id: "client_import",
          title: "Client Import",
          icon: Users,
          roles: ["admin", "tech"],
          onClick: () => toast.success("Opening Client Import..."),
        },
        {
          id: "pricebook_import",
          title: "Price Book Import",
          icon: Barcode,
          roles: ["admin"],
          onClick: () => toast.success("Opening Price Book Import..."),
        },
        {
          id: "job_import",
          title: "Job Import",
          icon: FileText,
          roles: ["admin"],
          onClick: () => toast.success("Opening Job Import..."),
        },
      ],
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-8 pt-6 sm:pt-8 text-slate-800 dark:text-slate-100">
      <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 overflow-x-auto whitespace-nowrap">
        TWO FACTOR AUTHENTICATION # SCHEDULE # <span className="text-slate-800 dark:text-slate-200 font-bold">SETTINGS</span>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure system options, workflow rules, integrations, and user permissions
          </p>
        </div>

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

      <div className="space-y-8">
        {allCategories.map((category) => {
          const visibleCards = category.cards.filter((c) => {
            const matchesRole = c.roles ? c.roles.includes(userRole) : true;
            const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesRole && matchesSearch;
          });

          if (searchTerm && visibleCards.length === 0) return null;

          return (
            <div key={category.id} className="space-y-4">
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800/80">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
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

              {visibleCards.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <motion.div
                        key={card.id}
                        whileHover={{ scale: 1.01, y: -1 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={card.onClick}
                        className="p-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
                      >
                        <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-[#D31010] dark:group-hover:text-red-400 transition-colors">
                          {card.title}
                        </span>
                        <div className="p-2 rounded-xl text-slate-500 dark:text-slate-400 group-hover:text-[#D31010] transition-colors">
                          <Icon className="w-5 h-5 stroke-[1.75]" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
