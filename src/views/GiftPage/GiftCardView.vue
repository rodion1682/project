<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import axios from '@/plugins/axios'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import Breadcrumbs from '@/components/ui/Breadcrumbs.vue'
import ProductListItem from '@/views/ProductPages/components/ProductListItem.vue'

import BaseTextarea from '@/components/ui/BaseTextarea.vue'
import { useAuthStore } from '@/stores/auth'
import { useCountriesStore } from '@/stores/countries'
import { useCurrStore } from '@/stores/currencies'
import { useLoginModalStore } from '@/stores/loginModal'
import { useProductsStore } from '@/stores/products'
import { useProfileStore } from '@/stores/profile'

const { t } = useI18n()

const authStore = useAuthStore()
const countriesStore = useCountriesStore()
const currStore = useCurrStore()
const loginModalStore = useLoginModalStore()
const productsStore = useProductsStore()
const profileStore = useProfileStore()

const baseValues = [10, 25, 50, 100, 250, 500]

const amount = ref(50)
const quantity = ref(1)

const deliveryType = ref('friend')

const recipientEmail = ref('')
const message = ref('')

const holderFirstName = ref('')
const holderLastName = ref('')
const holderEmail = ref('')
const holderPhone = ref('')
const holderPhoneCountry = ref('')
const holderCountry = ref('')
const holderCity = ref('')
const holderAddress = ref('')
const holderZip = ref('')

const errors = ref({})
const generalError = ref('')
const successMessage = ref('')

const isSubmitting = ref(false)
const isPopularLoading = ref(false)

const popularProducts = ref([])

const breadcrumbs = computed(() => [
  {
    title: t('Home'),
    link: '/',
  },
  {
    title: t('Gift card'),
  },
])

const currencySymbol = computed(() => {
  return currStore.currency?.symbol || '€'
})

const currencyRate = computed(() => {
  const value = Number(currStore.currency?.value)

  return Number.isFinite(value) && value > 0 ? value : 1
})

const convertedAmount = computed(() => {
  return Number(amount.value || 0) * currencyRate.value
})

const formattedAmount = computed(() => {
  return `${convertedAmount.value.toFixed(2)} ${currencySymbol.value}`
})

const shortAmount = (baseValue) => {
  const converted = Number(baseValue || 0) * currencyRate.value

  return `${converted.toFixed(2)} ${currencySymbol.value}`
}

const countries = computed(() => {
  return Array.isArray(countriesStore.countries) ? countriesStore.countries : []
})

const countryOptions = computed(() => {
  return countries.value.map((country) => ({
    label: country.title,
    value: country.iso,
  }))
})

const phoneCountryOptions = computed(() => {
  return countries.value.map((country) => ({
    label: `${country.title} (${country.phone_code})`,
    value: country.iso,
  }))
})

const selectedPhoneCountry = computed(() => {
  return countries.value.find((country) => country.iso === holderPhoneCountry.value) || null
})

const phonePrefix = computed(() => {
  return selectedPhoneCountry.value?.phone_code || ''
})

const perks = computed(() => [
  {
    kicker: t('Instant'),
    title: t('Code in the inbox in a minute'),
    text: t('No shipping, no waiting — buy it five minutes before the party.'),
  },
  {
    kicker: t('No expiry'),
    title: t('Credit that never runs out'),
    text: t('The value sits on the balance until it is spent, whatever the year.'),
  },
  {
    kicker: t('Any title'),
    title: t('Spend it on anything in store'),
    text: t('Keys, DLC, in-game currency — the recipient decides, not you.'),
  },
])

const canSubmit = computed(() => {
  if (!amount.value) {
    return false
  }

  if (!holderFirstName.value.trim()) {
    return false
  }

  if (!holderLastName.value.trim()) {
    return false
  }

  if (!holderEmail.value.trim()) {
    return false
  }

  if (!holderPhone.value.trim()) {
    return false
  }

  if (!holderPhoneCountry.value) {
    return false
  }

  if (!holderCountry.value) {
    return false
  }

  if (!holderCity.value.trim()) {
    return false
  }

  if (!holderAddress.value.trim()) {
    return false
  }

  if (!holderZip.value.trim()) {
    return false
  }

  if (deliveryType.value === 'friend' && !recipientEmail.value.trim()) {
    return false
  }

  return true
})

const selectAmount = (value) => {
  amount.value = value
}

const normalizePhone = (value) => {
  return String(value || '').replace(/\D/g, '')
}

