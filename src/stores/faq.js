import { defineStore } from 'pinia'

import axios from '@/plugins/axios'

export const useFaqStore = defineStore('faq', {
  state: () => ({
    faq: [],
    isLoading: false,
    isLoaded: false,
  }),

  actions: {
    async getFaq() {
      if (this.isLoaded || this.isLoading) {
        return this.faq
      }

      this.isLoading = true

      try {
        const response = await axios.get('faq')

        if (response.data?.status === 'OK' && Array.isArray(response.data?.payload)) {
          this.faq = response.data.payload
        } else {
          this.faq = []
        }

        this.isLoaded = true

        return this.faq
      } catch {
        this.faq = []

        return this.faq
      } finally {
        this.isLoading = false
      }
    },
  },
})
