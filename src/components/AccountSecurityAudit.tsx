import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Smartphone,
  AppWindow,
  Mail,
  UserCheck,
  RefreshCw,
} from 'lucide-react';

interface AuditItem {
  id: string;
  category: 'auth' | 'apps' | 'privacy' | 'dm';
  categoryLabel: string;
  title: string;
  summary: string;
  details: string;
  importance: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  actionUrl: string;
  actionLabel: string;
}

const AUDIT_ITEMS: AuditItem[] = [
  {
    id: 'passkey_2fa',
    category: 'auth',
    categoryLabel: '認証・ログイン',
    title: '認証アプリまたはパスキーによる2要素認証 (2FA)',
    summary: 'SMS認証ではなく、Google AuthenticatorやPasskey等の強固な2FAを設定している',
    details:
      'SIMスワップ詐欺やSMS傍受による乗っ取りが多発しています。セキュリティキー、パスキー、または認証アプリ（Google Authenticator/1Password等）による2要素認証を有効化することで、パスワード流出時の乗っ取りを99.9%防げます。',
    importance: 'CRITICAL',
    actionUrl: 'https://x.com/settings/account/login_verification',
    actionLabel: 'Xの2要素認証設定を開く',
  },
  {
    id: 'connected_apps',
    category: 'apps',
    categoryLabel: '連携アプリ',
    title: '古いサードパーティ連携アプリの定期点検と解除',
    summary: '過去に許可した不要な連携アプリ（診断系・自動投稿ツール等）のアクセス権限を削除している',
    details:
      '過去に利用した「相性診断」や「相互フォロー自動チェッカー」等の連携アプリがハッキングされ、勝手にスパムリプライやDMを送信してシャドウバン・凍結される事例が後を絶ちません。不要なアプリは「アクセス権を取り消す」を実行してください。',
    importance: 'CRITICAL',
    actionUrl: 'https://x.com/settings/connected_apps',
    actionLabel: 'Xの連携アプリ管理を開く',
  },
  {
    id: 'dm_filtering',
    category: 'dm',
    categoryLabel: 'DMセキュリティ',
    title: 'DM（ダイレクトメッセージ）スパムフィルターの有効化',
    summary: '「不審なメッセージを低品質フィルターで非表示」をONにし、悪質リンクの踏み抜きを防止',
    details:
      '「あなたのアカウントが規約違反で報告されました」「ビットコイン当選」などの偽装フィッシングDMが急増しています。低品質メッセージフィルターを有効にし、フォロー外からの不審なDMリクエストを自動隔離しましょう。',
    importance: 'HIGH',
    actionUrl: 'https://x.com/settings/direct_messages',
    actionLabel: 'XのDMプライバシー設定を開く',
  },
  {
    id: 'password_reset_protect',
    category: 'auth',
    categoryLabel: '認証・ログイン',
    title: 'パスワードリセットの追加保護',
    summary: 'パスワード再設定時にメールアドレスまたは電話番号の確認を要求する設定がONになっている',
    details:
      '「パスワードをリセットする際に追加の情報を要求する」を有効にすると、ユーザー名だけで簡単にリセットメールを要求される嫌がらせやブルートフォース攻撃を未然に阻止できます。',
    importance: 'HIGH',
    actionUrl: 'https://x.com/settings/account',
    actionLabel: 'Xのアカウント情報設定を開く',
  },
  {
    id: 'discoverability_privacy',
    category: 'privacy',
    categoryLabel: 'プライバシー保護',
    title: 'メール・電話番号による照合・身元特定防止',
    summary: '「メールアドレスや電話番号で自分を検索できる」設定をOFFにして個人特定や標的型攻撃を防ぐ',
    details:
      '電話番号やメアドでの検索を許可していると、外部の漏洩リストと照合されてアカウント所有者の身元が特定され、標的型フィッシング攻撃の対象となるリスクがあります。',
    importance: 'MEDIUM',
    actionUrl: 'https://x.com/settings/contacts',
    actionLabel: '照合と連絡先の設定を開く',
  },
  {
    id: 'impersonation_defense',
    category: 'privacy',
    categoryLabel: 'なりすまし防御',
    title: '類似偽アカウント・なりすまし予防',
    summary: 'プロフィールのアイコン・ヘッダーや固定ポストに本物である旨や公式サイトリンクを明記',
    details:
      'フォロワーが多いアカウントほど、1文字違いのID（例: lとIの入れ替え）の偽アカウントが作られ、フォロワーに詐欺DMを送られる被害が多発しています。公式サイトやプロフィールのリンク設定で信頼性を担保しましょう。',
    importance: 'MEDIUM',
    actionUrl: 'https://x.com/settings/profile',
    actionLabel: 'Xのプロフィール編集を開く',
  },
];

