<template>
  <BaseModal
    :show="props.show"
    class="offer-details-modal"
    content-class="offer-details-modal__content"
    size="product"
    :labelledby="titleId"
    @close="handleClose"
    @update:show="handleShowUpdate"
  >
    <!-- Loading state -->
    <div v-if="isLoading" class="offer-details offer-details_loading">
      <LoadingSpinner class="offer-details__loader" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="offer-details offer-details_error">
      <div class="offer-details__state">
        <h2 class="offer-details__state-title _h3">
          {{ $t('Unable to load offer') }}
        </h2>

        <p class="offer-details__state-message">
          {{ error }}
        </p>

        <BaseButton
          type="button"
          variant="bordered"
          class="offer-details__state-button"
          @click="handleClose"
        >
          {{ $t('Close') }}
        </BaseButton>
      </div>
    </div>

    <!-- Offer information -->
    <div
      v-else-if="offer"
      class="offer-details"
      :class="{
        'offer-details_with-preview': offerImage,
      }"
    >
      <!-- Item preview -->
      <div v-if="offerImage" class="offer-details__preview">
        <div class="offer-details__image-wrapper">
          <img
            :src="offerImage"
            :alt="offerTitle"
            class="offer-details__image"
            @error="handleImageError"
          />
        </div>
      </div>

      <!-- Offer content -->
      <div class="offer-details__information">
        <div class="offer-details__heading">
          <div class="offer-details__eyebrow">
            {{ $t('Offer details') }}
          </div>

          <h2 :id="titleId" class="offer-details__title _h3">
            {{ offerTitle }}
          </h2>
        </div>

        <!-- General information -->
        <div class="offer-details__attributes">
          <div v-if="offerIdentifier" class="offer-details__attribute">
            <span class="offer-details__attribute-label">
              {{ $t('Offer ID') }}:
            </span>

            <span class="offer-details__attribute-value">
              {{ offerIdentifier }}
            </span>
          </div>

          <div class="offer-details__attribute">
            <span class="offer-details__attribute-label">
              {{ $t('Quality') }}:
            </span>

            <span class="offer-details__attribute-value">
              {{ offerQuality }}
            </span>
          </div>

          <div class="offer-details__attribute">
            <span class="offer-details__attribute-label">
              {{ $t('Status') }}:
            </span>

            <span
              class="offer-details__status"
              :class="`offer-details__status_${statusTone}`"
            >
              {{ formattedStatus }}
            </span>
          </div>

          <div v-if="offerDate" class="offer-details__attribute">
            <span class="offer-details__attribute-label">
              {{ $t('Created') }}:
            </span>

            <span class="offer-details__attribute-value">
              {{ offerDate }}
            </span>
          </div>

          <div v-if="offerQuantity" class="offer-details__attribute">
            <span class="offer-details__attribute-label">
              {{ $t('Quantity') }}:
            </span>

            <span class="offer-details__attribute-value">
              {{ offerQuantity }}
            </span>
          </div>
        </div>

        <div class="offer-details__divider" />

        <!-- Price information -->
        <div class="offer-details__prices">
          <div v-if="formattedUserPrice" class="offer-details__price">
            <span class="offer-details__price-label">
              {{ $t('Your desired price') }}
            </span>

            <strong class="offer-details__price-value">
              {{ formattedUserPrice }}
            </strong>
          </div>

          <div
            v-if="hasCounterOffer"
            class="offer-details__price offer-details__price_counter"
          >
            <span class="offer-details__price-label">
              {{ $t('Our offer') }}
            </span>

            <strong class="offer-details__price-value">
              {{ formattedServicePrice }}
            </strong>
          </div>
        </div>

        <div v-if="hasCounterOffer && canRespond" class="offer-details__notice">
          <p>
            {{
              $t(
                'The service has proposed a different price. You can accept or decline this offer.',
              )
            }}
          </p>
        </div>

        <div
          v-else-if="hasCounterOffer"
          class="offer-details__notice offer-details__notice_muted"
        >
          <p>
            {{ getStatusDescription(normalizedStatus) }}
          </p>
        </div>

        <div class="offer-details__actions">
          <template v-if="canRespond">
            <BaseButton
              type="button"
              variant="bordered"
              class="offer-details__action offer-details__action_decline"
              :disabled="isSubmitting"
              @click="handleOfferDecline"
            >
              <span
                v-if="submittingAction === 'decline'"
                class="offer-details__button-loader"
                aria-hidden="true"
              />

              <template v-else>
                {{ $t('Decline') }}
              </template>
            </BaseButton>

            <BaseButton
              type="button"
              variant="primary"
              class="offer-details__action offer-details__action_accept"
              :disabled="isSubmitting"
              @click="handleOfferAccept"
            >
              <span
                v-if="submittingAction === 'accept'"
                class="offer-details__button-loader"
                aria-hidden="true"
              />

              <template v-else>
                {{ $t('Accept offer') }}
              </template>
            </BaseButton>
          </template>

          <BaseButton
            v-else
            type="button"
            variant="bordered"
            class="offer-details__action offer-details__action_close"
            @click="handleClose"
          >
            {{ $t('Close') }}
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Offer not found -->
    <div v-else class="offer-details offer-details_empty">
      <div class="offer-details__state">
        <h2 class="offer-details__state-title _h3">
          {{ $t('Offer details not found') }}
        </h2>

        <p class="offer-details__state-message">
          {{ $t('The selected offer is no longer available.') }}
        </p>

        <BaseButton
          type="button"
          variant="bordered"
          class="offer-details__state-button"
          @click="handleClose"
        >
          {{ $t('Close') }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import { useToast } from '@/composables/useToast'
import { useOfferFlowStore } from '@/stores/offerFlow'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },

  /*
   * Supports:
   *
   * modalStore.open('offerDetails', {
   *   offer: withdrawal,
   * })
   *
   * and:
   *
   * modalStore.open('offerDetails', {
   *   withdrawal,
   * })
   */
  modalData: {
    type: Object,
    default: null,
  },

  /*
   * You can also pass an offer directly:
   *
   * <OfferDetailsModal :offer-data="selectedOffer" />
   */
  offerData: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits([
  'close',
  'update:show',
  'accepted',
  'declined',
  'updated',
])

