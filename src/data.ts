/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile, Transaction, RiskQuizQuestion, AppLanguage } from "./types";

// Static translations for multilingual support
export const I18N_TRANSLATIONS: Record<AppLanguage, Record<string, string>> = {
  en: {
    appName: "Artha AI",
    tagline: "Your AI Co-Pilot for Wealth",
    greeting: "Good morning, Rahul",
    netWorth: "Net Worth",
    financialHealth: "Financial Health",
    healthScore: "Health Score",
    monthlyIncome: "Monthly Income",
    monthlyExpenses: "Monthly Expenses",
    savingsRate: "Savings Rate",
    riskProfile: "Risk Profile",
    talkToAdvisor: "Talk to Advisor",
    portfolio: "Portfolio",
    goals: "Goals",
    invest: "Invest Now",
    dashboard: "Dashboard",
    spending: "Spending",
    quiz: "Risk Profiling",
    explainThis: "Why this suggestion?",
    insurance: "Insurance Cover",
    stressTest: "Stress Test",
    weeklyReport: "Weekly Report",
    recentTransactions: "Recent Transactions",
    anomalyAlert: "Spending Alert",
    emergencyFund: "Emergency Fund",
    creditScore: "Credit Score",
    upcomingSips: "Upcoming SIPs & Bills",
    addGoal: "Create Financial Goal",
    goalName: "Goal Name",
    targetAmount: "Target Amount",
    targetDate: "Target Completion Date",
    currentSip: "Current Monthly SIP (₹)",
    expectedReturn: "Expected Annual Return (%)",
    calculateWithAi: "Optimize with AI",
    stressScenario: "Stress Scenario",
    simulateEmergency: "Simulate Stress Test",
    rebalanceSimulator: "Rebalance Simulator",
    rebalanceHeading: "Portfolio Rebalancing",
    rebalanceAction: "Run Rebalance Optimization",
    currentAlloc: "Current Allocation",
    targetAlloc: "Recommended Target",
    requiredTrades: "Required Rebalance Trades",
    insuranceGap: "Insurance Gap Analysis",
    taxPlanner: "Tax Planner (80C)",
    hindi: "Hindi",
    tamil: "Tamil",
    english: "English",
  },
  hi: {
    appName: "Artha AI",
    tagline: "वेल्थ के लिए आपका एआई को-पायलट",
    greeting: "शुभ प्रभात, राहुल",
    netWorth: "कुल संपत्ति",
    financialHealth: "वित्तीय स्वास्थ्य",
    healthScore: "स्वास्थ्य स्कोर",
    monthlyIncome: "मासिक आय",
    monthlyExpenses: "मासिक खर्च",
    savingsRate: "बचत दर",
    riskProfile: "जोखिम प्रोफाइल",
    talkToAdvisor: "सलाहकार से बात करें",
    portfolio: "पोर्टफोलियो",
    goals: "लक्ष्य योजना",
    invest: "अभी निवेश करें",
    dashboard: "डैशबोर्ड",
    spending: "व्यय विश्लेषण",
    quiz: "जोखिम आकलन",
    explainThis: "यह सुझाव क्यों?",
    insurance: "बीमा सुरक्षा",
    stressTest: "तनाव परीक्षण",
    weeklyReport: "साप्ताहिक रिपोर्ट",
    recentTransactions: "हाल के लेनदेन",
    anomalyAlert: "एआई खर्च चेतावनी",
    emergencyFund: "आपातकालीन निधि",
    creditScore: "क्रेडिट स्कोर",
    upcomingSips: "आगामी एसआईपी और बिल",
    addGoal: "नया वित्तीय लक्ष्य बनाएं",
    goalName: "लक्ष्य का नाम",
    targetAmount: "लक्ष्य राशि",
    targetDate: "लक्ष्य पूरा होने की तिथि",
    currentSip: "वर्तमान मासिक एसआईपी (₹)",
    expectedReturn: "अपेक्षित वार्षिक रिटर्न (%)",
    calculateWithAi: "एआई के साथ अनुकूलित करें",
    stressScenario: "तनाव परिदृश्य",
    simulateEmergency: "तनाव परीक्षण शुरू करें",
    rebalanceSimulator: "संतुलन सिम्युलेटर",
    rebalanceHeading: "पोर्टफोलियो पुनर्संतुलन",
    rebalanceAction: "पुनर्संतुलन अनुकूलन चलाएं",
    currentAlloc: "वर्तमान आवंटन",
    targetAlloc: "अनुशंसित लक्ष्य",
    requiredTrades: "आवश्यक रीबैलेंस ट्रेड",
    insuranceGap: "बीमा अंतर विश्लेषण",
    taxPlanner: "कर योजनाकार (80C)",
    hindi: "हिंदी",
    tamil: "तमिल",
    english: "अंग्रेजी",
  },
  ta: {
    appName: "Artha AI",
    tagline: "செல்வத்திற்கான உங்கள் AI கோ-பைலட்",
    greeting: "காலை வணக்கம், ராகுல்",
    netWorth: "மொத்த சொத்து மதிப்பு",
    financialHealth: "நிதி ஆரோக்கியம்",
    healthScore: "ஆரோக்கிய மதிப்பெண்",
    monthlyIncome: "மாத வருமானம்",
    monthlyExpenses: "மாதாந்திர செலவுகள்",
    savingsRate: "சேமிப்பு விகிதம்",
    riskProfile: "இடர் விவரம்",
    talkToAdvisor: "ஆலோசகருடன் பேசுங்கள்",
    portfolio: "போர்ட்ஃபோலியோ",
    goals: "இலக்கு திட்டமிடல்",
    invest: "இப்போது முதலீடு செய்க",
    dashboard: "டாஷ்போர்டு",
    spending: "செலவு பகுப்பாய்வு",
    quiz: "இடர் மதிப்பீடு",
    explainThis: "ஏன் இந்த பரிந்துரை?",
    insurance: "காப்பீட்டு பாதுகாப்பு",
    stressTest: "மன அழுத்த சோதனை",
    weeklyReport: "வாராந்திர அறிக்கை",
    recentTransactions: "சமீபத்திய பரிவர்த்தனைகள்",
    anomalyAlert: "AI செலவு எச்சரிக்கை",
    emergencyFund: "அவசரகால நிதி",
    creditScore: "கிரெடிட் ஸ்கோர்",
    upcomingSips: "வரவிருக்கும் எஸ்ஐபிகள் & பில்கள்",
    addGoal: "புதிய நிதி இலக்கை உருவாக்கு",
    goalName: "இலக்கின் பெயர்",
    targetAmount: "இலக்கு தொகை",
    targetDate: "இலக்கு நிறைவு தேதி",
    currentSip: "தற்போதைய மாதாந்திர SIP (₹)",
    expectedReturn: "எதிர்பார்க்கப்படும் ஆண்டு வருவாய் (%)",
    calculateWithAi: "AI உடன் மேம்படுத்துக",
    stressScenario: "மன அழுத்த சூழ்நிலை",
    simulateEmergency: "அழுத்த சோதனையை உருவகப்படுத்து",
    rebalanceSimulator: "மறுசீரமைப்பு சிமுலேட்டர்",
    rebalanceHeading: "போர்ட்ஃபோலியோ மறுசீரமைப்பு",
    rebalanceAction: "மறுசீரமைப்பு உகப்பாக்கத்தை இயக்கு",
    currentAlloc: "தற்போதைய ஒதுக்கீடு",
    targetAlloc: "பரிந்துரைக்கப்பட்ட இலக்கு",
    requiredTrades: "தேவைப்படும் மறுசீரமைப்பு வர்த்தகம்",
    insuranceGap: "காப்பீட்டு இடைவெளி பகுப்பாய்வு",
    taxPlanner: "வரி திட்டமிடுபவர் (80C)",
    hindi: "இந்தி",
    tamil: "தமிழ்",
    english: "ஆங்கிலம்",
  }
};

