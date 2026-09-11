import { defineStore } from 'pinia'

import axios from '@/plugins/axios'

export const useWishListStore = defineStore('wishlist', {
  state: () => ({
    items: JSON.parse(localStorage.getItem('wishlist') || '[]'),
    success: '',
    error: '',
    loader: false,
  }),

  actions: {
    save() {
      localStorage.setItem('wishlist', JSON.stringify(this.items))
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

    async add(product) {
      const id = typeof product === 'object' ? product.id : product

      if (!id || this.loader) {
        return false
      }

      if (this.items.some((item) => item.id === id)) {
        return true
      }

      this.clearMessages()
      this.loader = true

      try {
        await axios.post('user/wishlist/add', {
          id,
        })

        if (typeof product === 'object') {
          this.items.push(product)
        } else {
          this.items.push({
            id,
          })
        }

        this.save()

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
      const id = typeof product === 'object' ? product.id : product

      if (!id || this.loader) {
        return false
      }

      this.clearMessages()
      this.loader = true

      try {
        await axios.post('user/wishlist/remove', {
          id,
        })

        this.items = this.items.filter((item) => item.id !== id)

        this.save()

        this.showSuccess('Removed from wishlist')

        return true
      } catch (error) {
        this.showError(error, 'Failed to remove from wishlist')

        return false
      } finally {
        this.loader = false
      }
    },

    clear() {
      this.items = []
      this.save()
    },
  },
})
