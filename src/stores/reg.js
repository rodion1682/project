import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth' // Import the auth store
import { useRegModalStore } from '@/stores/regModal'
import axios from '@/plugins/axios'

export const useRegStore = defineStore('reg', {
  state: () => ({
    data: {}, // Holds login form data
    error: '', // Holds error messages
  }),
  actions: {
    async submitReg() {
      try {
        // Perform the login API request
        let res = await axios.post('register', this.data)

        if (res.data.status === 'ERROR') {
          // If there's an error from the server, set the error message
          this.error = res.data.message
        } else {
          // Access the auth store inside this method
          const authStore = useAuthStore()
          const regModalStore = useRegModalStore()
          regModalStore.closeModal()
          this.clearError()
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
