<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, toRefs, watch } from 'vue'

import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import axios from '@/plugins/axios'

import BaseButton from '@/components/ui/BaseButton.vue'
import Breadcrumbs from '@/components/ui/Breadcrumbs.vue'
import PriceFormatter from '@/components/ui/PriceFormatter.vue'
import { FavoriteIcon } from '@/components/ui/icons'
import SvgIcon from '@/components/ui/icons/SvgIcon.vue'

import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useCategoriesStore } from '@/stores/categories'
import { useCurrStore } from '@/stores/currencies'
import { useLoginModalStore } from '@/stores/loginModal'
import { useWishListStore } from '@/stores/wishlist'
import ProductListItem from '../ProductPages/components/ProductListItem.vue'

const props = defineProps({
  platform: {
    type: String,
    required: true,
  },

  category: {
    type: String,
    required: true,
  },

  game: {
    type: String,
    required: true,
  },
})

const { platform, category, game } = toRefs(props)

const { t } = useI18n()
const router = useRouter()

const categoriesStore = useCategoriesStore()
const currStore = useCurrStore()
const authStore = useAuthStore()
const loginModalStore = useLoginModalStore()
const cartStore = useCartStore()
const wishListStore = useWishListStore()

const activeGame = ref(null)
const similar = ref([])

const isCartLoading = ref(false)
const isFavoriteLoading = ref(false)
const isGameLoading = ref(false)
const isSimilarLoading = ref(false)

const isDescriptionExpanded = ref(false)
const descriptionRef = ref(null)
const descriptionHeight = ref('81px')
const canExpandDescription = ref(false)

const langCountryMap = {
  EN: 'gb',
  DE: 'de',
  FR: 'fr',
  IT: 'it',
  PL: 'pl',
  PT: 'pt',
  ES: 'es',
  RU: 'ru',
  NL: 'nl',
  JA: 'jp',
  KO: 'kr',
  ZH: 'cn',
  NO: 'no',
  DA: 'dk',
  SV: 'se',
  FI: 'fi',
  CS: 'cz',
  HU: 'hu',
  RO: 'ro',
  TR: 'tr',
  AR: 'sa',
  TH: 'th',
  UK: 'ua',
  VI: 'vn',
  HR: 'hr',
  BG: 'bg',
  EL: 'gr',
  SK: 'sk',
  PT_BR: 'br',
  ID: 'id',
  MS: 'my',
  HI: 'in',
  HE: 'il',
}

const currentPlatform = computed(() => {
  const platforms = Array.isArray(categoriesStore.platforms) ? categoriesStore.platforms : []

  return platforms.find((item) => item.slug === platform.value) || null
})

const currentCategory = computed(() => {
  const categories = Array.isArray(categoriesStore.categories) ? categoriesStore.categories : []

  return (
    categories.find(
      (item) => item.slug === category.value && item.parent?.slug === platform.value,
    ) || null
  )
})

const platformTitle = computed(() => {
  return currentPlatform.value?.title || platform.value
})

const categoryTitle = computed(() => {
  return currentCategory.value?.title || category.value
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
    link: `/products/${platform.value}`,
  },
  {
    title: t(categoryTitle.value),
    link: `/products/${platform.value}/${category.value}`,
  },
  {
    title: activeGame.value?.title || '',
  },
])

const isInCart = computed(() => {
  if (!activeGame.value?.id || !cartStore.cart || !Array.isArray(cartStore.cart.products)) {
    return false
  }

  return cartStore.cart.products.some((item) => item.id === activeGame.value.id)
})

const isFavorite = computed(() => {
  if (!activeGame.value?.id || !Array.isArray(wishListStore.items)) {
    return false
  }

  return wishListStore.items.some((item) => item.id === activeGame.value.id)
})

const productCategory = computed(() => {
  if (!Array.isArray(activeGame.value?.categories)) {
    return null
  }

  return activeGame.value.categories.find((item) => item.parent !== null) || null
})

