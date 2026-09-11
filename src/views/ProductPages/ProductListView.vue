<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import Loader from '@/components/Loader.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import Breadcrumbs from '@/components/ui/Breadcrumbs.vue'

import { useCategoriesStore } from '@/stores/categories'
import { useCurrStore } from '@/stores/currencies'
import { useProductsStore } from '@/stores/products'
import ProductListItem from './components/ProductListItem.vue'

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

const { t } = useI18n()

const route = useRoute()
const router = useRouter()

const categoriesStore = useCategoriesStore()
const productsStore = useProductsStore()
const currStore = useCurrStore()

const currentPage = ref(1)

const activeSort = ref('')
const activePrice = ref('')
const selectedCategory = ref(props.category)

const search = ref(String(route.query.search || ''))

const debouncedSearch = ref(search.value)

const itemsPerPage = ref(10)

let searchTimeout = null

const updateItemsPerPage = () => {
  const width = window.innerWidth

  let nextValue = 10

  if (width <= 991.98) {
    nextValue = 6
  } else if (width <= 1199.98) {
    nextValue = 8
  }

  if (itemsPerPage.value !== nextValue) {
    itemsPerPage.value = nextValue
    currentPage.value = 1
  }
}

const currentPlatform = computed(() => {
  if (props.platform === 'all') {
    return null
  }

  const platforms = Array.isArray(categoriesStore.platforms) ? categoriesStore.platforms : []

  return platforms.find((item) => item.slug === props.platform) || null
})

const platformTitle = computed(() => {
  if (props.platform === 'all') {
    return t('All')
  }

  return currentPlatform.value?.title || props.platform
})

const platformCategories = computed(() => {
  const categories = Array.isArray(categoriesStore.categories) ? categoriesStore.categories : []

  if (props.platform === 'all') {
    return categories
  }

  return categories.filter((item) => item.parent?.slug === props.platform)
})

const currentCategory = computed(() => {
  if (props.category === 'all') {
    return null
  }

  return platformCategories.value.find((item) => item.slug === props.category) || null
})

const categoryTitle = computed(() => {
  if (props.category === 'all') {
    return t('All')
  }

  return currentCategory.value?.title ? t(currentCategory.value.title) : props.category
})

const categoryId = computed(() => {
  return currentCategory.value?.id || null
})

const breadcrumbs = computed(() => {
  const items = [
    {
      title: t('Home'),
      link: '/',
    },
    {
      title: t('Platforms'),
      link: '/products',
    },
  ]

  if (props.platform !== 'all') {
    items.push({
      title: platformTitle.value,
      link: `/products/${props.platform}`,
    })
  }

  items.push({
    title: categoryTitle.value,
  })

  return items
})

const sortOptions = computed(() => [
  {
    label: t('Best selling'),
    value: '',
  },
])

const priceOptions = computed(() => [
  {
    label: t('Any'),
    value: '',
  },
  {
    label: t('Highest first'),
    value: '-price',
  },
  {
    label: t('Lowest first'),
    value: 'price',
  },
])

const categoryOptions = computed(() => [
  {
    label: t('All'),
    value: 'all',
  },

  ...platformCategories.value.map((item) => ({
    label: t(item.title),
    value: item.slug,
  })),
])

const productSort = computed(() => {
  return activePrice.value || activeSort.value
})

const filteredProducts = computed(() => {
  return productsStore.products.map((item) => ({
    ...item,
    title: item.title?.replaceAll('&#039;', '') || '',
  }))
})

const canFetchProducts = computed(() => {
  if (!currStore.currency?.code) {
    return false
  }

  if (props.platform !== 'all' && !currentPlatform.value) {
    return false
  }

  if (props.category !== 'all' && !currentCategory.value) {
    return false
  }

  return true
})

const fetchProducts = () => {
  if (!canFetchProducts.value) {
    return
  }

  productsStore.getProducts(
    categoryId.value,
    currentPage.value,
    productSort.value,
    debouncedSearch.value,
    itemsPerPage.value,
  )
}

const goToCategory = (value) => {
  if (!value || value === props.category) {
    return
  }

  currentPage.value = 1

  router.push({
    path: `/products/${props.platform}/${value}`,

    query: route.query.search
      ? {
          search: route.query.search,
        }
      : {},
  })
}

const handlePageChange = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

watch(
  () => props.category,
  (value) => {
    selectedCategory.value = value
    currentPage.value = 1
  },
)

watch(
  () => props.platform,
  () => {
    currentPage.value = 1
  },
)

watch(
  () => route.query.search,
  (value) => {
    search.value = String(value || '')
  },
)

