import React, { useState } from 'react';
import { PostSafetyCheckResult } from '../types';
import {
  Sparkles,
  Send,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Lightbulb,
  Shield,
  Hash,
  Link as LinkIcon,
  MessageSquare,
  ThumbsUp,
} from 'lucide-react';

export const PostSafetyChecker: React.FC = () => {
  const [postText, setPostText] = useState('');
  const [postType, setPostType] = useState<'tweet' | 'reply' | 'quote'>('tweet');
  const [hasExternalLink, setHasExternalLink] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PostSafetyCheckResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Quick preset test samples
  const samples = [
    {
      label: '危険例 (スパム判定)',
      type: 'tweet' as const,
      hasLink: true,
      text: '【完全自動で月収50万円】寝てる間に稼げる秘密の副業を限定公開！今すぐLINE追加して特典受取👉 https://bit.ly/spamexample #副業 #在宅ワーク #不労所得 #稼げる #お金配り',
    },
    {
      label: '注意例 (リンク減衰)',
      type: 'tweet' as const,
      hasLink: true,
      text: '最新のWebフロントエンド設計とパフォーマンス改善についての記事をブログに執筆しました！是非ご一読ください👇\nhttps://tech-blog.example.com/modern-frontend-guide #エンジニア #Web開発 #TypeScript',
    },
    {
      label: '安全＆好待遇例',
      type: 'tweet' as const,
      hasLink: false,
      text: 'エンジニア1年目の自分に伝えたい「コードを書く前の3つの習慣」\n\n1. 要件を箇条書きで声に出して整理する\n2. 最初から綺麗に書かず、動く最小単位を作る\n3. エラー文を翻訳して落ち着いて読む\n\n皆さんが一番役立った初期の気づきは何ですか？',
    },
  ];

  const handleRunCheck = async (textToTest?: string) => {
    const text = (textToTest !== undefined ? textToTest : postText).trim();
    if (!text) {
      setErrorMsg('投稿文を入力してください。');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/post-safety-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postText: text,
          postType,
          hasExternalLink: hasExternalLink || /https?:\/\/[^\s]+/i.test(text),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'ポスト安全性診断に失敗しました。');
      }

      setResult(data);
    } catch (err: any) {
      console.error('Post safety check error:', err);
      setErrorMsg(err.message || '診断中にエラーが発生しました。ネットワーク環境をご確認ください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyOptimized = () => {
    if (!result?.optimizedPost) return;
    navigator.clipboard.writeText(result.optimizedPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareToX = () => {
    if (!result?.optimizedPost) return;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(result.optimizedPost)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getRiskColor = (score: number) => {
    if (score >= 50) return { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800' };
    if (score >= 25) return { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' };
    return { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800' };
  };

  const getSeverityBadge = (level: 'low' | 'medium' | 'high') => {
    switch (level) {
      case 'high':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 rounded-full">高リスク</span>;
      case 'medium':
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 rounded-full">要注意</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-full">安全</span>;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur text-white text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>X 最新アルゴリズム & Grokスパムフィルター対応</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            AI ポスト安全性チェッカー
          </h2>
          <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
            投稿する前のポスト文をGemini AIが事前診断。シャドウバン・凍結・インプレッション減衰の原因になる「外部リンク」「ハッシュタグ過多」「煽り文言」を未然に防ぎ、最適化リライト案を提示します。
          </p>
        </div>
      </div>

      {/* Input Box Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Sample presets */}
        <div>
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
            ワンクリックで試せるサンプル文:
          </label>
          <div className="flex flex-wrap gap-2">
            {samples.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPostText(s.text);
                  setPostType(s.type);
                  setHasExternalLink(s.hasLink);
                  handleRunCheck(s.text);
                }}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 transition cursor-pointer"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>投稿予定のテキスト (またはリプライ)</span>
            </label>
            <span className={`text-xs font-mono ${postText.length > 500 ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
              {postText.length} / 500文字
            </span>
          </div>
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value.slice(0, 600))}
            placeholder="ここに投稿予定のツイート文やリプライを入力してください..."
            rows={5}
            className="w-full p-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 transition"
          />
        </div>

        {/* Options Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {/* Post Type Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">投稿形態:</span>
            <div className="inline-flex rounded-lg p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setPostType('tweet')}
                className={`px-3 py-1 rounded-md transition ${postType === 'tweet' ? 'bg-white dark:bg-slate-900 font-bold text-sky-600 dark:text-sky-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                通常ポスト
              </button>
              <button
                type="button"
                onClick={() => setPostType('reply')}
                className={`px-3 py-1 rounded-md transition ${postType === 'reply' ? 'bg-white dark:bg-slate-900 font-bold text-sky-600 dark:text-sky-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                リプライ (返信)
              </button>
              <button
                type="button"
                onClick={() => setPostType('quote')}
                className={`px-3 py-1 rounded-md transition ${postType === 'quote' ? 'bg-white dark:bg-slate-900 font-bold text-sky-600 dark:text-sky-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'}`}
              >
                引用ポスト
              </button>
            </div>
          </div>

          {/* External Link Toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={hasExternalLink}
              onChange={(e) => setHasExternalLink(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
            />
            <span>外部URLリンクを含む予定</span>
          </label>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => handleRunCheck()}
            disabled={isLoading || !postText.trim()}
            className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-md shadow-sky-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>AIアルゴリズム診断中...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>ポストの安全性をAI診断する</span>
              </>
            )}
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Diagnosis Results Section */}
      {result && (
        <div className="space-y-6 animate-fadeIn">
          {/* Overall Risk Score Card */}
          <div className={`p-6 rounded-2xl border ${getRiskColor(result.riskScore).bg} ${getRiskColor(result.riskScore).border}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  総合シャドウバン・凍結危険度
                </span>
                <div className="flex items-center gap-3 mt-1">
                  <h3 className={`text-3xl font-black ${getRiskColor(result.riskScore).text}`}>
                    危険度 {result.riskScore}%
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${result.riskLevel === 'SAFE' ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300' : result.riskLevel === 'CAUTION' ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300' : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'}`}>
                    {result.riskLevel === 'SAFE' ? 'SAFE (安全)' : result.riskLevel === 'CAUTION' ? 'CAUTION (注意が必要)' : 'DANGER (高リスク)'}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-300 max-w-sm sm:text-right">
                {result.riskLevel === 'SAFE' && 'アルゴリズムペナルティの兆候はありません。安心して投稿できます。'}
                {result.riskLevel === 'CAUTION' && 'インプレッション減衰や一部フィルターに引っかかる可能性があります。改善案をご活用ください。'}
                {result.riskLevel === 'DANGER' && 'スパム判定またはシャドウバンの原因となる要素が複数含まれています。そのままの投稿はお控えください。'}
              </div>
            </div>

            {/* Category Analysis Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              <div className="bg-white/90 dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <LinkIcon className="w-3.5 h-3.5 text-blue-500" />
                    外部リンク影響
                  </span>
                  {getSeverityBadge(result.urlRisk.level)}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  {result.urlRisk.note}
                </p>
              </div>

              <div className="bg-white/90 dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-500" />
                    スパム・ボット誤認
                  </span>
                  {getSeverityBadge(result.spamRisk.level)}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  {result.spamRisk.note}
                </p>
              </div>

              <div className="bg-white/90 dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-500" />
                    表現・煽り度
                  </span>
                  {getSeverityBadge(result.sentimentRisk.level)}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  {result.sentimentRisk.note}
                </p>
              </div>

              <div className="bg-white/90 dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-emerald-500" />
                    ハッシュタグ適正
                  </span>
                  {getSeverityBadge(result.hashtagRisk.level)}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  {result.hashtagRisk.note}
                </p>
              </div>
            </div>
          </div>

          {/* Warnings & Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.warnings.length > 0 && (
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-rose-200 dark:border-rose-900/60 shadow-xs space-y-2">
                <h4 className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  検出された注意・警告項目
                </h4>
                <ul className="space-y-1.5 pl-1">
                  {result.warnings.map((w, i) => (
                    <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                      <span className="text-rose-500 font-bold">•</span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 ${result.warnings.length === 0 ? 'md:col-span-2' : ''}`}>
              <h4 className="text-xs font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" />
                アルゴリズム評価向上のアドバイス
              </h4>
              <ul className="space-y-1.5 pl-1">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                    <span className="text-sky-500 font-bold">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Optimized Rewrite Post */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white p-6 rounded-2xl border border-indigo-500/30 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <h4 className="font-bold text-sm text-white">AI最適化リライト投稿案</h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  安全＆好インプレッション仕様
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyOptimized}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition flex items-center gap-1.5 cursor-pointer"
                  title="投稿文をコピー"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'コピー完了' : '本文をコピー'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleShareToX}
                  className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-xs font-bold text-white transition flex items-center gap-1.5 cursor-pointer"
                  title="Xでポスト画面を開く"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Xで投稿</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/20 text-sm font-sans text-slate-100 whitespace-pre-wrap leading-relaxed">
              {result.optimizedPost}
            </div>

            {result.advice && (
              <p className="text-xs text-indigo-200/80 pt-1 leading-relaxed border-t border-indigo-500/20">
                <span className="font-bold text-indigo-300">専門家アドバイス: </span>
                {result.advice}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
