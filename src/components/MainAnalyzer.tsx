/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, AlertCircle, FileText, Globe, Sparkles, Send, Trash2, Mail, UserCheck, 
  ShieldAlert, ShieldCheck, HelpCircle, CheckCircle, Info
} from "lucide-react";

// Presets for the 3 different sections
const MISINFO_SUGGESTIONS = [
  {
    title: "🚨 Medical Conspiracy",
    headline: "SHOCKING CONFESSION: Hidden overnight cure NASA found on Mars!",
    content: "BREAKING NEWS: Scientists inside NASA have secretly admitted they discovered an overnight cure that can fix all joint pain. But the government is holding this SECRET because they want to sell expensive medicines! MUST SHARE this with everyone you know before they take down this page!",
    url: "http://shocking-secret-news-blog.org/cure"
  },
  {
    title: "💤 Verified Study",
    headline: "New Research Suggests 7 Hours of Sleep Enhances Cognitive Flexibility",
    content: "A study published in the Journal of Sleep Science indicates that healthy adults who sleep exactly 7 to 8 hours daily demonstrate stronger cognitive performance compared to classmates sleeping fewer than 5 hours. The researchers from Cambridge measured cognitive flexibility over a 12-month sequence.",
    url: "https://trusted-science-news.com/sleep-study"
  },
  {
    title: "💵 Social Bank Alert",
    headline: "SECRET BANK SCHEME: Take out all money before midnight update!",
    content: "URGENT warning to all current account holders! Reliable sources assure that a secret digital update overnight is going to cause a total server outage across major credit unions. Protect your savings now! You MUST SHARE this video click right away to prevent loss of balance!",
    url: "https://socialmedia-forwards.net/alert-banks"
  }
];

const EMAIL_SCAM_SUGGESTIONS = [
  {
    title: "🎁 Gift Card / Cash Claim",
    headline: "CONGRATULATIONS: Unclaimed cash grant of $5,000 pending!",
    content: "DEAR USER, Your email address has been selected as the prime winner of an unsolicited $5,000 cash grant sponsored by the International Fund. Reply immediately with your full legal name, home address, and bank routing code within 24 hours to secure release of coordinates!",
    url: ""
  },
  {
    title: "🔒 Urgent Bank Security Alert",
    headline: "ACCOUNT NOTICE: Your cloud vault passcode will expire in 4 minutes!",
    content: "WARNING: A suspicious login attempt from an unknown country was registered on your desktop configuration. To safeguard your funds and personal documents, you are REQUIRED to immediately click the secure backup URL below to confirm your password identity and abort account locked sequence.",
    url: "http://compromised-account-security-gateway.com/verify"
  },
  {
    title: "🧑‍💻 Urgent Remote Opportunity",
    headline: "EASY WORK: Earn $350 per day typing captcha prompts from your sofa!",
    content: "Hi dear, are you looking for a side job? We represent an offshore tech group hiring beginners. You only need to work 35 minutes a day, and we pay $350. No prior experience is needed! Click this chat link instantly to pay your initial configuration fee of $15 and start receiving payouts today!",
    url: ""
  }
];

interface MainAnalyzerProps {
  onAnalyze: (analyzerData: { headline: string; content: string; sourceUrl: string }) => Promise<void>;
  isLoading: boolean;
}

