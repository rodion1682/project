<script setup>
import { computed, onMounted } from 'vue'

import { useCurrStore } from '@/stores/currencies'
import { useProfileStore } from '@/stores/profile'

import BaseButton from '@/components/ui/BaseButton.vue'

const emit = defineEmits(['top-up', 'gift-card'])

const profileStore = useProfileStore()
const currStore = useCurrStore()

const balance = computed(() => {
  const value = Number(profileStore.profile?.balance)

  return Number.isFinite(value) ? value : 0
})

const currencySymbol = computed(() => {
  return currStore.currency?.symbol || currStore.currency?.code || '€'
})

const history = computed(() => {
  if (!Array.isArray(profileStore.depositHistory)) {
    return []
  }

  return profileStore.depositHistory
})

const formatMoney = (value, symbol = currencySymbol.value) => {
  const amount = Number(value)

  return `${Number.isFinite(amount) ? amount.toFixed(2) : '0.00'} ${symbol || ''}`.trim()
}

const formatDate = (timestamp) => {
  if (!timestamp) {
    return ''
  }

  const date = new Date(Number(timestamp) * 1000)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}.${month}.${year}`
}

const getDescription = (item) => {
  const type = String(item?.type || '').toLowerCase()

  if (type.includes('gift')) {
    return 'Top up · gift card'
  }

  return 'Top up · card'
}

const getStatusClass = (status) => {
  const value = String(status || '')
    .trim()
    .toLowerCase()

  if (['completed', 'complete', 'success', 'successful', 'paid', 'approved'].includes(value)) {
    return 'success'
  }

  if (['failed', 'error', 'cancelled', 'canceled', 'declined', 'rejected'].includes(value)) {
    return 'error'
  }

  if (['pending', 'processing', 'waiting'].includes(value)) {
    return 'pending'
  }

  return 'default'
}

onMounted(async () => {
  await profileStore.getDepositHistory()
})
</script>

<template>
  <div class="balance-history">
    <section class="balance-history__balance">
      <div class="balance-history__balance-main">
        <span class="balance-history__eyebrow">
          {{ $t('My balance') }}
        </span>

        <strong class="balance-history__amount">
          {{ formatMoney(balance) }}
        </strong>
      </div>

      <div class="balance-history__actions">
        <BaseButton
          variant="dark-secondary"
          class="balance-history__top-up"
          @click="emit('top-up')"
        >
          {{ $t('Top up balance') }}
        </BaseButton>

        <button type="button" class="balance-history__gift-link" @click="emit('gift-card')">
          {{ $t('Redeem a gift card') }}
        </button>
      </div>
    </section>

    <section class="balance-history__history">
      <div class="balance-history__history-head">
        <h2 class="balance-history__title">
          {{ $t('History') }}
        </h2>
      </div>

      <div v-if="history.length" class="balance-history__table">
        <div class="balance-history__table-row balance-history__table-row_head">
          <span>{{ $t('# Nr.') }}</span>
          <span>{{ $t('Description') }}</span>
          <span>{{ $t('Status') }}</span>
          <span>{{ $t('Date') }}</span>
          <span>{{ $t('Amount') }}</span>
        </div>

        <div v-for="item in history" :key="item.id" class="balance-history__table-row">
          <span class="balance-history__number"> #{{ item.num }} </span>

          <span class="balance-history__description">
            {{ $t(getDescription(item)) }}
          </span>

          <span
            :class="[
              'balance-history__status',
              `balance-history__status_${getStatusClass(item.status)}`,
            ]"
          >
            {{ item.status ? $t(item.status) : '—' }}
          </span>

          <span class="balance-history__date">
            {{ formatDate(item.created_at) }}
          </span>

          <strong class="balance-history__sum">
            +{{ formatMoney(item.sum, item.currencyCode) }}
          </strong>
        </div>
      </div>

      <div v-if="history.length" class="balance-history__mobile-list">
        <div
          v-for="item in history"
          :key="`mobile-${item.id}`"
          class="balance-history__mobile-item"
        >
          <div class="balance-history__mobile-info">
            <strong class="balance-history__mobile-title">
              {{ $t(getDescription(item)) }}
            </strong>

            <div class="balance-history__mobile-meta">
              <span> #{{ item.num }} </span>

              <span>·</span>

              <span>
                {{ formatDate(item.created_at) }}
              </span>

              <span>·</span>

              <span
                :class="[
                  'balance-history__mobile-status',
                  `balance-history__mobile-status_${getStatusClass(item.status)}`,
                ]"
              >
                {{ item.status ? $t(item.status) : '—' }}
              </span>
            </div>
          </div>

          <strong class="balance-history__mobile-sum">
            +{{ formatMoney(item.sum, item.currencyCode) }}
          </strong>
        </div>
      </div>

      <div v-if="!history.length" class="balance-history__empty">
        {{ $t('No top ups yet.') }}
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;

.balance-history {
  width: 100%;
  min-width: 0;

  display: flex;
  flex-direction: column;

  @include adaptiveValue('gap', 24, 20);

  &__balance,
  &__history {
    width: 100%;
    min-width: 0;

    border: 2px solid var(--border-primary-color);

    background-color: var(--bg-secondary-color);

    @include adaptiveValue('border-radius', 14, 12);
  }

  &__balance {
    display: flex;
    align-items: flex-end;

    border-color: var(--hint-primary-color);

    @include adaptiveValue('gap', 50, 20);

    @include adaptiveValue('padding-top', 38, 22);
    @include adaptiveValue('padding-right', 42, 22);
    @include adaptiveValue('padding-bottom', 38, 22);
    @include adaptiveValue('padding-left', 42, 22);
  }

  &__balance-main {
    min-width: 0;

    display: flex;
    flex-direction: column;

    @include adaptiveValue('gap', 12, 10);
  }

  &__eyebrow {
    color: var(--seconday-color);

    font-size: 11px;
    line-height: 1.4;
    font-weight: 700;

    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  &__amount {
    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-weight: 900;
    line-height: 1;

    font-variant-numeric: tabular-nums;

    @include adaptiveValue('font-size', 56, 40);
  }

  &__actions {
    min-width: 0;

    margin-left: auto;

    display: flex;
    align-items: center;

    @include adaptiveValue('gap', 18, 12);
  }

  &__top-up {
    min-width: 180px;
  }

  &__gift-link {
    padding: 0;

    border: 0;
    outline: 0;

    background: transparent;

    color: var(--hint-primary-color);

    font: inherit;
    font-size: 13px;
    line-height: 1.4;

    cursor: pointer;

    transition: opacity 0.2s ease;

    @media (any-hover: hover) {
      &:hover {
        opacity: 0.7;
      }
    }
  }

  &__history {
    @include adaptiveValue('padding-top', 30, 0);
    @include adaptiveValue('padding-right', 38, 0);
    @include adaptiveValue('padding-bottom', 38, 0);
    @include adaptiveValue('padding-left', 38, 0);
  }

  &__history-head {
    display: flex;
    align-items: center;
    justify-content: space-between;

    @include adaptiveValue('margin-bottom', 20, 14);
  }

  &__title {
    margin: 0;

    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-weight: 900;
    line-height: 1.1;

    @include adaptiveValue('font-size', 26, 20);
  }

  &__table {
    width: 100%;
    min-width: 0;
  }

  &__table-row {
    display: grid;
    grid-template-columns:
      minmax(100px, 0.75fr)
      minmax(160px, 1.7fr)
      minmax(110px, 0.9fr)
      minmax(110px, 0.9fr)
      minmax(100px, 0.8fr);

    align-items: center;

    border-bottom: 2px solid var(--border-primary-color);

    @include adaptiveValue('column-gap', 24, 14);
    @include adaptiveValue('padding-top', 16, 14);
    @include adaptiveValue('padding-bottom', 16, 14);

    &_head {
      padding-top: 0;

      color: var(--seconday-color);

      font-size: 10px;
      font-weight: 700;
      line-height: 1.4;

      letter-spacing: 0.15em;
      text-transform: uppercase;

      span:last-child {
        text-align: right;
      }
    }
  }

  &__number {
    min-width: 0;

    overflow: hidden;

    color: var(--hint-primary-color);

    font-size: 13px;

    font-variant-numeric: tabular-nums;

    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__description {
    min-width: 0;

    overflow: hidden;

    color: var(--primary-color);

    font-size: 14px;
    font-weight: 500;

    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__status {
    width: fit-content;
    max-width: 100%;

    overflow: hidden;

    font-size: 12px;
    font-weight: 700;

    text-overflow: ellipsis;
    white-space: nowrap;

    &_default {
      color: var(--seconday-color);
    }

    &_pending {
      color: #d69a00;
    }

    &_success {
      color: #2ca66f;
    }

    &_error {
      color: #d94c4c;
    }
  }

  &__date {
    overflow: hidden;

    color: var(--seconday-color);

    font-size: 12px;

    font-variant-numeric: tabular-nums;

    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__sum {
    min-width: 0;

    color: var(--hint-primary-color);

    font-size: 15px;
    font-weight: 700;

    text-align: right;

    font-variant-numeric: tabular-nums;
  }

  &__mobile-list {
    display: none;
  }

  &__empty {
    color: var(--seconday-color);

    font-size: 13px;

    @include adaptiveValue('padding-top', 16, 12);
    @include adaptiveValue('padding-bottom', 16, 12);
  }

  @media (max-width: $md3) {
    &__balance {
      align-items: stretch;
      flex-direction: column;
    }

    &__actions {
      width: 100%;

      margin-left: 0;

      align-items: stretch;
      flex-direction: column;
    }

    &__top-up {
      width: 100%;
      min-width: 0;
    }

    &__gift-link {
      width: 100%;

      text-align: center;
    }
  }

  @media (max-width: $md4) {
    gap: 26px;

    &__balance {
      padding: 22px;

      border-radius: 12px;
    }

    &__amount {
      font-size: 40px;
    }

    &__history {
      padding: 0;

      border: 0;
      border-radius: 0;

      background: transparent;
    }

    &__history-head {
      margin-bottom: 8px;
    }

    &__title {
      font-family: var(--font-open-sans);
      font-size: 20px;
      font-weight: 500;
    }

    &__table {
      display: none;
    }

    &__mobile-list {
      display: flex;
      flex-direction: column;
    }

    &__mobile-item {
      width: 100%;
      min-width: 0;

      display: flex;
      align-items: center;

      border-bottom: 2px solid var(--border-primary-color);

      gap: 12px;
      padding: 14px 0;
    }

    &__mobile-info {
      flex: 1;
      min-width: 0;

      display: flex;
      flex-direction: column;

      gap: 4px;
    }

    &__mobile-title {
      overflow: hidden;

      color: var(--primary-color);

      font-size: 13px;
      font-weight: 500;
      line-height: 1.4;

      text-overflow: ellipsis;
      white-space: nowrap;
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

    &__mobile-status {
      font-weight: 700;

      &_default {
        color: var(--seconday-color);
      }

      &_pending {
        color: #d69a00;
      }

      &_success {
        color: #2ca66f;
      }

      &_error {
        color: #d94c4c;
      }
    }

    &__mobile-sum {
      flex-shrink: 0;

      color: var(--hint-primary-color);

      font-size: 14px;
      font-weight: 700;

      font-variant-numeric: tabular-nums;
    }

    &__empty {
      padding: 14px 0;
    }
  }
}
</style>
