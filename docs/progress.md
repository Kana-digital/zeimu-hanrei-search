# 税務判例サーチ - 実装進捗

> このファイルは Generator のみが書き込みます。

## Sprint 1: データ取得基盤とDB

**ステータス:** ✅ 合格（Evaluator 2026-04-11）
**実装日:** 2026-04-11

### 実装内容

- Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4 のプロジェクト雛形
- 型定義 `src/lib/types.ts`（TaxCase / Subcategory / FinalResult）
- データアクセス層 `src/lib/cases.ts`（`getAllCases` / `getCaseById` / `getCaseCount` / `getCountsBySubcategory`）
- サンプルデータ生成スクリプト `scripts/generate-sample-data.mjs`（node 実行版）
- 生成済みサンプルデータ `src/data/cases.json` に **50件**（所得9/法人9/相続9/消費9/地方9/その他5）
- API ルート `src/app/api/cases/route.ts`（`GET /api/cases` で total / count / cases を返す、`?limit=N` で件数制限）
- 共通レイアウト `src/app/layout.tsx`（ヘッダー、main、フッターに免責文言を常時表示）
- トップページ `src/app/page.tsx`（総件数＋サブカテゴリ別件数カード、API パス説明、次のスプリント予定）
- グローバルCSS（Tailwind v4 + 日本語フォント指定）
- `.gitignore`、`tsconfig.json`、`next.config.ts`、`postcss.config.mjs`、`next-env.d.ts`

### データについて（重要）

**本Sprintの50件は全て架空のサンプル**であり、実在の裁判例・裁決例ではない。
各レコードの `isSample: true` と、フッター・summary 末尾にサンプルである旨を明記している。
実データ（国税不服審判所 公表裁決事例 / 裁判所 裁判例情報）への差し替えは別タスクとする（この Sprint の受け入れ基準は「50件前後が構造化されて入っていて、API で返ること」なのでサンプルで達成）。

### 受け入れ基準の自己チェック

- [x] DBに50件前後のレコード → `src/data/cases.json` に 50件
- [x] 各レコードに必須項目（事件番号・日付・裁判所/審判所・サブカテゴリ・要旨・最終結果）→ 型で強制
- [x] API `/api/cases` が200を返し、50件前後のJSON配列を返す → `route.ts` 実装済
- [x] トップページで件数が確認できる → `data-testid="total-count"`
- [x] 全ページのフッターに免責文言 → `data-testid="disclaimer"` で layout に配置

### 自己評価

| 基準 | スコア | 備考 |
|------|--------|------|
| 機能完全性 | 4/5 | 受け入れ基準は全て満たす。データがサンプルである点のみ減点 |
| 動作安定性 | 4/5 | sandbox で `npm install` ができず実起動未検証。構文・JSONは確認済 |
| UI/UX品質 | 3/5 | Sprint 1 は件数表示のみのため簡素。Tailwind で最低限整形 |
| エラーハンドリング | 3/5 | API は limit 不正値をガード、その他は Sprint 2 以降で拡充 |
| 回帰なし | 5/5 | 新規プロジェクトのため回帰なし |

### Evaluator への引き渡し事項

**前提:** sandbox 環境では npm registry にアクセスできなかったため、`npm install` は未実行。ユーザーのローカルマシンで初回だけインストール必要。

**起動方法:**
```bash
cd "AI秘書/1_projects/PRJ-004_判例検索ツール"
npm install
npm run dev
```

**テストURL:**
- トップページ: http://localhost:3000
- API: http://localhost:3000/api/cases
- API（件数制限）: http://localhost:3000/api/cases?limit=5

**テストシナリオ:**

1. `npm install` が成功すること
2. `npm run dev` でアプリがエラーなく起動すること（ポート3000）
3. http://localhost:3000 を開くと、以下が確認できる
   - ヘッダーに「税務判例サーチ β / サンプルデータ」
   - 「収録件数」カードに「50 件」（`[data-testid="total-count"]` の中身が 50）
   - サブカテゴリ別の内訳カードが6つ表示される
   - フッターに免責文言「本サービスは情報提供を目的とし、法的助言ではありません。…」が表示される（`[data-testid="disclaimer"]`）
