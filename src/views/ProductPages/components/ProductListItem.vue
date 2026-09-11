<script setup>
import { computed, ref, toRefs } from 'vue'

import { useAuthStore } from '@/stores/auth'
import { useLoginModalStore } from '@/stores/loginModal'
import { useWishListStore } from '@/stores/wishlist'

import PriceFormatter from '@/components/ui/PriceFormatter.vue'
import { FavoriteIcon } from '@/components/ui/icons'
import SvgIcon from '@/components/ui/icons/SvgIcon.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const { item } = toRefs(props)

const authStore = useAuthStore()
const loginModalStore = useLoginModalStore()
const wishListStore = useWishListStore()

const isLoading = ref(false)

const category = computed(() => {
  if (!item.value?.categories || !Array.isArray(item.value.categories)) {
    return null
  }

  return item.value.categories.find((categoryItem) => categoryItem.parent !== null)
})

const isFavorite = computed(() => {
  if (!Array.isArray(wishListStore.items)) {
    return false
  }

  return wishListStore.items.some((wishItem) => wishItem.id === item.value.id)
})

const getProductLink = (product) => {
  if (!product || !Array.isArray(product.categories)) {
    return '/products'
  }

  const productCategory = product.categories.find((categoryItem) => categoryItem.parent !== null)

  if (!productCategory?.parent) {
    return '/products'
  }

  return `/products/${productCategory.parent.slug}/${productCategory.slug}/${product.id}`
}

const toggleFavorite = async () => {
  if (!authStore.isAuth) {
    loginModalStore.openModal()
    return
  }

  if (!item.value?.id || isLoading.value) {
    return
  }

  isLoading.value = true

  try {
    if (isFavorite.value) {
      await wishListStore.remove(item.value.id)
    } else {
      await wishListStore.add(item.value.id)
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <RouterLink v-if="item" :to="getProductLink(item)" class="product-list-item">
    <div class="product-list-item__image _ibg">
      <img v-if="item.image" :src="item.image" :alt="item.title" />
      <div v-if="category" class="product-list-item__slug-title">
        {{ category.title }}
      </div>

      <button
        type="button"
        class="product-list-item__favorite"
        :class="{
          active: isFavorite,
        }"
        :disabled="isLoading"
        @click.prevent.stop="toggleFavorite"
      >
        <SvgIcon :icon="FavoriteIcon" class="product-list-item__favorite-icon" />
      </button>
    </div>

    <div class="product-list-item__top">
      <div v-if="category" class="product-list-item__category">
        {{ $t(category.parent.slug) }}
      </div>

      <div v-if="item.title" class="product-list-item__title">
        {{ item.title }}
      </div>
    </div>
    <div class="product-list-item__bottom">
      <PriceFormatter size="size-21-market" :price="item.price" class="product-list-item__price" />
      <div class="product-list-item__vat">{{ $t('incl. vat') }}</div>
    </div>
  </RouterLink>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.product-list-item {
  position: relative;

  min-width: 0;

  display: flex;
  flex-direction: column;

  border: 2px solid var(--border-primary-color);

  @include adaptiveValue('border-radius', 14, 10);

  background-color: var(--bg-primary-color);

  overflow: hidden;

  transition:
    border-color 0.3s ease,
    transform 0.3s ease;

  @media (any-hover: hover) {
    &:hover {
      border-color: var(--hint-primary-color);

      transform: translateY(-2px);
    }
  }

  &__image {
    position: relative;

    width: 100%;
    padding-bottom: 75%;

    overflow: hidden;
    @media (max-width: $md8) {
      padding-bottom: 68%;
    }
    img {
      transition: transform 0.3s ease;
    }

    @media (any-hover: hover) {
      .product-list-item:hover & {
        img {
          transform: scale(1.025);
        }
      }
    }
  }
  &__slug-title {
    @include adaptiveValue('top', 10, 6);

    @include adaptiveValue('left', 10, 6);
    position: absolute;
    width: fit-content;
    @include adaptiveValue('padding-top', 6, 4);
    @include adaptiveValue('padding-left', 10, 6);
    @include adaptiveValue('padding-bottom', 6, 4);
    @include adaptiveValue('padding-right', 10, 6);
    font-size: 10px;
    line-height: 14px;
    color: var(--bg-seventh-color);
    text-transform: uppercase;
    letter-spacing: 1.4px;
    border-radius: 6px;
    background-color: var(--bg-secondary-color);
    border: 2px solid var(--border-primary-color);
    display: flex;
    text-align: center;
    align-items: center;
    justify-content: center;
    @media (max-width: $md8) {
      @include hide-item;
    }
  }
  &__favorite {
    position: absolute;

    @include adaptiveValue('top', 10, 6);

    @include adaptiveValue('right', 10, 6);

    @include adaptiveValue('width', 38, 30);

    @include adaptiveValue('height', 38, 30);

    display: flex;
    align-items: center;
    justify-content: center;

    border: 2px solid var(--border-primary-color);

    @include adaptiveValue('border-radius', 10, 8);

    background-color: var(--bg-secondary-color);

    color: var(--seconday-color);

    z-index: 2;

    cursor: pointer;

    transition:
      border-color 0.3s ease,
      color 0.3s ease,
      background-color 0.3s ease;

    &.active {
      color: var(--hint-primary-color);

      border-color: var(--hint-primary-color);
    }

    &:disabled {
      opacity: 0.5;
      pointer-events: none;
    }

    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);

        border-color: var(--hint-primary-color);
      }
    }

    @media (max-width: $md8) {
      @include hide-item;
    }
  }

  &__favorite-icon {
    @include adaptiveValue('min-width', 18, 15);

    @include adaptiveValue('height', 18, 15);

    color: inherit;
  }

  &__top {
    min-width: 0;

    flex: 1 1 auto;

    display: flex;
    flex-direction: column;

    @include adaptiveValue('padding-top', 16, 12);

    @include adaptiveValue('padding-right', 18, 12);

    @include adaptiveValue('padding-bottom', 34, 22.5);

    @include adaptiveValue('padding-left', 18, 16);
  }

  &__category {
    min-width: 0;

    color: var(--seconday-color);

    @include adaptiveValue('font-size', 11, 10);

    @include adaptiveValue('line-height', 15, 14);

    @include adaptiveValue('letter-spacing', 1.54, 1.4);

    text-transform: uppercase;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 8, 6);
    }
  }

  &__title {
    min-width: 0;

    color: var(--primary-color);

    @include adaptiveValue('font-size', 15, 13);

    @include adaptiveValue('line-height', 20.3, 16.9);

    font-weight: 500;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__bottom {
    border-top: 2px solid var(--border-primary-color);
    margin-top: auto;

    display: flex;
    gap: 20px;
    align-items: center;
    justify-content: space-between;

    @include adaptiveValue('padding-top', 16, 13);
    @include adaptiveValue('padding-left', 18, 12);
    @include adaptiveValue('padding-bottom', 16, 13);
    @include adaptiveValue('padding-right', 18, 12);
  }

  &__price {
  }
  &__vat {
    @include adaptiveValue('font-size', 12, 10);
    @include adaptiveValue('line-height', 16, 14);
    color: var(--seconday-color);
  }
}
</style>
