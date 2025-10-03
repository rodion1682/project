<template>
  <div class="modal cart-modal flex justify-center items-center">
    <div class="overlay" @click="cartStore.closeModal()" />
    <div class="modal-wrapper">
      <div class="close flex items-center" @click="cartStore.closeModal()">
        <img alt="Close icon" class="img" src="@/assets/imgs/close.svg" />
      </div>
      <div class="modal-form-container text-center">
        <div class="text text-64 weight-500 uppercase">{{ $t('Cart') }}</div>
        <div class="cart-modal__items">
          <template v-for="item in cartStore.cart" :key="item.item_id">
            <div class="cart-modal__item flex items-center justify-between">
              <div class="cart-modal__item-info flex items-center">
                <img
                  :src="domain + item?.item?.img_url"
                  alt="Item"
                  class="cart-modal__item-image"
                />
                <div class="cart-modal__item-info-text">
                  <p class="cart-modal__item-info-name text text-inter text-14">
                    {{ item?.item?.title }}
                  </p>
                </div>
              </div>
              <div class="cart-modal__item-price flex items-center">
                <div
                  class="cart-modal__item-price-text flex items-center text text-24 weight-700 text-inter"
                >
                  <span class="text-36">◇</span>
                  <span>{{ item?.item?.price.toFixed(2) }}</span>
                </div>
                <img
                  src="@/assets/img/bin.svg"
                  alt="Remove"
                  class="cart-modal__item-price-icon"
                  @click="cartStore.remove(item.item_id)"
                />
              </div>
            </div>
          </template>
        </div>
        <div class="label input-container steam-input-container">
          <input
            type="text"
            :placeholder="$t('Enter your Steam Trade Link') + ':'"
            v-model="steamId"
          />
        </div>
        <div class="total flex items-center justify-between">
          <div class="left-text">
            <div class="text text-inter text-24">
              {{ $t('Total') }}:
              <span class="weight-700"> <span class="text-36">◇</span>{{ totalSum }}</span>
            </div>
          </div>
          <button
            class="cart-modal__footer-right-checkout-button button text-dark w-190"
            @click="pay"
          >
            <span>{{ $t('Pay') }}</span>
          </button>
        </div>
        <Transition>
          <div
            class="text text-14 text-orange-red text-inter text-error"
            v-if="cartStore.balanceError"
          >
            {{ $t(cartStore.balanceError) }}
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useCartStore } from '@/stores/cart'
const cartStore = useCartStore()

const domain = ref('')
const steamId = ref('')

onMounted(() => {
  domain.value = import.meta.env.VITE_IMG_DOMAIN
})

const totalSum = computed(() => {
  let total = 0
  for (let i in cartStore.cart) {
    let newPrice
    if (cartStore.cart[i].count > 1) {
      newPrice = cartStore.cart[i].count * parseFloat(cartStore.cart[i].item.price)
    } else {
      newPrice = parseFloat(cartStore.cart[i].item.price)
    }
    total += newPrice
  }
  return total.toFixed(2)
})

function pay() {
  cartStore.payFromBalance(steamId.value)
}
</script>
