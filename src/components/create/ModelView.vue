<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useModelGeneratorStore } from '@/stores/model.js'
import { storeToRefs } from 'pinia'
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'

import GeneratingModal from '@/components/GeneratingModal.vue'
import ReadyModal from '@/components/ReadyModal.vue'
import { useSettingsStore } from '@/stores/settings.js'
import UiButton, { ButtonThemes } from '../shared/UiButton.vue'
import UiText, { TextAlign, TextTheme, TextWeight } from '../shared/UiText.vue'

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
  <div class="create">
    <form @submit.prevent="onSubmit" class="create__form">
      <div class="create__tab">
        <UiButton
          class="create__button _button_primary"
          :class="{ active: generationType === 'text-to-model' }"
          @click="modelStore.generationType = 'text-to-model'"
        >
          {{ $t('Text to 3D') }}
        </UiButton>
        <UiButton
          class="create__button _button_primary"
          :class="{ active: generationType === 'image-to-model' }"
          @click="modelStore.generationType = 'image-to-model'"
        >
          {{ $t('Image to 3D') }}
        </UiButton>
      </div>
      <div class="create__generate">
        <div class="create__image _ibg-contain">
          <img src="@/static/images/icons/cube.png" />
        </div>
        <UiText class="create__text" :weight="TextWeight.BOLD" :text="$t('Generate 3D model')" />
      </div>
      <template v-if="generationType === 'text-to-model'">
        <UiText class="create__description" :text="$t('Description')" />
        <label class="create__textarea textarea">
          <div class="textarea__container" :class="{ disabled: isDisabled }">
            <textarea
              :disabled="isDisabled"
              v-model="currentPrompt"
              :placeholder="$t('Describe your model... e.g. “a robot painting a sunset”')"
              maxlength="300"
            ></textarea>
            <UiText class="textarea__text" :text="`${currentPrompt.length}/300`" />
          </div>
          <UiText
            v-if="promptError"
            class="textarea__error"
            :theme="TextTheme.ERROR"
            :text="promptError"
          />
        </label>
        <div class="create__item item">
          <UiText
            class="item__title"
            :weight="TextWeight.BOLD"
            :align="TextAlign.CENTER"
            :text="$t('Art style')"
          />
          <div class="item__list">
            <label class="item__label">
              <input
                class="item__input"
                :disabled="isDisabled"
                type="radio"
                value="realistic"
                v-model="currentArtStyle"
                name="artStyle"
              />
              <div class="item__text">{{ $t('Realistic') }}</div>
            </label>
            <label class="item__label">
              <input
                class="item__input"
                :disabled="isDisabled"
                type="radio"
                value="sculpture"
                v-model="currentArtStyle"
                name="artStyle"
              />
              <div class="item__text">{{ $t('Sculpture') }}</div>
            </label>
          </div>
        </div>
      </template>

      <!-- IMAGE-TO-MODEL MODE -->
      <template v-if="generationType === 'image-to-model'">
        <div class="create__upload upload">
          <UiText class="upload__text" :weight="TextWeight.BOLD" :text="$t('Add your image')" />
          <label class="upload__container">
            <input type="file" @change="onFileChange" />
            <UiText
              class="upload__about"
              :theme="TextTheme.SECONDARY"
              :text="$t('Supported formats: .png, .jpg, .jpeg.')"
            />
            <UiText
              v-if="imageError"
              class="upload__error"
              :theme="TextTheme.ERROR"
              :text="imageError"
            />
          </label>
          <div v-if="imageUrl" class="upload__preview">
            <div class="upload__image _ibg-contain">
              <img :src="imageUrl" />
            </div>
            <UiButton class="upload__remove" @click="removeImage">×</UiButton>
          </div>
        </div>
      </template>

      <!-- Symmetry (always shown in both modes) -->
      <!--<div class="label size-label">
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
      </div>-->

      <!-- Total and Submit -->
      <!--<div class="total-container flex justify-between items-center">
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
      </div>-->

      <!--<div v-if="error" class="text text-12 text-error text-red mt-2 text-center">
        {{ error }}
      </div>-->

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

<style lang="scss" scoped>
@use '@/styles/mixins' as *;
@use '@/styles/media' as *;
@use '@/styles/classes' as *;

.create {
  padding: 15px;
  background-color: var(--bg-secondary-color);
  border-radius: var(--border-radius);
  @media (max-width: $md3) {
    padding: 15px 10px;
  }
  &__form {
  }
  &__tab {
    display: flex;
    background-color: var(--bg-primary-color);
    width: fit-content;
    border-radius: var(--border-radius);
    gap: 10px;
  }
  &__button {
    background-color: var(--bg-primary-color);
    color: var(--primary-color);
    border-color: transparent;
    &.active {
      background-color: var(--bg-primary-color-inverted);
      color: var(--primary-color-inverted);
    }
  }
  &__generate {
    display: flex;
    justify-content: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 10);
    }
  }
  &__image {
    width: 20px;
    height: 20px;
  }
  &__text {
  }
  &__description {
  }
  &__textarea {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 10);
    }
  }
  &__item {
  }
  &__upload {
  }
}

.textarea {
  display: flex;
  flex-direction: column;

  &__container {
    position: relative;
    background-color: var(--bg-primary-color);
    border: 1px solid var(--bg-fifth-color);
    border-radius: var(--border-radius);
    padding: 12px 14px;
    transition:
      border-color 0.2s ease-in-out,
      box-shadow 0.2s ease-in-out;

    &.disabled {
      opacity: 0.6;
      pointer-events: none;
    }

    textarea {
      width: 100%;
      height: 150px;
      resize: none;
      border: none;
      background: transparent;
      outline: none;
      color: var(--primary-color);
      font-size: 14px;
      line-height: 1.4;
      font-family: var(--font-family-sans);
      padding: 0;
    }

    textarea::placeholder {
      color: var(--secondary-color);
      font-family: var(--font-family-sans);
    }
    textarea:focus + .textarea__text,
    &:focus-within {
      border-color: var(--hint-color);
    }
  }

  &__text {
    position: absolute;
    bottom: 8px;
    right: 10px;
    font-size: var(--font-size-xs);
    color: var(--secondary-color);
    pointer-events: none;
  }

  &__error {
  }
}

.item {
  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 10);
    }
  }
  &__list {
    display: flex;
    align-items: center;
    border-radius: var(--border-radius);
    background-color: var(--bg-primary-color);
    overflow: hidden;
    gap: 5px;
  }
  &__label {
    position: relative;
    flex: 1 1 auto;
    cursor: pointer;
  }
  &__input {
    display: none;

    &:checked + .item__text {
      color: var(--primary-color-inverted);
      background-color: var(--bg-primary-color-inverted);
    }
  }
  &__text {
    min-height: 40px;
    padding: 8px 15px;
    font-weight: 700;
    font-family: var(--font-family-sans);
    border-radius: var(--border-radius);
    transition: all 0.3s ease 0s;
  }
}

.upload {
  &__text {
  }
  &__container {
  }
  &__about {
  }
  &__error {
  }
  &__preview {
  }
  &__image {
  }
  &__remove {
  }
}
</style>
