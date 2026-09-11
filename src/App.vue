<script setup>
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useCategoriesStore } from '@/stores/categories'
import { useCookiesModalStore } from '@/stores/cookiesModal'
import { useCountriesStore } from '@/stores/countries'
import { useCurrStore } from '@/stores/currencies'
import { useGlobalStore } from '@/stores/global'
import { useLoginModalStore } from '@/stores/loginModal'
import { useMenuStore } from '@/stores/menu'
import { useProfileStore } from '@/stores/profile'
import { useRecoverModalStore } from '@/stores/recoverModal'
import { useRegModalStore } from '@/stores/regModal'
import { useSettingsStore } from '@/stores/settings'
import { useSocialsStore } from '@/stores/socials'
import { useStaticStore } from '@/stores/static'
import { useTopUpModalStore } from '@/stores/topUpModal'
import { useWishListStore } from '@/stores/wishlist'
import { onMounted, watch, watchEffect } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import CookiesModal from './components/CookiesModal.vue'
import FooterView from './components/layout/FooterView.vue'
import HeaderView from './components/layout/HeaderView.vue'
import LoginModal from './components/LoginModal.vue'
import RecoverModal from './components/RecoverModal.vue'
import RegModal from './components/RegModal.vue'
import TopUpModal from './components/TopUpModal.vue'

const globalStore = useGlobalStore()

const wishListStore = useWishListStore()
const menuStore = useMenuStore()
const loginModalStore = useLoginModalStore()
const regModalStore = useRegModalStore()
const recoverModalStore = useRecoverModalStore()
const topUpModalStore = useTopUpModalStore()
const authStore = useAuthStore()
const socialsStore = useSocialsStore()
const currStore = useCurrStore()
const settingsStore = useSettingsStore()
const staticStore = useStaticStore()
const countriesStore = useCountriesStore()
const categoriesStore = useCategoriesStore()
const cartStore = useCartStore()
const profileStore = useProfileStore()
const cookiesModalStore = useCookiesModalStore()

const router = useRouter()
watch(
  () => router.currentRoute.value,
  () => {
    window.scrollTo(0, 0)
    menuStore.closeMenu()
    regModalStore.closeModal()
    topUpModalStore.closeModal()
  },
)

onMounted(() => {
  const cookiesAccepted = localStorage.getItem('cookiesAccepted')

  if (!cookiesAccepted) {
    cookiesModalStore.openModal()
  }

  globalStore.fetchLanguages()
  authStore.checkAuth()
  socialsStore.getSocials()
  currStore.getCurrencies()
  settingsStore.getSettings()
  staticStore.getStatic()
  countriesStore.getCountries()
  categoriesStore.getCategories()

  watchEffect(() => {
    if (Object.keys(currStore.currency).length !== 0 && authStore.isAuth) {
      cartStore.getCart()
      profileStore.getProfile()
      wishListStore.get()
    }
  })
})
</script>

<template>
  <div :class="'page page_' + router.currentRoute.value.name">
    <HeaderView />
    <RouterView />
    <FooterView />
    <Transition>
      <LoginModal v-if="loginModalStore.isModalOpen" />
    </Transition>
    <Transition>
      <RegModal v-if="regModalStore.isModalOpen" />
    </Transition>
    <Transition>
      <RecoverModal v-if="recoverModalStore.isModalOpen" />
    </Transition>
    <Transition>
      <TopUpModal v-if="topUpModalStore.isModalOpen" />
    </Transition>
    <Transition>
      <CookiesModal v-if="cookiesModalStore.isModalOpen" />
    </Transition>
  </div>
</template>
