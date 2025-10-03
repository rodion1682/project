<script setup>
import { ref } from 'vue'
import { useLoginModalStore } from '@/stores/loginModal'
import { useRegModalStore } from '@/stores/regModal'
import { useRecoverModalStore } from '@/stores/recoverModal'
import { useLoginStore } from '@/stores/login'
import UiButton, { ButtonThemes } from '@/components/shared/UiButton.vue'
import UiSvgIcon from '@/components/shared/UiSvgIcon.vue'
import BackIcon from '@/static/images/icons/action/back.svg'
import { useI18n } from 'vue-i18n'
import { UiSvgIconThemes } from '@/components/shared/UiSvgIcon.vue'
import UiText from '@/components/shared/UiText.vue'
import { TextSize } from '@/components/shared/UiText.vue'
import { TextFont } from '@/components/shared/UiText.vue'
import { TextWeight } from '@/components/shared/UiText.vue'
import UiLink from '@/components/shared/UiLink.vue'
import { LinkTheme } from '@/components/shared/UiLink.vue'
import UiInput from '@/components/shared/UiInput.vue'
import { RouterLink } from 'vue-router'
import router from '@/router'

const { t } = useI18n()
const loginModalStore = useLoginModalStore()
//const regModalStore = useRegModalStore()
//const recoverModalStore = useRecoverModalStore()
const loginStore = useLoginStore()

//function openRegModal() {
//  close()
//  regModalStore.openModal()
//}
//function openRecoverModal() {
//  close()
//  regModalStore.closeModal()
//  recoverModalStore.openModal()
//}

const email = ref('')
const pass = ref('')
const passType = ref(true)

//function submitLogin() {
//  let data = {
//    username: email,
//    password: pass,
//  }
//  loginStore.updateData(data)
//  loginStore.submitLogin()
//}
function submitLogin() {
  const data = {
    username: email,
    password: pass,
  }
  loginStore.updateData(data)
  loginStore.submitLogin()
}

//function close() {
//  loginStore.clearError()
//  loginModalStore.closeModal()
//}
function back() {
  router.push('/')
}
</script>
<template>
  <main class="main">
    <div class="main__content _cnt">
      <div class="main__inner">
        <UiButton class="main__back" :theme="ButtonThemes.BREADCRUMB" @click="back"
          ><UiSvgIcon>
            <BackIcon />
          </UiSvgIcon>
          <span>{{ t('Back to main') }}</span>
        </UiButton>
        <UiText
          class="main__title"
          :weight="TextWeight.BOLD"
          :font="TextFont.RAD"
          :size="TextSize.H2"
          :title="t('Sign In')"
        />
        <div class="main__top">
          <UiText :text="t('Don’t have an account yet?')" />
          <RouterLink to="/sing-up" class="menu__link _link">
            {{ t('Sign up') }}
          </RouterLink>
        </div>
        <form class="main__form" @submit.prevent="submitLogin">
          <UiInput
            class="main__input"
            v-model="email"
            type="email"
            :placeholder="t('Email')"
            autocomplete="email"
          />
          <UiInput
            class="main__input"
            v-model="pass"
            :type="passType ? 'password' : 'text'"
            :placeholder="t('Password')"
            autocomplete="current-password"
          />
          <UiLink class="main__forgot" :theme="LinkTheme.LINK">{{ t('Forgot password?') }}</UiLink>
          <UiButton class="main__submit _button_primary" type="submit">{{ t('Confirm') }}</UiButton>
          <Transition>
            <div class="main__error" v-if="loginStore.error">
              {{ $t(loginStore.error) }}
            </div>
          </Transition>
        </form>
      </div>
    </div>
    <div class="main__background background">
      <div class="background__grid _ibg-contain">
        <img src="@/static/images/backgrounds/grid-background-primary.webp" />
      </div>
      <div class="background__first _ibg-contain">
        <img src="@/static/images/backgrounds/authorization-page/1.webp" />
      </div>
      <div class="background__second _ibg-contain">
        <img src="@/static/images/backgrounds/authorization-page/2.webp" />
      </div>
      <div class="background__third _ibg-contain">
        <img src="@/static/images/backgrounds/authorization-page/3.webp" />
      </div>
    </div>
  </main>
