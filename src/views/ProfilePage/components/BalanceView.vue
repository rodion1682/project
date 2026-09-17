<script setup>
import { ref } from 'vue'

import BalanceHistory from './BalanceHistory.vue'
import BalanceTopUp from './BalanceTopUp.vue'

const emit = defineEmits(['top-up-change'])

const view = ref('history')
const topUpMode = ref('card')

const openCardTopUp = () => {
  topUpMode.value = 'card'
  view.value = 'top-up'
  emit('top-up-change', true)
}

const openGiftCard = () => {
  topUpMode.value = 'gift-card'
  view.value = 'top-up'
  emit('top-up-change', true)
}

const closeTopUp = () => {
  view.value = 'history'
  emit('top-up-change', false)
}
</script>

<template>
  <div class="balance-view">
    <BalanceHistory v-if="view === 'history'" @top-up="openCardTopUp" @gift-card="openGiftCard" />

    <BalanceTopUp v-else :initial-mode="topUpMode" @back="closeTopUp" @completed="closeTopUp" />
  </div>
</template>

<style scoped lang="scss">
.balance-view {
  width: 100%;
  min-width: 0;
}
</style>
