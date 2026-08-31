<template>
  <footer class="footer">
    <div class="footer__inner _cnt">
      <RouterLink :to="{ name: 'HomePage' }" class="footer__logo _ibg-contain">
        <img src="@/assets/img/icons/logo-deck.svg" />
      </RouterLink>
      <div class="footer__bottom">
        <div class="footer__info">
          <div
            v-html="settingsStore.settings?.copyright"
            class="footer__copy"
          />
          <div
            v-html="settingsStore.settings?.requisites"
            class="footer__requisites"
          />
        </div>
        <div class="footer__links">
          <RouterLink to="/about" class="footer__link">
            {{ $t('About Game') }}
          </RouterLink>
          <RouterLink :to="{ name: 'ProductListPage' }" class="footer__link">
            {{ $t('Shop') }}
          </RouterLink>
          <RouterLink :to="{ name: 'FaqPage' }" class="footer__link">
            {{ $t('FAQ') }}
          </RouterLink>
        </div>
        <div class="footer__links">
          <RouterLink
            v-for="page in staticStore.pages"
            :key="page.id"
            :to="page.slug ? `/${page.slug}` : `/static-page/${page.id}`"
            class="footer__link"
          >
            {{ page.title }}
          </RouterLink>
        </div>
        <div class="footer__about">
          <div v-if="staticStore.socialLinks.length" class="footer__socials">
            <a
              v-for="link in staticStore.socialLinks"
              :key="link.id"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="footer__social"
            >
              <img :src="link.image" />
            </a>
          </div>
          <a
            v-if="settingsStore.supportEmail"
            :href="`mailto:${settingsStore.supportEmail || 'support@domain.com'}`"
            class="footer__email"
          >
            <SvgIcon :icon="FooterEmailIcon" class="footer__email-icon" />
            <span>{{ settingsStore.supportEmail }}</span>
          </a>
          <div class="footer__methods">
            <div
              class="footer__method _ibg-contain"
              v-for="(item, i) in settingsStore.settings?.footer_images"
              :key="i"
              :style="{ height: `${item.height}px` }"
            >
              <img :src="item.url" :alt="item.url" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useSettingsStore } from '@/stores/settings'
import { useStaticStore } from '@/stores/static'
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { FooterEmailIcon } from '../icons'
import SvgIcon from '../icons/SvgIcon.vue'

defineOptions({
  name: 'SiteFooter',
})

const staticStore = useStaticStore()
const settingsStore = useSettingsStore()

onMounted(async () => {
  if (staticStore.pages.length === 0) {
    await staticStore.fetchPages()
  }
  if (!settingsStore.settings) {
    await settingsStore.fetchSettings()
  }
  if (!staticStore.socialLinks || staticStore.socialLinks.length === 0) {
    await staticStore.fetchSocialLinks()
  }
})
</script>

<style lang="scss" scoped>
.footer {
  @include adaptiveValue('padding-top', 46, 25);
  @include adaptiveValue('padding-bottom', 46, 25);
  &__inner {
  }
  &__logo {
    display: block;

    width: fit-content;
    min-width: 176px;
    height: 34px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 22, 15);
    }
  }
  &__bottom {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    @media (max-width: $md3) {
      flex-wrap: wrap;
      row-gap: 15px;
    }
  }
  &__info {
    @media (min-width: $md3) {
      max-width: 440px;
    }
    @media (max-width: $md3) {
      flex: 1 1 100%;
    }
  }

  &__copy,
  &__requisites {
    color: var(--secondary-color);
    font-size: 14px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 22, 15);
    }
  }

  &__links {
    display: flex;
    flex-direction: column;
    @media (max-width: $md4) {
      flex: 0 1 calc(50% - 10px);

      margin-right: -10px;
      margin-left: -10px;
    }
  }

  &__link {
    @include adaptiveValue('padding-left', 75, 10, 1370, 992, 1);
    @include adaptiveValue('padding-right', 75, 10, 1370, 992, 1);
    top: 8px;

    width: fit-content;

    padding-top: 8px;
    padding-bottom: 8px;

    color: var(--hint-primary-color);
    font-size: 14px;
    font-weight: 500;
    line-height: 17px;
    white-space: nowrap;

    transition: color 0.3s ease 0s;
    &.router-link-active {
      color: var(--primary-color);

      pointer-events: none;
    }
    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-secondary-color);
      }
    }
  }

  &__about {
    @media (max-width: $md4) {
      flex: 1 1 100%;
    }
  }

  &__socials {
    @include adaptiveValue('gap', 22, 10);
    display: flex;
    justify-content: flex-end;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 15);
    }
  }

  &__social {
    @include adaptiveValue('min-width', 24, 40);
    @include adaptiveValue('height', 24, 40);
    transform: scale(1);
    transition: transform 0.3s ease 0s;
    @media (any-hover: hover) {
      &:hover {
        transform: scale(1.3);
      }
    }
  }

  &__email {
    display: flex;
    justify-content: flex-end;
    gap: 9px;

    width: fit-content;
    width: fit-content;

    margin-left: auto;

    color: var(--hint-secondary-color);
    font-size: 14px;
    font-weight: 500;
    line-height: 17px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 15);
    }
    span {
      border-bottom: 1px solid transparent;

      transition: border 0.3s ease 0s;
    }
    &-icon {
      min-width: 24px;
      height: 24px;

      color: var(--hint-primary-color);
    }
    @media (any-hover: hover) {
      &:hover {
        span {
          border-bottom-color: inherit;
        }
      }
    }
  }

  &__methods {
    @include adaptiveValue('gap', 22, 10);
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  &__method {
    min-width: 47px;
  }
}
</style>
