<script setup>
import { ref, onMounted, nextTick, watchEffect } from 'vue'
import { RouterLink } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
import { useLoginModalStore } from '@/stores/loginModal'
import { useAuthStore } from '@/stores/auth'
import { useCurrStore } from '@/stores/currencies'
import LanguageSelector from './LanguageSelector.vue'
import { useProfileStore } from '@/stores/profile'
import { useLogoutStore } from '@/stores/logout'
import { useTopUpModalStore } from '@/stores/topUpModal'
import router from '@/router'
import UiText from './shared/UiText.vue'
import UiButton, { ButtonThemes } from './shared/UiButton.vue'
import UiSvgIcon from './shared/UiSvgIcon.vue'
import Generate3dIcon from '@/static/images/icons/generate_3d.svg'

import { initDynamicAdapt } from '@/utils/dynamic_adapt.js'
import { useRoute } from 'vue-router'
import { watch } from 'vue'

const logoutStore = useLogoutStore()
const loginModalStore = useLoginModalStore()
const authStore = useAuthStore()
const menuStore = useMenuStore()
const currStore = useCurrStore()
const profileStore = useProfileStore()
const topUpModalStore = useTopUpModalStore()

const selectedCurrency = ref({})
const isOpen = ref(false)
const route = useRoute()

const toggleMenu = () => {
  isOpen.value = !isOpen.value
}

function changeCurr() {
  currStore.setActiveCurrency(selectedCurrency.value)
}

onMounted(async () => {
  watchEffect(() => {
    selectedCurrency.value = currStore.currency
  })
  await nextTick()
  initDynamicAdapt('max')
})

function start() {
  if (authStore.isAuth) {
    router.push({ path: '/create/model' })
  } else {
    // loginModalStore.openModal()
    router.push({ path: '/sign-in' })
  }
  isOpen.value = false
}
watch(
  () => route.fullPath,
  () => {
    isOpen.value = false
  },
)
</script>

