import { defineStore } from 'pinia'

import axios from '@/plugins/axios'
export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    categories: [],
    qualities: [],
  }),
  actions: {
    getCategories() {
      axios.get(import.meta.env.VITE_APP_API + 'items/filter-data').then((res) => {
        this.categories = res?.data?.payload?.types
        this.qualities = res?.data?.payload?.qualities
      })
    },
  },
})
