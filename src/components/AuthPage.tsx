/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { ShieldCheck, Mail, Lock, User, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

interface AuthPageProps {
  onAuthSuccess: (user: { id: number; username: string; email: string }, token: string) => void;
  defaultMode?: "login" | "signup";
}

export default function AuthPage({ onAuthSuccess, defaultMode = "login" }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  const clearForm = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setErrorText("");
    setSuccessText("");
  };

  const toggleMode = () => {
    setMode(prev => prev === "login" ? "signup" : "login");
    clearForm();
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText("");
    setSuccessText("");

    // Validate inputs
    if (mode === "signup") {
      if (!username.trim() || !email.trim() || !password) {
        setErrorText("All credentials fields must be provided.");
        return;
      }
      if (username.length < 3) {
        setErrorText("Username must be at least 3 characters.");
        return;
      }
      if (!email.includes("@")) {
        setErrorText("Please enter a valid email address.");
        return;
      }
      if (password.length < 5) {
        setErrorText("Password must be at least 5 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorText("Passwords do not match.");
        return;
      }
    } else {
      if (!emailOrUsernameInput().trim() || !password) {
        setErrorText("Please provide your login credentials.");
        return;
      }
    }

    setIsLoading(true);

    try {
      const endpoint = mode === "signup" ? "/api/auth/register" : "/api/auth/login";
      const payload = mode === "signup" 
        ? { username, email, password } 
        : { emailOrUsername: username || email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `${mode === "signup" ? "Registration" : "Login"} failed.`);
      }

      setSuccessText(mode === "signup" ? "Account created successfully! Loading your vault..." : "Logged in successfully!");
      
      setTimeout(() => {
        onAuthSuccess(data.user, data.token);
      }, 1000);

    } catch (err: any) {
      console.error("Auth process error:", err);
      setErrorText(err.message || "Something went wrong. Please verify network and credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const emailOrUsernameInput = () => {
    return username || email;
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12" id="authentication-panel">
      
      {/* Container Card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-8 relative overflow-hidden text-left">
        
        {/* Subtle accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-650 to-blue-500" />

        {/* Title */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-650 flex items-center justify-center text-white mx-auto shadow-md shadow-blue-500/10">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl sm:text-2xl font-display font-extrabold text-slate-850">
            {mode === "login" ? "Verify Your Account" : "Join the Shield Coalition"}
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm font-semibold max-w-xs mx-auto">
            {mode === "login" 
              ? "Sign in to access your personal workspace, track scans, and keep analysis history cleanly." 
              : "Register your real-time secure context to start fact-checking with zero dummy data."}
          </p>
        </div>

        {/* Alerts Banner */}
        {errorText && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs sm:text-sm font-bold flex items-start gap-2 animate-shake">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorText}</span>
          </div>
        )}

        {successText && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs sm:text-sm font-bold flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successText}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          
          {mode === "signup" ? (
            <>
              {/* Username Input for Registration */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block pl-1">
                  User Handle Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. john_doe"
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-205 py-3 pl-10 pr-4 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-semibold"
                  />
                </div>
              </div>

              {/* Email Input for Registration */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block pl-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. user@domain.com"
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-205 py-3 pl-10 pr-4 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-semibold"
                  />
                </div>
              </div>
            </>
          ) : (
            /* Combined Login Identifier Input */
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block pl-1">
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="john_doe or user@domain.com"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-205 py-3 pl-10 pr-4 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-semibold"
                />
              </div>
            </div>
          )}

          {/* Password Input */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block pl-1">
              Secret Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-205 py-3 pl-10 pr-4 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-semibold"
              />
            </div>
          </div>

          {/* Confirm Password (only on Register) */}
          {mode === "signup" && (
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block pl-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-205 py-3 pl-10 pr-4 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-semibold"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-md cursor-pointer transition-all active:scale-[0.98] disabled:bg-slate-350 disabled:cursor-not-allowed text-xs sm:text-sm"
          >
            {isLoading ? "Validating securely..." : mode === "login" ? "Verify Key Login" : "Generate Account Signature"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Toggle links */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500 font-semibold">
            {mode === "login" ? "Are you new to Truth Shield?" : "Already possess secure access key?"}{" "}
            <button
              onClick={toggleMode}
              className="text-blue-600 hover:text-blue-800 underline font-extrabold cursor-pointer hover:decoration-blue-800"
            >
              {mode === "login" ? "Create clean account" : "Log in to your vault"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