<template>
  <header class="header">
    <div class="header__inner _cnt">
      <RouterLink to="/" class="header__logo logo">
        <div class="logo__icon _ibg-contain">
          <img src="@/static/images/icons/logo.webp" alt="Logo icon" />
        </div>
        <UiText class="logo__text" text="[Your Company Name]" />
      </RouterLink>
      <nav class="header__menu menu">
        <div class="menu__icon icon-menu" :class="{ 'menu-open': isOpen }" @click="toggleMenu">
          <span></span>
        </div>
        <ul class="menu__list" :class="{ 'menu-open': isOpen }">
          <li class="menu__item">
            <RouterLink to="/" class="menu__link">
              {{ $t('Home') }}
            </RouterLink>
          </li>
          <li class="menu__item">
            <RouterLink to="/pricing" class="menu__link">
              {{ $t('Price') }}
            </RouterLink>
          </li>
        </ul>
      </nav>
      <div class="header__action action">
        <UiButton
          class="action__button action__button_3d"
          :theme="ButtonThemes.HEADER_SECONDARY"
          @click="start()"
          data-da=".menu__list,659.98"
        >
          <UiSvgIcon class="action__icon"><Generate3dIcon /></UiSvgIcon>
          <span class="action__text">{{ $t('Generate 3D') }}</span>
        </UiButton>
        <UiButton
          class="action__button"
          @click="router.push({ path: '/sign-in' })"
          v-if="!authStore.isAuth"
          :theme="ButtonThemes.HEADER_PRIMARY"
          data-da=".menu__list,479.98"
        >
          {{ $t('Sign Up/Log in') }}
        </UiButton>
      </div>
    </div>

    <!--<header :class="['section header', { active: menuStore.isMenuOpen }]">
    <div class="wrapper header-wrapper flex items-center justify-between flex-wrap">
      <div class="left flex items-center">
        <RouterLink to="/" class="logo flex items-center">
          <img alt="Logo icon" class="img" src="@/assets/imgs/logo.svg" />
        </RouterLink>
        <div class="nav flex">
          <RouterLink to="/" class="text text-14 text-inter text-white">
            <b>{{ $t('Home') }}</b>
          </RouterLink>
          <RouterLink to="/pricing" class="text text-14 text-inter text-white">
            <b>{{ $t('Pricing') }}</b>
          </RouterLink>
        </div>
      </div>
      <div class="center">
        <button
          :class="['menu-btn flex items-center', { active: menuStore.isMenuOpen }]"
          @click="menuStore.toggleMenu"
        >
          <div class="menu-btn-icon">
            <img alt="Menu icon" class="img" src="@/assets/images/menuIcon.svg" />
            <img alt="Close icon" class="img img-close" src="@/assets/imgs/close.svg" />
          </div>
        </button>
      </div>
      <div class="right flex items-center justify-end flex-wrap">
        <div class="nav flex">
          <button class="button w-144" @click="start()">
            <img class="img" src="@/assets/imgs/btn-generate-icon.svg" />
            <span>{{ $t('Generate 3D') }}</span>
          </button>
          <button
            class="button stroke w-144"
            @click="loginModalStore.openModal"
            v-if="!authStore.isAuth"
          >
            {{ $t('Sign In') }}
          </button>
        </div>
        <LanguageSelector />
        <select
          class="select"
          v-if="currStore.currencies && currStore.currencies.length > 1"
          @change="changeCurr"
          v-model="selectedCurrency"
        >
          <option v-for="(item, i) in currStore.currencies" :value="item" :key="i">
            {{ item.code }}
          </option>
        </select>
        <div class="nav flex mob">
          <RouterLink to="/" class="text text-14 text-inter">
            <b>{{ $t('Home') }}</b>
          </RouterLink>
          <RouterLink to="/pricing" class="text text-14 text-inter">
            <b>{{ $t('Pricing') }}</b>
          </RouterLink>
        </div>
        <div class="text text-14 text-inter text-white dropdown-container" v-if="authStore.isAuth">
          <div class="dropdown-link">
            <div class="flex balance items-center justify-between">
              <div class="button stroke balance-wrapper flex items-center">
                <div class="text text-14 text-white text-inter flex">
                  <img alt="coin icon" class="coin" src="@/assets/imgs/coin.svg" />
                  <span>{{ profileStore.profile.balance }}</span>
                </div>
                <button
                  class="plus-container flex items-center justify-center"
                  @click="topUpModalStore.openModal()"
                >
                  <img alt="Plus icon" class="select-icon" src="@/assets/imgs/plus.svg" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="header-icons flex" v-if="authStore.isAuth">
          <RouterLink
            v-if="authStore.isAuth"
            to="/profile/data"
            class="button w-145 profile-button"
          >
            <img alt="profile icon" class="img" src="@/assets/imgs/profile.svg" />
            <b class="text-white">{{ $t('My profile') }}</b>
          </RouterLink>
        </div>
      </div>
    </div>
  </header>-->
  </header>
</template>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;
@use '@/styles/media' as *;
@use '@/styles/classes' as *;

.header {
  box-shadow: var(--header-bottom-shadow);
  background-color: var(--bg-secondary-color);
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  z-index: var(--header-z-index);
  &__inner {
    @include adaptiveValue('min-height', 90, 60, 1470, 768, 1);
    padding-top: 10px;
    padding-bottom: 10px;
    display: flex;
    align-items: stretch;
    @include adaptiveValue('gap', 35, 20, 1470, 768, 1);
    @media (max-width: $md3) {
      gap: 15px;
    }
    @media (max-width: $md4) {
      min-height: 50px;
      padding-top: 7px;
      padding-bottom: 7px;
    }
  }
  &__logo {
    align-self: center;
    margin-right: auto;
  }
  &__menu {
  }
  &__action {
  }
}