const productTags = computed(() => {
  const tags = []

  if (productCategory.value?.parent?.title) {
    tags.push(productCategory.value.parent.title)
  }

  if (productCategory.value?.title) {
    tags.push(productCategory.value.title)
  }

  if (activeGame.value?.region) {
    tags.push(activeGame.value.region)
  }

  return tags
})

const specs = computed(() => {
  const product = activeGame.value

  if (!product) {
    return []
  }

  const result = []

  if (product.developer) {
    result.push({
      label: t('Developer'),
      value: product.developer,
    })
  }

  if (product.publisher) {
    result.push({
      label: t('Publisher'),
      value: product.publisher,
    })
  }

  if (product.release_date) {
    result.push({
      label: t('Release date'),
      value: product.release_date,
    })
  }

  if (product.region) {
    result.push({
      label: t('Region'),
      value: product.region,
    })
  }

  if (product.activation) {
    result.push({
      label: t('Activation'),
      value: product.activation,
    })
  }

  if (product.esrb_rating) {
    result.push({
      label: t('Restrictions'),
      value: product.esrb_rating,
    })
  }

  return result
})

const stripLinks = (html) => {
  if (!html) return ''

  return html.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1')
}

const langFlagClass = (code) => {
  const cc = langCountryMap[code?.toUpperCase()] || code?.toLowerCase()

  return `fi fi-${cc}`
}

const getCollapsedDescriptionHeight = () => {
  return window.innerWidth <= 439.98 ? 66 : 81
}

const updateDescriptionHeight = async () => {
  await nextTick()

  if (!descriptionRef.value) {
    return
  }

  const collapsedHeight = getCollapsedDescriptionHeight()

  const fullHeight = descriptionRef.value.scrollHeight

  canExpandDescription.value = fullHeight > collapsedHeight + 2

  descriptionHeight.value = isDescriptionExpanded.value ? `${fullHeight}px` : `${collapsedHeight}px`
}

const toggleDescription = async () => {
  isDescriptionExpanded.value = !isDescriptionExpanded.value

  await updateDescriptionHeight()
}

const handleDescriptionResize = () => {
  updateDescriptionHeight()
}

const fetchGame = async () => {
  const productId = game.value
  const currency = currStore.currency?.code

  if (!productId || !currency || isGameLoading.value) {
    return
  }

  isGameLoading.value = true

  try {
    const res = await axios.get(`products/${productId}`, {
      params: {
        currency,
      },
    })

    activeGame.value = res.data?.data ?? res.data?.payload ?? res.data ?? null

    isDescriptionExpanded.value = false

    await nextTick()
    await updateDescriptionHeight()
  } catch (error) {
    activeGame.value = null

    console.error('Failed to load product:', error)
  } finally {
    isGameLoading.value = false
  }
}

const fetchSimilar = async () => {
  const currency = currStore.currency?.code

  const categoryId = currentCategory.value?.id

  if (!currency || !categoryId || isSimilarLoading.value) {
    return
  }

  isSimilarLoading.value = true

  try {
    const res = await axios.get('catalog/similar', {
      params: {
        currency,
        category_id: categoryId,
      },
    })

    const items = res.data?.data ?? res.data?.payload ?? []

    similar.value = Array.isArray(items) ? items.slice(0, 5) : []
  } catch (error) {
    similar.value = []

    console.error('Failed to load similar products:', error)
  } finally {
    isSimilarLoading.value = false
  }
}

const toggleCart = async () => {
  if (!authStore.isAuth) {
    loginModalStore.openModal()
    return false
  }

  if (!activeGame.value?.id || isCartLoading.value) {
    return false
  }

  isCartLoading.value = true

  try {
    if (isInCart.value) {
      await cartStore.remove(activeGame.value.id)
    } else {
      await cartStore.add(activeGame.value.id)
    }

    return true
  } finally {
    isCartLoading.value = false
  }
}

const buyNow = async () => {
  if (!authStore.isAuth) {
    loginModalStore.openModal()
    return
  }

  if (!activeGame.value?.id || isCartLoading.value) {
    return
  }

  if (isInCart.value) {
    router.push('/cart')
    return
  }

  isCartLoading.value = true

  try {
    await cartStore.add(activeGame.value.id)

    if (!cartStore.error) {
      router.push('/cart')
    }
  } finally {
    isCartLoading.value = false
  }
}

