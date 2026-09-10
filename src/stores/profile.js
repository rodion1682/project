import { defineStore } from 'pinia'
import { useCurrStore } from '@/stores/currencies'

import axios from '@/plugins/axios'
export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: {},
    error: '',
    success: '',
    orderHistory: [],
    depositHistory: [],
  }),
  actions: {
    getProfile() {
      const currStore = useCurrStore()
      axios
        .get('user/profile', {
          params: { currency: currStore.currency.code },
        })
        .then((res) => {
          this.profile = res.data
        })
    },
    getOrderHistory() {
      axios.get('product-orders').then((res) => {
        this.orderHistory = res.data.data
      })
    },
    getDepositHistory() {
      axios.get('deposit/history').then((res) => {
        this.depositHistory = res.data.payload
      })
    },
    updateProfile(name, surname, email) {
      axios
        .put('user/profile', {
          name: name,
          surname: surname,
          email: email,
        })
        .then(() => {
          let self = this
          self.success = 'Success'
          self.error = ''
          setTimeout(function () {
            self.success = ''
          }, 3000)
        })
        .catch((err) => {
          let self = this
          self.error = err.response.data.message
          setTimeout(function () {
            self.error = ''
          }, 3000)
        })
    },
  },
})
