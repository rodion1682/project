<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/ui/BaseButton.vue'

import { useCookiesModalStore } from '@/stores/cookiesModal'
import { useStaticStore } from '@/stores/static'

const { t } = useI18n()

const cookiesModalStore = useCookiesModalStore()
const staticStore = useStaticStore()

const cookiePage = computed(() => {
  if (!Array.isArray(staticStore.static)) {
    return null
  }

  return (
    staticStore.static.find((item) => {
      return String(item?.title || '')
        .toLowerCase()
        .includes('cookie')
    }) || null
  )
})

const cookiePageLink = computed(() => {
  if (!cookiePage.value?.title) {
    return null
  }

  const slug = cookiePage.value.title.toLowerCase().trim().replace(/\s+/g, '-')

  return `/static/${slug}`
})

const acceptCookies = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('cookiesAccepted', 'true')
  }

  cookiesModalStore.closeModal()
}
</script>

<template>
  <div class="cookies-banner">
    <div class="cookies-banner__body">
      <div class="cookies-banner__content">
        <h2 class="cookies-banner__title">
          {{ $t('Cookies are used on this Website') }}
        </h2>

        <p class="cookies-banner__text">
          {{
            $t(
              'Our website uses cookies to enable essential features and improve your browsing experience. Essential cookies are automatically deployed to facilitate proper functioning of the website. Our website does not use non-essential cookies. For more detailed information on how we use cookies, please refer to our',
            )
          }}

          <RouterLink
            v-if="cookiePage && cookiePageLink"
            :to="cookiePageLink"
            class="cookies-banner__link"
          >
            {{ $t(cookiePage.title) }}
          </RouterLink>
        </p>
      </div>

      <div class="cookies-banner__actions">
        <BaseButton type="button" class="cookies-banner__button" @click="acceptCookies">
          {{ $t('Ok') }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.cookies-banner {
  position: fixed;
  z-index: var(--menu-z-index);

  left: 50%;

  width: calc(100% - 30px);
  max-width: 900px;

  transform: translateX(-50%);

  @include adaptiveValue('bottom', 32, 15);

  &__body {
    width: 100%;
    max-height: 60vh;

    display: flex;
    align-items: center;

    overflow: hidden;

    border: 2px solid var(--border-primary-color);

    @include adaptiveValue('border-radius', 16, 12);

    background-color: var(--bg-secondary-color);

    box-shadow:
      var(--hint-primary-color) 6px 6px 0,
      0 18px 50px rgba(15, 27, 45, 0.12);

    @include adaptiveValue('padding-top', 24, 18);
    @include adaptiveValue('padding-right', 24, 16);
    @include adaptiveValue('padding-bottom', 24, 18);
    @include adaptiveValue('padding-left', 24, 16);

    @include adaptiveValue('gap', 32, 18);
  }

  &__content {
    min-width: 0;
    flex: 1 1 auto;

    max-height: calc(60vh - 48px);

    overflow-y: auto;
    overscroll-behavior: contain;

    scrollbar-width: thin;
  }

  &__title {
    margin: 0;

    color: var(--primary-color);

    font-family: var(--font-gabarito);

    font-weight: 700;
    line-height: 1.15;

    @include adaptiveValue('font-size', 24, 20);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 10, 8);
    }
  }

  &__text {
    margin: 0;

    color: var(--seconday-color);

    font-family: var(--font-open-sans);

    font-weight: 400;

    @include adaptiveValue('font-size', 14, 13);
    @include adaptiveValue('line-height', 22, 20);
  }

  &__link {
    display: inline;

    margin-left: 4px;

    color: var(--hint-primary-color);

    font-weight: 700;

    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 3px;

    transition: opacity 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        opacity: 0.7;
      }
    }
  }

  &__actions {
    flex: 0 0 auto;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__button {
    @include adaptiveValue('min-width', 120, 100);
  }

  @media (max-width: $md5) {
    width: calc(100% - 24px);

    &__body {
      align-items: stretch;
      flex-direction: column;

      gap: 16px;
    }

    &__content {
      max-height: calc(60vh - 90px);
    }

    &__actions {
      width: 100%;
    }

    &__button {
      width: 100%;
    }
  }

  @media (max-width: $md8) {
    width: calc(100% - 20px);

    bottom: 10px;

    &__body {
      padding: 16px 14px 14px;
    }

    &__content {
      max-height: calc(60vh - 82px);
    }
  }
}
</style>
