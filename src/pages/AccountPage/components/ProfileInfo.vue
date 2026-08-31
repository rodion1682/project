<template>
  <div class="profile-info">
    <div class="profile-info__forms">
      <!-- Personal information -->
      <div class="profile-info__column">
        <h2 class="profile-info__column-title _h3">
          {{ $t('Personal Information') }}
        </h2>

        <div class="profile-info__frame">
          <form
            class="profile-info__box profile-form"
            @submit.prevent="handleProfileSubmit"
          >
            <div class="profile-form__fields">
              <label class="profile-form__field">
                <span class="profile-form__label">
                  {{ $t('Nickname') }}
                </span>

                <BaseInput
                  v-model="profileData.nickname"
                  class="profile-form__input"
                  :placeholder="$t('Nickname')"
                  :disabled="isProfileLoading"
                  autocomplete="nickname"
                  required
                />
              </label>

              <label class="profile-form__field">
                <span class="profile-form__label">
                  {{ $t('First Name') }}
                </span>

                <BaseInput
                  v-model="profileData.name"
                  class="profile-form__input"
                  :placeholder="$t('Name')"
                  :disabled="isProfileLoading"
                  autocomplete="given-name"
                  required
                />
              </label>

              <label class="profile-form__field">
                <span class="profile-form__label">
                  {{ $t('Last Name') }}
                </span>

                <BaseInput
                  v-model="profileData.surname"
                  class="profile-form__input"
                  :placeholder="$t('Surname')"
                  :disabled="isProfileLoading"
                  autocomplete="family-name"
                  required
                />
              </label>

              <label class="profile-form__field">
                <span class="profile-form__label">
                  {{ $t('Email') }}
                </span>

                <BaseInput
                  v-model="profileData.email"
                  class="profile-form__input"
                  type="email"
                  :placeholder="$t('Email')"
                  :disabled="isProfileLoading"
                  autocomplete="email"
                  required
                />
              </label>
            </div>

            <p
              v-if="profileError"
              class="profile-form__message profile-form__message_error"
              role="alert"
            >
              {{ profileError }}
            </p>

            <p
              v-if="profileSuccess"
              class="profile-form__message profile-form__message_success"
              role="status"
            >
              {{ profileSuccess }}
            </p>

            <BaseButton
              type="submit"
              class="profile-form__submit"
              variant="bordered"
              :loading="isProfileLoading"
              :disabled="isProfileLoading || !hasProfileChanges"
            >
              {{ $t('Save Changes') }}
            </BaseButton>
          </form>
        </div>
      </div>

      <!-- Change password -->
      <div class="profile-info__column">
        <h2 class="profile-info__column-title _h3">
          {{ $t('Change Password') }}
        </h2>

        <div class="profile-info__frame">
          <form
            class="profile-info__box profile-form"
            @submit.prevent="handlePasswordSubmit"
          >
            <div class="profile-form__fields">
              <label class="profile-form__field">
                <span class="profile-form__label">
                  {{ $t('Current password') }}
                </span>

                <BaseInput
                  v-model="passwordData.currentPassword"
                  class="profile-form__input"
                  type="password"
                  :placeholder="$t('Current password')"
                  :disabled="isPasswordLoading"
                  autocomplete="current-password"
                  required
                />
              </label>

              <p class="profile-form__hint">
                {{
                  $t(
                    'The password must contain at least 8 characters, including letters and numbers.',
                  )
                }}
              </p>

              <label class="profile-form__field">
                <span class="profile-form__label">
                  {{ $t('New password') }}
                </span>

                <BaseInput
                  v-model="passwordData.newPassword"
                  class="profile-form__input"
                  type="password"
                  :placeholder="$t('New password')"
                  :disabled="isPasswordLoading"
                  autocomplete="new-password"
                  required
                />
              </label>

              <label class="profile-form__field">
                <span class="profile-form__label">
                  {{ $t('Confirm new password') }}
                </span>

                <BaseInput
                  v-model="passwordData.confirmNewPassword"
                  class="profile-form__input"
                  type="password"
                  :placeholder="$t('Confirm new password')"
                  :disabled="isPasswordLoading"
                  autocomplete="new-password"
                  required
                />
              </label>
            </div>

            <p
              v-if="passwordError"
              class="profile-form__message profile-form__message_error"
              role="alert"
            >
              {{ passwordError }}
            </p>

            <p
              v-if="passwordSuccess"
              class="profile-form__message profile-form__message_success"
              role="status"
            >
              {{ passwordSuccess }}
            </p>

            <BaseButton
              type="submit"
              class="profile-form__submit"
              variant="bordered"
              :loading="isPasswordLoading"
              :disabled="isPasswordLoading || !isPasswordFormFilled"
            >
              {{ $t('Save Changes') }}
            </BaseButton>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { useToast } from '@/composables/useToast'
