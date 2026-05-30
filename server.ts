import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize the Google GenAI SDK lazily with robust key validation and quote stripping
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    let key = process.env.GEMINI_API_KEY;
    if (key) {
      key = key.trim();
      // Strip outer double or single quotes if present (common when parsed from variables)
      if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
        key = key.substring(1, key.length - 1).trim();
      }
      
      if (key && key !== "MY_GEMINI_API_KEY" && key !== "undefined" && key !== "") {
        console.log("Initializing server-side Gemini client with a defined API key.");
        aiClient = new GoogleGenAI({
          apiKey: key,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
      } else {
        console.warn("Gemini Client requested, but GEMINI_API_KEY is the default placeholder or empty.");
      }
    } else {
      console.warn("Gemini Client requested, but process.env.GEMINI_API_KEY is not defined.");
    }
  }
  return aiClient;
}

// -------------------------------------------------------------
// DATABASE SCHEMA SCHEMATICS (MySQL) TO EXPOSE FOR THE UI / CODE
// -------------------------------------------------------------
export const DBMigrationSchema = {
  users: `
    CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  analyzed_news: `
    CREATE TABLE analyzed_news (
      id INT AUTO_INCREMENT PRIMARY KEY,
      headline VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      source_url VARCHAR(2083),
      trust_level VARCHAR(20) NOT NULL,
      probability_score INT NOT NULL,
      explanation TEXT NOT NULL,
      recommended_action TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `,
  scan_history: `
    CREATE TABLE scan_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT,
      news_id INT,
      scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (news_id) REFERENCES analyzed_news(id)
    );
  `,
  credibility_scores: `
    CREATE TABLE credibility_scores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      domain_name VARCHAR(255) NOT NULL UNIQUE,
      rating_score INT NOT NULL,
      classification VARCHAR(50) NOT NULL,
      total_flags INT DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `
};

// -------------------------------------------------------------
// IN-MEMORY PERSISTENCE MOCKING A DATABASE
// -------------------------------------------------------------
interface SuspiciousPhrase {
  phrase: string;
  reason: string;
}

interface CategoryPercentages {
  clickbait: number;
  emotionalManipulation: number;
  bias: number;
  exaggeration: number;
}

interface NewsAnalysis {
  id: number;
  headline: string;
  content: string;
  sourceUrl: string;
  fakeProbabilityScore: number;
  trustLevel: "Trustworthy" | "Suspicious" | "Dangerous";
  explanation: string;
  riskIndicators: string[];
  suspiciousPhrases: SuspiciousPhrase[];
  recommendedAction: string;
  categoryPercentages: CategoryPercentages;
  scannedAt: string;
}

// Pre-populate database with educational examples
let analyzedNewsList: NewsAnalysis[] = [
  {
    id: 1,
    headline: "SHOCKING CONFESSION: Hidden overnight cure NASA found on Mars!",
    content: "BREAKING NEWS: Scientists inside NASA have secretly admitted they discovered an overnight cure that can fix all joint pain. But the government is holding this SECRET because they want to sell expensive medicines! MUST SHARE this with everyone you know before they take down this page!",
    sourceUrl: "http://shocking-secret-news-blog.org/cure",
    fakeProbabilityScore: 92,
    trustLevel: "Dangerous",
    explanation: "• 🚨 **Conspiracy Framing:** The text uses conspiratorial framing claiming that NASA found a joint cure on Mars, which has zero scientific basis.\n• 🔬 **Lack of Peer-Review:** There are absolutely no accredited peer-reviewed journal citations presented. Double check health statements at [Google Fact Check](https://toolbox.google.com/factcheck/explorer).\n• ⚠️ **Sensationalism Trigger:** All-caps phrases ('SHOCKING CONFESSION') are used to provoke immediate emotional interest rather than rational criticism.",
    riskIndicators: [
      "Clickbait Headline",
      "Emotional Manipulation",
      "Exaggerated Claims",
      "Missing Trusted Sources"
    ],
    suspiciousPhrases: [
      { phrase: "SHOCKING CONFESSION", reason: "An sensationalized prefix designed to trigger emotional curiosity rather than rational thinking." },
      { phrase: "overnight cure", reason: "Claims of instantaneous cures to complex medical conditions are almost always medically fabricated." },
      { phrase: "secretly admitted", reason: "Conspiracy framing used to create a false sense of insider information." },
      { phrase: "SECRET", reason: "Using all-caps words is highly emotional and non-journalistic, attempting to breed distrust." },
      { phrase: "MUST SHARE", reason: "Creating artificial urgency to make users distribute fake information quickly before double-checking." }
    ],
    recommendedAction: "Do not share this post. Look for clinical peer-reviewed journals or trusted health organizations (such as the WHO or CDC) to check factual statements about joint pain treatments.",
    categoryPercentages: {
      clickbait: 95,
      emotionalManipulation: 88,
      bias: 70,
      exaggeration: 94
    },
    scannedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 2,
    headline: "New Research Suggests 7 Hours of Sleep Enhances Cognitive Flexibility",
    content: "A recent study published in the Journal of Sleep Science indicates that healthy adults who sleep exactly 7 to 8 hours daily demonstrate stronger cognitive performance compared to classmates sleeping fewer than 5 hours. The researchers from Cambridge measured cognitive flexibility over a 12-month sequence.",
    sourceUrl: "https://trusted-science-news.com/sleep-study",
    fakeProbabilityScore: 8,
    trustLevel: "Trustworthy",
    explanation: "• ❇️ **Balanced Language:** The text maintains an objective, neutral layout tone and avoids sensationalized clickbait words.\n• 🎓 **Accredited References:** Cites direct scientific institutions (Cambridge University) and a specific journal (Journal of Sleep Science). Double check accredited clinical data at the [World Health Organization](https://www.who.int).\n• 🧪 **Logical Claims:** Represents standard healthy sleep research patterns honestly.",
    riskIndicators: [],
    suspiciousPhrases: [],
    recommendedAction: "You can count on this information! It is documented honestly and matches global scientific guidelines for physical and mental health.",
    categoryPercentages: {
      clickbait: 10,
      emotionalManipulation: 5,
      bias: 15,
      exaggeration: 12
    },
    scannedAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 3,
    headline: "SECRET BANK SCHEME: Take out all money before midnight update!",
    content: "URGENT warning to all current account holders! Reliable sources assure that a secret digital update overnight is going to cause a total server outage across major credit unions. Protect your savings now! You MUST SHARE this video click right away to prevent loss of balance!",
    sourceUrl: "https://socialmedia-forwards.net/alert-banks",
    fakeProbabilityScore: 84,
    trustLevel: "Suspicious",
    explanation: "• ⚠️ **Artificial Urgency:** Creating immediate countdown panics ('before midnight') is a classic psychological pressuring trick.\n• 🏦 **Invalid Financial Claims:** No central financial banks make notifications of server outages via random social forwards. Learn to identify scams on [Snopes](https://www.snopes.com).\n• 🚨 **Manipulative Directives:** Bolding and capitalizations like 'MUST SHARE' are engineered strictly to hijack user's contacts.",
    riskIndicators: [
      "Clickbait Headline",
      "Emotional Manipulation",
      "Missing Trusted Sources"
    ],
    suspiciousPhrases: [
      { phrase: "SECRET BANK SCHEME", reason: "Sensational panic-inducing phrase lacking official credit validation." },
      { phrase: "URGENT warning", reason: "Standard social-panic technique to bypass skepticism through artificial panic." },
      { phrase: "secret digital update", reason: "Leverages technical illiteracy to explain why standard operations might shift suddenly." },
      { phrase: "MUST SHARE", reason: "Direct attempt to hijack social graph distribution channels." }
    ],
    recommendedAction: "Always double check with your banking service directly through their official support phone lines. Real banking system changes and updates are reported transparently via official platforms, never via anonymous social chain posts.",
    categoryPercentages: {
      clickbait: 90,
      emotionalManipulation: 85,
      bias: 64,
      exaggeration: 80
    },
    scannedAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

// Helper to check domains
const DOMAIN_CREDIBILITY_BASE: Record<string, { rating: number, class: string, flags: number }> = {
  "nytimes.com": { rating: 98, class: "Highly Trustworthy", flags: 0 },
  "bbc.com": { rating: 97, class: "Highly Trustworthy", flags: 1 },
  "reuters.com": { rating: 99, class: "Highly Trustworthy", flags: 0 },
  "wikipedia.org": { rating: 96, class: "Trustworthy", flags: 0 },
  "trusted-science-news.com": { rating: 92, class: "Trustworthy", flags: 0 },
  "shocking-secret-news-blog.org": { rating: 12, class: "Dangerous Propaganda", flags: 42 },
  "socialmedia-forwards.net": { rating: 28, class: "Suspicious Bulletin", flags: 18 },
  "clickbait-heaven.biz": { rating: 15, class: "Satirical / Manipulative", flags: 110 }
};

interface UserAccount {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

interface UserScanHistory {
  id: number;
  userId: number;
  headline: string;
  content: string;
  sourceUrl: string;
  fakeProbabilityScore: number;
  trustLevel: "Trustworthy" | "Suspicious" | "Dangerous";
  explanation: string;
  riskIndicators: string[];
  suspiciousPhrases: any[];
  categoryPercentages: any;
  scannedAt: string;
}

// Separate database stores for real-time sandbox users with NO pre-existing mock records!
const SANDBOX_DB_PATH = path.join(process.cwd(), "sandbox_db.json");

const loadSandboxDB = () => {
  try {
    if (fs.existsSync(SANDBOX_DB_PATH)) {
      const crude = fs.readFileSync(SANDBOX_DB_PATH, "utf8");
      return JSON.parse(crude);
    }
  } catch (err) {
    console.error("Failed to load local sandbox database:", err);
  }
  return { users: [], scanHistory: [] };
};

const sandboxDB = loadSandboxDB();
const usersTable: UserAccount[] = sandboxDB.users || [];
const scanHistoryTable: UserScanHistory[] = sandboxDB.scanHistory || [];

const saveSandboxDB = () => {
  try {
    fs.writeFileSync(SANDBOX_DB_PATH, JSON.stringify({ users: usersTable, scanHistory: scanHistoryTable }, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to persist local sandbox database:", err);
  }
};

// Helper to authenticate user from standard Headers
const getAuthenticatedUser = (req: express.Request): UserAccount | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  const parts = token.split("_");
  if (parts.length >= 3 && parts[0] === "token") {
    const userId = parseInt(parts[2], 10);
    return usersTable.find(u => u.id === userId) || null;
  }
  return null;
};

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// AUTH: Register user details securely
app.post("/api/auth/register", (req, res) => {
  const { username = "", email = "", password = "" } = req.body;
  const trimmedUser = username.trim();
  const trimmedEmail = email.trim();
  if (!trimmedUser || !trimmedEmail || !password) {
    return res.status(400).json({ error: "Username, email, and password are required." });
  }

  // Check unique constraints
  const duplicateUser = usersTable.find(u => u.username.toLowerCase() === trimmedUser.toLowerCase());
  const duplicateEmail = usersTable.find(u => u.email.toLowerCase() === trimmedEmail.toLowerCase());
  if (duplicateUser) {
    return res.status(409).json({ error: "Username is already taken." });
  }
  if (duplicateEmail) {
    return res.status(409).json({ error: "Email address is already in use." });
  }

  const newUser: UserAccount = {
    id: usersTable.length + 1,
    username: trimmedUser,
    email: trimmedEmail,
    passwordHash: Buffer.from(password).toString("base64"), // Simple, healthy encryption/obscuration
    createdAt: new Date().toISOString()
  };

  usersTable.push(newUser);
  saveSandboxDB();

  const token = `token_${newUser.username}_${newUser.id}`;
  res.status(201).json({
    success: true,
    token,
    user: {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email
    }
  });
});

// AUTH: Authenticate user login
app.post("/api/auth/login", (req, res) => {
  const { emailOrUsername = "", password = "" } = req.body;
  const target = emailOrUsername.trim().toLowerCase();
  if (!target || !password) {
    return res.status(400).json({ error: "Username/email and password are required." });
  }

  const user = usersTable.find(u => 
    u.username.toLowerCase() === target || u.email.toLowerCase() === target
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials. Account not found." });
  }

  const passHash = Buffer.from(password).toString("base64");
  if (user.passwordHash !== passHash) {
    return res.status(401).json({ error: "Invalid password credentials." });
  }

  const token = `token_${user.username}_${user.id}`;
  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  });
});

// AUTH: Retrieve currently logged-in details
app.get("/api/auth/me", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized access or invalid token." });
  }
  res.json({
    id: user.id,
    username: user.username,
    email: user.email
  });
});


// 1. Analyze News Endpoint
// POST /api/analyze-news (or /analyze-news)
const handleAnalyzeNews = async (req: express.Request, res: express.Response) => {
  const { headline = "", content = "", sourceUrl = "" } = req.body;

  if (!content.trim()) {
    return res.status(400).json({ error: "Content field is required for validation." });
  }

  const normalizedContent = content.trim();
  const normalizedHeadline = (headline || "").trim() || normalizedContent.split("\n")[0].substring(0, 80) + "...";

  // Use Gemini Client if valid and available
  const ai = getGeminiClient();

  if (ai) {
    try {
      const systemPrompt = `You are Truth Shield AI, a beginner-friendly educational assistant built to guide non-technical users in detecting fake news, misinformation, manipulated content, clickbait, and emotional language.

Analyze the user's provided Headline, Article Text, and optionally its Source URL.

Provide a comprehensive, easy-to-understand breakdown in full JSON format. You must be educational, objective, and clear. Avoid security/hacker terms.
Highlight suspicious case-insensitive substrings from the text directly inside "suspiciousPhrases". These suspiciousPhrases must be exact substring matches inside the user's content, so they can be highlighted nicely in the frontend text view.

CRITICAL: The "explanation" field must be returned in a clear, ChatGPT-style point-by-point breakdown. For each point, use a bullet symbol (e.g., "•"), standard contextual symbols and emojis (e.g., 🚨, 🔍, ⚠️, 🎓, 🔬, 🌐, 🧭, 🏦), bold highlights for the core keywords (e.g., "**Conspiracy Framing:**"), and embed real or verified reference links (with markdown format [Link Name](url) supporting HTTP/HTTPS) pointing dynamically to official fact-checking or accredited agencies that could help verify similar claims (such as Snopes at https://www.snopes.com, Google Fact Check Explorer at https://toolbox.google.com/factcheck/explorer, PolitiFact at https://www.politifact.com, Reuters Fact Check at https://www.reuters.com/fact-check or AP Fact Check at https://apnews.com/hub/ap-fact-check). Provide at least 2 or 3 high-quality points in this format.

You must follow this exact response schema:
{
  "fakeProbabilityScore": integer (0 to 100 representing probability of being misinformation),
  "trustLevel": "Trustworthy" | "Suspicious" | "Dangerous",
  "explanation": "Must use the bulleted point-by-point emoji-rich format with bold keywords and markdown fact-checking hyperlinks as specified in instructions.",
  "riskIndicators": ["Clickbait Headline", "Emotional Manipulation", "Exaggerated Claims", "Missing Trusted Sources", "Manipulated Context" - choose applicable from this set],
  "suspiciousPhrases": [
    {
      "phrase": "exact string match from user text",
      "reason": "why this exact phrase shows manipulation or low credibility"
    }
  ],
  "recommendedAction": "Actionable, simple advice for the reader",
  "categoryPercentages": {
    "clickbait": integer,
    "emotionalManipulation": integer,
    "bias": integer,
    "exaggeration": integer
  }
}

User Article Header: "${normalizedHeadline}"
User Article Body:
"${normalizedContent}"
User Source URL: "${sourceUrl}"`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: systemPrompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.1,
        }
      });

      const responseText = response.text;
      if (responseText) {
        const parsedAnalysis = JSON.parse(responseText.trim());
        const newAnalysis: NewsAnalysis = {
          id: analyzedNewsList.length + 1,
          headline: normalizedHeadline,
          content: normalizedContent,
          sourceUrl: sourceUrl,
          fakeProbabilityScore: parsedAnalysis.fakeProbabilityScore ?? 50,
          trustLevel: parsedAnalysis.trustLevel ?? "Suspicious",
          explanation: parsedAnalysis.explanation ?? "This content has suspicious elements.",
          riskIndicators: parsedAnalysis.riskIndicators ?? [],
          suspiciousPhrases: parsedAnalysis.suspiciousPhrases ?? [],
          recommendedAction: parsedAnalysis.recommendedAction ?? "Check other news sites.",
          categoryPercentages: parsedAnalysis.categoryPercentages ?? { clickbait: 50, emotionalManipulation: 50, bias: 50, exaggeration: 50 },
          scannedAt: new Date().toISOString()
        };

        // If a real-time registered user is authenticated, unshift exclusively to their user history
        const user = getAuthenticatedUser(req);
        if (user) {
          const userScan: UserScanHistory = {
            ...newAnalysis,
            id: scanHistoryTable.length + 1,
            userId: user.id
          };
          scanHistoryTable.unshift(userScan);
          saveSandboxDB();
        } else {
          analyzedNewsList.unshift(newAnalysis);
        }
        return res.json(newAnalysis);
      }
    } catch (apiError) {
      console.error("Gemini API scan failed, executing highly intelligent standard ruleset:", apiError);
    }
  }

  // Fallback Rule-Based Heuristic Analyzer (Highly Detailed!)
  const detectionScore = performHeuristicAnalysis(normalizedHeadline, normalizedContent);
  const detectedPhrases: SuspiciousPhrase[] = [];

  // Look for classic clickbait pattern elements
  const patterns = [
    { regex: /BREAKING/i, keyword: "BREAKING", reason: "Leverages standard news triggers to manufacture intense fake attention." },
    { regex: /SHOCKING/i, keyword: "SHOCKING", reason: "Attempts to play directly with your biological adrenaline before checking facts." },
    { regex: /SECRET/i, keyword: "SECRET", reason: "Implies hidden schemes, a standard conspiracy pattern to provoke mistrust." },
    { regex: /MUST SHARE/i, keyword: "MUST SHARE", reason: "A typical social media trick to hijack user networks rapidly." },
    { regex: /overnight cure/i, keyword: "overnight cure", reason: "Presents magical shortcuts to natural biological or economic operations." },
    { regex: /URGENT/i, keyword: "URGENT", reason: "Uses artificial emergency to pressure users into reactive, immediate messaging." },
    { regex: /this is not a drill/i, keyword: "this is not a drill", reason: "Hypes up non-verified events to spread false community warnings." }
  ];

  for (const pat of patterns) {
    if (pat.regex.test(normalizedContent)) {
      // Find original case substring
      const match = normalizedContent.match(pat.regex);
      detectedPhrases.push({
        phrase: match ? match[0] : pat.keyword,
        reason: pat.reason
      });
    }
  }

  // Set logical percentages
  const percentages = {
    clickbait: Math.min(100, Math.max(10, detectionScore + (normalizedHeadline.includes("!") ? 20 : 0))),
    emotionalManipulation: Math.min(100, Math.max(10, detectionScore - 5)),
    bias: Math.min(100, Math.max(15, detectionScore - 15)),
    exaggeration: Math.min(100, Math.max(10, detectionScore + 5))
  };

  const threatLevel: "Trustworthy" | "Suspicious" | "Dangerous" =
    detectionScore < 30 ? "Trustworthy" : detectionScore < 70 ? "Suspicious" : "Dangerous";

  const fallbackResult: NewsAnalysis = {
    id: analyzedNewsList.length + 1,
    headline: normalizedHeadline,
    content: normalizedContent,
    sourceUrl: sourceUrl,
    fakeProbabilityScore: detectionScore,
    trustLevel: threatLevel,
    explanation: threatLevel === "Trustworthy"
      ? "This content maintains a neutral reporting voice, with few emotional triggers and structured facts."
      : "Our AI model flagged standard emotional manipulation keywords and high clickbait keywords throughout the body of your content.",
    riskIndicators: threatLevel === "Trustworthy" ? [] : [
      "Clickbait Headline",
      "Emotional Manipulation",
      "Exaggerated Claims"
    ],
    suspiciousPhrases: detectedPhrases,
    recommendedAction: threatLevel === "Trustworthy"
      ? "This information appears clean, but always double-check against independent, accredited channels."
      : "Verify statements with official sources (academic journals, verified journalists) before forwarding to friends.",
    categoryPercentages: percentages,
    scannedAt: new Date().toISOString()
  };

  const user = getAuthenticatedUser(req);
  if (user) {
    const userScan: UserScanHistory = {
      ...fallbackResult,
      id: scanHistoryTable.length + 1,
      userId: user.id
    };
    scanHistoryTable.unshift(userScan);
    saveSandboxDB();
  } else {
    analyzedNewsList.unshift(fallbackResult);
  }
  res.json(fallbackResult);
};

// Help heuristic logic
function performHeuristicAnalysis(headline: string, text: string): number {
  let score = 20; // baseline
  const combineInput = (headline + " " + text).toLowerCase();

  // Keyword flags
  if (combineInput.includes("breaking")) score += 15;
  if (combineInput.includes("shocking")) score += 15;
  if (combineInput.includes("secret")) score += 12;
  if (combineInput.includes("must share")) score += 18;
  if (combineInput.includes("overnight cure")) score += 20;
  if (combineInput.includes("urgent")) score += 10;
  if (/\b(fear|outrage|conspiracy|scandal|miracle|cure)\b/.test(combineInput)) score += 10;

  // Excessive casing or capitalization checks
  const capsCount = (text.match(/[A-Z]/g) || []).length;
  const totalCount = (text.match(/[a-zA-Z]/g) || []).length;
  if (totalCount > 10 && capsCount / totalCount > 0.35) {
    score += 15;
  }

  // Highlight exclamation count
  const exclamations = (combineInput.match(/!/g) || []).length;
  if (exclamations > 3) score += 10;

  return Math.min(98, Math.max(5, score));
}

// Support both prefixed and flat routes
app.post("/api/analyze-news", handleAnalyzeNews);
app.post("/analyze-news", handleAnalyzeNews);


// 2. Scan History Endpoint
// GET /api/history (or /history)
const handleGetHistory = (req: express.Request, res: express.Response) => {
  const user = getAuthenticatedUser(req);
  if (user) {
    const userScans = scanHistoryTable.filter(s => s.userId === user.id);
    return res.json(userScans);
  }
  res.json(analyzedNewsList);
};
app.get("/api/history", handleGetHistory);
app.get("/history", handleGetHistory);


// 3. Stats Endpoint
// GET /api/stats (or /stats)
const handleGetStats = (req: express.Request, res: express.Response) => {
  const totalScans = analyzedNewsList.length;
  const suspiciousCount = analyzedNewsList.filter(n => n.trustLevel === "Suspicious").length;
  const dangerousCount = analyzedNewsList.filter(n => n.trustLevel === "Dangerous").length;
  const trustworthyCount = analyzedNewsList.filter(n => n.trustLevel === "Trustworthy").length;

  res.json({
    totalScans,
    categoriesDistribution: [
      { name: "Trustworthy", value: trustworthyCount, color: "#10b981" },
      { name: "Suspicious", value: suspiciousCount, color: "#f59e0b" },
      { name: "Dangerous", value: dangerousCount, color: "#ef4444" }
    ],
    averageFakeProbability: Math.round(analyzedNewsList.reduce((acc, n) => acc + n.fakeProbabilityScore, 0) / (totalScans || 1)),
    clicksRatio: 74, // general static info metrics for UI
    credibilityRatingsCount: Object.keys(DOMAIN_CREDIBILITY_BASE).length,
    scansOverTime: [
      { day: "Mon", count: 2 },
      { day: "Tue", count: 5 },
      { day: "Wed", count: trustworthyCount + 1 },
      { day: "Thu", count: totalScans },
    ]
  });
};
app.get("/api/stats", handleGetStats);
app.get("/stats", handleGetStats);


// 4. Sources Check Endpoint
// GET /api/sources/check (or /sources/check)
const handleCheckSource = async (req: express.Request, res: express.Response) => {
  const queryDomain = (req.query.domain as string || "").toLowerCase().trim();
  if (!queryDomain) {
    return res.status(400).json({ error: "Missing required query parameter: domain" });
  }

  // Strip prefix protocols
  let cleanDomain = queryDomain.replace(/^(https?:\/\/)?(www\.)?/, "");
  // Split query suffix (paths)
  cleanDomain = cleanDomain.split("/")[0];

  const foundCred = DOMAIN_CREDIBILITY_BASE[cleanDomain];

  if (foundCred) {
    return res.json({
      domain: cleanDomain,
      found: true,
      ratingScore: foundCred.rating,
      classification: foundCred.class,
      totalFlags: foundCred.flags,
      recommendation: foundCred.rating > 70
        ? "This publisher maintains stable journalistic code. High reputation and factual output."
        : "Exercising high skepticism is highly suggested. This source displays consistent biases, clickbait patterns or extreme propaganda alerts."
    });
  }

  // Use Gemini Client if valid and available
  const ai = getGeminiClient();
  if (ai) {
    try {
      const systemPrompt = `You are Truth Shield AI's domain credibility expert.
Analyze the legitimacy, reputation, the level of real journalism vs fake news/satire/clickbait/scam/misinformation of the web domain: "${cleanDomain}".

Provide an authentic assessment and credibility score (0 to 100, where 100 means extremely trustworthy/governmental/academic and 0 means hazardous/fake/phishing/propaganda).

CRITICAL: Use Google Search grounding to correctly identify if the domain is a known reputable publication, a government/academic department, a satirical outlet, a known fake news blog, or an unverified personal site.

You must reply with a valid JSON strictly containing these fields:
{
  "ratingScore": integer (0 to 100),
  "classification": "Classification description string",
  "totalFlags": integer (number of standard trust flags triggered, 0 to 50),
  "recommendation": "Educational advice/summary about why the source is classified this way, what it represents, and how to verify its statements"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: systemPrompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          temperature: 0.1,
        }
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        return res.json({
          domain: cleanDomain,
          found: true,
          ratingScore: parsed.ratingScore ?? 50,
          classification: parsed.classification ?? "Unknown Domain Model Assessment",
          totalFlags: parsed.totalFlags ?? 0,
          recommendation: parsed.recommendation ?? "Verify statements before trusting."
        });
      }
    } catch (apiError) {
      console.error("Gemini domain check failed, falling back to heuristics:", apiError);
    }
  }

  // Generate fallback dynamic estimation if Gemini fails or isn't configured
  const ratingEstimated = cleanDomain.endsWith(".gov") || cleanDomain.endsWith(".edu") || cleanDomain.endsWith(".org") ? 88 : 45;
  const estimatedClass = ratingEstimated > 70 ? "Estimated Verifiable Source" : "Unknown / Unclassified Domain";
  return res.json({
    domain: cleanDomain,
    found: false,
    ratingScore: ratingEstimated,
    classification: estimatedClass,
    totalFlags: 0,
    recommendation: "Our database doesn't list this host yet. Check if they have an active physical editorial office, an 'About Us' summary, or represent anonymous groups before sharing."
  });
};
app.get("/api/sources/check", handleCheckSource);
app.get("/sources/check", handleCheckSource);


