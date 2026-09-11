<script setup>
import router from '@/router'

import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useCurrStore } from '@/stores/currencies'
import { useLoginModalStore } from '@/stores/loginModal'
import { useMenuStore } from '@/stores/menu'
import { useProfileStore } from '@/stores/profile'
import { useRegModalStore } from '@/stores/regModal'
import { useWishListStore } from '@/stores/wishlist'

import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import CurrencySelector from '../CurrencySelector.vue'
import LanguageSelector from '../LanguageSelector.vue'
import MenuView from '../MenuView.vue'
import BaseButton from '../ui/BaseButton.vue'
import BaseInput from '../ui/BaseInput.vue'
import { CartIcon, FavoriteIcon, SearchIcon } from '../ui/icons/index.js'
import SvgIcon from '../ui/icons/SvgIcon.vue'

import { initDynamicAdapt } from '@/utils/dynamic_adapt.js'

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

const search = ref(String(router.currentRoute.value.query.search || ''))

let headerResizeObserver = null
let searchTimeout = null

const updateHeaderHeight = () => {
  if (!headerRef.value) return

  document.documentElement.style.setProperty('--header-height', `${headerRef.value.offsetHeight}px`)
}

const goToProfile = () => {
  router.push({
    name: 'profile',
    params: {
      page: 'overview',
    },
  })
}

const toggleMobileMenu = () => {
  isMobileNavMenuVisible.value = !isMobileNavMenuVisible.value
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

  isMobileNavMenuVisible.value = false
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

watch(isMobileNavMenuVisible, (isOpen) => {
  document.body.style.overflow = isOpen ? 'hidden' : ''
})

onMounted(() => {
  initDynamicAdapt('max')

  updateHeaderHeight()

  headerResizeObserver = new ResizeObserver(() => {
    updateHeaderHeight()
  })

  if (headerRef.value) {
    headerResizeObserver.observe(headerRef.value)
  }
})

onBeforeUnmount(() => {
  clearTimeout(searchTimeout)

  document.body.style.overflow = ''

  if (headerResizeObserver) {
    headerResizeObserver.disconnect()
  }

  document.documentElement.style.removeProperty('--header-height')
})
</script>

<template>
  <header
    ref="headerRef"
    :class="[
      'header',
      {
        active: menuStore.isMenuOpen,
      },
    ]"
  >
    <div class="header__inner _cnt">
      <RouterLink to="/" class="header__logo _ibg-contain">
        <img class="header__logo_desk" src="@/assets/img/logo.svg" />
      </RouterLink>

      <BaseButton
        data-da=".header__nav,619.98,first"
        class="header__more"
        :icon="menuStore.isMenuOpen ? 'close' : 'more'"
        :variant="menuStore.isMenuOpen ? 'secondary' : 'primary'"
        :active="menuStore.isMenuOpen"
        @click="menuStore.toggleMenu"
      >
        {{ $t('Products') }}
      </BaseButton>

      <BaseInput
        v-model="search"
        :placeholder="$t('Search')"
        class="header__input"
        data-da=".header__nav,991.98,first"
      >
        <template #prefix>
          <SvgIcon :icon="SearchIcon" class="header__input-icon" />
        </template>
      </BaseInput>

      <LanguageSelector data-da=".header__nav,767.98" class="header__select header__select_lang" />

      <CurrencySelector data-da=".header__nav,767.98" class="header__select header__select_cur" />

      <div v-show="authStore.isAuth" class="header__auth auth">
        <RouterLink to="/profile/balance" class="auth__link auth__link_balance">
          <div class="auth__link-price">
            {{ profileStore.profile.balanceInCurrency }}
            {{ currStore.currency.symbol }}
          </div>
        </RouterLink>

        <RouterLink
          v-show="authStore.isAuth"
          data-da=".header__nav,479.98,first"
          to="/wish-list"
          class="auth__link auth__link_favorite"
        >
          <SvgIcon :icon="FavoriteIcon" class="auth__link-icon" />

          <div
            v-if="wishListStore.items && wishListStore.items.length"
            class="auth__link-indicator"
          >
            {{ wishListStore.items.length }}
          </div>
        </RouterLink>

        <RouterLink v-show="authStore.isAuth" to="/cart" class="auth__link">
          <SvgIcon :icon="CartIcon" class="auth__link-icon" />

          <div
            v-if="cartStore.cart && cartStore.cart.products && cartStore.cart.products.length"
            class="auth__link-indicator"
          >
            {{ cartStore.cart.products.length }}
          </div>
        </RouterLink>

        <BaseButton
          v-show="authStore.isAuth"
          variant="secondary"
          class="auth__profile"
          icon="profile"
          :active="false"
          data-da=".header__nav,991.98,first"
          @click="goToProfile"
        >
          {{ $t('My profile') }}
        </BaseButton>
      </div>

      <div v-show="!authStore.isAuth" class="header__auth auth">
        <BaseButton class="auth__button auth__button_in" @click="loginModalStore.openModal">
          {{ $t('Sign In') }}
        </BaseButton>

        <BaseButton
          data-da=".header__nav,767.98"
          class="auth__button auth__button_up"
          variant="secondary"
          @click="regModalStore.openModal"
        >
          {{ $t('Sign Up') }}
        </BaseButton>
      </div>

      <div
        class="header__nav nav"
        :class="{
          open: isMobileNavMenuVisible,
        }"
      ></div>

      <button
        type="button"
        class="header__icon-menu icon-menu"
        :class="{
          open: isMobileNavMenuVisible,
        }"
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
  background-color: var(--bg-secondary-color);
  top: 0;
  right: 0;
  left: 0;
  max-width: 100vw;
  min-width: 320px;
  width: 100%;
  z-index: var(--header-z-index);
  transition: all 0.3s ease 0s;
  border-bottom: 3px soldi var(--hint-primary-color);
  &__inner {
    display: flex;
    @include adaptiveValue('gap', 20, 10);
    @include adaptiveValue('min-height', 98, 79);
  }

  &__logo {
    display: block;
    width: fit-content;

    @include adaptiveValue('min-width', 145, 116);
    @include adaptiveValue('height', 29, 23);
    @media (max-width: $md5) {
      margin-right: auto;
    }
    @media (max-width: 374.98px) {
      min-width: 100px;
      height: 20px;
    }
    &_desk {
    }
  }
  &__logo,
  &__more,
  &__input,
  &__auth,
  &__select {
    position: relative;
    z-index: var(--header-z-index);
    align-self: center;
  }
  &__more {
    @media (min-width: $md5) {
      min-width: 127px;
      width: fit-content;
    }
    @media (max-width: $md3) {
      margin-right: auto;
    }
    @media (max-width: $md5) {
      margin-right: 0px;
      width: 100%;
    }
  }

  &__input {
    @media (min-width: $md3) {
      max-width: 561px;
      margin-right: auto;
    }
    &-icon {
      min-width: 16px;
      height: 16px;
    }
  }

  &__select {
    &_lang {
    }

    &_cur {
    }
  }

  &__auth {
    display: flex;
    gap: 14px;
  }

  &__icon-menu {
  }
}

