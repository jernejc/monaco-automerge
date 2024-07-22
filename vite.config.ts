import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import wasm from "vite-plugin-wasm";

import tailwindcss from "tailwindcss";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    wasm(),
    react()
  ],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
})
