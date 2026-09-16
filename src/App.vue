<script setup>
import { onMounted, ref, watch } from 'vue'
import { RouterView, useRouter } from 'vue-router'

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

import CookiesModal from './components/CookiesModal.vue'
import FooterView from './components/layout/FooterView.vue'
import HeaderView from './components/layout/HeaderView.vue'

import Loader from './components/Loader.vue'
import RecoverModal from './components/RecoverModal.vue'
import RegModal from './components/RegModal.vue'
import TopUpModal from './components/TopUpModal.vue'

const router = useRouter()

const globalStore = useGlobalStore()
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

const appLoading = ref(true)

watch(
  () => router.currentRoute.value.fullPath,
  () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'auto',
    })

    menuStore.closeMenu()
    regModalStore.closeModal()
    topUpModalStore.closeModal()
  },
)

watch(
  [() => currStore.currency?.code, () => authStore.isAuth],
  async ([currencyCode, isAuth]) => {
    if (!currencyCode || !isAuth) {
      return
    }

    try {
      await Promise.all([cartStore.getCart(), profileStore.getProfile()])
    } catch (error) {
      console.error('Unable to load user data:', error)
    }
  },
  {
    immediate: true,
  },
)

onMounted(async () => {
  const cookiesAccepted = localStorage.getItem('cookiesAccepted')

  if (!cookiesAccepted) {
    cookiesModalStore.openModal()
  }

  try {
    await Promise.allSettled([
      globalStore.fetchLanguages(),
      authStore.checkAuth(),
      socialsStore.getSocials(),
      currStore.getCurrencies(),
      settingsStore.getSettings(),
      staticStore.getStatic(),
      countriesStore.getCountries(),
      categoriesStore.getCategories(),
    ])
  } finally {
    appLoading.value = false
  }
})
</script>

<template>
  <div :class="['page', `page_${router.currentRoute.value.name}`]">
    <HeaderView />

    <div class="page__content">
      <div v-if="appLoading" class="page__loader">
        <Loader />
      </div>

      <RouterView v-else />
    </div>

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

<style scoped lang="scss">
.page {
  display: flex;
  flex: 1 1 100%;
  flex-direction: column;

  min-height: 100vh;

  &__content {
    display: flex;
    flex: 1 1 100%;
    flex-direction: column;
    min-height: 65vh;
  }

  &__loader {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    justify-content: center;
  }
}
</style>
