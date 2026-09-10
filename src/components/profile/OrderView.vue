<script setup>
import { onMounted, watchEffect, toRefs, ref } from 'vue'
import { useProfileStore } from '@/stores/profile'
import { useCurrStore } from '@/stores/currencies'
import { useAuthStore } from '@/stores/auth'

const profileStore = useProfileStore()
const currStore = useCurrStore()
const authStore = useAuthStore()
import ProductItem from '../../components/ProductItem.vue'

const props = defineProps({
  order: {
    type: String,
    required: true,
  },
})

const { order } = toRefs(props)

const activeOrder = ref({})

function formatDate(num) {
  let objectDate = new Date(num)
  let day = objectDate.getDate()
  if (day < 10) {
    day = '0' + day
  }
  let month = objectDate.getMonth() + 1
  if (month < 10) {
    month = `0${month}`
  }
  let year = objectDate.getFullYear()

  function padTo2Digits(x) {
    return String(x).padStart(2, '0')
  }
  let hoursAndMinutes =
    padTo2Digits(objectDate.getHours()) + ':' + padTo2Digits(objectDate.getMinutes())
  let format = day + '.' + month + '.' + year + ' ' + hoursAndMinutes

  return format
}

onMounted(() => {
  profileStore.getOrderHistory()
  watchEffect(() => {
    if (Object.keys(currStore.currency).length !== 0 && authStore.isAuth) {
      if (profileStore.orderHistory && profileStore.orderHistory.length && order) {
        activeOrder.value = profileStore.orderHistory.find(
          (item) => item.id === parseInt(order.value),
        )
      }
    }
  })
})
</script>

<template>
  <div class="profile-order">
    <RouterLink to="/profile/orders" class="back flex items-center">
      <img alt="img" class="img" src="@/assets/icons/back.svg" />
    </RouterLink>
    <div
      class="profile-right-block order-info"
      v-if="activeOrder && Object.keys(activeOrder).length !== 0"
    >
      <div class="text text-24 weight-700">{{ $t('Order') }} #{{ activeOrder.id }}</div>
      <ProductItem
        v-for="item in activeOrder.items"
        :key="item.id"
        :item="item"
        :itemCurr="activeOrder.currencyCode"
      />
    </div>
    <div
      class="profile-right-block order-details"
      v-if="activeOrder && Object.keys(activeOrder).length !== 0"
    >
      <div class="text text-24 weight-700">{{ $t('Order details') }}</div>
      <div class="row flex items-center">
        <div class="text text-14">{{ $t('Order date') }}:</div>
        <div class="text text-18">{{ formatDate(activeOrder.created_at) }}</div>
      </div>
    </div>
    <div
      class="profile-right-block buyer-info"
      v-if="activeOrder && Object.keys(activeOrder).length !== 0"
    >
      <div class="text text-18 weight-700">{{ $t('Buyer information') }}</div>
      <div class="row flex items-center">
        <div class="text text-14">{{ $t('Name, Surname') }}:</div>
        <div class="text text-18">
          {{ activeOrder.user.first_name }} {{ activeOrder.user.last_name }}
        </div>
      </div>

      <div class="row flex items-center">
        <div class="text text-14">{{ $t('E-mail') }}:</div>
        <div class="text text-18">{{ activeOrder.user.email }}</div>
      </div>
    </div>
    <div
      class="profile-right-block cart-info"
      v-if="
        currStore.currencies &&
        currStore.currencies.length &&
        activeOrder &&
        Object.keys(activeOrder).length !== 0
      "
    >
      <div class="row flex items-center">
        <div class="text text-16 weight-700">{{ $t('Order total') }}:</div>
        <div class="text text-16 weight-700 text-purple-custom">
          {{ activeOrder.amount }}
          {{ currStore.currencies.find((item) => item.code == activeOrder.currency).symbol }}
        </div>
      </div>
    </div>
  </div>
</template>
