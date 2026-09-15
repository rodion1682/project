<script setup>
import { computed, ref, toRefs } from 'vue'

import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useCurrStore } from '@/stores/currencies'
import { useLoginModalStore } from '@/stores/loginModal'
import { useWishListStore } from '@/stores/wishlist'

import PriceFormatter from '@/components/ui/PriceFormatter.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const { item } = toRefs(props)

const authStore = useAuthStore()
const cartStore = useCartStore()
const currStore = useCurrStore()
const loginModalStore = useLoginModalStore()
const wishListStore = useWishListStore()

const isCartLoading = ref(false)
const isWishlistLoading = ref(false)

const category = computed(() => {
  if (!Array.isArray(item.value?.categories)) {
    return null
  }

  return item.value.categories.find((categoryItem) => categoryItem.parent !== null) || null
})

const platform = computed(() => {
  return category.value?.parent?.title || item.value?.platform || ''
})

const note = computed(() => {
  if (item.value?.old_price && Number(item.value.old_price) > Number(item.value.price)) {
    const oldPrice = Number(item.value.old_price)
    const price = Number(item.value.price)

    if (oldPrice > 0) {
      const discount = Math.round(((oldPrice - price) / oldPrice) * 100)

      return `Price dropped −${discount}%`
    }
  }

  if (item.value?.oldPrice && Number(item.value.oldPrice) > Number(item.value.price)) {
    const oldPrice = Number(item.value.oldPrice)
    const price = Number(item.value.price)

    const discount = Math.round(((oldPrice - price) / oldPrice) * 100)

    return `Price dropped −${discount}%`
  }

  return 'In stock'
})

const oldPrice = computed(() => {
  const value = item.value?.old_price ?? item.value?.oldPrice ?? item.value?.price_old ?? null

  if (!value || Number(value) <= Number(item.value?.price || 0)) {
    return null
  }

  return value
})

const isPriceDropped = computed(() => {
  return Boolean(oldPrice.value)
})

const isInCart = computed(() => {
  if (!Array.isArray(cartStore.cart?.products)) {
    return false
  }

  return cartStore.cart.products.some((product) => product.id === item.value.id)
})

const getProductLink = (product) => {
  if (!Array.isArray(product?.categories)) {
    return '/products'
  }

  const productCategory = product.categories.find((categoryItem) => categoryItem.parent !== null)

  if (!productCategory?.parent) {
    return '/products'
  }

  return `/products/${productCategory.parent.slug}/${productCategory.slug}/${product.id}`
}

const toggleWishlist = async () => {
  if (!authStore.isAuth) {
    loginModalStore.openModal()
    return
  }

  if (!item.value?.id || isWishlistLoading.value) {
    return
  }

  isWishlistLoading.value = true

  try {
    await wishListStore.remove(item.value.id)
  } finally {
    isWishlistLoading.value = false
  }
}

const toggleCart = async () => {
  if (!authStore.isAuth) {
    loginModalStore.openModal()
    return
  }

  if (!item.value?.id || isCartLoading.value) {
    return
  }

  isCartLoading.value = true

  try {
    if (isInCart.value) {
      await cartStore.remove(item.value.id)
    } else {
      await cartStore.add(item.value.id)
    }
  } finally {
    isCartLoading.value = false
  }
}
</script>

