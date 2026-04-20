// データアクセス層。MVP では JSON ファイルを唯一のデータソースにする。
// 後続スプリントで Supabase 等に差し替えるときは、この関数群の実装だけ入れ替える。

import casesData from "@/data/cases.json";
import type { TaxCase, Subcategory } from "./types";
import { SUBCATEGORY_ORDER } from "./types";

const allCases = casesData as TaxCase[];

export function getAllCases(): TaxCase[] {
  return allCases;
}

export function getCaseById(id: string): TaxCase | undefined {
  return allCases.find((c) => c.id === id);
}

export function getCaseCount(): number {
  return allCases.length;
}

export function getCountsBySubcategory(): Record<Subcategory, number> {
  const counts: Record<Subcategory, number> = {
    income_tax: 0,
    corporate_tax: 0,
    inheritance_tax: 0,
    consumption_tax: 0,
    local_tax: 0,
    other: 0,
  };
  for (const c of allCases) {
    counts[c.subcategory] += 1;
  }
  return counts;
}

export interface SearchParams {
  subcategory?: string | null;
  q?: string | null;
}

/**
 * サブカテゴリ絞り込み＋キーワード検索。
 * - subcategory: 指定されていれば一致するものだけ
 * - q: 空白区切りトークン、title / issue / summary / fullText / court を対象に AND 検索（部分一致・大文字小文字無視）
 */
export function searchCases(params: SearchParams): TaxCase[] {
  const { subcategory, q } = params;

  let results = allCases;

  if (subcategory && isValidSubcategory(subcategory)) {
    results = results.filter((c) => c.subcategory === subcategory);
  }

  if (q && q.trim() !== "") {
    const tokens = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    results = results.filter((c) => {
      const haystack = [
        c.title,
        c.issue,
        c.summary,
        c.fullText,
        c.court,
        c.caseNumber,
        ...c.relatedLaws,
      ]
        .join(" ")
        .toLowerCase();
      return tokens.every((t) => haystack.includes(t));
    });
  }

  // 日付の新しい順にソート
  return [...results].sort((a, b) =>
    b.decisionDate.localeCompare(a.decisionDate),
  );
}

export function isValidSubcategory(value: string): value is Subcategory {
  return (SUBCATEGORY_ORDER as readonly string[]).includes(value);
}

/**
 * 控訴・上告の関連事案を取得する。
 * - appealTo:   この事案が上訴した先（= c.appealToId）
 * - appealedFrom: この事案を上訴元とする事案（= 他の事案の appealToId が c.id を指すもの）
 */
export function getRelatedAppeals(caseId: string): {
  appealTo?: TaxCase;
  appealedFrom?: TaxCase;
} {
  const target = getCaseById(caseId);
  if (!target) return {};

  const appealTo = target.appealToId
    ? getCaseById(target.appealToId)
    : undefined;
  const appealedFrom = allCases.find((c) => c.appealToId === caseId);

  return { appealTo, appealedFrom };
}
