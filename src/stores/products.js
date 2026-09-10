import { defineStore } from 'pinia'
import { useCurrStore } from '@/stores/currencies'

import axios from '@/plugins/axios'
export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    meta: {},
    loader: true,
  }),
  actions: {
    getProducts(id, page, sort, search) {
      this.loader = true
      const currStore = useCurrStore()
      axios
        .get('products', {
          params: {
            category_id: id,
            search: search,
            currency: currStore.currency.code,
            page: page,
            sort: sort,
          },
        })
        .then((res) => {
          this.products = res.data.data
          this.meta = res.data.meta
          this.loader = false
        })
    },
  },
})
