import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Vite does not read tsconfig `paths`, so the `@/*` alias has to be repeated
// here. Without it every component test fails to resolve "@/lib/...".
const srcAlias = { "@": fileURLToPath(new URL("./src", import.meta.url)) };

export default defineConfig({
  test: {
    projects: [
      {
        // Pure logic / data tests — no DOM required.
        resolve: { alias: srcAlias },
        test: {
          name: "node",
          environment: "node",
          include: ["tests/**/*.test.ts"],
        },
      },
      {
        // Component tests — real DOM via jsdom + Testing Library matchers.
        plugins: [react()],
        resolve: { alias: srcAlias },
        test: {
          name: "jsdom",
          environment: "jsdom",
          include: ["tests/**/*.test.tsx"],
          setupFiles: ["./tests/setup.ts"],
          css: false,
        },
      },
    ],
  },
});
