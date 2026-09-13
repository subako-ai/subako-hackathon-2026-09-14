import test from "node:test";
import assert from "node:assert/strict";
import {
  originsFor,
  modelFor,
  replaceEnvValue,
  publishAgent,
} from "../agent-support.mjs";

test("Codespacesのアプリ別Originを生成し、パス付きOriginは拒否する", () => {
  assert.ok(
    originsFor("map-coffee", {
      CODESPACE_NAME: "demo",
      GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN: "app.github.dev",
    }).includes("https://demo-5176.app.github.dev"),
  );
  assert.throws(() =>
    originsFor("map", { SUBAKO_EXTRA_ORIGINS: "https://example.com/path" }),
  );
});
test("ID更新でキーや他アプリの設定を保持する", () => {
  const source =
    "# settings\nVITE_SUBAKO_API_KEY=demo-secret\nVITE_SUBAKO_SESSION_EC=old\n";
  const changed = replaceEnvValue(source, "VITE_SUBAKO_SESSION_EC", "new");
  assert.ok(changed.includes("VITE_SUBAKO_API_KEY=demo-secret"));
  assert.ok(changed.includes("VITE_SUBAKO_SESSION_EC=new"));
  assert.equal(changed.match(/VITE_SUBAKO_SESSION_EC=/g).length, 1);
  assert.throws(() => replaceEnvValue(source, "X", "x\nY=z"));
});
test("providerに存在しないモデルと形式違いを拒否する", () => {
  const provider = {
    type: "platform",
    format: "anthropic",
    models: [{ model: "demo" }],
  };
  assert.equal(modelFor({ SUBAKO_MODEL_ID: "demo" }, provider).model, "demo");
  assert.throws(() => modelFor({ SUBAKO_MODEL_ID: "missing" }, provider));
  assert.throws(() =>
    modelFor(
      { SUBAKO_MODEL_ID: "demo", SUBAKO_MODEL_FORMAT: "openai_responses" },
      provider,
    ),
  );
});
test("再publishはagentを再利用し、既存Originを保持する", async () => {
  const calls = [];
  let saved = {};
  const client = {
    agents: {
      get: async () => ({}),
      create: async () => {
        calls.push("create");
        return { id: "agent" };
      },
      publishVersion: async () => {
        calls.push("publish");
        return { id: "version" };
      },
      getSecurity: async () => ({
        allowed_origins: ["https://existing.example"],
      }),
      setSecurity: async (_id, body) => {
        assert.ok(body.allowed_origins.includes("https://existing.example"));
      },
    },
  };
  const options = {
    client,
    config: { system_prompt: "first" },
    name: "demo",
    origins: ["http://localhost:5173"],
    persist: async (next) => {
      saved = next;
    },
  };
  await publishAgent({ ...options, state: saved });
  await publishAgent({ ...options, state: saved });
  assert.deepEqual(calls, ["create", "publish"]);
  await publishAgent({
    ...options,
    config: { system_prompt: "changed" },
    state: saved,
  });
  assert.deepEqual(calls, ["create", "publish", "publish"]);
});
