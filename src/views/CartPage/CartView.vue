<script setup>
import { computed, ref } from 'vue'

import { useCartStore } from '@/stores/cart'
import { useCurrStore } from '@/stores/currencies'
import { useProfileStore } from '@/stores/profile'

import BaseButton from '@/components/ui/BaseButton.vue'
import Breadcrumbs from '@/components/ui/Breadcrumbs.vue'
import PriceFormatter from '@/components/ui/PriceFormatter.vue'

const cartStore = useCartStore()
const currStore = useCurrStore()
const profileStore = useProfileStore()

const isPaying = ref(false)
const removingIds = ref([])

const breadcrumbs = computed(() => [
  {
    title: 'Home',
    link: '/',
  },
  {
    title: 'Cart',
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
  if (!products.value.length) {
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
  if (!products.value.length || isPaying.value) {
    return
  }

  isPaying.value = true

  try {
    await cartStore.payFromBalance()
  } finally {
    isPaying.value = false
  }
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
        <!-- LEFT SIDE -->
        <div class="cart-page__products cart-products">
          <!-- Desktop headings -->
          <div class="cart-products__head">
            <div class="cart-products__head-product">
              {{ $t('Product') }}
            </div>

            <div class="cart-products__head-platform">
              {{ $t('Platform') }} ·
              {{ $t('Region') }}
            </div>

            <div class="cart-products__head-price">
              {{ $t('Price') }}
            </div>

            <div></div>
          </div>

          <!-- Products -->
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

                  <!-- Mobile platform/region -->
                  <div v-if="getPlatformRegion(product)" class="cart-product__mobile-meta">
                    {{ $t(getProductPlatform(product)) }}

                    <template v-if="getProductPlatform(product) && getProductRegion(product)">
                      ·
                    </template>

                    {{ $t(getProductRegion(product)) }}
                  </div>

                  <!-- Mobile price -->
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

        <!-- RIGHT SIDE -->
        <aside class="cart-page__aside">
          <!-- Order summary -->
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

              <!--
                Your current cart response/store does not
                expose a separate VAT amount.

                If backend later sends cart.vat, enable this:

                <div class="summary-card__row">
                  <span>{{ $t('VAT included') }}</span>
                  <strong>
                    {{ formatPrice(cartStore.cart.vat) }}
                    {{ currStore.currency.symbol }}
                  </strong>
                </div>
              -->
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

          <!-- Balance -->
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

      <!-- EMPTY CART -->
      <div v-else class="cart-page__empty">
        <div class="cart-page__empty-title">
          {{ $t('Your cart is empty') }}
        </div>

        <div class="cart-page__empty-text">
          {{ $t('Add some games to your cart to continue.') }}
        </div>

        <BaseButton
          variant="secondary"
          class="cart-page__empty-button"
          @click="$router.push('/products/all/all')"
        >
          {{ $t('Continue shopping') }}
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
  @include header-indent;

  @include adaptiveValue('padding-top', 24, 14);

  @include adaptiveValue('padding-bottom', 110, 40);

  &__breadcrumbs {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 18, 12);
    }
  }

  &__title {
    margin: 0;

    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-weight: 900;

    @include adaptiveValue('font-size', 36, 28);

    @include adaptiveValue('line-height', 42, 32);

    letter-spacing: -0.03em;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 46, 26);
    }
  }

  &__layout {
    display: grid;

    grid-template-columns:
      minmax(0, 1fr)
      minmax(330px, 420px);

    @include adaptiveValue('gap', 55, 30);

    align-items: start;

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
    min-width: 0;

    display: flex;
    flex-direction: column;

    gap: 20px;

    @media (max-width: $md3) {
      max-width: 600px;
      width: 100%;
      margin: 0 auto;
    }

    @media (max-width: $md8) {
      gap: 14px;
    }
  }

  &__note {
    margin: 0;

    color: var(--seconday-color);

    font-size: 12px;
    line-height: 19px;

    @media (max-width: $md8) {
      display: none;
    }
  }

  &__empty {
    padding: clamp(40px, 8vw, 100px) 20px;

    display: flex;
    flex-direction: column;
    align-items: center;

    text-align: center;
  }

  &__empty-title {
    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-weight: 900;

    @include adaptiveValue('font-size', 28, 22);

    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  &__empty-text {
    color: var(--seconday-color);

    font-size: 14px;
    line-height: 20px;

    &:not(:last-child) {
      margin-bottom: 24px;
    }
  }

  &__empty-button {
    min-width: 200px;
  }
}

