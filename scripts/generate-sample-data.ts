/**
 * サンプルデータ生成スクリプト（Sprint 1 用）
 *
 * ⚠️ このスクリプトが生成するデータは全て架空のサンプルです。
 *    実在する裁判例・裁決例ではありません。
 *    Sprint 2 以降で、国税不服審判所・裁判所の公開データに差し替えます。
 *
 * 実行: npm run generate-data
 */

import fs from "node:fs";
import path from "node:path";

type Subcategory =
  | "income_tax"
  | "corporate_tax"
  | "inheritance_tax"
  | "consumption_tax"
  | "local_tax"
  | "other";

type FinalResult =
  | "claimant_win"
  | "partial"
  | "claimant_lose"
  | "dismissed";

interface TaxCase {
  id: string;
  caseNumber: string;
  court: string;
  decisionDate: string;
  subcategory: Subcategory;
  title: string;
  issue: string;
  summary: string;
  fullText: string;
  finalResult: FinalResult;
  relatedLaws: string[];
  appealToId?: string;
  isSample: boolean;
}

const courts = [
  "国税不服審判所",
  "東京地裁",
  "大阪地裁",
  "名古屋地裁",
  "東京高裁",
  "大阪高裁",
  "最高裁",
];

const categoryTopics: Record<
  Subcategory,
  { topics: string[]; laws: string[] }
> = {
  income_tax: {
    topics: [
      "フリーランスの必要経費認定",
      "副業所得の区分（事業所得 or 雑所得）",
      "貸倒損失の計上時期",
      "居住用財産譲渡の3,000万円控除",
      "マンション売却の取得費加算",
      "ストックオプション課税区分",
      "海外赴任者の居住者判定",
      "寄附金控除の対象範囲",
      "年金所得者の確定申告要否",
      "個人事業主の家事按分",
    ],
    laws: ["所得税法37条", "所得税法35条", "所得税法64条", "租税特別措置法35条"],
  },
  corporate_tax: {
    topics: [
      "役員報酬の定期同額要件",
      "交際費と会議費の区分",
      "貸倒引当金の繰入限度額",
      "寄附金の損金算入限度",
      "減価償却資産の耐用年数",
      "グループ法人税制の適用",
      "移転価格税制での独立企業間価格",
      "繰越欠損金の利用制限",
      "固定資産の取得価額算定",
      "研究開発税制の適用要件",
    ],
    laws: ["法人税法34条", "法人税法61条の4", "法人税法22条", "租税特別措置法42条"],
  },
  inheritance_tax: {
    topics: [
      "小規模宅地等の特例の適用範囲",
      "非上場株式の評価方法",
      "貸家建付地の評価減",
      "名義預金の相続財産該当性",
      "生命保険金の非課税枠",
      "遺産分割協議のやり直しと税務",
      "養子縁組による基礎控除増加",
      "借地権の相続評価",
      "相続時精算課税制度の適用誤り",
      "農地の納税猶予",
    ],
    laws: [
      "相続税法3条",
      "相続税法22条",
      "租税特別措置法69条の4",
      "財産評価基本通達",
    ],
  },
  consumption_tax: {
    topics: [
      "インボイス制度と仕入税額控除",
      "課税事業者選択届出書の提出期限",
      "簡易課税の事業区分",
      "輸出免税の証憑要件",
      "居住用建物と課税仕入れ",
      "中間申告の要否判定",
      "基準期間の課税売上高判定",
      "高額特定資産の取得と還付制限",
      "課税売上割合の算定",
      "非課税取引と課税取引の区分",
    ],
    laws: ["消費税法30条", "消費税法37条", "消費税法7条", "消費税法9条"],
  },
  local_tax: {
    topics: [
      "固定資産税の評価額減額",
      "事業所税の課税対象範囲",
      "不動産取得税の軽減特例",
      "住民税の扶養控除誤り",
      "都市計画税の非課税地判定",
      "個人事業税の事業所得該当性",
      "償却資産の申告義務",
      "軽自動車税の課税区分",
      "法人住民税均等割の免除要件",
      "特別土地保有税の計算誤り",
    ],
    laws: ["地方税法341条", "地方税法72条", "地方税法73条", "地方税法294条"],
  },
  other: {
    topics: [
      "更正処分の理由附記不備",
      "税務調査での質問応答記録書",
      "加算税の賦課要件",
      "青色申告承認取消処分",
      "国税徴収法上の第二次納税義務",
      "印紙税の課税文書該当性",
      "登録免許税の計算誤り",
      "電子帳簿保存法対応の不備",
      "納税猶予の適用可否",
      "不服申立て期限の徒過",
    ],
    laws: [
      "国税通則法65条",
      "国税通則法74条の11",
      "印紙税法2条",
      "登録免許税法9条",
    ],
  },
};