const toast = useToast()
const offerFlowStore = useOfferFlowStore()

const error = ref('')
const isSubmitting = ref(false)
const submittingAction = ref('')
const imageFailed = ref(false)

const selectedStoreOffer = computed(() => {
  const value =
    offerFlowStore.selectedOffer ??
    offerFlowStore.currentOffer ??
    offerFlowStore.offer

  return typeof value === 'function' ? value() : value
})

const offer = computed(() => {
  return (
    props.offerData ||
    props.modalData?.offer ||
    props.modalData?.withdrawal ||
    props.modalData?.data ||
    selectedStoreOffer.value ||
    null
  )
})

const isLoading = computed(() => {
  const storeLoading =
    offerFlowStore.isLoading ??
    offerFlowStore.loading ??
    offerFlowStore.isFetching

  return Boolean(storeLoading) && !offer.value
})

const titleId = computed(() => {
  const id = offer.value?.id ?? offer.value?.offer_id

  return id ? `offer-details-title-${id}` : 'offer-details-title'
})

const offerTitle = computed(() => {
  return (
    offer.value?.title ||
    offer.value?.name ||
    offer.value?.skin_name ||
    offer.value?.item?.title ||
    offer.value?.item?.name ||
    offer.value?.product?.title ||
    offer.value?.product?.name ||
    offer.value?.card?.name ||
    'Offer'
  )
})

const offerQuality = computed(() => {
  return formatText(
    offer.value?.quality ||
      offer.value?.item_quality ||
      offer.value?.item?.quality ||
      offer.value?.product?.quality ||
      offer.value?.card?.rarity,
  )
})

const offerIdentifier = computed(() => {
  return (
    offer.value?.offer_id ||
    offer.value?.id ||
    offer.value?.uuid ||
    offer.value?.instance_uuid ||
    ''
  )
})

const offerQuantity = computed(() => {
  const quantity =
    offer.value?.quantity ??
    offer.value?.amount ??
    offer.value?.item?.quantity ??
    null

  return quantity === null || quantity === undefined ? '' : quantity
})

