/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Wallet,
  Goal,
  Scale,
  ShieldAlert,
  Calendar,
  ShieldCheck,
  Check,
  Globe,
  User,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  Info,
  Lock,
  Building,
  ChevronRight,
  ShieldX,
  FileText,
  BadgeAlert,
  CheckCircle2,
  PhoneCall,
  Calculator
} from "lucide-react";

import { MOCK_USER, MOCK_TRANSACTIONS, I18N_TRANSLATIONS } from "./data";
import { UserProfile, RiskProfile, AppLanguage, FinancialGoal } from "./types";

// Import modular components
import MetricRing from "./components/MetricRing";
import ExplainModal from "./components/ExplainModal";
import QuizSection from "./components/QuizSection";
import ChatPanel from "./components/ChatPanel";
import StressTestPanel from "./components/StressTestPanel";
import GoalPlannerPanel from "./components/GoalPlannerPanel";
import RebalancePanel from "./components/RebalancePanel";
import WeeklyReportPanel from "./components/WeeklyReportPanel";
import SpendingAnalysisPanel from "./components/SpendingAnalysisPanel";
import TaxPlannerPanel from "./components/TaxPlannerPanel";

import AuthScreen from "./components/AuthScreen";
import OnboardingWizard from "./components/OnboardingWizard";
import ProfilePanel from "./components/ProfilePanel";
import AIAvatar from "./components/AIAvatar";
import DigitalTwinPanel from "./components/DigitalTwinPanel";
import FamilyWealthPanel from "./components/FamilyWealthPanel";
import RelationshipManagerPanel from "./components/RelationshipManagerPanel";
import { dbService } from "./lib/firebase";

