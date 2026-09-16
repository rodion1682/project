<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import BaseButton from '@/components/ui/BaseButton.vue'

import { useCategoriesStore } from '@/stores/categories'

const { t } = useI18n()
const router = useRouter()

const categoriesStore = useCategoriesStore()

const platformConfig = computed(() => [
  {
    title: t('PC'),
    search: ['pc', 'steam'],
    class: 'pc',
  },
  {
    title: t('Xbox'),
    search: ['xbox'],
    class: 'xbox',
  },
  {
    title: t('PlayStation'),
    search: ['playstation', 'ps5', 'ps4', 'ps3'],
    class: 'playstation',
  },
  {
    title: t('Nintendo'),
    search: ['nintendo'],
    class: 'nintendo',
  },
  {
    title: t('Gift cards'),
    path: '/gift-card',
    class: 'gift-cards',
  },
])

const platformItems = computed(() => {
  const platforms = Array.isArray(categoriesStore.platforms) ? categoriesStore.platforms : []

  return platformConfig.value
    .map((config) => {
      if (config.path) {
        return {
          id: config.path,
          title: config.title,
          path: config.path,
          productCount: null,
          class: config.class,
        }
      }

      const platform = platforms.find((item) => {
        const title = String(item.title || '').toLowerCase()
        const slug = String(item.slug || '').toLowerCase()

        return config.search.some((search) => {
          const value = search.toLowerCase()

          return title.includes(value) || slug.includes(value)
        })
      })

      if (!platform) {
        return null
      }

      return {
        id: platform.id,
        title: config.title,
        path: `/products/${platform.slug}`,
        productCount: platform.products_count ?? platform.product_count ?? null,
        class: config.class,
      }
    })
    .filter(Boolean)
})

const goToCatalog = () => {
  router.push('/products')
}
</script>

<template>
  <section class="platforms">
    <div class="platforms__container _cnt-home">
      <div class="platforms__top">
        <div class="platforms__title _h2">
          {{ $t('Pick your platform') }}
        </div>

        <BaseButton class="platforms__catalog" variant="link" icon="arrow" @click="goToCatalog">
          {{ $t('All categories ') }}
        </BaseButton>
      </div>

      <div class="platforms__list">
        <RouterLink
          v-for="platform in platformItems"
          :key="platform.id"
          :to="platform.path"
          class="platforms__item"
          :class="[platform.class, `count-${platformItems.length}`]"
        >
          <div class="platforms__item-title _h5">
            {{ platform.title }}
          </div>

          <div v-if="platform.productCount !== null" class="platforms__item-count">
            {{ platform.productCount }}
            {{ $t('items') }}
          </div>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.platforms {
  @include adaptiveValue('padding-top', 90, 36);

  @media (max-width: $md8) {
    padding-bottom: 32px;
  }

  &__container {
  }

  &__top {
    @media (min-width: $md6) {
      display: flex;
      gap: 20px;
      justify-content: space-between;
      align-items: center;
    }

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 26, 18);
    }
  }

  &__title {
    @media (min-width: $md8) {
      &:not(:last-child) {
        margin-bottom: 5px;
      }
    }
  }

  &__catalog {
    @media (max-width: $md8) {
      @include hide-item;
    }
  }

  &__list {
    display: flex;

    @include adaptiveValue('gap', 20, 12);

    @media (max-width: $md4) {
      gap: 12px;
      flex-wrap: wrap;
    }

    @media (max-width: $md8) {
      gap: 10px;
    }
  }

  &__item {
    @include adaptiveValue('padding-top', 22, 20);
    @include adaptiveValue('padding-bottom', 22, 20);

    padding-left: 20px;
    padding-right: 20px;

    border-radius: 14px;

    @include adaptiveValue('min-height', 168, 67);

    transition: all 0.3s ease 0s;

    border: 2px solid transparent;

    @media (min-width: $md8) {
      &.pc {
        background-color: var(--cyan-color);

        box-shadow: var(--primary-color) 6px 6px 0px;

        .platforms__item-count,
        .platforms__item-title {
          color: var(--primary-color);
        }
      }

      &.xbox {
        background-color: var(--yellow-color);

        box-shadow: var(--hint-primary-color) 6px 6px 0px;

        .platforms__item-count,
        .platforms__item-title {
          color: var(--primary-color);
        }
      }

      &.playstation {
        background-color: var(--bg-secondary-color);

        box-shadow: var(--cyan-color) 6px 6px 0px;

        .platforms__item-count,
        .platforms__item-title {
          color: var(--primary-color);
        }
      }

      &.nintendo {
        background-color: var(--hint-primary-color);

        box-shadow: var(--yellow-color) 6px 6px 0px;

        .platforms__item-count,
        .platforms__item-title {
          color: var(--light-color);
        }
      }

      &.gift-cards {
        background-color: var(--bg-secondary-color);

        box-shadow: var(--hint-primary-color) 6px 6px 0px;

        .platforms__item-count,
        .platforms__item-title {
          color: var(--primary-color);
        }
      }
    }

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--border-primary-color);

        box-shadow: transparent 6px 6px 0px;
      }
    }

    @media (min-width: $md4) {
      &.count-1 {
        flex: 1 1 100%;
      }

      &.count-2 {
        flex: 0 1 50%;
      }

      &.count-3 {
        flex: 0 1 33.333%;
      }

      &.count-4 {
        flex: 0 1 25%;
      }

      &.count-5 {
        flex: 0 1 20%;
      }
    }

    @media (max-width: $md4) {
      flex: 0 1 calc(50% - 6px);
    }

    @media (max-width: $md8) {
      background-color: var(--bg-secondary-color);

      border-color: var(--border-primary-color);

      flex: 1 1 100%;
    }

    &-title {
      @media (max-width: $md8) {
        font-size: 20px;
        line-height: 27px;
        font-weight: 500;
        font-family: var(--font-open-sans);
      }
    }

    &-count {
      letter-spacing: 1.92px;

      font-weight: 700;

      text-transform: uppercase;
    }
  }
}
</style>
