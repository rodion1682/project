<template>
  <div class="withdrawals-history">
    <div class="withdrawals-history__heading">
      <div class="withdrawals-history__subtitle _h4">
        {{ $t('Withdrawals') }}
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="isLoading"
      class="withdrawals-history__box withdrawals-history__loading"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        v-for="item in itemsPerPage"
        :key="item"
        class="withdrawals-history__skeleton"
      >
        <span class="withdrawals-history__skeleton-line" />
        <span class="withdrawals-history__skeleton-line" />
        <span class="withdrawals-history__skeleton-line" />
      </div>
    </div>

    <!-- Error -->
    <div
      v-else-if="error"
      class="withdrawals-history__box withdrawals-history__empty"
    >
      <div class="withdrawals-history__empty-title _h3">
        {{ $t('Unable to load withdrawals') }}
      </div>

      <p class="withdrawals-history__empty-text">
        {{ error }}
      </p>

      <BaseButton
        type="button"
        variant="bordered"
        class="withdrawals-history__empty-button"
        @click="fetchWithdrawals"
      >
        {{ $t('Try again') }}
      </BaseButton>
    </div>

    <!-- Empty -->
    <div
      v-else-if="!withdrawalsList.length"
      class="withdrawals-history__box withdrawals-history__empty"
    >
      <div class="withdrawals-history__empty-title _h3">
        {{ $t('No withdrawals found') }}
      </div>

      <p class="withdrawals-history__empty-text">
        {{ $t('Your withdrawal requests will appear here.') }}
      </p>
    </div>

    <!-- Withdrawals -->
    <div v-else class="withdrawals-history__box">
      <table class="withdrawals-history__table">
        <colgroup>
          <col
            class="withdrawals-history__column withdrawals-history__column_id"
          />
          <col
            class="withdrawals-history__column withdrawals-history__column_date"
          />
          <col
            class="withdrawals-history__column withdrawals-history__column_amount"
          />
          <col
            class="withdrawals-history__column withdrawals-history__column_status"
          />
          <col
            class="withdrawals-history__column withdrawals-history__column_action"
          />
        </colgroup>

        <thead class="withdrawals-history__head">
          <tr class="withdrawals-history__row withdrawals-history__row_head">
            <th class="withdrawals-history__header">
              {{ $t('ID') }}
            </th>

            <th class="withdrawals-history__header">
              {{ $t('Date') }}
            </th>

            <th
              class="withdrawals-history__header withdrawals-history__header_amount"
            >
              {{ $t('Amount') }}
            </th>

            <th
              class="withdrawals-history__header withdrawals-history__header_status"
            >
              {{ $t('Status') }}
            </th>

            <th
              class="withdrawals-history__header withdrawals-history__header_action"
            >
              <span class="withdrawals-history__visually-hidden">
                {{ $t('Actions') }}
              </span>
            </th>
          </tr>
        </thead>

        <tbody class="withdrawals-history__body">
          <tr
            v-for="(withdrawal, index) in paginatedWithdrawals"
            :key="`${withdrawal.id}-${index}`"
            class="withdrawals-history__row"
          >
            <td
              class="withdrawals-history__cell withdrawals-history__cell_id"
              :data-label="$t('ID')"
            >
              <span class="withdrawals-history__value">
                #{{ withdrawal.id }}
              </span>
            </td>

            <td
              class="withdrawals-history__cell withdrawals-history__cell_date"
              :data-label="$t('Date')"
            >
              <div class="withdrawals-history__date">
                <span class="withdrawals-history__date-day">
                  {{ formatDate(withdrawal.created_at, 'DD.MM.YYYY') }}
                </span>

                <span class="withdrawals-history__date-time">
                  {{ formatDate(withdrawal.created_at, 'HH:mm') }}
                </span>
              </div>
            </td>

            <td
              class="withdrawals-history__cell withdrawals-history__cell_amount"
              :data-label="$t('Amount')"
            >
              <PriceFormatter
                :price="getWithdrawalAmount(withdrawal)"
                class="withdrawals-history__price"
              />
            </td>

            <td
              class="withdrawals-history__cell withdrawals-history__cell_status"
              :data-label="$t('Status')"
            >
              <span
                class="withdrawals-history__status"
                :class="statusClass(withdrawal.status)"
              >
                {{ formatStatus(withdrawal.status) }}
              </span>
            </td>

            <td
              class="withdrawals-history__cell withdrawals-history__cell_action"
              :data-label="$t('Actions')"
            >
              <BaseButton
                v-if="canCancelWithdrawal(withdrawal)"
                type="button"
                variant="bordered"
                class="withdrawals-history__action-button"
                :disabled="isWithdrawalCanceling(withdrawal.id)"
                @click="cancelWithdrawal(withdrawal.id)"
              >
                <span
                  v-if="isWithdrawalCanceling(withdrawal.id)"
                  class="withdrawals-history__button-loader"
                  aria-hidden="true"
                />

                <template v-else>
                  {{ $t('Cancel') }}
                </template>
              </BaseButton>

              <BaseButton
                v-else-if="canOpenDetails(withdrawal)"
                type="button"
                variant="bordered"
                class="withdrawals-history__action-button"
                @click="openWithdrawalDetails(withdrawal)"
              >
                {{ $t('Details') }}
              </BaseButton>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="withdrawals-history__pagination">
        <PaginationComponent
          v-model:current-page="currentPage"
          :total-pages="totalPages"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'