const clearError = (field) => {
  if (!errors.value[field]) {
    return
  }

  const updated = {
    ...errors.value,
  }

  delete updated[field]

  errors.value = updated
}

const normalizeError = (value) => {
  if (Array.isArray(value)) {
    return value[0] || ''
  }

  return value || ''
}

const applyBackendErrors = (error) => {
  const response = error?.response?.data

  generalError.value = response?.message || t('Something went wrong. Please check the form.')

  const backendErrors = response?.errors || {}
  const normalized = {}

  Object.entries(backendErrors).forEach(([field, value]) => {
    normalized[field] = normalizeError(value)
  })

  errors.value = normalized
}

const fillFromProfile = () => {
  const profile = profileStore.profile || {}

  if (!holderFirstName.value) {
    holderFirstName.value = profile.name || ''
  }

  if (!holderLastName.value) {
    holderLastName.value = profile.surname || ''
  }

  if (!holderEmail.value) {
    holderEmail.value = profile.email || ''
  }

  if (!holderPhone.value) {
    holderPhone.value = normalizePhone(profile.phone || '')
  }

  if (!holderPhoneCountry.value) {
    const profilePhoneCountry = String(profile.phone_country || '').toUpperCase()

    if (countries.value.some((country) => country.iso === profilePhoneCountry)) {
      holderPhoneCountry.value = profilePhoneCountry
    }
  }

  if (!holderCountry.value) {
    const profileCountry = String(
      profile.country?.iso || profile.country_iso || profile.country || '',
    ).toUpperCase()

    if (countries.value.some((country) => country.iso === profileCountry)) {
      holderCountry.value = profileCountry
    }
  }

  if (!holderCity.value) {
    holderCity.value = profile.city || ''
  }

  if (!holderAddress.value) {
    holderAddress.value = profile.address || ''
  }

  if (!holderZip.value) {
    holderZip.value = profile.zip || ''
  }
}

const fetchPopularProducts = async () => {
  const currency = currStore.currency?.code

  if (!currency || isPopularLoading.value) {
    return
  }

  isPopularLoading.value = true

  try {
    await productsStore.getProducts(null, 1, '', '', 5)

    popularProducts.value = Array.isArray(productsStore.products)
      ? productsStore.products.slice(0, 5)
      : []
  } catch (error) {
    popularProducts.value = []

    console.error('Failed to load popular products:', error)
  } finally {
    isPopularLoading.value = false
  }
}

const handlePhoneInput = (value) => {
  holderPhone.value = normalizePhone(value)

  clearError('holder_phone')
}

const handlePhoneCountryChange = () => {
  clearError('holder_phone_country')
}

const handleCountryChange = () => {
  clearError('holder_country')
}

const submitGiftCard = async () => {
  if (!authStore.isAuth) {
    loginModalStore.openModal()
    return
  }

  if (!canSubmit.value || isSubmitting.value) {
    return
  }

  isSubmitting.value = true

  errors.value = {}
  generalError.value = ''
  successMessage.value = ''

  const email =
    deliveryType.value === 'friend' ? recipientEmail.value.trim() : holderEmail.value.trim()

  const payload = {
    amount: Number(amount.value),
    quantity: Number(quantity.value),

    holder_first_name: holderFirstName.value.trim(),
    holder_last_name: holderLastName.value.trim(),
    holder_email: email,

    holder_phone: Number(normalizePhone(holderPhone.value)),
    holder_phone_country: holderPhoneCountry.value,

    holder_country: holderCountry.value,
    holder_city: holderCity.value.trim(),
    holder_address: holderAddress.value.trim(),
    holder_zip: holderZip.value.trim(),

    currency: currStore.currency?.code || undefined,
  }

  try {
    const response = await axios.post('gift-cards', payload)

    successMessage.value = t('Success')

    if (response.data?.payment_link) {
      window.location.href = response.data.payment_link
    }
  } catch (error) {
    applyBackendErrors(error)
  } finally {
    isSubmitting.value = false
  }
}

const handleAddToCart = () => {
  if (!authStore.isAuth) {
    loginModalStore.openModal()
    return
  }

  if (!canSubmit.value) {
    return
  }

  generalError.value = t('Gift card cart endpoint is not connected yet.')
}

watch(
  () => currStore.currency?.code,
  (currency, oldCurrency) => {
    if (!currency || currency === oldCurrency) {
      return
    }

    fetchPopularProducts()
  },
  {
    immediate: true,
  },
)

