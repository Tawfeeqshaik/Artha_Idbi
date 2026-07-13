/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged as fbOnAuthStateChanged,
  signInWithEmailAndPassword as fbSignInWithEmail,
  createUserWithEmailAndPassword as fbCreateUserWithEmail,
  signOut as fbSignOut,
  sendPasswordResetEmail as fbResetPassword,
  signInWithPopup as fbSignInPopup,
  GoogleAuthProvider,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  addDoc
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";
import { UserProfile, Transaction, FinancialGoal, RiskCategory, ChatMessage } from "../types";

// Check if Firebase is actually configured with credentials
const isFirebaseConfigured = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.authDomain
);

let app: any;
let auth: any;
let db: any;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
    console.log("Firebase initialized successfully with cloud configuration.");
  } catch (err) {
    console.error("Failed to initialize cloud Firebase SDK, running in offline sandbox:", err);
  }
}

// -------------------------------------------------------------------------
// PRE-SEEDED DEMO USERS (5 DISTINCT CUSTOMER PERSONAS FOR ARTHA AI)
// -------------------------------------------------------------------------

export interface DemoUserDef {
  uid: string;
  email: string;
  name: string;
  phone: string;
  age: number;
  city: string;
  occupation: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  netWorth: number;
  cashBalance: number;
  creditScore: number;
  riskCategory: RiskCategory;
  financialHealthScore: number;
  emergencyFundMonths: number;
  familyMembers: string[];
  loans: {
    homeLoanBalance: number;
    homeLoanEmi: number;
    carLoanBalance: number;
    carLoanEmi: number;
    otherLoanBalance: number;
    otherLoanEmi: number;
  };
  portfolio: { category: string; percentage: number; value: number; color: string }[];
  goals: FinancialGoal[];
  insurance: {
    healthCover: any;
    lifeCover: any;
    gapAnalysis: string;
  };
  transactions: Transaction[];
  notifications: { id: string; type: "alert" | "info" | "success"; text: string; time: string; read?: boolean }[];
  marketNews: { nifty: number; sensex: number; goldRate: number; fdRate: number; newsText: string };
  financialTwin: {
    predictedWealth5Yr: number;
    predictedWealth10Yr: number;
    simulationOutput: string;
    historicalGraph: { year: number; balance: number }[];
  };
}

