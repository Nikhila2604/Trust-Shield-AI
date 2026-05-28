/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { ShieldCheck, Sparkles, BookOpen, Search, AlertCircle, ArrowRight } from "lucide-react";
import TechGridBackground from "./TechGridBackground";

interface HeaderProps {
  onStartAnalyze: () => void;
  onGoEducation: () => void;
}

export default function Header({ onStartAnalyze, onGoEducation }: HeaderProps) {
  return (
    <div className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-blue-100 bg-radial-[circle_at_top,_var(--tw-gradient-stops)] from-blue-50/50 via-slate-50/40 to-slate-100/40">
      
      {/* Animated tech grid background overlay */}
      <TechGridBackground />

      {/* Decorative ambient blurred backgrounds */}
      <div className="absolute top-1/4 left-1/4 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Interactive Simulated News Cards */}
      <div className="absolute inset-0 max-w-7xl mx-auto hidden lg:block pointer-events-none">
        
        {/* News card 1: Suspicious */}
        <motion.div
          initial={{ x: -100, y: 150, opacity: 0, rotate: -6 }}
          animate={{ x: -50, y: 120, opacity: 0.85, rotate: -4 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute left-6 top-16 w-72 bg-white/95 border border-red-200 rounded-xl p-4 shadow-xl shadow-red-950/5 backdrop-blur-md animate-float"
        >
          <div className="flex items-center justify-between gap-2 mb-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-bold border border-red-100">Flagged Alert</span>
            <span className="text-slate-400">2 min ago</span>
          </div>
          <p className="font-display font-bold text-xs text-slate-800 line-clamp-2">
            “REVEALED: The instant joint cure overnight secrets major bank schemes won't tell you...”
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-red-600 font-bold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>92% Misinformation Risk</span>
          </div>
        </motion.div>

        {/* News card 2: Trustworthy */}
        <motion.div
          initial={{ x: 100, y: 200, opacity: 0, rotate: 6 }}
          animate={{ x: 60, y: 180, opacity: 0.85, rotate: 4 }}
          transition={{ duration: 1.4, delay: 0.1, ease: "easeOut" }}
          className="absolute right-6 top-28 w-72 bg-white/95 border border-emerald-200 rounded-xl p-4 shadow-xl shadow-emerald-950/5 backdrop-blur-md"
          style={{ animation: "float-slow 5s ease-in-out infinite" }}
        >
          <div className="flex items-center justify-between gap-2 mb-2 text-xs">
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold border border-emerald-100">Verified Science</span>
            <span className="text-slate-400">1 hour ago</span>
          </div>
          <p className="font-display font-bold text-xs text-slate-800 line-clamp-2">
            “Peer-reviewed Cambridge sequence maps cognitive impact of healthy sleeping habits...”
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Highly Trustworthy</span>
          </div>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        
        {/* Animated Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold mb-6 shadow-sm shadow-blue-100/50"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-blue-500" />
          <span>Real-time Human-Centric Fact Shielding</span>
        </motion.div>

        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-850 tracking-tight leading-tight"
        >
          AI Fake News <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Detection System
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium"
        >
          Analyze news, social media posts, and online information using AI-powered misinformation detection. Simple, intuitive summaries to shield you from manipulation.
        </motion.p>

        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={onStartAnalyze}
            id="btn_analyze_news_cta"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-8 py-4 rounded-xl shadow-lg shadow-blue-600/10 cursor-pointer transition-all active:scale-[0.98]"
          >
            <Search className="w-5 h-5 font-bold" />
            <span>Analyze News</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
          
          <button
            onClick={onGoEducation}
            id="btn_learn_more_cta"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold px-8 py-4 rounded-xl cursor-pointer transition-all active:scale-[0.98] shadow-sm"
          >
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Learn About Fake News</span>
          </button>
        </motion.div>

        {/* Stats Summary Panel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-1.5 rounded-2xl bg-white border border-slate-200 max-w-3xl mx-auto shadow-sm"
        >
          <div className="p-4 text-center">
            <div className="text-2xl sm:text-3xl font-display font-extrabold text-blue-600">92%+</div>
            <div className="text-xs text-slate-400 mt-1 font-bold">Detection Accuracy</div>
          </div>
          <div className="p-4 text-center border-l border-slate-100">
            <div className="text-2xl sm:text-3xl font-display font-extrabold text-blue-600">Instant</div>
            <div className="text-xs text-slate-400 mt-1 font-bold">Scanning Speed</div>
          </div>
          <div className="p-4 text-center border-l border-slate-100">
            <div className="text-2xl sm:text-3xl font-display font-extrabold text-blue-600">100%</div>
            <div className="text-xs text-slate-400 mt-1 font-bold">Beginner-Friendly</div>
          </div>
          <div className="p-4 text-center border-l border-slate-100">
            <div className="text-2xl sm:text-3xl font-display font-extrabold text-blue-600">Local DB</div>
            <div className="text-xs text-slate-400 mt-1 font-bold">Credibility Index</div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
