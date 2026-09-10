import { defineStore } from 'pinia'

import axios from '@/plugins/axios'
export const useContactStore = defineStore('contact', {
  state: () => ({
    error: '',
    success: '',
  }),
  actions: {
    submit(name, email, phone, message) {
      axios
        .post('contact-us', {
          name: name,
          email: email,
          phone: phone,
          message: message,
        })
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
