<template>
  <main class="cart-page">
    <div class="cart-page__bg _ibg" aria-hidden="true">
      <img src="@/assets/img/auth-bg.jpg" alt="" />
    </div>

    <div class="cart-page__decor _ibg-contain" aria-hidden="true">
      <img src="@/assets/img/heros-decor-top.png" alt="" />
    </div>

    <div class="cart-page__inner _cnt-home">
      <!-- Loading -->
      <div v-if="cartStore.isLoading" class="cart-page__frame cart-state">
        <div class="cart-page__box cart-state__box">
          <LoadingSpinner class="cart-state__loader" />
        </div>
      </div>

      <!-- Error -->
      <div
        v-else-if="cartStore.error && cartStore.error !== 'Cart is empty'"
        class="cart-page__frame cart-state"
      >
        <div class="cart-page__box cart-state__box">
          <div class="cart-state__content">
            <div class="cart-state__subtitle _h5">
              {{ $t('Something went wrong') }}
            </div>

            <h1 class="cart-state__title _h2">
              {{ $t('Cart') }}
            </h1>

            <p class="cart-state__message cart-state__message_error">
              {{ cartStore.error }}
            </p>

            <BaseButton
              type="button"
              class="cart-state__button"
              variant="bordered"
              @click="refreshCart"
            >
              {{ $t('Try again') }}
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Empty cart -->
      <div v-else-if="cartStore.isEmpty" class="cart-page__frame cart-state">
        <div class="cart-page__box cart-state__box">
          <div class="cart-state__content">
            <div class="cart-state__subtitle _h5">
              {{ $t('Market') }}
            </div>

            <h1 class="cart-state__title _h2">
              {{ $t('Your cart') }}
            </h1>

            <p class="cart-state__message">
              {{ $t('Your cart is empty') }}
            </p>

            <RouterLink
              :to="{
                name: 'ProductListPage',
              }"
              class="cart-state__link"
            >
              <BaseButton
                type="button"
                class="cart-state__button"
                variant="bordered"
              >
                {{ $t('Continue shopping') }}
              </BaseButton>
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Cart -->
      <div v-else class="cart-page__frame">
        <div class="cart-page__box">
          <div class="cart-page__heading">
            <div class="cart-page__subtitle _h5">
              {{ $t('Market') }}
            </div>

            <h1 class="cart-page__title _h2">
              {{ $t('Your') }}

              <span>
                {{ $t('Cart') }}
              </span>
            </h1>

            <div class="cart-page__count">
              {{ cartStore.items.length }}
              {{ $t('items') }}
            </div>
          </div>

          <div class="cart">
            <!-- Products -->
            <div class="cart__products">
              <div class="cart__list">
                <div
                  v-for="item in cartStore.items"
                  :key="getItemKey(item)"
                  class="cart__item cart-item"
                  :class="{
                    'cart-item_loading': cartStore.isItemLoading(
                      item.purchasable_id,
                    ),
                  }"
                >
                  <RouterLink
                    :to="productLink(item)"
                    class="cart-item__preview"
                    :aria-label="item.details?.name"
                  >
                    <!-- Card -->
                    <div
                      v-if="item.purchasable_type === 'card'"
                      class="cart-item__card"
                    >
                      <div class="cart-item__card-inner">
                        <img
                          v-if="item.details?.image_2"
                          :src="item.details.image_2"
                          class="cart-item__card-frame"
                          :alt="item.details?.name || $t('Card')"
                        />

                        <div class="cart-item__card-art">
                          <img
                            v-if="item.details?.image"
                            :src="item.details.image"
                            :alt="item.details?.name || ''"
                            class="cart-item__card-image"
                          />
                        </div>

                        <svg
                          v-if="item.details?.name"
                          class="cart-item__card-name"
                          viewBox="0 0 300 110"
                          preserveAspectRatio="xMidYMid meet"
                          aria-hidden="true"
                        >
                          <defs>
                            <path
                              :id="`cart-card-name-${item.id}`"
                              :d="
                                String(item.details?.type).toLowerCase() ===
                                'spell'
                                  ? 'M 10 -10 Q 150 75 300 40'
                                  : 'M 20 60 Q 150 25 280 60'
                              "
                              fill="none"
                            />
                          </defs>

                          <text
                            class="cart-item__card-name-text"
                            x="0"
                            y="0"
                            font-size="16"
                          >
                            <textPath
                              :href="`#cart-card-name-${item.id}`"
                              startOffset="50%"
                              text-anchor="middle"
                              dominant-baseline="middle"
                            >
                              {{ item.details.name }}
                            </textPath>
                          </text>
                        </svg>

                        <div
                          v-if="item.details?.description"
                          class="cart-item__description"
                        >
                          <span v-html="item.details.description" />
                        </div>

                        <span
                          v-if="
                            item.details?.mana_cost !== null &&
                            item.details?.mana_cost !== undefined
                          "
                          class="cart-item__stat cart-item__stat_mana"
                        >
                          {{ item.details.mana_cost }}
                        </span>

                        <span
                          v-if="
                            item.details?.attack !== null &&
                            item.details?.attack !== undefined
                          "
                          class="cart-item__stat cart-item__stat_attack"
                        >
                          {{ item.details.attack }}
                        </span>

                        <span
                          v-if="
                            item.details?.health !== null &&
                            item.details?.health !== undefined
                          "
                          class="cart-item__stat cart-item__stat_health"
                        >
                          {{ item.details.health }}
                        </span>
                      </div>
                    </div>

                    <!-- Pack -->
                    <div v-else class="cart-item__pack">
                      <img
                        :src="item.details?.image"
                        :alt="item.details?.name || $t('Pack')"
                      />
                    </div>
                  </RouterLink>

                  <div class="cart-item__information">
                    <RouterLink :to="productLink(item)" class="cart-item__name">
                      {{ item.details?.name }}
                    </RouterLink>

                    <div v-if="item.is_rental" class="cart-item__meta">
                      <span class="cart-item__meta-label">
                        {{ $t('Period') }}:
                      </span>

                      <span class="cart-item__meta-value">
                        {{ item.rental_period?.label }}
                      </span>
                    </div>

                    <label v-else class="cart-item__quantity">
                      <span class="cart-item__quantity-label">
                        {{ $t('Quantity') }}:
                      </span>

                      <input
                        class="cart-item__quantity-input"
                        type="number"
                        min="1"
                        step="1"
                        :value="item.quantity"
                        :disabled="cartStore.isItemLoading(item.purchasable_id)"
                        @change="quantityChange($event, item.id)"
                      />
                    </label>
                  </div>

                  <div class="cart-item__price">
                    <PriceFormatter
                      :price="getItemTotal(item)"
                      size="size-24"
                    />
                  </div>

                  <button
                    type="button"
                    class="cart-item__remove"
                    :aria-label="$t('Remove item')"
                    :disabled="cartStore.isItemLoading(item.purchasable_id)"
                    @click="
                      removeItem(
                        item.purchasable_id,
                        item.purchasable_type,
                        item.rental_period?.id,
                      )
                    "
                  >
                    <BinIcon class="cart-item__remove-icon" />
                  </button>

                  <p
                    v-if="cartStore.getItemError(item.purchasable_id)"
                    class="cart-item__error"
                  >
                    {{ cartStore.getItemError(item.purchasable_id) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Payment -->
            <div class="cart__payment payment">
              <div class="payment__heading">
                <div class="payment__subtitle _h5">
                  {{ $t('Checkout') }}
                </div>

                <h2 class="payment__title _h3">
                  {{ $t('Payment') }}
                </h2>
              </div>

              <div class="payment__summary">
                <div class="payment__total">
                  <span class="payment__total-label">
                    {{ $t('Total') }}
                  </span>

                  <div class="payment__total-price">
                    <PriceFormatter
                      v-if="promoCodeStore.hasActivePromo"
                      class="payment__old-price"
                      :price="cartStore.cartTotal"
                      size="size-20"
                    />

                    <PriceFormatter
                      :price="cartTotalInternalCurrency"
                      size="size-32"
                    />
                  </div>
                </div>

                <div class="payment__rate">
                  <div class="payment__rate-value">
                    <span> {{ $t('Rate') }}: 1 </span>

                    <PriceFormatter size="size-12" />

                    <span>
                      =
                      {{ currencyStore.currentCurrencySymbol }}
                      {{ currentCurrencyRate }}
                    </span>
                  </div>

                  <div class="payment__fiat">
                    <span
                      v-if="promoCodeStore.hasActivePromo"
                      class="payment__fiat-old"
                    >
                      {{ currencyStore.currentCurrencySymbol }}
                      {{ originalAmountInFiatCurrency }}
                    </span>

                    <span>
                      {{ currencyStore.currentCurrencySymbol }}
                      {{ amountInFiatCurrency }}
                    </span>
                  </div>
                </div>
              </div>

              <p
                v-if="errorMessage || paymentMethodError"
                class="payment__error"
              >
                {{ errorMessage || paymentMethodError }}
              </p>

              <div class="payment__methods">
                <!-- Card -->
                <BaseButton
                  v-if="cardPaymentMethod"
                  type="button"
                  class="payment__method payment__method_primary"
                  variant="secondary"
                  :disabled="isSubmitting"
                  @click="handleSubmit(cardPaymentMethod.code)"
                >
                  <span class="payment__method-title">
                    {{ cardPaymentMethod.title || $t('Pay by card') }}
                  </span>

                  <span class="payment__cards">
                    <img
                      src="@/assets/images/magiculus/methods/mc.svg"
                      alt="Mastercard"
                    />

                    <img
                      src="@/assets/images/magiculus/methods/visa.svg"
                      alt="Visa"
                    />
                  </span>
                </BaseButton>

                <!-- Balance -->
                <BaseButton
                  type="button"
                  class="payment__method"
                  variant="bordered"
                  :disabled="isSubmitting"
                  @click="handleSubmit('balance')"
                >
                  <span class="payment__method-title">
                    {{ $t('Balance') }}
                  </span>

                  <PriceFormatter
                    class="payment__method-balance"
                    :price="userStore.userBalance"
                    size="size-20"
                  />
                </BaseButton>

                <!-- Other payment methods -->
                <BaseButton
                  v-for="method in otherPaymentMethods"
                  :key="method.code"
                  type="button"
                  class="payment__method"
                  variant="bordered"
                  :disabled="isSubmitting"
                  @click="handleSubmit(method.code)"
                >
                  <img
                    v-if="method.image"
                    :src="method.image"
                    :alt="method.title"
                    class="payment__method-image"
                  />

                  <span v-else class="payment__method-title">
                    {{ method.title }}
                  </span>
                </BaseButton>
              </div>

              <div v-if="isSubmitting" class="payment__submitting">
                <LoadingSpinner class="payment__loader" />

                <span>
                  {{ $t('Processing payment') }}
                </span>
              </div>

              <RouterLink
                :to="{
                  name: 'ProductListPage',
                }"
                class="payment__continue _link"
              >
                {{ $t('Continue shopping') }}
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <CheckoutCartModal
      :show="isCheckoutModalOpen"
      :total="cartTotalInternalCurrency"
      @close="handleCheckoutClose"
      @back="handleBackFromCheckout"
    />
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import BinIcon from '@/components/icons/BinIcon.vue'
import CheckoutCartModal from '@/components/modals/CheckoutCartModal.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import { useToast } from '@/composables/useToast'

import { useCartStore } from '@/stores/cart'
import { useCurrencyStore } from '@/stores/currency'
import { usePromoCodeStore } from '@/stores/promocode'
import { usePurchaseStore } from '@/stores/purchase'
import { useSettingsStore } from '@/stores/settings'
import { useTopUpStore } from '@/stores/topup'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const toast = useToast()

const cartStore = useCartStore()
const currencyStore = useCurrencyStore()
const promoCodeStore = usePromoCodeStore()
const purchaseStore = usePurchaseStore()
const settingsStore = useSettingsStore()
const topupStore = useTopUpStore()
const userStore = useUserStore()

const isSubmitting = ref(false)

/*
 * CheckoutCartModal local state.
 *
 * BaseModal already takes care
 * of scroll locking itself.
 */
const isCheckoutModalOpen = ref(false)

const errorMessage = ref('')
const paymentMethodError = ref('')

const cardPaymentMethod = computed(() => {
  return (
    settingsStore.paymentMethods?.find(method => {
      return method.code === 'card'
    }) ?? null
  )
})

const otherPaymentMethods = computed(() => {
  return (settingsStore.paymentMethods || []).filter(method => {
    return method.code !== 'card' && method.code !== 'balance'
  })
})

const cartTotalInternalCurrency = computed(() => {
  const total = cartStore.items.reduce((sum, item) => {
    const unitPrice = Number(item.unit_price ?? priceDetails(item) ?? 0)

    const quantity = Math.max(1, Number(item.quantity) || 1)

    return sum + unitPrice * quantity
  }, 0)

  if (!promoCodeStore.hasActivePromo) {
    return total
  }

  const discount = Number(promoCodeStore.discount?.amount || 0)

  return Math.max(0, total - discount)
})

const currentCurrencyRate = computed(() => {
  return Number(currencyStore.currentCurrency?.value || 1)
})

const internalCurrencyEuroRate = computed(() => {
  return Number(
    settingsStore.settings?.internal_currency?.exchange_rate_eur || 1,
  )
})

const amountInFiatCurrency = computed(() => {
  const totalInEuro =
    cartTotalInternalCurrency.value * internalCurrencyEuroRate.value

  return (totalInEuro * currentCurrencyRate.value).toFixed(2)
})

const originalAmountInFiatCurrency = computed(() => {
  const originalTotal = Number(cartStore.cartTotal || 0)

  const totalInEuro = originalTotal * internalCurrencyEuroRate.value

  return (totalInEuro * currentCurrencyRate.value).toFixed(2)
})

const priceDetails = item => {
  if (!item?.is_rental) {
    return Number(item?.details?.price ?? item?.unit_price ?? 0)
  }

  const rentalPrice = (item?.details?.rental_prices || []).find(price => {
    return String(price.rental_period_id) === String(item?.rental_period?.id)
  })

  return Number(rentalPrice?.price ?? item?.unit_price ?? 0)
}

const getItemTotal = item => {
  const quantity = Math.max(1, Number(item?.quantity) || 1)

  return priceDetails(item) * quantity
}

const getItemKey = item => {
  return [
    item.purchasable_type,
    item.purchasable_id,
    item.rental_period?.id || 'purchase',
  ].join('-')
}

const productLink = item => {
  if (item.purchasable_type === 'pack') {
    return {
      name: 'PackDetailsPage',

      params: {
        productId: item.purchasable_id,
      },
    }
  }

  return {
    name: 'ProductDetailsPage',

    params: {
      productId: item.purchasable_id,
    },
  }
}

const refreshCart = async () => {
  errorMessage.value = ''

  try {
    await cartStore.fetchCartContent()
  } catch (error) {
    console.error('Failed to refresh cart:', error)

    errorMessage.value =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to refresh cart'
  }
}

const removeItem = async (id, type, rentalPeriodId) => {
  if (cartStore.isItemLoading(id)) {
    return
  }

  errorMessage.value = ''

  try {
    const result = await cartStore.removeFromCart(id, type, rentalPeriodId)

    if (!result?.success) {
      errorMessage.value = result?.error || 'Failed to remove item'
    }
  } catch (error) {
    console.error('Failed to remove cart item:', error)

    errorMessage.value =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to remove item'
  }
}

const quantityChange = async (event, itemId) => {
  const input = event.target

  const quantity = Math.max(1, Number.parseInt(input.value, 10) || 1)

  input.value = quantity

  try {
    await cartStore.updateQuantity(itemId, quantity)
  } catch (error) {
    console.error('Failed to update quantity:', error)

    errorMessage.value =
      error?.response?.data?.message ||
      error?.message ||
      'Failed to update quantity'
  }
}

const handleSubmit = async methodCode => {
  if (isSubmitting.value || !methodCode) {
    return
  }

  errorMessage.value = ''
  paymentMethodError.value = ''

  /*
   * Store selected payment method.
   *
   * CheckoutCartModal uses this
   * payment type when submitting.
   */
  topupStore.setPaymentType(methodCode)

  /*
   * External/card checkout:
   *
   * Open customer information
   * modal directly.
   */
  if (methodCode !== 'balance') {
    isCheckoutModalOpen.value = true

    return
  }

  /*
   * Balance checkout does not
   * require CheckoutCartModal.
   */
  try {
    isSubmitting.value = true

    const response = await purchaseStore.purchaseCartItemsFromBalance()

    if (!response?.success) {
      const message = response?.error || 'An error occurred during checkout'

      toast.error(message)

      paymentMethodError.value = message

      return
    }

    if (response.redirect_url) {
      window.location.assign(response.redirect_url)

      return
    }

    await router.push({
      name: 'SuccessPaymentPage',
    })
  } catch (error) {
    console.error('Checkout error:', error)

    const message =
      error?.response?.data?.message ||
      error?.message ||
      'An error occurred during checkout'

    toast.error(message)

    paymentMethodError.value = message
  } finally {
    isSubmitting.value = false
  }
}

const handleCheckoutClose = () => {
  isCheckoutModalOpen.value = false
}

const handleBackFromCheckout = () => {
  isCheckoutModalOpen.value = false
}

onMounted(async () => {
  try {
    if (!settingsStore.settings) {
      await settingsStore.fetchSettings()
    }

    await refreshCart()
  } catch (error) {
    console.error('Failed to initialize cart page:', error)
  }
})
</script>

<style lang="scss" scoped>
.cart-page {
  @include adaptiveValue('margin-top', 77, 50, 1840, 1370, 1);

  @include adaptiveValue('padding-top', 90, 60);

  @include adaptiveValue('padding-bottom', 100, 35);

  position: relative;

  display: flex;
  overflow: hidden;
  flex: 1 1 100%;
  flex-direction: column;

  min-height: 100vh;

  background-color: var(--bg-primary-color);

  &__bg {
    position: fixed;
    inset: 0;
    z-index: -2;

    width: 100%;
    height: 100%;

    pointer-events: none;

    &::after {
      position: absolute;
      inset: 0;

      background:
        linear-gradient(
          180deg,
          rgb(7 8 14 / 28%) 0%,
          rgb(7 8 14 / 76%) 68%,
          var(--bg-primary-color) 100%
        ),
        linear-gradient(
          90deg,
          rgb(7 8 14 / 60%) 0%,
          transparent 50%,
          rgb(7 8 14 / 60%) 100%
        );

      content: '';
    }

    img {
      opacity: 0.78;
    }
  }

  &__decor {
    position: absolute;
    top: 0;
    left: 50%;
    z-index: 3;

    width: clamp(150px, 15vw, 280px);
    height: clamp(14px, 1.4vw, 26px);

    pointer-events: none;

    transform: translate(-50%, -50%);
  }

  &__inner {
    position: relative;
    z-index: 1;

    width: 100%;
    max-width: 1540px;

    margin: auto;
  }

  &__frame {
    @include adaptiveValue('border-radius', 10, 6);

    position: relative;

    padding: 5px;

    border: 1px solid var(--border-secondary-color);
    background-color: var(--bg-fourth-color);
    box-shadow:
      0 25px 80px rgb(0 0 0 / 40%),
      inset 0 0 35px rgb(179 154 107 / 4%);
  }

  &__box {
    @include adaptiveValue('border-radius', 10, 6);

    @include adaptiveValue('padding-top', 42, 20);

    @include adaptiveValue('padding-bottom', 42, 20);

    @include adaptiveValue('padding-left', 42, 12);

    @include adaptiveValue('padding-right', 42, 12);

    position: relative;

    border: 1px solid var(--border-secondary-color);
    background-color: rgb(30 30 30 / 94%);
    box-shadow: inset 0 0 45px rgb(0 0 0 / 18%);
  }

  &__heading {
    position: relative;

    max-width: 650px;

    margin: 0 auto;

    text-align: center;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 25);
    }

    &::after {
      display: block;

      width: min(180px, 45%);
      height: 1px;

      margin: 20px auto 0;

      background: var(--hint-gradient);

      content: '';
    }
  }

  &__subtitle {
    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  &__title {
    span {
      color: var(--hint-secondary-color);
    }
  }

  &__count {
    margin-top: 10px;

    color: var(--secondary-color);
    font-size: 14px;
  }
}

