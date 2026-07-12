/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Users, 
  Sparkles, 
  Check, 
  TrendingUp, 
  ShieldCheck, 
  Heart, 
  Activity, 
  Wallet, 
  Goal, 
  Lock, 
  UserCheck 
} from "lucide-react";
import { UserProfile } from "../types";

interface FamilyWealthPanelProps {
  userData: UserProfile;
  language: "en" | "hi" | "ta";
  onExplainSuggestion?: (recommendation: string, context: string) => void;
}

export default function FamilyWealthPanel({ userData, language, onExplainSuggestion }: FamilyWealthPanelProps) {
  // Toggle switches to link family members
  const [linkedMembers, setLinkedMembers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // By default, link the first member to make it interactive right away
    if (userData?.familyMembers && userData.familyMembers.length > 0) {
      const initialMap: Record<string, boolean> = {};
      userData.familyMembers.forEach((m, idx) => {
        initialMap[m] = idx === 0; // Link spouse or mother initially
      });
      setLinkedMembers(initialMap);
    }
  }, [userData]);

  const toggleLink = (member: string) => {
    setLinkedMembers(prev => ({ ...prev, [member]: !prev[member] }));
  };

  const getActiveCount = () => {
    return Object.values(linkedMembers).filter(Boolean).length;
  };

  // Calculate Family Combined Financials
  const activeCount = getActiveCount();
  
  // Base client data
  let combinedNetWorth = userData?.netWorth || 0;
  let combinedInvestments = userData?.portfolio?.reduce((sum, p) => sum + p.value, 0) || 0;
  let combinedEmergencyFund = userData?.cashBalance || 0;
  let combinedInsuranceLife = userData?.insurance?.lifeCover?.sumAssured || 0;
  let combinedInsuranceHealth = userData?.insurance?.healthCover?.sumAssured || 0;

  // Add linked members' simulated parameters
  if (userData.uid === "demo-rahul") {
    if (linkedMembers["Neha Sharma (Spouse)"]) {
      combinedNetWorth += 1250000;
      combinedInvestments += 800000;
      combinedEmergencyFund += 150000;
      combinedInsuranceLife += 5000000;
      combinedInsuranceHealth += 300000;
    }
    if (linkedMembers["Aarav Sharma (Son, Age 4)"]) {
      combinedNetWorth += 180000;
      combinedInvestments += 150000;
      combinedEmergencyFund += 20000;
    }
  } else if (userData.uid === "demo-priya") {
    if (linkedMembers["Janaki Nair (Mother)"]) {
      combinedNetWorth += 1400000;
      combinedInvestments += 1000000;
      combinedEmergencyFund += 200000;
      combinedInsuranceHealth += 500000;
    }
  } else if (userData.uid === "demo-amit") {
    if (linkedMembers["Hetal Patel (Spouse)"]) {
      combinedNetWorth += 850000;
      combinedInvestments += 400000;
      combinedEmergencyFund += 80000;
      combinedInsuranceHealth += 200000;
    }
    if (linkedMembers["Deep Patel (Son, Age 18)"]) {
      combinedNetWorth += 50000;
      combinedInvestments += 40000;
    }
    if (linkedMembers["Riya Patel (Daughter, Age 14)"]) {
      combinedNetWorth += 40000;
      combinedInvestments += 35000;
    }
  } else if (userData.uid === "demo-vikram") {
    if (linkedMembers["Sanjana Malhotra (Spouse)"]) {
      combinedNetWorth += 8500000;
      combinedInvestments += 6500000;
      combinedEmergencyFund += 1200000;
      combinedInsuranceLife += 15000000;
      combinedInsuranceHealth += 1000000;
    }
    if (linkedMembers["Kabir Malhotra (Son, Age 21)"]) {
      combinedNetWorth += 500000;
      combinedInvestments += 400000;
      combinedEmergencyFund += 50000;
    }
    if (linkedMembers["Rohan Malhotra (Son, Age 17)"]) {
      combinedNetWorth += 300000;
      combinedInvestments += 250000;
      combinedEmergencyFund += 20000;
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5.5 h-5.5 text-idbi-orange" />
            Family Wealth Synchronizer
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Link family accounts to aggregate net worth, emergency pools, and protection caps
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-mono bg-idbi-green/10 text-idbi-green border border-idbi-green/10">
          <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" /> Combined Household Focus
        </span>
      </div>

      {/* Member Linking Switches */}
      <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl space-y-3">
        <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
          Link / Delink Household Members
        </h4>
        
        {userData.familyMembers && userData.familyMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {userData.familyMembers.map((member) => {
              const active = !!linkedMembers[member];
              return (
                <button
                  key={member}
                  onClick={() => toggleLink(member)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition cursor-pointer text-left ${
                    active 
                      ? "bg-idbi-orange/10 border-idbi-orange/50 text-white" 
                      : "bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:bg-slate-900/80"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center border text-[9px] shrink-0 ${
                      active ? "bg-idbi-orange border-idbi-orange text-white" : "border-slate-700 bg-slate-950 text-transparent"
                    }`}>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold truncate">{member}</span>
                  </div>
                  <span className="text-[9px] font-mono bg-slate-950/60 border border-slate-850 px-1.5 py-0.5 rounded text-slate-500 uppercase">
                    {active ? "Linked" : "Offline"}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500 leading-relaxed font-sans py-1">
            No pre-mapped family relations found for your current profile. Linkages can be mapped in your Artha core bank ledger first.
          </p>
        )}
      </div>

      {/* Aggregate Scoreboards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
        
        <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">COMBINED HOUSE NET WORTH</span>
          <span className="text-2xl font-black text-white font-mono mt-2">₹{combinedNetWorth.toLocaleString("en-IN")}</span>
          <span className="text-[9px] text-slate-400 font-sans block mt-1">
            Includes {activeCount} linked member(s)
          </span>
        </div>

        <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">COMBINED SAVINGS / EMERGENCY</span>
          <span className="text-2xl font-black text-idbi-orange font-mono mt-2">₹{combinedEmergencyFund.toLocaleString("en-IN")}</span>
          <span className="text-[9px] text-slate-400 font-sans block mt-1">
            Sweep liquidity pool
          </span>
        </div>

        <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">COMBINED INVESTMENTS</span>
          <span className="text-2xl font-black text-emerald-400 font-mono mt-2">₹{combinedInvestments.toLocaleString("en-IN")}</span>
          <span className="text-[9px] text-slate-400 font-sans block mt-1">
            Mutual Funds & Debt products
          </span>
        </div>

        <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">COMBINED TERM LIFE COVER</span>
          <span className="text-2xl font-black text-idbi-orange font-mono mt-2">₹{combinedInsuranceLife.toLocaleString("en-IN")}</span>
          <span className="text-[9px] text-slate-400 font-sans block mt-1">
            Aggregate life defense cap
          </span>
        </div>

      </div>

      {/* Aggregate Goals tracker */}
      <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl space-y-4">
        <span className="text-[11px] font-bold font-mono uppercase tracking-widest text-idbi-orange block flex items-center gap-1.5">
          <Goal className="w-4 h-4 text-idbi-orange" /> Consolidated Household Goal Targets
        </span>

        {userData.goals && userData.goals.length > 0 ? (
          <div className="space-y-3">
            {userData.goals.map((goal) => {
              // Boost goal parameters based on family linked
              const multiplier = activeCount > 0 ? 1.4 : 1.0;
              const accumulated = Math.round(goal.accumulatedAmount * multiplier);
              const progress = Math.min(100, Math.round((accumulated / goal.targetAmount) * 100));

              return (
                <div key={goal.id} className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-slate-200 block">{goal.name}</span>
                      <span className="text-[9px] text-slate-500 font-mono block mt-0.5">Deadline: {goal.targetDate}</span>
                    </div>
                    <span className="font-mono font-extrabold text-white">
                      ₹{accumulated.toLocaleString("en-IN")} / ₹{goal.targetAmount.toLocaleString("en-IN")} ({progress}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-idbi-orange to-idbi-green rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-500 font-sans">
            No target goals established for combined household. Start mapping target plans inside your Goal Planner.
          </p>
        )}
      </div>

      {/* Household AI Insights */}
      <div className="rounded-xl border border-idbi-orange/10 bg-idbi-orange/5 p-4.5 space-y-2.5">
        <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-idbi-orange block flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-idbi-orange" /> Combined Household AI Advisory Fact
        </span>
        <p className="text-slate-300 text-xs leading-relaxed italic">
          {activeCount > 0 
            ? `"By consolidating your family's accounts, we detected that your household's Combined Net Worth reaches ₹${combinedNetWorth.toLocaleString("en-IN")}, lowering your aggregate debt-to-income constraint to safe thresholds of under 18%. Combined emergency liquidity (₹${combinedEmergencyFund.toLocaleString("en-IN")}) now easily satisfies a 5.5-month buffer. Excellent portfolio aggregation!"`
            : `"Consolidated household view deactivated. Link your family members above (such as spouse or children) to dynamically aggregate your combined savings shields and insurance protection caps."`
          }
        </p>
      </div>

    </div>
  );
}
