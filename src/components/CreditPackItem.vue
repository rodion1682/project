<script setup>
import { useI18n } from 'vue-i18n'
import { defineProps } from 'vue'
import { useCurrStore } from '@/stores/currencies.js'
import { useTopUpModalStore } from '@/stores/topUpModal.js'
import { useTopUpStore } from '@/stores/topUp.js'
import { useAuthStore } from '@/stores/auth'
import { useLoginModalStore } from '@/stores/loginModal'
import UiText, {
  TextAlign,
  TextFont,
  TextSize,
  TextTheme,
  TextWeight,
} from '@/components/shared/UiText.vue'
import UiButton, { ButtonThemes } from '@/components/shared/UiButton.vue'
import router from '@/router'

const { t } = useI18n()
const currencyStore = useCurrStore()
const topUpModalStore = useTopUpModalStore()
const topUpStore = useTopUpStore()

const authStore = useAuthStore()
const loginModalStore = useLoginModalStore()

const props = defineProps({
  pack: Object,
  mostPopular: {
    default: () => false,
    type: Boolean,
  },
  equivalent: {
    default: () => false,
    type: Boolean,
  },
})

const openTopUpModal = () => {
  if (authStore.isAuth) {
    topUpModalStore.setStep(2)
    topUpStore.setCreditPackId(props.pack.id)
    topUpModalStore.openModal()
  } else {
    router.push({ path: '/sign-in' })
    // loginModalStore.openModal()
  }
}
</script>

<template>
  <div
    class="prices__item prices__item_most-popular"
    :class="{ 'prices__item_most-popular': mostPopular }"
  >
    <div class="prices__item-inner">
      <UiText
        v-if="mostPopular"
        class="prices__most-popular"
        :size="TextSize.XS"
        :weight="TextWeight.BOLD"
        :theme="TextTheme.SECONDARY_INVERTED"
        :text="$t('Most popular')"
      />
      <UiText
        :size="TextSize.H4"
        :font="TextFont.RED"
        :weight="TextWeight.BOLD"
        :align="TextAlign.CENTER"
        class="prices__label"
        :title="t(props.pack.title)"
      />
      <UiText
        :align="TextAlign.CENTER"
        class="prices__description"
        :title="t(props.pack.description)"
      />
      <div class="prices__creadits">
        <div class="prices__creadits-icon _ibg-contain">
          <img src="@/static/images/icons/creadit.webp" />
        </div>
        <UiText
          class="prices__creadits-amout"
          :weight="TextWeight.BOLD"
          :size="TextSize.L"
          :text="t(props.pack.price)"
        />
        <UiText class="prices__creadits-text" :size="TextSize.L" :text="t('credits')" />
      </div>
      <UiText
        class="prices__number"
        :size="TextSize.H3"
        :font="TextFont.RED"
        :weight="TextWeight.BOLD"
        :align="TextAlign.CENTER"
        :title="`${t(props.pack.price)} €`"
      />
    </div>
    <UiButton class="prices__button" :theme="ButtonThemes.SECONDARY" @click="openTopUpModal">{{
      $t('By now')
    }}</UiButton>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;
@use '@/styles/media' as *;

.prices {
  &__item {
    position: relative;
    overflow: hidden;
    flex: 0 1 25%;
    background-color: var(--bg-primary-color);
    border-radius: var(--border-radius);
    @include adaptiveValue('padding-left', 45, 15, 1470, 992, 1);
    @include adaptiveValue('padding-right', 45, 15, 1470, 992, 1);
    padding-top: 40px;
    @include adaptiveValue('padding-bottom', 30, 15, 1470, 992, 1);
    display: flex;
    flex-direction: column;
    @media (max-width: $md2) {
      flex: 0 1 calc(50% - 5px);
    }
    @media (max-width: $md3) {
      padding-left: 10px;
      padding-right: 10px;
    }
    @media (max-width: $md4) {
      padding-top: 15px;
      flex: 1 1 100%;
    }
    &_form {
      background-color: transparent;
    }
    &_most-popular {
      @media (max-width: $md4) {
        padding-top: 40px;
      }
    }
    &-inner {
      flex: 1 1 auto;
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 22, 10);
      }
    }
  }
  &__most-popular {
    position: absolute;
    background: var(--green-gradient);
    text-transform: uppercase;
    border: 1px solid var(--bg-primary-color-inverted);
    top: 15px;
    left: -35px;
    padding: 8px 30px;
    transform: rotate(-45deg);
    @media (max-width: $md2) {
      top: 0px;
      display: flex;
      justify-content: center;
      left: 0px;
      width: 100%;
      transform: rotate(-0deg);
      padding: 5px 15px;
    }
  }
  &__label {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 10);
    }
    &_most-popular {
      @media (min-width: $md2) {
        @include adaptiveValue('padding-left', 15, 35, 1470, 992, 1);
        @include adaptiveValue('padding-right', 15, 0, 1470, 992, 1);
      }
    }
  }
  &__description {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 10);
    }
  }
  &__amount {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 10);
    }
    &-value {
    }
    &-equal {
    }
  }
  &__creadits {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 10);
    }
    &-icon {
      width: 24px;
      height: 24px;
    }
    &-amout {
    }
    &-text {
    }
  }
  &__input {
    position: relative;
    display: flex;
    justify-content: center;
    max-width: 220px;
    margin: 0 auto;
    @media (max-width: $md4) {
      max-width: 300px;
    }
    &-field {
      padding-right: 45px;
    }
    &-icon {
      position: absolute;
      top: 50%;
      right: 10px;
      transform: translate(0px, -50%);
      width: 24px;
      height: 24px;
    }
    &-error {
      margin-top: 5px;
      display: inline-block;
      color: var(--error-color);
      font-family: var(--font-family-sans);
    }
  }
  &__number {
  }
  &__button {
    max-width: 220px;
    margin: 0 auto;
    width: 100%;
    @media (max-width: $md4) {
      max-width: 300px;
    }
  }
}
</style>