export const AccountSecurityAudit: React.FC = () => {
  const [checkedIds, setCheckedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('x_security_audit_checked');
      return saved ? JSON.parse(saved) : ['dm_filtering', 'password_reset_protect'];
    } catch {
      return ['dm_filtering', 'password_reset_protect'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('x_security_audit_checked', JSON.stringify(checkedIds));
    } catch (e) {
      console.error('Failed to save security audit state:', e);
    }
  }, [checkedIds]);

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setCheckedIds(AUDIT_ITEMS.map((item) => item.id));
  };

  const handleReset = () => {
    setCheckedIds([]);
  };

  const totalPoints = AUDIT_ITEMS.reduce((sum, item) => {
    const pts = item.importance === 'CRITICAL' ? 30 : item.importance === 'HIGH' ? 20 : 10;
    return sum + pts;
  }, 0);

  const earnedPoints = AUDIT_ITEMS.reduce((sum, item) => {
    if (!checkedIds.includes(item.id)) return sum;
    const pts = item.importance === 'CRITICAL' ? 30 : item.importance === 'HIGH' ? 20 : 10;
    return sum + pts;
  }, 0);

  const securityScore = Math.round((earnedPoints / totalPoints) * 100);

  const getScoreBadge = () => {
    if (securityScore >= 90) {
      return {
        label: '鉄壁 (Extremely Secure)',
        bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        desc: 'セキュリティ対策が極めて充実しています。乗っ取りやスパム誤認のリスクは最小限に抑えられています。',
      };
    }
    if (securityScore >= 60) {
      return {
        label: '概ね良好 (Moderate)',
        bg: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-300',
        textColor: 'text-sky-600 dark:text-sky-400',
        desc: '基本対策はできていますが、未設定の重要項目（2FAや連携アプリ管理など）を確認することをおすすめします。',
      };
    }
    return {
      label: '要対策 (High Vulnerability)',
      bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300',
      textColor: 'text-rose-600 dark:text-rose-400',
      desc: '重要なセキュリティ防壁が不足しています。不審な連携アプリや乗っ取り攻撃に対して脆弱な状態です。',
    };
  };

  const scoreBadge = getScoreBadge();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            <span>X (Twitter) 乗っ取り・スパム被害完全防御ガイド</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            アカウント セキュリティ診断
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            シャドウバンや凍結の引き金となる「悪質な連携アプリの勝手なポスト」「フィッシングDM詐欺」「乗っ取り」を完全防御。あなたのアカウントの安全度スコアを可視化し、すぐできる対策をワンクリックで実行できます。
          </p>
        </div>
      </div>

      {/* Score Summary Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              あなたのアカウント安全達成度
            </span>
            <div className="flex items-center gap-3 mt-1">
              <h3 className={`text-4xl font-black ${scoreBadge.textColor}`}>
                {securityScore}%
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${scoreBadge.bg}`}>
                {scoreBadge.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
            >
              すべてチェック
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer"
            >
              リセット
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 space-y-1.5">
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                securityScore >= 90
                  ? 'bg-emerald-500'
                  : securityScore >= 60
                  ? 'bg-sky-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${securityScore}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {scoreBadge.desc}
          </p>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Lock className="w-4 h-4 text-sky-500" />
          <span>セキュリティ必須チェック項目 ({checkedIds.length}/{AUDIT_ITEMS.length})</span>
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {AUDIT_ITEMS.map((item) => {
            const isChecked = checkedIds.includes(item.id);
            return (
              <div
                key={item.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isChecked
                    ? 'bg-slate-50/80 dark:bg-slate-900/60 border-emerald-500/40 dark:border-emerald-500/30'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5 flex-1">
                    <button
                      type="button"
                      onClick={() => toggleCheck(item.id)}
                      className="mt-0.5 cursor-pointer text-slate-300 hover:text-slate-400 dark:text-slate-700 dark:hover:text-slate-600 transition"
                      aria-label="Toggle check"
                    >
                      {isChecked ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 fill-emerald-50 dark:fill-emerald-950" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 hover:border-sky-500" />
                      )}
                    </button>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {item.categoryLabel}
                        </span>
                        {item.importance === 'CRITICAL' && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                            最重要
                          </span>
                        )}
                        {item.importance === 'HIGH' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                            推奨
                          </span>
                        )}
                        <h4
                          className={`text-sm font-bold transition ${
                            isChecked
                              ? 'text-slate-800 dark:text-slate-200 line-through opacity-80'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {item.title}
                        </h4>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.details}
                      </p>
                    </div>
                  </div>

                  <a
                    href={item.actionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-700 dark:text-sky-300 text-xs font-semibold border border-sky-200 dark:border-sky-800 flex-shrink-0 transition"
                  >
                    <span>設定</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Tip Footer */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">注意: Xサポートを装う偽DM・偽メールに注意</span>
          <p className="text-amber-800 dark:text-amber-300/90 leading-relaxed">
            「24時間以内にリンクからログインしないとアカウントが停止されます」というDMやメールは100%詐欺です。X公式がパスワードや認証コードをDMで聞き出すことは絶対にありません。
          </p>
        </div>
      </div>
    </div>
  );
};
