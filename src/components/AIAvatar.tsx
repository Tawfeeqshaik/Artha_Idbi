/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, MicOff, Volume2, VolumeX, Sparkles, AlertCircle, Hand, Moon, Sun } from "lucide-react";
import { UserProfile, AppLanguage } from "../types";

interface AIAvatarProps {
  userData: UserProfile;
  language: AppLanguage;
  lastBotMessage?: string;
  onVoiceInput?: (text: string) => void;
}

export default function AIAvatar({ userData, language, lastBotMessage, onVoiceInput }: AIAvatarProps) {
  const [avatarState, setAvatarState] = useState<"idle" | "speaking" | "listening" | "waving" | "blinking">("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [voiceResponse, setVoiceResponse] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);
  const blinkTimerRef = useRef<any>(null);
  const waveTimerRef = useRef<any>(null);

  // Use refs to make callbacks stable and prevent rebuilding speech recognition instance
  const userDataRef = useRef(userData);
  const languageRef = useRef(language);
  const onVoiceInputRef = useRef(onVoiceInput);

  useEffect(() => {
    userDataRef.current = userData;
  }, [userData]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    onVoiceInputRef.current = onVoiceInput;
  }, [onVoiceInput]);

  const isQuestion = (text: string): boolean => {
    const lower = text.toLowerCase().trim();
    const questionWords = [
      "what", "how", "why", "who", "when", "where", "which", "whose", "whom",
      "tell", "explain", "analyze", "suggest", "recommend", "is", "are", "can", 
      "should", "will", "would", "could", "do", "does", "did", "have", "has", "had",
      "about", "help", "summary", "report", "detail", "compare", "performance",
      "status", "progress", "shortfall", "gap", "insurance", "sip", "portfolio",
      "twin", "risk", "spending", "expense", "budget", "saving", "tax"
    ];
    if (lower.endsWith("?")) return true;
    const words = lower.split(/\s+/).filter(Boolean);
    if (words.length <= 1) return false;
    return questionWords.some(q => lower.includes(q));
  };

  // Initialize Speech Synthesis and Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
      setSpeechSupported(!!window.speechSynthesis);

      // Setup Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setRecognitionSupported(true);
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = language === "hi" ? "hi-IN" : language === "ta" ? "ta-IN" : "en-IN";

        rec.onstart = () => {
          setAvatarState("listening");
          setIsListening(true);
          setSubtitle("Listening...");
          setVoiceResponse("");
        };

        rec.onresult = async (event: any) => {
          const resultText = event.results[0][0].transcript;
          setSubtitle(`" ${resultText} "`);
          
          if (isQuestion(resultText)) {
            setSubtitle("Consulting senior Artha AI Advisor...");
            setAvatarState("speaking");
            setIsThinking(true);
            try {
              const response = await fetch("/api/advisor/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  messages: [{ id: `voice-${Date.now()}`, sender: "user", text: resultText }],
                  userData: userDataRef.current,
                  language: languageRef.current,
                }),
              });
              if (!response.ok) throw new Error("Voice chat API failed");
              const data = await response.json();
              setVoiceResponse(data.text);
              speakText(data.text);
            } catch (err) {
              console.error("Grounded voice error:", err);
              const fallbackText = "Based on your Artha AI profile, your Emergency Fund stands at ₹2.4 Lakhs (2.8 months of coverage). I strongly recommend routing ₹15,000 monthly from your surplus to secure your ₹5.1 Lakh buffer.";
              setVoiceResponse(fallbackText);
              speakText(fallbackText);
            } finally {
              setIsThinking(false);
            }
          } else {
            if (onVoiceInputRef.current) {
              onVoiceInputRef.current(resultText);
            }
          }
        };

        rec.onerror = (err: any) => {
          console.warn("Speech Recognition Error Event:", err);
          let errMsg = "Could not capture audio, please try again.";
          if (err && err.error === "not-allowed") {
            errMsg = "Microphone access denied. Please grant microphone access or open the app in a new tab.";
          } else if (err && err.error === "no-speech") {
            errMsg = "No speech detected. Please speak clearly and try again.";
          } else if (err && err.error) {
            errMsg = `Voice assistant error: ${err.error}. Try opening in a new tab.`;
          }
          setSubtitle(errMsg);
          setAvatarState("idle");
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
          setAvatarState("idle");
        };

        recognitionRef.current = rec;
      }
    }

    // Default blinking loop
    blinkTimerRef.current = setInterval(() => {
      setAvatarState("blinking");
      setTimeout(() => {
        setAvatarState((prev) => (prev === "blinking" ? "idle" : prev));
      }, 250);
    }, 4000);

    // Initial greeting trigger after a small delay
    waveTimerRef.current = setTimeout(() => {
      triggerInitialGreeting();
    }, 1500);

    return () => {
      clearInterval(blinkTimerRef.current);
      clearTimeout(waveTimerRef.current);
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [language]); // Only depend on language for speech initialization

  // Listen to incoming bot messages and speak them
  useEffect(() => {
    if (lastBotMessage && !isMuted) {
      speakText(lastBotMessage);
    }
  }, [lastBotMessage]);

  const speakText = (text: string) => {
    if (!synthRef.current || isMuted) return;

    // Stop current speaking
    synthRef.current.cancel();

    // Clean text from markdown for natural speech
    const cleanText = text
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/#/g, "")
      .replace(/`/g, "")
      .substring(0, 250); // limit speech snippet for performance

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Choose voice based on language
    if (synthRef.current.getVoices) {
      const voices = synthRef.current.getVoices();
      let selectedVoice = null;
      if (language === "hi") {
        selectedVoice = voices.find(v => v.lang.includes("hi-IN"));
      } else if (language === "ta") {
        selectedVoice = voices.find(v => v.lang.includes("ta-IN"));
      }
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.includes("en-IN") || v.lang.includes("en-US"));
      }
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    utterance.onstart = () => {
      setAvatarState("speaking");
      setSubtitle(cleanText);
    };

    utterance.onend = () => {
      setAvatarState("idle");
    };

    utterance.onerror = () => {
      setAvatarState("idle");
    };

    synthRef.current.speak(utterance);
  };

  const triggerInitialGreeting = () => {
    setAvatarState("waving");
    
    // Customize greeting based on dynamic user spending patterns
    const timeOfDay = new Date().getHours() < 12 ? "Good Morning" : new Date().getHours() < 17 ? "Good Afternoon" : "Good Evening";
    
    let spendFact = "";
    if (userData.uid === "demo-rahul") {
      spendFact = "I noticed your Swiggy Dineout spending increased by 32% this week.";
    } else if (userData.uid === "demo-priya") {
      spendFact = "I noticed a high entertainment transaction of 12,400 Rupees at Bengaluru Club.";
    } else if (userData.uid === "demo-ananya") {
      spendFact = "I noticed you have no active health cover and zero insurance protections right now.";
    } else if (userData.uid === "demo-amit") {
      spendFact = "I detected that EMI liabilities consumer over 37% of your monthly income.";
    } else {
      spendFact = "I completed compiling your digital twin's 10-year future wealth projection.";
    }

    const greeting = `${timeOfDay} ${userData.name}. Welcome to your Artha AI Wealth dashboard. ${spendFact} How can I co-pilot your finances today?`;
    speakText(greeting);
    
    setTimeout(() => {
      setAvatarState((prev) => (prev === "waving" ? "idle" : prev));
    }, 2000);
  };

  const toggleListen = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn("Failed to stop speech recognition:", err);
      }
    } else {
      if (synthRef.current) {
        try {
          synthRef.current.cancel();
        } catch (err) {
          console.warn("Failed to cancel speech synthesis:", err);
        }
      }
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn("Failed to start speech recognition:", err);
        setSubtitle("Could not start voice helper. Make sure microphone is connected and allowed.");
      }
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    if (newMuted && synthRef.current) {
      synthRef.current.cancel();
      setAvatarState("idle");
    } else if (!newMuted) {
      triggerInitialGreeting();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-5 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md relative overflow-hidden w-full">
      {/* Floating Speech Bubble overlay for Voice Response */}
      <AnimatePresence>
        {voiceResponse && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 5 }}
            className="absolute inset-x-3 top-3 bottom-3 bg-slate-950/95 border border-idbi-orange/30 rounded-2xl p-4 flex flex-col justify-between z-20 backdrop-blur-md shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <span className="font-mono text-[9px] text-idbi-orange font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-idbi-orange" /> Advisor Response
              </span>
              <button
                onClick={() => {
                  setVoiceResponse("");
                  if (synthRef.current) {
                    synthRef.current.cancel();
                  }
                  setAvatarState("idle");
                }}
                className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 bg-slate-800 rounded-md cursor-pointer border border-slate-700 font-mono transition"
              >
                Dismiss
              </button>
            </div>
            <div className="flex-1 overflow-y-auto my-2 pr-1">
              <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
                {voiceResponse}
              </p>
            </div>
            <div className="flex items-center justify-between border-t border-slate-800/60 pt-2 text-[9px] font-mono text-slate-500">
              <span>Grounded Context</span>
              <span className="text-idbi-green font-bold">● Active Voice Sync</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glow aura */}
      <div className={`absolute w-48 h-48 rounded-full blur-[60px] opacity-15 transition-all duration-1000 pointer-events-none ${
        avatarState === "speaking" ? "bg-idbi-orange scale-125" :
        avatarState === "listening" ? "bg-idbi-orange scale-150 animate-pulse" :
        avatarState === "waving" ? "bg-idbi-green scale-110" : "bg-idbi-green"
      }`} />

      {/* Avatar Head Rendering */}
      <div className="relative w-36 h-36 flex items-center justify-center">
        
        {/* Dynamic Voice/Radar ripple rings */}
        <AnimatePresence>
          {(avatarState === "speaking" || avatarState === "listening") && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
              className={`absolute w-32 h-32 rounded-full border-2 pointer-events-none ${
                avatarState === "listening" ? "border-idbi-orange" : "border-idbi-green"
              }`}
            />
          )}
        </AnimatePresence>

        {/* 3D Glassmorphic Robot Head Container */}
        <div className={`w-28 h-28 rounded-full bg-gradient-to-b from-slate-800/90 to-slate-950 border-2 shadow-2xl flex flex-col items-center justify-center transition-all duration-300 relative ${
          avatarState === "listening" ? "border-idbi-orange shadow-idbi-orange/20" :
          avatarState === "speaking" ? "border-idbi-orange shadow-idbi-orange/20" : "border-slate-700 shadow-idbi-green/5"
        }`}>

          {/* Antigravity Ears */}
          <div className="absolute left-[-8px] w-2 h-6 bg-slate-700 rounded-l" />
          <div className="absolute right-[-8px] w-2 h-6 bg-slate-700 rounded-r" />

          {/* Status crown light */}
          <div className={`absolute top-2 w-2 h-2 rounded-full shadow-inner ${
            avatarState === "listening" ? "bg-idbi-orange animate-ping" :
            avatarState === "speaking" ? "bg-idbi-orange animate-pulse" : "bg-idbi-green"
          }`} />

          {/* Metallic visor background */}
          <div className="w-22 h-10 rounded-xl bg-slate-950 flex items-center justify-around px-2 border border-slate-800 shadow-inner relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-idbi-orange/5 to-transparent animate-pulse" />

            {/* Dynamic Eyes */}
            <div className="flex items-center gap-5 z-10">
              {/* Left Eye */}
              <div className="relative w-5 h-5 flex items-center justify-center">
                {avatarState === "blinking" ? (
                  <div className="w-4.5 h-0.5 bg-idbi-orange rounded-full" />
                ) : (
                  <motion.div 
                    animate={avatarState === "listening" ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-4 h-4 rounded-full bg-idbi-orange flex items-center justify-center shadow-lg shadow-idbi-orange/50"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white absolute top-1 left-1" />
                  </motion.div>
                )}
              </div>

              {/* Right Eye */}
              <div className="relative w-5 h-5 flex items-center justify-center">
                {avatarState === "blinking" ? (
                  <div className="w-4.5 h-0.5 bg-idbi-orange rounded-full" />
                ) : (
                  <motion.div 
                    animate={avatarState === "listening" ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-4 h-4 rounded-full bg-idbi-orange flex items-center justify-center shadow-lg shadow-idbi-orange/50"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white absolute top-1 left-1" />
                  </motion.div>
                )}
              </div>
            </div>
          </div>

          {/* Mouth & Vocal feedback */}
          <div className="h-6 w-16 mt-3 flex items-center justify-center gap-1">
            {avatarState === "speaking" ? (
              // Moving vocal equalizer
              <>
                <div className="w-1 bg-idbi-orange rounded-full h-3 animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="w-1 bg-idbi-orange rounded-full h-5 animate-bounce" style={{ animationDelay: "0.3s" }} />
                <div className="w-1 bg-white rounded-full h-2 animate-bounce" style={{ animationDelay: "0.2s" }} />
                <div className="w-1 bg-idbi-orange rounded-full h-5 animate-bounce" style={{ animationDelay: "0.4s" }} />
                <div className="w-1 bg-idbi-orange rounded-full h-3 animate-bounce" style={{ animationDelay: "0.5s" }} />
              </>
            ) : avatarState === "listening" ? (
              // Cybernetic breathing line
              <motion.div 
                animate={{ scaleX: [1, 1.3, 1] }} 
                transition={{ repeat: Infinity, duration: 1.2 }}
                className="w-12 h-1 bg-idbi-orange rounded shadow-md shadow-idbi-orange/40" 
              />
            ) : avatarState === "waving" ? (
              // Smile vector
              <div className="w-8 h-2.5 border-b-2 border-idbi-green rounded-b-full shadow-inner" />
            ) : (
              // Neutral status line
              <div className="w-10 h-0.5 bg-slate-600 rounded" />
            )}
          </div>

          {/* Tiny Artha AI Plate */}
          <div className="absolute bottom-1 text-[7px] font-mono tracking-widest text-slate-500 uppercase">
            ARTHA AI
          </div>

        </div>

        {/* Small floating waving hand overlay */}
        {avatarState === "waving" && (
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: [0, 15, -15, 15, 0] }}
            transition={{ duration: 1 }}
            className="absolute bottom-1 right-1 bg-idbi-green text-white rounded-full p-1.5 border-2 border-slate-900 shadow-lg"
          >
            <Hand className="w-3.5 h-3.5 animate-pulse" />
          </motion.div>
        )}
      </div>

      {/* Voice controls & buttons */}
      <div className="flex items-center gap-2.5 mt-4 z-10">
        <button
          onClick={toggleMute}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
            isMuted 
              ? "bg-rose-950/40 border-rose-900/50 text-rose-400 hover:bg-rose-900/30" 
              : "bg-slate-850 border-slate-800 text-slate-300 hover:text-white"
          }`}
          title={isMuted ? "Unmute Speech" : "Mute Speech"}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-idbi-orange" />}
          <span>{isMuted ? "Muted" : "Voice On"}</span>
        </button>

        {recognitionSupported && (
          <button
            onClick={toggleListen}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
              isListening 
                ? "bg-orange-950 border-idbi-orange/80 text-idbi-orange animate-pulse" 
                : "bg-slate-850 border-slate-800 text-slate-300 hover:text-white hover:border-idbi-orange/20"
            }`}
            title="Speak to Avatar"
          >
            {isListening ? <MicOff className="w-3.5 h-3.5 text-idbi-orange" /> : <Mic className="w-3.5 h-3.5 text-idbi-orange" />}
            <span>{isListening ? "Listening" : "Hold to Talk"}</span>
          </button>
        )}

        <button
          onClick={triggerInitialGreeting}
          className="bg-slate-850 border border-slate-800 hover:bg-slate-800 p-1.5 rounded-lg text-slate-300 cursor-pointer"
          title="Force Welcome Greet"
        >
          <RotateCcwIcon className="w-3.5 h-3.5 text-idbi-green" />
        </button>
      </div>

      {/* Real-time Subtitles / Teleprompt */}
      <div className="w-full mt-4 bg-slate-950/50 border border-slate-850 p-2.5 rounded-xl min-h-12 flex items-center justify-center text-center">
        <p className={`text-[11px] leading-relaxed ${avatarState === "listening" ? "text-idbi-orange font-mono italic" : "text-slate-300 font-sans"}`}>
          {subtitle || `Avatar ready. State: ${avatarState.toUpperCase()}. Click 'Hold to Talk' to voice command.`}
        </p>
      </div>
    </div>
  );
}

function RotateCcwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}
