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
    async getProducts(id, page = 1, sort = '', search = '', pageSize = 10) {
      this.loader = true

      const currStore = useCurrStore()

      try {
        const res = await axios.get('products', {
          params: {
            category_id: id || undefined,
            search: search || undefined,
            currency: currStore.currency.code,
            page,
            sort: sort || undefined,
            page_size: pageSize,
          },
        })

        this.products = res.data.data || []
        this.meta = res.data.meta || {}
      } catch (error) {
        console.error('Failed to load products:', error)

        this.products = []
        this.meta = {}
      } finally {
        this.loader = false
      }
    },
  },
})
