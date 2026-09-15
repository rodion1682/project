<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import { useCartStore } from '@/stores/cart'
import { useCurrStore } from '@/stores/currencies'
import { useProfileStore } from '@/stores/profile'

import BaseButton from '@/components/ui/BaseButton.vue'
import Breadcrumbs from '@/components/ui/Breadcrumbs.vue'
import PriceFormatter from '@/components/ui/PriceFormatter.vue'
import SvgIcon from '@/components/ui/icons/SvgIcon.vue'

import { CartIcon } from '@/components/ui/icons/index.js'

const { t } = useI18n()

const router = useRouter()

const cartStore = useCartStore()
const currStore = useCurrStore()
const profileStore = useProfileStore()

const isPaying = ref(false)
const removingIds = ref([])

const breadcrumbs = computed(() => [
  {
    title: t('Home'),
    link: '/',
  },
  {
    title: t('Cart'),
  },
])

const products = computed(() => {
  return Array.isArray(cartStore.cart?.products) ? cartStore.cart.products : []
})

const productsCount = computed(() => {
  return products.value.length
})

const total = computed(() => {
  return Number(cartStore.cart?.total || 0)
})

const balance = computed(() => {
  return Number(profileStore.profile?.balanceInCurrency ?? profileStore.profile?.balance ?? 0)
})

const balanceAfterPurchase = computed(() => {
  return balance.value - total.value
})

const hasEnoughBalance = computed(() => {
  return balance.value >= total.value
})

const formatPrice = (value) => {
  const number = Number(value || 0)

  return number.toFixed(2)
}

const getProductCategory = (product) => {
  if (!Array.isArray(product?.categories)) {
    return null
  }

  return product.categories.find((category) => category.parent !== null) || null
}

const getProductPlatform = (product) => {
  const category = getProductCategory(product)

  return category?.parent?.title || product?.platform || ''
}

const getProductGenre = (product) => {
  const category = getProductCategory(product)

  return category?.title || product?.genre || ''
}

const getProductRegion = (product) => {
  return product?.region || ''
}

const getPlatformRegion = (product) => {
  return [getProductPlatform(product), getProductRegion(product)].filter(Boolean).join(' · ')
}

const removeProduct = async (id) => {
  if (!id || removingIds.value.includes(id)) {
    return
  }

  removingIds.value.push(id)

  try {
    await cartStore.remove(id)
  } finally {
    removingIds.value = removingIds.value.filter((itemId) => itemId !== id)
  }
}

const clearCart = async () => {
  if (!products.value.length || removingIds.value.length) {
    return
  }

  const ids = products.value.map((product) => product.id).filter(Boolean)

  removingIds.value = [...new Set([...removingIds.value, ...ids])]

  try {
    await Promise.all(ids.map((id) => cartStore.remove(id)))
  } finally {
    removingIds.value = []
  }
}

const payFromBalance = async () => {
  if (!products.value.length || isPaying.value || !hasEnoughBalance.value) {
    return
  }

  isPaying.value = true

  try {
    await cartStore.payFromBalance()
  } finally {
    isPaying.value = false
  }
}

const browseCatalog = () => {
  router.push('/products')
}
</script>