watch(
  [() => profileStore.profile, () => countries.value.length],
  () => {
    fillFromProfile()
  },
  {
    immediate: true,
    deep: true,
  },
)
</script>

<template>
  <main class="gift-page">
    <div class="gift-page__container _cnt-home">
      <Breadcrumbs :items="breadcrumbs" class="gift-page__breadcrumbs" />

      <h1 class="gift-page__title _h2">
        {{ $t('Gift card') }}
      </h1>

      <div class="gift-page__main">
        <div class="gift-page__left">
          <div class="gift-card-preview">
            <img src="@/assets/img/gift-card-bg.jpg" alt="" class="gift-card-preview__image" />

            <div class="gift-card-preview__overlay"></div>

            <div class="gift-card-preview__content">
              <div class="gift-card-preview__brand">
                <div class="gift-card-preview__brand-icon _ibg-contain">
                  <img src="@/assets/img/person.svg" alt="" />
                </div>

                <div class="gift-card-preview__brand-name">
                  <strong>
                    {{ $t('KEY') }}
                  </strong>

                  {{ $t('VAULT') }}
                </div>
              </div>

              <div class="gift-card-preview__bottom">
                <div>
                  <div class="gift-card-preview__label">
                    {{ $t('Gift card') }}
                  </div>

                  <div class="gift-card-preview__value">
                    {{ formattedAmount }}
                  </div>
                </div>

                <div class="gift-card-preview__code">KV-0000-0000</div>
              </div>
            </div>
          </div>

          <p class="gift-page__description">
            {{
              $t(
                'A YOURKEYS gift card lands on any balance as pure credit — the recipient spends it on whatever they want, whenever they want. Codes arrive by email within a minute of purchase and never expire.',
              )
            }}
          </p>

          <div class="gift-page__perks">
            <div v-for="perk in perks" :key="perk.kicker" class="gift-perk">
              <div class="gift-perk__kicker">
                {{ perk.kicker }}
              </div>

              <div class="gift-perk__title">
                {{ perk.title }}
              </div>

              <div class="gift-perk__text">
                {{ perk.text }}
              </div>
            </div>
          </div>
        </div>

        <form class="gift-form" @submit.prevent="submitGiftCard">
          <h2 class="gift-form__title">
            {{ $t('Buy a gift card') }}
          </h2>

          <div class="gift-form__section">
            <div class="gift-form__field-label">
              <span>*</span>
              {{ $t('Value') }}
            </div>

            <div class="gift-form__values">
              <button
                v-for="value in baseValues"
                :key="value"
                type="button"
                class="gift-form__value"
                :class="{
                  active: amount === value,
                }"
                @click="selectAmount(value)"
              >
                {{ shortAmount(value) }}
              </button>
            </div>
          </div>

          <div class="gift-form__section">
            <div class="gift-form__field-label">
              <span>*</span>
              {{ $t('Deliver to') }}
            </div>

            <div class="gift-form__delivery">
              <button
                type="button"
                class="gift-form__delivery-button"
                :class="{
                  active: deliveryType === 'friend',
                }"
                @click="deliveryType = 'friend'"
              >
                {{ $t("A friend's email") }}
              </button>

              <button
                type="button"
                class="gift-form__delivery-button"
                :class="{
                  active: deliveryType === 'balance',
                }"
                @click="deliveryType = 'balance'"
              >
                {{ $t('My balance') }}
              </button>
            </div>
          </div>

          <div v-if="deliveryType === 'friend'" class="gift-form__fields">
            <label class="gift-form__field">
              <span class="gift-form__input-label">
                {{ $t('Recipient email') }}
              </span>

              <BaseInput
                v-model="recipientEmail"
                type="email"
                placeholder="friend@example.com"
                :error="errors.holder_email"
                @update:model-value="clearError('holder_email')"
              />
            </label>

            <label class="gift-form__field gift-form__field_message">
              <span class="gift-form__input-label">
                {{ $t('Message (optional)') }}
              </span>

              <BaseTextarea
                v-model="message"
                :placeholder="$t('Happy birthday - go pick something.')"
              />
            </label>
          </div>

          <div class="gift-form__holder">
            <div class="gift-form__holder-title">
              {{ $t('Billing information') }}
            </div>

            <div class="gift-form__holder-grid">
              <label class="gift-form__field">
                <span class="gift-form__input-label">
                  {{ $t('First name') }}
                </span>

                <BaseInput
                  v-model="holderFirstName"
                  autocomplete="given-name"
                  :placeholder="$t('First name')"
                  :error="errors.holder_first_name"
                  @update:model-value="clearError('holder_first_name')"
                />
              </label>

              <label class="gift-form__field">
                <span class="gift-form__input-label">
                  {{ $t('Last name') }}
                </span>

                <BaseInput
                  v-model="holderLastName"
                  autocomplete="family-name"
                  :placeholder="$t('Last name')"
                  :error="errors.holder_last_name"
                  @update:model-value="clearError('holder_last_name')"
                />
              </label>

              <label class="gift-form__field gift-form__field_full">
                <span class="gift-form__input-label">
                  {{ $t('Email') }}
                </span>

                <BaseInput
                  v-model="holderEmail"
                  type="email"
                  autocomplete="email"
                  :placeholder="$t('Email')"
                  :error="errors.holder_email"
                  @update:model-value="clearError('holder_email')"
                />
              </label>

              <label class="gift-form__field">
                <span class="gift-form__input-label">
                  {{ $t('Phone country') }}
                </span>

                <BaseSelect
                  v-model="holderCountry"
                  :options="countryOptions"
                  :placeholder="$t('Select country')"
                  :error="errors.holder_phone_country"
                  @change="handleCountryChange"
                />
              </label>

              <label class="gift-form__field">
                <span class="gift-form__input-label">
                  {{ $t('Phone') }}
                </span>

                <BaseInput
                  :model-value="holderPhone"
                  type="tel"
                  inputmode="numeric"
                  autocomplete="tel-national"
                  :placeholder="phonePrefix ? `${phonePrefix} 12345678` : $t('Phone')"
                  :error="errors.holder_phone"
                  @update:model-value="handlePhoneInput"
                >
                  <template v-if="phonePrefix" #prefix>
                    <span class="gift-form__phone-prefix">
                      {{ phonePrefix }}
                    </span>
                  </template>
                </BaseInput>
              </label>

              <label class="gift-form__field gift-form__field_full">
                <span class="gift-form__input-label">
                  {{ $t('Country') }}
                </span>

                <BaseSelect
                  v-model="holderCountry"
                  :options="countryOptions"
                  :placeholder="$t('Select country')"
                  :class="{
                    error: errors.holder_country,
                  }"
                  @change="handleCountryChange"
                  :error="errors.holder_country"
                />
              </label>

              <label class="gift-form__field">
                <span class="gift-form__input-label">
                  {{ $t('City') }}
                </span>

                <BaseInput
                  v-model="holderCity"
                  autocomplete="address-level2"
                  :placeholder="$t('City')"
                  :error="errors.holder_city"
                  @update:model-value="clearError('holder_city')"
                />
              </label>

              <label class="gift-form__field">
                <span class="gift-form__input-label">
                  {{ $t('Post code') }}
                </span>

                <BaseInput
                  v-model="holderZip"
                  autocomplete="postal-code"
                  :placeholder="$t('Post code')"
                  :error="errors.holder_zip"
                  @update:model-value="clearError('holder_zip')"
                />
              </label>

              <label class="gift-form__field gift-form__field_full">
                <span class="gift-form__input-label">
                  {{ $t('Address') }}
                </span>

                <BaseInput
                  v-model="holderAddress"
                  autocomplete="street-address"
                  :placeholder="$t('Address')"
                  :error="errors.holder_address"
                  @update:model-value="clearError('holder_address')"
                />
              </label>
            </div>
          </div>

          <div class="gift-form__checkout">
            <div class="gift-form__total">
              <span>
                {{ $t('Total to pay') }}
              </span>

              <strong>
                {{ formattedAmount }}
              </strong>
            </div>

            <p class="gift-form__terms">
              {{ $t('By continuing you accept our') }}

              <RouterLink to="/static/terms-and-conditions">
                {{ $t('Terms & Conditions') }}
              </RouterLink>

              {{ $t('and') }}

              <RouterLink to="/static/privacy-policy"> {{ $t('Privacy Notice') }} </RouterLink>.
            </p>

            <div class="gift-form__actions">
              <BaseButton
                type="submit"
                variant="secondary"
                class="gift-form__buy"
                :disabled="!canSubmit || isSubmitting"
              >
                {{ $t('Buy from balance') }}
              </BaseButton>

              <BaseButton
                type="button"
                class="gift-form__cart"
                :disabled="!canSubmit || isSubmitting"
                @click="handleAddToCart"
              >
                {{ $t('Add to cart') }}
              </BaseButton>
            </div>

            <Transition>
              <div v-if="generalError" class="gift-form__message error">
                {{ generalError }}
              </div>
            </Transition>

            <Transition>
              <div v-if="successMessage" class="gift-form__message success">
                {{ successMessage }}
              </div>
            </Transition>
          </div>
        </form>
      </div>

      <section v-if="popularProducts.length" class="gift-page__recommended recommended">
        <div class="recommended__top">
          <h2 class="recommended__title _h2">
            {{ $t('Popular right now') }}
          </h2>

          <div class="recommended__line"></div>

          <RouterLink to="/products/all/all" class="recommended__link">
            {{ $t('All keys') }}
          </RouterLink>
        </div>

        <div class="recommended__list">
          <ProductListItem
            v-for="item in popularProducts"
            :key="item.id"
            :item="item"
            class="recommended__item"
          />
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.gift-page {
  @include header-indent;
  @include adaptiveValue('padding-top', 22, 14);
  @include adaptiveValue('padding-bottom', 100, 32);

  &__breadcrumbs {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 14, 8);
    }
  }

  &__title {
    margin: 0;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 42, 18);
    }
  }

  &__main {
    display: grid;

    grid-template-columns:
      minmax(0, 1.2fr)
      minmax(420px, 1fr);

    @include adaptiveValue('gap', 56, 28);

    align-items: start;

    @media (max-width: $md3) {
      grid-template-columns: 1fr;
    }
  }

  &__left {
    min-width: 0;
  }

  &__description {
    max-width: 720px;

    margin: 0;

    color: var(--bg-eight-color);

    @include adaptiveValue('font-size', 15, 13);

    @include adaptiveValue('line-height', 27, 22);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 20);
    }

    @media (max-width: $md8) {
      display: none;
    }
  }

  &__perks {
    display: grid;

    grid-template-columns: repeat(3, minmax(0, 1fr));

    @include adaptiveValue('gap', 20, 12);

    @media (max-width: $md8) {
      display: none;
    }
  }

  &__recommended {
    @include adaptiveValue('margin-top', 96, 40);

    @media (max-width: $md8) {
      display: none;
    }
  }
}

