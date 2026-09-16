<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import Breadcrumbs from '@/components/ui/Breadcrumbs.vue'
import { FailIcon } from '@/components/ui/icons'
import SvgIcon from '@/components/ui/icons/SvgIcon.vue'

const { t } = useI18n()

const breadcrumbs = computed(() => [
  {
    title: t('Home'),
    link: '/',
  },
  {
    title: t('Payment failed'),
  },
])
</script>

<template>
  <main class="fail-payment">
    <div class="fail-payment__container _cnt-home">
      <Breadcrumbs :items="breadcrumbs" class="fail-payment__breadcrumbs" />

      <div class="fail-payment__content">
        <SvgIcon :icon="FailIcon" class="fail-payment__icon" />

        <h1 class="fail-payment__title">
          {{ $t('Payment failed') }}
        </h1>

        <p class="fail-payment__text">
          {{ $t('Unfortunately, we were unable to process your payment. Please try again later') }}
        </p>
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.fail-payment {
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

  &__content {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    margin-left: auto;
    margin-right: auto;

    border: 2px solid var(--border-primary-color);
    border-radius: 14px;

    background-color: var(--bg-secondary-color);

    text-align: center;

    @include adaptiveValue('max-width', 640, 340);
    @include adaptiveValue('min-height', 360, 280);
    @include adaptiveValue('padding-top', 68, 38);
    @include adaptiveValue('padding-right', 48, 18);
    @include adaptiveValue('padding-bottom', 68, 38);
    @include adaptiveValue('padding-left', 48, 18);
  }

  &__icon {
    flex: 0 0 auto;

    display: flex;
    align-items: center;
    justify-content: center;

    border: 2px solid var(--error-color, #ef5350);
    border-radius: 14px;

    color: var(--error-color, #ef5350);

    @include adaptiveValue('width', 68, 50);
    @include adaptiveValue('height', 68, 50);
    @include adaptiveValue('margin-bottom', 24, 18);

    svg {
      @include adaptiveValue('width', 31, 23);
      @include adaptiveValue('height', 31, 23);
    }
  }

  &__title {
    width: 100%;
    max-width: 500px;

    margin-top: 0;

    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-weight: 700;
    line-height: 1.15;

    @include adaptiveValue('font-size', 32, 24);
    @include adaptiveValue('margin-bottom', 14, 10);
  }

  &__text {
    width: 100%;
    max-width: 480px;

    margin-top: 0;
    margin-bottom: 0;

    color: var(--seconday-color);

    @include adaptiveValue('font-size', 14, 13);
    @include adaptiveValue('line-height', 22, 20);
  }

  @media (max-width: $md6) {
    &__content {
      border-radius: 10px;
    }
  }
}
</style>
