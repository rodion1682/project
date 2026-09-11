<script setup>
import { useCategoriesStore } from '@/stores/categories'
import { onMounted, ref, toRefs, watchEffect } from 'vue'

const categoriesStore = useCategoriesStore()
const props = defineProps({
  platform: {
    type: String,
    required: true,
  },
})

const categories = ref([])
const { platform } = toRefs(props)

onMounted(() => {
  watchEffect(() => {
    if (categoriesStore.platforms && categoriesStore.platforms.length) {
      if (categoriesStore.categories && categoriesStore.categories.length) {
        categories.value = categoriesStore.categories.filter(
          (item) => item.parent.slug === platform.value,
        )
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
        <RouterLink to="/products" class="text text-14 text-white">{{
          $t('Shop Games')
        }}</RouterLink>
        <div class="text text-14 text-white">/</div>
        <div class="text text-14 text-pink">{{ platform }}</div>
      </div>
    </div>
    <div class="section categories-section">
      <div class="wrapper">
        <div class="text text-64 text-russo uppercase text-center" v-if="platform">
          {{ platform }}
        </div>
        <ul class="list flex flex-wrap" v-if="categories">
          <li class="item" v-for="(item, i) in categories" :key="i">
            <RouterLink
              class="item-link text text-white text-20 weight-700 flex justify-center items-center"
              :to="'/products/' + platform + '/' + item.title.toLowerCase().replace(/ /g, '-')"
              >{{ $t(item.title) }}</RouterLink
            >
          </li>
        </ul>
      </div>
    </div>
  </main>
</template>
