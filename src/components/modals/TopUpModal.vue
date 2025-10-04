<script setup>
import { onMounted, ref } from 'vue'
import { useTopUpModalStore } from '@/stores/topUpModal'
import { useTopUpStore } from '@/stores/topUp'
import { useProfileStore } from '@/stores/profile'
import { useCountriesStore } from '@/stores/countries'
import { useSettingsStore } from '@/stores/settings'
import { storeToRefs } from 'pinia'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import CreditPackItem from '@/components/CreditPackItem.vue'
import Decimal from 'decimal.js'
import { useCurrStore } from '@/stores/currencies'
const currStore = useCurrStore()

const topUpModalStore = useTopUpModalStore()
const topUpStore = useTopUpStore()
const countriesStore = useCountriesStore()
const profileStore = useProfileStore()
const settingsStore = useSettingsStore()

const { step, amount } = storeToRefs(topUpModalStore)

const closeModal = () => {
  step.value = 1
  topUpStore.clearCreditPackId()
  topUpModalStore.closeModal()
}

const schema = yup.object({
  name: yup.string().required('First name is required'),
  surname: yup.string().required('Last name is required'),
  phone: yup.string().required('Phone is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  country: yup.number().required('Country is required').typeError('Country is required'),
  city: yup.string().required('City is required'),
  address: yup.string().required('Address is required'),
  postCode: yup.string().required('Post code is required'),
})

const initialValues = {
  name: profileStore.profile?.name || '',
  surname: profileStore.profile?.surname || '',
  phone: profileStore.profile?.phone ? String(profileStore.profile.phone) : '',
  email: profileStore.profile?.email || '',
  country: '',
  city: '',
  address: '',
  postCode: '',
}

const { meta, errors, handleSubmit, isSubmitting } = useForm({
  validationSchema: schema,
  initialValues,
  validateOnMount: false,
  validateOnBlur: true,
  validateOnChange: true,
  validateOnInput: true,
})

// Используем useField для каждого поля
const {
  value: name,
  errorMessage: nameError,
  handleBlur: nameBlur,
  handleChange: nameChange,
} = useField('name')
const {
  value: surname,
  errorMessage: surnameError,
  handleBlur: surnameBlur,
  handleChange: surnameChange,
} = useField('surname')
const {
  value: phone,
  errorMessage: phoneError,
  handleBlur: phoneBlur,
  handleChange: phoneChange,
} = useField('phone')
const {
  value: email,
  errorMessage: emailError,
  handleBlur: emailBlur,
  handleChange: emailChange,
} = useField('email')
const {
  value: country,
  errorMessage: countryError,
  handleBlur: countryBlur,
  handleChange: countryChange,
} = useField('country')
const {
  value: city,
  errorMessage: cityError,
  handleBlur: cityBlur,
  handleChange: cityChange,
} = useField('city')
const {
  value: address,
  errorMessage: addressError,
  handleBlur: addressBlur,
  handleChange: addressChange,
} = useField('address')
const {
  value: postCode,
  errorMessage: postCodeError,
  handleBlur: postCodeBlur,
  handleChange: postCodeChange,
} = useField('postCode')

const selectedMethodId = ref(null)

const onSubmit = handleSubmit((values) => {
  console.log(values, 'here3333', amount.value)
  const selectedCountry = countriesStore.countries.find((c) => c.id === values.country)

  // Конвертация: деньги = кредиты / rate с округлением до 2 знаков
  const rate = new Decimal(settingsStore.settings.points_conversion_rate ?? 0)
  const credits = new Decimal(amount.value ?? 0)
  const moneyAmount = rate.gt(0)
    ? credits.div(rate).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber()
    : 0

  topUpStore.topUp(
    selectedMethodId.value,
    moneyAmount,
    selectedCountry?.id,
    values.city,
    values.address,
    values.postCode,
    values.name,
    values.surname,
    values.phone,
    values.email,
  )
})

onMounted(async () => {
  if (!topUpStore.creditPacks || !topUpStore.creditPacks.length) {
    await topUpStore.fetchCreditPacks()
  }
})

const submitWithMethod = (methodId) => {
  selectedMethodId.value = methodId
  onSubmit()
}
</script>

<template>
  <div :class="['modal flex justify-center items-center topup-modal', { wide: step == 1 }]">
    <div class="overlay" @click="closeModal"></div>
    <div class="modal-wrapper">
      <img alt="Close icon" class="close" src="@/assets/img/close.svg" @click="closeModal" />
      <div class="modal-form-container text-center">
        <!-- STEP 1 -->
        <div class="step pricing-section" v-if="step == 1">
          <div class="text text-24 text-inter">
            <b>{{ $t('Enter your amount') }}</b>
          </div>
          <div class="label-container flex items-center justify-center">
            <label class="label">
              <input type="text" v-model="amount" />
              <img class="coin" src="@/assets/imgs/coin.svg" />
            </label>
            <button class="button big w-130" v-if="amount" @click="step = 2">
              {{ $t('Submit') }}
            </button>
          </div>
          <div class="text text-or text-20 text-inter">{{ $t('Or') }}</div>
          <div class="text text-48">
            <b>{{ $t('Pick the Credit Pack That Fits Your Needs') }}</b>
          </div>
          <div class="list flex flex-wrap">
            <!-- PACKS -->
            <CreditPackItem
              v-for="(pack, i) in topUpStore.creditPacks"
              :key="pack.id"
              :pack="pack"
              :equivalent="i !== 0"
              :most-popular="i === 1"
            />
            <div class="item"></div>
          </div>
        </div>

        <!-- STEP 2 -->
        <div class="step" v-if="step == 2">
          <div class="text text-24">
            <b>{{ $t('Top up') }}</b>
          </div>

          <form class="form" @submit.prevent="onSubmit">
            <label class="label flex items-center">
              <div class="input-container">
                <input
                  type="text"
                  name="name"
                  :placeholder="$t('First name')"
                  :value="name"
                  @input="nameChange"
                  @blur="nameBlur"
                />
                <div class="text-error text-14 text-orange-red">{{ nameError }}</div>
              </div>
            </label>

            <label class="label flex items-center">
              <div class="input-container">
                <input
                  type="text"
                  name="surname"
                  :placeholder="$t('Last name')"
                  :value="surname"
                  @input="surnameChange"
                  @blur="surnameBlur"
                />
                <div class="text-error text-14 text-orange-red">{{ surnameError }}</div>
              </div>
            </label>

            <label class="label flex items-center">
              <div class="input-container">
                <input
                  type="text"
                  name="phone"
                  :placeholder="$t('Phone')"
                  :value="phone"
                  @input="phoneChange"
                  @blur="phoneBlur"
                />
                <div class="text-error text-14 text-orange-red">{{ phoneError }}</div>
              </div>
            </label>

            <label class="label flex items-center">
              <div class="input-container">
                <input
                  type="text"
                  name="email"
                  :placeholder="$t('E-mail')"
                  :value="email"
                  @input="emailChange"
                  @blur="emailBlur"
                />
                <div class="text-error text-14 text-orange-red">{{ emailError }}</div>
              </div>
            </label>

            <label class="label" v-if="countriesStore.countries.length">
              <div class="input-container">
                <select
                  name="country"
                  class="select"
                  :value="country"
                  @change="countryChange"
                  @blur="countryBlur"
                >
                  <option disabled value="">{{ $t('Country') }}</option>
                  <option v-for="(item, i) in countriesStore.countries" :key="i" :value="item.id">
                    {{ item.title }}
                  </option>
                </select>
                <div class="text-error text-14 text-orange-red">{{ countryError }}</div>
              </div>
            </label>

            <label class="label">
              <div class="input-container">
                <input
                  type="text"
                  name="city"
                  :placeholder="$t('City')"
                  :value="city"
                  @input="cityChange"
                  @blur="cityBlur"
                />
                <div class="text-error text-14 text-orange-red">{{ cityError }}</div>
              </div>
            </label>

            <label class="label">
              <div class="input-container">
                <input
                  type="text"
                  name="address"
                  :placeholder="$t('Address')"
                  :value="address"
                  @input="addressChange"
                  @blur="addressBlur"
                />
                <div class="text-error text-14 text-orange-red">{{ addressError }}</div>
              </div>
            </label>

            <label class="label">
              <div class="input-container">
                <input
                  type="text"
                  name="postCode"
                  :placeholder="$t('Post code')"
                  :value="postCode"
                  @input="postCodeChange"
                  @blur="postCodeBlur"
                />
                <div class="text-error text-14 text-orange-red">{{ postCodeError }}</div>
              </div>
            </label>
            <div class="desc desc-amount" v-if="topUpStore.creditPackId && topUpStore.creditPacks">
              {{ topUpStore.creditPacks.find((item) => item.id == topUpStore.creditPackId)?.price }}
              {{ currStore.currency.symbol }}
              =
              {{
                topUpStore.creditPacks.find((item) => item.id == topUpStore.creditPackId)?.credits
              }}
              <img class="coin" src="@/assets/imgs/coin.svg" />
            </div>
            <div class="desc desc-amount" v-else>
              {{
                settingsStore.settings.points_conversion_rate
                  ? new Decimal(amount || 1)
                      .div(settingsStore.settings.points_conversion_rate)
                      .toFixed(2)
                  : '0.00'
              }}
              {{ currStore.currency.symbol }} = {{ amount }}
              <img class="coin" src="@/assets/imgs/coin.svg" />
            </div>

            <div class="buttons">
              <button
                :disabled="!meta.valid || isSubmitting"
                v-for="method in settingsStore.paymentMethods"
                :key="method.id"
                class="button w-180 big"
                type="submit"
                @click="submitWithMethod(method.id)"
              >
                <span>{{ $t(method.title) }}</span>
              </button>
            </div>

            <Transition>
              <div
                class="text text-14 text-orange-red text-error text-inter"
                v-if="topUpStore.error"
              >
                {{ $t(topUpStore.error) }}
              </div>
            </Transition>
          </form>
        </div>
        <div class="desc" v-if="step == 2">
          {{ settingsStore.settings.requisites }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;
@use '@/styles/media' as *;
@use '@/styles/classes' as *;
</style>
