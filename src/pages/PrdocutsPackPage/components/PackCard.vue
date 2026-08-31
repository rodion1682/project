<template>
  <article
    v-if="product"
    class="pack-card"
    :class="[
      props.className,
      {
        'pack-card_hovered': isCardHovered,
        'pack-card_carousel': props.type === 'carousel',
        'pack-card_owned': props.my,
        'pack-card_in-cart': isInCart,
      },
    ]"
    @mouseenter="isCardHovered = true"
    @mouseleave="isCardHovered = false"
  >
    <div class="pack-card__body">
      <h3 class="pack-card__title" :title="packName">
        {{ packName }}
      </h3>

      <!-- Opens PackDetailsModal -->
      <button
        type="button"
        class="pack-card__preview"
        :disabled="!packId"
        :aria-label="`${$t('View')} ${packName}`"
        @click="openPackDetails"
      >
        <div class="pack-card__image-wrapper">
          <img
            :src="packImage"
            :alt="packName"
            class="pack-card__image"
            @error="handleImageError"
          />
        </div>

        <!-- Same eye overlay as ProductCard -->
        <span class="pack-card__view" aria-hidden="true">
          <SvgIcon :icon="EyeIcon" class="pack-card__view-icon" />
        </span>
      </button>

      <!-- Catalog pack controls -->
      <div v-if="!props.my" class="pack-card__footer">
        <div class="pack-card__price">
          <PriceFormatter :price="packPrice" />
        </div>

        <BaseButton
          type="button"
          variant="bordered"
          class="pack-card__cart-button"
          :class="{
            'pack-card__cart-button_remove': isInCart,
          }"
          :disabled="isLoading || !packId"
          :aria-label="cartButtonLabel"
          @click.stop="handleCartAction"
        >
          <span v-if="isLoading" class="pack-card__loader" aria-hidden="true" />

          <template v-else>
            <SvgIcon
              :icon="isInCart ? CloseIcon : CartIcon"
              class="pack-card__cart-icon"
            />

            <span class="pack-card__cart-text">
              {{ cartButtonLabel }}
            </span>
          </template>
        </BaseButton>
      </div>

      <!-- Owned pack information -->
      <div v-else class="pack-card__owned-footer">
        <span class="pack-card__quantity-label">
          {{ $t('Quantity') }}
        </span>

        <strong class="pack-card__quantity-value">
          {{ ownedQuantity }}
        </strong>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import defaultImage from '@/assets/images/default-image.png'
import BaseButton from '@/components/base/BaseButton.vue'
import { CartIcon, CloseIcon, EyeIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'
import { useToast } from '@/composables/useToast'
import axios from '@/plugins/axios'
import { useCartStore } from '@/stores/cart'

const STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN || ''

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },

  className: {
    type: [String, Array, Object],
    default: '',
  },

  type: {
    type: String,
    default: 'default',
    validator: value => {
      return ['default', 'carousel'].includes(value)
    },
  },

  my: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['open'])

const cartStore = useCartStore()
const router = useRouter()
const toast = useToast()
const { t } = useI18n()

const isLoading = ref(false)
const isCardHovered = ref(false)
const imageHasFailed = ref(false)
const detailsImage = ref('')

/*
 * Identifies the latest pack-image request. It prevents
 * an older request from replacing a newer pack image.
 */
let imageRequestId = 0

const packId = computed(() => {
  return (
    props.product?.pack_id ??
    props.product?.product_id ??
    props.product?.pack?.id ??
    props.product?.product?.id ??
    props.product?.id ??
    null
  )
})

const packName = computed(() => {
  return (
    props.product?.pack?.name ??
    props.product?.product?.name ??
    props.product?.name ??
    props.product?.title ??
    t('Card Pack')
  )
})

const existingDetailsImage = computed(() => {
  return (
    props.product?.image_details ??
    props.product?.pack?.image_details ??
    props.product?.product?.image_details ??
    ''
  )
})

const regularPackImage = computed(() => {
  return (
    props.product?.image ??
    props.product?.pack?.image ??
    props.product?.product?.image ??
    props.product?.image_2 ??
    props.product?.pack?.image_2 ??
    props.product?.product?.image_2 ??
    props.product?.img_url ??
    ''
  )
})

const rawPackImage = computed(() => {
  return (
    detailsImage.value ||
    existingDetailsImage.value ||
    regularPackImage.value ||
    ''
  )
})

