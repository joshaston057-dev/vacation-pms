'use client'

import { useState } from 'react'

interface Expense {
  id: string
  category: string
  title: string
  amount: number
  date: string
}

export default function FinancialsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', category: 'Rent', title: 'Kisaasi Apartment Lease', amount: 600, date: '2026-11-01' },
    { id: '2', category: 'Utilities', title: 'Electricity & Internet', amount: 150, date: '2026-11-03' },
    { id: '3', category: 'Maintenance', title: 'AC Servicing', amount: 80, date: '2026-11-05' }
  ])

  const [monthlyRevenue] = useState(4850) // Simulated booking revenue
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newExpense, setNewExpense] = useState({ category: 'Utilities', title: '', amount: 0, date: new Date().toISOString().split('T')[0] })

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0)
  const netProfit = monthlyRevenue - totalExpenses

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault()
    const expense: Expense = {
      id: Date.now().toString(),
      ...newExpense,
      amount: Number(newExpense.amount)
    }
    setExpenses([expense, ...expenses])
    setIsModalOpen(false)
    setNewExpense({ category: 'Utilities', title: '', amount: 0, date: new Date().toISOString().split('T')[0] })
  }

  const handleDeleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id))
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Ledger & Statements</h1>
            <p className="text-neutral-400 text-sm mt-1">Track monthly earnings, expenses, and net profit.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            + Add Expense
          </button>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
            <p className="text-sm font-medium text-neutral-400">Monthly Revenue</p>
            <p className="text-3xl font-bold text-emerald-400 mt-2">${monthlyRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
            <p className="text-sm font-medium text-neutral-400">Total Operational Expenses</p>
            <p className="text-3xl font-bold text-red-400 mt-2">${totalExpenses.toLocaleString()}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl">
            <p className="text-sm font-medium text-neutral-400">Net Profit</p>
            <p className="text-3xl font-bold text-sky-400 mt-2">${netProfit.toLocaleString()}</p>
          </div>
        </div>

        {/* Expense Table */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-neutral-800">
            <h2 className="text-lg font-bold">Operational Bills & Expenses</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950 text-neutral-400 text-xs uppercase tracking-wider">
                  <th className="p-4">Date</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800 text-sm">
                {expenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-neutral-850">
                    <td className="p-4 text-neutral-400">{expense.date}</td>
                    <td className="p-4">
                      <span className="bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded text-xs font-semibold">
                        {expense.category}
                      </span>
                    </td>
                    <td className="p-4 font-medium">{expense.title}</td>
                    <td className="p-4 text-red-400 font-bold">-${expense.amount}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-400 hover:text-red-300 font-medium text-xs"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">Add Operational Expense</h2>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Category</label>
                  <select
                    value={newExpense.category}
                    onChange={e => setNewExpense({ ...newExpense, category: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Rent">Rent</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Gas">Gas</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Supplies">Supplies</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Description</label>
                  <input
                    type="text"
                    required
                    value={newExpense.title}
                    onChange={e => setNewExpense({ ...newExpense, title: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Monthly gas refill"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Amount ($)</label>
                    <input
                      type="number"
                      required
                      value={newExpense.amount}
                      onChange={e => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={newExpense.date}
                      onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
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
                    Save Expense
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