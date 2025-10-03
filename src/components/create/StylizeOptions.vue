<script setup>
import { ref } from 'vue'
const selectedDraft = ref(null)
</script>
<template>
  <div class="texture-options">
    <div class="text text-16 text-inter">
      {{ $t('Select a draft to continue') }}
    </div>
    <div class="texture-options-list flex flex-wrap">
      <div class="texture-options-item" v-for="(item, i) in 4" :key="i">
        <label class="texture-options-label">
          <input type="radio" v-model="selectedDraft" :value="i" @change="dropdownClosed = false" />
          <div class="texture-options-item-wrapper">
            <div class="dot"></div>
            <img
              alt="full screen icon"
              class="fullScreen"
              src="@/assets/images/createNav/fullScreen.svg"
            />
            <img alt="model icon" class="img" src="@/assets/images/model2.webp" />
          </div>
        </label>
      </div>
    </div>
  </div>
</template>
