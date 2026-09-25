import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/** ESLint 9 flat config (Next.js 16 removed `next lint`; run `npm run lint`). */
const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [".next/**", "node_modules/**", "drizzle/**", "next-env.d.ts", "public/**"],
  },
];

export default eslintConfig;
