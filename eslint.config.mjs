import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { FlatCompat } from "@eslint/eslintrc";

const currentFilename = fileURLToPath(import.meta.url);
const currentDirectory = dirname(currentFilename);

const compatibility = new FlatCompat({
  baseDirectory: currentDirectory,
});

const eslintConfig = [
  ...compatibility.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      ".next/**",
      "build/**",
      "coverage/**",
      "next-env.d.ts",
      "node_modules/**",
      "out/**",
      "supabase/.branches/**",
      "supabase/.temp/**",
    ],
  },
];

export default eslintConfig;
