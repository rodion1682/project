<script setup>
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

import { useProfileStore } from '@/stores/profile'

const { t } = useI18n()

const profileStore = useProfileStore()

const isSubmitting = ref(false)
const successMessage = ref('')
const submitError = ref('')

let successTimer = null
let errorTimer = null

const form = reactive({
  name: '',
  surname: '',
  email: '',
  phone: '',
})

const errors = reactive({
  name: '',
  surname: '',
  email: '',
  phone: '',
})

const hasProfile = () => {
  return Boolean(profileStore.profile && Object.keys(profileStore.profile).length)
}

const normalizeValue = (value) => {
  return String(value ?? '').trim()
}

const showSuccessMessage = (message) => {
  successMessage.value = message

  if (successTimer) {
    clearTimeout(successTimer)
  }

  successTimer = setTimeout(() => {
    successMessage.value = ''
    successTimer = null
  }, 3000)
}

const showErrorMessage = (message) => {
  submitError.value = message

  if (errorTimer) {
    clearTimeout(errorTimer)
  }

  errorTimer = setTimeout(() => {
    submitError.value = ''
    errorTimer = null
  }, 3000)
}

const clearMessages = () => {
  successMessage.value = ''
  submitError.value = ''

  if (successTimer) {
    clearTimeout(successTimer)
    successTimer = null
  }

  if (errorTimer) {
    clearTimeout(errorTimer)
    errorTimer = null
  }
}

const fillForm = () => {
  if (!hasProfile()) {
    return
  }

  form.name = profileStore.profile?.name ?? ''
  form.surname = profileStore.profile?.surname ?? ''
  form.email = profileStore.profile?.email ?? ''
  form.phone = profileStore.profile?.phone ?? ''
}

const clearErrors = () => {
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })

  submitError.value = ''
}

const validate = () => {
  clearErrors()

  const name = normalizeValue(form.name)
  const surname = normalizeValue(form.surname)
  const email = normalizeValue(form.email)
  const phone = normalizeValue(form.phone)

  if (!name) {
    errors.name = t('Name is required')
  } else if (name.length < 2) {
    errors.name = t('Name must contain at least 2 characters')
  }

  if (!surname) {
    errors.surname = t('Surname is required')
  } else if (surname.length < 2) {
    errors.surname = t('Surname must contain at least 2 characters')
  }

  if (!email) {
    errors.email = t('Email is required')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = t('Enter a valid email address')
  }

  if (phone) {
    const phoneDigits = phone.replace(/\D/g, '')

    if (phoneDigits.length < 8) {
      errors.phone = t('Phone must be at least 8 symbols length')
    }
  }

  return !Object.values(errors).some(Boolean)
}

const setBackendFieldError = (field, message) => {
  if (!Object.prototype.hasOwnProperty.call(errors, field)) {
    return false
  }

  errors[field] = Array.isArray(message) ? message[0] : String(message)

  return true
}

const handleBackendError = (error) => {
  const responseData = error?.response?.data
  const validationErrors = responseData?.errors || responseData?.payload?.errors

  if (validationErrors && typeof validationErrors === 'object') {
    let handled = false

    Object.entries(validationErrors).forEach(([field, message]) => {
      if (setBackendFieldError(field, message)) {
        handled = true
      }
    })

    if (handled) {
      return
    }
  }

  const message = responseData?.message || t('Failed to update profile')
  const normalizedMessage = String(message).toLowerCase()

  if (normalizedMessage.includes('e-mail already') || normalizedMessage.includes('email already')) {
    errors.email = t('E-mail already taken by another user')
    return
  }

  if (normalizedMessage.includes('phone already')) {
    errors.phone = t('Phone already taken by another user')
    return
  }

  if (normalizedMessage.includes('phone must')) {
    errors.phone = t('Phone must be at least 8 symbols length')
    return
  }

  showErrorMessage(message)
}

const submit = async () => {
  if (isSubmitting.value || !validate()) {
    return
  }

  isSubmitting.value = true
  clearMessages()

  const data = {
    name: normalizeValue(form.name),
    surname: normalizeValue(form.surname),
    email: normalizeValue(form.email),
    phone: normalizeValue(form.phone),
  }

  try {
    await profileStore.updateProfile(data)
    await profileStore.getProfile()

    fillForm()

    showSuccessMessage(t('Profile updated successfully'))
  } catch (error) {
    handleBackendError(error)
  } finally {
    isSubmitting.value = false
  }
}

