<!-- AccountPage.vue -->
<template>
  <main class="account-page">
    <div class="account-page__bg _ibg" aria-hidden="true">
      <img src="@/assets/img/profile-bg.jpg" alt="" />
    </div>

    <!-- Mobile profile sidebar button -->
    <button
      type="button"
      class="account-page__sidebar-toggle"
      :class="{
        'account-page__sidebar-toggle_open': isProfileOpen,
      }"
      :aria-expanded="isProfileOpen"
      aria-controls="profile-sidebar"
      :aria-label="
        isProfileOpen
          ? $t('Close profile information')
          : $t('Open profile information')
      "
      @click="toggleProfileSidebar"
    >
      <SvgIcon
        :icon="isProfileOpen ? CloseIcon : ProfileIcon"
        class="account-page__sidebar-toggle-icon"
      />
    </button>

    <!-- Drawer overlay -->
    <Transition name="profile-overlay">
      <button
        v-if="isProfileOpen"
        type="button"
        class="account-page__overlay"
        :aria-label="$t('Close profile information')"
        @click="closeProfileSidebar"
      />
    </Transition>

    <div class="account-page__inner _cnt-home">
      <!-- Profile sidebar -->
      <div
        id="profile-sidebar"
        class="account-page__sidebar profile-sidebar"
        :class="{
          'profile-sidebar_open': isProfileOpen,
        }"
        :aria-hidden="isProfileMobile && !isProfileOpen"
      >
        <button
          type="button"
          class="profile-sidebar__close"
          :aria-label="$t('Close profile information')"
          @click="closeProfileSidebar"
        >
          <SvgIcon :icon="CloseIcon" class="profile-sidebar__close-icon" />
        </button>

        <div class="profile-sidebar__card-wrapper">
          <div class="profile-sidebar__card">
            <div class="profile-sidebar__avatar-frame">
              <div class="profile-sidebar__avatar">
                <img
                  :src="profileImage"
                  :alt="nickname || $t('Profile avatar')"
                />
              </div>
            </div>

            <BaseButton
              type="button"
              class="profile-sidebar__change-avatar"
              variant="bordered"
              @click="openAvatarModal"
            >
              {{ $t('Change Avatar') }}
            </BaseButton>

            <div class="profile-sidebar__identity">
              <div class="profile-sidebar__name _h3">
                {{ nickname }}
              </div>

              <div class="profile-sidebar__email">
                {{ email }}
              </div>
            </div>
          </div>
        </div>

        <div class="profile-sidebar__decor _ibg-contain" aria-hidden="true">
          <img src="@/assets/img/heros-decor-top.png" alt="" />
        </div>

        <div class="profile-sidebar__statistics">
          <div
            v-for="statistic in profileStatistics"
            :key="statistic.label"
            class="profile-sidebar__statistic"
          >
            <span class="profile-sidebar__statistic-label">
              {{ statistic.label }}:
            </span>

            <span class="profile-sidebar__statistic-value">
              {{ statistic.value }}
            </span>
          </div>
        </div>

        <div
          class="profile-sidebar__decor profile-sidebar__decor_bottom _ibg-contain"
          aria-hidden="true"
        >
          <img src="@/assets/img/heros-decor-top.png" alt="" />
        </div>

        <BaseButton
          type="button"
          class="profile-sidebar__logout"
          variant="bordered"
          @click="logout"
        >
          <SvgIcon :icon="LogoutIcon" class="profile-sidebar__logout-icon" />

          <span>
            {{ $t('Log Out') }}
          </span>
        </BaseButton>
      </div>

      <!-- Main account content -->
      <div class="account-page__content account-content">
        <h1 class="account-content__page-title _h3">
          {{ $t('Profile') }}
        </h1>

        <!-- Tabs -->
        <div class="account-content__tabs-frame">
          <div
            class="account-content__tabs"
            role="tablist"
            :aria-label="$t('Account navigation')"
          >
            <div class="account-content__tab-box">
              <button
                v-for="tab in tabs"
                :key="tab.id"
                type="button"
                class="account-content__tab"
                :class="{
                  'account-content__tab_active': activeTab === tab.id,
                }"
                :aria-selected="activeTab === tab.id"
                :tabindex="activeTab === tab.id ? 0 : -1"
                role="tab"
                @click="handleTabChange(tab.id)"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="isPageLoading" class="account-content__state">
          <LoadingSpinner class="account-content__loader" />
        </div>

        <!-- Tab content -->
        <div v-else class="account-content__body">
          <ProfileInfo
            v-if="activeTab === 'personal'"
            @profile-updated="handleProfileUpdated"
          />

          <MyWallet v-else-if="activeTab === 'wallet'" />

          <OrderHistory v-else-if="activeTab === 'orders'" />

          <TransactionHistory v-else-if="activeTab === 'transactions'" />

          <!-- v-else-if="activeTab === 'offers' && offersEnabled" -->
          <MyOffers v-else-if="activeTab === 'offers' && offersEnabled" />

          <!-- v-else-if="activeTab === 'withdrawals' && offersEnabled" -->
          <Withdrawals
            v-else-if="activeTab === 'withdrawals' && offersEnabled"
          />
        </div>
      </div>
    </div>

    <AvatarPickerModal
      v-model="isAvatarModalOpen"
      @updated="handleAvatarUpdated"
    />
  </main>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import defaultAvatar from '@/assets/img/icons/avatar.jpg'
