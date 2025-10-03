<script setup>
import { defineProps, defineEmits, ref } from 'vue'
import ModelViewer from '@/components/create/3DModelViewer.vue'

const props = defineProps({
  asset: Object,
  modelUrl: String,
})

const emit = defineEmits(['close'])
const fullScreen = ref(false)

function close() {
  emit('close')
}
</script>

<template>
  <div
    :class="{ 'full-screen-mode': fullScreen }"
    class="modal project-view-modal flex justify-center items-center"
  >
    <div class="overlay" @click="close"></div>
    <div :class="{ 'full-screen-mode': fullScreen }" class="modal-wrapper">
      <!-- <div class="full-screen flex items-center" @click="fullScreen = !fullScreen">
        <img alt="Full screen" class="img" src="@/assets/images/full_screen.svg" />
      </div> -->
      <div class="close flex items-center" @click="close">
        <img alt="Close icon" class="img" src="@/assets/imgs/close.svg" />
      </div>
      <div class="modal-form-container">
        <div class="flex flex-col justify-center text-center">
          <ModelViewer
            :sky="false"
            :model-url="modelUrl"
            :glow="true"
            :orbit-distance="{ min: 3.5, max: 4.5 }"
            :show-grid="false"
            :scene-background="null"
            :asset-id="props.asset?.id"
            extension="glb"
          />
          <div class="controls">
            <div class="control">
              <img src="@/assets/imgs/rotate.svg" alt="" />
            </div>
            <div class="control">
              <img src="@/assets/imgs/zoom.svg" alt="" />
            </div>
            <div class="control">
              <img src="@/assets/imgs/click.svg" alt="" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
