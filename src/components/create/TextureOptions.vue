<script setup>
import { ref } from 'vue'
const selectedDraft = ref(null)
const createTexture = ref(false)
const dropdownClosed = ref(false)
</script>
<template>
  <div class="texture-options">
    <div class="text text-16 text-inter">
      {{ $t('Select a draft to continue') }}
    </div>
    <div class="texture-options-list flex flex-wrap">
      <div class="texture-options-item" v-for="(item, i) in 4" :key="i">
        <div :class="['dropdown dropdown-spec', { active: selectedDraft == i && !dropdownClosed }]">
          <div class="dropdown-wrapper">
            <div class="dropdown-top flex items-center justify-between">
              <div class="text text-24 text-inter">
                {{ $t('Confirm generation') }}
              </div>
              <img
                alt="circledClose icon"
                class="circledClose link"
                src="@/assets/images/circledClose.svg"
                @click="dropdownClosed = true"
              />
            </div>
            <div class="dropdown-center">
              <div class="text text-20 text-inter">
                {{ $t('Create a texture') }}
              </div>
              <div class="dropdown-list flex justify-between">
                <label class="dropdown-item">
                  <input type="radio" v-model="createTexture" :value="false" />
                  <div class="dropdown-item-wrapper flex items-center justify-between">
                    <div class="text text-20 text-inter">
                      <b>{{ $t('NO') }}</b>
                    </div>
                    <img alt="model2 icon" class="img" src="@/assets/images/model2.webp" />
                  </div>
                </label>
                <label class="dropdown-item">
                  <input type="radio" v-model="createTexture" :value="true" />
                  <div class="dropdown-item-wrapper flex items-center justify-between">
                    <div class="text text-20 text-inter">
                      <b>{{ $t('YES') }}</b>
                    </div>
                    <img alt="model3 icon" class="img" src="@/assets/images/model3.webp" />
                  </div>
                </label>
              </div>
            </div>
            <div class="dropdown-bottom">
              <div class="price flex items-center justify-center">
                <div class="text text-20 text-inter">
                  <b>0</b>
                </div>
                <img alt="coin icon" class="coin" src="@/assets/imgs/coin.svg" />
              </div>
              <button class="button big w-180">{{ $t('Confirm') }}</button>
            </div>
          </div>
        </div>
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
