<template>
  <div class="offers-history">
    <div class="offers-history__heading">
      <div class="offers-history__subtitle _h4">
        {{ $t('My Offers') }}
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="isLoading"
      class="offers-history__box offers-history__loading"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        v-for="item in itemsPerPage"
        :key="item"
        class="offers-history__skeleton"
      >
        <span class="offers-history__skeleton-line" />
        <span class="offers-history__skeleton-line" />
        <span class="offers-history__skeleton-line" />
      </div>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="offers-history__box offers-history__empty">
      <div class="offers-history__empty-title _h3">
        {{ $t('Unable to load offers') }}
      </div>

      <p class="offers-history__empty-text">
        {{ error }}
      </p>

      <BaseButton
        type="button"
        variant="bordered"
        class="offers-history__empty-button"
        @click="fetchOffers"
      >
        {{ $t('Try again') }}
      </BaseButton>
    </div>

    <!-- Empty -->
    <div
      v-else-if="!offersList.length"
      class="offers-history__box offers-history__empty"
    >
      <div class="offers-history__empty-title _h3">
        {{ $t('No offers found') }}
      </div>

      <p class="offers-history__empty-text">
        {{ $t('Offers created for your cards will appear here.') }}
      </p>
    </div>

    <!-- Offers table -->
    <div v-else class="offers-history__box">
      <table class="offers-history__table">
        <colgroup>
          <col class="offers-history__column offers-history__column_id" />
          <col class="offers-history__column offers-history__column_date" />
          <col class="offers-history__column offers-history__column_item" />
          <col class="offers-history__column offers-history__column_amount" />
          <col class="offers-history__column offers-history__column_status" />
          <col class="offers-history__column offers-history__column_action" />
        </colgroup>

        <thead class="offers-history__head">
          <tr class="offers-history__row offers-history__row_head">
            <th class="offers-history__header">
              {{ $t('ID') }}
            </th>

            <th class="offers-history__header">
              {{ $t('Date') }}
            </th>

            <th class="offers-history__header">
              {{ $t('Item') }}
            </th>

            <th class="offers-history__header offers-history__header_amount">
              {{ $t('Amount') }}
            </th>

            <th class="offers-history__header offers-history__header_status">
              {{ $t('Status') }}
            </th>

            <th class="offers-history__header offers-history__header_action">
              <span class="offers-history__visually-hidden">
                {{ $t('Actions') }}
              </span>
            </th>
          </tr>
        </thead>

        <tbody class="offers-history__body">
          <tr
            v-for="(offer, index) in paginatedOffers"
            :key="`${offer.id}-${index}`"
            class="offers-history__row"
          >
            <td
              class="offers-history__cell offers-history__cell_id"
              :data-label="$t('ID')"
            >
              <span class="offers-history__value"> #{{ offer.id }} </span>
            </td>

            <td
              class="offers-history__cell offers-history__cell_date"
              :data-label="$t('Date')"
            >
              <div class="offers-history__date">
                <span class="offers-history__date-day">
                  {{ formatDate(offer.created_at, 'DD.MM.YYYY') }}
                </span>

                <span class="offers-history__date-time">
                  {{ formatDate(offer.created_at, 'HH:mm') }}
                </span>
              </div>
            </td>

            <td
              class="offers-history__cell offers-history__cell_item"
              :data-label="$t('Item')"
            >
              <div class="offers-history__item">
                <div
                  v-if="getOfferImage(offer)"
                  class="offers-history__item-image"
                >
                  <img
                    :src="getOfferImage(offer)"
                    :alt="getOfferName(offer)"
                    loading="lazy"
                  />
                </div>

                <div class="offers-history__item-info">
                  <span class="offers-history__item-title">
                    {{ getOfferName(offer) }}
                  </span>

                  <span
                    v-if="getOfferMeta(offer)"
                    class="offers-history__item-meta"
                  >
                    {{ getOfferMeta(offer) }}
                  </span>
                </div>
              </div>
            </td>

            <td
              class="offers-history__cell offers-history__cell_amount"
              :data-label="$t('Amount')"
            >
              <PriceFormatter
                :price="getOfferPrice(offer)"
                class="offers-history__price"
              />
            </td>

            <td
              class="offers-history__cell offers-history__cell_status"
              :data-label="$t('Status')"
            >
              <span
                class="offers-history__status"
                :class="statusClass(offer.status)"
              >
                {{ formatStatus(offer.status) }}
              </span>
            </td>

            <td
              class="offers-history__cell offers-history__cell_action"
              :data-label="$t('Actions')"
            >
              <BaseButton
                v-if="canCancelOffer(offer)"
                type="button"
                variant="bordered"
                class="offers-history__cancel"
                :disabled="isOfferCanceling(offer.id)"
                @click="cancelOffer(offer.id)"
              >
                <span
                  v-if="isOfferCanceling(offer.id)"
                  class="offers-history__button-loader"
                  aria-hidden="true"
                />

                <template v-else>
                  {{ $t('Cancel') }}
                </template>
              </BaseButton>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="totalPages > 1" class="offers-history__pagination">
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
import { useOfferFlowStore } from '@/stores/offerFlow'
import { formatDate } from '@/utils/formatters'

const STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN || ''

const offerFlowStore = useOfferFlowStore()
const toast = useToast()

const isLoading = ref(false)
const error = ref('')
const currentPage = ref(1)
const cancelingOfferId = ref(null)

const itemsPerPage = 8

const offersList = computed(() => {
  const offers = offerFlowStore.getOffers

  return Array.isArray(offers) ? offers : []
})

const sortedOffers = computed(() => {
  return [...offersList.value].sort((firstOffer, secondOffer) => {
    return (
      getTimestamp(secondOffer.created_at) - getTimestamp(firstOffer.created_at)
    )
  })
})

const totalPages = computed(() => {
  return Math.max(1, Math.ceil(sortedOffers.value.length / itemsPerPage))
})

const paginatedOffers = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  return sortedOffers.value.slice(startIndex, endIndex)
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

const resolveImageUrl = image => {
  if (!image) {
    return ''
  }

  if (
    image.startsWith('http://') ||
    image.startsWith('https://') ||
    image.startsWith('data:') ||
    image.startsWith('blob:')
  ) {
    return image
  }

  if (!STATIC_DOMAIN) {
    return image
  }

  const domain = STATIC_DOMAIN.replace(/\/$/, '')
  const path = image.startsWith('/') ? image : `/${image}`

  return `${domain}${path}`
}

const getOfferImage = offer => {
  const image =
    offer?.card?.image ??
    offer?.item?.image ??
    offer?.item?.img ??
    offer?.image ??
    offer?.img_url ??
    ''

  return resolveImageUrl(image)
}

const getOfferName = offer => {
  return (
    offer?.card_name ??
    offer?.card?.name ??
    offer?.item?.name ??
    offer?.item?.title ??
    offer?.title ??
    'Unknown Card'
  )
}

const getOfferMeta = offer => {
  const card = offer?.card ?? offer?.item ?? {}

  return [
    card?.rarity ?? offer?.rarity,
    card?.type ?? offer?.card_type ?? offer?.item_type,
  ]
    .filter(Boolean)
    .map(formatValue)
    .join(' · ')
}

const getOfferPrice = offer => {
  const price = offer?.sale_price ?? offer?.price ?? offer?.amount ?? 0

  const number = Number(price)

  return Number.isFinite(number) ? number : 0
}

const normalizeStatus = status => {
  return String(status || '')
    .trim()
    .toLowerCase()
    .replaceAll(' ', '_')
    .replaceAll('-', '_')
}

