<template>
  <div class="wallet">
    <div class="wallet__grid">
      <div class="wallet__column">
        <h2 class="wallet__column-title _h3">
          {{ $t('Balance') }}
        </h2>

        <div class="wallet__frame">
          <div class="wallet__box balance-card">
            <div class="balance-card__icon">
              <SvgIcon :icon="WalletIcon" class="balance-card__icon-svg" />
            </div>

            <div class="balance-card__amount">
              <PriceFormatter
                :price="userStore.userBalance"
                size="size-48"
                :balance="true"
              />
            </div>

            <div class="balance-card__rate">
              <div class="balance-card__rate-row">
                <span>{{ $t('Rate') }}:</span>

                <PriceFormatter size="size-14" :price="1" />

                <span>=</span>

                <span>
                  {{ currencyStore.currentCurrencySymbol }}
                  {{ oneInternalUnitInFiat }}
                </span>
              </div>

              <div class="balance-card__fiat">
                {{ currencyStore.currentCurrencySymbol }}
                {{ balanceInFiatCurrency }}
              </div>
            </div>

            <BaseButton
              v-if="offersEnabled"
              type="button"
              class="balance-card__withdraw"
              variant="bordered"
              @click="modalStore.open('contactInfo')"
            >
              {{ $t('Withdraw') }}
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Top up -->
      <div class="wallet__column">
        <h2 class="wallet__column-title _h3">
          {{ $t('Top Up Balance') }}
        </h2>

        <div class="wallet__frame">
          <div class="wallet__box top-up">
            <p class="top-up__description">
              {{ $t('Choose a convenient payment amount:') }}
            </p>

            <div class="top-up__options">
              <button
                v-for="option in convertedTopUpOptions"
                :key="option.eurAmount"
                type="button"
                class="top-up__option"
                :class="{
                  'top-up__option_active':
                    selectedPresetEur === option.eurAmount,
                }"
                :aria-pressed="selectedPresetEur === option.eurAmount"
                @click="selectTopUpOption(option)"
              >
                {{ currencyStore.currentCurrencySymbol }}
                {{ formatOptionAmount(option.convertedAmount) }}
              </button>
            </div>

            <div class="top-up__divider" />

            <p class="top-up__description">
              {{ $t('Or enter personal amount:') }}
            </p>

            <div class="top-up__form">
              <label class="top-up__field">
                <span class="top-up__label">
                  {{ $t('Amount') }}
                </span>

                <BaseInput
                  v-model="fiatAmount"
                  class="top-up__input"
                  inputmode="decimal"
                  :placeholder="$t('Amount')"
                  @input="handleCustomAmountInput"
                >
                  <template #prefix>
                    <span class="top-up__currency">
                      {{ currencyStore.currentCurrencySymbol }}
                    </span>
                  </template>
                </BaseInput>
              </label>

              <BaseButton
                type="button"
                class="top-up__submit"
                :disabled="!canOpenTopUp"
                @click="openTopUpModal"
              >
                {{ $t('Pay') }}
              </BaseButton>
            </div>

            <div class="top-up__minimum">
              {{ $t('Min') }}
              {{ currencyStore.currentCurrencySymbol }}
              {{ minAmountInFiatCurrency }}
            </div>

            <div class="top-up__conversion">
              <span> {{ $t('You will receive') }}: </span>

              <PriceFormatter :price="internalTopUpAmount" size="size-20" />
            </div>

            <p v-if="validationMessage" class="top-up__error" role="alert">
              {{ validationMessage }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <TopUpModal
      :show="modalStore.isOpen('topup')"
      :initial-amount="internalTopUpAmount"
      :fiat-amount="amountInFiatCurrency"
      @close="handleTopUpClose"
      @proceed-to-checkout="handleProceedToCheckout"
    />

    <SellSkinsModal
      v-if="offersEnabled"
      :show="modalStore.isOpen('sellSkins')"
      @close="handleSellSkinsClose"
    />

    <SellConfirmationModal
      v-if="offersEnabled"
      :show="modalStore.isOpen('sellConfirmation')"
      @close="handleSellConfirmationClose"
    />

    <ContactInfoModal
      v-if="offersEnabled"
      :show="modalStore.isOpen('contactInfo')"
      @close="handleContactInfoClose"
    />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { WalletIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import ContactInfoModal from '@/components/modals/sellSkins/ContactInfoModal.vue'
import SellConfirmationModal from '@/components/modals/sellSkins/SellConfirmationModal.vue'
import SellSkinsModal from '@/components/modals/sellSkins/SellSkinsModal.vue'
import TopUpModal from '@/components/modals/TopUpModal.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'
import { useToast } from '@/composables/useToast'
import { useCurrencyStore } from '@/stores/currency'
import { useModalStore } from '@/stores/modal'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'

const BASE_TOP_UP_OPTIONS = [10, 25, 50, 75, 100, 250, 500, 750, 1000, 2000]

const userStore = useUserStore()
const modalStore = useModalStore()
const currencyStore = useCurrencyStore()
const settingsStore = useSettingsStore()

const toast = useToast()
const { t } = useI18n()

const fiatAmount = ref('')
const selectedPresetEur = ref(null)
const validationMessage = ref('')

const normalizeNumber = (value, fallback = 0) => {
  const normalizedValue =
    typeof value === 'string' ? value.replace(',', '.').trim() : value

  const number = Number(normalizedValue)

  return Number.isFinite(number) ? number : fallback
}

/*
 * Selected fiat currency rate relative to EUR.
 */
const currencyRate = computed(() => {
  return normalizeNumber(currencyStore.currentCurrency?.value, 1)
})

/*
 * EUR value of one internal/game currency unit.
 */
const internalCurrencyEurRate = computed(() => {
  return normalizeNumber(
    settingsStore.settings?.internal_currency?.exchange_rate_eur,
    1,
  )
})

const minimumInternalAmount = computed(() => {
  return normalizeNumber(settingsStore.settings?.min_order_amount, 0)
})

const offersEnabled = computed(() => {
  return Boolean(settingsStore.settings?.payouts?.offer_enabled)
})

/*
 * Presets are stored as EUR amounts and converted
 * whenever the user changes the selected currency.
 */
const convertedTopUpOptions = computed(() => {
  return BASE_TOP_UP_OPTIONS.map(eurAmount => {
    return {
      eurAmount,

      convertedAmount: eurAmount * currencyRate.value,
    }
  })
})

const oneInternalUnitInFiat = computed(() => {
  const convertedRate = internalCurrencyEurRate.value * currencyRate.value

  return convertedRate.toFixed(2)
})

const balanceInFiatCurrency = computed(() => {
  const internalBalance = normalizeNumber(userStore.userBalance, 0)

  const fiatBalance =
    internalBalance * internalCurrencyEurRate.value * currencyRate.value

  return fiatBalance.toFixed(2)
})

const minAmountInFiatCurrency = computed(() => {
  const minimumFiatAmount =
    minimumInternalAmount.value *
    internalCurrencyEurRate.value *
    currencyRate.value

  return minimumFiatAmount.toFixed(2)
})

const normalizedFiatAmount = computed(() => {
  return normalizeNumber(fiatAmount.value, 0)
})

/*
 * Amount of internal/game currency received.
 */
const internalTopUpAmount = computed(() => {
  const conversionRate = internalCurrencyEurRate.value * currencyRate.value

  if (conversionRate <= 0) {
    return 0
  }

  const internalAmount = normalizedFiatAmount.value / conversionRate

  return Number(internalAmount.toFixed(2))
})

/*
 * Amount charged by the payment provider.
 */
const amountInFiatCurrency = computed(() => {
  return normalizedFiatAmount.value.toFixed(2)
})

const canOpenTopUp = computed(() => {
  const minimum = Number(minAmountInFiatCurrency.value)

  return normalizedFiatAmount.value > 0 && normalizedFiatAmount.value >= minimum
})

const formatOptionAmount = value => {
  const amount = normalizeNumber(value, 0)

  if (Number.isInteger(amount)) {
    return amount.toLocaleString()
  }

  return amount.toFixed(2)
}

const selectTopUpOption = option => {
  selectedPresetEur.value = option.eurAmount

  fiatAmount.value = Number(option.convertedAmount.toFixed(2))

  validationMessage.value = ''
}

const handleCustomAmountInput = () => {
  selectedPresetEur.value = null
  validationMessage.value = ''
}

const validateTopUpAmount = () => {
  if (normalizedFiatAmount.value <= 0) {
    return t('Please enter a valid amount')
  }

  const minimum = Number(minAmountInFiatCurrency.value)

  if (normalizedFiatAmount.value < minimum) {
    return `${t('Minimum top up amount is')} ${
      currencyStore.currentCurrencySymbol
    }${minimum.toFixed(2)}`
  }

  return ''
}

/*
 * Opens the new combined modal.
 * Customer details and payment selection happen
 * inside TopUpModal.
 */
const openTopUpModal = () => {
  validationMessage.value = validateTopUpAmount()

  if (validationMessage.value) {
    toast.warning(validationMessage.value)

    return
  }

  /*
   * Close any other account drawer/modal before
   * opening the payment modal.
   */
  modalStore.close('checkout')
  modalStore.open('topup')
}

const handleTopUpClose = () => {
  modalStore.close('topup')
}

const handleSellSkinsClose = () => {
  modalStore.close('sellSkins')
}

const handleSellConfirmationClose = () => {
  modalStore.close('sellConfirmation')
}

const handleContactInfoClose = () => {
  modalStore.close('contactInfo')
}

/*
 * Preserve the same EUR value when the selected
 * display currency changes.
 *
 * Example:
 * EUR 10 becomes USD 11.50 if USD rate is 1.15.
 */
watch(currencyRate, (nextRate, previousRate) => {
  if (
    !normalizedFiatAmount.value ||
    !previousRate ||
    nextRate === previousRate
  ) {
    return
  }

  const amountInEur = normalizedFiatAmount.value / previousRate

  fiatAmount.value = Number((amountInEur * nextRate).toFixed(2))

  validationMessage.value = ''
})
</script>

<style lang="scss" scoped>
.wallet {
  width: 100%;

  &__heading {
    max-width: 620px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 38, 24);
    }
  }

  &__subtitle {
    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  &__title {
    text-align: left;

    span {
      color: var(--hint-secondary-color);
    }
  }

  &__grid {
    display: grid;
    align-items: stretch;
    gap: clamp(18px, 2vw, 30px);
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  &__column {
    display: flex;
    flex-direction: column;

    min-width: 0;
  }

  &__column-title {
    @include adaptiveValue('font-size', 20, 18);

    color: var(--hint-primary-color);
    text-align: left;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 15);
    }
  }

  /*
   * Layout wrapper only.
   * No padding, border, or background here.
   */
  &__frame {
    display: flex;
    flex: 1 1 auto;

    min-width: 0;
  }

  /*
   * The only visible box surface.
   * This matches ProfileInfo without a double border.
   */
  &__box {
    width: 100%;
    min-width: 0;
    height: 100%;

    border-radius: 6px;
    background-color: var(--bg-third-color);
    box-shadow: 0 14px 35px rgb(0 0 0 / 16%);
  }

  @media (max-width: $md3) {
    &__grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: $md7) {
    &__heading {
      padding-right: 10px;
      padding-left: 10px;
    }

    &__box {
      border-radius: 6px;
    }
  }
}