/* ==============================
   PRODUCTS
============================== */

.cart-products {
  &__head {
    display: grid;

    grid-template-columns:
      minmax(0, 1.75fr)
      minmax(150px, 0.8fr)
      minmax(110px, 0.45fr)
      48px;

    gap: 20px;

    padding: 0 0 17px;

    border-bottom: 2px solid var(--border-primary-color);

    color: var(--seconday-color);

    font-size: 10px;
    line-height: 14px;
    font-weight: 700;

    letter-spacing: 1.8px;
    text-transform: uppercase;

    &-product {
      padding-left: 135px;
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

      &-product {
        padding-left: 110px;
      }
    }

    @media (max-width: $md5) {
      display: none;
    }
  }

  &__list {
    border-bottom: 2px solid var(--border-primary-color);
  }

  &__bottom {
    padding-top: 26px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 20px;

    @media (max-width: $md8) {
      padding-top: 18px;
    }
  }

  &__continue {
    color: var(--hint-primary-color);

    font-size: 14px;
    line-height: 20px;
    font-weight: 600;

    transition: opacity 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        opacity: 0.7;
      }
    }

    @media (max-width: $md8) {
      font-size: 12px;
    }
  }

  &__clear {
    min-width: 105px;

    min-height: 42px;

    color: var(--seconday-color);

    @media (max-width: $md8) {
      min-width: 90px;

      padding: 8px 10px;

      min-height: 38px;

      font-size: 11px;
    }
  }
}

.cart-product {
  min-width: 0;

  display: grid;

  grid-template-columns:
    minmax(0, 1.75fr)
    minmax(150px, 0.8fr)
    minmax(110px, 0.45fr)
    48px;

  align-items: center;

  gap: 20px;

  @include adaptiveValue('padding-top', 24, 16);

  @include adaptiveValue('padding-bottom', 24, 16);

  &:not(:last-child) {
    border-bottom: 2px solid var(--border-primary-color);
  }

  &__main {
    min-width: 0;

    display: flex;
    align-items: center;

    gap: 22px;
  }

  &__image {
    flex: 0 0 auto;

    @include adaptiveValue('width', 112, 78);

    @include adaptiveValue('height', 84, 58);

    overflow: hidden;

    border-radius: 9px;

    border: 2px solid var(--border-primary-color);

    background: var(--bg-secondary-color);
  }

  &__content {
    min-width: 0;
  }

  &__title {
    overflow: hidden;

    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-weight: 700;

    @include adaptiveValue('font-size', 17, 14);

    @include adaptiveValue('line-height', 22, 18);

    text-overflow: ellipsis;

    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;

    &:not(:last-child) {
      margin-bottom: 6px;
    }
  }

  &__genre,
  &__platform,
  &__mobile-meta {
    color: var(--seconday-color);

    font-size: 12px;
    line-height: 17px;
  }

  &__platform {
    min-width: 0;
  }

  &__price {
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    gap: 3px;

    :deep(.price) {
      font-family: var(--font-gabarito);
      font-weight: 700;

      font-size: 17px;
      line-height: 22px;
    }
  }

  &__vat {
    color: var(--seconday-color);

    font-size: 10px;
    line-height: 14px;
  }

  &__mobile-meta,
  &__mobile-price {
    display: none;
  }

  &__remove {
    justify-self: end;

    position: relative;

    width: 42px;
    height: 42px;

    border: 2px solid var(--border-primary-color);

    border-radius: 9px;

    background-color: transparent;

    color: var(--seconday-color);

    cursor: pointer;

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

  @media (max-width: $md3) {
    grid-template-columns:
      minmax(0, 1.6fr)
      minmax(140px, 0.7fr)
      minmax(100px, 0.4fr)
      48px;

    &__main {
      gap: 16px;
    }
  }

  @media (max-width: $md5) {
    grid-template-columns:
      minmax(0, 1fr)
      42px;

    gap: 14px;

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

      :deep(.price__number),
      :deep(.price__symbol) {
        font-size: 16px;
        line-height: 20px;
        font-weight: 700;
      }
    }

    &__remove {
      align-self: start;
    }
  }

  @media (max-width: $md8) {
    &__main {
      gap: 10px;
    }

    &__image {
      width: 70px;
      height: 53px;

      border-radius: 7px;
    }

    &__title {
      font-size: 13px;
      line-height: 17px;

      -webkit-line-clamp: 1;

      &:not(:last-child) {
        margin-bottom: 2px;
      }
    }

    &__genre {
      display: none;
    }

    &__mobile-meta {
      font-size: 10px;
      line-height: 14px;
    }

    &__mobile-price {
      margin-top: 3px;

      :deep(.price__number),
      :deep(.price__symbol) {
        font-size: 14px;
        line-height: 17px;
      }
    }

    &__remove {
      width: 38px;
      height: 38px;
    }
  }
}