.cart-state {
  min-height: clamp(380px, 58vh, 600px);

  &__box {
    display: flex;
    align-items: center;
    justify-content: center;

    min-height: inherit;
  }

  &__content {
    width: min(100%, 600px);

    margin: auto;

    text-align: center;
  }

  &__subtitle {
    margin-bottom: 12px;
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 15);
    }
  }

  &__message {
    color: var(--secondary-color);
    font-size: 16px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 20);
    }

    &_error {
      color: var(--error-color);
    }
  }

  &__button,
  &__link {
    width: min(100%, 280px);

    margin: 0 auto;
  }
}

.cart {
  display: grid;
  align-items: start;
  gap: clamp(20px, 2vw, 40px);
  grid-template-columns:
    minmax(0, 1fr)
    minmax(340px, 34%);

  &__products {
    min-width: 0;
  }

  &__list {
    display: flex;
    overflow-y: auto;
    flex-direction: column;

    max-height: 680px;

    padding-right: 10px;

    scrollbar-color: var(--border-secondary-color) transparent;

    scrollbar-width: thin;

    &::-webkit-scrollbar {
      width: 5px;
    }

    &::-webkit-scrollbar-track {
      background-color: transparent;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 4px;
      background-color: var(--border-secondary-color);
    }
  }

  &__payment {
    position: sticky;
    top: 90px;
  }

  @media (max-width: $md3) {
    grid-template-columns: 1fr;

    &__list {
      overflow: visible;

      max-height: none;

      padding-right: 0;
    }

    &__payment {
      position: relative;
      top: auto;
    }
  }
}

