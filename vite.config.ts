import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'dist', // ✅ must match Vercel setting
  },
  plugins: [vue()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/variables" as *;`
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
      '@views': fileURLToPath(new URL('./src/components/views', import.meta.url)),
      'vuetify/lib': 'vuetify/dist/vuetify'

    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.qorgau-city.kz',
        changeOrigin: true,
        secure: false, // если сервер использует самоподписанный SSL-сертификат
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})

