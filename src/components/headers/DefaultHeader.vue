<template>
  <header class="header" :class="{ scrolled: isScrolled }">
    <div class="header__bg _ibg" aria-hidden="true">
      <img src="@/assets/img/header-bg.png" alt="" />
    </div>

    <div class="header__inner _cnt">
      <!-- Logo -->
      <RouterLink
        :to="{ name: 'HomePage' }"
        class="header__logo logo _ibg-contain"
        :aria-label="$t('Home')"
      >
        <img src="@/assets/img/icons/logo-deck.svg" class="logo__desk" alt="" />

        <img src="@/assets/img/icons/logo-mob.svg" class="logo__mob" alt="" />
      </RouterLink>

      <!-- Navigation -->
      <div class="header__nav nav" :class="{ open: isMobileMenuVisible }">
        <RouterLink :to="{ name: 'HomePage' }" class="nav__link">
          {{ $t('Play') }}
        </RouterLink>

        <RouterLink :to="{ name: 'ProductListPage' }" class="nav__link">
          {{ $t('Market') }}
        </RouterLink>

        <RouterLink
          v-if="isAuthenticated"
          :to="{ name: 'MyCardsPage' }"
          class="nav__link"
        >
          {{ $t('My collection') }}
        </RouterLink>

        <RouterLink
          v-if="isAuthenticated"
          :to="{ path: '/buy-pack' }"
          class="nav__link"
        >
          {{ $t('Packs') }}
        </RouterLink>

        <RouterLink :to="{ name: 'AboutPage' }" class="nav__link">
          {{ $t('About aroraium') }}
        </RouterLink>

        <RouterLink :to="{ name: 'FaqPage' }" class="nav__link">
          {{ $t('FAQ') }}
        </RouterLink>
      </div>

      <!-- Currency -->
      <CurrencyDropdown
        data-da-id="header-currency"
        data-da=".header__nav,767.98,first"
        class="header__currency"
      />

      <!-- Authenticated user -->
      <div v-if="isAuthenticated" class="header__auth auth">
        <!-- Balance -->
        <RouterLink
          :to="{ name: 'account-wallet' }"
          class="header__balance balance"
          :aria-label="$t('My balance')"
        >
          <PriceFormatter
            class="balance__price"
            size="size-24"
            :price="userStore.userBalance"
          />

          <SvgIcon :icon="PlusIcon" class="balance__plus" />
        </RouterLink>

        <!-- Profile dropdown -->
        <div
          class="auth__profile-menu profile-menu"
          :class="{ 'profile-menu_active': isAccountRoute }"
        >
          <RouterLink
            :to="{ name: 'account-personal' }"
            class="profile-menu__trigger profile"
            :aria-label="$t('Open profile')"
          >
            <div class="profile__avatar-frame">
              <div class="profile__avatar">
                <img
                  :src="profileImage"
                  :alt="profileImageAlt"
                  @error="handleProfileImageError"
                />
              </div>
            </div>

            <div class="profile__meta">
              <div class="profile__name">
                {{ nickName || $t('Profile') }}
              </div>

              <div class="profile__count">
                {{ heroLevel }}
              </div>
            </div>

            <SvgIcon :icon="ChevronDownIcon" class="profile__chevron" />
          </RouterLink>

          <div class="profile-menu__dropdown">
            <div class="profile-menu__dropdown-inner">
              <RouterLink
                v-for="item in accountLinks"
                :key="item.name"
                :to="{ name: item.name }"
                class="profile-menu__link"
                @click="closeMobileMenu"
              >
                {{ item.label }}
              </RouterLink>

              <div class="profile-menu__divider" />

              <button
                type="button"
                class="profile-menu__logout"
                :disabled="isLoggingOut"
                @click="logout"
              >
                <SvgIcon :icon="LogoutIcon" class="profile-menu__logout-icon" />

                <span>
                  {{ isLoggingOut ? $t('Logging out...') : $t('Log out') }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Cart -->
        <RouterLink
          :to="{ name: 'CartPage' }"
          class="auth__link"
          :aria-label="$t('Cart')"
        >
          <SvgIcon :icon="CartIcon" class="auth__link-icon" />

          <div v-if="cartItemsCount > 0" class="auth__link-count">
            {{ cartItemsCount }}
          </div>
        </RouterLink>
      </div>

      <!-- Guest -->
      <div v-else class="header__auth auth">
        <BaseButton class="auth__button" variant="bordered" @click="openLogin">
          {{ $t('Login') }}
        </BaseButton>
      </div>

      <!-- Burger -->
      <button
        type="button"
        class="header__icon-menu icon-menu"
        :class="{ open: isMobileMenuVisible }"
        :aria-label="$t('Toggle menu')"
        :aria-expanded="isMobileMenuVisible"
        @click="toggleMobileMenu"
      >
        <span />
      </button>
    </div>
  </header>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import defaultAvatar from '@/assets/img/icons/avatar.jpg'
import BaseButton from '@/components/base/BaseButton.vue'
import CurrencyDropdown from '@/components/CurrencyDropdown.vue'
import {
  CartIcon,
  ChevronDownIcon,
  LogoutIcon,
  PlusIcon,
} from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useNavigationStore } from '@/stores/navigation'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'
import { destroyDynamicAdapt, initDynamicAdapt } from '@/utils/dynamic_adapt.js'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const authStore = useAuthStore()
const cartStore = useCartStore()
const navigationStore = useNavigationStore()
const userStore = useUserStore()

