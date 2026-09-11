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

    <div class="product-list-item__content">
      <div v-if="category" class="product-list-item__category">
        {{ $t(category.parent.title) }}
      </div>

      <div v-if="item.title" class="product-list-item__title">
        {{ item.title }}
      </div>

      <div class="product-list-item__bottom">
        <PriceFormatter size="size-21" :price="item.price" class="product-list-item__price" />
      </div>
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

    @include adaptiveValue('padding-bottom', 75%, 68%);

    overflow: hidden;

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
      display: none;
    }
  }

  &__favorite-icon {
    @include adaptiveValue('min-width', 18, 15);

    @include adaptiveValue('height', 18, 15);

    color: inherit;
  }

  &__content {
    min-width: 0;

    flex: 1 1 auto;

    display: flex;
    flex-direction: column;

    @include adaptiveValue('padding-top', 15, 10);

    @include adaptiveValue('padding-right', 15, 10);

    @include adaptiveValue('padding-bottom', 15, 10);

    @include adaptiveValue('padding-left', 15, 10);
  }

  &__category {
    min-width: 0;

    color: var(--teal-color);

    @include adaptiveValue('font-size', 11, 9);

    @include adaptiveValue('line-height', 15, 12);

    font-weight: 700;

    @include adaptiveValue('letter-spacing', 1.54, 1);

    text-transform: uppercase;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 6, 4);
    }
  }

  &__title {
    min-width: 0;

    color: var(--primary-color);

    @include adaptiveValue('font-size', 15, 11);

    @include adaptiveValue('line-height', 19.5, 15);

    font-weight: 700;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 18, 10);
    }
  }

  &__bottom {
    margin-top: auto;

    display: flex;
    align-items: center;
    justify-content: space-between;

    @include adaptiveValue('padding-top', 4, 2);
  }

  &__price {
  }

  @media (max-width: $md8) {
    &__content {
      min-height: 92px;
    }
  }
}
</style>
