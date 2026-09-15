<script setup>
import { useCurrStore } from '@/stores/currencies'
import { useProfileStore } from '@/stores/profile'
import { onMounted, ref, watch, watchEffect } from 'vue'

const currStore = useCurrStore()
const profileStore = useProfileStore()

const uniqueStatuses = ref([])
const historyFiltered = ref([])
const activeStatus = ref('all')

function filterHistory(status = null) {
  if (status) {
    historyFiltered.value = profileStore.orderHistory.filter((item) => item.status === status)

    activeStatus.value = status
    return
  }

  historyFiltered.value = profileStore.orderHistory
  activeStatus.value = 'all'
}

function formatDate(date) {
  const objectDate = new Date(date)

  const day = String(objectDate.getDate()).padStart(2, '0')
  const month = String(objectDate.getMonth() + 1).padStart(2, '0')
  const year = objectDate.getFullYear()
  const hours = String(objectDate.getHours()).padStart(2, '0')
  const minutes = String(objectDate.getMinutes()).padStart(2, '0')

  return `${day}.${month}.${year} ${hours}:${minutes}`
}

function getStatusOrdersCount(status) {
  return profileStore.orderHistory.filter((item) => item.status === status).length
}

function getTotalOrdersSum() {
  return profileStore.orderHistory
    .map((transaction) => parseFloat(transaction.amount) || 0)
    .filter((amount) => !Number.isNaN(amount))
    .reduce((sum, amount) => sum + amount, 0)
    .toFixed(2)
}

watch(
  () => currStore.currency,
  () => {
    if (currStore.currency) {
      profileStore.getOrderHistory()
    }
  },
)

onMounted(() => {
  profileStore.getOrderHistory()

  watchEffect(() => {
    const orderHistory = profileStore.orderHistory || []

    uniqueStatuses.value = [...new Set(orderHistory.map((entry) => entry.status))]

    if (activeStatus.value === 'all') {
      historyFiltered.value = orderHistory
      return
    }

    const activeStatusStillExists = uniqueStatuses.value.includes(activeStatus.value)

    if (activeStatusStillExists) {
      historyFiltered.value = orderHistory.filter((item) => item.status === activeStatus.value)
    } else {
      activeStatus.value = 'all'
      historyFiltered.value = orderHistory
    }
  })
})
</script>

<template>
  <div class="profile-orders">
    <div class="profile-right-block">
      <div class="title-container flex items-end justify-between flex-wrap">
        <div class="text text-24 weight-700">
          {{ $t('My Orders') }}
        </div>

        <div
          v-if="profileStore.orderHistory && profileStore.orderHistory.length"
          class="total-info flex items-center"
        >
          <div class="total-info__item flex items-center">
            <div class="text text-14">{{ $t('Orders') }}:</div>

            <div class="text text-18">
              {{ profileStore.orderHistory.length }}
            </div>
          </div>

          <div class="total-info__item flex items-center">
            <div class="text text-14">{{ $t('Total sum') }}:</div>

            <div class="text text-18">
              {{ getTotalOrdersSum() }}
              {{ currStore.currency.symbol }}
            </div>
          </div>
        </div>
      </div>

      <template v-if="profileStore.orderHistory && profileStore.orderHistory.length">
        <div class="orders-filter flex">
          <button
            :class="[
              'button',
              {
                green: activeStatus === 'all',
              },
            ]"
            type="button"
            @click="filterHistory()"
          >
            <span>
              {{ $t('All') }}
              ({{ profileStore.orderHistory.length }})
            </span>
          </button>

          <button
            v-for="status in uniqueStatuses"
            :key="status"
            :class="[
              'button',
              {
                green: activeStatus === status,
              },
            ]"
            type="button"
            @click="filterHistory(status)"
          >
            <span>
              {{ $t(status) }}
              ({{ getStatusOrdersCount(status) }})
            </span>
          </button>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th class="text text-14">
                  {{ $t('# Nr.') }}
                </th>

                <th class="text text-14">
                  {{ $t('Date') }}
                </th>

                <th class="text text-14">
                  {{ $t('Status') }}
                </th>

                <th class="text text-14">
                  {{ $t('Sum') }}
                </th>

                <th style="width: 24px"></th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="item in historyFiltered" :key="item.id">
                <td class="text text-16 text-purple-custom">#{{ item.id }}</td>

                <td class="text text-16">
                  {{ formatDate(item.created_at) }}
                </td>

                <td class="text text-16">
                  {{ $t(item.status) }}
                </td>

                <td class="text text-16">
                  {{ item.amount }}
                  {{ item.currencyCode }}
                </td>

                <td style="width: 24px">
                  <RouterLink :to="'/profile/orders/' + item.id">
                    <img alt="Eye icon" class="eye" src="@/assets/icons/eye.svg" />
                  </RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <div v-else class="orders-empty">
        <div class="orders-empty__title text text-18 weight-700">
          {{ $t('No orders to display') }}
        </div>

        <div class="orders-empty__description text text-14">
          {{ $t('Your completed orders will appear here.') }}
        </div>
      </div>
    </div>
  </div>
</template>
