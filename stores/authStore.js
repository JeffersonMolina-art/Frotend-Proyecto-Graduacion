import { defineStore } from 'pinia'
import { useCookie } from '#app'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    user: null,
    roles: []
  }),

  actions: {
    login(token, user) {
      this.token = token
      this.user = user
      this.roles = user.roles || []

      // Guardar en cookies
      useCookie('token').value = token
      useCookie('user').value = user
      useCookie('roles').value = this.roles
    },

    logout() {
      this.token = null
      this.user = null

      // Eliminar cookies
      useCookie('token').value = null
      useCookie('user').value = null

      navigateTo('/login')
    },

    cargarDesdeSession() {
      // Cargar desde cookies
      this.token = useCookie('token').value
      this.user = useCookie('user').value
    }
  }
})
