<template>
  <BaseModal
    :show="show"
    class="my-card-modal"
    content-class="my-card-modal__content"
    size="product"
    :labelledby="titleId"
    @close="closeModal"
    @update:show="handleShowUpdate"
  >
    <!-- Loading -->
    <div v-if="loading" class="my-card-details my-card-details_state">
      <LoadingSpinner class="my-card-details__loader" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="my-card-details my-card-details_state">
      <h2 class="my-card-details__state-title _h3">
        {{ $t('Unable to load card') }}
      </h2>

      <p class="my-card-details__state-text">
        {{ error }}
      </p>

      <BaseButton
        type="button"
        class="my-card-details__retry"
        variant="bordered"
        @click="loadCard"
      >
        {{ $t('Try again') }}
      </BaseButton>
    </div>

    <!-- Card details -->
    <div v-else-if="card" class="my-card-details">
      <!-- Card preview -->
      <div class="my-card-details__preview">
        <div class="my-card-details__card">
          <img
            v-if="card.image_2"
            :src="card.image_2"
            :alt="card.name"
            class="my-card-details__frame"
          />

          <img
            v-if="card.image"
            :src="card.image"
            alt=""
            class="my-card-details__image"
          />

          <svg
            v-if="cardName"
            class="my-card-details__card-name"
            viewBox="0 0 300 110"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              <path :id="cardNamePathId" :d="cardNamePath" fill="none" />
            </defs>

            <text
              class="my-card-details__card-name-text"
              x="0"
              y="0"
              :font-size="cardNameFontSize"
            >
              <textPath
                :href="`#${cardNamePathId}`"
                startOffset="50%"
                text-anchor="middle"
                dominant-baseline="middle"
              >
                {{ cardName }}
              </textPath>
            </text>
          </svg>

          <div
            v-if="card.description"
            class="my-card-details__card-description"
            v-html="card.description"
          />

          <span
            v-if="hasValue(card.mana_cost)"
            class="my-card-details__stat my-card-details__stat_mana"
          >
            {{ card.mana_cost }}
          </span>

          <span
            v-if="hasValue(card.attack)"
            class="my-card-details__stat my-card-details__stat_attack"
          >
            {{ card.attack }}
          </span>

          <span
            v-if="hasValue(card.health)"
            class="my-card-details__stat my-card-details__stat_health"
          >
            {{ card.health }}
          </span>
        </div>

        <p class="my-card-details__stock">
          <template v-if="rented">
            {{ $t('Rented card') }}
          </template>

          <template v-else-if="availabilityLoading">
            {{ $t('Checking availability...') }}
          </template>

          <template v-else>
            {{ $t('Available for sale') }}:
            <strong>{{ availableForSale }}</strong>
          </template>
        </p>
      </div>

      <!-- Card information -->
      <div class="my-card-details__information">
        <h2 :id="titleId" class="my-card-details__title _h3">
          {{ card.name }}
        </h2>

        <div class="my-card-details__attributes">
          <div class="my-card-details__attribute">
            <span class="my-card-details__attribute-label">
              {{ $t('Hero') }}:
            </span>

            <strong class="my-card-details__attribute-value">
              {{ card.hero?.name || '—' }}
            </strong>
          </div>

          <div class="my-card-details__attribute">
            <span class="my-card-details__attribute-label">
              {{ $t('Mana') }}:
            </span>

            <strong class="my-card-details__attribute-value">
              {{ displayValue(card.mana_cost) }}
            </strong>
          </div>

          <div class="my-card-details__attribute">
            <span class="my-card-details__attribute-label">
              {{ $t('Type') }}:
            </span>

            <strong class="my-card-details__attribute-value">
              {{ formatValue(card.type) }}
            </strong>
          </div>

          <div class="my-card-details__attribute">
            <span class="my-card-details__attribute-label">
              {{ $t('Attack') }}:
            </span>

            <strong class="my-card-details__attribute-value">
              {{ displayValue(card.attack) }}
            </strong>
          </div>

          <div class="my-card-details__attribute">
            <span class="my-card-details__attribute-label">
              {{ $t('Rarity') }}:
            </span>

            <strong class="my-card-details__attribute-value">
              {{ formatValue(card.rarity) }}
            </strong>
          </div>

          <div class="my-card-details__attribute">
            <span class="my-card-details__attribute-label">
              {{ $t('Health') }}:
            </span>

            <strong class="my-card-details__attribute-value">
              {{ displayValue(card.health) }}
            </strong>
          </div>
        </div>

        <div class="my-card-details__description">
          <span class="my-card-details__label"> {{ $t('Description') }}: </span>

          <div
            class="my-card-details__description-content"
            v-html="card.description || '—'"
          />
        </div>

        <!-- Selling controls -->
        <template v-if="sellFeatureEnabled && !rented">
          <div
            class="my-card-details__tabs"
            role="tablist"
            :aria-label="$t('Card action')"
          >
            <button
              type="button"
              class="my-card-details__tab my-card-details__tab_active"
              role="tab"
              aria-selected="true"
            >
              {{ $t('Sell') }}
            </button>
          </div>

          <div class="my-card-details__divider" />

          <div class="my-card-details__sale">
            <!-- Top row -->
            <div class="my-card-details__sale-top">
              <!-- Commission -->
              <div
                v-if="commissionPercent"
                class="my-card-details__commission-box"
              >
                <span class="my-card-details__label">
                  {{ $t('Commission') }}
                </span>

                <strong class="my-card-details__commission-value">
                  {{ commissionPercent }}%
                </strong>
              </div>

              <!-- Quantity -->
              <div class="my-card-details__quantity-box">
                <span class="my-card-details__label">
                  {{ $t('Quantity') }}
                </span>

                <div class="my-card-details__quantity">
                  <button
                    type="button"
                    class="my-card-details__quantity-button"
                    :disabled="quantity <= 1 || submitting"
                    :aria-label="$t('Decrease quantity')"
                    @click="decreaseQuantity"
                  >
                    −
                  </button>

                  <BaseInput
                    v-model="quantity"
                    class="my-card-details__quantity-input"
                    type="number"
                    inputmode="numeric"
                    min="1"
                    :max="availableForSale"
                    :disabled="
                      !availableForSale || submitting || availabilityLoading
                    "
                    @change="normalizeQuantity"
                    @blur="normalizeQuantity"
                  />

                  <button
                    type="button"
                    class="my-card-details__quantity-button"
                    :disabled="
                      quantity >= availableForSale ||
                      submitting ||
                      availabilityLoading
                    "
                    :aria-label="$t('Increase quantity')"
                    @click="increaseQuantity"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <!-- Bottom row -->
            <div class="my-card-details__sale-bottom">
              <!-- Price -->
              <div class="my-card-details__price-box">
                <span class="my-card-details__label">
                  {{ $t('You receive per card') }}
                </span>

                <PriceFormatter
                  class="my-card-details__price-value"
                  :price="saleUnitPrice"
                  size="size-32"
                />
              </div>

              <!-- Total -->
              <div class="my-card-details__total-box">
                <span class="my-card-details__label">
                  {{ $t('Total') }}
                </span>

                <PriceFormatter
                  class="my-card-details__total-value"
                  :price="saleTotal"
                  size="size-32"
                />
              </div>

              <!-- Sell button -->
              <BaseButton
                type="button"
                class="my-card-details__sell-button"
                variant="primary"
                :disabled="!canSell"
                @click="sellCard"
              >
                <span
                  v-if="submitting"
                  class="my-card-details__button-loader"
                  aria-hidden="true"
                />

                <template v-else-if="availabilityLoading">
                  {{ $t('Checking...') }}
                </template>

                <template v-else-if="availableForSale">
                  {{ $t('Sell card') }}
                </template>

                <template v-else>
                  {{ $t('Unavailable') }}
                </template>
              </BaseButton>
            </div>
          </div>
        </template>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, getCurrentInstance, ref, watch } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'
