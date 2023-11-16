// Unfortunately, the Vite React package structure does not play nice with no-extraneous-dependencies.
/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
})
