import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Users as UsersIcon,
  Search,
  Plus,
  ChevronDown,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";
import AddTeamMemberModal from "./AddTeamMemberModal";

export default function TeamContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    let isMounted = true;
    const fetchTeam = async () => {
      try {
        let res;
        try {
          res = await Api("GET", "api/teams", null, router);
        } catch (e) {
          res = await Api("GET", "api/users", null, router);
        }

        const dataArray = res?.data || (Array.isArray(res) ? res : null);
        if (isMounted && dataArray && Array.isArray(dataArray)) {
          const mapped = dataArray.map((u) => ({
            id: u._id || u.id || "usr_" + Math.random(),
            name: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.name || "Member",
            email: u.email || "—",
            phone: u.phone || "+1 (555) 000-0000",
            role: u.role || "tech",
            fieldTeam: u.is_field_team === false ? "no" : "yes",
            type: u.user_type || "User",
            created: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Recent",
            skills: Array.isArray(u.skills) && u.skills.length > 0 ? u.skills.join(", ") : "Camera Installation",
            areas: Array.isArray(u.areas) && u.areas.length > 0 ? u.areas.join(", ") : "Toronto, Barrie",
            has2FA: Boolean(u.two_factor_enabled),
          }));
          setTeamMembers(mapped);
        }
      } catch (err) {
      }
    };
    fetchTeam();
    return () => {
      isMounted = false;
    };
  }, [router]);

  // Filtered dataset
  const filteredMembers = teamMembers.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm);
    return matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 pt-6 sm:pt-8 text-slate-800 dark:text-slate-100">
      {/* Top Breadcrumb Navigation Bar */}
      <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap">
        SETTINGS # JOB ADMIN # DASHBOARD # MESSAGES # ACCOUNT # <span className="text-slate-800 dark:text-slate-200 font-bold">TEAM</span>
      </div>

      {/* Header Section (Title + Subtitle + Action Bar) */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left: Icon, Title & Guide link */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-700 dark:text-slate-300">
            <UsersIcon className="w-6 h-6 stroke-[1.75]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Team
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>Manage and add users to your team</span>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toast.success("Opening Team Guide...");
                }}
                className="text-[#2563EB] dark:text-blue-400 font-semibold hover:underline inline-flex items-center gap-0.5"
              >
                <span>Read guide</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Right: Status Filter & Add New Button */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Active Status Tag Filter Badge */}
          <div className="flex items-center gap-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
            <span>status:</span>
            <span className="font-bold text-slate-900 dark:text-white">{statusFilter}</span>
            <button
              type="button"
              onClick={() => toast.success("Status filter cleared")}
              className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <span className="text-slate-300 dark:text-slate-700 mx-1">|</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 cursor-pointer" />
          </div>

          {/* Add New Button */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-semibold rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New</span>
          </button>
        </div>
      </div>

      {/* Table Controls Row (Search Input + Rows Selector) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <div className="relative">
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-3.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none appearance-none pr-8 cursor-pointer text-slate-800 dark:text-slate-200"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Datatable Container */}
      <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 font-semibold text-slate-600 dark:text-slate-400">
                <th className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 min-w-[200px]">
                  Name
                </th>
                <th className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 min-w-[160px]">
                  Phone
                </th>
                <th className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 min-w-[90px]">
                  Role
                </th>
                <th className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 min-w-[100px]">
                  Field team
                </th>
                <th className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 min-w-[130px]">
                  Type
                </th>
                <th className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 min-w-[160px]">
                  Created
                </th>
                <th className="py-3 px-4 border-r border-slate-200 dark:border-slate-800 min-w-[160px]">
                  Skills
                </th>
                <th className="py-3 px-4 min-w-[180px]">
                  Areas
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                    No team members found matching search query
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    onClick={() => router.push(`/team/${member.id}`)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4 border-r border-slate-100 dark:border-slate-800/60">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                          {member.name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold truncate max-w-[180px]">
                          {member.email}
                        </span>
                        {member.has2FA && (
                          <span className="inline-block mt-1 w-max px-1.5 py-0.5 text-[9px] font-black bg-blue-500 text-white rounded uppercase shadow-sm">
                            2FA
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Phone (Clickable Link) */}
                    <td className="py-3.5 px-4 border-r border-slate-100 dark:border-slate-800/60">
                      <a
                        href={`tel:${member.phone}`}
                        className="text-[#2563EB] dark:text-blue-400 font-bold hover:underline"
                      >
                        {member.phone}
                      </a>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4 border-r border-slate-100 dark:border-slate-800/60 font-extrabold text-slate-700 dark:text-slate-300">
                      {member.role}
                    </td>

                    {/* Field team */}
                    <td className="py-3.5 px-4 border-r border-slate-100 dark:border-slate-800/60 font-semibold text-slate-600 dark:text-slate-400">
                      {member.fieldTeam}
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-4 border-r border-slate-100 dark:border-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
                      {member.type}
                    </td>

                    {/* Created */}
                    <td className="py-3.5 px-4 border-r border-slate-100 dark:border-slate-800/60 text-slate-500 font-medium whitespace-nowrap">
                      {member.created}
                    </td>

                    {/* Skills */}
                    <td className="py-3.5 px-4 border-r border-slate-100 dark:border-slate-800/60 text-slate-600 dark:text-slate-400 font-medium truncate max-w-[150px]">
                      {member.skills}
                    </td>

                    {/* Areas */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium truncate max-w-[170px]">
                      {member.areas}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Datatable Pagination Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing 1 to {filteredMembers.length} of {filteredMembers.length} entries</span>
          <div className="flex items-center gap-2">
            <button type="button" disabled className="p-1 text-slate-300 dark:text-slate-600">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-extrabold text-slate-700 dark:text-slate-300">
              Page 1 of 1
            </span>
            <button type="button" disabled className="p-1 text-slate-300 dark:text-slate-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add New Team Member Modal */}
      <AddTeamMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreated={(newMember) => {
          setTeamMembers((prev) => [newMember, ...prev]);
        }}
      />
    </div>
  );
}