const toggleFavorite = async () => {
  if (!authStore.isAuth) {
    loginModalStore.openModal()
    return
  }

  if (!activeGame.value?.id || isFavoriteLoading.value) {
    return
  }

  isFavoriteLoading.value = true

  try {
    if (isFavorite.value) {
      await wishListStore.remove(activeGame.value)
    } else {
      await wishListStore.add(activeGame.value)
    }
  } finally {
    isFavoriteLoading.value = false
  }
}

watch(
  [() => game.value, () => currStore.currency?.code],
  async ([productId, currency], oldValues) => {
    if (!productId || !currency) {
      return
    }

    const [oldProductId, oldCurrency] = oldValues || []

    if (activeGame.value && productId === oldProductId && currency === oldCurrency) {
      return
    }

    await fetchGame()
  },
  {
    immediate: true,
  },
)

watch(
  [() => currentCategory.value?.id, () => currStore.currency?.code],
  async ([categoryId, currency], oldValues) => {
    if (!categoryId || !currency) {
      return
    }

    const [oldCategoryId, oldCurrency] = oldValues || []

    if (similar.value.length && categoryId === oldCategoryId && currency === oldCurrency) {
      return
    }

    await fetchSimilar()
  },
  {
    immediate: true,
  },
)

watch(
  () => [activeGame.value?.description_html, activeGame.value?.description],
  async () => {
    isDescriptionExpanded.value = false

    await nextTick()
    await updateDescriptionHeight()
  },
)

onMounted(() => {
  window.addEventListener('resize', handleDescriptionResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleDescriptionResize)
})
</script>

