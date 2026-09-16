<script setup>
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'
import { useCategoriesStore } from '@/stores/categories'
import { useLoginModalStore } from '@/stores/loginModal'
import { useSettingsStore } from '@/stores/settings'
import { useSocialsStore } from '@/stores/socials'
import { useStaticStore } from '@/stores/static'
import { initDynamicAdapt } from '@/utils/dynamic_adapt.js'

const { t } = useI18n()

const router = useRouter()

const loginModalStore = useLoginModalStore()
const authStore = useAuthStore()
const categoriesStore = useCategoriesStore()
const socialsStore = useSocialsStore()
const staticStore = useStaticStore()
const settingsStore = useSettingsStore()

const platformConfig = computed(() => [
  {
    title: t('PC'),
    search: ['pc', 'steam'],
    class: 'pc',
  },
  {
    title: t('Xbox'),
    search: ['xbox'],
    class: 'xbox',
  },
  {
    title: t('PlayStation'),
    search: ['playstation', 'ps5', 'ps4', 'ps3'],
    class: 'playstation',
  },
  {
    title: t('Nintendo'),
    search: ['nintendo'],
    class: 'nintendo',
  },
  {
    title: t('Gift cards'),
    search: ['gift card', 'gift'],
    class: 'gift-cards',
  },
])

const supportEmail = computed(() => {
  return settingsStore.settings?.support_email || ''
})

const supportEmailHref = computed(() => {
  return supportEmail.value ? `mailto:${supportEmail.value}` : '#'
})

const footerPaymentMethodTitles = computed(() => {
  return (
    settingsStore.settings?.payment_methods?.map((method) => method.title)?.filter(Boolean) || []
  )
})

const platformItems = computed(() => {
  const platforms = Array.isArray(categoriesStore.platforms) ? categoriesStore.platforms : []

  return platformConfig.value
    .map((config) => {
      const platform = platforms.find((item) => {
        const title = String(item.title || '').toLowerCase()
        const slug = String(item.slug || '').toLowerCase()

        return config.search.some((search) => {
          const value = search.toLowerCase()

          return title.includes(value) || slug.includes(value)
        })
      })

      if (!platform) {
        return null
      }

      return {
        title: config.title,
        slug: platform.slug,
        class: config.class,
      }
    })
    .filter(Boolean)
})

const getPlatformLink = (platform) => {
  return `/products/${platform.slug}`
}

const openLoginModal = () => {
  // loginModalStore.openModal()
  router.push({
    name: 'auth',
    query: {
      type: 'login',
    },
  })
}

onMounted(() => {
  initDynamicAdapt('max')
})
</script>

