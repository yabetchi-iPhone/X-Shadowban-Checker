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
