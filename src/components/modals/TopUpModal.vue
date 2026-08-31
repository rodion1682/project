<template>
  <BaseModal
    :show="props.show"
    modal-container-class="top-up-modal__inner"
    @close="close"
  >
    <div class="top-up-modal">
      <h2 class="top-up-modal__title _h3">
        {{ $t('Top Up') }}
      </h2>

      <div class="top-up-modal__summary">
        <div class="top-up-modal__summary-row">
          <span class="top-up-modal__summary-label"> {{ $t('Total') }}: </span>

          <span class="top-up-modal__total">
            {{ formattedFiatAmount }}
          </span>
        </div>

        <div class="top-up-modal__summary-divider" />

        <div class="top-up-modal__summary-row">
          <span class="top-up-modal__receive-label">
            {{ $t('You get') }}:
          </span>

          <PriceFormatter
            :price="normalizedInternalAmount"
            size="size-20"
            class="top-up-modal__receive-value"
          />
        </div>
      </div>

      <div
        v-if="formErrors.general"
        class="top-up-modal__error top-up-modal__error_general"
        role="alert"
      >
        {{ formErrors.general }}
      </div>

      <form class="top-up-modal__form" novalidate @submit.prevent>
        <div class="top-up-modal__fields">
          <div class="top-up-modal__field">
            <BaseInput
              v-model="checkoutForm.name"
              class="top-up-modal__input"
              :placeholder="$t('First name')"
              :error="formErrors.name"
              autocomplete="given-name"
              @input="clearFieldError('name')"
            />
          </div>

          <div class="top-up-modal__field">
            <BaseInput
              v-model="checkoutForm.surname"
              class="top-up-modal__input"
              :placeholder="$t('Last name')"
              :error="formErrors.surname"
              autocomplete="family-name"
              @input="clearFieldError('surname')"
            />
          </div>

          <div class="top-up-modal__field">
            <BaseInput
              v-model="checkoutForm.phone"
              class="top-up-modal__input"
              inputmode="tel"
              type="tel"
              :placeholder="$t('Phone')"
              :error="formErrors.phone"
              autocomplete="tel"
              @input="clearFieldError('phone')"
            />
          </div>

          <div class="top-up-modal__field">
            <BaseInput
              v-model="checkoutForm.email"
              class="top-up-modal__input"
              inputmode="email"
              type="email"
              :placeholder="$t('Email')"
              :error="formErrors.email"
              :disabled="Boolean(authStore.user?.email)"
              autocomplete="email"
              @input="clearFieldError('email')"
            />
          </div>

          <div class="top-up-modal__field">
            <BaseSelect
              v-model="checkoutForm.country"
              class="top-up-modal__select"
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

          <div class="top-up-modal__field-row">
            <div class="top-up-modal__field">
              <BaseInput
                v-model="checkoutForm.city"
                class="top-up-modal__input"
                :placeholder="$t('City')"
                :error="formErrors.city"
                autocomplete="address-level2"
                @input="clearFieldError('city')"
              />
            </div>

            <div class="top-up-modal__field top-up-modal__field_post-code">
              <BaseInput
                v-model="checkoutForm.postCode"
                class="top-up-modal__input"
                :placeholder="$t('Post code')"
                :error="formErrors.postCode"
                autocomplete="postal-code"
                @input="clearFieldError('postCode')"
              />
            </div>
          </div>

          <div class="top-up-modal__field">
            <BaseInput
              v-model="checkoutForm.address"
              class="top-up-modal__input"
              :placeholder="$t('Address')"
              :error="formErrors.address"
              autocomplete="street-address"
              @input="clearFieldError('address')"
            />
          </div>
        </div>

        <div class="top-up-modal__terms">
          <BaseCheckbox
            v-model="checkoutForm.termsAccepted"
            class="top-up-modal__checkbox"
            :error="formErrors.termsAccepted"
            @update:model-value="clearFieldError('termsAccepted')"
          >
            <span class="top-up-modal__terms-text">
              {{
                $t(
                  'I confirm that I am 18 years old or older and I agree to the',
                )
              }}

              <RouterLink
                v-if="termsPage"
                :to="getPageUrl(termsPage)"
                class="top-up-modal__link"
                target="_blank"
                @click.stop
              >
                {{ $t('Terms & Conditions') }}
              </RouterLink>

              <span>{{ $t('and') }}</span>

              <RouterLink
                v-if="privacyPage"
                :to="getPageUrl(privacyPage)"
                class="top-up-modal__link"
                target="_blank"
                @click.stop
              >
                {{ $t('Privacy Notice') }}
              </RouterLink>
            </span>
          </BaseCheckbox>

          <span
            v-if="formErrors.termsAccepted"
            class="top-up-modal__field-error"
          >
            {{ formErrors.termsAccepted }}
          </span>
        </div>

        <div class="top-up-modal__payments">
          <p class="top-up-modal__payments-title">
            {{ $t('Choose payment method') }}
          </p>

          <div v-if="paymentMethods.length" class="top-up-modal__payment-list">
            <button
              v-for="method in paymentMethods"
              :key="method.code"
              type="button"
              class="top-up-modal__payment"
              :class="{
                'top-up-modal__payment_active':
                  selectedPaymentMethod === method.code,
              }"
              :disabled="isLoading"
              @click="handlePayment(method.code)"
            >
              <img
                v-if="getPaymentMethodImage(method)"
                :src="getPaymentMethodImage(method)"
                :alt="method.title || method.code"
                class="top-up-modal__payment-image"
              />

              <span class="top-up-modal__payment-name">
                {{ method.title || formatText(method.code) }}
              </span>

              <span
                v-if="isLoading && selectedPaymentMethod === method.code"
                class="top-up-modal__loader"
                aria-hidden="true"
              />
            </button>
          </div>

          <div
            v-else-if="!isLoading"
            class="top-up-modal__error top-up-modal__error_methods"
          >
            {{ $t('No payment methods are available.') }}
          </div>
        </div>
      </form>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'

