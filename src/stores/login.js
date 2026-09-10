import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth' // Import the auth store
import { useLoginModalStore } from '@/stores/loginModal'
import axios from '@/plugins/axios'

export const useLoginStore = defineStore('login', {
  state: () => ({
    data: {}, // Holds login form data
    error: '', // Holds error messages
  }),
  actions: {
    async submitLogin() {
      try {
        // Perform the login API request
        let res = await axios.post('login', this.data)

        if (res.data.status === 'ERROR') {
          // If there's an error from the server, set the error message
          this.error = res.data.message
        } else {
          const loginModalStore = useLoginModalStore()
          loginModalStore.closeModal()
          this.clearError()
          // Access the auth store inside this method
          const authStore = useAuthStore()
          authStore.checkAuth() // Call the checkAuth method from authStore
        }
      } catch (err) {
        // Handle any other errors, such as network or unexpected server errors
        this.error = err.response?.data?.message || 'An unexpected error occurred.'
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
