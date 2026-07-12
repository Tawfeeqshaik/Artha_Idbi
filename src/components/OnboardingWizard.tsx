/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  MapPin, 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  Shield, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  CheckCircle2, 
  HeartHandshake, 
  Info,
  Scale,
  Calendar,
  Wallet,
  AlertTriangle,
  Flame,
  ShieldCheck,
  Percent,
  Calculator
} from "lucide-react";
import { UserProfile, RiskCategory, AssetAllocation, FinancialGoal, InsurancePolicy } from "../types";

interface OnboardingWizardProps {
  userName: string;
  userEmail: string;
  onComplete: (completedProfile: UserProfile) => void;
}

export default function OnboardingWizard({ userName, userEmail, onComplete }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 6;

  // Form State
  const [name, setName] = useState(userName || "");
  const [age, setAge] = useState<number>(30);
  const [city, setCity] = useState("");
  const [occupation, setOccupation] = useState("");
  
  const [monthlyIncome, setMonthlyIncome] = useState<number>(100000);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(45000);

  // Asset allocations
  const [cashBalance, setCashBalance] = useState<number>(100000);
  const [mutualFunds, setMutualFunds] = useState<number>(0);
  const [fixedDeposits, setFixedDeposits] = useState<number>(0);
  const [stocks, setStocks] = useState<number>(0);
  const [gold, setGold] = useState<number>(0);

  // Liabilities / Loans
  const [homeLoan, setHomeLoan] = useState<number>(0);
  const [homeLoanEmi, setHomeLoanEmi] = useState<number>(0);
  const [carLoan, setCarLoan] = useState<number>(0);
  const [carLoanEmi, setCarLoanEmi] = useState<number>(0);
  const [otherLoan, setOtherLoan] = useState<number>(0);
  const [otherLoanEmi, setOtherLoanEmi] = useState<number>(0);

  // Insurance
  const [healthCover, setHealthCover] = useState<number>(0);
  const [lifeCover, setLifeCover] = useState<number>(0);

  // Risk profile
  const [riskCategory, setRiskCategory] = useState<RiskCategory>("Balanced");

  // Primary Goal
  const [goalName, setGoalName] = useState("Retirement Reserve");
  const [goalCategory, setGoalCategory] = useState<"House" | "Car" | "Education" | "Retirement" | "Wedding" | "Travel" | "Other">("Retirement");
  const [goalTarget, setGoalTarget] = useState<number>(10000000);
  const [goalYear, setGoalYear] = useState<number>(2045);
  const [goalSip, setGoalSip] = useState<number>(10000);

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Calculate Assets & Portfolio Array
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

    // Default if no portfolio entered
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
    // Savings efficiency (30% weight)
    const savingsRatio = monthlyIncome > 0 ? (monthlyIncome - monthlyExpenses) / monthlyIncome : 0;
    const savingsScore = Math.min(100, Math.max(0, Math.round(savingsRatio * 150))); // 40%+ savings rate gets full marks

    // Emergency fund ratio (20% weight)
    const monthlyOutflows = monthlyExpenses + homeLoanEmi + carLoanEmi + otherLoanEmi;
    const emergencyMonths = monthlyOutflows > 0 ? cashBalance / monthlyOutflows : 6;
    const emergencyScore = Math.min(100, Math.round((emergencyMonths / 6) * 100)); // 6 months gets 100

    // Debt profile (20% weight)
    const totalEmi = homeLoanEmi + carLoanEmi + otherLoanEmi;
    const debtToIncome = monthlyIncome > 0 ? totalEmi / monthlyIncome : 0;
    const debtScore = Math.min(100, Math.max(0, 100 - Math.round(debtToIncome * 200))); // emi < 50% gets weighted marks

    // Insurance status (15% weight)
    const healthInsScore = healthCover >= 500000 ? 50 : healthCover > 0 ? 25 : 0;
    const lifeInsScore = lifeCover >= (monthlyIncome * 12 * 10) ? 50 : lifeCover > 0 ? 25 : 0;
    const insuranceScore = healthInsScore + lifeInsScore;

    // Investment maturity (15% weight)
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
      investments: Math.min(100, Math.round((totalInvestments / (monthlyIncome * 12 || 1)) * 50)), // 2 yrs salary invested = 100
      insurance: insuranceScore,
      creditScore: 780,
      cashFlow: Math.round((1 - debtToIncome - savingsRatio) * 100)
    };

    // 4. Goals Creation
    const goals: FinancialGoal[] = [
      {
        id: "goal_primary",
        name: goalName,
        category: goalCategory,
        targetAmount: goalTarget,
        accumulatedAmount: mutualFunds + fixedDeposits, // Start with some initial accumulation from investments
        targetDate: `${goalYear}-12-31`,
        monthlySip: goalSip,
        expectedReturn: riskCategory === "Aggressive" ? 14 : riskCategory === "Growth" ? 12.5 : riskCategory === "Balanced" ? 11 : 8,
        successProbability: 75,
        aiRecommendation: `Maintain your current ₹${goalSip.toLocaleString("en-IN")} SIP. Reallocating part of Fixed Deposits into Balanced funds could boost success probability to 90%.`
      }
    ];

    // 5. Build Final User Profile
    const completedProfile: UserProfile = {
      uid: "", // Will be assigned by parent or dbService
      email: userEmail,
      name,
      age,
      city,
      occupation,
      monthlyIncome,
      monthlyExpenses,
      netWorth: Math.max(10000, netWorth),
      cashBalance,
      creditScore: 780,
      riskCategory,
      financialHealthScore: Math.min(100, Math.max(35, healthScore)),
      financialHealthBreakdown: healthBreakdown,
      emergencyFundMonths: parseFloat(emergencyMonths.toFixed(1)),
      onboarded: true,
      familyMembers: [],
      loans: {
        homeLoanBalance: homeLoan,
        homeLoanEmi,
        carLoanBalance: carLoan,
        carLoanEmi,
        otherLoanBalance: otherLoan,
        otherLoanEmi
      },
      portfolio,
      goals,
      insurance: {
        healthCover: { type: healthCover > 0 ? "Health" : "None", provider: healthCover > 0 ? "Artha Allianz" : "", sumAssured: healthCover, premiumAmount: Math.round(healthCover * 0.015), premiumFrequency: "Annual", expiryDate: "2027-06-30" },
        lifeCover: { type: lifeCover > 0 ? "Term Life" : "None", provider: lifeCover > 0 ? "Max Life" : "", sumAssured: lifeCover, premiumAmount: Math.round(lifeCover * 0.0015), premiumFrequency: "Annual", expiryDate: "2027-06-30" },
        gapAnalysis: healthCover === 0 || lifeCover === 0 
          ? "⚠️ High vulnerability. You currently lack adequate insurance coverage, exposing your wealth to emergency medical shocks."
          : `✅ Good base setup. Health and life coverages provide sound initial shields for your age (${age}).`
      },
      financialTwin: {
        predictedWealth5Yr: Math.round((cashBalance + totalInvestments + (goalSip * 12 * 5)) * 1.3),
        predictedWealth10Yr: Math.round((cashBalance + totalInvestments + (goalSip * 12 * 10)) * 2.1),
        simulationOutput: `Excellent work! Your digital twin is initialized. With a savings rate of ${Math.round(savingsRatio * 100)}% and ₹${goalSip.toLocaleString()}/mo SIP, you are compounding on track.`,
        historicalGraph: [
          { year: 2026, balance: Math.round(netWorth) }
        ]
      },
      transactions: [
        {
          id: "tx-init-bal",
          date: new Date().toISOString(),
          description: "Onboarding Balance Synchronization",
          category: "Investments",
          amount: cashBalance,
          type: "credit",
          merchant: "Self Deposit Sync"
        }
      ],
      notifications: [
        { id: "n-onb-1", type: "success", text: "Onboarding completed successfully! Your wealth co-pilot is fully active.", time: "Just now" }
      ]
    };

    onComplete(completedProfile);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background radial blurs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-idbi-orange/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/10 blur-[100px] pointer-events-none" />

      <div className="max-w-xl w-full bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl relative shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-idbi-orange to-idbi-green p-2 text-white flex items-center justify-center font-black">
              Ar
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight uppercase">Artha Personal Onboarding</h2>
              <span className="text-[10px] text-slate-500 font-mono">STEP {step} OF {totalSteps}</span>
            </div>
          </div>
          <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-idbi-orange to-idbi-green transition-all duration-300" 
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={step === totalSteps ? handleSubmit : (e) => e.preventDefault()} className="space-y-6">
          <AnimatePresence mode="wait">
            {/* STEP 1: WELCOME & BASICS */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-idbi-orange" />
                    Welcome to Your Wealth Co-Pilot!
                  </h3>
                  <p className="text-xs text-slate-400">
                    Let's personalize your AI engine. Tell us a bit about who you are.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-idbi-orange" /> Full Name
                    </label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Rahul Sharma"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-idbi-orange focus:ring-1 focus:ring-idbi-orange/20 rounded-xl py-3 px-4 text-xs outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-400">Age</label>
                      <input 
                        type="number" 
                        required
                        min={18}
                        max={100}
                        value={age}
                        onChange={(e) => setAge(parseInt(e.target.value) || 30)}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-idbi-orange focus:ring-1 focus:ring-idbi-orange/20 rounded-xl py-3 px-4 text-xs outline-none transition"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> City
                      </label>
                      <input 
                        type="text" 
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Mumbai"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-idbi-orange focus:ring-1 focus:ring-idbi-orange/20 rounded-xl py-3 px-4 text-xs outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" /> Occupation / Industry
                    </label>
                    <input 
                      type="text" 
                      required
                      value={occupation}
                      onChange={(e) => setOccupation(e.target.value)}
                      placeholder="Software Engineer"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-idbi-orange focus:ring-1 focus:ring-idbi-orange/20 rounded-xl py-3 px-4 text-xs outline-none transition"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: MONTHLY INCOME & EXPENSES */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-idbi-orange" />
                    Monthly Cash Outflows & Inflows
                  </h3>
                  <p className="text-xs text-slate-400">
                    We use these values to construct your savings rate and measure stress limits.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400">Monthly Net Salary / Income (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500 font-bold">₹</span>
                      <input 
                        type="number" 
                        required
                        min={0}
                        value={monthlyIncome}
                        onChange={(e) => setMonthlyIncome(parseFloat(e.target.value) || 0)}
                        placeholder="1,00,000"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-idbi-orange focus:ring-1 focus:ring-idbi-orange/20 rounded-xl py-3 pl-8 pr-4 text-xs outline-none font-mono transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400">Monthly Essential & Discretionary Expenses (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500 font-bold">₹</span>
                      <input 
                        type="number" 
                        required
                        min={0}
                        value={monthlyExpenses}
                        onChange={(e) => setMonthlyExpenses(parseFloat(e.target.value) || 0)}
                        placeholder="45,000"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-idbi-orange focus:ring-1 focus:ring-idbi-orange/20 rounded-xl py-3 pl-8 pr-4 text-xs outline-none font-mono transition"
                      />
                    </div>
                  </div>

                  {monthlyIncome > 0 && monthlyExpenses > monthlyIncome && (
                    <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/15 border border-rose-500/20 text-rose-300 text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>Warning: Expenses exceed your income. This can negatively affect your financial health score.</p>
                    </div>
                  )}

                  {monthlyIncome > 0 && monthlyExpenses <= monthlyIncome && (
                    <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-400">Calculated Savings Margin:</span>
                      <span className="text-emerald-400 font-bold">
                        ₹{(monthlyIncome - monthlyExpenses).toLocaleString()} /mo ({Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100)}%)
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 3: ASSETS & PORTFOLIO */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4 animate-fadeIn"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-idbi-orange" />
                    Your Existing Net Assets
                  </h3>
                  <p className="text-xs text-slate-400">
                    Input your liquid savings and current investment categories (Enter 0 if none).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                      Liquid Savings / Cash Balance (₹) <Info className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-help" title="Money readily accessible in savings/current accounts" />
                    </label>
                    <input 
                      type="number" 
                      min={0}
                      value={cashBalance}
                      onChange={(e) => setCashBalance(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-idbi-orange rounded-xl py-3 px-4 text-xs outline-none font-mono transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400">Mutual Funds (₹)</label>
                    <input 
                      type="number" 
                      min={0}
                      value={mutualFunds}
                      onChange={(e) => setMutualFunds(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-idbi-orange rounded-xl py-2 px-3 text-xs outline-none font-mono transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400">Fixed Deposits / Debt (₹)</label>
                    <input 
                      type="number" 
                      min={0}
                      value={fixedDeposits}
                      onChange={(e) => setFixedDeposits(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-idbi-orange rounded-xl py-2 px-3 text-xs outline-none font-mono transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400">Direct Stocks (₹)</label>
                    <input 
                      type="number" 
                      min={0}
                      value={stocks}
                      onChange={(e) => setStocks(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-idbi-orange rounded-xl py-2 px-3 text-xs outline-none font-mono transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400">Physical / Digital Gold (₹)</label>
                    <input 
                      type="number" 
                      min={0}
                      value={gold}
                      onChange={(e) => setGold(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 focus:border-idbi-orange rounded-xl py-2 px-3 text-xs outline-none font-mono transition"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: LIABILITIES & LOANS */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Scale className="w-5 h-5 text-idbi-orange" />
                    Active Liabilities & Loan EMIs
                  </h3>
                  <p className="text-xs text-slate-400">
                    Specify outstanding principal balances and their respective monthly payment obligations (EMIs).
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4 bg-slate-950/20 border border-slate-800/60 p-4 rounded-xl">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-400">Home Loan Balance (₹)</label>
                      <input 
                        type="number" 
                        min={0}
                        value={homeLoan}
                        onChange={(e) => setHomeLoan(parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs outline-none font-mono transition"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-400">Home Loan EMI (₹)</label>
                      <input 
                        type="number" 
                        min={0}
                        value={homeLoanEmi}
                        onChange={(e) => setHomeLoanEmi(parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs outline-none font-mono transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-slate-950/20 border border-slate-800/60 p-4 rounded-xl">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-400">Car Loan Balance (₹)</label>
                      <input 
                        type="number" 
                        min={0}
                        value={carLoan}
                        onChange={(e) => setCarLoan(parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs outline-none font-mono transition"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-400">Car Loan EMI (₹)</label>
                      <input 
                        type="number" 
                        min={0}
                        value={carLoanEmi}
                        onChange={(e) => setCarLoanEmi(parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs outline-none font-mono transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-slate-950/20 border border-slate-800/60 p-4 rounded-xl">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-400">Other Debts Balance (₹)</label>
                      <input 
                        type="number" 
                        min={0}
                        value={otherLoan}
                        onChange={(e) => setOtherLoan(parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs outline-none font-mono transition"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono text-slate-400">Other Debts EMI (₹)</label>
                      <input 
                        type="number" 
                        min={0}
                        value={otherLoanEmi}
                        onChange={(e) => setOtherLoanEmi(parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 px-3 text-xs outline-none font-mono transition"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5: INSURANCE SHIELDS */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-idbi-orange" />
                    Your Insurance Coverage Shields
                  </h3>
                  <p className="text-xs text-slate-400">
                    We evaluate your coverage shortfall to protect you from liquidation risk.
                  </p>
                </div>

                <div className="space-y-5 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400">Health Insurance Sum Assured (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500 font-bold">₹</span>
                      <input 
                        type="number" 
                        min={0}
                        value={healthCover}
                        onChange={(e) => setHealthCover(parseFloat(e.target.value) || 0)}
                        placeholder="5,00,000"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-idbi-orange rounded-xl py-3 pl-8 pr-4 text-xs outline-none font-mono transition"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Recommended minimum: ₹5,00,000 to defend against hospitalizations.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400">Term Life Insurance Cover Sum (₹)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500 font-bold">₹</span>
                      <input 
                        type="number" 
                        min={0}
                        value={lifeCover}
                        onChange={(e) => setLifeCover(parseFloat(e.target.value) || 0)}
                        placeholder="1,00,000"
                        className="w-full bg-slate-950 border border-slate-800 focus:border-idbi-orange rounded-xl py-3 pl-8 pr-4 text-xs outline-none font-mono transition"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">Recommended minimum: 10x of your annual income (₹{(monthlyIncome * 12 * 10).toLocaleString()}).</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 6: RISK APPETITE & FINANCIAL GOAL */}
            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Flame className="w-5 h-5 text-idbi-orange" />
                    Risk Appetite & Wealth Target
                  </h3>
                  <p className="text-xs text-slate-400">
                    Choose your investment risk tolerances and set your main life financial target.
                  </p>
                </div>

                <div className="space-y-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400">Risk Profile Sentiment</label>
                    <div className="grid grid-cols-4 gap-2">
                      {(["Conservative", "Balanced", "Growth", "Aggressive"] as RiskCategory[]).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRiskCategory(r)}
                          className={`py-2 text-[11px] font-bold rounded-lg border transition cursor-pointer text-center ${
                            riskCategory === r
                              ? "bg-idbi-orange border-idbi-orange text-white shadow-md shadow-idbi-orange/15"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-950/30 border border-slate-800/80 p-4 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1">
                      <Calculator className="w-4 h-4 text-idbi-green" /> Primary Goal Setup
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-500">Goal Target Name</label>
                        <input 
                          type="text" 
                          required
                          value={goalName}
                          onChange={(e) => setGoalName(e.target.value)}
                          placeholder="Retirement Fund"
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-500">Category</label>
                        <select 
                          value={goalCategory}
                          onChange={(e) => setGoalCategory(e.target.value as any)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs outline-none"
                        >
                          <option value="House">House</option>
                          <option value="Car">Car</option>
                          <option value="Education">Education</option>
                          <option value="Retirement">Retirement</option>
                          <option value="Wedding">Wedding</option>
                          <option value="Travel">Travel</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-500">Target Amount (₹)</label>
                        <input 
                          type="number" 
                          required
                          min={0}
                          value={goalTarget}
                          onChange={(e) => setGoalTarget(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-500">Target Year</label>
                        <input 
                          type="number" 
                          required
                          min={2026}
                          max={2100}
                          value={goalYear}
                          onChange={(e) => setGoalYear(parseInt(e.target.value) || 2045)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono text-slate-500">Monthly SIP (₹)</label>
                        <input 
                          type="number" 
                          required
                          min={0}
                          value={goalSip}
                          onChange={(e) => setGoalSip(parseFloat(e.target.value) || 0)}
                          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controls Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/60 mt-6">
            <button
              type="button"
              disabled={step === 1}
              onClick={handleBack}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white transition cursor-pointer disabled:opacity-30"
            >
              <span className="flex items-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </span>
            </button>

            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-idbi-orange hover:bg-idbi-orange/90 text-white flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-idbi-orange/10"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-idbi-orange to-idbi-green hover:opacity-95 text-white flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-idbi-orange/15 animate-pulse"
              >
                <CheckCircle2 className="w-4 h-4 text-white" /> Complete Setup
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
