import { defineStore } from 'pinia'
import axios from '@/plugins/axios'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: [],
  }),
  actions: {
    getSettings() {
      axios.get('settings').then((res) => {
        this.settings = res.data.payload
      })
    },
  },
})
