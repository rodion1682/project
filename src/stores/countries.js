import { defineStore } from 'pinia'

import axios from '@/plugins/axios'
export const useCountriesStore = defineStore('countries', {
  state: () => ({
    countries: [],
  }),
  actions: {
    getCountries() {
      axios.get(import.meta.env.VITE_APP_API + 'countries').then((res) => {
        this.countries = res.data.payload
      })
    },
  },
})
