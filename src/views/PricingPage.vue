<script setup>
import { useAuthStore } from '@/stores/auth'
import CreditPackItem from '@/components/CreditPackItem.vue'
import { useTopUpStore } from '@/stores/topUp.js'
import { useTopUpModalStore } from '@/stores/topUpModal.js'

import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'
import { storeToRefs } from 'pinia'
import { useCurrStore } from '@/stores/currencies.js'
import { useLoginModalStore } from '@/stores/loginModal'

const authStore = useAuthStore()
const topUpStore = useTopUpStore()
const topUpModalStore = useTopUpModalStore()
const currStore = useCurrStore()
const loginModalStore = useLoginModalStore()

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
  <main class="main">
    <section class="section pricing-section pricing-section-separate">
      <div class="wrapper">
        <div class="text text-18 text-inter text-blue">{{ $t('Pricing') }}</div>
        <div class="text text-48 main-text-48">
          <b>{{ $t('Pick the Credit Pack That Fits Your Needs') }}</b>
        </div>
        <div class="text text-14 main-text-14 text-inter">
          {{ $t('SculptaDot uses credits') }}
        </div>

        <div class="list flex items-start flex-wrap">
          <CreditPackItem
            v-for="(pack, i) in topUpStore.creditPacks"
            :key="pack.id"
            :pack="pack"
            :equivalent="i !== 0"
            :most-popular="i === 1"
          />

          <Form
            v-slot="{ meta }"
            class="item is-auth"
            :validation-schema="customAmountSchema"
            @submit="onSubmitCustomAmount"
          >
            <div class="text text-24">
              <b>{{ $t('Custom Credits') }}</b>
            </div>
            <div class="text text-14 text-inter">
              {{ $t('Choose the exact amount you need.') }}
            </div>
            <div class="flex items-center justify-center">
              <div class="text text-18 text-inter">
                <b>1 {{ currStore.currency.symbol }}</b>
              </div>
              <div class="text text-18 text-inter">
                <b>=</b>
              </div>
              <img class="coin" src="@/assets/imgs/coin.svg" />
              <div class="text text-18 text-inter"><b>1</b> {{ $t('credit') }}</div>
            </div>
            <label class="label">
              <Field name="amount" type="text" :placeholder="$t('Enter amount')" />
              <img class="coin" src="@/assets/imgs/coin.svg" />
            </label>
            <ErrorMessage name="amount" class="text text-14 text-inter text-red" />

            <button
              :disabled="!meta.valid || !meta.touched"
              class="button stroke w-145"
              type="submit"
            >
              {{ $t('Buy Now') }}
            </button>
          </Form>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Добавьте любые нужные стили, если необходимо */
</style>
