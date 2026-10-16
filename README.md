# X (旧Twitter) シャドウバンチェッカー (X Shadowban Checker PRO v3.0)

![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?logo=tailwind-css&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Gemini%20AI-3.8%20%2F%203.1%20Flash-8E75B2?logo=google&logoColor=white)
![Security](https://img.shields.io/badge/Security-Hardened%20%26%20Rate--Limited-emerald?logo=shield)
![Vercel](https://img.shields.io/badge/Vercel-Deployable-black?logo=vercel&logoColor=white)

X（旧Twitter）のアカウントがシャドウバン（制限）されているかどうかをリアルタイムで詳細に判定・可視化し、投稿前の「AIポスト安全性診断」、乗っ取りやスパム被害を防ぐ「アカウントセキュリティ診断」、最新Gemini AIによる回復アドバイスを提供するオールインワンWebアプリケーションです。

---

## 🌟 主な機能 (PRO v3.0)

### 1. 4種類のシャドウバン項目を個別判定
- **検索BAN (Search Ban)**: 話題・最新タブの検索結果にポストが表示されるかを検証
- **検索補完BAN (Search Suggestion Ban)**: 検索窓のユーザー名サジェスト候補に表示されるかを検証
- **ゴーストBAN (Ghost Ban / Thread Ban)**: リプライ（返信）が第三者から不可視（非表示）になっていないかを検証
- **リプライ降格 (Reply Deboosting)**: リプライが「さらに返信を表示」や不適切折りたたみに追いやられていないかを検証

### 2. アカウント健全度スコア & 行動メトリクス解析
- **判定確信度スコア (60〜99%)**: 直近ポストの取得状況やアルゴリズム解析の一致度を数値化して表示。
- **直近ポスト挙動メトリクス解析**:
  - **リプライ比率**: リプライの割合を算出し、過剰なリプライ連投スパムを検出。
  - **外部リンク率**: ポスト内の短縮URL・アフィリエイト・外部誘導比率を分析。
  - **定型文重複率**: 同一・類似文面による自動コピペリプライの反復を検知。
  - **検出された具体的リスク要因**: 判定根拠となった具体的な要因を箇条書きで可視化。

### 3. 【新機能】AI ポスト安全性チェッカー (Post Safety Checker)
- 投稿する前のポスト文・リプライ・引用ポストをAIが事前検査。
- 最新のXアルゴリズム（Grokスパム分類器、リンク付きポストのインプレッション減衰、ハッシュタグ過多）をシミュレートし、**危険度スコア (0〜100%)** を算出。
- **AI最適化リライト文面**: アカウントを安全に保ちつつエンゲージメントを最大化する文面を自動生成し、ワンクリックでコピー＆Xへ直接投稿可能。

### 4. 【新機能】アカウント セキュリティ診断 (Security Audit Checklist)
- 急増する「乗っ取り」「悪質連携アプリによる勝手なポスト」「フィッシング詐欺」を完全防御。
- 認証アプリ・パスキーによる2FA、古いOAuth連携アプリの棚卸し、DMスパムフィルター設定などをインタラクティブにチェック。
- アカウントの「安全達成度スコア」をリアルタイム算出し、Xの設定画面へ直行するリンクを提供。

### 5. 強化されたセキュリティ対策 (Security Hardening)
- **API レート制限 (Rate Limiting)**: IPごとのトークンバケット方式によるDoS攻撃・自動スクレイピング・APIキー枯渇の防止。
- **HTTP セキュリティヘッダー**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, 不要ヘッダー削除 (`x-powered-by`)。
- **プロンプトインジェクション防御 (Prompt Injection Guard)**: ユーザー入力やプロフィールBioを安全なXMLデリミタタグで隔離し、AIへの悪意ある命令改ざんを完全に無効化。
- **マルチモデル・自動フェイルオーバー**: `gemini-3.1-flash-lite`, `gemini-3-flash-preview`, `gemini-3.8-flash` への耐障害性フォールバック機構を搭載し、高可用性を実現。
- **厳格な入力サニタイズ**: 正規表現 `^[a-zA-Z0-9_]{1,15}$` によるユーザー名バリデーション。

---

## 🛠️ 技術スタック

- **フロントエンド**: React 19, TypeScript, Vite, Tailwind CSS v4, Motion, Lucide React
- **バックエンド**: Express (Node.js), TypeScript (`tsx` / `esbuild`)
- **AI / LLM**: Google GenAI SDK (`@google/genai`), Gemini 3.8 / 3.1 Flash
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
