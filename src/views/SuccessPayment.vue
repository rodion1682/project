<script setup>
import { useSettingsStore } from '@/stores/settings'
const settingsStore = useSettingsStore()
</script>
<template>
  <main class="main">
    <div class="section breadcrumbs-section">
      <div class="wrapper"></div>
    </div>
    <div class="section static-section">
      <div class="wrapper">
        <div class="text text-64 text-russo uppercase">
          {{ $t('Thank you for your purchase! In case of any questions, please contact us at') }}
          {{ settingsStore?.settings?.support_email }}
        </div>
      </div>
    </div>
  </main>
</template>