const { nickName, heroLevel, userAvatarUrl } = storeToRefs(userStore)
const { isMobileMenuOpen } = storeToRefs(navigationStore)

const isScrolled = ref(false)
const isLoggingOut = ref(false)
const settingsStore = useSettingsStore()

const isMobileMenuVisible = isMobileMenuOpen

const offersEnabled = computed(() => {
  return Boolean(settingsStore.settings?.payouts?.offer_enabled)
})

const isAuthenticated = computed(() => {
  return Boolean(authStore.isAuthenticated)
})

const isAccountRoute = computed(() => {
  return typeof route.name === 'string' && route.name.startsWith('account-')
})

const cartItemsCount = computed(() => {
  return Number(cartStore.cartItemsCount || 0)
})

const accountLinks = computed(() => {
  const links = [
    {
      name: 'account-personal',
      label: t('Personal Data'),
    },
    {
      name: 'account-wallet',
      label: t('My Balance'),
    },
    {
      name: 'account-orders',
      label: t('Order History'),
    },
    {
      name: 'account-transactions',
      label: t('Transaction History'),
    },
  ]

  if (offersEnabled.value) {
    links.push(
      {
        name: 'account-offers',
        label: t('Offers'),
      },
      {
        name: 'account-withdrawals',
        label: t('Withdrawals'),
      },
    )
  }

  return links
})

const profileImage = computed(() => {
  return userAvatarUrl.value || defaultAvatar
})

const profileImageAlt = computed(() => {
  return `${nickName.value || 'User'} profile avatar`
})

const ensureUserProfile = async () => {
  if (!isAuthenticated.value) {
    return
  }

  try {
    if (!userStore.user) {
      await userStore.fetchProfile()
    }

    await userStore.initializeAvatar()
  } catch (error) {
    console.error('Failed to load user profile:', error)
  }
}

const handleProfileImageError = event => {
  const image = event.currentTarget

  if (!image || image.dataset.fallbackApplied === 'true') {
    return
  }

  image.dataset.fallbackApplied = 'true'
  image.src = defaultAvatar
}

const handleScroll = () => {
  isScrolled.value = (window.scrollY || window.pageYOffset) >= 1
}

const openLogin = async () => {
  closeMobileMenu()

  await router.push({
    name: 'Auth',
    query: {
      form: 'signin',
    },
  })
}

