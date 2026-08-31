<template>
  <div class="about">
    <div class="about__bg _ibg">
      <img src="@/assets/img/about-bg.jpg" />
    </div>
    <div class="about__decor _ibg-contain">
      <img src="@/assets/img/about-decor-left.png" />
    </div>
    <div class="about__inner _cnt-home">
      <div class="about__top">
        <div class="about__subtitle _h5">{{ $t('Ancient History') }}</div>
        <div class="about__title _h1">
          {{ $t('About') }}
          <span>{{ $t('Aroraium') }}</span>
        </div>
        <div class="about__text">
          {{
            $t(
              'The last great civilization of magic. Built upon knowledge, stone, and the boundless power of the arcane.',
            )
          }}
        </div>
      </div>
      <div class="about__iamge _ibg-contain">
        <img src="@/assets/img/heros-decor-top.png" />
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.about {
  @include adaptiveValue('margin-top', 67, 50, 1840, 1370, 1);
  @include adaptiveValue('padding-top', 120, 25);
  @include adaptiveValue('padding-bottom', 238, 75);
  position: relative;
  &__bg {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    pointer-events: none;
  }

  &__decor {
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: 1;

    width: 23vw;
    height: 13vw;

    transform: translateY(10%);
  }

  &__inner {
    position: relative;
    z-index: 1;

    text-align: center;
  }
  &__top {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 96, 15);
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
      @include adaptiveValue('margin-bottom', 64, 15);
    }
  }

  &__text {
    max-width: 584px;

    margin-right: auto;
    margin-left: auto;
  }

  &__iamge {
    width: 15vw;
    height: 1.4vw;

    margin: 0 auto;
  }
}
</style>
