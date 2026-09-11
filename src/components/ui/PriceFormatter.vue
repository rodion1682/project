<template>
  <div :class="priceClasses" v-bind="$attrs">
    <div v-if="price !== null && price !== undefined" class="price__number">
      {{ price }}
    </div>
    <div class="price__symbol">
      {{ symbol || currStore.currency?.symbol }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

import { useCurrStore } from '@/stores/currencies'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  class: {
    type: [String, Array, Object],
    default: '',
  },

  size: {
    type: String,
    default: 'size-15', // size-12 | size-15 | size-21 | size-21-market
  },

  price: {
    type: [String, Number],
    default: null,
  },

  symbol: {
    type: String,
    default: '',
  },
})

const currStore = useCurrStore()

const priceClasses = computed(() => ['price', props.size, props.class])
</script>

<style lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.price {
  &__symbol,
  &__number {
    transition: color 0.3s ease 0s;
    color: inherit;
    font-family: inherit;
  }
  &.size-12 {
  }
  &.size-15 {
  }
  &.size-21-market {
    display: flex;
    gap: 6px;
    color: var(--primary-color);
    @include adaptiveValue('font-size', 21, 16);
    @include adaptiveValue('line-height', 25, 22);
    font-family: var(--font-open-sans);
    font-weight: 600;
  }
  &.size-21 {
    display: flex;
    gap: 6px;
    color: var(--orange-color);
    @include adaptiveValue('font-size', 21, 17);
    @include adaptiveValue('line-height', 25, 21);
    font-family: var(--font-gabarito);
    font-weight: 900;
  }
}
</style>
