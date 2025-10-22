// tests/mocks/nuxt-app.js

export const useCookie = () => ({ value: '' })

export const useRuntimeConfig = () => ({
  public: {
    apiBase: 'http://localhost:3000/api',
  },
})

export const navigateTo = () => {}
export const defineNuxtRouteMiddleware = () => {}
