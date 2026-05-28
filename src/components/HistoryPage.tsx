/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { NewsAnalysis } from "../types";
import { Calendar, Search, ShieldCheck, AlertTriangle, ArrowRight, Trash2, Clock, MapPin, Eye } from "lucide-react";

interface HistoryPageProps {
  history: NewsAnalysis[];
  onSelectAnalysis: (analysis: NewsAnalysis) => void;
  currentUser: { id: number; username: string; email: string } | null;
  onNavigateToAnalyze: () => void;
}

export default function HistoryPage({ history, onSelectAnalysis, currentUser, onNavigateToAnalyze }: HistoryPageProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHistory = history.filter(item => 
    item.headline.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBriefDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString([], { month: "short", day: "numeric" }) + " • " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return dateStr;
    }
  };

  const getBadgeColor = (trustLevel: string) => {
    switch (trustLevel) {
      case "Trustworthy":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Suspicious":
        return "bg-amber-50 text-amber-700 border-amber-100";
      default:
        return "bg-red-50 text-red-700 border-red-100";
    }
  };

  const getEmoji = (trustLevel: string) => {
    switch (trustLevel) {
      case "Trustworthy": return "✅";
      case "Suspicious": return "⚠️";
      default: return "🚨";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-left" id="search-history-workspace">
      
      {/* Page Header */}
      <div className="mb-8 space-y-2">
        <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-850">
          Personal Analysis Vault 🛡️📂
        </h2>
        <p className="text-slate-500 text-xs sm:text-sm font-semibold">
          {currentUser ? (
            <span>
              Welcome back, <strong className="text-blue-600 font-extrabold">@{currentUser.username}</strong>! Viewing your dynamic audit history. Any searches you make are securely recorded here.
            </span>
          ) : (
            "Access comprehensive historical logs and tracking tables of previous scans."
          )}
        </p>
      </div>

      {currentUser ? (
        <div className="space-y-6">
          
          {/* Sub Search filtering input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter scans history by headline keywords or text..."
              className="w-full text-xs sm:text-sm bg-white border border-slate-200 py-3.5 pl-11 pr-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 font-semibold shadow-2xs"
            />
          </div>

          {filteredHistory.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence initial={false}>
                {filteredHistory.map((item, index) => (
                  <motion.div
                    key={item.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.04 }}
                    className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-300 transition-colors cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-3xs hover:shadow-2xs"
                    onClick={() => onSelectAnalysis(item)}
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      
                      {/* Meta information tags */}
                      <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-slate-400 font-bold select-none">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${getBadgeColor(item.trustLevel)}`}>
                          <span>{getEmoji(item.trustLevel)}</span>
                          <span className="capitalize">{item.trustLevel}</span>
                        </span>
                        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200/60 font-sans flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{getBriefDate(item.scannedAt)}</span>
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          Score: {item.fakeProbabilityScore}% Risk
                        </span>
                      </div>

                      {/* Headline query */}
                      <h4 className="font-display font-extrabold text-slate-800 text-xs sm:text-sm md:text-base group-hover:text-blue-600 transition-colors line-clamp-1 pr-4 leading-snug">
                        {item.headline}
                      </h4>

                      {/* Text Snippet */}
                      <p className="text-xs text-slate-505 font-medium line-clamp-1 truncate max-w-2xl">
                        {item.content}
                      </p>
                    </div>

                    {/* View report CTA */}
                    <div className="flex items-center gap-2 shrink-0 md:pl-2">
                      <span className="hidden sm:inline-block text-[11px] text-blue-600 font-bold group-hover:translate-x-0.5 transition-transform">
                        Review Report
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 group-hover:bg-blue-50 group-hover:border-blue-200 text-slate-505 group-hover:text-blue-600 flex items-center justify-center transition-colors shadow-3xs">
                        <Eye className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            /* Empty logs with customized help tips */
            <div className="bg-white border border-slate-200 px-6 py-12 text-center rounded-3xl shadow-3xs space-y-4">
              <div className="text-5xl animate-bounce">🔬✨</div>
              <h4 className="font-extrabold text-slate-850 text-lg">Your Vault is completely clean!</h4>
              <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-md mx-auto font-semibold">
                This is a live representation of a secure standalone workspace. We strictly avoid adding hardcoded dummy scans to registered accounts. Everything you run is isolated!
              </p>
              <div className="pt-2">
                <button
                  onClick={onNavigateToAnalyze}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md cursor-pointer transition-all active:scale-[0.98]"
                >
                  <span>Analyze Your First Article Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Prompt user to sign up/login to create isolated history logs */
        <div className="bg-white border border-slate-200 px-6 py-12 text-center rounded-3xl shadow-sm space-y-4 max-w-lg mx-auto">
          <div className="text-5xl">🔒🔐</div>
          <h4 className="font-extrabold text-slate-850 text-lg">Secure Vault Access Key Required</h4>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed font-semibold">
            To query previous results or keep audit histories separately, you must be logged into an authenticated profile. Create an account instantly for real-time saving!
          </p>
          <div className="pt-2">
            <button
              onClick={() => onSelectAnalysis(null as any)} // Will trigger login state routing in parent App.tsx
              className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-extrabold text-xs sm:text-sm px-6 py-3 rounded-xl border border-blue-100 cursor-pointer transition-all active:scale-[0.98]"
            >
              <span>Verify Access / Register Profile</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
