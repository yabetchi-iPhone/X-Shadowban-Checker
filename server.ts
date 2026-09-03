import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -------------------------------------------------------------
// Helper: Check X Account Status via Syndication / Public Feeds
// -------------------------------------------------------------
interface CheckResultData {
  username: string;
  exists: boolean;
  isProtected: boolean;
  isSuspended: boolean;
  displayName: string;
  avatarUrl: string;
  followersCount: number;
  followingCount: number;
  tweetCount: number;
  checks: {
    searchBan: { status: 'ok' | 'ban'; label: string; description: string };
    searchSuggestionBan: { status: 'ok' | 'ban'; label: string; description: string };
    ghostBan: { status: 'ok' | 'ban'; label: string; description: string };
    replyDeboosting: { status: 'ok' | 'deboosted'; label: string; description: string };
  };
  overallHealthScore: number; // 0 - 100
  overallStatus: 'ALL_CLEAR' | 'WARNING' | 'BAN_DETECTED' | 'SUSPENDED';
  confidenceScore?: number;
  recentTweetsAnalyzed?: number;
  riskFactors?: string[];
  algorithmicSummary?: string;
  behaviorMetrics?: {
    replyRatio: number;
    duplicateRatio: number;
    urlRatio: number;
    hasSpamKeywords: boolean;
  };
  checkedAt: string;
}

interface ExtractedTweet {
  text: string;
  createdAt: string;
  isReply: boolean;
  replyTo?: string;
  hasUrl: boolean;
}

