import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTopUpModalStore = defineStore('topUpModal', () => {
  const isModalOpen = ref(false)
  const amount = ref(null)
  const method = ref('')
  const step = ref(1)

  function toggleModal() {
    isModalOpen.value = !isModalOpen.value
  }

  function openModal() {
    isModalOpen.value = true
  }

  function closeModal() {
    isModalOpen.value = false
  }

  function setStep(newStep) {
    step.value = newStep;
  }

  return {
    isModalOpen,
    amount,
    method,
    step,
    toggleModal,
    openModal,
    closeModal,
    setStep
  }
})