const formatStatus = status => {
  const normalized = normalizeStatus(status)

  if (!normalized) {
    return '—'
  }

  return normalized
    .split('_')
    .filter(Boolean)
    .map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

const formatValue = value => {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  return String(value)
    .replaceAll('_', ' ')
    .split(' ')
    .filter(Boolean)
    .map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

const statusClass = status => {
  const normalized = normalizeStatus(status)

  if (
    [
      'approved',
      'accepted',
      'completed',
      'success',
      'successful',
      'sold',
      'paid',
    ].includes(normalized)
  ) {
    return 'offers-history__status_success'
  }

  if (
    ['pending', 'offer', 'processing', 'in_process', 'created'].includes(
      normalized,
    )
  ) {
    return 'offers-history__status_pending'
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
    ].includes(normalized)
  ) {
    return 'offers-history__status_error'
  }

  return 'offers-history__status_default'
}

const canCancelOffer = offer => {
  return normalizeStatus(offer?.status) === 'pending'
}

const isOfferCanceling = offerId => {
  return String(cancelingOfferId.value) === String(offerId)
}

const fetchOffers = async () => {
  isLoading.value = true
  error.value = ''

  try {
    await offerFlowStore.fetchOffers()
  } catch (requestError) {
    console.error('Failed to fetch offers:', requestError)

    error.value =
      requestError?.response?.data?.message ||
      requestError?.message ||
      'Failed to load offers'
  } finally {
    isLoading.value = false
  }
}

const cancelOffer = async offerId => {
  if (!offerId || cancelingOfferId.value !== null) {
    return
  }

  cancelingOfferId.value = offerId

  try {
    const response = await offerFlowStore.cancelOffer(offerId)

    if (!response) {
      throw new Error('Failed to cancel offer')
    }

    toast.success('Offer canceled successfully')

    await fetchOffers()
  } catch (requestError) {
    console.error('Failed to cancel offer:', requestError)

    toast.error(
      requestError?.response?.data?.message ||
        requestError?.message ||
        'Failed to cancel offer',
    )
  } finally {
    cancelingOfferId.value = null
  }
}

watch(totalPages, pages => {
  if (currentPage.value > pages) {
    currentPage.value = pages
  }
})

watch(offersList, () => {
  if (currentPage.value < 1) {
    currentPage.value = 1
  }
})

onMounted(() => {
  fetchOffers()
})
</script>

<style lang="scss" scoped>
.offers-history {
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
      width: 8%;
    }

    &_date {
      width: 16%;
    }

    &_item {
      width: 27%;
    }

    &_amount {
      width: 18%;
    }

    &_status {
      width: 17%;
    }

    &_action {
      width: 14%;
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
    color: var(--secondary-color);
    white-space: nowrap;
  }

  &__date {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  &__date-day {
    color: var(--secondary-color);
    white-space: nowrap;
  }

  &__date-time {
    opacity: 0.55;

    font-size: 12px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 12px;

    min-width: 0;
  }

  &__item-image {
    overflow: hidden;
    flex: 0 0 42px;

    width: 42px;
    height: 52px;

    img {
      width: 100%;
      height: 100%;

      object-fit: contain;
    }
  }

  &__item-info {
    display: flex;
    overflow: hidden;
    flex-direction: column;
    gap: 4px;

    min-width: 0;
  }

  &__item-title {
    overflow: hidden;

    color: var(--secondary-color);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__item-meta {
    overflow: hidden;

    opacity: 0.55;

    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__price {
    display: inline-flex;
    justify-content: center;

    :deep(.price-formatter__text) {
      font-size: 14px;
    }
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

  &__cancel {
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

    animation: offers-history-spin 0.7s linear infinite;

    border-top-color: transparent;
  }

  &__pagination {
    display: flex;
    justify-content: flex-end;

    padding: 24px 18px;
  }

  &__loading {
    padding: 18px;
  }

  &__skeleton {
    display: grid;
    gap: 24px;
    grid-template-columns: 15% minmax(0, 1fr) 25%;

    padding: 18px 0;

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

    animation: offers-history-skeleton 1.4s linear infinite;
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
    &__column {
      &_id {
        width: 8%;
      }

      &_date {
        width: 17%;
      }

      &_item {
        width: 25%;
      }

      &_amount {
        width: 18%;
      }

      &_status {
        width: 18%;
      }

      &_action {
        width: 14%;
      }
    }

    &__header,
    &__cell {
      padding-right: 8px;
      padding-left: 8px;
    }

    &__status {
      min-width: 0;
    }
  }

  /*
   * Convert every row into a responsive card.
   * No horizontal overflow is required.
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
      gap: 0;
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

      &_item {
        grid-column: 1 / -1;

        .offers-history__item {
          justify-content: flex-end;
        }
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

    &__item-info {
      text-align: right;
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
    &__cell_item,
    &__cell_action {
      grid-column: auto;
    }

    &__cell_item {
      .offers-history__item {
        max-width: 65%;
      }
    }

    &__cancel {
      width: min(100%, 140px);
    }

    &__skeleton {
      grid-template-columns: 1fr;
    }
  }
}

@keyframes offers-history-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes offers-history-skeleton {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>
