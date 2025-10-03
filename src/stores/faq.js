import { defineStore } from 'pinia'
import { useGlobalStore } from '@/stores/global'

import axios from '@/plugins/axios'
export const useFaq = defineStore('faq', {
  state: () => ({
    faq: [],
  }),
  actions: {
    getFaq() {
      const globalStore = useGlobalStore()
      axios
        .get(import.meta.env.VITE_APP_API + 'faq?lang_id=' + globalStore.currentLanguage)
        .then((res) => {
          this.faq = res.data.payload
        })
    },
  },
})
