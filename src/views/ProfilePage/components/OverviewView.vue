<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import PriceFormatter from '@/components/ui/PriceFormatter.vue'

import { useProfileStore } from '@/stores/profile'
import { useWishListStore } from '@/stores/wishlist'

const { t } = useI18n()

const profileStore = useProfileStore()
const wishListStore = useWishListStore()

const isSubmitting = ref(false)
const isStatsLoading = ref(false)
const successMessage = ref('')
const submitError = ref('')

let successTimer = null
let errorTimer = null

const form = reactive({
  name: '',
  surname: '',
  email: '',
  phone: '',
})

const errors = reactive({
  name: '',
  surname: '',
  email: '',
  phone: '',
})

const ordersCount = computed(() => {
  return Array.isArray(profileStore.orderHistory) ? profileStore.orderHistory.length : 0
})

const wishlistCount = computed(() => {
  return Array.isArray(wishListStore.items) ? wishListStore.items.length : 0
})

const priceDroppedCount = computed(() => {
  if (!Array.isArray(wishListStore.items)) {
    return 0
  }

  return wishListStore.items.filter((product) => {
    const oldPrice = product?.old_price ?? product?.oldPrice ?? product?.price_old ?? null
    const currentPrice = product?.price ?? null

    if (oldPrice === null || currentPrice === null) {
      return false
    }

    return Number(oldPrice) > Number(currentPrice)
  }).length
})

const latestOrder = computed(() => {
  if (!Array.isArray(profileStore.orderHistory) || !profileStore.orderHistory.length) {
    return null
  }

  return [...profileStore.orderHistory].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })[0]
})

const latestOrderDate = computed(() => {
  if (!latestOrder.value?.created_at) {
    return ''
  }

  const date = new Date(latestOrder.value.created_at)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
})

const balance = computed(() => {
  const value = profileStore.profile?.balanceInCurrency

  if (value === null || value === undefined || value === '') {
    return 0
  }

  return Number(value)
})

const hasProfile = () => {
  return Boolean(profileStore.profile && Object.keys(profileStore.profile).length)
}

const normalizeValue = (value) => {
  return String(value ?? '').trim()
}

const showSuccessMessage = (message) => {
  successMessage.value = message

  if (successTimer) {
    clearTimeout(successTimer)
  }

  successTimer = setTimeout(() => {
    successMessage.value = ''
    successTimer = null
  }, 3000)
}

const showErrorMessage = (message) => {
  submitError.value = message

  if (errorTimer) {
    clearTimeout(errorTimer)
  }

  errorTimer = setTimeout(() => {
    submitError.value = ''
    errorTimer = null
  }, 3000)
}

const clearMessages = () => {
  successMessage.value = ''
  submitError.value = ''

  if (successTimer) {
    clearTimeout(successTimer)
    successTimer = null
  }

  if (errorTimer) {
    clearTimeout(errorTimer)
    errorTimer = null
  }
}

const fillForm = () => {
  if (!hasProfile()) {
    return
  }

  form.name = profileStore.profile?.name ?? ''
  form.surname = profileStore.profile?.surname ?? ''
  form.email = profileStore.profile?.email ?? ''
  form.phone = profileStore.profile?.phone ?? ''
}

const clearErrors = () => {
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })

  submitError.value = ''
}

const validate = () => {
  clearErrors()

  const name = normalizeValue(form.name)
  const surname = normalizeValue(form.surname)
  const email = normalizeValue(form.email)
  const phone = normalizeValue(form.phone)

  if (!name) {
    errors.name = t('Name is required')
  } else if (name.length < 2) {
    errors.name = t('Name must contain at least 2 characters')
  }

  if (!surname) {
    errors.surname = t('Surname is required')
  } else if (surname.length < 2) {
    errors.surname = t('Surname must contain at least 2 characters')
  }

  if (!email) {
    errors.email = t('Email is required')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = t('Enter a valid email address')
  }

  if (phone) {
    const phoneDigits = phone.replace(/\D/g, '')

    if (phoneDigits.length < 8) {
      errors.phone = t('Phone must be at least 8 symbols length')
    }
  }

  return !Object.values(errors).some(Boolean)
}

