import { defineStore } from 'pinia'

import axios from '@/plugins/axios'
export const useCurrStore = defineStore('currencies', {
  state: () => ({
    currencies: false,
    currency: {},
  }),
  actions: {
    getCurrencies() {
      axios.get('currencies').then((res) => {
        this.currencies = res.data.payload

        if (localStorage.getItem('currency')) {
          this.currency = JSON.parse(localStorage.getItem('currency'))
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
