<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { EyeCrossedIcon, EyeIcon } from '@/components/ui/icons'
import SvgIcon from '@/components/ui/icons/SvgIcon.vue'

import { useChangePassStore } from '@/stores/changePass'

const { t } = useI18n()

const changePassStore = useChangePassStore()

const isSubmitting = ref(false)

const form = reactive({
  currentPassword: '',
  newPassword: '',
  repeatPassword: '',
})

const errors = reactive({
  currentPassword: '',
  newPassword: '',
  repeatPassword: '',
})

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showRepeatPassword = ref(false)

let successTimer = null
let errorTimer = null

const successMessage = computed(() => changePassStore.success || '')
const errorMessage = computed(() => changePassStore.error || '')

const clearErrors = () => {
  errors.currentPassword = ''
  errors.newPassword = ''
  errors.repeatPassword = ''
}

const clearMessages = () => {
  changePassStore.success = ''
  changePassStore.error = ''

  if (successTimer) {
    clearTimeout(successTimer)
    successTimer = null
  }

  if (errorTimer) {
    clearTimeout(errorTimer)
    errorTimer = null
  }
}

const validate = () => {
  clearErrors()

  if (!form.currentPassword) {
    errors.currentPassword = t('Current password is required')
  }

  if (!form.newPassword) {
    errors.newPassword = t('New password is required')
  } else if (form.newPassword.length < 5) {
    errors.newPassword = t('Password must contain at least 5 characters')
  }

  if (!form.repeatPassword) {
    errors.repeatPassword = t('Confirm new password')
  } else if (form.newPassword !== form.repeatPassword) {
    errors.repeatPassword = t('Passwords do not match')
  }

  if (form.currentPassword && form.newPassword && form.currentPassword === form.newPassword) {
    errors.newPassword = t('New password must be different from current password')
  }

  return !Object.values(errors).some(Boolean)
}

const resetForm = () => {
  form.currentPassword = ''
  form.newPassword = ''
  form.repeatPassword = ''

  showCurrentPassword.value = false
  showNewPassword.value = false
  showRepeatPassword.value = false

  clearErrors()
}

const handleBackendError = () => {
  const message = String(changePassStore.error || '')
  const normalizedMessage = message.toLowerCase()

  if (normalizedMessage.includes('wrong current password')) {
    errors.currentPassword = t('Wrong current password')
    changePassStore.error = ''
    return
  }

  if (normalizedMessage.includes('confirmation')) {
    errors.repeatPassword = t('Passwords do not match')
    changePassStore.error = ''
    return
  }

  if (
    normalizedMessage.includes('minimal password length') ||
    normalizedMessage.includes('minimum password length')
  ) {
    errors.newPassword = t('Password must contain at least 5 characters')
    changePassStore.error = ''
  }
}

