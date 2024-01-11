import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { nodePolyfills } from "vite-plugin-node-polyfills"
import eslint from "vite-plugin-eslint"

import { resolve } from "path"

export default defineConfig({
  resolve: {
    alias: {
      "~": resolve(__dirname, "./src"),
    },
  },
  plugins: [nodePolyfills(), react(), eslint()],
})
