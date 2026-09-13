import assert from "node:assert/strict";
import { createServer } from "node:http";
import test, { type TestContext } from "node:test";
import { createSessionMiddleware } from "../new-session.ts";

const configuredEnv = {
  VITE_SUBAKO_API_KEY: "test-api-secret",
  VITE_SUBAKO_SESSION_MAP_COFFEE: "configured-map-session",
  VITE_SUBAKO_SESSION_EC_COFFEE: "keep-ec-session",
};

async function serve(
  t: TestContext,
  options: Partial<Parameters<typeof createSessionMiddleware>[0]> = {},
) {
  const middleware = createSessionMiddleware({
    appId: "map-coffee",
    title: "渋谷コーヒー巡り",
    env: { ...configuredEnv },
    createClient: () => {
      throw new Error("想定外のSDK呼び出し");
    },
    ...options,
  });
  const server = createServer((req, res) => {
    void middleware(req, res, () => {
      res.writeHead(404);
      res.end("next");
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  return `http://127.0.0.1:${address.port}`;
}

function post(origin: string, options: RequestInit = {}) {
  return fetch(`${origin}/__hackathon/session`, {
    method: "POST",
    headers: { "X-Hackathon-Session": "new", Origin: origin },
    ...options,
  });
}

test("設定済みの会話のagentで作成し、IDだけを返す", async (t) => {
  const calls: string[] = [];
  const env = { ...configuredEnv };
  let sharedSignal: AbortSignal | undefined;
  const origin = await serve(t, {
    env,
    createClient: (config) => {
      assert.equal(config.apiKey, "test-api-secret");
      assert.equal(config.baseUrl, "https://api.us.cloud.subako.ai");
      assert.equal(config.timeout, 20_000);
      assert.equal(config.maxRetries, 0);
      return {
        sessions: {
          async get(id, options) {
            calls.push("get");
            assert.equal(id, "configured-map-session");
            assert.ok(options?.signal);
            sharedSignal = options.signal;
            return { agent_id: "configured-agent" };
          },
          async create(body, options) {
            calls.push("create");
            assert.deepEqual(body, {
              agent_id: "configured-agent",
              display_name: "渋谷コーヒー巡り",
            });
            assert.equal(options?.signal, sharedSignal);
            return { id: "new-session", session_token: "test-session-secret" };
          },
        },
      };
    },
  });
  const result = await post(origin, {
    body: JSON.stringify({ agent_id: "injected-agent", sessionId: "other-session" }),
  });
  assert.equal(result.status, 201);
  assert.equal(result.headers.get("cache-control"), "no-store");
  assert.deepEqual(await result.json(), { sessionId: "new-session" });
  assert.deepEqual(calls, ["get", "create"]);
  assert.deepEqual(env, configuredEnv);
});

test("取得失敗時は作成せず、APIのエラーやキーを返さない", async (t) => {
  const env = { ...configuredEnv };
  const origin = await serve(t, {
    env,
    createClient: () => ({
      sessions: {
        async get() {
          throw new Error("test-api-secret upstream details");
        },
        async create() {
          assert.fail("取得失敗時に作成してはいけません");
        },
      },
    }),
  });
  const result = await post(origin);
  assert.equal(result.status, 502);
  const body = await result.text();
  assert.ok(body.includes("新しい会話を作成できませんでした"));
  assert.ok(!body.includes("test-api-secret"));
  assert.ok(!body.includes("upstream"));
  assert.deepEqual(env, configuredEnv);
});

test("作成失敗時も初期セッションと他アプリの設定を保持する", async (t) => {
  const env = { ...configuredEnv };
  const origin = await serve(t, {
    env,
    createClient: () => ({
      sessions: {
        async get() { return { agent_id: "configured-agent" }; },
        async create() { throw new Error("test-session-secret"); },
      },
    }),
  });
  const result = await post(origin);
  assert.equal(result.status, 502);
  assert.ok(!(await result.text()).includes("test-session-secret"));
  assert.deepEqual(env, configuredEnv);
});

test("設定不足と不正なURLはAPIを呼ばず503にする", async (t) => {
  for (const env of [
    {},
    { VITE_SUBAKO_API_KEY: "test-api-secret" },
    { ...configuredEnv, VITE_SUBAKO_BASE_URL: "file:///secret" },
  ]) {
    const origin = await serve(t, { env });
    const result = await post(origin);
    assert.equal(result.status, 503);
  }
});

test("他パスを通し、GET・ヘッダーなし・別Originからの作成を拒否する", async (t) => {
  const origin = await serve(t);
  const get = await fetch(`${origin}/__hackathon/session`);
  assert.equal(get.status, 405);
  assert.equal(get.headers.get("allow"), "POST");
  for (const headers of [
    {},
    { "X-Hackathon-Session": "wrong" },
    { "X-Hackathon-Session": "new", Origin: "https://other.example" },
    { "X-Hackathon-Session": "new", Origin: origin, "Sec-Fetch-Site": "cross-site" },
  ]) {
    assert.equal((await post(origin, { headers })).status, 403);
  }
  for (const path of ["/other", "/__hackathon/session/other", "/__hackathon/session?agent=other"]) {
    const response = await fetch(`${origin}${path}`);
    assert.equal(response.status, 404);
    assert.equal(await response.text(), "next");
  }
});

test("Codespacesで指定したアプリ自身のOriginを許可する", async (t) => {
  const allowedOrigin = "https://demo-5176.app.github.dev";
  const origin = await serve(t, {
    allowedOrigin,
    createClient: () => ({
      sessions: {
        async get() { return { agent_id: "configured-agent" }; },
        async create() { return { id: "codespaces-session" }; },
      },
    }),
  });
  const result = await post(origin, {
    headers: {
      "X-Hackathon-Session": "new",
      Origin: allowedOrigin,
      "Sec-Fetch-Site": "same-origin",
    },
  });
  assert.equal(result.status, 201);
});
