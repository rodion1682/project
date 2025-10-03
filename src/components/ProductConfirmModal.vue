<template>
  <div class="modal product-confirm-modal flex justify-center items-center">
    <div class="overlay" @click="productModalStore.closeConfirmModal()" />
    <div class="modal-wrapper" v-if="product && Object.keys(product).length">
      <div class="close flex items-center" @click="productModalStore.closeConfirmModal()">
        <div class="text text-white text-12">{{ $t('Close') }}</div>
        <img alt="Close icon" class="img" src="@/assets/imgs/close.svg" />
      </div>
      <div class="modal-form-container flex flex-col items-center text-center">
        <div class="text text-24 weight-700">
          {{ $t('Are you sure want to purchase this prompt?') }}
        </div>
        <div class="price flex items-center justify-between">
          <div class="text text-14 text-slate-gray">{{ $t('Price') }}:</div>
          <div class="text flex items-center justify-center">
            <span class="text-16 weight-700">{{ product.price }}</span>
            <span class="text-16 text-slate-gray">{{ currStore.currency.symbol }}</span>
          </div>
        </div>
        <div class="buttons flex flex-wrap justify-center">
          <button class="button gray w-135" @click="productModalStore.closeConfirmModal()">
            <span>{{ $t('Cancel') }}</span>
          </button>
          <button class="button w-135" @click="buy()">
            <span>{{ $t('Buy') }}</span>
          </button>
        </div>
        <Transition>
          <div class="text text-14 text-red text-error" v-if="productStore.error">
            {{ $t(productStore.error) }}
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductsStore } from '../stores/products'
import { useProductModalStore } from '../stores/productModal'
import { useCurrStore } from '@/stores/currencies'

const productModalStore = useProductModalStore()
const productStore = useProductsStore()
const currStore = useCurrStore()

const imgDomain = ref('')

onMounted(() => {
  imgDomain.value = import.meta.env.VITE_APP_DOMAIN
})

const product = computed(() => productStore?.activeProduct)

function buy() {
  productStore.buy()
}
</script>