<template>
  <main class="cart-page">
    <div class="cart-page__container _cnt-home">
      <Breadcrumbs :items="breadcrumbs" class="cart-page__breadcrumbs" />

      <h1 class="cart-page__title">
        {{ $t('Cart') }}
      </h1>

      <div v-if="products.length" class="cart-page__layout">
        <div class="cart-page__products cart-products">
          <div class="cart-products__head">
            <div class="cart-products__head-product">
              {{ $t('Product') }}
            </div>

            <div class="cart-products__head-platform">
              {{ $t('Platform') }} · {{ $t('Region') }}
            </div>

            <div class="cart-products__head-price">
              {{ $t('Price') }}
            </div>

            <div></div>
          </div>

          <div class="cart-products__list">
            <div v-for="product in products" :key="product.id" class="cart-product">
              <div class="cart-product__main">
                <div class="cart-product__image _ibg">
                  <img v-if="product.image" :src="product.image" :alt="product.title" />
                </div>

                <div class="cart-product__content">
                  <div class="cart-product__title">
                    {{ product.title }}
                  </div>

                  <div v-if="getProductGenre(product)" class="cart-product__genre">
                    {{ $t(getProductGenre(product)) }}
                  </div>

                  <div v-if="getPlatformRegion(product)" class="cart-product__mobile-meta">
                    {{ $t(getProductPlatform(product)) }}

                    <template v-if="getProductPlatform(product) && getProductRegion(product)">
                      ·
                    </template>

                    {{ $t(getProductRegion(product)) }}
                  </div>

                  <PriceFormatter
                    class="cart-product__mobile-price"
                    size="size-21-market"
                    :price="formatPrice(product.price)"
                  />
                </div>
              </div>

              <div class="cart-product__platform">
                {{ $t(getProductPlatform(product)) }}

                <template v-if="getProductPlatform(product) && getProductRegion(product)">
                  ·
                </template>

                {{ $t(getProductRegion(product)) }}
              </div>

              <div class="cart-product__price">
                <PriceFormatter size="size-21-market" :price="formatPrice(product.price)" />

                <span class="cart-product__vat">
                  {{ $t('incl. vat') }}
                </span>
              </div>

              <button
                type="button"
                class="cart-product__remove"
                :disabled="removingIds.includes(product.id)"
                :aria-label="$t('Remove')"
                @click="removeProduct(product.id)"
              >
                <span></span>
              </button>
            </div>
          </div>

          <div class="cart-products__bottom">
            <RouterLink to="/products/all/all" class="cart-products__continue">
              {{ $t('Continue shopping') }}
            </RouterLink>

            <BaseButton
              variant="bordered"
              class="cart-products__clear"
              :disabled="!products.length || removingIds.length > 0"
              @click="clearCart"
            >
              {{ $t('Clear cart') }}
            </BaseButton>
          </div>
        </div>

        <aside class="cart-page__aside">
          <div class="summary-card">
            <div class="summary-card__label">
              {{ $t('Order summary') }}
            </div>

            <div class="summary-card__rows">
              <div class="summary-card__row">
                <span>
                  {{ $t('Subtotal') }} ·
                  {{ productsCount }}
                  {{ productsCount === 1 ? $t('key') : $t('keys') }}
                </span>

                <strong>
                  {{ formatPrice(total) }}
                  {{ currStore.currency.symbol }}
                </strong>
              </div>
            </div>

            <div class="summary-card__total">
              <span>
                {{ $t('Total to pay') }}
              </span>

              <strong>
                {{ formatPrice(total) }}
                {{ currStore.currency.symbol }}
              </strong>
            </div>
          </div>

          <div class="balance-card">
            <div class="balance-card__row">
              <div class="balance-card__balance-label">
                <span class="balance-card__wallet"></span>

                {{ $t('Your balance') }}
              </div>

              <strong>
                {{ formatPrice(balance) }}
                {{ currStore.currency.symbol }}
              </strong>
            </div>

            <div class="balance-card__row">
              <span>
                {{ $t('Balance after purchase') }}
              </span>

              <strong>
                {{ formatPrice(balanceAfterPurchase) }}
                {{ currStore.currency.symbol }}
              </strong>
            </div>

            <form class="balance-card__form" @submit.prevent="payFromBalance">
              <BaseButton
                type="submit"
                variant="dark-secondary"
                class="balance-card__button"
                :disabled="isPaying || !products.length || !hasEnoughBalance"
              >
                {{ $t('Buy from balance') }}
              </BaseButton>
            </form>

            <RouterLink to="/profile/balance" class="balance-card__top-up">
              {{ $t('Top up balance') }}
            </RouterLink>

            <Transition>
              <div v-if="cartStore.balanceError" class="balance-card__error">
                {{ $t(cartStore.balanceError) }}
              </div>
            </Transition>
          </div>

          <p class="cart-page__note">
            {{
              $t(
                'Keys are issued the moment payment clears and appear in your account library and inbox. By paying you agree with our Terms & Conditions and Privacy Notice.',
              )
            }}
          </p>
        </aside>
      </div>

      <div v-else class="cart-page__empty">
        <div class="cart-page__empty-box">
          <SvgIcon :icon="CartIcon" class="cart-page__empty-icon" />
        </div>

        <h2 class="cart-page__empty-title">
          {{ $t('Your cart is empty') }}
        </h2>

        <p class="cart-page__empty-text">
          {{
            $t('Add games to your cart and they will appear here when you are ready to checkout.')
          }}
        </p>

        <BaseButton class="cart-page__empty-button" @click="browseCatalog">
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