import BaseButton from '@/components/base/BaseButton.vue'
import LoadingSpinner from '@/components/base/LoadingSpinner.vue'
import { CloseIcon, LogoutIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { useMediaQuery } from '@/composables/useMediaQuery'
import { useProductList } from '@/composables/useProductList'
import { useToast } from '@/composables/useToast'
import OrderHistory from '@/pages/AccountPage/components/OrderHistory.vue'
import TransactionHistory from '@/pages/AccountPage/components/TransactionHistory.vue'
import { useAuthStore } from '@/stores/auth'
import { useHeroesStore } from '@/stores/heroes'
import { useNavigationStore } from '@/stores/navigation'
import { useSettingsStore } from '@/stores/settings'
import { useTopUpStore } from '@/stores/topup'
import { useUserStore } from '@/stores/user'

import AvatarPickerModal from './components/AvatarPickerModal.vue'
import MyOffers from './components/MyOffers.vue'
import MyWallet from './components/MyWallet.vue'
import ProfileInfo from './components/ProfileInfo.vue'
import Withdrawals from './components/Withdrawals.vue'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const toast = useToast()

const authStore = useAuthStore()
const heroesStore = useHeroesStore()
const navigationStore = useNavigationStore()
const settingsStore = useSettingsStore()
const topupStore = useTopUpStore()
const userStore = useUserStore()

const { myProducts, fetchMyProducts } = useProductList()

const { isProfileOpen } = storeToRefs(navigationStore)

const { userAvatarUrl } = storeToRefs(userStore)

const isProfileMobile = useMediaQuery('(max-width: 991.98px)')

const isPageLoading = ref(false)
const isAvatarModalOpen = ref(false)

const ProfileIcon = `
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="8"
      r="4"
      stroke="currentColor"
      stroke-width="1.5"
    />
    <path
      d="M4.5 20C5.35 16.4 8.15 14 12 14C15.85 14 18.65 16.4 19.5 20"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>
`

const selectedHeroId = computed(() => {
  return userStore.user?.selected_hero_id ?? null
})

const selectedHero = computed(() => {
  if (!selectedHeroId.value) {
    return null
  }

  return heroesStore.getHeroById(selectedHeroId.value)
})

const selectedHeroImage = computed(() => {
  const hero = selectedHero.value

  if (!hero) {
    return ''
  }

  /*
   * image_plain is the primary hero portrait.
   * Other properties are fallbacks in case the API differs.
   */
  return hero.image_plain || hero.image || hero.avatar || hero.portrait || ''
})

const profileImage = computed(() => {
  /*
   * First priority: selected user avatar from API.
   */
  if (userAvatarUrl.value) {
    return userAvatarUrl.value
  }

  /*
   * Second priority: selected hero.
   */
  if (selectedHeroImage.value) {
    return selectedHeroImage.value
  }

  /*
   * Final fallback: local default avatar.
   */
  return defaultAvatar
})

const nickname = computed(() => {
  return userStore.user?.nickname || ''
})

const email = computed(() => {
  return userStore.user?.email || ''
})

const offersEnabled = computed(() => {
  return Boolean(settingsStore.settings?.payouts?.offer_enabled)
})

const tabs = computed(() => {
  const accountTabs = [
    {
      id: 'personal',
      label: t('Personal Data'),
    },
    {
      id: 'wallet',
      label: t('My Balance'),
    },
    {
      id: 'orders',
      label: t('Order History'),
    },
    {
      id: 'transactions',
      label: t('Transaction History'),
    },
  ]

  if (offersEnabled.value) {
    accountTabs.push(
      {
        id: 'offers',
        label: t('Offers'),
      },
      {
        id: 'withdrawals',
        label: t('Withdrawals'),
      },
    )
  }

  return accountTabs
})

const routeTab = computed(() => {
  if (
    !route.name ||
    typeof route.name !== 'string' ||
    !route.name.startsWith('account-')
  ) {
    return 'personal'
  }

  const tab = route.name.replace('account-', '')

  if (tab === 'settings') {
    return 'personal'
  }

  return tab
})

const activeTab = computed(() => {
  const tabExists = tabs.value.some(tab => {
    return tab.id === routeTab.value
  })

  return tabExists ? routeTab.value : 'personal'
})

const winRate = computed(() => {
  const victories = Number(userStore.user?.wins || 0)

  const totalGames = Number(userStore.user?.total_games || 0)

  if (!totalGames) {
    return '0%'
  }

  return `${Math.round((victories / totalGames) * 100)}%`
})

const cardsOwned = computed(() => {
  const owned = myProducts.value?.length || 0

  const total = settingsStore.settings?.cards_total || 0

  return `${owned} / ${total}`
})

const profileStatistics = computed(() => {
  return [
    {
      label: t('Level'),
      value: userStore.user?.hero_level ?? '—',
    },
    {
      label: t('ELO'),
      value: userStore.user?.rating ?? '—',
    },
    {
      label: t('Winrate'),
      value: winRate.value,
    },
    {
      label: t('Victories'),
      value: userStore.user?.wins ?? 0,
    },
    {
      label: t('Defeats'),
      value: userStore.user?.losses ?? 0,
    },
    {
      label: t('Cards owned'),
      value: cardsOwned.value,
    },
  ]
})

const ensureSelectedHeroLoaded = async () => {
  /*
   * No selected hero means that the default avatar
   * should be used. There is nothing to fetch.
   */
  if (!selectedHeroId.value) {
    return
  }

  /*
   * Heroes are already available, so do not fetch.
   */
  if (heroesStore.heroes.length > 0) {
    return
  }

  try {
    await heroesStore.ensureHeroes()
  } catch (error) {
    /*
     * Hero loading should not break the profile page.
     * profileImage automatically falls back to avatar.
     */
    console.error('Failed to load selected hero:', error)
  }
}

const openAvatarModal = () => {
  isAvatarModalOpen.value = true
}

const handleAvatarUpdated = async () => {
  /*
   * updateAvatar() already refreshes the profile,
   * but this keeps the page synchronized if the
   * modal implementation changes later.
   */
  await userStore.fetchProfile()
}

const handleTabChange = async tab => {
  const routeName = `account-${tab}`

  if (route.name === routeName) {
    closeProfileSidebar()
    return
  }

  await router.push({
    name: routeName,
  })

  closeProfileSidebar()
}

const closeProfileSidebar = () => {
  navigationStore.closeProfile()
}

const toggleProfileSidebar = () => {
  if (!isProfileMobile.value) {
    return
  }

  /*
   * Because navigationStore contains only one activeDrawer,
   * opening profile automatically closes menu and filters.
   */
  navigationStore.toggleProfile()
}

const handleProfileUpdated = async updatedUser => {
  /*
   * ProfileInfo normally refreshes the user store itself.
   * Use the emitted user as a fallback if supplied.
   */
  if (updatedUser && !userStore.user) {
    userStore.user = updatedUser
  }

  await ensureSelectedHeroLoaded()
}

const logout = async () => {
  isAvatarModalOpen.value = false

  navigationStore.closeAllDrawers()

  await authStore.logout()

  await router.push({
    name: 'HomePage',
  })
}

const handleKeydown = event => {
  if (event.key === 'Escape') {
    if (isAvatarModalOpen.value) {
      isAvatarModalOpen.value = false
      return
    }

    navigationStore.closeAllDrawers()
  }
}

watch(
  activeTab,
  (newTab, previousTab) => {
    if (newTab === 'transactions') {
      if (userStore.user) {
        topupStore.prefillCheckoutFormData(userStore.user)
      } else {
        topupStore.resetCheckoutFormData()
      }

      return
    }

    if (previousTab === 'transactions') {
      topupStore.resetCheckoutFormData()
    }
  },
  {
    immediate: true,
  },
)

watch(offersEnabled, enabled => {
  if (!enabled && ['offers', 'withdrawals'].includes(activeTab.value)) {
    router.replace({
      name: 'account-personal',
    })
  }
})

watch(isProfileMobile, isMobile => {
  if (!isMobile) {
    closeProfileSidebar()
  }
})

watch(
  () => route.path,
  () => {
    closeProfileSidebar()
  },
)

watch(selectedHeroId, async (heroId, previousHeroId) => {
  if (heroId && String(heroId) !== String(previousHeroId)) {
    await ensureSelectedHeroLoaded()
  }
})

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)

  isPageLoading.value = true

  const results = await Promise.allSettled([
    userStore.fetchProfile(),
    fetchMyProducts(),
  ])

  const profileResult = results[0]
  const productsResult = results[1]

  if (profileResult.status === 'rejected') {
    console.error('Failed to load profile:', profileResult.reason)

    toast.error(t('Failed to load profile data'))
  }

  if (productsResult.status === 'rejected') {
    console.error('Failed to load owned cards:', productsResult.reason)
  }

  /*
   * If the backend user does not have an avatar yet,
   * select server avatar with ID 1.
   */
  if (profileResult.status === 'fulfilled') {
    await userStore.initializeAvatar()
  }

  /*
   * This runs after fetchProfile(), because selected_hero_id
   * is needed before deciding whether heroes must be fetched.
   */
  await ensureSelectedHeroLoaded()

  isPageLoading.value = false
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)

  isAvatarModalOpen.value = false

  closeProfileSidebar()
})
</script>

