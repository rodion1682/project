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
import UiButton, { ButtonThemes } from '@/components/shared/UiButton.vue'
import UiSvgIcon from '@/components/shared/UiSvgIcon.vue'
import CloseIcon from '@/static/images/icons/action/close.svg'
import UiText, {
  TextAlign,
  TextFont,
  TextSize,
  TextTheme,
  TextWeight,
} from '@/components/shared/UiText.vue'
import UiInput from '../shared/UiInput.vue'
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
  <div class="modal _modal">
    <div class="modal__overlay _modal-overlay" @click="closeModal"></div>
    <div class="modal__inner _modal-inner">
      <UiButton class="modal__close _modal-close" :theme="ButtonThemes.ROTATE" @click="closeModal"
        ><UiSvgIcon><CloseIcon /></UiSvgIcon
      ></UiButton>
      <div class="modal__top">
        <UiText
          class="modal__title"
          :font="TextFont.RED"
          :size="TextSize.H4"
          :weight="TextWeight.BOLD"
          :align="TextAlign.CENTER"
          :title="$t('Top up balance')"
        />
        <UiText
          class="modal__text"
          :font="TextFont.RED"
          :weight="TextWeight.BOLD"
          :align="TextAlign.CENTER"
          :text="$t('Contact information')"
        />
      </div>
      <form class="modal__form" @submit.prevent="onSubmit">
        <div class="modal__items">
          <div class="modal__item">
            <UiInput
              class="modal__input"
              type="text"
              name="name"
              :placeholder="$t('First name')"
              v-model="name"
              @update:modelValue="nameChange"
              @blur="nameBlur"
            />
            <UiText class="modal__error" :theme="TextTheme.ERROR" :text="nameError" />
          </div>
          <div class="modal__item">
            <UiInput
              class="modal__input"
              type="text"
              name="surname"
              :placeholder="$t('Last name')"
              v-model="surname"
              @update:modelValue="surnameChange"
              @blur="surnameBlur"
            />
            <UiText class="modal__error" :theme="TextTheme.ERROR" :text="surnameError" />
          </div>
          <div class="modal__item">
            <UiInput
              class="modal__input"
              type="text"
              name="email"
              :placeholder="$t('E-mail')"
              v-model="email"
              @update:modelValue="emailChange"
              @blur="emailBlur"
            />
            <UiText class="modal__error" :theme="TextTheme.ERROR" :text="emailError" />
          </div>
          <div class="modal__item">
            <UiInput
              class="modal__input"
              name="phone"
              :placeholder="$t('Phone')"
              v-model="phone"
              @update:modelValue="phoneChange"
              @blur="phoneBlur"
            />
            <UiText class="modal__error" :theme="TextTheme.ERROR" :text="phoneError" />
          </div>
          <div class="modal__item" v-if="countriesStore.countries.length">
            <div class="modal__input">
              <div class="_select-wrapper">
                <select
                  name="country"
                  class="_select"
                  :value="country"
                  @change="(e) => countryChange(Number(e.target.value))"
                  @blur="countryBlur"
                >
                  <option disabled value="">{{ $t('Country') }}</option>
                  <option v-for="(item, i) in countriesStore.countries" :key="i" :value="item.id">
                    {{ item.title }}
                  </option>
                </select>
                <UiText class="modal__error" :theme="TextTheme.ERROR" :text="countryError" />
              </div>
            </div>
          </div>
          <div class="modal__local">
            <div class="modal__item modal__item_city">
              <UiInput
                class="modal__input"
                name="city"
                :placeholder="$t('City')"
                v-model="city"
                @update:modelValue="cityChange"
                @blur="cityBlur"
              />
              <UiText class="modal__error" :theme="TextTheme.ERROR" :text="cityError" />
            </div>
            <div class="modal__item modal__item_zip">
              <UiInput
                class="modal__input"
                name="postCode"
                :placeholder="$t('ZIP code')"
                v-model="postCode"
                @update:modelValue="postCodeChange"
                @blur="postCodeBlur"
              />
              <UiText class="modal__error" :theme="TextTheme.ERROR" :text="postCodeError" />
            </div>
          </div>
          <div class="modal__item">
            <UiInput
              class="modal__input"
              name="address"
              :placeholder="$t('Address')"
              v-model="address"
              @update:modelValue="addressChange"
              @blur="addressBlur"
            />
            <UiText class="modal__error" :theme="TextTheme.ERROR" :text="addressError" />
          </div>
        </div>
        <div class="modal__amount" v-if="topUpStore.creditPackId && topUpStore.creditPacks">
          {{ topUpStore.creditPacks.find((item) => item.id == topUpStore.creditPackId)?.price }}
          {{ currStore.currency.symbol }}
          =
          {{ topUpStore.creditPacks.find((item) => item.id == topUpStore.creditPackId)?.price }}
          <div class="modal__icon _ibg-contain">
            <img src="@/static/images/icons/creadit.webp" />
          </div>
        </div>
        <div class="modal__amount" v-else>
          {{ amount }} {{ currStore.currency.symbol }} = {{ amount }}
          <div class="modal__icon _ibg-contain">
            <img src="@/static/images/icons/creadit.webp" />
          </div>
        </div>
        <UiText
          class="modal__method"
          :font="TextFont.RED"
          :weight="TextWeight.BOLD"
          :text="$t('Payment method:')"
          :align="TextAlign.CENTER"
        />
        <div class="modal__buttons">
          <UiButton
            :disabled="!meta.valid || isSubmitting"
            v-for="method in settingsStore.paymentMethods"
            :key="method.id"
            class="modal__button _button-bordered"
            type="submit"
            @click="submitWithMethod(method.id)"
          >
            <div class="modal__button-image _ibg-contain" v-if="method.image">
              <img :src="method.image" :alt="$t(method.title)" />
            </div>
            <template v-else>
              <span>{{ $t(method.title) }}</span>
            </template>
          </UiButton>
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;
@use '@/styles/media' as *;
@use '@/styles/classes' as *;

.modal {
  &__overlay {
  }
  &__inner {
    width: 100%;
    max-width: 514px;
    @include adaptiveValue('padding-top', 30, 15, 1470, 768, 1);
    @include adaptiveValue('padding-bottom', 30, 15, 1470, 768, 1);
    @include adaptiveValue('padding-left', 15, 10, 1470, 768, 1);
    @include adaptiveValue('padding-right', 15, 10, 1470, 768, 1);
    height: fit-content;
    @media (max-width: $md2) {
      height: 80%;
    }
  }
  &__close {
    top: 0px;
    right: 0px;
  }
  &__top {
    padding: 0px 40px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 10);
    }
  }
  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 15);
    }
  }
  &__text {
  }
  &__form {
    max-width: 372px;
    margin: 0 auto;
  }
  &__items {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 15);
    }
  }
  &__local {
    display: flex;
    gap: 10px;
  }
  &__item {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 15, 8);
    }
    &_city {
      flex: 0 1 70%;
    }
    &_zip {
      flex: 0 1 30%;
    }
  }

  &__input {
  }
  &__error {
    margin-top: 5px;
  }
  &__amount {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-family: var(--font-family-rad);
    font-weight: 700;
    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }
  &__icon {
    width: 24px;
    height: 24px;
  }
  &__method {
    &:not(:last-child) {
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 20, 10);
      }
    }
  }
  &__buttons {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }
  &__button {
    flex: 0 0 100px;
    &-image {
      width: 30px;
      height: 30px;
    }
  }
}
</style>
