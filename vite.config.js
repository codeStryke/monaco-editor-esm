// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    mode: 'production',
    outDir: './dist',
    assetsDir: '.',
    minify: true,
    lib: {
      entry: 'index.js',
      formats: ['es'],
      fileName: (format) => `monaco-editor.esm.js`,
    },
    rollupOptions: {
      output: {
        namespaceToStringTag: false,
      },
    }
  },
})