import { useToast } from '@/composables/useToast'
import axios from '@/plugins/axios'
import { useProductStore } from '@/stores/product'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },

  productId: {
    type: [String, Number],
    default: null,
  },

  collectionItem: {
    type: Object,
    default: null,
  },

  rented: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'update:show', 'sold'])

const productStore = useProductStore()
const settingsStore = useSettingsStore()
const userStore = useUserStore()

const toast = useToast()

const loading = ref(false)
const error = ref('')
const submitting = ref(false)
const availabilityLoading = ref(false)

const availableForSale = ref(0)
const quantity = ref(1)

const card = computed(() => {
  return productStore.currentProduct
})

const instance = getCurrentInstance()

const cardName = computed(() => {
  return card.value?.name ?? card.value?.title ?? card.value?.card_name ?? ''
})

const cardNamePathId = computed(() => {
  const componentId = instance?.uid ?? 'details'
  const cardId =
    card.value?.id ?? card.value?.card_id ?? props.productId ?? 'card'

  return `my-card-details-name-${componentId}-${cardId}`
})

const cardNamePath = computed(() => {
  if (String(props.product?.type).toLowerCase() === 'spell') {
    return 'M 10 -10 Q 150 75 300 40'
  }

  return 'M 20 60 Q 150 25 280 60'
})