export const MOCK_USER: UserProfile = {
  name: "Rahul Sharma",
  age: 31,
  city: "Mumbai",
  occupation: "Senior Software Engineer",
  monthlyIncome: 150000,
  monthlyExpenses: 85000,
  netWorth: 1845000,
  cashBalance: 320000,
  creditScore: 785,
  emergencyFundMonths: 2.8, // ₹2,40,000 / ₹85,000 monthly expense
  financialHealthScore: 74,
  financialHealthBreakdown: {
    savingsRate: 43, // (150,000 - 85,000) / 150,000 * 100
    debtToIncome: 11, // Rent/EMI ₹17,000 / 1,50,000 * 100
    emergencyFund: 46, // 2.8 months covered (target 6 months = 100)
    investments: 85, // ₹15.25L invested is great for 31 age
    insurance: 35, // High cover gap in life insurance (35/100)
    creditScore: 88, // 785 is excellent
    cashFlow: 90, // Solid positive cashflow of ₹65k/month
  },
  riskCategory: "Balanced",
  goals: [
    {
      id: "g1",
      name: "Own Premium Home in Thane",
      category: "House",
      targetAmount: 7500000,
      accumulatedAmount: 850000,
      targetDate: "2031-12-31",
      monthlySip: 25000,
      expectedReturn: 12,
      sipRequiredByAi: 38500,
      successProbability: 62,
      aiRecommendation: "To secure ₹75 Lakhs in 5.5 years, increase your monthly SIP to ₹38,500. Currently, your ₹25,000 SIP will leave a gap of ₹18.4 Lakhs due to inflation."
    },
    {
      id: "g2",
      name: "Financial Independence Retirement",
      category: "Retirement",
      targetAmount: 30000000,
      accumulatedAmount: 450000,
      targetDate: "2050-01-01",
      monthlySip: 15000,
      expectedReturn: 12.5,
      sipRequiredByAi: 12400,
      successProbability: 92,
      aiRecommendation: "Great trajectory. Your current ₹15,000 monthly SIP compounding at 12.5% for 23.5 years has a 92% chance of exceeding your ₹3 Crore target. You are well on track!"
    },
    {
      id: "g3",
      name: "New Electric Car (Tata Curvv.ev)",
      category: "Car",
      targetAmount: 1800000,
      accumulatedAmount: 225000,
      targetDate: "2028-06-30",
      monthlySip: 10000,
      expectedReturn: 10,
      sipRequiredByAi: 23200,
      successProbability: 45,
      aiRecommendation: "With only 2 years remaining and a target of ₹18 Lakhs, your ₹10,000 SIP is heavily underfunded. You need to boost it to ₹23,200/month or push the goal timeline out by 12 months."
    }
  ],
  portfolio: [
    { category: "Mutual Funds (Equity)", percentage: 49, value: 750000, color: "#F58220" }, // Artha Orange
    { category: "Fixed Deposits (Debt)", percentage: 26, value: 400000, color: "#10B981" }, // Emerald Green
    { category: "Direct Indian Stocks", percentage: 15, value: 225000, color: "#EC4899" }, // Hot Pink
    { category: "Digital Gold (Artha)", percentage: 10, value: 150000, color: "#F59E0B" }  // Amber Gold
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
    gapAnalysis: "CRITICAL COVERAGE GAP: Rahul's current annual income is ₹18,00,000 (₹1.5L x 12). Standard financial planning recommends Term Life coverage of 10x-15x annual earnings, translating to a target of ₹1.8 Crore to ₹2.5 Crore. Rahul only has ₹50 Lakhs. This leaves a severe gap of ₹1.3 Crore (72% underinsured). If something happens, his family's living standard and loan liabilities (home/car) are highly vulnerable."
  }
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  // Debits
  { id: "tx001", date: "2026-07-06T13:45:00", description: "Zomato Food Delivery", category: "Food", amount: 1850, type: "debit", merchant: "Zomato" },
  { id: "tx002", date: "2026-07-05T20:15:00", description: "Swiggy Dineout Dinner", category: "Food", amount: 4890, type: "debit", merchant: "Swiggy Gourmet", anomaly: true, anomalyReason: "Gourmet dining bill is 220% higher than your average individual weekend dining expense." },
  { id: "tx003", date: "2026-07-04T11:00:00", description: "Shell Petrol Pump Thane", category: "Fuel", amount: 3500, type: "debit", merchant: "Shell Fuel" },
  { id: "tx004", date: "2026-07-03T18:30:00", description: "Zara High Street Mall", category: "Shopping", amount: 8400, type: "debit", merchant: "Zara" },
  { id: "tx005", date: "2026-07-01T10:00:00", description: "Tata Power Electricity Bill", category: "Bills", amount: 6200, type: "debit", merchant: "Tata Power" },
  { id: "tx006", date: "2026-06-30T09:00:00", description: "HDFC Home Loan EMI", category: "Rent/EMI", amount: 17000, type: "debit", merchant: "HDFC Bank" },
  { id: "tx007", date: "2026-06-28T22:30:00", description: "BookMyShow Movie Tickets", category: "Entertainment", amount: 1550, type: "debit", merchant: "BookMyShow" },
  { id: "tx008", date: "2026-06-25T15:10:00", description: "Apollo Pharmacy Mumbai", category: "Healthcare", amount: 1200, type: "debit", merchant: "Apollo Pharmacy" },
  { id: "tx009", date: "2026-06-24T12:00:00", description: "DMart Grocery Purchase", category: "Food", amount: 9500, type: "debit", merchant: "DMart", anomaly: true, anomalyReason: "Bulk grocery run ₹9,500 vs. average regular stockup ₹5,200 (82% surge)." },
  { id: "tx010", date: "2026-06-20T17:45:00", description: "Starbucks Coffee & Bites", category: "Food", amount: 1250, type: "debit", merchant: "Starbucks Coffee" },
  { id: "tx011", date: "2026-06-18T14:30:00", description: "Mumbai Metro Recharge", category: "Travel", amount: 1000, type: "debit", merchant: "MMRDA" },
  { id: "tx012", date: "2026-06-15T10:30:00", description: "Artha Equity SIP Investment", category: "Investments", amount: 25000, type: "debit", merchant: "Artha Mutual Fund" },
  { id: "tx013", date: "2026-06-12T19:00:00", description: "Amazon India Shopping", category: "Shopping", amount: 4500, type: "debit", merchant: "Amazon Seller" },
  { id: "tx014", date: "2026-06-10T11:00:00", description: "Weekly Vegetable Vendor", category: "Food", amount: 1850, type: "debit", merchant: "Local Mandi" },
  { id: "tx015", date: "2026-06-08T08:00:00", description: "Cult.Fit Gym Annual Fee", category: "Healthcare", amount: 14500, type: "debit", merchant: "Cult Fit" },
  
  // Credits
  { id: "tx101", date: "2026-06-30T18:00:00", description: "Artha Bank Monthly Salary", category: "Bills", amount: 150000, type: "credit", merchant: "Artha Employer Services" },
  { id: "tx102", date: "2026-06-15T11:00:00", description: "Dividend payout TCS Stocks", category: "Investments", amount: 3500, type: "credit", merchant: "TCS Demat" },
  { id: "tx103", date: "2026-06-05T14:20:00", description: "UPI Refund from Friend", category: "Bills", amount: 2500, type: "credit", merchant: "GooglePay UPI" }
];

