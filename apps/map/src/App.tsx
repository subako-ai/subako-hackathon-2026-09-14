import { MapView } from "./map-view";
import { useMapApp } from "./use-map-app";
import { parseMapItems } from "./domain";
import data from "./data.json";

// ──────────────────────────────────────────────────────────────
// TODO ① SDKと、同じフォルダの session.ts をimportする
//    先に npm install --workspace @hackathon/map ... を済ませてください。
//    TODO版で import したものに加えて、このアプリでは次も使います。
//      - 型 MapApp（./use-map-app）  会話コンポーネントの props に使う
//    session.css は main.tsx がimport済みです。
// ──────────────────────────────────────────────────────────────

const initialItems = parseMapItems(data);

// ──────────────────────────────────────────────────────────────
// TODO ② 会話につなぐクライアントを用意する
//    TODO版の ② と同じ3行。会話の保存キーは `hackathon:session:map:${baseUrl}` にします。
// ──────────────────────────────────────────────────────────────

// ──────────────────────────────────────────────────────────────
// TODO ③ 会話を担当するコンポーネントを追加する
//    props は app: MapApp と sessionId: string。
//    useSession(sessionId) → useToolClient(session, "map") → useTool を2つ → <SubakoChat />。
//
//    読むツール   get_places
//      引数      なし（z.object({}).strict()）
//      execute   app.getState().items を JSON.stringify で返す。metadata も一緒に渡る
//    画面を変える show_candidates
//      引数      ids: string[]
//      execute   app.showCandidates(ids) を呼び、返ってきたIDを返す
//
//    現在の状態は app.state ではなく app.getState() で読みます。
//    app.state は描画時点の値なので、1回の応答で操作→読み取りが続くと古くなります。
// ──────────────────────────────────────────────────────────────

//    TODO ④ ③の中に、自分のツールを足す。呼べる既存の関数:
//      get_map_state    app.getState() と app.getVisitSummary()（距離・移動時間の概算）
//      set_visit_order  app.setVisitOrder(ids)。固定した地点は外せない
//      set_pinned       app.setPinned(id, pinned)
//    どれも map-view.tsx のボタンが呼んでいる関数です。schema は Zod で引数の形を書きます。
//    出発地は domain.ts の SHIBUYA_STATION で固定です。別の街にするならここも変えます。
//    行き詰まったら apps/map-coffee/src/App.tsx と docs/answers.md を見てください。

export default function App() {
  const app = useMapApp(initialItems, "hackathon-map-v1");

  // ──────────────────────────────────────────────────────────────
  // TODO ⑤ 使う会話を用意する
  //    TODO版の ⑤ と同じ。useSessionId(保存キー) から sessionId を受け取ります。
  // ──────────────────────────────────────────────────────────────

  return (
    <div className="app-layout has-session">
      <div className="app-panel">
        <div className="app-content">
          <MapView
            app={app}
            title="あなたの寄り道マップ。"
            subtitle="好きな場所を集めて、自分だけの訪問プランを。"
          />
        </div>
        <div id="app-dialogs" className="app-dialog-host" />
      </div>

      <aside className="session-sidebar" aria-label="マップアシスタント">
        <header className="session-header">
          <h2>マップアシスタント</h2>
          <p>会話しながら、地図を動かせます。</p>
        </header>
        <div className="session-content">
          {/*
            TODO ⑥ 下の <p> を、TODO版の ⑥ と同じ形に差し替える。
              sessionId があれば <SubakoProvider client={subako}> の中に ③ のコンポーネントを
              key={sessionId} で置き、app と sessionId を渡す。無ければ準備中の <p> を出す。
          */}
          <p>ここに会話が入ります。</p>
        </div>
      </aside>
    </div>
  );
}
