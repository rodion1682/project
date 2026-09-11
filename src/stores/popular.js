import { useCurrStore } from '@/stores/currencies'
import { defineStore } from 'pinia'

import axios from '@/plugins/axios'

export const usePopularStore = defineStore('popular', {
  state: () => ({
    products: [],
    deal: null,
  }),

  actions: {
    async getProducts() {
      const currStore = useCurrStore()

      try {
        const res = await axios.get('catalog/popular', {
          params: {
            currency: currStore.currency.code,
          },
        })

        this.products = res.data.data || []
      } catch (error) {
        this.products = []
      }
    },

    async getDeal() {
      const currStore = useCurrStore()

      try {
        const res = await axios.get('catalog/popular', {
          params: {
            currency: currStore.currency.code,
            page_size: 1,
          },
        })

        this.deal = res.data.data?.[0] || null
      } catch (error) {
        this.deal = null
      }
    },
  },
})
