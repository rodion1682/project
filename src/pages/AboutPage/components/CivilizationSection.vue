<template>
  <div class="civilization">
    <div class="civilization__inner _cnt-home">
      <div class="civilization__top">
        <div class="civilization__subtitle _h5">
          {{ $t('Origins') }}
        </div>
        <div class="civilization__title _h1">
          {{ $t('The Great ') }}
          <span>{{ $t('Civilization') }}</span>
        </div>
      </div>
      <div class="civilization__body">
        <div class="civilization__content">
          <div class="civilization__subtitle _h5">{{ $t('History') }}</div>
          <div class="civilization__label _about-page-title">
            {{ $t('Before Kingdoms Fell') }}
          </div>
          <div class="civilization__value">
            <p>
              {{
                $t(
                  'Before the first kingdoms rose and before the great empires carved their names into stone, there was Aroraium — the mightiest civilization the world had ever known.',
                )
              }}
            </p>
            <p>
              {{
                $t(
                  'Built across towering plateaus and spanning vast river deltas, its architecture spoke in the language of gods. Marble columns the height of mountains supported palaces that held courts of a thousand scholars. Ancient academies shaped the minds of legendary mages whose names are still whispered in forgotten temples.',
                )
              }}
            </p>
            <p>
              {{
                $t(
                  'Aroraium did not conquer with armies. It conquered with knowledge — the most powerful force ever wielded by mortal hands.',
                )
              }}
            </p>
          </div>
        </div>
        <div class="civilization__iamge _ibg">
          <img src="@/assets/img/civilization.jpg" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.civilization {
  @include adaptiveValue('margin-top', -142, -25);
  @include adaptiveValue('padding-bottom', 182, 0);
  position: relative;
  z-index: 1;
  &__inner {
  }

  &__top {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 64, 15);
    }
  }

  &__subtitle {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 15);
    }
  }

  &__title {
    span {
      display: block;
    }
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 23, 15);
    }
  }

  &__body {
    @include adaptiveValue('padding-top', 52, 12);
    @include adaptiveValue('padding-bottom', 52, 25);
    position: relative;
    @media (max-width: $md4) {
      margin-right: -10px;
      margin-left: -10px;
    }
  }

  &__content {
    position: relative;
    z-index: 1;

    @media (min-width: $md4) {
      max-width: 676px;
    }
    @media (max-width: $md4) {
      padding: 0px 10px;
    }
  }

  &__label {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 23, 15);
    }
  }

  &__value {
    p {
      color: var(--secondary-color);
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 20, 10);
      }
    }
  }

  &__iamge {
    position: absolute;
    top: 0;
    right: 0;

    width: 57.5%;
    height: 100%;
    @media (max-width: $md4) {
      width: 100%;
    }
  }
}
</style>