.auth {
  display: flex;
  @include adaptiveValue('gap', 14, 10);
  &__link {
    min-width: 48px;
    height: 48px;
    width: fit-content;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background-color: var(--bg-tenth-color);
    border: 2px solid var(--border-primary-color);
    color: var(--border-dark-color);
    position: relative;
    transition: all 0.3s ease 0s;
    &_balance {
      @include adaptiveValue('min-width', 103, 68);
      color: var(--hint-primary-color);
      font-size: 15px;
      font-weight: 900;
      font-family: var(--font-gabarito);
      @include adaptiveValue('padding-left', 20, 12);
      @include adaptiveValue('padding-right', 20, 12);
    }
    &_favorite {
      @media (max-width: $md7) {
        min-width: 100%;
        width: 100%;
        min-height: 45px;
      }
    }
    &.router-link-active {
      color: var(--light-color);
      background-color: var(--hint-primary-color);
      pointer-events: none;
    }
    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);
        border-color: inherit;
      }
    }
    &-icon {
      min-width: 18px;
      height: 18px;
    }

    &-indicator {
      min-width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 7px;
      background-color: var(--hint-primary-color);
      color: var(--light-color);
      font-weight: 900;
      line-height: 14px;
      font-size: 14px;
      font-family: var(--font-gabarito);
      position: absolute;
      top: 0;
      right: 0;
      transform: translate(35%, -35%);
    }
  }

  &__profile {
    @media (min-width: $md4) {
      min-width: 140px;
      white-space: nowrap;
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
      white-space: nowrap;
      width: 100%;
      @media (min-width: $md4) {
        min-width: 140px;
      }
    }
  }
}

.nav {
  @media (min-width: $md3) {
    @include hide-item;
  }
  @media (max-width: $md3) {
    position: fixed;
    top: var(--header-height);

    left: -100%;

    width: 100%;

    height: calc(100dvh - var(--header-height));
    max-height: calc(100dvh - var(--header-height));

    display: block;

    z-index: var(--menu-z-index);

    padding: 25px 15px;

    overflow-x: hidden;
    overflow-y: auto;

    -webkit-overflow-scrolling: touch;

    transition: left 0.3s ease 0s;

    background-color: var(--bg-primary-color);

    margin-left: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;

    &::before {
      content: '';

      position: fixed;

      z-index: var(--header-overlay-z-index);

      top: 0;
      left: -100%;

      width: 100%;
      @include adaptiveValue('height', 98, 79);
      border-bottom: 3px solid var(--hint-primary-color);

      background-color: var(--bg-secondary-color);

      transition: left 0.3s ease 0s;
    }

    &.open {
      left: 0;

      &::before {
        left: 0;
      }
    }
  }
}

.icon-menu {
  @media (min-width: $md3) {
    @include hide-item;
  }

  @media (max-width: $md3) {
    align-self: center;

    position: relative;

    min-width: 30px;
    height: 30px;

    cursor: pointer;

    z-index: 12;

    background-color: transparent;

    outline: transparent;

    span,
    &::before,
    &::after {
      content: '';

      transition: all 0.3s ease 0s;

      right: 0;

      position: absolute;

      width: 100%;
      height: 2px;

      background-color: var(--primary-color);
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
</style>