.cart-item {
  position: relative;

  display: grid;
  align-items: center;
  gap: clamp(12px, 1.4vw, 24px);
  grid-template-columns:
    clamp(72px, 7vw, 100px)
    minmax(140px, 1fr)
    auto
    42px;

  min-height: 145px;

  padding: 18px 10px;

  border-bottom: 1px solid var(--border-fourth-color);

  transition:
    opacity 0.3s ease,
    background-color 0.3s ease;

  &_loading {
    opacity: 0.45;

    pointer-events: none;
  }

  @media (any-hover: hover) {
    &:hover {
      background-color: rgb(255 255 255 / 2%);
    }
  }

  &__preview {
    position: relative;

    display: flex;
    overflow: visible;
    align-items: center;
    justify-content: center;

    width: clamp(72px, 7vw, 100px);
    aspect-ratio: 2 / 3;
  }

  &__card,
  &__pack {
    position: relative;

    width: 100%;
    height: 100%;
  }

  &__card {
    display: flex;
    align-items: center;
    justify-content: center;

    container-type: inline-size;
  }

  &__card-inner {
    position: relative;

    overflow: visible;

    width: 100%;
    aspect-ratio: 2 / 3;
  }

  &__card-frame {
    position: absolute;
    inset: 0;
    z-index: 2;

    display: block;

    width: 100%;
    height: 100%;

    pointer-events: none;

    object-fit: contain;
  }

  &__card-art {
    position: absolute;
    top: 15%;
    left: 50%;
    z-index: 2;

    width: 57%;
    height: 38%;

    transform: translateX(-50%);
  }

  &__card-image {
    display: block;

    width: 100%;
    height: 100%;

    object-fit: contain;
  }

  &__card-name {
    position: absolute;
    top: 43%;
    left: 50%;
    z-index: 3;

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

  &__pack {
    img {
      width: 100%;
      height: 100%;

      object-fit: contain;
    }
  }

  &__description {
    position: absolute;
    bottom: 14%;
    left: 50%;
    z-index: 3;

    display: flex;
    overflow: hidden;
    align-items: center;
    justify-content: center;

    width: 56%;
    height: 22%;

    padding: 2%;

    color: #411e00;
    font-family: var(--font-inter);
    font-size: clamp(3px, 5cqi, 7px);
    line-height: 1.15;
    text-align: center;

    pointer-events: none;

    transform: translateX(-50%);

    :deep(p) {
      margin: 0;
    }

    :deep(br) {
      display: none;
    }
  }

  &__stat {
    position: absolute;
    z-index: 4;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 17%;
    aspect-ratio: 1;

    color: var(--primary-color);
    font-family: var(--font-pt-serif);
    font-size: clamp(9px, 12cqi, 18px);
    font-weight: 700;
    line-height: 1;

    pointer-events: none;

    paint-order: stroke fill;

    -webkit-text-fill-color: var(--primary-color);

    -webkit-text-stroke-width: clamp(0.5px, 1.2cqi, 1.3px);

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

  &__information {
    display: flex;
    flex-direction: column;
    gap: 14px;

    min-width: 0;
  }

  &__name {
    overflow: hidden;

    color: var(--primary-color);
    font-family: var(--font-spectral-sc);
    font-size: clamp(15px, 1.2vw, 18px);
    line-height: 120%;
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;

    transition: color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-secondary-color);
      }
    }
  }

  &__meta,
  &__quantity {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__meta-label,
  &__quantity-label {
    color: var(--secondary-color);
    font-size: 13px;
  }

  &__meta-value {
    color: var(--primary-color);
    font-size: 13px;
  }

  &__quantity-input {
    width: 60px;
    height: 36px;

    padding: 4px 8px;

    border: 1px solid var(--border-secondary-color);
    border-radius: 4px;
    outline: none;
    background-color: var(--bg-secondary-color);

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    text-align: center;

    appearance: textfield;

    &:focus {
      border-color: var(--hint-primary-color);
    }

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      appearance: none;
    }
  }

  &__price {
    white-space: nowrap;
  }

  &__remove {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 40px;
    height: 40px;

    padding: 0;

    border: 1px solid transparent;
    border-radius: 4px;
    outline: none;
    background-color: transparent;

    color: var(--third-color);

    cursor: pointer;

    transition:
      color 0.3s ease,
      border-color 0.3s ease,
      background-color 0.3s ease;

    &:disabled {
      opacity: 0.4;

      cursor: not-allowed;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        border-color: rgb(238 57 85 / 30%);
        background-color: rgb(238 57 85 / 8%);

        color: var(--error-color);
      }
    }
  }

  &__remove-icon {
    width: 20px;
    height: 20px;
  }

  &__error {
    grid-column: 2 / -1;

    color: var(--error-color);
    font-size: 13px;
  }

  @media (max-width: $md5) {
    gap: 12px;
    grid-template-columns:
      68px
      minmax(0, 1fr)
      38px;

    padding-right: 0;
    padding-left: 0;

    &__preview {
      width: 68px;
    }

    &__price {
      grid-column: 2;
      grid-row: 2;
    }

    &__remove {
      grid-column: 3;
      grid-row: 1 / span 2;
    }

    &__error {
      grid-column: 1 / -1;
    }
  }
}

