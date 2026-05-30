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
  // Split input by double newlines to find paragraphs, preserving clean paragraph blocks
  const paragraphs = text.split(/\n\n+/);

  return (
    <div className="space-y-4 font-sans text-slate-800 text-sm sm:text-[15px] leading-relaxed select-text w-full text-left">
      {paragraphs.map((para, paraIdx) => {
        const lines = para.split("\n").map(l => l.trim()).filter(Boolean);
        if (lines.length === 0) return null;

        // Check if this entire paragraph represents a list of bullet points
        const isBulletList = lines.every(line => 
          line.startsWith("•") || line.startsWith("-") || line.startsWith("*") || line.startsWith("✦")
        );

        if (isBulletList) {
          return (
            <ul key={paraIdx} className="space-y-2 my-2 pl-1.5">
              {lines.map((line, lineIdx) => {
                const cleanLine = line.replace(/^([•\-\*✦]\s*)/, "").trim();
                return (
                  <li key={lineIdx} className="flex gap-2.5 items-start">
                    <span className="text-blue-500 shrink-0 select-none mt-1.5 text-[8px]">✦</span>
                    <div className="flex-1 font-semibold text-slate-800">
                      {parseInlineFormatting(cleanLine)}
                    </div>
                  </li>
                );
              })}
            </ul>
          );
        }

        // Check if this entire paragraph represents a numbered ordered list
        const isNumberedList = lines.every(line => 
          /^\d+[\.\)]\s+/.test(line)
        );

        if (isNumberedList) {
          return (
            <ol key={paraIdx} className="space-y-2 my-2 pl-1.5">
              {lines.map((line, lineIdx) => {
                const numMatch = line.match(/^(\d+)[\.\)]\s+/);
                const num = numMatch ? numMatch[1] : (lineIdx + 1).toString();
                const cleanLine = line.replace(/^\d+[\.\)]\s+/, "").trim();
                return (
                  <li key={lineIdx} className="flex gap-2.5 items-start">
                    <span className="text-blue-600 bg-blue-50 border border-blue-200/50 rounded-md w-5 h-5 flex items-center justify-center shrink-0 select-none text-[10px] font-extrabold mt-0.5">
                      {num}
                    </span>
                    <div className="flex-1 font-semibold text-slate-800">
                      {parseInlineFormatting(cleanLine)}
                    </div>
                  </li>
                );
              })}
            </ol>
          );
        }

        // Standard lines inside paragraph
        return (
          <div key={paraIdx} className="space-y-1.5">
            {lines.map((line, lineIdx) => {
              // Try to find if line has a leading emoji
              const emojiMatch = line.match(/^([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]|[\ud000-\udfff])/);
              
              if (emojiMatch) {
                const emoji = emojiMatch[0];
                const content = line.substring(emoji.length).trim();
                return (
                  <div key={lineIdx} className="flex gap-2.5 items-start py-0.5">
                    <span className="text-base sm:text-lg shrink-0 select-none mt-0.5">{emoji}</span>
                    <div className="flex-1 font-semibold text-slate-800">
                      {parseInlineFormatting(content)}
                    </div>
                  </div>
                );
              }

              // Stray bullet points inside mix layout
              if (line.startsWith("•") || line.startsWith("-") || line.startsWith("*")) {
                const cleanLine = line.replace(/^([•\-\*]\s*)/, "").trim();
                return (
                  <div key={lineIdx} className="flex gap-2.5 items-start py-0.5 pl-4">
                    <span className="text-blue-500 shrink-0 select-none mt-1.5 text-[8px]">✦</span>
                    <div className="flex-1 font-semibold text-slate-800">
                      {parseInlineFormatting(cleanLine)}
                    </div>
                  </div>
                );
              }

              // Normal text line
              return (
                <p key={lineIdx} className="font-semibold text-slate-800">
                  {parseInlineFormatting(line)}
                </p>
              );
            })}
          </div>
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
      text: `👋 **Welcome to Truth Shield Assistant Support!**

😊 My name is **Truth Shield Analyst**, and I am your dedicated media safety guide today.

🌟 I am here to help you navigate online claims, answer doubts about news legitimacy, check viral rumors, or guide you step-by-step through staying safe on the web! Let's explore everything with full confidence.

💡 **How I can serve you today:**
• **Claim Verification:** Paste a headline or rumor, and I will cross-reference it with our real-time [Google Fact Check Explorer](https://toolbox.google.com/factcheck/explorer) tool to find the truth!
• **Media Literacy:** Ask me how to spot clickbait, handle biased forwards, or check a news domain's safety guidelines.
• **Security Check:** If a browser window demands you to paste strange commands or run a file to "prove you are human", let me check if it's a scam!
        
Please tell me what's on your mind. I am listening, and we'll take our time to explain everything clearly! 🛡️✨`,
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

    // Call server API for conversational assistance
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMsgText,
          history: messages.map(m => ({ sender: m.sender, text: m.text }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        const botText = data.response;

        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Math.random().toString(),
            sender: "bot",
            text: botText,
            timestamp: new Date()
          }]);
          setIsTyping(false);
        }, 800);

      } else {
        throw new Error("Chat call failed");
      }
    } catch (err) {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Math.random().toString(),
          sender: "bot",
          text: getOfflineChatFallback(userMsgText),
          timestamp: new Date()
        }]);
        setIsTyping(false);
      }, 800);
    }
  };

  const getOfflineChatFallback = (query: string): string => {
    const q = query.toLowerCase().trim();
    
    // 1. Technical / Local setup questions
    if (q.includes("local") || q.includes("setup") || q.includes("mysql") || q.includes("browser") || q.includes("database") || q.includes("key") || q.includes("env") || q.includes("config")) {
      return `💡 **Setting up your local environment is incredibly quick and easy!** 😊

Here is a step-by-step hub guide to get you up and running:

1️⃣ **Configure the Gemini AI Key**: Go to [Google AI Studio](https://aistudio.google.com), click to get a free API Key, and paste it into your local project's \`.env\` file as: \`GEMINI_API_KEY=your_key_here\`.
2️⃣ **Interactive Database**: By default, the app runs on a zero-setup JSON database (\`sandbox_db.json\`) to save histories and scans automatically nearby! If you wish to use MySQL, configure your credentials in the same \`.env\` file using the DBMigrationSchema layout.
3️⃣ **Run the Server**: Install dependencies with \`npm install\`, then run \`npm run dev\` and open \`http://localhost:3000\` to see everything alive.

Let me know if you need setup help or run into any trouble, I am here to guide you step-by-step! 🛠️✨`;
    }

    // 2. Greetings - Checked on word boundaries to prevent matching substrings like 'this', 'within', or 'they'.
    const greetingRegex = /\b(hello|hi|hey|greetings|good\s+morning|good\s+afternoon|g'day)\b/i;
    if (greetingRegex.test(q)) {
      return `👋 **Hello! I am Truth Shield Analyst, your friendly safety assistant!** 😊

I am absolutely thrilled to chat with you today! I am here to discuss online claims, answer doubts about news source legitimacy, or guide you step-by-step through staying safe on the web!

🌟 **Here are a few quick ways we can work together today:**
• Analyze a suspicious headline or viral message.
• Learn how to spot clickbait prompts or fear-mongering flags.
• Set up your local database and Gemini AI key.

How is your day going? Tell me what's on your mind and let's explore it together! 💬✨`;
    }

    // 3. Fake News / Verification Steps
    if (q.includes("verify") || q.includes("fake news") || q.includes("check") || q.includes("spot") || q.includes("how to")) {
      return `🧭 **Spotting and verifying claims like a professional is simple!** 🔍

You don't need days of media classes to protect your friends and family. Here are the 3 golden rules:

1️⃣ **Inspect the Source Domain**: Utilize our **Domain Inspector** tab to check if the publisher has hyper-partisan propaganda ratings or unsafe red flags.
2️⃣ **Look for Major Sources**: Open an search engine to verify if reputable global news bureaus are discussing the same report.
3️⃣ **Test with Independent Experts**: Copy the statement and check it on [Snopes Fact Check](https://www.snopes.com) or [FactCheck.org](https://www.factcheck.org).

Do you have a specific rumor or claim you'd like us to look up together right now? Let's check it! 🌟🛡️`;
    }

    // 4. WhatsApp / Viral Forwards
    if (q.includes("whatsapp") || q.includes("forward") || q.includes("viral") || q.includes("message")) {
      return `📌 **Viral WhatsApp forwards can indeed be tricky to navigate!** 📱

Because forwards bypass journalistic controls, false warnings and panic can spread uncontrolled very quickly. Here is the best way to handle them calmly:

• 🛑 **Pause on Urgency**: If a citation urges you to "FORWARD IMMEDIATELY!" or uses flashy capital letters, it is designed to bypass your logical thinking.
• 🔍 **Search the Core claim**: Copy the key sentence and paste it into [Google Fact Check Explorer](https://toolbox.google.com/factcheck/explorer) to check if a verdict already exists.
• 🛡️ **Politely Alert the Sender**: Texting back reports in a positive way maintains community health!

Have you received a suspicious WhatsApp message we can inspect together? Put it in the chat! 😊🌷`;
    }

    // 5. Clickbait / Headlines
    if (q.includes("clickbait") || q.includes("headline") || q.includes("bait")) {
      return `💡 **Spotting sensational clickbait is a great superpower!** 🎣

Clickbait existence relies purely on provoking feelings of curiosity, rage, or anxiety to secure ad revenue. Look out for these telltales:

• 📢 **Sensational Hooks**: Headings shouting "YOU WON'T SECURE WHAT HAPPENS..." or "THE HIDDEN SECRET REVEALED!"
• 😡 **Emotion Triggers**: Using extreme alarmist triggers to override critical questioning.
• ❓ **Leading Questions**: Formulating titles as dramatic questions rather than providing actual facts.

You can paste any headline into our main analyzer screen to check its credibility mathematically! 📊✨`;
    }

    // 6. Cyber Security / Robot Human verification scams
    if (q.includes("robot") || q.includes("human") || q.includes("verification") || q.includes("code") || q.includes("install") || q.includes("scam") || q.includes("command") || q.includes("cmd") || q.includes("powershell")) {
      return `🚨 **Warning: Legitimate websites will NEVER ask you to paste custom script codes!** 🛡️

If a browser window demands you to "press keys, open your terminal (Powershell/CMD), and copy/execute command lines" to prove you are human—**it is an active virus attack!**

* **Genuine verifications**: Legitimate CAPTCHAs only require checking a box or selecting photos. They never execute command files.
* **The Scam Trap**: Copying keys or installing scripts bypasses all browser firewalls, running adware directly on your PC.
* **Immediate Response**: Close the tab right away! If you already ran a code, turn off your internet and scan your system with anti-virus software.

Stay safe in your web browsing! For similar digital alerts, check the [Snopes Fact Check](https://www.snopes.com) portal. 😊🌷`;
    }

    // 7. Thank you / Gratitude
    if (q.includes("thanks") || q.includes("thank you") || q.includes("ty") || q.includes("perfect") || q.includes("awesome") || q.includes("cool") || q.includes("great")) {
      return `😊 **You're very welcome!** 🌟

I am incredibly happy to assist you in staying safe and confident online. Media literacy is a team effort! 🛡️✨

Is there another viral claim you'd like us to inspect? Or do you have setup questions? Let me know! 🌷`;
    }

    // 8. Default dynamic conversational mapper
    const cleanWords = q.split(/\s+/).filter(w => w.length > 3 && !["this", "that", "with", "have", "your", "what", "where", "when", "about"].includes(w));
    if (cleanWords.length > 0) {
      const topic = cleanWords[Math.floor(Math.random() * cleanWords.length)];
      return `💬 **That is an interesting topic about "${topic}"! Let's explore it together!** 😊

While I'm currently running in local offline sandbox mode (without a live Gemini API key connected to the backend server), I'm fully trained to help you think about this critically:

1️⃣ **Find Original References**: Does the discussion about **${topic}** suggest any verified physical evidence, quotes from official sources, or peer-reviewed studies?
2️⃣ **Verify the Claim**: Open search portals to check if authorized news agencies describe **${topic}** in a similar manner, or search on [Snopes Fact-Checker](https://www.snopes.com) for direct verdicts.
3️⃣ **Check the Publishing Source**: Utilize our **Domain Inspector** screen to check the credibility and history of any blog or website presenting this claim.

To connect real-time Gemini AI and explore this topic with full cognitive capabilities, just type **"setup key"** to view our 5-second helper! 

What other thoughts or questions do you have about **${topic}**? Let's keep chatting! 🛡️✨`;
    }

    return `👋 **Hello from Truth Shield Assistant Support!** 🛡️

I am here to answer your doubts clearly, provide helpful web references, and guide you step-by-step through media safety with the support of a friendly customer care representative. 🌟

* **Need Setup Help?** Type **"setup env"** to quickly learn how to connect the Gemini AI fully in your local browser!
* **Want Fact Checks?** Ask me how to verify news easily or find trustworthy Snopes/Google links.

What's on your mind? I am listening, so let's chat! 😊🌷`;
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