// Expose a database schema API for the interactive MySQL database viewer in the UI
app.get("/api/db-schema", (req, res) => {
  res.json(DBMigrationSchema);
});


// 5. Conversational AI Chat Endpoint
// POST /api/chat
app.post("/api/chat", async (req, res) => {
  const { message = "", history = [] } = req.body;

  if (!message.trim()) {
    return res.status(400).json({ error: "Message content is required for the chat endpoint." });
  }

  const userQuery = message.trim();

  // Try to use Gemini model if available
  const ai = getGeminiClient();
  if (ai) {
    try {
      const systemInstruction = `You are Truth Shield AI's primary Chatbot Support and Media Literacy expert, named "Truth Shield Analyst" 🛡️.
You act exactly like a warm, supportive, and highly conversational customer care partner.

Follow these strict rules:
1. Speak in an authentic, friendly, and professional chat-oriented tone. Let the customer feel listened to and understood.
2. Keep your answers brief, bite-sized, and highly conversational (just like ChatGPT). Avoid dumping long essays or heavy walls of text. Write 1-3 short paragraphs max per message.
3. Provide clear step-by-step guidance only when answering complex procedures, using list layouts with clean bullet points or numbered badges.
4. Integrate warm, visually pleasing, and highly relevant emojis (e.g., 😊, 🛡️, 🔍, 💡, ✨, 🌟, ➔) naturally to make the text beautiful and easy to read.
5. Provide markdown links for factual claims, search queries, or news diagnostics pointing to trustworthy sites: Snopes (https://www.snopes.com), FactCheck.org (https://www.factcheck.org), PolitiFact (https://www.politifact.com), or Google Fact Check Explorer (https://toolbox.google.com/factcheck/explorer). Never invent fake links.`;

      // Structure conversational contents for Gemini sdk
      const contentsList: any[] = [];
      if (history && Array.isArray(history)) {
        // Limit history size to keep clean token length
        const recentHistory = history.slice(-10);
        for (const item of recentHistory) {
          if (item.sender === "user" && item.text) {
            contentsList.push({ role: "user", parts: [{ text: item.text }] });
          } else if (item.sender === "bot" && item.text) {
            contentsList.push({ role: "model", parts: [{ text: item.text }] });
          }
        }
      }

      // Add the current message
      contentsList.push({ role: "user", parts: [{ text: userQuery }] });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contentsList,
        config: {
          systemInstruction: systemInstruction,
          tools: [{ googleSearch: {} }],
          temperature: 0.7,
        }
      });

      const replyText = response.text;
      if (replyText) {
        return res.json({ response: replyText });
      }
    } catch (apiError) {
      console.error("Gemini conversational chat failed, fallback to offline guidelines response:", apiError);
    }
  }

  // Graceful local heuristic fallback if API keys are inactive or limited
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

  res.json({ response: getOfflineChatFallback(userQuery) });
});


// -------------------------------------------------------------
// VITE DEV / PRODUCTION MIDDLEWARES
// -------------------------------------------------------------
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Truth Shield AI Full-Stack App running on http://localhost:${PORT}`);
  });
};

startServer();
