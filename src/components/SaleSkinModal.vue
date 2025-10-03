<template>
  <div class="modal offer-details-modal sale-skin-modal flex justify-center items-center">
    <div class="overlay" @click="offerDetailsModalStore.close()" />
    <div class="modal-wrapper">
      <div class="close flex items-center" @click="offerDetailsModalStore.close()">
        <img alt="Close icon" class="img" src="@/assets/imgs/close.svg" />
      </div>
      <div class="modal-form-container text-center">
        <div class="text text-40 weight-500 uppercase">{{ $t('Sell your skin') }}</div>
        <div class="text text-16 text-inter text-orange-red">{{ $t('Skin name') }}:</div>
        <label class="label">
          <div class="input-container">
            <input type="text" v-model="name" :placeholder="$t('Skin name')" /></div
        ></label>
        <div class="text text-16 text-inter text-orange-red">{{ $t('Desired price') }}:</div>
        <label class="label">
          <div class="input-container">
            <input type="text" v-model="price" :placeholder="$t('Desired price')" />
            <div class="text text-16 text-inter">
              {{ currStore.currency.symbol }}
            </div>
          </div></label
        >

        <div class="text text-16 text-inter text-orange-red">{{ $t('Quality') }}:</div>
        <label class="label">
          <div class="input-container">
            <select class="select" v-model="quality">
              <option value="" selected disabled>{{ $t('Quality') }}</option>
              <option v-for="(item, i) in categoriesStore.qualities" :value="item" :key="i">
                {{ item }}
              </option>
            </select>
          </div></label
        >
        <div class="text text-16 text-inter text-orange-red">{{ $t('Details') }}:</div>
        <label class="label">
          <div class="input-container">
            <input
              type="text"
              v-model="item_url"
              :placeholder="$t('Steam inventory link to skin')"
            /></div
        ></label>
        <button class="button text-dark w-190" @click="submit()">
          {{ $t('Confirm') }}
        </button>

        <Transition>
          <div
            class="text text-14 text-orange-red text-error text-inter"
            v-if="offerDetailsModalStore.error"
          >
            {{ offerDetailsModalStore.error }}
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useOfferDetailsModalStore } from '@/stores/offerDetailsModal'
const offerDetailsModalStore = useOfferDetailsModalStore()
import { useCurrStore } from '@/stores/currencies'
const currStore = useCurrStore()
import { useCategoriesStore } from '@/stores/categories'
const categoriesStore = useCategoriesStore()

const name = ref('')
const price = ref('')
const item_url = ref('')
const quality = ref('')

function submit() {
  let data = {
    title: name.value,
    price: price.value,
    quality: quality.value,
    item_url: item_url.value,
    currency: currStore.currency.code,
  }
  offerDetailsModalStore.createOffer(data)
}
</script>
