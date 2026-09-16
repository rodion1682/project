<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import ProductItem from '@/components/ProductItem.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

import { useAuthStore } from '@/stores/auth'
import { useCurrStore } from '@/stores/currencies'
import { useProfileStore } from '@/stores/profile'
import { useRouter } from 'vue-router'

const props = defineProps({
  order: {
    type: String,
    required: true,
  },
})

const router = useRouter()

const profileStore = useProfileStore()
const currStore = useCurrStore()
const authStore = useAuthStore()

const isLoading = ref(false)

const activeOrder = computed(() => {
  const orders = Array.isArray(profileStore.orderHistory) ? profileStore.orderHistory : []

  return (
    orders.find((item) => {
      return String(item.order_nr) === String(props.order)
    }) || null
  )
})

const orderItems = computed(() => {
  if (!activeOrder.value) {
    return []
  }

  const possibleCollections = [
    activeOrder.value.items,
    activeOrder.value.products,
    activeOrder.value.order_items,
    activeOrder.value.orderItems,
  ]

  return possibleCollections.find((items) => Array.isArray(items)) || []
})

const buyer = computed(() => {
  return activeOrder.value?.user || {}
})

const buyerName = computed(() => {
  const firstName = buyer.value?.first_name || buyer.value?.firstName || buyer.value?.name || ''

  const lastName = buyer.value?.last_name || buyer.value?.lastName || buyer.value?.surname || ''

  return `${firstName} ${lastName}`.trim() || '—'
})

const buyerEmail = computed(() => {
  return buyer.value?.email || '—'
})

const orderCurrency = computed(() => {
  const order = activeOrder.value

  if (!order) {
    return ''
  }

  const currencyCode = order.currencyCode || order.currency || ''

  const currency = Array.isArray(currStore.currencies)
    ? currStore.currencies.find((item) => {
        return item.code === currencyCode
      })
    : null

  return currency?.symbol || currencyCode || currStore.currency?.symbol || ''
})

const formattedAmount = computed(() => {
  const amount = Number(activeOrder.value?.amount)

  if (!Number.isFinite(amount)) {
    return activeOrder.value?.amount || '0.00'
  }

  return amount.toFixed(2)
})

const goBack = () => {
  router.push({ path: '/profile/orders' })
}

