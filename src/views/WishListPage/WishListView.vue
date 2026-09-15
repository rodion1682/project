<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useWishListStore } from '@/stores/wishlist'

import BaseButton from '@/components/ui/BaseButton.vue'
import Breadcrumbs from '@/components/ui/Breadcrumbs.vue'
import SvgIcon from '@/components/ui/icons/SvgIcon.vue'
import { FavoriteFilledIcon } from '@/components/ui/icons/index.js'
import { useI18n } from 'vue-i18n'
import WishlistProductItem from './components/WishlistProductItem.vue'

const { t } = useI18n()

const wishListStore = useWishListStore()
const router = useRouter()

const isClearing = ref(false)

const breadcrumbs = computed(() => [
  {
    title: t('Home'),
    link: '/',
  },
  {
    title: t('Wishlist'),
  },
])

const products = computed(() => {
  return Array.isArray(wishListStore.items) ? wishListStore.items : []
})

const productsCount = computed(() => {
  return products.value.length
})

const priceDroppedCount = computed(() => {
  return products.value.filter((product) => {
    const oldPrice = product?.old_price ?? product?.oldPrice ?? product?.price_old ?? null

    if (!oldPrice) {
      return false
    }

    return Number(oldPrice) > Number(product?.price || 0)
  }).length
})

const clearWishlist = async () => {
  if (!products.value.length || isClearing.value) {
    return
  }

  isClearing.value = true

  const ids = products.value.map((product) => product.id).filter(Boolean)

  try {
    for (const id of ids) {
      await wishListStore.remove(id)
    }
  } finally {
    isClearing.value = false
  }
}

const browseCatalog = () => {
  router.push('/products')
}
</script>

<template>
  <main class="wishlist-page">
    <div class="wishlist-page__container _cnt-home">
      <Breadcrumbs :items="breadcrumbs" class="wishlist-page__breadcrumbs" />

      <div class="wishlist-page__heading">
        <h1 class="wishlist-page__title">
          {{ $t('My wishlist') }}
        </h1>
      </div>

      <template v-if="products.length">
        <div class="wishlist-page__toolbar">
          <div class="wishlist-page__summary">
            {{ productsCount }}
            {{ $t(productsCount === 1 ? 'title' : 'titles') }}

            <template v-if="priceDroppedCount">
              <span>·</span>

              {{ priceDroppedCount }}
              {{ $t('dropped in price') }}
            </template>
          </div>

          <div class="wishlist-page__actions">
            <BaseButton
              variant="bordered"
              class="wishlist-page__clear"
              :disabled="isClearing"
              @click="clearWishlist"
            >
              {{ $t('Clear wishlist') }}
            </BaseButton>
          </div>
        </div>

        <div class="wishlist-page__items">
          <WishlistProductItem
            v-for="item in products"
            :key="item.id"
            :item="item"
            class="wishlist-page__item"
          />
        </div>
      </template>

      <div v-else class="wishlist-page__empty">
        <div class="wishlist-page__empty-box">
          <SvgIcon :icon="FavoriteFilledIcon" class="wishlist-page__empty-icon" />
        </div>

        <h2 class="wishlist-page__empty-title">
          {{ $t('Your wishlist is empty') }}
        </h2>

        <p class="wishlist-page__empty-text">
          {{ $t('Save games you like and find them here whenever you are ready to buy.') }}
        </p>

        <BaseButton class="wishlist-page__browse" @click="browseCatalog">
          {{ $t('Browse catalog') }}
        </BaseButton>
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.wishlist-page {
  width: 100%;
  min-width: 0;
  @include header-indent;
  @include adaptiveValue('padding-top', 36, 20);
  @include adaptiveValue('padding-bottom', 104, 50);

  &__container {
    min-width: 0;
  }

  &__breadcrumbs {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 34, 24);
    }
  }

  &__heading {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 20px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 20);
    }
  }

  &__title {
    margin: 0;

    color: var(--primary-color);

    font-family: var(--font-gabarito);

    @include adaptiveValue('font-size', 42, 30);

    line-height: 1.1;
    font-weight: 700;
  }

  &__toolbar {
    display: flex;
    align-items: center;

    gap: 20px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 18);
    }
  }

  &__summary {
    min-width: 0;

    color: var(--seconday-color);

    font-size: 13px;
    line-height: 18px;
    font-weight: 700;

    letter-spacing: 1.82px;

    text-transform: uppercase;

    span {
      margin: 0 4px;
    }
  }

  &__actions {
    display: flex;
    align-items: center;

    gap: 10px;

    margin-left: auto;
  }

  &__clear {
    min-width: 0;
    width: fit-content;
  }

  &__items {
    display: grid;

    grid-template-columns: repeat(6, minmax(0, 1fr));

    @include adaptiveValue('gap', 20, 14);

    min-width: 0;

    @media (max-width: $md1) {
      grid-template-columns: repeat(5, minmax(0, 1fr));
    }

    @media (max-width: $md2) {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    @media (max-width: $md3) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    @media (max-width: $md4) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: $md5) {
      display: flex;
      flex-direction: column;

      gap: 12px;
    }
  }

  &__item {
    min-width: 0;
  }

  &__empty {
    width: 100%;
    max-width: 560px;

    display: flex;
    align-items: center;
    flex-direction: column;

    margin: 0 auto;

    @include adaptiveValue('padding-top', 70, 35);
    @include adaptiveValue('padding-bottom', 70, 35);
    @include adaptiveValue('padding-left', 40, 20);
    @include adaptiveValue('padding-right', 40, 20);

    border: 2px solid var(--border-primary-color);
    border-radius: 14px;

    background-color: var(--bg-secondary-color);

    text-align: center;

    &-box {
      display: flex;
      align-items: center;
      justify-content: center;
      @include adaptiveValue('min-width', 64, 48);
      @include adaptiveValue('min-height', 64, 48);
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 22, 18);
      }
      border: 2px solid var(--hint-primary-color);
      border-radius: 14px;

      color: var(--hint-primary-color);
    }

    &-icon {
      @include adaptiveValue('min-width', 27, 18);
      @include adaptiveValue('height', 27, 18);
    }

    &-title {
      margin: 0 0 10px;

      color: var(--primary-color);

      font-family: var(--font-gabarito);

      @include adaptiveValue('font-size', 26, 22);

      line-height: 1.2;
      font-weight: 700;
    }

    &-text {
      max-width: 430px;

      margin: 0 0 24px;

      color: var(--seconday-color);

      font-size: 14px;
      line-height: 22px;
    }
  }

  &__browse {
    width: fit-content;

    min-width: 160px;
  }

  @media (max-width: $md5) {
    &__toolbar {
      align-items: flex-start;
      flex-direction: column;

      gap: 12px;
    }

    &__summary {
      font-size: 11px;
      line-height: 16px;

      letter-spacing: 1.54px;
    }

    &__actions {
      width: 100%;

      margin-left: 0;
    }

    &__clear {
      width: 100%;
    }
  }
}
</style>
