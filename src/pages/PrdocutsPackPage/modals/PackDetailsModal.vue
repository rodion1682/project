<template>
  <BaseModal
    :show="props.show"
    class="pack-details-modal"
    content-class="pack-details-modal__content"
    size="product"
    :labelledby="titleId"
    @close="handleClose"
    @update:show="handleShowUpdate"
  >
    <div
      v-if="loading && !currentPack"
      class="pack-details pack-details_loading"
    >
      <LoadingSpinner class="pack-details__loader" />
    </div>

    <div
      v-else-if="error && !currentPack"
      class="pack-details pack-details_error"
    >
      <div class="pack-details__state">
        <h2 class="pack-details__state-title _h3">
          {{ $t('Unable to load pack') }}
        </h2>

        <p class="pack-details__state-message">
          {{ error }}
        </p>

        <BaseButton
          type="button"
          variant="bordered"
          class="pack-details__state-button"
          @click="fetchPackDetails"
        >
          {{ $t('Try again') }}
        </BaseButton>
      </div>
    </div>

    <div v-else-if="currentPack" class="pack-details">
      <!-- Pack image -->
      <div class="pack-details__preview">
        <img
          :src="packImage"
          :alt="packName"
          class="pack-details__image"
          @error="handleImageError"
        />
      </div>

      <!-- Pack information -->
      <div class="pack-details__information">
        <h2 :id="titleId" class="pack-details__title _h3">
          {{ packName }}
        </h2>

        <div v-if="packAttributes.length" class="pack-details__attributes">
          <div
            v-for="attribute in packAttributes"
            :key="attribute.label"
            class="pack-details__attribute"
          >
            <span class="pack-details__attribute-label">
              {{ attribute.label }}:
            </span>

            <span class="pack-details__attribute-value">
              {{ attribute.value }}
            </span>
          </div>
        </div>

        <div class="pack-details__description">
          <div class="pack-details__description-label">
            {{ $t('Description') }}:
          </div>

          <div
            v-if="currentPack.description"
            class="pack-details__description-content"
            v-html="currentPack.description"
          />

          <div v-else class="pack-details__description-content">—</div>
        </div>

        <div class="pack-details__divider" />

        <!-- Purchase -->
        <div class="pack-details__purchase">
          <div class="pack-details__price">
            <span class="pack-details__control-label">
              {{ $t('Price') }}
            </span>

            <PriceFormatter
              :price="packPrice"
              size="size-32"
              class="pack-details__price-value"
            />
          </div>

          <div class="pack-details__quantity">
            <span class="pack-details__control-label">
              {{ $t('Quantity') }}
            </span>

            <div class="pack-details__quantity-controls">
              <button
                type="button"
                class="pack-details__quantity-button"
                :disabled="quantity <= 1 || isSubmitting"
                :aria-label="$t('Decrease quantity')"
                @click="decreaseQuantity"
              >
                −
              </button>

              <BaseInput
                v-model="quantity"
                class="pack-details__quantity-input"
                inputmode="numeric"
                min="1"
                max="99"
                @blur="normalizeQuantity"
                @keydown.enter="normalizeQuantity"
              />

              <button
                type="button"
                class="pack-details__quantity-button"
                :disabled="quantity >= MAX_QUANTITY || isSubmitting"
                :aria-label="$t('Increase quantity')"
                @click="increaseQuantity"
              >
                +
              </button>
            </div>
          </div>

          <BaseButton
            type="button"
            class="pack-details__cart-button"
            :variant="isInCart ? 'bordered' : 'primary'"
            :disabled="isSubmitting || !currentPack.id"
            @click="handleCartAction"
          >
            <span
              v-if="isSubmitting"
              class="pack-details__button-loader"
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
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import defaultImage from '@/assets/images/default-image.png'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import BaseModal from '@/components/base/BaseModal.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'
import { useToast } from '@/composables/useToast'
import axios from '@/plugins/axios'
import { useCartStore } from '@/stores/cart'

const MAX_QUANTITY = 99

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },

  packId: {
    type: [String, Number],
    default: null,
  },

  /*
   * The catalog pack can be provided so that the modal
   * immediately shows basic information while full pack
   * details are loading.
   */
  initialPack: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['close', 'update:show', 'cart-updated'])

const router = useRouter()
const toast = useToast()
const cartStore = useCartStore()

const packDetails = ref(null)
const loading = ref(false)
const error = ref('')
const quantity = ref(1)
const isSubmitting = ref(false)
const imageHasFailed = ref(false)

const currentPack = computed(() => {
  return packDetails.value || props.initialPack
})