const logout = async () => {
  if (isLoggingOut.value) {
    return
  }

  isLoggingOut.value = true

  try {
    closeMobileMenu()
    await authStore.logout()

    await router.push({
      name: 'HomePage',
    })
  } catch (error) {
    console.error('Failed to log out:', error)
  } finally {
    isLoggingOut.value = false
  }
}

const toggleMobileMenu = () => {
  navigationStore.toggleMobileMenu()
}

const closeMobileMenu = () => {
  navigationStore.closeMobileMenu()
}

const refreshDynamicAdapt = async () => {
  await nextTick()
  initDynamicAdapt('max')
}

watch(
  () => route.fullPath,
  () => {
    closeMobileMenu()
  },
)

watch(
  isAuthenticated,
  async authenticated => {
    if (authenticated) {
      await ensureUserProfile()
    }
  },
  {
    immediate: true,
  },
)

onMounted(async () => {
  await Promise.all([refreshDynamicAdapt(), ensureUserProfile()])

  handleScroll()

  window.addEventListener('scroll', handleScroll, {
    passive: true,
  })
})

onBeforeUnmount(() => {
  destroyDynamicAdapt()
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="scss" scoped>
.header {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 12;

  width: auto;
  min-width: 320px;
  max-width: none;

  &.scrolled {
    @media (min-width: $md2) {
      .header__inner {
        min-height: 50px;
      }
    }
  }

  &__bg {
    position: absolute;
    inset: 0;

    width: 100%;
    height: 100%;

    pointer-events: none;
  }

  &__inner {
    @include adaptiveValue('gap', 32, 10, 1840, 1370, 1);
    @include adaptiveValue('min-height', 67, 50, 1840, 1370, 1);

    position: relative;
    z-index: 1;

    display: flex;
    align-items: stretch;

    padding-top: 5px;
    padding-bottom: 5px;

    transition: min-height 0.3s ease;
  }

  &__logo,
  &__auth,
  &__balance,
  &__currency {
    position: relative;
    z-index: 12;
  }

  &__currency {
    @media (min-width: $md4) {
      align-self: center;

      min-width: 73px;

      margin-left: auto;
    }

    @media (max-width: $md4) {
      width: 100%;
    }
  }

  &__auth {
    @media (max-width: $md4) {
      margin-left: auto;
    }
  }
}

.logo {
  @include adaptiveValue('min-width', 176, 100, 1840, 1370, 1);
  @include adaptiveValue('height', 34, 20, 1840, 1370, 1);

  display: block;
  align-self: center;

  width: fit-content;

  @media (max-width: $md6) {
    min-width: 32px;
    height: 33px;
  }

  &__desk {
    @media (max-width: $md6) {
      @include hide-item;
    }
  }

  &__mob {
    @media (min-width: $md6) {
      @include hide-item;
    }
  }
}

.nav {
  @media (min-width: 1199.98px) {
    display: flex;

    min-height: inherit;
  }

  @media (max-width: 1199.98px) {
    position: fixed;
    top: 50px;
    left: -100%;
    z-index: 10;

    display: block;
    overflow-x: hidden;
    overflow-y: auto;

    width: 100%;
    height: calc(100dvh - 50px);
    min-height: calc(100dvh - 50px);

    margin-left: 0;
    padding: 25px 10px 30px;

    border-top: 1px solid var(--border-priamry-color);
    background-color: var(--bg-primary-color);

    transition: left 0.3s ease;

    -webkit-overflow-scrolling: touch;

    &::before {
      position: fixed;
      top: 0;
      left: -100%;
      z-index: 11;

      width: 100%;
      height: 50px;

      background-color: var(--bg-primary-color);

      content: '';

      transition: left 0.3s ease;
    }

    &.open {
      left: 0;

      &::before {
        left: 0;
      }
    }
  }

  &__link {
    @include adaptiveValue('padding-left', 32, 10, 1840, 1370, 1);
    @include adaptiveValue('padding-right', 32, 10, 1840, 1370, 1);

    display: flex;
    align-items: center;
    justify-content: center;

    padding-top: 10px;
    padding-bottom: 10px;

    color: var(--hint-primary-color);
    font-size: 14px;
    font-weight: 500;
    text-transform: uppercase;
    white-space: nowrap;

    transition: color 0.3s ease;

    &.router-link-active {
      color: var(--primary-color);

      pointer-events: none;
    }

    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-secondary-color);
      }
    }
  }
}

