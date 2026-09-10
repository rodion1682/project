import { defineStore } from 'pinia'

import axios from '@/plugins/axios'
export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuth: false,
  }),
  actions: {
    checkAuth() {
      axios.get('is-auth').then((res) => {
        this.isAuth = res.data.authenticated
      })
    },
  },
})
