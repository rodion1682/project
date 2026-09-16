<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import router from '@/router'

import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useCurrStore } from '@/stores/currencies'
import { useLoginModalStore } from '@/stores/loginModal'
import { useMenuStore } from '@/stores/menu'
import { useProfileStore } from '@/stores/profile'
import { useRegModalStore } from '@/stores/regModal'
import { useWishListStore } from '@/stores/wishlist'

import CurrencySelector from '../CurrencySelector.vue'
import LanguageSelector from '../LanguageSelector.vue'
import MenuView from '../MenuView.vue'

import BaseButton from '../ui/BaseButton.vue'
import BaseInput from '../ui/BaseInput.vue'

import { CartIcon, FavoriteIcon, SearchIcon } from '../ui/icons/index.js'
import SvgIcon from '../ui/icons/SvgIcon.vue'

const IS_LOGIN_MODAL_ACTIVE = false

const loginModalStore = useLoginModalStore()
const regModalStore = useRegModalStore()
const authStore = useAuthStore()
const menuStore = useMenuStore()
const cartStore = useCartStore()
const profileStore = useProfileStore()
const wishListStore = useWishListStore()
const currStore = useCurrStore()

const headerRef = ref(null)

const isMobileNavMenuVisible = ref(false)

const isTablet = ref(false)
const isSmallTablet = ref(false)
const isMobile = ref(false)
const isSmallMobile = ref(false)

const search = ref(String(router.currentRoute.value.query.search || ''))

let headerResizeObserver = null
let searchTimeout = null

let tabletMedia = null
let smallTabletMedia = null
let mobileMedia = null
let smallMobileMedia = null

const updateBreakpoints = () => {
  isTablet.value = tabletMedia?.matches ?? false
  isSmallTablet.value = smallTabletMedia?.matches ?? false
  isMobile.value = mobileMedia?.matches ?? false
  isSmallMobile.value = smallMobileMedia?.matches ?? false
}

const updateHeaderHeight = () => {
  if (!headerRef.value) {
    return
  }

  document.documentElement.style.setProperty('--header-height', `${headerRef.value.offsetHeight}px`)
}

const getScrollbarWidth = () => {
  return Math.max(0, window.innerWidth - document.documentElement.clientWidth)
}

const lockPageScroll = () => {
  const scrollbarWidth = getScrollbarWidth()

  document.documentElement.style.setProperty('--header-scrollbar-width', `${scrollbarWidth}px`)

  document.documentElement.classList.add('header-scroll-lock')
  document.body.classList.add('header-scroll-lock')
}

const unlockPageScroll = () => {
  document.documentElement.classList.remove('header-scroll-lock')
  document.body.classList.remove('header-scroll-lock')

  document.documentElement.style.removeProperty('--header-scrollbar-width')
}

const updatePageScroll = () => {
  const shouldLock = isMobileNavMenuVisible.value || menuStore.isMenuOpen

  if (shouldLock) {
    lockPageScroll()
    return
  }

  unlockPageScroll()
}

const closeMobileMenu = () => {
  isMobileNavMenuVisible.value = false
}

const closeProductsMenu = () => {
  if (menuStore.isMenuOpen) {
    menuStore.closeMenu()
  }
}

const closeHeaderMenus = () => {
  closeMobileMenu()
  closeProductsMenu()
}

const goToProfile = () => {
  closeHeaderMenus()

  router.push({
    name: 'profile',
    params: {
      page: 'overview',
    },
  })
}

const goToWishlist = () => {
  closeHeaderMenus()
  router.push('/wish-list')
}

const goToCart = () => {
  closeHeaderMenus()
  router.push('/cart')
}

const openLogin = () => {
  closeHeaderMenus()

  if (IS_LOGIN_MODAL_ACTIVE) {
    loginModalStore.openModal()
    return
  }

  router.push({
    name: 'auth',
    query: {
      type: 'login',
    },
  })
}

const openRegistration = () => {
  closeHeaderMenus()

  if (IS_LOGIN_MODAL_ACTIVE) {
    regModalStore.openModal()
    return
  }

  router.push({
    name: 'auth',
    query: {
      type: 'signup',
    },
  })
}

