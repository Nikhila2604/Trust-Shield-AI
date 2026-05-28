/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SuspiciousPhrase {
  phrase: string;
  reason: string;
}

export interface CategoryPercentages {
  clickbait: number;
  emotionalManipulation: number;
  bias: number;
  exaggeration: number;
}

export interface NewsAnalysis {
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

export interface CategoryDistributionItem {
  name: string;
  value: number;
  color: string;
}

export interface ScansOverTime {
  day: string;
  count: number;
}

export interface StatsResponse {
  totalScans: number;
  categoriesDistribution: CategoryDistributionItem[];
  averageFakeProbability: number;
  clicksRatio: number;
  credibilityRatingsCount: number;
  scansOverTime: ScansOverTime[];
}

export interface SourceCheckResult {
  domain: string;
  found: boolean;
  ratingScore: number;
  classification: string;
  totalFlags: number;
  recommendation: string;
}

export interface DBSchemaResponse {
  users: string;
  analyzed_news: string;
  scan_history: string;
  credibility_scores: string;
}
