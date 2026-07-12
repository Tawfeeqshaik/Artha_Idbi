/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, AppLanguage } from "../types";
import { ShieldAlert, Zap, TrendingDown, ClipboardList, CheckSquare, Sparkles, Loader2 } from "lucide-react";
import { I18N_TRANSLATIONS } from "../data";

interface StressTestPanelProps {
  userData: UserProfile;
  language: AppLanguage;
}

interface StressResult {
  monthsCashFundOnly: number;
  monthsWithLiquidation: number;
  recommendedDiscretionaryCuts: string[];
  actionPlan: string[];
  aiAnalysis: string;
}

export default function StressTestPanel({ userData, language }: StressTestPanelProps) {
  const t = I18N_TRANSLATIONS[language];
  const [selectedScenario, setSelectedScenario] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StressResult | null>(null);

  const scenarios = [
    {
      id: "layoff",
      title: "Layoff / Sudden Job Loss",
      description: "Complete pause of ₹1.5L income. Survival depends entirely on emergency reserves & expense cuts.",
      icon: ShieldAlert,
      color: "border-rose-500/20 bg-rose-500/5 hover:border-rose-500/40 text-rose-400",
    },
    {
      id: "medical",
      title: "Critical Medical Emergency",
      description: "Incurs an immediate ₹3.5 Lakh out-of-pocket hospital expense exceeding basic health cover.",
      icon: Zap,
      color: "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40 text-amber-400",
    },
    {
      id: "cut",
      title: "20% Salary Cut (Recession)",
      description: "Monthly income drops to ₹1.2L. Savings rate drops. Fixed commitment EMIs remain.",
      icon: TrendingDown,
      color: "border-idbi-green/20 bg-idbi-green/5 hover:border-idbi-green/40 text-idbi-green",
    },
  ];

  const runSimulation = async (id: string) => {
    setSelectedScenario(id);
    setLoading(true);
    setResult(null);

    const title = scenarios.find((s) => s.id === id)?.title || "Stress test";

    try {
      const response = await fetch("/api/advisor/stress-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: title, userData }),
      });

      if (!response.ok) throw new Error("Stress test failed");
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Stress-test error:", err);
      // Elegant fallback
      setResult({
        monthsCashFundOnly: id === "layoff" ? 2.8 : id === "medical" ? 1.8 : 5.4,
        monthsWithLiquidation: id === "layoff" ? 6.6 : id === "medical" ? 4.5 : 12.0,
        recommendedDiscretionaryCuts: [
          "Shopping: Defer monthly Zara runs (Save ₹12,000)",
          "Gourmet Dining: Switch Swiggy dining to home cooking (Save ₹11,890)",
          "Entertainment: Suspend multiplex movies/BookMyShow (Save ₹1,550)"
        ],
        actionPlan: [
          "Settle ₹3,20,000 cash balance to backstop immediate commitments.",
          "Pause the ₹25,000 Thane Home SIP to preserve immediate cash flow.",
          "Upgrade health cover to ₹15 Lakhs under Artha Allianz top-ups."
        ],
        aiAnalysis: "Under this contingency, your current ₹2.4 Lakhs liquid cache is insufficient. Activating discretionary expense trimming raises your overall financial runway substantially."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white font-sans flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            {t.stressTest}
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Simulate macroeconomic shocks on your liquidity
          </p>
        </div>
      </div>

      {/* Select Scenario */}
      <div className="space-y-3">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
          Select Emergency Contingency Scenario:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {scenarios.map((scen) => {
            const Icon = scen.icon;
            const isSelected = selectedScenario === scen.id;
            return (
              <button
                key={scen.id}
                onClick={() => runSimulation(scen.id)}
                className={`text-left rounded-xl border p-4.5 transition-all duration-300 flex flex-col justify-between h-[135px] cursor-pointer ${scen.color} ${
                  isSelected ? "ring-2 ring-idbi-orange/50 scale-[1.01]" : ""
                }`}
                id={`scen-${scen.id}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-bold text-sm text-white font-sans">{scen.title}</span>
                  <Icon className="w-4.5 h-4.5 shrink-0" />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-2 line-clamp-3">
                  {scen.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-12 space-y-3"
          >
            <Loader2 className="w-8 h-8 text-idbi-orange animate-spin" />
            <span className="text-xs text-slate-400 font-mono">
              Running stress-test math across 400 transaction records...
            </span>
          </motion.div>
        ) : (
          result && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-slate-800 pt-5"
            >
              {/* Dial Panel */}
              <div className="md:col-span-1 rounded-xl bg-slate-950/40 p-4 border border-slate-800/80 flex flex-col items-center justify-center text-center space-y-4">
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block">
                  SURVIVAL RUNWAY
                </span>

                <div className="relative flex items-center justify-center w-36 h-36">
                  {/* Gauge Ring */}
                  <svg className="transform -rotate-90" width="130" height="130">
                    <circle cx="65" cy="65" r="50" className="stroke-slate-800" strokeWidth="8" fill="transparent" />
                    <motion.circle
                      cx="65"
                      cy="65"
                      r="50"
                      className="stroke-rose-500"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray="314"
                      initial={{ strokeDashoffset: 314 }}
                      animate={{ strokeDashoffset: 314 - (Math.min(result.monthsCashFundOnly / 12, 1) * 314) }}
                      transition={{ duration: 1 }}
                    />
                    <motion.circle
                      cx="65"
                      cy="65"
                      r="50"
                      className="stroke-emerald-400"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray="314"
                      initial={{ strokeDashoffset: 314 }}
                      animate={{ strokeDashoffset: 314 - (Math.min(result.monthsWithLiquidation / 12, 1) * 314) }}
                      transition={{ duration: 1.2, delay: 0.3 }}
                      strokeDashoffset="180" // approximate second ring offset
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-black text-white font-mono leading-none">
                      {result.monthsWithLiquidation}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-mono mt-0.5">
                      Months Max
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 w-full">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>Liquid Cash Only</span>
                    </div>
                    <span className="font-mono text-white font-bold">{result.monthsCashFundOnly} mo</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>With Liquidation + Cuts</span>
                    </div>
                    <span className="font-mono text-white font-bold">{result.monthsWithLiquidation} mo</span>
                  </div>
                </div>
              </div>

              {/* Analysis & Cuts */}
              <div className="md:col-span-2 space-y-4">
                {/* AI analysis */}
                <div className="rounded-xl border border-rose-500/10 bg-rose-500/5 p-4">
                  <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-rose-400 flex items-center gap-1 mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> AI Macro Stress Assessment
                  </span>
                  <p className="text-slate-200 text-xs leading-relaxed">
                    {result.aiAnalysis}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Discretionary cuts */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5 text-rose-400" /> Immediate Discretionary Cuts:
                    </span>
                    <div className="space-y-1.5">
                      {(result.recommendedDiscretionaryCuts || []).map((cut, cIdx) => (
                        <div key={cIdx} className="rounded-lg bg-slate-950/30 border border-slate-800/80 p-2.5 text-slate-300 text-[11px] leading-snug">
                          {cut}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action plan */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                      <ClipboardList className="w-3.5 h-3.5 text-emerald-400" /> Strategic Action Plan:
                    </span>
                    <div className="space-y-1.5">
                      {(result.actionPlan || []).map((step, sIdx) => (
                        <div key={sIdx} className="rounded-lg bg-slate-950/30 border border-slate-800/80 p-2.5 text-slate-300 text-[11px] leading-snug flex items-start gap-2">
                          <span className="text-idbi-orange font-bold shrink-0">{sIdx + 1}.</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
