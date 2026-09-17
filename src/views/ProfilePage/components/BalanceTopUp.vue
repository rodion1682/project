<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import axios from '@/plugins/axios'

import { useCurrStore } from '@/stores/currencies'
import { useProfileStore } from '@/stores/profile'
import { useSettingsStore } from '@/stores/settings'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const props = defineProps({
  initialMode: {
    type: String,
    default: 'card',
  },
})

const emit = defineEmits(['back', 'completed'])

const profileStore = useProfileStore()
const currStore = useCurrStore()
const settingsStore = useSettingsStore()

const BASE_AMOUNTS = [25, 50, 100, 250, 500]

const mode = ref(props.initialMode)

const amount = ref(null)

const cardNumber = ref('')
const expiry = ref('')
const cvv = ref('')
const cardholder = ref('')

const paymentErrors = ref({})
const paymentError = ref('')
const isPaying = ref(false)

const giftCode = ref('')
const giftError = ref('')
const giftSuccess = ref('')
const isRedeeming = ref(false)

let messageTimer = null

const currency = computed(() => {
  return currStore.currency || {}
})

const currencyCode = computed(() => {
  return currency.value?.code || 'EUR'
})

const currencySymbol = computed(() => {
  return currency.value?.symbol || currencyCode.value
})

const currencyRate = computed(() => {
  const rate = Number(currency.value?.value)

  return Number.isFinite(rate) && rate > 0 ? rate : 1
})

const balance = computed(() => {
  const value = Number(profileStore.profile?.balance)

  return Number.isFinite(value) ? value : 0
})

const minAmount = computed(() => {
  const value = Number(settingsStore.settings?.min_order_amount)

  return Number.isFinite(value) && value > 0 ? value : 0
})

const maxAmount = computed(() => {
  const value = Number(settingsStore.settings?.max_order_amount)

  return Number.isFinite(value) && value > 0 ? value : null
})

const presets = computed(() => {
  return BASE_AMOUNTS.map((baseAmount) => {
    return Number((baseAmount * currencyRate.value).toFixed(2))
  }).filter((value) => {
    if (minAmount.value && value < minAmount.value) {
      return false
    }

    if (maxAmount.value && value > maxAmount.value) {
      return false
    }

    return true
  })
})

const balanceAfter = computed(() => {
  return balance.value + Number(amount.value || 0)
})

const formatMoney = (value) => {
  const number = Number(value)

  return `${Number.isFinite(number) ? number.toFixed(2) : '0.00'} ${currencySymbol.value}`
}

const selectAmount = (value) => {
  amount.value = value

  if (paymentErrors.value.amount) {
    delete paymentErrors.value.amount
  }
}

const onAmountInput = (event) => {
  const raw = String(event.target.value)
    .replace(',', '.')
    .replace(/[^\d.]/g, '')

  const parts = raw.split('.')

  const normalized =
    parts.length > 1 ? `${parts[0]}.${parts.slice(1).join('').slice(0, 2)}` : parts[0]

  amount.value = normalized
}

const onCardInput = (event) => {
  let value = event.target.value.replace(/\D/g, '').slice(0, 16)

  value = value.replace(/(\d{4})(?=\d)/g, '$1 ')

  cardNumber.value = value

  if (paymentErrors.value.cardNumber) {
    delete paymentErrors.value.cardNumber
  }
}

const onExpiryInput = (event) => {
  let value = event.target.value.replace(/\D/g, '').slice(0, 4)

  if (value.length >= 2) {
    let month = Number(value.slice(0, 2))

    if (month > 12) {
      month = 12
    }

    if (month === 0) {
      month = 1
    }

    value = String(month).padStart(2, '0') + value.slice(2)
  }

  if (value.length > 2) {
    value = value.slice(0, 2) + '/' + value.slice(2)
  }

  expiry.value = value

  if (paymentErrors.value.expiry) {
    delete paymentErrors.value.expiry
  }
}

const onCvvInput = (event) => {
  cvv.value = event.target.value.replace(/\D/g, '').slice(0, 3)

  if (paymentErrors.value.cvv) {
    delete paymentErrors.value.cvv
  }
}