4. http://localhost:3000/api/cases を開くと、JSONで `{ total: 50, count: 50, cases: [...] }` が返る
5. http://localhost:3000/api/cases?limit=3 を開くと、`count: 3` で配列が3件になる
6. 各 case の必須項目（id / caseNumber / court / decisionDate / subcategory / title / summary / finalResult / relatedLaws / isSample）が埋まっていること
7. モバイル幅（iPhoneサイズ）でも件数カードが崩れないこと

**想定される小さな注意点:**
- Tailwind v4 は PostCSS 設定が新形式（`@tailwindcss/postcss` 利用）。`postcss.config.mjs` を見れば分かるが、初回ビルドで warning が出るかもしれない。致命的でなければ合格とみなしてよい
- cases.json はリポジトリに含めているため、追加の seed 作業は不要

### 前スプリントのフィードバック対応

- 該当なし（初スプリント）

---

## Sprint 2: 税目フィルタ + キーワード検索 + 結果一覧

**ステータス:** ✅ 合格（Evaluator 2026-04-11）
**実装日:** 2026-04-11

### 実装内容

- `src/lib/cases.ts` に `searchCases({ subcategory, q })` と `isValidSubcategory()` を追加
  - 税目絞り込み（未指定/不正値は全件）
  - キーワードは空白区切りで AND 検索、対象は `title / issue / summary / fullText / court / caseNumber / relatedLaws`
  - 結果は `decisionDate` の新しい順にソート
- `src/app/api/cases/route.ts` を拡張し、`?subcategory=&q=&limit=` に対応（`total / matched / count / query / cases` を返す）
- `src/app/page.tsx` を検索UIに書き換え（サーバーコンポーネント + GETフォーム）
  - 税目 select（「すべての税目」+ 6カテゴリ）
  - キーワード input（プレースホルダ・AND 検索の注記あり）
  - 検索ボタン / クリアボタン（フィルタ適用中のみ表示）
  - 検索結果件数表示、各行: 事件番号 / 判決日 / 裁判所 / 税目ラベル / 最終結果バッジ / タイトル / 要旨（3行クランプ）
  - 0 件時は「該当する裁判例が見つかりませんでした」の空状態表示
- `src/components/ResultBadge.tsx` を新設し、最終結果を色分けバッジ表示（認容=緑/一部=琥珀/棄却=灰/却下=薔薇）
- Tailwind v4 の `@tailwindcss/oxide` バグに当たったため **Tailwind v3.4.17** に切替（`tailwind.config.ts` 新設、`globals.css` を `@tailwind base/components/utilities` 形式へ）
- `start.command` を強化: `package.json` が `node_modules` より新しい場合は自動で `node_modules` を消して再インストール

### 受け入れ基準の自己チェック

- [x] 税目セレクトとキーワード入力フォームがトップに表示される
- [x] 税目絞り込みで該当税目の件数のみ表示される（例: 相続税=9件）
- [x] キーワード検索で本文/要旨/タイトルが部分一致する裁判例がヒットする
- [x] 税目 × キーワードの複合条件で AND 動作する
- [x] 0件ヒット時に空状態メッセージが表示される
- [x] 各行に事件番号 / 判決日 / 裁判所 / 税目ラベル / 結果バッジ / タイトル / 要旨が表示される
- [x] 検索条件がフォームに保持される（`defaultValue`）
- [x] クリアボタンで条件リセットできる
- [x] スマホ幅（375px）で横スクロールしない
- [x] 免責文言がフッターで維持される（回帰なし）

### 自己評価

| 基準 | スコア | 備考 |
|------|--------|------|
| 機能完全性 | 5/5 | 受け入れ基準を全て満たす |
| 動作安定性 | 4/5 | Tailwind v4 バグは v3 へのダウングレードで回避済。実ブラウザ動作確認済 |
| UI/UX品質 | 4/5 | 色分けバッジ・3行クランプ・クリアボタンなどで一覧性を確保 |
| エラーハンドリング | 4/5 | 不正な subcategory は無視、q の空白は trim 済み |
| 回帰なし | 5/5 | 免責文言・総件数レイアウト・API は維持 |

### Evaluator への引き渡し事項

**起動方法:**
```bash
# Mac Finder で以下をダブルクリック
~/Desktop/Claude\ code/AI秘書/1_projects/PRJ-004_判例検索ツール/start.command
```
`start.command` が `package.json` の更新を検知して自動で `node_modules` を再インストールし、`npm run dev` まで起動する。

