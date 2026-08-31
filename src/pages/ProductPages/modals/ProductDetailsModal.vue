<template>
  <BaseModal
    :show="props.show"
    class="product-details-modal"
    content-class="product-details-modal__content"
    size="product"
    :labelledby="titleId"
    @close="handleClose"
    @update:show="handleShowUpdate"
  >
    <!-- Loading -->
    <div v-if="loading" class="product-details product-details_loading">
      <LoadingSpinner class="product-details__loader" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="product-details product-details_error">
      <div class="product-details__state">
        <h2 class="product-details__state-title _h3">
          {{ $t('Unable to load product') }}
        </h2>

        <p class="product-details__state-message">
          {{ error }}
        </p>

        <BaseButton
          type="button"
          class="product-details__state-button"
          variant="bordered"
          @click="fetchProductData"
        >
          {{ $t('Try again') }}
        </BaseButton>
      </div>
    </div>

    <!-- Product -->
    <div v-else-if="currentProduct" class="product-details">
      <!-- Card preview -->
      <div class="product-details__preview">
        <div class="product-details__card">
          <img
            v-if="currentProduct.image_2"
            :src="currentProduct.image_2"
            :alt="currentProduct.name"
            class="product-details__card-frame"
          />

          <img
            v-if="currentProduct.image"
            :src="currentProduct.image"
            alt=""
            class="product-details__card-image"
          />

          <svg
            v-if="cardName"
            class="product-details__card-name"
            viewBox="0 0 300 110"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              <path :id="cardNamePathId" :d="cardNamePath" fill="none" />
            </defs>

            <text
              class="product-details__card-name-text"
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
            v-if="currentProduct.description"
            class="product-details__card-description"
            v-html="currentProduct.description"
          />

          <span
            v-if="hasValue(currentProduct.mana_cost)"
            class="product-details__card-stat product-details__card-stat_mana"
          >
            {{ currentProduct.mana_cost }}
          </span>

          <span
            v-if="hasValue(currentProduct.attack)"
            class="product-details__card-stat product-details__card-stat_attack"
          >
            {{ currentProduct.attack }}
          </span>

          <span
            v-if="hasValue(currentProduct.health)"
            class="product-details__card-stat product-details__card-stat_health"
          >
            {{ currentProduct.health }}
          </span>
        </div>
      </div>

      <!-- Information -->
      <div class="product-details__information">
        <h2 :id="titleId" class="product-details__title _h3">
          {{ currentProduct.name }}
        </h2>

        <div class="product-details__attributes">
          <div class="product-details__attribute">
            <span class="product-details__attribute-label">
              {{ $t('Hero') }}:
            </span>

            <span class="product-details__attribute-value">
              {{ currentProduct.hero?.name || '—' }}
            </span>
          </div>

          <div class="product-details__attribute">
            <span class="product-details__attribute-label">
              {{ $t('Mana') }}:
            </span>

            <span class="product-details__attribute-value">
              {{ displayValue(currentProduct.mana_cost) }}
            </span>
          </div>

          <div class="product-details__attribute">
            <span class="product-details__attribute-label">
              {{ $t('Type') }}:
            </span>

            <span class="product-details__attribute-value">
              {{ formatValue(currentProduct.type) }}
            </span>
          </div>

          <div class="product-details__attribute">
            <span class="product-details__attribute-label">
              {{ $t('Attack') }}:
            </span>

            <span class="product-details__attribute-value">
              {{ displayValue(currentProduct.attack) }}
            </span>
          </div>

          <div class="product-details__attribute">
            <span class="product-details__attribute-label">
              {{ $t('Rarity') }}:
            </span>

            <span class="product-details__attribute-value">
              {{ formatValue(currentProduct.rarity) }}
            </span>
          </div>

          <div class="product-details__attribute">
            <span class="product-details__attribute-label">
              {{ $t('Health') }}:
            </span>

            <span class="product-details__attribute-value">
              {{ displayValue(currentProduct.health) }}
            </span>
          </div>
        </div>

        <div class="product-details__description">
          <div class="product-details__description-label">
            {{ $t('Description') }}:
          </div>

          <div
            class="product-details__description-content"
            v-html="currentProduct.description || '—'"
          />
        </div>

        <!-- Buy/Rent switch -->
        <div
          class="product-details__switcher"
          role="group"
          :aria-label="$t('Purchase mode')"
        >
          <BaseButton
            type="button"
            class="product-details__switch product-details__switch_first"
            :variant="purchaseMode === 'buy' ? 'secondary' : 'bordered'"
            :aria-pressed="purchaseMode === 'buy'"
            @click="setPurchaseMode('buy')"
          >
            {{ $t('Buy') }}
          </BaseButton>

          <BaseButton
            type="button"
            class="product-details__switch product-details__switch_last"
            :variant="purchaseMode === 'rent' ? 'secondary' : 'bordered'"
            :aria-pressed="purchaseMode === 'rent'"
            :disabled="!canRent"
            @click="setPurchaseMode('rent')"
          >
            {{ $t('Rent') }}
          </BaseButton>
        </div>

        <div class="product-details__divider" />

        <!-- Purchase controls -->
        <div class="product-details__purchase">
          <div class="product-details__price">
            <span class="product-details__control-label">
              {{ $t('Price') }}
            </span>

            <div class="product-details__price-value">
              <PriceFormatter
                v-if="hasOldPrice"
                class="product-details__old-price"
                :price="currentProduct.old_price"
                size="size-20"
              />

              <PriceFormatter :price="displayPrice" size="size-32" />
            </div>
          </div>

          <!-- Quantity -->
          <div v-if="purchaseMode === 'buy'" class="product-details__quantity">
            <span class="product-details__control-label">
              {{ $t('Quantity') }}
            </span>

            <div class="product-details__quantity-controls">
              <button
                type="button"
                class="product-details__quantity-button"
                :disabled="quantity <= 1 || isSubmitting"
                :aria-label="$t('Decrease quantity')"
                @click="decreaseQuantity"
              >
                −
              </button>

              <BaseInput
                v-model="quantity"
                class="product-details__quantity-input"
                inputmode="numeric"
                @change="normalizeQuantity"
              />

              <button
                type="button"
                class="product-details__quantity-button"
                :disabled="isSubmitting"
                :aria-label="$t('Increase quantity')"
                @click="increaseQuantity"
              >
                +
              </button>
            </div>
          </div>

          <!-- Rental period -->
          <div v-else class="product-details__rental">
            <span class="product-details__control-label">
              {{ $t('Rent Period') }}
            </span>

            <BaseDropdown
              class="product-details__rental-dropdown"
              :label="selectedRentalPeriod?.label || $t('Select period')"
              :placeholder="!selectedRentalPeriod"
              variant="aside"
              bordered
              absolute
            >
              <template #default="{ close }">
                <button
                  v-for="period in cartStore.rentalPeriods || []"
                  :key="period.id"
                  type="button"
                  class="product-details__rental-option"
                  :class="{
                    'product-details__rental-option_selected':
                      String(period.id) === String(rentalPeriodId),
                  }"
                  :aria-selected="String(period.id) === String(rentalPeriodId)"
                  role="option"
                  @click="selectRentalPeriod(period.id, close)"
                >
                  {{ period.label }}
                </button>
              </template>
            </BaseDropdown>
          </div>

          <BaseButton
            type="button"
            class="product-details__cart-button"
            :variant="isInCart ? 'bordered' : 'primary'"
            :disabled="isSubmitting || !displayPrice"
            @click="handleCartAction"
          >
            <span
              v-if="isSubmitting"
              class="product-details__button-loader"
              aria-hidden="true"
            />

            <template v-else>
              {{ isInCart ? $t('Remove from cart') : $t('Add to cart') }}
            </template>
          </BaseButton>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed, getCurrentInstance, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseDropdown from '@/components/base/BaseDropdown.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'
