import { defineConfig } from "vitest/config"

export default defineConfig({
  ssr: {
    resolve: {
      conditions: ["mock-discordjs-src", "import", "default"],
    },
  },
  test: {
    setupFiles: "./test/setup-env.ts"
  }
})