import { defineStore } from 'pinia'
import { useCurrStore } from '@/stores/currencies'

import axios from '@/plugins/axios'
export const usePopularStore = defineStore('popular', {
  state: () => ({
    products: false,
  }),
  actions: {
    getProducts() {
      const currStore = useCurrStore()
      axios
        .get('catalog/popular', {
          params: { currency: currStore.currency.code },
        })
        .then((res) => {
          this.products = res.data.data
        })
    },
  },
})
