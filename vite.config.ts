import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    minify: 'terser',
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/entry/popup.html'),
        content: resolve(__dirname, 'src/entry/content.ts'),
        background: resolve(__dirname, 'src/entry/background.ts')
      },
      output: {
        entryFileNames: 'src/entry/[name].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
});
