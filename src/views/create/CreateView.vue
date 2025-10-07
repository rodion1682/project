<script setup>
import { toRefs, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useModelGeneratorStore } from '@/stores/model.js'

const style = ref(1)

const props = defineProps({
  page: {
    type: String,
    required: true,
  },
})

const modelStore = useModelGeneratorStore()
const { generatedModel } = storeToRefs(modelStore)

const { page } = toRefs(props)

import ModelView from '@/components/create/ModelView.vue'
import TextureView from '@/components/create/TextureView.vue'
import TextureOptions from '@/components/create/TextureOptions.vue'
import StylizeView from '@/components/create/StylizeView.vue'
import StylizeOptions from '@/components/create/StylizeOptions.vue'
import ReviveView from '@/components/create/ReviveView.vue'
import ReviveOptions from '@/components/create/ReviveOptions.vue'
import ModelViewer from '@/components/create/3DModelViewer.vue'
</script>
<template>
  <main class="create">
    <div class="create__aside">
      <ModelView v-if="page === 'model'" />
      <TextureView v-if="page === 'texture'" />
      <StylizeView v-if="page === 'stylize'" />
      <ReviveView v-if="page === 'revive'" />
    </div>
    <div class="create__body"></div>
  </main>
  <!--<div class="create-page">
    <div class="section create-section">
      <div class="wrapper flex">
        <div class="center">
         
          
        </div>
        <div class="right flex flex-wrap items-start">
          <div class="revive-side" v-if="page === 'revive'">
            <div class="list flex items-center flex-col justify-around">
              <button class="item">
                <img alt="texture icon" class="img" src="@/assets/images/createNav/texture.svg" />
                <div class="text text-14 text-inter text-white">
                  <span>{{ $t('Retexture') }}</span>
                </div>
              </button>
              <button class="item">
                <img alt="texture icon" class="img" src="@/assets/images/createNav/walking.svg" />
                <div class="text text-14 text-inter text-white">
                  <span>{{ $t('Installing') }}</span>
                </div>
              </button>
              <button class="item">
                <img alt="texture icon" class="img" src="@/assets/images/createNav/refresh.svg" />
                <div class="text text-14 text-inter text-white">
                  <span>{{ $t('Try again') }}</span>
                </div>
              </button>
              <button class="item">
                <img alt="texture icon" class="img" src="@/assets/images/createNav/share.svg" />
                <div class="text text-14 text-inter text-white">
                  <span>{{ $t('Share') }}</span>
                </div>
              </button>
              <button class="item">
                <img alt="texture icon" class="img" src="@/assets/images/createNav/publish.svg" />
                <div class="text text-14 text-inter text-white">
                  <span>{{ $t('Publish') }}</span>
                </div>
              </button>
            </div>
          </div>
          <div :class="['right-preview', { 'right-preview-revive': page === 'revive' }]">
            <TextureOptions v-if="page === 'texture'" />
            <StylizeOptions v-if="page === 'stylize'" />
            <ReviveOptions v-if="page === 'revive'" />
            <ModelViewer
              v-if="page === 'model' && generatedModel?.status === 'completed'"
              :asset-id="generatedModel?.id"
              extension="glb"
            />
            <div class="download-button-container" v-if="page === 'revive'">
              <div
                class="dropdown dropdown-spec dropdown-folder dropdown-stylize dropdown-download"
              >
                <div class="dropdown-wrapper">
                  <div class="dropdown-top">
                    <div class="text text-24 text-inter">
                      {{ $t('Load settings') }}
                    </div>
                  </div>
                  <div class="dropdown-center">
                    <div class="item">
                      <div class="text text-16 text-inter">
                        {{ $t('Format') }}
                      </div>
                      <div class="radio-list flex justify-between">
                        <div class="radio">
                          <input type="radio" checked />
                          <div class="text text-12 text-inter">fbx</div>
                        </div>
                        <div class="radio">
                          <input type="radio" />
                          <div class="text text-12 text-inter">obj</div>
                        </div>
                        <div class="radio">
                          <input type="radio" />
                          <div class="text text-12 text-inter">glb</div>
                        </div>
                        <div class="radio">
                          <input type="radio" />
                          <div class="text text-12 text-inter">usdz</div>
                        </div>
                        <div class="radio">
                          <input type="radio" />
                          <div class="text text-12 text-inter">stl</div>
                        </div>
                        <div class="radio">
                          <input type="radio" />
                          <div class="text text-12 text-inter">blend</div>
                        </div>
                      </div>
                    </div>
                    <div class="item">
                      <div class="text text-16 text-inter">
                        {{ $t('Size') }}
                      </div>
                      <div class="text text-14 text-inter">
                        {{ $t('Height') }}
                      </div>
                      <div class="input-container flex">
                        <label class="label">
                          <input type="text" />
                        </label>
                        <label class="label">
                          <select class="select">
                            <option>m</option>
                          </select>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div class="dropdown-bottom">
                    <button class="button big">{{ $t('Download') }}</button>
                  </div>
                </div>
              </div>
              <button class="button big w-390">{{ $t('Download') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>-->
</template>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;
@use '@/styles/media' as *;
@use '@/styles/classes' as *;

.create {
  @include header-indent;
}
</style>
