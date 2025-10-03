<script setup>
import { RouterLink } from 'vue-router'
import { useSocialsStore } from '@/stores/socials'
import { useSettingsStore } from '@/stores/settings'
import { useStaticStore } from '@/stores/static'
import UiText, { TextAlign, TextWeight } from './shared/UiText.vue'

const socialsStore = useSocialsStore()
const settingsStore = useSettingsStore()
const staticStore = useStaticStore()
const url = import.meta.env.VITE_APP_DOMAIN
</script>

<template>
  <footer class="footer">
    <div class="footer__top top _cnt">
      <div class="top__links">
        <RouterLink
          v-for="(item, i) in staticStore.static"
          :to="'/static/' + item.slug"
          :key="i"
          class="top__link"
          >{{ item.title }}</RouterLink
        >
        <RouterLink to="/pricing" class="top__link">{{ $t('Pricing') }}</RouterLink>
      </div>
      <div class="top__about">
        <RouterLink to="/" class="top__company">
          <div class="top__logo _ibg-contain">
            <img alt="Logo icon" class="img" src="@/static/images/icons/logo.webp" />
          </div>
          <UiText class="top__name" :align="TextAlign.CENTER" text="[Your Company Name]" />
        </RouterLink>
        <UiText
          class="top__description"
          :align="TextAlign.CENTER"
          :text="settingsStore.settings.requisites"
        />
      </div>
      <div class="top__contacts">
        <UiText class="top__label" :weight="TextWeight.BOLD" :text="$t('Contact us:')" />
        <a class="top__email" :href="'mailto:' + settingsStore.settings.support_email">{{
          settingsStore.settings.support_email
        }}</a>
        <ul class="top__socials" v-if="socialsStore.socials">
          <li
            v-for="link in socialsStore.socials"
            :key="link.image"
            class="top__social _ibg-contain"
          >
            <a class="top__social-link" :href="link.url" target="_blank">
              <img :src="url + `storage/${link.image}`" :alt="link.link" class="img" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;
@use '@/styles/media' as *;

.footer {
  @include adaptiveValue('padding-top', 120, 20, 1470, 992, 1);
  &__top {
    @include adaptiveValue('padding-bottom', 50, 15, 1470, 992, 1);
  }
  &__bottom {
  }
}

.top {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  @media (max-width: $md3) {
    flex-wrap: wrap;
  }
  @media (max-width: $md4) {
    gap: 15px;
  }
  &__links {
    @include adaptiveValue('padding-top', 20, 0, 1470, 768, 1);
    display: flex;
    flex-direction: column;
    gap: 5px;
    @media (min-width: $md3) {
      min-width: 200px;
    }
    @media (max-width: $md3) {
      order: 2;
      flex: 0 1 calc(50% - 10px);
    }
    @media (max-width: $md4) {
      flex: 1 1 100%;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 10px;
    }
  }
  &__link {
    display: inline-flex;
    padding: 5px 0px;
    color: var(--primary-color);
    transition: color 0.3s ease 0s;
    font-weight: 700;
    font-family: var(--font-family-sans);
    @media (any-hover: hover) {
      &:hover {
        color: var(--link-color);
      }
    }
    @media (max-width: $md4) {
      flex: 0 1 calc(50% - 5px);
    }
  }
  &__about {
    @media (min-width: $md3) {
      max-width: 520px;
    }
    @media (max-width: $md3) {
      order: 1;
      flex: 1 1 100%;
    }
  }
  &__company {
    display: flex;
    flex-direction: column;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 27, 10);
    }
  }
  &__logo {
    margin: 0 auto;
    width: 40px;
    height: 46px;
    &:not(:last-child) {
      margin-bottom: 13px;
    }
  }
  &__name {
    font-family: var(--font-family-red);
    text-transform: uppercase;
  }
  &__description {
  }
  &__contacts {
    @media (max-width: $md3) {
      order: 3;
      flex: 0 1 calc(50% - 10px);
    }
    @media (max-width: $md4) {
      flex: 1 1 100%;
    }
  }
  &__label {
    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }
  &__email {
    padding: 5px 0px;
    color: var(--link-color);
    text-decoration: underline;
    transition: color 0.3s ease 0s;
    font-family: var(--font-family-sans);
    @media (any-hover: hover) {
      &:hover {
        color: var(--link-hober-color);
      }
    }
    display: inline-block;
    &:not(:last-child) {
      margin-bottom: 15px;
    }
  }
  &__socials {
    display: flex;
    gap: 14px;
    @include adaptiveValue('padding-top', 20, 0, 1470, 768, 1);
    min-width: 200px;
  }
  &__social {
    width: 30px;
    height: 30px;
    background-color: var(--bg-primary-color-inverted);
    border-radius: var(--border-radius-secondary);
    transition: background-color 0.3s ease 0s;
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--hint-color);
      }
    }
  }
  &__social-link {
  }
}

.bottom {
  min-height: 45px;
  padding: 10px 0px;
  background-color: var(--bg-fourth-color);
  display: flex;
  align-items: center;

  &__inner {
    flex: 1 1 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 30px;
  }
  &__text {
  }
  &__images {
    display: flex;
    gap: 10px;
  }
  &__image {
    width: 30px;
    height: 20px;
  }
}
</style>
