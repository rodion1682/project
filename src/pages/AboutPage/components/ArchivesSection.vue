<template>
  <div class="archives">
    <div class="archives__wrapper">
      <div class="archives__bg _ibg">
        <img src="@/assets/img/archives.jpg" />
      </div>

      <div class="archives__inner _cnt-home">
        <div class="archives__top">
          <div class="archives__subtitle _h5">{{ $t('Knowledge') }}</div>
          <div class="archives__title _h2">
            {{ $t('The Forgotten') }}
            <span>{{ $t('Archives') }}</span>
          </div>
        </div>
        <div class="archives__bottom">
          <div class="archives__content">
            <div class="archives__subtitle _h5">{{ $t('Preservation') }}</div>
            <div class="archives__label _about-page-title">
              {{ $t('Sealed in Stone and Silence') }}
            </div>
            <div class="archives__text">
              <p>
                {{
                  $t(
                    'Before the Fall, the archivists of Aroraium understood that the end was near. In those final days, they worked without sleep — sealing the Grand Libraries beneath seven layers of stone, protecting thousands of volumes against the coming darkness.',
                  )
                }}
              </p>
              <p>
                {{
                  $t(
                    'The archives contain over twelve million manuscripts. Spells from every known school of magic. Histories of civilizations that predate Aroraium itself. Forbidden tomes that record rituals capable of reshaping the world.',
                  )
                }}
              </p>
              <p>
                {{
                  $t(
                    'For three centuries, these archives remained sealed. Today, their gates stand open once more.',
                  )
                }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.archives {
  @include adaptiveValue('margin-top', -261, -71);
  @include adaptiveValue('padding-bottom', 58, 0);

  &__wrapper {
    @include adaptiveValue('padding-top', 342, 25);
    @include adaptiveValue('padding-bottom', 0, 25);
    position: relative;
  }
  &__bg {
    @include adaptiveValue('bottom', 56, 0);
    position: absolute;
    left: 0;

    width: 100%;
    height: 100%;
  }

  &__inner {
    position: relative;
    z-index: 1;
  }

  &__top {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 83, 15);
    }
  }

  &__subtitle {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 15);
    }
  }

  &__title {
  }

  &__bottom {
    @include adaptiveValue('border-radius', 10, 6);
    @include adaptiveValue('margin-bottom', -58, 0);
    position: relative;

    padding: 5px;

    border: 1px solid var(--border-secondary-color);
    background-color: var(--bg-fourth-color);

    text-align: center;
    @media (max-width: $md8) {
      margin-right: -10px;
      margin-left: -10px;
    }
  }

  &__content {
    @include adaptiveValue('padding-top', 56, 10);
    @include adaptiveValue('padding-bottom', 156, 25);

    @include adaptiveValue('border-radius', 10, 6);
    padding-right: 10px;
    padding-left: 10px;

    border: 1px solid var(--border-secondary-color);
    background-color: var(--bg-fourth-color);
  }

  &__label {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 46, 15);
    }
  }

  &__text {
    max-width: 696px;

    margin-right: auto;
    margin-left: auto;
    p {
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 20, 10);
      }
    }
  }
}
</style>
