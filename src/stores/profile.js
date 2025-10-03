import { defineStore } from 'pinia'
import { useCurrStore } from '@/stores/currencies'
import { useAuthStore } from '@/stores/auth'
import axios from '@/plugins/axios'

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: {},
    error: '',
    success: '',
    tradeError: '',
    tradeSuccess: '',
    orderHistory: {
      data: [],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 5,
        total: 0,
      },
    },
    offerHistory: [],
    depositHistory: {
      data: [],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: 5,
        total: 0,
      },
    },
    error2: '',
  }),

  actions: {
    getProfile() {
      const currStore = useCurrStore()
      axios
        .get(import.meta.env.VITE_APP_API + 'user/profile', {
          params: { currency: currStore.currency.code },
        })
        .then((res) => {
          this.profile = res.data
        })
    },
    getBalance() {
      const currStore = useCurrStore()
      axios
        .get('/user/balance', {
          params: { currency: currStore.currency.code },
        })
        .then((res) => {
          this.profile = {...this.profile, ...res.data}
        })
    },
    async getOrderHistory(page = 1) {
      const currStore = useCurrStore()
      try {
        const response = await axios.get('/generated-assets', {
          params: {
            page,
            currency: currStore.currency.code,
          },
        })
        this.orderHistory = {
          data: response.data.data,
          meta: response.data.meta,
        }
      } catch (err) {
        console.error('Failed to fetch order history', err)
        this.orderHistory = {
          data: [],
          meta: { current_page: 1, last_page: 1, per_page: 5, total: 0 },
        }
      }
    },
    getAllAssets() {
      const currStore = useCurrStore()
      return axios
        .get('/generated-assets', {
          params: {
            page: 1,
            per_page: 1000000,
            currency: currStore.currency.code,
          },
        })
        .then((res) => res.data.data)
        .catch((err) => {
          console.error('Failed to fetch all assets', err)
          return []
        })
    },
    async getDepositHistory(page = 1) {
      const currStore = useCurrStore()
      try {
        const response = await axios.get('/deposit/history', {
          params: {
            page,
            currency: currStore.currency.code,
          },
        })
        this.depositHistory = {
          data: response.data.data,
          meta: response.data.meta,
        }
      } catch (err) {
        console.error('Failed to fetch order history', err)
        this.depositHistory = {
          data: [],
          meta: { current_page: 1, last_page: 1, per_page: 5, total: 0 },
        }
      }
    },

    block() {
      const authStore = useAuthStore()
      axios
        .post(import.meta.env.VITE_APP_API + 'user/block')
        .then(() => {
          authStore.checkAuth()
        })
        .catch((err) => {
          this.error = err.response.data.message
          setTimeout(() => (this.error = ''), 3000)
        })
    },

    delete() {
      const authStore = useAuthStore()
      axios
        .post(import.meta.env.VITE_APP_API + 'user/delete')
        .then(() => {
          authStore.checkAuth()
        })
        .catch((err) => {
          this.error = err.response.data.message
          setTimeout(() => (this.error = ''), 3000)
        })
    },

    updateTradeLink(link) {
      axios
        .put(import.meta.env.VITE_APP_API + 'user/update-trade-link', { url: link })
        .then(() => {
          this.tradeSuccess = 'Success'
          this.tradeError = ''
          setTimeout(() => (this.tradeSuccess = ''), 3000)
        })
        .catch((err) => {
          this.tradeError = err.response.data.message
          setTimeout(() => (this.tradeError = ''), 3000)
        })
    },

    updateEmail(email) {
      axios
        .put(import.meta.env.VITE_APP_API + 'user/profile', { email })
        .then(() => {
          this.success = 'Success'
          this.error = ''
          setTimeout(() => (this.success = ''), 3000)
        })
        .catch((err) => {
          this.error = err.response.data.message
          setTimeout(() => (this.error = ''), 3000)
        })
    },

    updateProfile(name, surname, email, phone) {
      axios
        .put(import.meta.env.VITE_APP_API + 'user/profile', {
          name,
          surname,
          email,
          phone,
        })
        .then(() => {
          this.success = 'Success'
          this.error2 = ''
          setTimeout(() => (this.success = ''), 3000)
        })
        .catch((err) => {
          this.error2 = err.response.data.message
          setTimeout(() => (this.error2 = ''), 3000)
        })
    },
  },
})