export const DEMO_USERS: DemoUserDef[] = [
  // 1. RAHUL SHARMA - SOFTWARE ENGINEER (BALANCED / MIDDLE-CLASS GROWING ACCUMULATION)
  {
    uid: "demo-rahul",
    email: "rahul.sharma@idbi-demo.in",
    name: "Rahul Sharma",
    phone: "+91 98765 43210",
    age: 31,
    city: "Thane, Mumbai",
    occupation: "Senior Software Engineer",
    monthlyIncome: 180000,
    monthlyExpenses: 85000,
    netWorth: 1845000,
    cashBalance: 320000,
    creditScore: 785,
    riskCategory: "Balanced",
    financialHealthScore: 72,
    emergencyFundMonths: 2.8,
    familyMembers: ["Neha Sharma (Spouse)", "Aarav Sharma (Son, Age 4)"],
    loans: {
      homeLoanBalance: 4200000,
      homeLoanEmi: 17000,
      carLoanBalance: 0,
      carLoanEmi: 0,
      otherLoanBalance: 0,
      otherLoanEmi: 0
    },
    portfolio: [
      { category: "Mutual Funds (Equity)", percentage: 49, value: 750000, color: "#F58220" },
      { category: "Fixed Deposits (Debt)", percentage: 26, value: 400000, color: "#10B981" },
      { category: "Direct Indian Stocks", percentage: 15, value: 225000, color: "#EC4899" },
      { category: "Digital Gold (Artha)", percentage: 10, value: 150000, color: "#F59E0B" }
    ],
    goals: [
      {
        id: "g1",
        name: "Thane Home Loan Prepayment",
        category: "House",
        targetAmount: 2500000,
        accumulatedAmount: 620000,
        targetDate: "2031-12-31",
        monthlySip: 25000,
        expectedReturn: 12,
        sipRequiredByAi: 19800,
        successProbability: 88,
        aiRecommendation: "Your aggressive prepayment plan of ₹25k/month is highly optimal. Keep contributing to the Artha Large & Midcap Fund."
      },
      {
        id: "g2",
        name: "Aarav's Higher Education Fund",
        category: "Education",
        targetAmount: 3000000,
        accumulatedAmount: 180000,
        targetDate: "2040-06-30",
        monthlySip: 15000,
        expectedReturn: 12.5,
        sipRequiredByAi: 12400,
        successProbability: 92,
        aiRecommendation: "Great trajectory. Compounding at 12.5% for 14 years gives you an outstanding 92% probability of success."
      },
      {
        id: "g3",
        name: "Tata Curvv.ev Electric SUV",
        category: "Car",
        targetAmount: 1800000,
        accumulatedAmount: 225000,
        targetDate: "2028-06-30",
        monthlySip: 10000,
        expectedReturn: 10,
        sipRequiredByAi: 23200,
        successProbability: 45,
        aiRecommendation: "With only 2 years left and an ₹18 Lakhs target, your current ₹10,000 SIP is heavily underfunded. Increase to ₹23,200 or extend the deadline by 12 months."
      }
    ],
    insurance: {
      healthCover: {
        type: "Health",
        provider: "Artha Allianz",
        sumAssured: 500000,
        premiumAmount: 12000,
        premiumFrequency: "Annual",
        expiryDate: "2027-03-15"
      },
      lifeCover: {
        type: "Term Life",
        provider: "Max Life Insurance",
        sumAssured: 5000000,
        premiumAmount: 8500,
        premiumFrequency: "Annual",
        expiryDate: "2055-12-31"
      },
      gapAnalysis: "CRITICAL LIFE COVERAGE GAP: Your current annual income is ₹18 Lakhs (₹1.5L x 12). Financial planning benchmarks recommend Term Life cover of at least 10x-15x annual earnings, which is ₹1.8 Crore. Your current ₹50 Lakhs policy leaves a severe shortfall of ₹1.3 Crore (72% underinsured)."
    },
    transactions: [
      { id: "tx1", date: "2026-07-06T13:45:00", description: "Zomato Food Delivery", category: "Food", amount: 1850, type: "debit", merchant: "Zomato" },
      { id: "tx2", date: "2026-07-05T20:15:00", description: "Swiggy Dineout Dinner", category: "Food", amount: 4890, type: "debit", merchant: "Swiggy Gourmet", anomaly: true, anomalyReason: "Gourmet dining bill is 220% higher than your average regular restaurant order." },
      { id: "tx3", date: "2026-07-04T11:00:00", description: "Shell Petrol Thane West", category: "Fuel", amount: 3500, type: "debit", merchant: "Shell Fuel" },
      { id: "tx4", date: "2026-07-03T18:30:00", description: "Zara Shoppers Plaza", category: "Shopping", amount: 8400, type: "debit", merchant: "Zara" },
      { id: "tx5", date: "2026-07-01T10:00:00", description: "Tata Power Electricity", category: "Bills", amount: 6200, type: "debit", merchant: "Tata Power" },
      { id: "tx6", date: "2026-06-30T09:00:00", description: "HDFC Home Loan EMI", category: "Rent/EMI", amount: 17000, type: "debit", merchant: "HDFC Bank" },
      { id: "tx7", date: "2026-06-28T22:30:00", description: "BookMyShow Cinepolis", category: "Entertainment", amount: 1550, type: "debit", merchant: "BookMyShow" },
      { id: "tx8", date: "2026-06-25T15:10:00", description: "Apollo Pharmacy", category: "Healthcare", amount: 1200, type: "debit", merchant: "Apollo Pharmacy" },
      { id: "tx9", date: "2026-06-24T12:00:00", description: "DMart Grocery Stockup", category: "Food", amount: 9500, type: "debit", merchant: "DMart", anomaly: true, anomalyReason: "Bulk purchase ₹9.5k vs. weekly average of ₹4.5k." },
      { id: "tx10", date: "2026-06-30T18:00:00", description: "Employer Monthly Salary", category: "Rent/EMI", amount: 180000, type: "credit", merchant: "Artha Corporate Payroll" }
    ],
    notifications: [
      { id: "n1", type: "alert", text: "Food spending increased by 32% this week compared to last week.", time: "2 hours ago" },
      { id: "n2", type: "info", text: "Portfolio drift detected: Equities have grown to 64% total weight. Rebalancing recommended.", time: "1 day ago" },
      { id: "n3", type: "success", text: "Salary of ₹1,80,000 credited to Artha Savings Account.", time: "7 days ago" }
    ],
    marketNews: {
      nifty: 24320.5,
      sensex: 79850.2,
      goldRate: 72400,
      fdRate: 7.25,
      newsText: "Gold prices hit an all-time high amidst rate cut speculation. Nifty holds strong above 24,000 as foreign institutional inflows continue. This boosts your mutual fund portfolio value by 2.1% but makes buying more gold expensive."
    },
    financialTwin: {
      predictedWealth5Yr: 4250000,
      predictedWealth10Yr: 8900000,
      simulationOutput: "At your current savings rate of 52%, your digital twin predicts your total wealth will reach ₹42.5L in 5 years, easily covering your Electric SUV and education targets. However, if home loan interest rates spike by 1.5%, your home payoff goal could be delayed by 9 months.",
      historicalGraph: [
        { year: 2022, balance: 400000 },
        { year: 2023, balance: 750000 },
        { year: 2024, balance: 1100000 },
        { year: 2025, balance: 1450000 },
        { year: 2026, balance: 1845000 }
      ]
    }
  },

  // 2. PRIYA NAIR - HIGH-EARNING CREATIVE AGGRESSIVE GROWTH
  {
    uid: "demo-priya",
    email: "priya.nair@idbi-demo.in",
    name: "Priya Nair",
    phone: "+91 91234 56789",
    age: 27,
    city: "Indiranagar, Bengaluru",
    occupation: "Principal Product Designer",
    monthlyIncome: 240000,
    monthlyExpenses: 110000,
    netWorth: 3450000,
    cashBalance: 450000,
    creditScore: 810,
    riskCategory: "Aggressive",
    financialHealthScore: 84,
    emergencyFundMonths: 4.1,
    familyMembers: ["Janaki Nair (Mother)"],
    loans: {
      homeLoanBalance: 0,
      homeLoanEmi: 0,
      carLoanBalance: 0,
      carLoanEmi: 0,
      otherLoanBalance: 0,
      otherLoanEmi: 0
    },
    portfolio: [
      { category: "Mutual Funds (Equity)", percentage: 20, value: 690000, color: "#F58220" },
      { category: "Fixed Deposits (Debt)", percentage: 5, value: 172500, color: "#10B981" },
      { category: "Direct Indian Stocks", percentage: 70, value: 2415000, color: "#EC4899" },
      { category: "Digital Gold (Artha)", percentage: 5, value: 172500, color: "#F59E0B" }
    ],
    goals: [
      {
        id: "g1",
        name: "European Sabbatical Tour",
        category: "Travel",
        targetAmount: 800000,
        accumulatedAmount: 550000,
        targetDate: "2027-04-30",
        monthlySip: 30000,
        expectedReturn: 8,
        sipRequiredByAi: 21500,
        successProbability: 97,
        aiRecommendation: "Superb coverage. Your current aggressive savings guarantee you will easily hit your travel target on time."
      },
      {
        id: "g2",
        name: "Direct Equity Venture Seed",
        category: "Other",
        targetAmount: 5000000,
        accumulatedAmount: 1200000,
        targetDate: "2032-01-01",
        monthlySip: 40000,
        expectedReturn: 14,
        sipRequiredByAi: 37500,
        successProbability: 82,
        aiRecommendation: "Your aggressive direct equity tilt is serving this seed goal well, though the volatility is high."
      }
    ],
    insurance: {
      healthCover: {
        type: "Health",
        provider: "Niva Bupa Health",
        sumAssured: 1000000,
        premiumAmount: 18000,
        premiumFrequency: "Annual",
        expiryDate: "2027-02-20"
      },
      lifeCover: {
        type: "None",
        provider: "None",
        sumAssured: 0,
        premiumAmount: 0,
        premiumFrequency: "Annual",
        expiryDate: ""
      },
      gapAnalysis: "CRITICAL RISK EXPOSURE: You have absolutely ZERO active personal life insurance policy! Since your mother is partially dependent, a term policy of ₹2.5 Crore is highly recommended immediately."
    },
    transactions: [
      { id: "tx1", date: "2026-07-06T15:20:00", description: "Blue Tokai Coffee", category: "Food", amount: 550, type: "debit", merchant: "Blue Tokai" },
      { id: "tx2", date: "2026-07-04T22:30:00", description: "The Social Club Bengaluru", category: "Entertainment", amount: 12400, type: "debit", merchant: "Social Club", anomaly: true, anomalyReason: "Weekend nightlife clubbing bill is 410% above your average leisure expense." },
      { id: "tx3", date: "2026-07-02T19:00:00", description: "Uber Premium Rides", category: "Travel", amount: 1850, type: "debit", merchant: "Uber India" },
      { id: "tx4", date: "2026-07-01T14:00:00", description: "Apple Store India Online", category: "Shopping", amount: 48000, type: "debit", merchant: "Apple Store", anomaly: true, anomalyReason: "Tech accessories shopping is a massive outlier." },
      { id: "tx5", date: "2026-06-30T18:00:00", description: "Principal Designer Salary", category: "Rent/EMI", amount: 240000, type: "credit", merchant: "Bng Design Studio" }
    ],
    notifications: [
      { id: "n1", type: "alert", text: "You spent ₹12,400 at a high-end lounge, 4x above average. Consider cooling off next week.", time: "4 hours ago" },
      { id: "n2", type: "info", text: "Your direct stock portfolio gained ₹84,000 this week due to smallcap index rally.", time: "2 days ago" }
    ],
    marketNews: {
      nifty: 24320.5,
      sensex: 79850.2,
      goldRate: 72400,
      fdRate: 7.25,
      newsText: "Vibrant bull run in Indian IT & Smallcap space! Your heavy direct stock allocation (70%) is enjoying high momentum, but raising exposure to diversified equity mutual funds can shield you from single-stock shocks."
    },
    financialTwin: {
      predictedWealth5Yr: 8100000,
      predictedWealth10Yr: 18500000,
      simulationOutput: "With an aggressive profile and ₹1.3L surplus monthly, your twin projects crossing ₹81L in 5 years! A 15% stock market crash will temporarily pull your net worth down by ₹4.5L but won't derail long-term goals.",
      historicalGraph: [
        { year: 2022, balance: 600000 },
        { year: 2023, balance: 1100000 },
        { year: 2024, balance: 1800000 },
        { year: 2025, balance: 2600000 },
        { year: 2026, balance: 3450000 }
      ]
    }
  },

  // 3. AMIT PATEL - SMALL BUSINESS OWNER CONSERVATIVE RISK WITH DEBT BURDEN
  {
    uid: "demo-amit",
    email: "amit.patel@idbi-demo.in",
    name: "Amit Patel",
    phone: "+91 98222 11100",
    age: 44,
    city: "Satellite, Ahmedabad",
    occupation: "Retail Grocery Store Owner",
    monthlyIncome: 120000,
    monthlyExpenses: 105000,
    netWorth: 2850000,
    cashBalance: 120000,
    creditScore: 690,
    riskCategory: "Conservative",
    financialHealthScore: 58,
    emergencyFundMonths: 1.1,
    familyMembers: ["Hetal Patel (Spouse)", "Deep Patel (Son, Age 18)", "Riya Patel (Daughter, Age 14)"],
    loans: {
      homeLoanBalance: 0,
      homeLoanEmi: 0,
      carLoanBalance: 250000,
      carLoanEmi: 15000,
      otherLoanBalance: 1200000,
      otherLoanEmi: 30000
    },
    portfolio: [
      { category: "Mutual Funds (Equity)", percentage: 10, value: 285000, color: "#F58220" },
      { category: "Fixed Deposits (Debt)", percentage: 60, value: 1710000, color: "#10B981" },
      { category: "Direct Indian Stocks", percentage: 5, value: 142500, color: "#EC4899" },
      { category: "Digital Gold (Artha)", percentage: 25, value: 712500, color: "#F59E0B" }
    ],
    goals: [
      {
        id: "g1",
        name: "Deep's Engineering College Fees",
        category: "Education",
        targetAmount: 1500000,
        accumulatedAmount: 950000,
        targetDate: "2027-07-01",
        monthlySip: 15000,
        expectedReturn: 7.5,
        sipRequiredByAi: 41000,
        successProbability: 58,
        aiRecommendation: "Goal is in 12 months! Your current ₹15,000 SIP will fall short by ₹3.5 Lakhs. We recommend liquidating minor FD assets or boosting monthly SIP to ₹41,000."
      },
      {
        id: "g2",
        name: "Riya's Wedding Fund",
        category: "Wedding",
        targetAmount: 3000000,
        accumulatedAmount: 400000,
        targetDate: "2034-05-01",
        monthlySip: 10000,
        expectedReturn: 9,
        sipRequiredByAi: 14500,
        successProbability: 74,
        aiRecommendation: "A 10-year horizon allows some equity mutual fund growth. We suggest allocating part of your low-yield FDs to safe hybrid funds."
      }
    ],
    insurance: {
      healthCover: {
        type: "Health",
        provider: "LIC Mediclaim",
        sumAssured: 300000,
        premiumAmount: 8000,
        premiumFrequency: "Annual",
        expiryDate: "2027-01-10"
      },
      lifeCover: {
        type: "Term Life",
        provider: "LIC Amulya Jeevan",
        sumAssured: 2000000,
        premiumAmount: 15000,
        premiumFrequency: "Annual",
        expiryDate: "2042-05-01"
      },
      gapAnalysis: "SEVERE DEBT & EXPOSURE GAP: With ₹14.5 Lakhs total active debt liability, your ₹20 Lakhs life cover leaves your family completely exposed. If a crisis hits, family only gets ₹5.5 Lakhs net after paying off loans. Immediately secure at least ₹1.5 Crore Term Life."
    },
    transactions: [
      { id: "tx1", date: "2026-07-06T10:00:00", description: "Business Loan EMI", category: "Rent/EMI", amount: 30000, type: "debit", merchant: "Artha AI" },
      { id: "tx2", date: "2026-07-05T12:00:00", description: "Car Loan EMI", category: "Rent/EMI", amount: 15000, type: "debit", merchant: "SBI Car Finance" },
      { id: "tx3", date: "2026-07-02T16:00:00", description: "Ahmedabad Municipal Taxes", category: "Bills", amount: 8500, type: "debit", merchant: "AMC Office" },
      { id: "tx4", date: "2026-06-30T19:00:00", description: "Business Cash Credit Transfer", category: "Rent/EMI", amount: 120000, type: "credit", merchant: "Store Daily Cash Sweep" }
    ],
    notifications: [
      { id: "n1", type: "alert", text: "EMI payments consume 37.5% of your monthly income. Refinance high-cost debt.", time: "1 hour ago" },
      { id: "n2", type: "info", text: "Emergency cash buffer is critical. Keep at least ₹3 Lakhs in liquid funds.", time: "3 days ago" }
    ],
    marketNews: {
      nifty: 24320.5,
      sensex: 79850.2,
      goldRate: 72400,
      fdRate: 7.25,
      newsText: "Gold price surging to ₹72,400 is highly favorable as 25% of your portfolio is in Gold! You can leverage Gold Loan facilities at Artha Bank to pay off high-cost business loans at lower interest rates."
    },
    financialTwin: {
      predictedWealth5Yr: 3900000,
      predictedWealth10Yr: 5700000,
      simulationOutput: "Due to heavy debt (₹45,000/month EMIs), your twin's 5-year compounding is restricted. Liquidating a portion of FDs to settle the ₹2.5L car loan (saving 11% interest) would increase your 5-year wealth forecast by ₹1.2L.",
      historicalGraph: [
        { year: 2022, balance: 1800000 },
        { year: 2023, balance: 2100000 },
        { year: 2024, balance: 2350000 },
        { year: 2025, balance: 2600000 },
        { year: 2026, balance: 2850000 }
      ]
    }
  },

  // 4. ANANYA SEN - YOUNG FREELANCER (HIGH DISCRETIONARY SPENDING / EMERGENCY BUILDING CAPABLE)
  {
    uid: "demo-ananya",
    email: "ananya.sen@idbi-demo.in",
    name: "Ananya Sen",
    phone: "+91 97777 88899",
    age: 24,
    city: "Salt Lake, Kolkata",
    occupation: "Freelance UX Copywriter",
    monthlyIncome: 65000,
    monthlyExpenses: 52000,
    netWorth: 380000,
    cashBalance: 95000,
    creditScore: 720,
    riskCategory: "Growth",
    financialHealthScore: 61,
    emergencyFundMonths: 1.8,
    familyMembers: ["Supriya Sen (Mother)"],
    loans: {
      homeLoanBalance: 0,
      homeLoanEmi: 0,
      carLoanBalance: 0,
      carLoanEmi: 0,
      otherLoanBalance: 0,
      otherLoanEmi: 0
    },
    portfolio: [
      { category: "Mutual Funds (Equity)", percentage: 40, value: 152000, color: "#F58220" },
      { category: "Fixed Deposits (Debt)", percentage: 10, value: 38000, color: "#10B981" },
      { category: "Direct Indian Stocks", percentage: 10, value: 38000, color: "#EC4899" },
      { category: "Digital Gold (Artha)", percentage: 40, value: 152000, color: "#F59E0B" }
    ],
    goals: [
      {
        id: "g1",
        name: "MacBook Pro M4 Pro",
        category: "Other",
        targetAmount: 250000,
        accumulatedAmount: 85000,
        targetDate: "2027-03-31",
        monthlySip: 8000,
        expectedReturn: 10,
        sipRequiredByAi: 19500,
        successProbability: 51,
        aiRecommendation: "A 9-month window is too short for ₹2.5L. Double your SIP or defer purchase until mid-2027."
      },
      {
        id: "g2",
        name: "Core Emergency Reserve",
        category: "Other",
        targetAmount: 300000,
        accumulatedAmount: 95000,
        targetDate: "2028-12-31",
        monthlySip: 6000,
        expectedReturn: 7,
        sipRequiredByAi: 7200,
        successProbability: 85,
        aiRecommendation: "Optimal plan. Route ₹1,200 more per month to lock this vital safety net on time."
      }
    ],
    insurance: {
      healthCover: {
        type: "None",
        provider: "None",
        sumAssured: 0,
        premiumAmount: 0,
        premiumFrequency: "Annual",
        expiryDate: ""
      },
      lifeCover: {
        type: "None",
        provider: "None",
        sumAssured: 0,
        premiumAmount: 0,
        premiumFrequency: "Annual",
        expiryDate: ""
      },
      gapAnalysis: "TOTAL INSURANCE VULNERABILITY: You have absolutely ZERO Health or Life coverage! A sudden ₹1.5L medical emergency will fully wipe out your cash balance and investments. Immediately apply for Artha Health Guard (₹5L sum assured)."
    },
    transactions: [
      { id: "tx1", date: "2026-07-06T19:30:00", description: "Peter Cat Restaurant Park Street", category: "Food", amount: 3800, type: "debit", merchant: "Peter Cat Restaurant", anomaly: true, anomalyReason: "Gourmet meal cost represents 35% of your total weekly discretionary limit." },
      { id: "tx2", date: "2026-07-04T15:00:00", description: "H&M South City Mall", category: "Shopping", amount: 6200, type: "debit", merchant: "H&M Stores", anomaly: true, anomalyReason: "Fashion shopping surge detected outside of usual end-of-season sales." },
      { id: "tx3", date: "2026-07-02T11:00:00", description: "Kolkata Coffee House", category: "Food", amount: 450, type: "debit", merchant: "Indian Coffee House" },
      { id: "tx4", date: "2026-06-30T10:00:00", description: "Upwork Invoice Payment", category: "Rent/EMI", amount: 65000, type: "credit", merchant: "Upwork Global Escrow" }
    ],
    notifications: [
      { id: "n1", type: "alert", text: "Gourmet food and fashion purchases scaled by 48% this week. Set a strict spending limit.", time: "1 hour ago" },
      { id: "n2", type: "alert", text: "You have NO active health insurance cover. Secure medical safety immediately.", time: "1 day ago" }
    ],
    marketNews: {
      nifty: 24320.5,
      sensex: 79850.2,
      goldRate: 72400,
      fdRate: 7.25,
      newsText: "FD rates offer a solid 7.25% for short terms! Moving part of your idle cash balance into an Artha sweep FD helps build an emergency cushion safely without lock-ins."
    },
    financialTwin: {
      predictedWealth5Yr: 850000,
      predictedWealth10Yr: 2100000,
      simulationOutput: "With an irregular freelance stream and high spending (80% of earnings), your digital twin projects a moderate wealth trajectory. Restricting dining out to twice a month unlocks ₹1.1L in 5-year wealth gains.",
      historicalGraph: [
        { year: 2022, balance: 50000 },
        { year: 2023, balance: 110000 },
        { year: 2024, balance: 190000 },
        { year: 2025, balance: 280000 },
        { year: 2026, balance: 380000 }
      ]
    }
  },

  // 5. VIKRAM MALHOTRA - HN ULTRA-HIGH NET WORTH CORPORATE EXEC (COMPLEX WEALTH PLANNING)
  {
    uid: "demo-vikram",
    email: "vikram.malhot@idbi-demo.in",
    name: "Vikram Malhotra",
    phone: "+91 99999 88888",
    age: 52,
    city: "DLF Phase 5, Gurgaon",
    occupation: "Senior VP Operations",
    monthlyIncome: 450000,
    monthlyExpenses: 210000,
    netWorth: 15400000,
    cashBalance: 1800000,
    creditScore: 845,
    riskCategory: "Aggressive",
    financialHealthScore: 89,
    emergencyFundMonths: 8.5,
    familyMembers: ["Sanjana Malhotra (Spouse)", "Kabir Malhotra (Son, Age 21)", "Rohan Malhotra (Son, Age 17)"],
    loans: {
      homeLoanBalance: 2400000,
      homeLoanEmi: 45000,
      carLoanBalance: 0,
      carLoanEmi: 0,
      otherLoanBalance: 0,
      otherLoanEmi: 0
    },
    portfolio: [
      { category: "Mutual Funds (Equity)", percentage: 55, value: 8470000, color: "#F58220" },
      { category: "Fixed Deposits (Debt)", percentage: 15, value: 2310000, color: "#10B981" },
      { category: "Direct Indian Stocks", percentage: 25, value: 3850000, color: "#EC4899" },
      { category: "Digital Gold (Artha)", percentage: 5, value: 770000, color: "#F59E0B" }
    ],
    goals: [
      {
        id: "g1",
        name: "Luxury Retirement Villa (Kasauli)",
        category: "House",
        targetAmount: 25000000,
        accumulatedAmount: 8500000,
        targetDate: "2032-12-31",
        monthlySip: 150000,
        expectedReturn: 13,
        sipRequiredByAi: 142000,
        successProbability: 94,
        aiRecommendation: "Extremely secure. Your monthly savings contribution of ₹1.5L puts you on a solid pathway to acquire the luxury villa early."
      },
      {
        id: "g2",
        name: "Kabir's MBA at INSEAD",
        category: "Education",
        targetAmount: 8000000,
        accumulatedAmount: 3200000,
        targetDate: "2028-08-30",
        monthlySip: 80000,
        expectedReturn: 11,
        sipRequiredByAi: 91000,
        successProbability: 86,
        aiRecommendation: "A small gap of ₹11,000 in monthly SIP. We suggest adding surplus funds to top up this goal and guarantee premium education."
      }
    ],
    insurance: {
      healthCover: {
        type: "Health",
        provider: "None (Relies on Corporate Health Care Cover)",
        sumAssured: 0,
        premiumAmount: 0,
        premiumFrequency: "Annual",
        expiryDate: ""
      },
      lifeCover: {
        type: "Term Life",
        provider: "Tata AIA Life",
        sumAssured: 30000000,
        premiumAmount: 35000,
        premiumFrequency: "Annual",
        expiryDate: "2044-01-01"
      },
      gapAnalysis: "CORPORATE HEALTH EXPOSURE: While your corporate health policy covers ₹10 Lakhs, rely strictly on a personal health cover of at least ₹20 Lakhs. Since corporate coverage is revoked immediately upon retirement or job change, an independent plan is critical."
    },
    transactions: [
      { id: "tx1", date: "2026-07-06T20:00:00", description: "Gurgaon Golf Club Membership", category: "Entertainment", amount: 45000, type: "debit", merchant: "Gurgaon Golf Club", anomaly: true, anomalyReason: "Annual membership fee. Large transaction outlier." },
      { id: "tx2", date: "2026-07-05T15:00:00", description: "Premium Petrol Refuel", category: "Fuel", amount: 6500, type: "debit", merchant: "HP Gurgaon" },
      { id: "tx3", date: "2026-07-01T12:00:00", description: "Executive Monthly Salary", category: "Rent/EMI", amount: 450000, type: "credit", merchant: "Global Corp VP Payroll" }
    ],
    notifications: [
      { id: "n1", type: "info", text: "Consider starting a tax-free Sovereign Gold Bond portfolio via Artha Bank.", time: "3 hours ago" },
      { id: "n2", type: "alert", text: "No active independent medical insurance found outside of your corporate policy.", time: "1 day ago" }
    ],
    marketNews: {
      nifty: 24320.5,
      sensex: 79850.2,
      goldRate: 72400,
      fdRate: 7.25,
      newsText: "High-net-worth tax strategies are critical. At your ₹45L bracket, Section 80C is fully saturated. We recommend utilizing tax-efficient equity arbitrage funds and debt-rebalancing via Sovereign Gold Bonds."
    },
    financialTwin: {
      predictedWealth5Yr: 28500000,
      predictedWealth10Yr: 59000000,
      simulationOutput: "Your High-Net-Worth digital twin forecasts crossing ₹2.85 Crore in 5 years! Compounding at an aggressive 13.2% makes you fully resilient. A major 25% stock correction slows your timeline by just 4 months due to your rich liquid buffers.",
      historicalGraph: [
        { year: 2022, balance: 8000000 },
        { year: 2023, balance: 9600000 },
        { year: 2024, balance: 11500000 },
        { year: 2025, balance: 13400000 },
        { year: 2026, balance: 15400000 }
      ]
    }
  }
];

