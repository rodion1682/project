<script setup></script>

<template>
  <div class="what">
    <div class="what__container _cnt-home">
      <div class="what__title _h4">
        {{ $t('What people buy here') }}
      </div>
      <div class="what__items">
        <div class="what__item">
          <div class="what__hint">
            {{ $t('New') }}
          </div>
          <div class="what__label">{{ $t('Day-one launches') }}</div>
          <div class="what__value">
            {{
              $t(
                'Reserve upcoming releases at the price they launch at, minus the premium-edition tax.',
              )
            }}
          </div>
        </div>
        <div class="what__item">
          <div class="what__hint">
            {{ $t('Add-ons') }}
          </div>
          <div class="what__label">{{ $t('Expansions and currency') }}</div>
          <div class="what__value">
            {{ $t('Season passes, cosmetic packs and in-game top-ups for what you already play.') }}
          </div>
        </div>
        <div class="what__item">
          <div class="what__hint">
            {{ $t('Curated') }}
          </div>
          <div class="what__label">{{ $t('Small studio picks') }}</div>
          <div class="what__value">
            {{ $t('Highly rated titles that never made it onto the front page.') }}
          </div>
        </div>
        <div class="what__item">
          <div class="what__hint">
            {{ $t('Instant') }}
          </div>
          <div class="what__label">{{ $t('Gift cards') }}</div>
          <div class="what__value">
            {{ $t('Credit for someone else`s account sent as a code the same minute.') }}
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

.what {
  padding-top: 36px;
  &__container {
  }

  &__title {
    &:not(:last-child) {
      margin-bottom: 18px;
    }
  }

  &__items {
  }

  &__item {
    padding: 20px 22px;
    background-color: var(--bg-secondary-color);
    border: 2px solid var(--border-primary-color);
    border-radius: 14px;
    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }

  &__hint {
    letter-spacing: 1.8px;
    text-transform: uppercase;
    font-size: 10px;
    line-height: 14px;
    color: var(--hint-primary-color);
    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__label {
    font-size: 17px;
    line-height: 21.3px;
    font-weight: 500;
    color: var(--primary-color);
    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__value {
    font-size: 12px;
    line-height: 19.2px;
    color: var(--muted-color);
  }
}
</style>