import { useUserStore } from '@/stores/user'

const emit = defineEmits(['profile-updated', 'password-updated'])

const userStore = useUserStore()
const toast = useToast()
const { t } = useI18n()

const profileData = reactive({
  nickname: '',
  name: '',
  surname: '',
  email: '',
})

const initialProfileData = reactive({
  nickname: '',
  name: '',
  surname: '',
  email: '',
})

const passwordData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
})

const isProfileLoading = ref(false)
const isPasswordLoading = ref(false)

const profileError = ref('')
const profileSuccess = ref('')
const passwordError = ref('')
const passwordSuccess = ref('')

const normalizeValue = value => {
  return String(value ?? '').trim()
}

const hasProfileChanges = computed(() => {
  return (
    normalizeValue(profileData.nickname) !==
      normalizeValue(initialProfileData.nickname) ||
    normalizeValue(profileData.name) !==
      normalizeValue(initialProfileData.name) ||
    normalizeValue(profileData.surname) !==
      normalizeValue(initialProfileData.surname) ||
    normalizeValue(profileData.email) !==
      normalizeValue(initialProfileData.email)
  )
})

const isPasswordFormFilled = computed(() => {
  return Boolean(
    passwordData.currentPassword &&
    passwordData.newPassword &&
    passwordData.confirmNewPassword,
  )
})

const fillProfileData = user => {
  const nextData = {
    nickname: user?.nickname || '',
    name: user?.name || '',
    surname: user?.surname || '',
    email: user?.email || '',
  }

  Object.assign(profileData, nextData)
  Object.assign(initialProfileData, nextData)
}

const clearProfileMessages = () => {
  profileError.value = ''
  profileSuccess.value = ''
}

const clearPasswordMessages = () => {
  passwordError.value = ''
  passwordSuccess.value = ''
}

const validateEmail = email => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const validateProfile = () => {
  const nickname = normalizeValue(profileData.nickname)
  const name = normalizeValue(profileData.name)
  const surname = normalizeValue(profileData.surname)
  const email = normalizeValue(profileData.email)

  if (!nickname) {
    return t('Nickname is required')
  }

  if (!name) {
    return t('First name is required')
  }

  if (!surname) {
    return t('Last name is required')
  }

  if (!email) {
    return t('Email is required')
  }

  if (!validateEmail(email)) {
    return t('Please enter a valid email address')
  }

  return ''
}

const validatePassword = () => {
  if (!passwordData.currentPassword) {
    return t('Current password is required')
  }

  if (!passwordData.newPassword) {
    return t('New password is required')
  }

  if (passwordData.newPassword.length < 8) {
    return t('The new password must contain at least 8 characters')
  }

  if (!/[a-zA-Z]/.test(passwordData.newPassword)) {
    return t('The new password must contain at least one letter')
  }

  if (!/\d/.test(passwordData.newPassword)) {
    return t('The new password must contain at least one number')
  }

  if (passwordData.newPassword !== passwordData.confirmNewPassword) {
    return t('Passwords do not match')
  }

  if (passwordData.currentPassword === passwordData.newPassword) {
    return t('The new password must be different from the current password')
  }

  return ''
}

const getErrorMessage = (error, fallback) => {
  if (typeof error === 'string') {
    return error
  }

  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  )
}

const handleProfileSubmit = async () => {
  if (isProfileLoading.value || !hasProfileChanges.value) {
    return
  }

  clearProfileMessages()

  const validationError = validateProfile()

  if (validationError) {
    profileError.value = validationError
    return
  }

  isProfileLoading.value = true

  try {
    const payload = {
      nickname: normalizeValue(profileData.nickname),
      name: normalizeValue(profileData.name),
      surname: normalizeValue(profileData.surname),
      email: normalizeValue(profileData.email),
    }

    await userStore.updateProfile(payload)

    /*
     * Refresh the profile so the sidebar/header immediately
     * receives the latest nickname and email.
     */
    await userStore.fetchProfile()

    fillProfileData(userStore.user)

    profileSuccess.value = t('Profile updated successfully')
    toast.success(profileSuccess.value)

    emit('profile-updated', userStore.user)
  } catch (error) {
    console.error('Failed to update profile:', error)

    profileError.value = getErrorMessage(error, t('Failed to update profile'))

    toast.error(profileError.value)
  } finally {
    isProfileLoading.value = false
  }
}

