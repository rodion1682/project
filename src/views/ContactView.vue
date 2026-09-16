<script setup>
import { computed, ref, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'

import { useAuthStore } from '@/stores/auth'
import { useContactStore } from '@/stores/contact'
import { useProfileStore } from '@/stores/profile'
import { useSettingsStore } from '@/stores/settings'

import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import Breadcrumbs from '@/components/ui/Breadcrumbs.vue'

const { t } = useI18n()

const authStore = useAuthStore()
const profileStore = useProfileStore()
const settingsStore = useSettingsStore()
const contactStore = useContactStore()

const name = ref('')
const email = ref('')
const phone = ref('')
const topic = ref('')
const message = ref('')
const terms = ref(false)

const profileInitialized = ref(false)
const isSubmitting = ref(false)

const errors = ref({
  name: '',
  email: '',
  phone: '',
  topic: '',
  message: '',
  terms: '',
})

const breadcrumbs = computed(() => [
  {
    title: t('Home'),
    link: '/',
  },
  {
    title: t('Contact Us'),
  },
])

const supportEmail = computed(() => {
  return settingsStore?.settings?.support_email || ''
})

const supportPhone = computed(() => {
  return settingsStore?.settings?.support_phone || ''
})

const supportPhoneLink = computed(() => {
  return supportPhone.value.replace(/[\s()-]/g, '')
})

const requisites = computed(() => {
  return settingsStore?.settings?.requisites || ''
})

const canSubmit = computed(() => {
  return (
    name.value.trim().length >= 2 &&
    email.value.trim() &&
    phone.value.trim() &&
    topic.value.trim().length >= 3 &&
    message.value.trim().length >= 10 &&
    terms.value &&
    !isSubmitting.value
  )
})

const removeCyrillic = (value = '') => {
  return String(value).replace(/[А-Яа-яЁёІіЇїЄєҐґ]/g, '')
}

const normalizePhone = (value = '') => {
  let cleaned = removeCyrillic(String(value))

  // Remove everything except digits and +
  cleaned = cleaned.replace(/[^\d+]/g, '')

  // + is allowed only as the first character
  if (cleaned.includes('+')) {
    cleaned = '+' + cleaned.replace(/\+/g, '')
  }

  return cleaned
}

const isValidEmail = (value) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

const isValidPhone = (value) => {
  // International format:
  // must start with +
  // 7-15 digits after +
  return /^\+[1-9]\d{6,14}$/.test(value)
}

const getProfileName = () => {
  const profile = profileStore.profile || {}

  return [profile.name, profile.surname].filter(Boolean).join(' ').trim()
}

const fillProfileData = () => {
  if (!authStore.isAuth || profileInitialized.value) {
    return
  }

  const profile = profileStore.profile

  if (!profile || !Object.keys(profile).length) {
    return
  }

  name.value = getProfileName()
  email.value = profile.email || ''

  const profilePhone = profile.phone || ''

  if (profilePhone) {
    phone.value = profilePhone.startsWith('+')
      ? normalizePhone(profilePhone)
      : normalizePhone(`+${profilePhone}`)
  }

  profileInitialized.value = true
}

const clearErrors = () => {
  errors.value = {
    name: '',
    email: '',
    phone: '',
    topic: '',
    message: '',
    terms: '',
  }
}

const validateName = () => {
  const value = name.value.trim()

  if (!value) {
    errors.value.name = t('Name is required')
    return false
  }

  if (value.length < 2) {
    errors.value.name = t('Name must be at least 2 characters')
    return false
  }

  errors.value.name = ''
  return true
}

const validateEmail = () => {
  const value = email.value.trim()

  if (!value) {
    errors.value.email = t('E-mail is required')
    return false
  }

  if (!isValidEmail(value)) {
    errors.value.email = t('Enter a valid e-mail address')
    return false
  }

  errors.value.email = ''
  return true
}

const validatePhone = () => {
  const value = phone.value.trim()

  if (!value) {
    errors.value.phone = t('Phone is required')
    return false
  }

  if (!value.startsWith('+')) {
    errors.value.phone = t('Phone number must start with +')
    return false
  }

  if (!isValidPhone(value)) {
    errors.value.phone = t('Enter a valid phone number')
    return false
  }

  errors.value.phone = ''
  return true
}

const validateTopic = () => {
  const value = topic.value.trim()

  if (!value) {
    errors.value.topic = t('Topic is required')
    return false
  }

  if (value.length < 3) {
    errors.value.topic = t('Topic must be at least 3 characters')
    return false
  }

  if (value.length > 255) {
    errors.value.topic = t('Topic must not exceed 255 characters')
    return false
  }

  errors.value.topic = ''
  return true
}

const validateMessage = () => {
  const value = message.value.trim()

  if (!value) {
    errors.value.message = t('Message is required')
    return false
  }

  if (value.length < 10) {
    errors.value.message = t('Message must be at least 10 characters')
    return false
  }

  errors.value.message = ''
  return true
}

const validateTerms = () => {
  if (!terms.value) {
    errors.value.terms = t('You must accept the terms and privacy policy')
    return false
  }

  errors.value.terms = ''
  return true
}

const validate = () => {
  clearErrors()

  const nameValid = validateName()
  const emailValid = validateEmail()
  const phoneValid = validatePhone()
  const topicValid = validateTopic()
  const messageValid = validateMessage()
  const termsValid = validateTerms()

  return (
    nameValid &&
    emailValid &&
    phoneValid &&
    topicValid &&
    messageValid &&
    termsValid
  )
}

const submit = async () => {
  if (isSubmitting.value) {
    return
  }

  if (!validate()) {
    return
  }

  isSubmitting.value = true

  try {
    const success = await contactStore.submit(
      name.value.trim(),
      email.value.trim(),
      phone.value.trim(),
      message.value.trim(),
      topic.value.trim(),
    )

    if (success) {
      // Keep profile/prefilled information:
      // name
      // email
      // phone

      // Only clear user-written contact data
      topic.value = ''
      message.value = ''
      terms.value = false

      clearErrors()
    }
  } finally {
    isSubmitting.value = false
  }
}

watchEffect(() => {
  fillProfileData()
})

watch(name, (value) => {
  const cleaned = removeCyrillic(value)

  if (cleaned !== value) {
    name.value = cleaned
    return
  }

  if (errors.value.name && cleaned.trim().length >= 2) {
    errors.value.name = ''
  }
})

watch(email, (value) => {
  const cleaned = removeCyrillic(value)

  if (cleaned !== value) {
    email.value = cleaned
    return
  }

  if (errors.value.email && isValidEmail(cleaned.trim())) {
    errors.value.email = ''
  }
})

watch(phone, (value) => {
  const cleaned = normalizePhone(value)

  if (cleaned !== value) {
    phone.value = cleaned
    return
  }

  if (errors.value.phone && isValidPhone(cleaned.trim())) {
    errors.value.phone = ''
  }
})

watch(topic, (value) => {
  const cleaned = removeCyrillic(value)

  if (cleaned !== value) {
    topic.value = cleaned
    return
  }

  const length = cleaned.trim().length

  if (errors.value.topic && length >= 3 && length <= 255) {
    errors.value.topic = ''
  }
})

watch(message, (value) => {
  const cleaned = removeCyrillic(value)

  if (cleaned !== value) {
    message.value = cleaned
    return
  }

  if (errors.value.message && cleaned.trim().length >= 10) {
    errors.value.message = ''
  }
})

watch(terms, (value) => {
  if (value) {
    errors.value.terms = ''
  }
})
</script>

<template>
  <main class="contact-page">
    <div class="contact-page__container _cnt-home">
      <Breadcrumbs :items="breadcrumbs" class="contact-page__breadcrumbs" />

      <div class="contact-page__heading">
        <h1 class="contact-page__title">
          {{ $t('Contact Us') }}
        </h1>
      </div>

      <div class="contact-page__grid">
        <div class="contact-page__information">
          <p class="contact-page__intro">
            {{
              $t(
                'Codes, refunds, activation trouble, invoices: write in and a person answers. Add your order number and it is usually sorted in one reply.',
              )
            }}
          </p>

          <div class="contact-page__info-card">
            <div v-if="supportEmail" class="contact-page__info-row">
              <div class="contact-page__info-content">
                <span class="contact-page__info-label">
                  {{ $t('Customer Care') }}
                </span>

                <a
                  :href="`mailto:${supportEmail}`"
                  class="contact-page__info-value contact-page__info-link"
                >
                  {{ supportEmail }}
                </a>
              </div>

              <span class="contact-page__info-note">
                {{ $t('E-mail') }}
              </span>
            </div>

            <div v-if="supportPhone" class="contact-page__info-row">
              <div class="contact-page__info-content">
                <span class="contact-page__info-label">
                  {{ $t('Phone') }}
                </span>

                <a
                  :href="`tel:${supportPhoneLink}`"
                  class="contact-page__info-value contact-page__info-link"
                >
                  {{ supportPhone }}
                </a>
              </div>

              <span class="contact-page__info-note">
                {{ $t('Support') }}
              </span>
            </div>

            <div v-if="requisites" class="contact-page__requisites">
              {{ requisites }}
            </div>
          </div>
        </div>

        <div class="contact-page__form-card">
          <h2 class="contact-page__form-title">
            {{ $t('Write to us') }}
          </h2>

          <form
            class="contact-page__form"
            novalidate
            @submit.prevent="submit"
          >
            <div class="contact-page__fields">
              <!-- NAME -->
              <div class="contact-page__field">
                <label
                  class="contact-page__label"
                  for="contact-name"
                >
                  {{ $t('Name, Surname') }}
                </label>

                <BaseInput
                  id="contact-name"
                  v-model="name"
                  :error="errors.name"
                  :placeholder="$t('Name, Surname')"
                  autocomplete="name"
                  maxlength="100"
                  @blur="validateName"
                />
              </div>

              <!-- EMAIL -->
              <div class="contact-page__field">
                <label
                  class="contact-page__label"
                  for="contact-email"
                >
                  {{ $t('E-mail') }}
                </label>

                <BaseInput
                  id="contact-email"
                  v-model="email"
                  type="email"
                  :error="errors.email"
                  :placeholder="$t('you@example.com')"
                  autocomplete="email"
                  maxlength="255"
                  @blur="validateEmail"
                />
              </div>

              <!-- PHONE -->
              <div class="contact-page__field">
                <label
                  class="contact-page__label"
                  for="contact-phone"
                >
                  {{ $t('Phone') }}
                </label>

                <BaseInput
                  id="contact-phone"
                  v-model="phone"
                  type="tel"
                  :error="errors.phone"
                  :placeholder="$t('+441234567890')"
                  autocomplete="tel"
                  inputmode="tel"
                  maxlength="16"
                  @blur="validatePhone"
                />
              </div>

              <!-- TOPIC -->
              <div class="contact-page__field">
                <label
                  class="contact-page__label"
                  for="contact-topic"
                >
                  {{ $t('Topic') }}
                </label>

                <BaseInput
                  id="contact-topic"
                  v-model="topic"
                  :error="errors.topic"
                  :placeholder="$t('Topic')"
                  minlength="3"
                  maxlength="255"
                  @blur="validateTopic"
                />
              </div>

              <!-- MESSAGE -->
              <div class="contact-page__field contact-page__field_full">
                <label
                  class="contact-page__label"
                  for="contact-message"
                >
                  {{ $t('Message') }}
                </label>

                <div
                  :class="[
                    'contact-page__textarea-container',
                    {
                      'contact-page__textarea-container_error':
                        errors.message,
                    },
                  ]"
                >
                  <textarea
                    id="contact-message"
                    v-model="message"
                    class="contact-page__textarea"
                    minlength="10"
                    maxlength="5000"
                    :placeholder="
                      $t(
                        'Tell us what happened and include any information that may help.',
                      )
                    "
                    @blur="validateMessage"
                  />
                </div>

                <Transition name="contact-error">
                  <div
                    v-if="errors.message"
                    class="contact-page__field-error"
                  >
                    {{ errors.message }}
                  </div>
                </Transition>
              </div>
            </div>

            <BaseCheckbox
              v-model="terms"
              terms
              :error="errors.terms"
              class="contact-page__terms"
            />

            <BaseButton
              type="submit"
              class="contact-page__submit"
              :disabled="!canSubmit"
              variant="dark-secondary"
            >
              {{
                isSubmitting
                  ? $t('Sending...')
                  : $t('Send message')
              }}
            </BaseButton>

            <Transition name="contact-message">
              <div
                v-if="contactStore.error"
                class="
                  contact-page__message
                  contact-page__message_error
                "
              >
                {{ $t(contactStore.error) }}
              </div>
            </Transition>

            <Transition name="contact-message">
              <div
                v-if="contactStore.success"
                class="
                  contact-page__message
                  contact-page__message_success
                "
              >
                {{ $t(contactStore.success) }}
              </div>
            </Transition>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.contact-page {
  width: 100%;
  min-width: 0;

  flex: 1 1 auto;

  @include header-indent;
  @include adaptiveValue('padding-top', 32, 18);
  @include adaptiveValue('padding-bottom', 104, 40);

  &__container {
    width: 100%;
    min-width: 0;
  }

  &__breadcrumbs {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 20);
    }
  }

  &__heading {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 36, 22);
    }
  }

  &__title {
    margin: 0;

    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-weight: 700;
    line-height: 1.1;

    @include adaptiveValue('font-size', 42, 30);
  }

  &__grid {
    width: 100%;
    min-width: 0;

    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
    align-items: start;

    @include adaptiveValue('gap', 56, 24);

    @media (max-width: $md3) {
      grid-template-columns: 1fr;
    }
  }

  &__information {
    width: 100%;
    min-width: 0;
  }

  &__intro {
    margin-top: 0;

    color: var(--seconday-color);

    @include adaptiveValue('font-size', 16, 14);
    @include adaptiveValue('line-height', 28, 23);
    @include adaptiveValue('margin-bottom', 24, 14);
  }

  &__info-card,
  &__form-card {
    width: 100%;
    min-width: 0;

    border: 2px solid var(--border-primary-color);
    border-radius: 14px;

    background-color: var(--bg-secondary-color);
  }

  &__info-card {
    @include adaptiveValue('padding-top', 30, 18);
    @include adaptiveValue('padding-right', 32, 18);
    @include adaptiveValue('padding-bottom', 30, 18);
    @include adaptiveValue('padding-left', 32, 18);
  }

  &__info-row {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: space-between;

    border-bottom: 2px solid var(--border-primary-color);

    @include adaptiveValue('gap', 20, 12);
    @include adaptiveValue('padding-bottom', 20, 16);

    &:not(:first-child) {
      @include adaptiveValue('padding-top', 20, 16);
    }
  }

  &__info-content {
    min-width: 0;

    display: flex;
    flex-direction: column;

    gap: 4px;
  }

  &__info-label {
    color: var(--seconday-color);

    @include adaptiveValue('font-size', 13, 12);
    @include adaptiveValue('line-height', 19, 17);
  }

  &__info-value {
    color: var(--primary-color);

    font-weight: 600;
    line-height: 1.4;

    word-break: break-word;

    @include adaptiveValue('font-size', 18, 15);
  }

  &__info-link {
    transition: color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);
      }
    }
  }

  &__info-note {
    flex: 0 0 auto;

    color: var(--hint-primary-color);

    font-weight: 700;
    text-transform: uppercase;
    white-space: nowrap;

    @include adaptiveValue('font-size', 11, 9);
    @include adaptiveValue('line-height', 16, 14);
    @include adaptiveValue('letter-spacing', 1.3, 1);
  }

  &__requisites {
    color: var(--seconday-color);

    @include adaptiveValue('padding-top', 20, 16);
    @include adaptiveValue('font-size', 13, 12);
    @include adaptiveValue('line-height', 21, 19);
  }

  &__form-card {
    @include adaptiveValue('padding-top', 34, 20);
    @include adaptiveValue('padding-right', 38, 18);
    @include adaptiveValue('padding-bottom', 38, 22);
    @include adaptiveValue('padding-left', 38, 18);
  }

  &__form-title {
    margin-top: 0;

    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-weight: 700;
    line-height: 1.2;

    @include adaptiveValue('font-size', 26, 22);
    @include adaptiveValue('margin-bottom', 24, 20);
  }

  &__form {
    width: 100%;
    min-width: 0;
  }

  &__fields {
    width: 100%;

    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    @include adaptiveValue('gap', 20, 14);
    @include adaptiveValue('margin-bottom', 20, 16);

    @media (max-width: $md5) {
      grid-template-columns: 1fr;
    }
  }

  &__field {
    width: 100%;
    min-width: 0;

    &_full {
      grid-column: 1 / -1;
    }
  }

  &__label {
    display: block;

    color: var(--seconday-color);

    font-weight: 700;
    text-transform: uppercase;

    @include adaptiveValue('font-size', 11, 10);
    @include adaptiveValue('line-height', 16, 15);
    @include adaptiveValue('letter-spacing', 1.35, 1.1);
    @include adaptiveValue('margin-bottom', 8, 7);
  }

  &__textarea-container {
    width: 100%;

    border: 2px solid var(--border-primary-color);
    border-radius: 10px;

    background-color: var(--bg-secondary-color);

    transition: border-color 0.3s ease;

    &:focus-within {
      border-color: var(--hint-primary-color);
    }

    &_error {
      border-color: var(--error-color);

      &:focus-within {
        border-color: var(--error-color);
      }
    }
  }

  &__textarea {
    width: 100%;
    min-width: 0;

    display: block;

    border: none;
    outline: none;

    resize: vertical;

    background-color: transparent;

    color: var(--primary-color);

    font-family: var(--font-open-sans);
    font-size: 15px;
    line-height: 22px;

    @include adaptiveValue('min-height', 160, 130);
    @include adaptiveValue('padding-top', 14, 12);
    @include adaptiveValue('padding-right', 18, 15);
    @include adaptiveValue('padding-bottom', 14, 12);
    @include adaptiveValue('padding-left', 18, 15);

    &::placeholder {
      color: var(--third-color);

      transition: opacity 0.3s ease;
    }

    &:focus {
      &::placeholder {
        opacity: 0;
      }
    }
  }

  &__field-error {
    margin-top: 6px;

    color: var(--error-color);

    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
  }

  &__terms {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 22, 18);
    }
  }

  &__submit {
    width: fit-content;

    @include adaptiveValue('min-width', 165, 150);
  }

  &__message {
    width: 100%;

    border-radius: 8px;

    font-weight: 600;

    @include adaptiveValue('margin-top', 18, 14);
    @include adaptiveValue('padding', 12, 10);
    @include adaptiveValue('font-size', 13, 12);
    @include adaptiveValue('line-height', 20, 18);

    &_error {
      color: var(--error-color);

      background-color: color-mix(
        in srgb,
        var(--error-color) 10%,
        transparent
      );
    }

    &_success {
      color: var(--success-color, #1f9d55);

      background-color: color-mix(
        in srgb,
        var(--success-color, #1f9d55) 10%,
        transparent
      );
    }
  }

  @media (max-width: $md3) {
    &__information {
      order: 2;
    }

    &__form-card {
      order: 1;
    }
  }

  @media (max-width: $md5) {
    &__info-row {
      align-items: flex-start;
    }

    &__submit {
      width: 100%;
    }
  }
}

.contact-error-enter-active,
.contact-error-leave-active,
.contact-message-enter-active,
.contact-message-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.contact-error-enter-from,
.contact-error-leave-to,
.contact-message-enter-from,
.contact-message-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
