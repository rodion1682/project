<script setup>
import { useRouter } from 'vue-router'

import BaseButton from '@/components/ui/BaseButton.vue'
import SvgIcon from '@/components/ui/icons/SvgIcon.vue'

import { SearchIcon } from '@/components/ui/icons'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push('/')
}
</script>

<template>
  <main class="not-found-page">
    <div class="not-found-page__container _cnt-home">
      <div class="not-found-page__content">
        <div class="not-found-page__icon-box">
          <SvgIcon :icon="SearchIcon" class="not-found-page__icon" />
        </div>

        <div class="not-found-page__code">404</div>

        <h1 class="not-found-page__title">
          {{ $t('Page not found') }}
        </h1>

        <p class="not-found-page__text">
          {{ $t('The page you are looking for does not exist.') }}
        </p>

        <div class="not-found-page__actions">
          <BaseButton class="not-found-page__button" @click="goHome" variant="dark-secondary">
            {{ $t('Back to home') }}
          </BaseButton>

          <BaseButton variant="bordered" class="not-found-page__button" @click="goBack">
            {{ $t('Go back') }}
          </BaseButton>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.not-found-page {
  width: 100%;
  min-width: 0;

  flex: 1 1 auto;

  display: flex;
  align-items: center;

  @include header-indent;
  @include adaptiveValue('padding-top', 70, 36);
  @include adaptiveValue('padding-bottom', 100, 48);

  &__container {
    width: 100%;
    min-width: 0;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__content {
    position: relative;

    width: 100%;

    display: flex;
    align-items: center;
    flex-direction: column;

    margin-left: auto;
    margin-right: auto;

    border: 2px solid var(--border-primary-color);

    @include adaptiveValue('max-width', 620, 340);
    @include adaptiveValue('border-radius', 14, 10);
    @include adaptiveValue('padding-top', 64, 36);
    @include adaptiveValue('padding-right', 50, 18);
    @include adaptiveValue('padding-bottom', 64, 36);
    @include adaptiveValue('padding-left', 50, 18);

    background-color: var(--bg-secondary-color);

    text-align: center;

    overflow: hidden;
  }

  &__icon-box {
    display: flex;
    align-items: center;
    justify-content: center;

    border: 2px solid var(--hint-primary-color);
    border-radius: 14px;

    color: var(--hint-primary-color);

    @include adaptiveValue('width', 64, 48);
    @include adaptiveValue('height', 64, 48);
    @include adaptiveValue('margin-bottom', 20, 16);
  }

  &__icon {
    flex: 0 0 auto;

    @include adaptiveValue('width', 25, 19);
    @include adaptiveValue('height', 25, 19);
  }

  &__code {
    color: var(--hint-primary-color);

    font-family: var(--font-gabarito);
    font-weight: 700;
    line-height: 0.9;

    @include adaptiveValue('font-size', 88, 62);
    @include adaptiveValue('margin-bottom', 18, 14);
  }

  &__title {
    margin-top: 0;

    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-weight: 700;
    line-height: 1.15;

    @include adaptiveValue('font-size', 30, 24);
    @include adaptiveValue('margin-bottom', 10, 8);
  }

  &__text {
    width: 100%;

    margin-top: 0;

    color: var(--seconday-color);

    @include adaptiveValue('max-width', 440, 300);
    @include adaptiveValue('font-size', 14, 13);
    @include adaptiveValue('line-height', 22, 20);
    @include adaptiveValue('margin-bottom', 28, 20);
  }

  &__actions {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: center;

    @include adaptiveValue('gap', 12, 8);
  }

  &__button {
    width: fit-content;

    @include adaptiveValue('min-width', 160, 140);
  }

  @media (max-width: $md6) {
    &__actions {
      flex-direction: column;
    }

    &__button {
      width: 100%;
    }
  }
}
</style>
