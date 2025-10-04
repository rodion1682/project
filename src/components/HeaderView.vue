<script setup>
import { ref, onMounted, nextTick, watchEffect } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCurrStore } from '@/stores/currencies'
import { useProfileStore } from '@/stores/profile'
import { useTopUpModalStore } from '@/stores/topUpModal'
import router from '@/router'
import UiText, { TextWeight } from './shared/UiText.vue'
import UiButton, { ButtonThemes } from './shared/UiButton.vue'
import UiSvgIcon from './shared/UiSvgIcon.vue'
import Generate3dIcon from '@/static/images/icons/generate_3d.svg'
import ProfileIcon from '@/static/images/icons/profile.svg'

import { initDynamicAdapt } from '@/utils/dynamic_adapt.js'
import { useRoute } from 'vue-router'
import { watch } from 'vue'

const authStore = useAuthStore()
const currStore = useCurrStore()
const profileStore = useProfileStore()
const topUpModalStore = useTopUpModalStore()

const selectedCurrency = ref({})
const isOpen = ref(false)
const route = useRoute()

const toggleMenu = () => {
  isOpen.value = !isOpen.value
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
watch(
  () => authStore.isAuth,
  (newVal, oldVal) => {
    console.log('isAuth changed:', oldVal, '→', newVal)
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
      <div class="header__content">
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
            :theme="ButtonThemes.HEADER_PRIMARY"
            v-show="!authStore.isAuth"
            data-da=".menu__list,479.98"
          >
            {{ $t('Sign Up/Log in') }}
          </UiButton>
        </div>
        <div
          class="header__profile profile"
          v-show="authStore.isAuth"
          data-da=".menu__list,439.98,first"
        >
          <UiButton
            class="profile__button"
            :theme="ButtonThemes.HEADER_PRIMARY"
            @click="topUpModalStore.openModal()"
          >
            <div class="profile__coin _ibg-contain">
              <img alt="coin icon" class="coin" src="@/static/images/icons/creadit.webp" />
            </div>
            <span class="profile__balance">{{ profileStore.profile.balance }}</span>
          </UiButton>
          <RouterLink class="profile__link" to="/profile/data">
            <UiSvgIcon class="profile__icon"><ProfileIcon /></UiSvgIcon>
            <UiText class="profile__text" :weight="TextWeight.BOLD" :text="$t('My profile')" />
          </RouterLink>
        </div>
      </div>
    </div>
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
  &__content {
    display: flex;
    align-items: center;
    @include adaptiveValue('gap', 15, 10, 1470, 992, 1);
    @media (max-width: $md3) {
      order: 2;
    }
  }
  &__action {
  }
  &__profile {
    @media (max-width: $md5) {
      margin-bottom: 5px;
    }
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
    order: 4;
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

.profile {
  display: flex;
  align-items: center;
  @include adaptiveValue('gap', 15, 10, 1470, 992, 1);
  &__button {
    padding: 5px 10px !important;
    display: flex;
    align-items: center;
    gap: 10px;
    @media (any-hover: hover) {
      &:hover {
        .profile__balance {
          color: var(--secondary-color-inverted);
        }
      }
    }
  }
  &__coin {
    width: 24px;
    height: 24px;
  }
  &__balance {
    display: inline-block;
    color: var(--primary-color);
  }
  &__link {
    padding: 0px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    @media (any-hover: hover) {
      &:hover {
        .profile__icon {
          background-color: var(--bg-primary-color-inverted);
          svg {
            fill: var(--secondary-color-inverted);
          }
        }
      }
    }
  }
  &__icon {
    min-width: 40px;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--bg-primary-color-inverted);
    border-radius: var(--border-radius);
    position: relative;
    background-color: transparent;
    transition: background-color 0.3s ease 0s;
    svg {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: 20px;
      height: 20px;
      transition: fill 0.3s ease 0s;
      fill: var(--primary-color);
    }
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--bg-primary-color-inverted);
        svg {
          fill: var(--secondary-color-inverted);
        }
      }
    }
  }
  &__text {
    font-family: var(--font-family-sans);
    @media (max-width: $md2) and (min-width: $md5) {
      @include hide-item;
    }
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
