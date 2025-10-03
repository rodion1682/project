import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from '@/plugins/axios'
import { loadScriptsFromString } from '@/utils/load_scripts.js'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref({})
  const scriptInitialized = ref(false);

  const getSettings = async () => {
    const res = await axios.get(import.meta.env.VITE_APP_API + 'settings')
    settings.value = res.data.payload

    if (!scriptInitialized.value && settings.value?.google_tag) {
      await loadScriptsFromString(settings.value?.google_tag)
      scriptInitialized.value = true;
    }
  }

  const sculptureModelGenerationPrice = computed(() => {
    return settings.value['3d_model_generation_price'] ?? 0
  })

  const realisticModelGenerationPrice = computed(() => {
    return settings.value['realistic_model_generation_price'] ?? 0
  })

  const paymentMethods = computed(() => {
    return settings.value?.payment_methods || [];
  })

  return {
    settings,
    getSettings,
    modelGenerationPrice: sculptureModelGenerationPrice,
    realisticModelGenerationPrice,
    paymentMethods
  }
})
