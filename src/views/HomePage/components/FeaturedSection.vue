<script setup>
import { computed, watch } from 'vue'

import ProductItem from '@/components/ProductItem.vue'
import { useCategoriesStore } from '@/stores/categories'
import { useCurrStore } from '@/stores/currencies'
import { usePopularStore } from '@/stores/popular'

const categoriesStore = useCategoriesStore()
const popularStore = usePopularStore()
const currStore = useCurrStore()

const featuredProducts = computed(() => {
  if (!Array.isArray(popularStore.products)) {
    return []
  }

  return popularStore.products.slice(0, 8)
})

const linkConfig = [
  {
    title: 'All',
    search: null,
    slug: 'all/all',
    class: 'all',
  },
  {
    title: 'PC',
    search: ['pc', 'steam'],
  },
  {
    title: 'Xbox',
    search: ['xbox'],
  },
  {
    title: 'Nintendo',
    search: ['nintendo'],
  },
  {
    title: 'Gift cards',
    search: ['gift card', 'gift'],
  },
]

const featuredLinks = computed(() => {
  const categories = Array.isArray(categoriesStore.platforms) ? categoriesStore.platforms : []

  return linkConfig
    .map((config) => {
      if (!config.search) {
        return {
          id: 'all',
          title: config.title,
          slug: config.slug,
          class: config.class,
        }
      }

      const category = categories.find((item) => {
        const title = String(item.title || '').toLowerCase()
        const slug = String(item.slug || '').toLowerCase()

        return config.search.some(
          (search) => title.includes(search.toLowerCase()) || slug.includes(search.toLowerCase()),
        )
      })

      if (!category) {
        return null
      }

      return {
        id: category.id,
        title: config.title,
        slug: category.slug,
        class: '',
      }
    })
    .filter(Boolean)
})

watch(
  () => currStore.currency.code,
  (currency) => {
    if (!currency) return

    popularStore.getProducts()
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <div class="featured">
    <div class="featured__container _cnt-home">
      <div class="featured__top">
        <div class="featured__title _h2">
          {{ $t('Featured deals') }}
        </div>

        <div v-if="featuredLinks.length" class="featured__links">
          <RouterLink
            v-for="item in featuredLinks"
            :key="item.id"
            :to="'/products/' + item.slug"
            :class="['featured__link', item.class]"
          >
            {{ $t(item.title) }}
          </RouterLink>
        </div>
      </div>

      <div v-if="featuredProducts.length" class="featured__items">
        <div v-for="item in featuredProducts" :key="item.id" class="featured__item">
          <ProductItem :item="item" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.featured {
  position: relative;
  z-index: 1;
  @include adaptiveValue('margin-top', -85, -62);
  &__container {
  }

  &__top {
    display: flex;
    gap: 20px;
    justify-content: space-between;
    align-items: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 55, 20);
    }
  }

  &__title {
  }

  &__links {
    display: flex;
    gap: 10px;
  }

  &__link {
    min-height: 45px;
    width: fit-content;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    padding-top: 8px;
    padding-bottom: 8px;
    font-weight: 700;
    border-radius: 10px;
    color: var(--bg-eight-color);
    border: 2px solid var(--border-primary-color);
    background-color: var(--bg-secondary-color);
    transition: all 0.3s ease 0s;
    @include adaptiveValue('padding-left', 22, 15);
    @include adaptiveValue('padding-right', 22, 15);
    @media (any-hover: hover) {
      &:hover {
        border-color: transparent;
        color: var(--light-color);
        background-color: var(--hint-primary-color);
      }
    }
    &.all {
      border-color: transparent;
      color: var(--light-color);
      background-color: var(--hint-primary-color);
      @media (any-hover: hover) {
        &:hover {
          color: var(--bg-eight-color);
          border: 2px solid var(--border-primary-color);
          background-color: var(--bg-secondary-color);
        }
      }
    }
  }

  &__items {
    display: flex;
    flex-wrap: wrap;
    @include adaptiveValue('margin-left', -11, -6);
    @include adaptiveValue('margin-right', -11, -6);
    @include adaptiveValue('row-gap', 22, 12);
  }

  &__item {
    flex: 0 1 25%;
    @include adaptiveValue('padding-left', 12, 6);
    @include adaptiveValue('padding-right', 12, 6);
  }
}
</style>
