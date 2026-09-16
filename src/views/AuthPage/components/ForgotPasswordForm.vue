<script setup>
import { ref } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

import { useRecoverStore } from '@/stores/recover'

const emit = defineEmits(['back'])

const recoverStore = useRecoverStore()

const email = ref('')
const isSubmitting = ref(false)
const submitted = ref(false)

const submit = async () => {
  if (isSubmitting.value) {
    return
  }

  recoverStore.clearError()
  recoverStore.success = ''

  isSubmitting.value = true

  recoverStore.updateData({
    email: email.value,
  })

  try {
    await recoverStore.submitRecover()

    if (!recoverStore.error) {
      submitted.value = true
    }
  } finally {
    isSubmitting.value = false
  }
}

const back = () => {
  recoverStore.clearError()
  recoverStore.success = ''
  submitted.value = false

  emit('back')
}
</script>

<template>
  <section class="forgot-form">
    <div class="forgot-form__hero">
      <img
        src="@/assets/img/login-bg.jpg"
        :alt="$t('Password recovery')"
        class="forgot-form__image"
      />

      <div class="forgot-form__overlay" />

      <div class="forgot-form__hero-content">
        <div class="forgot-form__eyebrow">
          {{ $t('Account recovery') }}
        </div>

        <h1 class="forgot-form__title">
          {{ $t('Password recovery') }}
        </h1>
      </div>
    </div>

    <form class="forgot-form__body" @submit.prevent="submit">
      <template v-if="!submitted">
        <p class="forgot-form__description">
          {{
            $t(
              'Enter the email address associated with your account and we will send you password recovery instructions.',
            )
          }}
        </p>

        <div class="forgot-form__field">
          <label class="forgot-form__label">
            {{ $t('Email') }}
          </label>

          <BaseInput
            v-model="email"
            type="email"
            autocomplete="email"
            :disabled="isSubmitting"
            :placeholder="$t('Enter your e-mail')"
          />
        </div>

        <Transition name="forgot-message">
          <div v-if="recoverStore.error" class="forgot-form__error">
            {{ $t(recoverStore.error) }}
          </div>
        </Transition>

        <BaseButton
          type="submit"
          variant="dark-secondary"
          class="forgot-form__submit"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? $t('Loading...') : $t('Send') }}
        </BaseButton>
      </template>

      <template v-else>
        <div class="forgot-form__success">
          <h2 class="forgot-form__success-title">
            {{ $t('Check your email') }}
          </h2>

          <p class="forgot-form__description">
            {{
              $t(
                'If an account exists for this email address, password recovery instructions have been sent.',
              )
            }}
          </p>
        </div>
      </template>

      <BaseButton type="button" variant="bordered" class="forgot-form__back" @click="back">
        {{ $t('Back to sign in') }}
      </BaseButton>
    </form>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.forgot-form {
  width: 100%;
  min-width: 0;

  overflow: hidden;

  border: 2px solid var(--border-primary-color);

  @include adaptiveValue('border-radius', 14, 10);

  background-color: var(--bg-secondary-color);

  &__hero {
    position: relative;

    width: 100%;

    overflow: hidden;

    @include adaptiveValue('height', 200, 150);
  }

  &__image,
  &__overlay {
    position: absolute;

    inset: 0;

    width: 100%;
    height: 100%;
  }

  &__image {
    object-fit: cover;
    object-position: center;
  }

  &__overlay {
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.2) 0%,
      var(--bg-secondary-color) 100%
    );
  }

  &__hero-content {
    position: absolute;

    z-index: 2;

    @include adaptiveValue('left', 40, 18);
    @include adaptiveValue('right', 40, 18);
    @include adaptiveValue('bottom', 28, 18);
  }

  &__eyebrow {
    color: var(--hint-primary-color);

    font-weight: 400;
    text-transform: uppercase;

    @include adaptiveValue('font-size', 11, 10);
    @include adaptiveValue('line-height', 16, 14);
    @include adaptiveValue('letter-spacing', 2.2, 1.6);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 8, 5);
    }
  }

  &__title {
    margin: 0;

    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-weight: 700;
    line-height: 1;

    @include adaptiveValue('font-size', 36, 26);
  }

  &__body {
    display: flex;
    flex-direction: column;

    @include adaptiveValue('gap', 22, 16);

    @include adaptiveValue('padding-top', 36, 22);
    @include adaptiveValue('padding-right', 40, 16);
    @include adaptiveValue('padding-bottom', 40, 24);
    @include adaptiveValue('padding-left', 40, 16);
  }

  &__description {
    margin: 0;

    max-width: 520px;

    color: var(--seconday-color);

    @include adaptiveValue('font-size', 14, 13);
    @include adaptiveValue('line-height', 22, 20);
  }

  &__field {
    width: 100%;
    min-width: 0;
  }

  &__label {
    display: block;

    color: var(--seconday-color);

    font-weight: 600;
    text-transform: uppercase;

    @include adaptiveValue('font-size', 12, 11);
    @include adaptiveValue('line-height', 17, 15);
    @include adaptiveValue('letter-spacing', 1.44, 1.2);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 9, 7);
    }
  }

  &__error {
    color: var(--error-color);

    font-size: 13px;
    line-height: 18px;
    font-weight: 600;
  }

  &__submit,
  &__back {
    width: 100%;
  }

  &__success {
    display: flex;
    flex-direction: column;

    @include adaptiveValue('gap', 10, 8);
  }

  &__success-title {
    margin: 0;

    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-weight: 700;
    line-height: 1.2;

    @include adaptiveValue('font-size', 24, 21);
  }

  @media (max-width: $md5) {
    border: 0;

    background-color: transparent;

    overflow: visible;

    &__hero {
      height: auto;

      overflow: visible;
    }

    &__image,
    &__overlay {
      display: none;
    }

    &__hero-content {
      position: static;
      margin-bottom: 18px;
    }

    &__eyebrow {
      display: none;
    }

    &__title {
      font-size: 26px;
    }

    &__body {
      padding: 0;

      gap: 18px;
    }
  }
}

.forgot-message-enter-active,
.forgot-message-leave-active {
  transition: opacity 0.2s ease;
}

.forgot-message-enter-from,
.forgot-message-leave-to {
  opacity: 0;
}
</style>
