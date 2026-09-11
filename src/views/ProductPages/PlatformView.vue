<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import BaseSelect from '@/components/ui/BaseSelect.vue'
import Breadcrumbs from '@/components/ui/Breadcrumbs.vue'
import PlatformCategoryItem from './components/PlatformCategoryItem.vue'

import { useCategoriesStore } from '@/stores/categories'

const props = defineProps({
  platform: {
    type: String,
    required: true,
  },
})

const { t } = useI18n()
const router = useRouter()

const categoriesStore = useCategoriesStore()

const selectedCategory = ref('')

const currentPlatform = computed(() => {
  const platforms = Array.isArray(categoriesStore.platforms) ? categoriesStore.platforms : []

  return platforms.find((item) => item.slug === props.platform) || null
})

const platformTitle = computed(() => {
  return currentPlatform.value?.title || props.platform
})

const categories = computed(() => {
  const items = Array.isArray(categoriesStore.categories) ? categoriesStore.categories : []

  return items.filter((item) => item.parent?.slug === props.platform)
})

const categoryOptions = computed(() => [
  {
    label: t('All categories'),
    value: 'all',
  },
  ...categories.value.map((item) => ({
    label: t(item.title),
    value: item.slug,
  })),
])

const breadcrumbs = computed(() => [
  {
    title: t('Home'),
    link: '/',
  },
  {
    title: t('Platforms'),
    link: '/products',
  },
  {
    title: platformTitle.value,
  },
])

const goToCategory = (value) => {
  if (!value) return

  router.push(`/products/${props.platform}/${value}`)
}
</script>

<template>
  <main class="platform-page">
    <div class="platform-page__container _cnt-home">
      <Breadcrumbs class="platform-page__breadcrumbs" :items="breadcrumbs" />

      <div class="platform-page__top">
        <div class="platform-page__heading">
          <h1 class="platform-page__title _product-litle">
            {{ platformTitle }}
            {{ $t('keys') }}
          </h1>

          <div class="platform-page__count">
            {{ categories.length }}
            {{ $t('categories') }}
          </div>
        </div>

        <div class="platform-page__filters">
          <BaseSelect
            v-model="selectedCategory"
            class="platform-page__select"
            :label="$t('Genre')"
            :placeholder="$t('Select category')"
            :options="categoryOptions"
            @update:model-value="goToCategory"
          />
        </div>
      </div>

      <div v-if="categories.length" class="platform-page__categories categories">
        <PlatformCategoryItem
          v-for="item in categories"
          :key="item.id"
          :item="item"
          :platform="platform"
        />
      </div>

      <div v-else class="platform-page__empty">
        {{ $t('No categories found') }}
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.platform-page {
  @include header-indent;
  @include adaptiveValue('padding-top', 22, 14);
  @include adaptiveValue('padding-bottom', 104, 32);

  &__breadcrumbs {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 14, 11);
    }
  }

  &__top {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 20px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 20);
    }

    @media (max-width: $md5) {
      align-items: stretch;
      flex-direction: column;
      gap: 14px;
    }
  }

  &__heading {
    min-width: 0;
  }

  &__title {
    text-transform: none;

    &:not(:last-child) {
      margin-bottom: 5px;
    }
  }

  &__count {
    color: var(--seconday-color);

    font-size: 11px;
    line-height: 15px;
    font-weight: 700;

    letter-spacing: 1.5px;
    text-transform: uppercase;
  }

  &__filters {
    display: flex;
    align-items: center;
    gap: 10px;

    @media (max-width: $md5) {
      width: 100%;
    }
  }

  &__select {
    min-width: 190px;

    @media (max-width: $md5) {
      width: 100%;
    }
  }

  &__empty {
    padding: 25px;

    border: 2px solid var(--border-primary-color);
    border-radius: 14px;

    background-color: var(--bg-secondary-color);

    color: var(--seconday-color);

    text-align: center;
  }
}

.categories {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));

  @include adaptiveValue('gap', 20, 10);

  @media (max-width: $md2) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  @media (max-width: $md3) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: $md5) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: $md7) {
    grid-template-columns: 1fr;
  }
}
</style>