.gift-card-preview {
  position: relative;

  width: 100%;

  @include adaptiveValue('height', 280, 180);

  overflow: hidden;

  border: 2px solid var(--hint-primary-color);

  @include adaptiveValue('border-radius', 18, 12);

  background-color: var(--bg-primary-color);

  &:not(:last-child) {
    @include adaptiveValue('margin-bottom', 30, 18);
  }

  &__image {
    position: absolute;
    inset: 0;

    width: 100%;
    height: 100%;

    object-fit: cover;

    opacity: 0.42;
  }

  &__overlay {
    position: absolute;
    inset: 0;

    background: linear-gradient(
      105deg,
      rgba(255, 255, 255, 0.97) 5%,
      rgba(255, 255, 255, 0.76) 58%,
      rgba(255, 255, 255, 0.28) 100%
    );

    @media (max-width: $md8) {
      background: linear-gradient(
        160deg,
        rgba(255, 255, 255, 0.72) 0%,
        rgba(255, 255, 255, 0.97) 100%
      );
    }
  }

  &__content {
    position: relative;

    z-index: 2;

    height: 100%;

    display: flex;
    flex-direction: column;
    justify-content: space-between;

    @include adaptiveValue('padding-top', 40, 20);

    @include adaptiveValue('padding-right', 44, 20);

    @include adaptiveValue('padding-bottom', 40, 20);

    @include adaptiveValue('padding-left', 44, 20);
  }

  &__brand {
    display: flex;

    align-items: center;

    @include adaptiveValue('gap', 13, 8);
  }

  &__brand-icon {
    display: flex;

    align-items: center;
    justify-content: center;

    @include adaptiveValue('width', 25, 18);

    @include adaptiveValue('height', 25, 18);

    color: var(--hint-primary-color);

    border: 2px solid var(--hint-primary-color);

    border-radius: 7px;
  }

  &__brand-name {
    color: var(--primary-color);

    @include adaptiveValue('font-size', 19, 15);

    @include adaptiveValue('letter-spacing', 2.6, 2);

    strong {
      font-weight: 700;
    }
  }

  &__bottom {
    display: flex;

    align-items: flex-end;
    justify-content: space-between;

    gap: 20px;
  }

  &__label {
    color: var(--seconday-color);

    @include adaptiveValue('font-size', 11, 10);

    @include adaptiveValue('letter-spacing', 2.2, 2);

    text-transform: uppercase;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 8, 5);
    }
  }

  &__value {
    color: var(--primary-color);

    font-family: var(--font-gabarito);

    font-weight: 900;

    @include adaptiveValue('font-size', 56, 38);

    line-height: 1;

    font-variant-numeric: tabular-nums;
  }

  &__code {
    color: var(--seconday-color);

    font-size: 12px;

    letter-spacing: 1.8px;

    @media (max-width: $md8) {
      display: none;
    }
  }
}

