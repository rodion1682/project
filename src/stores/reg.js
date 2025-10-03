import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth' // Import the auth store
import { useRegModalStore } from '@/stores/regModal'
import axios, { setAuthToken } from '@/plugins/axios'

export const useRegStore = defineStore('reg', {
  state: () => ({
    data: {}, // Holds login form data
    error: '', // Holds error messages
  }),
  actions: {
    async submitReg() {
      try {
        let res = await axios.post(import.meta.env.VITE_APP_API + 'register', this.data)
        let self = this
        if (res.data.status === 'ERROR') {
          if (res.data.errors) {
            const firstErrors = {}
            for (const key in res.data.errors) {
              if (
                Object.prototype.hasOwnProperty.call(res.data.errors, key) &&
                Array.isArray(res.data.errors[key]) &&
                res.data.errors[key].length > 0
              ) {
                firstErrors[key] = res.data.errors[key][0]
                self.error = firstErrors[key]
                setTimeout(function () {
                  self.error = ''
                }, 3000)
              }
            }
          } else {
            this.error = res?.data?.message
          }
        } else {
          const token = res.data.access_token
          const tokenType = res.data.token_type || 'Bearer'

          if (token) {
            setAuthToken(`${tokenType} ${token}`)
          }

          const authStore = useAuthStore()
          const regModalStore = useRegModalStore()
          regModalStore.closeModal()
          this.clearError()
          authStore.checkAuth()
        }
      } catch (err) {
        let self = this
        if (err.response?.data.errors) {
          const firstErrors = {}
          for (const key in err.response?.data.errors) {
            if (
              Object.prototype.hasOwnProperty.call(err.response?.data.errors, key) &&
              Array.isArray(err.response?.data.errors[key]) &&
              err.response?.data.errors[key].length > 0
            ) {
              firstErrors[key] = err.response?.data.errors[key][0]
              self.error = firstErrors[key]
              setTimeout(function () {
                self.error = ''
              }, 3000)
            }
          }
        } else {
          this.error = err.response?.data?.message || 'An unexpected error occurred.'
        }
      }
    },
    updateData(newData) {
      this.data = newData // Update the data state with new values
    },
    clearError() {
      this.error = '' // Clear the error message
    },
  },
})
