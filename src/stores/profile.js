import { useCurrStore } from '@/stores/currencies'
import { defineStore } from 'pinia'

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
    async getProfile() {
      const currStore = useCurrStore()

      const res = await axios.get('user/profile', {
        params: {
          currency: currStore.currency.code,
        },
      })

      this.profile = res.data

      return this.profile
    },

    async getOrderHistory() {
      const res = await axios.get('product-orders')

      this.orderHistory = res.data.data

      return this.orderHistory
    },

    async getDepositHistory() {
      const res = await axios.get('deposit/history')

      this.depositHistory = res.data.payload

      return this.depositHistory
    },

    async updateProfile(data) {
      this.error = ''
      this.success = ''

      try {
        const res = await axios.put('user/profile', data)

        this.success = 'Success'

        setTimeout(() => {
          this.success = ''
        }, 3000)

        return res.data
      } catch (error) {
        this.error = error?.response?.data?.message || 'Failed to update profile'

        setTimeout(() => {
          this.error = ''
        }, 3000)

        throw error
      }
    },
  },
})
