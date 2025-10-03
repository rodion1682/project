import { defineStore } from 'pinia'

export const useLoginModalStore = defineStore('loginModal', {
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
