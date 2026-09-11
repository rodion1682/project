<script setup>
import { computed, onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import axios from '@/plugins/axios'

import BaseButton from '@/components/ui/BaseButton.vue'
import Breadcrumbs from '@/components/ui/Breadcrumbs.vue'
import PriceFormatter from '@/components/ui/PriceFormatter.vue'
import SvgIcon from '@/components/ui/icons/SvgIcon.vue'

import { FavoriteIcon } from '@/components/ui/icons'

import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useCategoriesStore } from '@/stores/categories'
import { useCurrStore } from '@/stores/currencies'
import { useLoginModalStore } from '@/stores/loginModal'
import { useWishListStore } from '@/stores/wishlist'
import ProductListItem from './ProductPages/components/ProductListItem.vue'

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
  const game = activeGame.value

  if (!game) {
    return []
  }

  const result = []

  if (game.developer) {
    result.push({
      label: t('Developer'),
      value: game.developer,
    })
  }

  if (game.publisher) {
    result.push({
      label: t('Publisher'),
      value: game.publisher,
    })
  }

  if (game.release_date) {
    result.push({
      label: t('Release date'),
      value: game.release_date,
    })
  }

  if (game.region) {
    result.push({
      label: t('Region'),
      value: game.region,
    })
  }

  if (game.activation) {
    result.push({
      label: t('Activation'),
      value: game.activation,
    })
  }

  if (game.esrb_rating) {
    result.push({
      label: t('Restrictions'),
      value: game.esrb_rating,
    })
  }

  return result
})

const languagesText = computed(() => {
  if (!Array.isArray(activeGame.value?.languages)) {
    return ''
  }

  return activeGame.value.languages
    .map((lang) => lang.value || lang.additional_value)
    .filter(Boolean)
    .join(', ')
})
const stripLinks = (html) => {
  if (!html) return ''

  return html.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1')
}

const langFlagClass = (code) => {
  const cc = langCountryMap[code?.toUpperCase()] || code?.toLowerCase()

  return `fi fi-${cc}`
}

const fetchGame = async () => {
  if (!currStore.currency?.code || !game.value) {
    return
  }

  try {
    const res = await axios.get(`products/${game.value}`, {
      params: {
        currency: currStore.currency.code,
      },
    })

    activeGame.value = res.data.data
  } catch (error) {
    activeGame.value = null

    console.error('Failed to load product:', error)
  }
}

const fetchSimilar = async () => {
  if (!currStore.currency?.code || !currentCategory.value?.id) {
    return
  }

  try {
    const res = await axios.get('catalog/similar', {
      params: {
        currency: currStore.currency.code,
        category_id: currentCategory.value.id,
      },
    })

    similar.value = Array.isArray(res.data.data) ? res.data.data.slice(0, 5) : []
  } catch (error) {
    similar.value = []

    console.error('Failed to load similar products:', error)
  }
}

const addToCart = async () => {
  if (!authStore.isAuth) {
    loginModalStore.openModal()
    return false
  }

  if (!activeGame.value?.id || isCartLoading.value) {
    return false
  }

  isCartLoading.value = true

  try {
    await cartStore.add(activeGame.value.id)

    return !cartStore.error
  } finally {
    isCartLoading.value = false
  }
}

const buyNow = async () => {
  const added = await addToCart()

  if (!added) {
    return
  }

  router.push('/cart')
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
      await wishListStore.remove(activeGame.value.id)
    } else {
      await wishListStore.add(activeGame.value.id)
    }
  } finally {
    isFavoriteLoading.value = false
  }
}

watch(
  [() => game.value, () => currStore.currency?.code],
  () => {
    fetchGame()
  },
  {
    immediate: true,
  },
)

watch(
  [() => currentCategory.value?.id, () => currStore.currency?.code],
  () => {
    fetchSimilar()
  },
  {
    immediate: true,
  },
)

onMounted(() => {
  if (authStore.isAuth && !wishListStore.items?.length) {
    wishListStore.get()
  }
})
</script>

