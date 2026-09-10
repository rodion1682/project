import { defineStore } from 'pinia'
import router from '@/router'

import { useAuthStore } from '@/stores/auth'
import axios from '@/plugins/axios'
export const useLogoutStore = defineStore('logout', {
  state: () => ({}),
  actions: {
    out() {
      const authStore = useAuthStore()
      axios.post('logout').then(() => {
        authStore.checkAuth()
        router.push({ path: '/' })
      })
    },
  },
})
