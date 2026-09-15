<script setup>
import { ref } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

import { useRegStore } from '@/stores/reg'
import { useRouter } from 'vue-router'

defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['login', 'submitted'])

const router = useRouter()

const regStore = useRegStore()

const name = ref('')
const surname = ref('')
const email = ref('')
const password = ref('')
const passConfirm = ref('')
const terms = ref(false)

const termsError = ref('')
const isSubmitting = ref(false)

const removeCyrillic = (value) => {
  return String(value || '').replace(/[А-Яа-яЁёІіЇїЄєҐґ]/g, '')
}

const submit = async () => {
  if (isSubmitting.value) {
    return
  }

  regStore.clearError()
  termsError.value = ''

  if (!terms.value) {
    termsError.value = 'You must accept the Terms of Service'
    return
  }

  isSubmitting.value = true

  regStore.updateData({
    name: name.value,
    surname: surname.value,
    email: email.value,
    password: password.value,
    passConfirm: passConfirm.value,
  })

  try {
    await regStore.submitReg()

    if (!regStore.error) {
      emit('submitted')
      
      await router.push('/profile/overview')
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <section class="signup-form">
    <div class="signup-form__hero">
      <img src="@/assets/img/signup-bg.jpg" :alt="$t('Registration')" class="signup-form__image" />

      <div class="signup-form__overlay" />

      <div class="signup-form__hero-content">
        <div class="signup-form__eyebrow">
          {{ $t('Create a free account in one click') }}
        </div>

        <h1 class="signup-form__title">
          {{ $t('Registration') }}
        </h1>
      </div>
    </div>

    <form class="signup-form__body" @submit.prevent="submit">
      <div class="signup-form__row">
        <div class="signup-form__field">
          <label class="signup-form__label">
            {{ $t('First name') }}
          </label>

          <BaseInput
            v-model="name"
            autocomplete="given-name"
            :disabled="disabled || isSubmitting"
            :placeholder="$t('Enter your first name')"
            @input="name = removeCyrillic(name)"
          />
        </div>

        <div class="signup-form__field">
          <label class="signup-form__label">
            {{ $t('Last name') }}
          </label>

          <BaseInput
            v-model="surname"
            autocomplete="family-name"
            :disabled="disabled || isSubmitting"
            :placeholder="$t('Enter your last name')"
            @input="surname = removeCyrillic(surname)"
          />
        </div>
      </div>

      <div class="signup-form__field">
        <label class="signup-form__label">
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

      <div class="signup-form__row">
        <div class="signup-form__field">
          <label class="signup-form__label">
            {{ $t('Password') }}
          </label>

          <BaseInput
            v-model="password"
            type="password"
            autocomplete="new-password"
            :disabled="disabled || isSubmitting"
            :placeholder="$t('Enter your password')"
            @input="password = removeCyrillic(password)"
          />
        </div>

        <div class="signup-form__field">
          <label class="signup-form__label">
            {{ $t('Confirm password') }}
          </label>

          <BaseInput
            v-model="passConfirm"
            type="password"
            autocomplete="new-password"
            :disabled="disabled || isSubmitting"
            :placeholder="$t('Confirm your password')"
            @input="passConfirm = removeCyrillic(passConfirm)"
          />
        </div>
      </div>

      <BaseCheckbox
        v-model="terms"
        terms
        :disabled="disabled || isSubmitting"
        :error="termsError ? $t(termsError) : ''"
        @change="termsError = ''"
      />

      <Transition name="signup-error">
        <div v-if="regStore.error" class="signup-form__error">
          {{ $t(regStore.error) }}
        </div>
      </Transition>

      <BaseButton type="submit" class="signup-form__submit" :disabled="disabled || isSubmitting">
        {{ isSubmitting ? $t('Loading...') : $t('Create account') }}
      </BaseButton>

      <div class="signup-form__switch">
        {{ $t('Have account') }}?

        <button
          type="button"
          class="signup-form__switch-link"
          :disabled="disabled || isSubmitting"
          @click="emit('login')"
        >
          {{ $t('Sign in') }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.signup-form {
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

  &__row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    @include adaptiveValue('gap', 18, 12);
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
      margin-bottom: 18px;
      position: static;
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

    &__row {
      grid-template-columns: 1fr;

      gap: 18px;
    }
  }
}

.signup-error-enter-active,
.signup-error-leave-active {
  transition: opacity 0.2s ease;
}

.signup-error-enter-from,
.signup-error-leave-to {
  opacity: 0;
}
</style>
