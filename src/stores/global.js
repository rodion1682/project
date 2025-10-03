import { defineStore } from 'pinia'
import axios from '@/plugins/axios'
import i18n from '@/i18n'
import { nextTick } from 'vue'

export const useGlobalStore = defineStore({
  id: 'global',
  state: () => ({
    isLoading: false,
    languages: [],
    currentLanguage: localStorage.getItem('language') || '',
    currencies: [],
    currency: localStorage.getItem('currency'),
  }),
  getters: {
    currentLanguageName: (state) => {
      const lang = state.languages.find((lang) => lang.id == state.currentLanguage)
      return lang ? lang.name : ''
    },
    currentLanguageCode: (state) => {
      const lang = state.languages.find((lang) => lang.id == state.currentLanguage)
      return lang ? lang.code : ''
    },
    allLanguages: (state) => state.languages,
    allCurrencies: (state) => state.currencies,
    currencySymbol: (state) => {
      const curr = state.currencies.find(({ id }) => state.currency === id)
      return curr ? curr.symbol : ''
    },
  },
  actions: {
    async fetchLanguages() {
      try {
        this.isLoading = true
        const {
          data: { status, payload },
        } = await axios.get(import.meta.env.VITE_APP_API + 'languages')

        if (status === 'OK') {
          this.languages = payload
          if (payload.length === 0) {
            this.setCurrentLanguage('')
            return
          }

          const defaultLanguage = payload.find((lang) => lang.default === 1)
          const isValidLanguage = payload.some((lang) => lang.id == this.currentLanguage)
          this.changeLocale(
            isValidLanguage ? this.currentLanguage : defaultLanguage?.id || payload[0].id,
          )
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.isLoading = false
      }
    },
    async changeLocale(localeId) {
      if (localeId) {
        this.setCurrentLanguage(localeId)

        try {
          const { data } = await axios.get('/localizations', { params: { lang_id: localeId } })

          if (data) {
            let translations = {}

            if (Array.isArray(data) && data.length) {
              data.forEach(
                (translation) =>
                  (translations[Object.keys(translation)[0]] = Object.values(translation)[0]),
              )
            } else if (typeof data === 'object') {
              translations = data
            }

            const currentLanguageCode = this.currentLanguageCode
            i18n.global.setLocaleMessage(currentLanguageCode, translations)
            i18n.global.locale = currentLanguageCode

            await nextTick()
          }
        } catch (e) {
          console.error(e)
        }
      }
    },

    async fetchCurrencies() {
      try {
        this.isLoading = true
        const {
          data: { status, payload },
        } = await axios.get(import.meta.env.VITE_APP_API + 'currencies')

        if (status === 'OK') {
          this.currencies = payload.map(({ code: text, symbol }) => ({ text, id: text, symbol }))
          this.setCurrency(localStorage.getItem('currency') || this.currencies[0]?.text)
        }
      } catch (e) {
        console.error(e)
      } finally {
        this.isLoading = false
      }
    },
    changeCurrency(selectedCurrency) {
      if (this.currencies.some((currency) => currency.id === selectedCurrency)) {
        this.setCurrency(selectedCurrency)
      } else {
        console.warn('Selected currency is not available')
      }
    },
    setCurrency(currency) {
      localStorage.setItem('currency', currency)
      this.currency = currency
    },
    setCurrentLanguage(language) {
      this.currentLanguage = language
      if (language) {
        localStorage.setItem('language', language)
        localStorage.setItem('languageCode', this.currentLanguageCode)
      } else {
        localStorage.removeItem('language')
        localStorage.removeItem('languageCode')
      }
    },
  },
})
