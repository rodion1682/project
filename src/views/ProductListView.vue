<script setup>
import router from '@/router'
import { useCategoriesStore } from '@/stores/categories'
import { useCurrStore } from '@/stores/currencies'
import { useProductsStore } from '@/stores/products'
import { computed, onMounted, ref, toRefs, watch, watchEffect } from 'vue'
import ProductItem from '../components/ProductItem.vue'

const categoriesStore = useCategoriesStore()
const productsStore = useProductsStore()
const currStore = useCurrStore()

let currentPage = ref(1)
let categoryId = ref(null)

const activeSort = ref('')
const search = ref('')

const props = defineProps({
  platform: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
})

watch(
  () => currStore.currency.code,
  () => {
    if (categoryId.value) {
      filterProducts()
    }
  },
)

watch(
  () => router.currentRoute.value,
  () => {
    search.value = ''
    productsStore.products = []
    productsStore.loader = true
  },
)

function onClickHandler() {
  window.scrollTo(0, 0)
  filterProducts()
}
const categoryTitle = ref('')

const filterProducts = () => {
  productsStore.getProducts(categoryId.value, currentPage.value, activeSort.value, search.value)
}

const handleSearchInput = (event) => {
  search.value = event.target.value.replace(/[^a-zA-Z0-9\s._\-']/g, '')
}

const filteredProducts = computed(() => {
  return productsStore.products.filter((item) => {
    return !item.title?.includes('&#039;')
  })
})

// Debounce the filtering when search input changes
let debounceTimeout = null
watch(search, () => {
  clearTimeout(debounceTimeout)
  debounceTimeout = setTimeout(() => {
    filterProducts()
  }, 1000)
})

onMounted(() => {
  productsStore.products = []
  productsStore.loader = true
  watchEffect(() => {
    if (categoriesStore.categories && categoriesStore.categories.length) {
      if (category.value != 'all') {
        categoryTitle.value = categoriesStore.categories.find(
          (item) => item.slug === category.value,
        ).title
      } else {
        categoryTitle.value = 'All'
      }
    }
    if (
      currStore.currency.symbol &&
      categoriesStore?.platforms?.length &&
      categoriesStore?.categories?.length
    ) {
      if (platform.value != 'all') {
        let platformId = categoriesStore.platforms.filter((item) => item.slug === platform.value)[0]
          .id
        categoryId.value = categoriesStore.categories.filter(
          (item) => item.slug === category.value && item.parent.id === platformId,
        )[0].id
      }

      let debounceTimeout = null
      clearTimeout(debounceTimeout)
      debounceTimeout = setTimeout(() => {
        filterProducts()
      }, 1000)
    }
  })
})

const { platform, category } = toRefs(props)
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
        <div v-if="platform != 'all'" class="text text-14 text-white">/</div>
        <RouterLink
          v-if="platform != 'all'"
          :to="'/products/' + platform"
          class="text text-14 text-white"
          >{{ platform }}</RouterLink
        >
        <div class="text text-14 text-white">/</div>
        <div class="text text-14 text-pink">{{ $t(categoryTitle) }}</div>
      </div>
    </div>
    <div class="section categories-section">
      <div class="wrapper">
        <div class="flex items-center justify-between title-container flex-wrap">
          <div class="text text-24 text-russo uppercase" v-if="platform">
            {{ $t(categoryTitle) }}
          </div>
          <div class="flex flex-wrap items-center">
            <form class="search-input flex items-center justify-end">
              <div class="label">
                <input
                  v-model="search"
                  :placeholder="$t('Search')"
                  type="text"
                  @input="handleSearchInput"
                />
              </div>
            </form>
            <div class="label">
              <select class="select" @change="filterProducts" v-model="activeSort">
                <option value="" disabled selected>{{ $t('Sort by') }}</option>
                <option value="-price">{{ $t('Highest price first') }}</option>
                <option value="price">{{ $t('Lowest price first') }}</option>
              </select>
            </div>
          </div>
        </div>
        <div
          class="list product-list flex flex-wrap justify-center"
          v-if="productsStore.products && productsStore.products.length && !productsStore.loader"
        >
          <div v-for="item in filteredProducts" :key="item.id" class="item">
            <ProductItem :item="item" />
          </div>
        </div>
        <div class="loader" v-if="productsStore.loader" />
        <vue-awesome-paginate
          :total-items="productsStore?.meta?.total"
          :items-per-page="productsStore?.meta?.per_page"
          :max-pages-shown="10"
          v-model="currentPage"
          @click="onClickHandler"
        />
      </div>
    </div>
  </main>
</template>
