<template>
  <div class="fall">
    <div class="fall__inner _cnt-home">
      <div class="fall__bg _ibg">
        <img src="@/assets/img/colection-bg.png" />
      </div>
      <div class="fall__subtitle _h5">{{ $t('') }}</div>
      <div class="fall__title _h2">
        {{ $t('The ') }}
        <span>{{ $t('Fall') }}</span>
      </div>
      <div class="fall__text">
        <p>
          {{
            $t(
              'No empire lasts forever — not even the greatest one. What shattered Aroraium was not an invading army, nor a plague, nor a famine. It was the pursuit of knowledge without limit.',
            )
          }}
        </p>
        <p>
          {{
            $t(
              'In the Seventh Age, the Council of Archmages attempted to breach the final seal — a boundary between the mortal world and the infinite arcane void. The ritual lasted forty days. On the forty-first, the sky broke.',
            )
          }}
        </p>
        <p>
          {{
            $t(
              'The great academies crumbled. The libraries were sealed beneath the earth. The five Orders scattered. And the civilization that had stood for four thousand years was swallowed by silence.',
            )
          }}
        </p>
      </div>
      <div class="fall__label _h3">{{ $t('Year 0 — The Shattering') }}</div>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.fall {
  &__inner {
    @include adaptiveValue('padding-top', 166, 85);
    @include adaptiveValue('padding-bottom', 327, 195);
    position: relative;
    z-index: 1;

    text-align: center;
  }
  &__bg {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;

    width: 100%;
    height: 100%;
  }

  &__subtitle {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 15);
    }
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 56, 15);
    }
  }

  &__text {
    max-width: 696px;

    margin-right: auto;
    margin-left: auto;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 64, 15);
    }
    p {
      color: var(--secondary-color);
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 20, 10);
      }
    }
  }

  &__label {
  }
}
</style>