<template>
  <main class="game-page">
    <div class="game-page__container _cnt-home">
      <Breadcrumbs class="game-page__breadcrumbs" :items="breadcrumbs" />

      <div v-if="activeGame" class="game-page__main">
        <div class="game-page__image _ibg">
          <img v-if="activeGame.image" :src="activeGame.image" :alt="activeGame.title" />
        </div>

        <div class="game-page__info game-info">
          <div class="game-info__head">
            <div v-if="productTags.length" class="game-info__tags">
              <div v-for="tag in productTags" :key="tag" class="game-info__tag">
                {{ $t(tag) }}
              </div>
            </div>

            <h1 class="game-info__title">
              {{ activeGame.title }}
            </h1>
          </div>

          <div class="game-info__purchase purchase">
            <div class="purchase__top">
              <div class="purchase__price">
                <PriceFormatter
                  size="size-44"
                  :price="activeGame.price"
                  class="purchase__price-current"
                />

                <div class="purchase__vat">
                  {{ $t('incl. vat') }}
                </div>
              </div>

              <div class="purchase__stock">
                <div class="purchase__stock-label">
                  {{ $t('In stock') }}
                </div>

                <div class="purchase__stock-value">
                  {{ $t('Available') }}
                </div>
              </div>
            </div>

            <div class="purchase__actions">
              <BaseButton
                variant="secondary"
                class="purchase__button"
                :disabled="isCartLoading"
                @click="buyNow"
              >
                {{ $t('Buy now') }}
              </BaseButton>

              <BaseButton
                class="purchase__button"
                :variant="isInCart ? 'bordered' : 'primary'"
                :icon="isInCart ? 'close' : ''"
                :disabled="isCartLoading"
                @click="toggleCart"
              >
                <template v-if="!isInCart">
                  {{ $t('Add to cart') }}
                </template>
              </BaseButton>

              <button
                type="button"
                class="purchase__favorite"
                :class="{
                  active: isFavorite,
                }"
                :disabled="isFavoriteLoading"
                @click="toggleFavorite"
              >
                <SvgIcon :icon="FavoriteIcon" class="purchase__favorite-icon" />
              </button>
            </div>

            <div class="purchase__delivery">
              <span class="purchase__delivery-icon"> ✉ </span>

              <span>
                {{
                  $t('Key lands in your email and account library about a minute after payment.')
                }}
              </span>
            </div>
          </div>

          <div
            v-if="activeGame.description_html || activeGame.description"
            class="game-info__about"
          >
            <div class="game-info__label">
              {{ $t('About this game') }}
            </div>

            <div
              class="game-info__description-wrapper"
              :class="{
                expanded: isDescriptionExpanded,
              }"
              :style="{
                maxHeight: descriptionHeight,
              }"
            >
              <div ref="descriptionRef" class="game-info__description">
                <div
                  v-if="activeGame.description_html"
                  v-html="stripLinks(activeGame.description_html)"
                />

                <div v-else v-html="activeGame.description" />
              </div>
            </div>

            <button
              v-if="canExpandDescription"
              type="button"
              class="game-info__description-toggle"
              @click="toggleDescription"
            >
              {{ isDescriptionExpanded ? $t('View less') : $t('View more') }}
            </button>
          </div>

          <div v-if="specs.length || activeGame.languages?.length" class="game-info__specs">
            <div v-for="spec in specs" :key="spec.label" class="game-info__spec">
              <div class="game-info__spec-label">
                {{ spec.label }}
              </div>

              <div class="game-info__spec-value">
                {{ spec.value }}
              </div>
            </div>

            <div v-if="activeGame.languages?.length" class="game-info__spec">
              <div class="game-info__spec-label">
                {{ $t('Languages') }}
              </div>

              <div class="game-info__languages">
                <span
                  v-for="(lang, index) in activeGame.languages"
                  :key="index"
                  :class="langFlagClass(lang.value)"
                  :title="lang.additional_value || lang.value"
                />
              </div>
            </div>
          </div>

          <Transition>
            <div v-if="cartStore.error" class="game-info__message error">
              {{ $t(cartStore.error) }}
            </div>
          </Transition>

          <Transition>
            <div v-if="cartStore.success" class="game-info__message success">
              {{ $t(cartStore.success) }}
            </div>
          </Transition>

          <Transition>
            <div v-if="wishListStore.error" class="game-info__message error">
              {{ $t(wishListStore.error) }}
            </div>
          </Transition>

          <Transition>
            <div v-if="wishListStore.success" class="game-info__message success">
              {{ $t(wishListStore.success) }}
            </div>
          </Transition>
        </div>
      </div>

      <section v-if="similar.length" class="game-page__recommended recommended">
        <div class="recommended__top">
          <h2 class="recommended__title _h2">
            <div class="recommended__title-desk">{{ $t('You might also like') }}</div>
            <div class="recommended__title-mob">{{ $t('Recommended') }}</div>
          </h2>

          <div class="recommended__line" />

          <RouterLink :to="`/products/${platform}/${category}`" class="recommended__link">
            {{ $t('All keys') }}
          </RouterLink>
        </div>

        <div class="recommended__list">
          <ProductListItem
            v-for="item in similar"
            :key="item.id"
            :item="item"
            class="recommended__item"
          />
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.game-page {
  @include header-indent;
  @include adaptiveValue('padding-top', 22, 14);
  @include adaptiveValue('padding-bottom', 100, 32);

  &__breadcrumbs {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 38, 14);
    }
  }

  &__main {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    @include adaptiveValue('gap', 56, 24);

    @media (max-width: $md3) {
      display: flex;
      flex-direction: column;

      gap: 22px;
    }
  }

  &__image {
    width: 100%;
    aspect-ratio: 4 / 3;

    overflow: hidden;

    border: 2px solid var(--border-primary-color);

    @include adaptiveValue('border-radius', 14, 10);

    background-color: var(--bg-secondary-color);
  }

  &__info {
    min-width: 0;
  }

  &__recommended {
    @include adaptiveValue('margin-top', 96, 32);
  }
}