const setBackendFieldError = (field, message) => {
  if (!Object.prototype.hasOwnProperty.call(errors, field)) {
    return false
  }

  errors[field] = Array.isArray(message) ? message[0] : String(message)

  return true
}

const handleBackendError = (error) => {
  const responseData = error?.response?.data
  const validationErrors = responseData?.errors || responseData?.payload?.errors

  if (validationErrors && typeof validationErrors === 'object') {
    let handled = false

    Object.entries(validationErrors).forEach(([field, message]) => {
      if (setBackendFieldError(field, message)) {
        handled = true
      }
    })

    if (handled) {
      return
    }
  }

  const message = responseData?.message || t('Failed to update profile')
  const normalizedMessage = String(message).toLowerCase()

  if (normalizedMessage.includes('e-mail already') || normalizedMessage.includes('email already')) {
    errors.email = t('E-mail already taken by another user')
    return
  }

  if (normalizedMessage.includes('phone already')) {
    errors.phone = t('Phone already taken by another user')
    return
  }

  if (normalizedMessage.includes('phone must')) {
    errors.phone = t('Phone must be at least 8 symbols length')
    return
  }

  showErrorMessage(message)
}

const submit = async () => {
  if (isSubmitting.value || !validate()) {
    return
  }

  isSubmitting.value = true
  clearMessages()

  const data = {
    name: normalizeValue(form.name),
    surname: normalizeValue(form.surname),
    email: normalizeValue(form.email),
    phone: normalizeValue(form.phone),
  }

  try {
    await profileStore.updateProfile(data)
    await profileStore.getProfile()

    fillForm()

    showSuccessMessage(t('Profile updated successfully'))
  } catch (error) {
    handleBackendError(error)
  } finally {
    isSubmitting.value = false
  }
}

const loadStats = async () => {
  isStatsLoading.value = true

  try {
    await profileStore.getOrderHistory()

    try {
      await wishListStore.getItems()
    } catch {
      //
    }
  } finally {
    isStatsLoading.value = false
  }
}
watch(
  () => profileStore.profile,
  () => {
    fillForm()
  },
  {
    deep: true,
    immediate: true,
  },
)

watch(
  () => [form.name, form.surname, form.email, form.phone],
  () => {
    clearMessages()
  },
)

onMounted(async () => {
  if (!hasProfile()) {
    await profileStore.getProfile()
  }

  fillForm()

  await loadStats()
})

onBeforeUnmount(() => {
  if (successTimer) {
    clearTimeout(successTimer)
  }

  if (errorTimer) {
    clearTimeout(errorTimer)
  }
})
</script>

