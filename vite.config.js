// vite.config.js
const path = require('path');
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    mode: 'production',
    outDir: './dist',
    assetsDir: '.',
    minify: true,
    lib: {
      entry: path.resolve(__dirname, 'index.js'),
      formats: ['esm'],
      fileName: (format) => `monaco-editor.${format}.js`
    },
  },
})