import { useToast } from '@/composables/useToast'
import { useModalStore } from '@/stores/modal'
import { useOfferFlowStore } from '@/stores/offerFlow'
import { useUserStore } from '@/stores/user'
import { formatDate } from '@/utils/formatters'

const offerFlowStore = useOfferFlowStore()
const modalStore = useModalStore()
const userStore = useUserStore()
const toast = useToast()

const isLoading = ref(false)
const error = ref('')
const currentPage = ref(1)
const cancelingWithdrawalId = ref(null)

const itemsPerPage = 8

const withdrawalsList = computed(() => {
  const withdrawals = offerFlowStore.getWithdrawals

  return Array.isArray(withdrawals) ? withdrawals : []
})

const sortedWithdrawals = computed(() => {
  return [...withdrawalsList.value].sort(
    (firstWithdrawal, secondWithdrawal) => {
      return (
        getTimestamp(secondWithdrawal.created_at) -
        getTimestamp(firstWithdrawal.created_at)
      )
    },
  )
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(sortedWithdrawals.value.length / itemsPerPage))
})

const paginatedWithdrawals = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage

  const endIndex = startIndex + itemsPerPage

  return sortedWithdrawals.value.slice(startIndex, endIndex)
})

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

const getWithdrawalAmount = withdrawal => {
  const amount =
    withdrawal?.amount ??
    withdrawal?.sum ??
    withdrawal?.total ??
    withdrawal?.sale_price ??
    0

  const normalizedAmount = Number(amount)

  return Number.isFinite(normalizedAmount) ? normalizedAmount : 0
}

const normalizeStatus = status => {
  return String(status ?? '')
    .trim()
    .toLowerCase()
    .replaceAll(' ', '_')
    .replaceAll('-', '_')
}

