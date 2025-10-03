<script setup>
import { ref, onMounted, watchEffect } from 'vue'
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

const logoutStore = useLogoutStore()
const loginModalStore = useLoginModalStore()
const authStore = useAuthStore()
const menuStore = useMenuStore()
const currStore = useCurrStore()
const profileStore = useProfileStore()
const topUpModalStore = useTopUpModalStore()

const selectedCurrency = ref({})

function changeCurr() {
  currStore.setActiveCurrency(selectedCurrency.value)
}

onMounted(() => {
  watchEffect(() => {
    selectedCurrency.value = currStore.currency
  })
})

function start() {
  if (authStore.isAuth) {
    router.push({ path: '/create/model' })
  } else {
    loginModalStore.openModal()
  }
}
</script>

<template>
  <header :class="['section header', { active: menuStore.isMenuOpen }]">
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
  </header>
</template>