import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'
import { useStaticPages } from '@/composables/useStaticPages'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { useCountriesStore } from '@/stores/countries'
import { useCurrencyStore } from '@/stores/currency'
import { useSettingsStore } from '@/stores/settings'
import { useTopUpStore } from '@/stores/topup'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },

  initialAmount: {
    type: [String, Number],
    default: 0,
  },

  fiatAmount: {
    type: [String, Number],
    default: 0,
  },
})

const emit = defineEmits(['close', 'update:show'])

const authStore = useAuthStore()
const countriesStore = useCountriesStore()
const currencyStore = useCurrencyStore()
const settingsStore = useSettingsStore()
const topupStore = useTopUpStore()
const userStore = useUserStore()

const toast = useToast()

const { termsPage, privacyPage, getPageUrl } = useStaticPages()

const isLoading = ref(false)
const selectedPaymentMethod = ref('')
const formErrors = ref({})

const checkoutForm = reactive({
  name: '',
  surname: '',
  phone: '',
  email: '',
  country: '',
  city: '',
  postCode: '',
  address: '',
  termsAccepted: false,
})

const normalizeNumber = (value, fallback = 0) => {
  const normalizedValue =
    typeof value === 'string' ? value.replace(',', '.').trim() : value

  const number = Number(normalizedValue)

  return Number.isFinite(number) ? number : fallback
}

const normalizedInternalAmount = computed(() => {
  return normalizeNumber(props.initialAmount, 0)
})

const normalizedFiatAmount = computed(() => {
  return normalizeNumber(props.fiatAmount, 0)
})

const formattedFiatAmount = computed(() => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyStore.currentCurrencyCode || 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(normalizedFiatAmount.value)
  } catch (error) {
    const symbol = currencyStore.currentCurrencySymbol || '€'

    return `${symbol}${normalizedFiatAmount.value.toFixed(2)}`
  }
})

