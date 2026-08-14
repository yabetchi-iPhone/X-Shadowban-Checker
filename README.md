# X (旧Twitter) シャドウバンチェッカー (X Shadowban Checker)

![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?logo=tailwind-css&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Gemini%20AI-2.5%20%2F%20Flash-8E75B2?logo=google&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deployable-black?logo=vercel&logoColor=white)

X（旧Twitter）のアカウントがシャドウバン（制限）されているかどうかをリアルタイムで詳細に判定・可視化し、Gemini AI によるオーダーメイドの状況分析と解除アドバイスを提供するWebアプリケーションです。

---

## 🌟 主な機能

### 1. 4種類のシャドウバン項目を個別判定
- **検索BAN (Search Ban)**: 話題・最新タブの検索結果にポストが表示されるかを検証
- **検索補完BAN (Search Suggestion Ban)**: 検索窓のユーザー名サジェスト候補に表示されるかを検証
- **ゴーストBAN (Ghost Ban / Thread Ban)**: リプライ（返信）が第三者から不可視（非表示）になっていないかを検証
- **リプライ降格 (Reply Deboosting)**: リプライが「さらに返信を表示」や不適切折りたたみに追いやられていないかを検証

### 2. アカウント健全度スコア (0〜100点)
- アカウントの状態を 0〜100点 のスコアとわかりやすいステータスバッジ（ALL CLEAR / WARNING / BAN DETECTED）で可視化。
- X 上での直接検索テストリンク（話題検索、最新検索、プロフィール）をワンクリックで起動可能。
- 判定結果のワンクリックコピーおよび X（Twitter）へのシェアポスト機能。

### 3. Gemini AI による詳細診断・復旧アクションプラン
- Google Gemini API を活用し、現在のアカウント状態に応じたオーダーメイド診断を実行。
  - **リスクレベル判定**（Low / Medium / High / Critical）
  - **推測される原因リスト**
  - **ステップバイステップの回復アクションプラン**
  - **推定復旧期間**
  - **再発防止のための日常投稿テクニック**
- ユーザーの最近の活動状況（連続投稿、外部ツール利用歴等）を任意で入力して診断精度を向上可能。

### 4. シャドウバンナレッジベース & よくある質問 (FAQ)
- シャドウバン4種類の仕組み・発生原因・解除方法の完全ガイド。
- インクリメンタルキーワード検索に対応した FAQ セクション。

### 5. 診断履歴 & ダークモード対応
- 過去の診断履歴（直近20件）をローカルストレージに自動保存し、履歴ドロワーから再チェック可能。
- システム設定またはトグルボタンによるダークモード / ライトモード切り替え。

---

## 🛠️ 技術スタック

- **フロントエンド**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lucide React
- **バックエンド**: Express (Node.js), TypeScript (`tsx` / `esbuild`)
- **AI / LLM**: Google GenAI SDK (`@google/genai`), Gemini 2.5 / Flash
- **デプロイ対応**: Vercel (`vercel.json`), Google Cloud Run, 各種 Node.js サーバー

---

## 🚀 ローカル開発環境のセットアップ

### 前提条件
- Node.js 20 以上
- npm または yarn / pnpm / bun

### 手順

1. **リポジトリのクローン**
   ```bash
   git clone https://github.com/yabetchi-iPhone/X-Shadowban-Checker.git
   cd X-Shadowban-Checker
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **環境変数の設定**
   `.env.example` をコピーして `.env` を作成し、必要な API キーを設定します。
   ```bash
   cp .env.example .env
   ```
   ```env
   # .env
   GEMINI_API_KEY="your-gemini-api-key-here"
   ```
   > ※ Gemini API キーは [Google AI Studio](https://aistudio.google.com/) から無料で取得できます。

4. **開発サーバーの起動**
   ```bash
   npm run dev
   ```
   ブラウザで `http://localhost:3000` を開きます。

5. **ビルド**
   ```bash
   npm run build
   ```

---

## ☁️ Vercel へのデプロイ

本プロジェクトは `vercel.json` が設定済みのため、GitHub リポジトリを Vercel にインポートするだけでデプロイ可能です。

1. [Vercel Dashboard](https://vercel.com/) で **「Add New Project」** を選択。
2. 本 GitHub リポジトリ（`X-Shadowban-Checker`）をインポート。
3. **Environment Variables**（環境変数）に以下を追加:
   - `GEMINI_API_KEY`: 取得した Google Gemini API キー
4. **「Deploy」** をクリック。

---

## 📁 ディレクトリ構成

```text
├── src/
│   ├── components/
│   │   ├── Header.tsx             # ヘッダー（テーマ切替・履歴・ヘルプ）
│   │   ├── SearchBar.tsx          # ユーザー名入力・サンプル・ローディング表示
│   │   ├── ProfileCard.tsx        # プロフィール概要・健全度スコア・共有ボタン
│   │   ├── BanStatusCards.tsx     # 4種類のシャドウバン項目別カード
│   │   ├── AIDiagnosisSection.tsx # Gemini AI による詳細診断セクション
│   │   ├── KnowledgeSection.tsx   # 解説ガイド & 検索付きFAQ
│   │   ├── HistoryDrawer.tsx      # 診断履歴ドロワー
│   │   └── Footer.tsx             # フッター
│   ├── data/
│   │   └── shadowbanKnowledge.ts  # シャドウバン解説データ・FAQ一覧
│   ├── types.ts                   # TypeScript 型定義
│   ├── App.tsx                    # メインアプリケーション
│   ├── main.tsx                   # エントリーポイント
│   └── index.css                  # グローバルスタイル (Tailwind CSS)
├── server.ts                      # Express API サーバー (Vercel serverless 対応)
├── vercel.json                    # Vercel ルーティング & ビルド設定
├── metadata.json                  # アプリケーションメタデータ
├── package.json                   # 依存関係・スクリプト定義
└── README.md                      # プロジェクト説明書
```

---

## ⚠️ 免責事項

- 本ツールは X（旧Twitter）および X Corp. の公式サービスではありません。
- 判定結果は公開されているシンドリケーションデータおよびアルゴリズムの挙動に基づき推定・算出しています。X の仕様変更やアップデートにより判定結果が変動する場合があります。

---

## 📄 ライセンス

[Apache License 2.0](LICENSE)