const rawImage = computed(() => {
  return (
    offer.value?.image ||
    offer.value?.img_url ||
    offer.value?.image_url ||
    offer.value?.item?.image ||
    offer.value?.item?.img_url ||
    offer.value?.product?.image ||
    offer.value?.product?.img_url ||
    offer.value?.card?.image ||
    ''
  )
})

const offerImage = computed(() => {
  if (imageFailed.value) {
    return ''
  }

  const image = rawImage.value

  if (!image) {
    return ''
  }

  if (
    image.startsWith('http://') ||
    image.startsWith('https://') ||
    image.startsWith('data:')
  ) {
    return image
  }

  const staticDomain = import.meta.env.VITE_STATIC_DOMAIN || ''

  return `${staticDomain}${image}`
})

const normalizedStatus = computed(() => {
  return String(offer.value?.status || '')
    .trim()
    .toLowerCase()
    .replaceAll(' ', '_')
})

const formattedStatus = computed(() => {
  return formatText(normalizedStatus.value || 'pending')
})

const hasCounterOffer = computed(() => {
  const servicePrice = offer.value?.service_price

  return (
    servicePrice !== null && servicePrice !== undefined && servicePrice !== ''
  )
})

const canRespond = computed(() => {
  return (
    hasCounterOffer.value &&
    ['offer', 'counter_offer', 'counteroffer'].includes(normalizedStatus.value)
  )
})

const statusTone = computed(() => {
  const status = normalizedStatus.value

  if (
    [
      'accepted',
      'completed',
      'success',
      'successful',
      'paid',
      'approved',
    ].includes(status)
  ) {
    return 'success'
  }

  if (
    [
      'declined',
      'rejected',
      'failed',
      'error',
      'cancelled',
      'canceled',
    ].includes(status)
  ) {
    return 'error'
  }

  if (
    [
      'offer',
      'counter_offer',
      'counteroffer',
      'pending',
      'processing',
    ].includes(status)
  ) {
    return 'pending'
  }

  return 'default'
})

const currencyCode = computed(() => {
  const currency =
    offer.value?.currency?.code ||
    offer.value?.currency_code ||
    offer.value?.currency

  if (typeof currency === 'string' && /^[A-Za-z]{3}$/.test(currency.trim())) {
    return currency.trim().toUpperCase()
  }

  return 'EUR'
})

const formattedUserPrice = computed(() => {
  return formatMoney(offer.value?.user_price ?? offer.value?.price)
})

const formattedServicePrice = computed(() => {
  return formatMoney(offer.value?.service_price)
})

const offerDate = computed(() => {
  const value =
    offer.value?.created_at ||
    offer.value?.createdAt ||
    offer.value?.date ||
    offer.value?.updated_at

  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
})

function formatText(value) {
  if (value === null || value === undefined || value === '') {
    return '—'
  }

  const text = String(value).replaceAll('_', ' ').trim()

  return text.charAt(0).toUpperCase() + text.slice(1)
}