<style lang="scss" scoped>
.account-page {
  @include adaptiveValue('margin-top', 77, 50, 1840, 1370, 1);
  @include adaptiveValue('padding-top', 45, 25);
  @include adaptiveValue('padding-bottom', 80, 40);

  position: relative;

  display: flex;
  flex: 1 1 100%;
  flex-direction: column;

  &__bg {
    position: fixed;
    inset: 0;
    z-index: -2;

    width: 100%;
    height: 100%;

    pointer-events: none;
  }

  &__inner {
    @include adaptiveValue('gap', 20, 10, 1370, 992, 1);

    position: relative;
    z-index: 1;

    display: grid;
    align-items: start;
    align-self: center;
    grid-template-columns:
      minmax(280px, 328px)
      minmax(0, 1fr);

    width: 100%;

    margin-top: auto;
    margin-bottom: auto;
  }

  &__sidebar {
    @media (min-width: $md3) {
      @include adaptiveValue('min-width', 320, 300, 1370, 992, 1);
    }
  }

  &__content {
    flex: 1 1 auto;

    min-width: 0;
  }

  &__sidebar-toggle {
    position: fixed;
    top: 45%;
    right: 10px;
    z-index: 102;

    display: none;
    align-items: center;
    justify-content: center;

    width: 45px;
    height: 45px;

    padding: 0;

    border: 1px solid var(--border-priamry-color);
    border-radius: 4px;
    outline: none;
    background-color: var(--bg-secondary-color);
    box-shadow:
      0 6px 20px rgb(0 0 0 / 45%),
      inset 0 0 12px rgb(179 154 107 / 10%);

    color: var(--hint-primary-color);

    cursor: pointer;

    transition:
      color 0.3s ease,
      border-color 0.3s ease,
      background-color 0.3s ease;

    &_open {
      border-color: var(--hint-primary-color);
      background: var(--hint-gradient);

      color: var(--bg-primary-color);
    }

    &:focus-visible {
      border-color: var(--hint-secondary-color);

      color: var(--hint-secondary-color);
    }

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--hint-secondary-color);

        color: var(--hint-secondary-color);
      }

      &_open:hover {
        border-color: var(--hint-primary-color);

        color: var(--bg-primary-color);
      }
    }

    @media (max-width: $md3) {
      display: flex;
    }
  }

  &__sidebar-toggle-icon {
    display: flex;

    width: 22px;
    height: 22px;

    color: inherit;

    :deep(svg) {
      display: block;

      width: 100%;
      height: 100%;
    }
  }

  &__overlay {
    position: fixed;
    inset: 50px 0 0;
    z-index: 100;

    display: none;

    width: 100%;
    height: calc(100dvh - 50px);

    padding: 0;

    border: 0;
    outline: none;
    background-color: rgb(0 0 0 / 72%);

    cursor: default;

    backdrop-filter: blur(3px);

    @media (max-width: $md3) {
      display: block;
    }
  }

  @media (max-width: $md3) {
    &__inner {
      /*
       * Important: prevents the parent from trapping
       * the fixed sidebar below the overlay.
       */
      z-index: auto;

      display: block;
    }
  }
}

