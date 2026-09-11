<script setup></script>

<template>
  <div class="launcher">
    <div class="launcher__container _cnt-home">
      <div class="launcher__title _h2">
        {{ $t('From cart to launcher') }}
      </div>
      <div class="launcher__items">
        <div class="launcher__item">
          <div class="launcher__hint">01 / 03</div>
          <div class="launcher__image _ibg">
            <img class="launcher__image-desk" src="@/assets/img/launcher-01.jpg" />
            <img class="launcher__image-mob" src="@/assets/img/launcher-01-mob.jpg" />
            <div class="launcher__gradient _ibg">
              <img src="@/assets/img/launcher-gradient.svg" />
            </div>
          </div>
          <div class="launcher__content">
            <div class="launcher__mob-count">01 / 03</div>
            <div class="launcher__label _h6">
              {{ $t('Choose a title') }}
            </div>
            <div class="launcher__text">
              {{ $t('Filter by launcher, genre or discount, then send it to the cart.') }}
            </div>
          </div>
        </div>
        <div class="launcher__item">
          <div class="launcher__hint">02 / 03</div>
          <div class="launcher__image _ibg">
            <img class="launcher__image-desk" src="@/assets/img/launcher-02.jpg" />
            <img class="launcher__image-mob" src="@/assets/img/launcher-02-mob.jpg" />
            <div class="launcher__gradient _ibg">
              <img src="@/assets/img/launcher-gradient.svg" />
            </div>
          </div>
          <div class="launcher__content">
            <div class="launcher__mob-count">02 / 03</div>
            <div class="launcher__label _h6">
              {{ $t('Pay from your balance') }}
            </div>
            <div class="launcher__text">
              {{
                $t(
                  'Load the balance once and every later order takes two clicks, with no card typed in again.',
                )
              }}
            </div>
          </div>
        </div>
        <div class="launcher__item">
          <div class="launcher__hint">03 / 03</div>
          <div class="launcher__image _ibg">
            <img class="launcher__image-desk" src="@/assets/img/launcher-03.jpg" />
            <img class="launcher__image-mob" src="@/assets/img/launcher-03-mob.jpg" />
            <div class="launcher__gradient _ibg">
              <img src="@/assets/img/launcher-gradient.svg" />
            </div>
          </div>
          <div class="launcher__content">
            <div class="launcher__mob-count">03 / 03</div>
            <div class="launcher__label _h6">
              {{ $t('Activate and play') }}
            </div>
            <div class="launcher__text">
              {{
                $t('Take the code from your library or inbox, paste it into the launcher, done.')
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

.launcher {
  @include adaptiveValue('padding-top', 90, 36);
  &__container {
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 26, 18);
    }
  }

  &__items {
    display: flex;
    @include adaptiveValue('gap', 24, 10);
    @media (max-width: $md4) {
      gap: 10px;
      flex-wrap: wrap;
      justify-content: center;
    }
  }

  &__item {
    flex: 0 1 33.333%;
    border-radius: 14px;
    background-color: var(--bg-secondary-color);
    border: 2px solid var(--border-primary-color);
    position: relative;
    @media (max-width: $md4) {
      flex: 0 1 calc(50% - 5px);
    }
    @media (max-width: $md6) {
      flex: 1 1 100%;
    }
    @media (max-width: $md8) {
      display: flex;
    }
  }

  &__hint {
    top: 12px;
    left: 13px;
    position: absolute;
    z-index: 3;
    color: var(--primary-color);
    text-transform: uppercase;
    font-weight: 700;
    font-size: 16px;
    line-height: 19px;
    padding: 6px 13px;
    background-color: var(--cyan-color);
    border-radius: 8px;
    font-family: var(--font-gabarito);
    transform: rotate(-3deg);
    width: fit-content;
    @media (max-width: $md8) {
      @include hide-item;
    }
  }

  &__image {
    @media (min-width: $md8) {
      width: 100%;
      padding-bottom: 37%;
    }
    @media (max-width: $md8) {
      width: 33.5%;
      height: 100%;
      border-top-left-radius: 14px;
      border-bottom-left-radius: 14px;
      overflow: hidden;
      min-width: 33.5%;
    }
    &-desk {
      @media (max-width: $md8) {
        @include hide-item;
      }
    }
    &-mob {
      @media (min-width: $md8) {
        @include hide-item;
      }
    }
  }

  &__gradient {
    z-index: 1;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    @media (max-width: $md8) {
      @include hide-item;
    }
  }

  &__content {
    @include adaptiveValue('padding-top', 20, 16);
    @include adaptiveValue('padding-left', 22, 18);
    @include adaptiveValue('padding-bottom', 20, 16);
    @include adaptiveValue('padding-right', 22, 18);
  }

  &__mob-count {
    @media (min-width: $md8) {
      @include hide-item;
    }
    @media (max-width: $md8) {
      font-size: 10px;
      line-height: 14px;
      color: var(--hint-primary-color);
      &:not(:last-child) {
        margin-bottom: 7px;
      }
    }
  }

  &__label {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 10, 7);
    }
    @media (max-width: $md8) {
      font-weight: 500;
      font-family: var(--font-open-sans);
    }
  }

  &__text {
    @include adaptiveValue('font-size', 15, 12);
    @include adaptiveValue('line-height', 25, 19);
    color: var(--muted-color);
  }
}
</style>
