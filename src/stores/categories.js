import { defineStore } from 'pinia'

import axios from '@/plugins/axios'
export const useCategoriesStore = defineStore('categories', {
  state: () => ({
    categories: [],
    platforms: [],
  }),
  actions: {
    getCategories() {
      axios.get('categories').then((res) => {
        this.categories = res.data.data.filter((item) => item.parent !== null)
        this.platforms = res.data.data.filter((item) => item.parent === null)
      })
    },
  },
})
