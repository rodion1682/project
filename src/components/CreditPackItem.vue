<template>
  <div class="item">
    <div v-if="mostPopular" class="popular text text-12 text-inter">
      <b>{{ $t('Most Popular') }}</b>
    </div>
    <div class="text text-24">
      <b>{{ t(props.pack.title) }}</b>
    </div>
    <div class="text text-14 text-inter">{{ t(props.pack.description) }}</div>
    <div class="flex items-center justify-center">
      <div class="left">
        <div class="text text-32">
          <b>{{ t(props.pack.price) }} {{ currencyStore.currency.symbol }}</b>
        </div>
      </div>
      <div class="right flex items-center">
        <img alt="Coin icon" class="coin" src="@/assets/imgs/coin.svg" />
        <div class="text text-18 text-inter">
          <b>{{ t(props.pack.credits) }}</b> {{ t('credits') }}
        </div>
      </div>
    </div>
    <button @click="openTopUpModal" class="button stroke w-145">{{ t('Buy Now') }}</button>
  </div>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { defineProps } from 'vue'
import { useCurrStore } from '@/stores/currencies.js'
import { useTopUpModalStore } from '@/stores/topUpModal.js'
import { useTopUpStore } from '@/stores/topUp.js'
import { useAuthStore } from '@/stores/auth'
import { useLoginModalStore } from '@/stores/loginModal'

const { t } = useI18n()
const currencyStore = useCurrStore()
const topUpModalStore = useTopUpModalStore()
const topUpStore = useTopUpStore()

const authStore = useAuthStore()
const loginModalStore = useLoginModalStore()

const props = defineProps({
  pack: Object,
  mostPopular: {
    default: () => false,
    type: Boolean,
  },
  equivalent: {
    default: () => false,
    type: Boolean,
  },
})

const openTopUpModal = () => {
  if (authStore.isAuth) {
    topUpModalStore.setStep(2)
    topUpStore.setCreditPackId(props.pack.id)
    topUpModalStore.openModal()
  } else {
    loginModalStore.openModal()
  }
}
</script>

<style scoped>
/* По необходимости */
</style>