</template>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;
@use '@/styles/media' as *;
@use '@/styles/classes' as *;

.main {
  overflow: hidden;
  @include header-indent;
  position: relative;
  @media (min-width: $md4) {
    display: flex;
  }
  &__content {
    background-color: var(--bg-secondary-color);
    @media (min-width: $md4) {
      flex: 0 1 100%;
    }
    @media (max-width: $md4) {
      margin: 0px -10px;
    }
  }
  &__background {
    position: absolute;
    left: 50%;
    top: 0%;
    width: 50%;
    height: 100%;
    background-color: var(--bg-primary-color);
    @media (max-width: $md3) {
      background-color: transparent;
    }
  }
  &__inner {
    @include adaptiveValue('padding-top', 20, 20);
    @include adaptiveValue('padding-bottom', 300, 25);
    background-color: rgba(255, 255, 255, 0.9);
    position: relative;
    z-index: var(--secondary-z-index);
    @media (min-width: $md4) {
      @include adaptiveValue('max-width', 372, 340, 1470, 768, 1);
      padding-right: 20px;
    }
    @media (max-width: $md4) {
      padding-left: 10px;
      padding-right: 10px;
    }
  }
  &__back {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 63, 20);
    }
  }
  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 15);
    }
  }
  &__top {
    display: flex;
    align-items: center;
    gap: 5px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 15);
    }
  }
  &__form {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 15);
    }
  }
  &__input {
    max-width: 372px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 13, 10);
    }
  }
  &__forgot {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 15);
    }
  }
  &__submit {
    min-width: 220px;
    @media (max-width: $md4) {
      max-width: 300px;
      margin: 0 auto;
    }
  }
}

.background {
  &__grid {
    position: absolute;
    @include adaptiveValue('top', 0, 10, 1470, 768, 1);
    @include adaptiveValue('width', 917, 717, 1470, 768, 1);
    @include adaptiveValue('height', 666, 366, 1470, 768, 1);
    @include adaptiveValue('left', 60, -150, 1470, 768, 1);
    @media (max-width: $md3) {
      @include adaptiveValue('top', 0, 10, 768, 320, 1);
      @include adaptiveValue('left', 60, -350, 768, 320, 1);
    }
  }
  &__first {
    position: absolute;
    z-index: var(--base-z-index);
    @include adaptiveValue('top', 0, 100, 1470, 768, 1);
    @include adaptiveValue('width', 548, 248, 1470, 768, 1);
    @include adaptiveValue('height', 548, 248, 1470, 768, 1);
    @include adaptiveValue('left', 50, 80, 1470, 768, 1);
    transform: translate(-50%, 0px);
    @media (max-width: $md3) {
      @include adaptiveValue('left', 80, -150, 768, 320, 1);
    }
  }
  &__second {
    position: absolute;
    z-index: var(--base-z-index);
    @include adaptiveValue('top', 100, 10, 1470, 768, 1);
    @include adaptiveValue('width', 159, 100, 1470, 768, 1);
    @include adaptiveValue('height', 159, 100, 1470, 768, 1);
    @include adaptiveValue('left', 500, 200, 1470, 768, 1);
    transform: translate(-50%, 0px);
    @media (max-width: $md3) {
      @include adaptiveValue('left', 200, 150, 768, 320, 1);
    }
  }
  &__third {
    position: absolute;
    z-index: var(--base-z-index);
    @include adaptiveValue('bottom', 50, 75, 1470, 768, 1);
    @include adaptiveValue('width', 444, 180, 1470, 768, 1);
    @include adaptiveValue('height', 444, 180, 1470, 768, 1);
    @include adaptiveValue('left', 625, 300, 1470, 768, 1);
    transform: translate(-50%, 0px);
    @media (max-width: $md3) {
      @include adaptiveValue('bottom', 75, 0, 1470, 768, 1);
      @include adaptiveValue('left', 300, 170, 768, 320, 1);
    }
  }
}
</style>
