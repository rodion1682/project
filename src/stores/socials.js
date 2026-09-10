import { defineStore } from 'pinia'

import axios from '@/plugins/axios'
export const useSocialsStore = defineStore('socials', {
  state: () => ({
    socials: [],
  }),
  actions: {
    getSocials() {
      axios.get('social-links').then((res) => {
        this.socials = res.data.payload
      })
    },
  },
})