const resolveImageUrl = value => {
  if (!value) {
    return defaultImage
  }

  if (
    value.startsWith('http://') ||
    value.startsWith('https://') ||
    value.startsWith('data:') ||
    value.startsWith('blob:')
  ) {
    return value
  }

  if (!STATIC_DOMAIN) {
    return value
  }

  const domain = STATIC_DOMAIN.replace(/\/$/, '')
  const path = value.startsWith('/') ? value : `/${value}`

  return `${domain}${path}`
}

const packImage = computed(() => {
  if (imageHasFailed.value) {
    return defaultImage
  }

  return resolveImageUrl(rawPackImage.value)
})

const packPrice = computed(() => {
  const value =
    props.product?.pack?.price ??
    props.product?.product?.price ??
    props.product?.price ??
    props.product?.base_price ??
    0

  const number = Number(value)

  return Number.isFinite(number) ? number : 0
})

const ownedQuantity = computed(() => {
  const value =
    props.product?.quantity ??
    props.product?.owned_quantity ??
    props.product?.count ??
    props.product?.amount ??
    props.product?.pivot?.quantity ??
    1

  const number = Number(value)

  if (!Number.isFinite(number)) {
    return 0
  }

  return Math.max(0, number)
})

const isInCart = computed(() => {
  if (!packId.value || props.my) {
    return false
  }

  return cartStore.isItemInCart(packId.value, 'pack')
})

const cartButtonLabel = computed(() => {
  return isInCart.value ? t('Remove from cart') : t('Add to cart')
})

const getResponsePack = response => {
  return (
    response?.data?.data ?? response?.data?.payload ?? response?.data ?? null
  )
}

const fetchDetailsImage = async () => {
  const currentPackId = packId.value

  if (!currentPackId) {
    detailsImage.value = ''
    return
  }

  if (existingDetailsImage.value) {
    detailsImage.value = existingDetailsImage.value
    return
  }

  const currentRequestId = ++imageRequestId

  try {
    const response = await axios.get(`/catalog/packs/${currentPackId}`)

    if (currentRequestId !== imageRequestId) {
      return
    }

    if (String(currentPackId) !== String(packId.value)) {
      return
    }

    const packDetails = getResponsePack(response)

    detailsImage.value = packDetails?.image_details || packDetails?.image || ''
  } catch (error) {
    if (currentRequestId !== imageRequestId) {
      return
    }

    console.error('Unable to load pack details image:', error)
    detailsImage.value = ''
  }
}

const handleImageError = event => {
  const image = event.currentTarget

  if (!image) {
    return
  }

  /*
   * If the details image fails, try the regular pack image
   * before falling back to the local default image.
   */
  if (detailsImage.value && regularPackImage.value) {
    detailsImage.value = ''
    image.src = resolveImageUrl(regularPackImage.value)
    return
  }

  if (image.dataset.fallbackApplied === 'true') {
    return
  }

  image.dataset.fallbackApplied = 'true'
  imageHasFailed.value = true
  image.src = defaultImage
}

const openPackDetails = () => {
  if (!packId.value) {
    console.error('Cannot open pack details: pack ID is missing', props.product)

    return
  }

  emit('open', props.product)
}

const redirectToLogin = async () => {
  await router.push({
    name: 'Auth',
    query: {
      form: 'signin',
      redirect: router.currentRoute.value.fullPath || '/',
    },
  })
}

const removeFromCart = async () => {
  isLoading.value = true

  try {
    const result = await cartStore.removeFromCart(packId.value, 'pack')

    if (!result?.success) {
      throw new Error(
        result?.error || result?.message || t('Failed to remove item'),
      )
    }

    toast.success(result.message || t('Item removed from cart'))
  } catch (error) {
    console.error('Unable to remove pack from cart:', error)

    toast.error(
      error?.response?.data?.message ||
        error?.message ||
        t('Failed to remove item'),
    )
  } finally {
    isLoading.value = false
  }
}

const addToCart = async () => {
  isLoading.value = true

  try {
    const result = await cartStore.addToCart(packId.value, 1, 'pack')

    if (result?.isUnauthorized) {
      toast.warning(t('Please login to add items to cart'))
      await redirectToLogin()
      return
    }

    if (result?.isAlreadyInCart) {
      toast.warning(result.message || t('Item is already in cart'))
      return
    }

    if (!result?.success) {
      throw new Error(result?.message || t('Failed to add item to cart'))
    }

    toast.success(result.message || t('Item added to cart'))
  } catch (error) {
    console.error('Unable to add pack to cart:', error)

    toast.error(
      error?.response?.data?.message ||
        error?.message ||
        t('Failed to add item to cart'),
    )
  } finally {
    isLoading.value = false
  }
}

