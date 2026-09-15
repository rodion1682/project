<script setup>
import { computed, ref, useAttrs, watch } from 'vue'

import BaseSelect from '@/components/ui/BaseSelect.vue'

import { useGlobalStore } from '@/stores/global'

defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()

const globalStore = useGlobalStore()

const activeLang = ref('')
const isChanging = ref(false)

const currentLanguage = computed(() => {
  return globalStore.currentLanguage
})

const allLanguages = computed(() => {
  return Array.isArray(globalStore.languages) ? globalStore.languages : []
})

const languageOptions = computed(() => {
  return allLanguages.value.map((lang) => ({
    label: lang.title,
    value: lang.id,
  }))
})

const selectAttrs = computed(() => {
  const rest = {
    ...attrs,
  }

  delete rest.class
  delete rest['data-da']

  return rest
})

const selectLanguage = async (option) => {
  const langId = option?.id ?? option?.value

  if (!langId || langId === currentLanguage.value || isChanging.value) {
    return
  }

  isChanging.value = true

  try {
    await globalStore.changeLocale(langId)
  } finally {
    isChanging.value = false
  }
}

watch(
  currentLanguage,
  (language) => {
    if (language) {
      activeLang.value = language
    }
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <BaseSelect
    v-if="currentLanguage && allLanguages.length > 1"
    v-model="activeLang"
    :options="languageOptions"
    option-label="label"
    option-value="value"
    :disabled="isChanging"
    :class="['language-select', attrs.class]"
    :data-da="attrs['data-da']"
    v-bind="selectAttrs"
    @change="selectLanguage"
  />
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.language-select {
  width: fit-content;
  min-width: 82px;

  @media (max-width: $md4) {
    width: 100%;
  }

  :deep(.base-select__control) {
    min-height: 48px;

    padding-left: 15px;
    padding-right: 38px;

    font-size: 14px;
    line-height: 100%;
    font-weight: 700;
  }

  :deep(.base-select__value) {
    color: var(--primary-color);

    font-size: 14px;
    line-height: 100%;
    font-weight: 700;
  }

  :deep(.base-select__chevron) {
    right: 14px;

    border-color: var(--primary-color);
  }

  :deep(.base-select__dropdown) {
    min-width: 100%;
  }

  :deep(.base-select__option) {
    font-size: 14px;
    font-weight: 600;
  }

  @media (max-width: $md7) {
    width: 100%;

    :deep(.base-select__control) {
      min-height: 45px;
    }
  }
}
</style>
