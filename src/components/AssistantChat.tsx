/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, User, Bot } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
}

// Helper to parse Markdown links [text](url) and bold **text** in a clean, stable way.
function parseInlineFormatting(inputText: string): React.ReactNode[] {
  const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
  const parts = inputText.split(regex);
  
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={index} className="font-extrabold text-slate-900 bg-slate-100 px-1 py-0.5 rounded border border-slate-200/60 font-sans">
          {boldText}
        </strong>
      );
    } else if (part.startsWith("[") && part.includes("](")) {
      const closingBracketIndex = part.indexOf("](");
      const linkText = part.slice(1, closingBracketIndex);
      const linkUrl = part.slice(closingBracketIndex + 2, -1);
      return (
        <a
          key={index}
          href={linkUrl}
          target="_blank"
          referrerPolicy="no-referrer"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-800 underline font-extrabold transition-colors hover:decoration-blue-800"
        >
          <span>{linkText}</span>
          <span className="text-[10px] no-underline">🔗</span>
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

interface BotMessageFormatterProps {
  text: string;
}

export function BotMessageFormatter({ text }: BotMessageFormatterProps) {
  const rawLines = text.split("\n").map(l => l.trim()).filter(Boolean);

  return (
    <div className="space-y-3.5 font-sans text-slate-800 text-sm sm:text-[15px] leading-relaxed select-text w-full text-left">
      {rawLines.map((line, idx) => {
        // Check if the line is a list item or start of a block
        let cleanLine = line.replace(/^([•\-\*\s■▪▫▶️➔➔\d+\.\s]+)/, "").trim();

        // Attempt structured visual emoji isolation
        const emojiMatch = cleanLine.match(/^([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]|[\ud000-\udfff])/);
        
        let emoji: string | null = null;
        let lineContent = cleanLine;
        
        if (emojiMatch) {
          emoji = emojiMatch[0];
          lineContent = cleanLine.substring(emoji.length).trim();
        }

        // Render line
        if (emoji) {
          return (
            <div key={idx} className="flex gap-3 items-start py-0.5">
              <span className="text-base sm:text-lg shrink-0 select-none mt-0.5">{emoji}</span>
              <div className="flex-1 font-semibold text-slate-805">
                {parseInlineFormatting(lineContent)}
              </div>
            </div>
          );
        }

        // Check if original line was a standard bullet point without emoji
        const wasBullet = line.startsWith("•") || line.startsWith("-") || line.startsWith("*");

        if (wasBullet) {
          return (
            <div key={idx} className="flex gap-2.5 items-start py-0.5 pl-4">
              <span className="text-blue-500 shrink-0 select-none mt-[8px] font-bold text-[8px]">✦</span>
              <div className="flex-1 font-semibold text-slate-805">
                {parseInlineFormatting(cleanLine)}
              </div>
            </div>
          );
        }

        // Default paragraph
        return (
          <p key={idx} className="font-semibold text-slate-805 my-1">
            {parseInlineFormatting(line)}
          </p>
        );
      })}
    </div>
  );
}

export default function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "bot",
      text: `🤖 **Welcome to AI News Analyst**: I am your automated diagnostic verification partner. Let's inspect news integrity!
💡 **Diagnostic Guidance**: Ask me questions about clickbait phrases, fear-mongering tactics, or report suspicious statements.
🛡️ **Verify Sources**: You can cross-reference headlines back on reputable platforms like [Google Fact Check Explorer](https://toolbox.google.com/factcheck/explorer) or check safety domain reputation profiles!`,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat view with a small layout paint deferral to ensure strict scrolling completion
  useEffect(() => {
    const scrollTimer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
    return () => clearTimeout(scrollTimer);
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsgText = inputText.trim();
    const newUserMessage: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: userMsgText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputText("");
    setIsTyping(true);

    // Call server API for smart assistance
    try {
      const response = await fetch("/api/analyze-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: userMsgText })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Exact Precise Intent Alignment checking
        let botText = data.explanation || "";

        if (!botText) {
          if (data.fakeProbabilityScore > 65) {
            botText = `🚨 **High Threat Warning**: My scan identified high patterns of potential misinformation within this statement (${data.fakeProbabilityScore}% Risk Score).
⚠️ **Triggered Flags**: Checked signals include: **${data.riskIndicators ? data.riskIndicators.join(", ") : "Sensational claims"}**.
🎓 **Diagnostic Review**: ${data.explanation || "Exaggerated wording with unverified details."}
🛡️ **Action Recommendation**: ${data.recommendedAction || "Avoid sharing."} Be sure to cross-check this query directly with [Google Fact Check](https://toolbox.google.com/factcheck/explorer).`;
          } else if (data.fakeProbabilityScore < 30 && data.suspiciousPhrases?.length === 0) {
            botText = `✅ **Analysis Clean**: This statement aligns strongly with objective journalistic standards. Risk index is low (${data.fakeProbabilityScore}%).
🌐 **Verification Check**: While details look healthy, please examine the publishing company domain name via our standard [Domain Inspector Tool](/analyze) tab to assure optimal coverage.`;
          } else {
            botText = getInformationalAnswer(userMsgText);
          }
        }

        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Math.random().toString(),
            sender: "bot",
            text: botText,
            timestamp: new Date()
          }]);
          setIsTyping(false);
        }, 1200);

      } else {
        throw new Error("Chat call failed");
      }
    } catch (err) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Math.random().toString(),
          sender: "bot",
          text: getInformationalAnswer(userMsgText),
          timestamp: new Date()
        }]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const getInformationalAnswer = (query: string): string => {
    const q = query.toLowerCase();
    
    // Exact verification robot/human installer code prompt match (cyber security check)
    if (q.includes("robot") || q.includes("human") || q.includes("verify") || q.includes("copy code") || q.includes("install") || q.includes("cmd") || q.includes("powershell") || q.includes("command prompt")) {
      return `🚨 **Malicious Verification Scam (High Security Threat)**: Legitimate services and websites use standard, automatic CAPTCHAs (like ticking a box, clicking traffic lights, or solving quick interactive puzzles). They will **NEVER** ask you to copy commands, open your computer terminal or command prompt, run custom script codes, or install local executable files to prove you are human.
⚠️ **How the Attack Succeeds**: This is a dangerous social engineering trap. Compromised websites instruct the user to press key combos (such as Win+R), paste clipboard codes, or run Powershell strings. This instantly bypasses all browser security parameters and executes a virus directly on your operating system.
🛡️ **Immediate Action Plan**:
• **Do NOT copy, paste, or run any text or files** from this website.
• **Close the tab immediately**.
• If you already ran a custom code, disconnect your device from the internet right away and execute a comprehensive system search with trusted anti-malware software.
• You can double-check similar active cyber fraud alerts on [Snopes Fact Check](https://www.snopes.com) or read safety updates with [Google Fact Check Explorer](https://toolbox.google.com/factcheck/explorer).`;
    }

    if (q.includes("whatsapp") || q.includes("forward")) {
      return `🚨 **WhatsApp Forward Harassment**: WhatsApp forwards completely bypass journalistic filters, letting warnings spiral uncontrolled into standard communities.
💡 **Diagnostic Guidance**: Before forwarding viral warnings, inspect key quotes. Copy any single phrase and run searches on [Google News](https://news.google.com) to see if mainstream reports exist.
🎓 **Verification Principle**: Never copy/forward text that urges you to share 'immediately before it is deleted'—this is typical social panic manipulation. Check targets with independent experts on the [Snopes Fact-Checker](https://www.snopes.com).`;
    }
    if (q.includes("emotional") || q.includes("scared") || q.includes("fear")) {
      return `⚠️ **Emotional Exploitation**: Balanced articles outline facts calmly. Malicious creators rely on intense triggers like shock, anxiety, or rage to stop you from questioning.
💡 **Diagnostic Guidance**: If an inbox message uses scary prompts (like 'SHOCKING CONFESSION' or 'YOUR VACCINE DETAILS ARE COMPROMISED'), pause, breathe, and verify on [FactCheck.org](https://www.factcheck.org).
🎓 **Verification Principle**: Any article seeking to spark anger or alarm before you analyze the data demands additional cross-references.`;
    }
    if (q.includes("clickbait") || q.includes("headline")) {
      return `💡 **Exaggerated Headlines**: Clickbait headlines rely on sensational terminology and incomplete summaries to force clicks, generating advertising revenue.
🚨 **Sensational Signals**: Look out for headers with excessive capitalization, nested exclamation marks, or missing reliable sources.
🔬 **Diagnostic Check**: Cross-check title snippets on official search directories like [Google Fact Check Explorer](https://toolbox.google.com/factcheck/explorer) first.`;
    }
    if (q.includes("how") || q.includes("verify") || q.includes("check")) {
      return `🛡️ **Verify Like a Professional**: Spotting fake news does not require days. You can use these rapid diagnostics.
🔎 **Domain Check**: Use our 'Domain Inspector' interface to scan for hyper-partisan propaganda labels.
🌐 **Expert Databases**: Search original subject headers directly on [Snopes](https://www.snopes.com) or [FactCheck.org](https://www.factcheck.org) to obtain verified verdicts.
🎓 **Verification Principle**: If only one unknown blog website reports on a major global breaking story, treat has high probability of a rumor.`;
    }
    return `💡 **Misinformation Shield**: Digital rumor channels succeed when individuals process social materials too fast.
🛡️ **Verify Domains**: Feed publisher addresses through our active reputation dashboard to extract risk profiles.
🔍 **Cross References**: Consult fact-check databases such as [Snopes](https://www.snopes.com) or [Google Fact Check](https://toolbox.google.com/factcheck/explorer) to verify claims.
🎓 **Safe Sharing**: By training your diagnostic reflexes, you effectively halt digital panic before it spreads to your contacts!`;
  };

  return (
    <div className="w-full h-full flex flex-col relative bg-slate-50/10" id="ai-assistant-chat">
      {/* Conversation viewport - Centered column to align perfectly with ChatGPT standards */}
      <div className="flex-1 overflow-y-auto py-8 px-4 space-y-6 max-w-3xl mx-auto w-full custom-chat-scroller">
        <AnimatePresence initial={false}>
          {messages.map((msg) => {
            const isBot = msg.sender === "bot";
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className={`flex gap-4 max-w-full text-left items-start ${
                  isBot ? "flex-row" : "flex-row-reverse"
                }`}
              >
                {/* Clean round avatars */}
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full shrink-0 flex items-center justify-center border font-sans text-xs sm:text-sm shadow-2xs select-none ${
                  isBot 
                    ? "bg-slate-900 border-slate-750 text-white" 
                    : "bg-slate-150 border-slate-200 text-slate-800 font-extrabold"
                }`}>
                  {isBot ? <Bot className="w-4.5 h-4.5 text-blue-400" /> : <User className="w-4.5 h-4.5 text-slate-650" />}
                </div>

                <div className="flex-1 space-y-1 w-full max-w-full">
                  {isBot ? (
                    <div className="w-full">
                      <BotMessageFormatter text={msg.text} />
                    </div>
                  ) : (
                    <div className="inline-block p-4 rounded-2xl bg-slate-100 text-slate-800 border border-slate-200/80 shadow-3xs max-w-[85%] text-left whitespace-pre-wrap leading-relaxed text-xs sm:text-sm font-semibold">
                      <p>{msg.text}</p>
                    </div>
                  )}
                  <span className={`text-[10px] block mt-1 font-sans font-bold select-none text-slate-400 ${
                    isBot ? "text-left pl-1" : "text-right pr-2"
                  }`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4 items-start"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900 border border-slate-755 text-white shrink-0 flex items-center justify-center select-none shadow-2xs">
              <Bot className="w-4.5 h-4.5 text-blue-400 animate-pulse" />
            </div>
            <div className="py-3.5 px-5 rounded-2xl bg-slate-100 border border-slate-200/85 flex items-center gap-2 shadow-2xs">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-slate-500 font-extrabold ml-1">Analyzing claims...</span>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} className="h-8" />
      </div>

      {/* Input area styled cleanly identical to high-end conversational inputs */}
      <div className="sticky bottom-0 left-0 right-0 z-20 max-w-3xl mx-auto w-full px-4 pb-6 pt-8 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent backdrop-blur-md">
        <form onSubmit={handleSendMessage} className="flex gap-2 w-full justify-center">
          <div className="relative flex-1 flex items-center bg-white border border-slate-200/90 shadow-sm rounded-2xl p-1 gap-1 focus-within:ring-2 focus-within:ring-blue-500/15 focus-within:border-blue-500/80 transition-all duration-200">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Message Truth Shield Analyst..."
              className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 text-xs sm:text-sm py-3 px-4 outline-none font-semibold"
            />
            <button
              type="submit"
              id="btn_chat_send"
              disabled={!inputText.trim()}
              className="bg-slate-900 hover:bg-slate-800 transition-colors text-white font-extrabold p-3 rounded-xl cursor-pointer disabled:bg-slate-50 disabled:text-slate-350 disabled:cursor-not-allowed flex items-center justify-center shrink-0 active:scale-[0.98]"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </form>
        <p className="text-[10px] text-slate-400 mt-2 font-mono text-center font-bold">
          Truth Shield AI • Supported by Gemini guidelines analysis model
        </p>
      </div>
    </div>
  );
}