export default function App() {
  const [language, setLanguage] = useState<AppLanguage>("en");
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [userData, setUserData] = useState<UserProfile>(MOCK_USER);
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);
  const [activeView, setActiveView] = useState<
    "dashboard" | "spending" | "advisor" | "portfolio" | "goals" | "quiz" | "stresstest" | "report" | "tax" | "twin" | "family" | "rm"
  >("dashboard");

  // Explain modal states
  const [explainOpen, setExplainOpen] = useState(false);
  const [explainRec, setExplainRec] = useState("");
  const [explainContext, setExplainContext] = useState("");

  // Subscribe to Authentication state on load
  React.useEffect(() => {
    const unsubscribe = dbService.onAuthStateChanged((activeUser) => {
      if (activeUser) {
        setUser(activeUser);
        setUserData(activeUser.profile);
        setTransactions(activeUser.profile.transactions || []);
      } else {
        setUser(null);
        setUserData({} as UserProfile);
        setTransactions([]);
      }
      setLoadingAuth(false);
    });
    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  const t = I18N_TRANSLATIONS[language];

  // Trigger Explain Modal
  const triggerExplain = (recommendation: string, context: string) => {
    setExplainRec(recommendation);
    setExplainContext(context);
    setExplainOpen(true);
  };

  const handleUpdateProfile = async (updated: UserProfile) => {
    if (!user) return;
    await dbService.saveUserProfile(user.uid, updated);
    setUserData(updated);
    if (updated.transactions) {
      setTransactions(updated.transactions);
    }
  };

  // Callback from Risk Quiz completion
  const handleQuizComplete = (profile: RiskProfile) => {
    setUserData((prev) => ({
      ...prev,
      riskCategory: profile.category,
      portfolio: profile.suggestedAllocation,
    }));
    // Bump health score slightly when completing risk profiling
    setUserData((prev) => ({
      ...prev,
      financialHealthScore: Math.min(100, prev.financialHealthScore + 3),
    }));
    setActiveView("portfolio");
  };

  // Callback when user creates a financial goal
  const handleAddGoal = async (newGoal: FinancialGoal) => {
    const updated = {
      ...userData,
      goals: [newGoal, ...(userData.goals || [])],
      financialHealthScore: Math.min(100, (userData.financialHealthScore || 70) + 2),
    } as UserProfile;
    await handleUpdateProfile(updated);
  };

  const handleDeleteGoal = async (goalId: string) => {
    const updated = {
      ...userData,
      goals: (userData.goals || []).filter((g) => g.id !== goalId),
    } as UserProfile;
    await handleUpdateProfile(updated);
  };

  // List of active insight chips
  const quickInsights = [
    {
      id: "ins-gap",
      text: "⚠️ Critical Life Insurance Gap: ₹1.3 Cr uncovered",
      context: "Insurance Deficit",
      rec: userData?.insurance?.gapAnalysis || "Please complete onboarding to check insurance analysis.",
    },
    {
      id: "ins-em",
      text: "⚠️ Emergency buffer is underfunded: only 2.8 months covered",
      context: "Emergency Buffer Gap",
      rec: "Your liquid cash stands at ₹2,40,000, representing 2.8 months of expenditures. Recommended standard is 6 months (₹5,10,000) to secure your family against interest shocks.",
    },
    {
      id: "ins-food",
      text: "📈 Spending anomaly: Food bill surged by 32% this month",
      context: "Discretionary Anomaly",
      rec: "Your Food category totals ₹24,420 this month vs ₹18,500 3-month average (+32%), driven by ₹4,890 Swiggy Gourmet and ₹9,500 bulk DMart grocery runs.",
    },
    {
      id: "ins-compound",
      text: "🎉 Compounding Alert: Retirement Goal is 92% on track",
      context: "Retirement Compounding success",
      rec: "Your ₹15,000 monthly SIP compounding at 12.5% for 23.5 years has an extremely high 92% probability of successfully hitting your target of ₹3 Crore.",
    }
  ];

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-slate-100 font-sans">
        <div className="relative mb-5">
          <div className="absolute inset-0 bg-idbi-orange/20 rounded-full blur-xl animate-pulse" />
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-idbi-orange to-idbi-green p-0.5 flex items-center justify-center relative">
            <div className="bg-slate-950 h-full w-full rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-idbi-orange animate-spin" />
            </div>
          </div>
        </div>
        <p className="text-sm font-bold tracking-widest text-slate-300 font-mono animate-pulse uppercase">
          Securing Encrypted Gateway...
        </p>
        <p className="text-[10px] text-slate-500 font-mono mt-1">
          Decrypting secure biometric credentials
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthScreen 
        onAuthSuccess={(u) => {
          setUser(u);
          setUserData(u.profile);
          setTransactions(u.profile.transactions || []);
        }} 
      />
    );
  }

  const isDemoUser = user && (user.uid?.startsWith("demo") || userData?.uid?.startsWith("demo"));
  const needsOnboarding = user && !isDemoUser && !userData?.onboarded;

  if (needsOnboarding) {
    return (
      <OnboardingWizard
        userName={userData?.name || user?.displayName || user?.email?.split("@")[0] || "Client"}
        userEmail={userData?.email || user?.email || ""}
        onComplete={async (completedProfile) => {
          const updatedProfile = {
            ...completedProfile,
            uid: user.uid,
            email: user.email || completedProfile.email
          };
          await dbService.saveUserProfile(user.uid, updatedProfile);
          setUserData(updatedProfile);
          setTransactions(updatedProfile.transactions || []);
        }}
      />
    );
  }

  const totalInvestments = (userData?.portfolio || [])
    .filter((p) => {
      const cat = p.category.toLowerCase();
      return !cat.includes("cash") && !cat.includes("reserve") && !cat.includes("liquid");
    })
    .reduce((sum, p) => sum + p.value, 0);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 selection:bg-idbi-orange/30 font-sans relative overflow-x-hidden">
      {/* Abstract Glowing Aura effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-idbi-orange/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-indigo-950/15 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#020617]/70 backdrop-blur-md px-4 lg:px-12 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-idbi-orange to-idbi-green p-2 text-white flex items-center justify-center font-black tracking-tighter shadow-md shadow-idbi-orange/20">
            Ar
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-tight leading-none uppercase">
              {t.appName}
            </h1>
            <span className="text-[10px] text-slate-400 font-mono tracking-wide mt-1 block max-sm:hidden">
              {t.tagline}
            </span>
          </div>
        </div>

        {/* Action controls / Language and Profile */}
        <div className="flex items-center gap-3.5">
          {/* Language selector dropdown */}
          <div className="flex items-center gap-1 bg-slate-950/40 rounded-xl px-2.5 py-1.5 border border-slate-800 shrink-0">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as AppLanguage)}
              className="bg-transparent text-xs text-slate-300 font-mono font-bold focus:outline-none cursor-pointer"
            >
              <option value="en">{t.english}</option>
              <option value="hi">{t.hindi}</option>
              <option value="ta">{t.tamil}</option>
            </select>
          </div>

          {/* User badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 max-sm:hidden">
              <div className="h-8 w-8 rounded-full border border-idbi-orange/20 bg-idbi-orange/10 flex items-center justify-center text-idbi-orange">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-white block">{userData.name || user.email}</span>
                <span className="text-[9px] text-slate-500 font-mono uppercase block">Preferred Wealth Client</span>
              </div>
            </div>
            
            <button
              onClick={async () => {
                await dbService.signOut();
                setUser(null);
                setUserData({} as UserProfile);
                setTransactions([]);
                setActiveView("dashboard");
              }}
              className="text-[10px] font-mono font-bold border border-slate-800 bg-slate-950/40 hover:bg-rose-950/30 hover:border-rose-900 px-3 py-1.5 rounded-xl cursor-pointer text-slate-400 hover:text-rose-400 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-12 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
        
        {/* LANDING GREETING HERO & AVATAR PANELS (Colspan 12) */}
        <section className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* 1. Interactive AI Voice Avatar Greeting Panel */}
          <AIAvatar 
            userData={userData} 
            language={language} 
            onVoiceInput={(text) => {
              const lower = text.toLowerCase();
              if (lower.includes("twin") || lower.includes("simulation") || lower.includes("project")) {
                setActiveView("twin");
              } else if (lower.includes("family") || lower.includes("sync")) {
                setActiveView("family");
              } else if (lower.includes("rm") || lower.includes("relationship") || lower.includes("manager")) {
                setActiveView("rm");
              } else if (lower.includes("tax") || lower.includes("80c") || lower.includes("saving")) {
                setActiveView("tax");
              } else if (lower.includes("stresstest") || lower.includes("stress")) {
                setActiveView("stresstest");
              } else if (lower.includes("report") || lower.includes("weekly")) {
                setActiveView("report");
              } else if (lower.includes("spending") || lower.includes("expense") || lower.includes("transaction")) {
                setActiveView("spending");
              } else if (lower.includes("portfolio") || lower.includes("rebalance") || lower.includes("asset")) {
                setActiveView("portfolio");
              } else if (lower.includes("goal") || lower.includes("planner")) {
                setActiveView("goals");
              } else if (lower.includes("quiz") || lower.includes("risk")) {
                setActiveView("quiz");
              } else if (lower.includes("dashboard") || lower.includes("home") || lower.includes("main")) {
                setActiveView("dashboard");
              }
            }} 
          />

          {/* 2. Net Worth & Balance Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-xl flex flex-col justify-between h-[210px]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{t.netWorth} Overview</span>
              <Building className="w-4 h-4 text-slate-400" />
            </div>
            
            <div className="my-1">
              <span className="text-3xl font-black text-white tracking-tight font-mono">
                ₹{userData.netWorth.toLocaleString("en-IN")}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold font-mono block mt-1 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +14.8% growth vs last fiscal
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3.5 border-t border-slate-800/60 pt-3.5">
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Artha Savings Balance</span>
                <span className="text-sm font-bold text-slate-200 font-mono">₹{userData.cashBalance.toLocaleString("en-IN")}</span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">Total Investments</span>
                <span className="text-sm font-bold text-idbi-orange font-mono">₹{totalInvestments.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* 3. Financial Health Score Ring */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 backdrop-blur-xl flex items-center justify-between gap-4 h-[210px]">
            <div className="flex flex-col justify-between h-full py-0.5 flex-1 min-w-0">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">{t.financialHealth}</span>
              
              <div>
                <h3 className="text-base font-bold text-white tracking-tight font-sans">Balanced Health</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-1 line-clamp-3">
                  Your Credit Score (785) & Savings Rate (43%) are top-tier. However, insurance coverage and liquid cash buffers are active vulnerabilities.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setActiveView("report")}
                  className="text-[10px] text-idbi-orange font-semibold font-mono hover:text-idbi-orange/80 flex items-center gap-1 transition shrink-0"
                >
                  <FileText className="w-3.5 h-3.5" /> View Report
                </button>
              </div>
            </div>

            <div className="shrink-0 flex items-center justify-center">
              <MetricRing score={userData.financialHealthScore} size={110} strokeWidth={8} />
            </div>
          </div>

        </section>

        {/* INTERACTIVE INSIGHT CHIPS ROW (Colspan 12) */}
        <section className="col-span-12">
          <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">
            <Sparkles className="w-3.5 h-3.5 text-idbi-orange" /> Insights:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {quickInsights.map((insight) => (
              <button
                key={insight.id}
                onClick={() => triggerExplain(insight.rec, insight.context)}
                className="text-left rounded-xl border border-slate-800/80 bg-slate-900/20 px-3.5 py-2.5 text-[11px] text-slate-300 hover:border-slate-700 hover:bg-slate-800/30 transition flex items-center justify-between gap-2.5 cursor-pointer"
                id={insight.id}
              >
                <span className="truncate">{insight.text}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              </button>
            ))}
          </div>
        </section>

        {/* SIDE NAVIGATION COLUMN (Colspan 3) */}
        <nav className="col-span-12 lg:col-span-3 flex flex-col gap-1.5" id="navigation-column">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest px-3 mb-1">
            Wealth Operations Menu
          </span>
          {[
            { id: "dashboard", label: t.dashboard, icon: Wallet },
            { id: "spending", label: t.spending, icon: CreditCard },
            { id: "advisor", label: t.talkToAdvisor, icon: Sparkles },
            { id: "portfolio", label: `${t.portfolio} Rebalance`, icon: Scale },
            { id: "goals", label: t.goals, icon: Goal },
            { id: "stresstest", label: t.stressTest, icon: ShieldAlert },
            { id: "quiz", label: t.riskProfile, icon: ShieldCheck },
            { id: "tax", label: t.taxPlanner || "Tax Planner (80C)", icon: Calculator },
            { id: "report", label: t.weeklyReport, icon: Calendar },
            { id: "twin", label: "Financial Digital Twin", icon: TrendingUp },
            { id: "family", label: "Family Synchronizer", icon: Globe },
            { id: "rm", label: "Artha RM Command", icon: Building },
            { id: "profile", label: "Profile & Accounts", icon: User },
          ].map((navItem) => {
            const Icon = navItem.icon;
            const isActive = activeView === navItem.id;
            return (
              <button
                key={navItem.id}
                onClick={() => setActiveView(navItem.id as any)}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-xs font-semibold tracking-wide transition duration-200 cursor-pointer ${
                  isActive
                    ? "bg-idbi-orange text-white shadow-lg shadow-idbi-orange/10"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/40"
                }`}
                id={`nav-${navItem.id}`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{navItem.label}</span>
                </div>
                {isActive && <div className="h-1.5 w-1.5 rounded-full bg-white shrink-0" />}
              </button>
            );
          })}
        </nav>

        {/* DYNAMIC VIEW CONTENT COLUMN (Colspan 9) */}
        <section className="col-span-12 lg:col-span-9" id="dynamic-content-area">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              
              {/* VIEW 1: DASHBOARD VIEW */}
              {activeView === "dashboard" && (
                <div className="space-y-6">
                  {/* Health Breakdown radar representation bars */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-5">
                    <div>
                      <h3 className="text-lg font-bold text-white font-sans">Financial Health Factor Breakdown</h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">Parameters rated on 0-100 scaling metrics</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(() => {
                        const breakdown = userData.financialHealthBreakdown || {
                          savingsRate: 43,
                          debtToIncome: 11,
                          emergencyFund: 46,
                          investments: 85,
                          insurance: 35,
                          creditScore: 88,
                          cashFlow: 90
                        };
                        return [
                          { label: "Savings Efficiency rate", score: breakdown.savingsRate, detail: `${breakdown.savingsRate}% is highly efficient` },
                          { label: "Debt-to-Income obligations", score: 100 - breakdown.debtToIncome, detail: `debt obligations are manageable` },
                          { label: "Emergency Cache protection", score: breakdown.emergencyFund, detail: `emergency cache covered` },
                          { label: "Investment Compounding rating", score: breakdown.investments, detail: `corpus compounding nicely` },
                          { label: "Insurance protection gap", score: breakdown.insurance, detail: `insurance coverage level` },
                          { label: "Credit Bureau registry", score: breakdown.creditScore, detail: `credit profile rating` },
                        ];
                      })().map((item, idx) => (
                        <div key={idx} className="rounded-xl bg-slate-950/20 border border-slate-800/60 p-3.5 space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-300 font-sans">{item.label}</span>
                            <span className="font-mono font-extrabold text-white">{item.score}/100</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-idbi-green rounded-full"
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono block">{item.detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Core Dashboard Indicators */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Life Insurance cover deficit visual card */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl flex flex-col justify-between h-[210px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{t.insuranceGap}</span>
                        <ShieldX className="w-5 h-5 text-rose-400 animate-pulse" />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Current Cover Assured:</span>
                          <span className="text-rose-400 font-bold font-mono">₹50,00,000</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Recommended Cover Target:</span>
                          <span className="text-emerald-400 font-bold font-mono">₹1,80,00,000</span>
                        </div>
                        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden relative mt-1 flex">
                          <div className="h-full bg-rose-500" style={{ width: "28%" }} />
                          <div className="h-full bg-transparent flex-1" />
                        </div>
                        <span className="text-[10px] text-rose-400 font-mono block mt-1">
                          ⚠️ Shortfall gap of ₹1.3 Crore ( {userData?.name ? userData.name.split(" ")[0] : "Client"} is 72% underinsured )
                        </span>
                      </div>

                      <button
                        onClick={() => triggerExplain(userData?.insurance?.gapAnalysis || "No analysis available.", "Insurance Gap Analysis")}
                        className="rounded-xl border border-slate-800 hover:bg-slate-800/40 py-2 text-xs font-semibold text-slate-300 transition text-center cursor-pointer"
                      >
                        Deconstruct Cover Gap & Recommendations
                      </button>
                    </div>

                    {/* Upcoming Bills and active mandates */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl flex flex-col justify-between h-[210px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{t.upcomingSips}</span>
                        <Calendar className="w-4.5 h-4.5 text-slate-400" />
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between rounded-lg bg-slate-950/20 border border-slate-800/40 p-2 text-xs">
                          <div className="flex items-center gap-2">
                            <Building className="w-3.5 h-3.5 text-idbi-orange" />
                            <span className="text-slate-300 font-sans">HDFC Home Loan EMI</span>
                          </div>
                          <span className="font-mono font-bold text-white">₹17,000</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg bg-slate-950/20 border border-slate-800/40 p-2 text-xs">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-idbi-green animate-spin-slow" />
                            <span className="text-slate-300 font-sans">Artha Equity MF SIP</span>
                          </div>
                          <span className="font-mono font-bold text-white">₹25,000</span>
                        </div>
                      </div>

                      <button
                        onClick={() => triggerExplain("Automated monthly payouts ensure zero loan EMI default rates. Your HDFC home EMI constitutes 11% of monthly income.", "Mandates overview")}
                        className="rounded-xl border border-slate-800 hover:bg-slate-800/40 py-2 text-xs font-semibold text-slate-300 transition text-center cursor-pointer"
                      >
                        Manage Autopay Mandates
                      </button>
                    </div>
                  </div>

                  {/* Quick transactions list slice */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-white font-sans">{t.recentTransactions}</h3>
                      <button
                        onClick={() => setActiveView("spending")}
                        className="text-xs text-idbi-orange hover:text-idbi-orange/80 font-mono"
                      >
                        Explore audit ledger
                      </button>
                    </div>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {(transactions || []).slice(0, 3).map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-3.5 bg-slate-950/15 rounded-xl border border-slate-800/60 text-xs">
                          <div>
                            <span className="font-bold text-slate-200 block">{tx.description}</span>
                            <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">{tx.category} • {new Date(tx.date).toLocaleDateString()}</span>
                          </div>
                          <span className="font-mono font-bold text-white">₹{tx.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 2: SPEND VIEW */}
              {activeView === "spending" && (
                <SpendingAnalysisPanel
                  transactions={transactions}
                  language={language}
                  onExplainSuggestion={triggerExplain}
                  onUpdateTransactions={(updated) => {
                    const updatedProfile = {
                      ...userData,
                      transactions: updated
                    } as UserProfile;
                    handleUpdateProfile(updatedProfile);
                  }}
                  isDemoUser={isDemoUser}
                />
              )}

              {/* VIEW 3: CHAT VIEW */}
              {activeView === "advisor" && (
                <ChatPanel userData={userData} language={language} />
              )}

              {/* VIEW 4: PORTFOLIO VIEW */}
              {activeView === "portfolio" && (
                <RebalancePanel
                  currentPortfolio={userData.portfolio}
                  riskCategory={userData.riskCategory}
                  language={language}
                  onExplainSuggestion={triggerExplain}
                />
              )}

              {/* VIEW 5: GOAL VIEW */}
              {activeView === "goals" && (
                <GoalPlannerPanel
                  goals={userData.goals}
                  language={language}
                  onAddGoal={handleAddGoal}
                  onDeleteGoal={handleDeleteGoal}
                  onExplainSuggestion={triggerExplain}
                />
              )}

              {/* VIEW 6: RISK ASSESSMENT VIEW */}
              {activeView === "quiz" && (
                <QuizSection
                  language={language}
                  onQuizComplete={handleQuizComplete}
                  currentProfile={userData.riskCategory}
                />
              )}

              {/* VIEW 7: STRESS VIEW */}
              {activeView === "stresstest" && (
                <StressTestPanel userData={userData} language={language} />
              )}

              {/* VIEW 8: REPORT VIEW */}
              {activeView === "report" && (
                <WeeklyReportPanel
                  userData={userData}
                  language={language}
                  transactions={transactions}
                  onExplainSuggestion={triggerExplain}
                />
              )}

              {/* VIEW 9: TAX PLANNER VIEW */}
              {activeView === "tax" && (
                <TaxPlannerPanel
                  userData={userData}
                  language={language}
                  onExplainSuggestion={triggerExplain}
                />
              )}

              {/* VIEW 10: FINANCIAL DIGITAL TWIN */}
              {activeView === "twin" && (
                <DigitalTwinPanel
                  userData={userData}
                  language={language}
                  onExplainSuggestion={triggerExplain}
                />
              )}

              {/* VIEW 11: FAMILY SYNCHRONIZER */}
              {activeView === "family" && (
                <FamilyWealthPanel
                  userData={userData}
                  language={language}
                  onExplainSuggestion={triggerExplain}
                />
              )}

              {/* VIEW 12: RELATIONSHIP MANAGER COMMAND */}
              {activeView === "rm" && (
                <RelationshipManagerPanel
                  userData={userData}
                  language={language}
                  onClientSelect={(selectedClient) => {
                    setUserData(selectedClient);
                    setActiveView("dashboard");
                  }}
                />
              )}

              {/* VIEW 13: PROFILE & ACCOUNTS BALANCE SHEET EDITOR */}
              {activeView === "profile" && (
                <ProfilePanel
                  userData={userData}
                  isDemoUser={isDemoUser}
                  onUpdateProfile={handleUpdateProfile}
                />
              )}

            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 bg-slate-950 px-4 py-6 text-center text-xs text-slate-500 font-sans">
        <div className="max-w-7xl mx-auto">
          <p className="text-[11px] text-slate-600">
            For illustrative purposes only. Not investment advice.
          </p>
        </div>
      </footer>

      {/* TRANSPARENT EXPLAINER AI MODAL */}
      <ExplainModal
        isOpen={explainOpen}
        onClose={() => setExplainOpen(false)}
        recommendation={explainRec}
        contextName={explainContext}
        userData={userData}
      />
    </div>
  );
}