<template>
  <article v-if="item" class="wishlist-product">
    <RouterLink :to="getProductLink(item)" class="wishlist-product__image">
      <img v-if="item.image" :src="item.image" :alt="item.title" />

      <span v-if="platform" class="wishlist-product__platform">
        {{ $t(platform) }}
      </span>
    </RouterLink>

    <button
      type="button"
      class="wishlist-product__favorite"
      :disabled="isWishlistLoading"
      :aria-label="$t('Remove from wishlist')"
      @click="toggleWishlist"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"
        />
      </svg>
    </button>

    <div class="wishlist-product__content">
      <div
        class="wishlist-product__note"
        :class="{
          dropped: isPriceDropped,
        }"
      >
        {{ $t(note) }}
      </div>

      <RouterLink :to="getProductLink(item)" class="wishlist-product__title">
        {{ item.title }}
      </RouterLink>
    </div>

    <div class="wishlist-product__bottom">
      <div class="wishlist-product__prices">
        <PriceFormatter
          v-if="oldPrice"
          class="wishlist-product__old-price"
          size="size-12"
          :price="oldPrice"
        />

        <PriceFormatter class="wishlist-product__price" size="size-21" :price="item.price" />
      </div>

      <button
        type="button"
        class="wishlist-product__cart"
        :class="{
          active: isInCart,
        }"
        :disabled="isCartLoading"
        :aria-label="isInCart ? $t('Remove from cart') : $t('Add to cart')"
        @click="toggleCart"
      >
        <svg v-if="!isInCart" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 7h13l-1.5 9H8L6 4H3" />
          <circle cx="9" cy="20" r="1.2" />
          <circle cx="17" cy="20" r="1.2" />
        </svg>

        <svg v-else viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </svg>
      </button>
    </div>
  </article>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.wishlist-product {
  position: relative;

  min-width: 0;
  height: 100%;

  display: flex;
  flex-direction: column;

  overflow: hidden;

  border: 2px solid var(--border-primary-color);
  border-radius: 14px;

  background-color: var(--bg-secondary-color);

  transition:
    border-color 0.3s ease,
    transform 0.3s ease;

  @media (any-hover: hover) {
    &:hover {
      border-color: var(--hint-primary-color);
    }
  }

  &__image {
    position: relative;

    display: block;

    width: 100%;
    aspect-ratio: 4 / 3;

    overflow: hidden;

    background-color: var(--bg-third-color);

    img {
      position: absolute;

      inset: 0;

      width: 100%;
      height: 100%;

      object-fit: cover;

      transition: transform 0.4s ease;
    }

    @media (any-hover: hover) {
      &:hover {
        img {
          transform: scale(1.03);
        }
      }
    }
  }

  &__platform {
    position: absolute;

    top: 12px;
    left: 12px;

    max-width: calc(100% - 76px);

    overflow: hidden;

    padding: 4px 8px;

    border: 2px solid var(--border-primary-color);
    border-radius: 6px;

    background-color: var(--bg-secondary-color);

    color: var(--seconday-color);

    font-size: 10px;
    line-height: 14px;
    font-weight: 700;

    letter-spacing: 1.4px;

    text-transform: uppercase;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__favorite {
    position: absolute;

    z-index: 2;

    top: 12px;
    right: 12px;

    width: 40px;
    height: 40px;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0;

    border: 2px solid var(--hint-primary-color);
    border-radius: 10px;

    background-color: var(--bg-secondary-color);

    color: var(--hint-primary-color);

    cursor: pointer;

    transition:
      color 0.3s ease,
      background-color 0.3s ease,
      opacity 0.3s ease;

    svg {
      width: 17px;
      height: 17px;

      fill: currentColor;
    }

    &:disabled {
      opacity: 0.5;

      pointer-events: none;
    }

    @media (any-hover: hover) {
      &:hover {
        color: var(--light-color);

        background-color: var(--hint-primary-color);
      }
    }
  }

  &__content {
    min-width: 0;

    display: flex;
    flex: 1 1 auto;
    flex-direction: column;

    gap: 8px;

    padding: 16px 18px 0;
  }

  &__note {
    min-width: 0;

    overflow: hidden;

    color: var(--teal-color);

    font-size: 11px;
    line-height: 15px;
    font-weight: 700;

    letter-spacing: 1.54px;

    text-transform: uppercase;
    text-overflow: ellipsis;
    white-space: nowrap;

    &.dropped {
      color: var(--hint-primary-color);
    }
  }

  &__title {
    display: -webkit-box;

    min-width: 0;
    min-height: 41px;

    overflow: hidden;

    color: var(--primary-color);

    font-size: 15px;
    line-height: 20px;
    font-weight: 500;

    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;

    transition: color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);
      }
    }
  }

  &__bottom {
    min-width: 0;

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 10px;

    margin-top: 14px;

    padding: 14px 18px;

    border-top: 2px solid var(--border-primary-color);
  }

  &__prices {
    min-width: 0;

    display: flex;
    flex-direction: column;

    gap: 2px;
  }

  &__old-price {
    opacity: 0.55;

    text-decoration: line-through;
  }

  &__price {
    color: var(--primary-color);
  }

  &__cart {
    flex: 0 0 40px;

    width: 40px;
    height: 40px;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 0;

    border: 2px solid var(--hint-primary-color);
    border-radius: 10px;

    background-color: transparent;

    color: var(--hint-primary-color);

    cursor: pointer;

    transition:
      background-color 0.3s ease,
      color 0.3s ease,
      opacity 0.3s ease;

    svg {
      width: 17px;
      height: 17px;

      fill: none;

      stroke: currentColor;
      stroke-width: 1.5;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    &.active {
      color: var(--light-color);

      background-color: var(--hint-primary-color);
    }

    &:disabled {
      opacity: 0.5;

      pointer-events: none;
    }

    @media (any-hover: hover) {
      &:hover {
        color: var(--light-color);

        background-color: var(--hint-primary-color);
      }
    }
  }

  @media (max-width: $md5) {
    min-height: 95px;

    display: grid;

    grid-template-columns: 84px minmax(0, 1fr) 44px;
    grid-template-rows: 1fr;

    align-items: center;

    gap: 12px;

    padding: 14px;

    &__image {
      grid-column: 1;
      grid-row: 1;

      width: 84px;
      height: 63px;

      aspect-ratio: auto;

      border-radius: 8px;

      img {
        border-radius: 8px;
      }
    }

    &__platform,
    &__favorite {
      display: none;
    }

    &__content {
      grid-column: 2;
      grid-row: 1;

      align-self: center;

      gap: 5px;

      padding: 0;
    }

    &__note {
      font-size: 10px;
      line-height: 14px;

      letter-spacing: 1.4px;
    }

    &__title {
      min-height: 0;

      font-size: 14px;
      line-height: 18px;
      font-weight: 500;
    }

    &__bottom {
      display: contents;
    }

    &__prices {
      grid-column: 2;
      grid-row: 1;

      align-self: end;

      flex-direction: row-reverse;
      align-items: baseline;
      justify-content: flex-end;

      gap: 8px;

      padding: 0 0 1px;

      pointer-events: none;
    }

    &__content {
      padding-bottom: 25px;
    }

    &__old-price {
      font-size: 11px;
      line-height: 14px;
    }

    &__price {
      font-size: 16px;
      line-height: 20px;
    }

    &__cart {
      grid-column: 3;
      grid-row: 1;

      width: 44px;
      height: 44px;

      flex-basis: 44px;

      align-self: center;
    }
  }

  @media (max-width: 374.98px) {
    grid-template-columns: 72px minmax(0, 1fr) 40px;

    gap: 10px;

    padding: 12px;

    &__image {
      width: 72px;
      height: 56px;
    }

    &__cart {
      width: 40px;
      height: 40px;
    }
  }
}
</style>
