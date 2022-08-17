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
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]',
        generatedCode: {
          preset: 'es2015',
          arrowFunctions: true,
          constBindings: true,
          objectShorthand: true,
          reservedNamesAsProps: false,
          symbols: true,
        }
      },
    }
  },
})