const titleId = computed(() => {
  return props.packId
    ? `pack-details-title-${props.packId}`
    : 'pack-details-title'
})

const packName = computed(() => {
  return currentPack.value?.name || currentPack.value?.title || 'Card Pack'
})

const packImage = computed(() => {
  if (imageHasFailed.value) {
    return defaultImage
  }

  return (
    currentPack.value?.image_details || currentPack.value?.image || defaultImage
  )
})

const packPrice = computed(() => {
  return Number(currentPack.value?.price ?? currentPack.value?.base_price ?? 0)
})

const rarityProbabilities = computed(() => {
  const probabilities = currentPack.value?.rarity_probabilities || []

  if (!Array.isArray(probabilities)) {
    return []
  }

  return probabilities
})

const guaranteedRarities = computed(() => {
  const rarities = currentPack.value?.guaranteed_rarities || []

  if (!Array.isArray(rarities)) {
    return []
  }

  return rarities
})

const formatRarity = rarity => {
  if (!rarity) {
    return ''
  }

  const value = String(rarity).replaceAll('_', ' ')

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

const formatProbability = probability => {
  const value = Number(probability)

  if (!Number.isFinite(value)) {
    return '0%'
  }

  /*
   * The API returns probabilities between 0 and 1.
   * Also supports an API returning percentages directly.
   */
  const percentage = value <= 1 ? value * 100 : value

  return `${percentage.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}%`
}

const packAttributes = computed(() => {
  const attributes = []

  if (
    currentPack.value?.card_count !== null &&
    currentPack.value?.card_count !== undefined
  ) {
    attributes.push({
      label: 'Cards',
      value: `${currentPack.value.card_count} ${currentPack.value.card_count === 1 ? 'Card' : 'Cards'}`,
    })
  }

  rarityProbabilities.value.forEach(item => {
    attributes.push({
      label: formatRarity(item.rarity),
      value: formatProbability(item.probability),
    })
  })

  guaranteedRarities.value.forEach(item => {
    attributes.push({
      label: `${formatRarity(item.rarity)} guaranteed`,
      value: item.quantity,
    })
  })

  return attributes
})

const isInCart = computed(() => {
  if (!currentPack.value?.id) {
    return false
  }

  return cartStore.isItemInCart(currentPack.value.id, 'pack')
})

const normalizeQuantity = () => {
  const parsedQuantity = Number.parseInt(quantity.value, 10)

  if (!Number.isFinite(parsedQuantity)) {
    quantity.value = 1
    return
  }

  quantity.value = Math.min(MAX_QUANTITY, Math.max(1, parsedQuantity))
}

const increaseQuantity = () => {
  normalizeQuantity()

  quantity.value = Math.min(MAX_QUANTITY, Number(quantity.value) + 1)
}

const decreaseQuantity = () => {
  normalizeQuantity()

  quantity.value = Math.max(1, Number(quantity.value) - 1)
}

const handleImageError = () => {
  imageHasFailed.value = true
}

const getResponsePack = response => {
  return (
    response?.data?.data || response?.data?.payload || response?.data || null
  )
}

const fetchPackDetails = async () => {
  if (!props.packId) {
    error.value = 'Pack ID is missing'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await axios.get(`/catalog/packs/${props.packId}`)

    const receivedPack = getResponsePack(response)

    if (!receivedPack || !receivedPack.id) {
      throw new Error('The server returned invalid pack details')
    }

    packDetails.value = receivedPack
  } catch (requestError) {
    console.error('Unable to load pack details:', requestError)

    error.value =
      requestError?.response?.data?.message ||
      requestError?.message ||
      'Unable to load pack details'
  } finally {
    loading.value = false
  }
}

const redirectToLogin = () => {
  handleClose()

  router.push({
    name: 'Auth',

    query: {
      form: 'signin',
      redirect: router.currentRoute.value.fullPath || '/',
    },
  })
}

const addToCart = async () => {
  normalizeQuantity()

  const result = await cartStore.addToCart(
    currentPack.value.id,
    Number(quantity.value),
    'pack',
  )

  if (result?.isUnauthorized) {
    toast.warning('Please login to add items to cart')

    redirectToLogin()
    return
  }

  if (!result?.success) {
    if (result?.isAlreadyInCart) {
      toast.warning(result.message || 'Item is already in cart')

      return
    }

    throw new Error(result?.message || 'Failed to add pack to cart')
  }

  toast.success(result.message || 'Pack added to cart')

  emit('cart-updated', {
    action: 'added',
    pack: currentPack.value,
    quantity: Number(quantity.value),
  })
}

const removeFromCart = async () => {
  const result = await cartStore.removeFromCart(currentPack.value.id, 'pack')

  if (!result?.success) {
    throw new Error(
      result?.error || result?.message || 'Failed to remove pack from cart',
    )
  }

  toast.success(result.message || 'Pack removed from cart')

  emit('cart-updated', {
    action: 'removed',
    pack: currentPack.value,
  })
}

const handleCartAction = async () => {
  if (isSubmitting.value || !currentPack.value?.id) {
    return
  }

  isSubmitting.value = true

  try {
    if (isInCart.value) {
      await removeFromCart()
    } else {
      await addToCart()
    }
  } catch (cartError) {
    console.error('Pack cart action failed:', cartError)

    toast.error(
      cartError?.response?.data?.message ||
        cartError?.message ||
        'Pack cart action failed',
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

const prepareModal = async () => {
  packDetails.value = null
  error.value = ''
  quantity.value = 1
  imageHasFailed.value = false

  await fetchPackDetails()
}

watch(
  () => props.show,
  isOpen => {
    if (isOpen) {
      prepareModal()
    }
  },
  {
    immediate: true,
  },
)

watch(
  () => props.packId,
  (packId, previousPackId) => {
    if (props.show && packId && packId !== previousPackId) {
      prepareModal()
    }
  },
)
</script>

<style lang="scss" scoped>
.pack-details {
  display: grid;
  align-items: center;
  gap: clamp(35px, 4vw, 65px);
  grid-template-columns:
    minmax(290px, 42%)
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
    width: min(100%, 480px);

    margin: auto;

    text-align: center;
  }

  &__state-title {
    &:not(:last-child) {
      margin-bottom: 16px;
    }
  }

  &__state-message {
    color: var(--error-color);

    &:not(:last-child) {
      margin-bottom: 24px;
    }
  }

  &__state-button {
    width: min(100%, 220px);

    margin: 0 auto;
  }

  &__preview {
    display: flex;
    align-items: center;
    justify-content: center;

    min-width: 0;
  }

  &__image {
    display: block;

    width: min(100%, 430px);
    max-height: 500px;

    object-fit: contain;
  }

  &__information {
    min-width: 0;
  }

  &__title {
    color: var(--primary-color);
    letter-spacing: 0.04em;
    text-align: left;
    text-transform: uppercase;

    &:not(:last-child) {
      margin-bottom: clamp(25px, 3vw, 40px);
    }
  }

  &__attributes {
    display: grid;
    gap: 18px 45px;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    &:not(:last-child) {
      margin-bottom: 25px;
    }
  }

  &__attribute {
    display: grid;
    gap: 14px;
    grid-template-columns:
      minmax(75px, 90px)
      minmax(0, 1fr);

    min-width: 0;

    font-family: var(--font-inter);
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
    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    line-height: 150%;

    &:not(:last-child) {
      margin-bottom: 30px;
    }
  }

  &__description-label {
    &:not(:last-child) {
      margin-bottom: 14px;
    }
  }

  &__description-content {
    overflow-y: auto;

    max-height: 170px;

    padding-right: 8px;

    scrollbar-color: var(--hint-primary-color) var(--bg-third-color);
    scrollbar-width: thin;

    :deep(p) {
      margin: 0;

      &:not(:last-child) {
        margin-bottom: 15px;
      }
    }

    :deep(ul),
    :deep(ol) {
      margin: 12px 0;
      padding-left: 20px;
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
    gap: 25px;
    grid-template-columns:
      minmax(160px, 1fr)
      minmax(150px, 1fr)
      minmax(170px, auto);
  }

  &__price,
  &__quantity {
    display: flex;
    flex-direction: column;
    gap: 12px;

    min-width: 0;
  }

  &__price-value {
    width: fit-content;
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

    animation: pack-details-spin 0.8s linear infinite;

    border-bottom-color: transparent;
    border-right-color: transparent;
  }

  @media (max-width: $md3) {
    grid-template-columns:
      minmax(250px, 38%)
      minmax(0, 1fr);

    &__attributes {
      gap: 15px 25px;
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

    &__image {
      width: min(75vw, 390px);
    }

    &__title {
      text-align: center;
    }
  }

  @media (max-width: $md6) {
    &__attributes {
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

@keyframes pack-details-spin {
  to {
    transform: rotate(360deg);
  }
}

:global(.pack-details-modal) {
  max-width: 1180px;
}

:global(.pack-details-modal .base-modal__frame) {
  padding: clamp(30px, 3vw, 55px) clamp(18px, 3.5vw, 48px);

  background-color: var(--bg-fifth-color);
}

:global(.pack-details-modal__content) {
  width: 100%;
}
</style>
