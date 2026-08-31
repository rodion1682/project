<template>
  <article
    v-if="product"
    class="my-product-card"
    :class="[
      props.className,
      {
        'my-product-card_hovered': isCardHovered,
        'my-product-card_carousel': props.type === 'carousel',
        'my-product-card_rented': props.rented,
      },
    ]"
    @mouseenter="isCardHovered = true"
    @mouseleave="isCardHovered = false"
  >
    <div class="my-product-card__body">
      <div class="my-product-card__content">
        <h3 class="my-product-card__title" :title="cardName">
          {{ cardName }}
        </h3>

        <button
          type="button"
          class="my-product-card__card"
          :aria-label="`${$t('View')} ${cardName}`"
          @click="openCardDetails"
        >
          <!-- Card frame -->
          <div class="my-product-card__frame">
            <img
              :src="cardFrame"
              alt=""
              class="my-product-card__frame-image"
              @error="handleImageError"
            />
          </div>

          <!-- Card artwork -->
          <div class="my-product-card__artwork">
            <img
              :src="cardImage"
              :alt="cardName"
              class="my-product-card__artwork-image"
              @error="handleImageError"
            />
          </div>

          <svg
            v-if="cardName"
            class="my-product-card__card-name"
            viewBox="0 0 300 110"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <defs>
              <path :id="cardNamePathId" :d="cardNamePath" fill="none" />
            </defs>

            <text
              class="my-product-card__card-name-text"
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

          <!-- Card description -->
          <div v-if="cardDescription" class="my-product-card__description">
            <span v-html="cardDescription" />
          </div>

          <!-- Mana -->
          <span
            v-if="hasValue(cardData.mana_cost)"
            class="my-product-card__stat my-product-card__stat_mana"
          >
            {{ cardData.mana_cost }}
          </span>

          <!-- Attack -->
          <span
            v-if="hasValue(cardData.attack)"
            class="my-product-card__stat my-product-card__stat_attack"
          >
            {{ cardData.attack }}
          </span>

          <!-- Health -->
          <span
            v-if="hasValue(cardData.health)"
            class="my-product-card__stat my-product-card__stat_health"
          >
            {{ cardData.health }}
          </span>

          <!-- View overlay -->
          <span class="my-product-card__view" aria-hidden="true">
            <SvgIcon class="my-product-card__view-icon" :icon="EyeIcon" />
          </span>
        </button>

        <!-- Quantity instead of price/cart -->
        <div class="my-product-card__quantity">
          <span class="my-product-card__quantity-label">
            {{ $t('Quantity') }}
          </span>

          <strong class="my-product-card__quantity-value">
            {{ displayQuantity }}
          </strong>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed, getCurrentInstance, ref } from 'vue'

import defaultImage from '@/assets/images/default-image.png'
import { EyeIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

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

  rented: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['open'])

const isCardHovered = ref(false)
const instance = getCurrentInstance()

const cardData = computed(() => {
  return (
    props.product?.card ??
    props.product?.product ??
    props.product?.item ??
    props.product ??
    {}
  )
})

const cardId = computed(() => {
  return (
    cardData.value?.id ??
    props.product?.card_id ??
    props.product?.product_id ??
    props.product?.id ??
    'card'
  )
})

const cardName = computed(() => {
  return (
    cardData.value?.name ??
    cardData.value?.title ??
    props.product?.card_name ??
    props.product?.name ??
    props.product?.title ??
    ''
  )
})

/*
 * Every SVG path must have a unique ID.
 * This prevents several cards from using the path
 * belonging to the first card on the page.
 */
const cardNamePathId = computed(() => {
  const componentId = instance?.uid ?? 'card'

  return `my-product-card-name-${componentId}-${cardId.value}`
})

const cardNamePath = computed(() => {
  if (String(props.product?.type).toLowerCase() === 'spell') {
    return 'M 10 -10 Q 150 75 300 40'
  }

  return 'M 20 60 Q 150 25 280 60'
})

/*
 * Reduce the font size for longer card names.
 */
const cardNameFontSize = computed(() => {
  const length = cardName.value.trim().length

  if (length > 34) return 12
  if (length > 28) return 14
  if (length > 23) return 16
  if (length > 18) return 16
  if (length > 13) return 16

  return 16
})

const cardDescription = computed(() => {
  return (
    cardData.value?.description ||
    cardData.value?.card_description ||
    cardData.value?.text_effect ||
    props.product?.description ||
    props.product?.card_description ||
    props.product?.text_effect ||
    ''
  )
})

const cardImage = computed(() => {
  const image =
    cardData.value?.image ||
    cardData.value?.card_image ||
    cardData.value?.img_url ||
    props.product?.image ||
    props.product?.card_image ||
    props.product?.img_url

  return resolveImage(image)
})

