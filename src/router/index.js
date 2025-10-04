import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Home/HomeView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import ProductListView from '../views/ProductListView.vue'
import GameView from '../views/GameView.vue'
import ProfileView from '../views/Profile/ProfileView.vue'
import StaticPageView from '../views/StaticPageView.vue'
import FailPayment from '../views/FailPayment.vue'
import SuccessPayment from '../views/SuccessPayment.vue'
import FaqView from '../views/FaqView.vue'
import TopUp from '../views/TopUp.vue'
import OfferSuccessPage from '../views/OfferSuccessPage.vue'
import PricingPage from '../views/PricingPage.vue'
import CreateView from '../views/CreateView.vue'
import SignInView from '../views/SignInView.vue'
import SignUpView from '@/views/SignUpView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/sign-in',
      name: 'signIn',
      component: SignInView,
    },
    {
      path: '/sing-up',
      name: '/singUp',
      component: SignUpView,
    },
    {
      path: '/products/:game',
      name: 'game',
      component: GameView,
      props: true,
    },
    {
      path: '/shop/:listType',
      name: 'ProductListView',
      component: ProductListView,
    },
    {
      path: '/static/:page',
      name: 'static',
      component: StaticPageView,
      props: true,
    },
    {
      path: '/profile/:page',
      name: 'profile',
      component: ProfileView,
      props: true,
    },
    {
      path: '/pricing',
      name: 'pricingPage',
      component: PricingPage,
      props: true,
    },
    {
      path: '/fail-payment',
      name: 'failPayment',
      component: FailPayment,
      props: true,
    },
    {
      path: '/success-payment',
      name: 'successPayment',
      component: SuccessPayment,
      props: true,
    },
    {
      path: '/faq',
      name: 'faq',
      component: FaqView,
    },
    {
      path: '/top-up',
      name: 'topUp',
      component: TopUp,
    },

    {
      path: '/faq',
      name: 'faq',
      component: FaqView,
    },

    {
      path: '/faq',
      name: 'faq',
      component: FaqView,
    },
    {
      path: '/offer-sent-succes',
      name: 'OfferSuccessPage',
      component: OfferSuccessPage,
    },
    {
      path: '/create/:page/:id?',
      name: 'CreateView',
      component: CreateView,
      props: true,
    },
    {
      path: '/reset-password',
      name: 'ResetPassword',
      component: HomeView,
      props: true,
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFoundView,
    },
  ],
})

router.beforeEach((to, from, next) => {
  if (to.name === 'ResetPassword' && (!to.query.token || !to.query.email)) {
    return next({ name: 'home' })
  }

  next()
})

export default router
