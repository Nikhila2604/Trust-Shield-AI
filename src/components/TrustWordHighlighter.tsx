/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, HelpCircle } from "lucide-react";
import { SuspiciousPhrase } from "../types";

interface TrustWordHighlighterProps {
  content: string;
  suspiciousPhrases: SuspiciousPhrase[];
}

export default function TrustWordHighlighter({ content, suspiciousPhrases }: TrustWordHighlighterProps) {
  const [hoveredPhraseIdx, setHoveredPhraseIdx] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0, isRightHalf: false });
  const containerRef = useRef<HTMLDivElement>(null);

  if (!suspiciousPhrases || suspiciousPhrases.length === 0) {
    return (
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 leading-relaxed text-sm text-slate-800 whitespace-pre-wrap font-sans font-medium">
        {content}
      </div>
    );
  }

  // Sort phrases by longest length to prevent shorter phrases within longer ones from breaking regex
  const sortedPhrases = [...suspiciousPhrases].sort((a, b) => b.phrase.length - a.phrase.length);
  
  // Escape regex special characters
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  const regexParts = sortedPhrases.map(sp => `(${escapeRegExp(sp.phrase)})`).join("|");
  if (!regexParts) {
    return (
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 leading-relaxed text-sm text-slate-800 whitespace-pre-wrap font-sans font-medium">
        {content}
      </div>
    );
  }

  const regex = new RegExp(regexParts, "gi");
  const textParts = content.split(regex);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Determine if cursor is on the right side of the container
    const isRightHalf = x > rect.width * 0.55;
    setMousePosition({ x, y, isRightHalf });
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
          Article Text Analyzer (Hover over highlighted phrases):
        </span>
      </div>

      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="bg-slate-50 p-5 rounded-2xl border border-slate-200 leading-relaxed text-sm sm:text-base text-slate-850 whitespace-pre-wrap font-sans relative font-medium min-h-[120px]"
      >
        {textParts.map((part, index) => {
          if (!part) return null;

          // Check if this part matches any of our suspicious phrases (case-insensitive)
          const matchedPhraseIndex = suspiciousPhrases.findIndex(
            sp => sp.phrase.toLowerCase() === part.toLowerCase()
          );

          if (matchedPhraseIndex !== -1) {
            const isHovered = hoveredPhraseIdx === matchedPhraseIndex;

            return (
              <span 
                key={index}
                onMouseEnter={() => setHoveredPhraseIdx(matchedPhraseIndex)}
                onMouseLeave={() => setHoveredPhraseIdx(null)}
                className="relative inline border-b-2 border-rose-300 bg-rose-50/50 hover:bg-rose-100 px-1 py-0.5 rounded-sm select-all cursor-pointer text-rose-700 font-bold transition-all duration-200"
              >
                {part}
              </span>
            );
          }

          return <span key={index}>{part}</span>;
        })}

        {/* Global Floating Tooltip centered horizontally and vertically to pointer */}
        <AnimatePresence>
          {hoveredPhraseIdx !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: -45 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{
                position: "absolute",
                left: `${mousePosition.x + (mousePosition.isRightHalf ? -310 : 20)}px`,
                top: `${mousePosition.y}px`,
                pointerEvents: "none",
              }}
              className="z-50 w-72 bg-slate-900 border border-rose-500/30 p-4 rounded-xl shadow-2xl block text-left"
            >
              <div className="flex items-start gap-2 text-rose-300 mb-1.5 font-bold text-xs uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>Why this phrase is highlighted:</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium block">
                {suspiciousPhrases[hoveredPhraseIdx]?.reason}
              </p>
              <div className="mt-2.5 block border-t border-slate-800 pt-1.5 text-[9px] text-slate-500 font-mono">
                TACTIC: Suspicious phrasing / Emotional triggers
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-medium">Hover matching words/phrases to learn why misinformation writers use them.</span>
      </div>
    </div>
  );
}
