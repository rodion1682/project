import { defineStore } from 'pinia'

export const useCookiesModalStore = defineStore('cookiesModal', {
  state: () => ({
    isModalOpen: false,
  }),
  actions: {
    openModal() {
      this.isModalOpen = true
    },
    closeModal() {
      this.isModalOpen = false
    },
  },
})
