import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  oxc: {
    jsx: { runtime: "automatic" },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(
        new URL("./src/test/serverOnly.ts", import.meta.url),
      ),
    },
  },
  test: {
    coverage: {
      exclude: [
        "**/*.config.*",
        "**/*.generated.ts",
        "**/migrations/**",
        "**/mock/**",
      ],
      provider: "v8",
      reporter: ["text", "lcov"],
    },
    environment: "node",
    globals: false,
  },
});
