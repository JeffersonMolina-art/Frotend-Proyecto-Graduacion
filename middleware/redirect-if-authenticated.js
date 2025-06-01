import { useAuthStore } from '@/stores/authStore'

export default defineNuxtRouteMiddleware(() => {
  if (process.client) {
    const auth = useAuthStore()
    auth.cargarDesdeSession()
    if (auth.token) {
      return navigateTo('/second-page')
    }
  }
})
