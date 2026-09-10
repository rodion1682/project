<script setup>
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useCategoriesStore } from '@/stores/categories'
import { useCurrStore } from '@/stores/currencies'
import { useLoginModalStore } from '@/stores/loginModal'
import { useWishListStore } from '@/stores/wishlist'
import { onMounted, ref, toRefs, watchEffect } from 'vue'
import ProductItem from '../components/ProductItem.vue'

import axios from '@/plugins/axios'

const categoriesStore = useCategoriesStore()
const currStore = useCurrStore()
const authStore = useAuthStore()
const loginModalStore = useLoginModalStore()
const cartStore = useCartStore()
const wishListStore = useWishListStore()

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

import esrbAdultsOnly from '@/assets/icons/esrb/adults_only.svg'
import esrbEveryone from '@/assets/icons/esrb/everyone.svg'
import esrbEveryone10 from '@/assets/icons/esrb/everyone10.svg'
import esrbMature from '@/assets/icons/esrb/mature.svg'
import esrbRatingPending from '@/assets/icons/esrb/rating_pending.svg'
import esrbTeen from '@/assets/icons/esrb/teen.svg'

const esrbIcons = {
  EVERYONE: esrbEveryone,
  'EVERYONE 10+': esrbEveryone10,
  TEEN: esrbTeen,
  MATURE: esrbMature,
  'ADULTS ONLY': esrbAdultsOnly,
  'RATING PENDING': esrbRatingPending,
}

function stripLinks(html) {
  if (!html) return html
  return html.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1')
}

function langFlagClass(code) {
  const cc = langCountryMap[code?.toUpperCase()] || code?.toLowerCase()
  return `fi fi-${cc}`
}

function esrbIcon(rating) {
  return esrbIcons[rating?.toUpperCase()] || null
}

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

const categoryTitle = ref('')
const activeGame = ref({})
const similar = ref([])

const { game, platform, category } = toRefs(props)

function addToCart() {
  if (authStore.isAuth) {
    cartStore.add(activeGame.value.id)
  } else {
    loginModalStore.openModal()
  }
}

