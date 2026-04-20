# Sprint 1 評価結果

> このファイルは Evaluator のみが書き込みます。

**対象:** Sprint 1 - データ取得基盤とDB
**評価日:** 2026-04-11
**評価環境:** ローカル Mac（http://localhost:3000）+ Claude in Chrome による直接検証

## 総合判定

✅ **合格** — 次スプリントへ進んでOK

## 経緯（トラブルと対応）

初回の `npm install && npm run dev` で Tailwind CSS v4 の既知バグ
（`Missing field 'negated' on ScannerOptions.sources`）により500エラー。
Generator 側で Tailwind v3.4.17 に切り替え、`start.command` に mtime判定の自動クリーン再インストール処理を追加。
ユーザーが再度 `start.command` をダブルクリックして起動したら正常動作に復帰。

## 受け入れ基準チェック

| # | 基準 | 結果 | 証拠 |
|---|------|------|------|
| 1 | DBに50件前後のレコード | ✅ | `[data-testid="total-count"]` の中身が `50` |
| 2 | 各レコードに必須項目が埋まっている | ✅ | `/api/cases?limit=3` のJSONで `id/caseNumber/court/decisionDate/subcategory/title/issue/summary/fullText/finalResult/relatedLaws/isSample` を全件確認 |
| 3 | `/api/cases` が200を返し、JSON配列を返す | ✅ | `{"total":50,"count":3,"cases":[...]}` を受信 |
| 4 | トップページで件数が確認できる | ✅ | 「50 件」大きく表示。サブカテゴリ内訳も所得税9/法人税9/相続税9/消費税9/地方税9/その他5で描画 |
| 5 | 全ページのフッターに免責文言 | ✅ | `[data-testid="disclaimer"]` の中身が「⚠️ 本サービスは情報提供を目的とし、法的助言ではありません。具体的な判断は税理士・弁護士にご相談ください。」 |

## 自動評価スコア

| 基準 | スコア（閾値） | 備考 |
|------|----------|------|
| 機能完全性 | 5/5 （≥4） | 受け入れ基準5項目すべて満たす |
| 動作安定性 | 4/5 （≥4） | Tailwind切替後はエラーなし。初回のビルド時間（〜数秒）問題なし |
| UI/UX品質 | 4/5 （≥3） | 件数カード・ヘッダー・フッターの視認性良好。モバイル幅は未検証だが Tailwind v3 の grid で崩れにくい構成 |
| エラーハンドリング | 3/5 （≥3） | API に `?limit` 不正値ガードあり。詳細な500ハンドリングは Sprint 2 以降の拡張対象 |
| 回帰なし | 5/5 （必須） | 初スプリントのため該当なし |

すべて閾値以上 → **合格**

## 実際に確認した画面

- http://localhost:3000 → 「税務判例サーチ β / サンプルデータ」ヘッダー、キャッチコピー、収録件数カード、次のスプリント予定、API案内が正しく描画
- http://localhost:3000/api/cases?limit=3 → `{"total":50,"count":3,"cases":[...]}` のJSONが返る
- JS 経由で `[data-testid]` 5箇所を検証し、すべて期待値と一致

## 次スプリントへの申し送り

- **Sprint 2:** ジャンルフィルター＋キーワード検索＋一覧表示。`GET /api/cases` にクエリパラメータ（`subcategory`, `q`）を追加するのがよい
- トップページは件数表示が中心 → Sprint 2 で検索UI中心のレイアウトに置き換えることになる（現状の `page.tsx` は上書き想定）
- データは依然としてサンプルなので、Sprint 2 の検証も「表示と絞り込みが動くこと」が中心。実データ差し替えは別タスク
- モバイル幅（iPhoneサイズ）での崩れチェックも Sprint 2 の評価時に合わせて行う

## 開発ルールへの学び（CLAUDE.txt に反映済）

- Tailwind CSS は v3.4.x を使う（v4 は oxide/postcss バージョン不整合でビルドが落ちる既知バグあり）
- 開発プロジェクトには必ず `start.command` を同梱し、package.json mtime > node_modules のときは自動で rm & 再インストール
- エラーが出たらまず Claude in Chrome で自分で画面・コンソール・ネットワークを見にいく
