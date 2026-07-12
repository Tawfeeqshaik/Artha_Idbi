/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FinancialGoal, AppLanguage } from "../types";
import { Goal, Plus, Sparkles, TrendingUp, HelpCircle, Loader2, Calendar, Target, CheckCircle2, Trash2 } from "lucide-react";
import { I18N_TRANSLATIONS } from "../data";

interface GoalPlannerPanelProps {
  goals: FinancialGoal[];
  language: AppLanguage;
  onAddGoal: (goal: FinancialGoal) => void;
  onDeleteGoal?: (id: string) => void;
  onExplainSuggestion: (recommendation: string, context: string) => void;
}

export default function GoalPlannerPanel({
  goals = [],
  language,
  onAddGoal,
  onDeleteGoal,
  onExplainSuggestion,
}: GoalPlannerPanelProps) {
  const t = I18N_TRANSLATIONS[language];
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [goalName, setGoalName] = useState("");
  const [category, setCategory] = useState<"House" | "Car" | "Education" | "Retirement" | "Wedding" | "Travel" | "Other">("Travel");
  const [targetAmount, setTargetAmount] = useState<number>(500000);
  const [accumulated, setAccumulated] = useState<number>(50000);
  const [targetDate, setTargetDate] = useState("2028-12-31");
  const [monthlySip, setMonthlySip] = useState<number>(8000);
  const [expectedReturn, setExpectedReturn] = useState<number>(12);

  // Form evaluation result from AI
  const [aiEvaluation, setAiEvaluation] = useState<{
    sipRequiredByAi: number;
    successProbability: number;
    aiRecommendation: string;
  } | null>(null);

  const handleAiOptimize = async () => {
    if (!goalName.trim()) return;
    setLoading(true);
    setAiEvaluation(null);

    const newGoalDraft = {
      name: goalName,
      category,
      targetAmount,
      accumulatedAmount: accumulated,
      targetDate,
      monthlySip,
      expectedReturn,
    };

    try {
      const response = await fetch("/api/advisor/calculate-goal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: newGoalDraft,
          userData: {
            age: 31,
            city: "Mumbai",
            occupation: "Senior Software Engineer",
            monthlyIncome: 150000,
            riskCategory: "Balanced",
          },
        }),
      });

      if (!response.ok) throw new Error("Calculation failed");
      const data = await response.json();
      setAiEvaluation(data);
    } catch (err) {
      console.error("AI Goal calculation error:", err);
      // Compounding compounding estimate fallback
      const years = (new Date(targetDate).getTime() - Date.now()) / (365 * 24 * 3600 * 1000);
      const gap = targetAmount - accumulated;
      const calcRequired = Math.round(gap / (Math.max(1, years) * 12 * 1.15));
      setAiEvaluation({
        sipRequiredByAi: calcRequired > 0 ? calcRequired : Math.round(targetAmount / 120),
        successProbability: monthlySip >= (calcRequired * 0.9) ? 88 : 42,
        aiRecommendation: `To accumulate your target ₹${(targetAmount / 100000).toFixed(1)} Lakhs by ${new Date(targetDate).toLocaleDateString()}, our compounding formulas require an optimized monthly SIP of ₹${calcRequired.toLocaleString("en-IN")}. Your current SIP of ₹${monthlySip.toLocaleString("en-IN")} leaves an estimated gap.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = () => {
    if (!goalName.trim() || !aiEvaluation) return;

    const finalGoal: FinancialGoal = {
      id: `g-${Date.now()}`,
      name: goalName,
      category,
      targetAmount,
      accumulatedAmount: accumulated,
      targetDate,
      monthlySip,
      expectedReturn,
      sipRequiredByAi: aiEvaluation.sipRequiredByAi,
      successProbability: aiEvaluation.successProbability,
      aiRecommendation: aiEvaluation.aiRecommendation,
    };

    onAddGoal(finalGoal);
    
    // Reset Form
    setGoalName("");
    setCategory("Travel");
    setTargetAmount(500000);
    setAccumulated(50000);
    setTargetDate("2028-12-31");
    setMonthlySip(8000);
    setExpectedReturn(12);
    setAiEvaluation(null);
    setShowAddForm(false);
  };

  // Helper to get probability color
  const getProbColor = (p: number) => {
    if (p >= 80) return "text-emerald-400 bg-emerald-500/10";
    if (p >= 60) return "text-idbi-green bg-idbi-green/10";
    if (p >= 40) return "text-amber-400 bg-amber-500/10";
    return "text-rose-400 bg-rose-500/10";
  };

  const getProbBarColor = (p: number) => {
    if (p >= 80) return "bg-emerald-400";
    if (p >= 60) return "bg-idbi-green";
    if (p >= 40) return "bg-amber-400";
    return "bg-rose-400";
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white font-sans flex items-center gap-2">
            <Goal className="w-5 h-5 text-idbi-orange" />
            {t.goals}
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Track compounding progress & run AI simulations
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setAiEvaluation(null);
          }}
          className="rounded-xl bg-idbi-orange hover:bg-idbi-orange/90 text-white px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          id="btn-add-goal"
        >
          <Plus className="w-4 h-4" />
          {t.addGoal}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showAddForm ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-xl border border-slate-800 bg-slate-950/30 p-5 space-y-5 overflow-hidden"
          >
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-idbi-orange" /> New Goal Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Goal name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{t.goalName}</label>
                <input
                  type="text"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="e.g., European Summer Trip"
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-idbi-orange/50"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Goal Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-idbi-orange/50"
                >
                  <option value="Travel">Travel / Vacation</option>
                  <option value="House">Real Estate / Home</option>
                  <option value="Car">Automobile / EV Car</option>
                  <option value="Education">Education</option>
                  <option value="Retirement">Retirement corpus</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Other">Other / General Wealth</option>
                </select>
              </div>

              {/* Target amount */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{t.targetAmount} (₹)</label>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(Number(e.target.value))}
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-idbi-orange/50"
                />
              </div>

              {/* Accumulated already */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Already Saved (₹)</label>
                <input
                  type="number"
                  value={accumulated}
                  onChange={(e) => setAccumulated(Number(e.target.value))}
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-idbi-orange/50"
                />
              </div>

              {/* Target date */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{t.targetDate}</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-idbi-orange/50"
                />
              </div>

              {/* Current SIP */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{t.currentSip}</label>
                <input
                  type="number"
                  value={monthlySip}
                  onChange={(e) => setMonthlySip(Number(e.target.value))}
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-idbi-orange/50"
                />
              </div>
            </div>

            {/* AI Calculation Zone */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleAiOptimize}
                disabled={loading || !goalName}
                className="flex-1 rounded-xl bg-gradient-to-r from-idbi-orange to-idbi-green hover:opacity-90 py-3 text-xs font-semibold text-white transition flex items-center justify-center gap-1.5 shadow-md shadow-idbi-orange/10 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI Compounding Calculations...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    {t.calculateWithAi}
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setAiEvaluation(null);
                }}
                className="rounded-xl border border-slate-800 px-4 py-3 text-xs text-slate-400 hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {/* AI Results Output */}
            {aiEvaluation && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 border border-idbi-orange/15 bg-idbi-orange/5 rounded-xl p-4.5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-idbi-orange">
                    <Sparkles className="w-4 h-4 animate-pulse" />
                    Artha AI Financial Evaluation
                  </div>
                  <div className={`rounded-full px-2.5 py-1 text-[10px] font-bold font-mono ${getProbColor(aiEvaluation.successProbability)}`}>
                    Success Probability: {aiEvaluation.successProbability}%
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5 border-y border-slate-800/60 py-3">
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">YOUR MONTHLY SIP</span>
                    <span className="text-sm font-bold text-slate-300">₹{monthlySip.toLocaleString("en-IN")}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-idbi-orange uppercase tracking-wider block">RECOMMENDED MONTHLY SIP</span>
                    <span className="text-sm font-extrabold text-white">₹{aiEvaluation.sipRequiredByAi.toLocaleString("en-IN")} / mo</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic">
                  "{aiEvaluation.aiRecommendation}"
                </p>

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => onExplainSuggestion(aiEvaluation.aiRecommendation, `${goalName} Planning`)}
                    className="rounded-lg border border-slate-800 hover:bg-slate-800/40 px-3 py-2 text-[10px] text-slate-400 transition flex items-center gap-1"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-idbi-orange" />
                    {t.explainThis}
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveGoal}
                    className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-4.5 py-2 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Save & Activate Goal
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal) => {
          const progressPercent = Math.min(100, Math.round((goal.accumulatedAmount / goal.targetAmount) * 100));
          return (
            <div
              key={goal.id}
              className="rounded-xl border border-slate-800 bg-slate-950/20 p-5 space-y-4 hover:border-slate-700/80 transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-idbi-orange/10 p-2.5 text-idbi-orange">
                    <Target className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm font-sans">{goal.name}</h4>
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Target: {new Date(goal.targetDate).toLocaleDateString("en-IN", { year: 'numeric', month: 'long' })}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {goal.successProbability && (
                    <div className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold font-mono ${getProbColor(goal.successProbability)}`}>
                      Success Probability: {goal.successProbability}%
                    </div>
                  )}
                  {onDeleteGoal && (
                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition cursor-pointer"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Accumulated: ₹{goal.accumulatedAmount.toLocaleString("en-IN")}</span>
                  <span>Target: ₹{goal.targetAmount.toLocaleString("en-IN")} ({progressPercent}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-idbi-orange to-idbi-green rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* AI Recommendations attached */}
              {goal.aiRecommendation && (
                <div className="rounded-lg bg-idbi-orange/5 border border-idbi-orange/10 p-3.5 space-y-2.5">
                  <p className="text-[11px] text-slate-300 leading-relaxed italic flex items-start gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                    <span>"{goal.aiRecommendation}"</span>
                  </p>
                  <div className="flex justify-end gap-2 border-t border-slate-800/50 pt-2">
                    <button
                      onClick={() => onExplainSuggestion(goal.aiRecommendation!, `${goal.name} Strategy`)}
                      className="text-[10px] text-idbi-orange hover:text-idbi-orange/80 font-mono flex items-center gap-1 transition"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      {t.explainThis}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
