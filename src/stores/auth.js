import { defineStore } from 'pinia'

import axios from '@/plugins/axios'
export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuth: false,
  }),
  actions: {
    checkAuth() {
      axios.get(import.meta.env.VITE_APP_API + 'is-auth').then((res) => {
        this.isAuth = res.data.authenticated
      })
    },
  },
})
