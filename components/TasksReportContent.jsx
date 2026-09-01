import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Download,
  Search,
  ChevronDown,
  Calendar,
  Filter,
  Check,
  ChevronLeft,
  ChevronRight,
  User,
  Clock,
  Briefcase,
  RefreshCw,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Tag,
  ListTodo,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { goeyToast as toast } from "goey-toast";
import { Api } from "../services/service";
import AddTaskModal from "./AddTaskModal";
import ConfirmationModal from "./ConfirmationModal";

export default function TasksReportContent() {
  const { theme } = useTheme();
  const router = useRouter();

  const [tasksList, setTasksList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedTech, setSelectedTech] = useState("All Technicians");
  const [selectedTag, setSelectedTag] = useState("All Tags");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const [allTechs, setAllTechs] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    done: 0,
    overdue: 0,
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      let queryUrl = `api/tasks?search=${encodeURIComponent(searchQuery)}&page=${currentPage}&limit=${rowsPerPage}`;
      if (selectedStatus !== "all") queryUrl += `&status=${selectedStatus}`;
      if (selectedTech !== "All Technicians") queryUrl += `&assigned_tech=${encodeURIComponent(selectedTech)}`;
      if (selectedTag !== "All Tags") queryUrl += `&tag=${encodeURIComponent(selectedTag)}`;

      const res = await Api("GET", queryUrl);
      if (res && (res.data || res.success)) {
        const list = Array.isArray(res.data) ? res.data : [];
        setTasksList(list);
        if (res.stats) setStats(res.stats);
        if (Array.isArray(res.technicians)) setAllTechs(res.technicians.filter(Boolean));
        if (Array.isArray(res.tags)) setAllTags(res.tags.filter(Boolean));
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [searchQuery, selectedStatus, selectedTech, selectedTag, rowsPerPage, currentPage]);

  const handleToggleTaskStatus = async (task) => {
    const nextStatus = task.status === "done" ? "open" : "done";
    const updatedList = tasksList.map((t) =>
      t._id === task._id ? { ...t, status: nextStatus, completed_at: nextStatus === "done" ? new Date() : null } : t
    );
    setTasksList(updatedList);

    try {
      await Api("PUT", `api/tasks/${task._id}`, { status: nextStatus });
      toast.success(nextStatus === "done" ? "Task completed!" : "Task reopened");
      fetchTasks();
    } catch (err) {
      toast.error("Failed to update task status");
      fetchTasks();
    }
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      const res = await Api("DELETE", `api/tasks/${taskToDelete._id}`);
      if (res && res.success) {
        toast.success("Task deleted successfully");
        setTaskToDelete(null);
        fetchTasks();
      } else {
        toast.error("Failed to delete task");
      }
    } catch (err) {
      toast.error("Error deleting task");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      window.open("/api/tasks/export", "_blank");
      toast.success("Downloading tasks report CSV...");
    } catch (e) {
      toast.error("Error exporting tasks");
    }
  };

  const now = new Date();

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <span
              onClick={() => router.push("/reports")}
              className="hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              Reports
            </span>
            <span>#</span>
            <span className="text-[#D31010]">Tasks report</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-[#D31010]" />
            <span>Tasks report</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white dark:bg-[#0E1E31] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingTask(null);
              setIsAddModalOpen(true);
            }}
            className="px-5 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-extrabold rounded-xl shadow-md shadow-red-500/20 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add task</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="p-4 bg-white dark:bg-[#0E1E31] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">All company tasks</div>
          </div>
        </div>

        {/* Open Tasks */}
        <div className="p-4 bg-white dark:bg-[#0E1E31] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col justify-between border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Open (Pending)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{stats.open}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Tasks requiring action</div>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="p-4 bg-white dark:bg-[#0E1E31] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col justify-between border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Completed</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.done}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Successfully finished</div>
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="p-4 bg-white dark:bg-[#0E1E31] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col justify-between border-l-4 border-l-[#D31010]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#D31010]">Overdue</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/50 text-[#D31010] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-[#D31010]">{stats.overdue}</div>
            <div className="text-[11px] text-red-500/80 mt-0.5">Past due date</div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white dark:bg-[#0E1E31] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search task title, job #, client, technician, tag..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D31010]/30 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open Only</option>
              <option value="done">Done Only</option>
              <option value="overdue">Overdue Only</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Assigned Tech Filter */}
          <div className="relative">
            <select
              value={selectedTech}
              onChange={(e) => {
                setSelectedTech(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer max-w-[160px] truncate"
            >
              <option value="All Technicians">All Technicians</option>
              {allTechs.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Tag Filter */}
          <div className="relative">
            <select
              value={selectedTag}
              onChange={(e) => {
                setSelectedTag(e.target.value);
                setCurrentPage(1);
              }}
              className="appearance-none pl-3 pr-8 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All Tags">All Tags</option>
              {allTags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Tasks Table */}
      <div className="bg-white dark:bg-[#0E1E31] border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                <th className="py-3.5 px-6 w-12 text-center">Status</th>
                <th className="py-3.5 px-6">Task Title & Details</th>
                <th className="py-3.5 px-6">Job & Client</th>
                <th className="py-3.5 px-6">Assigned To</th>
                <th className="py-3.5 px-6">Due Date</th>
                <th className="py-3.5 px-6">Tags</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-semibold">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#D31010]" />
                      <span className="text-xs font-bold">Loading tasks...</span>
                    </div>
                  </td>
                </tr>
              ) : tasksList.length > 0 ? (
                tasksList.map((task) => {
                  const isDone = task.status === "done";
                  const isOverdue =
                    !isDone && task.due_date && new Date(task.due_date) < now;

                  return (
                    <tr
                      key={task._id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isDone ? "opacity-60 bg-slate-50/30 dark:bg-slate-900/30" : ""
                      }`}
                    >
                      {/* Checkbox Status */}
                      <td className="py-4 px-6 text-center">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => handleToggleTaskStatus(task)}
                          className="w-4 h-4 rounded text-[#D31010] focus:ring-[#D31010] cursor-pointer"
                        />
                      </td>

                      {/* Title & Description */}
                      <td className="py-4 px-6">
                        <div
                          className={`font-bold text-xs ${
                            isDone
                              ? "line-through text-slate-400 dark:text-slate-500"
                              : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {task.description}
                          </div>
                        )}
                      </td>

                      {/* Job & Client Link */}
                      <td className="py-4 px-6">
                        {task.job_id ? (
                          <button
                            type="button"
                            onClick={() => router.push(`/jobs/${task.job_id}`)}
                            className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Briefcase className="w-3.5 h-3.5" />
                            <span>
                              Job #{task.job_id.length >= 24 ? task.job_id.slice(-4).toUpperCase() : task.job_id.startsWith("#") ? task.job_id.slice(1) : task.job_id}
                            </span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">General task</span>
                        )}
                        {task.client_name && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {task.client_name}
                          </div>
                        )}
                      </td>

                      {/* Assigned Tech */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{task.assigned_tech || "PIXL TECHNICIAN"}</span>
                        </div>
                      </td>

                      {/* Due Date & Time */}
                      <td className="py-4 px-6">
                        {task.due_date ? (
                          <div>
                            <span
                              className={`text-xs font-semibold ${
                                isOverdue
                                  ? "text-[#D31010] font-bold"
                                  : "text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                            {task.due_time && (
                              <span className="text-[10px] text-slate-400 block font-normal">
                                {task.due_time}
                              </span>
                            )}
                            {isOverdue && (
                              <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-red-100 dark:bg-red-950/60 text-[#D31010] mt-0.5">
                                Overdue
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Tags */}
                      <td className="py-4 px-6">
                        {Array.isArray(task.tags) && task.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {task.tags.map((t) => (
                              <span
                                key={t}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTask(task);
                              setIsAddModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            title="Edit task"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setTaskToDelete(task)}
                            className="p-1.5 text-slate-400 hover:text-[#D31010] rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                            title="Delete task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <ListTodo className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        No tasks found
                      </div>
                      <p className="text-[11px] text-slate-400 max-w-xs">
                        Break down jobs and leads into actionable assignments by creating tasks.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTask(null);
                          setIsAddModalOpen(true);
                        }}
                        className="px-4 py-2 bg-[#D31010] hover:bg-[#b00d0d] text-white text-xs font-bold rounded-xl shadow-sm cursor-pointer"
                      >
                        + Create First Task
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 font-bold">
          <div>
            Showing {tasksList.length} task{tasksList.length !== 1 ? "s" : ""}
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {currentPage}</span>
            <button
              disabled={tasksList.length < rowsPerPage}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Task Modal */}
      <AddTaskModal
        isOpen={isAddModalOpen}
        initialData={editingTask}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTask(null);
        }}
        onSaved={() => fetchTasks()}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(taskToDelete)}
        title="Delete Task"
        message={
          taskToDelete
            ? `Are you sure you want to delete "${taskToDelete.title}"?`
            : "Are you sure you want to delete this task?"
        }
        confirmText="Delete Task"
        isLoading={isDeleting}
        onConfirm={confirmDeleteTask}
        onClose={() => setTaskToDelete(null)}
      />
    </div>
  );
}