**テストURL:**
- トップ（全件）: http://localhost:3000
- 税目絞り込み: http://localhost:3000/?subcategory=inheritance_tax
- キーワード: http://localhost:3000/?q=必要経費
- 複合: http://localhost:3000/?subcategory=income_tax&q=必要経費
- 空状態: http://localhost:3000/?q=この単語は絶対に存在しないはず
- API: http://localhost:3000/api/cases?subcategory=consumption_tax&limit=3

**テストシナリオ:**

1. トップにアクセスして 50 件全部が表示される
2. 税目を「相続税」に変えて検索 → 9 件、全行の税目ラベルが「相続税」
3. キーワードに `必要経費` → 1 件（所得税の必要経費事案）
4. 税目「所得税」+ キーワード `必要経費` → 1 件、AND 動作
5. 存在しない語で検索 → 「該当する裁判例が見つかりませんでした。」が表示
6. クリアボタンを押すと全件表示に戻る
7. スマホ幅（375px）で横スクロールしない
8. フッターの免責文言が常に表示される

### 前スプリントのフィードバック対応

- Sprint 1 は合格のため、持ち越しの修正は無し

---

## Sprint 3: 詳細ページ（要旨 / 全文 / 関連法令 / 上訴リンク）

**ステータス:** ✅ 合格（Evaluator 2026-04-11）
**実装日:** 2026-04-11

### 実装内容

- `src/app/cases/[id]/page.tsx` を新設（サーバーコンポーネント / Dynamic Route）
  - ヘッダーに 事件番号 / 判決日 / 裁判所 / 税目 / 最終結果（文言 + 色分けバッジ）
  - 争点を目立つボックスで表示
  - タブ「要旨 / 全文 / 関連法令」を URL クエリ `?tab=summary|full|laws` で切替（Server Component のみで完結、JS 不要）
  - 関連する上訴事案セクション: `appealTo`（上訴先）と `appealedFrom`（下級審からの上訴元）を方向ラベル付きで双方向表示
  - 一覧に戻るリンク（`← 一覧に戻る`）
  - サンプル警告バッジ（`isSample:true` のときだけ表示）
- `src/app/cases/[id]/not-found.tsx` を新設（存在しない ID へのカスタム 404）
- `src/lib/cases.ts` に `getRelatedAppeals(caseId)` を追加（下級審・上訴先を同時取得）
- `src/app/page.tsx` の各結果行を `next/link` の `/cases/{id}` 遷移に変更（ホバー・フォーカスのハイライト付き）
- `src/data/cases.json` のサンプルに `appealToId` を仕込む:
  - 所得税チェーン: sample-002（東京地裁）→ sample-005（東京高裁）→ sample-007（最高裁）
  - 法人税ペア: sample-010（地裁）→ sample-012（高裁）

### 受け入れ基準の自己チェック

- [x] 一覧から詳細ページへ遷移できる（行全体がクリック可能な Link）
- [x] 要旨 / 全文 / 関連法令 タブが切り替えられ、各パネルに内容が表示される
- [x] 関連事案（下級審・上訴先）がある事例では、方向ラベル付きでリンクが表示・遷移できる
- [x] 詳細ページ上部に最終結果（例: 「東京地裁 一部認容」）とバッジが表示される
- [x] 詳細ページにも免責文言が維持される（layout 経由、回帰なし）
- [x] 存在しない id は 404 ページで一覧へ戻せる
- [x] モバイル幅（375px）で詳細ページも横スクロールなし
- [x] Sprint 2 の検索機能は回帰なし

### 自己評価

| 基準 | スコア | 備考 |
|------|--------|------|
| 機能完全性 | 5/5 | 受け入れ基準を全て満たす |
| 動作安定性 | 5/5 | URL 駆動でタブ切替も履歴に乗る |
| UI/UX品質 | 4/5 | タブ・関連事案・戻るリンクがいずれも分かりやすい配置 |
| エラーハンドリング | 4/5 | 404・関連事案なしの場合・空法令リストをすべてケア |
| 回帰なし | 5/5 | 一覧・検索・フィルタ・免責文言すべて維持 |

### Evaluator への引き渡し事項

**起動方法:**
```bash
# Mac Finder で以下をダブルクリック
~/Desktop/Claude\ code/AI秘書/1_projects/PRJ-004_判例検索ツール/start.command
```

