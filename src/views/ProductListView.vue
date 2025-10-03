<script setup>
import { onMounted, ref, watchEffect, watch } from 'vue'
import ProductItem from '../components/ProductItem.vue'
import { useProductsStore } from '@/stores/products'
import { useCategoriesStore } from '@/stores/categories'
import { useGlobalStore } from '@/stores/global'
import { useCurrStore } from '@/stores/currencies'

import { useRoute } from 'vue-router'
const route = useRoute()

const globalStore = useGlobalStore()
const categoriesStore = useCategoriesStore()
const productsStore = useProductsStore()
const currStore = useCurrStore()

const currentPage = ref(1)
const itemsPerPage = ref(12)
const totalItems = ref(null)
const activeCategory = ref([])
const activeQuality = ref([])
const activeSort = ref('desc')
const domain = ref('')

watch(
  () => globalStore.languages,
  () => {
    filterProducts()
  },
)

const onClickHandler = () => {
  window.scrollTo(0, 0)
  filterProducts()
}

const filterProducts = () => {
  productsStore.getProducts(
    activeCategory.value,
    activeSort.value,
    currentPage.value,
    route.params.listType,
    activeQuality.value,
  )
}

const clear = () => {
  activeQuality.value = []
  activeCategory.value = []
}

watch(
  () => activeCategory.value,
  () => {
    if (activeCategory.value) {
      currentPage.value = 1
    }
  },
)
watch(
  () => activeQuality.value,
  () => {
    if (activeQuality.value) {
      currentPage.value = 1
    }
  },
)

watch(
  () => activeSort.value,
  () => {
    if (activeSort.value) {
      currentPage.value = 1
    }
  },
)

watchEffect(() => {
  if (currStore.currency.symbol) {
    filterProducts()
  }
})
onMounted(() => {
  domain.value = import.meta.env.VITE_APP_DOMAIN

  watchEffect(() => {
    if (productsStore.products) {
      totalItems.value = productsStore.meta.total
      console.log(totalItems.value)
    }
  })
})
</script>
<template>
  <main class="main">
    <div class="section product-section">
      <div class="wrapper product-section-wrapper flex items-start">
        <div class="filters">
          <div class="filters-wrapper flex justify-between">
            <div class="text text-24 weight-500 uppercase">{{ $t('Filter') }}</div>
            <button class="flex items-center clear-button" @click="clear()">
              <span class="text text-14 text-bright-cyan text-inter">{{ $t('Reset all') }}</span>
            </button>
          </div>
          <div class="filters-wrapper">
            <div class="text text-16 text-orange-red uppercase text-inter">{{ $t('SORT') }}:</div>
            <div class="label input-container">
              <select class="select" v-model="activeSort">
                <option value="desc">{{ $t('Highest price first') }}</option>
                <option value="asc">{{ $t('Lowest price first') }}</option>
              </select>
            </div>
          </div>
          <div class="filters-wrapper">
            <div class="text-container categories-container" v-if="categoriesStore.categories">
              <div class="text text-16 text-orange-red uppercase text-inter">{{ $t('Type') }}:</div>
              <div class="button-list flex-col flex flex-wrap">
                <div
                  :class="['button', { active: !activeCategory.length }]"
                  @click="activeCategory = []"
                >
                  <span>{{ $t('All types') }}</span>
                </div>
                <label
                  v-for="(item, i) in categoriesStore.categories"
                  :key="i"
                  :class="['button', { active: activeCategory.includes(item) }]"
                >
                  <input type="checkbox" name="category" :value="item" v-model="activeCategory" />
                  <span>{{ $t(item) }}</span>
                </label>
              </div>
            </div>
          </div>
          <div class="filters-wrapper">
            <div class="text-container categories-container" v-if="categoriesStore.qualities">
              <div class="text text-16 text-orange-red uppercase text-inter">
                {{ $t('Quality') }}:
              </div>
              <div class="button-list flex flex-col flex-wrap">
                <div
                  :class="['button', { active: !activeQuality.length }]"
                  @click="activeQuality = []"
                >
                  <span>{{ $t('All quality') }}</span>
                </div>
                <label
                  v-for="(item, i) in categoriesStore.qualities"
                  :key="i"
                  :class="['button', { active: activeQuality.includes(item) }]"
                >
                  <input type="checkbox" name="quality" :value="item" v-model="activeQuality" />
                  <span>{{ $t(item) }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div class="product-list-container">
          <div class="loader" v-if="productsStore.loader"></div>
          <div
            class="list product-list flex flex-wrap"
            v-if="productsStore.products && !productsStore.loader"
          >
            <template v-for="(item, i) in productsStore.products" :key="i">
              <div
                class="item"
                v-if="item && (!item.old_price || (item.old_price && item.old_price >= item.price))"
              >
                <ProductItem :item="item" :itemCurr="currStore.currency.symbol" />
              </div>
            </template>
          </div>
          <vue-awesome-paginate
            :total-items="totalItems"
            :items-per-page="itemsPerPage"
            :max-pages-shown="10"
            v-model="currentPage"
            @click="onClickHandler"
          />
        </div>
      </div>
    </div>
  </main>
</template>
