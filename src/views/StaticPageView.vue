<script setup>
import { toRefs, onMounted, watchEffect, ref } from 'vue'
import axios from '@/plugins/axios'
import { useStaticStore } from '@/stores/static'
import UiText from '@/components/shared/UiText.vue'
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
    <div class="main__wrapper _cnt">
      <div class="main__text">
        <b>{{ page.replaceAll('-', ' ') }}</b>
      </div>
      <div class="main__text" v-if="activePage" v-html="activePage.content"></div>
    </div>
  </main>
</template>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;
@use '@/styles/media' as *;
@use '@/styles/classes' as *;
.main {
  padding-top: 15px;
  @include header-indent;
  &__text {
    :deep(p),
    :deep(span) {
      font-family: var(--font-family-sans) !important;
      color: var(--primary-color) !important;
    }
    :deep(a) {
      font-family: var(--font-family-sans) !important;
      color: var(--link-color) !important;
      @media (any-hover: hover) {
        &:hover {
          color: var(--link-hober-color) !important;
        }
      }
    }
  }
}
</style>
