import router from '@/router'
import { defineStore } from 'pinia'

import { useCurrStore } from '@/stores/currencies'
import { useProfileStore } from '@/stores/profile'

import axios from '@/plugins/axios'

export const useCartStore = defineStore('cart', {
  state: () => ({
    cart: false,
    error: '',
    success: '',
    balanceError: '',
  }),

  actions: {
    async getCart() {
      const currStore = useCurrStore()

      try {
        const res = await axios.get('cart/contents', {
          params: {
            currency: currStore.currency.code,
          },
        })

        this.cart = res.data
      } catch (error) {
        console.error('Failed to load cart:', error)
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
          this.error = err.response.data.message

          setTimeout(() => {
            this.error = ''
          }, 3000)
        })
    },

    payFromBalance() {
      const profileStore = useProfileStore()

      axios
        .post('cart/purchase')
        .then(() => {
          this.error = ''

          router.push({
            path: '/profile/orders',
          })

          this.getCart()
          profileStore.getProfile()
        })
        .catch((err) => {
          this.balanceError = err.response.data.message

          setTimeout(() => {
            this.balanceError = ''
          }, 3000)
        })
    },
  },
})