const formatStatus = status => {
  const normalizedStatus = normalizeStatus(status)

  if (!normalizedStatus) {
    return '—'
  }

  return normalizedStatus
    .split('_')
    .filter(Boolean)
    .map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

const statusClass = status => {
  const normalizedStatus = normalizeStatus(status)

  if (
    [
      'approved',
      'accepted',
      'completed',
      'success',
      'successful',
      'paid',
      'withdrawn',
    ].includes(normalizedStatus)
  ) {
    return 'withdrawals-history__status_success'
  }

  if (
    ['pending', 'offer', 'processing', 'in_process', 'created'].includes(
      normalizedStatus,
    )
  ) {
    return 'withdrawals-history__status_pending'
  }

  if (
    [
      'error',
      'failed',
      'rejected',
      'declined',
      'cancelled',
      'canceled',
      'expired',
    ].includes(normalizedStatus)
  ) {
    return 'withdrawals-history__status_error'
  }

  return 'withdrawals-history__status_default'
}

const canCancelWithdrawal = withdrawal => {
  return normalizeStatus(withdrawal?.status) === 'pending'
}

const canOpenDetails = withdrawal => {
  return normalizeStatus(withdrawal?.status) === 'approved'
}

const isWithdrawalCanceling = withdrawalId => {
  return String(cancelingWithdrawalId.value) === String(withdrawalId)
}

const fetchWithdrawals = async () => {
  isLoading.value = true
  error.value = ''

  try {
    await offerFlowStore.fetchWithdrawals()
  } catch (requestError) {
    console.error('Failed to fetch withdrawals:', requestError)

    error.value =
      requestError?.response?.data?.message ||
      requestError?.message ||
      'Failed to load withdrawals'
  } finally {
    isLoading.value = false
  }
}

const cancelWithdrawal = async withdrawalId => {
  if (!withdrawalId || cancelingWithdrawalId.value !== null) {
    return
  }

  cancelingWithdrawalId.value = withdrawalId

  try {
    const response = await offerFlowStore.cancelWithdraw(withdrawalId)

    if (!response) {
      throw new Error('Failed to cancel withdrawal')
    }

    toast.success('Withdrawal canceled successfully')

    await Promise.all([
      offerFlowStore.fetchWithdrawals(),
      userStore.fetchProfile(),
    ])
  } catch (requestError) {
    console.error('Failed to cancel withdrawal:', requestError)

    toast.error(
      requestError?.response?.data?.message ||
        requestError?.message ||
        'Failed to cancel withdrawal',
    )
  } finally {
    cancelingWithdrawalId.value = null
  }
}

const openWithdrawalDetails = withdrawal => {
  if (!withdrawal) {
    return
  }

  offerFlowStore.setSelectedOffer(withdrawal)

  modalStore.open('offerDetails', {
    withdrawal,
    type: 'withdrawal',
  })
}

watch(totalPages, pages => {
  if (currentPage.value > pages) {
    currentPage.value = pages
  }
})

watch(withdrawalsList, () => {
  if (currentPage.value < 1) {
    currentPage.value = 1
  }
})

onMounted(() => {
  fetchWithdrawals()
})
</script>

<style lang="scss" scoped>
.withdrawals-history {
  width: 100%;
  min-width: 0;

  &__heading {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 18, 14);
    }
  }

  &__subtitle {
    color: var(--hint-primary-color);
    font-weight: 400;
  }

  &__box {
    overflow: hidden;

    width: 100%;
    min-width: 0;

    border-radius: 5px;
    background-color: var(--bg-fifth-color);
    box-shadow: 0 16px 36px rgb(0 0 0 / 16%);
  }

  &__table {
    width: 100%;

    border-collapse: collapse;

    border-spacing: 0;
    table-layout: fixed;
  }

  &__column {
    &_id {
      width: 11%;
    }

    &_date {
      width: 24%;
    }

    &_amount {
      width: 24%;
    }

    &_status {
      width: 21%;
    }

    &_action {
      width: 20%;
    }
  }

  &__row {
    border-bottom: 1px dashed var(--border-secondary-color);

    &:last-child {
      border-bottom: 0;
    }

    &_head {
      background-color: rgb(0 0 0 / 9%);

      border-bottom-style: solid;
    }
  }

  &__header {
    @include adaptiveValue('padding-top', 20, 14);
    @include adaptiveValue('padding-bottom', 20, 14);
    @include adaptiveValue('padding-left', 18, 10);
    @include adaptiveValue('padding-right', 18, 10);

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 500;
    line-height: 130%;
    text-align: left;

    &_amount,
    &_status {
      text-align: center;
    }

    &_action {
      text-align: right;
    }
  }

  &__cell {
    @include adaptiveValue('padding-top', 20, 14);
    @include adaptiveValue('padding-bottom', 20, 14);
    @include adaptiveValue('padding-left', 18, 10);
    @include adaptiveValue('padding-right', 18, 10);

    min-width: 0;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 400;
    line-height: 140%;
    text-align: left;

    vertical-align: middle;

    &_amount,
    &_status {
      text-align: center;
    }

    &_action {
      text-align: right;
    }
  }

  &__value {
    white-space: nowrap;
  }

  &__date {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  &__date-day {
    white-space: nowrap;
  }

  &__date-time {
    opacity: 0.55;

    font-size: 12px;
  }

  &__price {
    display: inline-flex;
    justify-content: center;

    color: var(--primary-color);

    :deep(*) {
      max-width: 100%;
    }

    :deep(.price-formatter__text) {
      font-size: 14px;
    }
  }

  /*
   * Matches the Order History status appearance:
   * plain colored text without an icon, border or background.
   */
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

  &__action-button {
    display: inline-flex;

    min-width: 90px;
    min-height: 34px;

    font-family: var(--font-inter);
    font-size: 12px;
  }

  &__no-action {
    opacity: 0.35;
  }

  &__button-loader {
    width: 16px;
    height: 16px;

    border: 2px solid currentColor;
    border-radius: 50%;

    animation: withdrawals-history-spin 0.7s linear infinite;

    border-top-color: transparent;
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
    grid-template-columns: 15% 55% 25%;

    min-height: 64px;

    padding: 12px;

    border-bottom: 1px dashed var(--border-secondary-color);

    &:last-child {
      border-bottom: 0;
    }
  }

  &__skeleton-line {
    height: 13px;

    border-radius: 4px;
    background: linear-gradient(
      90deg,
      var(--bg-secondary-color) 25%,
      var(--border-fourth-color) 50%,
      var(--bg-secondary-color) 75%
    );
    background-size: 200% 100%;

    animation: withdrawals-history-skeleton 1.4s linear infinite;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    min-height: 280px;

    padding: 30px;

    text-align: center;
  }

  &__empty-title {
    color: var(--primary-color);

    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }

  &__empty-text {
    max-width: 440px;

    color: var(--secondary-color);
    font-size: 14px;
    line-height: 150%;

    &:not(:last-child) {
      margin-bottom: 22px;
    }
  }

  &__empty-button {
    width: min(100%, 180px);
  }

  &__visually-hidden {
    position: absolute;

    overflow: hidden;

    width: 1px;
    height: 1px;

    margin: -1px;
    padding: 0;

    border: 0;

    white-space: nowrap;

    clip: rect(0 0 0 0);
    clip-path: inset(50%);
  }

  @media (max-width: $md3) {
    &__header,
    &__cell {
      padding-right: 8px;
      padding-left: 8px;
    }
  }

  /*
   * Responsive card rows without horizontal overflow.
   */
  @media (max-width: $md4) {
    &__box {
      overflow: visible;

      background-color: transparent;
      box-shadow: none;
    }

    &__table,
    &__body {
      display: block;

      width: 100%;
    }

    &__head,
    &__table colgroup {
      display: none;
    }

    &__row {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));

      margin-bottom: 12px;

      border: 1px solid var(--border-secondary-color);
      border-radius: 5px;
      background-color: var(--bg-fifth-color);
      box-shadow: 0 12px 26px rgb(0 0 0 / 16%);

      &:last-child {
        margin-bottom: 0;
      }
    }

    &__cell {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 15px;

      padding: 13px 15px;

      border-bottom: 1px dashed var(--border-secondary-color);

      text-align: right;

      &::before {
        flex: 0 0 auto;

        color: var(--hint-primary-color);
        font-size: 11px;
        font-weight: 500;
        text-align: left;

        content: attr(data-label);
      }

      &_amount,
      &_status {
        text-align: right;
      }

      &_action {
        grid-column: 1 / -1;

        border-bottom: 0;
      }
    }

    &__date {
      align-items: flex-end;
    }

    &__price {
      justify-content: flex-end;
    }

    &__pagination {
      justify-content: center;

      padding-right: 0;
      padding-left: 0;
    }
  }

  @media (max-width: $md6) {
    &__row {
      grid-template-columns: 1fr;
    }

    &__cell,
    &__cell_action {
      grid-column: auto;
    }

    &__action-button {
      width: min(100%, 140px);
    }

    &__skeleton {
      grid-template-columns: 1fr;
    }
  }
}

@keyframes withdrawals-history-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes withdrawals-history-skeleton {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>
