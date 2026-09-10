<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { RouterLink } from 'vue-router'
import { useCategoriesStore } from '@/stores/categories'

import { useSocialsStore } from '@/stores/socials'
import { useCurrStore } from '@/stores/currencies'
import { useStaticStore } from '@/stores/static'
import { useSettingsStore } from '@/stores/settings'

const categoriesStore = useCategoriesStore()
const socialsStore = useSocialsStore()
const currStore = useCurrStore()
const staticStore = useStaticStore()
const settingsStore = useSettingsStore()

const selectedCurrency = ref({})

function changeCurr() {
  currStore.setActiveCurrency(selectedCurrency.value)
}

onMounted(() => {
  watchEffect(() => {
    selectedCurrency.value = currStore.currency
  })
})
</script>

<template>
  <div class="section footer">
    <div class="wrapper flex">
      <div class="column">
        <RouterLink to="/" class="logo flex items-center">
          <img alt="getmikey logo" class="img" src="@/assets/img/logo.svg" />
        </RouterLink>
        <div class="text text-18 weight-700">{{ $t('Currency') }}</div>
        <select
          class="select"
          v-if="currStore.currencies"
          @change="changeCurr"
          v-model="selectedCurrency"
        >
          <option v-for="(item, i) in currStore.currencies" :value="item" :key="i">
            {{ item.code }}
          </option>
        </select>

        <div class="requisites text text-14">
          {{ settingsStore.settings.requisites }}
        </div>
      </div>
      <div class="flex flex-1 column-list">
        <div class="column flex-1">
          <div class="text text-18 weight-700">{{ $t('Navigation') }}</div>
          <div class="nav">
            <RouterLink to="/contact-us" class="text text-16 text-white">{{
              $t('Contact us')
            }}</RouterLink>
            <RouterLink to="/faq" class="text text-16 text-white">{{ $t('FAQ') }}</RouterLink>
          </div>
        </div>
        <div class="column flex-1">
          <div class="text text-18 weight-700">{{ $t('Games') }}</div>
          <div class="nav" v-if="categoriesStore.platforms">
            <RouterLink
              :to="'/products/' + item.slug"
              v-for="(item, i) in categoriesStore.platforms"
              :key="i"
              class="text text-16 text-white"
              >{{ item.title }}</RouterLink
            >
          </div>
        </div>
        <div class="column flex-1 flex flex-col justify-between">
          <div>
            <div class="socials flex flex-wrap justify-end" v-if="socialsStore.socials">
              <a
                v-for="(item, i) in socialsStore.socials"
                :key="i"
                target="_blank"
                :href="item.url"
                class="item"
              >
                <img :src="item.image" :alt="item.url" class="img" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="section footer-bottom">
    <div class="wrapper flex items-center justify-between">
      <div class="column flex-1">
        <div class="methods flex items-center flex-wrap">
          <img alt="3ds image" class="img" src="@/assets/img/methods/3ds.svg" />
          <img alt="mc image" class="img" src="@/assets/img/methods/mc.svg" />
          <img alt="visa image" class="img" src="@/assets/img/methods/visa.svg" />
        </div>
      </div>
      <div class="column flex-1">
        <div class="requisites text text-14">
          {{ settingsStore.settings.copyright }}
        </div>
      </div>
      <div class="column flex-1">
        <div class="nav flex items-center justify-end" v-if="staticStore.static">
          <RouterLink
            v-for="(item, i) in staticStore.static"
            :to="'/static/' + item?.title.toLowerCase().replace(/ /g, '-')"
            :key="i"
            class="text text-14 text-white"
            >{{ item.title }}</RouterLink
          >
        </div>
      </div>
    </div>
  </div>
</template>
