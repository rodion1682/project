<script setup>
import { computed, onBeforeUnmount, ref, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'

import { useAuthStore } from '@/stores/auth'
import { useContactStore } from '@/stores/contact'
import { useProfileStore } from '@/stores/profile'
import { useSettingsStore } from '@/stores/settings'
import { useStaticStore } from '@/stores/static'

const { t } = useI18n()

const authStore = useAuthStore()
const contactStore = useContactStore()
const profileStore = useProfileStore()
const settingsStore = useSettingsStore()
const staticStore = useStaticStore()

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

/*
|--------------------------------------------------------------------------
| Debounced validation
|--------------------------------------------------------------------------
*/

const VALIDATION_DELAY = 450

const validationTimers = {
  name: null,
  email: null,
  phone: null,
  topic: null,
  message: null,
}

const touched = ref({
  name: false,
  email: false,
  phone: false,
  topic: false,
  message: false,
  terms: false,
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

const termsPage = computed(() => {
  if (!Array.isArray(staticStore.static)) {
    return null
  }

  return staticStore.static.find((item) => item.is_terms) || null
})

const privacyPage = computed(() => {
  if (!Array.isArray(staticStore.static)) {
    return null
  }

  return staticStore.static.find((item) => item.is_privacy) || null
})

const getStaticPageLink = (item) => {
  if (!item?.title) {
    return '#'
  }

  return `/static/${item.title.toLowerCase().replace(/ /g, '-')}`
}

const removeCyrillic = (value = '') => {
  return String(value).replace(/[А-Яа-яЁёІіЇїЄєҐґ]/g, '')
}

const normalizePhone = (value = '') => {
  let cleaned = removeCyrillic(String(value))
  cleaned = cleaned.replace(/[^\d+]/g, '')
  if (cleaned.includes('+')) {
    cleaned = '+' + cleaned.replace(/\+/g, '')
  }

  return cleaned
}

const getNameParts = (value = '') => {
  return String(value).trim().split(/\s+/).filter(Boolean)
}

const isValidFullName = (value = '') => {
  const parts = getNameParts(value)

  if (parts.length < 2) {
    return false
  }

  const firstName = parts[0]
  const surname = parts.slice(1).join(' ')

  return firstName.length >= 2 && surname.length >= 2
}

const isValidEmail = (value = '') => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

const isValidPhone = (value = '') => {
  return /^\+\d{7,15}$/.test(value)
}

const fillProfileData = () => {
  if (!authStore.isAuth || profileInitialized.value) {
    return
  }

  const profile = profileStore.profile

  if (!profile || !Object.keys(profile).length) {
    return
  }

  const fullName = [profile.name, profile.surname].filter(Boolean).join(' ').trim()

  if (fullName) {
    name.value = fullName
  }

  if (profile.email) {
    email.value = profile.email
  }

  if (profile.phone) {
    const profilePhone = String(profile.phone)

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

const clearValidationTimer = (field) => {
  if (!validationTimers[field]) {
    return
  }

  clearTimeout(validationTimers[field])

  validationTimers[field] = null
}

const debounceValidation = (field, callback) => {
  clearValidationTimer(field)

  validationTimers[field] = setTimeout(() => {
    callback()

    validationTimers[field] = null
  }, VALIDATION_DELAY)
}

const validateName = () => {
  const value = name.value.trim()

  if (!value) {
    errors.value.name = t('Name and surname are required')

    return false
  }

  const parts = getNameParts(value)

  if (parts.length < 2) {
    errors.value.name = t('Enter both your name and surname')

    return false
  }

  const firstName = parts[0]
  const surname = parts.slice(1).join(' ')

  if (firstName.length < 2) {
    errors.value.name = t('Name must be at least 2 characters')

    return false
  }

  if (surname.length < 2) {
    errors.value.name = t('Surname must be at least 2 characters')

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

  const digits = value.slice(1)

  if (!/^\d+$/.test(digits)) {
    errors.value.phone = t('Phone number must contain only digits after +')

    return false
  }

  if (digits.length < 7) {
    errors.value.phone = t('Phone number must contain at least 7 digits')

    return false
  }

  if (digits.length > 15) {
    errors.value.phone = t('Phone number must not contain more than 15 digits')

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
  Object.keys(validationTimers).forEach((field) => {
    clearValidationTimer(field)
  })

  touched.value = {
    name: true,
    email: true,
    phone: true,
    topic: true,
    message: true,
    terms: true,
  }

  clearErrors()

  const nameValid = validateName()
  const emailValid = validateEmail()
  const phoneValid = validatePhone()
  const topicValid = validateTopic()
  const messageValid = validateMessage()
  const termsValid = validateTerms()

  return nameValid && emailValid && phoneValid && topicValid && messageValid && termsValid
}

const canSubmit = computed(() => {
  return (
    isValidFullName(name.value) &&
    isValidEmail(email.value.trim()) &&
    isValidPhone(phone.value.trim()) &&
    topic.value.trim().length >= 3 &&
    topic.value.trim().length <= 255 &&
    message.value.trim().length >= 10 &&
    terms.value &&
    !isSubmitting.value
  )
})

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
      topic.value = ''
      message.value = ''
      terms.value = false
      touched.value.topic = false
      touched.value.message = false
      touched.value.terms = false

      clearErrors()
    }
  } finally {
    isSubmitting.value = false
  }
}

watchEffect(() => {
  fillProfileData()
})

watch(name, (value, previousValue) => {
  const cleaned = removeCyrillic(value)

  if (cleaned !== value) {
    name.value = cleaned

    return
  }

  if (!profileInitialized.value && !previousValue) {
    return
  }

  touched.value.name = true

  debounceValidation('name', validateName)
})

watch(email, (value, previousValue) => {
  const cleaned = removeCyrillic(value)

  if (cleaned !== value) {
    email.value = cleaned

    return
  }

  if (!profileInitialized.value && !previousValue) {
    return
  }

  touched.value.email = true

  debounceValidation('email', validateEmail)
})

watch(phone, (value, previousValue) => {
  const cleaned = normalizePhone(value)

  if (cleaned !== value) {
    phone.value = cleaned

    return
  }

  if (!profileInitialized.value && !previousValue) {
    return
  }

  touched.value.phone = true

  debounceValidation('phone', validatePhone)
})

watch(topic, (value) => {
  const cleaned = removeCyrillic(value)

  if (cleaned !== value) {
    topic.value = cleaned

    return
  }

  if (!value && !touched.value.topic) {
    errors.value.topic = ''

    return
  }

  touched.value.topic = true

  debounceValidation('topic', validateTopic)
})

watch(message, (value) => {
  const cleaned = removeCyrillic(value)

  if (cleaned !== value) {
    message.value = cleaned

    return
  }

  if (!value && !touched.value.message) {
    errors.value.message = ''

    return
  }

  touched.value.message = true

  debounceValidation('message', validateMessage)
})

watch(terms, (value) => {
  if (value) {
    touched.value.terms = true
    errors.value.terms = ''

    return
  }

  if (touched.value.terms) {
    errors.value.terms = t('You must accept the terms and privacy policy')
  }
})

onBeforeUnmount(() => {
  Object.keys(validationTimers).forEach((field) => {
    clearValidationTimer(field)
  })
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

          <form class="contact-page__form" novalidate @submit.prevent="submit">
            <div class="contact-page__fields">
              <div class="contact-page__field">
                <label class="contact-page__label" for="contact-name">
                  {{ $t('Name, Surname') }}
                </label>

                <input
                  id="contact-name"
                  v-model="name"
                  :class="[
                    'contact-page__input',
                    {
                      'contact-page__input_error': errors.name,
                    },
                  ]"
                  type="text"
                  :placeholder="$t('Name, Surname')"
                  autocomplete="name"
                  maxlength="100"
                />

                <Transition name="contact-error">
                  <div v-if="errors.name" class="contact-page__field-error">
                    {{ errors.name }}
                  </div>
                </Transition>
              </div>

              <div class="contact-page__field">
                <label class="contact-page__label" for="contact-email">
                  {{ $t('E-mail') }}
                </label>

                <input
                  id="contact-email"
                  v-model="email"
                  :class="[
                    'contact-page__input',
                    {
                      'contact-page__input_error': errors.email,
                    },
                  ]"
                  type="email"
                  :placeholder="$t('you@example.com')"
                  autocomplete="email"
                  maxlength="255"
                />

                <Transition name="contact-error">
                  <div v-if="errors.email" class="contact-page__field-error">
                    {{ errors.email }}
                  </div>
                </Transition>
              </div>

              <div class="contact-page__field">
                <label class="contact-page__label" for="contact-phone">
                  {{ $t('Phone') }}
                </label>

                <input
                  id="contact-phone"
                  v-model="phone"
                  :class="[
                    'contact-page__input',
                    {
                      'contact-page__input_error': errors.phone,
                    },
                  ]"
                  type="tel"
                  :placeholder="$t('+441234567890')"
                  autocomplete="tel"
                  inputmode="tel"
                  maxlength="16"
                />

                <Transition name="contact-error">
                  <div v-if="errors.phone" class="contact-page__field-error">
                    {{ errors.phone }}
                  </div>
                </Transition>
              </div>

              <div class="contact-page__field">
                <label class="contact-page__label" for="contact-topic">
                  {{ $t('Topic') }}
                </label>

                <input
                  id="contact-topic"
                  v-model="topic"
                  :class="[
                    'contact-page__input',
                    {
                      'contact-page__input_error': errors.topic,
                    },
                  ]"
                  type="text"
                  :placeholder="$t('Topic')"
                  minlength="3"
                  maxlength="255"
                />

                <Transition name="contact-error">
                  <div v-if="errors.topic" class="contact-page__field-error">
                    {{ errors.topic }}
                  </div>
                </Transition>
              </div>

              <div class="contact-page__field contact-page__field_full">
                <label class="contact-page__label" for="contact-message">
                  {{ $t('Message') }}
                </label>

                <textarea
                  id="contact-message"
                  v-model="message"
                  :class="[
                    'contact-page__textarea',
                    {
                      'contact-page__textarea_error': errors.message,
                    },
                  ]"
                  minlength="10"
                  maxlength="5000"
                  :placeholder="
                    $t('Tell us what happened and include any information that may help.')
                  "
                />

                <Transition name="contact-error">
                  <div v-if="errors.message" class="contact-page__field-error">
                    {{ errors.message }}
                  </div>
                </Transition>
              </div>
            </div>

            <div class="contact-page__terms">
              <label class="contact-page__checkbox">
                <input v-model="terms" type="checkbox" />

                <span class="contact-page__checkbox-box">
                  <svg viewBox="0 0 12 10" fill="none" aria-hidden="true">
                    <path
                      d="M1 5L4.2 8L11 1"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>

                <span class="contact-page__checkbox-text">
                  {{ $t('I’ve read and agree with') }}

                  <RouterLink
                    v-if="termsPage"
                    :to="getStaticPageLink(termsPage)"
                    class="contact-page__terms-link"
                  >
                    {{ $t('T&Cs') }}
                  </RouterLink>

                  {{ $t('and') }}

                  <RouterLink
                    v-if="privacyPage"
                    :to="getStaticPageLink(privacyPage)"
                    class="contact-page__terms-link"
                  >
                    {{ $t('Privacy Policy') }}
                  </RouterLink>
                </span>
              </label>

              <Transition name="contact-error">
                <div v-if="errors.terms" class="contact-page__field-error">
                  {{ errors.terms }}
                </div>
              </Transition>
            </div>

            <button type="submit" class="contact-page__submit" :disabled="!canSubmit">
              {{ isSubmitting ? $t('Sending...') : $t('Send message') }}
            </button>

            <Transition name="contact-message">
              <div
                v-if="contactStore.error"
                class="contact-page__message contact-page__message_error"
              >
                {{ $t(contactStore.error) }}
              </div>
            </Transition>

            <Transition name="contact-message">
              <div
                v-if="contactStore.success"
                class="contact-page__message contact-page__message_success"
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
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    color: var(--seconday-color);

    @include adaptiveValue('gap', 10, 7);
    @include adaptiveValue('font-size', 14, 12);
    @include adaptiveValue('line-height', 20, 18);
    @include adaptiveValue('margin-bottom', 32, 20);

    a {
      color: var(--primary-color);

      transition: color 0.3s ease;

      @media (any-hover: hover) {
        &:hover {
          color: var(--hint-primary-color);
        }
      }
    }

    span:last-child {
      color: var(--hint-primary-color);
    }
  }

  &__heading {
    @include adaptiveValue('margin-bottom', 36, 22);
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

  &__input,
  &__textarea {
    width: 100%;
    min-width: 0;

    border: 2px solid var(--border-primary-color);
    outline: none;
    border-radius: 10px;

    background-color: var(--bg-secondary-color);

    color: var(--primary-color);

    font-family: var(--font-open-sans);

    transition:
      border-color 0.3s ease,
      background-color 0.3s ease;

    &::placeholder {
      color: var(--third-color);

      transition: opacity 0.3s ease;
    }

    &:focus {
      border-color: var(--hint-primary-color);

      &::placeholder {
        opacity: 0;
      }
    }

    &_error {
      border-color: var(--error-color);

      &:focus {
        border-color: var(--error-color);
      }
    }
  }

  &__input {
    min-height: 50px;

    padding: 0 16px;

    font-size: 14px;
  }

  &__textarea {
    display: block;

    resize: vertical;

    @include adaptiveValue('min-height', 160, 130);
    @include adaptiveValue('padding-top', 14, 12);
    @include adaptiveValue('padding-right', 18, 15);
    @include adaptiveValue('padding-bottom', 14, 12);
    @include adaptiveValue('padding-left', 18, 15);

    font-size: 15px;
    line-height: 22px;
  }

  &__field-error {
    margin-top: 6px;

    color: var(--error-color);

    font-size: 12px;
    font-weight: 500;
    line-height: 16px;
  }

  &__terms {
    @include adaptiveValue('margin-bottom', 22, 18);
  }

  &__checkbox {
    position: relative;

    display: flex;
    align-items: flex-start;

    cursor: pointer;

    @include adaptiveValue('gap', 10, 8);

    input {
      position: absolute;

      width: 1px;
      height: 1px;

      opacity: 0;
      pointer-events: none;

      &:checked + .contact-page__checkbox-box {
        border-color: var(--hint-primary-color);

        background-color: var(--hint-primary-color);

        color: var(--bg-primary-color);

        svg {
          opacity: 1;
          transform: scale(1);
        }
      }

      &:focus-visible + .contact-page__checkbox-box {
        border-color: var(--hint-primary-color);
      }
    }
  }

  &__checkbox-box {
    flex: 0 0 auto;

    display: flex;
    align-items: center;
    justify-content: center;

    border: 2px solid var(--border-primary-color);
    border-radius: 5px;

    color: var(--bg-primary-color);

    transition:
      border-color 0.3s ease,
      background-color 0.3s ease;

    @include adaptiveValue('width', 20, 18);
    @include adaptiveValue('height', 20, 18);

    svg {
      width: 11px;
      height: 9px;

      opacity: 0;
      transform: scale(0.7);

      transition:
        opacity 0.2s ease,
        transform 0.2s ease;
    }
  }

  &__checkbox-text {
    color: var(--seconday-color);

    @include adaptiveValue('font-size', 13, 12);
    @include adaptiveValue('line-height', 20, 18);
  }

  &__terms-link {
    color: var(--hint-primary-color);

    font-weight: 600;

    transition: opacity 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        opacity: 0.7;
      }
    }
  }

  &__submit {
    width: fit-content;
    min-height: 48px;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    border: 2px solid var(--border-primary-color);
    border-radius: 10px;

    padding: 0 24px;

    background-color: var(--primary-color);

    color: var(--bg-primary-color);

    font-family: var(--font-open-sans);
    font-size: 13px;
    font-weight: 700;
    line-height: 1;
    text-transform: uppercase;

    cursor: pointer;

    transition:
      opacity 0.3s ease,
      border-color 0.3s ease,
      transform 0.3s ease;

    @include adaptiveValue('min-width', 165, 150);

    &:disabled {
      opacity: 0.45;

      cursor: default;
      pointer-events: none;
    }

    @media (any-hover: hover) {
      &:not(:disabled):hover {
        border-color: var(--hint-primary-color);

        transform: translateY(-1px);
      }
    }
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

      background-color: color-mix(in srgb, var(--error-color) 10%, transparent);
    }

    &_success {
      color: var(--success-color, #1f9d55);

      background-color: color-mix(in srgb, var(--success-color, #1f9d55) 10%, transparent);
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