<template>
  <main class="game-page">
    <div class="game-page__container _cnt-home">
      <Breadcrumbs class="game-page__breadcrumbs" :items="breadcrumbs" />

      <div v-if="activeGame" class="game-page__main">
        <div class="game-page__gallery gallery">
          <div class="gallery__main _ibg">
            <img v-if="activeGame.image" :src="activeGame.image" :alt="activeGame.title" />
          </div>
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
                  size="size-21-market"
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
                variant="primary"
                class="purchase__button"
                :disabled="isCartLoading"
                @click="addToCart"
              >
                {{ $t('Add to cart') }}
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
              v-if="activeGame.description_html"
              class="game-info__description"
              v-html="stripLinks(activeGame.description_html)"
            />

            <div v-else class="game-info__description" v-html="activeGame.description" />
          </div>

          <div v-if="specs.length || languagesText" class="game-info__specs">
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
            {{ $t('You might also like') }}
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
      gap: 30px;
    }

    @media (max-width: $md8) {
      display: flex;
      flex-direction: column;
      gap: 22px;
    }
  }

  &__gallery {
    min-width: 0;
  }

  &__info {
    min-width: 0;
  }

  &__recommended {
    @include adaptiveValue('margin-top', 96, 32);
  }
}

.gallery {
  display: flex;
  flex-direction: column;

  @include adaptiveValue('gap', 14, 8);

  &__main {
    position: relative;

    width: 100%;
    padding-bottom: 75%;

    overflow: hidden;

    border: 2px solid var(--border-primary-color);
    @include adaptiveValue('border-radius', 14, 10);

    background-color: var(--bg-secondary-color);
  }

  &__list {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));

    @include adaptiveValue('gap', 14, 8);
  }

  &__item {
    width: 100%;
    padding-bottom: 75%;

    overflow: hidden;

    border: 2px solid var(--border-primary-color);
    @include adaptiveValue('border-radius', 10, 8);

    background-color: var(--bg-secondary-color);
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

    font-size: 11px;
    line-height: 14px;
    font-weight: 700;

    letter-spacing: 1.5px;
    text-transform: uppercase;

    &:first-child {
      color: var(--hint-primary-color);
      border-color: var(--border-primary-color);
    }

    @media (max-width: $md8) {
      padding: 4px 8px;

      font-size: 10px;
      line-height: 13px;
    }
  }

  &__title {
    margin: 0;

    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-weight: 900;

    @include adaptiveValue('font-size', 44, 28);
    @include adaptiveValue('line-height', 47, 31);

    letter-spacing: -0.03em;
  }

  &__about {
    display: flex;
    flex-direction: column;

    @include adaptiveValue('gap', 14, 10);
  }

  &__label {
    color: var(--seconday-color);

    font-size: 11px;
    line-height: 15px;

    letter-spacing: 2px;
    text-transform: uppercase;

    @media (max-width: $md8) {
      font-size: 10px;
    }
  }

  &__description {
    color: var(--seconday-color);

    @include adaptiveValue('font-size', 15, 13);
    @include adaptiveValue('line-height', 27, 22);

    :deep(p) {
      margin: 0;

      &:not(:last-child) {
        margin-bottom: 10px;
      }
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

    gap: 5px;
  }

  &__languages-text {
    margin-left: 5px;

    color: var(--primary-color);

    font-size: 13px;
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
  padding: 28px 32px;

  display: flex;
  flex-direction: column;

  @include adaptiveValue('gap', 22, 16);

  border: 2px solid var(--border-primary-color);
  @include adaptiveValue('border-radius', 14, 10);

  background-color: var(--bg-secondary-color);

  @media (max-width: $md8) {
    padding: 18px 20px;
  }

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
      border-color 0.3s ease,
      background-color 0.3s ease;

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
    padding-top: 20px;

    display: flex;
    align-items: center;

    gap: 12px;

    border-top: 2px solid var(--border-primary-color);

    color: var(--seconday-color);

    font-size: 13px;
    line-height: 18px;

    @media (max-width: $md8) {
      padding-top: 14px;

      font-size: 12px;
      line-height: 18px;
    }
  }

  &__delivery-icon {
    color: var(--hint-primary-color);
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
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    @media (max-width: $md8) {
      grid-template-columns: repeat(2, minmax(0, 1fr));

      gap: 12px;
    }
  }

  &__item {
    min-width: 0;
  }
}
</style>
