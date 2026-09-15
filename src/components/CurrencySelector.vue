<script setup>
import { computed, ref, useAttrs, watch } from 'vue'

import BaseSelect from '@/components/ui/BaseSelect.vue'

import { useCurrStore } from '@/stores/currencies'

defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()

const currStore = useCurrStore()

const selectedCurrency = ref('')
const isChanging = ref(false)

const currencies = computed(() => {
  return Array.isArray(currStore.currencies) ? currStore.currencies : []
})

const currencyOptions = computed(() => {
  return currencies.value.map((currency) => ({
    label: currency.code,
    value: currency.code,
    currency,
  }))
})

const selectAttrs = computed(() => {
  const rest = {
    ...attrs,
  }

  delete rest.class
  delete rest['data-da']

  return rest
})

const changeCurrency = async (option) => {
  const currency = option?.currency

  if (!currency || isChanging.value) {
    return
  }

  if (currency.code === currStore.currency?.code) {
    return
  }

  isChanging.value = true

  try {
    await currStore.setActiveCurrency(currency)
  } finally {
    isChanging.value = false
  }
}

watch(
  () => currStore.currency?.code,
  (currencyCode) => {
    selectedCurrency.value = currencyCode || ''
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <BaseSelect
    v-if="currencies.length"
    v-model="selectedCurrency"
    :options="currencyOptions"
    option-label="label"
    option-value="value"
    :disabled="isChanging"
    :class="['currency-select', attrs.class]"
    :data-da="attrs['data-da']"
    v-bind="selectAttrs"
    @change="changeCurrency"
  />
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.currency-select {
  width: fit-content;
  min-width: 82px;

  @media (max-width: $md4) {
    width: 100%;
  }

  :deep(.base-select__control) {
    min-height: 48px;

    padding-left: 15px;
    padding-right: 38px;

    font-size: 14px;
    line-height: 100%;
    font-weight: 700;
  }

  :deep(.base-select__value) {
    color: var(--primary-color);

    font-size: 14px;
    line-height: 100%;
    font-weight: 700;
  }

  :deep(.base-select__chevron) {
    right: 14px;

    border-color: var(--primary-color);
  }

  :deep(.base-select__dropdown) {
    min-width: 100%;
  }

  :deep(.base-select__option) {
    font-size: 14px;
    font-weight: 600;
  }

  @media (max-width: $md7) {
    width: 100%;

    :deep(.base-select__control) {
      min-height: 45px;
    }
  }
}
</style>