.game-info {
  display: flex;
  flex-direction: column;

  @include adaptiveValue('gap', 26, 16);

  &__head {
    display: flex;
    flex-direction: column;

    @include adaptiveValue('gap', 14, 10);
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;

    gap: 8px;
  }

  &__tag {
    padding: 5px 10px;

    border: 2px solid var(--border-primary-color);

    border-radius: 6px;

    color: var(--seconday-color);

    @include adaptiveValue('font-size', 11, 10);

    @include adaptiveValue('line-height', 16, 14);

    font-weight: 700;

    @include adaptiveValue('letter-spacing', 1.78, 1.4);

    text-transform: uppercase;

    &:first-child {
      color: var(--hint-primary-color);
    }

    @media (max-width: $md8) {
      padding: 4px 8px;
    }
  }

  &__title {
    margin: 0;

    color: var(--primary-color);

    font-family: var(--font-gabarito);

    font-weight: 900;

    @include adaptiveValue('font-size', 44, 28);

    @include adaptiveValue('line-height', 47, 31);

    @include adaptiveValue('letter-spacing', -1.32, -0.84);
  }

  &__about {
    display: flex;
    flex-direction: column;

    @include adaptiveValue('gap', 14, 10);
  }

  &__label {
    color: var(--seconday-color);

    @include adaptiveValue('font-size', 11, 10);

    @include adaptiveValue('line-height', 15, 14);

    @include adaptiveValue('letter-spacing', 2.2, 2);

    text-transform: uppercase;
  }

  &__description-wrapper {
    position: relative;

    overflow: hidden;

    transition: max-height 0.5s ease;

    &:not(.expanded) {
      &::after {
        content: '';

        position: absolute;

        right: 0;
        bottom: 0;
        left: 0;

        height: 24px;

        pointer-events: none;

        background: linear-gradient(to bottom, transparent, var(--bg-primary-color));
      }
    }
  }

  &__description {
    color: var(--bg-eight-color);

    @include adaptiveValue('font-size', 15, 13);

    @include adaptiveValue('line-height', 27, 22);

    :deep(p) {
      margin: 0;

      &:not(:last-child) {
        margin-bottom: 10px;
      }
    }
  }

  &__description-toggle {
    width: fit-content;

    padding: 0;

    border: none;

    background-color: transparent;

    color: var(--hint-primary-color);

    font-family: var(--font-open-sans);

    font-size: 13px;
    line-height: 18px;
    font-weight: 600;

    cursor: pointer;

    transition: opacity 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        opacity: 0.7;
      }
    }

    @media (max-width: $md8) {
      font-size: 12px;
      line-height: 16px;
    }
  }

  &__specs {
    display: grid;

    grid-template-columns: repeat(2, minmax(0, 1fr));

    column-gap: 40px;

    @media (max-width: $md8) {
      grid-template-columns: 1fr;
    }
  }

  &__spec {
    min-width: 0;

    padding: 14px 0;

    display: flex;
    align-items: baseline;
    justify-content: space-between;

    gap: 16px;

    border-bottom: 2px solid var(--border-primary-color);

    @media (max-width: $md8) {
      padding: 12px 0;
    }
  }

  &__spec-label {
    color: var(--seconday-color);

    font-size: 13px;

    @media (max-width: $md8) {
      font-size: 12px;
    }
  }

  &__spec-value {
    color: var(--primary-color);

    font-size: 14px;

    text-align: right;

    @media (max-width: $md8) {
      font-size: 13px;
    }
  }

  &__languages {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;

    gap: 6px;
  }

  &__message {
    padding: 10px 12px;

    border-radius: 8px;

    font-size: 13px;

    &.error {
      color: var(--error-color);

      background-color: var(--error-bg-color);
    }

    &.success {
      color: var(--success-color);

      background-color: var(--bg-sixth-color);
    }
  }
}

