import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const HOST = "127.0.0.1";
const PORT = 3217;
const ORIGIN = `http://${HOST}:${PORT}`;
const START_TIMEOUT_MS = 20_000;
const REQUEST_TIMEOUT_MS = 5_000;
const PUBLIC_ROUTES = [
  "/",
  "/offline",
  "/privacy",
  "/terms",
  "/manifest.webmanifest",
  "/sw.js",
];
const NEXT_BIN = fileURLToPath(
  new URL("../node_modules/next/dist/bin/next", import.meta.url),
);

function request(path, init) {
  return fetch(`${ORIGIN}${path}`, {
    ...init,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

async function waitForServer(server) {
  const deadline = Date.now() + START_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Production server exited with ${server.exitCode}.`);
    }
    try {
      const response = await request("/health");
      if (response.ok) return response;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
  throw new Error("Production server did not become healthy in time.");
}

async function assertPublicRoutes() {
  for (const path of PUBLIC_ROUTES) {
    const response = await request(path);
    assert.equal(response.status, 200, `${path} must return 200`);
  }
  const manifest = await (await request("/manifest.webmanifest")).json();
  assert.equal(manifest.name, "Quiet Library");
  assert.equal(manifest.display, "standalone");
}

async function assertSecurityHeaders() {
  const response = await request("/");
  const csp = response.headers.get("content-security-policy") ?? "";
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /object-src 'none'/);
  assert.equal(
    response.headers.get("strict-transport-security"),
    "max-age=31536000",
  );
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.match(response.headers.get("permissions-policy") ?? "", /camera=\(\)/);
}

async function assertProtectedApi() {
  const response = await request("/api/v1/library");
  assert.equal(response.status, 401);
  assert.match(response.headers.get("content-type") ?? "", /problem\+json/);
}

async function stopServer(server) {
  if (server.exitCode !== null) return;
  const exited = new Promise((resolve) => server.once("exit", resolve));
  server.kill("SIGTERM");
  await Promise.race([
    exited,
    new Promise((resolve) => setTimeout(resolve, 3_000)),
  ]);
  if (server.exitCode === null) server.kill("SIGKILL");
}

async function main() {
  const output = [];
  const server = spawn(
    process.execPath,
    [NEXT_BIN, "start", "-H", HOST, "-p", PORT],
    {
      env: { ...process.env, NEXT_PUBLIC_APP_URL: ORIGIN },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  server.stdout.on("data", (chunk) => output.push(String(chunk)));
  server.stderr.on("data", (chunk) => output.push(String(chunk)));

  try {
    const healthResponse = await waitForServer(server);
    assert.deepEqual(await healthResponse.json(), { status: "ok" });
    await assertPublicRoutes();
    await assertSecurityHeaders();
    await assertProtectedApi();
    console.log("Production HTTP smoke passed.");
  } catch (error) {
    console.error(output.join("").slice(-4_000));
    throw error;
  } finally {
    await stopServer(server);
  }
}

await main();
