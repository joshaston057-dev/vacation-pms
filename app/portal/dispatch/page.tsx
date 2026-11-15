"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

type UrgencyLevel = "Critical" | "High" | "Medium" | "Low";

interface DispatchTask {
  id: string;
  title: string;
  property_name: string;
  task_type: "Scheduled" | "On-Demand" | "Auto-Booking";
  category: "Gas Refill" | "Cleaning" | "Maintenance" | "Supplies" | "Check-In Prep";
  operator_name: string;
  operator_whatsapp: string;
  scheduled_date: string;
  scheduled_time: string;
  recurrence: "One-Time" | "Weekly" | "Bi-Weekly" | "Monthly";
  urgency: UrgencyLevel;
  status: "Scheduled" | "Pending" | "In Progress" | "Completed";
  notes?: string;
  owner_id?: string;
}

const URGENCY_WEIGHT: Record<UrgencyLevel, number> = {
  Critical: 4,
  High: 3,
  Medium: 2,
  Low: 1,
};

export default function DispatchModulePage() {
  const [tasks, setTasks] = useState<DispatchTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<string>("All");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [defaultCleaner, setDefaultCleaner] = useState({
    name: "Sarah Namukasa",
    whatsapp: "+256780564778",
  });

  const [newTask, setNewTask] = useState<Omit<DispatchTask, "id">>({
    title: "",
    property_name: "Luxury Villa in Munyonyo",
    task_type: "Scheduled",
    category: "Cleaning",
    operator_name: "",
    operator_whatsapp: "+256",
    scheduled_date: new Date().toISOString().split("T")[0],
    scheduled_time: "09:00",
    recurrence: "One-Time",
    urgency: "High",
    status: "Scheduled",
    notes: "",
  });

  const fetchTasks = async () => {
    setLoading(true);
    if (!supabase) {
      setLoading(false);
      return;
    }

    // 1. Get logged-in owner session
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // 2. Fetch ONLY tasks belonging to this specific logged-in owner account
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("owner_id", user.id)
      .order("scheduled_date", { ascending: true });
    
    if (!error && data) {
      setTasks(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be logged in to create tasks.");
      return;
    }

    const created = {
      ...newTask,
      owner_id: user.id, // Ties new task to logged-in owner account
    };

    const { data, error } = await supabase.from("tasks").insert([created]).select();
    
    if (error) {
      alert("Failed to create task: " + error.message);
    } else {
      if (data) {
        setTasks((prev) => [data[0], ...prev]);
      }
      setShowModal(false);
      setNewTask({
        title: "",
        property_name: "Luxury Villa in Munyonyo",
        task_type: "Scheduled",
        category: "Cleaning",
        operator_name: "",
        operator_whatsapp: "+256",
        scheduled_date: new Date().toISOString().split("T")[0],
        scheduled_time: "09:00",
        recurrence: "One-Time",
        urgency: "High",
        status: "Scheduled",
        notes: "",
      });
    }
  };

  const handleQuickBookingAllocation = async () => {
    if (!supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be logged in.");
      return;
    }

    const autoCleaningTask = {
      title: "Turnover Cleaning (New Confirmed Booking)",
      property_name: "Lakeside Haven in Entebbe",
      task_type: "Auto-Booking" as const,
      category: "Cleaning" as const,
      operator_name: defaultCleaner.name,
      operator_whatsapp: defaultCleaner.whatsapp,
      scheduled_date: new Date().toISOString().split("T")[0],
      scheduled_time: "11:00",
      recurrence: "One-Time" as const,
      urgency: "Critical" as const,
      status: "Pending" as const,
      notes: "Auto-allocated immediately upon booking confirmation. Full sanitize & linen prep.",
      owner_id: user.id, // Ties auto-cleaning task to logged-in owner
    };

    const { data, error } = await supabase.from("tasks").insert([autoCleaningTask]).select();
    if (!error && data) {
      setTasks((prev) => [data[0], ...prev]);
    } else if (error) {
      alert("Auto-allocation failed: " + error.message);
    }
  };

  const handleUrgencyChange = async (id: string, nextUrgency: UrgencyLevel) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, urgency: nextUrgency } : t)));
    if (supabase) {
      await supabase.from("tasks").update({ urgency: nextUrgency }).eq("id", id);
    }
  };

  const handleStatusChange = async (id: string, nextStatus: DispatchTask["status"]) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status: nextStatus } : t)));
    if (supabase) {
      await supabase.from("tasks").update({ status: nextStatus }).eq("id", id);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!confirm("Delete this task permanently?")) return;
    setTasks(tasks.filter((t) => t.id !== id));
    if (supabase) {
      await supabase.from("tasks").delete().eq("id", id);
    }
  };

  const getWhatsAppDispatchUrl = (task: DispatchTask) => {
    const cleanPhone = task.operator_whatsapp.replace(/[^0-9]/g, "");
    const message = `*LA ESTANCIA DISPATCH [${task.urgency.toUpperCase()} URGENCY]*\n\n*Operator:* ${task.operator_name}\n*Property:* ${task.property_name}\n*Task:* ${task.title} (${task.category})\n*Date & Time:* ${task.scheduled_date} at ${task.scheduled_time}\n*Schedule:* ${task.recurrence}\n${task.notes ? `*Instructions:* ${task.notes}` : ""}`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const rankedAndFilteredTasks = tasks
    .filter((t) => {
      const matchesTab =
        filterTab === "All" ||
        (filterTab === "Auto-Booking" && t.task_type === "Auto-Booking") ||
        (filterTab === "Scheduled" && t.task_type === "Scheduled") ||
        t.status === filterTab;

      const matchesUrgency = urgencyFilter === "All" || t.urgency === urgencyFilter;

      const matchesSearch =
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.operator_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.property_name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesUrgency && matchesSearch;
    })
    .sort((a, b) => {
      if (a.status === "Completed" && b.status !== "Completed") return 1;
      if (b.status === "Completed" && a.status !== "Completed") return -1;
      return URGENCY_WEIGHT[b.urgency] - URGENCY_WEIGHT[a.urgency];
    });

  const urgencyStyles: Record<UrgencyLevel, string> = {
    Critical: "bg-red-500/20 text-red-400 border-red-500/40",
    High: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    Medium: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    Low: "bg-neutral-800 text-neutral-400 border-neutral-700",
  };

  const urgencyDots: Record<UrgencyLevel, string> = {
    Critical: "🔴 Critical",
    High: "🟠 High",
    Medium: "🔵 Medium",
    Low: "⚪ Low",
  };

  const statusColors = {
    Scheduled: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
    Pending: "bg-neutral-800 text-neutral-300 border border-neutral-700",
    "In Progress": "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    Completed: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2 px-4 sm:px-8">
      {/* Top Header & Primary Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-neutral-800/80 pb-5">
        <div>
          <h1 className="text-xl font-bold text-white">Task & Scheduled Dispatch</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Tasks are ranked automatically by urgency. Confirmed bookings auto-allocate cleaning to your default housekeeping lead.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={fetchTasks}
            className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs px-3.5 py-2.5 rounded-xl transition cursor-pointer"
          >
            🔄 Refresh
          </button>
          <button
            onClick={handleQuickBookingAllocation}
            className="bg-neutral-900 hover:bg-neutral-800 text-emerald-400 border border-emerald-500/30 font-semibold px-3.5 py-2.5 rounded-xl text-xs transition cursor-pointer"
          >
            ⚡ Auto-Allocate Cleaning
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-lg shadow-amber-500/10 cursor-pointer"
          >
            + Set / Schedule Task
          </button>
        </div>
      </div>

      {/* Auto-Booking Default Cleaner Config Bar */}
      <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-base">🧹</span>
          <div>
            <p className="text-xs font-semibold text-white">Auto-Booking Housekeeping Lead</p>
            <p className="text-[11px] text-neutral-400">
              Automatically assigned whenever a guest booking is confirmed:
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={defaultCleaner.name}
            onChange={(e) => setDefaultCleaner({ ...defaultCleaner, name: e.target.value })}
            placeholder="Lead Cleaner Name"
            className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-white"
          />
          <input
            type="tel"
            value={defaultCleaner.whatsapp}
            onChange={(e) => setDefaultCleaner({ ...defaultCleaner, whatsapp: e.target.value })}
            placeholder="+2567..."
            className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-mono"
          />
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {["All", "Auto-Booking", "Scheduled", "Pending", "In Progress", "Completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                filterTab === tab
                  ? "bg-neutral-800 text-white border border-neutral-700"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-1.5 text-xs text-neutral-200 focus:outline-none cursor-pointer"
          >
            <option value="All">All Urgency Levels</option>
            <option value="Critical">🔴 Critical Only</option>
            <option value="High">🟠 High Urgency</option>
            <option value="Medium">🔵 Medium Urgency</option>
            <option value="Low">⚪ Low Urgency</option>
          </select>

          <input
            type="text"
            placeholder="Search operator, property, task..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-neutral-900 border border-neutral-800 rounded-lg px-3.5 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-700 w-full sm:w-56"
          />
        </div>
      </div>

      {/* Ranked Task Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-neutral-400 text-xs">Loading live dispatch queue...</div>
      ) : rankedAndFilteredTasks.length === 0 ? (
        <div className="bg-neutral-900/50 border border-neutral-800/80 rounded-2xl p-12 text-center">
          <p className="text-sm text-neutral-400">No active dispatch tasks found for your account portfolio. Approved bookings and scheduled tasks will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {rankedAndFilteredTasks.map((task, index) => (
            <div
              key={task.id}
              className={`bg-neutral-900/80 border rounded-xl p-5 flex flex-col justify-between space-y-4 transition ${
                task.urgency === "Critical" && task.status !== "Completed"
                  ? "border-red-500/40 shadow-lg shadow-red-500/5"
                  : "border-neutral-800"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
                      #{index + 1}
                    </span>

                    <select
                      value={task.urgency}
                      onChange={(e) =>
                        handleUrgencyChange(task.id, e.target.value as UrgencyLevel)
                      }
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded border cursor-pointer focus:outline-none ${
                        urgencyStyles[task.urgency]
                      }`}
                    >
                      <option value="Critical" className="bg-neutral-900 text-red-400">
                        🔴 Critical
                      </option>
                      <option value="High" className="bg-neutral-900 text-amber-400">
                        🟠 High
                      </option>
                      <option value="Medium" className="bg-neutral-900 text-blue-400">
                        🔵 Medium
                      </option>
                      <option value="Low" className="bg-neutral-900 text-neutral-300">
                        ⚪ Low
                      </option>
                    </select>

                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-neutral-800 text-neutral-200">
                      {task.category}
                    </span>

                    {task.task_type === "Auto-Booking" ? (
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        ⚡ Auto-Booking
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400">
                        🗓️ {task.recurrence}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-neutral-500 hover:text-red-400 text-xs cursor-pointer"
                    title="Delete Task"
                  >
                    ✕
                  </button>
                </div>

                <h3 className="text-base font-bold text-white mt-3">{task.title}</h3>
                <p className="text-xs text-amber-400 font-medium mt-1">🏡 {task.property_name}</p>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-neutral-300 bg-neutral-950/60 px-3 py-2 rounded-lg border border-neutral-800/60">
                  <span>
                    <strong className="text-neutral-400 font-normal">Date:</strong>{" "}
                    {task.scheduled_date}
                  </span>
                  <span>
                    <strong className="text-neutral-400 font-normal">Time:</strong>{" "}
                    {task.scheduled_time}
                  </span>
                  <span>
                    <strong className="text-neutral-400 font-normal">Urgency:</strong>{" "}
                    {urgencyDots[task.urgency]}
                  </span>
                </div>

                {task.notes && (
                  <p className="text-xs text-neutral-400 mt-2.5 leading-relaxed">{task.notes}</p>
                )}
              </div>

              <div className="pt-3.5 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <p className="text-xs text-white font-semibold">👤 {task.operator_name}</p>
                  <p className="text-[11px] text-emerald-400 font-mono">{task.operator_whatsapp}</p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={getWhatsAppDispatchUrl(task)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition flex items-center gap-1.5"
                  >
                    <span>WhatsApp</span>
                    <span>&rarr;</span>
                  </a>

                  <select
                    value={task.status}
                    onChange={(e) =>
                      handleStatusChange(task.id, e.target.value as DispatchTask["status"])
                    }
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer focus:outline-none ${
                      statusColors[task.status]
                    }`}
                  >
                    <option value="Scheduled" className="bg-neutral-900 text-white">
                      Scheduled
                    </option>
                    <option value="Pending" className="bg-neutral-900 text-white">
                      Pending
                    </option>
                    <option value="In Progress" className="bg-neutral-900 text-white">
                      In Progress
                    </option>
                    <option value="Completed" className="bg-neutral-900 text-white">
                      Completed
                    </option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Set & Schedule Operator Task */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg p-6 text-neutral-100 my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">Set / Schedule Operator Task</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-neutral-400 hover:text-white text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Task Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Refill Cooking Gas"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Task Category *</label>
                  <select
                    value={newTask.category}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        category: e.target.value as DispatchTask["category"],
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="Gas Refill">Gas Refill</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Supplies">Supplies</option>
                    <option value="Check-In Prep">Check-In Prep</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Property *</label>
                  <input
                    type="text"
                    required
                    value={newTask.property_name}
                    onChange={(e) => setNewTask({ ...newTask, property_name: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 mb-1">Urgency Rating *</label>
                  <select
                    value={newTask.urgency}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        urgency: e.target.value as UrgencyLevel,
                      })
                    }
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="Critical">🔴 Critical (Immediate)</option>
                    <option value="High">🟠 High Urgency</option>
                    <option value="Medium">🔵 Medium Urgency</option>
                    <option value="Low">⚪ Low Urgency</option>
                  </select>
                </div>
              </div>

              <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                  Operator Assignment Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Operator Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Moses Kato"
                      value={newTask.operator_name}
                      onChange={(e) => setNewTask({ ...newTask, operator_name: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">
                      Operator WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+2567..."
                      value={newTask.operator_whatsapp}
                      onChange={(e) =>
                        setNewTask({ ...newTask, operator_whatsapp: e.target.value })
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                  Schedule & Dates
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Scheduled Date *</label>
                    <input
                      type="date"
                      required
                      value={newTask.scheduled_date}
                      onChange={(e) => setNewTask({ ...newTask, scheduled_date: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Time *</label>
                    <input
                      type="time"
                      required
                      value={newTask.scheduled_time}
                      onChange={(e) => setNewTask({ ...newTask, scheduled_time: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">Repeat Schedule</label>
                    <select
                      value={newTask.recurrence}
                      onChange={(e) =>
                        setNewTask({
                          ...newTask,
                          recurrence: e.target.value as DispatchTask["recurrence"],
                        })
                      }
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-2 text-xs text-white"
                    >
                      <option value="One-Time">One-Time</option>
                      <option value="Weekly">Weekly</option>
                      <option value="Bi-Weekly">Bi-Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-neutral-400 mb-1">Instructions / Notes</label>
                <input
                  type="text"
                  placeholder="Cylinder size, access codes, or checklist details..."
                  value={newTask.notes}
                  onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-xs text-neutral-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold px-5 py-2 rounded-lg text-xs cursor-pointer"
                >
                  Save & Assign Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}