.profile-sidebar {
  position: relative;

  display: flex;
  flex-direction: column;

  min-width: 0;

  &__close {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 5;

    display: none;
    align-items: center;
    justify-content: center;

    width: 36px;
    height: 36px;

    padding: 0;

    border: 1px solid var(--border-secondary-color);
    border-radius: 4px;
    outline: none;
    background-color: var(--bg-third-color);

    color: var(--hint-primary-color);

    cursor: pointer;

    transition:
      color 0.3s ease,
      border-color 0.3s ease,
      background-color 0.3s ease;

    &:focus-visible {
      border-color: var(--hint-secondary-color);

      color: var(--hint-secondary-color);
    }

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--hint-secondary-color);
        background-color: var(--bg-secondary-color);

        color: var(--hint-secondary-color);
      }
    }
  }

  &__close-icon {
    display: flex;

    width: 18px;
    height: 18px;

    color: inherit;

    :deep(svg) {
      display: block;

      width: 100%;
      height: 100%;
    }
  }

  &__card-wrapper {
    padding: 5px;

    border: 1px solid var(--border-secondary-color);
    border-radius: 10px;
  }

  &__card {
    padding: 0 10px 32px;

    border: 1px solid var(--border-secondary-color);
    border-radius: 10px;
    background: var(--bg-fourth-color);

    text-align: center;
  }

  &__avatar-frame {
    position: relative;

    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;

    width: 100%;
    height: auto;
    aspect-ratio: 1 / 1;

    margin: 0 auto 4px;

    background-image: url('../../assets/img/avarat-frame.png');
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;

    pointer-events: none;
  }

  &__avatar {
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: 1;

    overflow: hidden;

    width: 65%;
    height: auto;
    aspect-ratio: 1 / 1;

    border: 1px solid var(--border-priamry-color);
    border-radius: 50%;
    background-color: var(--bg-primary-color);

    pointer-events: auto;

    transform: translate(-50%, -52.5%);

    img {
      position: absolute;
      inset: 0;

      display: block;

      width: 100%;
      height: 100%;

      object-fit: cover;
      object-position: center top;
    }
  }

  &__change-avatar {
    display: flex !important;
    align-items: center;
    justify-content: center;

    width: calc(100% - 40px);
    min-height: 38px;

    margin: -6px auto 20px;

    font-family: var(--font-inter);
    font-size: 13px;
    font-weight: 500;
    text-transform: uppercase;
  }

  &__identity {
    min-width: 0;
  }

  &__name {
    overflow: hidden;

    color: var(--primary-color);
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 12, 8);
    }
  }

  &__email {
    overflow: hidden;

    color: var(--secondary-color);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__decor {
    position: relative;

    width: 92%;
    height: 25px;

    margin: 15px auto;

    pointer-events: none;

    img {
      width: 100%;
      height: 100%;

      object-fit: contain;
    }

    &_bottom {
      transform: rotate(180deg);
    }
  }

  &__statistics {
    display: flex;
    flex-direction: column;
    gap: 22px;

    padding: 12px 34px;
  }

  &__statistic {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    font-size: 14px;
    line-height: 140%;
  }

  &__statistic-label {
    color: var(--hint-primary-color);
  }

  &__statistic-value {
    color: var(--primary-color);
    text-align: right;
    white-space: nowrap;
  }

  &__logout {
    display: flex !important;
    gap: 10px;

    width: calc(100% - 68px);
    min-height: 40px;

    margin: 10px auto 28px;

    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    text-transform: uppercase;
  }

  &__logout-icon {
    width: 18px;
    min-width: 18px;
    height: 18px;

    margin-right: 8px;
  }

  @media (max-width: $md3) {
    position: fixed;
    top: 50px;
    bottom: 0;
    left: 0;
    z-index: 101;

    display: flex;
    visibility: hidden;
    overflow-x: hidden;
    overflow-y: auto;
    flex-direction: column;

    width: min(380px, calc(100vw - 55px));
    min-width: 0;
    max-width: none;
    height: calc(100dvh - 50px);

    padding: 14px;

    background:
      linear-gradient(rgb(7 8 14 / 96%), rgb(7 8 14 / 99%)),
      var(--bg-primary-color);
    box-shadow: 15px 0 40px rgb(0 0 0 / 55%);
    opacity: 0;

    pointer-events: none;

    transform: translateX(-105%);
    transition:
      visibility 0.35s ease,
      opacity 0.3s ease,
      transform 0.35s ease;

    border-bottom-left-radius: 0;

    border-top-left-radius: 0;

    overscroll-behavior: contain;

    &_open {
      visibility: visible;

      opacity: 1;

      pointer-events: auto;

      transform: translateX(0);
    }

    &__close {
      display: flex;
    }

    &__logout {
      margin-top: auto;
    }
  }

  @media (max-width: $md5) {
    width: calc(100vw - 45px);

    padding: 10px;

    &__statistics {
      padding-right: 22px;
      padding-left: 22px;
    }

    &__avatar-frame {
      width: min(72%, 210px);
    }

    &__change-avatar {
      width: min(100%, 210px);

      margin-top: 0;
    }

    &__logout {
      width: calc(100% - 44px);
    }
  }

  @media (max-width: $md8) {
    &__statistics {
      gap: 18px;

      padding-right: 15px;
      padding-left: 15px;
    }
  }
}

