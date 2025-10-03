<script setup>
import TransactionsView from '../components/profile/TransactionsView.vue'
import OrdersView from '../components/profile/OrdersView.vue'
import ProfileData from '../components/profile/ProfileData.vue'
import ProjectsView from '../components/profile/ProjectsView.vue'
import PasswordView from '../components/profile/PasswordView.vue'
import { useProfileStore } from '@/stores/profile'
const profileStore = useProfileStore()
import { useTopUpModalStore } from '@/stores/topUpModal'
const topUpModalStore = useTopUpModalStore()
import { useCurrStore } from '@/stores/currencies.js'
const currStore = useCurrStore()
const logoutStore = useLogoutStore()
import { useLogoutStore } from '@/stores/logout'

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
</script>

<template>
  <main class="main">
    <div class="section profile-section">
      <div class="wrapper flex flex-wrap justify-between items-start">
        <div class="profile-side">
          <div class="avatar flex items-center justify-center">
            <img alt="profile icon" class="img" src="@/assets/imgs/profile.svg" />
          </div>
          <div class="text name text-20 weight-500 text-white text-inter">
            {{ profileStore.profile.name }} {{ profileStore.profile.surname }}
          </div>
          <div class="text email text-14 text-white text-inter">
            {{ profileStore.profile.email }}
          </div>
          <div class="balance">
            <div class="flex items-center justify-between">
              <div class="text text-14 text-gray">{{ $t('My balance') }}:</div>
              <button
                class="plus-container flex items-center justify-center"
                @click="topUpModalStore.openModal()"
              >
                <img alt="Plus icon" class="select-icon" src="@/assets/imgs/plus.svg" />
              </button>
            </div>
            <div class="text text-24 text-white text-inter flex">
              <img alt="coin icon" class="coin" src="@/assets/imgs/coin.svg" />
              <b>{{ profileStore.profile.balance }}</b>
            </div>
          </div>
          <div class="balance-rate flex items-center justify-center">
            <div class="text text-18 text-inter">
              <b>1 {{ currStore.currency.symbol }}</b>
            </div>
            <div class="text text-18 text-inter">
              <b>=</b>
            </div>
            <img class="coin" src="@/assets/imgs/coin.svg" />
            <div class="text text-18 text-inter"><b>1</b> {{ $t('credit') }}</div>
          </div>
        </div>
        <div class="profile-main flex flex-wrap">
          <div class="profile-left">
            <div class="nav-container">
              <div class="nav flex">
                <RouterLink to="/profile/projects" class="item flex items-center">
                  <div class="text text-14 text-inter text-gray">
                    <b>{{ $t('My Projects') }}</b>
                  </div>
                </RouterLink>
                <RouterLink to="/profile/data" class="item flex items-center">
                  <div class="text text-14 text-inter text-gray">
                    <b>{{ $t('My Profile') }}</b>
                  </div>
                </RouterLink>
                <RouterLink to="/profile/transactions" class="item flex items-center">
                  <div class="text text-14 text-inter text-gray">
                    <b>{{ $t('Payment History') }}</b>
                  </div>
                </RouterLink>

                <RouterLink to="/profile/orders" class="item flex items-center">
                  <div class="text text-14 text-inter text-gray">
                    <b>{{ $t('Request History') }}</b>
                  </div>
                </RouterLink>
                <RouterLink to="/profile/password" class="item flex items-center">
                  <div class="text text-14 text-inter text-gray">
                    <b>{{ $t('Change Password') }}</b>
                  </div>
                </RouterLink>
                <button @click="logoutStore.out" class="item flex items-center">
                  <div class="text text-14 text-inter text-gray">
                    <b>{{ $t('Log out') }}</b>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div class="profile-center">
            <OrdersView v-if="page === 'orders'" />
            <TransactionsView v-if="page === 'transactions'" />
            <ProfileData v-if="page === 'data'" />
            <ProjectsView v-if="page === 'projects'" />
            <PasswordView v-if="page === 'password'" />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
