<script setup>
import { computed, ref, toRefs } from 'vue'

import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useCurrStore } from '@/stores/currencies'
import { useLoginModalStore } from '@/stores/loginModal'

import BaseButton from '@/components/ui/BaseButton.vue'
import PriceFormatter from './ui/PriceFormatter.vue'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },

  itemCurr: {
    type: Object,
    required: false,
  },
  isBought: {
    type: Boolean,
    default: false,
    required: false,
  },
})

const { item } = toRefs(props)

const authStore = useAuthStore()
const cartStore = useCartStore()
const currStore = useCurrStore()
const loginModalStore = useLoginModalStore()

const isLoading = ref(false)

const isInCart = computed(() => {
  if (!cartStore.cart || !Array.isArray(cartStore.cart.products)) {
    return false
  }

  return cartStore.cart.products.some((cartItem) => cartItem.id === item.value.id)
})

const category = computed(() => {
  if (!item.value?.categories || !Array.isArray(item.value.categories)) {
    return null
  }

  return item.value.categories.find((categoryItem) => categoryItem.parent !== null)
})

const decodeHtmlEntities = (value) => {
  if (!value) {
    return ''
  }

  const textarea = document.createElement('textarea')
  textarea.innerHTML = value

  return textarea.value
}

const getProductLink = (product) => {
  if (!product || !product.categories || !product.categories.length) {
    return '/products'
  }

  const productCategory = product.categories.find((categoryItem) => categoryItem.parent !== null)

  if (!productCategory?.parent) {
    return '/products'
  }

  return `/products/${productCategory.parent.slug}/${productCategory.slug}/${product.id}`
}

const toggleCart = async () => {
  if (!authStore.isAuth) {
    loginModalStore.openModal()
    return
  }

  if (!item.value?.id || isLoading.value) {
    return
  }

  isLoading.value = true

  try {
    if (isInCart.value) {
      await cartStore.remove(item.value.id)
    } else {
      await cartStore.add(item.value.id)
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <RouterLink v-if="item" :to="getProductLink(item)" class="product-item">
    <div v-if="item.image" class="product-item__image _ibg">
      <img :alt="item.title" class="img" :src="item.image" />
    </div>
    <div class="product-item__content">
      <div v-if="category" class="product-item__categories">
        {{ $t(category.parent.title) }}
      </div>
      <div v-if="item.title" class="product-item__title">{{ decodeHtmlEntities(item.title) }}</div>
      <div class="product-item__prices">
        <PriceFormatter size="size-21" :price="item.price" class="product-item__price" />
      </div>
      <BaseButton
        v-if="!isBought"
        class="product-item__cart"
        :variant="isInCart ? 'bordered' : 'blue'"
        :icon="isInCart ? 'close' : ''"
        :disabled="isLoading"
        @click.prevent.stop="toggleCart"
      >
        <template v-if="!isInCart">
          {{ $t('Add to cart') }}
        </template>
      </BaseButton>
    </div>
  </RouterLink>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.product-item {
  border-radius: 14px;
  border: 2px solid var(--border-primary-color);
  background-color: var(--bg-primary-color);
  display: block;
  transition: border 0.3s ease 0s;
  @media (any-hover: hover) {
    &:hover {
      border-color: var(--hint-primary-color);
    }
  }
  &__image {
    border-top-left-radius: 14px;
    border-top-right-radius: 14px;
    overflow: hidden;
    width: 100%;
    padding-bottom: 75%;
  }
  &__content {
    padding: 15px;
  }
  &__categories {
    font-size: 11px;
    line-height: 15px;
    letter-spacing: 1.54px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--teal-color);
    white-space: nowrap;
    overflow: hidden;
    min-width: 0;
    text-overflow: ellipsis;
    &:not(:last-child) {
      margin-bottom: 6px;
    }
  }

  &__title {
    white-space: nowrap;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 15px;
    line-height: 19.5px;
    font-weight: 700;
    color: var(--primary-color);
    &:not(:last-child) {
      margin-bottom: 15px;
    }
  }

  &__prices {
    &:not(:last-child) {
      margin-bottom: 11px;
    }
  }

  &__price {
  }

  &__cart {
    width: 100%;
  }
}
</style>