const cardFrame = computed(() => {
  const image =
    cardData.value?.image_2 ||
    cardData.value?.card_image_2 ||
    cardData.value?.frame_image ||
    props.product?.image_2 ||
    props.product?.card_image_2 ||
    props.product?.frame_image

  return resolveImage(image)
})

const displayQuantity = computed(() => {
  const quantity =
    props.product?.quantity ??
    props.product?.owned_quantity ??
    props.product?.available_quantity ??
    props.product?.total_quantity ??
    props.product?.count ??
    props.product?.pivot?.quantity ??
    cardData.value?.quantity ??
    cardData.value?.owned_quantity ??
    getInstancesQuantity()

  const normalizedQuantity = Number.parseInt(quantity, 10)

  return Number.isFinite(normalizedQuantity)
    ? Math.max(0, normalizedQuantity)
    : 1
})

function getInstancesQuantity() {
  if (Array.isArray(props.product?.instances)) {
    return props.product.instances.length
  }

  if (Array.isArray(props.product?.cards)) {
    return props.product.cards.length
  }

  /*
   * Every rented-card response item represents
   * one rented card unless the API provides quantity.
   */
  if (
    props.rented ||
    props.product?.card_id ||
    props.product?.rental_period ||
    props.product?.rented_at
  ) {
    return 1
  }

  /*
   * Every individual owned-card instance also
   * represents one card.
   */
  if (props.product?.instance_uuid || props.product?.card_instance_id) {
    return 1
  }

  return 1
}

function extractMarkdownUrl(value) {
  const match = value.match(/^\[[^\]]+\]\(([^)]+)\)$/)

  return match?.[1] || value
}

function resolveImage(imageValue) {
  if (!imageValue) {
    return defaultImage
  }

  let image = String(imageValue).trim()

  /*
   * Supports a normal URL and an accidentally
   * returned Markdown-formatted URL:
   *
   * [https://example.com/image.png](https://example.com/image.png)
   */
  image = extractMarkdownUrl(image)

  if (
    image.startsWith('http://') ||
    image.startsWith('https://') ||
    image.startsWith('data:') ||
    image.startsWith('blob:')
  ) {
    return image
  }

  const staticDomain = String(import.meta.env.VITE_STATIC_DOMAIN || '').replace(
    /\/+$/,
    '',
  )

  const normalizedPath = image.startsWith('/') ? image : `/${image}`

  return staticDomain ? `${staticDomain}${normalizedPath}` : normalizedPath
}

function hasValue(value) {
  return value !== null && value !== undefined && value !== ''
}

function handleImageError(event) {
  const image = event.currentTarget

  if (!image || image.dataset.fallbackApplied === 'true') {
    return
  }

  image.dataset.fallbackApplied = 'true'
  image.src = defaultImage
}

function getDetailsProduct() {
  /*
   * Normalize rented-card fields before passing the card
   * to the details modal. The original response is kept
   * so rental information is not lost.
   */
  return {
    ...props.product,
    ...cardData.value,

    id: cardId.value,
    card_id: props.product?.card_id || cardId.value,

    name: cardName.value,
    description: cardDescription.value,

    image: cardImage.value,
    image_2: cardFrame.value,

    mana_cost: cardData.value?.mana_cost ?? props.product?.mana_cost ?? null,

    attack: cardData.value?.attack ?? props.product?.attack ?? null,

    health: cardData.value?.health ?? props.product?.health ?? null,

    quantity: displayQuantity.value,

    /*
     * Preserve the complete original API object.
     */
    original: props.product,
  }
}

function openCardDetails() {
  if (!cardId.value) {
    return
  }

  emit('open', getDetailsProduct())
}
</script>

