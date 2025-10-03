<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useModelGeneratorStore } from '@/stores/model.js'
import { storeToRefs } from 'pinia'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'

import GeneratingModal from '@/components/GeneratingModal.vue'
import ReadyModal from '@/components/ReadyModal.vue'
import { useSettingsStore } from '@/stores/settings.js'

const modelStore = useModelGeneratorStore()
const settingsStore = useSettingsStore()
const { isGenerating, isReadyForDownload, generatedModel, mode, status, generationType, error } =
  storeToRefs(modelStore)
const { refineModel, generateModel, reset } = modelStore

const isRefineMode = computed(() => {
  // Тогда проверяем логику refine
  return (
    (mode.value === 'preview' && status.value === 'completed') ||
    (mode.value === 'refine' && status.value === 'failed')
  )
})

const isDisabled = computed(() => {
  return mode.value && status.value === 'completed'
})

const generationTypeSame = computed(() => {
  return generationType.value === generatedModel.value.generation_type
})

const imageSchema = yup
  .mixed()
  .test('required', 'Image is required', (value) => {
    return generationType.value === 'image-to-model' ? value !== null : true
  })
  .test('fileType', 'Unsupported file type', (value) => {
    if (generationType.value !== 'image-to-model') return true
    if (!value) return false
    return ['image/png', 'image/jpeg', 'image/webp'].includes(value.type)
  })

const formSchema = computed(() => {
  if (generationType.value === 'text-to-model') {
    return yup.object({
      prompt: yup.string().max(300).required(),
      artStyle: yup.string().oneOf(['realistic', 'sculpture']).required(),
      symmetry: yup.string().oneOf(['off', 'auto', 'on']).required(),
      image: yup.mixed().notRequired(),
    })
  } else if (generationType.value === 'image-to-model') {
    return yup.object({
      image: imageSchema.required(),
      symmetry: yup.string().oneOf(['off', 'auto', 'on']).required(),
      prompt: yup.string().notRequired(),
      artStyle: yup.string().notRequired(),
    })
  }
  return yup.object() // fallback
})

// Используем useForm с динамической схемой
const { handleSubmit, isSubmitting, meta, setFieldValue } = useForm({
  validationSchema: formSchema,
  initialValues: {
    prompt: modelStore.prompt,
    artStyle: modelStore.artStyle,
    symmetry: modelStore.symmetry,
    image: null,
  },
})

// Поля формы
const { value: currentPrompt, errorMessage: promptError, setValue: setPrompt } = useField('prompt')
const { value: currentArtStyle } = useField('artStyle')
const { value: currentSymmetry } = useField('symmetry')

const generationPrice = computed(() => {
  if (generationType.value === 'image-to-model') {
    return settingsStore.modelGenerationPrice
  } else {
    if (currentArtStyle.value === 'realistic') {
      return settingsStore.realisticModelGenerationPrice
    } else {
      return settingsStore.modelGenerationPrice
    }
  }
})

// Для image-to-model поле image в useField не обязательно брать, достаточно setFieldValue

watch(generatedModel, (newVal) => {
  if (newVal?.value) {
    setPrompt(newVal?.value.prompt)
  }
})

// Логика для загрузки картинки и превью
const imageFile = ref(null)
const imageUrl = ref(null)
const imageError = ref(null)

onMounted(() => {
  reset()
})

const removeImage = () => {
  imageFile.value = null
  imageUrl.value = null
  setFieldValue('image', null)
}

const onFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  const validTypes = ['image/png', 'image/jpeg', 'image/webp']
  if (!validTypes.includes(file.type)) {
    imageError.value = 'Unsupported file type'
    imageUrl.value = null
    setFieldValue('image', null)
    return
  }

  imageFile.value = file
  imageUrl.value = URL.createObjectURL(file)
  imageError.value = null
  setFieldValue('image', file)
}