const cardNameFontSize = computed(() => {
  const length = cardName.value.trim().length

  if (length > 34) return 12
  if (length > 28) return 14
  if (length > 23) return 16
  if (length > 18) return 16
  if (length > 13) return 16

  return 16
})

const titleId = computed(() => {
  return props.productId ? `my-card-title-${props.productId}` : 'my-card-title'
})

const sellFeatureEnabled = computed(() => {
  return Boolean(settingsStore.settings?.payouts?.offer_enabled)
})

const commissionPercent = computed(() => {
  return Number(settingsStore.settings?.card_sale_commission_percent || 0)
})

const saleUnitPrice = computed(() => {
  if (card.value?.sale_price !== null && card.value?.sale_price !== undefined) {
    return Number(card.value.sale_price)
  }

  const cardPrice = Number(card.value?.price || 0)

  return Number((cardPrice * (1 - commissionPercent.value / 100)).toFixed(2))
})

const saleTotal = computed(() => {
  return Number((saleUnitPrice.value * Number(quantity.value || 0)).toFixed(2))
})

const canSell = computed(() => {
  return (
    sellFeatureEnabled.value &&
    !props.rented &&
    !availabilityLoading.value &&
    !submitting.value &&
    availableForSale.value > 0 &&
    quantity.value >= 1 &&
    quantity.value <= availableForSale.value
  )
})

const hasValue = value => {
  return value !== null && value !== undefined && value !== ''
}

const displayValue = value => {
  return hasValue(value) ? value : '—'
}