const toggleMobileMenu = () => {
  if (isMobileNavMenuVisible.value) {
    closeMobileMenu()
    return
  }

  closeProductsMenu()

  isMobileNavMenuVisible.value = true
}

const toggleProducts = () => {
  if (menuStore.isMenuOpen) {
    closeProductsMenu()
    return
  }

  closeMobileMenu()

  menuStore.toggleMenu()
}

const sanitizeSearch = (value) => {
  return String(value || '').replace(/[^a-zA-Z0-9\s._\-']/g, '')
}

const goToSearchResults = () => {
  const value = sanitizeSearch(search.value).trim()

  if (!value) {
    if (
      router.currentRoute.value.path === '/products/all/all' &&
      !router.currentRoute.value.query.search
    ) {
      return
    }

    router.replace({
      path: '/products/all/all',
    })

    return
  }

  if (
    router.currentRoute.value.path === '/products/all/all' &&
    router.currentRoute.value.query.search === value
  ) {
    return
  }

  router.replace({
    path: '/products/all/all',
    query: {
      search: value,
    },
  })
}

watch(search, (value) => {
  const sanitized = sanitizeSearch(value)

  if (sanitized !== value) {
    search.value = sanitized
    return
  }

  clearTimeout(searchTimeout)

  searchTimeout = setTimeout(() => {
    goToSearchResults()
  }, 300)
})

watch(
  () => router.currentRoute.value.query.search,
  (value) => {
    const routeSearch = sanitizeSearch(value || '')

    if (routeSearch !== search.value) {
      search.value = routeSearch
    }
  },
)

watch(
  [isMobileNavMenuVisible, () => menuStore.isMenuOpen],
  () => {
    updatePageScroll()
  },
  {
    immediate: true,
  },
)

watch(isTablet, (value) => {
  if (!value) {
    closeMobileMenu()
  }
})

watch(
  () => router.currentRoute.value.fullPath,
  () => {
    closeHeaderMenus()
  },
)

onMounted(() => {
  tabletMedia = window.matchMedia('(max-width: 991.98px)')
  smallTabletMedia = window.matchMedia('(max-width: 767.98px)')
  mobileMedia = window.matchMedia('(max-width: 619.98px)')
  smallMobileMedia = window.matchMedia('(max-width: 479.98px)')

  tabletMedia.addEventListener('change', updateBreakpoints)
  smallTabletMedia.addEventListener('change', updateBreakpoints)
  mobileMedia.addEventListener('change', updateBreakpoints)
  smallMobileMedia.addEventListener('change', updateBreakpoints)

  updateBreakpoints()
  updateHeaderHeight()
  updatePageScroll()

  headerResizeObserver = new ResizeObserver(() => {
    updateHeaderHeight()
  })

  if (headerRef.value) {
    headerResizeObserver.observe(headerRef.value)
  }
})

onBeforeUnmount(() => {
  clearTimeout(searchTimeout)

  unlockPageScroll()

  tabletMedia?.removeEventListener('change', updateBreakpoints)
  smallTabletMedia?.removeEventListener('change', updateBreakpoints)
  mobileMedia?.removeEventListener('change', updateBreakpoints)
  smallMobileMedia?.removeEventListener('change', updateBreakpoints)

  if (headerResizeObserver) {
    headerResizeObserver.disconnect()
    headerResizeObserver = null
  }

  document.documentElement.style.removeProperty('--header-height')
})
</script>

<template>
  <header
    ref="headerRef"
    class="header"
    :class="{
      active: menuStore.isMenuOpen,
      'nav-open': isMobileNavMenuVisible,
    }"
  >
    <div class="header__inner _cnt">
      <RouterLink to="/" class="header__logo _ibg-contain" @click="closeHeaderMenus">
        <img class="header__logo_desk" src="@/assets/img/logo.svg" alt="" />
      </RouterLink>

      <BaseButton
        v-if="!isMobile"
        class="header__more"
        :icon="menuStore.isMenuOpen ? 'close' : 'more'"
        :variant="menuStore.isMenuOpen ? 'secondary' : 'primary'"
        :active="menuStore.isMenuOpen"
        @click="toggleProducts"
      >
        {{ $t('Products') }}
      </BaseButton>

      <BaseInput
        v-if="!isTablet"
        v-model="search"
        :placeholder="$t('Search')"
        class="header__input"
      >
        <template #prefix>
          <SvgIcon :icon="SearchIcon" class="header__input-icon" />
        </template>
      </BaseInput>

      <LanguageSelector v-if="!isSmallTablet" class="header__select header__select_lang" />

      <CurrencySelector v-if="!isSmallTablet" class="header__select header__select_cur" />

      <div v-if="authStore.isAuth" class="header__auth auth">
        <RouterLink
          to="/profile/balance"
          class="auth__link auth__link_balance"
          @click="closeHeaderMenus"
        >
          <div class="auth__link-price">
            {{ profileStore.profile.balanceInCurrency }}
            {{ currStore.currency?.symbol }}
          </div>
        </RouterLink>

        <RouterLink
          v-if="!isSmallMobile"
          to="/wish-list"
          class="auth__link auth__link_favorite"
          @click="closeHeaderMenus"
        >
          <SvgIcon :icon="FavoriteIcon" class="auth__link-icon" />

          <div
            v-if="wishListStore.items && wishListStore.items.length"
            class="auth__link-indicator"
          >
            {{ wishListStore.items.length }}
          </div>
        </RouterLink>

        <RouterLink to="/cart" class="auth__link" @click="closeHeaderMenus">
          <SvgIcon :icon="CartIcon" class="auth__link-icon" />

          <div v-if="cartStore.cart?.products?.length" class="auth__link-indicator">
            {{ cartStore.cart.products.length }}
          </div>
        </RouterLink>

        <BaseButton
          v-if="!isTablet"
          variant="secondary"
          class="auth__profile"
          icon="profile"
          :active="false"
          @click="goToProfile"
        >
          {{ $t('My profile') }}
        </BaseButton>
      </div>

      <div v-else class="header__auth auth">
        <BaseButton class="auth__button auth__button_in" @click="openLogin">
          {{ $t('Sign In') }}
        </BaseButton>

        <BaseButton
          v-if="!isSmallTablet"
          class="auth__button auth__button_up"
          variant="secondary"
          @click="openRegistration"
        >
          {{ $t('Sign Up') }}
        </BaseButton>
      </div>

      <div
        class="header__nav nav"
        :class="{
          open: isMobileNavMenuVisible,
        }"
      >
        <BaseInput
          v-if="isTablet"
          v-model="search"
          :placeholder="$t('Search')"
          class="header__input header__input_mobile"
        >
          <template #prefix>
            <SvgIcon :icon="SearchIcon" class="header__input-icon" />
          </template>
        </BaseInput>

        <BaseButton
          v-if="isMobile"
          class="header__more header__more_mobile"
          :icon="menuStore.isMenuOpen ? 'close' : 'more'"
          :variant="menuStore.isMenuOpen ? 'secondary' : 'primary'"
          :active="menuStore.isMenuOpen"
          @click="toggleProducts"
        >
          {{ $t('Products') }}
        </BaseButton>

        <BaseButton
          v-if="authStore.isAuth && isTablet"
          variant="secondary"
          class="auth__profile auth__profile_mobile"
          icon="profile"
          :active="false"
          @click="goToProfile"
        >
          {{ $t('My profile') }}
        </BaseButton>

        <button
          v-if="authStore.isAuth && isSmallMobile"
          type="button"
          class="nav__action"
          @click="goToWishlist"
        >
          <span class="nav__action-icon">
            <SvgIcon :icon="FavoriteIcon" class="auth__link-icon" />

            <span
              v-if="wishListStore.items && wishListStore.items.length"
              class="nav__action-indicator"
            >
              {{ wishListStore.items.length }}
            </span>
          </span>

          <span>
            {{ $t('Wishlist') }}
          </span>
        </button>

        <div v-if="isSmallTablet" class="nav__selectors">
          <LanguageSelector class="header__select header__select_lang" />

          <CurrencySelector class="header__select header__select_cur" />
        </div>

        <BaseButton
          v-if="!authStore.isAuth && isSmallTablet"
          class="auth__button auth__button_up auth__button_mobile"
          variant="secondary"
          @click="openRegistration"
        >
          {{ $t('Sign Up') }}
        </BaseButton>
      </div>

      <button
        v-if="isTablet"
        type="button"
        class="header__icon-menu icon-menu"
        :class="{
          open: isMobileNavMenuVisible,
        }"
        :aria-label="$t(isMobileNavMenuVisible ? 'Close menu' : 'Open menu')"
        @click="toggleMobileMenu"
      >
        <span></span>
      </button>
    </div>

    <Transition>
      <MenuView v-if="menuStore.isMenuOpen" />
    </Transition>
  </header>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.header {
  position: fixed;

  top: 0;
  right: 0;
  left: 0;

  width: 100%;
  max-width: 100%;
  min-width: 320px;

  z-index: var(--header-z-index);

  background-color: var(--bg-secondary-color);

  border-bottom: 3px solid var(--hint-primary-color);

  transition:
    background-color 0.3s ease,
    border-color 0.3s ease;

  &__inner {
    display: flex;
    align-items: center;

    min-width: 0;

    @include adaptiveValue('gap', 20, 10);
    @include adaptiveValue('min-height', 98, 79);
  }

  &__logo {
    display: block;

    width: fit-content;

    flex: 0 0 auto;

    @include adaptiveValue('min-width', 145, 116);
    @include adaptiveValue('height', 29, 23);

    @media (max-width: $md5) {
      margin-right: auto;
    }

    @media (max-width: 374.98px) {
      min-width: 100px;
      height: 20px;
    }
  }

  &__logo,
  &__more,
  &__input,
  &__auth,
  &__select,
  &__icon-menu {
    position: relative;

    z-index: calc(var(--header-z-index) + 1);

    align-self: center;
  }

  &__more {
    flex: 0 0 auto;
    @media (max-width: $md3) {
      margin-right: auto;
    }
    @media (min-width: $md5) {
      min-width: 127px;
      width: fit-content;
    }

    &_mobile {
      width: 100%;

      margin-right: 0;
    }
  }

  &__input {
    min-width: 0;

    @media (min-width: $md3) {
      flex: 1 1 auto;

      max-width: 561px;

      margin-right: auto;
    }

    &_mobile {
      width: 100%;
      max-width: none;

      margin-right: 0;
    }

    &-icon {
      min-width: 16px;
      height: 16px;
    }
  }

  &__select {
    flex: 0 0 auto;
  }

  &__auth {
    display: flex;
    align-items: center;

    flex: 0 0 auto;

    @include adaptiveValue('gap', 14, 10);
  }

  &__icon-menu {
    flex: 0 0 auto;
  }
}

