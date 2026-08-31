<template>
  <div
    class="cookie-modal"
    role="dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
  >
    <div class="cookie-modal__outer">
      <div class="cookie-modal__inner _cnt">
        <div v-if="!preferences" class="cookie-modal__overview">
          <div class="cookie-modal__information">
            <div class="cookie-modal__subtitle _h5">
              {{ $t('Privacy preferences') }}
            </div>

            <h2 :id="titleId" class="cookie-modal__title _h3">
              {{ $t('We use Cookies') }}
            </h2>

            <p class="cookie-modal__description">
              {{
                $t(
                  'We utilize cookies to maintain the functionality of our Website and to remember your preferences. Subject to your consent, we also use cookies for analytics and personalized advertising. Please select your preferences from the categories below. You may change your settings at any time as described in our',
                )
              }}

              <RouterLink
                :to="cookiePageLink"
                class="cookie-modal__link"
                @click="closeModal"
              >
                {{ $t('Cookie Notice') }}.
              </RouterLink>
            </p>
          </div>

          <div class="cookie-modal__actions">
            <BaseButton
              type="button"
              class="cookie-modal__button"
              @click="acceptCookies"
            >
              {{ $t('Accept All') }}
            </BaseButton>

            <BaseButton
              type="button"
              class="cookie-modal__button"
              variant="bordered"
              @click="openPreferences"
            >
              {{ $t('Customize') }}
            </BaseButton>

            <button
              type="button"
              class="cookie-modal__reject"
              @click="declineCookies"
            >
              {{ $t('Reject All Non-essential Cookies') }}
            </button>
          </div>
        </div>

        <div v-else class="cookie-modal__preferences">
          <div class="cookie-modal__preferences-header">
            <div>
              <div class="cookie-modal__subtitle _h5">
                {{ $t('Privacy preferences') }}
              </div>

              <h2 :id="titleId" class="cookie-modal__title _h3">
                {{ $t('Customize Cookies') }}
              </h2>
            </div>

            <button
              type="button"
              class="cookie-modal__back"
              @click="closePreferences"
            >
              {{ $t('Back') }}
            </button>
          </div>

          <div class="cookie-modal__settings">
            <div class="cookie-modal__item">
              <div class="cookie-modal__item-content">
                <h3 class="cookie-modal__item-title">
                  {{ $t('Essential Cookies') }}
                </h3>

                <p class="cookie-modal__item-description">
                  {{
                    $t(
                      'These cookies are essential for the Website to function and cannot be switched off.',
                    )
                  }}
                </p>
              </div>

              <div class="cookie-modal__item-control">
                <span class="cookie-modal__required">
                  {{ $t('Always active') }}
                </span>

                <label class="cookie-switch">
                  <span class="cookie-switch__label">
                    {{ $t('Essential Cookies') }}
                  </span>

                  <input
                    v-model="cookies.essential"
                    class="cookie-switch__input"
                    type="checkbox"
                    disabled
                  />

                  <span class="cookie-switch__control" aria-hidden="true" />
                </label>
              </div>
            </div>

            <div class="cookie-modal__item">
              <div class="cookie-modal__item-content">
                <h3 class="cookie-modal__item-title">
                  {{ $t('Functional Cookies') }}
                </h3>

                <p class="cookie-modal__item-description">
                  {{
                    $t(
                      'These cookies improve functionality and personalization by remembering choices such as language and region, and by providing enhanced features.',
                    )
                  }}
                </p>
              </div>

              <label class="cookie-switch">
                <span class="cookie-switch__label">
                  {{ $t('Functional Cookies') }}
                </span>

                <input
                  v-model="cookies.functional"
                  class="cookie-switch__input"
                  type="checkbox"
                />

                <span class="cookie-switch__control" aria-hidden="true" />
              </label>
            </div>

            <div class="cookie-modal__item">
              <div class="cookie-modal__item-content">
                <h3 class="cookie-modal__item-title">
                  {{ $t('Performance Cookies') }}
                </h3>

                <p class="cookie-modal__item-description">
                  {{
                    $t(
                      'These cookies help us understand how visitors use the Website so we can improve its content and performance.',
                    )
                  }}
                </p>
              </div>

              <label class="cookie-switch">
                <span class="cookie-switch__label">
                  {{ $t('Performance Cookies') }}
                </span>

                <input
                  v-model="cookies.performance"
                  class="cookie-switch__input"
                  type="checkbox"
                />

                <span class="cookie-switch__control" aria-hidden="true" />
              </label>
            </div>

            <div class="cookie-modal__item">
              <div class="cookie-modal__item-content">
                <h3 class="cookie-modal__item-title">
                  {{ $t('Advertising and Targeting Cookies') }}
                </h3>

                <p class="cookie-modal__item-description">
                  {{
                    $t(
                      'These cookies are used to deliver more relevant content or advertisements and to measure campaign effectiveness.',
                    )
                  }}
                </p>
              </div>

              <label class="cookie-switch">
                <span class="cookie-switch__label">
                  {{ $t('Advertising and Targeting Cookies') }}
                </span>

                <input
                  v-model="cookies.targeting"
                  class="cookie-switch__input"
                  type="checkbox"
                />

                <span class="cookie-switch__control" aria-hidden="true" />
              </label>
            </div>
          </div>

          <div class="cookie-modal__preferences-actions">
            <BaseButton
              type="button"
              class="cookie-modal__button"
              @click="saveCustomSettings"
            >
              {{ $t('Save & Exit') }}
            </BaseButton>

            <BaseButton
              type="button"
              class="cookie-modal__button"
              variant="bordered"
              @click="acceptCookies"
            >
              {{ $t('Accept All') }}
            </BaseButton>

            <button
              type="button"
              class="cookie-modal__reject"
              @click="declineCookies"
            >
              {{ $t('Reject All Non-essential Cookies') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'

import BaseButton from '@/components/base/BaseButton.vue'
import { useCookiesModalStore } from '@/stores/cookiesModal'
import { useStaticStore } from '@/stores/static'

const COOKIE_SETTINGS_KEY = 'cookie_settings'
const titleId = 'cookie-modal-title'

const staticStore = useStaticStore()
const cookiesModalStore = useCookiesModalStore()

const preferences = ref(false)

const cookies = reactive({
  essential: true,
  functional: false,
  performance: false,
  targeting: false,
})

const cookiePage = computed(() => {
  return staticStore.cookiePage
})

const cookiePageLink = computed(() => {
  if (!cookiePage.value) {
    return {
      name: 'NotFound',
    }
  }

  if (cookiePage.value.slug) {
    return {
      name: 'StaticPageBySlug',
      params: {
        slug: cookiePage.value.slug,
      },
    }
  }

  return {
    name: 'StaticPage',
    params: {
      id: cookiePage.value.id,
    },
  }
})

const loadCookieSettings = () => {
  const savedSettings = localStorage.getItem(COOKIE_SETTINGS_KEY)

  if (!savedSettings) {
    return
  }

  try {
    const parsedSettings = JSON.parse(savedSettings)

    cookies.essential = true
    cookies.functional = Boolean(parsedSettings.functional)
    cookies.performance = Boolean(parsedSettings.performance)
    cookies.targeting = Boolean(parsedSettings.advertisement)
  } catch (error) {
    console.error('Failed to read cookie settings:', error)
  }
}

const saveCookieSettings = () => {
  const settings = {
    necessary: true,
    functional: cookies.functional,
    performance: cookies.performance,
    advertisement: cookies.targeting,
  }

  localStorage.setItem(COOKIE_SETTINGS_KEY, JSON.stringify(settings))

  /*
   * Notify anything listening for consent changes,
   * such as analytics initialization.
   */
  window.dispatchEvent(
    new CustomEvent('cookie-settings-changed', {
      detail: settings,
    }),
  )
}

const closeModal = () => {
  cookiesModalStore.closeModal()
}

const openPreferences = () => {
  preferences.value = true
}

const closePreferences = () => {
  preferences.value = false
}

const saveCustomSettings = () => {
  cookies.essential = true

  saveCookieSettings()
  closeModal()
}

const acceptCookies = () => {
  cookies.essential = true
  cookies.functional = true
  cookies.performance = true
  cookies.targeting = true

  saveCookieSettings()
  closeModal()
}

const declineCookies = () => {
  cookies.essential = true
  cookies.functional = false
  cookies.performance = false
  cookies.targeting = false

  saveCookieSettings()
  closeModal()
}

onMounted(() => {
  loadCookieSettings()
})
</script>

<style lang="scss" scoped>
.cookie-modal {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: var(--modal-z-index);

  width: 100%;

  padding: 8px;

  background-color: rgb(7 8 14 / 88%);
  box-shadow: 0 -20px 60px rgb(0 0 0 / 45%);

  backdrop-filter: blur(10px);

  &__outer {
    padding: 4px;

    border: 1px solid var(--border-secondary-color);
    border-radius: 6px;
    background-color: var(--bg-fourth-color);
  }

  &__inner {
    @include adaptiveValue('padding-top', 25, 18);
    @include adaptiveValue('padding-bottom', 25, 18);
    @include adaptiveValue('padding-left', 30, 12);
    @include adaptiveValue('padding-right', 30, 12);

    border: 1px solid var(--border-secondary-color);
    border-radius: 4px;
    background-color: var(--bg-fifth-color);
  }

  &__overview {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: clamp(25px, 5vw, 80px);
  }

  &__information {
    flex: 1 1 auto;

    min-width: 0;
  }

  &__subtitle {
    color: var(--hint-primary-color);

    &:not(:last-child) {
      margin-bottom: 5px;
    }
  }

  &__title {
    color: var(--primary-color);

    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }

  &__description {
    max-width: 980px;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 400;
    line-height: 150%;
  }

  &__link {
    display: inline;

    color: var(--hint-secondary-color);
    text-decoration: underline;

    transition: color 0.3s ease;

    text-underline-offset: 3px;

    @media (any-hover: hover) {
      &:hover {
        color: var(--primary-color);
      }
    }
  }

  &__actions {
    display: grid;
    flex: 0 0 min(100%, 230px);
    gap: 9px;
  }

  &__button {
    width: 100%;
  }

  &__reject {
    width: 100%;

    padding: 7px 10px;

    border: 0;
    outline: none;
    background-color: transparent;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 12px;
    line-height: 135%;
    text-align: center;
    text-decoration: underline;

    cursor: pointer;

    transition: color 0.3s ease;

    text-underline-offset: 3px;

    &:focus-visible {
      color: var(--hint-secondary-color);
    }

    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-secondary-color);
      }
    }
  }

  &__preferences {
    overflow-x: hidden;
    overflow-y: auto;

    width: 100%;
    max-height: min(70vh, 650px);

    padding-right: 5px;

    overscroll-behavior: contain;
    scrollbar-color: var(--hint-primary-color) var(--bg-third-color);
    scrollbar-width: thin;

    &::-webkit-scrollbar {
      width: 5px;
    }

    &::-webkit-scrollbar-track {
      border-radius: 5px;
      background-color: var(--bg-third-color);
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 5px;
      background: var(--hint-gradient);
    }
  }

  &__preferences-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 25px;

    padding-bottom: 18px;

    border-bottom: 1px solid var(--border-secondary-color);
  }

  &__back {
    flex: 0 0 auto;

    min-height: 34px;

    padding: 5px 18px;

    border: 1px solid var(--border-secondary-color);
    border-radius: 4px;
    outline: none;
    background-color: transparent;

    color: var(--hint-primary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 500;
    text-transform: uppercase;

    cursor: pointer;

    transition:
      color 0.3s ease,
      border-color 0.3s ease,
      background-color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--hint-secondary-color);

        color: var(--hint-secondary-color);
      }
    }
  }

  &__settings {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    border-bottom: 1px solid var(--border-secondary-color);
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 25px;

    min-width: 0;

    padding: 18px;

    border-bottom: 1px solid var(--border-fourth-color);

    &:nth-child(odd) {
      border-right: 1px solid var(--border-fourth-color);
    }

    &:nth-last-child(-n + 2) {
      border-bottom: 0;
    }
  }

  &__item-content {
    flex: 1 1 auto;

    min-width: 0;
  }

  &__item-title {
    color: var(--hint-primary-color);
    font-family: var(--font-spectral-sc);
    font-size: 16px;
    font-weight: 500;
    line-height: 130%;
    text-transform: uppercase;

    &:not(:last-child) {
      margin-bottom: 6px;
    }
  }

  &__item-description {
    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 13px;
    line-height: 145%;
  }

  &__item-control {
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    align-items: flex-end;
    gap: 5px;
  }

  &__required {
    color: var(--fourth-color);
    font-size: 10px;
    font-weight: 500;
    line-height: 120%;
    text-transform: uppercase;
    white-space: nowrap;
  }

  &__preferences-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;

    padding-top: 18px;

    .cookie-modal__button {
      width: min(100%, 210px);
    }

    .cookie-modal__reject {
      width: auto;
      max-width: 220px;
    }
  }

  @media (max-width: $md3) {
    &__overview {
      align-items: stretch;
    }

    &__settings {
      grid-template-columns: 1fr;
    }

    &__item {
      &:nth-child(odd) {
        border-right: 0;
      }

      &:nth-last-child(2) {
        border-bottom: 1px solid var(--border-fourth-color);
      }
    }
  }

  @media (max-width: $md4) {
    padding: 5px;

    &__overview {
      flex-direction: column;
      gap: 18px;
    }

    &__actions {
      display: flex;
      flex: 0 1 auto;
      flex-wrap: wrap;

      .cookie-modal__button {
        flex: 1 1 180px;
      }

      .cookie-modal__reject {
        flex: 1 1 100%;
      }
    }

    &__preferences {
      max-height: 75vh;
    }

    &__item {
      align-items: flex-start;
      gap: 15px;

      padding-right: 5px;
      padding-left: 5px;
    }

    &__preferences-actions {
      flex-wrap: wrap;

      .cookie-modal__button {
        flex: 1 1 180px;

        width: auto;
        max-width: none;
      }

      .cookie-modal__reject {
        flex: 1 1 100%;

        width: 100%;
        max-width: none;
      }
    }
  }

  @media (max-width: $md7) {
    &__description {
      font-size: 12px;
    }

    &__preferences-header {
      gap: 12px;
    }

    &__back {
      padding-right: 12px;
      padding-left: 12px;
    }

    &__item {
      flex-direction: column;
      align-items: stretch;
    }

    &__item-control {
      align-items: flex-start;
    }

    &__item-title {
      font-size: 14px;
    }

    &__item-description {
      font-size: 12px;
    }
  }
}