const formatValue = value => {
  if (!hasValue(value)) {
    return '—'
  }

  const text = String(value).replaceAll('_', ' ').trim()

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

const normalizeQuantity = () => {
  const parsedQuantity = Number.parseInt(String(quantity.value), 10) || 1

  if (availableForSale.value <= 0) {
    quantity.value = 1
    return
  }

  quantity.value = Math.min(Math.max(1, parsedQuantity), availableForSale.value)
}

const decreaseQuantity = () => {
  normalizeQuantity()

  quantity.value = Math.max(1, quantity.value - 1)
}

const increaseQuantity = () => {
  normalizeQuantity()

  quantity.value = Math.min(availableForSale.value, quantity.value + 1)
}

const fetchAvailability = async () => {
  if (props.rented || !sellFeatureEnabled.value || !card.value?.id) {
    availableForSale.value = 0
    return
  }

  availabilityLoading.value = true

  try {
    const { data } = await axios.get(
      `/players/me/cards/${card.value.id}/available-for-sale`,
    )

    availableForSale.value = Math.max(0, Number(data?.available_count || 0))

    normalizeQuantity()
  } catch (availabilityError) {
    console.error('Unable to load sale availability:', availabilityError)

    availableForSale.value = 0

    if (availabilityError?.response?.status !== 401) {
      toast.error(
        availabilityError?.response?.data?.message ||
          availabilityError?.message ||
          'Unable to check card availability',
      )
    }
  } finally {
    availabilityLoading.value = false
  }
}

const loadCard = async () => {
  if (!props.productId) {
    error.value = 'Card ID is missing'
    return
  }

  loading.value = true
  error.value = ''
  quantity.value = 1
  availableForSale.value = 0

  try {
    await Promise.all([
      productStore.fetchProductDetails(props.productId),

      settingsStore.settings
        ? Promise.resolve()
        : settingsStore.fetchSettings(),
    ])

    await fetchAvailability()
  } catch (loadError) {
    console.error('Unable to load collection card:', loadError)

    error.value =
      loadError?.response?.data?.message ||
      loadError?.message ||
      'Unable to load card'
  } finally {
    loading.value = false
  }
}

const sellCard = async () => {
  if (!canSell.value || !card.value?.id || submitting.value) {
    return
  }

  normalizeQuantity()

  submitting.value = true

  try {
    const requestedQuantity = quantity.value

    const { data } = await axios.post('/offers/cards', {
      id: card.value.id,
      quantity: requestedQuantity,
    })

    toast.success(data?.message || 'Sale offer created')

    emit('sold', {
      productId: card.value.id,
      collectionItem: props.collectionItem,
      quantity: Number(data?.quantity || requestedQuantity),
      offerId: data?.offer_id,
      status: data?.status,
      totalPrice: data?.total_price,
    })

    await Promise.all([fetchAvailability(), userStore.fetchProfile()])

    quantity.value = 1
  } catch (saleError) {
    console.error('Unable to sell card:', saleError)

    const response = saleError?.response?.data

    if (response?.error_type === 'not_enough_cards') {
      availableForSale.value = Math.max(0, Number(response.available || 0))

      normalizeQuantity()
    }

    toast.error(
      response?.message || saleError?.message || 'Unable to sell card',
    )
  } finally {
    submitting.value = false
  }
}

const closeModal = () => {
  emit('update:show', false)
  emit('close')
}

const handleShowUpdate = value => {
  emit('update:show', value)
}

watch(
  () => [props.show, props.productId, props.rented],
  async ([isOpen]) => {
    if (!isOpen) {
      return
    }

    await loadCard()
  },
  {
    immediate: true,
  },
)
</script>

<style lang="scss" scoped>
.my-card-details {
  display: grid;
  align-items: center;
  gap: clamp(30px, 4vw, 64px);
  grid-template-columns:
    minmax(260px, 38%)
    minmax(0, 1fr);

  width: 100%;
  min-height: 520px;

  &_state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;

    min-height: 480px;

    text-align: center;
  }

  &__loader {
    width: 50px;
    height: 50px;
  }

  &__state-title {
    color: var(--primary-color);
  }

  &__state-text {
    color: var(--error-color);
  }

  &__retry {
    width: min(100%, 250px);
  }

  &__preview {
    display: flex;
    flex-direction: column;
    align-items: center;

    min-width: 0;
  }

  &__card {
    position: relative;

    width: min(100%, 365px);
    aspect-ratio: 0.69;

    container-type: inline-size;
  }

  &__frame {
    position: absolute;
    inset: 0;
    z-index: 2;

    width: 100%;
    height: 100%;

    pointer-events: none;

    object-fit: contain;
  }

  &__image {
    position: absolute;
    top: 15%;
    left: 50%;
    z-index: 2;

    width: 57%;
    height: 38%;

    object-fit: cover;

    transform: translateX(-50%);
  }

  &__card-name {
    position: absolute;
    top: 44%;
    left: 50%;
    z-index: 3;

    overflow: visible;

    width: 82%;
    height: 30%;

    pointer-events: none;

    transform: translateX(-50%);
  }

  &__card-name-text {
    font-family: var(--font-inter);
    font-weight: 700;
    letter-spacing: -0.02em;

    fill: var(--primary-color, #fff);

    paint-order: stroke fill;
    stroke: rgb(38 15 12 / 92%);
    stroke-linejoin: round;
    stroke-width: 3px;

    text-rendering: geometricPrecision;
  }

  &__card-description {
    position: absolute;
    bottom: 22%;
    left: 50%;
    z-index: 3;

    display: -webkit-box;
    overflow: hidden;

    width: 48%;
    max-height: 17%;

    color: #411e00;
    font-family: var(--font-pt-serif);
    font-size: 14px;
    font-weight: 500;
    line-height: 112%;
    text-align: center;

    pointer-events: none;

    transform: translateX(-50%);

    -webkit-box-orient: vertical;
    -webkit-line-clamp: 5;

    :deep(p) {
      margin: 0;
    }

    :deep(br) {
      display: none;
    }
  }

  &__stat {
    position: absolute;
    z-index: 4;

    color: var(--primary-color);
    font-family: var(--font-pt-serif);
    font-size: 30px;
    font-weight: 700;
    line-height: 1;

    pointer-events: none;

    paint-order: stroke fill;

    &_mana {
      top: 12%;
      left: 19%;

      -webkit-text-stroke: 2px #01588a;
    }

    &_attack {
      bottom: 12%;
      left: 19%;

      -webkit-text-stroke: 2px #066508;
    }

    &_health {
      right: 19%;
      bottom: 12%;

      -webkit-text-stroke: 2px #7a0102;
    }
  }

  &__stock {
    margin-top: 5px;

    color: var(--hint-primary-color);
    font-size: 14px;
    line-height: 150%;

    strong {
      margin-left: 7px;

      color: var(--primary-color);
      font-weight: 500;
    }
  }

  &__information {
    min-width: 0;
  }

  &__title {
    color: var(--primary-color);
    letter-spacing: 0.04em;
    text-align: left;

    &:not(:last-child) {
      margin-bottom: clamp(24px, 3vw, 40px);
    }
  }

  &__attributes {
    display: grid;
    gap: 18px 45px;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    margin-bottom: 22px;
  }

  &__attribute {
    display: grid;
    gap: 14px;
    grid-template-columns:
      minmax(60px, 68px)
      minmax(0, 1fr);

    font-size: 14px;
  }

  &__attribute-label,
  &__label {
    color: var(--hint-primary-color);
    font-size: 13px;
    font-weight: 500;
  }

  &__attribute-value {
    overflow: hidden;

    color: var(--primary-color);
    font-weight: 400;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__description {
    display: grid;
    gap: 14px;
    grid-template-columns:
      115px
      minmax(0, 1fr);

    margin-bottom: 30px;

    color: var(--secondary-color);
    font-size: 14px;
    line-height: 150%;
  }

  &__description-content {
    min-width: 0;

    :deep(p) {
      margin: 0;
    }

    :deep(p:not(:last-child)) {
      margin-bottom: 10px;
    }
  }

  &__tabs {
    display: flex;

    width: 106px;
  }

  &__tab {
    width: 100%;
    min-height: 36px;

    padding: 5px 15px;

    border: 1px solid var(--hint-primary-color);
    border-radius: 4px;
    outline: none;
    background-color: transparent;

    color: var(--hint-primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    text-transform: uppercase;

    &_active {
      background-color: var(--hint-primary-color);

      color: var(--bg-primary-color);
    }
  }

  &__divider {
    width: 100%;
    height: 1px;

    margin-top: 14px;
    margin-bottom: 28px;

    background-color: var(--border-secondary-color);
  }

  &__sale {
    display: flex;
    flex-direction: column;
    gap: 24px;

    width: 100%;
    min-width: 0;
  }

  /*
   * Top row:
   * Commission and Quantity
   */
  &__sale-top {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 30px;

    width: 100%;
    min-width: 0;
  }

  /*
   * Bottom row:
   * Price, Total, Sell button
   */
  &__sale-bottom {
    display: grid;
    align-items: end;
    gap: clamp(20px, 3vw, 45px);
    grid-template-columns:
      minmax(150px, 1fr)
      minmax(130px, 1fr)
      minmax(180px, auto);

    width: 100%;
    min-width: 0;
  }

  &__commission-box,
  &__quantity-box,
  &__price-box,
  &__total-box {
    display: flex;
    flex-direction: column;
    gap: 10px;

    min-width: 0;
  }

  &__commission-value {
    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 500;
    line-height: 1;
  }

  &__price-value,
  &__total-value {
    min-width: 0;
  }

  &__quantity {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__quantity-button {
    display: flex;
    flex: 0 0 28px;
    align-items: center;
    justify-content: center;

    width: 28px;
    height: 28px;

    padding: 0;

    border: 1px solid var(--hint-primary-color);
    border-radius: 50%;
    outline: none;
    background-color: transparent;

    color: var(--hint-primary-color);
    font-family: var(--font-inter);
    font-size: 18px;
    line-height: 1;

    cursor: pointer;

    transition:
      color 0.3s ease,
      border-color 0.3s ease,
      opacity 0.3s ease;

    &:disabled {
      opacity: 0.3;

      cursor: not-allowed;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        border-color: var(--hint-secondary-color);

        color: var(--hint-secondary-color);
      }
    }
  }

  &__quantity-input {
    width: 55px;

    :deep(.base-input__control) {
      padding-right: 5px;
      padding-left: 5px;

      text-align: center;
    }

    :deep(.base-input__control::-webkit-inner-spin-button),
    :deep(.base-input__control::-webkit-outer-spin-button) {
      margin: 0;

      appearance: none;
    }

    :deep(.base-input__control[type='number']) {
      appearance: textfield;
    }
  }

  &__sell-button {
    width: 100%;
    min-width: 180px;
    min-height: 46px;

    padding-right: 18px;
    padding-left: 18px;

    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    line-height: 1;
    text-transform: uppercase;
    white-space: nowrap;
  }

  &__notice {
    padding: 18px;

    border: 1px solid var(--border-fourth-color);
    border-radius: 4px;
    background-color: var(--bg-secondary-color);

    color: var(--secondary-color);
    font-size: 14px;
    line-height: 150%;
    text-align: center;
  }

  &__button-loader {
    width: 20px;
    height: 20px;

    border: 2px solid currentColor;
    border-radius: 50%;

    animation: my-card-details-spin 0.8s linear infinite;

    border-bottom-color: transparent;
    border-right-color: transparent;
  }

  @media (max-width: $md3) {
    grid-template-columns:
      minmax(220px, 36%)
      minmax(0, 1fr);

    &__sale-bottom {
      gap: 20px;
      grid-template-columns:
        minmax(140px, 1fr)
        minmax(120px, 1fr)
        minmax(170px, auto);
    }
  }

  @media (max-width: $md4) {
    grid-template-columns: 1fr;

    &__card {
      width: min(78vw, 340px);
    }

    &__title {
      text-align: center;
    }
  }

  @media (max-width: $md6) {
    &__attributes {
      grid-template-columns: 1fr;
    }

    &__description {
      grid-template-columns: 1fr;
    }

    &__sale-top {
      flex-direction: column;
      align-items: stretch;
      gap: 18px;
    }

    &__sale-bottom {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__sell-button {
      grid-column: 1 / -1;

      width: 100%;
    }
  }

  @media (max-width: $md8) {
    &__sale-bottom {
      grid-template-columns: 1fr;
    }

    &__sell-button {
      grid-column: auto;
    }
  }
}

@keyframes my-card-details-spin {
  to {
    transform: rotate(360deg);
  }
}

:global(.my-card-modal) {
  max-width: 1180px;
}

:global(.my-card-modal .base-modal__frame) {
  padding: clamp(30px, 3vw, 55px) clamp(18px, 3.5vw, 48px);

  background-color: var(--bg-fifth-color);
}

:global(.my-card-modal__content) {
  width: 100%;
}
</style>