.account-content {
  min-width: 0;

  &__page-title {
    color: var(--primary-color);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 15);
    }
  }

  &__tabs-frame {
    padding: 5px;

    border: 1px solid var(--border-secondary-color);
    border-radius: 6px;
    background-color: var(--bg-primary-color);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
    }
  }

  &__tabs {
    @include adaptiveValue('padding', 16, 5);
  }

  &__tab-box {
    display: flex;
    flex-wrap: wrap;

    border: 1px solid var(--hint-primary-color);
    border-radius: 6px;
  }

  &__tab {
    width: fit-content !important;
    min-width: 160px;
    min-height: 38px;

    padding: 8px 20px;

    border: 1px solid transparent;
    border-radius: 6px;
    outline: none;
    background-color: transparent;

    color: var(--hint-primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 500;
    text-transform: uppercase;
    white-space: nowrap;

    cursor: pointer;

    transition: all 0.3s ease 0s;

    &_active {
      border: 1px solid transparent;
      background: var(--hint-gradient);

      color: var(--bg-primary-color);
    }

    &:focus-visible {
      border: 1px solid transparent;

      color: var(--hint-secondary-color);
    }

    @media (any-hover: hover) {
      &:not(&_active):hover {
        border: 1px solid transparent;
        background-color: var(--border-fourth-color);

        color: var(--hint-secondary-color);
      }
    }
  }

  &__body {
    min-width: 0;
  }

  &__state {
    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 400px;

    border: 1px solid var(--border-secondary-color);
    border-radius: 10px;
    background-color: var(--bg-fourth-color);
  }

  &__loader {
    width: 48px;
    height: 48px;
  }

  @media (max-width: $md4) {
    &__page-title {
      padding-right: 58px;
    }

    &__tabs-frame {
      padding: 4px;
    }

    &__tabs {
      padding: 6px;
    }

    &__tab {
      min-height: 42px;

      padding-right: 15px;
      padding-left: 15px;
    }
  }

  @media (max-width: $md5) {
    &__tab {
      flex: 0 1 50%;
    }
  }

  @media (max-width: $md6) {
    &__tab {
      flex: 1 1 100%;
    }
  }
}

.profile-overlay-enter-active,
.profile-overlay-leave-active {
  transition:
    opacity 0.3s ease,
    backdrop-filter 0.3s ease;
}

.profile-overlay-enter-from,
.profile-overlay-leave-to {
  opacity: 0;

  backdrop-filter: blur(0);
}
</style>
