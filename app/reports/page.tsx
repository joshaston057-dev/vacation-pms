'use client';

import { useState } from 'react';

interface RevenueItem {
  id: string;
  propertyName: string;
  guestName: string;
  amountUSD: number;
  date: string;
  type: 'Booking' | 'Upsell';
}

interface ExpenseItem {
  id: string;
  propertyName: string;
  category: 'Cleaning' | 'Maintenance' | 'Utilities & Gas' | 'Staff / Rota' | 'Other';
  description: string;
  amountUGX: number;
  amountUSD: number;
  date: string;
}

export default function FinancialsPage() {
  // Sample Revenue Data
  const [revenues] = useState<RevenueItem[]>([
    { id: '1', propertyName: 'Kololo Serviced Apartment', guestName: 'Sarah Jenkins', amountUSD: 450, date: '2026-10-15', type: 'Booking' },
    { id: '2', propertyName: 'Naguru Heights Villa', guestName: 'David Ochieng', amountUSD: 800, date: '2026-10-18', type: 'Booking' },
    { id: '3', propertyName: 'Kololo Serviced Apartment', guestName: 'Sarah Jenkins', amountUSD: 40, date: '2026-10-16', type: 'Upsell' },
  ]);

  // Operational Expenses State
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { id: '1', propertyName: 'Naguru Heights Villa', category: 'Utilities & Gas', description: '13kg Cooking Gas Refill', amountUGX: 120000, amountUSD: 32, date: '2026-10-19' },
    { id: '2', propertyName: 'Kololo Serviced Apartment', category: 'Cleaning', description: 'Deep turnaround clean & laundry', amountUGX: 60000, amountUSD: 16, date: '2026-10-17' },
  ]);

  // Form State for Adding New Expense
  const [propertyName, setPropertyName] = useState('Kololo Serviced Apartment');
  const [category, setCategory] = useState<ExpenseItem['category']>('Cleaning');
  const [description, setDescription] = useState('');
  const [amountUGX, setAmountUGX] = useState('');
  const [expenseDate, setExpenseDate] = useState('');

  const exchangeRate = 3750; // 1 USD = 3,750 UGX

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amountUGX) return;

    const ugx = parseFloat(amountUGX) || 0;
    const usd = Math.round(ugx / exchangeRate);

    const newExpense: ExpenseItem = {
      id: Date.now().toString(),
      propertyName,
      category,
      description,
      amountUGX: ugx,
      amountUSD: usd,
      date: expenseDate || new Date().toISOString().split('T')[0],
    };

    setExpenses([newExpense, ...expenses]);
    setDescription('');
    setAmountUGX('');
    setExpenseDate('');
  };

  // Calculations
  const totalRevenueUSD = revenues.reduce((acc, r) => acc + r.amountUSD, 0);
  const totalExpensesUSD = expenses.reduce((acc, e) => acc + e.amountUSD, 0);
  const totalExpensesUGX = expenses.reduce((acc, e) => acc + e.amountUGX, 0);
  const netProfitUSD = totalRevenueUSD - totalExpensesUSD;
  const netMargin = totalRevenueUSD > 0 ? Math.round((netProfitUSD / totalRevenueUSD) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <span className="text-amber-400 font-bold text-xs uppercase tracking-widest block mb-1">
            Financial Health
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Financials & Profit Performance
          </h1>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
          <p className="text-slate-400 text-xs font-semibold uppercase">Total Revenue</p>
          <p className="text-2xl font-black text-emerald-400 mt-2">${totalRevenueUSD.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500">Bookings & Upsells</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
          <p className="text-slate-400 text-xs font-semibold uppercase">Total Operational Expenses</p>
          <p className="text-2xl font-black text-rose-400 mt-2">${totalExpensesUSD.toLocaleString()}</p>
          <span className="text-[10px] text-slate-500">~{totalExpensesUGX.toLocaleString()} UGX</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
          <p className="text-slate-400 text-xs font-semibold uppercase">Net Profit</p>
          <p className={`text-2xl font-black mt-2 ${netProfitUSD >= 0 ? 'text-amber-400' : 'text-rose-500'}`}>
            ${netProfitUSD.toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-500">Revenue minus Expenses</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md">
          <p className="text-slate-400 text-xs font-semibold uppercase">Profit Margin</p>
          <p className="text-2xl font-black text-blue-400 mt-2">{netMargin}%</p>
          <span className="text-[10px] text-slate-500">Net Efficiency Rate</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Log Expense Form */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md h-fit space-y-6">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
            💸 Log Operational Expense
          </h2>

          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Property</label>
              <select
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Kololo Serviced Apartment">Kololo Serviced Apartment</option>
                <option value="Naguru Heights Villa">Naguru Heights Villa</option>
                <option value="Bugolobi Modern Suite">Bugolobi Modern Suite</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Expense Category</label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Cleaning">Cleaning & Turnaround</option>
                <option value="Utilities & Gas">Utilities & Gas Refills</option>
                <option value="Maintenance">Maintenance & Repairs</option>
                <option value="Staff / Rota">Staff Allowance</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <input
                type="text"
                required
                placeholder="e.g. Refill 13kg cooking gas cylinder"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Amount (UGX)</label>
                <input
                  type="number"
                  required
                  placeholder="120000"
                  value={amountUGX}
                  onChange={(e) => setAmountUGX(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition transform active:scale-95 cursor-pointer"
            >
              Record Expense
            </button>
          </form>
        </div>

        {/* Expense Log Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-md">
            <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-4 mb-4 flex items-center justify-between">
              <span>📋 Operational Expenses Ledger</span>
              <span className="text-xs text-slate-400 font-normal">Auto-converted to USD at {exchangeRate.toLocaleString()} UGX/$</span>
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                    <th className="py-3 px-2">Property</th>
                    <th className="py-3 px-2">Category</th>
                    <th className="py-3 px-2">Description</th>
                    <th className="py-3 px-2 text-right">UGX</th>
                    <th className="py-3 px-2 text-right">USD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-2 font-medium text-white">{e.propertyName}</td>
                      <td className="py-3 px-2">
                        <span className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-amber-400 rounded-md text-[10px]">
                          {e.category}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-slate-300">{e.description}</td>
                      <td className="py-3 px-2 text-right font-medium text-slate-300">{e.amountUGX.toLocaleString()} UGX</td>
                      <td className="py-3 px-2 text-right font-bold text-rose-400">${e.amountUSD}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}