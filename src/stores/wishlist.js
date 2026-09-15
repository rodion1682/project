import { defineStore } from 'pinia'

import axios from '@/plugins/axios'

import { useCurrStore } from '@/stores/currencies'

const STORAGE_KEY = 'wishlist'

const getStoredItems = () => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')

    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export const useWishListStore = defineStore('wishlist', {
  state: () => ({
    items: getStoredItems(),
    success: '',
    error: '',
    loader: false,
    initialized: false,
  }),

  actions: {
    save() {
      if (typeof window === 'undefined') {
        return
      }

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items))
    },

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

    async getItems() {
      if (this.loader) {
        return this.items
      }

      const currStore = useCurrStore()

      this.clearMessages()
      this.loader = true

      try {
        const response = await axios.get('user/wishlist/items', {
          params: {
            currency: currStore.currency?.code,
          },
        })

        const payload = response.data?.payload

        this.items = Array.isArray(payload) ? payload : []

        this.initialized = true

        this.save()

        return this.items
      } catch (error) {
        this.showError(error, 'Failed to load wishlist')

        return this.items
      } finally {
        this.loader = false
      }
    },

    async add(product) {
      const id = typeof product === 'object' ? product?.id : product

      if (!id || this.loader) {
        return false
      }

      if (this.items.some((item) => Number(item.id) === Number(id))) {
        return true
      }

      this.clearMessages()
      this.loader = true

      try {
        await axios.post('user/wishlist/add', {
          id,
        })

        if (typeof product === 'object' && product !== null) {
          this.items.push(product)
          this.save()
        }

        this.showSuccess('Added to wishlist')

        return true
      } catch (error) {
        this.showError(error, 'Failed to add to wishlist')

        return false
      } finally {
        this.loader = false
      }
    },

    async remove(product) {
      const id = typeof product === 'object' ? product?.id : product

      if (!id) {
        return false
      }

      this.clearMessages()

      try {
        await axios.post('user/wishlist/remove', {
          id,
        })

        this.items = this.items.filter((item) => Number(item.id) !== Number(id))

        this.save()

        this.showSuccess('Removed from wishlist')

        return true
      } catch (error) {
        this.showError(error, 'Failed to remove from wishlist')

        return false
      }
    },

    async clearWishlist() {
      if (!this.items.length) {
        return true
      }

      this.clearMessages()
      this.loader = true

      const ids = this.items.map((item) => item?.id).filter(Boolean)

      try {
        for (const id of ids) {
          await axios.post('user/wishlist/remove', {
            id,
          })
        }

        this.items = []
        this.save()

        this.showSuccess('Wishlist cleared')

        return true
      } catch (error) {
        await this.getItems()

        this.showError(error, 'Failed to clear wishlist')

        return false
      } finally {
        this.loader = false
      }
    },

    clear() {
      this.items = []
      this.initialized = false

      this.save()
    },
  },
})