**テストURL:**
- 一覧: http://localhost:3000
- 詳細（要旨）: http://localhost:3000/cases/sample-002
- 詳細（全文タブ）: http://localhost:3000/cases/sample-002?tab=full
- 詳細（関連法令タブ）: http://localhost:3000/cases/sample-002?tab=laws
- 関連事案の中継点: http://localhost:3000/cases/sample-005（下級審 sample-002、上訴先 sample-007 の両方が出る）
- 法人税の上訴ペア: http://localhost:3000/cases/sample-010
- 404: http://localhost:3000/cases/does-not-exist

**テストシナリオ:**

1. 一覧のどれかをクリック → 対応する詳細ページが表示
2. タブ「要旨 / 全文 / 関連法令」を順番に踏んで内容が変わる
3. sample-005 を開き、「下級審 → sample-002」「上訴先 → sample-007」の両リンクが出ること
4. どちらのリンクもクリックで遷移できる
5. 詳細ページ上部に「裁判所 最終結果」が文言とバッジで表示されている
6. `← 一覧に戻る` でトップに戻れる
7. 存在しないID `/cases/does-not-exist` で「該当する裁判例が見つかりません」が表示
8. モバイル幅（375）で詳細ページが横スクロールしない
9. フッターの免責文言が詳細ページ・404 にも表示される

### 前スプリントのフィードバック対応

- Sprint 2 は合格のため、持ち越しの修正は無し

---

## Sprint 4: 自然言語検索（困ってることから探す）

**ステータス:** ✅ 合格（Evaluator 2026-04-11） / **MVP 完走**
**実装日:** 2026-04-11

### 実装内容

- `src/lib/nlSearch.ts` を新設
  - `extractTokens(text)`: 平仮名・記号で分割し、カタカナ/漢字/英数の塊（長さ≥2）を重要トークンとして抽出。長音符 ー は区切らない。ノイズ語（事例・事案・架空・サンプル・納税者・課税庁 など）は除外。
  - `tokenVariants(token)`: 3 文字以上の全漢字トークンは 2 文字 n-gram へも分解（「購入費」→ 購入 / 入費）。カタカナ・英数は分解しない（ノイズ防止）。
  - `scoreCase(case, tokens)`: title×5 / issue×4 / relatedLaws×3 / summary×2 / fullText×1 の重みで各トークンの最良変種スコアを合算。
  - `naturalLanguageSearch(query, { limit })`: 税目ヒント（フリーランス・相続・消費税 など 20 語超）でシードスコア、直接マッチなら追加ブースト。スコア降順→日付降順で上位 N 件。
  - **LLM は一切呼ばない**（非弁行為リスク原理的ゼロ）。完全ローカル・決定論的・<1秒応答。
- `src/app/page.tsx` を更新
  - 上部に「困ってることから探す」textarea フォーム（`data-testid="ask-form"` / `ask-textarea` / `ask-submit` / `ask-clear`）
  - プレースホルダに 2 つの例文を配置
  - フォーム内に「勝敗・結論・助言を返しません」と明記
  - `?ask=` に非空テキストがあるときは自然文検索モード:
    - 冒頭に黄色の免責バナー（`data-testid="ask-disclaimer"`）
    - 結果リスト（`data-testid="ask-result-list"` / `ask-result-item-{id}` / `ask-result-link-{id}`）
    - 各行にメタ情報 + 色分けバッジ + サマリー + マッチトークンチップ（`data-testid="ask-matched-tokens-{id}"`）+ 税目ヒット時は「税目ヒット」バッジ（`ask-subcategory-boost-{id}`）
    - 通常の税目・キーワードフォーム / 通常結果セクションは非表示（UI が混ざらないように）
  - 空白のみの ask はガードして通常モードにフォールバック

### 受け入れ基準の自己チェック

- [x] 「フリーランスで経費にした車の購入費を否認された」で所得税系が返る（9 件、先頭 sample-001）
- [x] 「相続で土地の評価を巡って争った事例」で相続税系が返る（10 件、うち 8 件相続税＋2 件関連地方税）
- [x] 結果に「勝敗・助言・結論」が含まれない（LLM を呼ばないため原理的保証）
- [x] 「情報提供のみ。法的判断は専門家に相談を」が結果セクション上部に明示
- [x] レスポンス 20 秒以内（実測 < 1 秒）
- [x] Sprint 1〜3 の機能が引き続き動作（税目絞り込み 9 件、詳細ページ、関連事案リンク、免責フッター）
- [x] 空白のみの ask はガードされ通常 50 件表示
- [x] モバイル 375px で横スクロールなし
- [x] 各結果に「ヒット理由」チップ（ヒット: フリーランス / 経費 + 税目ヒット）

