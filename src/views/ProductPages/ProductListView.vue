<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import Loader from '@/components/Loader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BasePagination from '@/components/ui/BasePagination.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import Breadcrumbs from '@/components/ui/Breadcrumbs.vue'

import { useCategoriesStore } from '@/stores/categories'
import { useCurrStore } from '@/stores/currencies'
import { useProductsStore } from '@/stores/products'

import SvgIcon from '@/components/ui/icons/SvgIcon.vue'
import { EmptyIcon } from '@/components/ui/icons/index.js'
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
  if (!Array.isArray(productsStore.products)) {
    return []
  }

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

const hasActiveFilters = computed(() => {
  return Boolean(
    activeSort.value || activePrice.value || debouncedSearch.value || props.category !== 'all',
  )
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

const resetFilters = async () => {
  clearTimeout(searchTimeout)

  activeSort.value = ''
  activePrice.value = ''
  search.value = ''
  debouncedSearch.value = ''
  selectedCategory.value = 'all'
  currentPage.value = 1

  const path = `/products/${props.platform}/all`

  if (route.path === path && !Object.keys(route.query).length) {
    fetchProducts()
    return
  }

  await router.push({
    path,
    query: {},
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

      <div v-if="productsStore.loader" class="products-list-page__loader">
        <Loader />
      </div>

      <div v-else-if="filteredProducts.length" class="products-list-page__products">
        <ProductListItem
          v-for="item in filteredProducts"
          :key="item.id"
          :item="item"
          class="products-list-page__product"
        />
      </div>

      <div v-else class="products-list-page__empty">
        <div class="products-list-page__empty-box">
          <SvgIcon :icon="EmptyIcon" class="products-list-page__empty-icon" />
        </div>

        <h2 class="products-list-page__empty-title">
          {{ $t('No products found') }}
        </h2>

        <p class="products-list-page__empty-text">
          {{ $t('Try changing your filters or search to find what you are looking for.') }}
        </p>

        <BaseButton class="products-list-page__reset" @click="resetFilters">
          {{ $t('Reset filters') }}
        </BaseButton>
      </div>

      <BasePagination
        v-if="
          !productsStore.loader &&
          filteredProducts.length &&
          productsStore.meta?.total &&
          itemsPerPage
        "
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
  width: 100%;
  min-width: 0;

  display: flex;
  flex: 1 1 100%;
  flex-direction: column;

  @include header-indent;
  @include adaptiveValue('padding-top', 22, 14);
  @include adaptiveValue('padding-bottom', 100, 35);

  &__container {
    width: 100%;
    min-width: 0;

    display: flex;
    flex: 1 1 100%;
    flex-direction: column;
  }

  &__breadcrumbs {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 15, 10);
    }
  }

  &__heading {
    min-width: 0;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 18);
    }
  }

  &__title {
    min-width: 0;

    display: flex;
    align-items: baseline;
    flex-wrap: wrap;

    text-transform: none;

    @include adaptiveValue('gap', 8, 5);
  }

  &__platform {
    color: var(--seconday-color);
  }

  &__category {
    color: var(--primary-color);
  }

  &__toolbar {
    width: 100%;
    min-width: 0;

    display: flex;
    align-items: center;
    justify-content: space-between;

    @include adaptiveValue('gap', 20, 12);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 12);
    }

    @media (max-width: $md4) {
      align-items: stretch;
      flex-direction: column;

      gap: 14px;
    }
  }

  &__filters {
    width: 100%;
    min-width: 0;

    display: flex;
    flex-wrap: wrap;

    @include adaptiveValue('gap', 14, 8);
  }

  &__select {
    width: fit-content;
    min-width: 0;

    @media (max-width: $md5) {
      flex: 1 1 calc(50% - 4px);
    }

    @media (max-width: $md8) {
      width: 100%;
      flex: 1 1 100%;
    }
  }

  &__total {
    flex: 0 0 auto;

    color: var(--seconday-color);

    font-weight: 400;
    text-transform: uppercase;

    @include adaptiveValue('font-size', 13, 11);
    @include adaptiveValue('line-height', 18, 15);
    @include adaptiveValue('letter-spacing', 1.82, 1.54);
  }

  &__products {
    width: 100%;
    min-width: 0;

    display: grid;

    grid-template-columns: repeat(5, minmax(0, 1fr));

    @include adaptiveValue('gap', 22, 12);

    @media (max-width: 1199.98px) {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    @media (max-width: 991.98px) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    @media (max-width: 619.98px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  &__product {
    width: 100%;
    min-width: 0;
  }

  &__loader {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: center;

    @include adaptiveValue('min-height', 420, 260);
  }

  &__empty {
    width: 100%;

    display: flex;
    align-items: center;
    flex-direction: column;

    margin-left: auto;
    margin-right: auto;

    border: 2px solid var(--border-primary-color);
    border-radius: 14px;

    background-color: var(--bg-secondary-color);

    text-align: center;

    @include adaptiveValue('max-width', 560, 340);
    @include adaptiveValue('padding-top', 70, 35);
    @include adaptiveValue('padding-bottom', 70, 35);
    @include adaptiveValue('padding-left', 40, 18);
    @include adaptiveValue('padding-right', 40, 18);

    &-box {
      display: flex;
      align-items: center;
      justify-content: center;

      flex: 0 0 auto;

      border: 2px solid var(--hint-primary-color);
      border-radius: 14px;

      color: var(--hint-primary-color);

      @include adaptiveValue('width', 64, 48);
      @include adaptiveValue('height', 64, 48);

      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 22, 18);
      }
    }

    &-icon {
      flex: 0 0 auto;

      @include adaptiveValue('width', 27, 20);
      @include adaptiveValue('height', 27, 20);
    }

    &-title {
      margin-top: 0;

      color: var(--primary-color);

      font-family: var(--font-gabarito);
      font-weight: 700;
      line-height: 1.2;

      @include adaptiveValue('font-size', 26, 22);
      @include adaptiveValue('margin-bottom', 10, 8);
    }

    &-text {
      width: 100%;

      margin-top: 0;

      color: var(--seconday-color);

      @include adaptiveValue('max-width', 430, 300);
      @include adaptiveValue('font-size', 14, 13);
      @include adaptiveValue('line-height', 22, 20);
      @include adaptiveValue('margin-bottom', 24, 18);
    }
  }

  &__reset {
    width: fit-content;

    @include adaptiveValue('min-width', 160, 145);
  }

  &__pagination {
    @include adaptiveValue('margin-top', 58, 30);
  }
}
</style>
