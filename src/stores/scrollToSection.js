import { defineStore } from 'pinia'
import router from '@/router'

import { scroller } from 'vue-scrollto/src/scrollTo'

import { useMenuStore } from '@/stores/menu'

export const useScrollToSectionStore = defineStore('scrollToSection', {
  state: () => ({}),
  actions: {
    scrollTo(section) {
      const menuStore = useMenuStore()
      if (router.name != 'HomeView') {
        router.push({ path: '/' })
      }
      menuStore.closeMenu()

      setTimeout(() => {
        const firstScrollTo = scroller()
        firstScrollTo('#' + section, 1000)
      }, 300)
    },
  },
})