const validatePayment = () => {
  const errors = {}

  const paymentAmount = Number(amount.value)

  if (!paymentAmount) {
    errors.amount = 'Amount is required'
  } else if (minAmount.value && paymentAmount < minAmount.value) {
    errors.amount = `Minimum amount is ${formatMoney(minAmount.value)}`
  } else if (maxAmount.value && paymentAmount > maxAmount.value) {
    errors.amount = `Maximum amount is ${formatMoney(maxAmount.value)}`
  }

  if (!/^\d{4}\s\d{4}\s\d{4}\s\d{4}$/.test(cardNumber.value)) {
    errors.cardNumber = 'Card number must be 16 digits'
  }

  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry.value)) {
    errors.expiry = 'Invalid expiration date'
  }

  if (!/^\d{3}$/.test(cvv.value)) {
    errors.cvv = 'CVV must be exactly 3 digits'
  }

  if (!cardholder.value.trim()) {
    errors.cardholder = 'Card holder name is required'
  }

  paymentErrors.value = errors

  return Object.keys(errors).length === 0
}

const submitPayment = async () => {
  if (isPaying.value || !validatePayment()) {
    return
  }

  paymentError.value = ''
  isPaying.value = true

  try {
    const [expiryMonth, expiryYear] = expiry.value.split('/')

    const response = await axios.post('deposit/checkout/execute', {
      amount: Number(amount.value),

      email: profileStore.profile?.email || '',

      name: profileStore.profile?.name || '',

      surname: profileStore.profile?.surname || '',

      phone: profileStore.profile?.phone || '',

      card_number: cardNumber.value.replace(/\s+/g, ''),

      expiry_month: expiryMonth,
      expiry_year: expiryYear,

      cardholder_name: cardholder.value.trim(),

      cvv: cvv.value,

      currency: currencyCode.value,
    })

    if (response.data?.status === 'ERROR') {
      paymentError.value = response.data?.message || 'Payment failed'

      return
    }

    if (response.data?.redirect_url) {
      window.location.href = response.data.redirect_url

      return
    }

    await profileStore.getProfile()
    await profileStore.getDepositHistory()

    emit('completed')
  } catch (error) {
    const data = error?.response?.data

    if (data?.errors) {
      const errors = {}

      if (data.errors.amount) {
        errors.amount = data.errors.amount[0]
      }

      if (data.errors.card_number) {
        errors.cardNumber = data.errors.card_number[0]
      }

      if (data.errors.expiry_month || data.errors.expiry_year) {
        errors.expiry = data.errors.expiry_month?.[0] || data.errors.expiry_year?.[0]
      }

      if (data.errors.cvv) {
        errors.cvv = data.errors.cvv[0]
      }

      if (data.errors.cardholder_name) {
        errors.cardholder = data.errors.cardholder_name[0]
      }

      paymentErrors.value = {
        ...paymentErrors.value,
        ...errors,
      }
    }

    paymentError.value = data?.message || data?.error || 'Payment failed. Please try again.'
  } finally {
    isPaying.value = false
  }
}

const hideGiftMessageLater = () => {
  if (messageTimer) {
    clearTimeout(messageTimer)
  }

  messageTimer = setTimeout(() => {
    giftError.value = ''
    giftSuccess.value = ''
    messageTimer = null
  }, 3000)
}

const redeemGiftCard = async () => {
  const code = giftCode.value.trim()

  if (!code || isRedeeming.value) {
    return
  }

  giftError.value = ''
  giftSuccess.value = ''
  isRedeeming.value = true

  try {
    await axios.post(`gift-cards/use/${encodeURIComponent(code)}`)

    giftCode.value = ''

    giftSuccess.value = 'Gift card redeemed successfully'

    await profileStore.getProfile()
    await profileStore.getDepositHistory()

    hideGiftMessageLater()
  } catch (error) {
    giftError.value =
      error?.response?.data?.message || error?.response?.data?.error || 'Failed to redeem gift card'

    hideGiftMessageLater()
  } finally {
    isRedeeming.value = false
  }
}

const fillCardholder = () => {
  if (cardholder.value) {
    return
  }

  cardholder.value = [profileStore.profile?.name, profileStore.profile?.surname]
    .filter(Boolean)
    .join(' ')
}

watch(
  () => props.initialMode,
  (value) => {
    mode.value = value
  },
)

watch(() => profileStore.profile, fillCardholder, {
  immediate: true,
  deep: true,
})

watch(
  () => currencyCode.value,
  async () => {
    amount.value = null

    await settingsStore.getSettings()
  },
)

onMounted(async () => {
  await settingsStore.getSettings()

  fillCardholder()

  if (presets.value.length) {
    amount.value =
      presets.value.find((value) => value >= 100 * currencyRate.value) || presets.value[0]
  }
})

onBeforeUnmount(() => {
  if (messageTimer) {
    clearTimeout(messageTimer)
  }
})
</script>

