/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Lock, 
  Mail, 
  User, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  RotateCcw,
  UserCheck,
  TrendingUp,
  Coins,
  AlertTriangle,
  ChevronRight,
  ChevronLeft
} from "lucide-react";
import { dbService, DEMO_USERS } from "../lib/firebase";

interface AuthScreenProps {
  onAuthSuccess: (user: any) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        const user = await dbService.signIn(email, password);
        onAuthSuccess(user);
      } else if (mode === "signup") {
        if (!name.trim()) throw new Error("Full name is required to create your Artha AI profile.");
        if (password.length < 6) throw new Error("Password must be at least 6 characters.");
        const user = await dbService.signUp(email, password, name);
        onAuthSuccess(user);
      } else {
        await dbService.resetPassword(email);
        setResetSent(true);
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const user = await dbService.googleLogin();
      onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message || "Google Login could not be initiated.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (uid: string) => {
    setLoading(true);
    try {
      localStorage.setItem("idbi_active_uid", uid);
      dbService.onAuthStateChanged((user) => {
        if (user && user.uid === uid) {
          onAuthSuccess(user);
        }
      });
    } catch (err) {
      setError("Demo switch failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row relative overflow-hidden">
      {/* Visual background decorations */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-idbi-orange/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/10 blur-[100px] pointer-events-none" />

      {/* Left Panel: Hero and Theme branding */}
      <div className="w-full md:w-1/2 flex flex-col justify-between p-8 md:p-16 border-b md:border-b-0 md:border-r border-slate-800/60 relative bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-2xl bg-gradient-to-tr from-idbi-orange to-idbi-green p-3 text-white shadow-xl shadow-idbi-orange/20">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs font-mono tracking-widest text-idbi-orange font-bold uppercase">Your AI Co-Pilot</span>
            <h1 className="text-xl font-black text-white tracking-tight leading-none">Artha AI</h1>
          </div>
        </div>

        <div className="my-12 md:my-0 space-y-6 max-w-md">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Your AI Co-Pilot for Wealth
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Welcome to the future of retail banking. Speak, listen, and co-pilot your investments with an advanced AI Digital Twin that understands your cashflows, predicts future wealth, and recommends optimal strategies.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/40">
            <div>
              <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">Durable Security</h4>
              <p className="text-xs text-slate-300">Biometric & PIN Enabled</p>
            </div>
            <div>
              <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider">AI Grounding</h4>
              <p className="text-xs text-slate-300">Grounded in User Data</p>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 font-mono">
          © 2026 Artha AI. All Rights Reserved.
        </div>
      </div>

      {/* Right Panel: Auth forms and Demo switcher */}
      <div className="w-full md:w-1/2 flex flex-col justify-center p-6 md:p-12 overflow-y-auto max-h-screen">
        <div className="max-w-md w-full mx-auto space-y-6 py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div>
                {mode === "forgot" && (
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setMode("login");
                    }}
                    className="inline-flex items-center gap-1 text-xs font-mono text-slate-500 hover:text-slate-300 mb-4 transition cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Back to Sign In
                  </button>
                )}
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {mode === "login" && "Welcome Back"}
                  {mode === "signup" && "Create Account"}
                  {mode === "forgot" && "Reset Password"}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {mode === "login" && "Sign in to access your synchronized wealth dashboard."}
                  {mode === "signup" && "Register to secure your AI Digital Twin portfolio."}
                  {mode === "forgot" && "Enter your email to receive a password recovery link."}
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {resetSent && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                  A password recovery link has been dispatched to your email address. Please inspect your inbox.
                </div>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-4">
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Rahul Sharma"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-idbi-orange focus:ring-1 focus:ring-idbi-orange/20 rounded-xl py-3 pl-10 pr-4 text-xs text-white outline-none transition"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-400">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yourname@domain.com"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-idbi-orange focus:ring-1 focus:ring-idbi-orange/20 rounded-xl py-3 pl-10 pr-4 text-xs text-white outline-none transition"
                    />
                  </div>
                </div>

                {mode !== "forgot" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-mono text-slate-400">Password</label>
                      {mode === "login" && (
                        <button
                          type="button"
                          onClick={() => setMode("forgot")}
                          className="text-[11px] font-mono text-idbi-orange hover:underline"
                        >
                          Forgot?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-idbi-orange focus:ring-1 focus:ring-idbi-orange/20 rounded-xl py-3 pl-10 pr-10 text-xs text-white outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-idbi-orange hover:bg-idbi-orange/90 text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-lg shadow-idbi-orange/10 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {mode === "login" && "Sign In"}
                      {mode === "signup" && "Create Account"}
                      {mode === "forgot" && "Send Recovery Link"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {mode !== "forgot" && (
                <>
                  <div className="relative my-4 flex items-center justify-center">
                    <div className="absolute w-full border-t border-slate-800/80" />
                    <span className="relative bg-slate-950 px-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">Or Sign In With</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    <button
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-850 border border-slate-800/80 rounded-xl py-2.5 text-xs font-semibold cursor-pointer text-slate-300 transition"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      Google
                    </button>
                  </div>

                  <div className="relative my-4 flex items-center justify-center">
                    <div className="absolute w-full border-t border-slate-800/80" />
                    <span className="relative bg-slate-950 px-3 text-[10px] font-mono text-slate-400 uppercase tracking-widest text-center">
                      Quick Entrance Sandbox Profiles
                    </span>
                  </div>

                  {/* High Quality, Minimalist and Extremely Compact Sandbox Badges */}
                  <div className="grid grid-cols-2 gap-2">
                    {DEMO_USERS.map((demoUserObj) => {
                      const isRahul = demoUserObj.uid === "demo-rahul";
                      const isPriya = demoUserObj.uid === "demo-priya";
                      return (
                        <button
                          key={demoUserObj.uid}
                          type="button"
                          onClick={() => handleDemoLogin(demoUserObj.uid)}
                          className={`flex flex-col items-start p-2.5 rounded-xl border text-left cursor-pointer transition ${
                            isRahul 
                              ? "border-emerald-950 bg-emerald-950/20 hover:bg-emerald-950/40 hover:border-emerald-500/40" 
                              : isPriya 
                              ? "border-idbi-orange/20 bg-idbi-orange/5 hover:bg-idbi-orange/10 hover:border-idbi-orange/40"
                              : "border-slate-800 bg-slate-900/40 hover:bg-slate-850/60 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs font-bold text-slate-200">{demoUserObj.name}</span>
                          </div>
                          <span className="text-[9px] text-slate-500 font-sans mt-0.5">
                            {demoUserObj.occupation.split(" ").slice(-2).join(" ")} ({demoUserObj.riskCategory})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              <div className="text-center pt-2">
                <button
                  onClick={() => {
                    setError("");
                    setMode(mode === "login" ? "signup" : "login");
                  }}
                  className="text-xs text-slate-400 hover:text-white transition font-sans"
                >
                  {mode === "login" ? "Don't have an Artha AI account? " : "Already have an account? "}
                  <span className="text-idbi-orange font-bold underline">
                    {mode === "login" ? "Create profile" : "Sign in"}
                  </span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
