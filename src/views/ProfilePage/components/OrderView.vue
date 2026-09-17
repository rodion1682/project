<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import axios from '@/plugins/axios'

import { useProfileStore } from '@/stores/profile'

import BaseButton from '@/components/ui/BaseButton.vue'
import PriceFormatter from '@/components/ui/PriceFormatter.vue'

const props = defineProps({
  order: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['loaded'])

const router = useRouter()
const profileStore = useProfileStore()

const activeOrder = ref(null)
const isLoading = ref(true)
const isInvoiceLoading = ref(false)
const copiedKey = ref('')
const error = ref('')

const orderItems = computed(() => {
  return Array.isArray(activeOrder.value?.items) ? activeOrder.value.items : []
})

const paymentMethod = computed(() => {
  const order = activeOrder.value

  if (!order) {
    return ''
  }

  return (
    order.payment_method || order.paymentMethod || order.payment_type || order.paymentType || ''
  )
})

const showStatus = computed(() => {
  return Boolean(activeOrder.value?.status)
})

const formatDate = (value) => {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}.${month}.${year}`
}

const getKeys = (item) => {
  if (Array.isArray(item?.keys)) {
    return item.keys.filter(Boolean)
  }

  if (item?.key) {
    return [item.key]
  }

  if (item?.code) {
    return [item.code]
  }

  return []
}

const copyKey = async (key) => {
  if (!key) {
    return
  }

  try {
    await navigator.clipboard.writeText(key)

    copiedKey.value = key

    setTimeout(() => {
      if (copiedKey.value === key) {
        copiedKey.value = ''
      }
    }, 2000)
  } catch {
    copiedKey.value = ''
  }
}

const goToContact = (item) => {
  router.push({
    path: '/contact-us',
    query: {
      order: activeOrder.value?.order_nr || '',
      topic: 'key',
      product: item?.title || '',
    },
  })
}

const goBack = () => {
  router.push('/profile/orders')
}

const loadOrder = async () => {
  if (!props.order) {
    activeOrder.value = null
    isLoading.value = false
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const orders = await profileStore.getOrderHistory()

    activeOrder.value = orders.find((item) => String(item.order_nr) === String(props.order)) || null

    emit('loaded', activeOrder.value)

    if (!activeOrder.value) {
      error.value = 'Order not found'
    }
  } catch (err) {
    activeOrder.value = null
    error.value = err?.response?.data?.message || 'Failed to load order'
  } finally {
    isLoading.value = false
  }
}

const downloadInvoice = async () => {
  if (!activeOrder.value?.order_nr || isInvoiceLoading.value) {
    return
  }

  isInvoiceLoading.value = true

  try {
    const response = await axios.get(`orders/download/${activeOrder.value.order_nr}`, {
      responseType: 'blob',
    })

    const blob = new Blob([response.data], {
      type: response.headers['content-type'] || 'application/pdf',
    })

    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `${activeOrder.value.order_nr}.pdf`

    document.body.appendChild(link)
    link.click()
    link.remove()

    window.URL.revokeObjectURL(url)
  } finally {
    isInvoiceLoading.value = false
  }
}

watch(
  () => props.order,
  () => {
    loadOrder()
  },
)

onMounted(() => {
  loadOrder()
})
</script>

<template>
  <div class="order-view">
    <div v-if="isLoading && !activeOrder" class="order-view__loading">
      <div class="order-view__spinner"></div>
    </div>

    <template v-else-if="activeOrder">
      <div class="order-view__mobile-summary">
        <div class="order-view__summary-row">
          <span>{{ $t('Order date') }}:</span>
          <strong>{{ formatDate(activeOrder.created_at) }}</strong>
        </div>

        <div v-if="paymentMethod" class="order-view__summary-row">
          <span>{{ $t('Paid with') }}:</span>
          <strong>{{ $t(paymentMethod) }}</strong>
        </div>

        <div v-if="showStatus" class="order-view__summary-row order-view__summary-row_status">
          <span>{{ $t('Status') }}:</span>

          <strong class="order-view__status">
            {{ $t(activeOrder.status) }}
          </strong>
        </div>

        <div class="order-view__summary-divider"></div>

        <div class="order-view__summary-row order-view__summary-row_total">
          <span>{{ $t('Order total') }}:</span>

          <PriceFormatter :price="activeOrder.amount" size="size-24" />
        </div>
      </div>

      <div class="order-view__top">
        <button type="button" class="order-view__back" @click="goBack">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M14 6L8 12L14 18"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>

          {{ $t('Back to orders') }}
        </button>

        <BaseButton
          variant="bordered"
          class="order-view__invoice"
          :disabled="isInvoiceLoading"
          @click="downloadInvoice"
        >
          {{ isInvoiceLoading ? $t('Downloading...') : $t('Download invoice') }}
        </BaseButton>
      </div>

      <div class="order-view__products">
        <article v-for="item in orderItems" :key="item.id" class="order-view__product">
          <div class="order-view__product-main">
            <RouterLink v-if="item.image" :to="`/products/${item.id}`" class="order-view__image">
              <img :src="item.image" :alt="item.title" />
            </RouterLink>

            <div class="order-view__product-content">
              <div class="order-view__product-header">
                <div class="order-view__product-info">
                  <div class="order-view__product-title">
                    {{ item.title }}
                  </div>

                  <div v-if="item.platform || item.region" class="order-view__product-meta">
                    <template v-if="item.platform">
                      {{ item.platform }}
                    </template>

                    <template v-if="item.platform && item.region"> · </template>

                    <template v-if="item.region">
                      {{ item.region }}
                    </template>
                  </div>
                </div>

                <PriceFormatter
                  :price="item.price"
                  size="size-24"
                  class="order-view__product-price"
                />
              </div>

              <div v-for="key in getKeys(item)" :key="key" class="order-view__key">
                <div class="order-view__key-label">
                  {{ $t('Key') }}
                </div>

                <div class="order-view__key-value">
                  {{ key }}
                </div>

                <BaseButton variant="bordered" class="order-view__copy" @click="copyKey(key)">
                  {{ copiedKey === key ? $t('Copied') : $t('Copy') }}
                </BaseButton>
              </div>

              <div v-if="getKeys(item).length" class="order-view__help">
                <button type="button" class="order-view__help-link" @click="goToContact(item)">
                  {{ $t("Key doesn't work?") }}
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>

      <button type="button" class="order-view__mobile-back" @click="goBack">
        {{ $t('Back to orders') }}
      </button>
    </template>

    <div v-else class="order-view__empty">
      <h2 class="order-view__empty-title">
        {{ $t('Order not found') }}
      </h2>

      <BaseButton variant="dark-secondary" @click="goBack">
        {{ $t('Back to orders') }}
      </BaseButton>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.order-view {
  width: 100%;
  min-width: 0;

  &__loading {
    width: 100%;
    min-height: 300px;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__spinner {
    width: 34px;
    height: 34px;

    border: 3px solid var(--border-primary-color);
    border-top-color: var(--hint-primary-color);
    border-radius: 50%;

    animation: order-spin 0.7s linear infinite;
  }

  &__mobile-summary {
    display: none;
  }

  &__top {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 24px;
    margin-bottom: 24px;
  }

  &__back {
    display: inline-flex;
    align-items: center;

    gap: 10px;

    padding: 0;

    background: transparent;

    color: var(--hint-primary-color);

    font-family: inherit;
    font-size: 14px;
    line-height: 20px;

    transition: opacity 0.3s ease;

    svg {
      width: 15px;
      height: 15px;

      flex: 0 0 auto;
    }

    @media (any-hover: hover) {
      &:hover {
        opacity: 0.7;
      }
    }
  }

  &__invoice {
    width: fit-content;
    min-width: 0;
  }

  &__products {
    width: 100%;

    display: flex;
    flex-direction: column;

    gap: 24px;
  }

  &__product {
    width: 100%;
    min-width: 0;

    border: 2px solid var(--border-primary-color);
    border-radius: 14px;

    background-color: var(--bg-secondary-color);

    padding: 28px 32px;
  }

  &__product-main {
    width: 100%;
    min-width: 0;

    display: flex;
    align-items: flex-start;

    gap: 28px;
  }

  &__image {
    width: 180px;
    height: 135px;

    flex: 0 0 auto;

    display: block;

    overflow: hidden;

    border-radius: 10px;

    img {
      width: 100%;
      height: 100%;

      display: block;

      object-fit: cover;
    }
  }

  &__product-content {
    flex: 1 1 auto;

    min-width: 0;

    display: flex;
    flex-direction: column;

    gap: 16px;
  }

  &__product-header {
    width: 100%;
    min-width: 0;

    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    gap: 24px;
  }

  &__product-info {
    min-width: 0;

    display: flex;
    flex-direction: column;

    gap: 7px;
  }

  &__product-title {
    color: var(--primary-color);

    font-size: 22px;
    font-weight: 500;
    line-height: 1.25;

    text-wrap: pretty;
  }

  &__product-meta {
    color: var(--seconday-color);

    font-size: 13px;
    line-height: 18px;
  }

  &__product-price {
    flex: 0 0 auto;
  }

  &__key {
    width: 100%;
    min-width: 0;

    display: flex;
    align-items: center;

    gap: 14px;

    padding: 16px 20px;

    border: 2px solid var(--hint-primary-color);
    border-radius: 10px;

    background-color: var(--bg-primary-color);
  }

  &__key-label {
    flex: 0 0 auto;

    color: var(--seconday-color);

    font-size: 11px;
    font-weight: 600;
    line-height: 16px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  &__key-value {
    flex: 1 1 auto;

    min-width: 0;

    color: var(--primary-color);

    font-size: 18px;
    font-weight: 500;
    line-height: 24px;
    letter-spacing: 0.16em;

    font-variant-numeric: tabular-nums;

    overflow-wrap: anywhere;
  }

  &__copy {
    flex: 0 0 auto;

    width: fit-content;
    min-width: 74px;
  }

  &__help {
    display: flex;
    align-items: center;

    gap: 20px;

    min-height: 18px;
  }

  &__help-link {
    padding: 0;

    background: transparent;

    color: var(--hint-primary-color);

    font-family: inherit;
    font-size: 13px;
    line-height: 18px;

    transition: opacity 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        opacity: 0.7;
      }
    }
  }

  &__mobile-back {
    display: none;
  }

  &__empty {
    width: 100%;

    display: flex;
    align-items: center;
    flex-direction: column;

    gap: 20px;

    padding: 50px 20px;

    border: 2px solid var(--border-primary-color);
    border-radius: 14px;

    background-color: var(--bg-secondary-color);
  }

  &__empty-title {
    margin: 0;

    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-size: 26px;
    font-weight: 700;
  }

  @media (max-width: $md5) {
    &__mobile-summary {
      display: flex;
      flex-direction: column;

      gap: 12px;

      margin-bottom: 16px;
      padding: 18px 20px;

      border: 2px solid var(--border-primary-color);
      border-radius: 14px;

      background-color: var(--bg-secondary-color);
    }

    &__summary-row {
      width: 100%;

      display: flex;
      align-items: baseline;
      justify-content: space-between;

      gap: 16px;

      color: var(--seconday-color);

      font-size: 12px;
      line-height: 18px;

      strong {
        color: var(--primary-color);

        font-size: 14px;
        font-weight: 400;

        text-align: right;
      }

      &_status {
        .order-view__status {
          color: var(--hint-primary-color);

          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }
      }

      &_total {
        align-items: flex-end;

        color: var(--primary-color);

        font-size: 13px;
      }
    }

    &__summary-divider {
      width: 100%;
      height: 1px;

      background-color: var(--border-primary-color);
    }

    &__top {
      display: none;
    }

    &__products {
      gap: 12px;
    }

    &__product {
      padding: 16px 18px;
    }

    &__product-main {
      display: block;
    }

    &__image {
      width: 76px;
      height: 57px;

      float: left;

      margin-right: 12px;
      margin-bottom: 14px;

      border-radius: 8px;
    }

    &__product-content {
      display: block;
    }

    &__product-header {
      min-height: 57px;

      display: block;

      margin-bottom: 14px;
    }

    &__product-info {
      display: block;
    }

    &__product-title {
      font-size: 14px;
      font-weight: 500;
      line-height: 1.3;
    }

    &__product-meta {
      margin-top: 4px;

      font-size: 11px;
      line-height: 16px;
    }

    &__product-price {
      margin-top: 4px;
    }

    &__key {
      clear: both;

      display: flex;
      align-items: stretch;
      flex-direction: column;

      gap: 10px;

      padding: 14px 16px;

      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }

    &__key-label {
      font-size: 10px;
      line-height: 14px;
    }

    &__key-value {
      width: 100%;

      font-size: 15px;
      line-height: 21px;
      letter-spacing: 0.14em;
    }

    &__copy {
      width: 100%;
    }

    &__help {
      clear: both;

      margin-top: 12px;
    }

    &__help-link {
      font-size: 12px;
      line-height: 17px;
    }

    &__mobile-back {
      width: 100%;

      display: block;

      margin-top: 18px;
      padding: 6px 0 0;

      background: transparent;

      color: var(--hint-primary-color);

      font-family: inherit;
      font-size: 13px;
      line-height: 18px;
      text-align: center;
    }
  }
}

@keyframes order-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