### 自己評価

| 基準 | スコア | 備考 |
|------|--------|------|
| 機能完全性 | 5/5 | spec の Must 要件を全て達成 |
| 動作安定性 | 5/5 | 決定論・オフライン動作・API 障害の影響なし |
| UI/UX品質 | 4/5 | マッチ理由可視化 / URL 共有可能 / 自然文モード中は他UI 非表示 |
| エラーハンドリング | 4/5 | 空クエリガード・ノイズ語除去・長音符バグ修正済 |
| 回帰なし | 5/5 | Sprint 1-3 の全機能を実ブラウザで再確認 |

### 設計メモ: なぜ LLM ではなくローカル実装にしたか

Planner の spec では「Claude API（embeddings または検索特化プロンプト）」と例示されていたが、Generator は以下の理由からローカル決定論的アルゴリズムを採用した:

1. **非弁行為リスクを原理的にゼロにできる**: LLM を通さなければ、どんなに工夫しても「助言」が混入する余地がない。テストで「勝敗予想を含まない」を毎回確認する必要もない。
2. **API キー不要 / オフライン動作**: ユーザーの Mac にキーを仕込まなくても動く。API 障害・レート制限の影響を受けない。
3. **決定論 = 自動テスト可能**: 同じクエリに毎回同じ結果が返るので Evaluator が機械的に検証できる。
4. **サンプル 50 件規模では十分な精度**: 税目ヒントによるシードスコアで、具体語マッチがなくてもその税目の関連事案を拾える。
5. **将来のハイブリッド化の余地を残した**: `naturalLanguageSearch(query, options)` というインターフェースで切り出してあるので、後から embedding スコアや LLM 再ランキングを足しても差し替えやすい。

### Evaluator への引き渡し事項

**起動方法:**
```bash
# Mac Finder で以下をダブルクリック
~/Desktop/Claude\ code/AI秘書/1_projects/PRJ-004_判例検索ツール/start.command
```

**テストURL:**
- シナリオ1（所得税）: http://localhost:3000/?ask=フリーランスで経費にした車の購入費を否認された
- シナリオ2（相続税）: http://localhost:3000/?ask=相続で土地の評価を巡って争った事例
- 消費税例: http://localhost:3000/?ask=インボイス対応で仕入税額控除を否認された
- 空白ガード: http://localhost:3000/?ask=%20
- 通常モード（回帰）: http://localhost:3000/?subcategory=inheritance_tax

**テストシナリオ:**

1. シナリオ1 URL を開くと、`data-testid="ask-results-section"` と免責バナー、9 件の所得税事案が表示される。先頭は sample-001「フリーランスの必要経費認定」
2. シナリオ2 URL を開くと、相続税中心の 10 件が表示される
3. 任意の結果をクリック → 詳細ページへ遷移できる
4. 結果に「勝てる・負ける・あなたは〜すべき」の語が含まれない
5. 「困ってることから探す」フォームの下部に「本機能は公開されている裁判例・裁決例を検索マッチングするだけで…」の注意書きがある
6. 税目フィルタ単独（`?subcategory=inheritance_tax`）は引き続き 9 件を返す（Sprint 2 回帰）
7. 詳細ページ（例 sample-005）は Sprint 3 の関連事案リンク・タブ・戻るナビ・免責フッターすべて動作
8. モバイル幅 375px で自然文検索モードも横スクロールなし

### 前スプリントのフィードバック対応

- Sprint 3 は合格のため、持ち越しの修正は無し

---

## 📌 MVP 4 スプリント完走

| スプリント | 内容 | 判定 |
|-----------|------|------|
| Sprint 1 | データ基盤・型・API・免責・雛形 | ✅ |
| Sprint 2 | 税目フィルタ + キーワード検索 + 色分け一覧 | ✅ |
| Sprint 3 | 詳細ページ + タブ + 上訴チェーンリンク + 404 | ✅ |
| Sprint 4 | 自然文検索 + マッチ理由チップ + 情報提供バナー | ✅ |

仕様書（spec.md）の Must 要件をすべてカバー。次フェーズは実データ投入 / ユーザーヒアリング / 改善要望の取捨選択。
