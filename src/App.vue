<script setup>
import { watch, onMounted, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { RouterView } from 'vue-router'
import HeaderView from './components/HeaderView.vue'
import FooterView from './components/FooterView.vue'
import LoginModal from './components/LoginModal.vue'
import RegModal from './components/RegModal.vue'
import RecoverModal from './components/RecoverModal.vue'
import TopUpModal from './components/modals/TopUpModal.vue'
import CookiesModal from './components/CookiesModal.vue'
import ContactModal from './components/ContactModal.vue'
import ProductModal from './components/ProductModal.vue'
import OfferDetailsModal from './components/OfferDetailsModal.vue'
//import GeneratingModal from './components/GeneratingModal.vue'
import ReadyModal from './components/ReadyModal.vue'
import SaleSkinModal from './components/SaleSkinModal.vue'
import ProductConfirmModal from './components/ProductConfirmModal.vue'

import CartModal from './components/CartModal.vue'
import { useLoginModalStore } from '@/stores/loginModal'
import { useRegModalStore } from '@/stores/regModal'
import { useRecoverModalStore } from '@/stores/recoverModal'
import { useTopUpModalStore } from '@/stores/topUpModal'
import { useCookiesModalStore } from '@/stores/cookiesModal'
import { useAuthStore } from '@/stores/auth'
import { useSocialsStore } from '@/stores/socials'
import { useCurrStore } from '@/stores/currencies'
import { useSettingsStore } from '@/stores/settings'
import { useStaticStore } from '@/stores/static'
import { useCountriesStore } from '@/stores/countries'
import { useCategoriesStore } from '@/stores/categories'
import { useProfileStore } from '@/stores/profile'
import { useGlobalStore } from '@/stores/global'
import { useFaq } from '@/stores/faq'
import { useContactModalStore } from '@/stores/contactModal'
import { useProductModalStore } from '@/stores/productModal'
import { useCartStore } from '@/stores/cart'
import { useOfferDetailsModalStore } from '@/stores/offerDetailsModal'
import { useReadyModalStore } from '@/stores/readyModal'
//import { useGeneratingModalStore } from '@/stores/generatingModal'
import { useRestoreModalStore } from '@/stores/restorePasswordModal.js'
// import ResetPasswordModal from '@/components/ResetPasswordModal.vue'

const faqStore = useFaq()
const globalStore = useGlobalStore()
const loginModalStore = useLoginModalStore()
//const regModalStore = useRegModalStore()
const recoverModalStore = useRecoverModalStore()
const topUpModalStore = useTopUpModalStore()
const cookiesModalStore = useCookiesModalStore()
const authStore = useAuthStore()
const socialsStore = useSocialsStore()
const currStore = useCurrStore()
const settingsStore = useSettingsStore()
const staticStore = useStaticStore()
const countriesStore = useCountriesStore()
const categoriesStore = useCategoriesStore()
const profileStore = useProfileStore()
const contactModalStore = useContactModalStore()
const productModalStore = useProductModalStore()
const cartStore = useCartStore()
const offerDetailsModalStore = useOfferDetailsModalStore()
const readyModalStore = useReadyModalStore()
const restoreModalStore = useRestoreModalStore()

const router = useRouter()
const route = useRoute()

watch(
  () => router.currentRoute.value,
  () => {
    window.scrollTo(0, 0)
    // regModalStore.closeModal()

    if (
      router.currentRoute.value.name === 'ResetPassword' &&
      router.currentRoute.value.query.token &&
      router.currentRoute.value.query.email
    ) {
      restoreModalStore.updateData({
        email: router.currentRoute.value.query.email,
        token: router.currentRoute.value.query.token,
      })
      restoreModalStore.openModal()
    }
  },
)

onMounted(() => {
  const cookiesAccepted = localStorage.getItem('cookiesAccepted')

  console.log(route, 'route')

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

  watch(
    () => currStore.currency,
    async () => {
      await settingsStore.getSettings()
    },
  )

  watchEffect(() => {
    if (Object.keys(currStore.currency).length !== 0) {
      faqStore.getFaq()
    }
    if (Object.keys(currStore.currency).length !== 0 && authStore.isAuth) {
      profileStore.getProfile()
      cartStore.getCart()
    }
  })
})
</script>

<template>
  <div class="page">
    <HeaderView />
    <RouterView />
    <FooterView />
    <!--<Transition>
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
      <CookiesModal />
    </Transition>
    <Transition>
      <ContactModal v-if="contactModalStore.isModalOpen" />
    </Transition>
    <Transition>
      <ProductModal v-if="productModalStore.isModalOpen" />
    </Transition>
    <Transition>
      <CartModal v-if="cartStore.isModalOpen" />
    </Transition>
    <Transition>
      <OfferDetailsModal v-if="offerDetailsModalStore.isOpen" />
    </Transition>
    <Transition>
      <SaleSkinModal v-if="offerDetailsModalStore.saleSkinIsOpen" />
    </Transition>
    <Transition>
      <ProductConfirmModal v-if="productModalStore.isConfirmModalOpen" />
    </Transition>-->

    <!--    <Transition>-->
    <!--      <GeneratingModal v-if="true" />-->
    <!--    </Transition>-->

    <!-- uncomment ------------------- -->
    <!--<Transition><ReadyModal v-if="readyModalStore.isModalOpen" /></Transition>-->

    <!-- <Transition>
      <ResetPasswordModal v-if="restoreModalStore.isModalOpen" />
    </Transition> -->
  </div>
</template>
