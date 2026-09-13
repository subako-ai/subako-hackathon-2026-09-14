import type { IncomingMessage, ServerResponse } from "node:http";
import { SubakoClient, type RequestOptions } from "@subako-ai/sdk";
import { loadEnv, type Plugin } from "vite";
import { apps, sessionVariable } from "./apps.mjs";

type SessionClient = {
  sessions: {
    get(id: string, options?: RequestOptions): Promise<{ agent_id: string }>;
    create(
      body: { agent_id: string; display_name: string },
      options?: RequestOptions,
    ): Promise<{ id: string }>;
  };
};
type SessionOptions = {
  appId: string;
  title: string;
  env: Record<string, string | undefined>;
  allowedOrigin?: string;
  createClient?: (options: {
    baseUrl: string;
    apiKey: string;
    timeout: number;
    maxRetries: number;
  }) => SessionClient;
};

function reply(res: ServerResponse, status: number, body: object) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(body));
}

function isSameOrigin(req: IncomingMessage, allowedOrigin?: string) {
  const site = req.headers["sec-fetch-site"];
  if (site && site !== "same-origin" && site !== "none") return false;
  const origin = req.headers.origin;
  if (!origin) return true;
  return (
    origin === allowedOrigin ||
    origin === `http://${req.headers.host}` ||
    origin === `https://${req.headers.host}`
  );
}

export function createSessionMiddleware(options: SessionOptions) {
  return async (
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void,
  ) => {
    if (req.url !== "/__hackathon/session") return next();
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return reply(res, 405, { error: "POSTで新しい会話を作成してください。" });
    }
    if (
      req.headers["x-hackathon-session"] !== "new" ||
      !isSameOrigin(req, options.allowedOrigin)
    ) {
      return reply(res, 403, { error: "このアプリから操作してください。" });
    }
    // 作成先は設定済みの会話から決め、リクエストのIDは受け取りません。
    req.resume();
    const apiKey = options.env.VITE_SUBAKO_API_KEY?.trim();
    const initialId = options.env[sessionVariable(options.appId)]?.trim();
    const baseUrl =
      options.env.VITE_SUBAKO_BASE_URL?.trim() || "https://api.us.cloud.subako.ai";
    if (!apiKey || !initialId) {
      return reply(res, 503, {
        error: "APIキーと初期セッションを設定し、開発サーバーを再起動してください。",
      });
    }
    try {
      if (!["http:", "https:"].includes(new URL(baseUrl).protocol)) throw new Error();
    } catch {
      return reply(res, 503, { error: "Subakoの接続先URLを確認してください。" });
    }

    const signal = AbortSignal.timeout(20_000);
    try {
      const client = (options.createClient ?? ((config) => new SubakoClient(config)))({
        baseUrl,
        apiKey,
        timeout: 20_000,
        maxRetries: 0,
      });
      const current = await client.sessions.get(initialId, { signal });
      const created = await client.sessions.create(
        { agent_id: current.agent_id, display_name: options.title },
        { signal },
      );
      // 発行されたtokenはブラウザーへ返しません。
      reply(res, 201, { sessionId: created.id });
    } catch {
      reply(res, signal.aborted ? 504 : 502, {
        error: signal.aborted
          ? "会話の作成がタイムアウトしました。時間をおいて再試行してください。"
          : "新しい会話を作成できませんでした。接続とAPIキーの権限を確認してください。",
      });
    }
  };
}

export function newSessionPlugin(options: {
  port: number;
  envDir: string;
  allowedOrigin?: string;
}): Plugin {
  const entry = Object.entries(apps).find(([, app]) => app.port === options.port);
  if (!entry) throw new Error("アプリのポート設定を確認してください。");
  const [appId, app] = entry;
  let middleware: ReturnType<typeof createSessionMiddleware>;
  return {
    name: "hackathon-new-session",
    configResolved(config) {
      middleware = createSessionMiddleware({
        appId,
        title: app.title,
        env: loadEnv(config.mode, options.envDir, "VITE_SUBAKO_"),
        allowedOrigin: options.allowedOrigin,
      });
    },
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
