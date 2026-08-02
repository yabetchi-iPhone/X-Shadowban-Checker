import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { ProfileCard } from './components/ProfileCard';
import { BanStatusCards } from './components/BanStatusCards';
import { AIDiagnosisSection } from './components/AIDiagnosisSection';
import { KnowledgeSection } from './components/KnowledgeSection';
import { HistoryDrawer } from './components/HistoryDrawer';
import { Footer } from './components/Footer';
import { CheckResult, HistoryItem } from './types';
import { ShieldCheck, AlertTriangle, ArrowUp } from 'lucide-react';

export default function App() {
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

  const scrollToKnowledge = () => {
    const el = document.getElementById('knowledge-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col selection:bg-sky-500 selection:text-white">
      {/* Navigation Header */}
      <Header
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenHelp={scrollToKnowledge}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {/* Hero Title Section */}
        <div className="pt-8 pb-4 text-center px-4 max-w-3xl mx-auto space-y-2">
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

        {/* Educational Knowledge & FAQ */}
        <KnowledgeSection />
      </main>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelect={(u) => handleSearch(u)}
        onClear={handleClearHistory}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