<template>
  <div class="overview">
    <form class="overview__card" @submit.prevent="submit">
      <div class="overview__header">
        <h2 class="overview__title">
          {{ $t('Personal information') }}
        </h2>

        <div class="overview__header-hint">
          {{ $t('Used on invoices and gift-card receipts') }}
        </div>
      </div>

      <div class="overview__fields">
        <div class="overview__field">
          <label class="overview__label">
            {{ $t('Name') }}
          </label>

          <BaseInput
            v-model="form.name"
            :error="errors.name"
            autocomplete="given-name"
            :placeholder="$t('Name')"
          />
        </div>

        <div class="overview__field">
          <label class="overview__label">
            {{ $t('Surname') }}
          </label>

          <BaseInput
            v-model="form.surname"
            :error="errors.surname"
            autocomplete="family-name"
            :placeholder="$t('Surname')"
          />
        </div>

        <div class="overview__field">
          <label class="overview__label">
            {{ $t('Email') }}
          </label>

          <BaseInput
            v-model="form.email"
            :error="errors.email"
            type="email"
            autocomplete="email"
            :placeholder="$t('Email')"
          />
        </div>

        <div class="overview__field">
          <label class="overview__label">
            {{ $t('Phone') }}
          </label>

          <BaseInput
            v-model="form.phone"
            :error="errors.phone"
            type="tel"
            autocomplete="tel"
            :placeholder="$t('Phone')"
          />
        </div>
      </div>

      <Transition name="overview-message">
        <div v-if="submitError" class="overview__message overview__message_error">
          {{ submitError }}
        </div>
      </Transition>

      <Transition name="overview-message">
        <div v-if="successMessage" class="overview__message overview__message_success">
          {{ successMessage }}
        </div>
      </Transition>

      <div class="overview__footer">
        <BaseButton
          type="submit"
          class="overview__submit"
          variant="dark-secondary"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? $t('Saving...') : $t('Save changes') }}
        </BaseButton>

        <div class="overview__footer-hint">
          {{ $t('Email is used for key delivery - keep it current.') }}
        </div>
      </div>
    </form>

    <div class="overview__stats">
      <RouterLink to="/profile/balance" class="overview__stat overview__stat_balance">
        <div class="overview__stat-label">
          {{ $t('Balance') }}
        </div>

        <div class="overview__stat-value">
          <template v-if="!isStatsLoading">
            <PriceFormatter :price="balance" size="size-34" />
          </template>

          <span v-else class="overview__stat-placeholder"></span>
        </div>

        <div class="overview__stat-action">
          {{ $t('Top up') }}
        </div>
      </RouterLink>

      <RouterLink to="/profile/orders" class="overview__stat">
        <div class="overview__stat-label">
          {{ $t('Orders') }}
        </div>

        <div class="overview__stat-value">
          <template v-if="!isStatsLoading">
            {{ ordersCount }}
          </template>

          <span v-else class="overview__stat-placeholder"></span>
        </div>

        <div class="overview__stat-description">
          <template v-if="latestOrderDate"> {{ $t('Last one') }} {{ latestOrderDate }} </template>

          <template v-else-if="!isStatsLoading">
            {{ $t('No orders yet') }}
          </template>
        </div>
      </RouterLink>

      <RouterLink to="/wish-list" class="overview__stat">
        <div class="overview__stat-label">
          {{ $t('Wishlist') }}
        </div>

        <div class="overview__stat-value">
          <template v-if="!isStatsLoading">
            {{ wishlistCount }}
          </template>

          <span v-else class="overview__stat-placeholder"></span>
        </div>

        <div class="overview__stat-description">
          <template v-if="priceDroppedCount">
            {{ priceDroppedCount }} {{ $t('dropped in price') }}
          </template>

          <template v-else-if="!isStatsLoading">
            {{ $t('No price drops') }}
          </template>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.overview {
  width: 100%;
  min-width: 0;

  display: flex;
  flex-direction: column;

  @include adaptiveValue('gap', 24, 18);

  &__card {
    width: 100%;
    min-width: 0;

    border: 2px solid var(--border-primary-color);
    border-radius: 14px;

    background-color: var(--bg-secondary-color);

    @include adaptiveValue('padding-top', 36, 22);
    @include adaptiveValue('padding-right', 40, 16);
    @include adaptiveValue('padding-bottom', 40, 22);
    @include adaptiveValue('padding-left', 40, 16);
  }

  &__header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;

    min-width: 0;

    @include adaptiveValue('gap', 24, 14);
    @include adaptiveValue('margin-bottom', 28, 20);
  }

  &__title {
    margin: 0;

    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-weight: 700;
    line-height: 1.2;

    @include adaptiveValue('font-size', 26, 20);
  }

  &__header-hint {
    flex: 0 1 auto;

    color: var(--seconday-color);

    text-align: right;

    @include adaptiveValue('font-size', 12, 11);
    @include adaptiveValue('line-height', 18, 16);
  }

  &__fields {
    width: 100%;
    min-width: 0;

    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    @include adaptiveValue('column-gap', 24, 12);
    @include adaptiveValue('row-gap', 22, 16);
  }

  &__field {
    min-width: 0;
  }

  &__label {
    display: block;

    color: var(--seconday-color);

    font-weight: 600;
    text-transform: uppercase;

    @include adaptiveValue('font-size', 11, 10);
    @include adaptiveValue('line-height', 16, 15);
    @include adaptiveValue('letter-spacing', 1.32, 1.2);
    @include adaptiveValue('margin-bottom', 9, 7);
  }

  &__message {
    width: 100%;

    border-radius: 10px;

    @include adaptiveValue('margin-top', 24, 18);
    @include adaptiveValue('padding', 12, 10);
    @include adaptiveValue('font-size', 13, 12);
    @include adaptiveValue('line-height', 19, 18);

    &_error {
      border: 2px solid var(--error-color);
      color: var(--error-color);
    }

    &_success {
      border: 2px solid var(--hint-primary-color);
      color: var(--hint-primary-color);
    }
  }

  &__footer {
    display: flex;
    align-items: center;

    @include adaptiveValue('gap', 20, 12);
    @include adaptiveValue('margin-top', 36, 20);
  }

  &__submit {
    flex: 0 0 auto;

    width: fit-content;
    min-width: 174px;
  }

  &__footer-hint {
    min-width: 0;

    color: var(--seconday-color);

    @include adaptiveValue('font-size', 12, 11);
    @include adaptiveValue('line-height', 18, 17);
  }

  &__stats {
    width: 100%;
    min-width: 0;

    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));

    @include adaptiveValue('gap', 20, 12);
  }

  &__stat {
    min-width: 0;

    display: flex;
    flex-direction: column;

    border: 2px solid var(--border-primary-color);
    border-radius: 14px;

    background-color: var(--bg-secondary-color);

    color: var(--primary-color);

    transition:
      border-color 0.3s ease,
      transform 0.3s ease;

    @include adaptiveValue('min-height', 148, 120);
    @include adaptiveValue('padding-top', 27, 20);
    @include adaptiveValue('padding-right', 30, 18);
    @include adaptiveValue('padding-bottom', 27, 20);
    @include adaptiveValue('padding-left', 30, 18);

    &_balance {
      border-color: var(--hint-primary-color);
    }

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--hint-primary-color);
        transform: translateY(-2px);
      }
    }
  }

  &__stat-label {
    color: var(--seconday-color);

    font-weight: 600;
    text-transform: uppercase;

    @include adaptiveValue('font-size', 11, 10);
    @include adaptiveValue('line-height', 16, 15);
    @include adaptiveValue('letter-spacing', 2.2, 1.7);
    @include adaptiveValue('margin-bottom', 8, 6);
  }

  &__stat-value {
    min-height: 38px;

    display: flex;
    align-items: center;

    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-weight: 900;
    line-height: 1;

    font-variant-numeric: tabular-nums;

    @include adaptiveValue('font-size', 34, 27);
    @include adaptiveValue('margin-bottom', 9, 7);

    :deep(.price-formatter) {
      font-family: var(--font-gabarito);
      font-weight: 900;
    }
  }

  &__stat-action {
    margin-top: auto;

    color: var(--hint-primary-color);

    @include adaptiveValue('font-size', 13, 12);
    @include adaptiveValue('line-height', 18, 17);
  }

  &__stat-description {
    min-height: 18px;

    margin-top: auto;

    color: var(--seconday-color);

    @include adaptiveValue('font-size', 13, 11);
    @include adaptiveValue('line-height', 18, 16);
  }

  &__stat-placeholder {
    display: block;

    width: 72px;
    height: 26px;

    border-radius: 6px;

    background-color: var(--border-primary-color);

    animation: overview-pulse 1.2s ease-in-out infinite;
  }

  @media (max-width: $md4) {
    &__stats {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: $md5) {
    gap: 0;

    &__card {
      padding-left: 0;
      padding-right: 0;

      border: 0;
      border-radius: 0;

      background-color: transparent;
    }

    &__header {
      display: block;
    }

    &__header-hint {
      display: none;
    }

    &__fields {
      grid-template-columns: 1fr;
    }

    &__footer {
      display: block;
    }

    &__submit {
      width: 100%;
    }

    &__footer-hint {
      display: none;
    }

    &__stats {
      display: none;
    }
  }
}

.overview-message-enter-active,
.overview-message-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.overview-message-enter-from,
.overview-message-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@keyframes overview-pulse {
  0%,
  100% {
    opacity: 0.45;
  }

  50% {
    opacity: 1;
  }
}
</style>
