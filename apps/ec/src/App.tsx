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
    <div className="app-layout">
      <div className="app-panel">
        <div className="app-content">
          <CatalogView store={catalog} />
        </div>
        <div id="app-dialogs" className="app-dialog-host" />
      </div>
    </div>
  );
}