.logo {
  height: fit-content;
  display: flex;
  align-items: center;
  position: relative;
  z-index: var(--header-z-index);
  @include adaptiveValue('gap', 20, 10, 1470, 768, 1);
  @media (max-width: $md3) {
    order: 1;
  }
  &__icon {
    @include adaptiveValue('width', 40, 30, 1470, 768, 1);
    @include adaptiveValue('height', 46, 36, 1470, 768, 1);
  }
  &__text {
    font-family: var(--font-family-red);
    text-transform: uppercase;
  }
}

.menu {
  margin: -10px 0px;
  display: flex;
  align-items: stretch;
  @media (max-width: $md3) {
    order: 3;
  }
  &__icon {
    margin: auto 0px;
  }
  &__list {
    display: flex;
    align-items: stretch;
    @media (max-width: $md3) {
      position: fixed;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      z-index: var(--menu-z-index);
      padding: 80px 10px 30px;
      overflow: auto;
      transition: left 0.3s ease 0s;
      background-color: var(--menu-bg-overlay);
      flex-direction: column;
      &::before {
        content: '';
        position: fixed;
        z-index: var(--header-overlay-z-index);
        top: 0;
        left: -100%;
        width: 100%;
        height: 60px;
        background-color: var(--bg-secondary-color);
        transition: left 0.3s ease 0s;
      }
      @media (max-width: $md4) {
        padding: 65px 10px 30px;
        &::before {
          height: 50px;
        }
      }
      &.menu-open {
        left: 0;
        &::before {
          left: 0;
        }
      }
    }
  }
  &__item {
    display: flex;
    align-items: stretch;

    @media (min-width: $md3) {
      border-right: 1px solid var(--bg-primary-color);
      &:first-child {
        border-left: 1px solid var(--bg-primary-color);
      }
    }
    @media (max-width: $md3) {
      &:first-child {
        border-top: 1px solid var(--primary-color);
      }
      border-bottom: 1px solid var(--primary-color);
    }
  }
  &__link {
    padding: 10px 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    @include adaptiveValue('min-width', 100, 0, 1470, 768, 1);
    text-transform: uppercase;
    font-family: var(--font-family-sans);
    font-weight: 700;
    @media (any-hover: hover) {
      &:hover {
        color: var(--secondary-color);
      }
    }
    @media (max-width: $md3) {
      padding: 15px 0px;
      width: 100%;
      justify-content: flex-start;
    }
  }
}

.action {
  display: flex;
  align-items: center;
  @include adaptiveValue('gap', 15, 10, 1470, 768, 1);
  @media (max-width: $md3) {
    order: 2;
  }
  &__button {
    position: relative;
    z-index: var(--header-z-index);
    @media (any-hover: hover) {
      &:hover {
        .action__icon {
          svg {
            fill: var(--secondary-color-inverted);
          }
        }
        .action__text {
          color: var(--secondary-color-inverted);
        }
      }
    }
    @media (max-width: 659.98px) {
      &_3d {
        margin-top: 10px;
        max-width: 300px;
        min-height: 45px !important;
      }
    }
    @media (max-width: $md4) {
      margin-top: 10px;
      max-width: 300px;
      min-height: 45px !important;
    }
  }
  &__icon {
    svg {
      transition: fill 0.3s ease 0s;
    }
  }
  &__text {
    position: relative;
    z-index: var(--base-z-index);
    transition: color 0.3s ease 0s;
  }
}

// burger icon
.icon-menu {
  display: none;
  @media (max-width: $md3) {
    display: block;
    position: relative;
    width: 30px;
    height: 18px;
    cursor: pointer;
    z-index: 12;
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
      top: 0;
    }
    &::after {
      bottom: 0;
    }
    span {
      top: calc(50% - 1px);
    }
    &.menu-open {
      span {
        width: 0;
      }
      &::before,
      &::after {
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
