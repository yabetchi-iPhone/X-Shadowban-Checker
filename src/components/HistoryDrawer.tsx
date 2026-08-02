import React from 'react';
import { HistoryItem } from '../types';
import { X, Trash2, Clock, ShieldCheck, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (username: string) => void;
  onClear: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelect,
  onClear,
}) => {
  if (!isOpen) return null;

  const getStatusPill = (status: HistoryItem['overallStatus']) => {
    switch (status) {
      case 'ALL_CLEAR':
        return (
          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-full">
            ALL CLEAR
          </span>
        );
      case 'WARNING':
        return (
          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold rounded-full">
            WARNING
          </span>
        );
      case 'BAN_DETECTED':
        return (
          <span className="px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-[10px] font-bold rounded-full">
            BAN DETECTED
          </span>
        );
      case 'SUSPENDED':
      default:
        return (
          <span className="px-2 py-0.5 bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 text-[10px] font-bold rounded-full">
            SUSPENDED
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              診断履歴 (History)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
              まだ過去の診断履歴はありません。
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item.username);
                  onClose();
                }}
                className="p-3.5 bg-slate-50 dark:bg-slate-800/60 hover:bg-sky-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl transition-all cursor-pointer group flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-slate-900 dark:text-white font-mono">
                      @{item.username}
                    </span>
                    {getStatusPill(item.overallStatus)}
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>スコア: {item.overallHealthScore}/100</span>
                    <span>•</span>
                    <span>{new Date(item.checkedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="p-2 text-slate-400 group-hover:text-sky-500 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {history.length > 0 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <button
              onClick={onClear}
              className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <Trash2 className="w-4 h-4" />
              <span>履歴を全て削除</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded-lg font-medium"
            >
              閉じる
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
