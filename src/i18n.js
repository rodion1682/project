import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  // legacy: false, // ✅ Required for Vue 3 Composition API
  locale: localStorage.getItem('languageCode') || 'en', // ✅ Default locale
  fallbackLocale: 'en',
  messages: {}, // ✅ Load messages dynamically
  globalInjection: true, // ✅ Optional, allows injecting globally
})

export default i18n
