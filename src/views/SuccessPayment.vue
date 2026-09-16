<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { useSettingsStore } from '@/stores/settings'

import BaseButton from '@/components/ui/BaseButton.vue'
import Breadcrumbs from '@/components/ui/Breadcrumbs.vue'

const router = useRouter()
const settingsStore = useSettingsStore()

const supportEmail = computed(() => {
  return settingsStore?.settings?.support_email || ''
})

const breadcrumbs = computed(() => [
  {
    title: 'Home',
    link: '/',
  },
  {
    title: 'Payment successful',
  },
])

const goToOrders = () => {
  router.push('/profile/orders')
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <main class="success-payment">
    <div class="success-payment__container _cnt-home">
      <Breadcrumbs :items="breadcrumbs" class="success-payment__breadcrumbs" />

      <div class="success-payment__content">
        <div class="success-payment__icon">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12.5L9.5 17L19 7.5"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>

        <div class="success-payment__label">
          {{ $t('Payment successful') }}
        </div>

        <h1 class="success-payment__title">
          {{ $t('Thank you for your purchase!') }}
        </h1>

        <p class="success-payment__text">
          {{
            $t(
              'Your payment was completed successfully. You can view your purchase and order details in your account.',
            )
          }}
        </p>

        <p v-if="supportEmail" class="success-payment__support">
          {{ $t('In case of any questions, please contact us at') }}

          <a :href="`mailto:${supportEmail}`" class="success-payment__email">
            {{ supportEmail }}
          </a>
        </p>

        <div class="success-payment__actions">
          <BaseButton class="success-payment__button" @click="goToOrders" variant="dark-secondary">
            {{ $t('View my orders') }}
          </BaseButton>

          <BaseButton variant="bordered" class="success-payment__button" @click="goHome">
            {{ $t('Back to home') }}
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

.success-payment {
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
    flex-direction: column;

    margin-left: auto;
    margin-right: auto;

    border: 2px solid var(--border-primary-color);

    background-color: var(--bg-secondary-color);

    text-align: center;

    @include adaptiveValue('max-width', 640, 340);
    @include adaptiveValue('border-radius', 14, 10);

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

    border: 2px solid var(--hint-primary-color);
    border-radius: 14px;

    color: var(--hint-primary-color);

    @include adaptiveValue('width', 68, 50);
    @include adaptiveValue('height', 68, 50);
    @include adaptiveValue('margin-bottom', 20, 16);

    svg {
      @include adaptiveValue('width', 31, 23);
      @include adaptiveValue('height', 31, 23);
    }
  }

  &__label {
    color: var(--hint-primary-color);

    font-weight: 700;
    text-transform: uppercase;

    @include adaptiveValue('font-size', 12, 10);
    @include adaptiveValue('line-height', 17, 15);
    @include adaptiveValue('letter-spacing', 1.68, 1.4);
    @include adaptiveValue('margin-bottom', 10, 8);
  }

  &__title {
    max-width: 500px;

    margin-top: 0;

    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-weight: 700;
    line-height: 1.15;

    @include adaptiveValue('font-size', 32, 24);
    @include adaptiveValue('margin-bottom', 12, 10);
  }

  &__text {
    width: 100%;
    max-width: 470px;

    margin-top: 0;

    color: var(--seconday-color);

    @include adaptiveValue('font-size', 14, 13);
    @include adaptiveValue('line-height', 22, 20);
    @include adaptiveValue('margin-bottom', 14, 12);
  }

  &__support {
    width: 100%;
    max-width: 470px;

    margin-top: 0;

    color: var(--seconday-color);

    @include adaptiveValue('font-size', 14, 13);
    @include adaptiveValue('line-height', 22, 20);
    @include adaptiveValue('margin-bottom', 28, 22);
  }

  &__email {
    color: var(--hint-primary-color);

    font-weight: 600;

    word-break: break-word;

    transition: opacity 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        opacity: 0.7;
      }
    }
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

    @include adaptiveValue('min-width', 170, 145);
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
