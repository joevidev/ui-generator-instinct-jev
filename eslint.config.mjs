import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // shadcn-generated components and hooks: vendored code, not hand-maintained
    // here. Linting them risks inline fixes that diverge from `shadcn add --overwrite`.
    "components/ui/**",
    "hooks/**",
    "components/ai-elements/**",
  ]),
]);

export default eslintConfig;
