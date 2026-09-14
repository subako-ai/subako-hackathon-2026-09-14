import { CatalogView } from "./CatalogView";
import { useCatalog } from "./useCatalog";
import { validateCatalog } from "./model";
import catalogData from "../data/catalog.json";

// ──────────────────────────────────────────────────────────────
// TODO ① SDKと、同じフォルダの session.ts をimportする
//    先に npm install --workspace @hackathon/ec ... を済ませてください。
//    TODO版で import したものに加えて、このアプリでは次も使います。
//      - 型 CatalogStore（./useCatalog）  会話コンポーネントの props に使う
//      - searchCatalog（./model）          検索ボックスと同じ検索関数
//    session.css は main.tsx がimport済みです。
// ──────────────────────────────────────────────────────────────

const initialData = validateCatalog(catalogData);

// ──────────────────────────────────────────────────────────────
// TODO ② 会話につなぐクライアントを用意する
//    TODO版の ② と同じ3行。会話の保存キーは `hackathon:session:ec:${baseUrl}` にします。
// ──────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────
// TODO ③ 会話を担当するコンポーネントを追加する
//    props は catalog: CatalogStore と sessionId: string。
//    useSession(sessionId) → useToolClient(session, "shop") → useTool を2つ → <SubakoChat />。
//
//    読むツール   search_items
//      引数      query: string（空なら全商品）
//      execute   searchCatalog(catalog.getState().data.items, query) を JSON.stringify で返す
//    画面を変える show_items
//      引数      ids: string[]
//      execute   catalog.showItems(ids) を呼び、返ってきたIDを返す
//
//    現在の状態は catalog.state ではなく catalog.getState() で読みます。
//    catalog.state は描画時点の値なので、1回の応答で操作→読み取りが続くと古くなります。
// ──────────────────────────────────────────────────────────────

//    TODO ④ ③の中に、自分のツールを足す。呼べる既存の関数:
//      get_cart           catalog.getState().cart と cartSummary(cart, items)（./model）
//      set_cart_quantity  catalog.setQuantity(id, quantity)
//      compare_items      catalog.compareItems(ids)（3点まで）
//      replace_cart       catalog.replaceCart(lines, maxTotal)
//      open_checkout      catalog.openCheckout()。確定ボタンは人が押す
//    どれも CatalogView.tsx のボタンが呼んでいる関数です。schema は Zod で引数の形を書きます。
//    行き詰まったら apps/ec-coffee/src/App.tsx と docs/answers.md を見てください。

export default function App() {
  const catalog = useCatalog({
    initialData,
    storageKey: "subako-hackathon:ec:v1",
  });

  // ──────────────────────────────────────────────────────────────
  // TODO ⑤ 使う会話を用意する
  //    TODO版の ⑤ と同じ。useSessionId(保存キー) から sessionId を受け取ります。
  // ──────────────────────────────────────────────────────────────

  return (
    <div className="app-layout has-session">
      <div className="app-panel">
        <div className="app-content">
          <CatalogView store={catalog} />
        </div>
        <div id="app-dialogs" className="app-dialog-host" />
      </div>

      <aside className="session-sidebar" aria-label="ショップアシスタント">
        <header className="session-header">
          <h2>ショップアシスタント</h2>
          <p>会話しながら、商品を探せます。</p>
        </header>
        <div className="session-content">
          {/*
            TODO ⑥ 下の <p> を、TODO版の ⑥ と同じ形に差し替える。
              sessionId があれば <SubakoProvider client={subako}> の中に ③ のコンポーネントを
              key={sessionId} で置き、catalog と sessionId を渡す。無ければ準備中の <p> を出す。
          */}
          <p>ここに会話が入ります。</p>
        </div>
      </aside>
    </div>
  );
}
