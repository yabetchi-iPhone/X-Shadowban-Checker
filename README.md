# X-Shadowban-Checker

X（旧Twitter）アカウントのシャドウバン状態をチェックするツールです。

検索BAN・検索補完BAN・ゴーストBAN・リプライ降格の4項目を確認し、健全度スコアとAIによる診断・回復アドバイスを提供します。

> **注意**  
> このツールは非公式です。X公式のものではありません。結果は参考値としてご利用ください。  
> Xのアルゴリズムや制限は常に変化するため、完全な精度を保証するものではありません。

## 主な機能

- **4種類のシャドウバンチェック**
  - 検索BAN（Search Ban）
  - 検索補完BAN（Search Suggestion Ban）
  - ゴーストBAN（Ghost / Thread Ban）
  - リプライ降格（Reply Deboosting）
- 健全度スコア（0〜100）
- Gemini AIによる詳細診断・原因分析・回復プラン・予防アドバイス
- チェック履歴の保存（ローカルストレージ）
- ダークモード対応
- シャドウバンに関する知識・FAQセクション

## 技術スタック

- Frontend: React 19 + TypeScript + Vite + Tailwind CSS
- Backend: Express
- AI: Google Gemini (`@google/genai`)
- その他: Lucide Icons, Motion
