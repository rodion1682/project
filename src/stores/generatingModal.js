import { defineStore } from 'pinia'

export const useGeneratingModalStore = defineStore('generatingModal', {
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
