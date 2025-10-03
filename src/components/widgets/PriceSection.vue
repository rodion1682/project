<script setup>
import { Form, Field, ErrorMessage } from 'vee-validate'
import UiText, { TextSize, TextWeight, TextFont, TextAlign } from '@/components/shared/UiText.vue'
import UiButton, { ButtonThemes } from '@/components/shared/UiButton.vue'
import CreditPackItem from '@/components/CreditPackItem.vue'

const props = defineProps({
  topUpStore: { type: Object, required: true },
  onSubmitCustomAmount: { type: Function, required: true },
  customAmountSchema: { type: Object, required: true },
})
</script>

<template>
  <section class="prices">
    <div class="prices__background _ibg-contain">
      <img src="@/static/images/backgrounds/3d-render-background.webp" />
    </div>

    <div class="prices__top">
      <UiText
        class="prices__title"
        :size="TextSize.H2"
        :font="TextFont.RED"
        :weight="TextWeight.BOLD"
        :align="TextAlign.CENTER"
        :title="$t('Our Prices')"
      />
      <UiText
        class="prices__text"
        :align="TextAlign.CENTER"
        :text="$t('Pick the credit pack that fits your needs')"
      />
    </div>

    <div class="prices__items">
      <!-- artificial limit to 3 cards -->
      <CreditPackItem
        v-for="(pack, i) in props.topUpStore.creditPacks.slice(0, 3)"
        :key="pack.id"
        :pack="pack"
        :equivalent="i !== 0"
        :most-popular="i === 1"
      />

      <Form
        class="prices__item prices__item_form"
        v-slot="{ meta }"
        :validation-schema="props.customAmountSchema"
        @submit="props.onSubmitCustomAmount"
      >
        <div class="prices__item-inner">
          <UiText
            :size="TextSize.H4"
            :font="TextFont.RED"
            :weight="TextWeight.BOLD"
            :align="TextAlign.CENTER"
            class="prices__label"
            :title="$t('Custom Credits')"
          />
          <UiText
            :align="TextAlign.CENTER"
            class="prices__description"
            :title="$t('Choose the exact amount you need.')"
          />

          <div class="prices__amount">
            <UiText
              class="price__amount-value"
              :weight="TextWeight.BOLD"
              :size="TextSize.L"
              text="1€"
            />
            <UiText
              class="price__amount-equal"
              :weight="TextWeight.BOLD"
              :size="TextSize.L"
              text="="
            />
            <div class="prices__creadits">
              <div class="prices__creadits-icon _ibg-contain">
                <img src="@/static/images/icons/creadit.webp" />
              </div>
              <UiText
                class="prices__creadits-amout"
                :weight="TextWeight.BOLD"
                :size="TextSize.L"
                text="1"
              />
              <UiText class="prices__creadits-text" :size="TextSize.L" text="credits" />
            </div>
          </div>

          <label class="prices__input">
            <Field
              class="prices__input-field _input"
              name="amount"
              type="text"
              :placeholder="$t('Enter amount')"
            />
            <div class="prices__input-icon">
              <img src="@/static/images/icons/creadit.webp" />
            </div>
          </label>
          <ErrorMessage class="prices__input-error" name="amount" />
        </div>

        <UiButton
          class="prices__button"
          :disabled="!meta.valid || !meta.touched"
          type="submit"
          :theme="ButtonThemes.SECONDARY"
        >
          {{ $t('By now') }}
        </UiButton>
      </Form>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;
@use '@/styles/media' as *;
@use '@/styles/classes' as *;

.prices {
  @include adaptiveValue('padding-left', 45, 15, 1470, 992, 1);
  @include adaptiveValue('padding-right', 45, 15, 1470, 992, 1);
  @include adaptiveValue('padding-top', 47, 15, 1470, 992, 1);
  @include adaptiveValue('padding-bottom', 47, 15, 1470, 992, 1);
  background-color: var(--bg-secondary-color);
  border-radius: var(--border-radius);
  position: relative;

  @media (max-width: $md2) {
    margin: 0px -10px;
    padding: 15px 10px;
  }

  &__background {
    position: absolute;
    @include adaptiveValue('top', -270, -200, 1470, 992, 1);
    @include adaptiveValue('left', -250, -130, 1470, 992, 1);
    z-index: -1;
    @include adaptiveValue('width', 512, 300, 1470, 992, 1);
    padding-bottom: 50%;

    @media (max-width: $md2) {
      @include hide-item;
    }
  }

  &__top {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 50, 20);
    }
  }
  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 15);
    }
  }

  &__items {
    display: flex;
    gap: 16px;

    @media (max-width: $md2) {
      flex-wrap: wrap;
      gap: 10px;
    }
    @media (max-width: $md3) {
      margin: 0 -10px;
      gap: 5px;
    }
  }

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
      transform: translate(0, -50%);
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
