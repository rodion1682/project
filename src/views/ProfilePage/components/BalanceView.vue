<script setup>
import { onMounted } from 'vue'
import { useProfileStore } from '@/stores/profile'
import { useCurrStore } from '@/stores/currencies'
import axios from '@/plugins/axios'

const profileStore = useProfileStore()
const currStore = useCurrStore()

function formatDate(num) {
  let objectDate = new Date(num * 1000)
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

function downloadInvoice(id) {
  axios.get('deposit/download/' + id).then((res) => {
    window.location = res.config.url
  })
}

onMounted(() => {
  profileStore.getDepositHistory()
})
</script>

<template>
  <div class="profile-balance">
    <div
      class="profile-right-block"
      v-if="profileStore.profile && Object.keys(profileStore.profile).length !== 0"
    >
      <div class="title-container">
        <div class="text text-24 weight-700">{{ $t('Account balance') }}</div>
        <div class="balance flex items-center flex-wrap">
          <svg
            width="23"
            height="23"
            viewBox="0 0 23 23"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.2623 6.90155H19.0259V4.68086C19.0259 3.75406 18.2463 3 17.2881 3H4.68425C3.2934 3 2.14664 4.02902 2.01426 5.34126C1.99405 5.43398 2.00125 4.60777 2.00125 17.4048C2.00125 18.8358 3.20481 20 4.68421 20H19.2623C20.2205 20 21 19.246 21 18.3191V8.58241C21 7.6556 20.2205 6.90155 19.2623 6.90155ZM4.68425 4.15457H17.2881C17.5882 4.15457 17.8323 4.39068 17.8323 4.6809V6.90158H4.68425C3.88629 6.90158 3.23305 6.29137 3.19664 5.52808C3.23301 4.76475 3.88625 4.15457 4.68425 4.15457ZM19.2623 18.8455H4.68425C3.86301 18.8455 3.19489 18.1992 3.19489 17.4048V7.61859C3.62127 7.89485 4.13362 8.05608 4.68425 8.05608H19.2623C19.5623 8.05608 19.8064 8.29219 19.8064 8.58241V10.9227H15.3152C13.7856 10.9227 12.5412 12.1264 12.5412 13.6059C12.5412 15.0854 13.7856 16.289 15.3152 16.289H19.8064V18.3191C19.8064 18.6094 19.5623 18.8455 19.2623 18.8455ZM19.8064 15.1345H15.3152C14.4438 15.1345 13.7348 14.4488 13.7348 13.6059C13.7348 12.763 14.4437 12.0773 15.3152 12.0773H19.8064V15.1345Z"
              fill="#F4EFFF"
            />
            <path
              d="M15.5354 14.4425C16.0131 14.4425 16.4004 14.068 16.4004 13.6059C16.4004 13.1439 16.0131 12.7693 15.5354 12.7693C15.0578 12.7693 14.6705 13.1439 14.6705 13.6059C14.6705 14.068 15.0578 14.4425 15.5354 14.4425Z"
              fill="#F4EFFF"
            />
          </svg>
          <div class="text text-24 weight-900">
            {{ profileStore.profile.balance }} {{ currStore.currency.symbol }}
          </div>
          <router-link to="/pay" class="button">
            <span>{{ $t('TOP UP') }}</span>
          </router-link>
        </div>
      </div>
    </div>
    <div
      class="profile-right-block"
      v-if="profileStore.depositHistory && profileStore.depositHistory.length"
    >
      <div class="title-container">
        <div class="text text-24 weight-700">{{ $t('History') }}</div>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th class="text text-14">{{ $t('ID') }}</th>
                <th class="text text-14">{{ $t('Date/time') }}</th>
                <th class="text text-14">{{ $t('Operation') }}</th>
                <th class="text text-14">{{ $t('Sum') }}</th>
                <th class="text text-14">{{ $t('Status') }}</th>
                <th class="text text-14"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in profileStore.depositHistory" :key="item.id">
                <td class="text text-14">#{{ item.num }}</td>
                <td class="text text-14">{{ formatDate(item.created_at) }}</td>
                <td class="text text-14">
                  <span v-if="item.type">{{ $t(item.type) }}</span>
                </td>
                <td class="text text-14">{{ item.sum }} {{ item.currencyCode }}</td>
                <td class="text text-14">
                  <span v-if="item.status">{{ $t(item.status) }}</span>
                </td>
                <td class="text text-14">
                  <button class="button" @click="downloadInvoice(item.id)">
                    <span>{{ $t('Download') }}</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
