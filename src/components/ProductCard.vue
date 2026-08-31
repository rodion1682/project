<template>
  <article
    v-if="product"
    class="product-card"
    :class="[
      props.className,
      {
        'product-card_hovered': isCardHovered,
        'product-card_carousel': props.type === 'carousel',
        'product-card_new': props.new,
        'product-card_sale': props.sale,
        'product-card_owned': props.my,
        'product-card_rent': props.rent,
      },
    ]"
    @mouseenter="isCardHovered = true"
    @mouseleave="isCardHovered = false"
  >
    <div class="product-card__body">
      <div class="product-card__content">
        <h3 class="product-card__title">
          {{ product.name }}
        </h3>

        <button
          class="product-card__card"
          :aria-label="`${$t('View')} ${product.name}`"
          @click="openProductDetails"
        >
          <div class="product-card__background">
            <img
              :src="product.image_2"
              alt=""
              class="product-card__background-image"
              @error="handleBackgroundImageError"
            />
          </div>

          <div class="product-card__image-wrapper">
            <img
              :src="product.image"
              :alt="product.name"
              class="product-card__image"
              @error="handleProductImageError"
            />
          </div>
          <svg
            v-if="cardName"
            class="product-card__card-name"
            viewBox="0 0 300 110"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              <path :id="cardNamePathId" :d="cardNamePath" fill="none" />
            </defs>

            <text
              class="product-card__card-name-text"
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
          <div v-if="product.description" class="product-card__description">
            <span v-html="product.description" />
          </div>

          <div
            v-if="hasValue(product.mana_cost)"
            class="product-card__stat product-card__stat_mana"
          >
            {{ product.mana_cost }}
          </div>

          <div
            v-if="hasValue(product.attack)"
            class="product-card__stat product-card__stat_attack"
          >
            {{ product.attack }}
          </div>

          <div
            v-if="hasValue(product.health)"
            class="product-card__stat product-card__stat_health"
          >
            {{ product.health }}
          </div>

          <span class="product-card__view" aria-hidden="true">
            <SvgIcon class="product-card__view-icon" :icon="EyeIcon" />
          </span>
        </button>

        <div class="product-card__footer">
          <div class="product-card__price">
            <PriceFormatter :price="getPrice" />
          </div>

          <BaseButton
            v-if="!props.my"
            type="button"
            variant="bordered"
            class="product-card__cart-button"
            :class="{
              'product-card__cart-button_remove': isInCart,
            }"
            :disabled="isLoading"
            :aria-label="cartButtonLabel"
            @click.stop="handleCartAction"
          >
            <span
              v-if="isLoading"
              class="product-card__loader"
              aria-hidden="true"
            />

            <span v-else class="product-card__cart-text">
              {{ cartButtonLabel }}
            </span>
          </BaseButton>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import defaultImage from '@/assets/images/default-image.png'
import BaseButton from '@/components/base/BaseButton.vue'
import { EyeIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'
import { useToast } from '@/composables/useToast'
import { useCartStore } from '@/stores/cart'

const emit = defineEmits(['open'])

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
    validator: value => ['default', 'carousel'].includes(value),
  },

  new: {
    type: Boolean,
    default: false,
  },

  sale: {
    type: Boolean,
    default: false,
  },

  my: {
    type: Boolean,
    default: false,
  },

  rent: {
    type: Boolean,
    default: false,
  },
})

const openProductDetails = () => {
  emit('open', props.product)
}

const cartStore = useCartStore()
const toast = useToast()
const router = useRouter()
const { t } = useI18n()

const isLoading = ref(false)
const isCardHovered = ref(false)

const productLink = computed(() => ({
  name: 'ProductDetailsPage',

  params: {
    productId: props.product.id,
  },

  query: {
    rent: props.rent || undefined,
  },
}))

const instance = getCurrentInstance()

const cardName = computed(() => {
  return (
    props.product?.name ??
    props.product?.card_name ??
    props.product?.title ??
    ''
  )
})

