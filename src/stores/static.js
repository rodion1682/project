import { defineStore } from 'pinia'

import axios from '@/plugins/axios'
export const useStaticStore = defineStore('static', {
  state: () => ({
    static: [],
  }),
  actions: {
    getStatic() {
      axios.get(import.meta.env.VITE_APP_API + 'static-pages').then((res) => {
        this.static = res.data.payload
      })
    },
  },
})
