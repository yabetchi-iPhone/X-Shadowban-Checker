import React from 'react';
import { ShieldAlert, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 py-8 transition-colors">
      <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-sm">
          <ShieldAlert className="w-4 h-4 text-sky-500" />
          <span>X Shadowban Checker</span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          当サービスはX（旧Twitter）およびX Corp.の公式サービスではありません。判定結果は公開データを元に算出しており、Xのアルゴリズム更新により動的に変動する場合があります。
        </p>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1 font-mono">
          <span>© {new Date().getFullYear()} X Shadowban Checker. Built with precision and care.</span>
        </p>
      </div>
    </footer>
  );
};
