/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Bookmark, Flame, Video, Timer, Search, Share2, ShieldCheck, ChevronDown, Check } from "lucide-react";

interface GuideCard {
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  glowColor: string;
  title: string;
  badExample: string;
  goodAlternative: string;
  explanation: string;
  checklist: string[];
}

export default function EducationPanel() {
  const [activeGuideIdx, setActiveGuideIdx] = useState<number | null>(null);

  const guides: GuideCard[] = [
    {
      icon: <Bookmark className="w-6 h-6" />,
      color: "text-blue-600 bg-blue-50",
      borderColor: "border-blue-100",
      glowColor: "shadow-blue-500/5",
      title: "Check Trusted Sources First",
      badExample: "“An anonymous blog posted a screenshot claiming currency will lose all value...”",
      goodAlternative: "Look for official press releases or reports on major global agencies (e.g., BBC, Associated Press, Reuters).",
      explanation: "Misinformation operates by separating you from authoritative platforms. If multiple trustworthy and independent journals aren't carrying the story, treat it as highly unverified.",
      checklist: [
         "Is there an 'About Us' section explaining who writes the reports?",
         "Does the website list real names of journalists and editors?",
         "Does it cite scientific journals, academic studies, or government registers?"
      ]
    },
    {
      icon: <Flame className="w-6 h-6" />,
      color: "text-red-700 bg-red-50",
      borderColor: "border-red-100",
      glowColor: "shadow-red-500/5",
      title: "Avoid Sensational Themes & Emotional Headlines",
      badExample: "“SHOCKING: This MIRACLE cure will resolve joint pain in 5 minutes! Censors want this taken down!”",
      goodAlternative: "“Recent studies indicate that a newly formulated compound may slightly improve chronic inflammation.”",
      explanation: "Sensational headlines are built to provoke instant biological reactions: anger, fear, shock, or hope. True, professional journalism has a modest, objective, and quiet tone.",
      checklist: [
         "Is the head title written in ALL-CAPS or packed with exclamation points (!!!)?",
         "Does the article try to make you angry or fearful of an group?",
         "Does it call for immediate forwarding to 'warn your relatives'?"
      ]
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      color: "text-emerald-700 bg-emerald-50",
      borderColor: "border-emerald-100",
      glowColor: "shadow-emerald-500/5",
      title: "Verify Veracity Before Sharing",
      badExample: "Clicking 'Forward' instantly on an unverified alarming WhatsApp broadcast to family groups.",
      goodAlternative: "Spend 2 minutes checking Google News with keywords from the text to see if there is a fact-check report.",
      explanation: "Misinformation spreads purely on social velocity. By stopping and waiting just 2 minutes to research, you break the cycle of contagion and shield your friends from panic.",
      checklist: [
         "Have I checked if Snopes, PolitiFact, or Google Fact Check Tools flagged this?",
         "If I send this, will it cause stress to others without offering real, solid help?",
         "Is the original sender safe, or did they copy-paste it from somewhere else?"
      ]
    },
    {
      icon: <Video className="w-6 h-6" />,
      color: "text-purple-700 bg-purple-50",
      borderColor: "border-purple-100",
      glowColor: "shadow-purple-500/5",
      title: "Watch for Out-Of-Context or Manipulated Images",
      badExample: "An image from a 2012 movie scene presented as a 'live breaking report' of an active natural issue.",
      goodAlternative: "Doing a reverse image lookup to locate original dates and locations of photographs.",
      explanation: "Fake posts frequently misuse real, old images to back up false claims. AI deepfakes also have tells like structural double edges, fuzzy joints, or repeating text errors.",
      checklist: [
         "Are human hands or faces looking unnaturally distorted, wavy, or blurred?",
         "Does the image metadata match the geographic location in the story?",
         "Does a Right-Click 'Search Image with Google' lead back to a factual article?"
      ]
    },
    {
      icon: <Timer className="w-6 h-6" />,
      color: "text-amber-700 bg-amber-50",
      borderColor: "border-amber-100",
      glowColor: "shadow-amber-500/5",
      title: "Be Wary of High-Urgency Tactics",
      badExample: "“MUST SHARE IMMEDIATELY!!! Major digital currency cutoff happening tonight at midnight protect your savings.”",
      goodAlternative: "Real financial, government, or infrastructure entities offer progressive public warnings weeks in advance.",
      explanation: "Misleading messages construct a tiny window of opportunity to prevent you from researching or invoking critical logic. If it demands fast panic action, it is heavily suspect.",
      checklist: [
         "Does the post threaten severe loss if not acted upon in the next few hours?",
         "Is there an absence of an official press schedule from the referenced company?",
         "Do they pressure you into bypassing standard security processes?"
      ]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" id="education-section">
      <div className="text-center mb-10">
        <span className="text-xs text-blue-600 font-extrabold uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100 shadow-xs">
          Educational Center
        </span>
        <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-800 mt-3">
          How to Identify Fake News
        </h2>
        <p className="text-slate-650 max-w-2xl mx-auto text-sm sm:text-base mt-2 font-semibold">
          Developing diagnostic skills to spot manipulation vectors. Tap each concept below to open beginner-friendly checklists and real comparisons.
        </p>
      </div>

      <div className="space-y-4">
        {guides.map((item, idx) => {
          const isExpanded = activeGuideIdx === idx;
          return (
            <motion.div
              key={idx}
              initial={false}
              className={`bg-white border ${
                isExpanded ? "border-blue-500/40 shadow-sm" : "border-slate-200"
              } rounded-2xl overflow-hidden transition-all duration-300 shadow-xs bg-gradient-to-r from-white via-white to-blue-50/5`}
            >
              <button
                onClick={() => setActiveGuideIdx(isExpanded ? null : idx)}
                type="button"
                className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${item.color}`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-slate-800 text-sm sm:text-base">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5 font-semibold">
                      Learn standard warning parameters and cognitive check points.
                    </p>
                  </div>
                </div>
                <div className={`text-slate-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                  <ChevronDown className="w-5 h-5" />
                </div>
              </button>

              <motion.div
                initial={false}
                animate={{ height: isExpanded ? "auto" : 0, opacity: isExpanded ? 1 : 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-6 border-t border-slate-100 pt-4 space-y-4 font-sans">
                  
                  {/* Detailed explanation */}
                  <div className="text-slate-700 text-sm leading-relaxed">
                    <p className="font-extrabold text-slate-800">The Anatomy of this Tactic:</p>
                    <p className="mt-1 text-slate-600 text-xs sm:text-sm font-semibold">{item.explanation}</p>
                  </div>

                  {/* Bad vs Good comparison split */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-red-50/50 border border-red-100">
                      <span className="text-[10px] text-red-700 font-extrabold uppercase tracking-wider block mb-1">
                        ❌ Suspicious Framing / Red Flag Example
                      </span>
                      <p className="text-xs text-red-800 italic font-black leading-relaxed">
                        {item.badExample}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
                      <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider block mb-1">
                        ✅ Objective Framing / Balanced Alternative
                      </span>
                      <p className="text-xs text-emerald-800 italic font-black leading-relaxed">
                        {item.goodAlternative}
                      </p>
                    </div>
                  </div>

                  {/* Checklist */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-xs text-blue-600 font-bold flex items-center gap-1.5 mb-2.5">
                      <ShieldCheck className="w-4 h-4 text-blue-500" />
                      <span>Diagnose It (Beginner-Friendly Checklist)</span>
                    </span>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700 font-semibold">
                      {item.checklist.map((check, checkIdx) => (
                        <li key={checkIdx} className="flex items-start gap-2">
                          <div className="w-4 h-4 bg-white text-blue-600 border border-slate-200 rounded flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                            <Check className="w-2.5 h-2.5 font-bold text-blue-600" />
                          </div>
                          <span>{check}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
