/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Transaction {
  id: string;
  date: string; // ISO date string
  description: string;
  category: "Food" | "Fuel" | "Shopping" | "Healthcare" | "Bills" | "Entertainment" | "Travel" | "Education" | "Rent/EMI" | "Investments";
  amount: number;
  type: "debit" | "credit";
  merchant?: string;
  anomaly?: boolean;
  anomalyReason?: string;
}

export interface AssetAllocation {
  category: string; // e.g. "Mutual Funds (Equity)", "Fixed Deposits (Debt)", "Direct Stocks", "Digital Gold", "Cash"
  percentage: number;
  value: number;
  color: string;
}

export interface InsurancePolicy {
  type: "Health" | "Term Life" | "Motor" | "None";
  provider: string;
  sumAssured: number;
  premiumAmount: number;
  premiumFrequency: "Monthly" | "Annual";
  expiryDate: string;
}

export interface FinancialGoal {
  id: string;
  name: string;
  category: "House" | "Car" | "Education" | "Retirement" | "Wedding" | "Travel" | "Other";
  targetAmount: number;
  accumulatedAmount: number;
  targetDate: string;
  monthlySip: number;
  expectedReturn: number; // annual return e.g. 12 for 12%
  sipRequiredByAi?: number;
  successProbability?: number; // 0 to 100
  aiRecommendation?: string;
}

export interface RiskQuizQuestion {
  id: number;
  text: string;
  options: {
    text: string;
    score: number;
  }[];
}

export type RiskCategory = "Conservative" | "Balanced" | "Growth" | "Aggressive";

export interface RiskProfile {
  category: RiskCategory;
  score: number;
  description: string;
  suggestedAllocation: {
    category: string;
    percentage: number;
    color: string;
  }[];
}

export interface FinancialHealthScoreBreakdown {
  savingsRate: number; // 0-100
  debtToIncome: number; // 0-100
  emergencyFund: number; // months of expenses covered, scaled to 0-100
  investments: number; // rating 0-100
  insurance: number; // coverage rating 0-100
  creditScore: number; // mapped 300-900 onto 0-100
  cashFlow: number; // rating 0-100
}

export interface FinancialReport {
  weekStarting: string;
  spendingVsPrevWeek: number; // percentage change, e.g. +12 or -5
  totalSpent: number;
  goalsProgressChange: string;
  anomaliesCount: number;
  summary: string;
  recommendation: string;
}

export interface UserProfile {
  uid?: string;
  email?: string;
  phone?: string;
  name: string;
  age: number;
  city: string;
  occupation: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  netWorth: number;
  cashBalance: number;
  financialHealthScore: number;
  financialHealthBreakdown?: FinancialHealthScoreBreakdown;
  creditScore: number;
  emergencyFundMonths: number;
  riskCategory: RiskCategory;
  goals: FinancialGoal[];
  portfolio: AssetAllocation[];
  insurance: {
    healthCover: InsurancePolicy;
    lifeCover: InsurancePolicy;
    gapAnalysis: string;
  };
  loans?: {
    homeLoanBalance: number;
    homeLoanEmi: number;
    carLoanBalance: number;
    carLoanEmi: number;
    otherLoanBalance: number;
    otherLoanEmi: number;
  };
  familyMembers?: string[];
  familyIncome?: number;
  familyExpenses?: number;
  familyNetWorth?: number;
  financialTwin?: {
    sims?: {
      jobLoss: boolean;
      salaryHike: boolean;
      buyHouse: boolean;
      marketCrash: boolean;
      highInflation: boolean;
    };
    projected5?: number;
    projected10?: number;
    stressReport?: string;
    predictedWealth5Yr?: number;
    predictedWealth10Yr?: number;
    simulationOutput?: string;
    historicalGraph?: any[];
  };
  transactions?: Transaction[];
  notifications?: any[];
  marketNews?: any;
  onboarded?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  groundingLinks?: { title: string; url: string }[];
}

export type AppLanguage = "en" | "hi" | "ta";
