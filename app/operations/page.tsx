'use client';

import { useState } from 'react';

interface Task {
  id: string;
  property: string;
  accessPin: string;
  category: 'Cleaning' | 'Restocking' | 'Maintenance' | 'Inspection';
  task: string;
  date: string;
  assignedTo: string;
  staffPhone: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'In Progress' | 'Completed';
  unitStatus: 'Needs Clean' | 'In Cleaning' | 'Ready for Guest' | 'Occupied';
}

export default function OperationsPage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      property: 'Kololo Serviced Apartment',
      accessPin: 'PIN: 4821 #',
      category: 'Cleaning',
      task: 'Turnaround Clean & Fresh Linen Swap',
      date: '2026-10-21',
      assignedTo: 'Sarah',
      staffPhone: '256757386946',
      priority: 'High',
      status: 'Pending',
      unitStatus: 'Needs Clean',
    },
    {
      id: '2',
      property: 'Naguru Heights Villa',
      accessPin: 'Gate Box: 9021',
      category: 'Restocking',
      task: 'Refill 13kg Cooking Gas Cylinder & Water Tokens',
      date: '2026-10-22',
      assignedTo: 'Joshua',
      staffPhone: '256780564778',
      priority: 'Medium',
      status: 'Pending',
      unitStatus: 'In Cleaning',
    },
  ]);

  const [activeFilter, setActiveFilter] = useState<'All' | 'Cleaning' | 'Maintenance' | 'Restocking'>('All');

  // Form State
  const [property, setProperty] = useState('');
  const [accessPin, setAccessPin] = useState('');
  const [category, setCategory] = useState<'Cleaning' | 'Restocking' | 'Maintenance' | 'Inspection'>('Cleaning');
  const [taskName, setTaskName] = useState('');
  const [taskDate, setTaskDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [unitStatus, setUnitStatus] = useState<'Needs Clean' | 'In Cleaning' | 'Ready for Guest' | 'Occupied'>('Needs Clean');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!property || !taskName || !taskDate) return;

    const newTask: Task = {
      id: Date.now().toString(),
      property,
      accessPin: accessPin || 'No Pin Provided',
      category,
      task: taskName,
      date: taskDate,
      assignedTo: assignedTo || 'Unassigned',
      staffPhone: staffPhone || '256757386946',
      priority,
      status: 'Pending',
      unitStatus,
    };

    setTasks([newTask, ...tasks]);
    resetForm();
  };

  const resetForm = () => {
    setProperty('');
    setAccessPin('');
    setTaskName('');
    setTaskDate('');
    setAssignedTo('');
    setStaffPhone('');
    setCategory('Cleaning');
    setPriority('Medium');
    setUnitStatus('Needs Clean');
  };

  const cycleStatus = (id: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === id) {
          const nextStatus =
            t.status === 'Pending'
              ? 'In Progress'
              : t.status === 'In Progress'
              ? 'Completed'
              : 'Pending';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const filteredTasks = activeFilter === 'All' 
    ? tasks 
    : tasks.filter(t => t.category === activeFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-amber-400 font-bold text-xs uppercase tracking-widest block mb-1">
            Host Operations Center
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Turnarounds, Lockbox Pins & Rota
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2 text-slate-300 text-sm font-medium">
            Pending Tasks: <span className="text-amber-400 font-bold">{tasks.filter(t => t.status !== 'Completed').length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Task Creation Form */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md h-fit space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
            ➕ Schedule Turnaround & Task
          </h2>

          <form onSubmit={handleAddTask} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Property Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Kololo Serviced Apartment"
                value={property}
                onChange={(e) => setProperty(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Access PIN / Lockbox</label>
                <input
                  type="text"
                  placeholder="e.g. PIN: 4821"
                  value={accessPin}
                  onChange={(e) => setAccessPin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Unit Status</label>
                <select
                  value={unitStatus}
                  onChange={(e: any) => setUnitStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Needs Clean">🧹 Needs Clean</option>
                  <option value="In Cleaning">🔄 In Cleaning</option>
                  <option value="Ready for Guest">✅ Ready for Guest</option>
                  <option value="Occupied">🚗 Occupied</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Cleaning">Cleaning</option>
                  <option value="Restocking">Restocking</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Inspection">Inspection</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e: any) => setPriority(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Task Description</label>
              <input
                type="text"
                required
                placeholder="e.g. Linen Swap, Gas Cylinder Refill"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2.5 text-[11px] text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Staff Name</label>
                <input
                  type="text"
                  placeholder="Sarah"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp #</label>
                <input
                  type="text"
                  placeholder="256757..."
                  value={staffPhone}
                  onChange={(e) => setStaffPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition transform active:scale-95 mt-2 cursor-pointer"
            >
              Add Operations Task
            </button>
          </form>
        </div>

        {/* Task List Table */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl backdrop-blur-md space-y-4 p-6">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white">📋 Active Turnarounds & Rota</h2>
            
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {(['All', 'Cleaning', 'Restocking', 'Maintenance'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                    activeFilter === tab
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-amber-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Property, Pin & Task</th>
                  <th className="px-4 py-3">Unit Status</th>
                  <th className="px-4 py-3">Staff & WhatsApp</th>
                  <th className="px-4 py-3 text-right">Action / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium text-xs">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-slate-500">
                      No operations tasks found for this category.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3.5 space-y-1">
                        <div className="text-white font-bold flex items-center gap-2">
                          <span>{t.property}</span>
                        </div>
                        <div className="text-slate-300">{t.task}</div>
                        <div className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md inline-block border border-amber-500/20">
                          🔑 {t.accessPin}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold inline-block border ${
                          t.unitStatus === 'Ready for Guest'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : t.unitStatus === 'In Cleaning'
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                            : t.unitStatus === 'Occupied'
                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }`}>
                          {t.unitStatus === 'Ready for Guest' ? '✅ ' : t.unitStatus === 'In Cleaning' ? '🔄 ' : t.unitStatus === 'Occupied' ? '🚗 ' : '🧹 '}
                          {t.unitStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 space-y-1">
                        <div className="text-slate-200 font-semibold">👤 {t.assignedTo}</div>
                        <a
                          href={`https://wa.me/${t.staffPhone}?text=Hello%20${t.assignedTo}%2C%20here%20is%20your%20rota%20task%20for%20${encodeURIComponent(t.property)}:%20${encodeURIComponent(t.task)}.%20Access%20PIN:%20${encodeURIComponent(t.accessPin)}.`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold transition"
                        >
                          <span>📲 WhatsApp Staff</span>
                        </a>
                      </td>
                      <td className="px-4 py-3.5 text-right space-y-2">
                        <button
                          onClick={() => cycleStatus(t.id)}
                          className={`block ml-auto px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            t.status === 'Completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : t.status === 'In Progress'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                          }`}
                        >
                          {t.status === 'Completed'
                            ? '✓ Completed'
                            : t.status === 'In Progress'
                            ? '🔄 In Progress'
                            : '⏳ Pending'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}