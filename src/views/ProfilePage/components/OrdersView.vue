<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import { useCurrStore } from '@/stores/currencies'
import { useProfileStore } from '@/stores/profile'

import BaseButton from '@/components/ui/BaseButton.vue'
import SvgIcon from '@/components/ui/icons/SvgIcon.vue'

import Loader from '@/components/Loader.vue'
import { CartIcon } from '@/components/ui/icons'
import { onBeforeRouteUpdate, useRoute } from 'vue-router'

const route = useRoute()

const currStore = useCurrStore()
const profileStore = useProfileStore()

const activeStatus = ref('all')
const isLoading = ref(false)


const orders = computed(() => {
  return Array.isArray(profileStore.orderHistory) ? profileStore.orderHistory : []
})

const uniqueStatuses = computed(() => {
  return [...new Set(orders.value.map((item) => item?.status).filter(Boolean))]
})

const filteredOrders = computed(() => {
  if (activeStatus.value === 'all') {
    return orders.value
  }

  return orders.value.filter((item) => item.status === activeStatus.value)
})

const getStatusOrdersCount = (status) => {
  return orders.value.filter((item) => item.status === status).length
}

const filterHistory = (status = 'all') => {
  activeStatus.value = status
}

const formatDate = (value) => {
  if (!value) {
    return ''
  }

  let date

  if (typeof value === 'number') {
    date = new Date(value < 1000000000000 ? value * 1000 : value)
  } else {
    date = new Date(value)
  }

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}.${month}.${year}`
}

const formatMoney = (amount, currencyCode) => {
  const value = Number(amount)

  const formatted = Number.isFinite(value) ? value.toFixed(2) : '0.00'

  if (currencyCode && currStore.currency?.code === currencyCode && currStore.currency?.symbol) {
    return `${formatted} ${currStore.currency.symbol}`
  }

  return `${formatted} ${currencyCode || currStore.currency?.symbol || ''}`.trim()
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

const getOrderProducts = (order) => {
  const possibleCollections = [order?.items, order?.products, order?.order_items, order?.orderItems]

  const collection = possibleCollections.find((value) => Array.isArray(value))

  if (!collection?.length) {
    return order?.title || order?.product_title || '—'
  }

  return collection
    .map((item) => {
      return item?.title || item?.name || item?.product?.title || item?.product?.name
    })
    .filter(Boolean)
    .join(', ')
}

const getKeysCount = (order) => {
  const directValue = order?.keys_count ?? order?.keysCount ?? order?.quantity ?? order?.qty

  if (directValue !== undefined && directValue !== null) {
    return directValue
  }

  const possibleCollections = [order?.items, order?.products, order?.order_items, order?.orderItems]

  const collection = possibleCollections.find((value) => Array.isArray(value))

  if (!collection?.length) {
    return 0
  }

  return collection.reduce((total, item) => {
    const quantity = Number(item?.quantity ?? item?.qty ?? 1)

    return total + (Number.isFinite(quantity) ? quantity : 1)
  }, 0)
}

const loadOrders = async () => {
  isLoading.value = true

  try {
    await profileStore.getOrderHistory()
  } catch (error) {
    console.error('Failed to load orders:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadOrders()
})

onBeforeRouteUpdate((to) => {
  if (to.path === '/profile/orders') {
    loadOrders()
  }
})

watch(
  () => currStore.currency?.code,
  (currency, previousCurrency) => {
    if (!currency || currency === previousCurrency) {
      return
    }

    if (route.path === '/profile/orders') {
      loadOrders()
    }
  },
)
</script>

<template>
  <div class="profile-orders">
    <Loader v-if="isLoading && !orders.length" class="profile-orders__loading" />

    <template v-else-if="orders.length">
      <div class="profile-orders__filters">
        <BaseButton
          :variant="activeStatus === 'all' ? 'blue' : 'bordered'"
          class="profile-orders__filter"
          @click="filterHistory('all')"
        >
          {{ $t('All') }}
        </BaseButton>

        <BaseButton
          v-for="status in uniqueStatuses"
          :key="status"
          :variant="activeStatus === status ? 'blue' : 'bordered'"
          class="profile-orders__filter"
          @click="filterHistory(status)"
        >
          {{ $t(status) }}
        </BaseButton>

        <span class="profile-orders__count">
          {{ orders.length }}
          {{ $t('orders') }}
        </span>
      </div>

      <div class="profile-orders__table">
        <div class="profile-orders__row profile-orders__row_head">
          <span>{{ $t('# Nr.') }}</span>

          <span>{{ $t('Products') }}</span>

          <span>{{ $t('Keys') }}</span>

          <span>{{ $t('Date') }}</span>

          <span>{{ $t('Status') }}</span>

          <span>{{ $t('Total') }}</span>
        </div>

        <RouterLink
          v-for="item in filteredOrders"
          :key="item.order_nr"
          :to="`/profile/orders/${item.order_nr}`"
          class="profile-orders__row profile-orders__row_order"
        >
          <span class="profile-orders__number"> #{{ item.order_nr }} </span>

          <span class="profile-orders__products">
            {{ getOrderProducts(item) }}
          </span>

          <span class="profile-orders__keys">
            {{ getKeysCount(item) }}
          </span>

          <span class="profile-orders__date">
            {{ formatDate(item.created_at) }}
          </span>

          <span
            :class="[
              'profile-orders__status',
              `profile-orders__status_${getStatusClass(item.status)}`,
            ]"
          >
            {{ item.status ? $t(item.status) : '' }}
          </span>

          <strong class="profile-orders__total">
            {{ formatMoney(item.amount, item.currencyCode) }}
          </strong>
        </RouterLink>
      </div>

      <div class="profile-orders__mobile-list">
        <RouterLink
          v-for="item in filteredOrders"
          :key="`mobile-${item.order_nr}`"
          :to="`/profile/orders/${item.order_nr}`"
          class="profile-orders__mobile-card"
        >
          <div class="profile-orders__mobile-head">
            <span class="profile-orders__number"> #{{ item.order_nr }} </span>

            <span
              :class="[
                'profile-orders__status',
                `profile-orders__status_${getStatusClass(item.status)}`,
              ]"
            >
              {{ item.status ? $t(item.status) : '' }}
            </span>
          </div>

          <div class="profile-orders__mobile-products">
            {{ getOrderProducts(item) }}
          </div>

          <div class="profile-orders__mobile-bottom">
            <div class="profile-orders__mobile-meta">
              <span>
                {{ formatDate(item.created_at) }}
              </span>

              <span>·</span>

              <span>
                {{ getKeysCount(item) }}
                {{ $t(Number(getKeysCount(item)) === 1 ? 'key' : 'keys') }}
              </span>
            </div>

            <strong class="profile-orders__mobile-total">
              {{ formatMoney(item.amount, item.currencyCode) }}
            </strong>
          </div>
        </RouterLink>
      </div>

      <div v-if="!filteredOrders.length" class="profile-orders__filter-empty">
        {{ $t('No orders with this status.') }}
      </div>
    </template>

    <div v-else class="profile-orders__empty">
      <div class="profile-orders__empty-box">
        <SvgIcon :icon="CartIcon" class="profile-orders__empty-icon" />
      </div>

      <h2 class="profile-orders__empty-title">
        {{ $t('No orders yet') }}
      </h2>

      <p class="profile-orders__empty-text">
        {{ $t('Your orders will appear here after you make your first purchase.') }}
      </p>

      <BaseButton to="/products" class="profile-orders__empty-button">
        {{ $t('Browse catalog') }}
      </BaseButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.profile-orders {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;

  &__loading {
    width: 100%;
    margin: auto;
  }

  &__filters {
    width: 100%;
    min-width: 0;

    display: flex;
    align-items: center;
    flex-wrap: wrap;

    @include adaptiveValue('gap', 10, 8);
    @include adaptiveValue('margin-bottom', 22, 14);
  }

  &__filter {
    width: fit-content;
    min-width: 0;
    text-transform: capitalize;

    flex: 0 0 auto;

    @include adaptiveValue('min-height', 40, 36);
  }

  &__count {
    margin-left: auto;

    color: var(--seconday-color);

    font-size: 12px;
    line-height: 1.4;

    white-space: nowrap;
  }

  &__table {
    width: 100%;
    min-width: 0;

    border: 2px solid var(--border-primary-color);

    background-color: var(--bg-secondary-color);

    overflow: hidden;

    @include adaptiveValue('border-radius', 14, 12);
    @include adaptiveValue('padding-top', 14, 10);
    @include adaptiveValue('padding-right', 28, 16);
    @include adaptiveValue('padding-bottom', 20, 14);
    @include adaptiveValue('padding-left', 28, 16);
  }

  &__row {
    width: 100%;
    min-width: 0;

    display: grid;
    grid-template-columns:
      minmax(90px, 0.8fr)
      minmax(190px, 2.4fr)
      minmax(55px, 0.55fr)
      minmax(100px, 0.9fr)
      minmax(100px, 0.95fr)
      minmax(90px, 0.85fr);

    align-items: center;

    @include adaptiveValue('column-gap', 24, 12);

    &_head {
      min-height: 42px;

      border-bottom: 2px solid var(--border-primary-color);

      color: var(--seconday-color);

      font-size: 11px;
      line-height: 15px;
      font-weight: 400;

      letter-spacing: 1.76px;
      text-transform: uppercase;

      span:last-child {
        text-align: right;
      }
    }

    &_order {
      min-height: 58px;

      border-bottom: 2px solid var(--border-primary-color);

      transition:
        background-color 0.2s ease,
        border-color 0.2s ease;

      &:last-child {
        border-bottom: 0;
      }

      @media (any-hover: hover) {
        &:hover {
          .profile-orders__number,
          .profile-orders__products {
            color: var(--hint-primary-color);
          }
        }
      }
    }
  }

  &__number {
    min-width: 0;

    overflow: hidden;

    color: var(--hint-primary-color);

    font-size: 12px;
    line-height: 1.4;

    text-overflow: ellipsis;
    white-space: nowrap;

    transition: color 0.2s ease;
  }

  &__products {
    min-width: 0;

    overflow: hidden;

    color: var(--primary-color);

    font-size: 13px;
    line-height: 1.4;
    font-weight: 500;

    text-overflow: ellipsis;
    white-space: nowrap;

    transition: color 0.2s ease;
  }

  &__keys,
  &__date {
    min-width: 0;

    color: var(--seconday-color);

    font-size: 12px;
    line-height: 1.4;

    font-variant-numeric: tabular-nums;
  }

  &__status {
    width: fit-content;
    max-width: 100%;

    overflow: hidden;

    color: var(--seconday-color);

    font-size: 10px;
    line-height: 1.4;
    font-weight: 700;

    letter-spacing: 0.12em;
    text-transform: uppercase;

    text-overflow: ellipsis;
    white-space: nowrap;

    &_success {
      color: var(--hint-primary-color);
    }

    &_refunded {
      color: var(--seconday-color);
    }

    &_pending {
      color: #d69a00;
    }

    &_error {
      color: #d94c4c;
    }

    &_default {
      color: var(--seconday-color);
    }
  }

  &__total {
    min-width: 0;

    color: var(--primary-color);

    font-size: 14px;
    line-height: 1.4;
    font-weight: 700;

    text-align: right;

    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  &__mobile-list {
    display: none;
  }

  &__filter-empty {
    width: 100%;

    color: var(--seconday-color);

    text-align: center;

    @include adaptiveValue('padding-top', 60, 36);
    @include adaptiveValue('padding-bottom', 60, 36);
    @include adaptiveValue('font-size', 14, 13);
  }

  &__empty {
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
    @include adaptiveValue('border-radius', 14, 12);
    @include adaptiveValue('padding-top', 70, 35);
    @include adaptiveValue('padding-right', 40, 18);
    @include adaptiveValue('padding-bottom', 70, 35);
    @include adaptiveValue('padding-left', 40, 18);

    &-box {
      display: flex;
      align-items: center;
      justify-content: center;

      border: 2px solid var(--hint-primary-color);

      color: var(--hint-primary-color);

      @include adaptiveValue('width', 64, 48);
      @include adaptiveValue('height', 64, 48);
      @include adaptiveValue('border-radius', 14, 12);

      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 22, 18);
      }
    }

    &-icon {
      flex: 0 0 auto;

      @include adaptiveValue('width', 27, 19);
      @include adaptiveValue('height', 27, 19);
    }

    &-title {
      margin-top: 0;

      color: var(--primary-color);

      font-family: var(--font-gabarito);
      font-weight: 700;
      line-height: 1.2;

      @include adaptiveValue('font-size', 26, 22);
      @include adaptiveValue('margin-bottom', 10, 8);
    }

    &-text {
      width: 100%;

      margin-top: 0;

      color: var(--seconday-color);

      @include adaptiveValue('max-width', 430, 300);
      @include adaptiveValue('font-size', 14, 13);
      @include adaptiveValue('line-height', 22, 20);
      @include adaptiveValue('margin-bottom', 24, 18);
    }

    &-button {
      width: fit-content;

      @include adaptiveValue('min-width', 160, 145);
    }
  }

  @media (max-width: $md3) {
    &__row {
      grid-template-columns:
        minmax(80px, 0.8fr)
        minmax(160px, 2fr)
        minmax(45px, 0.5fr)
        minmax(90px, 0.85fr)
        minmax(90px, 0.9fr)
        minmax(80px, 0.8fr);
    }
  }

  @media (max-width: $md4) {
    &__filters {
      margin-bottom: 12px;

      flex-wrap: nowrap;

      overflow-x: auto;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    &__filter {
      flex: 0 0 auto;
    }

    &__count {
      display: none;
    }

    &__table {
      display: none;
    }

    &__mobile-list {
      display: flex;
      flex-direction: column;

      gap: 10px;
    }

    &__mobile-card {
      width: 100%;
      min-width: 0;

      display: flex;
      flex-direction: column;

      border: 2px solid var(--border-primary-color);
      border-radius: 10px;

      background-color: var(--bg-secondary-color);

      @include adaptiveValue('gap', 10, 8);
      @include adaptiveValue('padding-top', 15, 13);
      @include adaptiveValue('padding-right', 15, 13);
      @include adaptiveValue('padding-bottom', 15, 13);
      @include adaptiveValue('padding-left', 15, 13);
    }

    &__mobile-head {
      min-width: 0;

      display: flex;
      align-items: center;
      justify-content: space-between;

      gap: 12px;
    }

    &__mobile-products {
      min-width: 0;

      overflow: hidden;

      color: var(--primary-color);

      font-size: 13px;
      line-height: 1.45;
      font-weight: 500;

      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &__mobile-bottom {
      min-width: 0;

      display: flex;
      align-items: flex-end;
      justify-content: space-between;

      gap: 12px;
    }

    &__mobile-meta {
      min-width: 0;

      display: flex;
      align-items: center;
      flex-wrap: wrap;

      gap: 4px;

      color: var(--seconday-color);

      font-size: 10px;
      line-height: 1.4;

      font-variant-numeric: tabular-nums;
    }

    &__mobile-total {
      flex: 0 0 auto;

      color: var(--primary-color);

      font-size: 14px;
      line-height: 1.3;
      font-weight: 700;

      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
  }

  @media (max-width: $md8) {
    &__filters {
      gap: 6px;
    }

    &__filter {
      min-height: 34px;
    }

    &__mobile-card {
      padding: 12px;
    }
  }
}
</style>