.balance-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  min-height: clamp(320px, 32vw, 355px);

  padding: clamp(25px, 3vw, 45px) clamp(16px, 2.5vw, 35px);

  text-align: center;

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;

    width: clamp(44px, 4vw, 56px);
    aspect-ratio: 1;

    color: var(--hint-primary-color);

    &:not(:last-child) {
      margin-bottom: 22px;
    }
  }

  &__icon-svg {
    width: 100%;
    height: 100%;

    color: inherit;
  }

  &__amount {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-width: 0;

    &:not(:last-child) {
      margin-bottom: 32px;
    }

    :deep(*) {
      max-width: 100%;
    }
  }

  &__rate {
    color: var(--secondary-color);
    font-size: 13px;

    &:not(:last-child) {
      margin-bottom: 32px;
    }
  }

  &__rate-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 5px;

    color: var(--secondary-color);
    font-size: 14px;
    line-height: 17px;
  }

  &__fiat {
    margin-top: 8px;

    color: var(--third-color);
  }

  &__withdraw {
    width: min(100%, 190px);
    min-height: 40px;

    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    text-transform: uppercase;
  }

  @media (max-width: $md7) {
    min-height: 290px;

    padding: 25px 14px;

    &__amount {
      &:not(:last-child) {
        margin-bottom: 24px;
      }
    }

    &__rate {
      &:not(:last-child) {
        margin-bottom: 24px;
      }
    }

    &__withdraw {
      width: 100%;
      min-height: 44px;
    }
  }
}

