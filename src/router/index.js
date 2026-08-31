import { createRouter, createWebHistory } from 'vue-router'

import AboutPage from '@/pages/AboutPage/AboutPage.vue'
import AccountPage from '@/pages/AccountPage/AccountPage.vue'
import AuthPage from '@/pages/AuthPage/AuthPage.vue'
import CartPage from '@/pages/CartPage/CartPage.vue'
import FaqPage from '@/pages/FaqPage/FaqPage.vue'
import HomePage from '@/pages/HomePage/HomePage.vue'
import MyPacksPage from '@/pages/MyPacksPage.vue'
import MyCardsPage from '@/pages/MyProductsPage/MyCardsPage.vue'

import ProductDetailsPage from '@/pages/ProductPages/ProductDetailsPage.vue'
import ProductListPage from '@/pages/ProductPages/ProductListPage.vue'

import PackDetailsPage from '@/pages/PackDetailsPage.vue'
import PackListPage from '@/pages/PrdocutsPackPage/PackListPage.vue'

import StaticPage from '@/pages/StaticPage/StaticPage.vue'

import FailPaymentPage from '@/pages/StatusPages/FailPaymentPage.vue'
import PendingPaymentPage from '@/pages/StatusPages/PendingPaymentPage.vue'
import SuccessPaymentPage from '@/pages/StatusPages/SuccessPaymentPage.vue'

import { useAuthStore } from '@/stores/auth'
import { useStaticStore } from '@/stores/static'

let authVerificationPromise = null

