import { MapView } from "./map-view";
import { useMapApp } from "./use-map-app";
import { parseMapItems } from "./domain";
import data from "./data.json";

const initialItems = parseMapItems(data);

export default function App() {
  const app = useMapApp(initialItems, "hackathon-map-v1");

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
          <p>ここに会話が入ります。TODOと同じ手順で、SubakoProvider と会話用のコンポーネントを置きます。</p>
        </div>
      </aside>
    </div>
  );
}