const finalResults: FinalResult[] = [
  "claimant_win",
  "partial",
  "claimant_lose",
  "dismissed",
];

function pseudoDate(i: number): string {
  // 2018-01-01 から毎ケース適当にずらした日付
  const base = new Date(2018, 0, 1).getTime();
  const day = 1000 * 60 * 60 * 24;
  const offset = i * 37 * day + (i % 7) * 3 * day;
  const d = new Date(base + offset);
  return d.toISOString().slice(0, 10);
}

const subcats: Subcategory[] = [
  "income_tax",
  "corporate_tax",
  "inheritance_tax",
  "consumption_tax",
  "local_tax",
  "other",
];

const cases: TaxCase[] = [];
let idx = 0;
for (const sub of subcats) {
  const { topics, laws } = categoryTopics[sub];
  // 6 * 8 = 48, + 2 追加で 50 に寄せる
  const n = topics.length < 9 ? topics.length : 9;
  for (let i = 0; i < n; i++) {
    const topic = topics[i % topics.length];
    const court = courts[idx % courts.length];
    const result = finalResults[idx % finalResults.length];
    const caseId = `sample-${String(idx + 1).padStart(3, "0")}`;
    cases.push({
      id: caseId,
      caseNumber: `SAMPLE-${String(idx + 1).padStart(3, "0")}`,
      court,
      decisionDate: pseudoDate(idx),
      subcategory: sub,
      title: `${topic}に関する事案（サンプル${idx + 1}）`,
      issue: `納税者と課税庁の間で「${topic}」の取扱いが争点となった架空事例。`,
      summary:
        `本件は、${topic}について納税者と課税庁の間で解釈が分かれた架空の事案である。` +
        `${court}は関連法令および従前の判例・裁決例の趣旨を踏まえ、` +
        `事実関係および適用条文の解釈について検討を行った。` +
        `結論として、${result === "claimant_win" ? "納税者の請求を認容" : result === "partial" ? "請求の一部を認容" : result === "claimant_lose" ? "納税者の請求を棄却" : "却下"}した。` +
        `※本データはSprint 1検証用のサンプルです。実在の事例ではありません。`,
      fullText:
        `【全文（サンプル）】\n\n本件は${topic}に関する架空の事案である。\n\n` +
        `一、事案の概要\n納税者Xは${topic}について課税庁Yから更正処分を受けた。\n\n` +
        `二、争点\n${topic}の取扱いに関する法令解釈。\n\n` +
        `三、${court}の判断\n関連法令および従前の取扱いを踏まえ、` +
        `本件については${result === "claimant_win" ? "納税者の主張に理由があると認められる" : result === "partial" ? "一部に理由があると認められる" : result === "claimant_lose" ? "納税者の主張には理由がないと認められる" : "申立ての要件を欠く"}と判断した。\n\n` +
        `※このテキストはSprint 1検証用のサンプルです。`,
      finalResult: result,
      relatedLaws: [laws[idx % laws.length]],
      isSample: true,
    });
    idx++;
  }
}

// 50件に満たない / 超える場合の調整
while (cases.length < 50) {
  const base = cases[cases.length % cases.length];
  cases.push({
    ...base,
    id: `sample-${String(cases.length + 1).padStart(3, "0")}`,
    caseNumber: `SAMPLE-${String(cases.length + 1).padStart(3, "0")}`,
  });
}
const final = cases.slice(0, 50);

const outPath = path.join(__dirname, "..", "src", "data", "cases.json");
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(final, null, 2), "utf-8");

console.log(`Generated ${final.length} sample cases → ${outPath}`);
