"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

interface LedgerItem {
  id: string;
  property_id?: string;
  property_name?: string;
  type: string; // 'Income' or 'Expense'
  category: string;
  amount: number;
  transaction_date?: string;
  date?: string;
  description?: string;
  is_scheduled?: boolean;
  owner_id?: string;
}

export default function FinancialsPortalPage() {
  const [ledger, setLedger] = useState<LedgerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllTime, setShowAllTime] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState("");

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScheduledModal, setShowScheduledModal] = useState(false);
  const [showIncomeStatement, setShowIncomeStatement] = useState(false);

  // Form state for Manual Entry
  const [formType, setFormType] = useState("Expense");
  const [formCategory, setFormCategory] = useState("Maintenance & Repairs");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formProperty, setFormProperty] = useState("2-bedroom-apartment");
  const [formDesc, setFormDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchLedger = async () => {
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

    // 2. Fetch ONLY financial ledger entries belonging to this owner
    const { data, error } = await supabase
      .from("financial_ledger")
      .select("*")
      .eq("owner_id", user.id)
      .order("transaction_date", { ascending: false });

    if (!error && data) {
      setLedger(data);
    } else {
      const { data: altData } = await supabase
        .from("financials")
        .select("*")
        .eq("owner_id", user.id);

      if (altData) {
        setLedger(altData.map((item: any) => ({
          ...item,
          transaction_date: item.date || item.transaction_date,
          property_id: item.property_name || item.property_id
        })));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  const handleSaveEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (!formAmount || Number(formAmount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("You must be logged in to record entries.");
      return;
    }

    setSubmitting(true);

    const newRecord = {
      id: crypto.randomUUID(),
      type: formType,
      category: formCategory,
      amount: parseFloat(formAmount),
      transaction_date: formDate,
      property_id: formProperty,
      description: formDesc || `${formType} - ${formCategory}`,
      owner_id: user.id, // Ties entry to logged-in owner
    };

    const { error } = await supabase.from("financial_ledger").insert([newRecord]);
    if (error) {
      // Fallback insert to financials table if needed
      await supabase.from("financials").insert([{
        id: newRecord.id,
        type: newRecord.type,
        category: newRecord.category,
        amount: newRecord.amount,
        date: newRecord.transaction_date,
        property_name: newRecord.property_id,
        description: newRecord.description,
        owner_id: user.id,
      }]);
    }

    setSubmitting(false);
    setShowAddModal(false);
    setFormAmount("");
    setFormDesc("");
    fetchLedger();
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this ledger entry?")) return;
    if (!supabase) return;

    await supabase.from("financial_ledger").delete().eq("id", id);
    await supabase.from("financials").delete().eq("id", id);
    fetchLedger();
  };

  // Filtered Data
  const filteredLedger = ledger.filter((item) => {
    const itemDate = item.transaction_date || item.date || "";
    if (!showAllTime && selectedMonth) {
      return itemDate.startsWith(selectedMonth);
    }
    return true;
  });

  const incomeItems = filteredLedger.filter(i => i.type?.toLowerCase() === "income");
  const expenseItems = filteredLedger.filter(i => i.type?.toLowerCase() === "expense");

  const confirmedIncome = incomeItems.reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const totalExpenses = expenseItems.reduce((sum, i) => sum + Number(i.amount || 0), 0);
  const netProfit = confirmedIncome - totalExpenses;
  const profitMargin = confirmedIncome > 0 ? Math.round((netProfit / confirmedIncome) * 100) : 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2 px-4 sm:px-8 text-neutral-100 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-800 pb-4 gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Financial Ledger & Profit Statement</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Track confirmed booking revenue, recurring scheduled expenses, and net profit for your portfolio.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowScheduledModal(true)}
            className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
          >
            📅 Scheduled Expenses ({expenseItems.filter(e => e.is_scheduled).length})
          </button>
          <button
            onClick={() => setShowIncomeStatement(true)}
            className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
          >
            📊 Income Statement
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer shadow-lg shadow-amber-500/10"
          >
            + Input Expense / Income
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <label className="block text-[10px] text-neutral-400 uppercase tracking-wider mb-1">Accounting Month</label>
            <div className="flex items-center gap-2">
              <input
                type="month"
                disabled={showAllTime}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-200 disabled:opacity-40"
              />
              <button
                onClick={() => setShowAllTime(!showAllTime)}
                className={`text-xs px-3 py-2 rounded-xl border transition cursor-pointer ${
                  showAllTime
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-400 font-semibold"
                    : "bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white"
                }`}
              >
                {showAllTime ? "Showing All Time" : "Show All Time"}
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={fetchLedger}
          className="bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
        >
          🔄 Refresh Ledger
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Confirmed Bookings Income</span>
          <div className="text-2xl font-black text-emerald-400">${confirmedIncome.toLocaleString()}</div>
          <p className="text-[11px] text-neutral-400">{incomeItems.length} confirmed stay(s)</p>
        </div>

        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Total Gross Income</span>
          <div className="text-2xl font-black text-white">${confirmedIncome.toLocaleString()}</div>
          <p className="text-[11px] text-neutral-400">Bookings + extra</p>
        </div>

        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Total Expenses</span>
          <div className="text-2xl font-black text-red-400">${totalExpenses.toLocaleString()}</div>
          <p className="text-[11px] text-neutral-400">{expenseItems.length} expense item(s)</p>
        </div>

        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Net Profit</span>
          <div className="text-2xl font-black text-amber-400">${netProfit.toLocaleString()}</div>
          <p className="text-[11px] text-neutral-400">Margin: {profitMargin}%</p>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confirmed Booking Revenue Table */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">Confirmed Booking Revenue</h2>
          {loading ? (
            <div className="text-xs text-neutral-400 py-8 text-center">Loading ledger...</div>
          ) : incomeItems.length === 0 ? (
            <div className="text-xs text-neutral-500 py-8 text-center bg-neutral-950/40 rounded-xl border border-neutral-800/50">
              No confirmed bookings found for your account portfolio.
            </div>
          ) : (
            <div className="space-y-3">
              {incomeItems.map((item) => (
                <div key={item.id} className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{item.description || item.category}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      {item.property_id || item.property_name || "General"} &bull; {item.transaction_date || item.date}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-emerald-400">+${Number(item.amount).toLocaleString()}</span>
                    <button
                      onClick={() => handleDeleteEntry(item.id)}
                      className="text-neutral-500 hover:text-red-400 transition cursor-pointer"
                      title="Delete entry"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expenses & Manual Ledger */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">Expenses & Manual Ledger</h2>
          {loading ? (
            <div className="text-xs text-neutral-400 py-8 text-center">Loading ledger...</div>
          ) : expenseItems.length === 0 ? (
            <div className="text-xs text-neutral-500 py-8 text-center bg-neutral-950/40 rounded-xl border border-neutral-800/50">
              No expenses or extra entries logged for your account. Click "+ Input Expense / Income" above to add one.
            </div>
          ) : (
            <div className="space-y-3">
              {expenseItems.map((item) => (
                <div key={item.id} className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{item.description || item.category}</div>
                    <div className="text-[11px] text-neutral-400 mt-0.5">
                      {item.property_id || item.property_name || "General"} &bull; {item.transaction_date || item.date}
                      {item.is_scheduled && <span className="ml-2 text-amber-400 font-medium">⚡ Scheduled/Recurring</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-red-400">-${Number(item.amount).toLocaleString()}</span>
                    <button
                      onClick={() => handleDeleteEntry(item.id)}
                      className="text-neutral-500 hover:text-red-400 transition cursor-pointer"
                      title="Delete entry"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Input Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-sm font-bold text-white">Record Expense or Income</h2>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-400 hover:text-white cursor-pointer text-xs">✕ Close</button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Type</label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-neutral-200"
                >
                  <option value="Expense">Expense (-)</option>
                  <option value="Income">Income (+)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-neutral-200"
                >
                  <option value="Maintenance & Repairs">Maintenance & Repairs</option>
                  <option value="Utilities (Water/Electricity)">Utilities (Water/Electricity)</option>
                  <option value="Internet & Wi-Fi">Internet & Wi-Fi</option>
                  <option value="Staff Salaries & Cleaning">Staff Salaries & Cleaning</option>
                  <option value="Marketing & Advertising">Marketing & Advertising</option>
                  <option value="Property Rent / Lease">Property Rent / Lease</option>
                  <option value="Other Operating Expense">Other Operating Expense</option>
                  <option value="Additional Guest Upsell">Additional Guest Upsell</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 150"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-neutral-200"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-neutral-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Property</label>
                <select
                  value={formProperty}
                  onChange={(e) => setFormProperty(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-neutral-200"
                >
                  <option value="2-bedroom-apartment">2-bedroom fully furnished Apartment</option>
                  <option value="1-bedroom-apartment">1-bedroom Apartment Kisaasi</option>
                  <option value="Entebbe Mansion">Entebbe Mansion</option>
                  <option value="Munyonyo Villa">Munyonyo Villa</option>
                  <option value="General Portfolio">General Portfolio</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Description / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly internet subscription"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-neutral-200"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scheduled Expenses Modal */}
      {showScheduledModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-sm font-bold text-white">Scheduled & Recurring Expenses</h2>
              <button onClick={() => setShowScheduledModal(false)} className="text-neutral-400 hover:text-white cursor-pointer">✕ Close</button>
            </div>
            <p className="text-neutral-400">
              Set up recurring bills (like internet, rent, and utility subscriptions) so they post automatically to your monthly statements.
            </p>
            <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-6 text-center text-neutral-400">
              No recurring payment automation rules active yet for your account. Click <strong className="text-white">+ Input Expense / Income</strong> to record your bills.
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setShowScheduledModal(false)} className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Income Statement Modal */}
      {showIncomeStatement && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 max-w-2xl w-full space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-sm font-bold text-white">La Estancia &bull; Profit & Loss Statement</h2>
              <button onClick={() => setShowIncomeStatement(false)} className="text-neutral-400 hover:text-white cursor-pointer">✕ Close</button>
            </div>

            <div className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
              <div className="flex justify-between font-bold text-white border-b border-neutral-800 pb-2">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Total Accommodation Revenue ({incomeItems.length} bookings)</span>
                <span>+${confirmedIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-red-400">
                <span>Total Operating Expenses ({expenseItems.length} items)</span>
                <span>-${totalExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-black text-amber-400 text-sm border-t border-neutral-800 pt-2">
                <span>Net Operating Income (Profit)</span>
                <span>${netProfit.toLocaleString()} ({profitMargin}%)</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setShowIncomeStatement(false)} className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}