import { defineStore } from 'pinia'

import i18n from '@/i18n'
import axios from '@/plugins/axios'

export const useContactStore = defineStore('contact', {
  state: () => ({
    error: '',
    success: '',
  }),

  actions: {
    clearMessages() {
      this.error = ''
      this.success = ''
    },

    clearSuccessAfterDelay() {
      setTimeout(() => {
        this.success = ''
      }, 3000)
    },

    clearErrorAfterDelay() {
      setTimeout(() => {
        this.error = ''
      }, 3000)
    },

    async submit(name, email, phone, message, topic = '') {
      this.clearMessages()

      try {
        const response = await axios.post('contact-us', {
          name,
          email,
          phone,
          message,
          topic,
        })

        if (response.status === 200 && response.data?.status === 'OK') {
          this.success = i18n.global.t('Your message has been sent successfully.')

          this.clearSuccessAfterDelay()

          return true
        }

        this.error = i18n.global.t('Something went wrong. Please try again.')

        this.clearErrorAfterDelay()

        return false
      } catch (err) {
        const serverMessage = err?.response?.data?.message || err?.response?.data?.error

        this.error = serverMessage
          ? i18n.global.t(serverMessage)
          : i18n.global.t('Something went wrong. Please try again.')

        this.clearErrorAfterDelay()

        return false
      }
    },
  },
})