const verifyAuth = () => {
  const authStore = useAuthStore()

  if (authVerificationPromise) {
    return authVerificationPromise
  }

  authVerificationPromise = authStore.checkAuth().catch(error => {
    console.error('Auth verification failed:', error)

    /*
     * Allow another verification attempt if the
     * previous request failed.
     */
    authVerificationPromise = null

    return false
  })

  return authVerificationPromise
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    /*
     * =========================================================
     * HOME
     * =========================================================
     */
    {
      path: '/',
      name: 'HomePage',
      component: HomePage,
    },

    /*
     * =========================================================
     * AUTHENTICATION
     * =========================================================
     */
    {
      path: '/auth',
      name: 'Auth',
      component: AuthPage,
      props: route => ({
        form: route.query.form || 'signin',
      }),
      meta: {
        guestOnly: true,
      },
    },

    // {
    //   path: '/reset-password',
    //   name: 'ResetPassword',
    //   component: () =>
    //     import('@/pages/AuthPage/components/PasswordResetForm.vue'),
    //   meta: {
    //     guestOnly: true,
    //   },
    // },

    /*
     * =========================================================
     * PAYMENT RESULT PAGES
     * =========================================================
     */
    {
      path: '/success-payment',
      name: 'SuccessPaymentPage',
      component: SuccessPaymentPage,
    },

    {
      path: '/fail-payment',
      name: 'FailPaymentPage',
      component: FailPaymentPage,
    },

    {
      path: '/pending-payment',
      name: 'PendingPaymentPage',
      component: PendingPaymentPage,
    },

    {
      path: '/processing-payment',
      name: 'ProcessingPaymentPage',
      component: PendingPaymentPage,
    },

    /*
     * =========================================================
     * MAIN STATIC PAGES
     * =========================================================
     */
    {
      path: '/about',
      name: 'AboutPage',
      component: AboutPage,
    },

    {
      path: '/faq',
      name: 'FaqPage',
      component: FaqPage,
      meta: {
        title: 'Frequently Asked Questions',
      },
    },

    /*
     * =========================================================
     * CARD MARKETPLACE
     * =========================================================
     */

    /*
     * Buy cards
     */
    {
      path: '/buy-card',
      name: 'ProductListPage',
      component: ProductListPage,
    },

    /*
     * Rent uses the same ProductListPage.
     */
    {
      path: '/rent-card',
      redirect: to => ({
        name: 'ProductListPage',
        query: {
          ...to.query,
          mode: 'rent',
        },
      }),
    },

    /*
     * Sale cards
     */
    {
      path: '/sale',
      name: 'SalePage',
      component: ProductListPage,
      props: {
        isSalePage: true,
      },
    },

    /*
     * New cards
     */
    {
      path: '/new',
      name: 'NewItemsPage',
      component: ProductListPage,
      props: {
        isNewItemsPage: true,
      },
    },

    /*
     * Filtered card categories
     */
    {
      path: '/cards/:category/:subcategory?',
      name: 'ProductListPageWithCategory',
      component: ProductListPage,
    },

    /*
     * Individual card page
     *
     * IMPORTANT:
     * CartPage uses:
     *
     * {
     *   name: 'ProductDetailsPage',
     *   params: {
     *     productId: item.purchasable_id,
     *   },
     * }
     *
     * so this named route must exist.
     */
    {
      path: '/card/:productId',
      name: 'ProductDetailsPage',
      component: ProductDetailsPage,
      props: route => ({
        productId: route.params.productId,
      }),
    },

    /*
     * =========================================================
     * PACK MARKETPLACE
     * =========================================================
     */

    /*
     * Pack listing
     */
    {
      path: '/buy-pack',
      name: 'PackListPage',
      component: PackListPage,
    },

    /*
     * Individual pack page
     *
     * CartPage uses:
     *
     * {
     *   name: 'PackDetailsPage',
     *   params: {
     *     productId: item.purchasable_id,
     *   },
     * }
     *
     * so this named route must exist.
     */
    {
      path: '/pack/:productId',
      name: 'PackDetailsPage',
      component: PackDetailsPage,
      props: route => ({
        productId: route.params.productId,
      }),
    },

    /*
     * =========================================================
     * PLAYER COLLECTION
     * =========================================================
     *
     * Bought:
     * /my-cards
     *
     * Rented:
     * /my-cards?collection=rented
     */
    {
      path: '/my-cards',
      name: 'MyCardsPage',
      component: MyCardsPage,
      meta: {
        requiresAuth: true,
      },
    },

    /*
     * Preserve old links and bookmarks.
     *
     * /my-rent-cards
     *
     * becomes:
     *
     * /my-cards?collection=rented
     */
    {
      path: '/my-rent-cards',
      redirect: to => ({
        name: 'MyCardsPage',
        query: {
          ...to.query,
          collection: 'rented',
        },
      }),
    },

    /*
     * User packs
     */
    {
      path: '/my-packs',
      name: 'MyPacksPage',
      component: MyPacksPage,
      meta: {
        requiresAuth: true,
      },
    },

    /*
     * =========================================================
     * USER ACCOUNT
     * =========================================================
     */
    {
      path: '/account',
      name: 'account',
      component: AccountPage,
      meta: {
        requiresAuth: true,
      },

      children: [
        /*
         * Default account tab
         */
        {
          path: '',
          name: 'account-settings',
          component: AccountPage,
          props: {
            activeTab: 'personal',
          },
        },

        /*
         * Personal information
         */
        {
          path: 'personal',
          name: 'account-personal',
          component: AccountPage,
          props: {
            activeTab: 'personal',
          },
        },

        /*
         * Wallet / balance
         */
        {
          path: 'balance',
          name: 'account-wallet',
          component: AccountPage,
          props: {
            activeTab: 'wallet',
          },
        },

        /*
         * Transactions
         */
        {
          path: 'transactions',
          name: 'account-transactions',
          component: AccountPage,
          props: {
            activeTab: 'transactions',
          },
        },

        /*
         * Orders
         */
        {
          path: 'orders',
          name: 'account-orders',
          component: AccountPage,
          props: {
            activeTab: 'orders',
          },
        },

        /*
         * Offers
         */
        {
          path: 'offers',
          name: 'account-offers',
          component: AccountPage,
          props: {
            activeTab: 'offers',
          },
        },

        /*
         * Withdrawals
         */
        {
          path: 'withdrawals',
          name: 'account-withdrawals',
          component: AccountPage,
          props: {
            activeTab: 'withdrawals',
          },
        },
      ],
    },

    /*
     * =========================================================
     * EMAIL VERIFICATION
     * =========================================================
     *
     * Keeping these disabled exactly like in your existing router.
     */
    // {
    //   path: '/email-verification',
    //   name: 'EmailVerificationPage',
    //   component: EmailVerificationPage,
    //   meta: {
    //     requiresAuth: true,
    //   },
    // },

    // {
    //   path: '/email/verify/success',
    //   name: 'EmailVerificationSuccessPage',
    //   component: EmailVerificationSuccessPage,
    // },

    // {
    //   path: '/email/verify/already-success',
    //   name: 'EmailVerificationAlreadySuccessPage',
    //   component: EmailVerificationAlreadySuccessPage,
    // },

    /*
     * =========================================================
     * CART
     * =========================================================
     */
    {
      path: '/cart',
      name: 'CartPage',
      component: CartPage,
      meta: {
        requiresAuth: true,
      },
    },

    /*
     * =========================================================
     * LEGACY STATIC PAGE
     * =========================================================
     *
     * Keep this BEFORE /:slug so specific static routes
     * are resolved first.
     */
    {
      path: '/static-page/:id',
      name: 'StaticPage',
      component: StaticPage,
      props: route => ({
        id: route.params.id,
      }),
    },

    /*
     * =========================================================
     * CMS STATIC PAGES
     * =========================================================
     */
    {
      path: '/:slug',
      name: 'StaticPageBySlug',
      component: StaticPage,

      props: route => ({
        slug: route.params.slug,
      }),

      beforeEnter: async to => {
        const staticStore = useStaticStore()

        try {
          if (staticStore.pages.length === 0) {
            await staticStore.fetchPages()
          }

          const matchingPage = staticStore.pages.find(page => {
            return page.slug === to.params.slug
          })

          if (matchingPage) {
            return true
          }

          return {
            name: 'NotFound',
          }
        } catch (error) {
          console.error('Failed to resolve static page:', error)

          return {
            name: 'NotFound',
          }
        }
      },
    },

    /*
     * =========================================================
     * 404
     * =========================================================
     *
     * Always keep this route LAST.
     */
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/pages/NotFoundPage.vue'),
    },
  ],

  /*
   * =========================================================
   * SCROLL BEHAVIOR
   * =========================================================
   */
  scrollBehavior(to, from, savedPosition) {
    /*
     * Restore browser history scroll.
     */
    if (savedPosition) {
      return savedPosition
    }

    /*
     * Keep the current position when filters or
     * collection mode change on the same page.
     */
    if (to.path === from.path) {
      const pageChanged = to.query.page !== from.query.page

      /*
       * Scroll to the top when pagination changes.
       */
      if (pageChanged) {
        return {
          top: 0,
          behavior: 'smooth',
        }
      }

      return false
    }

    /*
     * Normal navigation starts at the top.
     */
    return {
      top: 0,
    }
  },
})

/*
 * =============================================================
 * GLOBAL AUTH GUARD
 * =============================================================
 */
router.beforeEach(async (to, from) => {
  const authStore = useAuthStore()

  const requiresAuth = to.matched.some(record => {
    return record.meta.requiresAuth
  })

  const guestOnly = to.matched.some(record => {
    return record.meta.guestOnly
  })

  /*
   * On a direct page load, verify the saved session
   * against the server before applying route guards.
   */
  if (from.name === null) {
    await verifyAuth()
  }

  const isAuthenticated = authStore.isAuthenticated

  /*
   * Protected page and user is not authenticated.
   */
  if (requiresAuth && !isAuthenticated) {
    return {
      name: 'Auth',

      query: {
        form: 'signin',
        redirect: to.fullPath,
      },
    }
  }

  /*
   * Prevent authenticated users from opening
   * guest-only pages such as login.
   */
  if (guestOnly && isAuthenticated) {
    return {
      name: 'HomePage',
    }
  }

  return true
})

export default router