const cardNamePathId = computed(() => {
  const componentId = instance?.uid ?? 'card'
  const productId =
    props.product?.id ?? props.product?.card_id ?? props.product?.external_id

  return `product-card-name-${componentId}-${productId ?? 'unknown'}`
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

const getPrice = computed(() => {
  if (props.rent && props.product?.rental_prices?.length) {
    return Number(props.product.rental_prices[0]?.price ?? 0).toFixed(2)
  }

  return Number(props.product?.price ?? 0).toFixed(2)
})

const isInCart = computed(() => {
  return cartStore.isItemInCart(props.product.id, 'card')
})

const cartButtonLabel = computed(() => {
  return isInCart.value ? t('Remove from cart') : t('Add to cart')
})

const hasValue = value => {
  return value !== null && value !== undefined && value !== ''
}

const handleBackgroundImageError = event => {
  event.currentTarget.src = defaultImage
}

const handleProductImageError = event => {
  event.currentTarget.src = defaultImage
}

const handleCartAction = async () => {
  if (isLoading.value) {
    return
  }

  if (isInCart.value) {
    await removeFromCart()
    return
  }

  await addToCart()
}

const removeFromCart = async () => {
  try {
    isLoading.value = true

    const { success, error: errorMessage } = await cartStore.removeFromCart(
      props.product.id,
      'card',
      props.rent,
    )

    if (success) {
      toast.success(t('Item removed from cart'))

      return
    }

    toast.error(errorMessage || t('Failed to remove item'))
  } catch (error) {
    toast.error(error.message || t('Failed to remove item'))
  } finally {
    isLoading.value = false
  }
}

const addToCart = async () => {
  try {
    isLoading.value = true

    const { success, isAlreadyInCart, message, isUnauthorized } =
      await cartStore.addToCart(props.product.id, 1, 'card', props.rent)

    if (success) {
      toast.success(message)
      return
    }

    if (isUnauthorized) {
      toast.warning(t('Please login to add items to cart'))

      router.push({
        name: 'Auth',

        query: {
          form: 'signin',
          redirect: router.currentRoute.value.fullPath || '/',
        },
      })

      return
    }

    if (isAlreadyInCart) {
      toast.warning(message)
      return
    }

    toast.error(message)
  } catch (error) {
    toast.error(error.message || t('Failed to add item to cart'))
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.product-card {
  position: relative;

  width: 100%;
  min-width: 0;

  text-align: center;

  transition: transform 0.3s ease;

  container-type: inline-size;

  &__body {
    position: relative;

    overflow: hidden;

    width: 100%;

    border: 1px solid var(--border-fourth-color);
    border-radius: clamp(4px, 3cqi, 8px);
    background-color: var(--bg-fourth-color);

    transition:
      border-color 0.3s ease,
      box-shadow 0.3s ease,
      transform 0.3s ease;
  }

  &__content {
    position: relative;

    width: 100%;

    padding: clamp(8px, 5cqi, 16px) clamp(7px, 4cqi, 14px)
      clamp(10px, 5cqi, 18px);
  }

  &__title {
    overflow: hidden;

    width: 100%;

    margin: 0 0 clamp(6px, 4cqi, 14px);

    color: var(--hint-primary-color);
    font-family: var(--font-inter);
    font-size: clamp(10px, 6cqi, 14px);
    font-weight: 500;
    line-height: 1.25;
    text-overflow: ellipsis;
    white-space: nowrap;

    transition: color 0.3s ease;
  }

  &__card {
    position: relative;

    display: block;

    width: 100%;
    aspect-ratio: 2 / 3;

    outline: none;

    color: inherit;

    transition: transform 0.3s ease;

    &:focus-visible {
      .product-card__view {
        visibility: visible;

        opacity: 1;

        transform: translate(-50%, -50%) scale(1);
      }
    }
  }

  &__background {
    position: absolute;
    inset: 0;

    width: 100%;
    height: 100%;
  }

  &__background-image {
    display: block;

    width: 100%;
    height: 100%;

    object-fit: contain;

    transition:
      filter 0.3s ease,
      transform 0.3s ease;
  }

  &__image-wrapper {
    position: absolute;
    top: 15%;
    left: 50%;

    width: 57%;
    height: 38%;

    transform: translateX(-50%);
    transition: transform 0.3s ease;
  }

  &__image {
    display: block;

    width: 100%;
    height: 100%;

    object-fit: contain;
  }
  &__card-name {
    position: absolute;
    top: 43%;
    left: 50%;
    z-index: 2;

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
  &__description {
    position: absolute;
    bottom: 14%;
    left: 50%;

    display: flex;
    overflow: hidden;
    align-items: center;
    justify-content: center;

    width: 56%;
    height: 22%;

    padding: 2%;

    color: #411e00;
    font-family: var(--font-inter);
    font-size: clamp(5px, 3.8cqi, 9px);
    line-height: 1.2;
    text-align: center;

    transform: translateX(-50%);

    :deep(p) {
      margin: 0;
    }
  }

  &__stat {
    position: absolute;
    z-index: 2;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 17%;
    aspect-ratio: 1;

    color: var(--primary-color);
    font-family: var(--font-pt-serif);
    font-size: clamp(14px, 10cqi, 28px);
    font-weight: 700;
    line-height: 1;

    paint-order: stroke fill;

    -webkit-text-fill-color: var(--primary-color);
    -webkit-text-stroke-width: clamp(1px, 0.8cqi, 2px);

    &_mana {
      top: 10%;
      left: 12.5%;

      -webkit-text-stroke-color: #01588a;
    }

    &_attack {
      bottom: 10%;
      left: 12.5%;

      -webkit-text-stroke-color: #066508;
    }

    &_health {
      right: 12.5%;
      bottom: 10%;

      -webkit-text-stroke-color: #7a0102;
    }
  }

  &__view {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 2;

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

    width: 32px;
    height: 32px;

    color: var(--primary-color);

    :deep(svg) {
      display: block;

      width: 100%;
      height: 100%;
    }
  }

  &__footer {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: clamp(8px, 5cqi, 14px);

    width: 100%;

    margin-top: clamp(8px, 5cqi, 16px);
  }

  &__price {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-height: clamp(20px, 11cqi, 28px);

    white-space: nowrap;

    :deep(*) {
      font-size: clamp(12px, 7cqi, 18px);
      line-height: 1;
    }

    :deep(svg),
    :deep(img) {
      width: clamp(14px, 8cqi, 20px);
      height: clamp(14px, 8cqi, 20px);
    }
  }

  &__cart-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(6px, 3cqi, 10px);

    width: 100%;
    min-width: 0;
    min-height: clamp(36px, 20cqi, 48px);

    padding: clamp(8px, 4cqi, 12px) clamp(10px, 6cqi, 18px);

    opacity: 0;

    font-size: clamp(11px, 6cqi, 15px);
    line-height: 1.2;
    text-align: center;
    text-transform: uppercase;

    pointer-events: auto;

    transform: translateY(0%);
    transition: all 0.3s ease 0s;

    &_remove {
      border-color: var(--error-color);

      color: var(--error-color);
    }

    &:disabled {
      cursor: wait;
    }
    @media (any-hover: none) {
      opacity: 1 !important;
    }
  }

  &__cart-text {
    overflow: hidden;

    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__loader {
    display: block;
    flex: 0 0 auto;

    width: clamp(14px, 8cqi, 20px);
    aspect-ratio: 1;

    border: clamp(1px, 1cqi, 2px) solid currentColor;
    border-radius: 50%;

    animation: product-card-spin 1s linear infinite;

    border-bottom-color: transparent;
    border-right-color: transparent;
  }

  &_hovered {
    .product-card__body {
      border-color: var(--border-secondary-color);
      box-shadow: 0 8px 24px rgb(0 0 0 / 25%);

      transform: translateY(-1%);
    }

    .product-card__title {
      color: var(--primary-color);
    }

    .product-card__card {
      transform: scale(1.02);
    }

    .product-card__background-image {
      filter: brightness(0.8);
    }

    .product-card__image-wrapper {
      transform: translateX(-50%) scale(1.03);
    }

    .product-card__cart-button {
      opacity: 1;

      pointer-events: auto;

      transform: translateY(10%);
    }

    .product-card__view {
      visibility: visible;

      opacity: 1;

      transform: translate(-50%, -50%) scale(1);
    }
  }

  &_carousel {
    width: 100%;
  }

  &_sale {
    .product-card__body {
      box-shadow: 0 0 20px rgb(238 57 85 / 15%);
    }
  }

  &_new {
    .product-card__body {
      box-shadow: 0 0 20px rgb(46 207 196 / 15%);
    }
  }

  @media (any-hover: hover) {
    &__cart-button:hover {
      &.product-card__cart-button_remove {
        background-color: var(--error-color);

        color: var(--primary-color);
      }
    }
  }
}

@keyframes product-card-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (any-hover: none) {
  .product-card {
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
</style>