const onSubmit = handleSubmit(async (values) => {
  if (status.value === 'refine' && mode.value === 'completed') {
    isReadyForDownload.value = true
    return
  }

  // Если есть сгенерированная модель и тип совпадает, и можно refine
  if (
    generatedModel.value &&
    generationType.value === generatedModel.value.generation_type &&
    isRefineMode.value
  ) {
    await refineModel(generatedModel.value.id)
    return
  }

  // Иначе — новая генерация

  // Обновляем значения в store
  modelStore.prompt = values.prompt || ''
  modelStore.artStyle = values.artStyle || ''
  modelStore.symmetry = values.symmetry

  if (generationType.value === 'image-to-model') {
    if (!imageFile.value) {
      imageError.value = 'Image file is required'
      return
    }

    // Устанавливаем файл в store
    modelStore.setImageFile(imageFile.value)
  }

  await generateModel()
})
</script>

<template>
  <div class="create-center">
    <form @submit.prevent="onSubmit" class="bar">
      <div class="tabs flex mb-4">
        <button
          type="button"
          class="tab-button text-inter"
          :class="{ active: generationType === 'text-to-model' }"
          @click="modelStore.generationType = 'text-to-model'"
        >
          {{ $t('Text to 3D') }}
        </button>
        <button
          type="button"
          class="tab-button text-inter"
          :class="{ active: generationType === 'image-to-model' }"
          @click="modelStore.generationType = 'image-to-model'"
        >
          {{ $t('Image to 3D') }}
        </button>
      </div>
      <div class="coub-text flex items-center">
        <img alt="coub icon" class="img" src="@/assets/imgs/btn-generate-icon-white.svg" />
        <div class="text text-14 text-inter">
          <b>{{ $t('Generate 3D model') }}</b>
        </div>
      </div>
      <!-- TEXT-TO-MODEL MODE -->
      <template v-if="generationType === 'text-to-model'">
        <div class="label-text text text-14 text-inter text-gray">{{ $t('Description') }}:</div>
        <label class="label textarea-label">
          <div class="textarea-container" :class="{ disabled: isDisabled }">
            <textarea
              :disabled="isDisabled"
              v-model="currentPrompt"
              :placeholder="$t('Describe your model... e.g. “a robot painting a sunset”')"
              maxlength="300"
            ></textarea>

            <div class="text text-10 text-gray text-inter symbol-count">
              {{ currentPrompt.length }}/300
            </div>
          </div>
          <div v-if="promptError" class="text text-12 text-error text-red">{{ promptError }}</div>
        </label>

        <!-- Art Style -->
        <div class="label size-label">
          <div class="label-text text text-14 text-inter">
            <b>{{ $t('Art style') }}:</b>
          </div>
          <div class="size-list flex justify-around">
            <label>
              <input
                :disabled="isDisabled"
                type="radio"
                value="realistic"
                v-model="currentArtStyle"
                name="artStyle"
              />
              <div class="text text-14 text-inter text-gray">
                <b>{{ $t('Realistic') }}</b>
              </div>
            </label>
            <label>
              <input
                :disabled="isDisabled"
                type="radio"
                value="sculpture"
                v-model="currentArtStyle"
                name="artStyle"
              />
              <div class="text text-14 text-inter text-gray">
                <b>{{ $t('Sculpture') }}</b>
              </div>
            </label>
          </div>
        </div>
      </template>

      <!-- IMAGE-TO-MODEL MODE -->
      <template v-if="generationType === 'image-to-model'">
        <div class="label upload-label">
          <div class="label-text text text-14 text-inter text-gray">
            {{ $t('Add your image') }}:
          </div>
          <label class="upload-container">
            <input type="file" @change="onFileChange" />
            <div class="upload flex items-center justify-center">
              <div class="text text-12 text-inter">
                {{ $t('Supported formats: .png, .jpg, .jpeg.') }}
              </div>
            </div>
            <div v-if="imageError" class="text text-12 text-error text-red">{{ imageError }}</div>
          </label>
          <div v-if="imageUrl" class="image-preview-wrapper mt-4 relative">
            <img :src="imageUrl" alt="Preview" class="image-preview rounded" />
            <button type="button" class="remove-preview" @click="removeImage">×</button>
          </div>
        </div>
      </template>

      <!-- Symmetry (always shown in both modes) -->
      <div class="label size-label">
        <div class="label-text text text-14 text-inter">
          <b>{{ $t('Symmetry') }}:</b>
        </div>
        <div class="size-list flex justify-around">
          <label>
            <input
              :disabled="isDisabled"
              type="radio"
              value="off"
              v-model="currentSymmetry"
              name="symmetry"
            />
            <div class="text text-14 text-inter">Off</div>
          </label>
          <label>
            <input
              :disabled="isDisabled"
              type="radio"
              value="auto"
              v-model="currentSymmetry"
              name="symmetry"
            />
            <div class="text text-14 text-inter">Auto</div>
          </label>
          <label>
            <input
              :disabled="isDisabled"
              type="radio"
              value="on"
              v-model="currentSymmetry"
              name="symmetry"
            />
            <div class="text text-14 text-inter">On</div>
          </label>
        </div>
      </div>

      <!-- Total and Submit -->
      <div class="total-container flex justify-between items-center">
        <div class="total flex items-center justify-center">
          <div class="text text-14 text-inter">
            <b>{{ $t('1 min') }}</b>
          </div>
          <div class="flex justify-center items-center price">
            <div class="text text-14 text-inter">
              <b>{{ generationPrice }}</b>
            </div>
            <img alt="coin icon" class="coin" src="@/assets/imgs/coin.svg" />
          </div>
        </div>

        <button
          :disabled="(isDisabled && !isRefineMode) || !meta.valid || isSubmitting"
          type="submit"
          class="button w-144"
        >
          <span>{{ isRefineMode && generationTypeSame ? $t('Refine') : $t('Generate') }}</span>
        </button>
      </div>

      <div v-if="error" class="text text-12 text-error text-red mt-2 text-center">
        {{ error }}
      </div>

      <!--      <div v-if="profileStore.profile.balance === 0" class="buy-more flex items-center justify-center">-->
      <!--        <div class="text text-16 text-inter weight-500">-->
      <!--          {{ $t('Not enough credits') }}-->
      <!--        </div>-->
      <!--        <button @click="topUpModalStore.openModal()" class="text text-20 text-inter weight-900">-->
      <!--          {{ $t('Buy More') }}-->
      <!--        </button>-->
      <!--      </div>-->
    </form>

    <Transition>
      <GeneratingModal v-if="isGenerating" />
    </Transition>
    <Transition>
      <ReadyModal v-if="isReadyForDownload" />
    </Transition>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  margin-bottom: 26px;
  padding: 4px;
  background: #39393a;
  border-radius: 10px;
}

.tab-button {
  color: #89888c;
  padding: 16px 20px;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: bold;
  flex: 1;
  border-radius: 8px;
}

.tab-button.active {
  color: #131314;
  background: linear-gradient(#f4f3fb, #adaaba);
}

.image-preview img {
  max-width: 100%;
  border-radius: 8px;
  margin-top: 10px;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center; /* центрируем контент по горизонтали */
  margin-top: 20px; /* отступ сверху от файлового инпута */
}

.image-preview-wrapper {
  position: relative;
  border-radius: 12px; /* округление углов */
  overflow: hidden;
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 20px auto 0 auto;
}

.image-preview {
  max-height: 200px;
  max-width: 100%;
  object-fit: contain;
  display: block;
  border-radius: 12px; /* совпадает с рамкой */
}

/* Кнопка удаления по-прежнему в правом верхнем углу */
.remove-preview {
  position: absolute;
  top: 5px;
  right: 5px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  color: white;
  font-size: 20px;
  width: 28px;
  height: 28px;
  line-height: 26px;
  border-radius: 50%;
  cursor: pointer;
}
</style>