watch(
  () => profileStore.profile,
  () => {
    fillForm()
  },
  {
    deep: true,
    immediate: true,
  },
)

watch(
  () => [form.name, form.surname, form.email, form.phone],
  () => {
    clearMessages()
  },
)

onMounted(async () => {
  if (!hasProfile()) {
    await profileStore.getProfile()
  }

  fillForm()
})

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
  <div class="overview">
    <form class="overview__card" @submit.prevent="submit">
      <div class="overview__header">
        <div class="overview__header-content">
          <h2 class="overview__title">
            {{ $t('Personal information') }}
          </h2>

          <p class="overview__subtitle">
            {{ $t('Manage your personal information.') }}
          </p>
        </div>
      </div>

      <div class="overview__fields">
        <div class="overview__field">
          <label class="overview__label">
            {{ $t('Name') }}
          </label>

          <BaseInput
            v-model="form.name"
            :error="errors.name"
            autocomplete="given-name"
            :placeholder="$t('Name')"
          />
        </div>

        <div class="overview__field">
          <label class="overview__label">
            {{ $t('Surname') }}
          </label>

          <BaseInput
            v-model="form.surname"
            :error="errors.surname"
            autocomplete="family-name"
            :placeholder="$t('Surname')"
          />
        </div>

        <div class="overview__field">
          <label class="overview__label">
            {{ $t('Email') }}
          </label>

          <BaseInput
            v-model="form.email"
            :error="errors.email"
            type="email"
            autocomplete="email"
            :placeholder="$t('Email')"
          />
        </div>

        <div class="overview__field">
          <label class="overview__label">
            {{ $t('Phone') }}
          </label>

          <BaseInput
            v-model="form.phone"
            :error="errors.phone"
            type="tel"
            autocomplete="tel"
            :placeholder="$t('Phone')"
          />
        </div>
      </div>

      <Transition name="overview-message">
        <div v-if="submitError" class="overview__message overview__message_error">
          {{ submitError }}
        </div>
      </Transition>

      <Transition name="overview-message">
        <div v-if="successMessage" class="overview__message overview__message_success">
          {{ successMessage }}
        </div>
      </Transition>

      <div class="overview__footer">
        <BaseButton
          type="submit"
          class="overview__submit"
          variant="dark-secondary"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? $t('Saving...') : $t('Save changes') }}
        </BaseButton>

        <div class="overview__footer-hint">
          {{ $t('Email is used for key delivery - keep it current.') }}
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.overview {
  width: 100%;
  min-width: 0;

  &__card {
    width: 100%;
    min-width: 0;

    border: 2px solid var(--border-primary-color);
    background-color: var(--bg-secondary-color);

    @include adaptiveValue('border-radius', 14, 12);
    @include adaptiveValue('padding-top', 36, 22);
    @include adaptiveValue('padding-right', 40, 16);
    @include adaptiveValue('padding-bottom', 40, 22);
    @include adaptiveValue('padding-left', 40, 16);
  }

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    min-width: 0;

    @include adaptiveValue('gap', 30, 14);
    @include adaptiveValue('margin-bottom', 30, 20);
  }

  &__header-content {
    min-width: 0;
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
    margin: 0;

    color: var(--seconday-color);

    @include adaptiveValue('font-size', 13, 12);
    @include adaptiveValue('line-height', 20, 18);
  }

  &__fields {
    width: 100%;
    min-width: 0;

    display: flex;
    flex-wrap: wrap;

    @include adaptiveValue('column-gap', 24, 10);
    @include adaptiveValue('row-gap', 22, 16);
  }

  &__field {
    min-width: 0;

    flex: 0 1 calc(50% - 12px);
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

  &__footer-hint {
    min-width: 0;

    color: var(--seconday-color);

    @include adaptiveValue('font-size', 13, 11);
    @include adaptiveValue('line-height', 19, 17);
  }

  @media (max-width: $md5) {
    &__field {
      flex: 1 1 100%;
    }

    &__footer {
      display: block;
    }

    &__submit {
      width: 100%;
    }

    &__footer-hint {
      display: none;
    }
  }
}

.overview-message-enter-active,
.overview-message-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.overview-message-enter-from,
.overview-message-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
