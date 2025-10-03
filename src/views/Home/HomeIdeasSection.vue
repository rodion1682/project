<script setup>
import UiText, { TextSize, TextWeight, TextFont, TextTheme } from '@/components/shared/UiText.vue'
import UiLink, { LinkTheme } from '@/components/shared/UiLink.vue'

const props = defineProps({
  onStart: {
    type: Function,
    required: true,
  },
})
</script>

<template>
  <section class="ideas">
    <div class="ideas__content">
      <UiText
        class="ideas__title"
        :size="TextSize.H1"
        :weight="TextWeight.BOLD"
        :font="TextFont.RED"
        :title="$t('Bring  Your Ideas to Life in 3D')"
      />
      <UiText
        class="ideas__description"
        :theme="TextTheme.SECONDARY"
        :text="
          $t(
            'Welcome to [Your Company Name], where creativity meets cutting-edge technology. Our AI-powered platform makes it easy to generate, customize, and export high-quality 3D assets — no modeling skills needed. Perfect for developers, designers, artists, and anyone with a vision.',
          )
        "
      />
      <UiLink class="ideas__link" href="#" :theme="LinkTheme.BTN_PRIMARY" @click="props.onStart">{{
        $t('Start Creating Now')
      }}</UiLink>
    </div>
    <div class="ideas__image _ibg-contain">
      <img src="@/static/images/home/ideas.webp" />
    </div>
    <div class="ideas__grid-background _ibg">
      <img src="@/static/images/backgrounds/grid-background-primary.webp" />
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;
@use '@/styles/media' as *;
@use '@/styles/classes' as *;

.ideas {
  @include adaptiveValue('padding-top', 150, 20);
  @include adaptiveValue('padding-bottom', 130, 20);
  position: relative;
  &__content {
    position: relative;
    background-color: var(--overlay-bg-primary);
    z-index: var(--secondary-z-index);
    @include adaptiveValue('padding-left', 40, 0, 1470, 768);
    @media (min-width: $md3) {
      padding-right: 20px;
      @include adaptiveValue('max-width', 738, 320);
    }
  }
  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 43, 20);
    }
  }
  &__description {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 31, 15);
    }
  }
  &__link {
    max-width: 222px;
    @media (max-width: $md4) {
      max-width: 300px;
    }
  }
  &__image {
    position: absolute;
    right: 0px;
    z-index: var(--base-z-index);
    @include adaptiveValue('width', 708, 350, 1470, 768, 1);
    @include adaptiveValue('top', 0, 50, 1470, 768, 1);
    padding-bottom: 49%;
    @media (max-width: $md3) {
      @include hide-item;
    }
  }
  &__grid-background {
    position: absolute;
    @include adaptiveValue('top', 0, 100);
    @include adaptiveValue('width', 917, 500);
    @include adaptiveValue('right', -200, 0);
    padding-bottom: 46%;
    @media (max-width: $md3) {
      padding-bottom: 66%;
    }
  }
}
</style>
