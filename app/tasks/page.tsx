'use client'

import { useState } from 'react'

interface Task {
  id: string
  title: string
  property: string
  assignee: string
  priority: 'High' | 'Medium' | 'Low'
  status: 'Pending' | 'In Progress' | 'Completed'
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Prepare welcome basket & keys', property: 'Kisaasi Suite', assignee: 'Cleaner Mary', priority: 'High', status: 'Pending' },
    { id: '2', title: 'Fix AC remote control batteries', property: 'Entebbe Villa', assignee: 'Technician Paul', priority: 'Medium', status: 'In Progress' }
  ])

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({ title: '', property: '', assignee: '', priority: 'Medium' as const, status: 'Pending' as const })

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    const newTask: Task = { id: Date.now().toString(), ...formData }
    setTasks([newTask, ...tasks])
    setIsModalOpen(false)
    setFormData({ title: '', property: '', assignee: '', priority: 'Medium', status: 'Pending' })
  }

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id))
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks & Operations Dispatch</h1>
            <p className="text-neutral-400 text-sm mt-1">Assign housekeeping, maintenance, and check-in tasks to your team.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + New Task
          </button>
        </div>

        {/* Task Table */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 text-xs uppercase tracking-wider">
                <th className="p-4">Task</th>
                <th className="p-4">Property</th>
                <th className="p-4">Assignee</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-sm">
              {tasks.map(task => (
                <tr key={task.id} className="hover:bg-neutral-850">
                  <td className="p-4 font-medium">{task.title}</td>
                  <td className="p-4 text-neutral-400">{task.property}</td>
                  <td className="p-4 text-neutral-300">{task.assignee}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2.5 py-1 rounded font-semibold ${
                      task.priority === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-neutral-800 text-neutral-300'
                    }`}>
                      {task.priority}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2.5 py-1 rounded font-semibold">
                      {task.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-400 hover:text-red-300 text-xs font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Create Dispatch Task</h2>
              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Task Description</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Deep clean kitchen & restock coffee"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Property</label>
                    <input
                      type="text"
                      required
                      value={formData.property}
                      onChange={e => setFormData({ ...formData, property: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Kisaasi Suite"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Assignee</label>
                    <input
                      type="text"
                      required
                      value={formData.assignee}
                      onChange={e => setFormData({ ...formData, assignee: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Mary"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    Assign Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}