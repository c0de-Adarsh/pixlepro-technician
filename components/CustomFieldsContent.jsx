import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  ClipboardList,
  Plus,
  ExternalLink,
  Video,
  ChevronDown,
  FileCheck,
} from "lucide-react";
import { goeyToast as toast } from "goey-toast";
import AddNewFieldDrawer from "./AddNewFieldDrawer";

export default function CustomFieldsContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("job");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [jobFields, setJobFields] = useState([
    {
      id: "cf_1",
      name: "Job Number",
      jobType: "Home Theater Installation",
      fieldType: "Text",
      required: "Yes",
      group: "Extra Info",
    },
  ]);

  const [clientFields, setClientFields] = useState([]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6 pt-4 sm:pt-6 text-slate-800 dark:text-slate-100">
      <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 space-x-2">
        <span onClick={() => router.push("/schedule")} className="hover:text-slate-600 cursor-pointer">SCHEDULE</span>
        <span>#</span>
        <span onClick={() => router.push("/settings/ad-groups")} className="hover:text-slate-600 cursor-pointer">AD GROUPS</span>
        <span>#</span>
        <span onClick={() => router.push("/settings")} className="hover:text-slate-600 cursor-pointer">SETTINGS</span>
        <span>#</span>
        <span className="text-slate-700 dark:text-slate-300 font-extrabold">CUSTOM FIELDS</span>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm flex-shrink-0">
            <ClipboardList className="w-6 h-6 text-[#D31010]" />
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Custom Fields
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              <span>Need more information on your jobs? Add your own custom fields.</span>
              <button
                type="button"
                onClick={() => toast.info("Opening Custom fields guide...")}
                className="text-[#D31010] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Read guide</span>
                <ExternalLink className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => toast.info("Opening tutorial video...")}
                className="text-[#D31010] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span>Watch video</span>
                <Video className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-8 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("job")}
            className={`py-3 px-1 border-b-2 transition-colors cursor-pointer ${
              activeTab === "job"
                ? "border-[#D31010] text-[#D31010] font-bold"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            Job/Lead
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("client")}
            className={`py-3 px-1 border-b-2 transition-colors cursor-pointer ${
              activeTab === "client"
                ? "border-[#D31010] text-[#D31010] font-bold"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            }`}
          >
            Client
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="px-5 py-2.5 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-semibold rounded-full shadow-md shadow-red-500/20 hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add New</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        {activeTab === "job" ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <div className="p-4 px-6 bg-slate-50/70 dark:bg-slate-800/40 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <ChevronDown className="w-4 h-4 text-slate-500" />
              <span>Group: Extra Info</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 bg-white dark:bg-slate-900">
                    <th className="py-3.5 px-6">Name</th>
                    <th className="py-3.5 px-6">Job Type</th>
                    <th className="py-3.5 px-6">Type</th>
                    <th className="py-3.5 px-6">Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                  {jobFields.map((field) => (
                    <tr key={field.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{field.name}</td>
                      <td className="py-4 px-6 font-semibold text-slate-600 dark:text-slate-400">{field.jobType}</td>
                      <td className="py-4 px-6 font-semibold text-slate-600 dark:text-slate-400">{field.fieldType}</td>
                      <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-200">{field.required}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            {clientFields.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-20 px-4 space-y-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-inner">
                  <FileCheck className="w-10 h-10 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    No custom fields found
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(true)}
                    className="text-xs font-bold text-[#D31010] hover:underline mt-2 inline-block cursor-pointer"
                  >
                    Create your first custom field
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                      <th className="py-3.5 px-6">Name</th>
                      <th className="py-3.5 px-6">Group</th>
                      <th className="py-3.5 px-6">Type</th>
                      <th className="py-3.5 px-6">Searchable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {clientFields.map((field) => (
                      <tr key={field.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{field.name}</td>
                        <td className="py-4 px-6 font-semibold text-slate-600 dark:text-slate-400">{field.group}</td>
                        <td className="py-4 px-6 font-semibold text-slate-600 dark:text-slate-400">{field.fieldType}</td>
                        <td className="py-4 px-6 font-bold text-slate-800 dark:text-slate-200">{field.searchable}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <AddNewFieldDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={activeTab}
        onCreated={(newField) => {
          if (activeTab === "job") {
            setJobFields((prev) => [...prev, newField]);
          } else {
            setClientFields((prev) => [...prev, newField]);
          }
        }}
      />
    </div>
  );
}
