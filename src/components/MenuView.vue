<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { RouterLink } from 'vue-router'
import { useProfileNavStore } from '@/stores/profileNav'
import { useCategoriesStore } from '@/stores/categories'
import { useProfileStore } from '@/stores/profile'
import { useAuthStore } from '@/stores/auth'

const categoriesStore = useCategoriesStore()
const profileStore = useProfileStore()
const authStore = useAuthStore()

const profileNavStore = useProfileNavStore()
const activePlatform = ref({})

onMounted(() => {
  watchEffect(() => {
    if (categoriesStore.platforms && categoriesStore.platforms.length) {
      activePlatform.value = categoriesStore.platforms[0]
    }
  })
})
</script>

<template>
  <div class="menu">
    <div class="overlay"></div>
    <div class="wrapper">
      <div class="nav-list flex justify-between">
        <div class="nav-container flex">
          <ul class="nav platform-nav">
            <li
              class="nav__item flex items-center justify-center"
              @mouseover.stop="activePlatform = 'all'"
            >
              <RouterLink
                to="/products/all/all"
                :class="[
                  'text text-18 weight-700 text-white',
                  {
                    'text-pink': activePlatform == 'all',
                  },
                ]"
                >{{ $t('All platforms') }}</RouterLink
              >
            </li>
            <li
              v-for="(item, i) in categoriesStore.platforms"
              class="nav__item flex items-center justify-center"
              :key="i"
              @mouseover.stop="activePlatform = item"
            >
              <RouterLink
                :to="'/products/' + activePlatform.slug"
                :class="[
                  'text text-18 weight-700 text-white',
                  {
                    'text-pink': activePlatform.slug ? activePlatform.slug == item.slug : '',
                  },
                ]"
                >{{ item.title }}</RouterLink
              >
            </li>
          </ul>
          <ul class="nav category-nav">
            <li
              v-for="(item, i) in categoriesStore.categories.filter(
                (item) => item.parent.slug === activePlatform.slug,
              )"
              class="nav__item"
              :key="i"
            >
              <RouterLink
                :to="'/products/' + activePlatform.slug + '/' + item.slug"
                class="text text-16 text-white"
                >{{ item.title }}</RouterLink
              >
            </li>
          </ul>
        </div>
        <div class="nav-container" v-if="authStore.isAuth">
          <div class="text text-18 weight-700 text-white" v-if="profileStore.profile.email">
            {{ profileStore.profile.email }}
          </div>
          <ul class="nav profile-nav">
            <li class="nav__item" v-for="(item, i) in profileNavStore.nav" :key="i">
              <RouterLink :to="item.link" class="text text-16 text-white">{{
                $t(item.title)
              }}</RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
