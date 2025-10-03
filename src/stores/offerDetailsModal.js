import { defineStore } from 'pinia'
import axios from '@/plugins/axios'
import router from '@/router'

export const useOfferDetailsModalStore = defineStore('offerDetailsModal', {
  state: () => ({
    isOpen: false,
    saleSkinIsOpen: false,
    offer: {},
    error: '',
    data: {},
    method: '',
  }),
  actions: {
    createOffer(data) {
      axios
        .post(import.meta.env.VITE_APP_API + 'offer/create', data)
        .then((res) => {
          if (res.data.status == 'OK') {
            this.close()
            router.push({ path: '/offer-sent-succes' })
          } else {
            if (res.data.errors) {
              const firstErrors = {}
              for (const key in res.data.errors) {
                if (
                  res.data.errors.hasOwnProperty(key) &&
                  Array.isArray(res.data.errors[key]) &&
                  res.data.errors[key].length > 0
                ) {
                  firstErrors[key] = res.data.errors[key][0]
                  this.error = firstErrors[key]
                }
              }
            } else {
              this.error = res.data.message
            }
          }
        })
        .catch((res) => {
          console.log(res)
          if (res.response.data.errors) {
            const firstErrors = {}
            for (const key in res.response.data.errors) {
              if (
                res.response.data.errors.hasOwnProperty(key) &&
                Array.isArray(res.response.data.errors[key]) &&
                res.response.data.errors[key].length > 0
              ) {
                firstErrors[key] = res.response.data.errors[key][0]
                // this.$emit('setError', firstErrors[key]);
                this.error = firstErrors[key]
              }
            }
          } else {
            this.error = res.response.data.message
          }
          // this.error = res.response.data.message;
        })
    },
    decline() {
      let data = {
        id: this.offer.id,
      }
      axios
        .get(import.meta.env.VITE_APP_API + 'offer/decline', data)
        .then(() => {
          this.close()
        })
        .catch((res) => {
          this.error = res
        })
    },
    openSaleSkin() {
      this.saleSkinIsOpen = true
    },
    open(id) {
      this.isOpen = true
      axios.get(import.meta.env.VITE_APP_API + 'offer/' + id).then((res) => {
        this.offer = res.data
      })
    },
    close() {
      this.isOpen = false
      this.saleSkinIsOpen = false
    },
    setData(data) {
      this.data = data
    },
    setMethod(method) {
      this.method = method
    },
    confirm() {
      axios
        .post(import.meta.env.VITE_APP_API + 'offer/withdraw/' + this.method, this.data)
        .then(() => {
          this.close()
          router.push({ path: '/offer-sent-succes' })
        })
        .catch((res) => {
          if (res.response.data.errors) {
            const firstErrors = {}
            for (const key in res.response.data.errors) {
              if (
                res.response.data.errors.hasOwnProperty(key) &&
                Array.isArray(res.response.data.errors[key]) &&
                res.response.data.errors[key].length > 0
              ) {
                firstErrors[key] = res.response.data.errors[key][0]
                this.error = firstErrors[key]
              }
            }
          } else {
            this.error = res.response.data.message
          }
          this.error = res
        })
    },
  },
})
