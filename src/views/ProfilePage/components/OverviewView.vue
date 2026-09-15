<script setup>
import { onMounted } from 'vue'
import { useProfileStore } from '@/stores/profile'

const profileStore = useProfileStore()

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
})
</script>

<template>
  <div class="profile-overview">
    <div class="profile-right-block" v-if="Object.keys(profileStore.profile).length">
      <div class="title-container flex items-end">
        <div class="text text-24 weight-700">{{ $t('Profile data') }}</div>
        <RouterLink to="/profile/profile-data" class="text text-14 text-purple-custom">{{
          $t('Edit')
        }}</RouterLink>
      </div>
      <div class="profile-data">
        <div class="row flex items-center">
          <div class="text text-14">{{ $t('E-mail') }}:</div>
          <div class="text text-18">{{ profileStore.profile.email }}</div>
        </div>
        <div class="row flex items-center">
          <div class="text text-14">{{ $t('Name, Surname') }}:</div>
          <div class="text text-18">
            {{ profileStore.profile.name }} {{ profileStore.profile.surname }}
          </div>
        </div>
      </div>
    </div>
    <div class="profile-right-block" v-if="profileStore.orderHistory">
      <div class="title-container flex items-end">
        <div class="text text-24 weight-700">{{ $t('Orders') }}</div>
        <RouterLink to="/profile/orders" class="text text-14 text-purple-custom">{{
          $t('Orders')
        }}</RouterLink>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th class="text text-14">{{ $t('# Nr.') }}</th>
              <th class="text text-14">{{ $t('Date') }}</th>
              <th class="text text-14">{{ $t('Status') }}</th>
              <th class="text text-14">{{ $t('Sum') }}</th>
              <th style="width: 24px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in profileStore.orderHistory.slice(0, 4)" :key="item.id">
              <td class="text text-16 text-purple-custom">#{{ item.id }}</td>
              <td class="text text-16">{{ formatDate(item.created_at) }}</td>
              <td class="text text-16">{{ $t(item.status) }}</td>
              <td class="text text-16">{{ item.amount }} {{ item.currencyCode }}</td>
              <td style="width: 24px">
                <RouterLink :to="'/profile/orders/' + item.id">
                  <img alt="Eye icon" class="eye" src="@/assets/icons/eye.svg" />
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
