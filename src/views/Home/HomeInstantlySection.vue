<script setup>
import UiText, {
  TextSize,
  TextWeight,
  TextFont,
  TextTheme,
  TextAlign,
} from '@/components/shared/UiText.vue'
</script>

<template>
  <section class="instantly">
    <div class="instantly__top">
      <UiText
        class="instantly__title"
        :size="TextSize.H2"
        :font="TextFont.RED"
        :align="TextAlign.CENTER"
        :title="$t('From Text to 3D')"
        :titleAfter="$t('— Instantly')"
      />
      <UiText
        class="instantly__text"
        :theme="TextTheme.SECONDARY"
        :align="TextAlign.CENTER"
        :text="$t('Forget complex tools and hours of sculpting. With [Your Tool Name], you can:')"
      />
    </div>
    <div class="instantly__items">
      <div class="instantly__item">
        <UiText
          class="instantly__label"
          :size="TextSize.H4"
          :weight="TextWeight.BOLD"
          :font="TextFont.RED"
          :align="TextAlign.CENTER"
          :title="$t('Generate Models from Text')"
        />
        <UiText
          class="instantly__content"
          :theme="TextTheme.SECONDARY"
          :align="TextAlign.CENTER"
          :text="
            $t(
              'Type a prompt like “a sci-fi drone” or “a fantasy castle,” and get a fully textured 3D model — instantly.',
            )
          "
        />
      </div>
      <div class="instantly__item">
        <UiText
          class="instantly__label"
          :size="TextSize.H4"
          :weight="TextWeight.BOLD"
          :font="TextFont.RED"
          :align="TextAlign.CENTER"
          :title="$t('Customize with Ease')"
        />
        <UiText
          class="instantly__content"
          :theme="TextTheme.SECONDARY"
          :align="TextAlign.CENTER"
          :text="
            $t('Edit geometry, materials, colors, and lighting with intuitive, visual controls.')
          "
        />
      </div>
      <div class="instantly__item">
        <UiText
          class="instantly__label"
          :size="TextSize.H4"
          :weight="TextWeight.BOLD"
          :font="TextFont.RED"
          :align="TextAlign.CENTER"
          :title="$t('Export Anywhere')"
        />
        <UiText
          class="instantly__content"
          :theme="TextTheme.SECONDARY"
          :align="TextAlign.CENTER"
          :text="
            $t(
              'Download in formats like OBJ, FBX, or GLB. Use your models in Unity, Blender, Unreal, or your 3D pipeline of choice.',
            )
          "
        />
      </div>
    </div>
    <div class="instantly__image-left _ibg-contain">
      <img src="@/static/images/home/instantly-letf.webp" />
    </div>
    <div class="instantly__image-right _ibg-contain">
      <img src="@/static/images/home/instantly-right.webp" />
    </div>
    <div class="instantly__background-grid _ibg-contain">
      <img src="@/static/images/home/instantly-grid-background.webp" />
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;
@use '@/styles/media' as *;
@use '@/styles/classes' as *;

.instantly {
  position: relative;
  @include adaptiveValue('padding-top', 140, 20);
  @include adaptiveValue('padding-bottom', 140, 20);
  &__top {
    position: relative;
    z-index: var(--base-z-index);
    padding: 0px 20px;
    background-color: var(--overlay-bg-primary);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 45, 15);
    }
  }
  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 31, 20);
    }
  }
  &__text {
  }
  &__items {
    position: relative;
    z-index: var(--base-z-index);
    display: flex;
    justify-content: space-between;
    @include adaptiveValue('gap', 20, 10, 1470, 992, 1);
    @media (max-width: $md3) {
      flex-wrap: wrap;
      margin: 0 -10px;
    }
    @media (max-width: $md3) {
      flex-wrap: wrap;
      gap: 5px;
    }
  }
  &__item {
    flex: 0 1 33.333%;
    @include adaptiveValue('padding-left', 50, 15, 1470, 992, 1);
    @include adaptiveValue('padding-right', 50, 15, 1470, 992, 1);
    @include adaptiveValue('padding-top', 37, 15, 1470, 992, 1);
    @include adaptiveValue('padding-bottom', 37, 15, 1470, 992, 1);
    border-radius: var(--border-radius);
    border: 1px solid var(--third-color);
    background-color: var(--blur-bg-color);
    backdrop-filter: blur(var(--blur-amount));
    -webkit-backdrop-filter: blur(var(--blur-amount));
    @media (max-width: $md3) {
      padding-left: 10px;
      padding-right: 10px;
      &:not(:last-child) {
        flex: 0 1 calc(50% - (5px));
      }
      &:last-child {
        flex: 1 1 100%;
      }
    }
    @media (max-width: $md4) {
      &:not(:last-child) {
        flex: 1 1 100%;
      }
    }
  }
  &__label {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 23, 15);
    }
  }
  &__content {
  }
  &__image-left {
    position: absolute;
    @include adaptiveValue('width', 469, 300, 1920, 992, 1);
    @include adaptiveValue('top', -120, -90, 1920, 992, 1);
    @include adaptiveValue(' left', -260, -200, 1920, 992, 1);
    padding-bottom: 50%;
    @media (max-width: $md3) {
      @include hide-item;
    }
  }
  &__image-right {
    padding-bottom: 29%;
    position: absolute;
    @include adaptiveValue('width', 416, 250, 1920, 992, 1);
    @include adaptiveValue('right', -300, -150, 1920, 992, 1);
    @include adaptiveValue('bottom', -70, -50, 1920, 992, 1);
    @media (max-width: $md3) {
      @include hide-item;
    }
  }
  &__background-grid {
    position: absolute;
    z-index: -1;
    @include adaptiveValue('top', -120, 10, 1470, 320, 1);
    @include adaptiveValue('left', -260, -10, 1470, 320, 1);
    @include adaptiveValue('width', 788, 300, 1470, 320, 1);
    padding-bottom: 34%;
    @media (max-width: $md3) {
      padding-bottom: 64%;
    }
  }
}
</style>