.cart-page {
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

  &__title {
    min-width: 0;

    margin: 0;

    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-weight: 700;
    line-height: 1.1;

    @include adaptiveValue('font-size', 42, 30);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 18);
    }
  }

  &__layout {
    width: 100%;
    min-width: 0;

    display: grid;
    grid-template-columns:
      minmax(0, 1fr)
      minmax(330px, 420px);

    align-items: start;

    @include adaptiveValue('gap', 55, 30);

    @media (max-width: $md3) {
      grid-template-columns: 1fr;
    }

    @media (max-width: $md8) {
      gap: 24px;
    }
  }

  &__products {
    min-width: 0;
  }

  &__aside {
    width: 100%;
    min-width: 0;

    display: flex;
    flex-direction: column;

    @include adaptiveValue('gap', 20, 14);

    @media (max-width: $md3) {
      max-width: 600px;

      margin-left: auto;
      margin-right: auto;
    }
  }

  &__note {
    margin: 0;

    color: var(--seconday-color);

    @include adaptiveValue('font-size', 12, 11);
    @include adaptiveValue('line-height', 19, 17);

    @media (max-width: $md8) {
      display: none;
    }
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

      flex: 0 0 auto;

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

      color: inherit;
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

    &-button {
      width: fit-content;

      @include adaptiveValue('min-width', 160, 145);
    }
  }
}

/* =========================================
   CART PRODUCTS
========================================= */

.cart-products {
  min-width: 0;

  &__head {
    display: grid;

    grid-template-columns:
      minmax(0, 1.75fr)
      minmax(150px, 0.8fr)
      minmax(110px, 0.45fr)
      48px;

    align-items: center;

    @include adaptiveValue('gap', 20, 12);
    @include adaptiveValue('padding-bottom', 17, 12);

    border-bottom: 2px solid var(--border-primary-color);

    color: var(--seconday-color);

    font-weight: 700;
    text-transform: uppercase;

    @include adaptiveValue('font-size', 10, 9);
    @include adaptiveValue('line-height', 14, 13);
    @include adaptiveValue('letter-spacing', 1.8, 1.4);

    &-product {
      @include adaptiveValue('padding-left', 135, 100);
    }

    &-price {
      text-align: right;
    }

    @media (max-width: $md3) {
      grid-template-columns:
        minmax(0, 1.6fr)
        minmax(140px, 0.7fr)
        minmax(100px, 0.4fr)
        48px;
    }

    @media (max-width: $md5) {
      display: none;
    }
  }

  &__list {
    border-bottom: 2px solid var(--border-primary-color);
  }

  &__bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;

    @include adaptiveValue('padding-top', 26, 18);
    @include adaptiveValue('gap', 20, 10);
  }

  &__continue {
    color: var(--hint-primary-color);

    font-weight: 600;

    @include adaptiveValue('font-size', 14, 12);
    @include adaptiveValue('line-height', 20, 17);

    transition: opacity 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        opacity: 0.7;
      }
    }
  }

  &__clear {
    flex: 0 0 auto;

    @include adaptiveValue('min-width', 105, 90);
    @include adaptiveValue('min-height', 42, 38);
  }
}

/* =========================================
   CART PRODUCT
========================================= */