.auth {
  display: flex;

  @include adaptiveValue('gap', 14, 10);

  &__link {
    position: relative;

    min-width: 48px;
    width: fit-content;
    height: 48px;

    display: flex;
    align-items: center;
    justify-content: center;

    border: 2px solid var(--border-primary-color);
    border-radius: 10px;

    background-color: var(--bg-tenth-color);

    color: var(--border-dark-color);

    transition:
      color 0.3s ease,
      border-color 0.3s ease,
      background-color 0.3s ease;

    &_balance {
      @include adaptiveValue('min-width', 103, 68);
      @include adaptiveValue('padding-left', 20, 12);
      @include adaptiveValue('padding-right', 20, 12);

      color: var(--hint-primary-color);

      font-family: var(--font-gabarito);
      font-size: 15px;
      font-weight: 900;
    }

    &.router-link-active {
      color: var(--light-color);

      background-color: var(--hint-primary-color);
    }

    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);

        border-color: var(--hint-primary-color);
      }
    }

    &-icon {
      min-width: 18px;
      height: 18px;
    }

    &-indicator {
      position: absolute;

      top: 0;
      right: 0;

      transform: translate(35%, -35%);

      min-width: 22px;
      height: 22px;

      display: flex;
      align-items: center;
      justify-content: center;

      padding: 0 4px;

      border-radius: 7px;

      background-color: var(--hint-primary-color);

      color: var(--light-color);

      font-family: var(--font-gabarito);
      font-size: 14px;
      line-height: 14px;
      font-weight: 900;
    }
  }

  &__profile {
    @media (min-width: $md4) {
      min-width: 140px;

      white-space: nowrap;
    }

    &_mobile {
      width: 100%;
    }
  }

  &__button {
    &_in {
      min-width: 140px;
      width: 100%;

      white-space: nowrap;

      @media (max-width: 374.98px) {
        min-width: 120px;
      }
    }

    &_up {
      width: 100%;

      white-space: nowrap;

      @media (min-width: $md4) {
        min-width: 140px;
      }
    }

    &_mobile {
      width: 100%;
    }
  }
}

