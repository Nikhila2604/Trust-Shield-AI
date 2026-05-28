/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

export default function TechGridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* 1. Subtle static tech grid pattern */}
      <div
        className="absolute inset-0 w-full h-full opacity-[0.15]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(59, 130, 246, 0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.06) 1px, transparent 1px)
          `,
          backgroundSize: "45px 45px",
        }}
      />

      {/* 2. Grid intersection static light node accents */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-[120px] left-[10%] w-2 h-2 rounded-full bg-blue-500/30 blur-[1px] shadow-sm shadow-blue-400 opacity-60"
        />
        <div 
          className="absolute top-[280px] right-[25%] w-2 h-2 rounded-full bg-indigo-500/30 blur-[1px] shadow-sm shadow-indigo-400 opacity-50"
        />
        <div 
          className="absolute bottom-[240px] left-[35%] w-2 h-2 rounded-full bg-sky-500/30 blur-[1px] shadow-sm shadow-sky-400 opacity-40"
        />
        <div 
          className="absolute bottom-[360px] right-[15%] w-2 h-2 rounded-full bg-blue-500/30 blur-[1px] shadow-sm shadow-blue-400 opacity-60"
        />
      </div>

      {/* 3. Static decorative background particles */}
      <div className="absolute inset-0">
        <div className="absolute top-[180px] left-[20%] w-1.5 h-1.5 rounded-full bg-blue-300 opacity-30" />
        <div className="absolute top-[350px] right-[30%] w-1 header-circle h-1 rounded-full bg-indigo-300 opacity-20" />
        <div className="absolute bottom-[150px] left-[15%] w-1 h-1 rounded-full bg-sky-300 opacity-20" />
      </div>

      {/* 4. Soft radial white fade vignette to secure pure text legibility above */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,_var(--tw-gradient-stops)] from-transparent via-slate-50/10 to-slate-50/70" />
    </div>
  );
}
