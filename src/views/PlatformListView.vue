<script setup>
import { useCategoriesStore } from '@/stores/categories'
const categoriesStore = useCategoriesStore()
</script>

<template>
  <main class="main">
    <div class="section breadcrumbs-section">
      <div class="wrapper flex">
        <RouterLink to="/" class="text text-14 text-white">{{ $t('Home') }}</RouterLink>
        <div class="text text-14 text-white">/</div>
        <div class="text text-14 text-pink">{{ $t('Shop Games') }}</div>
      </div>
    </div>
    <div class="section categories-section">
      <div class="wrapper">
        <div class="text text-64 text-russo uppercase">{{ $t('Shop Games') }}</div>
        <ul
          class="list flex flex-wrap"
          v-if="categoriesStore.platforms && categoriesStore.platforms.length"
        >
          <li class="item">
            <RouterLink
              class="item-link text text-white text-18 weight-700 flex justify-center items-center"
              to="/products/all/all"
            >
              {{ $t('All Platforms') }}
            </RouterLink>
          </li>
          <li class="item" v-for="(item, i) in categoriesStore.platforms" :key="i">
            <RouterLink
              class="item-link text text-white text-18 weight-700 flex justify-center items-center"
              :to="'/products/' + item.slug"
              >{{ item.title }}</RouterLink
            >
          </li>
        </ul>
      </div>
    </div>
  </main>
</template>