function formatMoney(value) {
  const amount = Number(value)

  if (!Number.isFinite(amount)) {
    return '—'
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode.value,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currencyCode.value}`
  }
}

function getStatusDescription(status) {
  const descriptions = {
    accepted: 'This offer has been accepted.',
    completed: 'This offer has been completed.',
    declined: 'This offer has been declined.',
    rejected: 'This offer has been rejected.',
    cancelled: 'This offer has been cancelled.',
    canceled: 'This offer has been cancelled.',
    pending: 'This offer is currently being reviewed.',
    processing: 'This offer is currently being processed.',
  }

  return descriptions[status] || 'No further action is required for this offer.'
}

function handleImageError() {
  imageFailed.value = true
}

async function refreshOffers() {
  const refreshMethod =
    offerFlowStore.fetchOffers ||
    offerFlowStore.fetchUserOffers ||
    offerFlowStore.fetchWithdrawals

  if (typeof refreshMethod === 'function') {
    await refreshMethod.call(offerFlowStore)
  }
}

async function acceptCurrentOffer() {
  const action =
    offerFlowStore.acceptOffer ||
    offerFlowStore.acceptCounterOffer ||
    offerFlowStore.approveOffer

  if (typeof action !== 'function') {
    throw new Error('Accept offer action is not configured in offerFlow store')
  }

  return action.call(offerFlowStore, offer.value)
}

async function declineCurrentOffer() {
  const action =
    offerFlowStore.declineOffer ||
    offerFlowStore.declineCounterOffer ||
    offerFlowStore.rejectOffer ||
    offerFlowStore.cancelOffer

  if (typeof action !== 'function') {
    throw new Error('Decline offer action is not configured in offerFlow store')
  }

  return action.call(offerFlowStore, offer.value)
}

async function handleOfferAccept() {
  if (isSubmitting.value || !offer.value) {
    return
  }

  isSubmitting.value = true
  submittingAction.value = 'accept'
  error.value = ''

  try {
    const response = await acceptCurrentOffer()

    await refreshOffers()

    toast.success(response?.message || 'Offer accepted successfully')

    emit('accepted', {
      offer: offer.value,
      response,
    })

    emit('updated', {
      action: 'accepted',
      offer: offer.value,
      response,
    })

    handleClose()
  } catch (acceptError) {
    console.error('Unable to accept offer:', acceptError)

    error.value =
      acceptError?.response?.data?.message ||
      acceptError?.message ||
      'Unable to accept the offer'

    toast.error(error.value)
  } finally {
    isSubmitting.value = false
    submittingAction.value = ''
  }
}

async function handleOfferDecline() {
  if (isSubmitting.value || !offer.value) {
    return
  }

  isSubmitting.value = true
  submittingAction.value = 'decline'
  error.value = ''

  try {
    const response = await declineCurrentOffer()

    await refreshOffers()

    toast.success(response?.message || 'Offer declined successfully')

    emit('declined', {
      offer: offer.value,
      response,
    })

    emit('updated', {
      action: 'declined',
      offer: offer.value,
      response,
    })

    handleClose()
  } catch (declineError) {
    console.error('Unable to decline offer:', declineError)

    error.value =
      declineError?.response?.data?.message ||
      declineError?.message ||
      'Unable to decline the offer'

    toast.error(error.value)
  } finally {
    isSubmitting.value = false
    submittingAction.value = ''
  }
}

function handleClose() {
  if (isSubmitting.value) {
    return
  }

  emit('update:show', false)
  emit('close')
}

function handleShowUpdate(value) {
  emit('update:show', value)

  if (!value) {
    emit('close')
  }
}

watch(
  () => props.show,
  isOpen => {
    if (isOpen) {
      error.value = ''
      imageFailed.value = false
      submittingAction.value = ''
    }
  },
)

watch(
  () => offer.value?.id,
  () => {
    error.value = ''
    imageFailed.value = false
  },
)
</script>

<style lang="scss" scoped>
.offer-details {
  width: 100%;

  &_with-preview {
    display: grid;
    align-items: center;
    gap: clamp(30px, 4vw, 64px);
    grid-template-columns: minmax(220px, 34%) minmax(0, 1fr);
  }

  &_loading,
  &_error,
  &_empty {
    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 360px;
  }

  &__loader {
    width: 50px;
    height: 50px;
  }

  &__state {
    width: min(100%, 500px);

    margin: auto;

    text-align: center;
  }

  &__state-title {
    color: var(--primary-color);

    &:not(:last-child) {
      margin-bottom: 18px;
    }
  }

  &__state-message {
    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    line-height: 150%;

    &:not(:last-child) {
      margin-bottom: 24px;
    }
  }

  &_error {
    .offer-details__state-message {
      color: var(--error-color);
    }
  }

  &__state-button {
    width: min(100%, 240px);

    margin: 0 auto;
  }

  &__preview {
    display: flex;
    align-items: center;
    justify-content: center;

    min-width: 0;
  }

  &__image-wrapper {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    width: min(100%, 330px);
    min-height: 330px;

    padding: 20px;

    border: 1px solid var(--border-fourth-color);
    border-radius: 6px;
    background-color: rgb(28 29 29 / 76%);
  }

  &__image {
    display: block;

    width: 100%;
    max-height: 420px;

    object-fit: contain;
  }

  &__information {
    min-width: 0;
  }

  &__heading {
    &:not(:last-child) {
      margin-bottom: clamp(24px, 3vw, 38px);
    }
  }

  &__eyebrow {
    margin-bottom: 8px;

    color: var(--hint-primary-color);
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  &__title {
    color: var(--primary-color);
    letter-spacing: 0.04em;
    text-align: left;

    overflow-wrap: anywhere;
  }

  &__attributes {
    display: grid;
    gap: 18px 40px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  &__attribute {
    display: grid;
    align-items: center;
    gap: 14px;
    grid-template-columns: minmax(70px, auto) minmax(0, 1fr);

    min-width: 0;

    font-family: var(--font-inter);
    font-size: 14px;
  }

  &__attribute-label,
  &__price-label {
    color: var(--hint-primary-color);
    font-size: 13px;
    font-weight: 500;
  }

  &__attribute-value {
    overflow: hidden;

    color: var(--primary-color);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__status {
    width: fit-content;

    font-size: 14px;
    font-weight: 500;

    &_success {
      color: var(--success-color, #6ec226);
    }

    &_error {
      color: var(--error-color, #ff4a65);
    }

    &_pending {
      color: var(--pending-color, #ffa600);
    }

    &_default {
      color: var(--secondary-color);
    }
  }

  &__divider {
    width: 100%;
    height: 1px;

    margin-top: 30px;
    margin-bottom: 28px;

    background-color: var(--border-secondary-color);
  }

  &__prices {
    display: grid;
    gap: 14px;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    &:not(:last-child) {
      margin-bottom: 22px;
    }
  }

  &__price {
    display: flex;
    flex-direction: column;
    gap: 12px;

    min-width: 0;

    padding: 18px;

    border: 1px solid var(--border-fourth-color);
    border-radius: 4px;
    background-color: var(--bg-secondary-color);

    &_counter {
      border-color: var(--hint-primary-color);
      background-color: var(--hint-third-color);
    }
  }

  &__price-value {
    overflow: hidden;

    color: var(--primary-color);
    font-family: var(--font-pt-serif);
    font-size: clamp(24px, 2.4vw, 34px);
    font-weight: 500;
    line-height: 1.1;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__notice {
    padding: 14px 16px;

    border-left: 3px solid var(--hint-primary-color);
    background-color: rgb(255 166 0 / 5%);

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    line-height: 150%;

    &:not(:last-child) {
      margin-bottom: 26px;
    }

    p {
      margin: 0;
    }

    &_muted {
      background-color: transparent;

      border-left-color: var(--border-fourth-color);
    }
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;

    margin-top: 28px;
  }

  &__action {
    min-width: 170px;
    min-height: 46px;

    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    text-transform: uppercase;

    &_decline {
      color: var(--error-color);

      &:deep(.base-button) {
        color: var(--error-color);
      }
    }

    &_close {
      margin-left: auto;
    }
  }

  &__button-loader {
    width: 19px;
    height: 19px;

    border: 2px solid currentColor;
    border-radius: 50%;

    animation: offer-details-spin 0.75s linear infinite;

    border-bottom-color: transparent;
    border-right-color: transparent;
  }

  @media (max-width: $md4) {
    &_with-preview {
      grid-template-columns: 1fr;
    }

    &__image-wrapper {
      width: min(76vw, 320px);
      min-height: 280px;
    }

    &__heading {
      text-align: center;
    }

    &__title {
      text-align: center;
    }
  }

  @media (max-width: $md6) {
    &__attributes,
    &__prices {
      grid-template-columns: 1fr;
    }

    &__actions {
      flex-direction: column-reverse;
    }

    &__action {
      width: 100%;
    }
  }
}

@keyframes offer-details-spin {
  to {
    transform: rotate(360deg);
  }
}

:global(.offer-details-modal) {
  max-width: 920px;
}

:global(.offer-details-modal .base-modal__frame) {
  padding: clamp(30px, 3vw, 52px) clamp(18px, 3.5vw, 48px);

  background-color: var(--bg-fifth-color);
}

:global(.offer-details-modal__content) {
  width: 100%;
}
</style>
