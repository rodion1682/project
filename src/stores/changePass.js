import { defineStore } from 'pinia'

import axios from '@/plugins/axios'
export const useChangePassStore = defineStore('changePass', {
  state: () => ({
    error: '',
    success: '',
    curPass: '',
    newPass: '',
    repeatPass: '',
  }),
  actions: {
    submit() {
      axios
        .post(import.meta.env.VITE_APP_API + 'user/change-password', {
          cur_password: this.curPass,
          new_password: this.newPass,
          new_password_confirmation: this.repeatPass,
        })
        .then(() => {
          let self = this
          self.success = 'Success'
          self.error = ''
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
    setPass(currPass, newPass, repeatPass) {
      this.curPass = currPass
      this.newPass = newPass
      this.repeatPass = repeatPass
      this.submit()
    },
  },
})