export default function MainAnalyzer({ onAnalyze, isLoading }: MainAnalyzerProps) {
  // Current Active Sub-Section:
  // 'text' = Misinformation NLP checker
  // 'domain' = Domain Scam Checker (formerly lower component stats)
  // 'email' = Email scams & account analyzer
  const [activeHeaderTab, setActiveHeaderTab] = useState<'text' | 'domain' | 'email'>('text');

  // Input states for Misinformation / Email scanners
  const [headline, setHeadline] = useState("");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");

  // Domain search states
  const [domainQuery, setDomainQuery] = useState("");
  const [domainResult, setDomainResult] = useState<any | null>(null);
  const [isCheckingDomain, setIsCheckingDomain] = useState(false);

  // Form submits for NLP claims or Email check
  const handleScantextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAnalyze({ headline, content, sourceUrl });
  };

  const handleDomainCheckSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainQuery.trim()) return;

    setIsCheckingDomain(true);
    setDomainResult(null);

    try {
      const res = await fetch(`/api/sources/check?domain=${encodeURIComponent(domainQuery.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setDomainResult(data);
      }
    } catch (err) {
      console.error("Domain reputation look up failed:", err);
    } finally {
      setIsCheckingDomain(false);
    }
  };

  const loadTextPreset = (item: typeof MISINFO_SUGGESTIONS[0]) => {
    setHeadline(item.headline);
    setContent(item.content);
    setSourceUrl(item.url);
  };

  const loadEmailPreset = (item: typeof EMAIL_SCAM_SUGGESTIONS[0]) => {
    setHeadline(item.headline);
    setContent(item.content);
    setSourceUrl(item.url);
  };

  const clearScanners = () => {
    setHeadline("");
    setContent("");
    setSourceUrl("");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" id="analyzer-section">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden"
      >
        {/* Glow ambient decoration */}
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header with Animating Emoji */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-6">
          <div className="text-left">
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-slate-850 flex items-center gap-2">
              <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg animate-bounce duration-1000">🛡️</span>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Misinformation Analyzer</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 font-semibold">
              Select an auditor category below to start scanning suspicious threads.
            </p>
          </div>
          
          <button
            onClick={() => {
              clearScanners();
              setDomainQuery("");
              setDomainResult(null);
            }}
            type="button"
            className="self-start md:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 text-xs text-slate-500 hover:text-red-650 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-xl cursor-pointer transition-all font-extrabold shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Fields</span>
          </button>
        </div>

        {/* THREE HEADING SELECTION TABS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-8 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
          
          <button
            type="button"
            onClick={() => {
              setActiveHeaderTab('text');
              clearScanners();
            }}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeHeaderTab === 'text'
                ? "bg-white text-blue-600 shadow-sm border border-slate-200/50"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            }`}
          >
            <span>✍️</span>
            <span>Misinformation Text Scan</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveHeaderTab('domain');
              setDomainQuery("");
              setDomainResult(null);
            }}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeHeaderTab === 'domain'
                ? "bg-white text-blue-600 shadow-sm border border-slate-200/50"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            }`}
          >
            <span>🌐</span>
            <span>Domain Web Scam Check</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveHeaderTab('email');
              clearScanners();
            }}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeHeaderTab === 'email'
                ? "bg-white text-blue-600 shadow-sm border border-slate-200/50"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            }`}
          >
            <span>📧</span>
            <span>Email Scams & Accounts</span>
          </button>

        </div>

        {/* TAB 1: MISINFORMATION NLP TEXT CHECKER */}
        {activeHeaderTab === 'text' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl text-xs sm:text-sm text-slate-700 space-y-1">
              <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span>Verify Public News & Claims ✍️</span>
              </p>
              <p className="text-slate-600 font-semibold leading-relaxed">
                Check whether breaking posts, articles, or digital health claims carry elements of emotional triggers, bias, exaggeration, or fake citations.
              </p>
            </div>


            <form onSubmit={handleScantextSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm text-slate-700 font-extrabold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  <span>News Headline / Title <span className="text-slate-500 font-normal">(Optional)</span></span>
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. BREAKING: Medical scientists discovered joint secret..."
                  className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm py-3 px-4 rounded-xl text-slate-800 outline-none transition-colors"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm text-slate-750 font-extrabold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-500" />
                  <span>Main Text Content or Social Post Text <span className="text-red-500">*</span></span>
                </label>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste article, blog post body, WhatsApp claim forwards, or opinion threads here..."
                  rows={4}
                  className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm py-3 px-4 rounded-xl text-slate-800 outline-none transition-colors min-h-[100px]"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm text-slate-700 font-extrabold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span>Reference Source Website Link URL <span className="text-slate-500 font-normal">(Optional)</span></span>
                </label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="e.g. https://www.sciencepoint.org/records"
                  className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm py-3 px-4 rounded-xl text-slate-800 outline-none transition-colors"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !content.trim()}
                className={`w-full text-white font-extrabold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md ${
                  isLoading 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200" 
                    : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg shadow-blue-550/10 animate-pulse duration-1000"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Credentials...</span>
                  </span>
                ) : (
                  <>
                    <Search className="w-4.5 h-4.5" />
                    <span>Validate News Verifiability</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: DOMAIN WEB SCAM CHECKER */}
        {activeHeaderTab === 'domain' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl text-xs sm:text-sm text-slate-700 space-y-1 animate-fade-in">
              <p className="font-extrabold text-slate-800 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-amber-600" />
                <span>Check Domain & Source Compliance 🌐</span>
              </p>
              <p className="text-slate-650 font-semibold leading-relaxed">
                Instantly check publishing URLs or blog domain slugs back against a database classification index to prevent malware or extreme hyper-partisan propaganda hits.
              </p>
            </div>

            <form onSubmit={handleDomainCheckSubmit} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={domainQuery}
                  onChange={(e) => setDomainQuery(e.target.value)}
                  placeholder="e.g. nytimes.com, shocking-secret-news-blog.org, wikipedia.org"
                  className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm py-3.5 pl-10 pr-4 rounded-xl text-slate-800 outline-none transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={isCheckingDomain || !domainQuery.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer active:scale-[0.98] shrink-0 shadow-md shadow-blue-500/10"
              >
                {isCheckingDomain ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Checking Database...</span>
                  </>
                ) : (
                  <span>Inspect Source</span>
                )}
              </button>
            </form>

            {/* Render Domain Search Result in-place */}
            <AnimatePresence mode="wait">
              {domainResult && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Inspected Publisher</span>
                      <span className="font-mono text-base font-extrabold text-blue-600">{domainResult.domain}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        domainResult.ratingScore > 70 ? "bg-emerald-550" : domainResult.ratingScore > 40 ? "bg-amber-500" : "bg-red-550"
                      }`} />
                      <span className="text-xs font-extrabold text-slate-800">{domainResult.classification}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div className="sm:col-span-2 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Shield Guidance 💡</span>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-bold">
                        {domainResult.recommendation}
                      </p>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl text-center space-y-1">
                      <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">Rep Rating</span>
                      <span className={`text-2xl font-display font-black block ${
                        domainResult.ratingScore > 70 ? "text-emerald-600" : domainResult.ratingScore > 40 ? "text-amber-500" : "text-red-500"
                      }`}>
                        {domainResult.ratingScore}/100
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono font-bold block">Flags Reported: {domainResult.totalFlags}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* TAB 3: EMAIL SCAMS & ACCOUNT GUARD */}
        {activeHeaderTab === 'email' && (
          <div className="space-y-6 animate-fade-in text-left">
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-xs sm:text-sm text-slate-700 space-y-1 animate-fade-in">
              <p className="font-extrabold text-slate-850 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-emerald-600" />
                <span>Phishing Scan & Account Guard 📧</span>
              </p>
              <p className="text-slate-600 font-semibold leading-relaxed">
                Scan suspicious inbox threads, foreign cash claims, lottery awards, or account locked alerts to check for pressure triggers, phishing coordinates, or digital impersonation.
              </p>
            </div>


            <form onSubmit={handleScantextSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm text-slate-750 font-extrabold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-500" />
                  <span>Suspicious Email Body / Chat Text / Handle Post <span className="text-red-500">*</span></span>
                </label>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste lotteries, unclaimed legacy winnings, suspicious login warnings, captcha work schemes, or direct chats here..."
                  rows={4}
                  className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm py-3 px-4 rounded-xl text-slate-800 outline-none transition-colors min-h-[100px]"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs sm:text-sm text-slate-700 font-extrabold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span>Sender ID Domain or Handle <span className="text-slate-500 font-normal">(Optional)</span></span>
                </label>
                <input
                  type="text"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="e.g. security-paypal-verification.net, @lotterygrantawards"
                  className="w-full bg-slate-50/50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm py-3 px-4 rounded-xl text-slate-800 outline-none transition-colors"
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !content.trim()}
                className={`w-full text-white font-extrabold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-md ${
                  isLoading 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none border border-slate-200" 
                    : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg shadow-emerald-500/10 animate-pulse duration-1000"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Scam Factors...</span>
                  </span>
                ) : (
                  <>
                    <Mail className="w-4.5 h-4.5" />
                    <span>Scan Phishing & Account Integrity</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* AI EVALUATOR PROGRESS ANIMATION FOR SCRIPTS */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 border-t border-slate-100 pt-6 space-y-4"
            >
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 relative overflow-hidden text-left">
                {/* Scanner bar animation */}
                <div className="absolute left-0 right-0 h-1 bg-blue-500/35 blur-xs animate-scan" style={{ top: 0 }} />

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg animate-pulse">
                    <Sparkles className="w-5 h-5 animate-spin" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-700 font-bold">Evaluating parameters...</span>
                      <span className="text-[10px] text-slate-500 font-mono">Running @google/genai metrics</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                        className="h-full bg-blue-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-500 font-extrabold font-sans">
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-3xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
                    <span>Detecting scam urgency</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-3xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>Highlighting phishing phrases</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-3xs">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                    <span>Scoring credibility factors</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
}
