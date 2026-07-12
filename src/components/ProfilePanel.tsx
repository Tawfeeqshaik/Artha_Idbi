/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { UserProfile, RiskCategory, AssetAllocation } from "../types";
import { 
  User, 
  DollarSign, 
  Briefcase, 
  MapPin, 
  TrendingUp, 
  Scale, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  AlertTriangle,
  Wallet,
  Shield,
  Percent,
  Calculator,
  Calendar,
  Building
} from "lucide-react";

interface ProfilePanelProps {
  userData: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  isDemoUser?: boolean;
}

export default function ProfilePanel({ userData, onUpdateProfile, isDemoUser = false }: ProfilePanelProps) {
  const [success, setSuccess] = useState(false);

  // States
  const [name, setName] = useState(userData.name || "");
  const [age, setAge] = useState<number>(userData.age || 30);
  const [city, setCity] = useState(userData.city || "");
  const [occupation, setOccupation] = useState(userData.occupation || "");
  
  const [monthlyIncome, setMonthlyIncome] = useState<number>(userData.monthlyIncome || 0);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(userData.monthlyExpenses || 0);

  // Balances
  const [cashBalance, setCashBalance] = useState<number>(userData.cashBalance || 0);
  
  // Find initial values in portfolio array or default to 0
  const initialMutualFunds = userData.portfolio?.find(p => p.category.includes("Mutual Funds"))?.value || 0;
  const initialFixedDeposits = userData.portfolio?.find(p => p.category.includes("Fixed Deposits"))?.value || 0;
  const initialStocks = userData.portfolio?.find(p => p.category.includes("Stocks"))?.value || 0;
  const initialGold = userData.portfolio?.find(p => p.category.includes("Gold"))?.value || 0;

  const [mutualFunds, setMutualFunds] = useState<number>(initialMutualFunds);
  const [fixedDeposits, setFixedDeposits] = useState<number>(initialFixedDeposits);
  const [stocks, setStocks] = useState<number>(initialStocks);
  const [gold, setGold] = useState<number>(initialGold);

  // Loans
  const [homeLoan, setHomeLoan] = useState<number>(userData.loans?.homeLoanBalance || 0);
  const [homeLoanEmi, setHomeLoanEmi] = useState<number>(userData.loans?.homeLoanEmi || 0);
  const [carLoan, setCarLoan] = useState<number>(userData.loans?.carLoanBalance || 0);
  const [carLoanEmi, setCarLoanEmi] = useState<number>(userData.loans?.carLoanEmi || 0);
  const [otherLoan, setOtherLoan] = useState<number>(userData.loans?.otherLoanBalance || 0);
  const [otherLoanEmi, setOtherLoanEmi] = useState<number>(userData.loans?.otherLoanEmi || 0);

  // Insurance
  const [healthCover, setHealthCover] = useState<number>(userData.insurance?.healthCover?.sumAssured || 0);
  const [lifeCover, setLifeCover] = useState<number>(userData.insurance?.lifeCover?.sumAssured || 0);

  // Risk profile
  const [riskCategory, setRiskCategory] = useState<RiskCategory>(userData.riskCategory || "Balanced");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Rebuild Asset Allocation Portfolio
    const portfolio: AssetAllocation[] = [];
    const totalInvestments = mutualFunds + fixedDeposits + stocks + gold;
    
    if (mutualFunds > 0) {
      portfolio.push({
        category: "Mutual Funds (Equity)",
        percentage: Math.round((mutualFunds / (totalInvestments || 1)) * 100),
        value: mutualFunds,
        color: "#F58220"
      });
    }
    if (fixedDeposits > 0) {
      portfolio.push({
        category: "Fixed Deposits (Debt)",
        percentage: Math.round((fixedDeposits / (totalInvestments || 1)) * 100),
        value: fixedDeposits,
        color: "#10B981"
      });
    }
    if (stocks > 0) {
      portfolio.push({
        category: "Direct Indian Stocks",
        percentage: Math.round((stocks / (totalInvestments || 1)) * 100),
        value: stocks,
        color: "#EC4899"
      });
    }
    if (gold > 0) {
      portfolio.push({
        category: "Digital Gold (Artha)",
        percentage: Math.round((gold / (totalInvestments || 1)) * 100),
        value: gold,
        color: "#F59E0B"
      });
    }

    if (portfolio.length === 0) {
      portfolio.push({
        category: "Cash Reserves",
        percentage: 100,
        value: cashBalance,
        color: "#64748B"
      });
    }

    // 2. Net Worth Calculation
    const totalAssets = cashBalance + totalInvestments;
    const totalDebt = homeLoan + carLoan + otherLoan;
    const netWorth = totalAssets - totalDebt;

    // 3. Financial Health Score calculation
    const savingsRatio = monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / monthlyIncome : 0;
    const savingsScore = Math.min(100, Math.max(0, Math.round(savingsRatio * 150))); 

    const monthlyOutflows = monthlyExpenses + homeLoanEmi + carLoanEmi + otherLoanEmi;
    const emergencyMonths = monthlyOutflows > 0 ? cashBalance / monthlyOutflows : 6;
    const emergencyScore = Math.min(100, Math.round((emergencyMonths / 6) * 100)); 

    const totalEmi = homeLoanEmi + carLoanEmi + otherLoanEmi;
    const debtToIncome = monthlyIncome > 0 ? totalEmi / monthlyIncome : 0;
    const debtScore = Math.min(100, Math.max(0, 100 - Math.round(debtToIncome * 200))); 

    const healthInsScore = healthCover >= 500000 ? 50 : healthCover > 0 ? 25 : 0;
    const lifeInsScore = lifeCover >= (monthlyIncome * 12 * 10) ? 50 : lifeCover > 0 ? 25 : 0;
    const insuranceScore = healthInsScore + lifeInsScore;

    const investmentScore = totalInvestments > 0 ? 100 : 0;

    const healthScore = Math.round(
      (savingsScore * 0.3) +
      (emergencyScore * 0.2) +
      (debtScore * 0.2) +
      (insuranceScore * 0.15) +
      (investmentScore * 0.15)
    );

    const healthBreakdown = {
      savingsRate: Math.round(savingsRatio * 100),
      debtToIncome: Math.round(debtToIncome * 100),
      emergencyFund: Math.min(100, Math.round((emergencyMonths / 6) * 100)),
      investments: Math.min(100, Math.round((totalInvestments / (monthlyIncome * 12 || 1)) * 50)),
      insurance: insuranceScore,
      creditScore: userData.financialHealthBreakdown?.creditScore || 780,
      cashFlow: Math.round((1 - debtToIncome - savingsRatio) * 100)
    };

    // Update goals return metrics based on risk category
    const updatedGoals = (userData.goals || []).map(g => ({
      ...g,
      expectedReturn: riskCategory === "Aggressive" ? 14 : riskCategory === "Growth" ? 12.5 : riskCategory === "Balanced" ? 11 : 8
    }));

    // 4. Rebuild Final User Profile
    const updatedProfile: UserProfile = {
      ...userData,
      name,
      age,
      city,
      occupation,
      monthlyIncome,
      monthlyExpenses,
      netWorth: Math.max(10000, netWorth),
      cashBalance,
      riskCategory,
      financialHealthScore: Math.min(100, Math.max(35, healthScore)),
      financialHealthBreakdown: healthBreakdown,
      emergencyFundMonths: parseFloat(emergencyMonths.toFixed(1)),
      loans: {
        homeLoanBalance: homeLoan,
        homeLoanEmi,
        carLoanBalance: carLoan,
        carLoanEmi,
        otherLoanBalance: otherLoan,
        otherLoanEmi
      },
      portfolio,
      goals: updatedGoals,
      insurance: {
        healthCover: { type: healthCover > 0 ? "Health" : "None", provider: healthCover > 0 ? "Artha Allianz" : "", sumAssured: healthCover, premiumAmount: Math.round(healthCover * 0.015), premiumFrequency: "Annual", expiryDate: "2027-06-30" },
        lifeCover: { type: lifeCover > 0 ? "Term Life" : "None", provider: lifeCover > 0 ? "Max Life" : "", sumAssured: lifeCover, premiumAmount: Math.round(lifeCover * 0.0015), premiumFrequency: "Annual", expiryDate: "2027-06-30" },
        gapAnalysis: healthCover === 0 || lifeCover === 0 
          ? "⚠️ High vulnerability. You currently lack adequate insurance coverage, exposing your wealth to emergency medical shocks."
          : `✅ Good base setup. Health and life coverages provide sound initial shields for your age (${age}).`
      },
      financialTwin: {
        ...userData.financialTwin,
        predictedWealth5Yr: Math.round((cashBalance + totalInvestments + (5000 * 12 * 5)) * 1.3),
        predictedWealth10Yr: Math.round((cashBalance + totalInvestments + (5000 * 12 * 10)) * 2.1),
        simulationOutput: `Your digital twin is synchronized. With a savings rate of ${Math.round(savingsRatio * 100)}% and your asset allocation, your twin predicts sustainable capital growth.`,
      }
    };

    onUpdateProfile(updatedProfile);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white font-sans flex items-center gap-2">
            <User className="w-5 h-5 text-idbi-orange" />
            Financial Profile & Accounts
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Audit and adjust your primary personal, income, asset, liability, and shield fields
          </p>
        </div>
        {isDemoUser && (
          <span className="text-[10px] font-mono text-emerald-400 font-bold px-2 py-1 bg-emerald-950/40 border border-emerald-500/20 rounded-lg">
            Demo Mode (Read-Only)
          </span>
        )}
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <p>Financial balance sheet successfully updated and serialized to Artha AI vault!</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Demographics */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-800/50 pb-1.5">
            <User className="w-4 h-4 text-idbi-orange" /> Personal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Full Name</label>
              <input 
                type="text" 
                required
                disabled={isDemoUser}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-idbi-orange disabled:opacity-50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Age</label>
              <input 
                type="number" 
                required
                min={18}
                disabled={isDemoUser}
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 30)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-idbi-orange disabled:opacity-50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase">City</label>
              <input 
                type="text" 
                required
                disabled={isDemoUser}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-idbi-orange disabled:opacity-50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Occupation</label>
              <input 
                type="text" 
                required
                disabled={isDemoUser}
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-idbi-orange disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Cash Flows */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-800/50 pb-1.5">
            <DollarSign className="w-4 h-4 text-idbi-orange" /> Monthly Cashflows
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Monthly Income (₹)</label>
              <input 
                type="number" 
                required
                disabled={isDemoUser}
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-idbi-orange font-mono disabled:opacity-50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Monthly Essential & Discretionary Expenses (₹)</label>
              <input 
                type="number" 
                required
                disabled={isDemoUser}
                value={monthlyExpenses}
                onChange={(e) => setMonthlyExpenses(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-idbi-orange font-mono disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Assets & Liquid Funds */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-800/50 pb-1.5">
            <Wallet className="w-4 h-4 text-idbi-orange" /> Assets & Balances
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Liquid Cash Balance (₹)</label>
              <input 
                type="number" 
                required
                disabled={isDemoUser}
                value={cashBalance}
                onChange={(e) => setCashBalance(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-idbi-orange font-mono disabled:opacity-50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Mutual Funds (Equity) (₹)</label>
              <input 
                type="number" 
                required
                disabled={isDemoUser}
                value={mutualFunds}
                onChange={(e) => setMutualFunds(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-idbi-orange font-mono disabled:opacity-50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Fixed Deposits / Debt (₹)</label>
              <input 
                type="number" 
                required
                disabled={isDemoUser}
                value={fixedDeposits}
                onChange={(e) => setFixedDeposits(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-idbi-orange font-mono disabled:opacity-50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Direct Indian Stocks (₹)</label>
              <input 
                type="number" 
                required
                disabled={isDemoUser}
                value={stocks}
                onChange={(e) => setStocks(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-idbi-orange font-mono disabled:opacity-50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Digital Gold / Precious (₹)</label>
              <input 
                type="number" 
                required
                disabled={isDemoUser}
                value={gold}
                onChange={(e) => setGold(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-idbi-orange font-mono disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Liabilities */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-800/50 pb-1.5">
            <Scale className="w-4 h-4 text-idbi-orange" /> Active Debt Liabilities
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800/60">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-500 uppercase">Home Loan Bal</label>
                <input 
                  type="number" 
                  disabled={isDemoUser}
                  value={homeLoan}
                  onChange={(e) => setHomeLoan(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white font-mono outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-500 uppercase">Home Loan EMI</label>
                <input 
                  type="number" 
                  disabled={isDemoUser}
                  value={homeLoanEmi}
                  onChange={(e) => setHomeLoanEmi(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white font-mono outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800/60">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-500 uppercase">Car Loan Bal</label>
                <input 
                  type="number" 
                  disabled={isDemoUser}
                  value={carLoan}
                  onChange={(e) => setCarLoan(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white font-mono outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-500 uppercase">Car Loan EMI</label>
                <input 
                  type="number" 
                  disabled={isDemoUser}
                  value={carLoanEmi}
                  onChange={(e) => setCarLoanEmi(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white font-mono outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800/60">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-500 uppercase">Other Debt Bal</label>
                <input 
                  type="number" 
                  disabled={isDemoUser}
                  value={otherLoan}
                  onChange={(e) => setOtherLoan(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white font-mono outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-slate-500 uppercase">Other Debt EMI</label>
                <input 
                  type="number" 
                  disabled={isDemoUser}
                  value={otherLoanEmi}
                  onChange={(e) => setOtherLoanEmi(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-white font-mono outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Shields & Risk */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-800/50 pb-1.5">
            <Shield className="w-4 h-4 text-idbi-orange" /> Safety Shields & Risk Sentiment
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Health Insurance Sum Assured (₹)</label>
              <input 
                type="number" 
                required
                disabled={isDemoUser}
                value={healthCover}
                onChange={(e) => setHealthCover(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-idbi-orange font-mono disabled:opacity-50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Term Life Insurance Sum Assured (₹)</label>
              <input 
                type="number" 
                required
                disabled={isDemoUser}
                value={lifeCover}
                onChange={(e) => setLifeCover(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-idbi-orange font-mono disabled:opacity-50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono text-slate-500 uppercase">Risk Sentiment Category</label>
              <select 
                disabled={isDemoUser}
                value={riskCategory}
                onChange={(e) => setRiskCategory(e.target.value as RiskCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-idbi-orange disabled:opacity-50"
              >
                <option value="Conservative">Conservative</option>
                <option value="Balanced">Balanced</option>
                <option value="Growth">Growth</option>
                <option value="Aggressive">Aggressive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save button */}
        {!isDemoUser && (
          <div className="flex justify-end pt-4 border-t border-slate-800/60">
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-idbi-orange to-idbi-green text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer hover:opacity-95 shadow-lg shadow-idbi-orange/15"
            >
              <Save className="w-4 h-4" /> Save Ledger & Recalculate
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
