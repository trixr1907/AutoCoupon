import { defineConfig } from 'vite';
import { resolve } from 'path';

// Separate Builds für jeden Entry damit kein Code-Splitting passiert
const entries = {
  content: resolve(__dirname, 'src/entry/content.ts'),
  popup: resolve(__dirname, 'src/entry/popup.html'),
  background: resolve(__dirname, 'src/entry/background.ts')
};

export default defineConfig({
  build: {
    minify: 'terser',
    cssCodeSplit: false,
    target: 'es2020',
    rollupOptions: {
      input: entries,
      output: {
        entryFileNames: (chunkInfo) => {
          return 'src/entry/[name].js';
        },
        // Keine separaten Chunks - alles inline in jeden Entry
        manualChunks: {},
        chunkFileNames: 'src/entry/shared.js',
        assetFileNames: 'assets/[name].[ext]',
        format: 'es'
      }
    }
  }
});
