import Link from "next/link";

export default function CaseNotFound() {
  return (
    <div
      className="space-y-4 rounded-lg border border-gray-200 p-6 text-center dark:border-gray-800"
      data-testid="case-not-found"
    >
      <h2 className="text-xl font-bold">該当する裁判例が見つかりません</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        URLをお確かめの上、一覧からお探しください。
      </p>
      <Link
        href="/"
        className="inline-block rounded bg-gray-900 px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-gray-900"
        data-testid="back-to-list-404"
      >
        ← 一覧に戻る
      </Link>
    </div>
  );
}
