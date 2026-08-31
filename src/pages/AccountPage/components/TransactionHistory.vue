<template>
  <div class="transaction-history">
    <div
      v-if="isLoading && !transactions.length"
      class="transaction-history__box transaction-history__loading"
      aria-live="polite"
    >
      <div
        v-for="item in itemsPerPage"
        :key="item"
        class="transaction-history__skeleton"
      >
        <span class="transaction-history__skeleton-line" />
        <span class="transaction-history__skeleton-line" />
        <span class="transaction-history__skeleton-line" />
      </div>
    </div>

    <!-- Error without cached content -->
    <div
      v-else-if="error && !transactions.length"
      class="transaction-history__box transaction-history__message"
      role="alert"
    >
      <div class="transaction-history__message-title _h3">
        {{ $t('Unable to load transactions') }}
      </div>

      <p class="transaction-history__message-text">
        {{ error }}
      </p>

      <BaseButton
        type="button"
        variant="bordered"
        class="transaction-history__retry"
        :disabled="isLoading"
        @click="fetchTransactions"
      >
        {{ isLoading ? $t('Loading...') : $t('Try again') }}
      </BaseButton>
    </div>

    <!-- Empty -->
    <div
      v-else-if="!transactions.length"
      class="transaction-history__box transaction-history__message"
    >
      <div class="transaction-history__message-title _h3">
        {{ $t('No transactions found') }}
      </div>

      <p class="transaction-history__message-text">
        {{ $t('Your transactions will appear here.') }}
      </p>
    </div>

    <!-- Transactions -->
    <template v-else>
      <div
        v-if="isUsingCachedData"
        class="transaction-history__notice"
        role="status"
      >
        <span class="transaction-history__notice-text">
          {{
            $t(
              'The latest transaction data is unavailable. Previously loaded data is displayed.',
            )
          }}
        </span>

        <button
          type="button"
          class="transaction-history__notice-retry"
          :disabled="isLoading"
          @click="fetchTransactions"
        >
          {{ isLoading ? $t('Loading...') : $t('Refresh') }}
        </button>
      </div>

      <div class="transaction-history__box">
        <table class="transaction-history__table">
          <colgroup>
            <col
              class="transaction-history__column transaction-history__column_id"
            />

            <col
              class="transaction-history__column transaction-history__column_date"
            />

            <col
              class="transaction-history__column transaction-history__column_type"
            />

            <col
              class="transaction-history__column transaction-history__column_amount"
            />

            <col
              class="transaction-history__column transaction-history__column_status"
            />
          </colgroup>

          <thead class="transaction-history__head">
            <tr class="transaction-history__row transaction-history__row_head">
              <th class="transaction-history__header">
                {{ $t('ID') }}
              </th>

              <th class="transaction-history__header">
                {{ $t('Date') }}
              </th>

              <th class="transaction-history__header">
                {{ $t('Type') }}
              </th>

              <th
                class="transaction-history__header transaction-history__header_amount"
              >
                {{ $t('Amount') }}
              </th>

              <th
                class="transaction-history__header transaction-history__header_status"
              >
                {{ $t('Status') }}
              </th>
            </tr>
          </thead>

          <tbody class="transaction-history__body">
            <tr
              v-for="transaction in paginatedTransactions"
              :key="transaction.id"
              class="transaction-history__row"
            >
              <td
                class="transaction-history__cell transaction-history__cell_id"
                :data-label="$t('ID')"
              >
                <span class="transaction-history__value">
                  #{{ transaction.id }}
                </span>
              </td>

              <td
                class="transaction-history__cell transaction-history__cell_date"
                :data-label="$t('Date')"
              >
                <div class="transaction-history__date">
                  <span class="transaction-history__date-day">
                    {{ formatDate(transaction.created_at, 'DD.MM.YYYY') }}
                  </span>

                  <span class="transaction-history__date-time">
                    {{ formatDate(transaction.created_at, 'HH:mm') }}
                  </span>
                </div>
              </td>

              <td
                class="transaction-history__cell transaction-history__cell_type"
                :data-label="$t('Type')"
              >
                <div class="transaction-history__type">
                  <span class="transaction-history__type-name">
                    {{ transaction.description }}
                  </span>

                  <span
                    v-if="transaction.paymentType"
                    class="transaction-history__type-method"
                  >
                    {{ formatText(transaction.paymentType) }}
                  </span>
                </div>
              </td>

              <td
                class="transaction-history__cell transaction-history__cell_amount"
                :data-label="$t('Amount')"
              >
                <span class="transaction-history__amount">
                  {{ formatTransactionAmount(transaction) }}
                </span>
              </td>

              <td
                class="transaction-history__cell transaction-history__cell_status"
                :data-label="$t('Status')"
              >
                <span
                  class="transaction-history__status"
                  :class="statusClass(transaction.status)"
                >
                  {{ formatStatus(transaction.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="totalPages > 1" class="transaction-history__pagination">
          <Pagination
            v-model:current-page="currentPage"
            :total-pages="totalPages"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import Pagination from '@/components/PaginationComponent.vue'
import axios from '@/plugins/axios'
import { useCurrencyStore } from '@/stores/currency'
import { formatDate } from '@/utils/formatters'

const currencyStore = useCurrencyStore()

const transactions = ref([])
const isLoading = ref(false)
const isUsingCachedData = ref(false)
const error = ref(null)
const currentPage = ref(1)

const itemsPerPage = 8

let latestRequestId = 0

const cacheKey = computed(() => {
  return `transaction-history:${currencyStore.currentCurrencyCode}`
})

const isObject = value => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

const getCurrencyCode = transaction => {
  if (isObject(transaction.currency)) {
    return transaction.currency.code || currencyStore.currentCurrencyCode
  }

  return (
    transaction.currency_code ||
    transaction.currency ||
    currencyStore.currentCurrencyCode
  )
}

const getCurrencySymbol = transaction => {
  if (isObject(transaction.currency)) {
    return transaction.currency.symbol || currencyStore.currentCurrencySymbol
  }

  return transaction.currency_symbol || currencyStore.currentCurrencySymbol
}

const normalizeTransaction = transaction => {
  return {
    id:
      transaction.id ??
      transaction.transaction_id ??
      transaction.provider_transaction_id ??
      crypto.randomUUID(),

    created_at: transaction.created_at ?? transaction.completed_at ?? null,

    description:
      transaction.operation || transaction.description || 'Top up balance',

    price: Number(
      transaction.price ??
        transaction.internal_currency_sum ??
        transaction.amount_in_game_currency ??
        transaction.amount ??
        0,
    ),

    paymentType:
      transaction.payment_type ||
      transaction.payment_method ||
      transaction.payment_provider ||
      '',

    currencyCode: getCurrencyCode(transaction),
    currencySymbol: getCurrencySymbol(transaction),

    status: transaction.status || '',
  }
}

const saveTransactionsToCache = value => {
  try {
    localStorage.setItem(cacheKey.value, JSON.stringify(value))
  } catch (cacheError) {
    console.warn('Unable to cache transactions:', cacheError)
  }
}

const loadTransactionsFromCache = () => {
  try {
    const cachedValue = localStorage.getItem(cacheKey.value)

    if (!cachedValue) {
      return []
    }

    const parsedValue = JSON.parse(cachedValue)

    return Array.isArray(parsedValue) ? parsedValue : []
  } catch (cacheError) {
    console.warn('Unable to read cached transactions:', cacheError)

    return []
  }
}

const getRequestErrorMessage = requestError => {
  const serverMessage = requestError.response?.data?.message

  if (serverMessage?.includes('Attempt to read property "code" on string')) {
    return 'Transaction history is temporarily unavailable because the server returned invalid currency data.'
  }

  return (
    serverMessage ||
    requestError.message ||
    'Unable to load transaction history.'
  )
}

const fetchTransactions = async () => {
  const requestId = ++latestRequestId

  isLoading.value = true
  error.value = null
  isUsingCachedData.value = false

  try {
    const response = await axios.get('/transactions')

    if (requestId !== latestRequestId) {
      return
    }

    const responseData = response.data?.data

    if (!Array.isArray(responseData)) {
      throw new Error('Invalid transactions response')
    }

    const normalizedTransactions = responseData.map(normalizeTransaction)

    transactions.value = normalizedTransactions
    currentPage.value = 1
    isUsingCachedData.value = false

    saveTransactionsToCache(normalizedTransactions)
  } catch (requestError) {
    if (requestId !== latestRequestId) {
      return
    }

    console.error('Error fetching transactions:', requestError)

    error.value = getRequestErrorMessage(requestError)

    const cachedTransactions = loadTransactionsFromCache()

    if (cachedTransactions.length) {
      transactions.value = cachedTransactions
      isUsingCachedData.value = true
      error.value = null
    } else {
      transactions.value = []
      isUsingCachedData.value = false
    }
  } finally {
    if (requestId === latestRequestId) {
      isLoading.value = false
    }
  }
}

const getTimestamp = value => {
  if (!value) {
    return 0
  }

  if (typeof value === 'number') {
    return value < 1000000000000 ? value * 1000 : value
  }

  const timestamp = new Date(value).getTime()

  return Number.isNaN(timestamp) ? 0 : timestamp
}

const sortedTransactions = computed(() => {
  return [...transactions.value].sort((firstTransaction, secondTransaction) => {
    return (
      getTimestamp(secondTransaction.created_at) -
      getTimestamp(firstTransaction.created_at)
    )
  })
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(sortedTransactions.value.length / itemsPerPage))
})

const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage

  return sortedTransactions.value.slice(start, start + itemsPerPage)
})

