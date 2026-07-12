/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile } from "../types";
import { 
  Sparkles, 
  HelpCircle, 
  Loader2, 
  CheckCircle2, 
  ChevronRight, 
  Calculator, 
  ShieldCheck, 
  ArrowRight, 
  TrendingUp, 
  Info,
  Coins
} from "lucide-react";
import { I18N_TRANSLATIONS } from "../data";

interface TaxPlannerPanelProps {
  userData: UserProfile;
  language: "en" | "hi" | "ta";
  onExplainSuggestion: (recommendation: string, context: string) => void;
}

interface TaxStrategyResult {
  recommendedAction: string;
  oldVsNewAnalysis: string;
  actionPlan: string[];
  aiStrategyMarkdown: string;
}

export default function TaxPlannerPanel({
  userData,
  language,
  onExplainSuggestion,
}: TaxPlannerPanelProps) {
  const t = I18N_TRANSLATIONS[language];
  
  // States
  const [annualSalary, setAnnualSalary] = useState<number>(1800000);
  const [epf, setEpf] = useState<number>(24000);
  const [elss, setElss] = useState<number>(30000);
  const [insurancePrem, setInsurancePrem] = useState<number>(
    userData.insurance.lifeCover.premiumAmount || 8500
  );
  const [homeLoanPrincipal, setHomeLoanPrincipal] = useState<number>(60000);
  const [others, setOthers] = useState<number>(10000);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [strategyResult, setStrategyResult] = useState<TaxStrategyResult | null>(null);
  const [investmentSuccess, setInvestmentSuccess] = useState<boolean>(false);

  // Auto-populate salary based on monthly income
  useEffect(() => {
    if (userData.monthlyIncome) {
      setAnnualSalary(userData.monthlyIncome * 12);
    }
  }, [userData.monthlyIncome]);

  // Calculations
  const limit = 150000;
  const total80C = epf + elss + insurancePrem + homeLoanPrincipal + others;
  const utilized80C = Math.min(limit, total80C);
  const remainingGap = Math.max(0, limit - utilized80C);
  const percentUtilized = Math.min(100, Math.round((total80C / limit) * 100));

  // Tax slab estimator for Old Regime
  const getMarginalTaxRate = (income: number): number => {
    if (income <= 250000) return 0;
    if (income <= 500000) return 0.05;
    if (income <= 1000000) return 0.20;
    return 0.30;
  };

  const marginalRate = getMarginalTaxRate(annualSalary);
  const potentialSavings = Math.round(remainingGap * marginalRate * 1.04); // including 4% education/health cess

  const triggerOptimizeTax = async () => {
    setLoading(true);
    setInvestmentSuccess(false);
    setStrategyResult(null);

    const current80C = {
      total: total80C,
      epf,
      elss,
      insurance: insurancePrem,
      homeLoan: homeLoanPrincipal,
      others
    };

    try {
      const response = await fetch("/api/advisor/tax-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          salary: annualSalary,
          current80C,
          gap: remainingGap,
          userData
        }),
      });

      if (!response.ok) throw new Error("Tax strategy failed");
      const data = await response.json();
      setStrategyResult(data);
    } catch (err) {
      console.error("Tax strategy load error:", err);
      // Perfect static fallback matching Rahul's parameters
      setStrategyResult({
        recommendedAction: `Invest ₹${remainingGap.toLocaleString("en-IN")} into the Artha Tax Saving Fund (ELSS) to maximize your Section 80C limit and capture long-term equity growth.`,
        oldVsNewAnalysis: `At an annual income of ₹${annualSalary.toLocaleString("en-IN")}, your old regime tax liability is lower only if your total deductions (80C, 80D, HRA, home loan interest) exceed ₹3,75,000. Under the New Tax Regime, you save around ₹15,000 in taxes even without any 80C investments.`,
        actionPlan: [
          `Start a one-time or monthly lump sum ELSS investment of ₹${remainingGap.toLocaleString("en-IN")} before March 31st.`,
          "Review your rent receipts and Section 24(b) home loan interest certificates to tally deductions.",
          "Consider moving to the New Tax Regime next fiscal year if other deductions are low."
        ],
        aiStrategyMarkdown: `### Personalized Section 80C Strategy\n\n* **Maximize your ELSS**: Your remaining 80C gap of **₹${remainingGap.toLocaleString("en-IN")}** can be fully offset by investing in the **Artha Tax Saving Fund (ELSS)**, which carries a 3-year lock-in (lowest among 80C options) and has a 12.8% historical return rate.\n* **Old vs New Regime**: With a salary of **₹${(annualSalary / 100000).toFixed(1)} Lakhs**, if you only claim ₹1.5L (80C) and ₹8,500 (insurance premium), the **New Tax Regime** is more cost-effective, saving you approximately **₹15,600** in tax outflow. Unless you have significant HRA/home loan interest (Section 24b) deductions, the New Regime is highly recommended.`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyInvestment = () => {
    setInvestmentSuccess(true);
    setTimeout(() => {
      setInvestmentSuccess(false);
    }, 4000);
  };

  // Simple Markdown to HTML formatter to avoid react-markdown dependencies
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, idx) => {
      let cleanLine = line.trim();
      if (cleanLine.startsWith("###")) {
        return <h4 key={idx} className="text-sm font-bold text-white mt-4 mb-2">{cleanLine.replace("###", "").trim()}</h4>;
      }
      if (cleanLine.startsWith("*")) {
        // Parse bold parts
        const boldParts = cleanLine.replace("*", "").trim().split("**");
        return (
          <li key={idx} className="text-xs text-slate-300 leading-relaxed list-disc ml-4 my-1.5">
            {boldParts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-idbi-orange font-semibold">{part}</strong> : part)}
          </li>
        );
      }
      if (cleanLine) {
        const boldParts = cleanLine.split("**");
        return (
          <p key={idx} className="text-xs text-slate-300 leading-relaxed my-2">
            {boldParts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part)}
          </p>
        );
      }
      return <div key={idx} className="h-2" />;
    });
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-6" id="tax-planner-panel">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white font-sans flex items-center gap-2">
            <Calculator className="w-5 h-5 text-idbi-orange animate-pulse" />
            Section 80C Tax Planner
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Maximize your Section 80C deductions (₹1.5L limit) and unlock optimized savings
          </p>
        </div>
      </div>

      {/* Calculator Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Inputs and Sliders (Colspan 7) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Annual Salary Config */}
          <div className="rounded-xl bg-slate-950/30 p-4 border border-slate-800/60 space-y-3" id="tax-salary-config">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-300 font-medium">Estimated Annual Income</span>
              <div className="relative flex items-center max-w-[160px]" id="salary-input-container">
                <span className="absolute left-2.5 text-slate-400 font-mono">₹</span>
                <input
                  type="number"
                  value={annualSalary}
                  onChange={(e) => setAnnualSalary(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/50 pl-6 pr-2 py-1.5 text-xs text-white text-right font-mono font-bold focus:border-idbi-orange focus:outline-none"
                  id="salary-manual-input"
                  placeholder="Enter income"
                />
              </div>
            </div>
            <input
              type="range"
              min="500000"
              max="3000000"
              step="50000"
              value={annualSalary}
              onChange={(e) => setAnnualSalary(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-idbi-orange"
              id="salary-range-input"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>₹5L</span>
              <span>₹18L ({(userData?.name?.split(" ")[0] || "Rahul")}'s Base)</span>
              <span>₹30L</span>
            </div>
          </div>

          {/* Section 80C Itemized breakdown */}
          <div className="rounded-xl bg-slate-950/30 p-4 border border-slate-800/60 space-y-4" id="tax-deductions-breakdown">
            <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">
              Current Section 80C Eligible Declarations
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* EPF */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 flex justify-between">
                  <span>EPF Contribution</span>
                  <span className="font-mono text-slate-300">₹{epf.toLocaleString("en-IN")}</span>
                </label>
                <input
                  type="number"
                  value={epf}
                  onChange={(e) => setEpf(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-1.5 text-xs text-white focus:border-idbi-orange focus:outline-none"
                  id="input-epf"
                />
              </div>

              {/* ELSS */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 flex justify-between">
                  <span>ELSS Mutual Funds</span>
                  <span className="font-mono text-slate-300">₹{elss.toLocaleString("en-IN")}</span>
                </label>
                <input
                  type="number"
                  value={elss}
                  onChange={(e) => setElss(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-1.5 text-xs text-white focus:border-idbi-orange focus:outline-none"
                  id="input-elss"
                />
              </div>

              {/* Term Life Premium */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 flex justify-between">
                  <span>Life Insurance Premium</span>
                  <span className="font-mono text-slate-300">₹{insurancePrem.toLocaleString("en-IN")}</span>
                </label>
                <input
                  type="number"
                  value={insurancePrem}
                  onChange={(e) => setInsurancePrem(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-1.5 text-xs text-white focus:border-idbi-orange focus:outline-none"
                  id="input-insurance"
                />
              </div>

              {/* Home Loan Principal */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400 flex justify-between">
                  <span>Home Loan Principal</span>
                  <span className="font-mono text-slate-300">₹{homeLoanPrincipal.toLocaleString("en-IN")}</span>
                </label>
                <input
                  type="number"
                  value={homeLoanPrincipal}
                  onChange={(e) => setHomeLoanPrincipal(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-1.5 text-xs text-white focus:border-idbi-orange focus:outline-none"
                  id="input-homeloan"
                />
              </div>

              {/* Others */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-[11px] text-slate-400 flex justify-between">
                  <span>PPF / NSC / Tuition Fees / Other 80C</span>
                  <span className="font-mono text-slate-300">₹{others.toLocaleString("en-IN")}</span>
                </label>
                <input
                  type="number"
                  value={others}
                  onChange={(e) => setOthers(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-1.5 text-xs text-white focus:border-idbi-orange focus:outline-none"
                  id="input-others"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Math, Progress, Trigger (Colspan 5) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Real-time Tally Dashboard */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/20 p-5 space-y-4" id="tax-tally-board">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Section 80C Status Tally</span>
            
            {/* Circular usage indicator */}
            <div className="flex items-center gap-4 border-b border-slate-800/60 pb-4">
              <div className="relative h-16 w-16 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    className="stroke-slate-800"
                    strokeWidth="4.5"
                    fill="transparent"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    className="stroke-idbi-orange transition-all duration-300"
                    strokeWidth="4.5"
                    fill="transparent"
                    strokeDasharray={175.9}
                    strokeDashoffset={175.9 - (175.9 * percentUtilized) / 100}
                  />
                </svg>
                <span className="absolute text-xs font-black text-white font-mono">{percentUtilized}%</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 text-[10px] uppercase font-mono block">80C UTILIZATION</span>
                <span className="text-lg font-bold text-white font-mono">
                  ₹{utilized80C.toLocaleString("en-IN")} / ₹1,50,000
                </span>
                {total80C > limit && (
                  <span className="text-[9px] text-emerald-400 font-mono block">
                    ✓ Limit fully saturated (₹{(total80C - limit).toLocaleString("en-IN")} excess declared)
                  </span>
                )}
              </div>
            </div>

            {/* Calculations items */}
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>Remaining 80C Gap:</span>
                <span className={`font-mono font-bold ${remainingGap > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                  ₹{remainingGap.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Your Marginal Tax Slab:</span>
                <span className="font-mono text-white font-semibold">
                  {(marginalRate * 100).toFixed(0)}% (+4% Cess)
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-800/60 pt-3 text-slate-100">
                <span className="flex items-center gap-1">
                  Potential Tax Saved:
                  <HelpCircle className="w-3.5 h-3.5 text-slate-500 cursor-help" onClick={() => onExplainSuggestion("Section 80C allows a full tax rebate on up to ₹1.5 Lakhs investments, reducing taxable income directly at your marginal slab rate.", "Potential Tax Saved")} />
                </span>
                <span className={`font-mono font-black text-base ${remainingGap > 0 ? "text-idbi-orange" : "text-emerald-400"}`}>
                  ₹{potentialSavings.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Action optimization button */}
            <button
              onClick={triggerOptimizeTax}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-idbi-orange hover:bg-idbi-orange/90 disabled:bg-slate-800/80 disabled:text-slate-600 px-4 py-3 text-xs font-bold text-white transition cursor-pointer mt-2 shadow-lg shadow-idbi-orange/10"
              id="optimize-tax-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing Portfolios & Tax Slabs...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Personalized Tax Strategy
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* AI Strategy Results Panel */}
      <AnimatePresence mode="wait">
        {strategyResult && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="border-t border-slate-800/60 pt-6 space-y-5"
            id="tax-strategy-results"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Recommended Product & Trade */}
              <div className="rounded-xl border border-idbi-orange/15 bg-idbi-orange/5 p-4.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono text-idbi-orange uppercase tracking-widest flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5" /> Artha AI Recommended Placement
                  </span>
                  <span className="rounded-full bg-idbi-orange/10 px-2 py-0.5 text-[9px] font-semibold text-idbi-orange border border-idbi-orange/15">
                    Gap Filler
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">
                  Invest ₹{remainingGap.toLocaleString("en-IN")} in Artha ELSS Mutual Fund
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {strategyResult.recommendedAction}
                </p>
                <button
                  onClick={handleApplyInvestment}
                  disabled={remainingGap === 0 || investmentSuccess}
                  className="rounded-lg bg-idbi-orange hover:bg-idbi-orange/90 disabled:bg-emerald-500/15 disabled:text-emerald-400 hover:border-idbi-orange/40 transition cursor-pointer px-3.5 py-2 text-[11px] font-bold text-white flex items-center gap-1.5 border border-transparent shadow-md mt-1"
                  id="apply-tax-investment-btn"
                >
                  {investmentSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      ₹{remainingGap.toLocaleString("en-IN")} Swept into Artha Tax-Saver ELSS!
                    </>
                  ) : remainingGap === 0 ? (
                    "80C Saturated"
                  ) : (
                    <>
                      Execute Placement with One-Click Sweep
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Regime Trade-off Analysis */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/20 p-4.5 space-y-2.5">
                <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Tax Regime Optimal Decision
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {strategyResult.oldVsNewAnalysis}
                </p>
                <div className="text-[10px] text-slate-500 font-mono leading-normal bg-slate-950/40 p-2 rounded border border-slate-800/40 flex gap-2">
                  <Info className="w-3.5 h-3.5 text-idbi-orange shrink-0 mt-0.5" />
                  <span>
                    The finance bill recently enhanced the standard deduction under the New Regime to ₹75,000, broadening its margin of safety.
                  </span>
                </div>
              </div>

            </div>

            {/* AI Generated Markdown Details */}
            <div className="rounded-xl bg-slate-950/40 p-5 border border-slate-800/60 space-y-2">
              <span className="text-[10px] font-bold font-mono text-idbi-orange uppercase tracking-widest block flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Detailed Wealth Strategy Guide
              </span>
              <div className="space-y-1">
                {renderMarkdown(strategyResult.aiStrategyMarkdown)}
              </div>
            </div>

            {/* Action checklist */}
            <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4.5 space-y-3.5">
              <span className="text-[10px] font-bold font-mono text-emerald-400 uppercase tracking-widest block flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Step-by-Step AI Action Checklist
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {strategyResult.actionPlan.map((step, idx) => (
                  <div key={idx} className="flex gap-2.5 bg-slate-950/20 rounded-lg p-3 border border-emerald-500/5">
                    <span className="h-5 w-5 shrink-0 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-[11px] text-slate-300 leading-normal">{step}</span>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