export const RISK_QUIZ_QUESTIONS: RiskQuizQuestion[] = [
  {
    id: 1,
    text: "What is your primary investment goal with Artha AI?",
    options: [
      { text: "Preserve principal capital and avoid any nominal market losses", score: 1 },
      { text: "Create stable, predictable income alongside minor inflation protection", score: 2 },
      { text: "Grow wealth steadily over the long term while managing fluctuations", score: 3 },
      { text: "Maximize capital gains through aggressive equity and growth asset investing", score: 4 }
    ]
  },
  {
    id: 2,
    text: "If your stock portfolio loses 20% value in a sudden market crash, what is your action?",
    options: [
      { text: "Panic, sell everything immediately to prevent further downside", score: 1 },
      { text: "Hold onto the funds and wait for them to break even before doing anything", score: 2 },
      { text: "Keep holding and consult the AI advisor to check if the long-term outlook changed", score: 3 },
      { text: "See this as an attractive bargain and deploy more cash to buy the dip", score: 4 }
    ]
  },
  {
    id: 3,
    text: "What is your expected investment horizon before needing this money?",
    options: [
      { text: "Less than 1 year (Short-term cash and debt only)", score: 1 },
      { text: "1 to 3 years (Medium term with debt/hybrid exposure)", score: 2 },
      { text: "3 to 7 years (Balanced timeline, comfortable with equity volatility)", score: 3 },
      { text: "More than 7 years (Long term, capable of weathering major economic cycles)", score: 4 }
    ]
  },
  {
    id: 4,
    text: "Which portfolio of assets would make you feel most comfortable?",
    options: [
      { text: "80% Fixed Deposits & Gold, 20% Large-Cap Mutual Funds", score: 1 },
      { text: "50% Debt, 30% Large-Cap Equities, 10% Gold, 10% Cash", score: 2 },
      { text: "60% Diversified Equities (Mid/Large), 30% FDs & Corporate Bonds, 10% Gold", score: 3 },
      { text: "85% Equities (including Small-Cap/Sectoral), 15% Cryptocurrencies/Alt-Assets", score: 4 }
    ]
  },
  {
    id: 5,
    text: "How would you rate your understanding of financial markets and investment instruments?",
    options: [
      { text: "Novice: I prefer leaving capital in savings accounts or standard FD deposits", score: 1 },
      { text: "Basic: I understand fixed income and have heard of popular mutual funds", score: 2 },
      { text: "Competent: I understand diversification, compounding, asset categories, and indexes", score: 3 },
      { text: "Expert: I trade stocks, derivatives, know how to hedge, and analyze company fundamentals", score: 4 }
    ]
  },
  {
    id: 6,
    text: "Your current age and source of income stability can be described as:",
    options: [
      { text: "Retired or relying on variable freelance gigs with high income uncertainty", score: 1 },
      { text: "Mid-career with some fixed financial commitments and standard salary security", score: 2 },
      { text: "Young professional with a stable, high-paying career and low overhead liabilities", score: 3 },
      { text: "Established tech/business professional with diversified passive income cash flows", score: 4 }
    ]
  }
];

