<script setup>
import { useCurrStore } from '@/stores/currencies'
const currStore = useCurrStore()
import { toRefs } from 'vue'
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  itemCurr: {
    type: Object,
    required: false,
  },
})

const { item } = toRefs(props)

function getProductLink(item) {
  if (!item || !item.categories || !item.categories.length) return '/products'

  const parentSlug = item.categories.find((it) => it.parent !== null).parent.slug
  const childSlug = item.categories.find((it) => it.parent !== null).slug

  const titleSlug = item.id

  return `/products/${parentSlug}/${childSlug}/${titleSlug}`
}
</script>

<template>
  <RouterLink :to="getProductLink(item)" class="product-item" v-if="item">
    <div class="product-item-wrapper">
      <div class="img-container" v-if="item.image">
        <img :alt="item.title" class="img" :src="item.image" />
      </div>
      <div class="product-info">
        <div class="product-title text text-14 text-white weight-700" v-if="item.title">
          {{ item.title }}
        </div>
        <div class="product-category text text-white text-14" v-if="item.categories">
          {{ $t(item.categories.find((it) => it.parent !== null).parent.title) }} -
          {{ $t(item.categories.find((it) => it.parent !== null).title) }}
        </div>
        <div
          class="product-price text text-20 text-white flex items-center justify-center"
          v-if="item.price"
        >
          <span class="weight-700">
            {{ item.price }} {{ currStore.currency.symbol }}
          </span>
          <span v-if="item.quantity > 1">(x{{ item.quantity }})</span>
        </div>
      </div>
    </div>
  </RouterLink>
</template>
