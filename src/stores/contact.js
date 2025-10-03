import { defineStore } from 'pinia'

import axios from '@/plugins/axios'
export const useContactStore = defineStore('contact', {
  state: () => ({
    error: '',
    success: '',
  }),
  actions: {
    submit(data) {
      axios
        .post(import.meta.env.VITE_APP_API + 'contact-us', data)
        .then(() => {
          let self = this
          self.success = 'success'
          setTimeout(function () {
            self.success = ''
          }, 3000)
        })
        .catch((err) => {
          let self = this
          self.error = err.response.data.message
          setTimeout(function () {
            self.error = ''
          }, 3000)
        })
    },
  },
})
