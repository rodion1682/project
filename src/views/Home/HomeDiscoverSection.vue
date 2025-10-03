<script setup>
import { defineEmits, defineProps } from 'vue'
import UiText, { TextSize, TextFont } from '@/components/shared/UiText.vue'
import UiLink, { LinkTheme } from '@/components/shared/UiLink.vue'
import UiButton, { ButtonThemes } from '@/components/shared/UiButton.vue'
import UiSvgIcon from '@/components/shared/UiSvgIcon.vue'
import RotateIcon from '@/static/images/home/rotation.svg'

const props = defineProps({
  onStart: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['open-model'])

const open = (url, title) => emit('open-model', url, title)
</script>

<template>
  <section class="discover">
    <div class="discover__wrapper">
      <div class="discover__inner">
        <div class="discover__top">
          <UiText
            class="discover__title"
            :size="TextSize.H2"
            :font="TextFont.RED"
            :titleBefore="$t('Discover')"
            :title="$t('What Others Are Creating')"
          />
          <div class="discover__text">
            <UiText :text="$t('Browse inspiring models made by our community of creators.')" />
          </div>
          <UiLink
            class="discover__link"
            href="#"
            :theme="LinkTheme.BTN_PRIMARY"
            @click.prevent="props.onStart"
          >
            {{ $t('Start Creating Now') }}
          </UiLink>
        </div>

        <div class="discover__items">
          <UiButton class="discover__item" @click="open('/models/1.glb', $t('Cute cat'))">
            <UiButton class="discover__rotate" :theme="ButtonThemes.ROTATE">
              <UiSvgIcon><RotateIcon /></UiSvgIcon>
            </UiButton>
            <div class="discover__image _ibg-contain">
              <img src="@/static/models/preview/01.webp" />
              <UiText class="discover__about" :text="$t('Cute cat')" />
            </div>
          </UiButton>

          <UiButton class="discover__item" @click="open('/models/2.glb', $t('Fluffy rocket'))">
            <UiButton class="discover__rotate" :theme="ButtonThemes.ROTATE">
              <UiSvgIcon><RotateIcon /></UiSvgIcon>
            </UiButton>
            <div class="discover__image _ibg-contain">
              <img src="@/static/models/preview/02.webp" />
              <UiText class="discover__about" :text="$t('Fluffy rocket')" />
            </div>
          </UiButton>

          <UiButton class="discover__item" @click="open('/models/3.glb', $t('Balloon dog'))">
            <UiButton class="discover__rotate" :theme="ButtonThemes.ROTATE">
              <UiSvgIcon><RotateIcon /></UiSvgIcon>
            </UiButton>
            <div class="discover__image _ibg-contain">
              <img src="@/static/models/preview/03.webp" />
              <UiText class="discover__about" :text="$t('Balloon dog')" />
            </div>
          </UiButton>

          <UiButton class="discover__item" @click="open('/models/4.glb', $t('Cacti'))">
            <UiButton class="discover__rotate" :theme="ButtonThemes.ROTATE">
              <UiSvgIcon><RotateIcon /></UiSvgIcon>
            </UiButton>
            <div class="discover__image _ibg-contain">
              <img src="@/static/models/preview/04.webp" />
              <UiText class="discover__about" :text="$t('Cacti')" />
            </div>
          </UiButton>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;
@use '@/styles/media' as *;

.discover {
  overflow: hidden;
  @media (max-width: $md3) {
    margin: 0 -10px;
  }
  &__wrapper {
    background-color: var(--bg-secondary-color);
    border: 1px solid var(--bg-third-color);
    @include adaptiveValue('padding', 30, 15, 1470, 992, 1);
    border-radius: var(--border-radius);
    position: relative;
    &::before,
    &::after {
      content: '';
      width: 30%;
      height: 40%;
      position: absolute;
      top: 50%;
      transform: translate(-50%, -50%) rotate(45deg);
      background-color: var(--bg-secondary-color);
    }
    &::before {
      left: 0;
      transform: translate(-50%, -50%) rotate(45deg);
    }
    &::after {
      right: 0;
      transform: translate(50%, -50%) rotate(-45deg);
    }
    @media (max-width: $md3) {
      padding: 15px 10px;
    }
  }
  &__inner {
    position: relative;
    z-index: var(--base-z-index);
  }
  &__top {
    display: flex;
    align-items: flex-end;
    @include adaptiveValue('gap', 30, 15);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 75, 20);
    }
    @media (max-width: $md2) {
      flex-wrap: wrap;
    }
  }
  &__title {
    @media (min-width: $md2) {
      max-width: 500px;
    }
  }
  &__link {
    margin-left: auto;
    width: 100%;
    max-width: 220px;
    @media (max-width: $md4) {
      max-width: 300px;
    }
  }
  &__items {
    display: flex;
    @media (max-width: $md3) {
      flex-wrap: wrap;
    }
  }
  &__item {
    flex: 0 1 25%;
    padding-bottom: 24%;
    position: relative;
    background-color: var(--bg-secondary-color);

    @media (max-width: $md1) {
      padding-bottom: 30%;
    }
    @media (max-width: $md2) {
      padding-bottom: 35%;
    }
    @media (max-width: $md3) {
      padding-bottom: 45%;
      flex: 0 1 50%;
    }
    @media (max-width: $md4) {
      padding-bottom: 75%;
      flex: 0 1 100%;
    }
  }
  &__image {
    position: absolute;
    inset: 0;
  }
  &__rotate {
    position: absolute;
    top: 0;
    left: 0;
  }
  &__about {
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0);
    bottom: 0;
    width: 100%;
    padding: 5px 10px;
    background-color: var(--overlay-bg-secondary);
    display: flex;
    justify-content: center;
  }
}
</style>
