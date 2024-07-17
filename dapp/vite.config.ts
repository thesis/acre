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
  plugins: [nodePolyfills(), react()],
  define: {
    "import.meta.env.VITE_LATEST_COMMIT_HASH": latestCommitHash,
  },
})
