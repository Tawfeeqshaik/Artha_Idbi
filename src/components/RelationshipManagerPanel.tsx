/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Briefcase, 
  UserCheck, 
  Sparkles, 
  Award, 
  ShieldCheck, 
  TrendingUp, 
  FileText, 
  Lightbulb, 
  Activity, 
  PhoneCall, 
  Mail, 
  Compass, 
  CheckCircle2, 
  Coins 
} from "lucide-react";
import { UserProfile } from "../types";

interface RelationshipManagerPanelProps {
  userData: UserProfile;
  language: "en" | "hi" | "ta";
  onClientSelect?: (selectedClient: UserProfile) => void;
}

export default function RelationshipManagerPanel({ userData, language, onClientSelect }: RelationshipManagerPanelProps) {
  const [meetingSummary, setMeetingSummary] = useState("");
  const [talkingPoints, setTalkingPoints] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generateRmIntel = () => {
    setLoading(true);
    
    // Custom talking points & pitch cards based on the active logged-in client profile
    let points: string[] = [];
    let summary = "";

    if (userData.uid === "demo-rahul") {
      summary = "Rahul is a conservative-balanced retail software engineer aiming for high property prepayments in Thane. He is heavily underinsured on term life coverage.";
      points = [
        "Present the Artha Life Term-Max Policy to cover his ₹1.3 Crore shortfall. Explain that adding this protects his family's home payoff goal.",
        "Highlight that his ₹25,000 monthly SIP in equities is performing at 14.2% annualized, but a minor drift exists; suggest shifting 10% to the Artha Gilt FD to locks in profits.",
        "Acknowledge and praise his 785 credit score. Offer pre-approved credit line increases up to ₹5 Lakhs."
      ];
    } else if (userData.uid === "demo-priya") {
      summary = "Priya is an aggressive, high-earning Bengaluru product designer with a direct stock tilt. She has absolutely zero personal term life insurance.";
      points = [
        "Pitch an independent personal Term Life plan immediately of ₹2.5 Crore, emphasizing her dependent mother's security.",
        "Recommend diversifying her 70% direct equity exposure with high-growth small/midcap mutual funds like Artha Focus Multi-cap Fund.",
        "Review her luxury lifestyle spend (₹12,400 weekend bar surges) using our spending visualizer as a soft coaching talking point."
      ];
    } else if (userData.uid === "demo-amit") {
      summary = "Amit is an Ahmedabad business owner carrying a heavy ₹14.5 Lakh business & car debt. His EMI consumption rate is high (37%).";
      points = [
        "Pitch debt refinancing: Suggest leveraging his substantial 25% Gold Portfolio for an Artha Gold Loan at 8.9% interest, paying off his high-rate business credits.",
        "Address the ₹3.5 Lakh shortfall for his son Deep's upcoming engineering fees next year. Suggest temporary FD sweeps to bridge the gap.",
        "Secure Term Life cover immediately. His current ₹20 Lakh policy is fully consumed by outstanding debt liabilities."
      ];
    } else if (userData.uid === "demo-ananya") {
      summary = "Ananya is a young Kolkata copywriter with irregular freelance streams and high discretionary outflows. She lacks all basic insurance.";
      points = [
        "Focus primarily on health insurance: Introduce Artha Health Guard (₹5L sum assured) with low-premium monthly SIP options.",
        "Coach her on building a stable 6-month emergency reserve (₹3 Lakhs) using automatic monthly sweeps.",
        "Propose setting a firm spending ceiling on dining and fashion purchases using our integrated budget controls."
      ];
    } else {
      const name = userData.name || "Client";
      const occupation = userData.occupation || "professional";
      const risk = userData.riskCategory || "Balanced";
      const netWorthStr = userData.netWorth ? `₹${(userData.netWorth / 100000).toFixed(1)} Lakh` : "unknown";
      
      summary = `${name} is a ${risk.toLowerCase()} ${occupation} based in ${userData.city || "India"} with a net worth of ${netWorthStr}. They are looking for optimized wealth planning.`;
      
      points = [];
      const emergencyMonths = userData.monthlyExpenses && userData.cashBalance ? (userData.cashBalance / userData.monthlyExpenses).toFixed(1) : "0";
      if (Number(emergencyMonths) < 6) {
        points.push(`Recommend building a 6-month emergency reserve. Currently, they have about ${emergencyMonths} months of coverage.`);
      } else {
        points.push(`Acknowledge their strong emergency fund of ${emergencyMonths} months. Suggest investing excess cash into high-yielding assets.`);
      }

      if (!userData.insurance?.lifeCover?.sumAssured) {
        points.push(`Urgent: Pitch an independent Term Life insurance plan since they have no personal cover registered.`);
      } else if (userData.insurance?.lifeCover?.sumAssured && userData.monthlyIncome) {
        const target = userData.monthlyIncome * 12 * 10;
        if (userData.insurance.lifeCover.sumAssured < target) {
          const gap = target - userData.insurance.lifeCover.sumAssured;
          points.push(`Address the life insurance gap of ₹${(gap / 100000).toFixed(1)} Lakh. Pitch term coverage expansion.`);
        }
      }

      if (userData.goals && userData.goals.length > 0) {
        const primaryGoal = userData.goals[0];
        points.push(`Create an allocation schedule to meet the target of ₹${(primaryGoal.targetAmount / 100000).toFixed(1)} Lakh for their '${primaryGoal.name}' goal.`);
      } else {
        points.push(`Guide them to define clear long-term wealth goals in their dashboard to align the portfolio.`);
      }
    }

    setTalkingPoints(points);
    setMeetingSummary(summary);
    setLoading(false);
  };

  useEffect(() => {
    generateRmIntel();
  }, [userData]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Briefcase className="w-5.5 h-5.5 text-idbi-orange" />
            Artha AI Employee & Relationship Manager (RM) Portal
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Secure client analytics cockpit and AI-driven cross-selling intelligence
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono bg-idbi-orange/10 text-idbi-orange border border-idbi-orange/10">
          <Award className="w-3.5 h-3.5" /> RM level 3 Credentials
        </span>
      </div>

      {/* Main Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-slate-950/40 border border-slate-800/80 p-4.5 rounded-xl flex flex-col justify-between">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Managing Client</span>
          <div className="mt-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              {userData.name}
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                {userData.riskCategory}
              </span>
            </h4>
            <span className="text-xs text-slate-400 font-sans block mt-1">
              {userData.occupation} • Age {userData.age}
            </span>
          </div>
          <div className="flex gap-2.5 mt-3 pt-3 border-t border-slate-800/60">
            <button className="flex items-center gap-1 text-[10px] text-idbi-orange font-mono cursor-pointer hover:underline">
              <PhoneCall className="w-3 h-3" /> Dial Client
            </button>
            <button className="flex items-center gap-1 text-[10px] text-slate-400 font-mono cursor-pointer hover:underline">
              <Mail className="w-3 h-3" /> Send Brief
            </button>
          </div>
        </div>

        <div className="bg-slate-950/40 border border-slate-800/80 p-4.5 rounded-xl flex flex-col justify-between">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Client Health Score</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">{userData.financialHealthScore}</span>
            <span className="text-xs text-slate-400 font-sans">/ 100 Grade</span>
          </div>
          <span className="text-[10px] text-slate-400 font-sans block leading-normal">
            Credit Rating index: <span className="text-emerald-400 font-bold font-mono">{userData.creditScore}</span>. Savings efficiency: <span className="text-idbi-green font-bold font-mono">{userData.financialHealthBreakdown?.savingsRate || 40}%</span>
          </span>
        </div>

        <div className="bg-slate-950/40 border border-slate-800/80 p-4.5 rounded-xl flex flex-col justify-between">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Total Asset Portfolio</span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-400 font-mono">₹{(userData.netWorth/100000).toFixed(1)}L</span>
            <span className="text-[10px] text-slate-500 font-mono">Book Value</span>
          </div>
          <span className="text-[10px] text-slate-400 font-sans block leading-normal">
            Artha Savings Ledger balance: <span className="text-white font-bold">₹{userData.cashBalance.toLocaleString("en-IN")}</span>
          </span>
        </div>

      </div>

      {/* AI Client Executive Summary */}
      <div className="rounded-xl border border-dashed border-slate-800 p-4 space-y-2">
        <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-idbi-orange" /> Client Executive Profile Summary (AI Compiled)
        </span>
        <p className="text-slate-300 text-xs leading-relaxed font-sans">
          {meetingSummary}
        </p>
      </div>

      {/* Structured Meeting Talking Points */}
      <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-xl space-y-4">
        <span className="text-[11px] font-bold font-mono uppercase tracking-widest text-idbi-orange block flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-idbi-orange" /> High-Conversion Pre-Meeting Talking Points
        </span>

        <div className="space-y-3">
          {talkingPoints.map((point, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 text-xs">
              <div className="h-5 w-5 rounded bg-idbi-orange/10 text-idbi-orange flex items-center justify-center font-bold text-[11px] shrink-0">
                {index + 1}
              </div>
              <p className="text-slate-300 font-sans leading-relaxed">
                {point}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Up-selling Pitch Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4.5 space-y-2.5">
          <span className="text-[10px] font-bold font-mono uppercase text-emerald-400 tracking-wider block flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Primary Cross-Sell recommendation
          </span>
          <p className="text-slate-300 text-xs leading-relaxed">
            Pitch the **Artha Sovereign Gold Bonds or ELSS sweep**. Transition clients carrying idle savings yields above ₹1.5L from savings to high-yield short term lock-ins to boost our segment deposit depth.
          </p>
        </div>

        <div className="rounded-xl border border-idbi-orange/10 bg-idbi-orange/5 p-4.5 space-y-2.5">
          <span className="text-[10px] font-bold font-mono uppercase text-idbi-orange tracking-wider block flex items-center gap-1">
            <Lightbulb className="w-4 h-4 text-idbi-orange animate-bounce" /> Tactical Pitch Tip
          </span>
          <p className="text-slate-300 text-xs leading-relaxed">
            Highlight that our AI analysis flagged an underinsurance deficit. Emphasize that adding a Term or Health top-up shields their outstanding home/business loans from volatile rate hikes.
          </p>
        </div>
      </div>

    </div>
  );
}