// Initialize LocalStorage with seed data if it doesn't exist
const initializeLocalDB = () => {
  if (typeof window === "undefined") return;
  
  if (!localStorage.getItem("idbi_db_initialized")) {
    localStorage.setItem("idbi_db_initialized", "true");
    
    // Seed Users
    localStorage.setItem("idbi_users", JSON.stringify(
      DEMO_USERS.map(({ uid, email, name, phone, age, city, occupation, monthlyIncome, monthlyExpenses, netWorth, cashBalance, creditScore, riskCategory, financialHealthScore, emergencyFundMonths, familyMembers, loans, portfolio, insurance, financialTwin }) => ({
        uid, email, name, phone, age, city, occupation, monthlyIncome, monthlyExpenses, netWorth, cashBalance, creditScore, riskCategory, financialHealthScore, emergencyFundMonths, familyMembers, loans, portfolio, insurance, financialTwin
      }))
    ));
    
    // Seed Transactions map
    const txsMap: Record<string, Transaction[]> = {};
    const goalsMap: Record<string, FinancialGoal[]> = {};
    const chatMap: Record<string, ChatMessage[]> = {};
    const notesMap: Record<string, any[]> = {};
    const reportsMap: Record<string, any> = {};

    DEMO_USERS.forEach(u => {
      txsMap[u.uid] = u.transactions;
      goalsMap[u.uid] = u.goals;
      notesMap[u.uid] = u.notifications;
      chatMap[u.uid] = [
        {
          id: "init",
          sender: "bot",
          text: `Hello ${u.name}! I am your Artha AI Advisor. I am fully synchronized with your accounts, spending patterns, and active financial goals. Tap any of the quick queries below or ask me anything!`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ];
      reportsMap[u.uid] = {
        weekStarting: "July 1st, 2026",
        spendingVsPrevWeek: u.uid === "demo-rahul" ? 32 : u.uid === "demo-priya" ? 48 : u.uid === "demo-ananya" ? 44 : 5,
        totalSpent: u.uid === "demo-rahul" ? 18440 : u.uid === "demo-priya" ? 64000 : u.uid === "demo-ananya" ? 12000 : 45000,
        goalsProgressChange: `+0.4% toward ${u.goals[0]?.name || "Wealth"}`,
        anomaliesCount: u.uid === "demo-rahul" ? 2 : u.uid === "demo-priya" ? 2 : u.uid === "demo-ananya" ? 2 : 0,
        summary: u.uid === "demo-rahul" 
          ? "Your outflows scaled by 32% this week, primarily due to an elevated ₹4,890 Swiggy Dineout and ₹9,500 DMart stocking."
          : `Your weekly spent reached ₹${(u.uid === "demo-priya" ? 64000 : 12000).toLocaleString("en-IN")}, driven by entertainment and retail.`,
        recommendation: u.uid === "demo-rahul"
          ? "Commit ₹5,000 this weekend from your surplus cash directly into your Artha emergency fund sweep."
          : "Optimize your cash reserve by sweeping surplus funds into high-yield deposits."
      };
    });

    localStorage.setItem("idbi_transactions", JSON.stringify(txsMap));
    localStorage.setItem("idbi_goals", JSON.stringify(goalsMap));
    localStorage.setItem("idbi_notifications", JSON.stringify(notesMap));
    localStorage.setItem("idbi_chats", JSON.stringify(chatMap));
    localStorage.setItem("idbi_weekly_reports", JSON.stringify(reportsMap));
  }
};

// -------------------------------------------------------------------------
// REVOLUTIONARY DUAL AUTH & STORE INTEGRATION LAYER
// -------------------------------------------------------------------------

const authListeners: ((user: any) => void)[] = [];

const triggerAuthChange = async () => {
  const activeUid = localStorage.getItem("idbi_active_uid");
  let resolvedUser: any = null;
  if (activeUid && activeUid !== "none" && activeUid !== null) {
    const users = JSON.parse(localStorage.getItem("idbi_users") || "[]");
    let profile = users.find((u: any) => u.uid === activeUid);
    if (!profile) {
      profile = DEMO_USERS.find((u: any) => u.uid === activeUid);
    }
    if (profile) {
      resolvedUser = { uid: activeUid, email: profile.email, displayName: profile.name, isDemo: true, profile };
    }
  }
  for (const listener of authListeners) {
    try {
      listener(resolvedUser);
    } catch (e) {
      console.error("Auth listener propagation error:", e);
    }
  }
};

export const dbService = {
  // Authentication Emulator & Helper
  onAuthStateChanged: (callback: (user: any) => void) => {
    authListeners.push(callback);

    let unsubscribeFb: (() => void) | null = null;
    if (isFirebaseConfigured && auth) {
      unsubscribeFb = fbOnAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          // Fetch user details from Firestore or local fallback
          let profile = await dbService.getUserProfile(fbUser.uid);
          if (!profile) {
            // Seed a new clean, un-onboarded profile
            profile = {
              uid: fbUser.uid,
              email: fbUser.email || "",
              name: fbUser.displayName || fbUser.email?.split("@")[0] || "Client",
              phone: fbUser.phoneNumber || "",
              age: 0,
              city: "",
              occupation: "",
              monthlyIncome: 0,
              monthlyExpenses: 0,
              netWorth: 0,
              cashBalance: 0,
              creditScore: 750,
              riskCategory: "Balanced" as RiskCategory,
              financialHealthScore: 0,
              onboarded: false,
              emergencyFundMonths: 0,
              familyMembers: [],
              loans: { homeLoanBalance: 0, homeLoanEmi: 0, carLoanBalance: 0, carLoanEmi: 0, otherLoanBalance: 0, otherLoanEmi: 0 },
              portfolio: [],
              goals: [],
              insurance: {
                healthCover: { type: "Health", provider: "", sumAssured: 0, premiumAmount: 0, premiumFrequency: "Annual", expiryDate: "" },
                lifeCover: { type: "Term Life", provider: "", sumAssured: 0, premiumAmount: 0, premiumFrequency: "Annual", expiryDate: "" },
                gapAnalysis: "Please complete your onboarding to analyze insurance gap."
              },
              financialTwin: {
                predictedWealth5Yr: 0,
                predictedWealth10Yr: 0,
                simulationOutput: "Simulations will run after onboarding.",
                historicalGraph: []
              },
              transactions: [],
              notifications: [
                { id: "n1", type: "success", text: "Welcome to Artha AI! Please complete your onboarding wizard to begin.", time: "Just now" }
              ],
              marketNews: { nifty: 24320, sensex: 79850, goldRate: 72400, fdRate: 7.25, newsText: "Welcome to WealthAI." }
            };
            await dbService.saveUserProfile(fbUser.uid, profile);
          }
          callback({ uid: fbUser.uid, email: fbUser.email, displayName: profile.name, isDemo: false, profile });
        } else {
          // Check local simulated auth session
          const activeUid = localStorage.getItem("idbi_active_uid");
          if (activeUid && activeUid !== "none") {
            const users = JSON.parse(localStorage.getItem("idbi_users") || "[]");
            let profile = users.find((u: any) => u.uid === activeUid);
            if (profile) {
              callback({ uid: activeUid, email: profile.email, displayName: profile.name, isDemo: true, profile });
              return;
            }
            const demoUser = DEMO_USERS.find((u: any) => u.uid === activeUid);
            if (demoUser) {
              callback({ uid: activeUid, email: demoUser.email, displayName: demoUser.name, isDemo: true, profile: demoUser });
              return;
            }
          }
          callback(null);
        }
      });
    } else {
      // Offline/Local emulator only
      const activeUid = localStorage.getItem("idbi_active_uid");
      if (!activeUid || activeUid === "none") {
        callback(null);
      } else {
        const users = JSON.parse(localStorage.getItem("idbi_users") || "[]");
        const profile = users.find((u: any) => u.uid === activeUid);
        if (profile) {
          callback({ uid: activeUid, email: profile.email, displayName: profile.name, isDemo: true, profile });
        } else {
          // Look in DEMO_USERS directly
          const demoUser = DEMO_USERS.find((u: any) => u.uid === activeUid);
          if (demoUser) {
            callback({ uid: activeUid, email: demoUser.email, displayName: demoUser.name, isDemo: true, profile: demoUser });
          } else {
            callback(null);
          }
        }
      }
    }

    return () => {
      const index = authListeners.indexOf(callback);
      if (index !== -1) authListeners.splice(index, 1);
      if (unsubscribeFb) unsubscribeFb();
    };
  },

  // Auth Operations
  signUp: async (email: string, pass: string, name: string) => {
    if (isFirebaseConfigured && auth) {
      try {
        const cred = await fbCreateUserWithEmail(auth, email, pass);
        // Create user profile in Firestore immediately
        const defaultProfile = {
          uid: cred.user.uid,
          email,
          name,
          phone: "",
          age: 0,
          city: "",
          occupation: "",
          monthlyIncome: 0,
          monthlyExpenses: 0,
          netWorth: 0,
          cashBalance: 0,
          creditScore: 750,
          riskCategory: "Balanced" as RiskCategory,
          financialHealthScore: 0,
          onboarded: false,
          emergencyFundMonths: 0,
          familyMembers: [],
          loans: { homeLoanBalance: 0, homeLoanEmi: 0, carLoanBalance: 0, carLoanEmi: 0, otherLoanBalance: 0, otherLoanEmi: 0 },
          portfolio: [],
          goals: [],
          insurance: {
            healthCover: { type: "Health" as const, provider: "", sumAssured: 0, premiumAmount: 0, premiumFrequency: "Annual" as const, expiryDate: "" },
            lifeCover: { type: "Term Life" as const, provider: "", sumAssured: 0, premiumAmount: 0, premiumFrequency: "Annual" as const, expiryDate: "" },
            gapAnalysis: "Please complete your onboarding to analyze insurance gap."
          },
          financialTwin: {
            predictedWealth5Yr: 0,
            predictedWealth10Yr: 0,
            simulationOutput: "Simulations will run after onboarding.",
            historicalGraph: []
          },
          transactions: [],
          notifications: [
            { id: "n1", type: "success", text: "Welcome! Please complete your onboarding wizard to begin.", time: "Just now" }
          ],
          marketNews: { nifty: 24320, sensex: 79850, goldRate: 72400, fdRate: 7.25, newsText: "Welcome to WealthAI." }
        };
        await dbService.saveUserProfile(cred.user.uid, defaultProfile);
        return { uid: cred.user.uid, email: cred.user.email, displayName: cred.user.displayName, profile: defaultProfile };
      } catch (fbErr: any) {
        console.warn("Firebase Auth Cloud Sign Up failed, falling back to local simulation:", fbErr);
      }
    }

    // Local Database Registration
    const users = JSON.parse(localStorage.getItem("idbi_users") || "[]");
    if (users.find((u: any) => u.email === email)) {
      throw new Error("User with this email already exists in our database.");
    }
    const newUid = `user-${Date.now()}`;
    const newProfile = {
      uid: newUid,
      email,
      name,
      phone: "",
      age: 0,
      city: "",
      occupation: "",
      monthlyIncome: 0,
      monthlyExpenses: 0,
      netWorth: 0,
      cashBalance: 0,
      creditScore: 750,
      riskCategory: "Balanced" as RiskCategory,
      financialHealthScore: 0,
      onboarded: false,
      emergencyFundMonths: 0,
      familyMembers: [],
      loans: { homeLoanBalance: 0, homeLoanEmi: 0, carLoanBalance: 0, carLoanEmi: 0, otherLoanBalance: 0, otherLoanEmi: 0 },
      portfolio: [],
      goals: [],
      insurance: {
        healthCover: { type: "Health" as const, provider: "", sumAssured: 0, premiumAmount: 0, premiumFrequency: "Annual" as const, expiryDate: "" },
        lifeCover: { type: "Term Life" as const, provider: "", sumAssured: 0, premiumAmount: 0, premiumFrequency: "Annual" as const, expiryDate: "" },
        gapAnalysis: "Please complete your onboarding to analyze insurance gap."
      },
      financialTwin: {
        predictedWealth5Yr: 0,
        predictedWealth10Yr: 0,
        simulationOutput: "Simulations will run after onboarding.",
        historicalGraph: []
      },
      transactions: [],
      notifications: [
        { id: "n1", type: "success", text: "Welcome! Please complete your onboarding wizard to begin.", time: "Just now" }
      ],
      marketNews: { nifty: 24320, sensex: 79850, goldRate: 72400, fdRate: 7.25, newsText: "Welcome to WealthAI." }
    };

    // Add user
    users.push(newProfile);
    localStorage.setItem("idbi_users", JSON.stringify(users));

    // Add secondary collections
    const txMap = JSON.parse(localStorage.getItem("idbi_transactions") || "{}");
    txMap[newUid] = [];
    localStorage.setItem("idbi_transactions", JSON.stringify(txMap));

    const goalsMap = JSON.parse(localStorage.getItem("idbi_goals") || "{}");
    goalsMap[newUid] = [];
    localStorage.setItem("idbi_goals", JSON.stringify(goalsMap));

    const notesMap = JSON.parse(localStorage.getItem("idbi_notifications") || "{}");
    notesMap[newUid] = newProfile.notifications;
    localStorage.setItem("idbi_notifications", JSON.stringify(notesMap));

    localStorage.setItem("idbi_active_uid", newUid);
    const userObj = { uid: newUid, email, displayName: name, profile: newProfile };
    await triggerAuthChange();
    return userObj;
  },

  signIn: async (email: string, pass: string) => {
    if (isFirebaseConfigured && auth) {
      try {
        const cred = await fbSignInWithEmail(auth, email, pass);
        const profile = await dbService.getUserProfile(cred.user.uid);
        return { uid: cred.user.uid, email: cred.user.email, displayName: cred.user.displayName, profile };
      } catch (fbErr: any) {
        console.warn("Firebase Auth Cloud Sign In failed, falling back to local simulation:", fbErr);
      }
    }
    // Local check
    const users = JSON.parse(localStorage.getItem("idbi_users") || "[]");
    const matched = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (!matched) {
      // Create an automatic account with this email for zero-block demo friction
      return await dbService.signUp(email, pass, email.split("@")[0]);
    }
    localStorage.setItem("idbi_active_uid", matched.uid);
    const userObj = { uid: matched.uid, email: matched.email, displayName: matched.name, profile: matched };
    await triggerAuthChange();
    return userObj;
  },

  googleLogin: async () => {
    if (isFirebaseConfigured && auth) {
      try {
        const provider = new GoogleAuthProvider();
        const res = await fbSignInPopup(auth, provider);
        const profile = await dbService.getUserProfile(res.user.uid);
        return { uid: res.user.uid, email: res.user.email, displayName: res.user.displayName, profile };
      } catch (fbErr: any) {
        console.error("Firebase Auth Cloud Google Login failed:", fbErr);
        let errorMsg = fbErr.message || String(fbErr);
        if (fbErr.code === "auth/unauthorized-domain") {
          errorMsg = "Unauthorized Domain: Please add your site's URL/domain (e.g. netlify.app, or your AI Studio preview domain) to the 'Authorized Domains' list in your Firebase Console (Authentication -> Settings -> Authorized Domains).";
        } else if (fbErr.code === "auth/operation-not-allowed") {
          errorMsg = "Google Sign-In is not enabled. Please enable 'Google' under the 'Sign-in method' tab in your Firebase Console (Authentication -> Sign-in method).";
        } else if (fbErr.code === "auth/popup-blocked") {
          errorMsg = "Popup Blocked: Your browser blocked the sign-in window. Please enable popups for this site, or open the app in a new tab to sign in.";
        } else if (fbErr.code === "auth/cancelled-popup-request" || fbErr.code === "auth/popup-closed-by-user") {
          errorMsg = "Google login popup was closed before completion.";
        }
        throw new Error(errorMsg);
      }
    }
    // Simulation fallback - log in as Rahul Sharma (Primary Demo Profile)
    const matched = DEMO_USERS[0];
    localStorage.setItem("idbi_active_uid", matched.uid);
    const userObj = { uid: matched.uid, email: matched.email, displayName: matched.name, profile: matched };
    await triggerAuthChange();
    return userObj;
  },

  resetPassword: async (email: string) => {
    if (isFirebaseConfigured && auth) {
      try {
        await fbResetPassword(auth, email);
      } catch (e) {
        console.warn("Firebase password reset failed:", e);
      }
    } else {
      console.log(`Password reset simulated for ${email}`);
    }
  },

  signOut: async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await fbSignOut(auth);
      } catch (e) {
        console.warn("Firebase signout failed:", e);
      }
    }
    localStorage.setItem("idbi_active_uid", "none");
    await triggerAuthChange();
  },

  // Instant Switch Demo Login for Judges
  switchDemoUser: async (uid: string) => {
    localStorage.setItem("idbi_active_uid", uid);
    await triggerAuthChange();
  },

  // -------------------------------------------------------------------------
  // FIRESTORE CRUD OPERATIONS / LOCAL EMULATOR SYNCRONIZATION
  // -------------------------------------------------------------------------

  getUserProfile: async (uid: string): Promise<UserProfile | null> => {
    let profile: UserProfile | null = null;
    if (isFirebaseConfigured && db) {
      try {
        const d = await getDoc(doc(db, "users", uid));
        if (d.exists()) {
          profile = d.data() as UserProfile;
        }
      } catch (err) {
        console.error("Firestore read user error:", err);
      }
    }
    if (!profile) {
      // Local fallback
      const users = JSON.parse(localStorage.getItem("idbi_users") || "[]");
      profile = users.find((u: any) => u.uid === uid) || null;
    }

    if (profile) {
      if (!profile.familyMembers) profile.familyMembers = [];
      if (!profile.goals) profile.goals = [];
      if (!profile.portfolio) profile.portfolio = [];
      if (!profile.transactions) profile.transactions = [];
      if (!profile.loans) profile.loans = { homeLoanBalance: 0, homeLoanEmi: 0, carLoanBalance: 0, carLoanEmi: 0, otherLoanBalance: 0, otherLoanEmi: 0 };
      if (!profile.insurance) profile.insurance = { healthCover: { type: "Health", provider: "", sumAssured: 0, premiumAmount: 0, premiumFrequency: "Annual", expiryDate: "" }, lifeCover: { type: "Term Life", provider: "", sumAssured: 0, premiumAmount: 0, premiumFrequency: "Annual", expiryDate: "" }, gapAnalysis: "No gap analysis available." };
      if (!profile.financialTwin) profile.financialTwin = { predictedWealth5Yr: 0, predictedWealth10Yr: 0, simulationOutput: "", historicalGraph: [] };

      if (!profile.financialHealthBreakdown) {
        const savingsRate = Math.max(0, Math.round(((profile.monthlyIncome - profile.monthlyExpenses) / (profile.monthlyIncome || 1)) * 100));
        profile.financialHealthBreakdown = {
          savingsRate: savingsRate || 40,
          debtToIncome: Math.round(((profile.loans?.homeLoanEmi || 0) + (profile.loans?.carLoanEmi || 0) + (profile.loans?.otherLoanEmi || 0)) / (profile.monthlyIncome || 1) * 100) || 10,
          emergencyFund: Math.min(100, Math.round((profile.emergencyFundMonths || 3) / 6 * 100)) || 50,
          investments: profile.netWorth > 5000000 ? 85 : profile.netWorth > 1500000 ? 70 : 50,
          insurance: profile.insurance?.gapAnalysis?.includes("CRITICAL") ? 35 : 75,
          creditScore: Math.round(((profile.creditScore || 700) - 300) / 6) || 75,
          cashFlow: Math.max(0, Math.round((profile.monthlyIncome - profile.monthlyExpenses) / (profile.monthlyIncome || 1) * 100)) || 80
        };
      }
    }
    return profile;
  },

  saveUserProfile: async (uid: string, profile: any) => {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "users", uid), profile, { merge: true });
      } catch (err) {
        console.error("Firestore write user error:", err);
      }
    }
    // Local fallback
    const users = JSON.parse(localStorage.getItem("idbi_users") || "[]");
    const idx = users.findIndex((u: any) => u.uid === uid);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...profile };
    } else {
      users.push({ uid, ...profile });
    }
    localStorage.setItem("idbi_users", JSON.stringify(users));
  },

  getTransactions: async (uid: string): Promise<Transaction[]> => {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, "transactions"), where("userId", "==", uid));
        const s = await getDocs(q);
        if (!s.empty) {
          return s.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        }
      } catch (err) {
        console.error("Firestore tx fetch error:", err);
      }
    }
    // Local fallback
    const map = JSON.parse(localStorage.getItem("idbi_transactions") || "{}");
    return map[uid] || [];
  },

  saveTransaction: async (uid: string, tx: Transaction) => {
    if (isFirebaseConfigured && db) {
      try {
        await addDoc(collection(db, "transactions"), { ...tx, userId: uid });
      } catch (err) {
        console.error("Firestore tx save error:", err);
      }
    }
    // Local fallback
    const map = JSON.parse(localStorage.getItem("idbi_transactions") || "{}");
    if (!map[uid]) map[uid] = [];
    
    // Check if duplicate ID exists, update it, otherwise prepend
    const idx = map[uid].findIndex((t: any) => t.id === tx.id);
    if (idx >= 0) {
      map[uid][idx] = tx;
    } else {
      map[uid].unshift(tx);
    }
    localStorage.setItem("idbi_transactions", JSON.stringify(map));

    // Dynamic Net worth adjustment!
    if (tx.type === "debit") {
      await dbService.adjustUserBalances(uid, -tx.amount);
    } else {
      await dbService.adjustUserBalances(uid, tx.amount);
    }
  },

  adjustUserBalances: async (uid: string, amount: number) => {
    const profile = await dbService.getUserProfile(uid);
    if (profile) {
      profile.cashBalance = Math.max(0, profile.cashBalance + amount);
      profile.netWorth = Math.max(0, profile.netWorth + amount);
      
      // Re-calculate some health indicators
      const expenseRate = profile.monthlyIncome > 0 ? (profile.monthlyExpenses / profile.monthlyIncome) : 0.5;
      const savingsRate = Math.max(0, 100 - Math.round(expenseRate * 100));
      profile.financialHealthBreakdown.savingsRate = savingsRate;
      profile.financialHealthScore = Math.min(100, Math.round(
        (savingsRate + profile.creditScore / 9 + profile.financialHealthBreakdown.emergencyFund) / 3
      ));

      await dbService.saveUserProfile(uid, profile);
    }
  },

  getGoals: async (uid: string): Promise<FinancialGoal[]> => {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, "goals"), where("userId", "==", uid));
        const s = await getDocs(q);
        if (!s.empty) {
          return s.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
        }
      } catch (err) {
        console.error("Firestore goals fetch error:", err);
      }
    }
    // Local fallback
    const map = JSON.parse(localStorage.getItem("idbi_goals") || "{}");
    return map[uid] || [];
  },

  saveGoal: async (uid: string, goal: FinancialGoal) => {
    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, "goals", goal.id), { ...goal, userId: uid }, { merge: true });
      } catch (err) {
        console.error("Firestore goal save error:", err);
      }
    }
    // Local fallback
    const map = JSON.parse(localStorage.getItem("idbi_goals") || "{}");
    if (!map[uid]) map[uid] = [];
    const idx = map[uid].findIndex((g: any) => g.id === goal.id);
    if (idx >= 0) {
      map[uid][idx] = goal;
    } else {
      map[uid].push(goal);
    }
    localStorage.setItem("idbi_goals", JSON.stringify(map));

    // Sync back with user profile goals list
    const profile = await dbService.getUserProfile(uid);
    if (profile) {
      profile.goals = map[uid];
      await dbService.saveUserProfile(uid, profile);
    }
  },

  deleteGoal: async (uid: string, goalId: string) => {
    // Local fallback
    const map = JSON.parse(localStorage.getItem("idbi_goals") || "{}");
    if (map[uid]) {
      map[uid] = map[uid].filter((g: any) => g.id !== goalId);
      localStorage.setItem("idbi_goals", JSON.stringify(map));
      
      const profile = await dbService.getUserProfile(uid);
      if (profile) {
        profile.goals = map[uid];
        await dbService.saveUserProfile(uid, profile);
      }
    }
  },

  getWeeklyReport: async (uid: string): Promise<any> => {
    const map = JSON.parse(localStorage.getItem("idbi_weekly_reports") || "{}");
    return map[uid] || {
      weekStarting: "July 1st, 2026",
      spendingVsPrevWeek: 0,
      totalSpent: 0,
      goalsProgressChange: "0% Change",
      anomaliesCount: 0,
      summary: "No summary computed yet. Click the compute button.",
      recommendation: "Increase your weekly savings sweep into Artha Liquid Funds."
    };
  },

  saveWeeklyReport: (uid: string, report: any) => {
    const map = JSON.parse(localStorage.getItem("idbi_weekly_reports") || "{}");
    map[uid] = report;
    localStorage.setItem("idbi_weekly_reports", JSON.stringify(map));
  },

  getNotifications: async (uid: string): Promise<any[]> => {
    const map = JSON.parse(localStorage.getItem("idbi_notifications") || "{}");
    return map[uid] || [];
  },

  getChats: async (uid: string): Promise<ChatMessage[]> => {
    const map = JSON.parse(localStorage.getItem("idbi_chats") || "{}");
    return map[uid] || [];
  },

  saveChatMessages: (uid: string, messages: ChatMessage[]) => {
    const map = JSON.parse(localStorage.getItem("idbi_chats") || "{}");
    map[uid] = messages;
    localStorage.setItem("idbi_chats", JSON.stringify(map));
  }
};
