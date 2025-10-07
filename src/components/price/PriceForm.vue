<script setup>
import { Form, Field, ErrorMessage } from 'vee-validate'
import UiText, { TextSize, TextWeight, TextFont, TextAlign } from '@/components/shared/UiText.vue'
import UiButton, { ButtonThemes } from '@/components/shared/UiButton.vue'

const props = defineProps({
  customAmountSchema: { type: Object, required: true },
  onSubmitCustomAmount: { type: Function, required: true },
  className: { type: String, default: '' },
  title: { type: Boolean, default: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <Form
    :class="['form', props.className]"
    v-slot="{ meta }"
    :validation-schema="props.customAmountSchema"
    @submit="props.onSubmitCustomAmount"
  >
    <div class="form__inner">
      <UiText
        v-if="props.title"
        :size="TextSize.H4"
        :font="TextFont.RED"
        :weight="TextWeight.BOLD"
        :align="TextAlign.CENTER"
        class="form__title"
        :title="$t('Custom Credits')"
      />
      <UiText
        v-if="props.description"
        :align="TextAlign.CENTER"
        class="form__description"
        :title="props.description"
      />
      <div class="form__amount">
        <UiText
          class="price__amount-value"
          :weight="TextWeight.BOLD"
          :size="TextSize.L"
          text="1€"
        />
        <UiText class="price__amount-equal" :weight="TextWeight.BOLD" :size="TextSize.L" text="=" />
        <div class="form__creadits">
          <div class="form__creadits-icon _ibg-contain">
            <img src="@/static/images/icons/creadit.webp" />
          </div>
          <UiText
            class="form__creadits-amout"
            :weight="TextWeight.BOLD"
            :size="TextSize.L"
            text="1"
          />
          <UiText class="form__creadits-text" :size="TextSize.L" text="credits" />
        </div>
      </div>
      <label class="form__input">
        <Field
          class="form__input-field _input"
          name="amount"
          type="text"
          :placeholder="$t('Enter amount')"
        />
        <div class="form__input-icon">
          <img src="@/static/images/icons/creadit.webp" />
        </div>
      </label>
      <ErrorMessage class="form__input-error" name="amount" />
    </div>
    <UiButton
      class="form__button"
      :disabled="!meta.valid || !meta.touched"
      type="submit"
      :theme="ButtonThemes.SECONDARY"
    >
      {{ $t('By now') }}
    </UiButton>
  </Form>
</template>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;
@use '@/styles/media' as *;
@use '@/styles/classes' as *;

.form {
  display: flex;
  flex-direction: column;
  border-radius: var(--border-radius);
  @include adaptiveValue('padding-left', 45, 15, 1470, 992, 1);
  @include adaptiveValue('padding-right', 45, 15, 1470, 992, 1);
  padding-top: 40px;
  @include adaptiveValue('padding-bottom', 30, 15, 1470, 992, 1);
  display: flex;
  flex-direction: column;
  flex: 0 1 25%;
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
  &__inner {
    flex: 1 1 auto;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 22, 10);
    }
  }
  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 10);
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
    margin-left: auto;
    margin-right: auto;
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
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    @media (max-width: $md4) {
      max-width: 300px;
    }
  }
}
</style>
