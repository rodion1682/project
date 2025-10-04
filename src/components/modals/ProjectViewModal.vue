<script setup>
import { defineProps, defineEmits } from 'vue'
import ModelViewer from '@/components/create/3DModelViewer.vue'
import UiButton, { ButtonThemes } from '@/components/shared/UiButton.vue'
import UiSvgIcon from '@/components/shared/UiSvgIcon.vue'
import CloseIcon from '@/static/images/icons/action/close.svg'
import UiText, { TextSize, TextWeight } from '@/components/shared/UiText.vue'

const props = defineProps({
  asset: Object,
  modelUrl: String,
  modelTitle: String,
})

const emit = defineEmits(['close'])

function close() {
  emit('close')
}
</script>

<template>
  <div class="modal">
    <div class="modal__overlay" @click="close"></div>
    <div class="modal__inner">
      <div class="modal__top">
        <UiText
          class="modal__title"
          :weight="TextWeight.BOLD"
          :size="TextSize.H4"
          :title="modelTitle"
        ></UiText>
        <UiButton class="modal__close" :theme="ButtonThemes.ROTATE" @click="close"
          ><UiSvgIcon><CloseIcon /></UiSvgIcon
        ></UiButton>
      </div>
      <div class="modal__view">
        <div class="modal__view-background _ibg-contain">
          <img src="@/static/images/backgrounds/modal_background.webp" />
        </div>
        <ModelViewer
          :sky="false"
          :model-url="modelUrl"
          :glow="true"
          :orbit-distance="{ min: 3.5, max: 4.5 }"
          :show-grid="false"
          :scene-background="null"
          :asset-id="props.asset?.id"
          extension="glb"
          class="modal__view-model"
        />
      </div>
      <div class="modal__controls">
        <div class="modal__control _ibg-contain">
          <img src="@/static/images/icons/project-model/rotate.webp" />
        </div>
        <div class="modal__control _ibg-contain">
          <img src="@/static/images/icons/project-model/zoom.webp" />
        </div>
        <div class="modal__control _ibg-contain">
          <img src="@/static/images/icons/project-model/click.webp" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;
@use '@/styles/media' as *;

.modal {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: var(--modal-z-index);
  &__overlay {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: var(--modal-bg-overlay);
  }
  &__inner {
    position: absolute;
    background-color: var(--primary-color-inverted);
    border-radius: var(--border-radius);
    overflow: hidden;
    height: 80%;
    @include adaptiveValue('padding-top', 30, 30);
    @include adaptiveValue('padding-bottom', 35, 35);
    @include adaptiveValue('padding-left', 44, 10, 1470, 768, 1);
    @include adaptiveValue('padding-right', 44, 10, 1470, 768, 1);
    display: flex;
    flex-direction: column;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    @media (min-width: $md2) {
      width: 80%;

      max-width: 822px;
    }
    @media (max-width: $md2) {
      width: 100%;
      bottom: 0px;
    }
  }
  &__top {
    display: flex;
    justify-content: space-between;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 37, 37);
    }
  }
  &__title {
    padding-right: 30px;
  }
  &__close {
    position: absolute;
    right: 15px;
    top: 15px;
    z-index: var(--base-z-index);
  }
  &__view {
    position: relative;
    width: 100%;
    height: 73%;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 37, 37);
    }
    &-background {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
    }
    &-model {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      z-index: var(--base-z-index);
    }
  }
  &__model {
  }
  &__controls {
    margin-top: auto;
    justify-content: center;
    display: flex;
    align-items: center;
    @include adaptiveValue('gap', 35, 35);
  }
  &__control {
    width: 24px;
    height: 24px;
  }
}
</style>
