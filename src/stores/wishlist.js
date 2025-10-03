import { defineStore } from 'pinia'
import { useCurrStore } from '@/stores/currencies'

import axios from '@/plugins/axios'
export const useWishListStore = defineStore('wishlist', {
  state: () => ({
    items: [],
    success: '',
    error: '',
  }),
  actions: {
    add(id) {
      axios
        .post(import.meta.env.VITE_APP_API + 'user/wishlist/add', {
          id: id,
        })
        .then(() => {
          let self = this
          self.success = 'Added to wishlist'
          setTimeout(function () {
            self.success = ''
          }, 3000)

          this.get()
        })
        .catch((err) => {
          let self = this
          self.error = err.response.data.message
          setTimeout(function () {
            self.error = ''
          }, 3000)
        })
    },
    remove(id) {
      axios
        .post(import.meta.env.VITE_APP_API + 'user/wishlist/remove', {
          id: id,
        })
        .then(() => {
          let self = this
          self.success = 'Removed from wishlist'
          setTimeout(function () {
            self.success = ''
          }, 3000)
          this.get()
        })
        .catch((err) => {
          let self = this
          self.error = err.response.data.message
          setTimeout(function () {
            self.error = ''
          }, 3000)
        })
    },

    get() {
      const currStore = useCurrStore()
      axios
        .get(import.meta.env.VITE_APP_API + 'user/wishlist/items', {
          params: { currency: currStore.currency.code },
        })
        .then((res) => {
          this.items = res.data.payload
        })
    },
  },
})
