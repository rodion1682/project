<script setup>
import TransactionsView from '@/components/profile/TransactionsView.vue'
import OrdersView from '@/components/profile/OrdersView.vue'
import ProfileData from '@/components/profile/ProfileData.vue'
import ProjectsView from '@/components/profile/ProjectsView.vue'
import PasswordView from '@/components/profile/PasswordView.vue'
import { toRefs } from 'vue'
import ProfileCard from './ProfileCard.vue'
import ProfileNavLinks from './ProfileNavLinks.vue'

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
    <div class="main__wrapper _cnt">
      <ProfileCard class="main__card" />
      <div class="main__body">
        <ProfileNavLinks class="main__links" />
        <div class="main__content">
          <OrdersView v-if="page === 'orders'" />
          <TransactionsView v-if="page === 'transactions'" />
          <ProfileData v-if="page === 'data'" />
          <ProjectsView v-if="page === 'projects'" />
          <PasswordView v-if="page === 'password'" />
        </div>
      </div>
    </div>
  </main>
</template>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;
@use '@/styles/media' as *;
@use '@/styles/classes' as *;

.main {
  @include header-indent;
  &__wrapper {
    display: flex;
    gap: 15px;
    @include adaptiveValue('padding-top', 44, 20, 1470, 992, 1);
  }
  &__card {
    flex-grow: 0;
    flex-shrink: 1;
    flex-basis: 361px;
  }
  &__body {
    flex: 1 1 auto;
  }
  &__links {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 15, 1470, 992, 1);
    }
  }
}
</style>
