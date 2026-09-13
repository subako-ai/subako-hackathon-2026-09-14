import { CatalogView } from "./CatalogView";
import { useCatalog } from "./useCatalog";
import { validateCatalog } from "./model";
import catalogData from "../data/catalog.json";

const initialData = validateCatalog(catalogData);

export default function App() {
  const catalog = useCatalog({
    initialData,
    storageKey: "subako-hackathon:ec:v1",
  });

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
          <p>ここに会話が入ります。TODOと同じ手順で、SubakoProvider と会話用のコンポーネントを置きます。</p>
        </div>
      </aside>
    </div>
  );
}
