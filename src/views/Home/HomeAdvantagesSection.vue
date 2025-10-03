<script setup>
import UiText, { TextSize, TextWeight, TextFont, TextTheme } from '@/components/shared/UiText.vue'
</script>

<template>
  <section class="advantages">
    <div class="advantages__item">
      <UiText
        class="advantages__title"
        :size="TextSize.H4"
        :weight="TextWeight.BOLD"
        :font="TextFont.RED"
        :title="$t('Speed Meets Simplicity')"
      />
      <UiText
        class="advantages__text"
        :theme="TextTheme.SECONDARY"
        :text="$t('Go from concept to 3D model in minutes — no complex tools required. ')"
      />
    </div>
    <div class="advantages__item">
      <UiText
        class="advantages__title"
        :size="TextSize.H4"
        :weight="TextWeight.BOLD"
        :font="TextFont.RED"
        :title="$t('No Skills Needed')"
      />
      <UiText
        class="advantages__text"
        :theme="TextTheme.SECONDARY"
        :text="$t('AI handles the heavy lifting. You focus on the idea.')"
      />
    </div>
    <div class="advantages__item">
      <UiText
        class="advantages__title"
        :size="TextSize.H4"
        :weight="TextWeight.BOLD"
        :font="TextFont.RED"
        :title="$t('Work Anywhere')"
      />
      <UiText
        class="advantages__text"
        :theme="TextTheme.SECONDARY"
        :text="$t('Create from your browser — on desktop, laptop, or tablet.')"
      />
    </div>
    <div class="advantages__item">
      <UiText
        class="advantages__title"
        :size="TextSize.H4"
        :weight="TextWeight.BOLD"
        :font="TextFont.RED"
        :title="$t('Always Improving')"
      />
      <UiText
        class="advantages__text"
        :theme="TextTheme.SECONDARY"
        :text="
          $t('Our AI engine gets smarter with every update, unlocking new creative possibilities.')
        "
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;
@use '@/styles/media' as *;

.advantages {
  background-color: var(--bg-secondary-color);
  border-radius: var(--border-radius);
  @include adaptiveValue('padding-left', 18, 0, 1470, 992, 1);
  @include adaptiveValue('padding-right', 18, 0, 1470, 992, 1);
  display: flex;
  position: relative;
  z-index: var(--base-z-index);
  @media (max-width: $md2) {
    flex-wrap: wrap;
  }
  @media (max-width: $md3) {
    margin: 0px -10px;
  }
  &__item {
    flex: 0 1 25%;
    position: relative;
    @include adaptiveValue('padding-top', 60, 15, 1470, 992, 1);
    @include adaptiveValue('padding-bottom', 60, 15, 1470, 992, 1);
    @include adaptiveValue('padding-left', 40, 15, 1470, 992, 1);
    @include adaptiveValue('padding-right', 40, 15, 1470, 992, 1);
    @media (max-width: $md3) {
      padding: 15px 10px;
    }
    @media (min-width: $md2) {
      &:not(:last-child) {
        border-right: 1px solid var(--bg-primary-color);
      }
    }
    @media (max-width: $md2) {
      &:nth-child(1),
      &:nth-child(3) {
        border-right: 1px solid var(--bg-primary-color);
      }
      &:nth-child(1),
      &:nth-child(2) {
        border-bottom: 1px solid var(--bg-primary-color);
      }
    }
    @media (max-width: $md2) {
      flex: 0 1 50%;
    }
    @media (max-width: $md4) {
      flex: 1 1 100%;
      &:nth-child(1),
      &:nth-child(3) {
        border-right: none;
      }
      &:not(:last-child) {
        border-bottom: 1px solid var(--bg-primary-color);
      }
    }
  }
  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 10);
    }
  }
  &__text {
  }
}
</style>