.cookie-switch {
  position: relative;

  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;

  width: 42px;
  height: 23px;

  cursor: pointer;

  &__label {
    position: absolute;

    overflow: hidden;

    width: 1px;
    height: 1px;

    margin: -1px;

    white-space: nowrap;

    clip: rect(0 0 0 0);
    clip-path: inset(50%);
  }

  &__input {
    position: absolute;

    width: 1px;
    height: 1px;

    opacity: 0;

    pointer-events: none;

    &:focus-visible + .cookie-switch__control {
      outline: 2px solid var(--hint-secondary-color);
      outline-offset: 2px;
    }

    &:checked + .cookie-switch__control {
      border-color: var(--hint-primary-color);
      background: var(--hint-gradient);

      &::before {
        background-color: var(--bg-primary-color);

        transform: translateX(19px);
      }
    }

    &:disabled + .cookie-switch__control {
      opacity: 0.7;

      cursor: default;
    }
  }

  &__control {
    position: absolute;
    inset: 0;

    border: 1px solid var(--border-third-color);
    border-radius: 20px;
    background-color: var(--bg-secondary-color);

    cursor: pointer;

    transition:
      border-color 0.3s ease,
      background-color 0.3s ease;

    &::before {
      position: absolute;
      top: 3px;
      left: 3px;

      width: 15px;
      height: 15px;

      border-radius: 50%;
      background-color: var(--third-color);
      box-shadow: 0 2px 5px rgb(0 0 0 / 35%);

      content: '';

      transition:
        background-color 0.3s ease,
        transform 0.3s ease;
    }
  }

  @media (any-hover: hover) {
    &:hover {
      .cookie-switch__input:not(:disabled) + .cookie-switch__control {
        border-color: var(--hint-secondary-color);
      }
    }
  }
}
</style>
