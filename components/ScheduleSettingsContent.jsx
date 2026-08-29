import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import {
  Calendar,
  ExternalLink,
  ChevronDown,
  Clock,
  Save,
  Check,
  Loader2,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";

export default function ScheduleSettingsContent() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [alwaysOpen, setAlwaysOpen] = useState(true);
  const [openOnHolidays, setOpenOnHolidays] = useState(true);
  const [startVisibleHour, setStartVisibleHour] = useState("5:00 am");
  const [endVisibleHour, setEndVisibleHour] = useState("7:00 pm");
  const [showDoneJobs, setShowDoneJobs] = useState(false);
  const [appointmentColorBy, setAppointmentColorBy] = useState("Tech");
  const [templateText, setTemplateText] = useState("{{tags}}{{client_name}} {{company_name}} {{job_type}} - {{job_address}}");

  const [businessDays, setBusinessDays] = useState([
    { day: "Sunday", enabled: true, from: "08:00 am", to: "05:00 pm" },
    { day: "Monday", enabled: true, from: "08:00 am", to: "05:00 pm" },
    { day: "Tuesday", enabled: true, from: "08:00 am", to: "05:00 pm" },
    { day: "Wednesday", enabled: true, from: "08:00 am", to: "05:00 pm" },
    { day: "Thursday", enabled: true, from: "08:00 am", to: "05:00 pm" },
    { day: "Friday", enabled: true, from: "08:00 am", to: "05:00 pm" },
    { day: "Saturday", enabled: true, from: "08:00 am", to: "05:00 pm" },
  ]);

  const availableHours = [
    "12:00 am", "1:00 am", "2:00 am", "3:00 am", "4:00 am", "5:00 am",
    "6:00 am", "7:00 am", "8:00 am", "9:00 am", "10:00 am", "11:00 am",
    "12:00 pm", "1:00 pm", "2:00 pm", "3:00 pm", "4:00 pm", "5:00 pm",
    "6:00 pm", "7:00 pm", "8:00 pm", "9:00 pm", "10:00 pm", "11:00 pm"
  ];

  const templateTokens = [
    { label: "Job Id", token: "{{job_id}}" },
    { label: "Client Name", token: "{{client_name}}" },
    { label: "First Name", token: "{{first_name}}" },
    { label: "Last Name", token: "{{last_name}}" },
    { label: "Company Name", token: "{{company_name}}" },
    { label: "Phone Number", token: "{{phone_number}}" },
    { label: "Job Type", token: "{{job_type}}" },
    { label: "Job Address", token: "{{job_address}}" },
    { label: "City", token: "{{city}}" },
    { label: "State", token: "{{state}}" },
    { label: "Zip Code", token: "{{zip_code}}" },
    { label: "Tech Assigned", token: "{{tech_assigned}}" },
    { label: "Tags", token: "{{tags}}" },
    { label: "Job Name", token: "{{job_name}}" },
  ];

  const sampleData = {
    "{{job_id}}": "1065",
    "{{client_name}}": "Joe Jamson",
    "{{first_name}}": "Joe",
    "{{last_name}}": "Jamson",
    "{{company_name}}": "Acme Inc",
    "{{phone_number}}": "(555) 234-5678",
    "{{job_type}}": "Service",
    "{{job_address}}": "222 W Main st, San Diego, CA 92101",
    "{{city}}": "San Diego",
    "{{state}}": "CA",
    "{{zip_code}}": "92101",
    "{{tech_assigned}}": "PIXL TECH",
    "{{tags}}": "Tag ",
    "{{job_name}}": "TV Installation",
  };

  const previewResult = useMemo(() => {
    let text = templateText;
    Object.keys(sampleData).forEach((tokenKey) => {
      text = text.replaceAll(tokenKey, sampleData[tokenKey]);
    });
    return text;
  }, [templateText]);

  const handleInsertToken = (token) => {
    setTemplateText((prev) => prev + token);
  };

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await Api("GET", "api/schedule-settings", null, router);
      if (res && (res.data || res.success)) {
        const data = res.data || res;
        if (data.always_open !== undefined) setAlwaysOpen(Boolean(data.always_open));
        if (data.open_on_holidays !== undefined) setOpenOnHolidays(Boolean(data.open_on_holidays));
        if (data.visible_start_hour) setStartVisibleHour(data.visible_start_hour);
        if (data.visible_end_hour) setEndVisibleHour(data.visible_end_hour);
        if (data.show_done_jobs !== undefined) setShowDoneJobs(Boolean(data.show_done_jobs));
        if (data.appointment_color_by) setAppointmentColorBy(data.appointment_color_by);
        if (data.schedule_template) setTemplateText(data.schedule_template);
        if (Array.isArray(data.business_days) && data.business_days.length > 0) {
          setBusinessDays(data.business_days);
        }
      }
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        always_open: alwaysOpen,
        open_on_holidays: openOnHolidays,
        visible_start_hour: startVisibleHour,
        visible_end_hour: endVisibleHour,
        show_done_jobs: showDoneJobs,
        appointment_color_by: appointmentColorBy,
        schedule_template: templateText,
        business_days: businessDays,
      };
      const res = await Api("PUT", "api/schedule-settings", payload, router);
      if (res && (res.success || res.data)) {
        toast.success("Schedule settings saved successfully!");
      } else {
        toast.error(res?.message || "Failed to save schedule settings");
      }
    } catch (err) {
      toast.error("Error saving schedule settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6 pt-6 sm:pt-8 text-slate-800 dark:text-slate-100">
      {/* Breadcrumbs Navigation Bar */}
      <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap">
        <span onClick={() => router.push("/leads")} className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">NEW LEAD</span>
        {" # "}
        <span onClick={() => router.push("/leads")} className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">LEADS</span>
        {" # "}
        <span onClick={() => router.push("/schedule")} className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">SCHEDULE</span>
        {" # "}
        <span onClick={() => router.push("/settings")} className="hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">SETTINGS</span>
        {" # "}
        <span className="text-slate-800 dark:text-slate-200 font-bold">SCHEDULE SETTINGS</span>
      </div>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-900/40 rounded-2xl text-[#D31010]">
            <Calendar className="w-6 h-6 stroke-[1.75]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Schedule Settings
            </h1>
            <div className="flex items-center gap-3 mt-0.5">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Set your working hours and schedule preferences
              </p>
              <a
                href="https://help.workiz.com/hc/en-us/articles/18055823650321-How-to-set-your-business-hours-in-Workiz"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-[#D31010] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Read guide</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Card */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Business hours Card */}
          <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Business hours
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure your operating schedule and availability.
              </p>
            </div>

            <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800/80">
              {/* Always open toggle */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Always open
                  </div>
                  <div className="text-[11px] text-slate-400 font-semibold">
                    Operate 24/7 with full schedule availability
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAlwaysOpen(!alwaysOpen)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    alwaysOpen ? "bg-[#D31010]" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      alwaysOpen ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Custom Hours Editor (Expanded when Always open is OFF) */}
              {!alwaysOpen && (
                <div className="pt-4 space-y-3">
                  <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                    Custom Working Days & Hours
                  </span>
                  <div className="space-y-2">
                    {businessDays.map((bd, idx) => (
                      <div
                        key={bd.day}
                        className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3 w-36">
                          <button
                            type="button"
                            onClick={() => {
                              setBusinessDays((prev) =>
                                prev.map((d, i) => i === idx ? { ...d, enabled: !d.enabled } : d)
                              );
                            }}
                            className={`w-8 h-4.5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                              bd.enabled ? "bg-[#D31010]" : "bg-slate-300 dark:bg-slate-700"
                            }`}
                          >
                            <div
                              className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transform transition-transform ${
                                bd.enabled ? "translate-x-3.5" : "translate-x-0"
                              }`}
                            />
                          </button>
                          <span className={`text-xs font-bold ${bd.enabled ? "text-slate-800 dark:text-slate-200" : "text-slate-400"}`}>
                            {bd.day}
                          </span>
                        </div>

                        {bd.enabled ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={bd.from}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBusinessDays((prev) =>
                                  prev.map((d, i) => i === idx ? { ...d, from: val } : d)
                                );
                              }}
                              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#D31010]"
                            >
                              {availableHours.map((h) => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                            <span className="text-slate-400 text-xs font-bold">to</span>
                            <select
                              value={bd.to}
                              onChange={(e) => {
                                const val = e.target.value;
                                setBusinessDays((prev) =>
                                  prev.map((d, i) => i === idx ? { ...d, to: val } : d)
                                );
                              }}
                              className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#D31010]"
                            >
                              {availableHours.map((h) => (
                                <option key={h} value={h}>{h}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-400 italic">Closed</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Open on holidays toggle */}
              <div className="flex items-center justify-between pt-4">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Open on holidays
                  </div>
                  <div className="text-[11px] text-slate-400 font-semibold">
                    Accept appointments and jobs on public holidays
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpenOnHolidays(!openOnHolidays)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    openOnHolidays ? "bg-[#D31010]" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      openOnHolidays ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Visible Range & Appearance Card */}
          <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Visible Range & Display Options
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Control the calendar timeline boundaries and coloring.
              </p>
            </div>

            <div className="space-y-5">
              {/* Schedule visible hour range */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Schedule visible hour range
                </label>
                <div className="flex items-center gap-3 max-w-md">
                  <div className="flex-1 relative">
                    <select
                      value={startVisibleHour}
                      onChange={(e) => setStartVisibleHour(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white appearance-none cursor-pointer pr-8 focus:outline-none focus:ring-2 focus:ring-[#D31010]/20 focus:border-[#D31010]"
                    >
                      {availableHours.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>

                  <span className="text-xs font-bold text-slate-400 uppercase">To</span>

                  <div className="flex-1 relative">
                    <select
                      value={endVisibleHour}
                      onChange={(e) => setEndVisibleHour(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white appearance-none cursor-pointer pr-8 focus:outline-none focus:ring-2 focus:ring-[#D31010]/20 focus:border-[#D31010]"
                    >
                      {availableHours.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Show done jobs */}
              <div className="pt-1">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showDoneJobs}
                    onChange={(e) => setShowDoneJobs(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#D31010] cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Show done jobs and tasks on schedule
                  </span>
                </label>
              </div>

              {/* Appointment color by */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Appointment color by:
                </label>
                <div className="relative max-w-xs">
                  <select
                    value={appointmentColorBy}
                    onChange={(e) => setAppointmentColorBy(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white appearance-none cursor-pointer pr-8 focus:outline-none focus:ring-2 focus:ring-[#D31010]/20 focus:border-[#D31010]"
                  >
                    <option value="Tech">Tech</option>
                    <option value="Job type">Job type</option>
                    <option value="Status">Status</option>
                    <option value="Service area">Service area</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Schedule template */}
          <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Schedule Template
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Customize how job pill headers appear on your calendar grid.
              </p>
            </div>

            <div className="space-y-4">
              <textarea
                rows={3}
                value={templateText}
                onChange={(e) => setTemplateText(e.target.value)}
                className="w-full p-4 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#D31010]/20 focus:border-[#D31010] resize-none font-mono"
              />

              {/* Clickable Token Pills */}
              <div className="space-y-2">
                <span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                  Insert Variables (Click to add):
                </span>
                <div className="flex flex-wrap gap-2">
                  {templateTokens.map((t) => (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => handleInsertToken(t.token)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-[#D31010] hover:text-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      +{t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Preview Sticky Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 sticky top-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Card Preview
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold">
                Real-time preview of your schedule event block.
              </p>
            </div>

            {/* Simulated Calendar Card in Brand Red Style */}
            <div className="p-4 rounded-2xl bg-[#D31010] text-white shadow-lg shadow-red-500/25 space-y-1.5 border border-white/20">
              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider opacity-90">
                <span>09:00 AM • Job #1065</span>
                <span className="bg-white/20 px-2 py-0.5 rounded-md text-[10px]">
                  {appointmentColorBy}
                </span>
              </div>
              <div className="text-xs font-bold leading-relaxed">
                {previewResult || "Job Title"}
              </div>
            </div>

            {/* Dark Slate Alternative Preview */}
            <div className="p-4 rounded-2xl bg-slate-800 text-white shadow-md space-y-1 border border-slate-700">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Secondary View
              </span>
              <p className="text-xs font-bold text-slate-200 leading-relaxed">
                {previewResult || "Job Title"}
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-3 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-2xl shadow-lg shadow-red-500/25 hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Preferences</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
