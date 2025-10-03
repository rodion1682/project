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
const settingsStore = useSettingsStore()

import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import 'swiper/css/navigation'
import 'swiper/css'
import { useSettingsStore } from '@/stores/settings.js'
import Decimal from 'decimal.js'
import PriceSection from '@/components/widgets/PriceSection.vue'

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
    <!--<section class="section pricing-section pricing-section-separate">
      <div class="wrapper">
        <div class="text text-18 text-inter text-blue">{{ $t('Pricing') }}</div>
        <div class="text text-48 main-text-48">
          <b>{{ $t('Pick the Credit Pack That Fits Your Needs') }}</b>
        </div>
        <div class="text text-14 main-text-14 text-inter">
          {{ $t('SculptaDot uses credits') }}
        </div>

        <div class="list flex items-start">
          <div class="swiper-list">
            <Swiper
              :modules="[Navigation]"
              :navigation="{
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
              }"
              :breakpoints="{
                320: { slidesPerView: 1 }, // mobile
                640: { slidesPerView: 2 }, // tablets
                900: { slidesPerView: 3 }, // desktops
              }"
              :space-between="16"
            >
              <SwiperSlide v-for="(pack, i) in topUpStore.creditPacks" :key="pack.id">
                <CreditPackItem :pack="pack" :equivalent="i !== 0" :most-popular="i === 2" />
              </SwiperSlide>

              <button class="swiper-button-prev"></button>
              <button class="swiper-button-next"></button>
            </Swiper>
          </div>

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
                <b>
                  {{
                    settingsStore.settings.points_conversion_rate
                      ? new Decimal(1)
                        .div(settingsStore.settings.points_conversion_rate)
                        .toFixed(2)
                      : '0.00'
                  }}
                  {{ currStore.currency.symbol }}
                </b>
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
    </section>-->
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
