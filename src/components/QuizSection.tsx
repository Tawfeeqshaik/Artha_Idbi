/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { RISK_QUIZ_QUESTIONS, getRiskProfile } from "../data";
import { RiskProfile, AppLanguage, RiskCategory } from "../types";
import { ChevronRight, RotateCcw, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import { I18N_TRANSLATIONS } from "../data";

interface QuizSectionProps {
  language: AppLanguage;
  onQuizComplete: (profile: RiskProfile) => void;
  currentProfile?: RiskCategory;
}

export default function QuizSection({
  language,
  onQuizComplete,
  currentProfile = "Balanced",
}: QuizSectionProps) {
  const t = I18N_TRANSLATIONS[language];
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizFinished, setQuizFinished] = useState(false);
  const [calculatedProfile, setCalculatedProfile] = useState<RiskProfile | null>(null);

  const handleOptionSelect = (questionId: number, score: number) => {
    const updatedAnswers = { ...answers, [questionId]: score };
    setAnswers(updatedAnswers);

    if (currentIdx < RISK_QUIZ_QUESTIONS.length - 1) {
      setTimeout(() => {
        setCurrentIdx(currentIdx + 1);
      }, 300);
    } else {
      // Finished all questions! Compute score
      const totalScore = Object.keys(updatedAnswers).reduce((sum, key) => sum + updatedAnswers[Number(key)], 0);
      const res = getRiskProfile(totalScore);
      const profile: RiskProfile = {
        category: res.category,
        score: totalScore,
        description: res.description,
        suggestedAllocation: res.suggestedAllocation,
      };
      setCalculatedProfile(profile);
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setCurrentIdx(0);
    setQuizFinished(false);
    setCalculatedProfile(null);
  };

  const handleSaveResult = () => {
    if (calculatedProfile) {
      onQuizComplete(calculatedProfile);
    }
  };

  const currentQuestion = RISK_QUIZ_QUESTIONS[currentIdx];
  const progressPercent = Math.round(((currentIdx + 1) / RISK_QUIZ_QUESTIONS.length) * 100);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white font-sans flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-idbi-orange" />
            {t.quiz}
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Assess and tune your investment parameters
          </p>
        </div>
        {!quizFinished && (
          <span className="text-xs font-mono text-idbi-orange bg-idbi-orange/10 px-2.5 py-1 rounded-full">
            Question {currentIdx + 1} of {RISK_QUIZ_QUESTIONS.length}
          </span>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!quizFinished ? (
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Progress bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Quiz Progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <motion.div
                  className="h-full bg-idbi-orange"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="min-h-[50px]">
              <h3 className="text-base font-semibold text-slate-100 font-sans leading-snug">
                {currentQuestion.text}
              </h3>
            </div>

            {/* Options list */}
            <div className="space-y-3">
              {currentQuestion.options.map((opt, oIdx) => {
                const isSelected = answers[currentQuestion.id] === opt.score;
                return (
                  <button
                    key={oIdx}
                    onClick={() => handleOptionSelect(currentQuestion.id, opt.score)}
                    className={`w-full text-left rounded-xl border p-4 text-xs leading-relaxed transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-idbi-orange bg-idbi-orange/10 text-white font-medium"
                        : "border-slate-800 bg-slate-950/20 text-slate-300 hover:border-slate-700 hover:bg-slate-800/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="pr-4">{opt.text}</span>
                      <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          calculatedProfile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="space-y-6"
            >
              {/* Results banner */}
              <div className="rounded-xl border border-idbi-orange/15 bg-idbi-orange/5 p-5 text-center">
                <Sparkles className="mx-auto w-8 h-8 text-amber-400 mb-2 animate-bounce" />
                <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest">
                  YOUR COMPUTE RISK LEVEL IS
                </span>
                <h3 className="text-2xl font-black font-sans text-white tracking-tight mt-1">
                  {calculatedProfile.category}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Cumulative Risk Index Score: {calculatedProfile.score} / 24
                </p>
              </div>

              {/* Description */}
              <div className="rounded-xl bg-slate-950/40 p-4 border border-slate-800/60">
                <p className="text-slate-300 text-xs leading-relaxed">
                  {calculatedProfile.description}
                </p>
              </div>

              {/* Suggested Asset allocation breakdown */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  AI SUITABILITY TARGET ALLOCATION:
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {calculatedProfile.suggestedAllocation.map((alloc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg bg-slate-950/20 p-2.5 border border-slate-800/40"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: alloc.color }}
                        />
                        <span className="text-[11px] text-slate-300 truncate font-sans">
                          {alloc.category}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-white font-mono">
                        {alloc.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleRestart}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/30 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Retake Quiz
                </button>
                <button
                  onClick={handleSaveResult}
                  className="flex-1 rounded-xl bg-idbi-orange hover:bg-idbi-orange/90 py-2.5 text-xs font-semibold text-white transition text-center shadow-lg shadow-idbi-orange/10 cursor-pointer"
                >
                  Apply & Save Risk Profile
                </button>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
