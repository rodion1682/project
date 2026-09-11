<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import Breadcrumbs from '@/components/ui/Breadcrumbs.vue'

import { useCategoriesStore } from '@/stores/categories'
import PlatformCategoryItem from './components/PlatformCategoryItem.vue'

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

const goToCategory = () => {
  if (!selectedCategory.value) return

  router.push(`/products/${props.platform}/${selectedCategory.value}`)
}
</script>

<template>
  <main class="platform-page">
    <div class="platform-page__container _cnt-home">
      <Breadcrumbs class="platform-page__breadcrumbs" :items="breadcrumbs" />

      <div class="platform-page__top">
        <div class="platform-page__heading">
          <h1 class="platform-page__title _h4">
            {{ platformTitle }}
            {{ $t('keys') }}
          </h1>

          <div class="platform-page__count">
            {{ categories.length }}
            {{ $t('categories') }}
          </div>
        </div>

        <div class="platform-page__filters">
          <div class="platform-page__select select-category">
            <select
              v-model="selectedCategory"
              class="select-category__field"
              @change="goToCategory"
            >
              <option value="" disabled>
                {{ $t('Select category') }}
              </option>

              <option value="all">
                {{ $t('All categories') }}
              </option>

              <option v-for="item in categories" :key="item.id" :value="item.slug">
                {{ $t(item.title) }}
              </option>
            </select>
          </div>
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
    min-width: 180px;

    @media (max-width: $md5) {
      width: 100%;
    }
  }

  &__categories {
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

.select-category {
  position: relative;

  border: 2px solid var(--border-primary-color);
  border-radius: 10px;

  background-color: var(--bg-secondary-color);

  transition: border-color 0.3s ease;

  &::after {
    content: '';

    position: absolute;
    top: 50%;
    right: 14px;

    width: 7px;
    height: 7px;

    border-right: 2px solid var(--primary-color);
    border-bottom: 2px solid var(--primary-color);

    transform: translateY(-70%) rotate(45deg);

    pointer-events: none;
  }

  &:focus-within {
    border-color: var(--hint-primary-color);
  }

  @media (any-hover: hover) {
    &:hover {
      border-color: var(--hint-primary-color);
    }
  }

  &__field {
    width: 100%;
    min-height: 44px;

    padding: 0 38px 0 14px;

    border: none;
    outline: none;

    appearance: none;
    -webkit-appearance: none;

    background: transparent;

    color: var(--primary-color);

    font-family: var(--font-open-sans);
    font-size: 13px;
    font-weight: 600;

    cursor: pointer;

    option {
      color: var(--primary-color);
      background-color: var(--bg-secondary-color);
    }
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
