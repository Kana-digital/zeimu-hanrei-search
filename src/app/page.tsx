import Link from "next/link";
import { searchCases, isValidSubcategory, getCaseCount } from "@/lib/cases";
import { naturalLanguageSearch, type NLSearchResult } from "@/lib/nlSearch";
import {
  SUBCATEGORY_LABEL,
  SUBCATEGORY_ORDER,
  type Subcategory,
} from "@/lib/types";
import ResultBadge from "@/components/ResultBadge";
import AdBanner from "@/components/AdBanner";

interface PageProps {
  searchParams: Promise<{
    subcategory?: string;
    q?: string;
    ask?: string;
  }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawSubcategory = params.subcategory ?? "";
  const subcategory: Subcategory | "" = isValidSubcategory(rawSubcategory)
    ? rawSubcategory
    : "";
  const q = (params.q ?? "").trim();
  const ask = (params.ask ?? "").trim();

  // 自然文検索モードかどうか
  const isAskMode = ask.length > 0;
  const nlResults: NLSearchResult[] = isAskMode
    ? naturalLanguageSearch(ask, { limit: 10 })
    : [];

  // 通常検索（キーワード/税目）— 検索条件がある時のみ実行
  const isFiltered = subcategory !== "" || q !== "";
  const results = isFiltered
    ? searchCases({ subcategory: subcategory || null, q: q || null })
    : [];

  const total = getCaseCount();
  const hasSearched = isFiltered || isAskMode;

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h2 className="text-2xl font-bold">
          税務で困ったときに、似た裁判例を探す。
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          収録 {total} 件。検索・表示のみで、法的助言は行いません。
        </p>
      </section>

      {/* 自然言語検索フォーム（Sprint 4） */}
      <section>
        <form
          method="get"
          action="/"
          className="space-y-3 rounded-lg border-2 border-blue-300 bg-blue-50 p-4 sm:p-5 dark:border-blue-700 dark:bg-blue-950"
          data-testid="ask-form"
        >
          <div className="space-y-1">
            <label htmlFor="ask" className="block text-base font-bold">
              困ってることから探す
            </label>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              自然な文章で書いて OK。似ている裁判例・裁決例をマッチングします。
            </p>
          </div>
          <textarea
            id="ask"
            name="ask"
            rows={3}
            defaultValue={ask}
            placeholder="例: フリーランスで経費にした車の購入費を否認された / 相続で土地の評価を巡って争った事例が知りたい"
            className="w-full resize-y rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
            data-testid="ask-textarea"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              data-testid="ask-submit"
            >
              似ている裁判例を探す
            </button>
            {isAskMode && (
              <a
                href="/"
                className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold dark:border-gray-700"
                data-testid="ask-clear"
              >
                クリア
              </a>
            )}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            ⚠️ 本機能は公開されている裁判例・裁決例を検索マッチングするだけで、あなたの事案の勝敗・結論・助言は一切返しません。
          </p>
        </form>
      </section>

