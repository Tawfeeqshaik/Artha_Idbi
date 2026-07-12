/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { Transaction, AppLanguage } from "../types";
import { AlertTriangle, TrendingUp, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Tag, HelpCircle, ChevronDown, ListFilter, Plus, Trash2, X, CheckCircle2 } from "lucide-react";
import { I18N_TRANSLATIONS } from "../data";

interface SpendingAnalysisPanelProps {
  transactions: Transaction[];
  language: AppLanguage;
  onExplainSuggestion: (recommendation: string, context: string) => void;
  onUpdateTransactions?: (updated: Transaction[]) => void;
  isDemoUser?: boolean;
}

export default function SpendingAnalysisPanel({
  transactions = [],
  language,
  onExplainSuggestion,
  onUpdateTransactions,
  isDemoUser = false,
}: SpendingAnalysisPanelProps) {
  const t = I18N_TRANSLATIONS[language];
  const [filter, setFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<"list" | "charts">("list");

  // State for Add Transaction Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [txDesc, setTxDesc] = useState("");
  const [txAmount, setTxAmount] = useState<string>("");
  const [txCategory, setTxCategory] = useState("Food");
  const [txType, setTxType] = useState<"credit" | "debit">("debit");
  const [txMerchant, setTxMerchant] = useState("");

  const handleAddTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(txAmount);
    if (!txDesc || isNaN(amountVal) || amountVal <= 0) return;

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString(),
      description: txDesc,
      amount: amountVal,
      category: txCategory,
      type: txType,
      merchant: txMerchant || undefined,
    };

    const updated = [newTx, ...transactions];
    if (onUpdateTransactions) {
      onUpdateTransactions(updated);
    }

    // Reset fields
    setTxDesc("");
    setTxAmount("");
    setTxMerchant("");
    setShowAddForm(false);
  };

  const handleDeleteTx = (id: string) => {
    const updated = transactions.filter((tx) => tx.id !== id);
    if (onUpdateTransactions) {
      onUpdateTransactions(updated);
    }
  };

  // Filter logic
  const filteredTx = transactions.filter((tx) => {
    if (filter === "all") return true;
    if (filter === "anomalies") return tx.anomaly === true;
    return tx.category === filter;
  });

  // Calculate stats
  const totalDebited = transactions
    .filter((tx) => tx.type === "debit")
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Group by category for donut chart
  const categoryTotals: Record<string, number> = {};
  transactions
    .filter((tx) => tx.type === "debit")
    .forEach((tx) => {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
    });

  const categoriesColors: Record<string, string> = {
    Food: "#F59E0B", // Amber
    Fuel: "#3B82F6", // Blue
    Shopping: "#EC4899", // Pink
    Bills: "#10B981", // Green
    "Rent/EMI": "#EF4444", // Red
    Entertainment: "#8B5CF6", // Purple
    Healthcare: "#14B8A6", // Teal
    Travel: "#6366F1", // Indigo
    Investments: "#06B6D4", // Cyan
  };

  const donutSegments = Object.keys(categoryTotals).map((cat) => ({
    category: cat,
    amount: categoryTotals[cat],
    percentage: Math.round((categoryTotals[cat] / totalDebited) * 100),
    color: categoriesColors[cat] || "#64748B",
  })).sort((a, b) => b.amount - a.amount);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white font-sans flex items-center gap-2">
            <Wallet className="w-5 h-5 text-idbi-orange" />
            {t.spending}
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Full audit of categorized transactions & anomaly detectors
          </p>
        </div>
        {/* Toggle between list and analytics */}
        <div className="rounded-xl bg-slate-950/40 p-1 flex gap-1 border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab("list")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
              activeTab === "list" ? "bg-idbi-orange text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Ledger list
          </button>
          <button
            onClick={() => setActiveTab("charts")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
              activeTab === "charts" ? "bg-idbi-orange text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            Analytics Vis
          </button>
        </div>
      </div>

      {/* Dynamic spending anomaly alert banner */}
      {(() => {
        const debits = transactions.filter((tx) => tx.type === "debit");
        const avgDebitAmount = debits.length > 0 ? totalDebited / debits.length : 0;
        const dynamicAnomalies = debits.filter(
          (tx) => tx.anomaly === true || tx.amount > Math.max(avgDebitAmount * 1.8, 1500)
        );

        if (dynamicAnomalies.length > 0) {
          return (
            <div className="rounded-xl border border-amber-500/15 bg-amber-500/5 p-4 flex items-start gap-3">
              <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400 shrink-0 mt-0.5">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider font-mono">
                  {t.anomalyAlert} ({dynamicAnomalies.length} Flagged Surges)
                </h4>
                <p className="text-slate-200 text-xs leading-relaxed">
                  We detected elevated transaction spikes compared to your average outlays. Major surges:{" "}
                  {dynamicAnomalies.slice(0, 2).map((tx, idx) => (
                    <span key={tx.id}>
                      {idx > 0 ? " & " : ""}
                      <strong className="text-white">₹{tx.amount.toLocaleString("en-IN")} for {tx.description}</strong>
                    </span>
                  ))}
                  .
                </p>
                <button
                  onClick={() =>
                    onExplainSuggestion(
                      `We flagged ${dynamicAnomalies.length} transaction(s) exceeding ordinary parameters: ${dynamicAnomalies.map(t => `${t.description} (₹${t.amount.toLocaleString("en-IN")})`).join(", ")}. It is recommended to restrict discretionary spending to maintain optimal savings margins.`,
                      "Spending Anomaly Analysis"
                    )
                  }
                  className="inline-flex items-center gap-1 text-[10px] text-amber-400 hover:text-amber-300 font-mono transition mt-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  {t.explainThis}
                </button>
              </div>
            </div>
          );
        } else {
          return (
            <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-4 flex items-start gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h4 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider font-mono">
                  Outflow Balance Verified
                </h4>
                <p className="text-slate-200 text-xs leading-relaxed font-mono text-[11px]">
                  Excellent! Your manual spending logs are perfectly steady. No unusual transaction surges or billing anomalies were detected across your active ledger.
                </p>
              </div>
            </div>
          );
        }
      })()}

      {activeTab === "list" ? (
        <div className="space-y-4">
          {/* Transaction Action Bar & Form */}
          <div className="flex justify-between items-center bg-slate-950/20 px-4 py-2.5 rounded-xl border border-slate-800/50">
            <span className="text-[11px] font-mono text-slate-400 font-semibold uppercase tracking-wider">Ledger Management</span>
            <div className="flex items-center gap-2">
              {transactions.length > 0 && (
                <button
                  onClick={() => {
                    if (onUpdateTransactions) {
                      onUpdateTransactions([]);
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-rose-500/20"
                  title="Wipe seeded ledger to start manual entries"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
              )}
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1.5 rounded-lg bg-idbi-orange/10 hover:bg-idbi-orange/20 text-idbi-orange text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-idbi-orange/20"
              >
                {showAddForm ? (
                  <>
                    <X className="w-3.5 h-3.5" /> Close Form
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" /> Record Transaction
                  </>
                )}
              </button>
            </div>
          </div>

          {showAddForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddTxSubmit}
              className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-4 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase">Description</label>
                  <input
                    type="text"
                    required
                    value={txDesc}
                    onChange={(e) => setTxDesc(e.target.value)}
                    placeholder="Swiggy, DMart, Salary..."
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs outline-none text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    placeholder="500"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs font-mono outline-none text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase">Category</label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs outline-none text-slate-300"
                  >
                    {["Food", "Fuel", "Shopping", "Bills", "Rent/EMI", "Entertainment", "Healthcare", "Travel", "Investments"].map((cat) => (
                      <option key={cat} value={cat} className="bg-slate-950">{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase">Type</label>
                  <div className="grid grid-cols-2 gap-1 bg-slate-950 border border-slate-800 rounded p-0.5">
                    <button
                      type="button"
                      onClick={() => setTxType("debit")}
                      className={`py-1 text-[10px] font-bold rounded transition ${txType === "debit" ? "bg-rose-500/20 text-rose-300" : "text-slate-500"}`}
                    >
                      Debit (Spend)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTxType("credit")}
                      className={`py-1 text-[10px] font-bold rounded transition ${txType === "credit" ? "bg-emerald-500/20 text-emerald-300" : "text-slate-500"}`}
                    >
                      Credit (Earn)
                    </button>
                  </div>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-mono text-slate-500 uppercase">Merchant / Subtext</label>
                  <input
                    type="text"
                    value={txMerchant}
                    onChange={(e) => setTxMerchant(e.target.value)}
                    placeholder="HDFC Bank, GPay..."
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs outline-none text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-idbi-orange hover:bg-idbi-orange/90 text-white text-xs font-bold cursor-pointer transition shadow-lg shadow-idbi-orange/10"
                >
                  Confirm & Save
                </button>
              </div>
            </motion.form>
          )}

          {/* Filters controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/20 px-4 py-3 rounded-xl border border-slate-800/60">
            <div className="flex items-center gap-2">
              <ListFilter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Filter categories:
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {["all", "anomalies", "Food", "Shopping", "Bills", "Rent/EMI", "Investments"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`rounded-lg px-3 py-1 text-[10px] font-semibold font-mono border transition cursor-pointer ${
                    filter === cat
                      ? "bg-idbi-orange border-idbi-orange text-white"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  {cat === "all" ? "All ledger" : cat === "anomalies" ? "⚠️ Anomalies" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Ledger body */}
          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {filteredTx.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
                <p className="text-xs text-slate-500 font-mono">No transaction records found in this category.</p>
                <p className="text-[10px] text-slate-600 mt-1">Click "Record Transaction" above to log a new ledger entry.</p>
              </div>
            ) : (
              filteredTx.map((tx) => (
                <div
                  key={tx.id}
                  className={`rounded-xl border p-4 flex flex-col gap-2.5 transition-all ${
                    tx.anomaly
                      ? "border-amber-500/25 bg-amber-500/5 hover:bg-amber-500/10"
                      : "border-slate-800/80 bg-slate-950/15 hover:border-slate-700 hover:bg-slate-800/10"
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`rounded-xl p-2 shrink-0 ${
                        tx.type === "credit" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800/60 text-slate-300"
                      }`}>
                        {tx.type === "credit" ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-slate-100 font-sans truncate">{tx.description}</h4>
                        <span className="text-[9px] text-slate-500 font-mono block mt-0.5">
                          {new Date(tx.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })} • {tx.merchant || "Direct Transfer"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className={`font-mono font-bold text-xs block ${tx.type === "credit" ? "text-emerald-400" : "text-white"}`}>
                          {tx.type === "credit" ? "+" : "-"} ₹{tx.amount.toLocaleString("en-IN")}
                        </span>
                        <span
                          className="text-[9px] font-semibold px-2 py-0.5 rounded-full border block mt-1 text-center"
                          style={{
                            borderColor: `${categoriesColors[tx.category]}20`,
                            color: categoriesColors[tx.category],
                            backgroundColor: `${categoriesColors[tx.category]}08`,
                          }}
                        >
                          {tx.category}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteTx(tx.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                        title="Delete Transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Anomaly expanded details */}
                  {tx.anomaly && tx.anomalyReason && (
                    <div className="rounded-lg bg-slate-950/40 p-2.5 border border-amber-500/10 text-[10px] text-slate-300 flex items-start gap-1.5 italic">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Advisor Note:</strong> {tx.anomalyReason}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          {/* Custom SVG Donut allocation */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Expenditure share by category:
            </span>

            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* Simple custom Donut Chart */}
              <svg className="transform -rotate-90" width="160" height="160">
                {/* Fallback track */}
                <circle cx="80" cy="80" r="60" className="stroke-slate-800" strokeWidth="16" fill="transparent" />
                {/* Dynamically layered segments based on percentages */}
                {(() => {
                  let accumulatedPercent = 0;
                  const radius = 60;
                  const circ = radius * 2 * Math.PI;

                  return donutSegments.map((segment, index) => {
                    const strokeOffset = circ - (segment.percentage / 100) * circ;
                    const rotateVal = (accumulatedPercent / 100) * 360;
                    accumulatedPercent += segment.percentage;

                    return (
                      <circle
                        key={index}
                        cx="80"
                        cy="80"
                        r={radius}
                        className="transition-all duration-500 hover:stroke-[18px]"
                        stroke={segment.color}
                        strokeWidth="14"
                        fill="transparent"
                        strokeDasharray={circ}
                        strokeDashoffset={strokeOffset}
                        transform={`rotate(${rotateVal} 80 80)`}
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute flex flex-col items-center text-center">
                <span className="text-xl font-bold text-white font-sans">
                  ₹{(totalDebited / 1000).toFixed(0)}K
                </span>
                <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest mt-0.5">
                  Debits Total
                </span>
              </div>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Legend:</span>
            <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto">
              {donutSegments.map((segment, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg bg-slate-950/20 border border-slate-800/40 p-2 text-[10px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: segment.color }} />
                    <span className="text-slate-300 truncate">{segment.category}</span>
                  </div>
                  <span className="font-mono text-white font-bold">{segment.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