const countryOptions = computed(() => {
  const countries = countriesStore.countries || []

  return countries
    .map(country => {
      return {
        label:
          country.title || country.name || country.label || country.code || '',

        value: country.id ?? country.value ?? country.code,

        disabled:
          country.disabled === true ||
          country.status === false ||
          country.status === 0,
      }
    })
    .filter(country => {
      return (
        country.label && country.value !== null && country.value !== undefined
      )
    })
})

const paymentMethods = computed(() => {
  const methods =
    settingsStore.paymentMethods ||
    settingsStore.settings?.payment_methods ||
    []

  if (!Array.isArray(methods)) {
    return []
  }

  return methods.filter(method => {
    return (
      method &&
      method.code &&
      method.code !== 'balance' &&
      method.enabled !== false &&
      method.status !== false &&
      method.status !== 0
    )
  })
})

const getPaymentMethodImage = method => {
  return method.logo || method.image || method.icon || method.image_url || ''
}

const formatText = value => {
  return String(value || '')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, character => character.toUpperCase())
}

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

const getProfileCountry = profile => {
  if (profile.country && typeof profile.country === 'object') {
    return (
      profile.country.id ?? profile.country.value ?? profile.country.code ?? ''
    )
  }

  return profile.country_id ?? profile.country ?? ''
}

const prefillForm = () => {
  const profile = userStore.user || {}
  const authUser = authStore.user || {}

  checkoutForm.name = checkoutForm.name || profile.name || ''

  checkoutForm.surname = checkoutForm.surname || profile.surname || ''

  checkoutForm.phone = checkoutForm.phone || profile.phone || ''

  checkoutForm.email =
    authUser.email || checkoutForm.email || profile.email || ''

  checkoutForm.country = checkoutForm.country || getProfileCountry(profile)

  checkoutForm.city = checkoutForm.city || profile.city || ''

  checkoutForm.postCode =
    checkoutForm.postCode ||
    profile.post_code ||
    profile.postCode ||
    profile.zip ||
    ''

  checkoutForm.address = checkoutForm.address || profile.address || ''
}

const validateForm = () => {
  const errors = {}

  if (!checkoutForm.name.trim()) {
    errors.name = 'First name is required'
  }

  if (!checkoutForm.surname.trim()) {
    errors.surname = 'Last name is required'
  }

  if (!checkoutForm.phone.trim()) {
    errors.phone = 'Phone number is required'
  } else if (!/^\+?[0-9\s\-()]{8,20}$/.test(checkoutForm.phone.trim())) {
    errors.phone = 'Please enter a valid phone number'
  }

  if (!checkoutForm.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutForm.email.trim())) {
    errors.email = 'Please enter a valid email address'
  }

  if (
    checkoutForm.country === '' ||
    checkoutForm.country === null ||
    checkoutForm.country === undefined
  ) {
    errors.country = 'Country is required'
  }

  if (!checkoutForm.city.trim()) {
    errors.city = 'City is required'
  }

  if (!checkoutForm.postCode.trim()) {
    errors.postCode = 'Post code is required'
  }

  if (!checkoutForm.address.trim()) {
    errors.address = 'Address is required'
  }

  if (!checkoutForm.termsAccepted) {
    errors.termsAccepted = 'You must accept the terms and conditions'
  }

  if (normalizedInternalAmount.value <= 0) {
    errors.general = 'Invalid top-up amount'
  }

  if (normalizedFiatAmount.value <= 0) {
    errors.general = 'Invalid payment amount'
  }

  formErrors.value = errors

  return Object.keys(errors).length === 0
}

const applyErrorsFromApi = error => {
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
    'Payment failed. Please try again.'

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
      '.top-up-modal__error, .base-input__error, .base-select__error',
    )
    ?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
}

