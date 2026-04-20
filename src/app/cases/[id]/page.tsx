import Link from "next/link";
import { notFound } from "next/navigation";
import { getCaseById, getRelatedAppeals } from "@/lib/cases";
import {
  SUBCATEGORY_LABEL,
  FINAL_RESULT_LABEL,
  type TaxCase,
} from "@/lib/types";
import ResultBadge from "@/components/ResultBadge";

type TabKey = "summary" | "full" | "laws";

const VALID_TABS: TabKey[] = ["summary", "full", "laws"];

const TAB_LABEL: Record<TabKey, string> = {
  summary: "要旨",
  full: "全文",
  laws: "関連法令",
};

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function CaseDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const { tab: tabParam } = await searchParams;

  const tab: TabKey = VALID_TABS.includes(tabParam as TabKey)
    ? (tabParam as TabKey)
    : "summary";

  const taxCase = getCaseById(id);
  if (!taxCase) {
    notFound();
  }

  const { appealTo, appealedFrom } = getRelatedAppeals(id);

  return (
    <article className="space-y-6" data-testid="case-detail">
      {/* 戻るナビゲーション */}
      <nav>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400"
          data-testid="back-to-list"
        >
          ← 一覧に戻る
        </Link>
      </nav>

      {/* ヘッダー: 事件番号 / 日付 / 裁判所 / 税目 / 最終結果 */}
      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span data-testid="detail-case-number">{taxCase.caseNumber}</span>
          <span>・</span>
          <span data-testid="detail-decision-date">{taxCase.decisionDate}</span>
          <span>・</span>
          <span data-testid="detail-court">{taxCase.court}</span>
          <span>・</span>
          <span
            className="inline-block rounded bg-gray-100 px-2 py-0.5 dark:bg-gray-800"
            data-testid="detail-subcategory"
          >
            {SUBCATEGORY_LABEL[taxCase.subcategory]}
          </span>
        </div>

        <h2
          className="text-2xl font-bold break-words"
          data-testid="detail-title"
        >
          {taxCase.title}
        </h2>

        <div
          className="flex flex-wrap items-center gap-2 text-sm"
          data-testid="detail-final-result-row"
        >
          <span className="font-semibold">最終結果:</span>
          <span data-testid="detail-final-result-label">
            {taxCase.court}　{FINAL_RESULT_LABEL[taxCase.finalResult]}
          </span>
          <ResultBadge result={taxCase.finalResult} />
        </div>

        {/* 争点 */}
        <p
          className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
          data-testid="detail-issue"
        >
          <span className="font-semibold">争点: </span>
          {taxCase.issue}
        </p>
      </header>

      {/* 関連事案リンク（控訴・上告） */}
      {(appealTo || appealedFrom) && (
        <section
          className="space-y-2 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-700 dark:bg-amber-950"
          data-testid="related-appeals"
        >
          <h3 className="font-semibold text-amber-900 dark:text-amber-200">
            関連する上訴事案
          </h3>
          <ul className="space-y-1">
            {appealedFrom && (
              <li>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  下級審 →
                </span>{" "}
                <Link
                  href={`/cases/${appealedFrom.id}`}
                  className="text-blue-600 hover:underline dark:text-blue-400"
                  data-testid="related-appealed-from"
                >
                  {appealedFrom.court}「{appealedFrom.title}」
                </Link>
              </li>
            )}
            {appealTo && (
              <li>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  上訴先 →
                </span>{" "}
                <Link
                  href={`/cases/${appealTo.id}`}
                  className="text-blue-600 hover:underline dark:text-blue-400"
                  data-testid="related-appeal-to"
                >
                  {appealTo.court}「{appealTo.title}」
                </Link>
              </li>
            )}
          </ul>
        </section>
      )}

      {/* タブナビゲーション */}
      <nav
        className="flex gap-1 border-b border-gray-200 dark:border-gray-800"
        data-testid="detail-tabs"
      >
        {VALID_TABS.map((key) => {
          const active = key === tab;
          return (
            <Link
              key={key}
              href={`/cases/${id}?tab=${key}`}
              scroll={false}
              className={
                "border-b-2 px-4 py-2 text-sm font-semibold transition-colors " +
                (active
                  ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                  : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white")
              }
              data-testid={`tab-${key}`}
              data-active={active ? "true" : "false"}
              aria-current={active ? "page" : undefined}
            >
              {TAB_LABEL[key]}
            </Link>
          );
        })}
      </nav>

      {/* タブコンテンツ */}
      <section data-testid={`tab-panel-${tab}`}>
        {tab === "summary" && <SummaryPanel taxCase={taxCase} />}
        {tab === "full" && <FullTextPanel taxCase={taxCase} />}
        {tab === "laws" && <LawsPanel taxCase={taxCase} />}
      </section>

      {taxCase.isSample && (
        <p
          className="rounded border border-gray-200 bg-gray-50 p-3 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-900"
          data-testid="sample-notice"
        >
          ⚠️
          このデータはサンプル（架空）です。実在の裁判例・裁決例ではありません。実データへの差し替えは後続タスクで行います。
        </p>
      )}
    </article>
  );
}

function SummaryPanel({ taxCase }: { taxCase: TaxCase }) {
  return (
    <div
      className="prose prose-sm max-w-none text-gray-800 dark:text-gray-200"
      data-testid="panel-summary-content"
    >
      <p className="whitespace-pre-wrap break-words leading-relaxed">
        {taxCase.summary}
      </p>
    </div>
  );
}

function FullTextPanel({ taxCase }: { taxCase: TaxCase }) {
  return (
    <div
      className="text-sm text-gray-800 dark:text-gray-200"
      data-testid="panel-full-content"
    >
      <pre className="whitespace-pre-wrap break-words font-sans leading-relaxed">
        {taxCase.fullText}
      </pre>
    </div>
  );
}

function LawsPanel({ taxCase }: { taxCase: TaxCase }) {
  if (taxCase.relatedLaws.length === 0) {
    return (
      <p
        className="text-sm text-gray-500"
        data-testid="panel-laws-empty"
      >
        関連法令の登録はありません。
      </p>
    );
  }
  return (
    <ul
      className="list-disc space-y-1 pl-5 text-sm text-gray-800 dark:text-gray-200"
      data-testid="panel-laws-content"
    >
      {taxCase.relatedLaws.map((law) => (
        <li key={law}>{law}</li>
      ))}
    </ul>
  );
}
