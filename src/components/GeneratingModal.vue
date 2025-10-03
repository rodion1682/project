<template>
  <div class="modal generating-modal flex justify-center items-center">
    <div class="overlay"/>
    <div class="modal-wrapper">
      <div class="modal-form-container text-center flex flex-col items-center justify-center">
        <div class="text text-64">
          <b>{{ $t('Generating... please wait') }}</b>
        </div>
        <div class="progress">
          <div class="bar" :style="{ width: progress + '%' }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useModelGeneratorStore } from '@/stores/model.js'
const modelStore = useModelGeneratorStore()
const {progress} = storeToRefs(modelStore);
</script>
