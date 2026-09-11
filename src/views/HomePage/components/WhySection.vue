<script setup>
import BaseButton from '@/components/ui/BaseButton.vue'
import { useRoute } from 'vue-router'

const router = useRoute()

const goToConcatctPage = () => {
  router.push({ path: '/contact-us' })
}
</script>

<template>
  <div class="why">
    <div class="why__container _cnt-home">
      <div class="why__desk desk">
        <div class="desk__content">
          <div class="desk__title _h2">
            {{ $t('Why YOURKEYS?') }}
          </div>
          <div class="desk__text">
            {{ $t('Five reasons people come back instead of buying from the launcher store.') }}
          </div>
          <BaseButton @click="goToConcatctPage" variant="link" icon="arrow" class="desk__link">{{
            $t('How buying works')
          }}</BaseButton>
        </div>
        <div class="desk__list">
          <div class="desk__item">
            <div class="desk__number">01</div>
            <div class="desk__label _h5">{{ $t('Codes by email in a minute') }}</div>
            <div class="desk__value">
              {{
                $t(
                  'The activation code is in your inbox seconds after checkout. Nothing to download, nobody to wait for.',
                )
              }}
            </div>
          </div>
          <div class="desk__item">
            <div class="desk__number">02</div>
            <div class="desk__label _h5">{{ $t('Every launcher that matters') }}</div>
            <div class="desk__value">
              {{
                $t(
                  'Steam, Epic, Ubisoft Connect, EA app, Xbox, PlayStation and Nintendo, with fresh stock arriving daily.',
                )
              }}
            </div>
          </div>
          <div class="desk__item">
            <div class="desk__number">03</div>
            <div class="desk__label _h5">{{ $t('Prices without the middleman') }}</div>
            <div class="desk__value">
              {{
                $t(
                  'We buy straight from publishers and distributors, so the discount reaches you instead of a reseller.',
                )
              }}
            </div>
          </div>
          <div class="desk__item">
            <div class="desk__number">04</div>
            <div class="desk__label _h5">{{ $t('Support you can actually reach') }}</div>
            <div class="desk__value">
              {{
                $t(
                  'Write to a person, not a form. Activation questions and refunds are handled the same day.',
                )
              }}
            </div>
          </div>
          <div class="desk__item">
            <div class="desk__number">05</div>
            <div class="desk__label _h5">
              {{ $t('A key that works, or your money back') }}
            </div>
            <div class="desk__value">
              {{
                $t(
                  'If a code refuses to activate we replace it or return the amount to your balance.',
                )
              }}
            </div>
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

.why {
  @include adaptiveValue('padding-top', 90, 36);
  &__container {
  }

  &__desk {
  }
}

.desk {
  @media (min-width: $md3) {
    display: flex;
    justify-content: space-between;
    @include adaptiveValue('gap', 70, 20, 1760, 992, 1);
  }
  &__content {
    @media (min-width: $md3) {
      min-width: 390px;
    }
    @media (max-width: $md3) {
      &:not(:last-child) {
        margin-bottom: 20px;
      }
    }
  }

  &__title {
    &:not(:last-child) {
      margin-bottom: 15px;
    }
    @media (max-width: $md8) {
      &:not(:last-child) {
        margin-bottom: 20px;
      }
    }
  }

  &__text {
    font-size: 15px;
    line-height: 25px;
    color: var(--muted-color);
    max-width: 380px;
    &:not(:last-child) {
      margin-bottom: 5px;
    }
    @media (max-width: $md8) {
      @include hide-item;
    }
  }

  &__link {
    padding-left: 0px;
    @media (max-width: $md8) {
      @include hide-item;
    }
  }

  &__list {
    flex: 1 1 auto;
  }

  &__item {
    display: flex;
    gap: 20px;
    border: 2px solid var(--border-primary-color);
    @include adaptiveValue('padding-top', 22, 20);
    @include adaptiveValue('padding-bottom', 22, 20);
    @include adaptiveValue('padding-left', 26, 20);
    @include adaptiveValue('padding-right', 26, 20);
    @media (min-width: $md8) {
      border-radius: 14px;
      background-color: var(--bg-secondary-color);
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 14, 12);
      }
    }
    @media (max-width: 1199.98px) {
      flex-wrap: wrap;
    }
    @media (max-width: $md3) {
      row-gap: 10px;
    }
    @media (max-width: $md8) {
      padding: 18px 0px;
      background-color: transparent;
      border-left: 0px;
      border-right: 0px;
      border-top: 0px;
      border-radius: 0px;
      column-gap: 12px;
      row-gap: 7px;
      align-items: center;
    }
  }

  &__number {
    @media (min-width: $md8) {
      min-width: 38px;
      border-radius: 8px;
      height: 33px;
      width: fit-content;
      color: var(--primary-color);
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--yellow-color);
      font-family: var(--font-gabarito);
      font-weight: 900;
    }
    @media (max-width: $md8) {
      font-size: 11px;
      line-height: 15px;
      color: var(--hint-primary-color);
    }
  }

  &__label {
    @include adaptiveValue('font-size', 20, 16);
    @include adaptiveValue('line-height', 25, 21);

    color: var(--primary-color);
    @media (min-width: $md8) {
      font-family: var(--font-gabarito);
      font-weight: 900;
    }
    @media (min-width: 1199.98px) {
      max-width: 330px;
      width: 100%;
    }
    @media (max-width: $md8) {
      font-weight: 400;
      font-family: var(--font-open-sans);
    }
  }

  &__value {
    @include adaptiveValue('font-size', 15, 13);
    @include adaptiveValue('line-height', 25, 21.5);
    color: var(--muted-color);
    @media (max-width: 1199.98px) {
      flex: 1 1 100%;
    }
    @media (max-width: $md8) {
      padding-left: 29px;
    }
  }
}

</style>
