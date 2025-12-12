import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Disable the any rule

      // Disable warnings about unused variables
      "@typescript-eslint/no-unused-vars": "off",

      // Allow let even if the variable is never reassigned
      "prefer-const": "off",

      // Optional: you can disable other warnings globally if needed
      "react/jsx-no-comment-textnodes": "off",
    },
  },
];

export default eslintConfig;
