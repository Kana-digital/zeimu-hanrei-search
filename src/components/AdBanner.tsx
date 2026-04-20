"use client";

/**
 * 広告バナーコンポーネント
 *
 * 現在はプレースホルダー表示。
 * 本番運用時は Google AdSense のスクリプトに差し替え。
 *
 * 差し替え手順:
 * 1. Google AdSense アカウント作成 → サイト承認
 * 2. layout.tsx の <head> に AdSense スクリプトを追加
 * 3. このコンポーネント内を <ins className="adsbygoogle" ... /> に差し替え
 */

export default function AdBanner() {
  return (
    <section
      className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-900"
      data-testid="ad-banner"
    >
      <div className="mx-auto max-w-2xl">
        <p className="text-xs text-gray-400 mb-2">広告</p>
        <div className="flex items-center justify-center h-20 rounded bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-gray-200 dark:border-gray-800">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              📚 税務のお悩み、専門家に相談しませんか？
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              広告スペース（Google AdSense 審査後に表示）
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
