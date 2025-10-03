<template>
  <div class="modal product-modal flex justify-center items-center">
    <div class="overlay" @click="productModalStore.closeModal()" />
    <div class="modal-wrapper" v-if="product && Object.keys(product).length">
      <div class="close flex items-center" @click="productModalStore.closeModal()">
        <img alt="Close icon" class="img" src="@/assets/imgs/close.svg" />
      </div>
      <div class="modal-form-container text-center">
        <div class="product-type text text-14 text-dark-gray text-inter" v-if="product.type">
          {{ product.type }}
        </div>
        <div class="text text-16 weight-700 text-inter text-dark-gray">
          <b>{{ product.title }}</b>
        </div>
        <div class="preview" v-if="product.img_url">
          <img :src="imgDomain + product.img_url" class="img" />
        </div>
        <div class="price flex items-center justify-center">
          <span class="text-24 weight-700 text-red">{{ product.price }}</span>
          <img alt="coin icon" class="coin" src="@/assets/image/coin.svg" />
        </div>
        <button class="button w-184 dark" @click="add(product.id)">
          <span>{{ $t('Add to cart') }}</span>
        </button>
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductsStore } from '../stores/products'
import { useProductModalStore } from '../stores/productModal'
import { useLoginModalStore } from '@/stores/loginModal'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const productModalStore = useProductModalStore()
const productStore = useProductsStore()
const loginModalStore = useLoginModalStore()
const authStore = useAuthStore()
const cartStore = useCartStore()

const imgDomain = ref('')

onMounted(() => {
  imgDomain.value = import.meta.env.VITE_IMG_DOMAIN
})

const product = computed(() => productStore?.activeProduct)

function add(id) {
  if (authStore.isAuth) {
    cartStore.add(id)
  } else {
    productModalStore.closeModal()
    loginModalStore.openModal()
  }
}
</script>