.top-up {
  display: flex;
  flex-direction: column;

  min-height: clamp(320px, 32vw, 355px);

  padding: clamp(25px, 3vw, 36px) clamp(16px, 2.5vw, 30px);

  &__description {
    color: var(--secondary-color);
    font-size: 14px;
    line-height: 150%;

    &:not(:last-child) {
      margin-bottom: 20px;
    }
  }

  &__options {
    display: grid;
    gap: 10px;
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }

  &__option {
    min-width: 0;
    min-height: 38px;

    padding: 7px 8px;

    border: 1px solid var(--hint-primary-color);
    border-radius: 4px;
    outline: none;
    background-color: transparent;

    color: var(--hint-primary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;

    cursor: pointer;

    transition:
      color 0.3s ease,
      border-color 0.3s ease,
      background-color 0.3s ease;

    &_active {
      border-color: transparent;
      background: var(--hint-gradient);

      color: var(--bg-primary-color);
    }

    &:focus-visible {
      border-color: var(--hint-secondary-color);

      color: var(--hint-secondary-color);
    }

    @media (any-hover: hover) {
      &:not(&_active):hover {
        border-color: var(--hint-secondary-color);

        color: var(--hint-secondary-color);
      }
    }
  }

  &__divider {
    width: 100%;
    height: 1px;

    margin: 28px 0;

    background: linear-gradient(
      90deg,
      transparent,
      var(--border-secondary-color),
      transparent
    );
  }

  &__form {
    display: grid;
    align-items: end;
    gap: 10px;
    grid-template-columns:
      minmax(0, 1fr)
      minmax(130px, 48%);
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 8px;

    min-width: 0;
  }

  &__label {
    color: var(--hint-primary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 500;
  }

  &__input {
    width: 100%;
    min-width: 0;
  }

  &__currency {
    color: var(--secondary-color);
    font-size: 14px;
  }

  &__submit {
    width: 100%;
    min-height: 40px;

    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    text-transform: uppercase;
  }

  &__minimum {
    margin-top: 10px;

    color: var(--secondary-color);
    font-size: 12px;
  }

  &__conversion {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 7px;

    margin-top: 14px;

    color: var(--secondary-color);
    font-size: 13px;
  }

  &__error {
    margin-top: 14px;
    padding: 10px 12px;

    border: 1px solid rgb(238 57 85 / 30%);
    border-radius: 4px;
    background-color: rgb(238 57 85 / 8%);

    color: var(--error-color);
    font-size: 13px;
    line-height: 140%;
  }

  @media (max-width: $md2) {
    &__options {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: $md4) {
    &__options {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: $md7) {
    min-height: auto;

    padding: 25px 14px;

    &__options {
      gap: 8px;
    }

    &__option {
      min-height: 42px;
    }

    &__divider {
      margin: 22px 0;
    }

    &__form {
      grid-template-columns: 1fr;
    }

    &__submit {
      min-height: 44px;
    }
  }
}
</style>
