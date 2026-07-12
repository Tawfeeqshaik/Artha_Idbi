/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle, Info, Sparkles, HelpCircle } from "lucide-react";

interface ExplainModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: string;
  contextName: string;
  userData?: any;
}

export default function ExplainModal({
  isOpen,
  onClose,
  recommendation,
  contextName,
  userData,
}: ExplainModalProps) {
  const [loading, setLoading] = useState(true);
  const [explanation, setExplanation] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setError(false);
    setExplanation("");

    // Contact our server-side explanation engine
    fetch("/api/advisor/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recommendation, contextName, userData }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        setExplanation(data.explanation || "");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading explanation:", err);
        setError(true);
        setLoading(false);
      });
  }, [isOpen, recommendation, contextName]);

  // Simple, elegant custom markdown formatter for bolding and bullets
  const formatMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;

      // Match bullets
      if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
        const content = trimmed.substring(1).trim();
        return (
          <li key={idx} className="flex items-start gap-2 text-slate-300 text-sm mb-2.5">
            <span className="text-idbi-orange mt-1.5 font-bold">•</span>
            <span>{parseBoldText(content)}</span>
          </li>
        );
      }

      // Match headers e.g. ### Header
      if (trimmed.startsWith("#")) {
        const cleanHeader = trimmed.replace(/^#+\s*/, "");
        return (
          <h4 key={idx} className="text-idbi-orange font-semibold text-base mt-4 mb-2 font-sans flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            {cleanHeader}
          </h4>
        );
      }

      // Default paragraph
      return (
        <p key={idx} className="text-slate-300 text-sm leading-relaxed mb-3">
          {parseBoldText(trimmed)}
        </p>
      );
    });
  };

  // Utility to parse **bold** words
  const parseBoldText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, i) =>
      i % 2 === 1 ? <strong key={i} className="text-white font-bold">{part}</strong> : part
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop overlay */}
          <motion.div
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            id="backdrop"
          />

          {/* Modal Container */}
          <motion.div
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-2xl backdrop-blur-xl"
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-idbi-orange/10 p-2 text-idbi-orange">
                  <HelpCircle className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-sans">
                    Why this suggestion?
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Artha AI Explainable Intelligence
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg border border-slate-800 bg-slate-950/40 p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                id="btn-close-modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content body */}
            <div className="mt-4 max-h-[350px] overflow-y-auto pr-1">
              {/* Original recommendation panel */}
              <div className="mb-4 rounded-xl border border-idbi-orange/10 bg-idbi-orange/5 p-4.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-idbi-orange font-mono flex items-center gap-1 mb-1">
                  <Info className="w-3.5 h-3.5" /> Core Suggestion ({contextName})
                </span>
                <p className="text-slate-200 text-sm italic">
                  "{recommendation}"
                </p>
              </div>

              {/* AI Deconstruction */}
              {loading ? (
                <div className="space-y-3 py-4">
                  <div className="h-4 w-1/3 bg-slate-800 animate-pulse rounded" />
                  <div className="h-3 w-full bg-slate-800 animate-pulse rounded" />
                  <div className="h-3 w-5/6 bg-slate-800 animate-pulse rounded" />
                  <div className="h-3 w-4/5 bg-slate-800 animate-pulse rounded" />
                  <div className="h-4 w-1/4 bg-slate-800 animate-pulse rounded mt-6" />
                  <div className="h-3 w-full bg-slate-800 animate-pulse rounded" />
                  <div className="h-3 w-11/12 bg-slate-800 animate-pulse rounded" />
                </div>
              ) : error ? (
                <div className="text-slate-400 text-sm py-4">
                  I was unable to pull the math variables at this second. However, based on Indian standard planning:
                  <ul className="mt-2 space-y-1.5 list-disc pl-4 text-xs">
                    <li>Recommended Term coverage is <strong className="text-white">10x annual gross salary</strong>.</li>
                    <li>Compounding at <strong className="text-white">12.5%</strong> mutual funds takes roughly 5.8 years to double your corpus.</li>
                    <li>Emergency reserve target is <strong className="text-white">6 months of fixed expenditures</strong>.</li>
                  </ul>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none">
                  {formatMarkdown(explanation)}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end border-t border-slate-800/80 pt-4">
              <button
                onClick={onClose}
                className="rounded-xl bg-idbi-orange px-4.5 py-2 text-xs font-semibold text-white transition hover:bg-idbi-orange/90"
                id="btn-understand"
              >
                I Understand
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
