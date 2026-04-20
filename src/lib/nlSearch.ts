// 自然言語検索（Sprint 4）
//
// 設計原則:
// - AI による「助言」「勝敗予想」「結論」は一切生成しない。検索マッチングのみ。
// - 形態素解析ライブラリを使わず、平仮名・記号で区切って得られる
//   「カタカナ/漢字/英数の塊」を重要トークンとしてスコアリングする。
// - ローカル完結・決定論的・オフライン動作。API キー不要。
// - 非弁行為リスク回避: 本モジュールは入力を出力のランキングにしか使わない。

import type { TaxCase, Subcategory } from "./types";
import { getAllCases } from "./cases";

/**
 * 税目ヒント。これらのキーワードがクエリに含まれていたら、該当税目の事案をブーストする。
 * 順序は影響しないが、長いものから先に拾えるように長い順に並べる。
 */
const SUBCAT_HINTS: { keyword: string; subcategory: Subcategory }[] = [
  // 所得税系
  { keyword: "源泉徴収", subcategory: "income_tax" },
  { keyword: "フリーランス", subcategory: "income_tax" },
  { keyword: "個人事業主", subcategory: "income_tax" },
  { keyword: "雑所得", subcategory: "income_tax" },
  { keyword: "所得税", subcategory: "income_tax" },
  { keyword: "給与", subcategory: "income_tax" },
  { keyword: "源泉", subcategory: "income_tax" },
  // 法人税系
  { keyword: "役員報酬", subcategory: "corporate_tax" },
  { keyword: "法人税", subcategory: "corporate_tax" },
  { keyword: "法人", subcategory: "corporate_tax" },
  { keyword: "減価償却", subcategory: "corporate_tax" },
  // 相続税系
  { keyword: "相続税", subcategory: "inheritance_tax" },
  { keyword: "相続", subcategory: "inheritance_tax" },
  { keyword: "贈与", subcategory: "inheritance_tax" },
  { keyword: "遺産", subcategory: "inheritance_tax" },
  { keyword: "遺留分", subcategory: "inheritance_tax" },
  // 消費税系
  { keyword: "インボイス", subcategory: "consumption_tax" },
  { keyword: "消費税", subcategory: "consumption_tax" },
  { keyword: "仕入税額控除", subcategory: "consumption_tax" },
  // 地方税系
  { keyword: "固定資産税", subcategory: "local_tax" },
  { keyword: "固定資産", subcategory: "local_tax" },
  { keyword: "住民税", subcategory: "local_tax" },
  { keyword: "地方税", subcategory: "local_tax" },
];

/**
 * ノイズとなるトークン（サンプルデータにほぼ常に含まれるような語）。
 * 抽出後にこれらは除外する。
 */
const STOP_TOKENS = new Set<string>([
  "事例",
  "事案",
  "架空",
  "サンプル",
  "関する",
  "場合",
  "取扱",
  "取扱い",
  "本件",
  "納税",
  "納税者",
  "課税",
  "課税庁",
  "検討",
  "判断",
  "主張",
  "認容",
  "結論",
]);

export interface NLSearchResult {
  taxCase: TaxCase;
  score: number;
  matchedTokens: string[];
  subcategoryBoosted: boolean;
}

export interface NLSearchOptions {
  limit?: number;
}

/**
 * 自然文クエリから重要トークンを抽出する。
 *
 * 仕様:
 * - 平仮名・空白・各種記号で区切る
 * - 残った「カタカナ/漢字/英数の塊」で長さ 2 以上のものを重要トークンとする
 * - 順序保持、重複は除外
 * - STOP_TOKENS に含まれるものは除外
 */
export function extractTokens(text: string): string[] {
  if (!text) return [];
  // 平仮名 + 空白 + CJK記号 + 英文記号 で分割。
  // 長音符 ー は katakana 語の一部なので絶対に区切り文字に含めない。
  const parts = text
    .replace(/[ 　]/g, " ")
    .split(
      /[\u3040-\u309f\s,.!?\u3000-\u303f「」『』（）()\[\]【】〈〉《》・〜！？。、]+/,
    );
  const seen = new Set<string>();
  const tokens: string[] = [];
  for (const p of parts) {
    const t = p.trim();
    if (t.length < 2) continue;
    if (STOP_TOKENS.has(t)) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    tokens.push(t);
  }
  return tokens;
}

