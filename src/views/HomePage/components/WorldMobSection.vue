<script setup>
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useRegModalStore } from '@/stores/regModal'

import { useRouter } from 'vue-router'

const router = useRouter()

const authStore = useAuthStore()
const regModalStore = useRegModalStore()

const openRegModal = () => {
  regModalStore.openModal
}

const goToCatalog = () => {
  router.push('/products')
}
</script>

<template>
  <div class="world">
    <div class="world__container _cnt-home">
      <div class="world__subtitle">
        {{ $t('Codes land in your inbox') }}
      </div>
      <div class="world__title _h1">
        <div>{{ $t('Your next world,') }}</div>
        <div>{{ $t('unlocked tonight') }}</div>
      </div>
      <div class="world__text">
        {{
          $t(
            'Licensed keys and gift cards for every launcher that matters, sent over the minute your payment clears.',
          )
        }}
      </div>
      <BaseButton variant="dark-secondary" class="world__catalog" @click="goToCatalog">
        {{ $t('Browse catalog') }}
      </BaseButton>
      <BaseButton
        v-if="!authStore.isAuth"
        class="world__account"
        variant="transaprent"
        @click="openRegModal"
      >
        {{ $t('Create account') }}
      </BaseButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.world {
  &__container {
  }

  &__subtitle {
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--hint-primary-color);
    position: relative;
    font-size: 10px;
    line-height: 14px;
    padding-left: 30px;
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translate(0px, -50%);
      width: 20px;
      height: 1px;
      background-color: var(--hint-primary-color);
    }
    &:not(:last-child) {
      margin-bottom: 13px;
    }
  }

  &__title {
    font-size: 33px;
    line-height: 34px;
    &:not(:last-child) {
      margin-bottom: 14px;
    }
  }

  &__text {
    font-size: 14px;
    line-height: 23.1px;
    color: var(--bg-seventh-color);
    &:not(:last-child) {
      margin-bottom: 17px;
    }
  }

  &__catalog {
    width: 100%;
    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  &__account {
    width: 100%;
    font-weight: 400;
    text-align: left;
    justify-content: flex-start;
  }
}
</style>
