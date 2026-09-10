import { defineStore } from 'pinia'

import axios from '@/plugins/axios'
export const useGiftCardStore = defineStore('giftCard', {
  state: () => ({
    error: '',
    success: '',
  }),
  actions: {
    submit(
      amount,
      quantity,
      holderFirstName,
      holderLastName,
      holderEmail,
      holderPhone,
      holderPhoneCountry,
      holderCountry,
      holderCity,
      holderAddress,
      holderZip
    ) {
      axios
        .post('gift-cards', {
          amount: amount,
          quantity: quantity,
          holder_first_name: holderFirstName,
          holder_last_name: holderLastName,
          holder_email: holderEmail,
          holder_phone: holderPhone,
          holder_phone_country: holderPhoneCountry,
          holder_country: holderCountry,
          holder_city: holderCity,
          holder_address: holderAddress,
          holder_zip: holderZip
        })
        .then((response) => {
          let self = this
          self.success = 'success'

          window.location.href = response.data.payment_link

          setTimeout(function () {
            self.success = ''
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
