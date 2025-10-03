import { defineStore } from 'pinia'
import { useCurrStore } from '@/stores/currencies'

import axios from '@/plugins/axios'
export const useRecommendedStore = defineStore('recommendedProducts', {
  state: () => ({
    products: [],
  }),
  actions: {
    getProducts() {
      const currStore = useCurrStore()
      axios
        .get(import.meta.env.VITE_APP_API + 'products/trending', {
          params: { currency: currStore.currency.code },
        })
        .then((res) => {
          this.products = res.data.payload
        })
    },
  },
})
