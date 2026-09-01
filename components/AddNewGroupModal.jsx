import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Filter, Loader2, Users } from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";

export default function AddNewGroupModal({
  isOpen,
  onClose,
  onGroupCreated,
}) {
  const [groupName, setGroupName] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fallbackMembers = [
    { _id: "m1", name: "charanpal jaggi", role: "admin", email: "charanpal@pixl.com" },
    { _id: "m2", name: "jose", role: "tech", email: "jose@pixl.com" },
    { _id: "m3", name: "Shun", role: "tech", email: "shun@pixl.com" },
    { _id: "m4", name: "jan", role: "admin", email: "jan@pixl.com" },
    { _id: "m5", name: "Tyler", role: "tech", email: "tyler@pixl.com" },
    { _id: "m6", name: "Luke", role: "tech", email: "luke@pixl.com" },
    { _id: "m7", name: "harsimranjit", role: "tech", email: "harsimranjit@pixl.com" },
    { _id: "m8", name: "Gokhan", role: "tech", email: "gokhan@pixl.com" },
  ];

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        setLoading(true);
        const res = await Api("GET", "api/teams");
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (list.length > 0) {
          setTeamMembers(
            list.map((t) => ({
              _id: t._id || t.id,
              name: t.name || `${t.first_name || ""} ${t.last_name || ""}`.trim(),
              role: t.role || "tech",
              email: t.email || "",
              phone: t.phone || "",
            }))
          );
        } else {
          setTeamMembers(fallbackMembers);
        }
      } catch (e) {
        setTeamMembers(fallbackMembers);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      setGroupName("");
      setMemberSearch("");
      setSelectedMemberIds([]);
      fetchTeam();
    }
  }, [isOpen]);

  const filteredMembers = teamMembers.filter((m) =>
    (m.name || "").toLowerCase().includes(memberSearch.toLowerCase()) ||
    (m.role || "").toLowerCase().includes(memberSearch.toLowerCase())
  );

  const isAllSelected =
    filteredMembers.length > 0 &&
    filteredMembers.every((m) => selectedMemberIds.includes(m._id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const filteredIds = filteredMembers.map((m) => m._id);
      setSelectedMemberIds(selectedMemberIds.filter((id) => !filteredIds.includes(id)));
    } else {
      const newIds = Array.from(
        new Set([...selectedMemberIds, ...filteredMembers.map((m) => m._id)])
      );
      setSelectedMemberIds(newIds);
    }
  };

  const handleToggleMember = (id) => {
    if (selectedMemberIds.includes(id)) {
      setSelectedMemberIds(selectedMemberIds.filter((item) => item !== id));
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedMemberIds.length === 0) {
      toast.error("Please select at least one member for the group");
      return;
    }

    try {
      setIsSubmitting(true);
      const selectedMembersData = teamMembers.filter((m) => selectedMemberIds.includes(m._id));
      const payload = {
        name: groupName.trim() || `Group (${selectedMembersData.length} members)`,
        members: selectedMembersData,
      };

      const res = await Api("POST", "api/messages/groups", payload);
      toast.success("Group created successfully!");
      if (onGroupCreated) {
        onGroupCreated(res?.data);
      }
      onClose();
    } catch (err) {
      toast.error("Failed to create group");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-10 overflow-hidden text-slate-800 dark:text-slate-100"
        >
          {/* Header (Screenshot 2 Match) */}
          <div className="p-6 pb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add new group
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 pt-2 space-y-4 text-xs font-semibold">
            {/* Group Name */}
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-bold">
                Group name <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
              />
            </div>

            {/* Select Members Header with Selection Count */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-bold">
                  Select members
                </label>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  {selectedMemberIds.length}/{teamMembers.length} selected
                </span>
              </div>

              {/* Search Members Bar with Filter Icon */}
              <div className="relative flex items-center mb-3">
                <input
                  type="text"
                  placeholder="Search members"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full pl-3.5 pr-9 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                />
                <Filter className="absolute right-3 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {/* Select All Checkbox */}
              <div className="flex items-center gap-2.5 px-1 py-1.5 mb-1 border-b border-slate-100 dark:border-slate-800">
                <input
                  type="checkbox"
                  id="selectAllMembers"
                  checked={isAllSelected}
                  onChange={handleToggleSelectAll}
                  className="accent-[#D31010] w-4 h-4 rounded cursor-pointer"
                />
                <label
                  htmlFor="selectAllMembers"
                  className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Select All
                </label>
              </div>

              {/* Scrollable Members List (Screenshot 2 Match) */}
              <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-50 dark:divide-slate-800/40">
                {filteredMembers.map((member) => {
                  const isChecked = selectedMemberIds.includes(member._id);
                  const initial = (member.name || "U").substring(0, 2).toUpperCase();

                  return (
                    <div
                      key={member._id}
                      onClick={() => handleToggleMember(member._id)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="accent-[#D31010] w-4 h-4 rounded cursor-pointer"
                      />

                      <div className="w-7 h-7 rounded-full bg-[#1e293b] text-white text-[10px] font-extrabold flex items-center justify-center">
                        {initial}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {member.name}
                        </span>
                        <span className="text-slate-400 font-normal">
                          • {member.role || "tech"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Actions (Cancel & Save) */}
            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/20 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
