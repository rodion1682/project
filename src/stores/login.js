import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth' // Import the auth store
import { useLoginModalStore } from '@/stores/loginModal'
import axios, { setAuthToken } from '@/plugins/axios'

export const useLoginStore = defineStore('login', {
  state: () => ({
    data: {}, // Holds login form data
    error: '', // Holds error messages
  }),
  actions: {
    async submitLogin() {
      try {
        let res = await axios.post(import.meta.env.VITE_APP_API + 'login', this.data)

        if (res.data.status === 'ERROR') {
          this.error = res.data.message
        } else {
          // сохранить access_token
          const token = res.data.access_token
          const tokenType = res.data.token_type || 'Bearer'
          if (token) {
            setAuthToken(`${tokenType} ${token}`)
          }

          const loginModalStore = useLoginModalStore()
          loginModalStore.closeModal()
          this.clearError()

          const authStore = useAuthStore()
          authStore.checkAuth()
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'An unexpected error occurred.'
      }
    },
    updateData(newData) {
      this.data = newData // Update the data state with new values
    },
    async steamLogin() {
      window.location.href = `${import.meta.env.VITE_APP_DOMAIN}auth/steam/redirect`
    },
    clearError() {
      this.error = '' // Clear the error message
    },
  },
})
