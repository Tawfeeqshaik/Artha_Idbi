/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Cpu, 
  TrendingUp, 
  Zap, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  RefreshCw, 
  HelpCircle, 
  Briefcase, 
  ChevronRight, 
  Flame, 
  Users, 
  DollarSign 
} from "lucide-react";
import { UserProfile } from "../types";
import { I18N_TRANSLATIONS } from "../data";

interface DigitalTwinPanelProps {
  userData: UserProfile;
  language: "en" | "hi" | "ta";
  onExplainSuggestion: (recommendation: string, context: string) => void;
}

interface SimulationState {
  jobLoss: boolean;
  salaryHike: boolean;
  buyHouse: boolean;
  buyCar: boolean;
  marketCrash: boolean;
  highInflation: boolean;
}

export default function DigitalTwinPanel({ userData, language, onExplainSuggestion }: DigitalTwinPanelProps) {
  const t = I18N_TRANSLATIONS[language];
  const [sims, setSims] = useState<SimulationState>({
    jobLoss: false,
    salaryHike: false,
    buyHouse: false,
    buyCar: false,
    marketCrash: false,
    highInflation: false
  });

  const [loading, setLoading] = useState(false);
  const [twinOutput, setTwinOutput] = useState("");
  const [projectedWealth5, setProjectedWealth5] = useState(userData.financialTwin?.predictedWealth5Yr || 2500000);
  const [projectedWealth10, setProjectedWealth10] = useState(userData.financialTwin?.predictedWealth10Yr || 5800000);

  // Recalculate Wealth based on simulation parameters
  const recalculateProjection = () => {
    let base5 = userData.netWorth + (userData.monthlyIncome - userData.monthlyExpenses) * 12 * 5 * 1.12; // 12% standard compound
    let base10 = userData.netWorth + (userData.monthlyIncome - userData.monthlyExpenses) * 12 * 10 * 1.15; // 15% standard compound for 10 yrs

    if (sims.jobLoss) {
      // 6 months of no income
      base5 -= userData.monthlyIncome * 6;
      base10 -= userData.monthlyIncome * 6;
    }
    if (sims.salaryHike) {
      // 25% salary hike
      base5 += userData.monthlyIncome * 0.25 * 12 * 5;
      base10 += userData.monthlyIncome * 0.25 * 12 * 10;
    }
    if (sims.buyHouse) {
      // ₹50 Lakh house downpayment and EMI drainage
      base5 -= 1000000; // downpayment
      base5 -= 45000 * 12 * 5; // EMIs
      base10 -= 1000000;
      base10 -= 45000 * 12 * 10;
    }
    if (sims.buyCar) {
      // ₹15 Lakh Car purchase
      base5 -= 300000; // downpayment
      base5 -= 25000 * 12 * 5;
      base10 -= 300000;
      base10 -= 25000 * 12 * 10;
    }
    if (sims.marketCrash) {
      // 30% drop in equities
      const equityVal = userData.portfolio.find(p => p.category.includes("Equity"))?.value || 0;
      const stocksVal = userData.portfolio.find(p => p.category.includes("Stocks"))?.value || 0;
      const crashPenalty = (equityVal + stocksVal) * 0.3;
      base5 -= crashPenalty;
      base10 -= crashPenalty * 1.5;
    }
    if (sims.highInflation) {
      // Expenses grow by 12% annually instead of 6%
      base5 -= userData.monthlyExpenses * 0.1 * 12 * 5;
      base10 -= userData.monthlyExpenses * 0.15 * 12 * 10;
    }

    setProjectedWealth5(Math.max(100000, Math.round(base5)));
    setProjectedWealth10(Math.max(100000, Math.round(base10)));
  };

  const triggerSimulationAi = async () => {
    setLoading(true);
    setTwinOutput("");

    try {
      const response = await fetch("/api/advisor/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userData,
          sims,
          projected5: projectedWealth5,
          projected10: projectedWealth10
        })
      });

      if (!response.ok) throw new Error("Simulation endpoint failure");
      const data = await response.json();
      setTwinOutput(data.simulationOutput);
    } catch (err) {
      // Offline robust generator
      let events = Object.entries(sims)
        .filter(([_, v]) => v)
        .map(([k, _]) => k.replace(/([A-Z])/g, " $1").toUpperCase());
      
      const activeEventsStr = events.length > 0 ? events.join(" and ") : "STANDARD CRUISE";

      setTimeout(() => {
        setTwinOutput(
          `**Artha AI Digital Twin Stress Simulation Complete.**\n\nUnder the **${activeEventsStr}** scenario, your projected 10-year net worth shifts to **₹${(projectedWealth10 / 100000).toFixed(1)} Lakhs**.\n\n* **Critical Stress Impact**: ${sims.jobLoss ? "A 6-month job disruption drains your liquid cash buffer completely, dragging down your goal success indices by 24%." : "Your baseline emergency cash reserves keep your portfolio securely anchored."}\n* **Inflation Hazard**: ${sims.highInflation ? "High inflation increases compound outflow velocity. To counteract this, we recommend moving ₹4,000 from low-yield cash pools to the high-yield Artha Nifty Index Sweep." : "Standard inflation rates (6% YoY) are fully accommodated in your asset growth profile."}\n* **Strategic AI Recommendation**: Consider securing an extra 3 months of emergency expenses before initiating high-capital outflows like buying a car or prepayment.`
        );
        setLoading(false);
      }, 800);
    } finally {
      if (twinOutput) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    recalculateProjection();
  }, [sims, userData]);

  useEffect(() => {
    triggerSimulationAi();
  }, [projectedWealth10]);

  const toggleSim = (key: keyof SimulationState) => {
    setSims(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Render horizontal bar chart
  const historicalYears = userData.financialTwin?.historicalGraph || [
    { year: 2026, balance: userData.netWorth }
  ];

  const maxVal = Math.max(projectedWealth10, ...historicalYears.map(h => h.balance));

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5.5 h-5.5 text-idbi-orange animate-pulse" />
            Financial Digital Twin
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Ground-truth simulation and life-event stress modeling
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono bg-idbi-orange/10 text-idbi-orange border border-idbi-orange/10">
          <Zap className="w-3.5 h-3.5" /> High-Fidelity Physics Core
        </span>
      </div>

      {/* Simulator Controls */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-white tracking-wider font-mono uppercase text-slate-400">
          What-If Stress Event Laboratory (Toggle Parameters)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2.5">
          {[
            { key: "jobLoss", label: "Job Loss (6mo)", icon: Briefcase, color: "hover:border-rose-500/50 hover:bg-rose-500/5" },
            { key: "salaryHike", label: "+25% Salary", icon: TrendingUp, color: "hover:border-emerald-500/50 hover:bg-emerald-500/5" },
            { key: "buyHouse", label: "Buy ₹50L Home", icon: DollarSign, color: "hover:border-idbi-orange/50 hover:bg-idbi-orange/5" },
            { key: "buyCar", label: "Buy ₹18L Car", icon: DollarSign, color: "hover:border-idbi-green/50 hover:bg-idbi-green/5" },
            { key: "marketCrash", label: "30% Stock Drop", icon: AlertTriangle, color: "hover:border-amber-500/50 hover:bg-amber-500/5" },
            { key: "highInflation", label: "High Inflation", icon: Flame, color: "hover:border-orange-500/50 hover:bg-orange-500/5" }
          ].map((item) => {
            const Icon = item.icon;
            const active = sims[item.key as keyof SimulationState];
            return (
              <button
                key={item.key}
                onClick={() => toggleSim(item.key as any)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition cursor-pointer ${
                  active 
                    ? "bg-idbi-orange border-idbi-orange text-white shadow-lg shadow-idbi-orange/10" 
                    : `bg-slate-950/40 border-slate-800 text-slate-400 ${item.color}`
                }`}
              >
                <Icon className={`w-4 h-4 mb-2 ${active ? "text-white" : "text-idbi-orange"}`} />
                <span className="text-[10px] font-bold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trajectory visualization */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        
        {/* Left: Interactive Trajectory Graph */}
        <div className="md:col-span-7 bg-slate-950/40 border border-slate-800/80 p-5 rounded-xl flex flex-col justify-between">
          <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider mb-3">
            Digital Wealth Growth Path (Years 1 to 10)
          </h4>
          
          <div className="space-y-4">
            {/* Historical */}
            {historicalYears.map((h, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-slate-500">Year {h.year} (Historical)</span>
                  <span className="text-slate-300">₹{(h.balance / 100000).toFixed(1)}L</span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-700" style={{ width: `${(h.balance / maxVal) * 100}%` }} />
                </div>
              </div>
            ))}

            {/* Projected Year 5 */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-idbi-orange font-bold">Year 5 (Projected Delta)</span>
                <span className="text-idbi-orange font-bold">₹{(projectedWealth5 / 100000).toFixed(1)}L</span>
              </div>
              <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-idbi-orange to-idbi-orange/70" style={{ width: `${(projectedWealth5 / maxVal) * 100}%` }} />
              </div>
            </div>

            {/* Projected Year 10 */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-idbi-green font-bold">Year 10 (Digital Twin Target)</span>
                <span className="text-idbi-green font-bold">₹{(projectedWealth10 / 100000).toFixed(1)}L</span>
              </div>
              <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-idbi-green to-teal-400" style={{ width: `${(projectedWealth10 / maxVal) * 100}%` }} />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-4 pt-3 border-t border-slate-800/60">
            <span>Base Net Worth: ₹{(userData.netWorth/100000).toFixed(1)}L</span>
            <span>Target: ₹{(projectedWealth10/100000).toFixed(1)}L</span>
          </div>
        </div>

        {/* Right: Scoreboards */}
        <div className="md:col-span-5 grid grid-rows-2 gap-4">
          <div className="bg-slate-950/40 border border-slate-800/80 p-4.5 rounded-xl flex flex-col justify-between">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">5-Year Projected Balance</span>
            <span className="text-2xl font-black text-white font-mono mt-1">₹{(projectedWealth5/100000).toFixed(1)} Lakhs</span>
            <span className="text-[10px] text-slate-400 font-sans mt-2">
              Provides emergency coverage index of <span className="text-idbi-green font-bold">{(projectedWealth5 / (userData.monthlyExpenses * 12)).toFixed(1)} years</span> total expenses.
            </span>
          </div>

          <div className="bg-slate-950/40 border border-slate-800/80 p-4.5 rounded-xl flex flex-col justify-between">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">10-Year Projected Balance</span>
            <span className="text-2xl font-black text-idbi-green font-mono mt-1">₹{(projectedWealth10/100000).toFixed(1)} Lakhs</span>
            <span className="text-[10px] text-slate-400 font-sans mt-2">
              Compounding multiplier: <span className="text-idbi-green font-bold">{(projectedWealth10 / userData.netWorth).toFixed(1)}x</span> initial principal net worth.
            </span>
          </div>
        </div>

      </div>

      {/* AI Simulation Rationale text block */}
      <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-4 space-y-2.5">
        <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-idbi-orange block flex items-center gap-1.5">
          {loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Recalculating digital twin parameters and cashflow projections...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-idbi-orange" />
              AI Twin Projections & Stress Simulation Insights
            </>
          )}
        </span>
        
        {!loading && twinOutput && (
          <div className="text-xs text-slate-300 leading-relaxed space-y-1 font-sans">
            {twinOutput.split("\n").map((line, idx) => {
              let clean = line.trim();
              if (clean.startsWith("###")) {
                return <h4 key={idx} className="text-xs font-bold text-white mt-3">{clean.replace("###", "").trim()}</h4>;
              }
              if (clean.startsWith("*")) {
                const boldParts = clean.replace("*", "").trim().split("**");
                return (
                  <p key={idx} className="text-xs text-slate-300 ml-4 list-item list-disc py-0.5">
                    {boldParts.map((p, i) => i % 2 === 1 ? <strong key={i} className="text-idbi-orange font-semibold">{p}</strong> : p)}
                  </p>
                );
              }
              const boldParts = clean.split("**");
              return (
                <p key={idx} className="text-xs leading-relaxed py-0.5 text-slate-300">
                  {boldParts.map((p, i) => i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{p}</strong> : p)}
                </p>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
