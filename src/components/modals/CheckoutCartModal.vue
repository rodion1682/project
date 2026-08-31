<template>
  <BaseModal :show="props.show" size="small" @close="close">
    <div class="cart-checkout-modal">
      <h2 class="cart-checkout-modal__title _h3">
        {{ $t('Checkout') }}
      </h2>

      <div class="cart-checkout-modal__summary">
        <div class="cart-checkout-modal__summary-row">
          <span class="cart-checkout-modal__summary-label">
            {{ $t('Total') }}:
          </span>

          <span class="cart-checkout-modal__total">
            {{ formattedCartTotal }}
          </span>
        </div>

        <div class="cart-checkout-modal__summary-divider" />

        <div class="cart-checkout-modal__summary-row">
          <span class="cart-checkout-modal__payment-label">
            {{ $t('Payment method') }}:
          </span>

          <span class="cart-checkout-modal__payment-value">
            {{
              selectedPaymentMethod?.title || formatText(topupStore.paymentType)
            }}
          </span>
        </div>
      </div>

      <div
        v-if="formErrors.general"
        class="cart-checkout-modal__error cart-checkout-modal__error_general"
        role="alert"
      >
        {{ formErrors.general }}
      </div>

      <form
        class="cart-checkout-modal__form"
        novalidate
        @submit.prevent="handlePay"
      >
        <div class="cart-checkout-modal__section">
          <p class="cart-checkout-modal__section-title">
            {{ $t('Personal information') }}
          </p>

          <div class="cart-checkout-modal__fields">
            <div class="cart-checkout-modal__field">
              <BaseInput
                v-model="topupStore.checkoutFormData.name"
                class="cart-checkout-modal__input"
                :placeholder="$t('First name')"
                :error="formErrors.name"
                autocomplete="given-name"
                @input="clearFieldError('name')"
              />
            </div>

            <div class="cart-checkout-modal__field">
              <BaseInput
                v-model="topupStore.checkoutFormData.surname"
                class="cart-checkout-modal__input"
                :placeholder="$t('Last name')"
                :error="formErrors.surname"
                autocomplete="family-name"
                @input="clearFieldError('surname')"
              />
            </div>

            <div class="cart-checkout-modal__field">
              <BaseInput
                v-model="topupStore.checkoutFormData.email"
                class="cart-checkout-modal__input"
                type="email"
                inputmode="email"
                :placeholder="$t('Email')"
                :error="formErrors.email"
                :disabled="Boolean(authStore.user?.email)"
                autocomplete="email"
                @input="clearFieldError('email')"
              />
            </div>

            <div class="cart-checkout-modal__field">
              <BaseInput
                v-model="topupStore.checkoutFormData.phone"
                class="cart-checkout-modal__input"
                type="tel"
                inputmode="tel"
                :placeholder="$t('Phone Number')"
                :error="formErrors.phone"
                autocomplete="tel"
                @input="clearFieldError('phone')"
              />
            </div>
          </div>
        </div>

        <div
          class="cart-checkout-modal__section cart-checkout-modal__section_payment"
        >
          <p class="cart-checkout-modal__section-title">
            {{ $t('Payment information') }}
          </p>

          <div class="cart-checkout-modal__fields">
            <div class="cart-checkout-modal__field">
              <BaseSelect
                v-model="topupStore.checkoutFormData.country"
                class="cart-checkout-modal__select"
                :options="countryOptions"
                option-label="label"
                option-value="value"
                :placeholder="$t('Country')"
                :empty-text="$t('No countries found')"
                :error="formErrors.country"
                required
                @update:model-value="clearFieldError('country')"
              />
            </div>

            <div class="cart-checkout-modal__field-row">
              <div class="cart-checkout-modal__field">
                <BaseInput
                  v-model="topupStore.checkoutFormData.city"
                  class="cart-checkout-modal__input"
                  :placeholder="$t('City')"
                  :error="formErrors.city"
                  autocomplete="address-level2"
                  @input="clearFieldError('city')"
                />
              </div>

              <div
                class="cart-checkout-modal__field cart-checkout-modal__field_post-code"
              >
                <BaseInput
                  v-model="topupStore.checkoutFormData.postCode"
                  class="cart-checkout-modal__input"
                  :placeholder="$t('Post code')"
                  :error="formErrors.postCode"
                  autocomplete="postal-code"
                  @input="clearFieldError('postCode')"
                />
              </div>
            </div>

            <div class="cart-checkout-modal__field">
              <BaseInput
                v-model="topupStore.checkoutFormData.address"
                class="cart-checkout-modal__input"
                :placeholder="$t('Address')"
                :error="formErrors.address"
                autocomplete="street-address"
                @input="clearFieldError('address')"
              />
            </div>
          </div>
        </div>

        <div class="cart-checkout-modal__terms">
          <BaseCheckbox
            v-model="topupStore.checkoutFormData.termsAccepted"
            class="cart-checkout-modal__checkbox"
            :error="formErrors.termsAccepted"
            @update:model-value="clearFieldError('termsAccepted')"
          >
            <span class="cart-checkout-modal__terms-text">
              {{
                $t(
                  'I confirm that I am 18 years old or older and I agree to the',
                )
              }}

              <RouterLink
                v-if="termsPage"
                :to="getPageUrl(termsPage)"
                class="cart-checkout-modal__link"
                target="_blank"
                @click.stop
              >
                {{ $t('Terms & Conditions') }}
              </RouterLink>

              <span>{{ $t('and') }}</span>

              <RouterLink
                v-if="privacyPage"
                :to="getPageUrl(privacyPage)"
                class="cart-checkout-modal__link"
                target="_blank"
                @click.stop
              >
                {{ $t('Privacy Notice') }}
              </RouterLink>
            </span>
          </BaseCheckbox>

          <span
            v-if="formErrors.termsAccepted"
            class="cart-checkout-modal__field-error"
          >
            {{ formErrors.termsAccepted }}
          </span>
        </div>

        <div class="cart-checkout-modal__actions">
          <button
            type="submit"
            class="cart-checkout-modal__submit"
            :disabled="!isFormValid || isLoading"
          >
            <span>
              {{ $t('Submit') }}
            </span>

            <span
              v-if="isLoading"
              class="cart-checkout-modal__loader"
              aria-hidden="true"
            />
          </button>

          <button
            type="button"
            class="cart-checkout-modal__cancel"
            :disabled="isLoading"
            @click="emit('back')"
          >
            {{ $t('Cancel') }}
          </button>
        </div>

        <div
          v-if="settingsStore.settings?.requisites"
          class="cart-checkout-modal__requisites"
          v-html="settingsStore.settings.requisites"
        />
      </form>
    </div>
  </BaseModal>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'