import { useToast } from '@/composables/useToast'
import { useCartStore } from '@/stores/cart'
import { useProductStore } from '@/stores/product'
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

  rent: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'update:show'])

const router = useRouter()
const toast = useToast()

const cartStore = useCartStore()
const productStore = useProductStore()
const userStore = useUserStore()

const loading = ref(false)
const error = ref('')
const quantity = ref(1)
const rentalPeriodId = ref(null)
const purchaseMode = ref(props.rent ? 'rent' : 'buy')
const isSubmitting = ref(false)

const currentProduct = computed(() => {
  return productStore.currentProduct
})

const instance = getCurrentInstance()

const cardName = computed(() => {
  return (
    currentProduct.value?.name ??
    currentProduct.value?.card_name ??
    currentProduct.value?.title ??
    ''
  )
})

const cardNamePathId = computed(() => {
  const componentId = instance?.uid ?? 'details'
  const productId =
    currentProduct.value?.id ??
    currentProduct.value?.card_id ??
    currentProduct.value?.external_id

  return `product-details-card-name-${componentId}-${productId ?? 'unknown'}`
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
  return props.productId
    ? `product-details-title-${props.productId}`
    : 'product-details-title'
})

const canRent = computed(() => {
  return (
    (cartStore.rentalPeriods || []).length > 0 &&
    (currentProduct.value?.rental_prices || []).length > 0
  )
})

