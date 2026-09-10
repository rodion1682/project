import HomeView from '@/views/HomePage/HomeView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import CartView from '../views/CartView.vue'
import ContactView from '../views/ContactView.vue'
import FailPayment from '../views/FailPayment.vue'
import FaqView from '../views/FaqView.vue'
import GameView from '../views/GameView.vue'
import GiftCardView from '../views/GiftCardView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import PayView from '../views/PayView.vue'
import PlatformListView from '../views/PlatformListView.vue'
import PlatformView from '../views/PlatformView.vue'
import ProductListView from '../views/ProductListView.vue'
import ProfileView from '../views/ProfileView.vue'
import StaticPageView from '../views/StaticPageView.vue'
import SuccessPayment from '../views/SuccessPayment.vue'
import WishListView from '../views/WishListView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/faq',
      name: 'faq',
      component: FaqView,
    },
    {
      path: '/pay',
      name: 'pay',
      component: PayView,
    },
    {
      path: '/wish-list',
      name: 'wishList',
      component: WishListView,
    },
    {
      path: '/cart',
      name: 'cart',
      component: CartView,
    },
    {
      path: '/products/:platform',
      name: 'platform',
      component: PlatformView,
      props: true,
    },
    {
      path: '/products/:platform/:category',
      name: 'category',
      component: ProductListView,
      props: true,
    },
    {
      path: '/products/:platform/:category/:game',
      name: 'game',
      component: GameView,
      props: true,
    },
    {
      path: '/products',
      name: 'platformList',
      component: PlatformListView,
      props: true,
    },
    {
      path: '/profile/:page/:order?',
      name: 'profile',
      component: ProfileView,
      props: true,
    },
    {
      path: '/static/:page',
      name: 'static',
      component: StaticPageView,
      props: true,
    },
    {
      path: '/contact-us',
      name: 'contact',
      component: ContactView,
      props: true,
    },
    {
      path: '/gift-card',
      name: 'giftCard',
      component: GiftCardView,
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
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFoundView,
    },
  ],
})

export default router
