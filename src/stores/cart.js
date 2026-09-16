import router from '@/router'
import { defineStore } from 'pinia'

import { useCurrStore } from '@/stores/currencies'
import { useProfileStore } from '@/stores/profile'

import axios from '@/plugins/axios'

export const useCartStore = defineStore('cart', {
  state: () => ({
    cart: null,
    error: '',
    success: '',
    balanceError: '',
    isLoading: false,
  }),

  actions: {
    async getCart() {
      const currStore = useCurrStore()

      this.isLoading = true

      try {
        const res = await axios.get('cart/contents', {
          params: {
            currency: currStore.currency.code,
          },
        })

        this.cart = res.data
      } catch (error) {
        console.error('Failed to load cart:', error)

        this.cart = {
          products: [],
        }
      } finally {
        this.isLoading = false
      }
    },

    async add(id) {
      const currStore = useCurrStore()

      try {
        const res = await axios.post('cart/add', {
          id,
          count: 1,
          currency: currStore.currency.code,
        })

        this.cart = res.data
        this.success = 'Product added to cart!'
        this.error = ''

        setTimeout(() => {
          this.success = ''
        }, 3000)
      } catch (err) {
        this.error = err.response?.data?.message || 'Unable to add product'

        setTimeout(() => {
          this.error = ''
        }, 3000)
      }
    },

    async remove(id) {
      const currStore = useCurrStore()

      try {
        await axios.post('cart/remove', {
          id,
          currency: currStore.currency.code,
        })

        await this.getCart()
      } catch (error) {
        console.error('Failed to remove product:', error)
      }
    },

    checkout(name, surname, phone, country, city, address, postcode) {
      const currStore = useCurrStore()

      axios
        .post('orders/checkout', {
          name,
          surname,
          phone,
          country,
          city,
          address,
          postCode: postcode,
          currency: currStore.currency.code,
        })
        .then((res) => {
          window.location = res.data.redirect_url
        })
        .catch((err) => {
          this.error = err.response?.data?.message || 'Unable to complete checkout'

          setTimeout(() => {
            this.error = ''
          }, 3000)
        })
    },

    async payFromBalance() {
      const profileStore = useProfileStore()

      try {
        await axios.post('cart/purchase')

        this.error = ''
        this.balanceError = ''

        router.push({
          path: '/profile/orders',
        })

        await this.getCart()
        await profileStore.getProfile()

        return true
      } catch (err) {
        this.balanceError = err.response?.data?.message || 'Unable to complete purchase'

        setTimeout(() => {
          this.balanceError = ''
        }, 3000)

        return false
      }
    },
  },
})
