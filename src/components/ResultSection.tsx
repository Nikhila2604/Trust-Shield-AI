/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { 
  ShieldCheck, AlertTriangle, Info, ArrowRight, ShieldAlert, CheckCircle, HelpCircle, AlertOctagon,
  TrendingDown, Percent, Sparkles
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Cell 
} from "recharts";
import { NewsAnalysis } from "../types";
import TrustWordHighlighter from "./TrustWordHighlighter";

interface ResultSectionProps {
  analysis: NewsAnalysis;
}

export default function ResultSection({ analysis }: ResultSectionProps) {
  const {
    fakeProbabilityScore,
    trustLevel,
    explanation,
    riskIndicators,
    suspiciousPhrases,
    recommendedAction,
    headline,
    content,
    categoryPercentages
  } = analysis;

  // Set colors and icons based on trust level
  const isTrustworthy = trustLevel === "Trustworthy" || fakeProbabilityScore <= 35;
  const isSuspicious = trustLevel === "Suspicious" || (fakeProbabilityScore > 35 && fakeProbabilityScore <= 75);
  const isDangerous = trustLevel === "Dangerous" || fakeProbabilityScore > 75;

  let themeColor = "emerald";
  let bgGradient = "from-emerald-50/50 via-white to-white";
  let strokeColor = "#10b981"; // Emerald
  let textGrad = "from-emerald-600 to-teal-600";
  let borderHighlight = "border-emerald-200";
  let statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-100";
  let RatingIcon = ShieldCheck;

  if (isSuspicious) {
    themeColor = "amber";
    bgGradient = "from-amber-50/50 via-white to-white";
    strokeColor = "#f59e0b"; // Amber
    textGrad = "from-amber-600 to-yellow-600";
    borderHighlight = "border-amber-200";
    statusBadge = "bg-amber-50 text-amber-700 border-amber-100";
    RatingIcon = AlertTriangle;
  } else if (isDangerous) {
    themeColor = "red";
    bgGradient = "from-red-50/50 via-white to-white";
    strokeColor = "#ef4444"; // Red
    textGrad = "from-red-600 to-orange-600";
    borderHighlight = "border-red-200";
    statusBadge = "bg-red-50 text-red-700 border-red-100";
    RatingIcon = AlertOctagon;
  }

  // Safe default percentages if no scan active
  const activePercentages = categoryPercentages || {
    clickbait: 50,
    emotionalManipulation: 50,
    bias: 50,
    exaggeration: 50
  };

  // Convert to chart data format
  const chartData = [
    { name: "Clickbait Title", score: activePercentages.clickbait, fill: "#ef4444" },
    { name: "Emotional Drama", score: activePercentages.emotionalManipulation, fill: "#f59e0b" },
    { name: "Opinion Bias", score: activePercentages.bias, fill: "#3b82f6" },
    { name: "Exaggeration", score: activePercentages.exaggeration, fill: "#a855f7" }
  ];

  // SVG Circular progress math (radius is 45, circumference is ~282.7)
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (fakeProbabilityScore / 100) * circumference;

  // Helper to render bulleted markdown containing bold and [links](url) nicely formatted
  const renderStyledMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split("\n").filter(line => line.trim() !== "");
    return (
      <div className="space-y-4 mt-2">
        {lines.map((line, idx) => {
          let cleanLine = line.trim();

          // Strip leading bullet marks if present (•, *, -, or numbers like 1.)
          cleanLine = cleanLine.replace(/^[•*\-\s]+/, "").replace(/^\d+\.\s+/, "").trim();

          // Check if there is a leading emoji icon at the start of the line or default to a elegant blue bullet
          const emojiMatch = cleanLine.match(/^([\u2000-\u3300]|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDD00-\uDFFF]|\u26A0\uFE0F|\u2139\uFE0F|\u2705|💡|🚨|🔬|⚠️|🎓|❇️|🔹|🕵️|🏥|🔍|🛡️|🧑‍⚖️|📚|💻|🎁|🔒|🧑‍💻|💎|⚡|🌍|⚖️)\s*/u);
          let lineEmoji = "🔹";
          if (emojiMatch) {
            lineEmoji = emojiMatch[1];
            cleanLine = cleanLine.substring(emojiMatch[0].length).trim();
          }

          // Check for bold header like **Conspiracy Framing:** or **Lack of Peer-Review:**
          const boldHeaderMatch = cleanLine.match(/^\*\*(.*?)\*\*\s*(:?)\s*/);
          let boldHeader = "";
          if (boldHeaderMatch) {
            boldHeader = boldHeaderMatch[1].replace(/:$/, "").trim();
            cleanLine = cleanLine.substring(boldHeaderMatch[0].length).trim();
            if (cleanLine.startsWith(":")) {
              cleanLine = cleanLine.substring(1).trim();
            }
          }

          // Parse inline **bold** text and [labels](urls)
          const elements: React.ReactNode[] = [];
          const inlineRegex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
          let match;
          let lastIndex = 0;
          let inlineKey = 0;

          while ((match = inlineRegex.exec(cleanLine)) !== null) {
            const matchIndex = match.index;
            if (matchIndex > lastIndex) {
              elements.push(
                <span key={`text-${idx}-${inlineKey++}`}>
                  {cleanLine.substring(lastIndex, matchIndex)}
                </span>
              );
            }

            const token = match[0];
            if (token.startsWith("**") && token.endsWith("**")) {
              const boldTxt = token.substring(2, token.length - 2);
              elements.push(
                <strong key={`bold-${idx}-${inlineKey++}`} className="font-extrabold text-slate-900 bg-amber-50 border border-amber-100/50 px-1 py-0.5 rounded">
                  {boldTxt}
                </strong>
              );
            } else if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
              const braceEnd = token.indexOf("]");
              const linkUrl = token.substring(braceEnd + 2, token.length - 1);
              const linkText = token.substring(1, braceEnd);
              elements.push(
                <a
                  key={`link-${idx}-${inlineKey++}`}
                  href={linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-805 underline font-extrabold hover:decoration-2 transition-all cursor-pointer bg-blue-50/70 hover:bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100"
                >
                  <span>{linkText}</span>
                  <span className="text-[10px]">🔗</span>
                </a>
              );
            }

            lastIndex = inlineRegex.lastIndex;
          }

          if (lastIndex < cleanLine.length) {
            elements.push(
              <span key={`text-end-${idx}-${inlineKey++}`}>
                {cleanLine.substring(lastIndex)}
              </span>
            );
          }

          return (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-start gap-4 bg-white hover:bg-slate-50/20 border border-slate-150 hover:border-blue-200 rounded-2xl p-4 sm:p-5 shadow-3xs hover:shadow-2xs transition-all duration-300 relative overflow-hidden group hover:scale-[1.005]"
            >
              {/* Dynamic Left accent bar inside bento card */}
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-550 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Icon Container with subtle micro-scale & hover animations */}
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 border border-slate-150 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors shrink-0 text-lg shadow-3xs">
                {lineEmoji}
              </div>

              {/* Text Context layout */}
              <div className="space-y-2 flex-1 min-w-0">
                {boldHeader && (
                  <div className="flex flex-wrap items-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-105 uppercase tracking-wider group-hover:bg-blue-100 group-hover:text-blue-800 transition-colors">
                      ✨ {boldHeader}
                    </span>
                  </div>
                )}
                <div className="text-slate-700 leading-relaxed text-xs sm:text-sm font-semibold text-left font-sans">
                  {elements.length > 0 ? elements : cleanLine}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" id="result-dashboard">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className={`bg-white border ${borderHighlight} rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden bg-gradient-to-b ${bgGradient}`}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100/20 rounded-full blur-3xl pointer-events-none" />

        {/* Section Title */}
        <div className="flex items-center gap-2.5 mb-6 border-b border-slate-100 pb-5">
          <div className={`p-2 rounded-lg ${statusBadge} border`}>
            <RatingIcon className="w-5 h-5 font-bold" />
          </div>
          <div className="text-left">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest block">AI Verification Module 🌟</span>
            <h3 className="text-lg sm:text-xl font-display font-extrabold text-slate-850">
              Analysis Results Summary
            </h3>
          </div>
        </div>

        {/* Top Vertical Stack Layout: Risk Level Card Shown FIRST, and Shield Verdict directly BELOW */}
        <div className="flex flex-col gap-6">
          
          {/* SVG Circular trust meter - Stretched nicely as a top horizontal flex layout */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 sm:p-8 bg-slate-50 border border-slate-150 rounded-2xl shadow-3xs hover:shadow-2xs transition-all duration-300">
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left space-y-2.5">
              <span className="text-xs text-blue-600 font-extrabold uppercase tracking-widest bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-lg flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-450 animate-ping" />
                Risk Checker Verdict ⚖️
              </span>
              <h4 className="text-lg sm:text-xl font-display font-black text-slate-800 tracking-tight">
                Trust & Authenticity Evaluation
              </h4>
              <p className="text-xs text-slate-500 max-w-lg font-semibold leading-relaxed">
                Calculated by auditing semantic style cues, subjective bias patterns, and verifying factual context through trustworthy international records.
              </p>
              <div className="pt-2">
                <span className={`px-4 py-1.5 font-extrabold text-xs sm:text-sm rounded-xl border ${statusBadge} uppercase tracking-wider`}>
                  {trustLevel} Content
                </span>
              </div>
            </div>

            {/* Circular Gauge centered */}
            <div className="relative w-36 h-36 flex items-center justify-center bg-white border border-slate-150 rounded-2xl p-4 shrink-0 shadow-3xs">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className="stroke-slate-100"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Score value indicator */}
                <motion.circle
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: strokeDashoffset }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke={strokeColor}
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeLinecap="round"
                />
              </svg>

              {/* Inside score display text */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className={`text-3xl font-display font-extrabold bg-gradient-to-r ${textGrad} bg-clip-text text-transparent`}>
                  {fakeProbabilityScore}%
                </span>
                <span className="text-[10px] text-slate-450 font-bold uppercase tracking-widest mt-0.5">
                  Fake Risk
                </span>
              </div>
            </div>
          </div>

          {/* AI Explanation panel displayed directly below the tracker */}
          <div className="space-y-4 text-left">
            <div className="space-y-2">
              <span className="text-sm text-slate-700 font-black block uppercase tracking-wider flex items-center gap-2">
                🛡️ Shield Verdict Detail:
              </span>
              <div className="mt-2">
                {renderStyledMarkdown(explanation)}
              </div>
            </div>

            {/* Risk Indicator Tag pills */}
            {riskIndicators && riskIndicators.length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-xs text-slate-405 font-bold block uppercase tracking-wider">
                  Detected Misleading Patterns:
                </span>
                <div className="flex flex-wrap gap-2">
                  {riskIndicators.map((indicator, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs rounded-xl bg-red-50 text-red-700 border border-red-100 font-extrabold shadow-4xs"
                    >
                      ✔ {indicator}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chart representation of analysis detection components */}
        <div className="mt-6 p-5 rounded-2xl border border-slate-150 bg-slate-50/50">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-slate-700 font-extrabold uppercase tracking-wide">
              Detection Components Graph 📊
            </span>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={10} width={90} />
                <ChartTooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "10px", fontSize: "11px", color: "#f8fafc" }}
                />
                <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={12}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-[11px] text-slate-500 font-semibold mt-2.5 text-center flex items-center justify-center gap-1.5 leading-relaxed">
            <span>💡 Clickbait, exaggeration, and emotional drama represent calculated parameters behind core ratings.</span>
          </div>
        </div>

        {/* Action Suggestion Ribbon */}
        <div className="mt-6 p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex gap-3.5 items-start">
          <div className="p-1.5 bg-blue-100/80 text-blue-600 rounded-lg shrink-0 border border-blue-200/40 mt-0.5">
            <Info className="w-4 h-4 text-blue-600 font-bold" />
          </div>
          <div className="space-y-1 font-sans text-left">
            <span className="text-xs text-slate-400 font-bold block uppercase tracking-wide">
              Recommended Protective Actions 📢:
            </span>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-bold">
              {recommendedAction}
            </p>
          </div>
        </div>

        {/* Dynamic Highlight component loaded below */}
        <div className="mt-8 pt-8 border-t border-slate-100">
          <div className="bg-white p-1 rounded-2xl">
            <TrustWordHighlighter content={content} suspiciousPhrases={suspiciousPhrases} />
          </div>
        </div>

      </motion.div>
    </div>
  );
}
