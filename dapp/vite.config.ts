import { sentryVitePlugin } from "@sentry/vite-plugin"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { nodePolyfills } from "vite-plugin-node-polyfills"
import { resolve } from "path"
import * as child from "child_process"

const latestCommitHash = JSON.stringify(
  child.execSync("git rev-parse --short HEAD").toString(),
)

export default defineConfig({
  resolve: {
    alias: {
      "#": resolve(__dirname, "./src"),
    },
  },

  plugins: [
    nodePolyfills(),
    react(),
    // Sentry plugin for Vite. Uploads source maps to Sentry.
    sentryVitePlugin(),
  ],

  define: {
    "import.meta.env.VITE_LATEST_COMMIT_HASH": latestCommitHash,
  },

  build: {
    // Build sourcemaps for Sentry integration.
    sourcemap: true,
  },
})
