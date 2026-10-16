import React from 'react';
import { ShieldAlert, Moon, Sun, Sparkles, History, HelpCircle, ShieldCheck, PenTool, CheckCircle } from 'lucide-react';

export type AppTab = 'checker' | 'postSafety' | 'securityAudit' | 'faq';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  activeTab,
  setActiveTab,
  onOpenHistory,
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 transition-colors duration-200 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Logo & Title */}
        <div
          onClick={() => setActiveTab('checker')}
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 flex-shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                X Shadowban Checker
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300 rounded-full border border-sky-200 dark:border-sky-800">
                PRO v3.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              シャドウバン判定・ポスト安全診断・アカウントセキュリティ
            </p>
          </div>
        </div>

        {/* Center Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('checker')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'checker'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>シャドウバン判定</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('postSafety')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'postSafety'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <PenTool className="w-3.5 h-3.5 text-indigo-500" />
            <span>AIポスト安全診断</span>
            <span className="px-1 py-0.2 text-[9px] bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded font-bold">
              NEW
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('securityAudit')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'securityAudit'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>セキュリティ対策</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('faq')}
            className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'faq'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>解説・FAQ</span>
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onOpenHistory}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="判定履歴"
          >
            <History className="w-4 h-4 text-indigo-500" />
            <span className="hidden sm:inline">履歴</span>
          </button>

          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title={darkMode ? 'ライトモードに切替' : 'ダークモードに切替'}
            aria-label="Toggle Theme"
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden flex items-center justify-around border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 py-1.5 px-2 text-[11px] overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('checker')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'checker'
              ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>シャドウバン</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('postSafety')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'postSafety'
              ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>ポスト安全</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('securityAudit')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'securityAudit'
              ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>セキュリティ</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('faq')}
          className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap flex items-center gap-1 ${
            activeTab === 'faq'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>解説・FAQ</span>
        </button>
      </div>
    </header>
  );
};

