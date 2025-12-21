process.env.DISABLE_ESLINT_PLUGIN = "true";

import next from "eslint-config-next";

export default [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  next(),
];