<template>
  <div class="balance-top-up">
    <!-- MOBILE TABS -->
    <div class="balance-top-up__tabs">
      <button
        type="button"
        :class="[
          'balance-top-up__tab',
          {
            active: mode === 'card',
          },
        ]"
        @click="mode = 'card'"
      >
        {{ $t('Card') }}
      </button>

      <button
        type="button"
        :class="[
          'balance-top-up__tab',
          {
            active: mode === 'gift-card',
          },
        ]"
        @click="mode = 'gift-card'"
      >
        {{ $t('Gift card') }}
      </button>
    </div>

    <div class="balance-top-up__layout">
      <!-- CARD -->
      <section
        class="balance-top-up__card balance-top-up__payment"
        :class="{
          'balance-top-up__mobile-hidden': mode !== 'card',
        }"
      >
        <div class="balance-top-up__heading">
          <h2>
            {{ $t('Pay by card') }}
          </h2>

          <button type="button" class="balance-top-up__back-link" @click="emit('back')">
            {{ $t('Back') }}
          </button>
        </div>

        <!-- AMOUNT -->
        <div class="balance-top-up__amount-section">
          <label class="balance-top-up__normal-label">
            <span>*</span>
            {{ $t('Amount to add') }}
          </label>

          <div
            class="balance-top-up__amount-input"
            :class="{
              error: paymentErrors.amount,
            }"
          >
            <input :value="amount" inputmode="decimal" @input="onAmountInput" />

            <span>
              {{ currencySymbol }}
            </span>
          </div>

          <div class="balance-top-up__presets">
            <button
              v-for="preset in presets"
              :key="preset"
              type="button"
              :class="{
                active: Number(amount) === preset,
              }"
              @click="selectAmount(preset)"
            >
              {{ formatMoney(preset) }}
            </button>
          </div>

          <span v-if="paymentErrors.amount" class="balance-top-up__error">
            {{ $t(paymentErrors.amount) }}
          </span>
        </div>

        <!-- CARD DETAILS -->
        <div class="balance-top-up__details">
          <div class="balance-top-up__field balance-top-up__field_card">
            <label>
              {{ $t('Card number') }}
            </label>

            <div
              class="balance-top-up__input-wrap"
              :class="{
                error: paymentErrors.cardNumber,
              }"
            >
              <input
                :value="cardNumber"
                type="text"
                inputmode="numeric"
                autocomplete="cc-number"
                maxlength="19"
                placeholder="0000 0000 0000 0000"
                @input="onCardInput"
              />

              <span class="balance-top-up__cards"> VISA · MC </span>
            </div>

            <span v-if="paymentErrors.cardNumber" class="balance-top-up__error">
              {{ $t(paymentErrors.cardNumber) }}
            </span>
          </div>

          <div class="balance-top-up__card-grid">
            <div class="balance-top-up__field">
              <label>
                {{ $t('Expiry') }}
              </label>

              <input
                :value="expiry"
                :class="{
                  error: paymentErrors.expiry,
                }"
                type="text"
                inputmode="numeric"
                autocomplete="cc-exp"
                maxlength="5"
                placeholder="MM / YY"
                @input="onExpiryInput"
              />

              <span v-if="paymentErrors.expiry" class="balance-top-up__error">
                {{ $t(paymentErrors.expiry) }}
              </span>
            </div>

            <div class="balance-top-up__field">
              <label>
                {{ $t('CVC') }}
              </label>

              <input
                :value="cvv"
                :class="{
                  error: paymentErrors.cvv,
                }"
                type="password"
                inputmode="numeric"
                autocomplete="cc-csc"
                maxlength="3"
                placeholder="•••"
                @input="onCvvInput"
              />

              <span v-if="paymentErrors.cvv" class="balance-top-up__error">
                {{ $t(paymentErrors.cvv) }}
              </span>
            </div>

            <div class="balance-top-up__field balance-top-up__cardholder">
              <label>
                {{ $t('Cardholder') }}
              </label>

              <input
                v-model="cardholder"
                :class="{
                  error: paymentErrors.cardholder,
                }"
                type="text"
                autocomplete="cc-name"
                :placeholder="$t('Name Surname')"
              />

              <span v-if="paymentErrors.cardholder" class="balance-top-up__error">
                {{ $t(paymentErrors.cardholder) }}
              </span>
            </div>
          </div>
        </div>

        <!-- BOTTOM -->
        <div class="balance-top-up__bottom">
          <div class="balance-top-up__after">
            <span>
              {{ $t('Balance after top-up') }}
            </span>

            <strong>
              {{ formatMoney(balanceAfter) }}
            </strong>
          </div>

          <p class="balance-top-up__terms">
            {{
              $t(
                'By continuing you accept our Terms & Conditions and Privacy Notice. Payments are processed with 3-D Secure.',
              )
            }}
          </p>

          <Transition name="balance-message">
            <div v-if="paymentError" class="balance-top-up__server-error">
              {{ paymentError }}
            </div>
          </Transition>

          <div class="balance-top-up__buttons">
            <BaseButton
              type="button"
              variant="dark-secondary"
              class="balance-top-up__pay"
              :disabled="isPaying"
              @click="submitPayment"
            >
              {{ isPaying ? $t('Processing...') : $t('Pay') }}
            </BaseButton>

            <BaseButton
              type="button"
              variant="dark-secondary"
              class="balance-top-up__back-button"
              @click="emit('back')"
            >
              {{ $t('Back') }}
            </BaseButton>
          </div>
        </div>
      </section>

      <!-- RIGHT -->
      <div
        class="balance-top-up__right"
        :class="{
          'balance-top-up__mobile-hidden': mode !== 'gift-card',
        }"
      >
        <section class="balance-top-up__card balance-top-up__gift">
          <h2>
            {{ $t('Redeem a gift card') }}
          </h2>

          <p>
            {{
              $t(
                'Enter the code from your YOURKEYS gift card and its value lands on your balance right away.',
              )
            }}
          </p>

          <form class="balance-top-up__gift-form" @submit.prevent="redeemGiftCard">
            <BaseInput
              v-model="giftCode"
              :label="$t('Code')"
              placeholder="KV-0000-0000"
              :error="giftError"
              autocomplete="off"
            />

            <Transition name="balance-message">
              <div v-if="giftSuccess" class="balance-top-up__gift-success">
                {{ $t(giftSuccess) }}
              </div>
            </Transition>

            <div class="balance-top-up__gift-buttons">
              <BaseButton
                type="submit"
                variant="dark-secondary"
                :disabled="!giftCode.trim() || isRedeeming"
              >
                {{ isRedeeming ? $t('Processing...') : $t('Confirm') }}
              </BaseButton>

              <BaseButton type="button" variant="dark-secondary" @click="emit('back')">
                {{ $t('Back') }}
              </BaseButton>
            </div>
          </form>
        </section>

        <section class="balance-top-up__card balance-top-up__info">
          <span class="balance-top-up__info-title">
            {{ $t('Good to know') }}
          </span>

          <ul>
            <li>
              {{
                $t('Balance never expires and can be spent on any key or gift card in the store.')
              }}
            </li>

            <li>
              {{
                $t('Refunds for keys that fail to activate go back to your balance within minutes.')
              }}
            </li>

            <li>
              {{ $t('Gift-card codes work only once and cannot be split across two accounts.') }}
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;

