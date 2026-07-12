# Artha AI 🧭
### Your AI Co-Pilot for Wealth — built for IDBI Bank

**🔗 Live Demo:** [idbi-hackathon-iota.vercel.app](https://idbi-hackathon-iota.vercel.app/)

> *Artha* (अर्थ) — one of the four Purusharthas in Indian philosophy, meaning wealth, prosperity, and purpose. Artha AI is a conversational, avatar-led wealth advisor designed to sit inside IDBI Bank's mobile app and turn every customer's transaction, investment, and spending history into personalized, explainable financial guidance — available 24/7.

<!-- Add a screenshot here, e.g.: -->
<!-- ![Artha AI Dashboard](your-screenshot-url-here) -->

---

## Problem Statement

**Track 01 — Wealth Advisory Conversational AI, Mobile Banking**

Wealth management and advisory services remain fragmented and largely inaccessible to most customers. The absence of a system that understands a customer's actual investment behavior and spending habits limits banks' ability to offer timely, personalized, data-driven guidance.

Artha AI addresses this by grounding every recommendation in the customer's real transaction and portfolio data — not generic financial advice, but guidance computed from their numbers.

---

## What It Does

Artha AI acts as a private wealth manager available inside the IDBI Bank app, combining a conversational AI avatar with a full suite of wealth management tools:

| Feature | Description |
|---|---|
| **AI Avatar & Voice** | Talk or type to your advisor. Ask questions like *"Can I afford to increase my SIP?"* and get answers grounded in your actual income, spending, and goals — not generic responses. |
| **Wealth Dashboard** | Net worth, savings rate, credit score, and a Financial Health Score (0–100) broken down across savings efficiency, debt-to-income, emergency buffer, investment compounding, and insurance coverage. |
| **Spending Analysis** | Auto-categorized transactions with AI-flagged anomalies (e.g. "Food spend up 32% this month") and a full category breakdown. |
| **Talk to Advisor** | Conversational chat grounded in the user's live financial data — every answer cites real numbers. |
| **Portfolio Rebalancing** | Detects portfolio drift from the user's target risk allocation and recommends specific buy/sell trades with reasoning. |
| **Goal Planning** | Create financial goals (home, retirement, education, etc.); AI computes the required monthly SIP, inflation-adjusted target, and probability of success. |
| **Financial Digital Twin** | A live what-if simulator — adjust SIP, income, or life events (job loss, salary hike, big purchase) and instantly see the impact on long-term net worth projections. |
| **Stress Test** | Simulates emergency scenarios (job loss, medical emergency, salary cut) against the user's real emergency fund and expenses. |
| **Risk Profiling** | Interactive questionnaire producing a Conservative / Balanced / Growth / Aggressive risk category with plain-language reasoning. |
| **Tax Planner (80C)** | Tracks Section 80C utilization against the ₹1.5L limit and recommends specific investments to close the gap. |
| **Insurance Gap Analysis** | Compares current coverage to AI-recommended coverage and quantifies the shortfall. |
| **Weekly Report** | AI-generated weekly summary of spending, goal progress, and one prioritized action item. |
| **Family Wealth Synchronizer** | Consolidated household view — combined net worth, emergency fund, and investments across linked family members. |
| **RM Command (Internal)** | A separate view for IDBI Relationship Managers — AI-generated client briefs and talking points ahead of a customer meeting. |
| **"Why this suggestion?"** | Every AI recommendation can be expanded to show the underlying data and reasoning behind it — built for trust and transparency. |

---

## Try It

The login screen includes a **demo profile picker** with several pre-loaded customer personas of varying risk categories and net worths, so you can explore how Artha AI's guidance adapts to different financial situations without creating an account. A standard sign-up flow (with simulated OTP verification) is also available.

---

## Tech Stack

- **Frontend:** React, TailwindCSS, glassmorphism UI
- **AI:** Google Gemini API — grounded prompting (all insights computed from underlying mock financial data, not generated freely)
- **Built with:** Google AI Studio
- **Deployment:** Vercel
- **Data:** Realistic synthetic financial data (transactions, portfolio, goals, insurance) modeling real Indian customer profiles

---

## Design

- Dark navy glassmorphism base for a premium private-banking feel
- Accent palette drawn directly from IDBI Bank's brand identity: **Orange Passion (#F58220)** and **Observatory Green (#00836C)**
- Mobile-first, built for use inside an existing banking app shell

---

## Why Artha AI (and not just a chatbot)

Anyone can wrap a chatbot around a banking app. Artha AI is built to reason over the customer's actual data at every step — the Financial Health Score, the goal SIP calculations, the insurance gap, the rebalancing trades, and the digital twin projections are all computed from the user's own numbers, with an explanation available on demand. It's designed to function as an actual advisory layer, not a Q&A wrapper.

---

## Disclaimer

This is a hackathon prototype built for demonstration purposes. All financial data is synthetic. Artha AI does not provide real investment advice and is not connected to live banking systems.

---

## Team

Built for the **IDBI Bank Hackathon 2026** — Track 01: Wealth Advisory Conversational AI.
