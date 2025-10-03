import { defineStore } from 'pinia'
import router from '@/router'

import { useAuthStore } from '@/stores/auth'
import axios, { clearAuthToken } from '@/plugins/axios'
export const useLogoutStore = defineStore('logout', {
  state: () => ({}),
  actions: {
    out() {
      const authStore = useAuthStore()

      axios.post(import.meta.env.VITE_APP_API + 'logout')
        .finally(() => {
          clearAuthToken()             // Очистить access_token
          authStore.checkAuth()        // Обновить isAuth
          router.push({ path: '/' })   // Перенаправить на главную
        })
    }
  },
})