import { useStaticPages } from '@/composables/useStaticPages'
import { useToast } from '@/composables/useToast'

import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useCountriesStore } from '@/stores/countries'
import { useCurrencyStore } from '@/stores/currency'
import { usePurchaseStore } from '@/stores/purchase'
import { useSettingsStore } from '@/stores/settings'
import { useTopUpStore } from '@/stores/topup'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  total: {
    type: [Number, String],
    default: 0,
  },
})

const emit = defineEmits(['close', 'back'])

const currencyStore = useCurrencyStore()
const topupStore = useTopUpStore()
const authStore = useAuthStore()
const countriesStore = useCountriesStore()
const userStore = useUserStore()
const settingsStore = useSettingsStore()
const cartStore = useCartStore()
const purchaseStore = usePurchaseStore()

const router = useRouter()
const toast = useToast()

const { termsPage, privacyPage, getPageUrl } = useStaticPages()

const { checkoutFormData } = storeToRefs(topupStore)

const isLoading = ref(false)
const formErrors = ref({})

const currencyCode = computed(() => {
  const code =
    currencyStore.currentCurrency?.code ?? currencyStore.currentCurrencyCode

  return typeof code === 'string' && code ? code : 'EUR'
})

const currencySymbol = computed(() => {
  const symbol =
    currencyStore.currentCurrency?.symbol ?? currencyStore.currentCurrencySymbol

  return typeof symbol === 'string' && symbol ? symbol : '€'
})

const normalizeNumber = (value, fallback = 0) => {
  const normalized =
    typeof value === 'string' ? value.replace(',', '.').trim() : value

  const number = Number(normalized)

  return Number.isFinite(number) ? number : fallback
}

const normalizedCartTotal = computed(() => {
  return normalizeNumber(props.total, 0)
})
const formattedCartTotal = computed(() => {
  const amount = Number(normalizedCartTotal.value ?? 0)

  const safeAmount = Number.isFinite(amount) ? amount : 0

  const code = currencyCode.value || 'EUR'

  const symbol = currencySymbol.value || '€'

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeAmount)
  } catch (error) {
    return `${symbol}${safeAmount.toFixed(2)}`
  }
})

