# Subako Hackathon 2026-09-14

普通の React アプリに、[Subako](https://subako.ai) のエージェントを組み込むハッカソンの教材です。
進め方の全体は[スライド](https://subako-ai.github.io/subako-hackathon-2026-09-14-slides/)にあります。このファイルは、手を動かすときに横に置く早見表です。

## 3 つのコマンド

CLI でログインし、`.env.local` に API キーとモデルを入れたあと、どのアプリも同じ 3 つで動きます。`<app>` は下の表の名前です。

```sh
npm install --workspace @hackathon/<app> \
  @subako-ai/sdk@0.1.1 @subako-ai/react@0.1.1 @subako-ai/assistant-ui@0.1.1 \
  @assistant-ui/react@0.15.19 @assistant-ui/react-markdown@0.14.15 zod@4.6.4
npm run agent:publish -- <app>
npm run dev -- <app>
```

publish は `agents/<app>/prompt.md` と `mcp.json` を Subako に登録し、`.env.local` の `SUBAKO_AGENT_*` を書き換えます。開発サーバーを動かしたまま publish したら、`Ctrl+C` で止めて `npm run dev` をやり直してください。

| `<app>` | 何か | ポート | prompt | 会話の保存キー |
| --- | --- | --- | --- | --- |
| `todo` | ハンズオンで使うスターター | 5173 | `agents/todo/prompt.md` | `hackathon:session:todo:<baseUrl>` |
| `todo-integrated` | TODO の完成例 | 5174 | `agents/todo-integrated/prompt.md` | |
| `ec` | ハックタイム用スターター（EC） | 5177 | `agents/ec/prompt.md` | `hackathon:session:ec:<baseUrl>` |
| `ec-coffee` | EC の完成例（コーヒー豆） | 5178 | `agents/ec-coffee/prompt.md` | |
| `map` | ハックタイム用スターター（マップ） | 5175 | `agents/map/prompt.md` | `hackathon:session:map:<baseUrl>` |
| `map-coffee` | マップの完成例（渋谷のコーヒー店） | 5176 | `agents/map-coffee/prompt.md` | |

Codespaces では、ポートは Ports タブから開きます。ローカルは `http://127.0.0.1:<ポート>` です。

## TODO（ハンズオン）

`apps/todo/src/App.tsx` の TODO ①〜⑥ を上から外します。④ の `set_todo_done` だけ雛形が無いので、③ の `useTool` を真似て書きます。⑥ は `<p>` と、JSX コメントの始まり `{/*` と終わり `*/}` の行を消します。

## EC / マップ（ハックタイム）

EC・マップの `App.tsx` にも TODO ①〜⑥ のコメントがあり、どこに何を書くかと、呼ぶ既存関数を示しています。**コードは載せていないので、自分で書いた TODO 版の `App.tsx` を横に置いて組み立てます。** 行き詰まったら完成例（`ec-coffee` / `map-coffee`）を見ます。2 時間の目安は次のとおりです。

| 順 | やること | 目安 | 見るもの |
| --- | --- | --- | --- |
| 1 | 上の 3 コマンドを `ec` か `map` で実行し、手動操作できることを確認 | 10 分 | |
| 2 | ①②⑤⑥ を書き、サイドバーに空の会話を出す | 20 分 | `apps/todo/src/App.tsx`（自分の完成版） |
| 3 | ③ の読むツールを書く。EC は `search_items`、マップは `get_places` | 15 分 | `catalog.getState()` / `app.getState()` |
| 4 | ③ の画面を変えるツールを書く。EC は `show_items`、マップは `show_candidates` | 15 分 | `catalog.showItems(ids)` / `app.showCandidates(ids)` |
| 5 | データを自分の題材に置き換える。項目名は変えず、独自の情報は `metadata` に入れる | 20〜30 分 | `apps/ec/data/catalog.json` / `apps/map/src/data.json` |
| 6 | prompt を書き換えて publish し、画面の「新しいセッション」を押す | 10 分 | `agents/<app>/prompt.md` |
| 7 | ④ の操作ツールを足す。カート、訪問順、固定、比較など | 30 分 | 完成例と [`docs/answers.md`](docs/answers.md) |
| 8 | MCP（Web 検索・天気）、画面文言。18:00 で実装終了 | 残り | `presets/mcp/` |
| 9 | 18:00〜18:15 に 60 秒のデモ動画を撮って提出 | 15 分 | 提出フォーム |

16:30 までに 4 まで動いていれば順調です。実装は 18:00 で止めて、18:00〜18:15 で動画を撮り、フォームから提出します。

- **ツールの `execute` は、画面のボタンが呼んでいる関数をそのまま呼びます。** EC は `useCatalog` が返す `catalog`、マップは `useMapApp` が返す `app` の関数です。
- **現在の状態は `getState()` で読みます。** `catalog.state` や `app.state` は描画時点の値なので、1 回の応答で「操作してから読む」と古い値を返します。
- **マップの出発地は渋谷駅で固定です。** 別の街の地点データにするときは `apps/map/src/domain.ts` の `SHIBUYA_STATION` と表示名も変えます。
- **MCP を足したら publish し直します。** `presets/mcp/exa.json`（Web 検索）か `eris.json`（天気）を `agents/<app>/mcp.json` にコピーし、`npm run agent:publish -- <app>` のあと「新しいセッション」を押します。
- 完成例との差分は [`docs/answers.md`](docs/answers.md) にあります。ツールの一覧、schema の書き方、追加 UI の全文があります。

## 困ったとき

| 見えるもの | 意味 | 直し方 |
| --- | --- | --- |
| `npm run setup の後、.env.local に SUBAKO_API_KEY を入力してください。` | publish がキーを見つけられない | `.env.local` の `SUBAKO_API_KEY=` に `sbk_ak` から始まるキーを貼る |
| サイドバーに「会話を準備できませんでした」 | 開発サーバーが `/__subako/session` を 503 か 502 で返した | ターミナルで `curl -X POST http://127.0.0.1:<ポート>/__subako/session` を叩き、返る日本語のエラーに従う。キーを入れた・publish したあとは開発サーバーを再起動 |
| `先に npm run agent:publish を実行してください。` | `.env.local` の `SUBAKO_AGENT_*` が空 | `npm run agent:publish -- <app>` のあと再起動 |
| 「接続できません。agentのOrigin設定と開発サーバーを確認してください。」 | ブラウザーの Origin が agent に許可されていない | 開いている URL が上の表のポートか確認。別 Origin で開くなら `.env.local` の `SUBAKO_EXTRA_ORIGINS` に足して `npm run agent:origins -- <app>` |
| `指定モデルはこのproviderの一覧にありません。` | `SUBAKO_MODEL_ID` の綴り違い | `npm run agent:models` の一覧から `crow` / `hawk` / `sparrow` を選ぶ |
| prompt を変えたのに会話が変わらない | 既存のセッションは古い version のまま | publish のあと「新しいセッション」を押す |
| データ JSON を変えたのに画面が変わらない | 前の操作状態が `localStorage` に残っている | DevTools の Application → Local Storage で `subako-hackathon:ec:v1` / `hackathon-map-v1` を消して再読み込み |
| `Property 'getState' does not exist` | 完成例のツールを古いスターターに貼った | `useCatalog.ts` / `use-map-app.ts` の `getState` を確認する |

`npm run check` で型・テスト・ビルドをまとめて確認できます。
