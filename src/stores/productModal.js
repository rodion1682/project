import { defineStore } from 'pinia'

export const useProductModalStore = defineStore('productModal', {
  state: () => ({
    isModalOpen: false,
    isConfirmModalOpen: false,
  }),
  actions: {
    openModal() {
      this.isModalOpen = true
    },
    closeModal() {
      this.isModalOpen = false
    },
    openConfirmModal() {
      this.isConfirmModalOpen = true
    },
    closeConfirmModal() {
      this.isConfirmModalOpen = false
    },
  },
})
