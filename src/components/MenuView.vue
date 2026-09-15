<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { useCategoriesStore } from '@/stores/categories'
import { useMenuStore } from '@/stores/menu'

const route = useRoute()

const categoriesStore = useCategoriesStore()
const menuStore = useMenuStore()

const activePlatform = ref(null)

const platforms = computed(() => {
  return Array.isArray(categoriesStore.platforms) ? categoriesStore.platforms : []
})

const categories = computed(() => {
  return Array.isArray(categoriesStore.categories) ? categoriesStore.categories : []
})

const activePlatformSlug = computed(() => {
  if (activePlatform.value === 'all') {
    return ''
  }

  return activePlatform.value?.slug || ''
})

const activeCategories = computed(() => {
  if (!activePlatformSlug.value) {
    return []
  }

  return categories.value.filter((item) => {
    return item?.parent?.slug === activePlatformSlug.value
  })
})

const setActivePlatform = (platform) => {
  activePlatform.value = platform
}

const setDefaultPlatform = () => {
  if (!platforms.value.length) {
    activePlatform.value = null
    return
  }

  const routePlatform = String(route.params.platform || '')

  if (routePlatform === 'all') {
    activePlatform.value = 'all'
    return
  }

  const routeItem = platforms.value.find((item) => {
    return String(item?.slug || '') === routePlatform
  })

  if (routeItem) {
    activePlatform.value = routeItem
    return
  }

  if (
    activePlatform.value &&
    activePlatform.value !== 'all' &&
    platforms.value.some((item) => item.id === activePlatform.value.id)
  ) {
    return
  }

  activePlatform.value = platforms.value[0]
}

