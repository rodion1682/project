import { defineStore } from 'pinia'

export const useRegModalStore = defineStore('regModal', {
  state: () => ({
    isModalOpen: false,
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
  },
})