const formatTransactionAmount = transaction => {
  const amount = Number(transaction.price)

  if (!Number.isFinite(amount)) {
    return currencyStore.formatPrice(0)
  }

  const currencyCode =
    transaction.currencyCode || currencyStore.currentCurrencyCode

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch (formatError) {
    const currencySymbol =
      transaction.currencySymbol || currencyStore.currentCurrencySymbol

    return `${currencySymbol}${amount.toFixed(2)}`
  }
}

const normalizeStatus = status => {
  return String(status ?? '')
    .trim()
    .toLowerCase()
}

const statusClass = status => {
  const normalizedStatus = normalizeStatus(status)

  if (
    ['success', 'successful', 'completed', 'accepted', 'paid'].includes(
      normalizedStatus,
    )
  ) {
    return 'transaction-history__status_success'
  }

  if (
    ['error', 'failed', 'rejected', 'cancelled', 'canceled'].includes(
      normalizedStatus,
    )
  ) {
    return 'transaction-history__status_error'
  }

  if (['pending', 'processing', 'in_process'].includes(normalizedStatus)) {
    return 'transaction-history__status_pending'
  }

  return 'transaction-history__status_default'
}

const formatText = value => {
  if (!value) {
    return ''
  }

  return String(value)
    .replaceAll('_', ' ')
    .replace(/\b\w/g, character => character.toUpperCase())
}

