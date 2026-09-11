import { defineStore } from 'pinia'

import axios from '@/plugins/axios'
import { useCurrStore } from '@/stores/currencies'

export const useWishListStore = defineStore('wishlist', {
  state: () => ({
    items: [],
    success: '',
    error: '',
    loader: false,
  }),

  actions: {
    clearMessages() {
      this.success = ''
      this.error = ''
    },

    showSuccess(message) {
      this.success = message
      this.error = ''

      setTimeout(() => {
        this.success = ''
      }, 3000)
    },

    showError(error, fallbackMessage) {
      this.error = error?.response?.data?.message || fallbackMessage

      this.success = ''

      setTimeout(() => {
        this.error = ''
      }, 3000)
    },

    async get() {
      const currStore = useCurrStore()

      if (!currStore.currency?.code) {
        return []
      }

      try {
        const res = await axios.get('user/wishlist/items', {
          params: {
            currency: currStore.currency.code,
          },
        })

        this.items = Array.isArray(res.data?.payload) ? res.data.payload : []

        return this.items
      } catch (error) {
        this.items = []

        this.showError(error, 'Failed to load wishlist')

        return []
      }
    },

    async add(id) {
      if (!id) {
        return false
      }

      this.clearMessages()
      this.loader = true

      try {
        await axios.post('user/wishlist/add', {
          id,
        })

        await this.get()

        this.showSuccess('Added to wishlist')

        return true
      } catch (error) {
        this.showError(error, 'Failed to add to wishlist')

        return false
      } finally {
        this.loader = false
      }
    },

    async remove(id) {
      if (!id) {
        return false
      }

      this.clearMessages()
      this.loader = true

      try {
        await axios.post('user/wishlist/remove', {
          id,
        })

        await this.get()

        this.showSuccess('Removed from wishlist')

        return true
      } catch (error) {
        this.showError(error, 'Failed to remove from wishlist')

        return false
      } finally {
        this.loader = false
      }
    },
  },
})