const resetPasswordForm = () => {
  passwordData.currentPassword = ''
  passwordData.newPassword = ''
  passwordData.confirmNewPassword = ''
}

const handlePasswordSubmit = async () => {
  if (isPasswordLoading.value) {
    return
  }

  clearPasswordMessages()

  const validationError = validatePassword()

  if (validationError) {
    passwordError.value = validationError
    return
  }

  isPasswordLoading.value = true

  try {
    await userStore.updatePassword({
      current_password: passwordData.currentPassword,
      new_password: passwordData.newPassword,
      new_password_confirmation: passwordData.confirmNewPassword,
    })

    resetPasswordForm()

    passwordSuccess.value = t('Password changed successfully')
    toast.success(passwordSuccess.value)

    emit('password-updated')
  } catch (error) {
    console.error('Failed to change password:', error)

    passwordError.value = getErrorMessage(error, t('Failed to change password'))

    toast.error(passwordError.value)
  } finally {
    isPasswordLoading.value = false
  }
}

watch(
  () => userStore.user,
  user => {
    if (user && !isProfileLoading.value) {
      fillProfileData(user)
    }
  },
  {
    deep: true,
    immediate: true,
  },
)

watch(
  () => [
    profileData.nickname,
    profileData.name,
    profileData.surname,
    profileData.email,
  ],
  () => {
    profileError.value = ''
    profileSuccess.value = ''
  },
)

watch(
  () => [
    passwordData.currentPassword,
    passwordData.newPassword,
    passwordData.confirmNewPassword,
  ],
  () => {
    passwordError.value = ''
    passwordSuccess.value = ''
  },
)

onMounted(async () => {
  if (userStore.user) {
    fillProfileData(userStore.user)
    return
  }

  isProfileLoading.value = true

  try {
    await userStore.fetchProfile()
    fillProfileData(userStore.user)
  } catch (error) {
    console.error('Failed to load profile:', error)

    profileError.value = getErrorMessage(
      error,
      t('Failed to load profile data'),
    )
  } finally {
    isProfileLoading.value = false
  }
})
</script>

<style lang="scss" scoped>
.profile-info {
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

  &__forms {
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
   * First border, matching AuthPage.
   */
  &__frame {
    flex: 1 1 auto;
  }

  /*
   * Second border, matching auth__box.
   */
  &__box {
    @include adaptiveValue('padding', 32, 10, 1370, 992, 1);
    height: 100%;

    border-radius: 6px;
    background-color: var(--bg-third-color);
  }

  @media (max-width: $md3) {
    &__forms {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: $md7) {
    &__heading {
      padding-right: 10px;
      padding-left: 10px;
    }

    &__frame {
      padding: 4px;

      border-radius: 6px;
    }

    &__box {
      border-radius: 6px;
    }
  }
}

.profile-form {
  display: flex;
  flex-direction: column;

  padding: clamp(20px, 2.6vw, 38px) clamp(16px, 2.4vw, 32px);

  &__fields {
    @include adaptiveValue('gap', 16, 15);
    display: flex;
    flex-direction: column;

    width: 100%;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 8px;

    width: 100%;
  }

  &__label {
    color: var(--hint-primary-color);
    font-family: var(--font-inter);
    font-size: 12px;
    font-weight: 500;
    line-height: 15px;
  }

  &__input {
    width: 100%;
  }

  &__hint {
    margin: 2px 0 4px;

    color: var(--secondary-color);
    font-size: 13px;
    line-height: 150%;
  }

  &__message {
    margin-top: 18px;
    padding: 10px 12px;

    border: 1px solid transparent;
    border-radius: 4px;

    font-size: 13px;
    line-height: 140%;
    text-align: center;

    &_error {
      border-color: rgb(238 57 85 / 30%);
      background-color: rgb(238 57 85 / 8%);

      color: var(--error-color);
    }

    &_success {
      border-color: rgb(46 207 196 / 30%);
      background-color: rgb(46 207 196 / 8%);

      color: var(--hint-secondary-color);
    }
  }

  &__submit {
    width: min(100%, 170px);
    min-height: 36px;

    margin: auto auto 0;
    margin-top: clamp(28px, 3vw, 48px);

    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    text-transform: uppercase;
  }

  @media (max-width: $md7) {
    padding: 20px 14px;

    &__submit {
      width: 100%;
    }
  }
}
</style>