const submit = async () => {
  if (isSubmitting.value || !validate()) {
    return
  }

  clearMessages()

  isSubmitting.value = true

  try {
    await changePassStore.setPass(form.currentPassword, form.newPassword, form.repeatPassword)
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => [form.currentPassword, form.newPassword, form.repeatPassword],
  () => {
    clearErrors()
    clearMessages()
  },
)

watch(
  () => changePassStore.error,
  (value) => {
    if (!value) {
      return
    }

    handleBackendError()

    if (changePassStore.error) {
      if (errorTimer) {
        clearTimeout(errorTimer)
      }

      errorTimer = setTimeout(() => {
        changePassStore.error = ''
        errorTimer = null
      }, 3000)
    }
  },
)

watch(
  () => changePassStore.success,
  (value) => {
    if (!value) {
      return
    }

    resetForm()

    if (successTimer) {
      clearTimeout(successTimer)
    }

    successTimer = setTimeout(() => {
      changePassStore.success = ''
      successTimer = null
    }, 3000)
  },
)

onBeforeUnmount(() => {
  if (successTimer) {
    clearTimeout(successTimer)
  }

  if (errorTimer) {
    clearTimeout(errorTimer)
  }
})
</script>

<template>
  <div class="password">
    <form class="password__card" @submit.prevent="submit">
      <div class="password__header">
        <h2 class="password__title">
          {{ $t('Password change') }}
        </h2>

        <p class="password__subtitle">
          {{ $t('Update your password to keep your account secure.') }}
        </p>
      </div>

      <div class="password__fields">
        <div class="password__field">
          <label class="password__label">
            {{ $t('Current password') }}
          </label>

          <div class="password__input">
            <BaseInput
              v-model="form.currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              :error="errors.currentPassword"
              autocomplete="current-password"
              :placeholder="$t('Current password')"
            />

            <button
              type="button"
              class="password__eye"
              :aria-label="$t(showCurrentPassword ? 'Hide password' : 'Show password')"
              @click="showCurrentPassword = !showCurrentPassword"
            >
              <SvgIcon
                :icon="showCurrentPassword ? EyeCrossedIcon : EyeIcon"
                class="password__eye-icon"
              />
            </button>
          </div>
        </div>

        <div class="password__field">
          <label class="password__label">
            {{ $t('New password') }}
          </label>

          <div class="password__input">
            <BaseInput
              v-model="form.newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              :error="errors.newPassword"
              autocomplete="new-password"
              :placeholder="$t('New password')"
            />

            <button
              type="button"
              class="password__eye"
              :aria-label="$t(showNewPassword ? 'Hide password' : 'Show password')"
              @click="showNewPassword = !showNewPassword"
            >
              <SvgIcon
                :icon="showNewPassword ? EyeCrossedIcon : EyeIcon"
                class="password__eye-icon"
              />
            </button>
          </div>
        </div>

        <div class="password__field">
          <label class="password__label">
            {{ $t('Confirm new password') }}
          </label>

          <div class="password__input">
            <BaseInput
              v-model="form.repeatPassword"
              :type="showRepeatPassword ? 'text' : 'password'"
              :error="errors.repeatPassword"
              autocomplete="new-password"
              :placeholder="$t('Confirm new password')"
            />

            <button
              type="button"
              class="password__eye"
              :aria-label="$t(showRepeatPassword ? 'Hide password' : 'Show password')"
              @click="showRepeatPassword = !showRepeatPassword"
            >
              <SvgIcon
                :icon="showRepeatPassword ? EyeCrossedIcon : EyeIcon"
                class="password__eye-icon"
              />
            </button>
          </div>
        </div>
      </div>

      <Transition name="password-message">
        <div v-if="errorMessage" class="password__message password__message_error">
          {{ $t(errorMessage) }}
        </div>
      </Transition>

      <Transition name="password-message">
        <div v-if="successMessage" class="password__message password__message_success">
          {{ $t(successMessage) }}
        </div>
      </Transition>

      <div class="password__footer">
        <BaseButton
          type="submit"
          class="password__submit"
          variant="dark-secondary"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? $t('Saving...') : $t('Save password') }}
        </BaseButton>

        <div class="password__hint">
          {{ $t('Password must contain at least 5 characters.') }}
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.password {
  width: 100%;
  min-width: 0;

  &__card {
    width: 100%;
    min-width: 0;

    @media (min-width: $md8) {
      border: 2px solid var(--border-primary-color);

      background-color: var(--bg-secondary-color);

      @include adaptiveValue('border-radius', 14, 12);
      @include adaptiveValue('padding-top', 36, 22);
      @include adaptiveValue('padding-right', 40, 16);
      @include adaptiveValue('padding-bottom', 40, 22);
      @include adaptiveValue('padding-left', 40, 16);
    }
  }

  &__header {
    min-width: 0;

    @include adaptiveValue('margin-bottom', 30, 20);
  }

  &__title {
    margin: 0;

    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-weight: 700;
    line-height: 1.2;

    @include adaptiveValue('font-size', 26, 20);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 7, 5);
    }
  }

  &__subtitle {
    max-width: 520px;

    margin: 0;

    color: var(--seconday-color);

    @include adaptiveValue('font-size', 13, 12);
    @include adaptiveValue('line-height', 20, 18);
  }

  &__fields {
    width: 100%;
    min-width: 0;

    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    @include adaptiveValue('column-gap', 24, 12);
    @include adaptiveValue('row-gap', 22, 16);
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

    @include adaptiveValue('font-size', 12, 10);
    @include adaptiveValue('line-height', 17, 15);
    @include adaptiveValue('letter-spacing', 1.44, 1.2);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 9, 7);
    }
  }

  &__input {
    position: relative;

    width: 100%;
    min-width: 0;

    :deep(input) {
      @include adaptiveValue('padding-right', 52, 45);
    }
    @media (min-width: $md8) {
      :deep(.input__content) {
        background-color: var(--bg-primary-color);
      }
    }
  }

  &__eye {
    position: absolute;

    top: 0;
    right: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    border: 0;
    outline: 0;

    background: transparent;

    color: var(--seconday-color);

    cursor: pointer;

    z-index: 2;

    @include adaptiveValue('width', 50, 44);
    @include adaptiveValue('height', 50, 44);

    transition:
      color 0.3s ease,
      opacity 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--primary-color);
      }
    }
  }

  &__eye-icon {
    display: flex;
    align-items: center;
    justify-content: center;

    color: inherit;

    @include adaptiveValue('width', 20, 17);
    @include adaptiveValue('height', 20, 17);

    :deep(svg) {
      display: block;

      width: 100%;
      height: 100%;
    }
  }

  &__message {
    width: 100%;

    border-radius: 10px;

    @include adaptiveValue('margin-top', 24, 18);
    @include adaptiveValue('padding-top', 11, 10);
    @include adaptiveValue('padding-right', 14, 12);
    @include adaptiveValue('padding-bottom', 11, 10);
    @include adaptiveValue('padding-left', 14, 12);
    @include adaptiveValue('font-size', 13, 12);
    @include adaptiveValue('line-height', 19, 18);

    &_error {
      border: 2px solid var(--error-color);

      color: var(--error-color);
    }

    &_success {
      border: 2px solid var(--hint-primary-color);

      color: var(--hint-primary-color);
    }
  }

  &__footer {
    display: flex;
    align-items: center;

    @include adaptiveValue('gap', 20, 12);
    @include adaptiveValue('margin-top', 36, 20);
  }

  &__submit {
    flex: 0 0 auto;

    width: fit-content;

    min-width: 174px;
  }

  &__hint {
    min-width: 0;

    color: var(--seconday-color);

    @include adaptiveValue('font-size', 13, 11);
    @include adaptiveValue('line-height', 19, 17);
  }

  @media (max-width: $md5) {
    &__fields {
      grid-template-columns: 1fr;
    }

    &__footer {
      display: block;
    }

    &__submit {
      width: 100%;
    }

    &__hint {
      display: none;
    }
  }
}

.password-message-enter-active,
.password-message-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.password-message-enter-from,
.password-message-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
