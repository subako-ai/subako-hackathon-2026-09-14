# Subako Hackathon · 渋谷 · 2026年9月14日

普通のReactアプリにエージェントを組み込み、自分のアイデアを60秒のデモにします。**まず16:30までに動くものを作り、18:10までに動画を提出しましょう。** 参加者用の手順と記入欄は、このREADMEにまとめています。

Vite + React 19 + TypeScript / npm workspaces / 生CSS。Node.js **22.12以上**を使います。GitHub Codespacesなら、ローカルへのNode.jsのインストールは不要です。

## 6つのアプリ

| アプリ | 内容 | 起動コマンド | ポート |
| --- | --- | --- | --- |
| `todo` | 汎用TODO 3件。追加・完了・削除。SDK連携を自分で追加する入口 | `npm run dev -- todo` | 5173 |
| `todo-integrated` | TODOにチャットと3つのclient toolを組み込み済み | `npm run dev -- todo-integrated` | 5174 |
| `map` | 架空の地点A〜D。候補選択・訪問順を用意 | `npm run dev -- map` | 5175 |
| `map-coffee` | 渋谷周辺の実在6店舗とSubako連携。コーヒー屋巡りの完成例 | `npm run dev -- map-coffee` | 5176 |
| `ec` | 汎用の商品A〜D。比較・カートを用意 | `npm run dev -- ec` | 5177 |
| `ec-coffee` | 渋谷の街を題材にしたデモの豆10種類とSubako連携。バンドル購入の完成例 | `npm run dev -- ec-coffee` | 5178 |

スターターには、特定の題材に寄せない初期データを入れています。TODOは「資料を確認する」など3件、ECは価格・在庫が異なる商品4件、Mapは渋谷周辺の座標に置いた架空の地点4件です。各itemの `metadata` も編集例として使えます。データを変更するときは、ソース内のJSONファイルを編集します。

| スターター | 初期データ |
| --- | --- |
| TODO | [`apps/todo/src/data.json`](apps/todo/src/data.json)（連携版にも同じ内容をコピー） |
| EC | [`apps/ec/data/catalog.json`](apps/ec/data/catalog.json) |
| Map | [`apps/map/src/data.json`](apps/map/src/data.json) |

JSONファイルは、ブラウザーに保存データがないときに使う初期データです。TODO・カート・訪問リストなどの操作状態は `localStorage` に保存され、再読み込み後も引き継ぎます。JSONを編集しても、保存済みのデータは自動で上書きされません。

各アプリは、自分の `src/` に画面・状態管理・CSSを持つ普通のReactアプリです。`todo`・`map`・`ec` にはSDKへの依存も、ツールの定義もありません。ボタンやフォームから使う関数を読んでから、連携する側で「どの操作をAIに任せるか」を決めます。

`todo-integrated` は `todo` のコピーにSubako連携を足したものです。`map-coffee`・`ec-coffee` も、それぞれのアプリをコピーし、コーヒーのデータと連携を足しています。画面のコードも各アプリに置いているので、完成例との差分を見ながら自分のアプリを編集できます。完成例もキー未設定で手動操作できます。

ECの完成例では、コピー先の `CatalogView.tsx` と `style.css` を編集してコーヒー向けの文言・商品イラストにしています。

コーヒーのデータ、保存済みの徒歩経路、作品名などは、題材に合わせた通常のアプリ改修です。Subakoを導入するための準備ではありません。自分のデータ・画面・状態管理を残したまま連携できます。

完成例とテンプレートでポートや保存キーが違うのは、6つのアプリを並べて動かすためです。実際のアプリへSubakoを導入するときは、既存のポート・保存キーを保持し、そのOriginを許可します。

`@hackathon/todo` などは、npmコマンドで対象アプリを選ぶための名前です。アプリ同士で読み込む共通ライブラリはありません。

自分の既存アプリへの導入でも、**アカウント・workspaceとAPIキーを用意 → promptを決めてagentをpublish → アプリのOriginを許可してsessionを作成 → SDKをインストール → 既存の操作を`useTool`で登録 → チャットを表示**、という流れです。この教材ではpublish・Origin・sessionの準備をスクリプトにまとめています。既存の画面や状態管理を、エージェント用に作り直す必要はありません。

