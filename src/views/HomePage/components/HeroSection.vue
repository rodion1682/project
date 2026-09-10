<script setup>
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useCategoriesStore } from '@/stores/categories'
import { useCurrStore } from '@/stores/currencies'
import { usePopularStore } from '@/stores/popular'
import { useRegModalStore } from '@/stores/regModal'
import { useSettingsStore } from '@/stores/settings'
import '@splidejs/splide/dist/css/splide.min.css'
const categoriesStore = useCategoriesStore()
const settingsStore = useSettingsStore()

const popularStore = usePopularStore()
const regModalStore = useRegModalStore()
const currStore = useCurrStore()
const authStore = useAuthStore()
</script>

<template>
  <div class="hero">
    <div class="hero__bg _ibg">
      <img src="@/assets/img/hero-bg.png" />
    </div>
    <div class="hero__container _cnt-home">
      <div class="hero__hint">
        {{ $t('Codes land in your inbox') }}
      </div>
      <div class="hero__title _h1">
        {{ $t('Instant access to') }}
        <span>{{ $t('new worlds') }}</span>
      </div>
      <div class="hero__text">
        {{
          $t(
            'Official keys and gift cards for every launcher, delivered the minute your payment clears. Thousands of titles, no queue, no publisher markup.',
          )
        }}
      </div>
      <div class="hero__actions">
        <BaseButton class="hero__action hero__action_shop">{{ $t('Shop now') }}</BaseButton>
        <BaseButton class="hero__action hero__action_catalog" variant="link" icon="arrow">{{
          $t('Browse catalog')
        }}</BaseButton>
      </div>
      <div class="hero__bottom">
        <div class="hero__items">
          <div class="hero__item">
            <div class="hero__label _h6">{{ $t('12,400') }}</div>
            <div class="hero__value">{{ $t('keys in stock') }}</div>
          </div>
          <div class="hero__item">
            <div class="hero__label _h6">{{ $t('60 sec') }}</div>
            <div class="hero__value">{{ $t('average delivery') }}</div>
          </div>
          <div class="hero__item">
            <div class="hero__label _h6">{{ $t('4.8/5') }}</div>
            <div class="hero__value">{{ $t('12k reviews') }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.hero {
  @include header-indent;
  position: relative;
  @include adaptiveValue('padding-top', 50, 25);
  @include adaptiveValue('padding-bottom', 131, 25);
  &__bg {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }

  &__container {
    position: relative;
    z-index: 1;
  }

  &__hint {
    color: var(--primary-color);
    text-transform: uppercase;
    letter-spacing: 1.92px;
    font-weight: 700;
    font-size: 12px;
    line-height: 16px;
    padding: 8px 16px;
    background-color: var(--cyan-color);
    border-radius: 8px;
    transform: rotate(-2deg);
    width: fit-content;
    &:not(:last-child) {
      margin-bottom: 15px;
    }
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 17, 15);
    }
  }

  &__text {
    max-width: 660px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 18, 15);
    }
  }

  &__actions {
    display: flex;
    gap: 20px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 15);
    }
  }
  &__action {
    &_shop {
      min-width: 155px;
    }
    &_catalog {
      min-width: fit-content;
    }
  }

  &__bottom {
    display: flex;
    @include adaptiveValue('gap', 18, 10);
  }

  &__items {
    display: flex;
    @include adaptiveValue('gap', 14, 10);
  }

  &__item {
    @include adaptiveValue('padding-top', 13, 15);
    @include adaptiveValue('padding-left', 20, 15);
    @include adaptiveValue('padding-bottom', 13, 15);
    @include adaptiveValue('padding-right', 20, 15);
    background-color: var(--bg-tenth-color);
    border: 2px solid var(--border-primary-color);
    @include adaptiveValue('border-radius', 12, 10);
  }

  &__label {
    &:not(:last-child) {
      margin-bottom: 2px;
    }
  }

  &__value {
    text-transform: uppercase;
    letter-spacing: 1.54px;
    font-size: 11px;
    line-height: 15px;
    font-weight: 400;
    color: var(--seconday-color);
  }
}
</style>
