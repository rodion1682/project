<script setup>
import { ref } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

import { useLoginStore } from '@/stores/login'

defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['forgot', 'signup', 'submitted'])

const loginStore = useLoginStore()

const email = ref('')
const password = ref('')
const isSubmitting = ref(false)

const removeCyrillic = (value) => {
  return String(value || '').replace(/[А-Яа-яЁёІіЇїЄєҐґ]/g, '')
}

const submit = async () => {
  if (isSubmitting.value) {
    return
  }

  loginStore.clearError()

  isSubmitting.value = true

  loginStore.updateData({
    username: email.value,
    password: password.value,
  })

  try {
    await loginStore.submitLogin()

    if (!loginStore.error) {
      emit('submitted')
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="auth-form auth-form_login">
    <div class="auth-form__hero">
      <img src="@/assets/img/login-bg.jpg" :alt="$t('Sign in')" class="auth-form__image" />

      <div class="auth-form__overlay" />

      <div class="auth-form__hero-content">
        <div class="auth-form__eyebrow">
          {{ $t('Welcome back') }}
        </div>

        <h1 class="auth-form__title">
          {{ $t('Sign in') }}
        </h1>
      </div>
    </div>

    <form class="auth-form__body" @submit.prevent="submit">
      <div class="auth-form__field">
        <label class="auth-form__label">
          {{ $t('Email') }}
        </label>

        <BaseInput
          v-model="email"
          type="email"
          autocomplete="email"
          :disabled="disabled || isSubmitting"
          :placeholder="$t('Enter your e-mail')"
          @input="email = removeCyrillic(email)"
        />
      </div>

      <div class="auth-form__field">
        <label class="auth-form__label">
          {{ $t('Password') }}
        </label>

        <BaseInput
          v-model="password"
          type="password"
          autocomplete="current-password"
          :disabled="disabled || isSubmitting"
          :placeholder="$t('Enter your password')"
          @input="password = removeCyrillic(password)"
        />
      </div>

      <div class="auth-form__options">
        <button
          type="button"
          class="auth-form__link"
          :disabled="disabled || isSubmitting"
          @click="emit('forgot')"
        >
          {{ $t('Forgot password') }}?
        </button>
      </div>

      <Transition name="auth-error">
        <div v-if="loginStore.error" class="auth-form__error">
          {{ $t(loginStore.error) }}
        </div>
      </Transition>

      <BaseButton type="submit" class="auth-form__submit" :disabled="disabled || isSubmitting">
        {{ isSubmitting ? $t('Loading...') : $t('Sign in') }}
      </BaseButton>

      <div class="auth-form__switch">
        {{ $t('No account yet?') }}

        <button
          type="button"
          class="auth-form__switch-link"
          :disabled="disabled || isSubmitting"
          @click="emit('signup')"
        >
          {{ $t('Create one') }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.auth-form {
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

    font-weight: 700;
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

  &__options {
    display: flex;
    justify-content: flex-end;
  }

  &__link,
  &__switch-link {
    padding: 0;

    border: 0;

    background: transparent;

    color: var(--hint-primary-color);

    font: inherit;
    font-weight: 700;

    cursor: pointer;

    transition: color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--primary-color);
      }
    }

    &:disabled {
      pointer-events: none;
    }
  }

  &__link {
    font-size: 13px;
    line-height: 18px;
  }

  &__error {
    color: var(--error-color);

    font-size: 13px;
    line-height: 18px;
    font-weight: 600;
  }

  &__submit {
    width: 100%;
  }

  &__switch {
    color: var(--seconday-color);

    text-align: center;

    @include adaptiveValue('font-size', 13, 12);
    @include adaptiveValue('line-height', 18, 17);
  }

  &__switch-link {
    margin-left: 3px;
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

.auth-error-enter-active,
.auth-error-leave-active {
  transition: opacity 0.2s ease;
}

.auth-error-enter-from,
.auth-error-leave-to {
  opacity: 0;
}
</style>