<template>
  <div class="footer">
    <div class="footer__container _cnt">
      <div class="footer__top">
        <div class="footer__info">
          <RouterLink to="/" class="footer__logo _ibg-contain">
            <img src="@/assets/img/logo.svg" />
          </RouterLink>
          <div class="footer__about">
            {{
              $t(
                'Official keys and gift cards for every launcher, delivered the minute your payment clears.',
              )
            }}
          </div>
          <template v-if="footerPaymentMethodTitles.length">
            <div class="footer__methods" data-da=".footer__body,619.98">
              <div v-for="title in footerPaymentMethodTitles" :key="title" class="footer__method">
                {{ title }}
              </div>
            </div>
          </template>
        </div>

        <div class="footer__column">
          <div class="footer__label">{{ $t('Store') }}</div>
          <RouterLink
            v-for="platform in platformItems"
            :key="platform.slug"
            :to="getPlatformLink(platform)"
            class="footer__link"
          >
            {{ platform.title }}
          </RouterLink>
        </div>
        <div class="footer__column footer__column_account">
          <div class="footer__label">{{ $t('Account') }}</div>
          <button v-if="!authStore.isAuth" @click="openLoginModal" class="footer__link">
            {{ $t('Sign in') }}
          </button>
          <template v-if="authStore.isAuth">
            <RouterLink to="/profile/overview" class="footer__link">{{
              $t('My profile')
            }}</RouterLink>
            <RouterLink to="/profile/orders" class="footer__link">{{ $t('Orders') }}</RouterLink>
            <RouterLink to="/profile/balance" class="footer__link">{{ $t('Balance') }}</RouterLink>
          </template>
        </div>
        <div class="footer__column">
          <div class="footer__label">{{ $t('Help') }}</div>
          <RouterLink to="/contact-us" class="footer__link">{{ $t('Contact us') }}</RouterLink>
          <RouterLink to="/contact-us" class="footer__link">{{
            $t('How buying works')
          }}</RouterLink>
          <RouterLink to="/contact-us" class="footer__link">{{ $t('Refunds') }}</RouterLink>
          <a :href="supportEmailHref" class="footer__link">
            <span>
              {{ supportEmail }}
            </span>
          </a>
        </div>
      </div>
      <div class="footer__body">
        <div
          class="footer__socials"
          :class="{ hide: socialsStore.socials.length === 0 }"
          v-if="socialsStore.socials"
        >
          <a
            v-for="(item, i) in socialsStore.socials"
            :key="i"
            target="_blank"
            :href="item.url"
            class="footer__socials-link _ibg-contain"
          >
            <img :src="item.image" :alt="item.url" />
          </a>
        </div>

        <template v-if="staticStore.static">
          <div class="footer__static" data-da=".footer__bottom,439.98">
            <RouterLink
              v-for="(item, i) in staticStore.static"
              :to="'/static/' + item?.title.toLowerCase().replace(/ /g, '-')"
              :key="i"
              class="footer__static-link"
              >{{ item.title }}</RouterLink
            >
          </div>
        </template>
      </div>
      <div class="footer__bottom">
        <div class="footer__box">
          <div class="footer__copy">{{ settingsStore.settings.copyright }}</div>
          <div class="footer__requisites" data-da=".footer__body,439.98">
            {{ settingsStore.settings.requisites }}
          </div>
        </div>
        <div class="footer__text">
          {{ $t('Game titles and platform logos belong to their owners.') }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.footer {
  @include adaptiveValue('padding-top', 59, 27);
  @include adaptiveValue('padding-bottom', 40, 30);
  border-top: 3px solid var(--hint-primary-color);
  &__container {
  }

  &__top {
    display: flex;
    gap: 20px;
    justify-content: space-between;
    @include adaptiveValue('padding-bottom', 40, 18);
    @media (min-width: $md8) {
      border-bottom: 2px solid var(--border-primary-color);
    }
    @media (max-width: $md4) {
      flex-wrap: wrap;
      row-gap: 15px;
    }
  }

  &__info {
    flex: 0 1 25%;
    @media (max-width: $md4) {
      flex: 1 1 100%;
    }
  }

  &__logo {
    display: block;
    width: fit-content;
    @include adaptiveValue('min-width', 116, 117);
    @include adaptiveValue('height', 29, 23);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 14, 20);
    }
  }
  &__about {
    font-size: 14px;
    line-height: 23.1px;
    color: var(--muted-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 18);
    }
    @media (max-width: $md8) {
      @include hide-item;
    }
  }

  &__methods {
    display: flex;
    @include adaptiveValue('gap', 10, 8);
    flex-wrap: wrap;
  }

  &__method {
    @include adaptiveValue('padding-top', 10, 9);
    @include adaptiveValue('padding-left', 16, 13);
    @include adaptiveValue('padding-bottom', 10, 9);
    @include adaptiveValue('padding-right', 16, 13);
    @include adaptiveValue('font-size', 12, 11);
    @include adaptiveValue('line-height', 16, 15);
    border-radius: 8px;
    background-color: var(--bg-tenth-color);
    border: 2px solid var(--border-primary-color);
    display: flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    height: fit-content;
    white-space: nowrap;
    font-weight: 700;
    text-transform: uppercase;
  }

  &__column {
    flex: 0 1 25%;
    @media (max-width: $md4) {
      flex: 0 1 30%;
    }
    @media (max-width: $md6) {
      flex: 0 1 calc(50% - 10px);
    }
    &_account {
      @media (max-width: $md6) {
        @include hide-item;
      }
    }
  }

  &__label {
    text-transform: uppercase;
    @include adaptiveValue('font-size', 12, 11);
    @include adaptiveValue('line-height', 12, 15);
    font-weight: 700;
    letter-spacing: 1.92px;
    color: var(--teal-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 7, 4);
    }
  }

  &__link {
    display: block;
    width: 100%;
    text-align: left;
    background: transparent;

    @include adaptiveValue('padding-top', 7, 4);
    @include adaptiveValue('padding-bottom', 7, 4);
    @include adaptiveValue('font-size', 14, 13);
    font-weight: 400;
    line-height: 1;
    color: var(--border-dark-color);
    transition: all 0.3s ease 0s;
    &.router-link-active {
      color: var(--primary-color);
      font-weight: 700;
      pointer-events: none;
    }
    @media (any-hover: hover) {
      &:hover {
        color: var(--primary-color);
      }
    }
  }

  &__body {
    display: flex;
    column-gap: 20px;
    row-gap: 15px;
    justify-content: space-between;
    @media (min-width: $md8) {
      @include adaptiveValue('padding-top', 24, 18);
      @include adaptiveValue('padding-bottom', 40, 18);
      border-bottom: 2px solid var(--border-primary-color);
    }
    @media (max-width: $md8) {
      flex-direction: column;
      gap: 18px;
    }
  }

  &__socials {
    display: flex;
    gap: 10px;
    &.hide {
      @include hide-item;
      display: none;
    }
    &-link {
      min-width: 30px;
      height: 30px;
      transition: transform 0.3s ease 0s;
      transform: scale(1);
      @media (any-hover: hover) {
        &:hover {
          transform: scale(1.03);
        }
      }
    }
  }

  &__static {
    display: flex;
    flex-wrap: wrap;
    column-gap: 10px;
    &-link {
      width: fit-content;
      @include adaptiveValue('padding-top', 7, 4);
      @include adaptiveValue('padding-bottom', 7, 4);
      @include adaptiveValue('font-size', 13, 11);
      @include adaptiveValue('line-height', 18, 15);
      font-weight: 400;
      color: var(--muted-color);
      transition: all 0.3s ease 0s;
      &.router-link-active {
        color: var(--primary-color);
        font-weight: 700;
        pointer-events: none;
      }
      @media (any-hover: hover) {
        &:hover {
          color: var(--primary-color);
        }
      }
    }
  }

  &__bottom {
    @include adaptiveValue('padding-top', 24, 18);
    display: flex;
    column-gap: 20px;
    row-gap: 15px;
    justify-content: space-between;
    @media (max-width: $md8) {
      padding-top: 11px;
    }
  }
  &__box {
  }
  &__copy {
    @include adaptiveValue('font-size', 13, 11);
    @include adaptiveValue('line-height', 18, 15);
    color: var(--muted-color);
    @media (min-width: $md8) {
      display: inline;
      margin-right: 5px;
    }
    @media (max-width: $md8) {
      padding-top: 7px;
      white-space: nowrap;
    }
  }

  &__requisites {
    @include adaptiveValue('font-size', 13, 11);
    @include adaptiveValue('line-height', 18, 19);
    color: var(--third-color);
    max-width: 400px;
    display: inline;
  }

  &__text {
    @include adaptiveValue('font-size', 13, 11);
    @include adaptiveValue('line-height', 18, 15);
    color: var(--muted-color);
    @media (max-width: $md8) {
      @include hide-item;
    }
  }
}
</style>