const formatDate = (value) => {
  if (!value) {
    return '—'
  }

  let date

  if (typeof value === 'number') {
    date = new Date(value < 1000000000000 ? value * 1000 : value)
  } else {
    date = new Date(value)
  }

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${day}.${month}.${year} ${hours}:${minutes}`
}

const getStatusClass = (status) => {
  const value = String(status || '')
    .trim()
    .toLowerCase()

  if (
    ['delivered', 'completed', 'complete', 'success', 'successful', 'paid', 'approved'].includes(
      value,
    )
  ) {
    return 'success'
  }

  if (['refunded', 'refund'].includes(value)) {
    return 'refunded'
  }

  if (['failed', 'error', 'cancelled', 'canceled', 'declined', 'rejected'].includes(value)) {
    return 'error'
  }

  if (['pending', 'processing', 'waiting'].includes(value)) {
    return 'pending'
  }

  return 'default'
}

const loadOrder = async () => {
  if (!authStore.isAuth) {
    return
  }

  isLoading.value = true

  try {
    await profileStore.getOrderHistory()
  } finally {
    isLoading.value = false
  }
}

watch(
  () => currStore.currency?.code,
  async (currency, previousCurrency) => {
    if (!currency || currency === previousCurrency || !authStore.isAuth) {
      return
    }

    await loadOrder()
  },
)

watch(
  () => props.order,
  async (orderId, previousOrderId) => {
    if (!orderId || orderId === previousOrderId || !authStore.isAuth) {
      return
    }

    if (!activeOrder.value) {
      await loadOrder()
    }
  },
)

onMounted(loadOrder)
</script>

<template>
  <div class="profile-order">
    <div class="profile-order__header">
      <BaseButton @click="goBack" variant="bordered" class="profile-order__back">
        {{ $t('Back to orders') }}
      </BaseButton>
    </div>

    <div v-if="isLoading && !activeOrder" class="profile-order__loading">
      <div class="profile-order__spinner"></div>
    </div>

    <template v-else-if="activeOrder">
      <section class="profile-order__summary">
        <div class="profile-order__summary-main">
          <div class="profile-order__eyebrow">
            {{ $t('Order') }}
          </div>

          <h2 class="profile-order__title">#{{ activeOrder.order_nr }}</h2>

          <div class="profile-order__summary-meta">
            {{ formatDate(activeOrder.created_at) }}
          </div>
        </div>

        <div class="profile-order__summary-side">
          <span
            :class="[
              'profile-order__status',
              `profile-order__status_${getStatusClass(activeOrder.status)}`,
            ]"
          >
            {{ activeOrder.status ? $t(activeOrder.status) : '—' }}
          </span>

          <div class="profile-order__summary-total">
            {{ formattedAmount }}
            {{ orderCurrency }}
          </div>
        </div>
      </section>

      <section class="profile-order__products">
        <div class="profile-order__section-heading">
          <h2 class="profile-order__section-title">
            {{ $t('Products') }}
          </h2>

          <span v-if="orderItems.length" class="profile-order__products-count">
            {{ orderItems.length }}
            {{ $t(orderItems.length === 1 ? 'item' : 'items') }}
          </span>
        </div>

        <div v-if="orderItems.length" class="profile-order__products-list">
          <ProductItem
            v-for="item in orderItems"
            :key="item.id"
            :item="item"
            :itemCurr="activeOrder.currencyCode || activeOrder.currency || orderCurrency"
            :isBought="true"
          />
        </div>

        <div v-else class="profile-order__products-empty">
          {{ $t('No products to display') }}
        </div>
      </section>

      <div class="profile-order__details-grid">
        <section class="profile-order__card">
          <h2 class="profile-order__card-title">
            {{ $t('Order details') }}
          </h2>

          <div class="profile-order__rows">
            <div class="profile-order__row">
              <span class="profile-order__row-label">
                {{ $t('Order number') }}
              </span>

              <span class="profile-order__row-value"> #{{ activeOrder.order_nr }} </span>
            </div>

            <div class="profile-order__row">
              <span class="profile-order__row-label">
                {{ $t('Order date') }}
              </span>

              <span class="profile-order__row-value">
                {{ formatDate(activeOrder.created_at) }}
              </span>
            </div>

            <div class="profile-order__row">
              <span class="profile-order__row-label">
                {{ $t('Status') }}
              </span>

              <span
                :class="[
                  'profile-order__status',
                  `profile-order__status_${getStatusClass(activeOrder.status)}`,
                ]"
              >
                {{ activeOrder.status ? $t(activeOrder.status) : '' }}
              </span>
            </div>
          </div>
        </section>

        <section class="profile-order__card">
          <h2 class="profile-order__card-title">
            {{ $t('Buyer information') }}
          </h2>

          <div class="profile-order__rows">
            <div class="profile-order__row">
              <span class="profile-order__row-label">
                {{ $t('Name, Surname') }}
              </span>

              <span class="profile-order__row-value">
                {{ buyerName }}
              </span>
            </div>

            <div class="profile-order__row">
              <span class="profile-order__row-label">
                {{ $t('E-mail') }}
              </span>

              <a
                v-if="buyerEmail !== '—'"
                :href="`mailto:${buyerEmail}`"
                class="profile-order__row-value profile-order__email"
              >
                {{ buyerEmail }}
              </a>

              <span v-else class="profile-order__row-value"> — </span>
            </div>
          </div>
        </section>
      </div>

      <section class="profile-order__total">
        <span class="profile-order__total-label">
          {{ $t('Order total') }}
        </span>

        <strong class="profile-order__total-value">
          {{ formattedAmount }}
          {{ orderCurrency }}
        </strong>
      </section>
    </template>

    <div v-else class="profile-order__not-found">
      <h2 class="profile-order__not-found-title">
        {{ $t('Order not found') }}
      </h2>

      <p class="profile-order__not-found-text">
        {{ $t('The requested order could not be found in your order history.') }}
      </p>

      <BaseButton
        to="/profile/orders"
        variant="dark-secondary"
        class="profile-order__not-found-button"
      >
        {{ $t('Back to orders') }}
      </BaseButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.profile-order {
  width: 100%;
  min-width: 0;

  &__header {
    width: 100%;

    display: flex;
    align-items: center;

    @include adaptiveValue('margin-bottom', 20, 14);
  }

  &__back {
    width: fit-content;
    min-width: 0;
  }

  &__loading {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: center;

    @include adaptiveValue('min-height', 360, 240);
  }

  &__spinner {
    width: 34px;
    height: 34px;

    border: 3px solid var(--border-primary-color);
    border-top-color: var(--hint-primary-color);
    border-radius: 50%;

    animation: profile-order-spin 0.7s linear infinite;
  }

  &__summary {
    width: 100%;
    min-width: 0;

    display: flex;
    align-items: center;
    justify-content: space-between;

    border: 2px solid var(--border-primary-color);
    background-color: var(--bg-secondary-color);

    @include adaptiveValue('gap', 32, 18);
    @include adaptiveValue('padding', 30, 20);
    @include adaptiveValue('border-radius', 14, 12);
    @include adaptiveValue('margin-bottom', 20, 14);
  }

  &__summary-main {
    min-width: 0;
  }

  &__eyebrow {
    color: var(--seconday-color);

    font-weight: 700;
    text-transform: uppercase;

    @include adaptiveValue('font-size', 11, 9);
    @include adaptiveValue('line-height', 16, 14);
    @include adaptiveValue('letter-spacing', 1.6, 1.3);
    @include adaptiveValue('margin-bottom', 7, 5);
  }

  &__title {
    margin: 0;

    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-weight: 900;
    line-height: 1;

    @include adaptiveValue('font-size', 32, 25);
    @include adaptiveValue('margin-bottom', 8, 6);
  }

  &__summary-meta {
    color: var(--seconday-color);

    @include adaptiveValue('font-size', 13, 12);
    @include adaptiveValue('line-height', 19, 17);
  }

  &__summary-side {
    flex: 0 0 auto;

    display: flex;
    align-items: flex-end;
    flex-direction: column;

    @include adaptiveValue('gap', 12, 8);
  }

  &__summary-total {
    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-weight: 900;
    line-height: 1;

    white-space: nowrap;

    @include adaptiveValue('font-size', 26, 22);
  }

  &__status {
    width: fit-content;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    border-radius: 6px;

    font-weight: 700;
    text-transform: uppercase;
    white-space: nowrap;

    @include adaptiveValue('padding-top', 6, 5);
    @include adaptiveValue('padding-right', 9, 7);
    @include adaptiveValue('padding-bottom', 6, 5);
    @include adaptiveValue('padding-left', 9, 7);

    @include adaptiveValue('font-size', 10, 9);
    @include adaptiveValue('line-height', 14, 13);
    @include adaptiveValue('letter-spacing', 1.2, 1);

    &_success {
      color: var(--hint-primary-color);
      background-color: var(--bg-primary-color);
    }

    &_refunded {
      color: var(--seconday-color);
      background-color: var(--bg-third-color);
    }

    &_pending {
      color: var(--primary-color);
      background-color: var(--bg-third-color);
    }

    &_error {
      color: var(--error-color, #d92d20);
      background-color: rgba(217, 45, 32, 0.08);
    }

    &_default {
      color: var(--seconday-color);
      background-color: var(--bg-third-color);
    }
  }

  &__products {
    width: 100%;
    min-width: 0;

    border: 2px solid var(--border-primary-color);
    background-color: var(--bg-secondary-color);

    @include adaptiveValue('padding', 28, 18);
    @include adaptiveValue('border-radius', 14, 12);
    @include adaptiveValue('margin-bottom', 20, 14);
  }

  &__section-heading {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: space-between;

    @include adaptiveValue('gap', 16, 10);
    @include adaptiveValue('margin-bottom', 22, 16);
  }

  &__section-title,
  &__card-title {
    margin: 0;

    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-weight: 700;
    line-height: 1.2;

    @include adaptiveValue('font-size', 22, 19);
  }

  &__products-count {
    flex: 0 0 auto;

    color: var(--seconday-color);

    @include adaptiveValue('font-size', 12, 11);
  }

  &__products-list {
    width: 100%;
    min-width: 0;

    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    @include adaptiveValue('gap', 14, 10);
  }

  &__products-empty {
    color: var(--seconday-color);

    @include adaptiveValue('font-size', 14, 13);
    @include adaptiveValue('line-height', 21, 19);
  }

  &__details-grid {
    width: 100%;
    min-width: 0;

    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    @include adaptiveValue('gap', 20, 14);
    @include adaptiveValue('margin-bottom', 20, 14);
  }

  &__card {
    min-width: 0;

    border: 2px solid var(--border-primary-color);
    background-color: var(--bg-secondary-color);

    @include adaptiveValue('padding', 28, 18);
    @include adaptiveValue('border-radius', 14, 12);
  }

  &__card-title {
    @include adaptiveValue('margin-bottom', 22, 16);
  }

  &__rows {
    width: 100%;

    display: flex;
    flex-direction: column;
  }

  &__row {
    width: 100%;
    min-width: 0;

    display: flex;
    align-items: center;
    justify-content: space-between;

    border-bottom: 1px solid var(--border-primary-color);

    @include adaptiveValue('gap', 20, 12);
    @include adaptiveValue('padding-top', 13, 11);
    @include adaptiveValue('padding-bottom', 13, 11);

    &:first-child {
      padding-top: 0;
    }

    &:last-child {
      padding-bottom: 0;

      border-bottom: 0;
    }
  }

  &__row-label {
    flex: 0 1 auto;

    color: var(--seconday-color);

    @include adaptiveValue('font-size', 13, 12);
    @include adaptiveValue('line-height', 19, 17);
  }

  &__row-value {
    min-width: 0;

    color: var(--primary-color);

    font-weight: 600;
    text-align: right;

    overflow-wrap: anywhere;

    @include adaptiveValue('font-size', 14, 13);
    @include adaptiveValue('line-height', 20, 18);
  }

  &__email {
    color: var(--hint-primary-color);

    transition: opacity 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        opacity: 0.7;
      }
    }
  }

  &__total {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: space-between;

    border: 2px solid var(--border-primary-color);
    background-color: var(--bg-secondary-color);

    @include adaptiveValue('gap', 20, 12);
    @include adaptiveValue('padding-top', 24, 18);
    @include adaptiveValue('padding-right', 28, 18);
    @include adaptiveValue('padding-bottom', 24, 18);
    @include adaptiveValue('padding-left', 28, 18);
    @include adaptiveValue('border-radius', 14, 12);
  }

  &__total-label {
    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-weight: 700;

    @include adaptiveValue('font-size', 18, 16);
  }

  &__total-value {
    color: var(--hint-primary-color);

    font-family: var(--font-gabarito);
    font-weight: 900;

    white-space: nowrap;

    @include adaptiveValue('font-size', 24, 21);
  }

  &__not-found {
    width: 100%;

    display: flex;
    align-items: center;
    flex-direction: column;

    margin-left: auto;
    margin-right: auto;

    border: 2px solid var(--border-primary-color);
    background-color: var(--bg-secondary-color);

    text-align: center;

    @include adaptiveValue('max-width', 560, 340);
    @include adaptiveValue('padding', 48, 26);
    @include adaptiveValue('border-radius', 14, 12);
  }

  &__not-found-title {
    margin-top: 0;

    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-weight: 700;

    @include adaptiveValue('font-size', 26, 22);
    @include adaptiveValue('margin-bottom', 10, 8);
  }

  &__not-found-text {
    margin-top: 0;

    color: var(--seconday-color);

    @include adaptiveValue('max-width', 400, 290);
    @include adaptiveValue('font-size', 14, 13);
    @include adaptiveValue('line-height', 22, 20);
    @include adaptiveValue('margin-bottom', 22, 18);
  }

  &__not-found-button {
    width: fit-content;
  }

  @media (max-width: $md4) {
    &__details-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: $md6) {
    &__summary {
      align-items: flex-start;
      flex-direction: column;
    }

    &__summary-side {
      width: 100%;

      align-items: center;
      justify-content: space-between;
      flex-direction: row;
    }

    &__row {
      align-items: flex-start;
      flex-direction: column;

      gap: 5px;
    }

    &__row-value {
      width: 100%;

      text-align: left;
    }

    &__total {
      align-items: flex-end;
    }
  }
}

@keyframes profile-order-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
