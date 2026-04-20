import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "税務判例サーチ",
  description:
    "税務の裁判例・裁決例を検索するための情報提供サービス。法的助言は行いません。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold">
              税務判例サーチ{" "}
              <span className="text-xs font-normal text-gray-500">
                β
              </span>
            </h1>
          </div>
        </header>

        <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">
          {children}
        </main>

        <footer className="border-t border-gray-200 dark:border-gray-800 px-6 py-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="max-w-5xl mx-auto space-y-2">
            <p data-testid="disclaimer">
              ⚠️
              本サービスは情報提供を目的とし、法的助言ではありません。具体的な判断は税理士・弁護士にご相談ください。
            </p>
            <p>
              本サービスは公開されている裁判例・裁決例を検索しやすく整理するものです。
              データは公開されている裁判例・裁決例に基づいています。
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
