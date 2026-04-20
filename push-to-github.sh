#!/bin/bash
# 判例検索ツール → GitHub push スクリプト
# 使い方: ターミナルで以下を実行
#   cd ~/Desktop/Claude\ code/AI秘書/1_projects/PRJ-004_判例検索ツール
#   chmod +x push-to-github.sh
#   ./push-to-github.sh

set -e

echo "=== 判例検索ツール GitHub Push ==="

# .gitがあれば削除してやり直し
if [ -d ".git" ]; then
  echo "既存の.gitを削除..."
  rm -rf .git
fi

# 初期化
git init
git config user.email "9kana6@gmail.com"
git config user.name "kana-digital"
git branch -M main

# コミット
git add -A
git commit -m "判例検索ツール MVP + 実データ50件

- Next.js 15 + React 19 + TypeScript + Tailwind CSS
- 税務判例・裁決例50件の実データ
- 自然言語検索対応
- 6カテゴリ: 所得税/法人税/相続税/消費税/地方税/その他"

# リモート追加 & push
git remote add origin https://github.com/Kana-digital/zeimu-hanrei-search.git
git push -u origin main

echo ""
echo "=== Push完了！ ==="
echo "リポジトリ: https://github.com/Kana-digital/zeimu-hanrei-search"
echo ""
echo "次のステップ: Vercelにデプロイ"
echo "  https://vercel.com/new → Import Git Repository → Kana-digital/zeimu-hanrei-search"