スターターと完成例の差分で答え合わせをする場合は、[解答編：スターターから完成例への差分](docs/answers.md)を開いてください。TODO・EC・Mapの実際のdiffと、ツールが既存のどの関数を呼ぶかをまとめています。

## 1. CLIをダウンロードしてアカウントを作る（事前準備）

Codespacesを使う場合は、このリポジトリを自分のアカウントにコピーし、GitHubの **Code → Codespaces** から開いてください。初回は **Subako CLIのインストール、`npm ci`、設定ファイルの準備** が自動で実行されます。セットアップ完了後、ターミナルで `subako --version` を確認し、下のアカウント登録へ進んでください。

ローカルのmacOS / Linuxで使う場合は、CLIをインストールします（Codespacesでは不要です）。

```sh
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/subako-ai/subako-cli/releases/latest/download/subako-cli-installer.sh | sh
subako --version
```

コマンドが見つからない場合は、新しいターミナルを開いてください。[公式配布ページ](https://github.com/subako-ai/subako-cli/releases)から直接ダウンロードすることもできます。Windowsでローカル開発する場合は同ページのPowerShellインストーラーを使えますが、教材の標準手順はCodespacesです。

既存のCodespaceにこの設定を反映する場合は、コマンドパレットから **Codespaces: Rebuild Container** を実行します。セットアップの再実行は `bash .devcontainer/post-create.sh` でもできます。導入済みのCLIと既存の `.env.local` は保持します。

`your-unique-handle` は自分用の一意の組織名に置き換えます。表示された認証URLをブラウザーで開いて、登録を完了してください。

```sh
subako cloud signup --org your-unique-handle --name "Subako Hackathon"
subako login --org your-unique-handle
subako whoami
subako workspace create --name hackathon
subako workspace use hackathon
subako model-provider list
subako org credits
```

既存アカウントで参加する人は、使う組織へログインし、既存のworkspaceを選んでも構いません。モデル一覧と利用クレジットを確認し、不足があれば運営に相談してください。

続いて教材用のAPIキーを作ります。以下の期限はイベント翌日の日本時間0時です。

```sh
subako api-key mint \
  --label "hackathon-2026-09-14" \
  --permission agent.read \
  --permission agent.publish \
  --permission model_provider.read \
  --permission session.create \
  --permission session.read \
  --permission session.manage \
  --expires-at 2026-09-15T00:00:00+09:00
```

最後に表示されるキーは一度だけ取得できます。次の `.env.local` に貼り付けます。CLIのログイン情報とアプリ用APIキーは、それぞれの認証に使います。

## 2. Reactアプリを起動する

リポジトリのルートで実行します。Codespacesの初回準備で済んでいれば、`npm install` は省略できます。

```sh
npm install
npm run setup
```

作成された **ルートの `.env.local`** を開き、値を入れます。

```dotenv
SUBAKO_API_KEY=発行した教材用キー
VITE_SUBAKO_BASE_URL=https://api.us.cloud.subako.ai
SUBAKO_MODEL_PROVIDER_ID=一覧から運営指定のprovider ID
SUBAKO_MODEL_ID=そのproviderにあるモデルID
SUBAKO_MODEL_FORMAT=
SUBAKO_MODEL_CONTEXT_WINDOW=128000
```

`SUBAKO_API_KEY` に `VITE_` が付かないのは、**このキーを開発サーバーだけが使う**からです。ブラウザーへ渡るのは `VITE_` で始まる変数だけなので、キーは画面に出ません。

`SUBAKO_MODEL_FORMAT` は空のままでproviderの形式を使います。context windowの128000はCLIの設定例と同じ初期値で、運営指定があれば変更してください。一覧は `npm run agent:models` でも確認できます。

`VITE_` の値はフロントエンドへ渡ります。この教材では実験用APIキーを使う前提です。`.env.local`・生成設定の `.hackathon/`・ビルド結果は `.gitignore` で除外しています。

```sh
npm run dev -- todo
```

ローカルなら `http://127.0.0.1:5173`、CodespacesならPortsの5173を新しいタブで開きます。キーが空でもTODOの手動操作はできます。

- [ ] TODOの追加・完了ができた。
- [ ] CLIにログインでき、モデル一覧と利用残高を確認できた。
- [ ] APIキーを `.env.local` に保存した。

## 3. SDKをインストールしてTODOをつなぐ（15:15–15:45）

### 普通のReactアプリを読む

最初の5分で完成デモを見たら、[`apps/todo/src/App.tsx`](apps/todo/src/App.tsx) を開きます。`useState` でTODOを管理し、フォームから追加、チェックボックスから完了にするアプリです。保存には `localStorage` を使っています。

まず `add`・`complete` が、どこから呼ばれているかを探してください。これから追加するエージェントも、この2つの関数を呼びます。TODOの検証処理は隣の [`model.ts`](apps/todo/src/model.ts)、CSSも同じ `src/` にあります。

### SDKをインストールしてpublishする

```sh
npm install --workspace @hackathon/todo @subako-ai/sdk@0.1.1 @subako-ai/react@0.1.1 @subako-ai/assistant-ui@0.1.1 @assistant-ui/react@0.15.19 @assistant-ui/react-markdown@0.14.15 zod@4.6.4
```

これで `apps/todo/package.json` にSDKとZodが追加されます。Zodはツールの引数を定義・検証するために使います。リポジトリ内の完成例ですでに取得済みでも、自分が編集するアプリの依存として登録する操作が必要です。

ルートの `package.json` にもSDKがありますが、これは運営が用意したpublishスクリプトと、任意の新規session作成APIで使います。未連携アプリの画面はSDKを使っていません。

[`agents/todo/prompt.md`](agents/todo/prompt.md) にエージェントの指示があります。内容を読み、別ターミナルで実行します。

```sh
npm run agent:publish -- todo
```

スクリプトがagentの作成・publish・Originの許可を行い、`.env.local` の `SUBAKO_AGENT_TODO` を更新します。会話（session）はここでは作りません。アプリが必要になったときに自分で作ります。起動中のアプリを `Ctrl+C` で止め、同じ起動コマンドで再起動してください。

### 既存の関数を、エージェントから呼べるようにする

会話の出入り口と、見た目を整えるCSSを完成例からコピーします。ルートで実行してください。

```sh
cp apps/todo-integrated/src/session.ts apps/todo/src/session.ts
cp apps/todo-integrated/src/session.css apps/todo/src/session.css
```

[`session.ts`](apps/todo-integrated/src/session.ts) は会話を作り、そのIDを `localStorage` に覚え、接続用のtokenを受け取る部分です。APIキーはブラウザーに無いので、どれも開発サーバーの `/__subako/*` に頼みます。

`App.tsx` にSDKとCSSのimport、クライアントを追加します。

```tsx
import { z } from 'zod';
import { SubakoSessionClient } from '@subako-ai/sdk';
import { SubakoProvider, useSession, useTool, useToolClient } from '@subako-ai/react';
import { SubakoChat } from '@subako-ai/assistant-ui';
import { fetchSessionToken, useSessionId } from './session';
import './session.css';

const baseUrl = import.meta.env.VITE_SUBAKO_BASE_URL || 'https://api.us.cloud.subako.ai';
const sessionStorageKey = `hackathon:session:todo:${baseUrl}`;

// APIキーは持ちません。会話ごとのtokenを開発サーバーから受け取ります。
const subako = new SubakoSessionClient({ baseUrl, getToken: fetchSessionToken });
```

同じファイルに、会話を担当する `TodoAssistant` を追加します。`Todo` は既存の `./model` からimportします。

```tsx
function TodoAssistant({ getItems, add, complete, sessionId }: {
  getItems: () => Todo[];
  add: (title: string) => Todo;
  complete: (id: string, done: boolean) => Todo;
  sessionId: string;
}) {
  const session = useSession(sessionId);
  const client = useToolClient(session, 'todo');

  useTool(client, 'list_todos', {
    description: '現在のTODOを取得する。',
    schema: z.object({}).strict(),
    execute: () => JSON.stringify(getItems()),
  });

  useTool(client, 'add_todo', {
    description: 'TODOを1件追加する。',
    schema: z.object({ title: z.string().max(300).trim().min(1) }).strict(),
    execute: ({ title }) => JSON.stringify(add(title)),
  });

  // 追加が動いたら、ここへ完了ツールを足します。
  return <SubakoChat session={session} />;
}
```

ツールの説明と引数の形は、**連携を追加するここで初めて定義**します。`execute` の中身は、フォームでも使っていた `add(title)` を呼ぶだけです。

`schema` にZodスキーマを渡すと、SDKがAIへ伝える引数の形を生成し、実行前に値を検証します。`execute` の引数の型もスキーマから推論されます。`.strict()` は未定義の引数を拒否する指定です。

`App` の本体に、使う会話のIDを1行足します。保存済みの会話があれば続き、無ければ新しく作ります。

```tsx
const { sessionId } = useSessionId(sessionStorageKey);
```

`App` の `return` で、外側の `app-layout` に `has-session` を追加し、既存の `app-panel` の直後にサイドバーを置きます。既存のTODOの画面はそのまま残します。`getItems`・`add`・`complete` には、`App` 内ですでに使っている関数を渡します。`getItems()` は追加・完了・削除の処理で、現在の一覧を読むために使っている関数です。

```tsx
<div className="app-layout has-session">
  <div className="app-panel">
    <div className="app-content">
      {/* 既存のTODO画面をそのまま残します。 */}
    </div>
  </div>
  <aside className="session-sidebar" aria-label="TODOアシスタント">
    <header><h2>TODOアシスタント</h2></header>
    <div className="session-content">
      {sessionId ? (
        <SubakoProvider client={subako}>
          <TodoAssistant getItems={getItems} add={add} complete={complete} sessionId={sessionId} />
        </SubakoProvider>
      ) : (
        <p>会話を準備しています…</p>
      )}
    </div>
  </aside>
</div>
```

追加した [`session.css`](apps/todo-integrated/src/session.css) が、アプリと会話を別々にスクロールできる領域へ分けます。

追加が動いたら、`TodoAssistant` の `return` より前に、完了ツールを足しましょう。

```tsx
useTool(client, 'set_todo_done', {
  description: '一覧で取得したidのTODOを完了・未完了にする。',
  schema: z.object({ id: z.string(), done: z.boolean() }).strict(),
  execute: ({ id, done }) =>
    JSON.stringify(complete(id, done)),
});
```

- [ ] 「サンプルを起動する、テーマを決める、発表を練習する、を追加して」で3件増えた。
- [ ] 「サンプルを起動する、は完了した」で該当するTODOが完了した。
- [ ] 別のTODOを手で完了にしてから「残りを教えて」と聞くと、その変更が反映された。

完成例は [`apps/todo-integrated/src/App.tsx`](apps/todo-integrated/src/App.tsx) です。TODOの画面・状態・操作関数を残したまま、SDKの初期化、ツールの登録、会話の表示を追加しています。接続エラーの表示や「新しいセッション」ボタンも含めて比較できます。完成例を動かす場合は、`npm run agent:publish -- todo-integrated` と `npm run dev -- todo-integrated` を使います。

ここまでが最小の導入です。完成例にある接続エラー表示、ツール結果の表示調整、新しいセッションのボタンは追加のUIです。後から必要なものを足せます。セッション切り替えの追加手順は「5. 試し直す・録画する」にあります。

### 会話を試し直す

会話履歴はSubakoに保存され、リロードでは同じセッションを再開します。完成例の「新しいセッション」を押すと、空の会話に切り替わります。TODO・カート・訪問リストは引き継がれ、以前の会話もサーバーからは削除しません。応答中は、応答が終わるかチャットの停止ボタンを押してから切り替えます。

完成例では会話の出入り口を各アプリの `src/session.ts`、表示と操作を `src/SessionControls.tsx` に置いています。会話のIDはブラウザーの `localStorage` に保存するので、リロードしてもタブを閉じても同じ会話を再開します。

会話は作られた時点のagentのversionに結び付きます。`prompt.md` を直して publish し直したら、**「新しいセッション」を押して会話を作り直してください**。押すまでは前の指示のまま続きます。

複数の完成例を準備するときは、すべてのpublishを済ませてから会話を始めてください。共通の `.env.local` を更新すると、起動中の他アプリも再読み込みされます。同じsessionを複数タブで開くと各タブのツールが登録されるため、操作するタブはアプリごとに1つにしましょう。

## 4. 自分の題材で作る（15:45–17:55）

### 作品例を見て、最初の10分で仮決めする

| | 豆のバンドル購入 | コーヒー屋巡り |
| --- | --- | --- |
| 最初の相談 | 「酸味控えめが好き。3,000円以内で3種類のセットを作って」 | 「渋谷駅から90分で、雰囲気の違う2軒を回りたい」 |
| 見せる変化 | 豆の候補・カート・合計が変わる | 地図の候補・訪問順・徒歩ルートが変わる |
| もう一往復 | 「1種類だけ、普段選ばないものにして」 | 人が1軒を固定し、「この店は残して短くして」 |

ECは渋谷のエリアを題材にした**架空の商品・価格**です。実店舗での販売や決済は行いません。マップは公式情報を調べた実在6店舗です。道路に沿う徒歩経路は事前取得したデータを使用し、営業時間・混雑のリアルタイム情報は持ちません。[出典と確認条件](docs/references.md)

| 決めること | 自分たちの案 |
| --- | --- |
| チーム名・メンバー／作品名 | |
| ECかマップか／誰が使うか | |
| ユーザーが最初に伝える一文 | |
| AIに何を判断させ、画面をどう変えたいか | |
| 判断に必要なデータ項目を3つ | |

コーヒーを改良しても、自分の業界へ置き換えても構いません。メーカーなら製品の比較や拠点巡り、広告代理店なら広告メニューの組み合わせや会場下見などにできます。

### データを用意する（15:55–16:10）

EC・マップの初期データを自分の題材に変える場合は、アプリを初めて使う前に、エディターで対象のJSONを編集・保存します。形式はスターターのJSONを参考にしてください。

- EC：[`apps/ec/data/catalog.json`](apps/ec/data/catalog.json)。`version`・表示名・`items` を持つオブジェクト。
- マップ：[`apps/map/src/data.json`](apps/map/src/data.json)。地点の配列。座標は `position: {lat, lng}`。
- TODO：[`apps/todo/src/data.json`](apps/todo/src/data.json)。`id`・`title`・`done`・`metadata` を持つ配列。

完成例を改良する場合は、編集中のアプリのJSONを編集します。ECは [`apps/ec-coffee/data/catalog.json`](apps/ec-coffee/data/catalog.json)、Mapは [`apps/map-coffee/src/data.json`](apps/map-coffee/src/data.json)、TODO連携版は [`apps/todo-integrated/src/data.json`](apps/todo-integrated/src/data.json) です。

すでにアプリを使っている場合は、ブラウザーに保存されたデータを引き継ぎます。JSONの編集や再読み込みでは、その保存データは置き換わりません。

各itemの `metadata` は、カードに直接出さずエージェントへ渡したい情報を入れる場所です。

```json
{
  "material": "樹脂",
  "weightGrams": 120,
  "colors": ["ホワイト", "グレー"]
}
```

完成例の検索・詳細取得ツールは、`metadata` も含めて結果を返します。チャットには生のツール結果を並べず、AIが必要な情報を回答に使います。自分の連携でも、表示用のカードとは別に、判断に使わせたい情報をツールの結果へ含めましょう。ブラウザーにはデータが存在するため、機密情報を隠す機能ではありません。

**16:10で区切ります。** データを3〜5件に減らすか、スターターの初期データを使って先に動かしましょう。主催者が別途ホストするデータ生成Webを使う場合は、出力されたJSONを対象ファイルへ貼り付け、初期データとして保存します。

### 16:30までに、候補を表示して選ぶ

Map・ECのスターターの `App.tsx` を開き、手動の検索・選択・カート操作が呼ぶ関数を確認します。TODOと同様にSDKをインストールし、完成例の `App.tsx` を参考に、会話用のコンポーネントで `useTool` を登録します。まず、一覧を読む操作と、候補を画面に出す操作を1つずつつなぎましょう。

| アプリ | 編集入口 | 指示 | 参考にする完成例 |
| --- | --- | --- | --- |
| Map | [`apps/map/src/App.tsx`](apps/map/src/App.tsx) | [`agents/map/prompt.md`](agents/map/prompt.md) | [`apps/map-coffee/src/App.tsx`](apps/map-coffee/src/App.tsx) |
| EC | [`apps/ec/src/App.tsx`](apps/ec/src/App.tsx) | [`agents/ec/prompt.md`](agents/ec/prompt.md) | [`apps/ec-coffee/src/App.tsx`](apps/ec-coffee/src/App.tsx) |

`App.tsx` 全体を完成例に置き換えず、TODOと同じ順序で追加します。`initialItems` / `initialData`、既存の `app` / `catalog`、保存キー、画面はそのまま使います。

1. SDKのimport・クライアント・会話用コンポーネントを追加します。Mapでは `app`、ECでは `catalog` をpropsで渡します。型はそれぞれ既存ファイルから `MapApp` / `CatalogStore` をimportできます。
2. 下の `getState()` を追加してから、完成例から必要な `useTool` の定義を選び、`execute` が今のアプリの値・関数を使うようにします。説明文も自分の題材に合わせます。
3. `session.ts` と `session.css` を対応する完成例からコピーし、importします。TODOと同じサイドバーと `SubakoProvider` を追加し、最初は `return <SubakoChat session={session} />` で表示します。EC・Mapにあるダイアログの表示先（`app-dialogs`）は、アプリ側に残します。`SessionControls`（「新しいセッション」ボタン）は、この段階では不要です。
4. `agents/map/prompt.md` または `agents/ec/prompt.md` を自分の利用者・業界・任せたい操作に合わせて編集してから、対象アプリをpublishします。

| アプリ | 最初に読むツール | 最初に画面を変えるツール |
| --- | --- | --- |
| Map | `get_places` → `app.getState().items`を読む | `show_candidates` → `app.showCandidates(ids)` |
| EC | `search_items` → 既存の `searchCatalog(catalog.getState().data.items, query, maxPrice)` | `show_items` → `catalog.showItems(ids)` |

`useSession` に渡すIDは、TODOと同じく `useSessionId` から受け取ります。保存キーのアプリ名だけ `map` / `ec` に変えてください。

ツールは画面の再描画を待たずに続けて呼ばれることがあるため、読み取りには現在値を返す `getState()` を追加します。Mapの [`use-map-app.ts`](apps/map/src/use-map-app.ts) の `const app = { ... }`、ECの [`useCatalog.ts`](apps/ec/src/useCatalog.ts) の最後の `return { ... }` に、それぞれ次のメソッドを加えてください。既存のrefは操作のたびに更新されています。画面は引き続き `state` を使います。

```ts
// Map: const app = { ... } に追加
getState() { return current.current; },

// EC: return { ... } に追加
getState() { return latest.current; },
```

この読み取り関数は連携するときに追加する部分です。完成例には追加済みで、スターターにはありません。

ECの検索ツールは `searchCatalog` を既存の `./model` からimportします。どちらも `import { z } from 'zod'` を追加し、引数を `schema` に定義します。Mapのスターターは直線距離からの移動時間の概算を使います。完成例の保存済み徒歩経路は別のアプリ機能です。`mapResult`・`routes.json` は最小の導入では使いません。

```sh
# Mapの場合。ECは @hackathon/map を @hackathon/ec に、下2行の末尾 map も ec に変えます。
npm install --workspace @hackathon/map @subako-ai/sdk@0.1.1 @subako-ai/react@0.1.1 @subako-ai/assistant-ui@0.1.1 @assistant-ui/react@0.15.19 @assistant-ui/react-markdown@0.14.15 zod@4.6.4
npm run agent:publish -- map
npm run dev -- map
```

`--workspace @hackathon/map` は、SDKをインストールするアプリの指定です。起動中なら先に止め、再起動してください。publishスクリプトがアプリ別のagentを準備します。会話はアプリが作ります。

- [ ] 自分のデータを検索し、候補がカード・地図に表示された。
- [ ] この流れを30秒で見せられる。ここで最初の完成！

候補表示が動いたら、ECでは `set_cart_quantity`、Mapでは `set_visit_order` を追加して、カート・訪問リストへ反映する操作まで広げられます。Mapのスターターでは `set_visit_order` の実行結果を `JSON.stringify(app.setVisitOrder(ids))` で返せます。徒歩経路データは不要です。

### 残り時間で工夫を足す

聞き方を変える、業界ならではの属性を増やす、人が選んだ候補を残す、比較表を出す、独自のツール・UI・APIを追加する、などから選びましょう。画像生成や大量データの用意は必須ではありません。

**自分たちが見せたい工夫：** `________________________________________________`

MCPを使うなら、[`presets/mcp/exa.json`](presets/mcp/exa.json)（Web検索）または [`presets/mcp/eris.json`](presets/mcp/eris.json)（現在の天気）の内容を、対象アプリの `agents/<app>/mcp.json` にコピーしてpublishします。APIキーなしで接続する候補ですが、無料枠と稼働状況は開催前に再確認します。Erisの天気は予報ではなく、指定座標の現在値です。

## 5. 試し直す・録画する

以下は `map-coffee` の例です。引数を対象のアプリ名に変えてください。

| やりたいこと | 操作 |
| --- | --- |
| 指示・MCPを反映 | `npm run agent:publish -- map-coffee` → 開発サーバーを再起動 |
| 会話を新しくする | サイドバーの「新しいセッション」。開発サーバーの再起動は要りません |
| Originだけ許可し直す | `npm run agent:origins -- map-coffee`（Codespacesの URL が変わったときなど） |
| 設定後も接続できない | キーの期限・残高・Originを確認。運営に相談 |
| 再読み込み直後にツールだけ失敗した | 古い接続が約60秒残る場合があります。1分ほど置いて現在の状態を読み直すよう依頼するか、「新しいセッション」で会話を作り直します。追加・購入などの操作を再送する前に画面の結果を確認してください |

APIキーを持つのは開発サーバーだけです。会話の作成とtokenの発行はブラウザーから直接呼べない（CORSが許可されていない）ので、Viteの `/__subako/session` と `/__subako/token` を経由します。ブラウザーが持つのは会話のIDと、その会話だけに使えるtokenです。会話への接続とclient toolは、そのtokenでAPIへ直接つなぎます。こちらはagentの `allowed_origins` でOriginごとに許可されています。

起動する常駐プロセスはViteだけで、Codespacesでも同じ構成です。`vite preview` でも同じ2つの口が使えますが、ビルドしたファイルを静的ホスティングする場合は同等の口を自分のサーバーに用意してください。

ビルドした状態を確認する場合は、開発サーバーを `Ctrl+C` で止めてから次を実行します。`preview` も同じアプリのポート（この例では5174）を使います。`.env.local` を変更した場合は再ビルドしてください。

```sh
npm run build --workspace @hackathon/todo-integrated
npm exec --workspace @hackathon/todo-integrated -- vite preview
```

<details>
<summary>任意：自分のTODOにも「新しいセッション」を追加する</summary>

最小の導入を終えた `todo` への追加手順です。会話の作成はすでに動いているので、足すのは「作り直すボタン」だけです。TODOの状態には触れません。

**1. UIをコピーします。** `session.ts` と `session.css` はハンズオンでコピー済みです。

```sh
cp apps/todo-integrated/src/SessionControls.tsx apps/todo/src/SessionControls.tsx
```

```tsx
import { SessionControls, SessionPending, SafeToolResult } from './SessionControls';
```

**2. `useSessionId` から、残りの3つも受け取ります。** ハンズオンでは `sessionId` だけ使っていました。

```tsx
const { sessionId, creating, error: sessionError, startNew } = useSessionId(sessionStorageKey);
```

**3. TodoAssistantの引数と会話の表示を変更します。** 既存の3つの `useTool` はそのまま残します。

```tsx
function TodoAssistant({ getItems, add, complete, sessionId, creating, error, onNew }: {
  getItems: () => Todo[];
  add: (title: string) => Todo;
  complete: (id: string, done: boolean) => Todo;
  sessionId: string;
  creating: boolean;
  error: string;
  onNew: () => void;
}) {
  const session = useSession(sessionId);
  const client = useToolClient(session, 'todo');

  // ここに既存の3つのuseToolを残します。

  return (
    <SessionControls session={session} creating={creating} error={error} onNew={onNew}>
      <SubakoChat session={session} components={{ tools: { Fallback: SafeToolResult } }} />
    </SessionControls>
  );
}
```

`SafeToolResult` は生のツール結果を短い操作表示に替え、失敗・承認待ちも表示する追加UIです。承認が必要なツールのボタンはSDKの `SubakoToolApproval` で表示します。この表示調整を使わない場合は、`components` とそのimportを省略できます。

**4. サイドバーの呼び出しに、増えた値を渡します。** ハンズオンで書いた「会話を準備しています…」も、失敗したときに作り直せる `SessionPending` に替えます。

```tsx
{sessionId ? (
  <SubakoProvider client={subako}>
    <TodoAssistant
      key={sessionId}
      getItems={getItems}
      add={add}
      complete={complete}
      sessionId={sessionId}
      creating={creating}
      error={sessionError}
      onNew={startNew}
    />
  </SubakoProvider>
) : (
  <SessionPending creating={creating} error={sessionError} onRetry={startNew} />
)}
```

`vite.config.ts` は触りません。会話を作る口は最初から6アプリすべてに入っています。

Map・ECへ追加する場合も同じ手順です。会話コンポーネントには既存の `app` / `catalog` を渡し続けます。コピー元と保存キーのアプリ名だけ、次の組み合わせにします。

| 編集アプリ | SessionControlsのコピー元 | 保存キー / publishの引数 |
| --- | --- | --- |
| `todo` | `todo-integrated` | `hackathon:session:todo:${baseUrl}` / `todo` |
| `map` | `map-coffee` | `hackathon:session:map:${baseUrl}` / `map` |
| `ec` | `ec-coffee` | `hackathon:session:ec:${baseUrl}` / `ec` |

ルートの [`scripts/subako-dev-api.ts`](scripts/subako-dev-api.ts) が、APIキーを持つ2つの口（`/__subako/session` と `/__subako/token`）です。各アプリの `vite.config.ts` が、キー・agent・接続先・表示名を渡して呼び出しています。自分の別リポジトリへ持ち出す場合は、同じ2つの口を自分のサーバーに用意してください。元のアプリの状態管理を変更する必要はありません。

- [ ] ボタンで空の会話になり、アプリのデータは残った。
- [ ] リロードしても、タブを閉じて開き直しても、同じ会話を再開した。

</details>

**17:55に録画へ切り替え、18:10までに代表者がGoogleフォームへ提出します。** 画面録画のままでよく、編集・BGM・スライドは不要です。

| 提出項目 | 記入メモ |
| --- | --- |
| チーム名・メンバー・作品名 | |
| 誰の何を助けるか（100字程度） | |
| 60秒以内のデモ動画1本 | |
| 工夫した点（200字程度） | |
| 実装して動く範囲／今後の構想 | |
| リポジトリ・アプリURL（任意） | |

動画の目安は、10秒で利用者を説明、40秒で入力と画面変化、10秒で工夫を紹介。録画に失敗したときは、同じ締切までに操作前後の画像と説明を提出します。提出完了を確認してください。

| 時刻 | 進行 |
| --- | --- |
| 15:00–15:15 | 受付・コーヒー・起動確認 |
| 15:15–15:45 | TODOハンズオン |
| 15:45–17:55 | テーマ・データ・実装。16:30までに最初のデモ |
| 17:55–18:10 | 録画・提出 |
| 18:10–18:20 | 懇親会開始、運営は上映準備 |
| 18:20–18:45 | 動画を連続上映。最大20組×75秒 |
| 18:45–19:00 | 懇親会・審査確定 |
| 19:00–19:10 | 結果発表・表彰 |
| 19:10–19:30 | 片付け・完全撤収 |

## 運営の準備と確認

- [ ] 新規アカウントでCLI登録から実APIへの接続まで通す。モデル・利用クレジット・同時利用を確認する。
- [ ] Codespacesを外部参加者アカウントで開き、登録・起動・publishを確認する。
- [ ] コーヒーの2作品を各60秒で録画し、冒頭の例として用意する。
- [ ] データ生成Webを別途ホストする場合は、各JSON形式の生成・検証と、対象ファイルへ貼り付けられる出力を用意する。
- [ ] 各アプリの初期JSONが正しい形式で起動でき、操作状態が再読み込み後も保存されることを確認する。
- [ ] **データ生成WebのURL：** 【運営が記入】
- [ ] **提出フォームのURL：** 【運営が記入】。動画・説明・録画失敗時の画像を受け付け、外部Googleアカウントで添付できるか確認する。
- [ ] 提出動画を運営PCへダウンロードして再生確認し、上映順に並べる。審査員にも同じ資料を渡す。
- [ ] 司会・締切管理・技術サポート・上映・審査・片付けを分担する。
- [ ] 評価は利用者への価値、動く体験、工夫を見る。動画編集やMCPの数で評価しない。
- [ ] 公開する場合は、地図・経路データの出典表示と運営の連絡先を確認する。[資料](docs/references.md)
- [ ] 終了後のAPIキー失効とCodespacesの停止・削除を案内する。

開発チェックはルートで `npm run check`。型チェック、操作・データ検証のテスト、6アプリの本番ビルドを実行します。クラウドを呼ぶテストは自動実行しません。
