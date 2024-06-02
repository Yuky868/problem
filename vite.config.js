import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {nodePolyfills} from 'vite-plugin-node-polyfills';

// https://vitejs.dev/config/
export default defineConfig({
  // define: {
  //   global: 'window',
  // },
  plugins: [react(), nodePolyfills()],
  server: {
    cors: true,
    open: true,
    proxy: {
      '/backend': {
        target: 'https://7to12-test.yangcong345.com',
        changeOrigin: true,
      },
    },
  },
})