.payment {
  @include adaptiveValue('padding', 30, 18);

  @include adaptiveValue('border-radius', 10, 6);

  border: 1px solid var(--border-secondary-color);
  background-color: var(--bg-fourth-color);
  box-shadow:
    inset 0 0 30px rgb(179 154 107 / 3%),
    0 15px 35px rgb(0 0 0 / 20%);

  &__heading {
    padding-bottom: 20px;

    border-bottom: 1px solid var(--border-fourth-color);
  }

  &__subtitle {
    margin-bottom: 8px;
  }

  &__summary {
    padding-top: 26px;
  }

  &__total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    padding-bottom: 16px;

    border-bottom: 2px solid var(--border-secondary-color);
  }

  &__total-label {
    color: var(--primary-color);
    font-family: var(--font-spectral-sc);
    font-size: 22px;
    text-transform: uppercase;
  }

  &__total-price {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__old-price,
  &__fiat-old {
    opacity: 0.55;

    text-decoration: line-through;
  }

  &__rate {
    display: flex;
    justify-content: space-between;
    gap: 15px;

    padding-top: 14px;

    color: var(--third-color);
    font-size: 12px;
  }

  &__rate-value,
  &__fiat {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  &__fiat {
    white-space: nowrap;
  }

  &__methods {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    margin-top: 36px;
  }

  &__method {
    width: 100%;
    min-width: fit-content;
    min-height: 46px;

    &_primary {
      grid-column: 1 / -1;
    }
  }

  &__cards {
    display: flex;
    align-items: center;
    gap: 8px;

    margin-left: auto;

    img {
      width: auto;
      max-width: 40px;
      height: 22px;
    }
  }

  &__method-balance {
    margin-left: auto;
  }

  &__method-image {
    max-width: 90px;
    max-height: 25px;

    object-fit: contain;
  }

  &__error {
    margin-top: 20px;
    padding: 12px;

    border: 1px solid rgb(238 57 85 / 30%);
    border-radius: 4px;
    background-color: rgb(238 57 85 / 8%);

    color: var(--error-color);
    font-size: 13px;
    text-align: center;
  }

  &__submitting {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;

    margin-top: 20px;

    color: var(--secondary-color);
    font-size: 13px;
  }

  &__loader {
    width: 24px;
    height: 24px;
  }

  &__continue {
    display: block;

    width: fit-content;

    margin: 28px auto 0;

    text-align: center;
  }

  @media (max-width: $md5) {
    &__total,
    &__rate {
      flex-direction: column;
      align-items: flex-start;
    }

    &__methods {
      grid-template-columns: 1fr;
    }

    &__method_primary {
      grid-column: auto;
    }
  }
}
</style>
