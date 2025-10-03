import { defineStore } from 'pinia'

import axios from '@/plugins/axios'
export const useSocialsStore = defineStore('socials', {
  state: () => ({
    socials: false,
  }),
  actions: {
    getSocials() {
      axios.get(import.meta.env.VITE_APP_API + 'social-links').then((res) => {
        this.socials = res.data.payload
      })
    },
  },
})
