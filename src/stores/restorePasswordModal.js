import { defineStore } from 'pinia'
import axios from 'axios'
import { useLoginModalStore } from '@/stores/loginModal.js'
import { useRouter } from 'vue-router'

export const useRestoreModalStore = defineStore('recoverModal', {
  state: () => ({
    isModalOpen: false,
    data: {
      token: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
    error: '',
    loading: false,
  }),

  actions: {
    toggleModal() {
      this.isModalOpen = !this.isModalOpen
    },
    openModal() {
      this.isModalOpen = true
    },
    closeModal() {
      this.isModalOpen = false
    },

    updateData(newData) {
      this.data = { ...this.data, ...newData }
    },

    async submitRestore() {
      const router = useRouter()
      const loginModalStore = useLoginModalStore()

      this.loading = true
      this.error = ''

      try {
        const response = await axios.post('/api/auth/restore-password', this.data)

        if (response.data.status === 'OK') {
          this.closeModal()
          this.reset()

          await router.push('/')
          loginModalStore.openModal()
        } else {
          this.error = response.data.message || 'Restore failed'
        }
      } catch (err) {
        this.error = err.response?.data?.message || 'Unexpected error'
      } finally {
        this.loading = false
      }
    }
    ,
    reset() {
      this.data = {
        token: '',
        email: '',
        password: '',
        password_confirmation: '',
      }
      this.error = ''
    }
  }
})
