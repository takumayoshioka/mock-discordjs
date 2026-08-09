import { defineConfig } from "vitest/config"

export default defineConfig({
  ssr: {
    resolve: {
      conditions: ["vitest", "import", "default"],
    },
  },
  test: {
    setupFiles: "./test/setup-env.ts"
  }
})