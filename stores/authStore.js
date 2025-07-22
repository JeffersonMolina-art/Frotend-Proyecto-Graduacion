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

      const tokenCookie = useCookie('token')
      const userCookie = useCookie('user')
      const rolesCookie = useCookie('roles')

      tokenCookie.value = token
      userCookie.value = user
      rolesCookie.value = this.roles
    },

    logout() {
      this.token = null
      this.user = null
      this.roles = []

      const tokenCookie = useCookie('token')
      const userCookie = useCookie('user')
      const rolesCookie = useCookie('roles')

      tokenCookie.value = null
      userCookie.value = null
      rolesCookie.value = null

      navigateTo('/login')
    },

    cargarDesdeSession() {
      const tokenCookie = useCookie('token')
      const userCookie = useCookie('user')
      const rolesCookie = useCookie('roles')

      this.token = tokenCookie.value
      this.user = userCookie.value
      this.roles = rolesCookie.value || []
    }
  }
})