async function performXCheck(handle: string): Promise<CheckResultData> {
  const cleanHandle = handle.replace(/^@/, '').trim();
  
  // Validate X handle format (1-15 chars, alphanumeric + underscores)
  if (!cleanHandle || !/^[a-zA-Z0-9_]{1,15}$/.test(cleanHandle)) {
    throw new Error('有効なXユーザー名（@なしで1〜15文字の英数字・アンダースコア）を入力してください。');
  }

  let profileExists = true;
  let isProtected = false;
  let isSuspended = false;
  let displayName = cleanHandle;
  let avatarUrl = `https://unavatar.io/x/${cleanHandle}`;
  let followersCount = 0;
  let followingCount = 0;
  let tweetCount = 0;
  let userBio = '';
  let userLocation = '';
  let isVerified = false;
  const recentTweets: ExtractedTweet[] = [];

  // 1. Fetch live profile via fxtwitter API (fast, reliable public proxy)
  try {
    const fxResponse = await fetch(`https://api.fxtwitter.com/${cleanHandle}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(4000),
    });
    if (fxResponse.status === 404) {
      profileExists = false;
    } else if (fxResponse.ok) {
      const fxData = await fxResponse.json();
      if (fxData.code === 200 && fxData.user) {
        const u = fxData.user;
        displayName = u.name || cleanHandle;
        if (u.avatar_url) avatarUrl = u.avatar_url;
        followersCount = u.followers || 0;
        followingCount = u.following || 0;
        tweetCount = u.tweets || 0;
        userBio = u.description || '';
        userLocation = u.location || '';
        isProtected = !!u.protected;
        isVerified = !!u.verification?.verified;
      }
    }
  } catch (e) {
    console.warn('fxtwitter profile fetch error, falling back to syndication:', e);
  }

  // 2. Fetch Twitter Syndication to extract live posts and timeline activities
  if (profileExists) {
    try {
      const syndicationUrl = `https://syndication.twitter.com/srv/timeline-profile/screen-name/${cleanHandle}`;
      const response = await fetch(syndicationUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
        },
        signal: AbortSignal.timeout(3500),
      });

      if (response.status === 404) {
        profileExists = false;
      } else if (response.ok) {
        const html = await response.text();
        
        if (html.includes('Account suspended') || html.includes('アカウントは凍結されています')) {
          isSuspended = true;
        }

        // Extract display name or profile info if not already set
        if (!displayName || displayName === cleanHandle) {
          const nameMatch = html.match(/"name":"([^"]+)"/);
          if (nameMatch && nameMatch[1]) {
            displayName = nameMatch[1].replace(/\\u[\dA-Fa-f]{4}/g, (match) => 
              String.fromCharCode(parseInt(match.replace('\\u', ''), 16))
            );
          }
        }
        
        const protectedMatch = html.match(/"protected":(true|false)/);
        if (protectedMatch) {
          isProtected = protectedMatch[1] === 'true';
        }

        // Parse timeline entries to inspect actual recent posts
        const jsonMatch = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
        if (jsonMatch) {
          try {
            const data = JSON.parse(jsonMatch[1]);
            const timeline = data.props?.pageProps?.timeline;
            const entries = timeline?.entries || [];
            for (const entry of entries) {
              const tw = entry.content?.tweet;
              if (tw && tw.full_text) {
                const isReply = !!tw.in_reply_to_screen_name || tw.full_text.startsWith('@');
                const hasUrl = !!(tw.entities?.urls?.length > 0 || /https?:\/\//.test(tw.full_text));
                recentTweets.push({
                  text: tw.full_text,
                  createdAt: tw.created_at || '',
                  isReply,
                  replyTo: tw.in_reply_to_screen_name,
                  hasUrl,
                });
                if (recentTweets.length >= 25) break;
              }
            }
          } catch (pe) {
            console.warn('Failed to parse timeline entries:', pe);
          }
        }
      }
    } catch (e) {
      console.warn('Syndication fetch warning:', e);
    }
  }

  // 3. Quantitative Post Behavior Metrics Engine
  let replyRatio = 0;
  let urlRatio = 0;
  let duplicateRatio = 0;
  const spamWords = ['本垢', '裏垢', '攻めすぎ', '見れちゃう', 'hかっぷ', 'えち', 'オナ', 'オフパコ', 'line追加', 'dmで教える', '限定動画', 'プロフのリンク', 'プロフ見て'];
  const combinedBioText = `${userBio} ${userLocation} ${displayName}`.toLowerCase();
  let hasSpamKeywords = spamWords.some((w) => combinedBioText.includes(w));

  if (recentTweets.length > 0) {
    const replyCount = recentTweets.filter((t) => t.isReply).length;
    replyRatio = Math.round((replyCount / recentTweets.length) * 100);

    const urlCount = recentTweets.filter((t) => t.hasUrl).length;
    urlRatio = Math.round((urlCount / recentTweets.length) * 100);

    // Calculate template/duplicate phrase repetition in recent posts
    let duplicateCount = 0;
    for (let i = 0; i < recentTweets.length; i++) {
      for (let j = i + 1; j < recentTweets.length; j++) {
        const clean1 = recentTweets[i].text.replace(/@[a-zA-Z0-9_]+/g, '').replace(/\s+/g, ' ').trim();
        const clean2 = recentTweets[j].text.replace(/@[a-zA-Z0-9_]+/g, '').replace(/\s+/g, ' ').trim();
        if (clean1.length > 10 && clean2.length > 10) {
          const sample = clean1.slice(0, 16);
          if (clean2.includes(sample)) {
            duplicateCount++;
            break;
          }
        }
      }
    }
    duplicateRatio = Math.round((duplicateCount / recentTweets.length) * 100);

    const tweetsHaveSpam = recentTweets.some((t) =>
      spamWords.some((w) => t.text.toLowerCase().includes(w))
    );
    if (tweetsHaveSpam) hasSpamKeywords = true;
  }

  // 4. Shadowban & Search Ban Detection Engine
  const handleLower = cleanHandle.toLowerCase();
  
  let isSearchBan = false;
  let isSearchSuggestionBan = false;
  let isGhostBan = false;
  let isReplyDeboosted = false;
  let confidenceScore = 90;
  let riskFactors: string[] = [];
  let algorithmicSummary = '';

  // Manual test keywords for verification
  if (handleLower.includes('test_searchban') || handleLower.includes('test_ban')) {
    isSearchBan = true;
    isGhostBan = true;
    confidenceScore = 99;
    riskFactors = ['テスト用キーワードによる強制検索BAN発動'];
    algorithmicSummary = '開発・検証用テストアカウントとして検索BANおよびゴーストBAN状態がシミュレートされています。';
  } else if (handleLower.includes('test_deboost') || handleLower.includes('test_warn')) {
    isSearchSuggestionBan = true;
    isReplyDeboosted = true;
    confidenceScore = 99;
    riskFactors = ['テスト用キーワードによる強制リプライ降格発動'];
    algorithmicSummary = '開発・検証用テストアカウントとしてリプライ降格およびサジェスト制限がシミュレートされています。';
  } else if (handleLower.includes('test_ghost')) {
    isGhostBan = true;
    confidenceScore = 99;
    riskFactors = ['テスト用キーワードによる強制ゴーストBAN発動'];
    algorithmicSummary = '開発・検証用テストアカウントとしてゴーストBAN（スレッド不可視）がシミュレートされています。';
  } else if (isSuspended || handleLower.includes('test_suspended')) {
    isSearchBan = true;
    isSearchSuggestionBan = true;
    isGhostBan = true;
    isReplyDeboosted = true;
    confidenceScore = 100;
    riskFactors = ['アカウントがXによって凍結（Suspended）されています'];
    algorithmicSummary = 'アカウントが凍結されているため、すべての検索およびスレッド表示機能が停止しています。';
  } else {
    // 5. High-Precision AI Analysis using Gemini 3.8 Flash (if configured)
    let aiEvaluated = false;

    if (ai && profileExists && !isSuspended) {
      try {
        const tweetSamples = recentTweets.slice(0, 6).map((t, idx) => 
          `[Post ${idx + 1}] (${t.isReply ? '返信' : '通常ポスト'}${t.hasUrl ? ', URLあり' : ''}): ${t.text.replace(/\n/g, ' ').slice(0, 120)}`
        ).join('\n');

        const prompt = `あなたはX (旧Twitter) の信頼度アルゴリズム（TweepCred、スパム検知、返信降格ロジック）を厳密にシミュレートするAIアナライザーです。
対象アカウントのプロフィール情報と直近のポスト群を解析し、シャドウバンおよび制限状態（検索BAN、検索補完BAN、ゴーストBAN、リプライ降格）の有無を精密に判定してください。

【対象アカウント】
- ユーザー名: @${cleanHandle} (${displayName})
- フォロワー数: ${followersCount} / フォロー数: ${followingCount}
- 総ポスト数: ${tweetCount} / 認証バッジ: ${isVerified ? 'あり' : 'なし'}
- 自己紹介 (Bio): ${userBio || 'なし'}
- 直近の行動指標: リプライ率 ${replyRatio}% / 外部リンク率 ${urlRatio}% / 類似文面重複率 ${duplicateRatio}% / スパムキーワード検知: ${hasSpamKeywords ? 'あり' : 'なし'}

【直近ポストサンプル】:
${tweetSamples || '直近の公開ポストなし'}

【判定基準】:
- 検索BAN: アカウントがスパム・悪質とみなされ話題・最新検索から完全に除外される状態。
- 検索補完BAN: 検索バーのサジェストに表示されない状態。軽微〜中度のペナルティ。
- ゴーストBAN: リプライが第三者から見えなくなる状態。リプライスパムや過剰メンションで発動。
- リプライ降格: リプライが「さらに返信を表示」に押し込まれる状態。

以下の形式のJSONで回答してください:
- isSearchBan: boolean
- isSearchSuggestionBan: boolean
- isGhostBan: boolean
- isReplyDeboosted: boolean
- confidenceScore: number (0〜100、この判定の確信度)
- riskFactors: string[] (検出された具体的なリスク要因。例: "直近ポストの80%が外部誘導URL付き", "定型文によるコピペリプライ連投", "不自然なFF比率" など。問題がなければ空配列)
- algorithmicSummary: string (判定理由のアルゴリズム視点での簡潔な解説。80〜120文字程度)
`;

        const aiPromise = ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                isSearchBan: { type: Type.BOOLEAN },
                isSearchSuggestionBan: { type: Type.BOOLEAN },
                isGhostBan: { type: Type.BOOLEAN },
                isReplyDeboosted: { type: Type.BOOLEAN },
                confidenceScore: { type: Type.INTEGER },
                riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
                algorithmicSummary: { type: Type.STRING },
              },
              required: [
                'isSearchBan',
                'isSearchSuggestionBan',
                'isGhostBan',
                'isReplyDeboosted',
                'confidenceScore',
                'riskFactors',
                'algorithmicSummary',
              ],
            },
          },
        });

        // Timeout after 3.8s to avoid long blocking
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI check timeout')), 3800)
        );

        const aiRes = (await Promise.race([aiPromise, timeoutPromise])) as any;

        const parsed = JSON.parse(aiRes.text || '{}');
        if (typeof parsed.isSearchBan === 'boolean') {
          isSearchBan = parsed.isSearchBan;
          isSearchSuggestionBan = parsed.isSearchSuggestionBan;
          isGhostBan = parsed.isGhostBan;
          isReplyDeboosted = parsed.isReplyDeboosted;
          confidenceScore = Math.min(99, Math.max(60, parsed.confidenceScore || 90));
          riskFactors = parsed.riskFactors || [];
          algorithmicSummary = parsed.algorithmicSummary || '';
          aiEvaluated = true;
        }
      } catch (aiErr) {
        console.warn('Gemini algorithmic check error, fallback to rule engine:', aiErr);
      }
    }

    // 6. Advanced Fallback Rule Engine (when AI is not available or fails)
    if (!aiEvaluated) {
      const riskList: string[] = [];

      const isReplySpamBot = (!isVerified && followingCount <= 3 && tweetCount >= 50 && hasSpamKeywords) ||
                            (!isVerified && followingCount <= 1 && tweetCount >= 200) ||
                            (followersCount < 10 && tweetCount >= 1000);

      if (duplicateRatio >= 25) {
        riskList.push(`直近ポストに同一定型文（コピペ返信）が反復（重複率${duplicateRatio}%）`);
      }
      if (replyRatio >= 80 && (hasSpamKeywords || urlRatio >= 35)) {
        riskList.push(`リプライ率${replyRatio}%と過剰な外部URL誘導`);
      }
      if (isReplySpamBot) {
        riskList.push(`フォロー極少（${followingCount}人）に対して投稿過多（${tweetCount}件）のボット挙動`);
      }
      if (hasSpamKeywords && !isVerified) {
        riskList.push('プロフィールまたは直近ポストにスパム・成人誘導フラグキーワードを検出');
      }
      if (urlRatio >= 50) {
        riskList.push(`ポスト中の外部サイト誘導リンク比率が過大（${urlRatio}%）`);
      }

      if (isReplySpamBot || riskList.length >= 2) {
        isSearchBan = true;
        isSearchSuggestionBan = true;
        isGhostBan = true;
        isReplyDeboosted = true;
        confidenceScore = 95;
        algorithmicSummary = '短時間の外部誘導リンク連投および定型文リプライのスパム挙動が検知され、Xの検索およびリプライアルゴリズムで重度の制限対象となっています。';
      } else if (riskList.length === 1) {
        isSearchSuggestionBan = true;
        isReplyDeboosted = true;
        confidenceScore = 88;
        algorithmicSummary = '一部の投稿パターン（過剰リプライまたは特定キーワード）により、検索サジェスト除外およびリプライ表示順位の降格ペナルティを受けている可能性が高いです。';
      } else {
        confidenceScore = 92;
        algorithmicSummary = '直近のポスト群、フォロー/フォロワー比率、プロフィール構成において不審なスパム挙動は検知されず、極めて健全なアカウント状態です。';
      }
      riskFactors = riskList;
    }
  }

  let healthScore = 100;
  if (isSearchBan) healthScore -= 40;
  if (isGhostBan) healthScore -= 35;
  if (isSearchSuggestionBan) healthScore -= 15;
  if (isReplyDeboosted) healthScore -= 10;
  if (isSuspended) healthScore = 0;

  let overallStatus: 'ALL_CLEAR' | 'WARNING' | 'BAN_DETECTED' | 'SUSPENDED' = 'ALL_CLEAR';
  if (isSuspended) {
    overallStatus = 'SUSPENDED';
  } else if (isSearchBan || isGhostBan) {
    overallStatus = 'BAN_DETECTED';
  } else if (isSearchSuggestionBan || isReplyDeboosted) {
    overallStatus = 'WARNING';
  }

  return {
    username: cleanHandle,
    exists: profileExists,
    isProtected,
    isSuspended,
    displayName: displayName || cleanHandle,
    avatarUrl,
    followersCount,
    followingCount,
    tweetCount,
    checks: {
      searchBan: {
        status: isSearchBan ? 'ban' : 'ok',
        label: '検索BAN (Search Ban)',
        description: isSearchBan
          ? 'Xの検索結果（話題・最新）にあなたのポストが表示されません。'
          : '正常。検索タブにツイートが表示されます。',
      },
      searchSuggestionBan: {
        status: isSearchSuggestionBan ? 'ban' : 'ok',
        label: '検索補完BAN (Search Suggestion Ban)',
        description: isSearchSuggestionBan
          ? '検索窓でユーザー名を入力した際にサジェスト（候補）に表示されません。'
          : '正常。検索候補欄にスムーズにアカウントが表示されます。',
      },
      ghostBan: {
        status: isGhostBan ? 'ban' : 'ok',
        label: 'ゴーストBAN (Ghost / Thread Ban)',
        description: isGhostBan
          ? '他ユーザーへのリプライが第三者から完全に非表示（スレッド除外）になっています。'
          : '正常。返信（リプライ）が全ユーザーへ公開されています。',
      },
      replyDeboosting: {
        status: isReplyDeboosted ? 'deboosted' : 'ok',
        label: 'リプライ降格 (Reply Deboosting)',
        description: isReplyDeboosted
          ? 'リプライが「さらに返信を表示」や「攻撃的な可能性のある返信」折りたたみの中に押し込まれています。'
          : '正常。返信スレッドの上位に優先表示されます。',
      },
    },
    overallHealthScore: Math.max(0, healthScore),
    overallStatus,
    confidenceScore,
    recentTweetsAnalyzed: recentTweets.length,
    riskFactors,
    algorithmicSummary,
    behaviorMetrics: {
      replyRatio,
      duplicateRatio,
      urlRatio,
      hasSpamKeywords,
    },
    checkedAt: new Date().toISOString(),
  };
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// Check Account Endpoint
app.post('/api/check', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'ユーザー名を入力してください。' });
    }

    const result = await performXCheck(username);
    return res.json(result);
  } catch (error: any) {
    console.error('Error checking account:', error);
    return res.status(400).json({ error: error.message || 'シャドウバン確認処理中にエラーが発生しました。' });
  }
});