.gift-perk {
  display: flex;

  flex-direction: column;

  @include adaptiveValue('gap', 10, 8);

  border: 2px solid var(--border-primary-color);

  border-radius: 14px;

  background-color: var(--bg-secondary-color);

  @include adaptiveValue('padding-top', 26, 18);

  @include adaptiveValue('padding-right', 28, 18);

  @include adaptiveValue('padding-bottom', 26, 18);

  @include adaptiveValue('padding-left', 28, 18);

  &__kicker {
    color: var(--hint-primary-color);

    font-size: 11px;
    line-height: 15px;

    letter-spacing: 2.2px;

    text-transform: uppercase;
  }

  &__title {
    color: var(--primary-color);

    font-size: 15px;
    line-height: 21px;

    font-weight: 500;
  }

  &__text {
    color: var(--seconday-color);

    font-size: 12px;
    line-height: 20px;
  }
}

.gift-form {
  min-width: 0;

  display: flex;
  flex-direction: column;

  @include adaptiveValue('gap', 28, 18);

  border: 2px solid var(--border-primary-color);

  @include adaptiveValue('border-radius', 14, 10);

  background-color: var(--bg-secondary-color);

  @include adaptiveValue('padding-top', 36, 20);

  @include adaptiveValue('padding-right', 40, 16);

  @include adaptiveValue('padding-bottom', 40, 20);

  @include adaptiveValue('padding-left', 40, 16);

  @media (max-width: $md3) {
    border: none;

    padding-left: 0;
    padding-right: 0;

    background-color: transparent;
  }

  &__title {
    margin: 0;

    color: var(--primary-color);

    font-family: var(--font-gabarito);

    font-weight: 900;

    @include adaptiveValue('font-size', 26, 20);

    @include adaptiveValue('line-height', 31, 25);

    @media (max-width: $md8) {
      display: none;
    }
  }

  &__section {
    display: flex;

    flex-direction: column;

    @include adaptiveValue('gap', 12, 10);
  }

  &__field-label {
    color: var(--seconday-color);

    @include adaptiveValue('font-size', 13, 12);

    span {
      color: var(--hint-primary-color);
    }
  }

  &__values {
    display: grid;

    grid-template-columns: repeat(3, minmax(0, 1fr));

    @include adaptiveValue('gap', 10, 8);
  }

  &__value {
    width: 100%;

    @include adaptiveValue('height', 54, 48);

    display: flex;

    align-items: center;
    justify-content: center;

    border: 2px solid var(--primary-color);

    border-radius: 10px;

    background-color: transparent;

    color: var(--seconday-color);

    @include adaptiveValue('font-size', 15, 13);

    font-family: inherit;

    font-weight: 600;

    cursor: pointer;

    transition:
      color 0.3s ease,
      border-color 0.3s ease,
      background-color 0.3s ease;

    &.active {
      color: var(--hint-primary-color);

      border-color: var(--hint-primary-color);

      background-color: var(--bg-secondary-color);
    }

    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);

        border-color: var(--hint-primary-color);
      }
    }
  }

  &__delivery {
    display: grid;

    grid-template-columns: repeat(2, minmax(0, 1fr));

    gap: 6px;

    padding: 5px;

    border: 2px solid var(--border-primary-color);

    border-radius: 10px;

    background-color: var(--bg-primary-color);
  }

  &__delivery-button {
    min-width: 0;

    border: none;

    border-radius: 8px;

    background-color: transparent;

    color: var(--seconday-color);

    @include adaptiveValue('padding-top', 12, 11);

    @include adaptiveValue('padding-bottom', 12, 11);

    @include adaptiveValue('font-size', 13, 12);

    font-family: inherit;

    cursor: pointer;

    transition:
      color 0.3s ease,
      background-color 0.3s ease;

    &.active {
      color: var(--light-color);

      background-color: var(--hint-primary-color);

      font-weight: 600;
    }
  }

  &__fields {
    display: flex;

    flex-direction: column;

    @include adaptiveValue('gap', 20, 16);
  }

  &__holder {
    display: flex;

    flex-direction: column;

    @include adaptiveValue('gap', 16, 12);
  }

  &__holder-title {
    color: var(--primary-color);

    font-family: var(--font-gabarito);

    @include adaptiveValue('font-size', 18, 16);

    line-height: 1.3;

    font-weight: 700;
  }

  &__holder-grid {
    display: grid;

    grid-template-columns: repeat(2, minmax(0, 1fr));

    @include adaptiveValue('gap', 16, 12);

    @media (max-width: $md8) {
      grid-template-columns: 1fr;
    }
  }

  &__field {
    display: flex;

    flex-direction: column;

    gap: 9px;

    &_full {
      grid-column: 1 / -1;
    }

    &_message {
      @media (max-width: $md8) {
        display: none;
      }
    }
  }

  &__input-label {
    color: var(--seconday-color);

    @include adaptiveValue('font-size', 12, 11);

    @include adaptiveValue('letter-spacing', 1.44, 1.32);

    text-transform: uppercase;
  }

  &__phone-prefix {
    color: var(--primary-color);

    font-size: 14px;
    line-height: 18px;

    font-weight: 600;

    white-space: nowrap;
  }

  &__checkout {
    display: flex;

    flex-direction: column;

    @include adaptiveValue('gap', 18, 14);

    @include adaptiveValue('padding-top', 22, 16);

    border-top: 2px solid var(--border-primary-color);

    @media (max-width: $md8) {
      border-top: none;

      padding-top: 0;
    }
  }

  &__total {
    display: flex;

    align-items: flex-end;
    justify-content: space-between;

    gap: 20px;

    @media (max-width: $md8) {
      display: none;
    }

    span {
      color: var(--primary-color);

      font-size: 14px;
    }

    strong {
      color: var(--primary-color);

      font-family: var(--font-gabarito);

      font-weight: 900;

      @include adaptiveValue('font-size', 34, 28);

      line-height: 1;
    }
  }

  &__terms {
    margin: 0;

    color: var(--seconday-color);

    @include adaptiveValue('font-size', 12, 11);

    @include adaptiveValue('line-height', 20, 18);

    a {
      color: var(--hint-primary-color);

      transition: opacity 0.3s ease;

      @media (any-hover: hover) {
        &:hover {
          opacity: 0.7;
        }
      }
    }
  }

  &__actions {
    display: grid;

    grid-template-columns:
      minmax(0, 1fr)
      minmax(140px, auto);

    @include adaptiveValue('gap', 14, 10);

    @media (max-width: $md8) {
      grid-template-columns: 1fr;
    }
  }

  &__buy {
    width: 100%;
  }

  &__cart {
    min-width: 140px;

    @media (max-width: $md8) {
      width: 100%;
    }
  }

  &__message {
    padding: 10px 12px;

    border-radius: 8px;

    font-size: 13px;

    &.error {
      color: var(--error-color);

      background-color: var(--error-bg-color);
    }

    &.success {
      color: var(--success-color);

      background-color: var(--bg-sixth-color);
    }
  }
}

.recommended {
  &__top {
    display: flex;

    align-items: baseline;

    gap: 28px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 16);
    }
  }

  &__title {
    flex: 0 0 auto;
  }

  &__line {
    flex: 1 1 auto;

    height: 1px;

    background: linear-gradient(to right, var(--border-primary-color), transparent);

    @media (max-width: $md8) {
      display: none;
    }
  }

  &__link {
    flex: 0 0 auto;

    color: var(--hint-primary-color);

    font-size: 13px;

    font-weight: 600;

    @media (max-width: $md8) {
      display: none;
    }
  }

  &__list {
    display: grid;

    grid-template-columns: repeat(5, minmax(0, 1fr));

    gap: 20px;

    @media (max-width: $md2) {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    @media (max-width: $md3) {
      grid-template-columns: repeat(2, minmax(0, 1fr));

      gap: 12px;
    }
  }

  &__item {
    min-width: 0;
  }
}
</style>