const handleCartAction = async () => {
  if (isLoading.value || !packId.value || props.my) {
    return
  }

  if (isInCart.value) {
    await removeFromCart()
    return
  }

  await addToCart()
}

const resetPackImage = () => {
  imageRequestId += 1
  detailsImage.value = ''
  imageHasFailed.value = false
}

onMounted(() => {
  fetchDetailsImage()
})

watch(packId, (newPackId, previousPackId) => {
  if (!newPackId || String(newPackId) === String(previousPackId)) {
    return
  }

  resetPackImage()
  fetchDetailsImage()
})
</script>

<style lang="scss" scoped>
.pack-card {
  position: relative;

  display: flex;

  width: 100%;
  min-width: 0;
  height: 100%;

  text-align: center;

  container-type: inline-size;

  &__body {
    position: relative;

    display: flex;
    overflow: hidden;
    flex: 1 1 auto;
    flex-direction: column;
    align-items: center;

    width: 100%;
    min-height: 100%;

    padding: clamp(10px, 5cqi, 18px) clamp(8px, 4cqi, 15px)
      clamp(12px, 6cqi, 20px);

    border: 1px solid var(--border-fourth-color);
    border-radius: clamp(4px, 3cqi, 8px);
    background-color: var(--bg-fourth-color);

    transition:
      border-color 0.3s ease,
      background-color 0.3s ease,
      box-shadow 0.3s ease,
      transform 0.3s ease;
  }

  &__title {
    position: relative;
    z-index: 2;

    overflow: hidden;

    width: 100%;

    margin: 0 0 clamp(8px, 5cqi, 16px);

    color: var(--hint-primary-color);
    font-family: var(--font-inter);
    font-size: clamp(10px, 6cqi, 14px);
    font-weight: 500;
    line-height: 1.25;
    text-overflow: ellipsis;
    white-space: nowrap;

    transition: color 0.3s ease;
  }

  &__preview {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-width: 0;
    aspect-ratio: 0.82;

    margin: 0;
    padding: 0;

    border: 0;
    outline: none;
    background-color: transparent;

    color: inherit;

    appearance: none;
    cursor: pointer;

    transition: transform 0.3s ease;

    &:disabled {
      cursor: default;
    }

    &:focus-visible {
      outline: 1px solid var(--hint-secondary-color);
      outline-offset: 4px;

      .pack-card__view {
        visibility: visible;

        opacity: 1;

        transform: translate(-50%, -50%) scale(1);
      }
    }
  }

  &__image-wrapper {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    height: 100%;

    transition: transform 0.3s ease;
  }

  &__image {
    display: block;

    width: 100%;
    max-width: none;
    height: 100%;

    object-fit: contain;

    transition:
      filter 0.3s ease,
      transform 0.3s ease;
  }

  /*
   * Same eye treatment as ProductCard.
   */
  &__view {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 5;

    display: flex;
    visibility: hidden;
    align-items: center;
    justify-content: center;

    width: 70%;
    aspect-ratio: 1;

    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgb(0 0 0 / 25%) 0%,
      rgb(0 0 0 / 0%) 100%
    );
    opacity: 0;

    color: var(--primary-color);

    pointer-events: none;

    transform: translate(-50%, -50%) scale(0.75);
    transition:
      visibility 0.3s ease,
      opacity 0.3s ease,
      color 0.3s ease,
      transform 0.3s ease;
  }

  &__view-icon {
    display: block;

    width: clamp(24px, 15cqi, 32px);
    height: clamp(24px, 15cqi, 32px);

    color: var(--primary-color);

    filter: drop-shadow(0 2px 8px rgb(0 0 0 / 55%));

    :deep(svg) {
      display: block;

      width: 100%;
      height: 100%;
    }
  }

  /*
   * Price first, cart button directly beneath it.
   */
  &__footer {
    position: relative;

    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: clamp(8px, 5cqi, 14px);

    width: 100%;

    margin-top: auto;
    padding-top: clamp(10px, 5cqi, 18px);
  }

  &__price {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-height: clamp(22px, 12cqi, 30px);

    color: var(--primary-color);
    white-space: nowrap;

    transition: color 0.3s ease;

    :deep(.price-formatter),
    :deep(.price) {
      justify-content: center;
    }

    :deep(.price-formatter__text),
    :deep(.price__number) {
      font-family: var(--font-pt-serif);
      font-size: clamp(14px, 8cqi, 20px);
      font-weight: 700;
      line-height: 1;
    }

    :deep(.price-formatter__currency),
    :deep(.price__currency) {
      width: clamp(15px, 8cqi, 20px);
      height: clamp(15px, 8cqi, 20px);
    }
  }

  &__cart-button {
    position: relative;

    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(7px, 4cqi, 10px);

    width: 100%;
    min-width: 0;
    min-height: clamp(36px, 20cqi, 46px);

    padding: clamp(8px, 4cqi, 11px) clamp(10px, 6cqi, 18px);

    opacity: 0;

    font-size: clamp(10px, 5.5cqi, 14px);
    line-height: 1.2;
    text-align: center;
    text-transform: uppercase;

    pointer-events: none;

    transform: translateY(5px);
    transition:
      border-color 0.3s ease,
      background-color 0.3s ease,
      color 0.3s ease,
      opacity 0.3s ease,
      transform 0.3s ease;

    &_remove {
      border-color: var(--error-color);

      color: var(--error-color);
    }

    &:disabled {
      opacity: 0.5;

      cursor: wait;
    }
  }

  &__cart-icon {
    flex: 0 0 auto;

    width: clamp(16px, 8cqi, 20px);
    height: clamp(16px, 8cqi, 20px);

    color: currentColor;
  }

  &__cart-text {
    overflow: hidden;

    min-width: 0;

    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__loader {
    display: block;

    width: clamp(16px, 8cqi, 20px);
    aspect-ratio: 1;

    border: 2px solid currentColor;
    border-radius: 50%;

    animation: pack-card-spin 0.8s linear infinite;

    border-bottom-color: transparent;
    border-right-color: transparent;
  }

  &__owned-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-height: clamp(52px, 26cqi, 66px);

    margin-top: auto;
    padding-top: clamp(10px, 5cqi, 18px);

    border-top: 1px solid var(--border-fourth-color);
  }

  &__quantity-label {
    margin-bottom: clamp(3px, 2cqi, 6px);

    color: var(--hint-primary-color);
    font-family: var(--font-inter);
    font-size: clamp(10px, 5.5cqi, 13px);
    font-weight: 500;
    line-height: 1.2;
  }

  &__quantity-value {
    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: clamp(13px, 7cqi, 18px);
    font-weight: 500;
    line-height: 1;
  }

  &_hovered {
    .pack-card__body {
      border-color: var(--border-secondary-color);
      box-shadow: 0 8px 24px rgb(0 0 0 / 25%);

      transform: translateY(-1%);
    }

    .pack-card__title {
      color: var(--primary-color);
    }

    .pack-card__preview {
      transform: scale(1.02);
    }

    .pack-card__image {
      transform: scale(1.03);

      filter: brightness(0.8);
    }

    .pack-card__view {
      visibility: visible;

      opacity: 1;

      transform: translate(-50%, -50%) scale(1);
    }

    .pack-card__price {
      color: var(--hint-secondary-color);
    }

    .pack-card__cart-button {
      opacity: 1;

      pointer-events: auto;

      transform: translateY(0);
    }
  }

  &_carousel {
    width: 100%;
  }

  &_owned {
    .pack-card__preview {
      margin-bottom: clamp(8px, 4cqi, 14px);
    }
  }

  @media (any-hover: hover) {
    &__cart-button:hover {
      border-color: var(--hint-secondary-color);
      background-color: var(--hint-primary-color);

      color: var(--bg-primary-color);

      &.pack-card__cart-button_remove {
        border-color: var(--error-color);
        background-color: var(--error-color);

        color: var(--primary-color);
      }
    }
  }

  @media (max-width: $md4) {
    &__body {
      padding: 14px 10px 18px;
    }
  }

  @media (max-width: $md6) {
    max-width: 328px;

    margin: 0 auto;
  }
}

@media (any-hover: none) {
  .pack-card {
    &__cart-button {
      opacity: 1;

      pointer-events: auto;

      transform: translateY(0);
    }

    &__view {
      top: 8%;
      right: 8%;
      left: auto;

      visibility: visible;

      width: clamp(34px, 20cqi, 48px);

      opacity: 1;

      transform: none;
    }
  }
}

@keyframes pack-card-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
