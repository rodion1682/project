import { defineStore } from 'pinia'
import { useCurrStore } from '@/stores/currencies'
import { useProfileStore } from '@/stores/profile'
import { useTopUpModalStore } from '@/stores/topUpModal'
import router from '@/router'

import axios from '@/plugins/axios'
export const useTopUpStore = defineStore('topUp', {
  state: () => ({
    error: '',
    success: '',
  }),
  actions: {
    topUp(amount, country, city, address, postcode, code) {
      const currStore = useCurrStore()
      const profileStore = useProfileStore()
      const data = {
        name: profileStore.profile.name,
        surname: profileStore.profile.surname,
        phone: profileStore.profile.phone,
        email: profileStore.profile.email,
        country: country,
        city: city,
        address: address,
        postCode: postcode,
        amount: amount,
        code: code,
        currency: currStore.currency.code,
      }
      axios
        .post('deposit/checkout/validate', data, {
          timeout: 20000,
        })
        .then(() => {
          localStorage.setItem('payData', JSON.stringify(data))
          router.push({ path: '/pay' })
        })
        .catch((err) => {
          let self = this
          self.error = err.response.data.message
          setTimeout(function () {
            self.error = ''
          }, 3000)
        })
    },
    useGiftCode(code) {
      const profileStore = useProfileStore()
      const topUpModalStore = useTopUpModalStore()
      axios
        .post('gift-cards/use/' + code)
        .then(() => {
          let self = this
          self.success = 'The gift card was successfully used'
          setTimeout(function () {
            topUpModalStore.closeModal()
            profileStore.getProfile()
          }, 3000)
        })
        .catch((err) => {
          let self = this
          self.error = err.response.data.message
          setTimeout(function () {
            self.error = ''
          }, 3000)
        })
    },
  },
})
