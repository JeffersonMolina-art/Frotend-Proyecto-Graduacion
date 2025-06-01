import { useAuthStore } from '@/stores/authStore'

export default defineNuxtRouteMiddleware(() => {
  const auth = useAuthStore()

  if (!auth.token) {
    auth.cargarDesdeSession()
  }

  if (!auth.token) {
    return navigateTo('/login')
  }
})