export function getRiskProfile(score: number): {
  category: "Conservative" | "Balanced" | "Growth" | "Aggressive";
  description: string;
  suggestedAllocation: { category: string; percentage: number; color: string }[];
} {
  if (score <= 8) {
    return {
      category: "Conservative",
      description: "You prioritize preserving your hard-earned capital above all. You are comfortable with lower interest-rate returns in exchange for security and immediate liquidity. Your ideal portfolio is heavily weighted in highly-rated government fixed income and liquid cash buffers.",
      suggestedAllocation: [
        { category: "Fixed Deposits (Debt)", percentage: 70, color: "#10B981" },
        { category: "Cash / Liquidity", percentage: 15, color: "#9CA3AF" },
        { category: "Mutual Funds (Equity)", percentage: 10, color: "#F58220" },
        { category: "Digital Gold (Artha)", percentage: 5, color: "#F59E0B" }
      ]
    };
  } else if (score <= 14) {
    return {
      category: "Balanced",
      description: "You seek a middle-ground: protecting your wealth from inflation while capping extreme downside drops. You benefit from a hybrid allocation that splits power between growth-seeking equities and secure fixed income. Perfect for long-term goal builders who want peace of mind.",
      suggestedAllocation: [
        { category: "Mutual Funds (Equity)", percentage: 50, color: "#F58220" },
        { category: "Fixed Deposits (Debt)", percentage: 30, color: "#10B981" },
        { category: "Digital Gold (Artha)", percentage: 10, color: "#F59E0B" },
        { category: "Direct Indian Stocks", percentage: 10, color: "#EC4899" }
      ]
    };
  } else if (score <= 20) {
    return {
      category: "Growth",
      description: "You want your money working hard. You understand that short-term stock market drops are just noise on the road to compounding generational wealth. You are fully comfortable allocating a major portion of your investments to equities, keeping a small safe buffer.",
      suggestedAllocation: [
        { category: "Mutual Funds (Equity)", percentage: 60, color: "#F58220" },
        { category: "Direct Indian Stocks", percentage: 20, color: "#EC4899" },
        { category: "Fixed Deposits (Debt)", percentage: 15, color: "#10B981" },
        { category: "Digital Gold (Artha)", percentage: 5, color: "#F59E0B" }
      ]
    };
  } else {
    return {
      category: "Aggressive",
      description: "You are an aggressive wealth builder looking to capture maximum long-term upside. Volatility is your friend and you seek to exploit market cycles by heavily investing in equity schemes, sectoral mutual funds, direct stocks, and high-growth opportunities. Safe debt is kept minimal.",
      suggestedAllocation: [
        { category: "Mutual Funds (Equity)", percentage: 65, color: "#F58220" },
        { category: "Direct Indian Stocks", percentage: 25, color: "#EC4899" },
        { category: "Digital Gold (Artha)", percentage: 5, color: "#F59E0B" },
        { category: "Fixed Deposits (Debt)", percentage: 5, color: "#10B981" }
      ]
    };
  }
}
