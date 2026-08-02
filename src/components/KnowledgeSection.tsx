import React, { useState } from 'react';
import { FAQ_LIST, BAN_TYPE_GUIDES } from '../data/shadowbanKnowledge';
import { HelpCircle, BookOpen, ChevronDown, ChevronUp, Search, ShieldAlert, Sparkles } from 'lucide-react';

interface KnowledgeSectionProps {
  isOpenModal?: boolean;
  onCloseModal?: () => void;
}

export const KnowledgeSection: React.FC<KnowledgeSectionProps> = () => {
  const [activeTab, setActiveTab] = useState<'guides' | 'faq'>('guides');
  const [openFaqId, setOpenFaqId] = useState<string | null>('1');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = FAQ_LIST.filter((item) =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="knowledge-section" className="w-full max-w-3xl mx-auto my-10 px-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-300 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                X シャドウバン ナレッジ＆FAQ
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                シャドウバンの仕組み、予防策、解除方法の完全ガイド
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setActiveTab('guides')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'guides'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              シャドウバン4種解説
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                activeTab === 'faq'
                  ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              よくある質問 (FAQ)
            </button>
          </div>
        </div>

        {/* GUIDES TAB */}
        {activeTab === 'guides' && (
          <div className="mt-6 space-y-6">
            {Object.entries(BAN_TYPE_GUIDES).map(([key, guide]) => (
              <div
                key={key}
                className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-sky-500" />
                    <span>{guide.japaneseTitle}</span>
                  </h4>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    制限レベル: {guide.severity}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {guide.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
                  <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="font-semibold text-rose-600 dark:text-rose-400 block mb-1">
                      ⚠️ 主な発生症状:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                      {guide.symptoms.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="font-semibold text-amber-600 dark:text-amber-400 block mb-1">
                      ⚡ 解除・回避アクション:
                    </span>
                    <p className="text-slate-600 dark:text-slate-300">{guide.quickFix}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FAQ TAB */}
        {activeTab === 'faq' && (
          <div className="mt-6 space-y-4">
            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="質問をキーワードで検索..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 text-xs rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="w-full text-left p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-sky-500 flex-shrink-0" />
                        <span>{faq.question}</span>
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-line animate-fadeIn">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
