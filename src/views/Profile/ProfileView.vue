<script setup>
import TransactionsView from '@/components/profile/TransactionsView.vue'
import OrdersView from '@/components/profile/OrdersView.vue'
import ProfileData from '@/components/profile/ProfileData.vue'
import ProjectsView from '@/components/profile/ProjectsView.vue'
import PasswordView from '@/components/profile/PasswordView.vue'
import { onMounted, toRefs } from 'vue'
import ProfileCard from './ProfileCard.vue'
import ProfileNavLinks from './ProfileNavLinks.vue'
import { initDynamicAdapt } from '@/utils/dynamic_adapt.js'

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

onMounted(async () => {
  initDynamicAdapt('max')
})
</script>

<template>
  <main class="main">
    <div class="main__wrapper _cnt">
      <ProfileCard class="main__card" data-da=".main__data-display,1239.98,first" />
      <div class="main__body">
        <ProfileNavLinks class="main__links" />
        <div :class="['main__content', { main__content_data: page === 'data' }]">
          <div class="main__data-display" v-show="page === 'data'"></div>
          <OrdersView v-if="page === 'orders'" />
          <TransactionsView v-if="page === 'transactions'" />
          <ProfileData class="main__data" v-if="page === 'data'" />
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
    @media (min-width: 1240px) {
      flex: 0 1 361px;
    }
  }
  &__body {
    flex: 1 1 auto;
    min-width: 0;
  }
  &__links {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 15, 1470, 992, 1);
    }
    @media (max-width: $md2) {
      @include adaptiveValue('margin-right', -15, -10, 992, 768, 1);
    }
    @media (max-width: $md3) {
      margin-left: -10px;
    }
  }
  &__content {
    &_data {
      @media (max-width: 1240px) {
        display: flex;
        gap: 20px;
      }
      @media (max-width: $md3) {
        display: flex;
        flex-wrap: wrap;
      }
    }
  }
  &__data {
    @media (max-width: 1240px) {
      flex: 0 1 50%;
    }
    @media (max-width: $md3) {
      flex: 1 1 100%;
    }
  }
  &__data-display {
    @media (min-width: 1240px) {
      @include hide-item;
    }
    @media (max-width: 1240px) {
      flex: 0 1 50%;
    }
    @media (max-width: $md3) {
      flex: 1 1 100%;
      margin: 0px -10px;
    }
  }
}
</style>
