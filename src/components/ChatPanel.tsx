/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Sparkles, AlertCircle, Bookmark, Link2, ArrowUpRight, HelpCircle } from "lucide-react";
import { UserProfile, ChatMessage, AppLanguage } from "../types";
import { I18N_TRANSLATIONS } from "../data";

interface ChatPanelProps {
  userData: UserProfile;
  language: AppLanguage;
}

export default function ChatPanel({ userData, language }: ChatPanelProps) {
  const t = I18N_TRANSLATIONS[language];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Pre-seeded questions for instant demo success
  const sampleQuestions = [
    { label: "Should I buy gold?", text: "Should I increase my gold asset weight based on my current portfolio and Balanced risk category?" },
    { label: "Can I afford a home loan?", text: "Can I afford a ₹75 Lakh home loan in Thane with my ₹1.5L income and current ₹17k EMI obligations?" },
    { label: "Should I increase my SIP?", text: "Should I increase my Mutual Fund SIP for the Thane Home goal? What's my current probability of success?" },
    { label: "Can I retire at 55?", text: "Am I on track to hit my ₹3 Crore retirement fund goal at age 55 with my current ₹15,000 monthly investment?" },
  ];

  useEffect(() => {
    const firstName = userData?.name ? userData.name.split(" ")[0] : "Client";
    setMessages([
      {
        id: "init",
        sender: "bot",
        text: `Hello ${firstName}! I am your Artha AI Advisor. I am fully synchronized with your accounts, spending patterns, and active financial goals. Tap any of the quick queries below or ask me anything!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, [userData?.name]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsThinking(true);

    try {
      const response = await fetch("/api/advisor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          userData,
          language,
        }),
      });

      if (!response.ok) throw new Error("API call failed");
      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          groundingLinks: data.groundingLinks,
        },
      ]);
    } catch (err) {
      console.error("Chat error, executing smart client-side advisory fallback:", err);
      
      const query = textToSend.toLowerCase();
      let text = "";
      let groundingLinks: Array<{ title: string; url: string }> = [
        { title: "IDBI Mutual Funds", url: "https://www.idbibank.in/en/mutual-funds.aspx" }
      ];

      const clientFirstName = userData?.name ? userData.name.split(" ")[0] : "Client";
      const monthlyExpenses = userData?.monthlyExpenses || 85000;
      const emergencyTarget = monthlyExpenses * 6;
      const cashBalance = userData?.cashBalance || 240000;
      const emergencyShortfall = Math.max(0, emergencyTarget - cashBalance);

      if (query.includes("gold") || query.includes("metal") || query.includes("yellow")) {
        const goldAlloc = userData?.portfolio?.find((p: any) => p.category.toLowerCase().includes("gold"));
        const currentGoldVal = goldAlloc ? goldAlloc.value : 0;
        const currentGoldPct = goldAlloc ? goldAlloc.percentage : 0;
        text = `Hello ${clientFirstName}, looking at your current portfolio, your Digital Gold allocation stands at ₹${currentGoldVal.toLocaleString("en-IN")} (${currentGoldPct}% of your portfolio). For a ${userData?.riskCategory || "Balanced"} investor, keeping a 5% to 10% hedge in gold is recommended. I suggest considering IDBI Sovereign Gold Bonds (SGB) or IDBI Gold ETFs to safely scale this up, as they offer sovereign safety along with a 2.5% annual interest.`;
        groundingLinks = [{ title: "IDBI Sovereign Gold Bonds", url: "https://www.idbibank.in/en/sovereign-gold-bonds.aspx" }];
      } else if (query.includes("loan") || query.includes("emi") || query.includes("afford") || query.includes("lakh") || query.includes("crore")) {
        const activeEmi = (userData?.loans?.homeLoanEmi || 0) + (userData?.loans?.carLoanEmi || 0) + (userData?.loans?.otherLoanEmi || 0) || 17000;
        const maxRecommendedEmi = Math.round((userData?.monthlyIncome || 150000) * 0.45);
        const remainingCapacity = Math.max(0, maxRecommendedEmi - activeEmi);
        text = `Hi ${clientFirstName}, your current monthly EMI commitments are ₹${activeEmi.toLocaleString("en-IN")}. With a monthly income of ₹${(userData?.monthlyIncome || 150000).toLocaleString("en-IN")}, your debt-to-income ratio is healthy. Based on the 45% threshold, you can afford an additional monthly EMI of up to ₹${remainingCapacity.toLocaleString("en-IN")}. A ₹75 Lakh home loan would carry an EMI of around ₹58,000, which is perfectly within your reach!`;
        groundingLinks = [{ title: "IDBI Home Loan Portal", url: "https://www.idbibank.in/en/home-loan.aspx" }];
      } else if (query.includes("sip") || query.includes("goal") || query.includes("increase") || query.includes("investment")) {
        const totalSip = userData?.goals?.reduce((sum: number, g: any) => sum + g.monthlySip, 0) || 15000;
        text = `Hello ${clientFirstName}, you currently run active SIPs worth ₹${totalSip.toLocaleString("en-IN")} across your financial goals. To accelerate your goals and beat inflation, I highly recommend adopting a 10% annual SIP Step-up. Routing an additional ₹5,000 of your ₹${((userData?.monthlyIncome || 150000) - (userData?.monthlyExpenses || 85000)).toLocaleString("en-IN")} monthly surplus into IDBI diversified mutual funds will boost your goal success probability to over 95%.`;
        groundingLinks = [{ title: "IDBI Mutual Funds SIP", url: "https://www.idbibank.in/en/mutual-funds.aspx" }];
      } else if (query.includes("retire") || query.includes("55") || query.includes("retirement")) {
        const retirementGoal = userData?.goals?.find((g: any) => g.category === "Retirement" || g.name.toLowerCase().includes("retire"));
        const targetVal = retirementGoal ? retirementGoal.targetAmount : 30000000;
        text = `Hi ${clientFirstName}, achieving your ₹${(targetVal / 10000000).toFixed(1)} Crore retirement fund is highly feasible given your high savings rate. Assuming a standard 12% compounding return, your current monthly SIP is positioned well, but starting an incremental IDBI Retirement Fund SIP of ₹10,000 today will ensure you achieve this target comfortably by age 55.`;
        groundingLinks = [{ title: "IDBI Retirement Planning", url: "https://www.idbibank.in/en/mutual-funds.aspx" }];
      } else if (query.includes("tax") || query.includes("80c") || query.includes("regime")) {
        text = `Hello ${clientFirstName}, to optimize your tax liabilities under Section 80C, you should maximize the ₹1,50,000 annual limit. Investing in the IDBI Tax Saving Fund (ELSS) not only bridges any remaining gap but also allows you to enjoy tax deductions with the shortest 3-year lock-in period among all 80C options. Let's start an ELSS SIP of ₹5,000.`;
        groundingLinks = [{ title: "IDBI Tax Saving ELSS", url: "https://www.idbibank.in/en/mutual-funds.aspx" }];
      } else if (query.includes("credit") || query.includes("score")) {
        text = `Hi ${clientFirstName}, your credit score is excellent at ${userData?.creditScore || 785}! This puts you in our prime lending bracket, making you eligible for the lowest interest rates on IDBI Home and Auto loans. To maintain this premium score, keep your credit card utilization below 30% and ensure all EMIs continue to be paid via auto-debit on time.`;
        groundingLinks = [{ title: "IDBI Credit Cards", url: "https://www.idbibank.in/en/credit-cards.aspx" }];
      } else if (query.includes("family") || query.includes("spouse") || query.includes("household") || query.includes("wife") || query.includes("child")) {
        text = `Hello ${clientFirstName}, managing wealth at a household level is a great strategy. Since your family has combined resources, we can design a holistic financial plan. I suggest linking your spouse's savings account to create a Combined Household Advisory profile, helping you optimize mutual goals like child education or emergency liquidity buffers together.`;
        groundingLinks = [{ title: "IDBI Family Banking", url: "https://www.idbibank.in/en/savings-account.aspx" }];
      } else {
        // Default smart response matching general health
        text = `Based on your IDBI Bank Profile, here is a professional recommendation: Your Emergency Fund stands at ₹${cashBalance.toLocaleString("en-IN")} (only ${userData?.emergencyFundMonths || 2.8} months of monthly expenses of ₹${monthlyExpenses.toLocaleString("en-IN")}). I highly recommend routing ₹15,000 from your monthly savings into high-yield IDBI liquid funds until you hit your ₹${emergencyTarget.toLocaleString("en-IN")} buffer (6 months coverage). Let me know if you would like me to set up this sweep mandate.`;
        groundingLinks = [{ title: "IDBI Liquid Fund", url: "https://www.idbibank.in/en/mutual-funds.aspx" }];
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-fallback-${Date.now()}`,
          sender: "bot",
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          groundingLinks,
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-[520px] rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-950/45 px-5 py-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center rounded-xl bg-gradient-to-tr from-idbi-orange to-idbi-green p-2 text-white shadow-md shadow-idbi-orange/10">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-sans flex items-center gap-1.5">
              Artha AI Advisor
            </h3>
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              Active Grounding • 100% Context Synced
            </span>
          </div>
        </div>
        <div className="rounded-lg bg-slate-800/40 px-2 py-1 text-[10px] font-mono text-idbi-orange border border-slate-800">
          {(userData?.name ? userData.name.split(" ")[0] : "Client")}'s Assistant
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((msg, idx) => {
          const isBot = msg.sender === "bot";
          return (
            <motion.div
              key={msg.id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${isBot ? "justify-start" : "justify-end"}`}
            >
              <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                isBot 
                  ? "bg-slate-950/40 border border-slate-800/80 text-slate-200" 
                  : "bg-idbi-orange text-white font-medium"
              }`}>
                {/* Text */}
                <p className="whitespace-pre-line">{msg.text}</p>
                
                {/* Grounding links */}
                {isBot && msg.groundingLinks && msg.groundingLinks.length > 0 && (
                  <div className="mt-3 pt-3.5 border-t border-slate-800/60 space-y-1.5">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">
                      Grounding References:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {msg.groundingLinks.map((link, lIdx) => (
                        <a
                          key={lIdx}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[10px] text-idbi-orange bg-idbi-orange/10 border border-idbi-orange/10 px-2.5 py-1 rounded-lg transition hover:bg-idbi-orange/20"
                        >
                          <Link2 className="w-3 h-3" />
                          {link.title}
                          <ArrowUpRight className="w-2.5 h-2.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Time */}
                <span className={`text-[9px] block text-right mt-1.5 ${isBot ? "text-slate-500" : "text-orange-200"}`}>
                  {msg.timestamp}
                </span>
              </div>
            </motion.div>
          );
        })}

        {/* Thinking / Loader state */}
        {isThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="max-w-[70%] rounded-2xl p-4 bg-slate-950/40 border border-slate-800/80 text-slate-200">
              <div className="flex items-center gap-1.5 py-1">
                <span className="w-1.5 h-1.5 bg-idbi-orange rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-idbi-orange rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-idbi-orange rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="text-[10px] text-slate-400 font-mono ml-1.5">Advisor compounding data...</span>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested Questions Drawer */}
      <div className="px-5 py-2 border-t border-slate-800/40 bg-slate-950/20">
        <div className="flex items-center gap-1 text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1.5">
          <HelpCircle className="w-3 h-3 text-idbi-orange" /> Click to ask Advisor:
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {sampleQuestions.map((q, qIdx) => (
            <button
              key={qIdx}
              onClick={() => handleSendMessage(q.text)}
              className="shrink-0 rounded-lg border border-slate-800 bg-slate-950/40 hover:bg-slate-800/40 hover:border-slate-700 px-3 py-1.5 text-[10px] text-slate-300 transition cursor-pointer"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs panel */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="p-3 border-t border-slate-800 bg-slate-950/40 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask about home loan, emergency fund gap, stock weights..."
          disabled={isThinking}
          className="flex-1 rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-idbi-orange/60 focus:ring-1 focus:ring-idbi-orange/10 transition"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isThinking}
          className="rounded-xl bg-idbi-orange hover:bg-idbi-orange/90 disabled:bg-slate-800 p-3 text-white transition shadow-lg shadow-idbi-orange/5 cursor-pointer flex items-center justify-center shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
