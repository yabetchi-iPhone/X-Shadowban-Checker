import React, { useState, useEffect } from 'react';
import { Header, AppTab } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { ProfileCard } from './components/ProfileCard';
import { BanStatusCards } from './components/BanStatusCards';
import { AIDiagnosisSection } from './components/AIDiagnosisSection';
import { KnowledgeSection } from './components/KnowledgeSection';
import { PostSafetyChecker } from './components/PostSafetyChecker';
import { AccountSecurityAudit } from './components/AccountSecurityAudit';
import { HistoryDrawer } from './components/HistoryDrawer';
import { Footer } from './components/Footer';
import { CheckResult, HistoryItem } from './types';
import { ShieldCheck, AlertTriangle, PenTool, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('checker');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('theme') === 'dark' ||
        window.matchMedia('(prefers-color-scheme: dark)').matches
      );
    }
    return false;
  });

  const [currentResult, setCurrentResult] = useState<CheckResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('x_shadowban_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Apply dark mode class to html document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Save history changes
  useEffect(() => {
    try {
      localStorage.setItem('x_shadowban_history', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  }, [history]);

  const handleSearch = async (username: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setCurrentResult(null);

    // Multi-step loading messages for visual feedback
    const steps = [
      '1/4 検索BAN (Search Ban) の判定を実行中...',
      '2/4 検索補完BAN (Search Suggestion Ban) を検証中...',
      '3/4 ゴーストBAN (Ghost Ban / Reply Ban) をスキャン中...',
      '4/4 リプライ降格 (Reply Deboosting) 状態を集計中...',
    ];

    let stepIndex = 0;
    setLoadingStep(steps[0]);
    const stepInterval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setLoadingStep(steps[stepIndex]);
      }
    }, 450);

    try {
      const response = await fetch('/api/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      clearInterval(stepInterval);

      if (!response.ok) {
        throw new Error(data.error || 'シャドウバンの確認に失敗しました。');
      }

      setCurrentResult(data);

      // Add to history
      const newHistoryItem: HistoryItem = {
        id: Date.now().toString(),
        username: data.username,
        displayName: data.displayName,
        overallStatus: data.overallStatus,
        overallHealthScore: data.overallHealthScore,
        checkedAt: data.checkedAt,
      };

      setHistory((prev) => {
        const filtered = prev.filter((item) => item.username !== data.username);
        return [newHistoryItem, ...filtered].slice(0, 20);
      });
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error('Search error:', err);
      setErrorMsg(err.message || '接続エラーが発生しました。ネットワークまたはアカウント名を確認してください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('x_shadowban_history');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Navigation Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {/* TAB 1: Shadowban Checker */}
        {activeTab === 'checker' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Hero Title Section */}
            <div className="pt-8 pb-3 text-center px-4 max-w-3xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300 text-xs font-semibold border border-sky-200 dark:border-sky-800/80">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
                <span>X (旧Twitter) シャドウバン判定 リアルタイムチェッカー</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                あなたのXアカウントは大丈夫？
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                ユーザー名を入力するだけで、検索BAN・検索補完BAN・ゴーストBAN・リプライ降格の4項目を瞬時に診断します。
              </p>
            </div>

            {/* Search Bar Input */}
            <SearchBar
              onSearch={handleSearch}
              isLoading={isLoading}
              loadingStep={loadingStep}
              history={history}
              onSelectHistory={(u) => handleSearch(u)}
            />

            {/* Error Notification */}
            {errorMsg && (
              <div className="max-w-3xl mx-auto my-4 px-4">
                <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-800 dark:text-rose-200 text-sm flex items-center gap-3 shadow-sm">
                  <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              </div>
            )}

            {/* Diagnostic Results */}
            {currentResult && (
              <div className="space-y-6 animate-fadeIn">
                {/* Account Profile & Health Score */}
                <ProfileCard result={currentResult} />

                {/* 4 Core Shadowban Status Checks */}
                <BanStatusCards result={currentResult} />

                {/* Gemini AI Detailed Diagnosis & Recovery Plan */}
                <AIDiagnosisSection result={currentResult} />
              </div>
            )}

            {/* Feature Promo Banners */}
            <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              <div
                onClick={() => setActiveTab('postSafety')}
                className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-sky-50 dark:from-slate-900 dark:to-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 shadow-xs hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-xs">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    新機能
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  <span>AIポスト安全性チェッカー</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  投稿前にポスト本文をAIが事前検査。外部リンクによるインプレッション抑制やスパム誤判定を未然に防止します。
                </p>
              </div>

              <div
                onClick={() => setActiveTab('securityAudit')}
                className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-amber-950/40 border border-amber-200 dark:border-amber-900/60 shadow-xs hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    セキュリティ
                  </span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                  <span>アカウント セキュリティ診断</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  急増するアカウント乗っ取り・悪質連携アプリ・フィッシング詐欺から身を守るための安全対策チェックリスト。
                </p>
              </div>
            </div>

            {/* Educational Knowledge & FAQ */}
            <KnowledgeSection />
          </div>
        )}

        {/* TAB 2: AI Post Safety Checker */}
        {activeTab === 'postSafety' && (
          <div className="animate-fadeIn">
            <PostSafetyChecker />
          </div>
        )}

        {/* TAB 3: Account Security Audit */}
        {activeTab === 'securityAudit' && (
          <div className="animate-fadeIn">
            <AccountSecurityAudit />
          </div>
        )}

        {/* TAB 4: Knowledge & FAQ */}
        {activeTab === 'faq' && (
          <div className="animate-fadeIn pt-4">
            <KnowledgeSection />
          </div>
        )}
      </main>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={(u) => {
          setActiveTab('checker');
          handleSearch(u);
        }}
        onClear={handleClearHistory}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}

