/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, AlertTriangle, BookOpen, Search, Sparkles, MessageCircle, 
  HelpCircle, ArrowUp, RefreshCw, BarChart2, Mail, Info, Compass
} from "lucide-react";
import { NewsAnalysis } from "./types";
import Header from "./components/Header";
import MainAnalyzer from "./components/MainAnalyzer";
import ResultSection from "./components/ResultSection";
import EducationPanel from "./components/EducationPanel";
import AssistantChat from "./components/AssistantChat";
import TechGridBackground from "./components/TechGridBackground";
import AuthPage from "./components/AuthPage";
import HistoryPage from "./components/HistoryPage";

export default function App() {
  // Page selector state: 'home' | 'analyze' | 'chat' | 'history' | 'auth'
  const [currentPage, setCurrentPage] = useState<'home' | 'analyze' | 'chat' | 'history' | 'auth'>('home');
  const [activeAnalysis, setActiveAnalysis] = useState<NewsAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [scansHistory, setScansHistory] = useState<NewsAnalysis[]>([]);
  
  // Real-time sandboxed account state with persistence
  const [currentUser, setCurrentUser] = useState<{ id: number; username: string; email: string } | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Sync token on initial mount
  useEffect(() => {
    const savedUser = localStorage.getItem("shield_user");
    const savedToken = localStorage.getItem("shield_token");
    if (savedUser && savedToken) {
      try {
        setCurrentUser(JSON.parse(savedUser));
        setAuthToken(savedToken);
      } catch (e) {
        localStorage.removeItem("shield_user");
        localStorage.removeItem("shield_token");
      }
    }
  }, []);

  // Monitor page scrolls for Back to Top buttons
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch scan logs when analysis finishes or credentials state toggles
  useEffect(() => {
    loadScanHistory();
  }, [activeAnalysis, authToken]);

  const loadScanHistory = async () => {
    try {
      const headers: Record<string, string> = {};
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }
      const res = await fetch("/api/history", { headers });
      if (res.ok) {
        const data = await res.json();
        setScansHistory(data);
      }
    } catch (err) {
      console.error("Failed to fetch historical scan items:", err);
    }
  };

  const handleExecuteAnalysis = async (analyzerInput: { headline: string; content: string; sourceUrl: string }) => {
    setIsLoading(true);
    setErrorText("");
    setActiveAnalysis(null);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }
      const response = await fetch("/api/analyze-news", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(analyzerInput)
      });

      if (!response.ok) {
        throw new Error("Analysis failed. Server was unable to parse input.");
      }

      const results: NewsAnalysis = await response.json();
      setActiveAnalysis(results);

      // Smooth scroll focus to results block
      setTimeout(() => {
        const resultElement = document.getElementById("result-dashboard");
        if (resultElement) {
          resultElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 200);

    } catch (err: any) {
      console.error("Analysis execution error:", err);
      setErrorText("Oops! We encountered an issue. Please check your internet connection and verify formatting or wait and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const scrollHomeToSection = (elementId: string) => {
    setCurrentPage('home');
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    }, 150);
  };

  const handleAuthSuccess = (user: { id: number; username: string; email: string }, token: string) => {
    setCurrentUser(user);
    setAuthToken(token);
    localStorage.setItem("shield_user", JSON.stringify(user));
    localStorage.setItem("shield_token", token);
    setCurrentPage("history");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem("shield_user");
    localStorage.removeItem("shield_token");
    setCurrentPage("home");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-200 selection:text-blue-900 relative flex flex-col justify-between">
      
      <div>
        {/* GLOBAL NAVIGATION HEADER BAR */}
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3.5 shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            
            {/* Logo/Identity with animated check */}
            <div 
              className="flex items-center gap-2.5 cursor-pointer text-left" 
              onClick={() => {
                setCurrentPage('home');
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-650 flex items-center justify-center text-white font-black shadow-md shadow-blue-500/15 group hover:scale-105 transition-transform duration-300">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-display font-black text-slate-850 tracking-tight text-sm sm:text-base flex items-center gap-1.5">
                  Truth Shield AI
                </span>
                <span className="text-[10px] text-blue-600 font-extrabold block -mt-1 uppercase tracking-widest font-mono">Fact-Checking Workspace</span>
              </div>
            </div>

            {/* Nav Switchers - Beautiful High-contrast Interactive Button Elements */}
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200">
              
              <button
                onClick={() => {
                  setCurrentPage('home');
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-extrabold transition-all duration-300 cursor-pointer ${
                  currentPage === 'home'
                    ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                }`}
              >
                <span>🏠</span>
                <span className="hidden md:inline">Home</span>
              </button>

              <button
                onClick={() => {
                  setCurrentPage('analyze');
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-extrabold transition-all duration-300 cursor-pointer ${
                  currentPage === 'analyze'
                    ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                }`}
              >
                <span>🛡️</span>
                <span className="hidden sm:inline">Analyze</span>
                <span className="inline sm:hidden">Scan</span>
              </button>

              <button
                onClick={() => {
                  setCurrentPage('chat');
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-extrabold transition-all duration-300 cursor-pointer ${
                  currentPage === 'chat'
                    ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                }`}
              >
                <span>💬</span>
                <span className="hidden sm:inline">Ask AI</span>
                <span className="inline sm:hidden">Chat</span>
              </button>

              <button
                onClick={() => {
                  setCurrentPage('history');
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-extrabold transition-all duration-300 cursor-pointer ${
                  currentPage === 'history'
                    ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
                }`}
              >
                <span>📂</span>
                <span className="hidden sm:inline">History</span>
                <span className="inline sm:hidden">Logs</span>
              </button>

            </div>

            {/* Premium user status or auth controls */}
            <div className="flex items-center gap-1.5">
              {currentUser ? (
                <div className="flex items-center gap-1.5">
                  <span className="hidden md:inline-block text-xs font-bold text-slate-600 bg-slate-100 border border-slate-250/70 px-2.5 py-1 rounded-md">
                    @{currentUser.username}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-slate-900 border border-slate-800 hover:bg-slate-850 text-white font-extrabold text-[10px] sm:text-xs px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl cursor-pointer transition-all active:scale-[0.98] shadow-3xs"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setCurrentPage('auth');
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-extrabold transition-all cursor-pointer ${
                    currentPage === 'auth'
                      ? "bg-blue-50 text-blue-600 border border-blue-100"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
                  }`}
                >
                  🔒 Sign In
                </button>
              )}
            </div>

          </div>
        </nav>

        {/* PAGE CONTENT RENDERING STATES WITH FADE MOTIONS */}
        <AnimatePresence mode="wait">
          
          {/* PAGE 1: 🏠 HOME LANDING SECTION */}
          {currentPage === 'home' && (
            <motion.div
              key="home-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <TechGridBackground />
              {/* Responsive Hero Header Landing component */}
              <Header
                onStartAnalyze={() => setCurrentPage('analyze')}
                onGoEducation={() => scrollHomeToSection("education-panel-section")}
              />

              {/* Fast interactive user guideline overview cards to enrich design */}
              <div className="py-12 bg-white border-t border-b border-slate-100">
                <div className="max-w-5xl mx-auto px-4 text-center">
                  <span className="text-xs text-blue-600 font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100 shadow-3xs">
                    Quick Walkthrough 💡
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-850 mt-3">
                    3 Easy Rules to Shield Your Family 🛡️💖
                  </h3>
                  <p className="text-slate-500 text-sm max-w-2xl mx-auto mt-2 font-medium">
                    Misinformation exploits our immediate emotions. Make these habits second-nature tonight:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 text-left">
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:scale-[1.01] transition-transform shadow-3xs">
                      <div className="text-2xl">⏳</div>
                      <h4 className="font-extrabold text-slate-800 text-sm">1. Pause Before Sharing</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        Manipulative authors use sensory keywords (ALERT, CRITICAL, CURE) specifically to trigger rapid shares before you think twice. Take an eight-second breath.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:scale-[1.01] transition-transform shadow-3xs">
                      <div className="text-2xl">🔍</div>
                      <h4 className="font-extrabold text-slate-800 text-sm">2. Validate the Publisher</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        Does the site have verified contacts, credentials, or an editorial staff? Copy paste the publisher URL into our <strong>Domain Checker</strong> to check general flags.
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:scale-[1.01] transition-transform shadow-3xs">
                      <div className="text-2xl">💬</div>
                      <h4 className="font-extrabold text-slate-800 text-sm">3. Consult our AI Counselor</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        Unsure about medical posts or phishing emails? Type details or claims into our <strong>Ask AI Analyst chatbot</strong> for a factual educational check.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* EDUCATION DASHBOARD ADDED TO HOME PAGE DOWN OF MAIN PAGE */}
              <div className="py-12 bg-slate-50" id="education-panel-section">
                <div className="text-center mb-6">
                  <span className="text-xs text-blue-600 font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100 shadow-3xs">
                    Learning Center 📘
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-850 mt-3">
                    How to Identify Fake News 🔍✍️
                  </h2>
                  <p className="text-slate-500 text-sm max-w-xl mx-auto mt-1.5 font-semibold">
                    Explore common visual warning markers, manipulative templates, and checklist instructions.
                  </p>
                </div>
                <EducationPanel />
              </div>

            </motion.div>
          )}

          {/* PAGE 2: 🛡️ MISINFORMATION ANALYZER SECTION */}
          {currentPage === 'analyze' && (
            <motion.div
              key="analyze-page"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="py-10 bg-slate-50"
            >
              <div className="text-center mb-2">
                <span className="text-xs text-blue-600 font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100 shadow-3xs">
                  Evaluation Hub 🚀
                </span>
                <p className="text-slate-500 max-w-2xl mx-auto text-xs sm:text-sm mt-2 font-semibold px-4">
                  Check web records, copy social forwards, or scan emails for instant ratings scoring and component graphs.
                </p>
              </div>

              {/* Main Sub-Selection tabs and input Forms */}
              <MainAnalyzer onAnalyze={handleExecuteAnalysis} isLoading={isLoading} />

              {/* Error messages banner */}
              <AnimatePresence>
                {errorText && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="max-w-4xl mx-auto px-4 mb-6"
                  >
                    <div className="p-4 rounded-xl bg-red-50 text-red-700 border border-red-100 text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-2xs">
                      <AlertTriangle className="w-5 h-5 text-red-650 shrink-0" />
                      <span>{errorText}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* DYNAMIC SCANNED RESULT ELEMENT SUMMARY CARD (ONLY displays after scan, no default loader) */}
              <AnimatePresence mode="wait">
                {activeAnalysis ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ResultSection analysis={activeAnalysis} />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="max-w-4xl mx-auto px-4 py-8"
                  >
                    <div className="bg-white border border-slate-200 p-8 text-center rounded-3xl shadow-2xs space-y-3">
                      <div className="text-3xl animate-pulse">👁️🔎</div>
                      <h4 className="font-extrabold text-slate-800 text-base">No content scanned yet</h4>
                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-semibold max-w-lg mx-auto">
                        Paste text strings, select one of our easy examples, or query a site domain using the analyzer headings above to immediately generate an <strong>Analysis Results Summary</strong>.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* PAGE 3: 💬 CONVERSATIONAL CHAT WORKSPACE */}
          {currentPage === 'chat' && (
            <motion.div
              key="chat-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-[calc(100vh-72px)] bg-slate-50/50 flex flex-col overflow-hidden"
            >
              {/* Chat workspace component */}
              <div className="w-full h-full flex flex-col overflow-hidden">
                <AssistantChat />
              </div>
            </motion.div>
          )}

          {/* PAGE 4: 🔑 SECURE SIGNUP / LOGIN AUTHORIZATION */}
          {currentPage === 'auth' && (
            <motion.div
              key="auth-page"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="py-12 bg-slate-50/50"
            >
              <AuthPage onAuthSuccess={handleAuthSuccess} />
            </motion.div>
          )}

          {/* PAGE 5: 📂 PERSONAL SCAN SEARCHES ARCHIVES */}
          {currentPage === 'history' && (
            <motion.div
              key="history-page"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="py-6 bg-slate-50"
            >
              <HistoryPage 
                history={scansHistory} 
                onSelectAnalysis={(analysis) => {
                  if (analysis === null as any) {
                    // Toggles sign in
                    setCurrentPage("auth");
                  } else {
                    setActiveAnalysis(analysis);
                    setCurrentPage("analyze");
                  }
                }}
                currentUser={currentUser}
                onNavigateToAnalyze={() => setCurrentPage("analyze")}
              />
            </motion.div>
          )}

        </AnimatePresence>

      </div>

      {/* FOOTER METADATA (Fully cleaned up Database Schema Explorer segments) */}
      {currentPage !== 'chat' && (
        <footer className="border-t border-slate-200 bg-white py-10 px-4 text-center text-xs text-slate-500 mt-12 shrink-0">
          <div className="max-w-7xl mx-auto space-y-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 border border-blue-105 flex items-center justify-center font-bold shadow-2xs">
                🛡️
              </div>
              <span className="font-display font-black text-slate-800 text-sm">Truth Shield AI</span>
            </div>
            <p className="max-w-md mx-auto leading-relaxed text-slate-500 font-bold">
              Truth Shield AI is an educational reference toolkit designed specifically to assist families, students, and active citizens in auditing false information vectors. Keep yourself safe!
            </p>
            <div className="pt-4 text-[10px] text-slate-400 font-mono font-bold">
              Platform: Node.js/React Express Full-Stack Environment • Built using @google/genai
            </div>
          </div>
        </footer>
      )}

      {/* FLOATING ACTION UTILITIES (Scroll back to top) */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            type="button"
            className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-white hover:bg-slate-50 text-slate-705 border border-slate-200 cursor-pointer shadow-md transition-all active:scale-[0.98]"
          >
            <ArrowUp className="w-4 h-4 font-bold" />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}
