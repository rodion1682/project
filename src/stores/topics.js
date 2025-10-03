import { defineStore } from 'pinia'

import axios from '@/plugins/axios'
export const useTopicStore = defineStore('topics', {
  state: () => ({
    topics: [],
  }),
  actions: {
    async getTopics() {
      await axios.get(import.meta.env.VITE_APP_API + 'categories').then((res) => {
        this.topics = res?.data?.payload?.filter((item) => item.parent_id === null)
      })
    },
  },
})
