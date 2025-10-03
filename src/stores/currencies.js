import { defineStore } from 'pinia'

import axios from '@/plugins/axios'
export const useCurrStore = defineStore('currencies', {
  state: () => ({
    currencies: false,
    currency: {},
  }),
  actions: {
    getCurrencies() {
      axios.get(import.meta.env.VITE_APP_API + 'currencies').then((res) => {
        this.currencies = res.data.payload

        if (localStorage.getItem('currency')) {
          if (Object.keys(localStorage.getItem('currency')).length !== 0) {
            this.currency = JSON.parse(localStorage.getItem('currency'))
          }
        } else {
          this.currency = this.currencies[0]
        }
      })
    },
    setActiveCurrency(value) {
      localStorage.setItem('currency', JSON.stringify(value))
      this.currency = value
    },
  },
})
