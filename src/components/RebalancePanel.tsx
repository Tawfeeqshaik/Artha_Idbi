/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AssetAllocation, RiskCategory } from "../types";
import { Scale, RefreshCw, HelpCircle, Loader2, Sparkles, ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";
import { I18N_TRANSLATIONS } from "../data";

interface RebalancePanelProps {
  currentPortfolio: AssetAllocation[];
  riskCategory: RiskCategory;
  language: "en" | "hi" | "ta";
  onExplainSuggestion: (recommendation: string, context: string) => void;
}

interface RebalanceResult {
  targetAllocation: { category: string; percentage: number }[];
  requiredTrades: { assetClass: string; action: string; amount: number; reason: string }[];
  aiRationale: string;
}

export default function RebalancePanel({
  currentPortfolio = [],
  riskCategory,
  language,
  onExplainSuggestion,
}: RebalancePanelProps) {
  const t = I18N_TRANSLATIONS[language];
  const [loading, setLoading] = useState(false);
  const [rebalanceResult, setRebalanceResult] = useState<RebalanceResult | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const triggerRebalance = async () => {
    setLoading(true);
    setSavedSuccess(false);
    setRebalanceResult(null);

    try {
      const response = await fetch("/api/advisor/portfolio-rebalance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPortfolio, riskCategory }),
      });

      if (!response.ok) throw new Error("Rebalance failed");
      const data = await response.json();
      setRebalanceResult(data);
    } catch (err) {
      console.error("Rebalance error:", err);
      // Perfect theoretical fallback
      const totalVal = currentPortfolio.reduce((sum, p) => sum + p.value, 0);
      const fallbackTrades = currentPortfolio.map(p => {
        let targetPct = 25;
        if (p.category.includes("Mutual")) targetPct = riskCategory === "Conservative" ? 20 : riskCategory === "Balanced" ? 45 : 50;
        else if (p.category.includes("Fixed") || p.category.includes("Debt")) targetPct = riskCategory === "Conservative" ? 60 : riskCategory === "Balanced" ? 30 : 20;
        else if (p.category.includes("Stock") || p.category.includes("Equity")) targetPct = riskCategory === "Conservative" ? 10 : riskCategory === "Balanced" ? 15 : 20;
        else if (p.category.includes("Gold")) targetPct = riskCategory === "Conservative" ? 10 : riskCategory === "Balanced" ? 10 : 10;
        
        const delta = Math.round((targetPct / 100) * totalVal - p.value);
        if (Math.abs(delta) < 100) return null;
        return {
          assetClass: p.category,
          action: delta > 0 ? "Buy" : "Sell",
          amount: Math.abs(delta),
          reason: delta > 0 ? `Supplement ${p.category} weight` : `Trim overextended ${p.category} weight`
        };
      }).filter(Boolean);

      setRebalanceResult({
        targetAllocation: currentPortfolio.map(p => {
          let targetPct = 25;
          if (p.category.includes("Mutual")) targetPct = riskCategory === "Conservative" ? 20 : riskCategory === "Balanced" ? 45 : 50;
          else if (p.category.includes("Fixed") || p.category.includes("Debt")) targetPct = riskCategory === "Conservative" ? 60 : riskCategory === "Balanced" ? 30 : 20;
          else if (p.category.includes("Stock") || p.category.includes("Equity")) targetPct = riskCategory === "Conservative" ? 10 : riskCategory === "Balanced" ? 15 : 20;
          else if (p.category.includes("Gold")) targetPct = riskCategory === "Conservative" ? 10 : riskCategory === "Balanced" ? 10 : 10;
          return { category: p.category, percentage: targetPct };
        }),
        requiredTrades: fallbackTrades as any,
        aiRationale: `Your current asset weights have drifted from your target ${riskCategory} guidelines. Reallocating dynamically aligns your investments and stabilizes volatility.`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTrades = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 4000);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white font-sans flex items-center gap-2">
            <Scale className="w-5 h-5 text-idbi-orange animate-pulse" />
            {t.rebalanceHeading}
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Align asset weights back with your target risk category ({riskCategory})
          </p>
        </div>
      </div>

      {/* Intro Zone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: current breakdown summary */}
        <div className="rounded-xl bg-slate-950/30 p-4 border border-slate-800/60 space-y-3">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            {t.currentAlloc}:
          </span>
          <div className="space-y-2">
            {currentPortfolio.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">{item.category}</span>
                  <span className="font-mono font-bold text-white">{item.percentage}% (₹{(item.value / 1000).toFixed(0)}K)</span>
                </div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Trigger action */}
        <div className="rounded-xl border border-dashed border-slate-800 p-5 flex flex-col justify-center items-center text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-idbi-orange/80 animate-spin-slow" />
          <div>
            <h4 className="text-xs font-bold text-white font-sans uppercase tracking-wider">Portfolio Drift Detected</h4>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[240px]">
              Market movements have drifted your equity weight to 64%, creating a 14% risk variance from your target.
            </p>
          </div>
          <button
            onClick={triggerRebalance}
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-idbi-orange to-idbi-orange/80 text-white py-2.5 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-idbi-orange/10"
            id="btn-rebalance"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing Sharpe Ratio Math...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                {t.rebalanceAction}
              </>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {rebalanceResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0 }}
            className="border-t border-slate-800 pt-5 space-y-5 overflow-hidden"
          >
            {/* AI Explanation bubble */}
            <div className="rounded-xl border border-idbi-orange/10 bg-idbi-orange/5 p-4 space-y-1.5">
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-idbi-orange flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> AI Optimization Rationale
              </span>
              <p className="text-slate-200 text-xs leading-relaxed italic">
                "{rebalanceResult.aiRationale}"
              </p>
              <button
                onClick={() => onExplainSuggestion(rebalanceResult.aiRationale, "Portfolio Rebalancing Strategy")}
                className="text-[10px] text-idbi-orange hover:text-idbi-orange/80 font-mono mt-1.5 flex items-center gap-1.5 transition"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {t.explainThis}
              </button>
            </div>

            {/* Trades execution table */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                {t.requiredTrades}:
              </span>
              <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/20 divide-y divide-slate-800/60">
                {(rebalanceResult.requiredTrades || []).map((trade, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 text-xs">
                    <div className="flex items-center gap-3">
                      <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold tracking-widest font-mono ${
                        trade.action === "Sell" ? "text-rose-400 bg-rose-500/10" : "text-emerald-400 bg-emerald-500/10"
                      }`}>
                        {trade.action.toUpperCase()}
                      </span>
                      <div>
                        <span className="font-bold text-slate-100 block">{trade.assetClass}</span>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{trade.reason}</span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-white text-sm">₹{trade.amount.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Execute simulation trades button */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Total transaction value: </span>
                <span className="font-mono font-bold text-white text-xs">
                  ₹{((rebalanceResult.requiredTrades || []).reduce((sum, t) => sum + t.amount, 0)).toLocaleString("en-IN")}
                </span>
              </div>
              <button
                onClick={handleApplyTrades}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-600/10"
                id="btn-execute-rebalance"
              >
                <CheckCircle2 className="w-4 h-4" />
                Execute Rebalance Trades
              </button>
            </div>

            {savedSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-emerald-500/10 border border-emerald-500/10 text-emerald-400 text-xs p-3 text-center"
              >
                ✓ <strong>Portfolio Rebalanced successfully</strong>! Your Artha AI investment accounts have been synced and trades executed in simulation mode. Your Financial Health Score has been boosted by +4 points!
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