const getCountryLabel = country => {
  if (!country) {
    return ''
  }

  if (typeof country.title === 'string') {
    return country.title
  }

  if (country.title && typeof country.title === 'object') {
    const translated =
      country.title.en ||
      country.title.name ||
      country.title.label ||
      Object.values(country.title).find(value => typeof value === 'string')

    if (translated) {
      return translated
    }
  }

  if (typeof country.name === 'string') {
    return country.name
  }

  if (typeof country.label === 'string') {
    return country.label
  }

  if (typeof country.code === 'string') {
    return country.code
  }

  return ''
}

const countryOptions = computed(() => {
  const countries = countriesStore.countries || []

  return countries
    .map(country => ({
      label: getCountryLabel(country),

      value: country.id ?? country.value ?? country.code,

      disabled:
        country.disabled === true ||
        country.status === false ||
        country.status === 0,
    }))
    .filter(country => {
      return (
        country.label && country.value !== null && country.value !== undefined
      )
    })
})

const normalizeCountryValue = country => {
  if (country === null || country === undefined || country === '') {
    return ''
  }

  if (typeof country === 'object') {
    return country.id ?? country.value ?? country.code ?? ''
  }

  return country
}

const selectedPaymentMethod = computed(() => {
  const methods =
    settingsStore.paymentMethods ||
    settingsStore.settings?.payment_methods ||
    []

  if (!Array.isArray(methods)) {
    return null
  }

  return methods.find(method => method.code === topupStore.paymentType) || null
})

const formatText = value => {
  return String(value || '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, character => {
      return character.toUpperCase()
    })
}

const isFormValid = computed(() => {
  const formData = checkoutFormData.value

  if (!formData) {
    return false
  }

  return Boolean(
    formData.name &&
    formData.surname &&
    formData.phone &&
    normalizeCountryValue(formData.country) &&
    formData.city &&
    formData.address &&
    formData.postCode &&
    formData.termsAccepted &&
    (authStore.user?.email || formData.email) &&
    topupStore.paymentType,
  )
})

const clearFieldError = field => {
  if (!formErrors.value[field]) {
    return
  }

  const nextErrors = {
    ...formErrors.value,
  }

  delete nextErrors[field]

  formErrors.value = nextErrors
}

const resetErrors = () => {
  formErrors.value = {}
}

const validateForm = () => {
  const errors = {}
  const formData = checkoutFormData.value

  if (!formData) {
    return false
  }

  if (!formData.name?.trim()) {
    errors.name = 'First name is required'
  }

  if (!formData.surname?.trim()) {
    errors.surname = 'Last name is required'
  }

  if (!formData.phone?.trim()) {
    errors.phone = 'Phone number is required'
  } else if (!/^\+?[0-9\s\-()]{8,20}$/.test(formData.phone.trim())) {
    errors.phone = 'Please enter a valid phone number'
  }

  if (!authStore.user?.email && !formData.email?.trim()) {
    errors.email = 'Email is required'
  } else if (
    formData.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
  ) {
    errors.email = 'Please enter a valid email address'
  }

  if (!normalizeCountryValue(formData.country)) {
    errors.country = 'Country is required'
  }

  if (!formData.city?.trim()) {
    errors.city = 'City is required'
  }

  if (!formData.postCode?.trim()) {
    errors.postCode = 'Post code is required'
  }

  if (!formData.address?.trim()) {
    errors.address = 'Address is required'
  }

  if (!formData.termsAccepted) {
    errors.termsAccepted = 'You must accept the terms and conditions'
  }

  if (!topupStore.paymentType) {
    errors.general = 'Please select a payment method'
  }

  if (normalizedCartTotal.value <= 0) {
    errors.general = 'Your cart is empty'
  }

  formErrors.value = errors

  return Object.keys(errors).length === 0
}

const applyApiErrors = error => {
  const apiErrors = error.response?.data?.errors

  if (apiErrors && typeof apiErrors === 'object') {
    const mappedErrors = {}

    Object.entries(apiErrors).forEach(([field, messages]) => {
      const normalizedField =
        field === 'country_id'
          ? 'country'
          : field === 'post_code'
            ? 'postCode'
            : field

      mappedErrors[normalizedField] = Array.isArray(messages)
        ? messages[0]
        : String(messages)
    })

    formErrors.value = {
      ...formErrors.value,
      ...mappedErrors,
    }

    return
  }

  const message =
    error.response?.data?.message ||
    error.message ||
    'An error occurred during checkout'

  formErrors.value = {
    ...formErrors.value,
    general: message,
  }

  toast.error(message)
}