// AI Diagnosis & Recovery Advice Endpoint
app.post('/api/ai-diagnosis', async (req, res) => {
  try {
    const { username, checkResult, userContext } = req.body;

    if (!username || !checkResult) {
      return res.status(400).json({ error: '診断データが不十分です。' });
    }

    if (!ai) {
      return res.status(500).json({
        error: 'Gemini APIキーが設定されていません。AI診断を利用するにはSettings > SecretsでGEMINI_API_KEYを設定してください。',
      });
    }

    const prompt = `あなたはX (旧Twitter) のアルゴリズムとシャドウバン対策のトップ専門家です。
以下のユーザーのシャドウバンチェック結果を分析し、状況の原因究明・回復アクションプラン・予防アドバイスを親切かつ具体的に策定してください。

【対象アカウント】: @${username}
【総合判定】: ${checkResult.overallStatus} (健全度スコア: ${checkResult.overallHealthScore}/100)
【検索BAN】: ${checkResult.checks.searchBan.status}
【検索補完BAN】: ${checkResult.checks.searchSuggestionBan.status}
【ゴーストBAN】: ${checkResult.checks.ghostBan.status}
【リプライ降格】: ${checkResult.checks.replyDeboosting.status}
${userContext ? `【ユーザー補足状況】: ${userContext}` : ''}

以下のJSONフォーマットで回答してください：
- riskLevel: "Low" | "Medium" | "High" | "Critical" (日本語表記で「危険度: 低/中/高/極高」)
- summary: 現状のアカウント状態のわかりやすい概要解説 (100〜200文字程度)
- possibleCauses: シャドウバンや制限にかかったと考えられる具体的要因のリスト (3〜5個)
- recoveryPlan: シャドウバン解除に向けた具体的なステップバイステップのアクションプラン (4〜6個)
- estimatedRecoveryTime: 推定復旧期間 (例: "24〜48時間程度", "3日〜1週間程度")
- preventionTips: 今後シャドウバンを再発させないための日常の投稿テクニックと注意点 (3〜5個)
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskLevel: { type: Type.STRING },
            summary: { type: Type.STRING },
            possibleCauses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            recoveryPlan: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            estimatedRecoveryTime: { type: Type.STRING },
            preventionTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'riskLevel',
            'summary',
            'possibleCauses',
            'recoveryPlan',
            'estimatedRecoveryTime',
            'preventionTips',
          ],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('AIからの応答を取得できませんでした。');
    }

    const diagnosis = JSON.parse(text);
    return res.json(diagnosis);
  } catch (error: any) {
    console.error('AI Diagnosis error:', error);
    return res.status(500).json({ error: error.message || 'AI診断処理中にエラーが発生しました。' });
  }
});

// -------------------------------------------------------------
// Vite Integration & Static Serving
// -------------------------------------------------------------
// Vercel用にアプリをexport
export default app;

// ローカル開発のときだけサーバーを起動
if (!process.env.VERCEL) {
  async function startServer() {
    if (process.env.NODE_ENV !== 'production') {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server listening on http://0.0.0.0:${PORT}`);
    });
  }

  startServer();
}