watch(search, (value) => {
  clearTimeout(searchTimeout)

  const sanitized = String(value).replace(/[^a-zA-Z0-9\s._\-']/g, '')

  searchTimeout = setTimeout(() => {
    debouncedSearch.value = sanitized
    currentPage.value = 1
  }, 300)
})

watch(
  [
    () => currStore.currency?.code,
    () => categoryId.value,
    () => props.platform,
    () => props.category,
    () => productSort.value,
    () => currentPage.value,
    () => debouncedSearch.value,
    () => itemsPerPage.value,
    () => canFetchProducts.value,
  ],
  () => {
    fetchProducts()
  },
  {
    immediate: true,
  },
)

onMounted(() => {
  updateItemsPerPage()

  window.addEventListener('resize', updateItemsPerPage)
})

onBeforeUnmount(() => {
  clearTimeout(searchTimeout)

  window.removeEventListener('resize', updateItemsPerPage)
})
</script>

<template>
  <main class="products-list-page">
    <div class="products-list-page__container _cnt-home">
      <Breadcrumbs class="products-list-page__breadcrumbs" :items="breadcrumbs" />

      <div class="products-list-page__heading">
        <div class="products-list-page__title _product-litle">
          {{ platformTitle }}

          <span class="products-list-page__platform">
            {{ $t('keys') }}
          </span>

          <span v-if="categoryTitle" class="products-list-page__category">
            {{ categoryTitle }}
          </span>
        </div>
      </div>

      <div class="products-list-page__toolbar">
        <div class="products-list-page__filters">
          <BaseSelect
            v-model="activeSort"
            class="products-list-page__select"
            :label="$t('Sort by')"
            :options="sortOptions"
          />

          <BaseSelect
            v-model="selectedCategory"
            class="products-list-page__select"
            :label="$t('Genre')"
            :options="categoryOptions"
            @update:model-value="goToCategory"
          />

          <BaseSelect
            v-model="activePrice"
            class="products-list-page__select"
            :label="$t('Price')"
            :options="priceOptions"
          />
        </div>

        <div v-if="productsStore.meta?.total !== undefined" class="products-list-page__total">
          {{ productsStore.meta.total }}
          {{ $t('keys') }}
        </div>
      </div>

      <Loader v-if="productsStore.loader" class="products-list-page__loader" />

      <div v-else-if="filteredProducts.length" class="products-list-page__products">
        <ProductListItem
          v-for="item in filteredProducts"
          :key="item.id"
          :item="item"
          class="products-list-page__product"
        />
      </div>

      <div v-else class="products-list-page__empty">
        {{ $t('No products found') }}
      </div>

      <BasePagination
        v-if="productsStore.meta?.total && itemsPerPage"
        v-model="currentPage"
        class="products-list-page__pagination"
        :total-items="productsStore.meta.total"
        :items-per-page="itemsPerPage"
        :max-pages-shown="3"
        @change="handlePageChange"
      />
    </div>
  </main>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.products-list-page {
  @include header-indent;
  @include adaptiveValue('padding-top', 22, 14);
  @include adaptiveValue('padding-bottom', 100, 35);

  display: flex;
  flex-direction: column;
  flex: 1 1 100%;

  &__container {
    width: 100%;

    display: flex;
    flex-direction: column;

    flex: 1 1 100%;
  }

  &__breadcrumbs {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 15, 10);
    }
  }

  &__heading {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 18);
    }
  }

  &__title {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;

    gap: 8px;

    text-transform: none;
  }

  &__platform {
    color: var(--seconday-color);
  }

  &__category {
    color: var(--primary-color);
  }

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 20px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 26, 18);
    }

    @media (max-width: $md5) {
      align-items: stretch;
      flex-direction: column;

      gap: 12px;
    }
  }

  &__filters {
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    gap: 10px;

    @media (max-width: $md5) {
      display: grid;

      grid-template-columns: repeat(3, minmax(0, 1fr));

      width: 100%;
    }
  }

  &__select {
    min-width: 175px;

    @media (max-width: $md5) {
      width: 100%;
      min-width: 0;
    }
  }

  &__total {
    flex: 0 0 auto;

    color: var(--seconday-color);

    font-size: 11px;
    line-height: 15px;
    font-weight: 700;

    letter-spacing: 1.6px;
    text-transform: uppercase;
  }

  &__products {
    display: grid;

    grid-template-columns: repeat(5, minmax(0, 1fr));

    @include adaptiveValue('gap', 20, 10);

    @media (max-width: 1199.98px) {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    @media (max-width: 991.98px) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    @media (max-width: 619.98px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 439.98px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  &__product {
    min-width: 0;
  }

  &__loader {
    display: flex;
    justify-content: center;
  }

  &__empty {
    padding: 30px;

    border: 2px solid var(--border-primary-color);

    border-radius: 14px;

    background-color: var(--bg-secondary-color);

    color: var(--seconday-color);

    text-align: center;
  }

  &__pagination {
    @include adaptiveValue('margin-top', 42, 25);
  }
}
</style>
