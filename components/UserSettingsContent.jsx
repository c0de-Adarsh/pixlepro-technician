import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import {
  User as UserIcon,
  Info,
  ChevronDown,
  Upload,
  Plus,
  X,
  Check,
  Save,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Image as ImageIcon,
  Palette,
  Loader2,
  Lock,
  UserX,
  UserCheck,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";
import ResetPasswordModal from "./ResetPasswordModal";

const COLOR_SWATCHES = [
  "#70FFD0", "#3B82F6", "#2563EB", "#1D4ED8", "#1E3A8A",
  "#15803D", "#16A34A", "#22C55E", "#84CC16", "#A3E635",
  "#CA8A04", "#EAB308", "#D97706", "#B45309", "#9A3412",
  "#C2410C", "#EA580C", "#F97316", "#EF4444", "#DC2626",
  "#991B1B", "#C084FC", "#A855F7", "#EC4899", "#E11D48",
  "#7857FF", "#1E293B", "#0F172A", "#000000", "#64748B",
];

export default function UserSettingsContent({ memberId }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Profile");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const actionsRef = useRef(null);

  const [userStatus, setUserStatus] = useState("Active");
  const [userType, setUserType] = useState("Subcontractor");
  const [name, setName] = useState("Edward");
  const [email, setEmail] = useState("policarpioedward95@gmail.com");
  const [homeAddress, setHomeAddress] = useState("");
  const [phoneCountry, setPhoneCountry] = useState("+1");
  const [phone, setPhone] = useState("(306) 897-0777");
  const [additionalPhone, setAdditionalPhone] = useState("");
  const [callMasking, setCallMasking] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [trackLocation, setTrackLocation] = useState(false);

  const [role, setRole] = useState("Tech");
  const [fieldTeamMember, setFieldTeamMember] = useState(true);
  const [laborCost, setLaborCost] = useState("00.00");
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [notes, setNotes] = useState("");

  const [skills, setSkills] = useState([
    "Home Audio",
    "Camera Installation",
    "Home Theater Installation",
    "Samsung Frame Tv Media Package",
    "Service Call",
    "Site Survey CCTV",
    "CAPTURE TV",
    "Miscellaneous Hourly",
    "Tv Installation",
    "Smart Device Installation",
    "Tv Mount Install 65\"+",
  ]);

  const [areas, setAreas] = useState(["Regina"]);

  const [sameAsBusinessHours, setSameAsBusinessHours] = useState(true);

  const [syncEmail, setSyncEmail] = useState("");
  const [allowedIps, setAllowedIps] = useState("");
  const [sendTextOnJob, setSendTextOnJob] = useState(true);
  const [notifyIncomingMessages, setNotifyIncomingMessages] = useState(false);
  const [notifyOutgoingMessages, setNotifyOutgoingMessages] = useState(false);
  const [userSignature, setUserSignature] = useState(
    "Example: Name / Position\nCompany name\nPhone number\nWebsite (hyperlinked)"
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setIsActionsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!memberId) return;
    const fetchMemberData = async () => {
      setIsLoading(true);
      try {
        const res = await Api("GET", `api/teams/${memberId}`, null, router);
        const data = res?.data || (res?.status && res?.data) || res;
        if (data && data._id) {
          setName(data.name || "");
          setEmail(data.email || "");
          setPhone(data.phone || "");
          setRole(data.role === "admin" ? "Admin" : "Tech");
          setUserStatus(data.status || "Active");
          setUserType(data.user_type || "User");
          if (Array.isArray(data.skills) && data.skills.length > 0) setSkills(data.skills);
          if (Array.isArray(data.areas) && data.areas.length > 0) setAreas(data.areas);
          if (data.schedule_color) setSelectedColor(data.schedule_color);
          if (data.track_location !== undefined) setTrackLocation(data.track_location);
          if (data.call_masking !== undefined) setCallMasking(data.call_masking);
        }
      } catch (e) {}
      finally {
        setIsLoading(false);
      }
    };
    fetchMemberData();
  }, [memberId, router]);

  const handleToggleStatus = async () => {
    setIsActionsOpen(false);
    const targetStatus = userStatus === "Active" ? "Inactive" : "Active";
    try {
      const res = await Api("PUT", `api/teams/${memberId || email}/status`, { status: targetStatus }, router);
      if (res?.status || res?.success) {
        setUserStatus(targetStatus);
        toast.success(`User has been ${targetStatus === "Active" ? "activated" : "deactivated"} successfully!`);
      } else {
        toast.error(res?.error || "Failed to update user status");
      }
    } catch (e) {
      toast.error(e?.error || e?.message || "Error updating user status");
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove));
    toast.success(`Removed skill "${skillToRemove}"`);
  };

  const removeArea = (areaToRemove) => {
    setAreas((prev) => prev.filter((a) => a !== areaToRemove));
    toast.success(`Removed service area "${areaToRemove}"`);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        name,
        email,
        phone,
        role: role.toLowerCase(),
        user_type: userType,
        is_field_team: fieldTeamMember,
        call_masking: callMasking,
        track_location: trackLocation,
        schedule_color: selectedColor,
        skills,
        areas,
        status: userStatus,
      };

      if (memberId) {
        await Api("PUT", `api/teams/${memberId}`, payload, router);
      }
      toast.success("User settings updated successfully!");
    } catch (err) {
      toast.error(err?.error || err?.message || "Error saving user settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 pt-6 sm:pt-8 text-slate-800 dark:text-slate-100">
      <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap">
        SETTINGS # SERVICE AREAS # ACCOUNT # CLIENTS # TEAM # <span className="text-slate-800 dark:text-slate-200 font-bold">USER</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>User Settings</span>
            {userStatus === "Inactive" && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900">
                Deactivated
              </span>
            )}
          </h1>
          <button
            type="button"
            onClick={() => toast.info("User Settings Guide")}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3" ref={actionsRef}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsActionsOpen(!isActionsOpen)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-full text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <span>Actions</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isActionsOpen ? "rotate-180" : ""}`} />
            </button>

            {isActionsOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setIsActionsOpen(false);
                    setIsResetPasswordOpen(true);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-2.5 cursor-pointer transition-colors"
                >
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>Reset Password</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleStatus}
                  className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer transition-colors ${
                    userStatus === "Active"
                      ? "text-red-600 dark:text-red-400 font-semibold"
                      : "text-emerald-600 dark:text-emerald-400 font-semibold"
                  }`}
                >
                  {userStatus === "Active" ? (
                    <>
                      <UserX className="w-4 h-4 text-red-500" />
                      <span>Deactivate User</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 text-emerald-500" />
                      <span>Activate User</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-8 text-xs font-semibold">
        {["Profile", "Availability", "Advanced"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`py-3 relative cursor-pointer transition-colors ${
              activeTab === tab
                ? "text-slate-900 dark:text-white font-bold"
                : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            <span>{tab}</span>
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D31010] rounded-full" />
            )}
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {activeTab === "Profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-start gap-4">
                <div className="relative w-24 h-24 rounded-full bg-slate-700 text-white flex flex-col items-center justify-center text-center p-2 border-2 border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-xs font-bold leading-tight">Upload Image</span>
                  <button
                    type="button"
                    onClick={() => toast.success("Opening file selector...")}
                    className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#D31010] text-white shadow-md hover:bg-[#b00d0d] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </div>
                <div className="space-y-1 pt-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    <span>Profile picture</span>
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] text-slate-400 font-normal">Public</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Max 24MB of image files can be uploaded
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="trackLoc"
                  checked={trackLocation}
                  onChange={(e) => setTrackLocation(e.target.checked)}
                  className="accent-[#D31010] w-4 h-4 rounded cursor-pointer"
                />
                <label htmlFor="trackLoc" className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer">
                  <span>Track location</span>
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </label>
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  User Details
                </h3>

                <div className="space-y-1">
                  <span className="block text-[11px] font-semibold text-slate-500">User type</span>
                  <div className="relative">
                    <select
                      value={userType}
                      onChange={(e) => setUserType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none appearance-none pr-8 cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      <option value="Subcontractor">Subcontractor</option>
                      <option value="User">User</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="block text-[11px] font-semibold text-slate-500">Name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                  />
                </div>

                <div className="space-y-1">
                  <span className="block text-[11px] font-semibold text-slate-500">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                  />
                </div>

                <div className="space-y-1">
                  <span className="block text-[11px] font-semibold text-slate-500">Home address</span>
                  <input
                    type="text"
                    placeholder="Home address"
                    value={homeAddress}
                    onChange={(e) => setHomeAddress(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                  />
                </div>

                <div className="space-y-1">
                  <span className="block text-[11px] font-semibold text-slate-500">Phone</span>
                  <div className="flex items-center gap-2">
                    <div className="relative min-w-[90px]">
                      <select
                        value={phoneCountry}
                        onChange={(e) => setPhoneCountry(e.target.value)}
                        className="w-full pl-3 pr-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none appearance-none cursor-pointer text-slate-800 dark:text-slate-200"
                      >
                        <option value="+1">🇨🇦 +1</option>
                        <option value="+1_us">🇺🇸 +1</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="block text-[11px] font-semibold text-slate-500">Additional phone numbers</span>
                  <div className="relative">
                    <select
                      value={additionalPhone}
                      onChange={(e) => setAdditionalPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none appearance-none pr-8 cursor-pointer text-slate-800 dark:text-slate-200"
                    >
                      <option value="">Select phone type</option>
                      <option value="mobile">Mobile</option>
                      <option value="work">Work</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>Call masking</span>
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setCallMasking(!callMasking)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      callMasking ? "bg-[#D31010]" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        callMasking ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>Two-factor authentication</span>
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <button
                    type="button"
                    onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      twoFactorAuth ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        twoFactorAuth ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Roles and permissions
                </h3>
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none appearance-none pr-8 cursor-pointer text-slate-800 dark:text-slate-200"
                  >
                    <option value="Tech">Tech</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="fieldTeam"
                    checked={fieldTeamMember}
                    onChange={(e) => setFieldTeamMember(e.target.checked)}
                    className="accent-[#D31010] w-4 h-4 rounded cursor-pointer"
                  />
                  <label htmlFor="fieldTeam" className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer">
                    <span>Field team member</span>
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                  </label>
                </div>

                <p className="text-xs text-slate-500">
                  Customize roles and permissions{" "}
                  <a href="#" onClick={(e) => { e.preventDefault(); toast.info("Roles settings"); }} className="text-[#2563EB] font-semibold hover:underline">
                    here
                  </a>
                </p>
              </div>

              <div className="space-y-1 pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <span>Labor cost per hour</span>
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </label>
                <div className="flex items-center w-full max-w-xs">
                  <input
                    type="text"
                    value={laborCost}
                    onChange={(e) => setLaborCost(e.target.value)}
                    className="w-28 px-3 py-2 bg-white dark:bg-slate-900 border border-r-0 border-slate-300 dark:border-slate-800 rounded-l-xl text-xs font-semibold focus:outline-none"
                  />
                  <span className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-800 rounded-r-xl text-xs font-bold text-slate-600 dark:text-slate-400">
                    $
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <span>Job types / User skills</span>
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </label>
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl min-h-[100px] flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400">
                  Removing a skill may affect online booking availability
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <span>Service areas</span>
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </label>
                <div className="p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl min-h-[60px] flex flex-wrap gap-2">
                  {areas.map((area) => (
                    <span
                      key={area}
                      className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                    >
                      <span>{area}</span>
                      <button
                        type="button"
                        onClick={() => removeArea(area)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Schedule color
                </label>
                <div className="grid grid-cols-10 gap-1.5 p-1 max-w-md">
                  {COLOR_SWATCHES.map((hex, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedColor(hex)}
                      style={{ backgroundColor: hex }}
                      className={`w-6 h-6 rounded flex items-center justify-center transition-transform cursor-pointer border ${
                        selectedColor === hex
                          ? "ring-2 ring-slate-900 dark:ring-white scale-110 z-10 border-white"
                          : "border-black/10 hover:scale-105"
                      }`}
                    >
                      {selectedColor === hex && (
                        <Check className="w-3.5 h-3.5 text-slate-900 drop-shadow-sm stroke-[3]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Add information that other admins need to see"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "Availability" && (
          <div className="space-y-6 max-w-3xl">
            <div className="flex items-center gap-3 py-3 border-b border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSameAsBusinessHours(!sameAsBusinessHours)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                  sameAsBusinessHours ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    sameAsBusinessHours ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  User availability same as business hours
                </h3>
                <p className="text-[11px] text-slate-400">Set your users work hours</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                <div key={day} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold">
                  <span className="w-24 text-slate-700 dark:text-slate-300">{day}</span>
                  <div className="flex items-center gap-2">
                    <input type="time" defaultValue="09:00" className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
                    <span>to</span>
                    <input type="time" defaultValue="17:00" className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Advanced" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-5">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <span>Workiz sync email</span>
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </label>
                <input
                  type="email"
                  placeholder="Email"
                  value={syncEmail}
                  onChange={(e) => setSyncEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <span>Allowed IP addresses</span>
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Leave empty if all IPs apply"
                    value={allowedIps}
                    onChange={(e) => setAllowedIps(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D31010]/30"
                  />
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Permissions</h4>

                <label className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendTextOnJob}
                    onChange={(e) => setSendTextOnJob(e.target.checked)}
                    className="accent-[#D31010] w-4 h-4 rounded cursor-pointer mt-0.5"
                  />
                  <span>Send text message to all the user&apos;s phone numbers when sending them a job</span>
                </label>

                <label className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyIncomingMessages}
                    onChange={(e) => setNotifyIncomingMessages(e.target.checked)}
                    className="accent-[#D31010] w-4 h-4 rounded cursor-pointer mt-0.5"
                  />
                  <span>Notify user of account-wide incoming messages (app only)</span>
                </label>

                <label className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyOutgoingMessages}
                    onChange={(e) => setNotifyOutgoingMessages(e.target.checked)}
                    className="accent-[#D31010] w-4 h-4 rounded cursor-pointer mt-0.5"
                  />
                  <span>Notify user of account-wide outgoing messages (app only)</span>
                </label>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <span>User signature</span>
                <Info className="w-3.5 h-3.5 text-slate-400" />
              </label>

              <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-3 min-h-[160px] text-xs font-medium text-slate-400 italic">
                  <textarea
                    rows={6}
                    value={userSignature}
                    onChange={(e) => setUserSignature(e.target.value)}
                    className="w-full h-full bg-transparent focus:outline-none text-slate-700 dark:text-slate-200 not-italic resize-none"
                  />
                </div>

                <div className="flex items-center gap-2 p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-500">
                  <button type="button" className="p-1 hover:text-slate-900 dark:hover:text-white rounded"><Bold className="w-4 h-4" /></button>
                  <button type="button" className="p-1 hover:text-slate-900 dark:hover:text-white rounded"><Italic className="w-4 h-4" /></button>
                  <button type="button" className="p-1 hover:text-slate-900 dark:hover:text-white rounded"><Underline className="w-4 h-4" /></button>
                  <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
                  <button type="button" className="p-1 hover:text-slate-900 dark:hover:text-white rounded"><List className="w-4 h-4" /></button>
                  <button type="button" className="p-1 hover:text-slate-900 dark:hover:text-white rounded"><ListOrdered className="w-4 h-4" /></button>
                  <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
                  <button type="button" className="p-1 hover:text-slate-900 dark:hover:text-white rounded"><Heading1 className="w-4 h-4" /></button>
                  <button type="button" className="p-1 hover:text-slate-900 dark:hover:text-white rounded"><Heading2 className="w-4 h-4" /></button>
                  <button type="button" className="p-1 hover:text-slate-900 dark:hover:text-white rounded"><Heading3 className="w-4 h-4" /></button>
                  <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
                  <button type="button" className="p-1 hover:text-slate-900 dark:hover:text-white rounded"><Link className="w-4 h-4" /></button>
                  <button type="button" className="p-1 hover:text-slate-900 dark:hover:text-white rounded"><ImageIcon className="w-4 h-4" /></button>
                  <button type="button" className="p-1 hover:text-slate-900 dark:hover:text-white rounded"><Palette className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center pt-6 border-t border-slate-100 dark:border-slate-800">
          <button
            type="submit"
            disabled={isSaving}
            className="px-10 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-semibold rounded-full shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save</span>
            )}
          </button>
        </div>
      </form>

      <ResetPasswordModal
        isOpen={isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
        memberId={memberId}
        userEmail={email}
      />
    </div>
  );
}
