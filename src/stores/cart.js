import { defineStore } from 'pinia'
import router from '@/router'
import { useCurrStore } from '@/stores/currencies'
import { useProfileStore } from '@/stores/profile'

import axios from '@/plugins/axios'
export const useCartStore = defineStore('cart', {
  state: () => ({
    cart: [],
    error: '',
    success: '',
    balanceError: '',
    isModalOpen: false,
  }),
  actions: {
    openModal() {
      this.isModalOpen = true
    },
    closeModal() {
      this.isModalOpen = false
    },
    getCart() {
      const currStore = useCurrStore()
      axios
        .get(import.meta.env.VITE_APP_API + 'cart/contents', {
          params: { currency: currStore.currency.code },
        })
        .then((res) => {
          this.cart = res.data.cart
        })
    },
    checkout(name, surname, phone, country, city, address, postcode) {
      const currStore = useCurrStore()
      axios
        .post(import.meta.env.VITE_APP_API + 'orders/checkout', {
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
    buy(id) {
      axios
        .post(import.meta.env.VITE_APP_API + 'purchase/prompt', {
          prompt_id: id,
        })
        .then(() => {
          router.push({ path: '/profile/orders' })
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
        .post(import.meta.env.VITE_APP_API + 'cart/remove', {
          id: id,
          currency: currStore.currency.code,
        })
        .then(() => {
          this.getCart()
        })
    },
    add(id) {
      const currStore = useCurrStore()
      axios
        .post(import.meta.env.VITE_APP_API + 'cart/add', {
          id: id,
          count: 1,
          currency: currStore.currency.code,
        })
        .then(() => {
          let self = this
          self.success = 'Success'
          self.error = ''
          setTimeout(function () {
            self.success = ''
          }, 3000)
          this.getCart()
        })
        .catch((err) => {
          let self = this
          self.error = err.response.data.message
          setTimeout(function () {
            self.error = ''
          }, 3000)
        })
    },
    payFromBalance(id) {
      const profileStore = useProfileStore()
      axios
        .post(import.meta.env.VITE_APP_API + 'purchase/product', {
          paymentType: 'balance',
          steamId: id,
        })
        .then(() => {
          this.error = ''
          this.isModalOpen = false
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
