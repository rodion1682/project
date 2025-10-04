<script setup>
import { useAuthStore } from '@/stores/auth'
import { useTopUpStore } from '@/stores/topUp.js'
import { useTopUpModalStore } from '@/stores/topUpModal.js'

import * as yup from 'yup'
import { storeToRefs } from 'pinia'
import { useLoginModalStore } from '@/stores/loginModal'

const authStore = useAuthStore()
const topUpStore = useTopUpStore()
const topUpModalStore = useTopUpModalStore()
const loginModalStore = useLoginModalStore()

import PriceSection from '@/components/price/PriceSection.vue'

const customAmountSchema = yup.object({
  amount: yup
    .number()
    .typeError('Amount must be a number')
    .positive('Amount must be greater than 0')
    .integer('Amount must be an integer')
    .required('Amount is required'),
})

function onSubmitCustomAmount(values) {
  if (authStore.isAuth) {
    const { amount } = storeToRefs(topUpModalStore)
    amount.value = values.amount
    topUpModalStore.setStep(2)
    topUpModalStore.openModal()
  } else {
    loginModalStore.openModal()
  }
}
</script>

<template>
  <main class="main _cnt">
    <PriceSection
      :top-up-store="topUpStore"
      :on-submit-custom-amount="onSubmitCustomAmount"
      :custom-amount-schema="customAmountSchema"
    />
  </main>
</template>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;
@use '@/styles/classes' as *;

.main {
  @include header-indent;
  &__discover {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 137, 25);
    }
  }
}
</style>
