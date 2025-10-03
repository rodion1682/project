<script setup>
import { toRefs, onMounted, watchEffect, ref } from 'vue'
import axios from '@/plugins/axios'
import { useStaticStore } from '@/stores/static'
const props = defineProps({
  page: {
    type: String,
    required: true,
  },
})

const staticStore = useStaticStore()
const { page } = toRefs(props)

const activePage = ref({})
const selectedPage = ref({})

function getPage(id) {
  axios.get(import.meta.env.VITE_APP_API + 'static-pages/' + id).then((res) => {
    activePage.value = res.data.payload
  })
}

onMounted(() => {
  watchEffect(() => {
    selectedPage.value = staticStore.static.find(
      (item) => item.title.toLowerCase().replace(/ /g, '-') === page.value,
    )
    if (selectedPage.value) {
      getPage(selectedPage.value.id)
    }
  })
})
</script>

<template>
  <main class="main">
    <div class="section static-section">
      <div class="wrapper">
        <div class="text text-64">
          <b>{{ page.replaceAll('-', ' ') }}</b>
        </div>
        <div
          class="static-desc text text-16 text-inter"
          v-if="activePage"
          v-html="activePage.content"
        />
      </div>
    </div>
  </main>
</template>
