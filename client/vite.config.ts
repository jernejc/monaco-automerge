import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths';
import wasm from "vite-plugin-wasm";

import tailwindcss from "tailwindcss";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    wasm(),
    react(),
    tsconfigPaths()
  ],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  server: {
    host: true,
    port: 8080,
    watch: {
      usePolling: true
    }
  }
})
