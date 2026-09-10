import { defineStore } from 'pinia'
import router from '@/router'
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
    getCart() {
      const currStore = useCurrStore()
      axios
        .get('cart/contents', {
          params: { currency: currStore.currency.code },
        })
        .then((res) => {
          this.cart = res.data
        })
    },
    checkout(name, surname, phone, country, city, address, postcode) {
      const currStore = useCurrStore()
      axios
        .post('orders/checkout', {
          name: name,
          surname: surname,
          phone: phone,
          country: country,
          city: city,
          address: address,
          postCode: postcode,
          currency: currStore.currency.code,
        })
        .then((res) => {
          window.location = res.data.redirect_url
        })
        .catch((err) => {
          let self = this
          self.error = err.response.data.message
          setTimeout(function () {
            self.error = ''
          }, 3000)
        })
    },
    add(id) {
      const currStore = useCurrStore()
      axios
        .post('cart/add', {
          id: id,
          count: 1,
          currency: currStore.currency.code,
        })
        .then(() => {
          let self = this
          self.success = 'Product added to cart!'
          self.error = ''
          setTimeout(function () {
            self.success = ''
          }, 3000)
          self.getCart()
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
      const currStore = useCurrStore()
      axios
        .post('cart/remove', {
          id: id,
          currency: currStore.currency.code,
        })
        .then(() => {
          this.getCart()
        })
    },
    payFromBalance() {
      const profileStore = useProfileStore()
      axios
        .post('cart/purchase')
        .then(() => {
          this.error = ''
          router.push({ path: '/profile/orders' })
          this.getCart()
          profileStore.getProfile()
        })
        .catch((err) => {
          let self = this
          self.balanceError = err.response.data.message
          setTimeout(function () {
            self.balanceError = ''
          }, 3000)
        })
    },
  },
})
