#!/bin/bash
# ダブルクリックで起動するための Mac 用ランチャー
# やること:
#   1. このスクリプトがあるフォルダに移動
#   2. package.json が node_modules より新しければ自動で再インストール
#   3. npm run dev を起動
# 止めるとき: ターミナルで Ctrl+C、ウィンドウは閉じてOK

set -e
cd "$(dirname "$0")"

echo "=================================================="
echo "税務判例サーチ（PRJ-004）を起動します"
echo "場所: $(pwd)"
echo "=================================================="

# Node / npm の存在チェック
if ! command -v npm >/dev/null 2>&1; then
  echo ""
  echo "❌ npm が見つかりません。"
  echo "   Node.js がインストールされていない可能性があります。"
  echo "   https://nodejs.org/ja から LTS 版をインストールしてください。"
  echo ""
  echo "何かキーを押すと終了します..."
  read -n 1 -s
  exit 1
fi

# パッケージが変わっている / 未インストール / 前回エラーだった場合は再インストール
NEEDS_INSTALL=0
if [ ! -d "node_modules" ]; then
  NEEDS_INSTALL=1
  echo "📦 node_modules が未作成です"
elif [ "package.json" -nt "node_modules" ]; then
  NEEDS_INSTALL=1
  echo "📦 package.json が更新されています"
fi

if [ $NEEDS_INSTALL -eq 1 ]; then
  echo "→ クリーンインストールを実行します（数分かかります）"
  rm -rf node_modules package-lock.json .next
  npm install
fi

# .next キャッシュが壊れていそうな場合の保険
if [ -d ".next" ] && [ ! -f ".next/BUILD_ID" ] && [ "$(ls -A .next 2>/dev/null)" ]; then
  echo "🧹 .next キャッシュをクリア"
  rm -rf .next
fi

echo ""
echo "🚀 開発サーバーを起動します"
echo "   起動したら http://localhost:3000 をブラウザで開いてください"
echo "   止めるときは Ctrl+C"
echo ""

npm run dev
