import React, { useState } from 'react';
import { CheckResult } from '../types';
import { BAN_TYPE_GUIDES } from '../data/shadowbanKnowledge';
import { CheckCircle2, AlertOctagon, AlertTriangle, Info, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface BanStatusCardsProps {
  result: CheckResult;
}

export const BanStatusCards: React.FC<BanStatusCardsProps> = ({ result }) => {
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const toggleExpand = (key: string) => {
    setExpandedCard(expandedCard === key ? null : key);
  };

  const renderStatusBadge = (status: 'ok' | 'ban' | 'deboosted') => {
    if (status === 'ok') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-full font-bold text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>OK (正常)</span>
        </span>
      );
    }
    if (status === 'deboosted') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full font-bold text-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>DEBOOSTED (降格あり)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-full font-bold text-xs">
        <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />
        <span>BAN (制限あり)</span>
      </span>
    );
  };

  const items = [
    {
      key: 'searchBan',
      title: '検索BAN (Search Ban)',
      subtitle: '検索結果（話題・最新）への表示',
      check: result.checks.searchBan,
      guide: BAN_TYPE_GUIDES.searchBan,
      testUrl: `https://x.com/search?q=from%3A${result.username}&f=live`,
    },
    {
      key: 'searchSuggestionBan',
      title: '検索補完BAN (Search Suggestion Ban)',
      subtitle: '検索入力時のサジェスト・候補表示',
      check: result.checks.searchSuggestionBan,
      guide: BAN_TYPE_GUIDES.searchSuggestionBan,
      testUrl: `https://x.com/search?q=${result.username}`,
    },
    {
      key: 'ghostBan',
      title: 'ゴーストBAN (Ghost Ban / Reply Ban)',
      subtitle: 'リプライの第三者への完全公開',
      check: result.checks.ghostBan,
      guide: BAN_TYPE_GUIDES.ghostBan,
      testUrl: `https://x.com/${result.username}`,
    },
    {
      key: 'replyDeboosting',
      title: 'リプライ降格 (Reply Deboosting)',
      subtitle: '返信折りたたみ・優先度減退',
      check: result.checks.replyDeboosting,
      guide: BAN_TYPE_GUIDES.replyDeboosting,
      testUrl: `https://x.com/${result.username}`,
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto my-6 px-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>シャドウバン項目別診断結果</span>
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            (全4項目)
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => {
          const isExpanded = expandedCard === item.key;
          const isProblem = item.check.status !== 'ok';

          return (
            <div
              key={item.key}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all duration-200 ${
                isProblem
                  ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
                {renderStatusBadge(item.check.status)}
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                {item.check.description}
              </p>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/80">
                <a
                  href={item.testUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Xで直接テスト</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={() => toggleExpand(item.key)}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5 text-indigo-500" />
                  <span>解説と原因</span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Expanded Guide Drawer */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs space-y-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl animate-fadeIn">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                      【主な症状】
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-300">
                      {item.guide.symptoms.map((sym, idx) => (
                        <li key={idx}>{sym}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                      【引き起こされる原因】
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-300">
                      {item.guide.causes.map((cause, idx) => (
                        <li key={idx}>{cause}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg text-amber-900 dark:text-amber-200">
                    <span className="font-bold block mb-0.5">💡 解除に向けたアドバイス:</span>
                    <p>{item.guide.quickFix}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