.cart-product {
  width: 100%;
  min-width: 0;

  display: grid;

  grid-template-columns:
    minmax(0, 1.75fr)
    minmax(150px, 0.8fr)
    minmax(110px, 0.45fr)
    48px;

  align-items: center;

  @include adaptiveValue('gap', 20, 12);
  @include adaptiveValue('padding-top', 24, 16);
  @include adaptiveValue('padding-bottom', 24, 16);

  &:not(:last-child) {
    border-bottom: 2px solid var(--border-primary-color);
  }

  &__main {
    min-width: 0;

    display: flex;
    align-items: center;

    @include adaptiveValue('gap', 22, 10);
  }

  &__image {
    flex: 0 0 auto;

    overflow: hidden;

    border: 2px solid var(--border-primary-color);

    background-color: var(--bg-secondary-color);

    @include adaptiveValue('width', 112, 70);
    @include adaptiveValue('height', 84, 53);
    @include adaptiveValue('border-radius', 9, 7);
  }

  &__content {
    min-width: 0;
  }

  &__title {
    min-width: 0;

    overflow: hidden;

    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-weight: 700;

    text-overflow: ellipsis;

    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;

    @include adaptiveValue('font-size', 17, 13);
    @include adaptiveValue('line-height', 22, 17);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 6, 2);
    }
  }

  &__genre,
  &__platform,
  &__mobile-meta {
    color: var(--seconday-color);

    @include adaptiveValue('font-size', 12, 10);
    @include adaptiveValue('line-height', 17, 14);
  }

  &__platform {
    min-width: 0;
  }

  &__price {
    display: flex;
    align-items: flex-end;
    flex-direction: column;

    gap: 3px;

    :deep(.price) {
      font-family: var(--font-gabarito);
      font-weight: 700;

      @include adaptiveValue('font-size', 17, 14);
      @include adaptiveValue('line-height', 22, 18);
    }
  }

  &__vat {
    color: var(--seconday-color);

    @include adaptiveValue('font-size', 10, 9);
    @include adaptiveValue('line-height', 14, 12);
  }

  &__mobile-meta,
  &__mobile-price {
    display: none;
  }

  &__remove {
    position: relative;

    justify-self: end;

    flex: 0 0 auto;

    border: 2px solid var(--border-primary-color);

    background-color: transparent;

    color: var(--seconday-color);

    cursor: pointer;

    @include adaptiveValue('width', 42, 38);
    @include adaptiveValue('height', 42, 38);
    @include adaptiveValue('border-radius', 9, 7);

    transition:
      color 0.3s ease,
      border-color 0.3s ease,
      background-color 0.3s ease;

    &::before,
    &::after {
      content: '';

      position: absolute;

      top: 50%;
      left: 50%;

      width: 12px;
      height: 1.5px;

      border-radius: 2px;

      background-color: currentColor;
    }

    &::before {
      transform: translate(-50%, -50%) rotate(45deg);
    }

    &::after {
      transform: translate(-50%, -50%) rotate(-45deg);
    }

    &:disabled {
      opacity: 0.45;

      pointer-events: none;
    }

    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);

        border-color: var(--hint-primary-color);
      }
    }
  }

  @media (max-width: $md5) {
    grid-template-columns:
      minmax(0, 1fr)
      42px;

    &__main {
      align-items: flex-start;
    }

    &__platform,
    &__price {
      display: none;
    }

    &__mobile-meta,
    &__mobile-price {
      display: flex;
    }

    &__mobile-meta {
      margin-top: 2px;
    }

    &__mobile-price {
      margin-top: 5px;

      color: var(--primary-color);

      font-family: var(--font-gabarito);
      font-weight: 700;
    }
  }

  @media (max-width: $md8) {
    &__title {
      -webkit-line-clamp: 1;
    }

    &__genre {
      display: none;
    }

    &__mobile-price {
      margin-top: 3px;

      :deep(.price__number),
      :deep(.price__symbol) {
        font-size: 14px;
        line-height: 17px;
      }
    }
  }
}

/* =========================================
   ORDER SUMMARY
========================================= */