.nav {
  @media (min-width: $md3) {
    @include hide-item;
  }

  @media (max-width: $md3) {
    position: fixed;

    z-index: var(--menu-z-index);

    top: var(--header-height);
    left: -100%;

    width: 100%;
    height: calc(100dvh - var(--header-height));
    max-height: calc(100dvh - var(--header-height));

    display: flex;
    flex-direction: column;

    gap: 12px;

    padding: 25px 15px;

    overflow-x: hidden;
    overflow-y: auto;

    overscroll-behavior-y: contain;

    -webkit-overflow-scrolling: touch;

    background-color: var(--bg-primary-color);

    transition: left 0.3s ease;

    &.open {
      left: 0;
    }
  }

  &__selectors {
    width: 100%;

    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    gap: 12px;

    .header__select {
      width: 100%;
    }

    @media (max-width: $md7) {
      grid-template-columns: 1fr;
    }
  }

  &__action {
    width: 100%;

    display: flex;
    align-items: center;

    @include adaptiveValue('gap', 12, 10);
    @include adaptiveValue('min-height', 48, 45);
    @include adaptiveValue('padding-top', 10, 8);
    @include adaptiveValue('padding-right', 16, 12);
    @include adaptiveValue('padding-bottom', 10, 8);
    @include adaptiveValue('padding-left', 16, 12);

    border: 2px solid var(--border-primary-color);
    border-radius: 10px;

    background-color: var(--bg-tenth-color);

    color: var(--primary-color);

    font-family: inherit;

    @include adaptiveValue('font-size', 14, 13);

    font-weight: 600;

    text-align: left;

    cursor: pointer;

    &-icon {
      position: relative;

      display: flex;
      align-items: center;
      justify-content: center;

      min-width: 22px;
      height: 22px;
    }

    &-indicator {
      position: absolute;

      top: -8px;
      right: -10px;

      min-width: 18px;
      height: 18px;

      display: flex;
      align-items: center;
      justify-content: center;

      padding: 0 4px;

      border-radius: 6px;

      background-color: var(--hint-primary-color);

      color: var(--light-color);

      font-family: var(--font-gabarito);
      font-size: 11px;
      line-height: 11px;
      font-weight: 900;
    }
  }
}

