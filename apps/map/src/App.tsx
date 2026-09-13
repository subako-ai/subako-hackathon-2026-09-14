import { MapView } from "./map-view";
import { useMapApp } from "./use-map-app";
import { parseMapItems } from "./domain";
import data from "./data.json";

const initialItems = parseMapItems(data);

export default function App() {
  const app = useMapApp(initialItems, "hackathon-map-v1");

  return (
    <div className="app-layout">
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
    </div>
  );
}
