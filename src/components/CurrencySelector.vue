<template>
  <div v-show="currStore.currencies" class="select" v-bind="wrapperAttrs">
    <select
      v-model="selectedCurrency"
      class="select__field"
      v-bind="selectAttrs"
      @change="changeCurr"
    >
      <option v-for="(item, i) in currStore.currencies" :key="i" :value="item">
        {{ item.code }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { useCurrStore } from '@/stores/currencies'
import { computed, ref, useAttrs, watchEffect } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()

const currStore = useCurrStore()
const selectedCurrency = ref(null)

const wrapperAttrs = computed(() => {
  return {
    class: attrs.class,
    'data-da': attrs['data-da'],
  }
})

const selectAttrs = computed(() => {
  const rest = { ...attrs }

  delete rest.class
  delete rest['data-da']

  return rest
})

const changeCurr = () => {
  if (!selectedCurrency.value) return

  currStore.setActiveCurrency(selectedCurrency.value)
}

watchEffect(() => {
  selectedCurrency.value = currStore.currency
})
</script>

<style lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.select {
  position: relative;

  min-width: 82px;
  width: fit-content;

  border: 2px solid var(--border-primary-color);
  border-radius: 10px;

  background-color: var(--bg-secondary-color);

  transition:
    border-color 0.3s ease,
    background-color 0.3s ease;
  @media (max-width: $md4) {
    width: 100%;
  }

  &::after {
    content: '';

    position: absolute;
    top: 50%;
    right: 14px;

    width: 8px;
    height: 8px;

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
    min-width: 0;
    min-height: 48px;

    padding: 0 38px 0 15px;

    border: none;
    outline: none;

    appearance: none;
    -webkit-appearance: none;

    background-color: transparent;

    color: var(--primary-color);

    font-family: var(--font-open-sans);
    font-size: 14px;
    font-weight: 700;
    line-height: 100%;

    cursor: pointer;

    option {
      color: var(--primary-color);
      background-color: var(--bg-secondary-color);
    }

    &:disabled {
      cursor: default;
    }
  }

  &:has(.select__field:disabled) {
    opacity: 0.5;
    pointer-events: none;
  }

  @media (max-width: $md7) {
    width: 100%;

    &__field {
      min-height: 45px;
    }
  }
}
</style>
