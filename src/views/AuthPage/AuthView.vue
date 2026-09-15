<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import Breadcrumbs from '@/components/ui/Breadcrumbs.vue'

import ForgotPasswordForm from './components/ForgotPasswordForm.vue'
import LoginForm from './components/LoginForm.vue'
import SignupForm from './components/SignupForm.vue'

import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const route = useRoute()
const router = useRouter()

const activeForm = ref('login')
const submittedForm = ref('')

const breadcrumbs = computed(() => [
  {
    title: t('Home'),
    link: '/',
  },
  {
    title: t('Account'),
  },
])

const normalizeType = (value) => {
  if (value === 'signup') {
    return 'signup'
  }

  return 'login'
}

const setForm = (type) => {
  activeForm.value = normalizeType(type)
  submittedForm.value = ''

  router.replace({
    path: '/auth',
    query: {
      type: normalizeType(type),
    },
  })
}

const showForgotPassword = () => {
  activeForm.value = 'forgot'
  submittedForm.value = ''

  router.replace({
    path: '/auth',
  })
}

const backToLogin = () => {
  activeForm.value = 'login'
  submittedForm.value = ''

  router.replace({
    path: '/auth',
    query: {
      type: 'login',
    },
  })
}

const handleLoginSubmitted = () => {
  submittedForm.value = 'login'
}

const handleSignupSubmitted = () => {
  submittedForm.value = 'signup'
}

watch(
  () => route.query.type,
  (type) => {
    if (activeForm.value === 'forgot' && !type) {
      return
    }

    activeForm.value = normalizeType(type)
    submittedForm.value = ''
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <main class="auth-page">
    <div class="auth-page__container _cnt-home">
      <Breadcrumbs :items="breadcrumbs" class="auth-page__breadcrumbs" />

      <div class="auth-page__tabs">
        <button
          type="button"
          class="auth-page__tab"
          :class="{ active: activeForm === 'login' || activeForm === 'forgot' }"
          @click="setForm('login')"
        >
          {{ $t('Sign in') }}
        </button>

        <button
          type="button"
          class="auth-page__tab"
          :class="{ active: activeForm === 'signup' }"
          @click="setForm('signup')"
        >
          {{ $t('Registration') }}
        </button>
      </div>

      <div class="auth-page__forms">
        <div
          v-if="activeForm !== 'forgot'"
          class="auth-page__column auth-page__column_login"
          :class="{
            active: activeForm === 'login',
            disabled: submittedForm === 'signup',
          }"
        >
          <LoginForm
            :disabled="submittedForm === 'signup'"
            @forgot="showForgotPassword"
            @signup="setForm('signup')"
            @submitted="handleLoginSubmitted"
          />
        </div>

        <div
          v-if="activeForm === 'forgot'"
          class="auth-page__column auth-page__column_forgot active"
        >
          <ForgotPasswordForm @back="backToLogin" />
        </div>

        <div
          v-if="activeForm !== 'forgot'"
          class="auth-page__column auth-page__column_signup"
          :class="{
            active: activeForm === 'signup',
            disabled: submittedForm === 'login',
          }"
        >
          <SignupForm
            :disabled="submittedForm === 'login'"
            @login="setForm('login')"
            @submitted="handleSignupSubmitted"
          />
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.auth-page {
  width: 100%;
  min-width: 0;

  @include header-indent;
  @include adaptiveValue('padding-top', 32, 18);
  @include adaptiveValue('padding-bottom', 104, 40);

  &__container {
    width: 100%;
    min-width: 0;
  }

  &__breadcrumbs {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 20);
    }
  }

  &__tabs {
    display: none;
  }

  &__forms {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));

    align-items: start;

    @include adaptiveValue('gap', 32, 12);
  }

  &__column {
    min-width: 0;

    transition:
      opacity 0.3s ease,
      filter 0.3s ease;

    &.disabled {
      opacity: 0.45;
      filter: grayscale(0.35);

      pointer-events: none;
    }

    &_forgot {
      grid-column: 1 / 2;
    }
  }

  @media (max-width: $md4) {
    &__tabs {
      width: 100%;

      display: flex;

      padding: 5px;

      border: 2px solid var(--border-primary-color);
      border-radius: 10px;

      background-color: var(--bg-secondary-color);

      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 22, 18);
      }
    }

    &__tab {
      flex: 1 1 50%;

      min-width: 0;
      min-height: 42px;

      display: flex;
      align-items: center;
      justify-content: center;

      padding: 8px 12px;

      border: 0;
      border-radius: 8px;

      background-color: transparent;

      color: var(--seconday-color);

      font-family: var(--font-open-sans);
      font-size: 13px;
      line-height: 18px;
      font-weight: 600;

      cursor: pointer;

      transition:
        color 0.3s ease,
        background-color 0.3s ease;

      &.active {
        color: var(--light-color);

        background-color: var(--hint-primary-color);
      }
    }

    &__forms {
      display: block;
    }

    &__column {
      display: none;

      &.active {
        display: block;
      }

      &_forgot {
        display: block;
      }
    }
  }
}
</style>