.purchase {
  @include adaptiveValue('padding-top', 30, 20);

  @include adaptiveValue('padding-bottom', 30, 20);

  @include adaptiveValue('padding-left', 34, 22);

  @include adaptiveValue('padding-right', 34, 22);

  display: flex;
  flex-direction: column;

  @include adaptiveValue('gap', 22, 16);

  border: 2px solid var(--border-primary-color);

  @include adaptiveValue('border-radius', 14, 10);

  background-color: var(--bg-secondary-color);

  &__top {
    display: flex;
    align-items: flex-end;

    gap: 20px;
  }

  &__price {
    display: flex;
    align-items: baseline;

    gap: 12px;
  }

  &__price-current {
    color: var(--primary-color);

    :deep(.price__number),
    :deep(.price__symbol) {
      font-family: var(--font-gabarito);

      font-weight: 900;

      @include adaptiveValue('font-size', 44, 30);

      line-height: 1;
    }
  }

  &__vat {
    color: var(--seconday-color);

    font-size: 12px;
  }

  &__stock {
    margin-left: auto;

    display: flex;
    flex-direction: column;
    align-items: flex-end;

    gap: 4px;

    @media (max-width: $md8) {
      display: none;
    }
  }

  &__stock-label {
    color: var(--seconday-color);

    font-size: 11px;

    letter-spacing: 1.5px;
    text-transform: uppercase;
  }

  &__stock-value {
    color: var(--primary-color);

    font-size: 14px;
  }

  &__actions {
    display: grid;

    grid-template-columns:
      minmax(0, 1fr)
      minmax(0, 1fr)
      52px;

    gap: 14px;

    @media (max-width: $md8) {
      grid-template-columns: repeat(2, minmax(0, 1fr));

      gap: 10px;
    }
  }

  &__button {
    width: 100%;
  }

  &__favorite {
    width: 52px;
    height: 52px;

    display: flex;
    align-items: center;
    justify-content: center;

    border: 2px solid var(--border-primary-color);

    border-radius: 10px;

    background-color: transparent;

    color: var(--seconday-color);

    cursor: pointer;

    transition:
      color 0.3s ease,
      border-color 0.3s ease;

    &.active {
      color: var(--hint-primary-color);

      border-color: var(--hint-primary-color);
    }

    &:disabled {
      opacity: 0.5;
      pointer-events: none;
    }

    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);

        border-color: var(--hint-primary-color);
      }
    }

    @media (max-width: $md8) {
      display: none;
    }
  }

  &__favorite-icon {
    min-width: 20px;
    height: 20px;
  }

  &__delivery {
    color: var(--seconday-color);

    @include adaptiveValue('font-size', 13, 12);

    @include adaptiveValue('line-height', 18, 19.2);

    @media (min-width: $md8) {
      display: flex;
      align-items: center;

      gap: 12px;

      @include adaptiveValue('padding-top', 22, 18);

      border-top: 2px solid var(--border-primary-color);
    }
  }

  &__delivery-icon {
    color: var(--hint-primary-color);

    @media (max-width: $md8) {
      @include hide-item;
    }
  }
}

.recommended {
  &__top {
    display: flex;
    align-items: baseline;

    gap: 28px;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 16);
    }
  }

  &__title {
    flex: 0 0 auto;
    &-desk {
      @media (max-width: $md8) {
        @include hide-item;
      }
    }
    &-mob {
      @media (min-width: $md8) {
        @include hide-item;
      }
      @media (max-width: $md8) {
        font-size: 22px !important;
        line-height: 25px !important;
        font-weight: 500 !important;
        letter-spacing: -0.66px !important;
        font-family: var(--font-open-sans) !important;
      }
    }
  }

  &__line {
    flex: 1 1 auto;

    height: 1px;

    background: linear-gradient(to right, var(--border-primary-color), transparent);

    @media (max-width: $md8) {
      display: none;
    }
  }

  &__link {
    flex: 0 0 auto;

    color: var(--hint-primary-color);

    font-size: 13px;
    font-weight: 600;

    @media (max-width: $md8) {
      display: none;
    }
  }

  &__list {
    display: grid;

    grid-template-columns: repeat(5, minmax(0, 1fr));

    gap: 20px;

    @media (max-width: $md2) {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }

    @media (max-width: $md3) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }
  }

  &__item {
    min-width: 0;
    @media (max-width: $md3) {
      &:last-child {
        @include hide-item;
      }
    }
  }
}
</style>
