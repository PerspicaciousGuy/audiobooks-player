import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
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
