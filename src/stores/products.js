import { defineStore } from 'pinia'
import { useCurrStore } from '@/stores/currencies'
import { useProductModalStore } from '@/stores/productModal'
import router from '@/router'

import axios from '@/plugins/axios'
export const useProductsStore = defineStore('products', {
  state: () => ({
    productsNew: [],
    products: [],
    meta: {},
    activeProduct: {},
    error: '',
    search: '',
    loader: false,
  }),
  actions: {
    setSearch(val) {
      this.search = val
    },
    getNewProducts() {
      const currStore = useCurrStore()
      axios
        .get(import.meta.env.VITE_APP_API + 'items/list?new=true', {
          params: { currency: currStore.currency.code },
        })
        .then((res) => {
          this.productsNew = res.data.payload
        })
    },
    getProducts(category, sort, page, listType, quality) {
      this.loader = true
      const currStore = useCurrStore()
      if (currStore.currency.code) {
        axios
          .get(
            import.meta.env.VITE_APP_API +
              'items/list?limit=12' +
              (category && category.length ? '&type=' + category : '') +
              (quality && quality.length ? '&quality=' + quality : '') +
              (sort ? '&sort=' + sort : '') +
              (page ? '&page=' + page : '') +
              (this.search ? '&search=' + this.search : '') +
              (listType != 'all' ? '&' + listType + '=true' : ''),

            {
              params: { currency: currStore.currency.code },
            },
          )
          .then((res) => {
            this.products = res.data.payload
            this.meta = res.data.meta
            this.loader = false
          })
      }
    },
    buy() {
      const productModalStore = useProductModalStore()
      axios
        .post(import.meta.env.VITE_APP_API + 'purchase/prompt', {
          prompt_id: this.activeProduct.id,
        })
        .then((res) => {
          if (res.data.status == 'OK') {
            productModalStore.closeConfirmModal()
            router.push({ path: '/profile/orders' })
          } else {
            let self = this
            self.error = res
            setTimeout(function () {
              self.error = ''
            }, 3000)
          }
        })
        .catch((err) => {
          console.log(err)
          if (err?.response?.data) {
            let self = this
            self.error = err.response.data.message
            setTimeout(function () {
              self.error = ''
            }, 3000)
          } else {
            let self = this
            self.error = err
            setTimeout(function () {
              self.error = ''
            }, 3000)
          }
        })
    },
    getProductContent(id) {
      router.push({ path: '/products/' + id })
      axios
        .get(import.meta.env.VITE_APP_API + 'items/' + id)
        .then((res) => {
          this.activeProduct = res.data.payload
        })
        .catch((err) => {
          let self = this
          self.error = err
          setTimeout(function () {
            self.error = ''
          }, 3000)
        })
    },
  },
})