.summary-card {
  border: 2px solid var(--border-primary-color);

  background-color: var(--bg-secondary-color);

  @include adaptiveValue('padding-top', 27, 18);
  @include adaptiveValue('padding-right', 30, 17);
  @include adaptiveValue('padding-bottom', 27, 18);
  @include adaptiveValue('padding-left', 30, 17);
  @include adaptiveValue('border-radius', 14, 10);

  &__label {
    color: var(--seconday-color);

    font-weight: 700;
    text-transform: uppercase;

    @include adaptiveValue('font-size', 10, 9);
    @include adaptiveValue('line-height', 14, 13);
    @include adaptiveValue('letter-spacing', 2, 1.5);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 22, 16);
    }

    @media (max-width: $md8) {
      display: none;
    }
  }

  &__rows {
    border-bottom: 2px solid var(--border-primary-color);

    @include adaptiveValue('padding-bottom', 18, 15);
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    @include adaptiveValue('gap', 20, 12);

    color: var(--seconday-color);

    @include adaptiveValue('font-size', 13, 11);
    @include adaptiveValue('line-height', 18, 15);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 12);
    }

    strong {
      flex: 0 0 auto;

      color: var(--primary-color);

      font-weight: 500;
    }
  }

  &__total {
    display: flex;
    align-items: center;
    justify-content: space-between;

    color: var(--primary-color);

    @include adaptiveValue('gap', 20, 12);
    @include adaptiveValue('padding-top', 20, 17);
    @include adaptiveValue('font-size', 14, 12);
    @include adaptiveValue('line-height', 20, 17);

    strong {
      font-family: var(--font-gabarito);
      font-weight: 900;
      line-height: 1;

      @include adaptiveValue('font-size', 29, 22);
    }
  }
}

/* =========================================
   BALANCE
========================================= */

.balance-card {
  border: 2px solid var(--hint-primary-color);

  background-color: var(--bg-secondary-color);

  @include adaptiveValue('padding-top', 25, 18);
  @include adaptiveValue('padding-right', 30, 17);
  @include adaptiveValue('padding-bottom', 25, 18);
  @include adaptiveValue('padding-left', 30, 17);
  @include adaptiveValue('border-radius', 14, 10);

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    color: var(--seconday-color);

    @include adaptiveValue('gap', 20, 12);
    @include adaptiveValue('font-size', 13, 11);
    @include adaptiveValue('line-height', 18, 15);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 18, 14);
    }

    strong {
      flex: 0 0 auto;

      color: var(--primary-color);

      font-weight: 600;

      @include adaptiveValue('font-size', 15, 12);
    }
  }

  &__balance-label {
    display: flex;
    align-items: center;

    @include adaptiveValue('gap', 10, 7);
  }

  &__wallet {
    position: relative;

    flex: 0 0 auto;

    border: 2px solid var(--hint-primary-color);

    border-radius: 2px;

    @include adaptiveValue('width', 15, 13);
    @include adaptiveValue('height', 11, 10);

    &::after {
      content: '';

      position: absolute;

      top: 2px;
      right: 1px;

      width: 3px;
      height: 3px;

      border-radius: 50%;

      background-color: var(--hint-primary-color);
    }
  }

  &__form {
    @include adaptiveValue('margin-top', 24, 18);
  }

  &__button {
    width: 100%;

    @include adaptiveValue('min-height', 50, 45);
  }

  &__top-up {
    width: fit-content;

    display: block;

    margin-left: auto;
    margin-right: auto;

    color: var(--hint-primary-color);

    font-weight: 500;

    @include adaptiveValue('margin-top', 16, 13);
    @include adaptiveValue('font-size', 12, 10);
    @include adaptiveValue('line-height', 16, 14);

    transition: opacity 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        opacity: 0.7;
      }
    }
  }

  &__error {
    color: var(--error-color);

    text-align: center;

    @include adaptiveValue('margin-top', 14, 10);
    @include adaptiveValue('font-size', 12, 10);
    @include adaptiveValue('line-height', 17, 14);
  }
}

@media (max-width: $md8) {
  .cart-page {
    &__layout {
      display: flex;
      flex-direction: column;
    }

    &__products,
    &__aside {
      width: 100%;
    }
  }
}
</style>
