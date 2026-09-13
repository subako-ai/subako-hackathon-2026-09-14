import { useRef, useState, type ReactNode } from "react";
import type { SessionConnection } from "@subako-ai/sdk";
import type { ToolCallMessagePartProps } from "@assistant-ui/react";
import { SubakoToolApproval } from "@subako-ai/assistant-ui";
import { useSessionState } from "@subako-ai/react";
import "./session.css";

export function loadSessionId(key: string, initialId: string) {
  try {
    return sessionStorage.getItem(key) || initialId;
  } catch {
    return initialId;
  }
}

export function saveSessionId(key: string, id: string) {
  try {
    sessionStorage.setItem(key, id);
  } catch {
    // 保存できなくても、開いている間は会話を続けられます。
  }
}

export function SessionControls({ session, onSessionChange, children }: {
  session: SessionConnection | null;
  onSessionChange: (id: string) => void;
  children: ReactNode;
}) {
  const state = useSessionState(session);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  const running = state?.isRunning && state.status !== "failed";
  const connecting = !state || state.status === "connecting" || state.status === "reconnecting";

  async function startNewSession() {
    if (inFlight.current) return;
    inFlight.current = true;
    setCreating(true);
    setError("");
    try {
      // 作成APIはCORS制約があるため、Viteを経由します。
      const response = await fetch("/__hackathon/session", {
        method: "POST",
        headers: { "X-Hackathon-Session": "new" },
        signal: AbortSignal.timeout(30_000),
      });
      const result = await response.json();
      if (!response.ok || typeof result?.sessionId !== "string" || !result.sessionId) {
        throw new Error("create failed");
      }
      onSessionChange(result.sessionId);
    } catch {
      setError("新しいセッションを作れませんでした。Viteの起動とAPIキーの設定・権限を確認して、もう一度お試しください。");
    } finally {
      inFlight.current = false;
      setCreating(false);
    }
  }

  return (
    <div className="session-conversation" aria-busy={creating}>
      <div className="session-toolbar">
        <button
          type="button"
          disabled={creating || running || connecting}
          onClick={() => void startNewSession()}
          title="会話を新しくします。アプリ内のデータは引き継がれます。"
        >
          <span aria-hidden="true">＋</span>
          {creating ? "作成中…" : "新しいセッション"}
        </button>
        {running && <span>応答後、または停止後に切り替えられます。</span>}
        {error && <p className="session-error" role="alert">{error}</p>}
      </div>
      <div className="session-chat" inert={creating}>{children}</div>
    </div>
  );
}

// 補足データは省略し、操作の状態と承認ボタンを表示します。
export function SafeToolResult(props: ToolCallMessagePartProps) {
  const { result, isError, approval } = props;
  const waiting = approval && approval.approved === undefined && approval.resolution === undefined;
  let message = result === undefined ? "アプリを操作しています…" : "アプリの操作結果を受け取りました";
  if (isError) message = "アプリの操作に失敗しました";
  if (waiting) message = "操作の承認を待っています";
  if (approval?.approved === false) message = "操作を許可しませんでした";
  if (approval?.resolution) message = "操作の承認待ちは終了しました";

  return (
    <div className="tool-status">
      <span className={isError ? "session-error" : undefined}>{message}</span>
      <SubakoToolApproval {...props} />
    </div>
  );
}