.auth {
  @include adaptiveValue('gap', 32, 10, 1840, 1370, 1);

  display: flex;
  align-items: stretch;

  &__profile-menu {
    align-self: stretch;
  }

  &__link {
    @include adaptiveValue('min-width', 64, 40, 1840, 1370, 1);

    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    height: inherit;

    color: var(--hint-primary-color);

    transition: color 0.3s ease;

    &.router-link-active {
      color: var(--primary-color);
    }

    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-secondary-color);
      }
    }

    &-icon {
      @include adaptiveValue('min-width', 24, 20);
      @include adaptiveValue('height', 24, 20);
    }

    &-count {
      position: absolute;
      top: 0;
      right: 0;
      z-index: 1;

      display: flex;
      align-items: center;
      justify-content: center;

      min-width: 18px;
      min-height: 18px;

      padding: 3px 5px;

      border-radius: 50%;
      background-color: var(--hint-primary-color);

      color: var(--primary-color);
      font-size: 12px;
      line-height: 1;

      transform: translate(25%, -10%);
    }
  }

  &__button {
    align-self: center;

    width: fit-content;
    min-width: 111px;
    min-height: 36px !important;

    font-family: var(--font-inter) !important;
    font-size: 14px !important;
  }
}

.balance {
  @include adaptiveValue('gap', 20, 10);

  display: flex;
  align-items: center;

  height: 100%;

  @media (any-hover: hover) {
    &:hover {
      .balance__plus {
        color: var(--hint-secondary-color);
      }
    }
  }

  @media (max-width: $md5) {
    width: fit-content;
  }

  &__price {
    color: var(--primary-color);

    @media (max-width: $md6) {
      :deep(.price__number) {
        overflow: hidden;

        min-width: 0;
        max-width: 86px;

        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  &__plus {
    @include adaptiveValue('min-width', 24, 20);
    @include adaptiveValue('height', 24, 20);

    color: var(--hint-primary-color);

    transition: color 0.3s ease;

    @media (max-width: $md5) {
      @include hide-item;
    }
  }
}

.profile-menu {
  position: relative;

  display: flex;
  align-items: stretch;

  min-width: 0;

  /*
   * Dropdown is hidden unless the whole profile area
   * is hovered or focused using the keyboard.
   */
  &:hover,
  &:focus-within {
    .profile-menu__dropdown {
      visibility: visible;

      opacity: 1;

      pointer-events: auto;

      transform: translateY(0);
    }

    .profile__chevron {
      color: var(--primary-color);

      transform: rotate(180deg);
    }

    .profile__name {
      color: var(--hint-secondary-color);
    }

    .profile__avatar-frame {
      filter: brightness(1.12);
    }

    .profile__avatar img {
      transform: scale(1.04);
    }
  }

  &_active {
    .profile__name {
      color: var(--primary-color);
    }
  }

  &__trigger {
    height: 100%;
  }

  &__dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 30;

    visibility: hidden;

    width: max-content;
    min-width: 230px;

    padding-top: 8px;

    opacity: 0;

    pointer-events: none;

    transform: translateY(-6px);
    transition:
      visibility 0.25s ease,
      opacity 0.25s ease,
      transform 0.25s ease;
  }

  &__dropdown-inner {
    overflow: hidden;

    padding: 6px;

    border: 1px solid var(--border-fourth-color);
    border-radius: 4px;
    background-color: var(--bg-third-color);
    box-shadow: 0 16px 35px rgb(0 0 0 / 45%);
  }

  &__link,
  &__logout {
    display: flex;
    align-items: center;

    width: 100%;
    min-height: 40px;

    padding: 9px 12px;

    border: 0;
    border-radius: 4px;
    outline: none;
    background-color: transparent;

    color: var(--third-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    line-height: 18px;
    text-align: left;
    white-space: nowrap;

    cursor: pointer;

    transition:
      color 0.3s ease,
      background-color 0.3s ease;

    &:focus-visible {
      background-color: var(--border-fourth-color);

      color: var(--hint-secondary-color);
    }

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--border-fourth-color);

        color: var(--hint-secondary-color);
      }
    }
  }

  &__link {
    &.router-link-active {
      background-color: var(--hint-third-color);

      color: var(--primary-color);

      pointer-events: none;
    }
  }

  &__divider {
    width: 100%;
    height: 1px;

    margin: 5px 0;

    background-color: var(--border-fourth-color);
  }

  &__logout {
    gap: 10px;

    color: var(--hint-primary-color);

    &:disabled {
      opacity: 0.5;

      cursor: not-allowed;
      pointer-events: none;
    }
  }

  &__logout-icon {
    flex: 0 0 18px;

    width: 18px;
    height: 18px;
  }

  @media (max-width: $md7) {
    &__dropdown {
      right: -12px;

      min-width: 210px;
    }
  }
}

