import React, { useState } from "react";
import { useRouter } from "next/router";
import { FileText, ChevronLeft } from "lucide-react";
import { goeyToast as toast } from "goey-toast";

export default function EstimatesSettingsContent() {
  const router = useRouter();

  const [allowViewDoneJobs, setAllowViewDoneJobs] = useState(false);
  const [attachPdfFiles, setAttachPdfFiles] = useState(true);
  const [lockApprovedEstimates, setLockApprovedEstimates] = useState(true);
  const [autoDeclineSameJob, setAutoDeclineSameJob] = useState(true);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-8 pt-4 sm:pt-6 text-slate-800 dark:text-slate-100">
      <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        <span onClick={() => router.push("/estimates")} className="hover:text-slate-600 cursor-pointer">
          ESTIMATES
        </span>
        <span>#</span>
        <span className="text-slate-700 dark:text-slate-300 font-extrabold">ESTIMATES SETTINGS</span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/estimates")}
            className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Estimates settings
          </h1>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8 max-w-4xl">
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={() => {
              setAllowViewDoneJobs(!allowViewDoneJobs);
              toast.success("Setting updated!");
            }}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 mt-0.5 ${
              allowViewDoneJobs ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                allowViewDoneJobs ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Allow customers to view estimates for done jobs.
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              Customers can review estimates after job marked as done in Client portal
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-6">
          <button
            type="button"
            onClick={() => {
              setAttachPdfFiles(!attachPdfFiles);
              toast.success("Setting updated!");
            }}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 mt-0.5 ${
              attachPdfFiles ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                attachPdfFiles ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Attach PDF files
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              Send your clients PDF copy of estimates
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-6">
          <button
            type="button"
            onClick={() => {
              setLockApprovedEstimates(!lockApprovedEstimates);
              toast.success("Setting updated!");
            }}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 mt-0.5 ${
              lockApprovedEstimates ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                lockApprovedEstimates ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Lock approved estimates
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              Decide if approved estimates can be edited
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-6">
          <button
            type="button"
            onClick={() => {
              setAutoDeclineSameJob(!autoDeclineSameJob);
              toast.success("Setting updated!");
            }}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 mt-0.5 ${
              autoDeclineSameJob ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${
                autoDeclineSameJob ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>

          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Auto-decline estimates related to the same job
            </h3>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
              When enabled, approving one estimate will automatically decline all others for that job. When disabled, other estimates remain pending.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