const scrollToFirstError = async () => {
  await nextTick()

  document
    .querySelector(
      '.cart-checkout-modal__error, .base-input__error, .base-select__error',
    )
    ?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
}

const handlePay = async () => {
  if (isLoading.value) {
    return
  }

  resetErrors()

  if (!validateForm()) {
    await scrollToFirstError()
    return
  }

  isLoading.value = true

  try {
    const formData = checkoutFormData.value

    const countryId = normalizeCountryValue(formData.country)

    const paymentType =
      selectedPaymentMethod.value?.code || topupStore.paymentType

    const purchaseData = {
      name: formData.name.trim(),

      surname: formData.surname.trim(),

      email: authStore.user?.email || formData.email.trim(),

      phone: formData.phone.trim(),

      country: countryId,

      country_id: countryId,

      city: formData.city.trim(),

      address: formData.address.trim(),

      postCode: formData.postCode.trim(),

      post_code: formData.postCode.trim(),

      paymentType,
    }

    const response = await purchaseStore.purchaseCartItems(purchaseData)

    if (response?.success) {
      resetErrors()

      if (response.redirect_url) {
        window.location.assign(response.redirect_url)

        return
      }

      await router.push({
        name: 'SuccessPaymentPage',
      })

      return
    }

    throw new Error(
      response?.error ||
        response?.message ||
        'An error occurred during checkout',
    )
  } catch (error) {
    console.error('Checkout error:', error)

    applyApiErrors(error)

    purchaseStore.error =
      error.response?.data?.message ||
      error.message ||
      'An error occurred during checkout'

    await scrollToFirstError()
  } finally {
    isLoading.value = false
  }
}

const getProfileCountry = profile => {
  return normalizeCountryValue(profile.country_id ?? profile.country ?? '')
}

const prefillFormData = () => {
  const profile = userStore.user || {}

  const authUser = authStore.user || {}

  const current = checkoutFormData.value || {}

  topupStore.setCheckoutFormData({
    name: current.name || profile.name || '',

    surname: current.surname || profile.surname || '',

    phone: current.phone || profile.phone || '',

    email: authUser.email || current.email || profile.email || '',

    country:
      normalizeCountryValue(current.country) || getProfileCountry(profile),

    city: current.city || profile.city || '',

    address: current.address || profile.address || '',

    postCode:
      current.postCode ||
      profile.post_code ||
      profile.postCode ||
      profile.zip ||
      '',

    termsAccepted: Boolean(current.termsAccepted),
  })
}

const initializeModal = async () => {
  isLoading.value = true
  resetErrors()

  try {
    await Promise.all([
      countriesStore.countries?.length
        ? Promise.resolve()
        : countriesStore.fetchCountries(),

      userStore.user ? Promise.resolve() : userStore.fetchProfile(),

      settingsStore.settings
        ? Promise.resolve()
        : settingsStore.fetchSettings(),
    ])

    await nextTick()

    prefillFormData()
  } catch (error) {
    console.error('Failed to initialize cart checkout modal:', error)

    const message =
      error.response?.data?.message ||
      error.message ||
      'Unable to prepare checkout.'

    formErrors.value = {
      ...formErrors.value,
      general: message,
    }

    toast.error(message)
  } finally {
    isLoading.value = false
  }
}

const close = () => {
  if (isLoading.value) {
    return
  }

  resetErrors()

  emit('close')
}

watch(
  () => props.show,
  value => {
    if (value) {
      initializeModal()
    }
  },
  {
    immediate: true,
  },
)

watch(
  () => authStore.user?.email,
  email => {
    if (email && checkoutFormData.value) {
      topupStore.setCheckoutFormData({
        email,
      })
    }
  },
)
</script>