/**
 * トークンの検索バリエーション。
 * 3 文字以上の全漢字トークンは 2 文字の n-gram へも分解する。
 * （「購入費」→ "購入費", "購入", "入費"）
 *
 * これにより、ユーザーが書いた具体語が事案に完全一致しなくても、
 * 意味の近い事案を拾える。カタカナ・英数は分解しない（ノイズになるため）。
 */
function tokenVariants(token: string): string[] {
  if (token.length < 3) return [token];
  const isAllKanji = /^[\u4e00-\u9faf]+$/.test(token);
  if (!isAllKanji) return [token];
  const variants = [token];
  for (let i = 0; i < token.length - 1; i++) {
    const bg = token.slice(i, i + 2);
    if (!variants.includes(bg)) variants.push(bg);
  }
  return variants;
}

/**
 * 事案 1 件に対する重要トークンのスコアリング。
 *
 * 重み:
 *  - タイトル:  5
 *  - 争点:       4
 *  - 関連法令:   3
 *  - 要旨:       2
 *  - 全文:       1
 *
 * 各トークンについて最良の変種（元トークン or 2-char 漢字 n-gram）を使い、
 * 「フィールド重み × min(変種長, 5)」の最大値をそのトークンのスコアとする。
 */
function scoreCase(
  c: TaxCase,
  tokens: string[],
): { score: number; matched: string[] } {
  let score = 0;
  const matched: string[] = [];
  for (const t of tokens) {
    const variants = tokenVariants(t);
    let bestWeighted = 0;
    for (const v of variants) {
      let hit = 0;
      if (c.title.includes(v)) hit += 5;
      if (c.issue.includes(v)) hit += 4;
      if (c.relatedLaws.some((l) => l.includes(v))) hit += 3;
      if (c.summary.includes(v)) hit += 2;
      if (c.fullText.includes(v)) hit += 1;
      const weighted = hit * Math.min(v.length, 5);
      if (weighted > bestWeighted) bestWeighted = weighted;
    }
    if (bestWeighted > 0) {
      matched.push(t);
      score += bestWeighted;
    }
  }
  return { score, matched };
}

/**
 * 自然文検索本体。
 *
 * 入力: クエリ文字列（例「フリーランスで経費にした車の購入費を否認された」）
 * 出力: スコア順（降順）→ 日付の新しい順 でソートされた上位 N 件
 *
 * 非弁行為リスク回避のため、本関数はクエリ文字列を一切解釈せず、
 * 語彙マッチングによって「関連しそうな裁判例リスト」を返すだけ。
 * 勝敗予想・助言・結論は出力に含まれない。
 */
export function naturalLanguageSearch(
  query: string,
  options: NLSearchOptions = {},
): NLSearchResult[] {
  const limit = options.limit ?? 10;
  const tokens = extractTokens(query);
  if (tokens.length === 0) return [];

  const boostSubcats = new Set<Subcategory>();
  for (const hint of SUBCAT_HINTS) {
    if (query.includes(hint.keyword)) {
      boostSubcats.add(hint.subcategory);
    }
  }

  // 税目ヒントで該当サブカテゴリの全件にシードスコアを与える。
  // これにより具体語が一致しなくても、税目が明確なクエリでは関連事案が返る。
  const SUBCAT_SEED = 2;
  const DIRECT_BOOST = 10;

  const scored: NLSearchResult[] = [];
  for (const c of getAllCases()) {
    const { score: baseScore, matched } = scoreCase(c, tokens);
    const boosted = boostSubcats.has(c.subcategory);

    // 直接マッチ無しでも、ヒント一致の税目ならシードスコアで拾う
    const seed = boosted ? SUBCAT_SEED : 0;
    const bonus = boosted && baseScore > 0 ? DIRECT_BOOST : 0;
    const score = baseScore + seed + bonus;

    if (score === 0) continue;

    scored.push({
      taxCase: c,
      score,
      matchedTokens: matched,
      subcategoryBoosted: boosted,
    });
  }

  return scored
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.taxCase.decisionDate.localeCompare(a.taxCase.decisionDate);
    })
    .slice(0, limit);
}
