'use client'

import { useState, useEffect } from 'react'
import HeaderNav from '../components/HeaderNav'
import Footer from '../components/Footer'
import { supabase } from '@/lib/supabase'

interface Task {
  id: string
  title: string
  property_name: string
  assigned_to: string
  status: 'Pending' | 'In Progress' | 'Completed'
  due_date: string
  priority: 'Low' | 'Medium' | 'High'
}

interface Booking {
  id: string
  guest_name: string
  property_name: string
  check_in: string
  check_out: string
  total_price: number
  status: 'Confirmed' | 'Pending' | 'Cancelled'
}

export default function OperationsPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  // Task Form State
  const [taskTitle, setTaskTitle] = useState('')
  const [propertyName, setPropertyName] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium')

  // Price Adjustment State
  const [editPrice, setEditPrice] = useState('')

  useEffect(() => {
    fetchOperationsData()
  }, [])

  const fetchOperationsData = async () => {
    setLoading(true)
    const { data: taskData } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    const { data: bookingData } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })

    setTasks(taskData || [])
    setBookings(bookingData || [])
    setLoading(false)
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase.from('tasks').insert([
      {
        title: taskTitle,
        property_name: propertyName,
        assigned_to: assignedTo,
        due_date: dueDate,
        priority,
        status: 'Pending',
      },
    ])

    if (error) {
      alert('Error creating task: ' + error.message)
    } else {
      setTaskTitle('')
      setPropertyName('')
      setAssignedTo('')
      setDueDate('')
      fetchOperationsData()
    }
  }

  const handleUpdateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
    fetchOperationsData()
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col justify-between">
      <div>
        <HeaderNav />

        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
          {/* HEADER SUMMARY */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
            <div>
              <h1 className="text-2xl font-extrabold text-white">Operations & Task Tracking</h1>
              <p className="text-xs text-neutral-400 mt-1">Manage housekeeping, maintenance, and booking schedules across properties.</p>
            </div>
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs rounded-full">
              Active Ops Center
            </span>
          </div>

          {/* TASK CREATION & LISTING GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* TASK FORM */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl h-fit">
              <h2 className="text-lg font-bold text-amber-500 mb-4">Assign New Task</h2>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Task Details</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Deep Clean & Refill Amenities"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Property</label>
                  <input
                    type="text"
                    required
                    placeholder="Property Title or Address"
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Assignee</label>
                    <input
                      type="text"
                      required
                      placeholder="Staff Name"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-neutral-400 mb-1">Due Date</label>
                    <input
                      type="date"
                      required
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as 'Low' | 'Medium' | 'High')}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white text-xs outline-none focus:border-amber-500"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-neutral-400 mb-1">Adjustment Rate ($)</label>
                  <input
                    type="number"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-white text-xs outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl transition shadow-lg mt-2 cursor-pointer"
                >
                  Create Operations Task
                </button>
              </form>
            </div>

            {/* TASK DISPLAY QUEUE */}
            <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Task Queue ({tasks.length})</h2>

              {loading ? (
                <div className="py-8 text-center">
                  <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : tasks.length === 0 ? (
                <p className="text-xs text-neutral-500 italic">No operational tasks created yet.</p>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{task.title}</span>
                          <span
                            className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              task.priority === 'High'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : task.priority === 'Medium'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400">📍 {task.property_name} • Assigned: {task.assigned_to}</p>
                        <p className="text-[10px] text-neutral-500">Due: {task.due_date}</p>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <select
                          value={task.status}
                          onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value as Task['status'])}
                          className="bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs font-bold text-amber-400 outline-none cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ACTIVE BOOKINGS SUMMARY (LINE 252 FIXED & FULLY CLOSED) */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Current Verified Bookings</h2>
            {bookings.length === 0 ? (
              <p className="text-xs text-neutral-500 italic">No bookings recorded in system.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.map((b) => (
                  <div key={b.id} className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-white text-xs">{b.guest_name}</h3>
                      <p className="text-[11px] text-neutral-400">{b.property_name}</p>
                      <p className="text-[10px] text-neutral-500">{b.check_in} ➔ {b.check_out}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-amber-500 font-extrabold text-xs">${b.total_price}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}