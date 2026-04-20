# PRJ-004 税務判例サーチ（仮称）

税務で困っている一般人向けの、無料・広告モデルの裁判例検索Webサービス。
自律開発パイプライン（Planner → Generator → Evaluator）で構築する。

## 立ち位置

- **ターゲット:** 税務で困っている一般人（メイン）、税理士志望者・若手税理士（サブ）
- **ジャンル:** 税務のみでスタート
- **設計原則:** あくまで「公開情報の検索・表示」のみ。AIは検索マッチングに使うが、助言・解釈・勝敗予想は絶対に出さない（非弁行為リスク回避）
- **マネタイズ:** MVPは無料。将来的に広告（Google AdSense）を検討

## 基盤メモ

事業案とMVP設計の背景はここにある:
- `AI秘書/3_resources/business-ideas/事業案-判例検索ツール.txt`

## 自律開発パイプラインのファイル

| パス | 用途 | 書き込み権限 |
|------|------|-------------|
| `CLAUDE.md` | 3エージェントのルール | 固定 |
| `docs/spec.md` | 仕様書 | Planner のみ |
| `docs/progress.md` | 実装進捗 | Generator のみ |
| `docs/feedback/sprint-N.md` | 評価結果 | Evaluator のみ |

## 現在のステータス

- [x] Planner: docs/spec.md 生成済み（Sprint 1〜4）
- [x] Generator: Sprint 1 実装完了
- [x] Evaluator: **Sprint 1 合格**（2026-04-11）
- [ ] Generator: Sprint 2 未着手

## 起動方法（かんたん）

Finder でこのフォルダを開いて **`start.command` をダブルクリック**するだけ。
初回は `npm install` が自動で走り、その後 `npm run dev` で開発サーバーが立ち上がる。

起動したらブラウザで http://localhost:3000 を開く。API は `/api/cases` 。

> 初回だけ Mac が「開発元が未確認」と警告することがある。
> その場合は `start.command` を **右クリック → 開く**、出てきたダイアログで「開く」を選ぶ。
> 次回以降はダブルクリックで起動できる。

止めたいときは、ターミナルの画面で `Ctrl + C`。ウィンドウは閉じてOK。

## 起動方法（ターミナルで直接やりたい派）

```bash
cd ~/Desktop/Claude\ code/AI秘書/1_projects/PRJ-004_判例検索ツール
./start.command
```

## 次のアクション

1. ローカルで `npm install && npm run dev` して動作確認
2. 問題なさそうなら Evaluator を起動して Sprint 1 を評価:
   > Evaluator として動いてください。`docs/spec.md` の受け入れ基準と `docs/progress.md` の引き渡し事項を読み、アプリを実際に起動してテストし、結果を `docs/feedback/sprint-1.md` に出力してください。

## スプリント計画（概要）

1. **Sprint 1:** データ取得基盤とDB（50件インポート、/api/cases）
2. **Sprint 2:** ジャンルフィルター + キーワード検索 + 一覧表示
3. **Sprint 3:** 詳細ページ（要旨/全文/関連法令 + 控訴上告紐付け）
4. **Sprint 4:** 自然言語検索（AI matching / 助言は一切なし）

詳細は `docs/spec.md` を参照。
