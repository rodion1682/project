<script setup>
import { toRefs, onMounted, ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { useProductsStore } from '../stores/products'
import { useLoginModalStore } from '@/stores/loginModal'
import { useAuthStore } from '@/stores/auth'
const productStore = useProductsStore()
const cartStore = useCartStore()
const authStore = useAuthStore()
const loginModalStore = useLoginModalStore()

const domain = ref('')
const addedId = ref('')

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

function add(id) {
  if (authStore.isAuth) {
    cartStore.add(id)
    addedId.value = id
    setTimeout(function () {
      addedId.value = ''
    }, 3000)
  } else {
    loginModalStore.openModal()
  }
}

const { item } = toRefs(props)

function openProduct(id) {
  productStore.getProductContent(id)
}
onMounted(() => {
  domain.value = import.meta.env.VITE_IMG_DOMAIN
})
</script>

<template>
  <div class="product-item" v-if="item">
    <div class="product-item-wrapper">
      <div class="img-container" @click="openProduct(item.id)">
        <img v-if="item.img_url" :alt="item.img_url" class="img" :src="domain + item.img_url" />
      </div>
      <!-- <div
        :class="[
          'product-price flex items-center justify-center text text-16 line-through text-red',
          { hidden: item.old_price <= item.price },
        ]"
        v-if="item.old_price"
      >
        <span class="weight-700">{{ item.old_price }}</span>
        <img alt="coin icon" class="coin" src="@/assets/image/coin.svg" />
      </div> -->
      <div
        class="product-price flex items-center justify-center text text-24 text-inter"
        v-if="item.price"
      >
        <span class="weight-700 text-orange-red text-40">◇</span>
        <span class="weight-700">{{ item.price }}</span>
      </div>

      <div class="product-info" @click="openProduct(item.id)">
        <div class="product-title text text-16 weight-700 text-inter" v-if="item.title">
          {{ item.title }}
        </div>
        <div
          class="product-type text text-14 weight-500 text-slate-gray text-inter"
          v-if="item.type"
        >
          {{ item.type }}
        </div>
      </div>

      <Transition>
        <div
          class="text text-14 text-green text-error text-inter"
          v-if="item.id == addedId && cartStore.success"
        >
          {{ $t(cartStore.success) }}
        </div>
      </Transition>
      <button class="button small text-dark" @click="add(item.id)">
        <span>{{ $t('Add to cart') }}</span>
      </button>
    </div>
  </div>
</template>
