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
  axios.get('static-pages/' + id).then((res) => {
    activePage.value = res.data.payload
    console.log(activePage.value)
  })
}

onMounted(() => {
  watchEffect(() => {
    if (staticStore.static && staticStore.static.length) {
      selectedPage.value = staticStore.static.find(
        (item) => item.title.toLowerCase().replace(/ /g, '-') === page.value,
      )

      if (selectedPage.value) {
        getPage(selectedPage.value.id)
      }
    }
  })
})
</script>

<template>
  <main class="main">
    <div class="section breadcrumbs-section">
      <div class="wrapper flex">
        <RouterLink to="/" class="text text-14 text-white">{{ $t('Home') }}</RouterLink>
        <div class="text text-14 text-white">/</div>
        <div class="text text-14 text-pink">{{ $t(page.replace('-', ' ')) }}</div>
      </div>
    </div>
    <div class="section static-section">
      <div class="wrapper">
        <div class="text text-64 text-russo uppercase">{{ $t(page.replace('-', ' ')) }}</div>
        <div
          class="static-desc text text-16"
          v-if="activePage && Object.keys(activePage).length !== 0"
          v-html="$t(activePage.content)"
        />
      </div>
    </div>
  </main>
</template>