<style lang="scss" scoped>
.my-product-card {
  position: relative;

  width: 100%;
  min-width: 0;

  text-align: center;

  container-type: inline-size;

  &__body {
    position: relative;

    overflow: hidden;

    width: 100%;
    min-height: 100%;

    border: 1px solid transparent;
    border-radius: clamp(3px, 2cqi, 6px);
    background-color: var(--bg-fourth-color);

    transition:
      border-color 0.3s ease,
      box-shadow 0.3s ease,
      transform 0.3s ease;
  }

  &__content {
    width: 100%;

    padding: clamp(10px, 6cqi, 18px) clamp(8px, 4cqi, 14px)
      clamp(14px, 7cqi, 22px);
  }

  &__title {
    overflow: hidden;

    width: 100%;

    margin: 0 0 clamp(8px, 5cqi, 16px);

    color: var(--hint-primary-color);
    font-family: var(--font-inter);
    font-size: clamp(10px, 6cqi, 14px);
    font-weight: 500;
    line-height: 1.3;
    text-overflow: ellipsis;
    white-space: nowrap;

    transition: color 0.3s ease;
  }

  &__card {
    position: relative;

    display: block;

    width: 100%;
    aspect-ratio: 0.69;

    margin: 0;
    padding: 0;

    border: 0;
    outline: none;
    background: transparent;

    color: inherit;

    appearance: none;
    cursor: pointer;

    transition: transform 0.3s ease;

    &:focus-visible {
      outline: 1px solid var(--hint-secondary-color);
      outline-offset: 3px;

      .my-product-card__view {
        visibility: visible;

        opacity: 1;

        transform: translate(-50%, -50%) scale(1);
      }
    }
  }

  &__frame {
    position: absolute;
    inset: 0;
    z-index: 2;

    width: 100%;
    height: 100%;

    pointer-events: none;
  }

  &__frame-image {
    display: block;

    width: 100%;
    height: 100%;

    object-fit: contain;

    transition:
      filter 0.3s ease,
      transform 0.3s ease;
  }

  &__artwork {
    position: absolute;
    top: 15%;
    left: 50%;
    z-index: 2;

    overflow: hidden;

    width: 57%;
    height: 38%;

    transform: translateX(-50%);
    transition: transform 0.3s ease;
  }

  &__artwork-image {
    display: block;

    width: 100%;
    height: 100%;

    object-fit: cover;
    object-position: center;
  }
  &__card-name {
    position: absolute;
    top: 44%;
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
    bottom: 22%;
    left: 50%;
    z-index: 3;

    display: -webkit-box;
    overflow: hidden;

    width: 48%;
    max-height: 17%;

    color: #411e00;
    font-family: var(--font-pt-serif);
    font-size: clamp(5px, 4.7cqi, 12px);
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
    z-index: 2;

    color: var(--primary-color);
    font-family: var(--font-pt-serif);
    font-size: clamp(10px, 11cqi, 26px);
    font-weight: 700;
    line-height: 1;

    pointer-events: none;

    paint-order: stroke fill;

    &_mana {
      top: 10%;
      left: 18%;

      -webkit-text-stroke: clamp(1px, 0.8cqi, 2px) #01588a;
      @media (max-width: 1099.98px) {
        top: 11%;
      }
    }

    &_attack {
      bottom: 10%;
      left: 18%;
      @media (max-width: 1099.98px) {
        bottom: 12%;
      }
      -webkit-text-stroke: clamp(1px, 0.8cqi, 2px) #066508;
    }

    &_health {
      right: 18%;
      bottom: 10%;
      @media (max-width: 1099.98px) {
        bottom: 12%;
      }
      -webkit-text-stroke: clamp(1px, 0.8cqi, 2px) #7a0102;
    }
  }

  &__view {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 6;

    display: flex;
    visibility: hidden;
    align-items: center;
    justify-content: center;

    width: 70%;
    aspect-ratio: 1;

    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgb(0 0 0 / 35%) 0%,
      rgb(0 0 0 / 0%) 70%
    );
    opacity: 0;

    color: var(--primary-color);

    pointer-events: none;

    transform: translate(-50%, -50%) scale(0.75);
    transition:
      visibility 0.3s ease,
      opacity 0.3s ease,
      transform 0.3s ease;
  }

  &__view-icon {
    width: clamp(24px, 15cqi, 34px);
    height: clamp(24px, 15cqi, 34px);

    color: var(--primary-color);

    filter: drop-shadow(0 2px 8px rgb(0 0 0 / 60%));

    :deep(svg) {
      display: block;

      width: 100%;
      height: 100%;
    }
  }

  &__quantity {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(7px, 4cqi, 12px);

    width: 100%;

    margin-top: clamp(10px, 6cqi, 18px);
  }

  &__quantity-label {
    color: var(--hint-primary-color);
    font-family: var(--font-inter);
    font-size: clamp(10px, 5.5cqi, 14px);
    font-weight: 500;
    line-height: 1.3;
  }

  &__quantity-value {
    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: clamp(13px, 7cqi, 18px);
    font-weight: 500;
    line-height: 1;
  }

  &_hovered {
    .my-product-card__body {
      border-color: var(--border-secondary-color);
      box-shadow: 0 8px 24px rgb(0 0 0 / 25%);

      transform: translateY(-1%);
    }

    .my-product-card__title {
      color: var(--primary-color);
    }

    .my-product-card__card {
      transform: scale(1.02);
    }

    .my-product-card__frame-image {
      filter: brightness(0.82);
    }

    .my-product-card__artwork {
      transform: translateX(-50%) scale(1.03);
    }

    .my-product-card__view {
      visibility: visible;

      opacity: 1;

      transform: translate(-50%, -50%) scale(1);
    }

    .my-product-card__quantity-label {
      color: var(--hint-secondary-color);
    }
  }

  &_carousel {
    width: 100%;
  }

  &_rented {
    .my-product-card__body {
      box-shadow: 0 0 20px rgb(46 207 196 / 10%);
    }
  }
}
</style>
