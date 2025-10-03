<template>
  <div class="modal ready-modal flex justify-center items-center">
    <div class="overlay" @click="readyModalStore.closeModal()" />
    <div class="modal-wrapper">
      <div class="modal-form-container text-center flex justify-between">
        <div class="wrapper flex items-center justify-between">
          <div class="left">
            <div class="text text-64">
              <b>{{ $t('Your 3D Model is ready!') }}</b>
            </div>
            <div class="flex buttons flex-wrap">
              <button @click="modelStore.downloadModel()" class="button w-250">{{ $t('Download') }}</button>
              <button @click="handleRegenerate" class="button w-250 button2">{{ $t('Regenerate') }}</button>
              <RouterLink class="button w-250 button2" :to="{name: 'home'}">{{ $t('Return to main') }}</RouterLink>
            </div>
          </div>
          <div class="right">
<!--            <img alt="model 2 image" class="img" src="@/assets/images/model2.webp" />-->
            <div class="model-wrapper">
            <ModelViewer :show-grid="true" :scene-background="null" :asset-id="generatedModel?.id" extension="glb" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import ModelViewer from '../components/create/3DModelViewer.vue';
import { useReadyModalStore } from '@/stores/readyModal'
import { useModelGeneratorStore } from '@/stores/model'
import { storeToRefs } from 'pinia'

const readyModalStore = useReadyModalStore()
const modelStore = useModelGeneratorStore()
const {isReadyForDownload, generatedModel} = storeToRefs(modelStore)

function handleRegenerate() {
  modelStore.updateInitialValuesFromModel()

  generatedModel.value = null
  isReadyForDownload.value = false
}
</script>

