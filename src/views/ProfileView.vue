<script setup>
import OverviewView from '../components/profile/OverviewView.vue'
import OrdersView from '../components/profile/OrdersView.vue'
import ProfileData from '../components/profile/ProfileData.vue'
import ChangePasswordView from '../components/profile/ChangePasswordView.vue'
import BalanceView from '../components/profile/BalanceView.vue'
import OrderView from '../components/profile/OrderView.vue'
import { useLogoutStore } from '@/stores/logout'
import { useProfileStore } from '@/stores/profile'

const logoutStore = useLogoutStore()
const profileStore = useProfileStore()

import { toRefs } from 'vue'

const props = defineProps({
  page: {
    type: String,
    required: true,
  },
  order: {
    type: String,
    required: true,
  },
})

const { page } = toRefs(props)

const profileNav = [
  {
    title: 'Overview',
    link: 'overview',
  },
  {
    title: 'Orders',
    link: 'orders',
  },
  {
    title: 'Profile data',
    link: 'profile-data',
  },
  {
    title: 'Account',
    link: 'balance',
  },
  {
    title: 'Change password',
    link: 'change-password',
  },
]
</script>

<template>
  <main class="main">
    <div class="section breadcrumbs-section">
      <div class="wrapper flex">
        <RouterLink to="/" class="text text-14 text-white">{{ $t('Home') }}</RouterLink>
        <div class="text text-14 text-white">/</div>
        <div class="text text-14 text-white">{{ $t('Profile') }}</div>
        <div class="text text-14 text-white">/</div>
        <div class="text text-14 text-purple-custom">{{ $t(page.replace('-', ' ')) }}</div>
      </div>
    </div>
    <div class="section profile-section">
      <div class="wrapper flex justify-between flex-wrap">
        <div class="profile-left">
          <div class="nav-container">
            <div
              class="name-container flex items-center"
              v-if="Object.keys(profileStore.profile).length"
            >
              <div class="text text-24 weight-700">
                {{ profileStore.profile.name }} {{ profileStore.profile.surname }}
              </div>
            </div>
            <div class="profile-email text" v-if="Object.keys(profileStore.profile).length">
              {{ profileStore.profile.email }}
            </div>
            <ul class="nav">
              <li class="item" v-for="(item, i) in profileNav" :key="i">
                <RouterLink :to="'/profile/' + item.link" class="text text-white">{{
                  $t(item.title)
                }}</RouterLink>
              </li>
              <li class="item">
                <span class="text text-white" @click="logoutStore.out">{{ $t('Logout') }}</span>
              </li>
            </ul>
          </div>
        </div>
        <div class="profile-right">
          <OverviewView v-if="page === 'overview'" />
          <OrdersView v-if="page === 'orders' && !order" />
          <OrderView :order="order" v-if="page === 'orders' && order" />
          <ProfileData v-if="page === 'profile-data'" />
          <BalanceView v-if="page === 'balance'" />
          <ChangePasswordView v-if="page === 'change-password'" />
        </div>
      </div>
    </div>
  </main>
</template>
