// stores/cart.js
import { defineStore } from 'pinia'
import axios from '@/plugins/axios'
import { useAuthStore } from './auth'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    unavailableItems: [],
    isLoading: false,
    itemsLoading: {},
    error: null,
    itemErrors: {},
    isUniqueItems: true,
    rentalPeriods: [],
  }),

  getters: {
    cartItemsCount: state => state.items.length,
    isEmpty: state => state.items.length === 0,
    hasError: state => !!state.error,
    cartTotal: state => {
      return state.items.reduce((total, item) => {
        return total + parseFloat(item.item.price) * item.count
      }, 0)
    },
    currencySymbol: () => '€',
    isItemInCart: state => (itemId, type) => {
      return state.items.some(
        item =>
          item.purchasable_id === itemId && item.purchasable_type === type,
      )
    },
  },

  actions: {
    async fetchRentalPeriods() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        this.rentalPeriods = []
        return { success: true }
      }

      try {
        this.error = null
        this.isLoading = true

        const response = await axios.get('/rental-periods')
        this.rentalPeriods = response.data.payload || []
        return { success: true }
      } catch (err) {
        console.error('Error fetching cart content:', err)

        // Ensure items is an empty array even on error
        this.rentalPeriods = []
        this.error =
          err.response?.data?.message || 'Failed to fetch cart content'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },
    async fetchCartContent() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        this.items = []
        return { success: true }
      }

      try {
        this.error = null
        this.isLoading = true

        const response = await axios.get('/cart')
        if (
          response.data &&
          response.statusText === 'OK' &&
          Array.isArray(response.data.data.items)
        ) {
          this.items = response.data.data.items || []
          return { success: true }
        } else {
          // Ensure items is at least an empty array even on error
          this.items = []
          throw new Error(
            response.data?.message || 'Invalid response format from server',
          )
        }
      } catch (err) {
        console.error('Error fetching cart content:', err)

        // Ensure items is an empty array even on error
        this.items = []
        this.error =
          err.response?.data?.message || 'Failed to fetch cart content'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async rentCard(itemId, period) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        return {
          success: false,
          isAlreadyInCart: false,
          message: 'please_login_to_rent_card',
          isUnauthorized: true,
        }
      }

      try {
        this.setItemLoading(itemId, true)

        const response = await axios.post('/cards/rent', {
          id: itemId,
          rental_period_id: period,
        })
        if (response.statusText === 'OK') {
          return {
            success: true,
            isAlreadyInCart: false,
            message: 'Rental created',
          }
        }

        throw new Error(response.data.message || 'Failed to rent a card')
      } catch (error) {
        const isAlreadyInCart = error.message.includes('already in your cart')

        // Check for 401 Unauthorized error
        if (error.response?.status === 401) {
          return {
            success: false,
            isAlreadyInCart: false,
            message: 'please_login_to_add_to_cart',
            isUnauthorized: true,
          }
        }

        return {
          success: false,
          isAlreadyInCart,
          message: error.response?.data?.message || error.message,
        }
      } finally {
        this.setItemLoading(itemId, false)
      }
    },

    isNumber(value) {
      return typeof value === 'number' && !Number.isNaN(value)
    },

    async addToCart(itemId, quantity, type, rent) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        return {
          success: false,
          isAlreadyInCart: false,
          message: 'please_login_to_add_to_cart',
          isUnauthorized: true,
        }
      }

      try {
        if (this.isUniqueItems && this.isItemInCart(itemId)) {
          throw new Error('This item is already in your cart')
        }

        this.setItemLoading(itemId, true)

        const rentalPeriodId = rent
          ? this.isNumber(rent)
            ? rent
            : this.rentalPeriods.find(item => item.slug === '24h')?.id
          : undefined

        const payload = {
          type,
          id: itemId,
          ...(!rent && { quantity }),
          ...(rent &&
            rentalPeriodId && {
              rental_period_id: rentalPeriodId,
            }),
        }

        const response = await axios.post('/cart/add', payload)
        if (response.statusText === 'OK') {
          await this.fetchCartContent()
          return {
            success: true,
            isAlreadyInCart: false,
            message: 'Item added to cart',
          }
        }

        throw new Error(response.data.message || 'Failed to add item to cart')
      } catch (error) {
        const isAlreadyInCart = error.message.includes('already in your cart')

        // Check for 401 Unauthorized error
        if (error.response?.status === 401) {
          return {
            success: false,
            isAlreadyInCart: false,
            message: 'please_login_to_add_to_cart',
            isUnauthorized: true,
          }
        }

        return {
          success: false,
          isAlreadyInCart,
          message: error.response?.data?.message || error.message,
        }
      } finally {
        this.setItemLoading(itemId, false)
      }
    },

    async updateQuantity(itemId, quantity) {
      try {
        this.setItemLoading(itemId, true)
        const response = await axios.patch(`/cart/items/${itemId}`, {
          quantity: quantity,
        })

        if (response.statusText === 'OK') {
          await this.fetchCartContent()
          return { success: true }
        }

        throw new Error(response.data.message || 'Failed to update quantity')
      } catch (error) {
        this.setItemError(
          itemId,
          error.response?.data?.message || error.message,
        )
        return { success: false, error: error.message }
      } finally {
        this.setItemLoading(itemId, false)
      }
    },

    async removeFromCart(productId, type, rent) {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return { success: false }

      try {
        this.error = null
        this.setItemLoading(productId, true)

        const rentalPeriodId = rent
          ? this.isNumber(rent)
            ? rent
            : this.rentalPeriods.find(item => item.slug === '24h')?.id
          : undefined

        const response = await axios.delete('/cart/items/by-product', {
          params: {
            type,
            id: productId,
            ...(rent &&
              rentalPeriodId && {
                rental_period_id: rentalPeriodId,
              }),
          },
        })

        if (response.statusText === 'OK') {
          await this.fetchCartContent()
          this.setItemError(productId, null)
          return { success: true }
        }

        throw new Error(response.data.message || 'Unknown error occurred')
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || 'Failed to remove item from cart'
        this.error = errorMessage
        this.setItemError(productId, errorMessage)

        return { success: false, error: errorMessage }
      } finally {
        this.setItemLoading(productId, false)
      }
    },

    async removeMultipleFromCart(productIds, areVariations = false) {
      const authStore = useAuthStore()
      if (
        !authStore.isAuthenticated ||
        !productIds ||
        productIds.length === 0
      ) {
        return { success: true }
      }

      try {
        this.error = null

        productIds.forEach(id => this.setItemLoading(id, true))

        for (const id of productIds) {
          await this.removeFromCart(id, areVariations)
        }

        return { success: true }
      } catch {
        const errorMessage = 'Failed to remove selected items'
        this.error = errorMessage
        return { success: false, error: errorMessage }
      } finally {
        productIds.forEach(id => this.setItemLoading(id, false))
      }
    },

    async clearCart() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) {
        this.resetState()
        return { success: true }
      }

      try {
        this.error = null
        this.isLoading = true

        await axios.post('/cart/clear')
        this.resetState()

        return { success: true }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || 'Failed to clear cart'
        this.error = errorMessage

        return { success: false, error: errorMessage }
      } finally {
        this.isLoading = false
      }
    },

    resetState() {
      this.items = []
      this.unavailableItems = []
      this.error = null
      this.itemErrors = {}
      this.itemsLoading = {}
    },

    setLoading(status) {
      this.isLoading = status
    },

    setItemLoading(itemId, status) {
      if (!itemId) return
      this.itemsLoading = { ...this.itemsLoading, [itemId]: status }
    },

    setItemError(itemId, errorMessage) {
      if (!itemId) return

      if (errorMessage) {
        this.itemErrors = { ...this.itemErrors, [itemId]: errorMessage }
      } else if (this.itemErrors[itemId]) {
        const newErrors = { ...this.itemErrors }
        delete newErrors[itemId]
        this.itemErrors = newErrors
      }
    },

    isItemLoading(itemId) {
      return !!this.itemsLoading[itemId]
    },

    getItemError(itemId) {
      return this.itemErrors[itemId] || null
    },

    clearItemError(itemId) {
      delete this.itemErrors[itemId]
    },

    $reset() {
      this.resetState()
    },
  },
})
