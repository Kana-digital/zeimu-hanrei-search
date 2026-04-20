// 税務判例サーチ - 共通型定義

export type Subcategory =
  | "income_tax"
  | "corporate_tax"
  | "inheritance_tax"
  | "consumption_tax"
  | "local_tax"
  | "other";

export const SUBCATEGORY_LABEL: Record<Subcategory, string> = {
  income_tax: "所得税",
  corporate_tax: "法人税",
  inheritance_tax: "相続税",
  consumption_tax: "消費税",
  local_tax: "地方税",
  other: "その他",
};

export const SUBCATEGORY_ORDER: Subcategory[] = [
  "income_tax",
  "corporate_tax",
  "inheritance_tax",
  "consumption_tax",
  "local_tax",
  "other",
];

/**
 * 最終結果。
 * claimant_win:    原告（納税者）勝訴・請求認容
 * partial:         一部認容 / 一部取消
 * claimant_lose:   原告（納税者）敗訴・請求棄却
 * dismissed:       却下
 */
export type FinalResult =
  | "claimant_win"
  | "partial"
  | "claimant_lose"
  | "dismissed";

export const FINAL_RESULT_LABEL: Record<FinalResult, string> = {
  claimant_win: "納税者勝訴",
  partial: "一部認容",
  claimant_lose: "納税者敗訴",
  dismissed: "却下",
};

export interface TaxCase {
  /** 内部ID（URL等で使う） */
  id: string;
  /** 事件番号（公式のものがあればそれ、サンプルは "SAMPLE-xxx"） */
  caseNumber: string;
  /** 裁判所名 / 審判所名（例: "東京地裁", "国税不服審判所"） */
  court: string;
  /** 判決日 / 裁決日 (YYYY-MM-DD) */
  decisionDate: string;
  /** 税目サブカテゴリ */
  subcategory: Subcategory;
  /** 事件名（短いタイトル） */
  title: string;
  /** 争点（1〜2文） */
  issue: string;
  /** 要旨（数百字） */
  summary: string;
  /** 全文（SprintではプレースホルダでもOK） */
  fullText: string;
  /** 最終結果 */
  finalResult: FinalResult;
  /** 関連法令（自由記述配列） */
  relatedLaws: string[];
  /** 控訴・上告後の事案のID（紐付け） */
  appealToId?: string;
  /** このデータがプレースホルダ（非実在）かどうか */
  isSample: boolean;
}
