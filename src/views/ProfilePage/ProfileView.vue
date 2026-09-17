<script setup>
import { computed, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import BalanceView from './components/BalanceView.vue'
import ChangePasswordView from './components/ChangePasswordView.vue'
import OrdersView from './components/OrdersView.vue'
import OrderView from './components/OrderView.vue'
import OverviewView from './components/OverviewView.vue'

import Breadcrumbs from '@/components/ui/Breadcrumbs.vue'

import PriceFormatter from '@/components/ui/PriceFormatter.vue'
import { useLogoutStore } from '@/stores/logout'
import { useProfileStore } from '@/stores/profile'

const props = defineProps({
  page: {
    type: String,
    required: true,
  },
  order: {
    type: String,
    default: '',
  },
})

const { page } = toRefs(props)

const { t } = useI18n()

const logoutStore = useLogoutStore()
const profileStore = useProfileStore()

const activeOrder = ref(null)

const handleOrderLoaded = (order) => {
  activeOrder.value = order
}

const profileNav = computed(() => [
  {
    title: t('Profile data'),
    link: 'overview',
  },
  {
    title: t('Balance'),
    link: 'balance',
  },
  {
    title: t('Orders'),
    link: 'orders',
  },
  {
    title: t('Wishlist'),
    route: '/wish-list',
  },
  {
    title: t('Change password'),
    link: 'change-password',
  },
])

const isOrderDetails = computed(() => {
  return page.value === 'orders' && Boolean(props.order)
})

const breadcrumbs = computed(() => {
  if (isOrderDetails.value) {
    return [
      {
        title: t('Home'),
        link: '/',
      },
      {
        title: t('My profile'),
        link: '/profile/overview',
      },
      {
        title: t('Orders'),
        link: '/profile/orders',
      },
      {
        title: `#${props.order}`,
      },
    ]
  }

  const currentItem = profileNav.value.find((item) => item.link === page.value)

  return [
    {
      title: t('Home'),
      link: '/',
    },
    {
      title: t('My profile'),
    },
    ...(currentItem
      ? [
          {
            title: currentItem.title,
          },
        ]
      : []),
  ]
})
const fullName = computed(() => {
  const name = profileStore.profile?.name || ''
  const surname = profileStore.profile?.surname || ''

  return `${name} ${surname}`.trim() || t('My profile')
})

const initials = computed(() => {
  const name = String(profileStore.profile?.name || '').trim()
  const surname = String(profileStore.profile?.surname || '').trim()

  const value = `${name.charAt(0)}${surname.charAt(0)}`.toUpperCase()

  return value || 'U'
})

const paymentMethod = computed(() => {
  const currentOrder = activeOrder.value

  if (!currentOrder) {
    return ''
  }

  return (
    currentOrder.payment_method ||
    currentOrder.paymentMethod ||
    currentOrder.payment_type ||
    currentOrder.paymentType ||
    ''
  )
})

const formatDate = (value) => {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  return `${day}.${month}.${year}`
}

const getNavLink = (item) => {
  if (item.route) {
    return item.route
  }

  return `/profile/${item.link}`
}
</script>

<template>
  <main class="profile-page">
    <div class="profile-page__container _cnt-home">
      <Breadcrumbs :items="breadcrumbs" class="profile-page__breadcrumbs" />

      <h1 class="profile-page__title">
        <template v-if="page === 'overview'"> {{ $t('My profile') }}</template>
        <template v-if="page === 'balance'"> {{ $t('Balance') }}</template>
        <template v-if="page === 'orders'"> {{ $t('My orders') }}</template>
        <template v-if="page === 'change-password'"> {{ $t('Change password') }}</template>
        <template v-if="page === 'orders' && order"> #{{ activeOrder.order_nr }}</template>
      </h1>

      <div class="profile-page__layout">
        <aside class="profile-page__sidebar">
          <template v-if="isOrderDetails">
            <div v-if="activeOrder" class="profile-page__order-summary">
              <div class="profile-page__order-row">
                <span>{{ $t('Order date') }}:</span>
                <strong>{{ formatDate(activeOrder.created_at) }}</strong>
              </div>

              <div v-if="paymentMethod" class="profile-page__order-row">
                <span>{{ $t('Paid with') }}:</span>
                <strong>{{ $t(paymentMethod) }}</strong>
              </div>

              <div v-if="activeOrder.status" class="profile-page__order-row">
                <span>{{ $t('Status') }}:</span>
                <strong class="profile-page__order-status">
                  {{ $t(activeOrder.status) }}
                </strong>
              </div>

              <div class="profile-page__order-divider"></div>

              <div class="profile-page__order-row profile-page__order-row_total">
                <span>{{ $t('Order total') }}:</span>

                <PriceFormatter :price="activeOrder.amount" size="size-24" />
              </div>
            </div>
          </template>

          <div class="profile-page__user" :class="{ hide: isOrderDetails }">
            <div class="profile-page__avatar">
              {{ initials }}
            </div>

            <div class="profile-page__user-content">
              <div class="profile-page__name">
                {{ fullName }}
              </div>

              <div v-if="profileStore.profile?.email" class="profile-page__email">
                {{ profileStore.profile.email }}
              </div>
            </div>
          </div>

          <nav class="profile-page__nav">
            <RouterLink
              v-for="item in profileNav"
              :key="item.link || item.route"
              :to="getNavLink(item)"
              class="profile-page__nav-link"
              :class="{
                active: item.link === page,
              }"
            >
              {{ item.title }}
            </RouterLink>

            <div class="profile-page__nav-divider" />

            <button type="button" class="profile-page__logout" @click="logoutStore.out">
              {{ $t('Logout') }}
            </button>
          </nav>
        </aside>

        <div v-if="!isOrderDetails" class="profile-page__mobile-nav">
          <RouterLink
            v-for="item in profileNav"
            :key="item.link || item.route"
            :to="getNavLink(item)"
            class="profile-page__mobile-link"
            :class="{
              active: item.link === page,
            }"
          >
            {{ item.title }}
          </RouterLink>
          <button
            type="button"
            class="profile-page__mobile-link profile-page__mobile-link_logout"
            @click="logoutStore.out"
          >
            {{ $t('Logout') }}
          </button>
        </div>

        <div class="profile-page__content">
          <OverviewView v-if="page === 'overview' || page === 'profile-data'" />

          <OrdersView v-else-if="page === 'orders' && !order" />

          <OrderView
            v-else-if="page === 'orders' && order"
            :order="order"
            @loaded="handleOrderLoaded"
          />

          <BalanceView v-else-if="page === 'balance'" />

          <ChangePasswordView v-else-if="page === 'change-password'" />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.profile-page {
  width: 100%;
  min-width: 0;

  @include header-indent;
  @include adaptiveValue('padding-top', 32, 18);
  @include adaptiveValue('padding-bottom', 104, 32);

  &__container {
    width: 100%;
    min-width: 0;
  }

  &__breadcrumbs {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 26, 18);
    }
  }

  &__title {
    margin: 0;

    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-weight: 700;
    line-height: 1.1;

    @include adaptiveValue('font-size', 42, 30);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 34, 22);
    }
  }

  &__layout {
    display: grid;
    grid-template-columns: minmax(240px, 320px) minmax(0, 1fr);

    min-width: 0;

    @include adaptiveValue('gap', 48, 20);

    @media (max-width: $md3) {
      display: block;
    }
  }

  &__sidebar {
    min-width: 0;
    align-self: self-start;

    display: flex;
    flex-direction: column;

    @include adaptiveValue('gap', 20, 14);

    @media (max-width: $md3) {
      margin-bottom: 14px;
    }
  }
  &__order-nr {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 18);
    }
  }
  &__order-summary {
    width: 100%;
    min-width: 0;

    display: flex;
    flex-direction: column;

    gap: 14px;

    padding: 24px 26px;

    border: 2px solid var(--border-primary-color);
    border-radius: 14px;

    background-color: var(--bg-secondary-color);
    @media (max-width: $md8) {
      @include hide-item;
    }
  }

  &__order-row {
    width: 100%;

    display: flex;
    align-items: baseline;
    justify-content: space-between;

    gap: 16px;

    color: var(--seconday-color);

    font-size: 13px;
    line-height: 18px;

    strong {
      color: var(--primary-color);

      font-size: 14px;
      font-weight: 400;

      text-align: right;
    }

    &_total {
      align-items: flex-end;

      color: var(--primary-color);

      font-weight: 500;
    }
  }

  &__order-status {
    color: var(--hint-primary-color) !important;

    font-size: 11px !important;
    font-weight: 700 !important;

    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  &__order-divider {
    width: 100%;
    height: 1px;

    background-color: var(--border-primary-color);
  }

  &__user {
    min-width: 0;

    display: flex;
    align-items: center;

    border: 2px solid var(--border-primary-color);
    border-radius: 14px;

    background-color: var(--bg-secondary-color);

    @include adaptiveValue('gap', 16, 14);
    @include adaptiveValue('padding-top', 26, 18);
    @include adaptiveValue('padding-right', 28, 20);
    @include adaptiveValue('padding-bottom', 26, 18);
    @include adaptiveValue('padding-left', 28, 20);
    @media (max-width: $md8) {
      &.hide {
        @include hide-item;
      }
    }
  }

  &__avatar {
    flex: 0 0 auto;

    display: flex;
    align-items: center;
    justify-content: center;

    border: 2px solid var(--hint-primary-color);
    border-radius: 10px;

    color: var(--hint-primary-color);

    font-weight: 600;

    @include adaptiveValue('width', 56, 48);
    @include adaptiveValue('height', 56, 48);
    @include adaptiveValue('font-size', 19, 16);
  }

  &__user-content {
    min-width: 0;
  }

  &__name {
    min-width: 0;

    overflow: hidden;

    color: var(--primary-color);

    font-weight: 500;

    white-space: nowrap;
    text-overflow: ellipsis;

    @include adaptiveValue('font-size', 16, 15);
    @include adaptiveValue('line-height', 22, 20);

    &:not(:last-child) {
      margin-bottom: 4px;
    }
  }

  &__email {
    min-width: 0;

    overflow: hidden;

    color: var(--seconday-color);

    white-space: nowrap;
    text-overflow: ellipsis;

    @include adaptiveValue('font-size', 13, 12);
    @include adaptiveValue('line-height', 18, 16);
  }

  &__nav {
    display: flex;
    flex-direction: column;

    padding: 10px;

    border: 2px solid var(--border-primary-color);
    border-radius: 14px;

    background-color: var(--bg-secondary-color);

    gap: 2px;

    @media (max-width: $md3) {
      @include hide-item;
    }
  }

  &__nav-link,
  &__logout {
    width: 100%;

    display: flex;
    align-items: center;

    padding: 13px 18px;

    border: 0;
    border-radius: 10px;

    background-color: transparent;

    color: var(--bg-seventh-color);

    font-family: var(--font-open-sans);
    font-size: 15px;
    line-height: 20px;
    font-weight: 400;

    text-align: left;

    cursor: pointer;

    transition:
      color 0.3s ease,
      background-color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);
        background-color: var(--bg-third-color);
      }
    }
  }

  &__nav-link {
    &.active {
      color: var(--hint-primary-color);
      background-color: var(--bg-primary-color);

      font-weight: 600;
    }
  }

  &__nav-divider {
    height: 1px;

    margin: 8px 18px;

    background-color: var(--border-primary-color);
  }

  &__logout {
    color: var(--seconday-color);
  }

  &__mobile-nav {
    @media (min-width: $md3) {
      @include hide-item;
    }

    @media (max-width: $md3) {
      display: flex;
      flex-wrap: wrap;

      width: 100%;

      margin-bottom: 22px;

      gap: 8px;

      overflow-x: auto;
      overflow-y: hidden;

      scrollbar-width: none;

      &::-webkit-scrollbar {
        @include hide-item;
      }
    }
  }

  &__mobile-link {
    flex: 0 0 auto;

    padding: 9px 14px;

    border: 2px solid var(--border-primary-color);
    border-radius: 10px;

    background-color: var(--bg-secondary-color);

    color: var(--bg-seventh-color);

    font-size: 12px;
    line-height: 18px;
    font-weight: 600;

    white-space: nowrap;

    transition:
      border-color 0.3s ease,
      color 0.3s ease,
      background-color 0.3s ease;

    &.active {
      border-color: var(--hint-primary-color);

      background-color: var(--hint-primary-color);

      color: var(--light-color);
    }
    &_logout {
      background-color: transparent;
      color: var(--primary-color);
    }
  }

  &__content {
    width: 100%;
    min-width: 0;
    display: flex;
    flex-direction: column;
    flex: 1 1 100%;
  }

  @media (max-width: $md3) {
    &__sidebar {
      width: 100%;
    }

    &__user {
      width: 100%;
    }
  }
}
</style>
