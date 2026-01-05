import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../extension/ui',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Убираем хеши из имён файлов для расширения
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  // Для Chrome Extension нужны относительные пути
  base: './'
})
