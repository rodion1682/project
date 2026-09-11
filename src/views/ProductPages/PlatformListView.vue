<script setup>
import { computed } from 'vue'

import Breadcrumbs from '@/components/ui/Breadcrumbs.vue'
import { useCategoriesStore } from '@/stores/categories'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const categoriesStore = useCategoriesStore()

const breadcrumbs = [
  {
    title: t('Home'),
    link: '/',
  },
  {
    title: t('Platforms'),
  },
]

const platforms = computed(() => {
  return Array.isArray(categoriesStore.platforms) ? categoriesStore.platforms : []
})
</script>

<template>
  <main class="products-page">
    <div class="products-page__container _cnt-home">
      <Breadcrumbs class="products-page__breadcrumbs" :items="breadcrumbs" />

      <div class="products-page__title _product-litle">
        {{ $t('Pick your platform') }}
      </div>

      <div v-if="platforms.length" class="products-page__platforms platforms">
        <RouterLink to="/products/all/all" class="platforms__item platforms__item_all">
          <div class="platforms__title">
            {{ $t('All Platforms') }}
          </div>
        </RouterLink>

        <RouterLink
          v-for="item in platforms"
          :key="item.id"
          :to="`/products/${item.slug}`"
          class="platforms__item"
        >
          <div class="platforms__title">
            {{ item.title }}
          </div>
        </RouterLink>
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.products-page {
  @include header-indent;
  @include adaptiveValue('padding-top', 22, 14);
  @include adaptiveValue('padding-bottom', 104, 32);

  &__breadcrumbs {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 14, 11);
    }
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 18);
    }
  }

  &__platforms {
  }
}

.platforms {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  @include adaptiveValue('gap', 20, 10);

  @media (max-width: $md3) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: $md4) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: $md7) {
    grid-template-columns: 1fr;
  }

  &__item {
    min-width: 0;
    @include adaptiveValue('min-height', 120, 50);
    @include adaptiveValue('padding', 22, 18);

    display: flex;
    align-items: center;
    justify-content: center;

    border: 2px solid var(--border-primary-color);
    border-radius: 14px;

    background-color: var(--bg-secondary-color);

    box-shadow: var(--hint-primary-color) 5px 5px 0px;

    transition:
      border-color 0.3s ease,
      background-color 0.3s ease,
      box-shadow 0.3s ease,
      transform 0.3s ease;

    &_all {
      background-color: var(--hint-primary-color);

      .platforms__title {
        color: var(--light-color);
      }
    }

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--hint-primary-color);
        background-color: var(--bg-tenth-color);
        box-shadow: transparent 5px 5px 0px;
        transform: translateY(-3px);
      }

      &_all:hover {
        background-color: var(--hint-primary-color);
      }
    }
  }

  &__title {
    min-width: 0;

    color: var(--primary-color);

    @include adaptiveValue('font-size', 20, 15);
    line-height: 130%;
    font-weight: 700;

    text-align: center;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
