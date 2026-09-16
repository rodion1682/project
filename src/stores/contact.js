import { defineStore } from 'pinia'

import axios from '@/plugins/axios'
import i18n from '@/plugins/i18n'

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

      const { t } = i18n.global

      try {
        const response = await axios.post('contact-us', {
          name,
          email,
          phone,
          message,
          topic,
        })

        if (response.status === 200 && response.data?.status === 'OK') {
          this.success = t('Your message has been sent successfully.')

          this.clearSuccessAfterDelay()

          return true
        }

        this.error = t('Something went wrong. Please try again.')

        this.clearErrorAfterDelay()

        return false
      } catch (err) {
        const serverMessage = err?.response?.data?.message || err?.response?.data?.error

        this.error = serverMessage ? t(serverMessage) : t('Something went wrong. Please try again.')

        this.clearErrorAfterDelay()

        return false
      }
    },
  },
})