      {/* 自然文検索結果セクション */}
      {isAskMode && (
        <section className="space-y-3" data-testid="ask-results-section">
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
            <span data-testid="ask-disclaimer">
              ⚠️ これは情報提供のみです。あなたの事案に当てはまるかは、税理士・弁護士にご相談ください。
            </span>
          </div>

          <h3 className="text-lg font-semibold">
            関連しそうな裁判例{" "}
            <span
              className="text-sm font-normal text-gray-500"
              data-testid="ask-result-count"
            >
              {nlResults.length} 件
            </span>
          </h3>

          {nlResults.length === 0 ? (
            <div
              className="rounded-lg border border-gray-200 p-6 text-center text-gray-500 dark:border-gray-800"
              data-testid="ask-empty-state"
            >
              関連しそうな裁判例が見つかりませんでした。
              <br />
              別の言葉で書き直してみてください。
            </div>
          ) : (
            <ul
              className="divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800"
              data-testid="ask-result-list"
            >
              {nlResults.map((r) => (
                <li
                  key={r.taxCase.id}
                  data-testid={`ask-result-item-${r.taxCase.id}`}
                >
                  <Link
                    href={`/cases/${r.taxCase.id}`}
                    className="block p-4 transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:hover:bg-gray-900 dark:focus:bg-gray-900 sm:p-5"
                    data-testid={`ask-result-link-${r.taxCase.id}`}
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span>{r.taxCase.caseNumber}</span>
                      <span>・</span>
                      <span>{r.taxCase.decisionDate}</span>
                      <span>・</span>
                      <span>{r.taxCase.court}</span>
                      <span>・</span>
                      <span className="inline-block rounded bg-gray-100 px-2 py-0.5 dark:bg-gray-800">
                        {SUBCATEGORY_LABEL[r.taxCase.subcategory]}
                      </span>
                      <ResultBadge result={r.taxCase.finalResult} />
                    </div>
                    <h4 className="mt-2 font-semibold text-gray-900 break-words dark:text-gray-100">
                      {r.taxCase.title}
                    </h4>
                    <p className="mt-1 text-sm text-gray-700 line-clamp-2 break-words dark:text-gray-300">
                      {r.taxCase.summary}
                    </p>
                    {r.matchedTokens.length > 0 && (
                      <div
                        className="mt-2 flex flex-wrap items-center gap-1 text-xs"
                        data-testid={`ask-matched-tokens-${r.taxCase.id}`}
                      >
                        <span className="text-gray-500">ヒット:</span>
                        {r.matchedTokens.slice(0, 6).map((t) => (
                          <span
                            key={t}
                            className="inline-block rounded border border-blue-300 bg-blue-50 px-1.5 py-0.5 text-blue-800 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-200"
                          >
                            {t}
                          </span>
                        ))}
                        {r.subcategoryBoosted && (
                          <span
                            className="inline-block rounded border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"
                            data-testid={`ask-subcategory-boost-${r.taxCase.id}`}
                          >
                            税目ヒット
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {/* 通常の検索フォーム（サブカテゴリ + キーワード） */}
      {!isAskMode && (
        <section>
          <div className="mb-2 text-xs uppercase tracking-wider text-gray-500">
            または、税目・キーワードで探す
          </div>
          <form
            method="get"
            action="/"
            className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800 sm:p-5"
            data-testid="search-form"
          >
            <div className="space-y-2">
              <label
                htmlFor="subcategory"
                className="block text-sm font-semibold"
              >
                税目
              </label>
              <select
                id="subcategory"
                name="subcategory"
                defaultValue={subcategory}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 sm:w-64"
                data-testid="subcategory-select"
              >
                <option value="">すべての税目</option>
                {SUBCATEGORY_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {SUBCATEGORY_LABEL[s]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="q" className="block text-sm font-semibold">
                キーワード
              </label>
              <input
                id="q"
                name="q"
                type="text"
                defaultValue={q}
                placeholder="例: 必要経費 / 相続 / 消費税"
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900"
                data-testid="keyword-input"
              />
              <p className="text-xs text-gray-500">
                スペース区切りで複数指定できます（AND 検索）
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                className="rounded bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                data-testid="search-submit"
              >
                検索
              </button>
              {isFiltered && (
                <a
                  href="/"
                  className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold dark:border-gray-700"
                  data-testid="clear-filters"
                >
                  クリア
                </a>
              )}
            </div>
          </form>
        </section>
      )}

      {/* 広告バナー（検索実行後に表示） */}
      {hasSearched && <AdBanner />}

      {/* 通常検索結果（検索条件がある時のみ表示） */}
      {!isAskMode && isFiltered && (
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg font-semibold">
              検索結果{" "}
              <span
                className="text-sm font-normal text-gray-500"
                data-testid="result-count"
              >
                {results.length} 件
              </span>
            </h3>
          </div>

          {results.length === 0 ? (
            <div
              className="rounded-lg border border-gray-200 p-6 text-center text-gray-500 dark:border-gray-800"
              data-testid="empty-state"
            >
              該当する裁判例が見つかりませんでした。
              <br />
              条件を変えて再度お試しください。
            </div>
          ) : (
            <ul
              className="divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800"
              data-testid="result-list"
            >
              {results.map((c) => (
                <li
                  key={c.id}
                  data-testid={`result-item-${c.id}`}
                >
                  <Link
                    href={`/cases/${c.id}`}
                    className="block p-4 transition-colors hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:hover:bg-gray-900 dark:focus:bg-gray-900 sm:p-5"
                    data-testid={`result-link-${c.id}`}
                  >
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <span data-testid={`case-number-${c.id}`}>
                        {c.caseNumber}
                      </span>
                      <span>・</span>
                      <span data-testid={`decision-date-${c.id}`}>
                        {c.decisionDate}
                      </span>
                      <span>・</span>
                      <span data-testid={`court-${c.id}`}>{c.court}</span>
                      <span>・</span>
                      <span
                        className="inline-block rounded bg-gray-100 px-2 py-0.5 dark:bg-gray-800"
                        data-testid={`subcategory-label-${c.id}`}
                      >
                        {SUBCATEGORY_LABEL[c.subcategory]}
                      </span>
                      <ResultBadge result={c.finalResult} />
                    </div>
                    <h4 className="mt-2 font-semibold text-gray-900 break-words dark:text-gray-100">
                      {c.title}
                    </h4>
                    <p className="mt-1 text-sm text-gray-700 line-clamp-3 break-words dark:text-gray-300">
                      {c.summary}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
