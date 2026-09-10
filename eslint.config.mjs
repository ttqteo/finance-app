import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Next 16 dropped `next lint`, and with it the legacy .eslintrc format this
// repo used. Same presets and the same two rules turned off as before.
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      // New with eslint-config-next 16 (React Compiler rules). They flag eight
      // spots that predate them: setState called straight from an effect, and
      // Math.random during render. Warnings until those get refactored.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/purity": "warn",
    },
  },
  // inspect-vnstock.js is a one-off CommonJS debugging script, not app code.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "inspect-vnstock.js",
  ]),
]);