const handlePayment = async methodCode => {
  if (isLoading.value || !methodCode) {
    return
  }

  selectedPaymentMethod.value = methodCode

  resetErrors()

  if (!validateForm()) {
    await scrollToFirstError()
    return
  }

  isLoading.value = true

  try {
    topupStore.amount = normalizedInternalAmount.value

    topupStore.setPaymentType(methodCode)

    const email = authStore.user?.email || checkoutForm.email.trim()

    const checkoutData = {
      name: checkoutForm.name.trim(),
      surname: checkoutForm.surname.trim(),
      phone: checkoutForm.phone.trim(),
      email,

      country_id: checkoutForm.country,

      city: checkoutForm.city.trim(),

      postCode: checkoutForm.postCode.trim(),

      address: checkoutForm.address.trim(),

      termsAccepted: checkoutForm.termsAccepted,

      paymentType: methodCode,

      amount: normalizedInternalAmount.value,

      currency:
        currencyStore.currentCurrency?.code ||
        currencyStore.currentCurrencyCode ||
        'EUR',
    }

    topupStore.setCheckoutFormData?.({
      name: checkoutData.name,
      surname: checkoutData.surname,
      phone: checkoutData.phone,
      email: checkoutData.email,
      country: checkoutForm.country,
      city: checkoutData.city,
      postCode: checkoutForm.postCode.trim(),
      address: checkoutData.address,
      termsAccepted: checkoutForm.termsAccepted,
    })

    const response = await topupStore.checkout(checkoutData)

    const redirectUrl = response?.redirect_url || response?.data?.redirect_url

    if (redirectUrl) {
      window.location.assign(redirectUrl)
      return
    }

    if (response?.status === 'ERROR' || response?.success === false) {
      throw new Error(response.message || 'Payment failed. Please try again.')
    }

    throw new Error('The payment provider did not return a redirect URL.')
  } catch (error) {
    console.error('Payment failed:', error)

    applyErrorsFromApi(error)
    await scrollToFirstError()
  } finally {
    isLoading.value = false
  }
}

const initializeModal = async () => {
  isLoading.value = true
  resetErrors()
  selectedPaymentMethod.value = ''

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
    prefillForm()
  } catch (error) {
    console.error('Unable to initialize top-up modal:', error)

    formErrors.value.general =
      error.response?.data?.message ||
      error.message ||
      'Unable to prepare the payment form.'
  } finally {
    isLoading.value = false
  }
}

const close = () => {
  if (isLoading.value) {
    return
  }

  selectedPaymentMethod.value = ''
  resetErrors()

  emit('close')
  emit('update:show', false)
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
    if (email) {
      checkoutForm.email = email
    }
  },
)
</script>

<style lang="scss" scoped>
.top-up-modal {
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
      margin-bottom: 20px;
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

  &__receive-label {
    color: var(--secondary-color);
    font-size: 14px;
  }

  &__receive-value {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  &__form {
    width: 100%;
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

  &__field-error {
    color: var(--error-color);
    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 140%;
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

  &__payments {
    margin-top: 26px;
  }

  &__payments-title {
    margin-bottom: 12px;

    color: var(--secondary-color);
    font-size: 13px;
    text-align: center;
  }

  &__payment-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__payment {
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

    &_active {
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

  &__payment-image {
    display: block;

    width: auto;
    max-width: 90px;
    height: 22px;

    object-fit: contain;
  }

  &__payment-name {
    text-transform: capitalize;
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

    animation: top-up-modal-spin 0.8s linear infinite;

    border-top-color: var(--hint-secondary-color);
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

    &_methods {
      text-align: center;
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

    &__terms {
      margin-top: 20px;
    }

    &__payments {
      margin-top: 20px;
    }

    &__payment {
      min-height: 44px;
    }
  }
}

:deep(.top-up-modal__inner) {
  width: min(100% - 30px, 480px);
  max-width: 480px;
  max-height: calc(100dvh - 30px);

  padding: clamp(24px, 3vw, 38px) clamp(16px, 3vw, 46px);

  border: 1px solid var(--border-secondary-color);
  border-radius: 6px;
  background-color: var(--bg-third-color);
  box-shadow:
    0 0 0 4px rgb(7 8 14 / 70%),
    0 0 0 5px var(--border-secondary-color),
    0 24px 70px rgb(0 0 0 / 60%);
}

@keyframes top-up-modal-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