/* ==============================
   ORDER SUMMARY
============================== */

.summary-card {
  padding: 27px 30px;

  border: 2px solid var(--border-primary-color);

  border-radius: 14px;

  background-color: var(--bg-secondary-color);

  @media (max-width: $md8) {
    padding: 18px 17px;

    border-radius: 10px;
  }

  &__label {
    color: var(--seconday-color);

    font-size: 10px;
    line-height: 14px;
    font-weight: 700;

    letter-spacing: 2px;
    text-transform: uppercase;

    &:not(:last-child) {
      margin-bottom: 22px;
    }

    @media (max-width: $md8) {
      display: none;
    }
  }

  &__rows {
    padding-bottom: 18px;

    border-bottom: 2px solid var(--border-primary-color);
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 20px;

    color: var(--seconday-color);

    font-size: 13px;
    line-height: 18px;

    &:not(:last-child) {
      margin-bottom: 16px;
    }

    strong {
      flex: 0 0 auto;

      color: var(--primary-color);

      font-weight: 500;
    }

    @media (max-width: $md8) {
      font-size: 11px;
      line-height: 15px;
    }
  }

  &__total {
    padding-top: 20px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 20px;

    color: var(--primary-color);

    font-size: 14px;
    line-height: 20px;

    strong {
      font-family: var(--font-gabarito);
      font-weight: 900;

      @include adaptiveValue('font-size', 29, 22);

      line-height: 1;
    }

    @media (max-width: $md8) {
      padding-top: 17px;

      font-size: 12px;
    }
  }
}

/* ==============================
   BALANCE
============================== */

.balance-card {
  padding: 25px 30px;

  border: 2px solid var(--hint-primary-color);

  border-radius: 14px;

  background-color: var(--bg-secondary-color);

  @media (max-width: $md8) {
    padding: 18px 17px;

    border-radius: 10px;
  }

  &__row {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 20px;

    color: var(--seconday-color);

    font-size: 13px;
    line-height: 18px;

    &:not(:last-child) {
      margin-bottom: 18px;
    }

    strong {
      flex: 0 0 auto;

      color: var(--primary-color);

      font-size: 15px;
      font-weight: 600;
    }

    @media (max-width: $md8) {
      font-size: 11px;

      strong {
        font-size: 12px;
      }
    }
  }

  &__balance-label {
    display: flex;
    align-items: center;

    gap: 10px;
  }

  &__wallet {
    width: 15px;
    height: 11px;

    border: 2px solid var(--hint-primary-color);

    border-radius: 2px;

    position: relative;

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
    margin-top: 24px;
  }

  &__button {
    width: 100%;

    min-height: 50px;

    @media (max-width: $md8) {
      min-height: 45px;
    }
  }

  &__top-up {
    width: fit-content;

    display: block;

    margin: 16px auto 0;

    color: var(--hint-primary-color);

    font-size: 12px;
    line-height: 16px;
    font-weight: 500;

    transition: opacity 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        opacity: 0.7;
      }
    }

    @media (max-width: $md8) {
      margin-top: 13px;

      font-size: 10px;
    }
  }

  &__error {
    margin-top: 14px;

    color: var(--error-color);

    font-size: 12px;
    line-height: 17px;

    text-align: center;
  }
}

/* ==============================
   MOBILE
============================== */

@media (max-width: $md8) {
  .cart-page {
    &__title {
      &:not(:last-child) {
        margin-bottom: 16px;
      }
    }

    &__layout {
      display: flex;
      flex-direction: column;
    }

    &__products,
    &__aside {
      width: 100%;
    }
  }

  .cart-products {
    &__list {
      border-top: 0;
    }

    &__bottom {
      gap: 10px;
    }
  }
}
</style>
