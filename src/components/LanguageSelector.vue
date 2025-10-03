<template>
  <select
    class="select"
    v-if="currentLanguage && allLanguages.length > 1"
    @change="selectLanguage($event.target.value)"
    v-model="activeLang"
  >
    <option v-for="lang in allLanguages" :key="lang.id" :value="lang.id">
      {{ lang.title }}
    </option>
  </select>
</template>

<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue'
import { useGlobalStore } from '@/stores/global' // Import Pinia store

const globalStore = useGlobalStore()
const isOpen = ref(false)
const activeLang = ref('')

const currentLanguage = computed(() => globalStore.currentLanguage)
const allLanguages = computed(() => globalStore.languages)

const selectLanguage = async (langId) => {
  await globalStore.changeLocale(langId)
  isOpen.value = false
}

onMounted(() => {
  watchEffect(() => {
    if (currentLanguage.value) {
      activeLang.value = currentLanguage.value
    }
  })
})
</script>