const formatStatus = status => {
  return formatText(status) || '—'
}

watch(totalPages, pages => {
  if (currentPage.value > pages) {
    currentPage.value = pages
  }
})

watch(
  () => currencyStore.currentCurrencyCode,
  (newCurrencyCode, oldCurrencyCode) => {
    if (oldCurrencyCode && newCurrencyCode !== oldCurrencyCode) {
      currentPage.value = 1
      transactions.value = []
      fetchTransactions()
    }
  },
)

onMounted(fetchTransactions)
</script>

<style lang="scss" scoped>
.transaction-history {
  width: 100%;
  min-width: 0;

  &__heading {
    max-width: 620px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 38, 24);
    }
  }

  &__subtitle {
    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  &__title {
    text-align: left;

    span {
      color: var(--hint-secondary-color);
    }
  }

  &__notice {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;

    margin-bottom: 14px;
    padding: 12px 14px;

    border: 1px solid var(--border-secondary-color);
    border-radius: 6px;
    background-color: rgb(179 154 107 / 8%);
  }

  &__notice-text {
    color: var(--secondary-color);
    font-size: 13px;
    line-height: 145%;
  }

  &__notice-retry {
    flex: 0 0 auto;

    border: 0;
    outline: none;
    background-color: transparent;

    color: var(--hint-primary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 500;
    text-transform: uppercase;

    cursor: pointer;

    transition: color 0.3s ease;

    &:disabled {
      opacity: 0.5;

      cursor: not-allowed;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        color: var(--hint-secondary-color);
      }
    }
  }

  &__box {
    overflow: hidden;

    width: 100%;
    min-width: 0;

    border-radius: 6px;
    background-color: var(--bg-third-color);
    box-shadow: 0 14px 35px rgb(0 0 0 / 16%);
  }

  &__table {
    width: 100%;

    border-collapse: collapse;

    border-spacing: 0;

    table-layout: fixed;
  }

  &__column {
    &_id {
      width: 9%;
    }

    &_date {
      width: 21%;
    }

    &_type {
      width: 31%;
    }

    &_amount {
      width: 21%;
    }

    &_status {
      width: 18%;
    }
  }

  &__header,
  &__cell {
    min-width: 0;

    padding: 16px clamp(8px, 1.25vw, 18px);

    border-bottom: 1px dashed var(--border-secondary-color);

    font-family: var(--font-inter);
    font-size: clamp(12px, 1vw, 14px);
    font-weight: 500;
    line-height: 140%;
    text-align: left;

    overflow-wrap: anywhere;
  }

  &__header {
    color: var(--secondary-color);

    &_amount,
    &_status {
      text-align: right;
    }
  }

  &__body {
    .transaction-history__row {
      transition: background-color 0.3s ease;

      &:nth-child(even) {
        background-color: rgb(7 8 14 / 24%);
      }

      &:last-child {
        .transaction-history__cell {
          border-bottom: 0;
        }
      }

      @media (any-hover: hover) {
        &:hover {
          background-color: var(--bg-fourth-color);
        }
      }
    }
  }

  &__cell {
    color: var(--secondary-color);

    &_amount,
    &_status {
      text-align: right;
    }
  }

  &__value {
    display: block;

    min-width: 0;

    overflow-wrap: anywhere;
  }

  &__date {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  &__date-day {
    color: var(--secondary-color);
  }

  &__date-time {
    color: var(--third-color);
  }

  &__type {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    gap: 3px;

    min-width: 0;
  }

  &__type-name {
    overflow: hidden;

    color: var(--secondary-color);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__type-method {
    color: var(--third-color);
    font-size: 11px;
  }

  &__amount {
    display: inline-block;

    max-width: 100%;

    color: var(--primary-color);
    font-family: var(--font-pt-serif);
    font-size: clamp(16px, 1.4vw, 20px);
    font-weight: 700;
    line-height: 120%;

    overflow-wrap: anywhere;
  }

  &__status {
    display: inline-block;

    max-width: 100%;

    font-weight: 500;
    text-transform: capitalize;

    overflow-wrap: anywhere;

    &_success {
      color: var(--hint-primary-color);
    }

    &_error {
      color: var(--error-color);
    }

    &_pending {
      color: #ffa600;
    }

    &_default {
      color: var(--secondary-color);
    }
  }

  &__pagination {
    display: flex;
    justify-content: flex-end;

    padding: 24px clamp(14px, 2vw, 30px);
  }

  &__loading {
    padding: clamp(12px, 2vw, 24px);
  }

  &__skeleton {
    display: grid;
    align-items: center;
    gap: 18px;
    grid-template-columns: 12% 58% 22%;

    min-height: 64px;

    padding: 12px;

    border-bottom: 1px dashed var(--border-secondary-color);

    &:last-child {
      border-bottom: 0;
    }
  }

  &__skeleton-line {
    height: 12px;

    border-radius: 4px;
    background: linear-gradient(
      90deg,
      var(--bg-secondary-color) 25%,
      var(--border-fourth-color) 50%,
      var(--bg-secondary-color) 75%
    );
    background-size: 200% 100%;

    animation: transaction-history-pulse 1.5s infinite linear;
  }

  &__message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    min-height: 280px;

    padding: 30px;

    text-align: center;
  }

  &__message-title {
    color: var(--hint-primary-color);

    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }

  &__message-text {
    max-width: 440px;

    color: var(--secondary-color);
    font-size: 14px;
    line-height: 150%;
  }

  &__retry {
    width: min(100%, 170px);
    min-height: 40px;

    margin-top: 22px;

    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    text-transform: uppercase;
  }

  @media (max-width: $md3) {
    &__header,
    &__cell {
      padding-right: 10px;
      padding-left: 10px;
    }
  }

  @media (max-width: $md4) {
    &__notice {
      flex-direction: column;
      align-items: flex-start;
    }

    &__box {
      overflow: visible;

      background-color: transparent;
      box-shadow: none;
    }

    &__table,
    &__body,
    &__row,
    &__cell {
      display: block;

      width: 100%;
    }

    &__table {
      table-layout: auto;
    }

    &__head,
    &__column {
      display: none;
    }

    &__body {
      display: grid;
      gap: 12px;
    }

    &__body &__row {
      overflow: hidden;

      border: 1px solid var(--border-secondary-color);
      border-radius: 6px;
      background-color: var(--bg-third-color);
      box-shadow: 0 10px 25px rgb(0 0 0 / 16%);

      &:nth-child(even) {
        background-color: var(--bg-third-color);
      }
    }

    &__cell {
      display: grid;
      align-items: center;
      gap: 15px;
      grid-template-columns:
        minmax(90px, 36%)
        minmax(0, 1fr);

      min-height: 48px;

      padding: 12px 14px;

      border-bottom: 1px dashed var(--border-secondary-color);

      text-align: right;

      &::before {
        color: var(--hint-primary-color);
        font-size: 12px;
        font-weight: 500;
        text-align: left;
        text-transform: uppercase;

        content: attr(data-label);
      }

      &:last-child {
        border-bottom: 0;
      }
    }

    &__date {
      justify-content: flex-end;
    }

    &__type {
      text-align: right;
    }

    &__type-name {
      white-space: normal;
    }

    &__amount {
      text-align: right;
    }

    &__pagination {
      justify-content: center;

      margin-top: 18px;
      padding: 12px 0;
    }

    &__loading,
    &__message {
      background-color: var(--bg-third-color);
    }
  }

  @media (max-width: $md7) {
    &__heading {
      padding-right: 10px;
      padding-left: 10px;
    }

    &__cell {
      gap: 10px;
      grid-template-columns:
        minmax(82px, 34%)
        minmax(0, 1fr);

      padding: 11px 12px;
    }

    &__skeleton {
      gap: 10px;
      grid-template-columns: 20% 45% 25%;
    }

    &__message {
      min-height: 220px;

      padding: 25px 15px;
    }

    &__retry {
      width: 100%;
    }
  }
}

@keyframes transaction-history-pulse {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>