<style lang="scss" scoped>
.cart-checkout-modal {
  width: 100%;

  &__title {
    padding: 0 45px;

    color: var(--primary-color);
    text-align: center;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 20);
    }
  }

  &__summary {
    &:not(:last-child) {
      margin-bottom: 26px;
    }
  }

  &__summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    min-height: 36px;
  }

  &__summary-label {
    color: var(--hint-primary-color);
    font-family: var(--font-spectral-sc);
    font-size: 18px;
    line-height: 120%;
    text-transform: uppercase;
  }

  &__total {
    color: var(--primary-color);
    font-family: var(--font-pt-serif);
    font-size: clamp(22px, 3vw, 28px);
    font-weight: 700;
    line-height: 120%;
    text-align: right;
  }

  &__summary-divider {
    width: 100%;
    height: 1px;

    margin: 16px 0;

    background: linear-gradient(
      90deg,
      transparent,
      var(--border-secondary-color),
      transparent
    );
  }

  &__payment-label {
    color: var(--secondary-color);
    font-size: 14px;
  }

  &__payment-value {
    overflow: hidden;

    color: var(--primary-color);
    font-size: 15px;
    font-weight: 600;
    line-height: 140%;
    text-align: right;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__form {
    width: 100%;
  }

  &__section {
    width: 100%;

    &_payment {
      margin-top: 26px;
      padding-top: 24px;

      border-top: 1px solid var(--border-secondary-color);
    }
  }

  &__section-title {
    margin-bottom: 12px;

    color: var(--secondary-color);
    font-size: 13px;
    font-weight: 600;
    line-height: 145%;
    text-align: center;
  }

  &__fields {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__field {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 6px;

    min-width: 0;

    &_post-code {
      flex: 0 1 38%;
    }
  }

  &__field-row {
    display: flex;
    gap: 10px;
  }

  &__input,
  &__select {
    width: 100%;
  }

  &__terms {
    margin-top: 26px;
  }

  &__terms-text {
    color: var(--secondary-color);
    font-size: 13px;
    line-height: 145%;
  }

  &__link {
    color: var(--hint-secondary-color);

    transition: color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--primary-color);
      }
    }
  }

  &__field-error {
    display: block;

    margin-top: 6px;

    color: var(--error-color);
    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 140%;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 10px;

    margin-top: 26px;
  }

  &__submit {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    width: 100%;
    min-height: 40px;

    padding: 7px 45px;

    border: 1px solid var(--hint-primary-color);
    border-radius: 4px;
    outline: none;
    background-color: transparent;

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 15px;
    font-weight: 600;
    line-height: 140%;

    cursor: pointer;

    transition:
      color 0.3s ease,
      border-color 0.3s ease,
      background-color 0.3s ease,
      opacity 0.3s ease;

    &:disabled {
      opacity: 0.55;

      cursor: not-allowed;
    }

    &:not(:disabled) {
      border-color: var(--hint-secondary-color);
      background-color: rgb(46 207 196 / 8%);
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        border-color: var(--hint-secondary-color);

        color: var(--hint-secondary-color);
      }
    }
  }

  &__cancel {
    align-self: center;

    padding: 5px 12px;

    border: 0;
    outline: none;
    background-color: transparent;

    color: var(--hint-secondary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    line-height: 140%;

    cursor: pointer;

    transition:
      color 0.3s ease,
      opacity 0.3s ease;

    &:disabled {
      opacity: 0.5;

      cursor: not-allowed;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        color: var(--primary-color);
      }
    }
  }

  &__loader {
    position: absolute;
    top: 50%;
    right: 14px;

    width: 17px;
    height: 17px;

    margin-top: -8px;

    border: 2px solid var(--border-third-color);
    border-radius: 50%;

    animation: cart-checkout-modal-spin 0.8s linear infinite;

    border-top-color: var(--hint-secondary-color);
  }

  &__requisites {
    margin-top: 22px;
    padding-top: 18px;

    border-top: 1px solid var(--border-secondary-color);
    opacity: 0.7;

    color: var(--secondary-color);
    font-size: 12px;
    line-height: 150%;
    white-space: pre-line;
  }

  &__error {
    padding: 10px 12px;

    border: 1px solid rgb(238 57 85 / 30%);
    border-radius: 4px;
    background-color: rgb(238 57 85 / 8%);

    color: var(--error-color);
    font-size: 13px;
    line-height: 145%;

    &_general {
      margin-bottom: 16px;
    }
  }

  :deep(.base-input__control),
  :deep(.base-select__control) {
    min-height: 38px;

    border-color: var(--border-third-color);
    border-radius: 4px;
    background-color: var(--bg-secondary-color);
  }

  :deep(.base-select__list) {
    z-index: calc(var(--modal-z-index) + 1);
  }

  :deep(.base-checkbox) {
    align-items: flex-start;
  }

  @media (max-width: $md7) {
    &__field-row {
      flex-direction: column;
    }

    &__field_post-code {
      flex-basis: auto;
    }

    &__section_payment {
      margin-top: 20px;
      padding-top: 20px;
    }

    &__terms {
      margin-top: 20px;
    }

    &__actions {
      margin-top: 20px;
    }

    &__submit {
      min-height: 44px;
    }
  }
}

@keyframes cart-checkout-modal-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
