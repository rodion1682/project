<script setup>
import { useRoute, RouterLink } from 'vue-router'
import UiButton from '@/components/shared/UiButton.vue'
import { useLogoutStore } from '@/stores/logout'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
const logoutStore = useLogoutStore()

const props = defineProps({
  className: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div :class="['links', props.className]">
    <RouterLink
      to="/profile/projects"
      class="links__item _profile-nav-link"
      :class="{ links__item_active: route.path === '/profile/projects' }"
    >
      {{ t('My Projects') }}
    </RouterLink>
    <RouterLink
      to="/profile/data"
      class="links__item _profile-nav-link"
      :class="{ links__item_active: route.path === '/profile/data' }"
    >
      {{ t('My Profile') }}
    </RouterLink>
    <RouterLink
      to="/profile/transactions"
      class="links__item _profile-nav-link"
      :class="{ links__item_active: route.path === '/profile/transactions' }"
    >
      {{ t('Payment History') }}
    </RouterLink>
    <RouterLink
      to="/profile/orders"
      class="links__item _profile-nav-link"
      :class="{ links__item_active: route.path === '/profile/orders' }"
    >
      {{ t('Request History') }}
    </RouterLink>
    <RouterLink
      to="/profile/password"
      class="links__item _profile-nav-link"
      :class="{ links__item_active: route.path === '/profile/password' }"
    >
      {{ t('Change Password') }}
    </RouterLink>
    <UiButton @click="logoutStore.out" class="links__item _profile-nav-link">
      {{ t('Log out') }}
    </UiButton>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;
@use '@/styles/media' as *;
@use '@/styles/classes' as *;

.links {
  border-radius: var(--border-radius);
  background-color: var(--bg-secondary-color);
  @include adaptiveValue('padding-top', 6, 0);
  @include adaptiveValue('padding-left', 20, 0);
  @include adaptiveValue('padding-bottom', 6, 5);
  @include adaptiveValue('padding-right', 20, 0);
  display: flex;
  gap: 10px;
  overflow-x: auto !important;
  white-space: nowrap;
  &__item {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    &_active {
      background-color: var(--sixth-color);
      color: var(--secondary-color-inverted);
      @media (any-hover: hover) {
        &:hover {
          cursor: default;
        }
      }
    }
  }
}
</style>