function addToFavorites(id) {
  if (authStore.isAuth) {
    if (wishListStore.items.some((obj) => obj.id == id)) {
      wishListStore.remove(id)
    } else {
      wishListStore.add(id)
    }
  } else {
    loginModalStore.openModal()
  }
}
watchEffect(() => {
  if (currStore.currency.code) {
    axios
      .get('products/' + game.value, {
        params: { currency: currStore.currency.code },
      })
      .then((res) => {
        console.log(res.data.data)
        activeGame.value = res.data.data
      })
  }
})
onMounted(() => {
  watchEffect(() => {
    if (
      currStore.currency.symbol &&
      categoriesStore.categories &&
      categoriesStore.categories.length
    ) {
      let categoryId = categoriesStore.categories.find((item) => item.slug == category.value).id
      axios
        .get('catalog/similar', {
          params: { currency: currStore.currency.code, category_id: categoryId },
        })
        .then((res) => {
          similar.value = res.data.data
        })
    }

    if (categoriesStore.categories && categoriesStore.categories.length) {
      categoryTitle.value = categoriesStore.categories.find(
        (item) => item.slug === category.value,
      ).title
    }
  })
})
</script>
<template>
  <main class="main">
    <div class="section breadcrumbs-section">
      <div class="wrapper flex">
        <RouterLink to="/" class="text text-14 text-white">{{ $t('Home') }}</RouterLink>
        <div class="text text-14 text-white">/</div>
        <RouterLink to="/products" class="text text-14 text-white">{{
          $t('Shop Games')
        }}</RouterLink>
        <div class="text text-14 text-white">/</div>
        <RouterLink :to="'/products/' + platform" class="text text-14 text-white">{{
          platform
        }}</RouterLink>
        <div class="text text-14 text-white">/</div>
        <RouterLink
          :to="'/products/' + platform + '/' + category"
          class="text text-14 text-white"
          >{{ $t(categoryTitle) }}</RouterLink
        >
        <div class="text text-14 text-white">/</div>
        <div class="text text-14 text-pink" v-if="activeGame">
          {{ activeGame.title }}
        </div>
      </div>
    </div>
    <div class="section categories-section game-section">
      <div class="wrapper">
        <div
          class="game-content flex items-start justify-between"
          v-if="activeGame && Object.keys(activeGame).length !== 0"
        >
          <RouterLink :to="'/products/' + platform + '/' + category" class="back flex items-center">
            <svg
              width="24"
              height="25"
              viewBox="0 0 24 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 12.5C6.00486 11.9739 6.21684 11.4709 6.59 11.1L10.88 6.79999C11.0674 6.61374 11.3208 6.5092 11.585 6.5092C11.8492 6.5092 12.1026 6.61374 12.29 6.79999C12.3837 6.89296 12.4581 7.00356 12.5089 7.12542C12.5597 7.24728 12.5858 7.37798 12.5858 7.50999C12.5858 7.64201 12.5597 7.77271 12.5089 7.89457C12.4581 8.01643 12.3837 8.12703 12.29 8.21999L9 11.5H19C19.2652 11.5 19.5196 11.6054 19.7071 11.7929C19.8946 11.9804 20 12.2348 20 12.5C20 12.7652 19.8946 13.0196 19.7071 13.2071C19.5196 13.3946 19.2652 13.5 19 13.5H9L12.29 16.79C12.4783 16.977 12.5846 17.2311 12.5856 17.4965C12.5865 17.7618 12.482 18.0167 12.295 18.205C12.108 18.3933 11.8539 18.4996 11.5885 18.5006C11.3232 18.5015 11.0683 18.397 10.88 18.21L6.59 13.91C6.21441 13.5366 6.00223 13.0296 6 12.5Z"
                fill="white"
              />
            </svg>
          </RouterLink>
          <div class="img-container">
            <img :alt="activeGame.image" class="img" :src="activeGame.image" />
          </div>
          <div class="product-info">
            <div class="flex items-center product-title-container">
              <div class="product-title text text-24 text-russo">
                {{ activeGame.title }}
              </div>

              <button
                :class="[
                  'star',
                  { active: wishListStore.items.find((item) => item.id == activeGame.id) },
                ]"
                @click="addToFavorites(activeGame.id)"
              ></button>
            </div>
            <div class="product-price text text-white weight-700 text-24">
              {{ activeGame.price }} {{ currStore.currency.symbol }}
            </div>
            <div class="buttons flex">
              <button class="button w-150 colored" @click="addToCart">
                <span>{{ $t('Order') }}</span>
              </button>
            </div>
            <Transition>
              <div class="text text-14 text-red text-error" v-if="cartStore.error">
                {{ $t(cartStore.error) }}
              </div>
            </Transition>
            <Transition>
              <div class="text text-14 text-green text-error" v-if="cartStore.success">
                {{ $t(cartStore.success) }}
              </div>
            </Transition>
            <Transition>
              <div class="text text-14 text-red text-error" v-if="wishListStore.error">
                {{ $t(wishListStore.error) }}
              </div>
            </Transition>
            <Transition>
              <div class="text text-14 text-green text-error" v-if="wishListStore.success">
                {{ $t(wishListStore.success) }}
              </div>
            </Transition>
            <div
              class="product-about"
              v-if="
                activeGame.developer ||
                activeGame.publisher ||
                activeGame.release_date ||
                activeGame.esrb_rating ||
                activeGame.languages
              "
            >
              <div class="text text-20 text-russo">{{ $t('About the product') }}</div>
              <div class="about-card">
                <div class="about-row" v-if="activeGame.developer">
                  <span class="about-label text text-14 weight-700">{{ $t('Developer') }}:</span>
                  <span class="about-value text text-14">{{ activeGame.developer }}</span>
                </div>
                <div class="about-row" v-if="activeGame.publisher">
                  <span class="about-label text text-14 weight-700">{{ $t('Publisher') }}:</span>
                  <span class="about-value text text-14">{{ activeGame.publisher }}</span>
                </div>
                <div class="about-row" v-if="activeGame.release_date">
                  <span class="about-label text text-14 weight-700">{{ $t('Release date') }}:</span>
                  <span class="about-value text text-14">{{ activeGame.release_date }}</span>
                </div>
                <div class="about-row" v-if="activeGame.esrb_rating">
                  <span class="about-label text text-14 weight-700">{{ $t('Restrictions') }}:</span>
                  <span class="about-value">
                    <img
                      v-if="esrbIcon(activeGame.esrb_rating)"
                      :src="esrbIcon(activeGame.esrb_rating)"
                      :alt="activeGame.esrb_rating"
                      class="esrb-icon"
                    />
                    <span v-else class="text text-14">{{ activeGame.esrb_rating }}</span>
                  </span>
                </div>
                <div class="about-row" v-if="activeGame.languages && activeGame.languages.length">
                  <span class="about-label text text-14 weight-700">{{ $t('Languages') }}:</span>
                  <span class="about-value about-languages">
                    <span
                      v-for="(lang, i) in activeGame.languages"
                      :key="i"
                      :class="langFlagClass(lang.value)"
                      :title="lang.additional_value"
                    ></span>
                  </span>
                </div>
              </div>
            </div>
            <div
              class="product-description text text-16"
              v-if="activeGame.description_html"
              v-html="stripLinks(activeGame.description_html)"
            />
            <div
              class="product-description text text-16"
              v-else-if="activeGame.description"
              v-html="activeGame.description"
            />
          </div>
        </div>
        <div class="game-related" v-if="similar">
          <div class="text text-24 text-russo">{{ $t('Recommended products') }}</div>
          <div class="list product-list flex flex-wrap">
            <div class="item" v-for="(item, i) in similar.splice(0, 5)" :key="i">
              <ProductItem :item="item" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