.balance-top-up {
  width: 100%;
  min-width: 0;

  &__tabs {
    display: none;
  }

  &__layout {
    width: 100%;
    min-width: 0;

    display: grid;
    grid-template-columns:
      minmax(0, 1.35fr)
      minmax(280px, 1fr);

    align-items: start;

    @include adaptiveValue('gap', 24, 16);
  }

  &__right {
    width: 100%;
    min-width: 0;

    display: flex;
    flex-direction: column;

    @include adaptiveValue('gap', 24, 16);
  }

  &__card {
    width: 100%;
    min-width: 0;

    border: 2px solid var(--border-primary-color);
    background-color: var(--bg-secondary-color);

    @include adaptiveValue('border-radius', 14, 12);
  }

  &__payment {
    @include adaptiveValue('padding-top', 34, 18);
    @include adaptiveValue('padding-right', 38, 16);
    @include adaptiveValue('padding-bottom', 38, 20);
    @include adaptiveValue('padding-left', 38, 16);
  }

  &__heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;

    gap: 20px;

    @include adaptiveValue('margin-bottom', 28, 20);

    h2 {
      margin: 0;

      color: var(--primary-color);

      font-family: var(--font-gabarito);
      font-weight: 900;

      @include adaptiveValue('font-size', 26, 21);
    }
  }

  &__back-link {
    border: 0;
    padding: 0;

    background: transparent;
    color: var(--hint-primary-color);

    font: inherit;
    font-size: 13px;

    cursor: pointer;
  }

  &__amount-section {
    display: flex;
    flex-direction: column;

    gap: 10px;
  }

  &__normal-label {
    color: var(--seconday-color);

    font-size: 12px;

    span {
      color: var(--hint-primary-color);
    }
  }

  &__amount-input {
    width: 100%;

    display: flex;
    align-items: baseline;

    border: 2px solid var(--hint-primary-color);
    background-color: var(--bg-primary-color);

    gap: 10px;

    @include adaptiveValue('border-radius', 10, 8);
    @include adaptiveValue('padding-top', 15, 12);
    @include adaptiveValue('padding-right', 18, 14);
    @include adaptiveValue('padding-bottom', 15, 12);
    @include adaptiveValue('padding-left', 18, 14);

    &.error {
      border-color: var(--error-color, #e64b4b);
    }

    input {
      width: 100%;
      min-width: 0;

      padding: 0;
      border: 0;
      outline: 0;

      background: transparent;
      color: var(--primary-color);

      font-family: var(--font-gabarito);
      font-weight: 900;

      font-variant-numeric: tabular-nums;

      @include adaptiveValue('font-size', 30, 26);
    }

    > span {
      color: var(--seconday-color);

      font-size: 16px;
    }
  }

  &__presets {
    width: 100%;

    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));

    gap: 8px;

    button {
      min-width: 0;

      border: 2px solid var(--border-primary-color);
      border-radius: 9px;

      padding: 10px 5px;

      background: transparent;
      color: var(--seconday-color);

      font: inherit;
      font-size: 12px;

      cursor: pointer;

      transition:
        border-color 0.2s ease,
        color 0.2s ease,
        background-color 0.2s ease;

      &.active {
        border-color: var(--hint-primary-color);
        color: var(--hint-primary-color);
      }
    }
  }

  &__details {
    display: flex;
    flex-direction: column;

    border-top: 2px solid var(--border-primary-color);

    @include adaptiveValue('gap', 18, 14);
    @include adaptiveValue('margin-top', 18, 16);
    @include adaptiveValue('padding-top', 20, 18);
  }

  &__field {
    min-width: 0;

    display: flex;
    flex-direction: column;

    gap: 7px;

    label {
      color: var(--seconday-color);

      font-size: 10px;
      font-weight: 700;

      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    > input {
      width: 100%;
      min-width: 0;

      box-sizing: border-box;

      border: 2px solid var(--border-primary-color);
      outline: 0;

      background-color: var(--bg-primary-color);
      color: var(--primary-color);

      font: inherit;

      @include adaptiveValue('border-radius', 10, 8);
      @include adaptiveValue('padding-top', 13, 12);
      @include adaptiveValue('padding-right', 14, 12);
      @include adaptiveValue('padding-bottom', 13, 12);
      @include adaptiveValue('padding-left', 14, 12);

      &.error {
        border-color: var(--error-color, #e64b4b);
      }

      &::placeholder {
        color: var(--seconday-color);
      }
      @media (max-width: $md4) {
        background-color: var(--bg-secondary-color);
      }
    }
  }

  &__input-wrap {
    width: 100%;
    min-width: 0;

    display: flex;
    align-items: center;

    border: 2px solid var(--border-primary-color);
    background-color: var(--bg-primary-color);

    @include adaptiveValue('border-radius', 10, 8);

    &.error {
      border-color: var(--error-color, #e64b4b);
    }
    @media (max-width: $md4) {
      background-color: var(--bg-secondary-color);
    }

    input {
      flex: 1;
      min-width: 0;

      border: 0;
      outline: 0;

      padding: 13px 14px;

      background: transparent;
      color: var(--primary-color);

      font: inherit;

      &::placeholder {
        color: var(--seconday-color);
      }
    }
  }

  &__cards {
    flex-shrink: 0;

    padding-right: 14px;

    color: var(--seconday-color);

    font-size: 9px;
    letter-spacing: 0.08em;
  }

  &__card-grid {
    display: grid;
    grid-template-columns:
      minmax(0, 1fr)
      minmax(0, 1fr)
      minmax(0, 1.4fr);

    gap: 14px;
    @media (max-width: $md4) {
      grid-template-columns: repeat(2, minmax(0, 1fr));

      > :last-child {
        grid-column: 1 / -1;
      }
    }
  }

  &__error {
    color: var(--error-color, #e64b4b);

    font-size: 10px;
    line-height: 1.4;
  }

  &__bottom {
    display: flex;
    flex-direction: column;

    @include adaptiveValue('gap', 15, 12);
    @include adaptiveValue('margin-top', 18, 16);
  }

  &__after {
    display: flex;
    align-items: baseline;
    justify-content: space-between;

    border-top: 2px solid var(--border-primary-color);
    border-bottom: 2px solid var(--border-primary-color);

    gap: 15px;
    padding: 15px 0;

    color: var(--seconday-color);

    font-size: 12px;

    strong {
      color: var(--primary-color);

      font-family: var(--font-gabarito);
      font-size: 21px;
      font-weight: 900;

      font-variant-numeric: tabular-nums;
    }
  }

  &__terms {
    margin: 0;

    color: var(--seconday-color);

    font-size: 10px;
    line-height: 1.7;
  }

  &__buttons,
  &__gift-buttons {
    display: flex;

    gap: 12px;
  }

  &__pay {
    flex: 1;
  }

  &__back-button {
    flex: 0 0 auto;
  }

  &__server-error,
  &__gift-success {
    color: var(--error-color, #e64b4b);

    font-size: 11px;
  }

  &__gift-success {
    color: var(--hint-primary-color);
  }

  &__gift,
  &__info {
    @include adaptiveValue('padding-top', 30, 20);
    @include adaptiveValue('padding-right', 30, 16);
    @include adaptiveValue('padding-bottom', 32, 20);
    @include adaptiveValue('padding-left', 30, 16);
  }

  &__gift {
    h2 {
      margin: 0;

      color: var(--primary-color);

      font-size: 20px;
      font-weight: 500;

      @include adaptiveValue('margin-bottom', 14, 10);
    }

    > p {
      margin: 0;

      color: var(--seconday-color);

      font-size: 12px;
      line-height: 1.7;

      @include adaptiveValue('margin-bottom', 20, 16);
    }
  }

  &__gift-form {
    display: flex;
    flex-direction: column;

    gap: 14px;

    .balance-top-up__gift-buttons {
      > :first-child {
        flex: 1;
      }
    }
  }

  &__info-title {
    display: block;

    color: var(--seconday-color);

    font-size: 10px;
    font-weight: 700;

    letter-spacing: 0.18em;
    text-transform: uppercase;

    margin-bottom: 14px;
  }

  &__info {
    ul {
      display: flex;
      flex-direction: column;

      gap: 12px;

      margin: 0;
      padding: 0;

      list-style: none;

      li {
        position: relative;

        padding-left: 20px;

        color: var(--seconday-color);

        font-size: 11px;
        line-height: 1.7;

        &::before {
          content: '';

          position: absolute;
          top: 9px;
          left: 0;

          width: 9px;
          height: 1px;

          background-color: var(--hint-primary-color);
        }
      }
    }
  }

  @media (max-width: $md3) {
    &__layout {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: $md4) {
    &__tabs {
      width: 100%;

      display: grid;
      grid-template-columns: repeat(2, 1fr);

      border: 2px solid var(--border-primary-color);
      border-radius: 9px;

      padding: 3px;
      margin-bottom: 16px;

      background-color: var(--bg-secondary-color);
    }

    &__tab {
      border: 0;
      border-radius: 7px;

      padding: 10px 8px;

      background: transparent;
      color: var(--seconday-color);

      font: inherit;
      font-size: 11px;

      cursor: pointer;

      &.active {
        background-color: var(--hint-primary-color);
        color: #fff;
      }
    }

    &__mobile-hidden {
      display: none;
    }

    &__payment {
      padding: 0;

      border: 0;
      background: transparent;
    }

    &__heading {
      display: none;
    }

    &__amount-input {
      padding: 13px 12px;

      input {
        font-size: 26px;
      }
    }

    &__presets {
      grid-template-columns: repeat(4, 1fr);

      button {
        font-size: 10px;

        &:nth-child(n + 5) {
          display: none;
        }
      }
    }

    &__details {
      margin-top: 16px;
    }

    &__cards {
      display: none;
    }

    &__card-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    &__after {
      strong {
        font-size: 18px;
      }
    }

    &__back-button {
      display: none;
    }

    &__buttons {
      flex-direction: column;
    }

    &__pay {
      width: 100%;
    }

    &__right {
      gap: 14px;
    }

    &__gift {
      padding: 18px 0;

      border: 0;
      background: transparent;
    }

    &__info {
      display: none;
    }

    &__gift-buttons {
      flex-direction: column;

      > :last-child {
        width: 100%;
      }
    }
  }
}

.balance-message-enter-active,
.balance-message-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.balance-message-enter-from,
.balance-message-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
