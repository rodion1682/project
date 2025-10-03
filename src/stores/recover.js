import { defineStore } from 'pinia'
import { useRecoverModalStore } from '@/stores/recoverModal'
import axios from '@/plugins/axios'

export const useRecoverStore = defineStore('recover', {
  state: () => ({
    data: {}, // Holds login form data
    error: '', // Holds error messages,
    success: '',
  }),
  actions: {
    async submitRecover() {
      try {
        // Perform the login API request
        let res = await axios.post('/user/request-password-restore', this.data)

        if (res.data.status === 'ERROR') {
          // If there's an error from the server, set the error message
          this.error = res.data.message
        } else {
          const recoverModalStore = useRecoverModalStore()
          let self = this
          self.success = 'Check your email!'
          setTimeout(function () {
            recoverModalStore.closeModal()
            self.success = ''
          }, 3000)
          this.clearError()
          // Access the auth store inside this method
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
