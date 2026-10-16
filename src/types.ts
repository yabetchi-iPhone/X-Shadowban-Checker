export type CheckItemStatus = 'ok' | 'ban' | 'deboosted';

export interface CheckItem {
  status: CheckItemStatus;
  label: string;
  description: string;
}

export interface CheckResult {
  username: string;
  exists: boolean;
  isProtected: boolean;
  isSuspended: boolean;
  displayName: string;
  avatarUrl: string;
  followersCount: number;
  followingCount: number;
  tweetCount: number;
  checks: {
    searchBan: CheckItem;
    searchSuggestionBan: CheckItem;
    ghostBan: CheckItem;
    replyDeboosting: CheckItem;
  };
  overallHealthScore: number;
  overallStatus: 'ALL_CLEAR' | 'WARNING' | 'BAN_DETECTED' | 'SUSPENDED';
  confidenceScore?: number;
  recentTweetsAnalyzed?: number;
  riskFactors?: string[];
  algorithmicSummary?: string;
  behaviorMetrics?: {
    replyRatio: number;
    duplicateRatio: number;
    urlRatio: number;
    hasSpamKeywords: boolean;
  };
  checkedAt: string;
}

export interface AIDiagnosis {
  riskLevel: string;
  summary: string;
  possibleCauses: string[];
  recoveryPlan: string[];
  estimatedRecoveryTime: string;
  preventionTips: string[];
}

export interface HistoryItem {
  id: string;
  username: string;
  displayName: string;
  overallStatus: 'ALL_CLEAR' | 'WARNING' | 'BAN_DETECTED' | 'SUSPENDED';
  overallHealthScore: number;
  checkedAt: string;
}

export type RiskSeverity = 'low' | 'medium' | 'high';

export interface CategoryRisk {
  level: RiskSeverity;
  note: string;
}

export interface PostSafetyCheckResult {
  riskScore: number; // 0 - 100 (0 = very safe, 100 = critical danger)
  riskLevel: 'SAFE' | 'CAUTION' | 'DANGER';
  urlRisk: CategoryRisk;
  spamRisk: CategoryRisk;
  sentimentRisk: CategoryRisk;
  hashtagRisk: CategoryRisk;
  warnings: string[];
  suggestions: string[];
  optimizedPost: string;
  advice: string;
  checkedAt: string;
}

export interface SecurityAuditItem {
  id: string;
  category: 'authentication' | 'privacy' | 'apps' | 'hygiene';
  title: string;
  description: string;
  recommendation: string;
  riskIfIgnored: string;
  actionUrl?: string;
  actionLabel?: string;
}

