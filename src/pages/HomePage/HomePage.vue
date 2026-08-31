<script setup>
import HeroModal from '@/components/modals/HeroModal.vue'
import { useModalStore } from '@/stores/modal'
import ColectionSection from './components/ColectionSection.vue'
import HeroSection from './components/HeroSection.vue'
import HeroesSection from './components/HeroesSection.vue'
import LibrarySection from './components/LibrarySection.vue'
import StrategiesSection from './components/StrategiesSection.vue'
import WelcomeSection from './components/WelcomeSection.vue'

const modalStore = useModalStore()

const handleModalClose = () => {
  modalStore.close('hero')
}
</script>

<template>
  <HeroSection />
  <WelcomeSection />
  <HeroesSection />
  <ColectionSection />
  <StrategiesSection />
  <LibrarySection />
  <!-- :show="modalStore.isOpen('hero')" -->
  <HeroModal :show="false" @close="handleModalClose" />
</template>