const lockPageScroll = () => {
  if (typeof window === 'undefined') {
    return
  }

  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

  document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`)

  document.documentElement.classList.add('menu-open')
  document.body.classList.add('menu-open')
}

const unlockPageScroll = () => {
  if (typeof window === 'undefined') {
    return
  }

  document.documentElement.classList.remove('menu-open')
  document.body.classList.remove('menu-open')

  document.documentElement.style.removeProperty('--scrollbar-width')
}

const closeMenu = () => {
  menuStore.closeMenu()
}

watch(
  platforms,
  () => {
    setDefaultPlatform()
  },
  {
    immediate: true,
  },
)

watch(
  () => route.params.platform,
  () => {
    setDefaultPlatform()
  },
)

watch(
  () => menuStore.isMenuOpen,
  (isOpen) => {
    if (isOpen) {
      lockPageScroll()
      return
    }

    unlockPageScroll()
  },
  {
    immediate: true,
  },
)

onMounted(() => {
  if (menuStore.isMenuOpen) {
    lockPageScroll()
  }
})

onBeforeUnmount(() => {
  unlockPageScroll()
})
</script>

<template>
  <div class="menu">
    <button type="button" class="menu__overlay" :aria-label="$t('Close menu')" @click="closeMenu" />

    <div class="menu__body">
      <div class="menu__scroll">
        <div class="menu__container _cnt-home">
          <div class="menu__content">
            <div class="menu__catalog">
              <div class="menu__column menu__column_platforms">
                <div class="menu__caption">
                  {{ $t('Platforms') }}
                </div>

                <nav class="menu__platforms">
                  <RouterLink
                    to="/products/all/all"
                    class="menu__platform"
                    :class="{
                      active: activePlatform === 'all',
                    }"
                    @mouseenter="setActivePlatform('all')"
                    @focus="setActivePlatform('all')"
                    @click="closeMenu"
                  >
                    <span class="menu__platform-title">
                      {{ $t('All platforms') }}
                    </span>

                    <span class="menu__platform-arrow" />
                  </RouterLink>

                  <RouterLink
                    v-for="platform in platforms"
                    :key="platform.id ?? platform.slug"
                    :to="`/products/${platform.slug}`"
                    class="menu__platform"
                    :class="{
                      active: activePlatformSlug === platform.slug,
                    }"
                    @mouseenter="setActivePlatform(platform)"
                    @focus="setActivePlatform(platform)"
                    @click="closeMenu"
                  >
                    <span class="menu__platform-title">
                      {{ platform.title }}
                    </span>

                    <span
                      v-if="platform.products_count ?? platform.product_count"
                      class="menu__platform-count"
                    >
                      {{ platform.products_count ?? platform.product_count }}
                    </span>

                    <span class="menu__platform-arrow" />
                  </RouterLink>
                </nav>
              </div>

              <div class="menu__column menu__column_categories">
                <template v-if="activePlatform === 'all'">
                  <div class="menu__caption">
                    {{ $t('Browse catalog') }}
                  </div>

                  <div class="menu__all">
                    <div class="menu__all-title">
                      {{ $t('All platforms') }}
                    </div>

                    <div class="menu__all-text">
                      {{ $t('Browse games and products from every available platform.') }}
                    </div>

                    <RouterLink to="/products/all/all" class="menu__browse" @click="closeMenu">
                      {{ $t('Browse all products') }}

                      <span class="menu__browse-arrow" />
                    </RouterLink>
                  </div>
                </template>

                <template v-else>
                  <div class="menu__category-heading">
                    <div class="menu__caption">
                      {{ $t('Categories') }}
                    </div>

                    <RouterLink
                      v-if="activePlatformSlug"
                      :to="`/products/${activePlatformSlug}`"
                      class="menu__view-all"
                      @click="closeMenu"
                    >
                      {{ $t('View all') }}
                    </RouterLink>
                  </div>

                  <div v-if="activeCategories.length" class="menu__categories">
                    <RouterLink
                      v-for="category in activeCategories"
                      :key="category.id ?? category.slug"
                      :to="`/products/${activePlatformSlug}/${category.slug}`"
                      class="menu__category"
                      @click="closeMenu"
                    >
                      <span class="menu__category-title">
                        {{ category.title }}
                      </span>

                      <span class="menu__category-arrow" />
                    </RouterLink>
                  </div>

                  <div v-else class="menu__empty">
                    {{ $t('No categories available') }}
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.menu {
  position: fixed;

  top: var(--header-height);
  right: 0;
  bottom: 0;
  left: 0;

  width: 100%;
  min-width: 320px;
  min-height: 0;

  z-index: var(--menu-z-index);

  font-family: var(--font-open-sans);

  overflow: hidden;

  &__overlay {
    position: absolute;

    inset: 0;

    width: 100%;
    height: 100%;

    padding: 0;

    border: 0;

    background-color: rgba(15, 27, 45, 0.35);

    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);

    cursor: default;
  }

  &__body {
    position: relative;

    z-index: 1;

    width: 100%;
    max-height: 100%;

    display: flex;
    flex-direction: column;

    border-bottom: 2px solid var(--border-primary-color);

    background-color: var(--bg-secondary-color);

    box-shadow: 0 18px 45px rgba(15, 27, 45, 0.14);

    overflow: hidden;
  }

  &__scroll {
    width: 100%;
    min-width: 0;
    min-height: 0;

    max-height: calc(100dvh - var(--header-height));

    overflow-x: hidden;
    overflow-y: auto;

    overscroll-behavior-y: contain;

    -webkit-overflow-scrolling: touch;

    scrollbar-gutter: stable;
  }

  &__container {
    width: 100%;
    min-width: 0;
  }

  &__content {
    width: 100%;
    min-width: 0;

    @include adaptiveValue('padding-top', 30, 20);
    @include adaptiveValue('padding-bottom', 34, 22);
  }

  &__catalog {
    width: 100%;
    min-width: 0;

    display: grid;
    grid-template-columns: minmax(220px, 0.32fr) minmax(0, 1fr);

    @include adaptiveValue('gap', 48, 20);
  }

  &__column {
    min-width: 0;

    &_categories {
      padding-left: 2px;
    }
  }

  &__caption {
    color: var(--seconday-color);

    font-weight: 700;
    text-transform: uppercase;

    @include adaptiveValue('font-size', 11, 10);
    @include adaptiveValue('line-height', 16, 14);
    @include adaptiveValue('letter-spacing', 1.54, 1.4);
    @include adaptiveValue('margin-bottom', 14, 10);
  }

  &__platforms {
    min-width: 0;

    display: flex;
    flex-direction: column;

    @include adaptiveValue('gap', 8, 6);
  }

  &__platform {
    position: relative;

    width: 100%;
    min-width: 0;

    display: flex;
    align-items: center;

    @include adaptiveValue('gap', 10, 7);
    @include adaptiveValue('min-height', 48, 42);
    @include adaptiveValue('padding-left', 15, 11);
    @include adaptiveValue('padding-right', 15, 11);

    border: 2px solid transparent;
    border-radius: 10px;

    color: var(--primary-color);

    background-color: transparent;

    transition:
      color 0.25s ease,
      border-color 0.25s ease,
      background-color 0.25s ease,
      transform 0.25s ease;

    &.active {
      border-color: var(--hint-primary-color);

      background-color: var(--bg-third-color);

      color: var(--hint-primary-color);

      .menu__platform-arrow {
        border-color: var(--hint-primary-color);
      }
    }

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--hint-primary-color);

        background-color: var(--bg-third-color);

        color: var(--hint-primary-color);

        transform: translateX(2px);

        .menu__platform-arrow {
          border-color: var(--hint-primary-color);
        }
      }
    }
  }

  &__platform-title {
    min-width: 0;

    flex: 1 1 auto;

    overflow: hidden;

    font-family: var(--font-gabarito);

    @include adaptiveValue('font-size', 16, 14);

    line-height: 1.2;
    font-weight: 700;

    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__platform-count {
    flex: 0 0 auto;

    color: var(--seconday-color);

    @include adaptiveValue('font-size', 11, 10);

    line-height: 16px;
    font-weight: 700;
  }

  &__platform-arrow,
  &__category-arrow,
  &__browse-arrow {
    flex: 0 0 auto;

    width: 7px;
    height: 7px;

    border-top: 2px solid currentColor;
    border-right: 2px solid currentColor;

    transform: rotate(45deg);
  }

  &__category-heading {
    min-width: 0;

    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    @include adaptiveValue('gap', 15, 10);
  }

  &__view-all {
    flex: 0 0 auto;

    color: var(--hint-primary-color);

    @include adaptiveValue('font-size', 12, 11);

    line-height: 16px;
    font-weight: 700;

    transition: color 0.25s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--primary-color);
      }
    }
  }

  &__categories {
    width: 100%;
    min-width: 0;

    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));

    @include adaptiveValue('gap', 12, 7);
  }

  &__category {
    width: 100%;
    min-width: 0;

    display: flex;
    align-items: center;
    justify-content: space-between;

    @include adaptiveValue('gap', 12, 8);
    @include adaptiveValue('min-height', 46, 40);
    @include adaptiveValue('padding-top', 9, 7);
    @include adaptiveValue('padding-right', 14, 10);
    @include adaptiveValue('padding-bottom', 9, 7);
    @include adaptiveValue('padding-left', 14, 10);

    border: 2px solid var(--border-primary-color);
    border-radius: 10px;

    background-color: var(--bg-primary-color);

    color: var(--primary-color);

    transition:
      color 0.25s ease,
      border-color 0.25s ease,
      background-color 0.25s ease,
      transform 0.25s ease;

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--hint-primary-color);

        background-color: var(--bg-third-color);

        color: var(--hint-primary-color);

        transform: translateY(-1px);
      }
    }
  }

  &__category-title {
    min-width: 0;

    overflow: hidden;

    @include adaptiveValue('font-size', 14, 12);

    line-height: 18px;
    font-weight: 600;

    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__category-arrow {
    width: 6px;
    height: 6px;

    color: var(--seconday-color);
  }

  &__empty {
    width: 100%;
    min-width: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    @include adaptiveValue('min-height', 120, 90);
    @include adaptiveValue('padding', 20, 14);

    border: 2px dashed var(--border-primary-color);
    border-radius: 10px;

    color: var(--seconday-color);

    @include adaptiveValue('font-size', 13, 12);
    @include adaptiveValue('line-height', 20, 18);

    text-align: center;
  }

  &__all {
    width: 100%;
    min-width: 0;

    @include adaptiveValue('padding', 24, 16);

    border: 2px solid var(--border-primary-color);
    border-radius: 12px;

    background-color: var(--bg-primary-color);
  }

  &__all-title {
    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-weight: 700;

    @include adaptiveValue('font-size', 22, 18);
    @include adaptiveValue('line-height', 28, 24);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 8, 6);
    }
  }

  &__all-text {
    max-width: 460px;

    color: var(--seconday-color);

    @include adaptiveValue('font-size', 14, 12);
    @include adaptiveValue('line-height', 21, 18);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 14);
    }
  }

  &__browse {
    width: fit-content;

    display: inline-flex;
    align-items: center;

    @include adaptiveValue('gap', 10, 7);
    @include adaptiveValue('min-height', 42, 38);
    @include adaptiveValue('padding-left', 16, 12);
    @include adaptiveValue('padding-right', 16, 12);

    border-radius: 9px;

    background-color: var(--hint-primary-color);

    color: var(--light-color);

    @include adaptiveValue('font-size', 13, 12);

    line-height: 18px;
    font-weight: 700;

    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--light-color);

        transform: translateY(-2px);

        box-shadow: 4px 4px 0 var(--yellow-color);
      }
    }
  }

  @media (max-width: $md2) {
    &__catalog {
      grid-template-columns: minmax(190px, 0.34fr) minmax(0, 1fr);
    }

    &__categories {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: $md4) {
    &__categories {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: $md5) {
    &__catalog {
      grid-template-columns: 1fr;
    }

    &__platform {
      min-height: 44px;
    }

    &__column_categories {
      padding-left: 0;

      @include adaptiveValue('padding-top', 10, 6);
    }
  }
}
</style>

<style lang="scss">
html.menu-open,
body.menu-open {
  overflow: hidden;
  overscroll-behavior: none;
}

body.menu-open {
  padding-right: var(--scrollbar-width, 0px);

  touch-action: none;
}

html.menu-open .header {
  padding-right: var(--scrollbar-width, 0px);
}
</style>