.profile {
  @include adaptiveValue('gap', 14, 8);

  display: flex;
  align-items: center;

  min-width: 0;

  &__avatar-frame {
    @include adaptiveValue('width', 58, 46);
    @include adaptiveValue('min-width', 58, 46);

    position: relative;

    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;

    height: auto;
    aspect-ratio: 1 / 1;

    background-image: url('../../assets/img/avarat-frame.png');
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;

    pointer-events: none;

    transition: filter 0.3s ease;
  }

  &__avatar {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 1;

    overflow: hidden;

    width: 65%;
    height: auto;
    aspect-ratio: 1 / 1;

    border: 1px solid var(--border-priamry-color);
    border-radius: 50%;
    background-color: var(--bg-primary-color);

    transform: translate(-50%, -50%);

    img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: cover;
      object-position: center;

      transition: transform 0.3s ease;
    }
  }

  &__meta {
    overflow: hidden;

    min-width: 0;
    max-width: 100px;

    @media (max-width: $md7) {
      @include hide-item;
    }
  }

  &__name {
    overflow: hidden;

    min-width: 0;

    color: var(--hint-primary-color);
    font-family: var(--font-spectral-sc);
    font-weight: 500;
    line-height: 100%;
    text-overflow: ellipsis;
    white-space: nowrap;

    transition: color 0.3s ease;

    &:not(:last-child) {
      margin-bottom: 2px;
    }
  }

  &__count {
    color: var(--secondary-color);
    font-size: 12px;
    font-weight: 500;
    line-height: 100%;
  }

  &__chevron {
    min-width: 8px;
    height: 5px;

    color: var(--hint-primary-color);

    transform: rotate(0deg);
    transition:
      color 0.3s ease,
      transform 0.3s ease;

    @media (max-width: $md5) {
      @include hide-item;
    }
  }
}

.icon-menu {
  padding: 0;

  border: 0;
  outline: none;
  background: transparent;

  @media (min-width: 1199.98px) {
    @include hide-item;
  }

  @media (max-width: 1199.98px) {
    position: relative;
    z-index: 12;

    align-self: center;

    min-width: 30px;
    height: 30px;

    cursor: pointer;

    @media (any-hover: hover) {
      &:hover {
        span,
        &::before,
        &::after {
          background-color: var(--hint-secondary-color);
        }
      }
    }

    span,
    &::before,
    &::after {
      position: absolute;
      right: 0;

      width: 100%;
      height: 2px;

      background-color: var(--hint-primary-color);

      content: '';

      transition: all 0.3s ease;
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

      &::before,
      &::after {
        background-color: var(--primary-color);
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

    &:focus-visible {
      outline: 1px solid var(--hint-primary-color);
      outline-offset: 4px;
    }
  }
}
</style>
