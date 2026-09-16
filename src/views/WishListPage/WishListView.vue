<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { useCurrStore } from '@/stores/currencies'
import { useLoginModalStore } from '@/stores/loginModal'
import { useWishListStore } from '@/stores/wishlist'

import Loader from '@/components/Loader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import Breadcrumbs from '@/components/ui/Breadcrumbs.vue'
import SvgIcon from '@/components/ui/icons/SvgIcon.vue'

import { FavoriteFilledIcon } from '@/components/ui/icons/index.js'

import WishlistProductItem from './components/WishlistProductItem.vue'

const { t } = useI18n()

const route = useRoute()
const router = useRouter()

const authStore = useAuthStore()
const currStore = useCurrStore()
const loginModalStore = useLoginModalStore()
const wishListStore = useWishListStore()

const isLoading = ref(false)
const isClearing = ref(false)

const cameFromProfile = computed(() => {
  const from = router.options.history.state.back

  return typeof from === 'string' && from.startsWith('/profile')
})

const breadcrumbs = computed(() => {
  const items = [
    {
      title: t('Home'),
      link: '/',
    },
  ]

  if (cameFromProfile.value) {
    items.push({
      title: t('Profile'),
      link: '/profile/overview',
    })
  }

  items.push({
    title: t('Wishlist'),
  })

  return items
})

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

const loadWishlist = async () => {
  if (!authStore.isAuth) {
    return
  }

  isLoading.value = true

  try {
    await wishListStore.getItems()
  } finally {
    isLoading.value = false
  }
}

const clearWishlist = async () => {
  if (!products.value.length || isClearing.value) {
    return
  }

  isClearing.value = true

  try {
    await wishListStore.clearWishlist()
  } finally {
    isClearing.value = false
  }
}

const browseCatalog = () => {
  router.push('/products')
}

watch(
  () => currStore.currency?.code,
  async (currency, previousCurrency) => {
    if (!currency || !authStore.isAuth || currency === previousCurrency) {
      return
    }

    await loadWishlist()
  },
)

watch(
  () => authStore.isAuth,
  async (isAuth) => {
    if (isAuth) {
      await loadWishlist()
      return
    }

    wishListStore.clear()
  },
)

onMounted(async () => {
  if (!authStore.isAuth) {
    loginModalStore.openModal()
    return
  }

  await loadWishlist()
})
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

      <div v-if="isLoading && !products.length" class="wishlist-page__loader">
        <Loader />
      </div>

      <template v-else-if="products.length">
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
              {{ isClearing ? $t('Clearing...') : $t('Clear wishlist') }}
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
  @include adaptiveValue('padding-top', 32, 18);
  @include adaptiveValue('padding-bottom', 104, 32);

  &__container {
    width: 100%;
    min-width: 0;
  }

  &__breadcrumbs {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 20);
    }
  }

  &__heading {
    display: flex;
    align-items: center;
    justify-content: space-between;

    min-width: 0;

    @include adaptiveValue('gap', 20, 12);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 18);
    }
  }

  &__title {
    min-width: 0;

    margin: 0;

    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-weight: 700;
    line-height: 1.1;

    @include adaptiveValue('font-size', 42, 30);
  }

  &__loader {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: center;

    @include adaptiveValue('min-height', 420, 260);
  }

  &__toolbar {
    width: 100%;
    min-width: 0;

    display: flex;
    align-items: center;

    @include adaptiveValue('gap', 20, 12);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 12);
    }
  }

  &__summary {
    min-width: 0;

    color: var(--seconday-color);

    font-weight: 700;
    text-transform: uppercase;
    white-space: nowrap;

    @include adaptiveValue('font-size', 13, 11);
    @include adaptiveValue('line-height', 18, 16);
    @include adaptiveValue('letter-spacing', 1.82, 1.54);

    span {
      @include adaptiveValue('margin-left', 4, 2);
      @include adaptiveValue('margin-right', 4, 2);
    }
  }

  &__actions {
    min-width: 0;

    display: flex;
    align-items: center;

    margin-left: auto;

    @include adaptiveValue('gap', 10, 8);
  }

  &__clear {
    width: fit-content;
    min-width: 0;

    flex: 0 0 auto;
  }

  &__items {
    width: 100%;
    min-width: 0;

    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));

    @include adaptiveValue('gap', 20, 12);

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
    width: 100%;
    min-width: 0;
  }

  &__empty {
    width: 100%;

    display: flex;
    align-items: center;
    flex-direction: column;

    margin-left: auto;
    margin-right: auto;

    border: 2px solid var(--border-primary-color);
    border-radius: 14px;

    background-color: var(--bg-secondary-color);

    text-align: center;

    @include adaptiveValue('max-width', 560, 340);
    @include adaptiveValue('padding-top', 70, 35);
    @include adaptiveValue('padding-bottom', 70, 35);
    @include adaptiveValue('padding-left', 40, 18);
    @include adaptiveValue('padding-right', 40, 18);

    &-box {
      display: flex;
      align-items: center;
      justify-content: center;

      border: 2px solid var(--hint-primary-color);
      border-radius: 14px;

      color: var(--hint-primary-color);

      @include adaptiveValue('width', 64, 48);
      @include adaptiveValue('height', 64, 48);

      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 22, 18);
      }
    }

    &-icon {
      flex: 0 0 auto;

      @include adaptiveValue('width', 27, 18);
      @include adaptiveValue('height', 27, 18);
    }

    &-title {
      margin-top: 0;

      color: var(--primary-color);

      font-family: var(--font-gabarito);
      font-weight: 700;
      line-height: 1.2;

      @include adaptiveValue('font-size', 26, 22);
      @include adaptiveValue('margin-bottom', 10, 8);
    }

    &-text {
      width: 100%;

      margin-top: 0;

      color: var(--seconday-color);

      @include adaptiveValue('max-width', 430, 300);
      @include adaptiveValue('font-size', 14, 13);
      @include adaptiveValue('line-height', 22, 20);
      @include adaptiveValue('margin-bottom', 24, 18);
    }
  }

  &__browse {
    width: fit-content;

    @include adaptiveValue('min-width', 160, 145);
  }

  @media (max-width: $md5) {
    &__heading {
      &:not(:last-child) {
        margin-bottom: 18px;
      }
    }

    &__toolbar {
      align-items: flex-start;
      flex-direction: column;

      gap: 12px;
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