.icon-menu {
  @media (min-width: $md3) {
    @include hide-item;
  }

  @media (max-width: $md3) {
    position: relative;

    align-self: center;

    flex: 0 0 auto;

    min-width: 30px;
    width: 30px;
    height: 30px;

    padding: 0;

    border: 0;

    background-color: transparent;

    cursor: pointer;

    outline: transparent;

    span,
    &::before,
    &::after {
      content: '';

      position: absolute;

      right: 0;

      width: 100%;
      height: 2px;

      background-color: var(--primary-color);

      transition:
        top 0.3s ease,
        bottom 0.3s ease,
        width 0.3s ease,
        transform 0.3s ease;
    }

    &::before {
      top: 20%;
    }

    &::after {
      bottom: 20%;
    }

    span {
      top: calc(50% - 1px);
    }

    &.open {
      span {
        width: 0;
      }

      &::before {
        top: calc(50% - 1px);

        transform: rotate(-45deg);
      }

      &::after {
        bottom: calc(50% - 1px);

        transform: rotate(45deg);
      }
    }
  }
}

.v-enter-active,
.v-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;

  transform: translateY(-8px);
}
</style>

<style lang="scss">
html.header-scroll-lock,
body.header-scroll-lock {
  overflow: hidden;
  overscroll-behavior: none;
}

body.header-scroll-lock {
  padding-right: var(--header-scrollbar-width, 0px);

  touch-action: none;
}

html.header-scroll-lock .header {
  padding-right: var(--header-scrollbar-width, 0px);
}
</style>
