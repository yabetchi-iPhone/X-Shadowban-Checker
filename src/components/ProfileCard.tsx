import React, { useState } from 'react';
import { CheckResult } from '../types';
import { ShieldCheck, AlertTriangle, XCircle, ExternalLink, Share2, Copy, Check, Clock } from 'lucide-react';

interface ProfileCardProps {
  result: CheckResult;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ result }) => {
  const [copied, setCopied] = useState(false);

  const formatTimestamp = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return isoString;
    }
  };

  const getStatusBadge = () => {
    switch (result.overallStatus) {
      case 'ALL_CLEAR':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>ALL CLEAR (正常)</span>
          </div>
        );
      case 'WARNING':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-full font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>WARNING (一部制限あり)</span>
          </div>
        );
      case 'BAN_DETECTED':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-full font-bold text-sm">
            <XCircle className="w-4 h-4 text-rose-500" />
            <span>BAN DETECTED (重度制限)</span>
          </div>
        );
      case 'SUSPENDED':
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/30 rounded-full font-bold text-sm">
            <AlertTriangle className="w-4 h-4 text-slate-500" />
            <span>凍結・非公開・未存在</span>
          </div>
        );
    }
  };

  const getHealthBarColor = () => {
    if (result.overallHealthScore >= 80) return 'bg-emerald-500';
    if (result.overallHealthScore >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const handleCopyResult = () => {
    const text = `【X シャドウバン結果】
アカウント: @${result.username}
判定: ${result.overallStatus === 'ALL_CLEAR' ? '正常 (All Clear)' : result.overallStatus}
健全度: ${result.overallHealthScore}/100
・検索BAN: ${result.checks.searchBan.status === 'ok' ? 'OK' : 'BAN'}
・検索補完BAN: ${result.checks.searchSuggestionBan.status === 'ok' ? 'OK' : 'BAN'}
・ゴーストBAN: ${result.checks.ghostBan.status === 'ok' ? 'OK' : 'BAN'}
・リプライ降格: ${result.checks.replyDeboosting.status === 'ok' ? 'OK' : 'DEBOOSTED'}
チェック時刻: ${formatTimestamp(result.checkedAt)}
#Xシャドウバンチェッカー`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareToX = () => {
    const statusText = result.overallStatus === 'ALL_CLEAR' ? '正常（クリア）' : '制限検出';
    const text = encodeURIComponent(
      `@${result.username} のXシャドウバンチェック結果: 【${statusText}】健全度スコア: ${result.overallHealthScore}/100\n#Xシャドウバンチェッカー`
    );
    const shareUrl = `https://x.com/intent/post?text=${text}`;
    window.open(shareUrl, '_blank');
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-6 px-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={result.avatarUrl}
                alt={result.username}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/identicon/svg?seed=${result.username}`;
                }}
                className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
              />
              <div className="absolute -bottom-1 -right-1 bg-slate-900 text-white rounded-full p-1 text-[10px]">
                <Share2 className="w-3 h-3 text-sky-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-lg text-slate-900 dark:text-white">
                  {result.displayName}
                </h2>
                {result.isProtected && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-semibold rounded">
                    鍵垢 (非公開)
                  </span>
                )}
              </div>
              <p className="font-mono text-sm text-slate-500 dark:text-slate-400">
                @{result.username}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1 w-full sm:w-auto">
            {getStatusBadge()}
            <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
              <Clock className="w-3 h-3" />
              <span>計測: {formatTimestamp(result.checkedAt)}</span>
            </div>
          </div>
        </div>

        {/* Account Health Score Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              アカウント健全度スコア (Account Health Score)
            </span>
            <span className="font-bold font-mono text-base text-slate-900 dark:text-white">
              {result.overallHealthScore} / 100
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${getHealthBarColor()}`}
              style={{ width: `${result.overallHealthScore}%` }}
            />
          </div>
        </div>

        {/* Quick External Testing Links */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`https://x.com/search?q=from%3A${result.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
            >
              <span>Xで投稿検索</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href={`https://x.com/search?q=from%3A${result.username}&f=live`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
            >
              <span>最新検索テスト</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href={`https://x.com/${result.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
            >
              <span>Xプロフィール</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyResult}
              className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'コピー完了' : '結果をコピー'}</span>
            </button>

            <button
              onClick={handleShareToX}
              className="flex-1 sm:flex-none px-3 py-1.5 bg-black hover:bg-slate-800 text-white dark:bg-sky-500 dark:hover:bg-sky-600 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Xでポストする</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
