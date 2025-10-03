// stores/model.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from '@/plugins/axios'
import { useProfileStore } from '@/stores/profile.js'

export const useModelGeneratorStore = defineStore('modelGenerator', () => {
  const initialValues = {
    prompt: '',
    artStyle: 'realistic',
    symmetry: 'auto',
    imageFile: null,
    generationType: 'text-to-model',
  }

  const isGenerating = ref(false)
  const isReadyForDownload = ref(false)
  const error = ref(null)
  const generatedModel = ref(null)

  const prompt = ref(initialValues.prompt)
  const imageFile = ref(initialValues.imageFile)
  const symmetry = ref(initialValues.symmetry)
  const artStyle = ref(initialValues.artStyle)
  const generationType = ref(initialValues.generationType)

  const mode = computed(() => generatedModel.value?.mode)
  const status = computed(() => generatedModel.value?.status)
  const progress = computed(() => generatedModel.value?.progress || 0)
  const profileStore = useProfileStore();

  let pollingInterval = null

  function reset() {
    isGenerating.value = false
    isReadyForDownload.value = false
    error.value = null
    generatedModel.value = null

    prompt.value = initialValues.prompt
    imageFile.value = initialValues.imageFile
    symmetry.value = initialValues.symmetry
    artStyle.value = initialValues.artStyle
    generationType.value = initialValues.generationType

    stopPolling()
  }

  function handleError (err) {
    if (err.response) {
      const data = err.response.data
      if (data.message) {
        error.value = data.message
      } else if (data.errors) {
        const firstKey = Object.keys(data.errors)[0]
        if (firstKey && data.errors[firstKey]?.[0]) {
          error.value = data.errors[firstKey][0]
        } else {
          error.value = 'Validation error.'
        }
      } else {
        error.value = 'Unexpected error.'
      }
    } else {
      error.value = 'Unexpected error.'
    }
  }
  function clearError () {error.value = null}

  function setImageFile(file) {
    imageFile.value = file
  }

  async function downloadModel(id, format = 'glb') {
    const modelId = id || generatedModel.value?.id

    console.log(modelId);

    if (!modelId) return

    try {
      const response = await axios.get(`/generated-assets/${modelId}/model.${format}`, {
        responseType: 'blob',
      })

      const blob = response.data
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `model-${modelId}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)
    } catch (e) {
      error.value = e.response?.data?.message || 'Download failed'
    }
  }

  async function generateModel() {
    isGenerating.value = true
    error.value = null
    generatedModel.value = null

    try {
      let response

      if (generationType.value === 'text-to-model') {
        const payload = {
          generation_type: 'text-to-model',
          mode: 'preview',
          prompt: prompt.value,
          art_style: artStyle.value,
          symmetry: symmetry.value,
        }

        response = await axios.post('/generation', payload)
      } else if (generationType.value === 'image-to-model') {
        const formData = new FormData()
        formData.append('generation_type', 'image-to-model')
        formData.append('image', imageFile.value)

        response = await axios.post('/generation', formData)
      } else {
        throw new Error('Unsupported generation type')
      }

      profileStore.getBalance()

      clearError();
      generatedModel.value = response.data.asset
      startPolling()
    } catch (e) {
      handleError(e)
      isGenerating.value = false
    }
  }

  async function refineModel(modelId) {
    isGenerating.value = true
    error.value = null

    try {
      let response

      if (generationType.value === 'text-to-model') {
        const payload = {
          generation_type: 'text-to-model',
          mode: 'refine',
          generated_asset_id: modelId,
        }

        response = await axios.post('/generation', payload)
      } else {
        throw new Error('Unsupported generation type')
      }

      clearError();
      generatedModel.value = response.data.asset
      startPolling()
    } catch (e) {
      handleError(e)
      isGenerating.value = false
    }
  }

  function startPolling() {
    stopPolling()
    if (!generatedModel.value) return

    isGenerating.value = generatedModel.value.status === 'pending'

    pollingInterval = setInterval(async () => {
      try {
        const { id } = generatedModel.value
        const response = await axios.get(`/generated-assets/${id}`)
        generatedModel.value = response.data

        if (['completed', 'failed'].includes(status.value)) {
          stopPolling()

          if (status.value === 'failed') {
            profileStore.getProfile();
            error.value = 'Something went wrong.';
          }

          setTimeout(() => {
            isGenerating.value = false
            if (mode.value === 'refine' && status.value === 'completed') {
              isReadyForDownload.value = true
            }
          }, 1000)
        } else {
          isGenerating.value = generatedModel.value.status === 'pending'
        }
      } catch (e) {
        error.value = e.response?.data?.message || 'Failed to poll status'
        generatedModel.value = null
        isGenerating.value = false
        stopPolling()
      }
    }, 1000)
  }

  function stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  }

  function updateInitialValuesFromModel() {
    if (!generatedModel.value) return

    initialValues.prompt = generatedModel.value.prompt || ''
    initialValues.artStyle = generatedModel.value.art_style || 'realistic'
    initialValues.symmetry = generatedModel.value.symmetry || 'auto'
    initialValues.imageFile = null
    initialValues.generationType = generatedModel.value.generation_type || 'text-to-model'

    prompt.value = initialValues.prompt
    artStyle.value = initialValues.artStyle
    symmetry.value = initialValues.symmetry
    imageFile.value = initialValues.imageFile
    generationType.value = initialValues.generationType
  }

  return {
    // values
    prompt,
    imageFile,
    symmetry,
    artStyle,
    generationType,

    // flags
    isGenerating,
    isReadyForDownload,
    error,
    generatedModel,
    mode,
    status,
    progress,

    // methods
    downloadModel,
    generateModel,
    refineModel,
    reset,
    startPolling,
    stopPolling,
    updateInitialValuesFromModel,
    setImageFile
  }
})
