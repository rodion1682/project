import { defineStore } from 'pinia'

import axios from '@/plugins/axios'
export const usePlatformsStore = defineStore('platforms', {
  state: () => ({
    platforms: [],
  }),
  actions: {
    async getPlatforms() {
      await axios.get('categories').then((res) => {
        this.platforms = res.data.data.filter((item) => item.parent === null)
      })
    },
  },
})
