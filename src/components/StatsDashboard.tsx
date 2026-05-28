/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend, AreaChart, Area
} from "recharts";
import { 
  BarChart2, ShieldAlert, CheckCircle, Globe, Search, AlertTriangle, HelpCircle, HeartCrack, BarChart3, TrendingUp, Info
} from "lucide-react";
import { SourceCheckResult, StatsResponse } from "../types";

interface StatsDashboardProps {
  currentAnalysisScore: number;
  currentPercentages?: {
    clickbait: number;
    emotionalManipulation: number;
    bias: number;
    exaggeration: number;
  };
}

export default function StatsDashboard({ currentAnalysisScore, currentPercentages }: StatsDashboardProps) {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [domainQuery, setDomainQuery] = useState("");
  const [checkResult, setCheckResult] = useState<SourceCheckResult | null>(null);
  const [isCheckingSource, setIsCheckingSource] = useState(false);

  // Fetch database overall statistics
  useEffect(() => {
    fetchStats();
  }, [currentAnalysisScore]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to load statistics from API:", err);
    }
  };

  const handleCheckSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainQuery.trim()) return;

    setIsCheckingSource(true);
    setCheckResult(null);

    try {
      const res = await fetch(`/api/sources/check?domain=${encodeURIComponent(domainQuery.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setCheckResult(data);
      }
    } catch (err) {
      console.error("Failed to check domain reputation:", err);
    } finally {
      setIsCheckingSource(false);
    }
  };

  // Safe default percentages if no scan active
  const activePercentages = currentPercentages || {
    clickbait: 78,
    emotionalManipulation: 84,
    bias: 60,
    exaggeration: 72
  };

  // 1. Data for simple category values
  const radarMetricsData = [
    { name: "Clickbait Pitch", score: activePercentages.clickbait, fill: "#ef4444" },
    { name: "Emotional Drama", score: activePercentages.emotionalManipulation, fill: "#f59e0b" },
    { name: "Bias / Opinion", score: activePercentages.bias, fill: "#3b82f6" },
    { name: "Exaggeration", score: activePercentages.exaggeration, fill: "#a855f7" }
  ];

  // 2. Data for overall trust distributions
  const pieData = stats?.categoriesDistribution || [
    { name: "Trustworthy", value: 1, color: "#10b981" },
    { name: "Suspicious", value: 1, color: "#f59e0b" },
    { name: "Dangerous", value: 1, color: "#ef4444" }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" id="stats-section">
      <div className="text-center mb-10">
        <span className="text-xs text-blue-600 font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100 shadow-xs">
          Database Diagnostics
        </span>
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-slate-800 mt-3">
          Misinformation Trend & Fact-Checking Charts
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base mt-2 font-semibold">
          An interactive lookup index tracking fake news profiles, domain classifications, and warning indicators of scanned feeds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* CHART 1: Pie graph of Misclassifications */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-display font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-4.5 h-4.5 text-blue-600" />
              <span>General Shield Statistics</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              Shows ratio distribution of scans processed by Truth Shield AI.
            </p>
          </div>

          <div className="h-44 my-4 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "10px", fontSize: "11px", color: "#f8fafc" }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center stat badge overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
              <span className="text-xl font-display font-extrabold text-slate-800">
                {stats?.totalScans || 3}
              </span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                Total Scans
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
            {pieData.map((entry, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                  {entry.value}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold mt-0.5">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 2: Interactive metrics matching current/last scanned text parameters */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-display font-bold text-slate-800 flex items-center gap-2">
              <HeartCrack className="w-4.5 h-4.5 text-blue-600" />
              <span>Diagnostic Manipulation Ratio</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-semibold">
              Misleading factors compiled from content structures (0 to 100 max scale).
            </p>
          </div>

          <div className="h-44 my-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={radarMetricsData} layout="vertical" margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={90} />
                <ChartTooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "10px", fontSize: "11px", color: "#f8fafc" }}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={12}>
                  {radarMetricsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-blue-50/50 p-2 text-center rounded-xl border border-blue-100/80 text-[11px] text-slate-600 flex items-center gap-1.5 justify-center font-bold">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Clickbait & Emotional manipulation represent top social vector risks.</span>
          </div>
        </div>

      </div>

      {/* LOWER COMPONENT: SOURCE CREDIBILITY CHECK TOOL */}
      <div className="bg-gradient-to-r from-slate-50 via-white to-slate-50 border border-slate-205 p-6 rounded-3xl shadow-sm animate-fade-in">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-blue-600" />
          <h3 className="font-display font-bold text-slate-800 text-sm sm:text-base">
            Source Credibility Domain Checker
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mb-5 leading-relaxed font-semibold">
          Type any blog link or publisher domain (e.g., <code className="text-slate-705 font-mono text-xs font-extrabold px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded">nytimes.com</code> or <code className="text-slate-705 font-mono text-xs font-extrabold px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded">shocking-secret-news-blog.org</code>) to instantly diagnostic check their compliance ratings.
        </p>

        {/* Query Input */}
        <form onSubmit={handleCheckSource} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <input
              type="text"
              required
              value={domainQuery}
              onChange={(e) => setDomainQuery(e.target.value)}
              placeholder="e.g. bbc.com, shocking-secret-news-blog.org, wikipedia.org"
              className="w-full bg-white border border-slate-250 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm py-3 pl-10 pr-4 rounded-xl text-slate-800 outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            id="btn_domain_search_submit"
            disabled={isCheckingSource}
            className="bg-blue-600 hover:bg-blue-700 transition-colors text-white font-extrabold px-6 py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] shrink-0 shadow-md shadow-blue-500/10"
          >
            {isCheckingSource ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Checking Database...</span>
              </>
            ) : (
              <span>Inspect Source Domain</span>
            )}
          </button>
        </form>

        {/* Source check results */}
        <AnimatePresence mode="wait">
          {checkResult && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
            >
              <div className="md:col-span-4 text-center md:text-left border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-4 flex flex-col items-center md:items-start justify-center">
                
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Domain Rep</span>
                <span className="font-mono text-sm font-extrabold text-blue-600 truncate max-w-full my-1 block">
                  {checkResult.domain}
                </span>

                <div className="flex items-center gap-1.5 mt-1">
                  <div className={`w-2 h-2 rounded-full ${
                    checkResult.ratingScore > 70 ? "bg-emerald-550" : checkResult.ratingScore > 40 ? "bg-amber-550" : "bg-red-500"
                  }`} />
                  <span className="text-xs text-slate-700 font-bold">
                    {checkResult.classification}
                  </span>
                </div>
              </div>

              <div className="md:col-span-5 space-y-1 text-left">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block">Shield Verdict Summary</span>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-bold">
                  {checkResult.recommendation}
                </p>
              </div>

              {/* Dynamic Bar Rating Meter */}
              <div className="md:col-span-3 bg-white border border-slate-200 p-3 rounded-xl flex flex-col items-center shadow-xs">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block mb-1">Reputation Score</span>
                <span className={`text-2xl font-display font-extrabold ${
                  checkResult.ratingScore > 70 ? "text-emerald-600" : checkResult.ratingScore > 40 ? "text-amber-500" : "text-red-500"
                }`}>
                  {checkResult.ratingScore}/100
                </span>
                <span className="text-[9px] text-slate-500 font-mono mt-0.5 font-bold">
                  Flags Reported: {checkResult.totalFlags}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
