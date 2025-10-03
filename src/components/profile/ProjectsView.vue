<script setup>
import { onMounted, ref } from 'vue'
import { useProfileStore } from '@/stores/profile.js'
import ProjectViewModal from '@/components/ProjectViewModal.vue'

const projects = ref([])
const selectedProject = ref(null)
const profileStore = useProfileStore()

onMounted(async () => {
  projects.value = await profileStore.getAllAssets()
})
</script>

<template>
  <div class="projects">
    <div class="list flex flex-wrap">
      <div v-for="project in projects" :key="project.id" class="item">
        <button class="button" @click="selectedProject = project">
          <img class="icon" src="@/assets/imgs/exploreRotateIcon.svg" />
        </button>
        <div class="img-container">
          <img class="img" :src="project.thumbnail_url" />
        </div>
        <div class="text text-14">{{ project.prompt }}</div>
      </div>
    </div>
    <ProjectViewModal
      @close="selectedProject = null"
      :asset="selectedProject"
      v-if="selectedProject"
    />
  </div>
</template>
