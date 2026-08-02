import React, { useState } from 'react';
import { CheckResult, AIDiagnosis } from '../types';
import { Sparkles, Bot, AlertTriangle, Clock, ShieldCheck, CheckSquare, Lightbulb, ChevronRight, RefreshCw } from 'lucide-react';

interface AIDiagnosisSectionProps {
  result: CheckResult;
}

export const AIDiagnosisSection: React.FC<AIDiagnosisSectionProps> = ({ result }) => {
  const [diagnosis, setDiagnosis] = useState<AIDiagnosis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userContext, setUserContext] = useState('');
  const [showContextInput, setShowContextInput] = useState(false);

  const fetchDiagnosis = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/ai-diagnosis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: result.username,
          checkResult: result,
          userContext: userContext.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'AI診断の取得に失敗しました。');
      }

      setDiagnosis(data);
    } catch (err: any) {
      console.error('AI diagnosis fetch failed:', err);
      setErrorMsg(err.message || 'AI診断の実行中にエラーが発生しました。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-8 px-4">
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-2xl p-6 shadow-2xl border border-indigo-500/30 overflow-hidden relative">
        {/* Background Decorative Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <span>Gemini AI アカウント詳細診断</span>
                  <span className="px-2 py-0.5 text-[10px] bg-sky-500/20 text-sky-300 rounded border border-sky-400/30 font-mono">
                    AI POWERED
                  </span>
                </h3>
                <p className="text-xs text-indigo-200/80">
                  Xアルゴリズム解析モデルによるオーダーメイドの原因特定＆解除プラン策定
                </p>
              </div>
            </div>

            {!diagnosis && !isLoading && (
              <button
                onClick={fetchDiagnosis}
                className="px-5 py-2.5 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 hover:from-sky-500 hover:to-indigo-700 text-white font-medium text-xs sm:text-sm rounded-xl shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bot className="w-4 h-4" />
                <span>AI診断を実行する</span>
              </button>
            )}
          </div>

          {/* Optional User Context Input toggle */}
          {!diagnosis && !isLoading && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowContextInput(!showContextInput)}
                className="text-xs text-sky-300 hover:text-sky-200 underline flex items-center gap-1 cursor-pointer"
              >
                <span>＋ 補足情報（直近の投稿頻度やツール利用歴など）を入力して精度を上げる</span>
              </button>

              {showContextInput && (
                <div className="mt-2">
                  <textarea
                    value={userContext}
                    onChange={(e) => setUserContext(e.target.value)}
                    placeholder="例: 昨日同じハッシュタグで10件連続投稿しました、外部の自動投稿ツールを利用しています...等"
                    rows={2}
                    className="w-full p-2.5 bg-slate-900/90 text-xs text-slate-200 placeholder-slate-500 rounded-lg border border-indigo-500/30 focus:outline-none focus:ring-1 focus:ring-sky-400"
                  />
                </div>
              )}
            </div>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="my-8 text-center py-6 space-y-4">
              <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 animate-spin">
                <RefreshCw className="w-8 h-8 text-sky-400" />
              </div>
              <p className="text-sm font-semibold text-indigo-100">
                Gemini AI が @{result.username} のアカウントリスクを解析中...
              </p>
              <p className="text-xs text-indigo-300/70 max-w-md mx-auto">
                X健全性ガイドライン、スパムフィルターしきい値、過去のシャドウバン解除データベースと照合しています。
              </p>
            </div>
          )}

          {/* Error display */}
          {errorMsg && (
            <div className="my-4 p-4 bg-rose-950/60 border border-rose-500/50 rounded-xl text-rose-200 text-xs flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <div>
                <p className="font-semibold">AI診断エラー</p>
                <p>{errorMsg}</p>
              </div>
            </div>
          )}

          {/* AI Diagnosis Result View */}
          {diagnosis && (
            <div className="mt-6 space-y-6 text-slate-100 animate-fadeIn">
              {/* Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/80 rounded-xl border border-indigo-500/30">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">判定リスクレベル:</span>
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full font-bold text-xs">
                    {diagnosis.riskLevel}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-sky-300">
                  <Clock className="w-4 h-4 text-sky-400" />
                  <span>推定回復期間: <strong className="text-white">{diagnosis.estimatedRecoveryTime}</strong></span>
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 bg-indigo-950/40 rounded-xl border border-indigo-500/20 text-xs sm:text-sm leading-relaxed text-indigo-100">
                <h4 className="font-bold text-sky-300 mb-1 flex items-center gap-1.5">
                  <Bot className="w-4 h-4" />
                  <span>AI 総合診断アナリシス</span>
                </h4>
                <p>{diagnosis.summary}</p>
              </div>

              {/* Grid: Possible Causes & Action Plan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Causes */}
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                  <h5 className="font-bold text-xs text-amber-300 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>推測される原因リスト</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {diagnosis.possibleCauses.map((cause, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-amber-400 font-mono font-bold">•</span>
                        <span>{cause}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Plan */}
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                  <h5 className="font-bold text-xs text-emerald-300 flex items-center gap-1.5 mb-2">
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                    <span>ステップバイステップ回復プラン</span>
                  </h5>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {diagnosis.recoveryPlan.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 bg-slate-950/40 p-2 rounded border border-slate-800">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Prevention Tips */}
              <div className="p-4 bg-sky-950/30 rounded-xl border border-sky-500/20 space-y-2">
                <h5 className="font-bold text-xs text-sky-300 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-sky-400" />
                  <span>再発を防ぐための日常投稿テクニック</span>
                </h5>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                  {diagnosis.preventionTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ChevronRight className="w-3.5 h-3.5 text-sky-400 flex-shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Re-run button */}
              <div className="text-right pt-2">
                <button
                  onClick={fetchDiagnosis}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>AI診断を再実行</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
