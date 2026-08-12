import React, { useState } from 'react';
import { Search, AtSign, X, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { HistoryItem } from '../types';

interface SearchBarProps {
  onSearch: (username: string) => void;
  isLoading: boolean;
  loadingStep: string;
  history: HistoryItem[];
  onSelectHistory: (username: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  isLoading,
  loadingStep,
  history,
  onSelectHistory,
}) => {
  const [inputVal, setInputVal] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isLoading) return;
    const cleaned = inputVal.replace(/^@/, '').trim();
    onSearch(cleaned);
  };

  const handleClear = () => {
    setInputVal('');
  };

  const sampleHandles = ['yabetchi_iPhone', 'X', 'openai', 'gemini_app'];
  const testHandles = ['test_ban', 'test_deboost', 'test_ghost'];

  return (
    <div className="w-full max-w-3xl mx-auto my-8 px-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 transition-colors">
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
            X ユーザー名（@ID）を入力
          </label>

          <div className="relative flex items-center">
            <div className="absolute left-4 text-slate-400 dark:text-slate-500 pointer-events-none flex items-center gap-1">
              <AtSign className="w-5 h-5 text-sky-500" />
            </div>

            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="ユーザー名を入力（例: X, elonmusk, my_handle）"
              disabled={isLoading}
              className="w-full pl-11 pr-28 py-3.5 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 rounded-xl border border-slate-200 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent font-mono text-sm sm:text-base transition-all disabled:opacity-60"
            />

            {inputVal && !isLoading && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-28 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={!inputVal.trim() || isLoading}
              className="absolute right-2 px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-medium text-sm rounded-lg shadow-md shadow-sky-500/25 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>診断中</span>
                </>
              ) : (
                <>
                  <span>チェック</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Loading status bar */}
          {isLoading && (
            <div className="mt-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-xl p-3 flex items-center gap-3 animate-pulse">
              <div className="w-5 h-5 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-sky-800 dark:text-sky-200">
                  {loadingStep || 'Xサーバーシンドリケーション検証中...'}
                </p>
                <p className="text-[11px] text-sky-600 dark:text-sky-400 mt-0.5">
                  検索BAN、検索補完BAN、ゴーストBAN、リプライ降格をリアルタイムでスキャンしています
                </p>
              </div>
            </div>
          )}

          {/* Quick handle samples & History */}
          <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="font-medium text-slate-600 dark:text-slate-300">サンプル:</span>
                {sampleHandles.map((handle) => (
                  <button
                    key={handle}
                    type="button"
                    onClick={() => {
                      setInputVal(handle);
                      onSearch(handle);
                    }}
                    disabled={isLoading}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 rounded-md transition-colors font-mono cursor-pointer disabled:opacity-50"
                  >
                    @{handle}
                  </button>
                ))}
              </div>

              {history.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  <span className="font-medium text-slate-400 dark:text-slate-500">最近のチェック:</span>
                  {history.slice(0, 3).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectHistory(item.username)}
                      disabled={isLoading}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-sky-100 hover:text-sky-700 dark:hover:bg-sky-950 text-slate-700 dark:text-slate-300 rounded text-xs font-mono transition-colors"
                    >
                      @{item.username}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
              <span className="font-medium text-slate-500 dark:text-slate-400">BAN状態テスト用:</span>
              {testHandles.map((handle) => (
                <button
                  key={handle}
                  type="button"
                  onClick={() => {
                    setInputVal(handle);
                    onSearch(handle);
                  }}
                  disabled={isLoading}
                  className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-900/50 rounded font-mono cursor-pointer"
                >
                  @{handle}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