const selectedRentalPeriod = computed(() => {
  return (cartStore.rentalPeriods || []).find(period => {
    return String(period.id) === String(rentalPeriodId.value)
  })
})

const rentalPrice = computed(() => {
  if (!rentalPeriodId.value) {
    return null
  }

  const prices = currentProduct.value?.rental_prices || []

  const matchingPrice = prices.find(price => {
    return String(price.rental_period_id) === String(rentalPeriodId.value)
  })

  return matchingPrice?.price ?? null
})

const displayPrice = computed(() => {
  if (purchaseMode.value === 'rent') {
    return rentalPrice.value
  }

  return currentProduct.value?.price ?? null
})

const hasOldPrice = computed(() => {
  if (purchaseMode.value !== 'buy') {
    return false
  }

  const oldPrice = Number(currentProduct.value?.old_price || 0)
  const currentPrice = Number(displayPrice.value || 0)

  return oldPrice > currentPrice
})

const isInCart = computed(() => {
  if (!currentProduct.value?.id) {
    return false
  }

  return cartStore.isItemInCart(
    currentProduct.value.id,
    'card',
    purchaseMode.value === 'rent' ? rentalPeriodId.value : undefined,
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

  const normalizedValue = String(value).replaceAll('_', ' ')

  return (
    normalizedValue.charAt(0).toUpperCase() +
    normalizedValue.slice(1).toLowerCase()
  )
}

const normalizeQuantity = () => {
  quantity.value = Math.max(1, Number.parseInt(quantity.value, 10) || 1)
}

const increaseQuantity = () => {
  normalizeQuantity()

  quantity.value += 1
}

const decreaseQuantity = () => {
  normalizeQuantity()

  quantity.value = Math.max(1, quantity.value - 1)
}

const setPurchaseMode = mode => {
  if (mode === 'rent' && !canRent.value) {
    return
  }

  purchaseMode.value = mode
}

const selectRentalPeriod = (periodId, close) => {
  rentalPeriodId.value = periodId
  close()
}

const setInitialRentalPeriod = () => {
  const periods = cartStore.rentalPeriods || []

  if (!periods.length) {
    rentalPeriodId.value = null
    return
  }

  const currentlyAvailable = periods.some(period => {
    return String(period.id) === String(rentalPeriodId.value)
  })

  if (!currentlyAvailable) {
    rentalPeriodId.value = periods[0].id
  }
}

const fetchProductData = async () => {
  if (!props.productId) {
    error.value = 'Product ID is missing'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await Promise.all([
      productStore.fetchProductDetails(props.productId),
      cartStore.rentalPeriods?.length
        ? Promise.resolve()
        : cartStore.fetchRentalPeriods(),
    ])

    setInitialRentalPeriod()
  } catch (fetchError) {
    console.error('Unable to load product details:', fetchError)

    error.value =
      fetchError?.response?.data?.message ||
      fetchError?.message ||
      'Unable to load product details'
  } finally {
    loading.value = false
  }
}

const redirectToLogin = () => {
  emit('update:show', false)
  emit('close')

  router.push({
    name: 'Auth',
    query: {
      form: 'signin',
      redirect: router.currentRoute.value.fullPath || '/',
    },
  })
}

const addPurchaseToCart = async () => {
  const result = await cartStore.addToCart(
    currentProduct.value.id,
    quantity.value,
    'card',
  )

  if (result?.isUnauthorized) {
    toast.warning('Please login to add items to cart')
    redirectToLogin()
    return
  }

  if (!result?.success) {
    if (result?.isAlreadyInCart) {
      toast.warning(result.message)
      return
    }

    throw new Error(result?.message || 'Failed to add item to cart')
  }

  toast.success(result.message || 'Item added to cart')
}

const addRentalToCart = async () => {
  if (!rentalPeriodId.value) {
    throw new Error('Please select a rental period')
  }

  const result = await cartStore.rentCard(
    currentProduct.value.id,
    rentalPeriodId.value,
  )

  if (result?.isUnauthorized) {
    toast.warning('Please login to rent a card')
    redirectToLogin()
    return
  }

  if (!result?.success) {
    if (result?.isAlreadyInCart) {
      toast.warning(result.message)
      return
    }

    throw new Error(result?.message || 'Failed to rent card')
  }

  toast.success(result.message || 'Rental added to cart')
}

const removeFromCart = async () => {
  const result = await cartStore.removeFromCart(
    currentProduct.value.id,
    'card',
    purchaseMode.value === 'rent' ? rentalPeriodId.value : undefined,
  )

  if (!result?.success) {
    throw new Error(result?.error || 'Failed to remove item')
  }

  toast.success('Item removed from cart')
}

const handleCartAction = async () => {
  if (isSubmitting.value || !currentProduct.value?.id) {
    return
  }

  normalizeQuantity()

  isSubmitting.value = true

  try {
    if (isInCart.value) {
      await removeFromCart()
    } else if (purchaseMode.value === 'rent') {
      await addRentalToCart()
    } else {
      await addPurchaseToCart()
    }

    await userStore.fetchProfile()
  } catch (cartError) {
    console.error('Cart action failed:', cartError)

    toast.error(
      cartError?.response?.data?.message ||
        cartError?.message ||
        'Cart action failed',
    )
  } finally {
    isSubmitting.value = false
  }
}

const handleClose = () => {
  emit('update:show', false)
  emit('close')
}

const handleShowUpdate = value => {
  emit('update:show', value)
}

watch(
  () => props.show,
  async isOpen => {
    if (!isOpen) {
      return
    }

    purchaseMode.value = props.rent ? 'rent' : 'buy'
    quantity.value = 1

    await fetchProductData()
  },
  {
    immediate: true,
  },
)

watch(
  () => props.productId,
  async (productId, previousProductId) => {
    if (props.show && productId && productId !== previousProductId) {
      quantity.value = 1
      await fetchProductData()
    }
  },
)

watch(
  () => props.rent,
  rent => {
    purchaseMode.value = rent ? 'rent' : 'buy'
  },
)

watch(
  () => cartStore.rentalPeriods,
  () => {
    setInitialRentalPeriod()
  },
  {
    deep: true,
  },
)
</script>

<style lang="scss" scoped>
.product-details {
  display: grid;
  align-items: center;
  gap: clamp(30px, 4vw, 64px);
  grid-template-columns:
    minmax(260px, 38%)
    minmax(0, 1fr);

  width: 100%;
  min-height: 520px;

  &_loading,
  &_error {
    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 480px;
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
    &:not(:last-child) {
      margin-bottom: 18px;
    }
  }

  &__state-message {
    color: var(--error-color);

    &:not(:last-child) {
      margin-bottom: 24px;
    }
  }

  &__state-button {
    width: min(100%, 260px);

    margin: 0 auto;
  }

  &__preview {
    display: flex;
    align-items: center;
    justify-content: center;

    min-width: 0;
  }

  &__card {
    position: relative;

    width: min(100%, 365px);
    aspect-ratio: 0.69;

    container-type: inline-size;
  }

  &__card-frame {
    position: absolute;
    inset: 50% auto auto 50%;
    z-index: 2;

    width: 100%;
    height: 100%;

    object-fit: contain;

    transform: translate(-50%, -50%);
  }

  &__card-image {
    position: absolute;
    top: 15%;
    left: 50%;
    z-index: 2;

    width: 57%;
    height: 38%;

    -o-object-fit: cover;
    object-fit: cover;

    transform: translate(-50%);
  }

  &__card-name {
    position: absolute;
    top: 43%;
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

  &__card-stat {
    position: absolute;
    z-index: 4;

    color: var(--primary-color);
    font-family: var(--font-pt-serif);
    font-size: 30px;
    font-weight: 700;
    line-height: 1;

    paint-order: stroke fill;

    &_mana {
      top: 12%;
      left: 19%;

      -webkit-text-stroke: clamp(1px, 0.8cqi, 2px) #01588a;
    }

    &_attack {
      bottom: 12%;
      left: 19%;

      -webkit-text-stroke: clamp(1px, 0.8cqi, 2px) #066508;
    }

    &_health {
      right: 19%;
      bottom: 12%;

      -webkit-text-stroke: clamp(1px, 0.8cqi, 2px) #7a0102;
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

    &:not(:last-child) {
      margin-bottom: 22px;
    }
  }

  &__attribute {
    display: grid;
    gap: 14px;
    grid-template-columns: minmax(60px, 68px) minmax(0, 1fr);

    font-size: 14px;
  }

  &__attribute-label,
  &__description-label,
  &__control-label {
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

  &__description {
    display: grid;
    gap: 14px;
    grid-template-columns: 115px minmax(0, 1fr);

    color: var(--secondary-color);
    font-size: 14px;
    line-height: 150%;

    &:not(:last-child) {
      margin-bottom: 30px;
    }
  }

  &__description-content {
    :deep(p) {
      margin: 0;
    }
  }

  &__switcher {
    display: flex;

    width: min(100%, 212px);

    &:not(:last-child) {
      margin-bottom: 14px;
    }
  }

  &__switch {
    min-height: 36px;

    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    text-transform: uppercase;

    &_first {
      border-bottom-right-radius: 0;
      border-top-right-radius: 0;
    }

    &_last {
      border-bottom-left-radius: 0;
      border-top-left-radius: 0;
    }
  }

  &__divider {
    width: 100%;
    height: 1px;

    margin-bottom: 28px;

    background-color: var(--border-secondary-color);
  }

  &__purchase {
    display: grid;
    align-items: end;
    gap: 20px;
    grid-template-columns:
      minmax(150px, 1fr)
      minmax(150px, 1fr)
      minmax(170px, auto);
  }

  &__price,
  &__quantity,
  &__rental {
    display: flex;
    flex-direction: column;
    gap: 12px;

    min-width: 0;
  }

  &__price-value {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__old-price {
    opacity: 0.5;

    text-decoration: line-through;
  }

  &__quantity-controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__quantity-button {
    display: flex;
    flex: 0 0 auto;
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
  }

  &__rental-dropdown {
    width: 100%;
  }

  &__rental-option {
    display: flex;
    align-items: center;

    width: 100%;
    min-height: 38px;

    padding: 8px 10px;

    border: 0;
    border-radius: 4px;
    outline: none;
    background-color: transparent;

    color: var(--third-color);
    font-family: var(--font-inter);
    font-size: 14px;
    text-align: left;

    cursor: pointer;

    transition:
      color 0.3s ease,
      background-color 0.3s ease;

    &_selected {
      background-color: var(--hint-third-color);

      color: var(--primary-color);

      pointer-events: none;
    }

    @media (any-hover: hover) {
      &:not(&_selected):hover {
        background-color: var(--border-fourth-color);

        color: var(--hint-secondary-color);
      }
    }
  }

  &__cart-button {
    min-width: 170px;
    min-height: 46px;

    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    text-transform: uppercase;
  }

  &__button-loader {
    width: 20px;
    height: 20px;

    border: 2px solid currentColor;
    border-radius: 50%;

    animation: product-details-spin 0.8s linear infinite;

    border-bottom-color: transparent;
    border-right-color: transparent;
  }

  @media (max-width: $md3) {
    grid-template-columns: minmax(220px, 36%) minmax(0, 1fr);

    &__attributes {
      gap-right: 25px;
    }

    &__purchase {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__cart-button {
      grid-column: 1 / -1;
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

    &__purchase {
      grid-template-columns: 1fr;
    }

    &__cart-button {
      grid-column: auto;

      width: 100%;
    }
  }
}

@keyframes product-details-spin {
  to {
    transform: rotate(360deg);
  }
}

/*
 * BaseModal receives this class through:
 *
 * class="product-details-modal"
 */
:global(.product-details-modal) {
  max-width: 1180px;
}

:global(.product-details-modal .base-modal__frame) {
  padding: clamp(30px, 3vw, 55px) clamp(18px, 3.5vw, 48px);

  background-color: var(--bg-fifth-color);
}

:global(.product-details-modal__content) {
  width: 100%;
}
</style>
