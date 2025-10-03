import { defineStore } from 'pinia'

export const useProfileNavStore = defineStore('profileNav', {
  state: () => ({
    nav: [
      {
        title: 'Overview',
        link: '/profile/overview',
      },
      {
        title: 'Orders',
        link: '/profile/orders',
      },
      {
        title: 'Profile data',
        link: '/profile/profile-data',
      },
      {
        title: 'Balance',
        link: '/profile/balance',
      },
      {
        title: 'Change password',
        link: '/profile/change-password',
      },
    ],
  }),
})
