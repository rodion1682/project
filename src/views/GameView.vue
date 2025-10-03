<script setup>
import { toRefs, computed, ref, defineProps } from 'vue'
import { useProductsStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import { onMounted } from 'vue'

const productsStore = useProductsStore()
const cartStore = useCartStore()

const props = defineProps({
  game: {
    type: String,
    required: true,
  },
})

const domain = ref('')
const { game } = toRefs(props)

const activeGame = computed(() => productsStore.activeProduct)

onMounted(() => {
  productsStore.getProductContent(game.value)
  domain.value = import.meta.env.VITE_IMG_DOMAIN
})
</script>
<template>
  <main class="main">
    <div class="section game-section">
      <div class="wrapper">
        <div class="game-content flex justify-between" v-if="activeGame">
          <div class="img-container">
            <img :alt="activeGame.img_url" class="img" :src="domain + activeGame.img_url" />
          </div>
          <div class="product-info">
            <div class="product-title text text-24 weight-500 uppercase">
              {{ activeGame.title }}
            </div>
            <div class="list">
              <div class="item flex">
                <div class="text text-16 text-slate-gray text-inter">{{ $t('Title') }}:</div>
                <div class="text text-16 text-inter">{{ activeGame.title }}</div>
              </div>
              <div class="item flex">
                <div class="text text-16 text-slate-gray text-inter">{{ $t('Type') }}:</div>
                <div class="text text-16 text-inter">{{ activeGame.type }}</div>
              </div>
              <div class="item flex">
                <div class="text text-16 text-slate-gray text-inter">{{ $t('Quality') }}:</div>
                <div class="text text-16 text-inter">{{ activeGame.quality }}</div>
              </div>
            </div>
          </div>

          <div class="product-price flex flex-col justify-between">
            <div class="text text-16 text-slate-gray text-inter">{{ $t('Price') }}:</div>
            <div class="text text-48 weight-700 text-inter">
              <span class="text-orange-red text-80">◇</span>
              {{ activeGame.price }}
            </div>
            <div class="buttons flex">
              <button class="button small text-dark" @click="cartStore.add(activeGame.id)">
                {{ $t('Add to cart') }}
              </button>
            </div>
          </div>
        </div>

        <Transition>
          <div class="text text-14 text-orange-red text-error text-inter" v-if="cartStore.error">
            {{ cartStore.error }}
          </div>
        </Transition>
        <Transition>
          <div class="text text-14 text-green text-error text-inter" v-if="cartStore.success">
            {{ cartStore.success }}
          </div>
        </Transition>
      </div>
    </div>
  </main>
</template>
