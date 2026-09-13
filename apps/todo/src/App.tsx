import { useEffect, useRef, useState, type FormEvent } from "react";
import { createTodo, parseTodos, setTodoDone, type Todo } from "./model";
import data from "./data.json";
import "./style.css";
import "./layout.css";

const initialItems: Todo[] = parseTodos(data);
const storageKey = "hackathon:todo";

export default function App() {
  const [initial] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return { items: saved === null ? initialItems : parseTodos(JSON.parse(saved)), error: "" };
    } catch {
      return { items: initialItems, error: "保存データを読めなかったため、初期データを表示しました。" };
    }
  });
  const [items, setItems] = useState(initial.items);
  const currentItems = useRef(items);
  const [error, setError] = useState(initial.error);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "done">("all");
  const active = items.filter((item) => !item.done).length;
  const visible = items.filter(
    (item) => filter === "all" || (filter === "done" ? item.done : !item.done),
  );

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      setError("ブラウザーに保存できません。再読み込みすると変更が失われる可能性があります。");
    }
  }, [items]);

  function getItems() {
    return currentItems.current;
  }
  function updateItems(next: Todo[]) {
    // 再描画前の連続操作にも、直前の変更を渡します。
    currentItems.current = next;
    setItems(next);
    setError("");
  }
  function add(title: string) {
    const current = getItems();
    if (current.length >= 500) throw new Error("TODOは500件まで追加できます。");
    const todo = createTodo(title);
    updateItems([...current, todo]);
    return todo;
  }
  function complete(id: string, done: boolean) {
    const next = setTodoDone(getItems(), id, done);
    updateItems(next);
    return next.find((item) => item.id === id)!;
  }
  function remove(id: string) {
    updateItems(getItems().filter((item) => item.id !== id));
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    try {
      add(title);
      setTitle("");
    } catch (error) {
      setError((error as Error).message);
    }
  }
  return (
    <div className="app-layout">
      <div className="app-panel">
        <div className="app-content">
          <div className="todo-shell">
            <header className="todo-header">
              <a className="todo-brand" href="/">
                subako<span> / hackathon</span>
              </a>
              <span className="todo-badge">
                TODAY’S PLAN
              </span>
            </header>
            <div className="todo-layout">
              <main className="todo-main">
                <p className="todo-eyebrow">SMALL STEPS, GOOD IDEAS.</p>
                <h1>
                  ひとつずつ、
                  <br />
                  かたちにしよう。
                </h1>
                <p className="todo-lead">
                  思いついたことを、今日の一歩に。
                  <br />
                  小さな予定も、ここから始めましょう。
                </p>
                <section className="todo-board" aria-label="TODO一覧">
                  <div className="todo-board-title">
                    <h2>やること</h2>
                    <span>
                      あと <b>{active}</b> 件
                    </span>
                  </div>
                  <form onSubmit={submit} className="todo-add">
                    <label className="sr-only" htmlFor="new-todo">
                      新しいTODO
                    </label>
                    <input
                      id="new-todo"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="次にやることを入力"
                      maxLength={300}
                      required
                    />
                    <button type="submit">
                      追加する <span aria-hidden="true">＋</span>
                    </button>
                  </form>
                  <div className="todo-filters" aria-label="絞り込み">
                    {(
                      [
                        ["all", "すべて"],
                        ["active", "未完了"],
                        ["done", "完了"],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        className={filter === value ? "selected" : ""}
                        onClick={() => setFilter(value)}
                        aria-pressed={filter === value}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {error && (
                    <p role="alert" className="todo-error">
                      {error}
                    </p>
                  )}
                  {visible.length ? (
                    <ul className="todo-list">
                      {visible.map((item) => (
                        <li key={item.id} className={item.done ? "done" : ""}>
                          <label>
                            <input
                              type="checkbox"
                              checked={item.done}
                              onChange={(e) =>
                                complete(item.id, e.target.checked)
                              }
                            />
                            <span>{item.title}</span>
                          </label>
                          <button
                            onClick={() => remove(item.id)}
                            aria-label={`${item.title}を削除`}
                          >
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="todo-empty">
                      <div aria-hidden="true">✓</div>
                      <h3>
                        {items.length
                          ? "この一覧は空です"
                          : "最初のひとつを、ここに。"}
                      </h3>
                      <p>
                        {items.length
                          ? "別の絞り込みを選んでみてください。"
                          : "上の入力欄から、今日の予定を追加してみましょう。"}
                      </p>
                    </div>
                  )}
                </section>
                <p className="todo-caption">SUBAKO HACKATHON · SHIBUYA · 2026.09.14</p>
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
