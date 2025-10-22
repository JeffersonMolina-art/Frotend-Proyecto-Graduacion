import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@core': path.resolve(__dirname, './@core'),
      '@images': path.resolve(__dirname, './assets/images'),
      '@views': path.resolve(__dirname, './views'),
      '@components': path.resolve(__dirname, './components'),
      '@pages': path.resolve(__dirname, './pages'),
      '@themeConfig': path.resolve(__dirname, './themeConfig.ts'),
      '@layouts': path.resolve(__dirname, './layouts'),
      '@stores': path.resolve(__dirname, './stores'),

      // Mock de Nuxt para tests
      '#app': path.resolve(__dirname, './tests/mocks/nuxt-app.js'),
      '#imports': path.resolve(__dirname, './tests/mocks/nuxt-imports.js'),
    },
  },

  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.js'],
    include: ['tests/**/*.spec.{js,ts}'],
    coverage: {
      reporter: ['text', 'html'],
    },
  },
})
