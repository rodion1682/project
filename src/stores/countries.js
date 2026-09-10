import { defineStore } from 'pinia'

import axios from '@/plugins/axios'
export const useCountriesStore = defineStore('countries', {
  state: () => ({
    countries: [],
  }),
  actions: {
    getCountries() {
      axios.get('countries').then((res) => {
        this.countries = res.data.payload
      })
    },
  },
})
