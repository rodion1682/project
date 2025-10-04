<script setup>
import { ref, watch } from 'vue'
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
import { onBeforeRouteUpdate, RouterLink, useRoute } from 'vue-router'
import { useRegStore } from '@/stores/reg'
import { useStaticStore } from '@/stores/static'
import router from '@/router'

const { t } = useI18n()
const route = useRoute()
//const loginModalStore = useLoginModalStore()
//const regModalStore = useRegModalStore()
const regStore = useRegStore()
const staticStore = useStaticStore()

//const loginStore = useLoginStore()

//function openLoginModal() {
//  loginModalStore.openModal()
//  close()
//}
const name = ref('')
const surname = ref('')
const password = ref('')
const passConfirm = ref('')
const email = ref('')
const phone = ref('')
const terms = ref(false)

function submitReg() {
  let data = {
    name: name,
    surname: surname,
    password: password,
    password_confirmation: passConfirm,
    email: email,
    phone: phone,
  }
  regStore.updateData(data)
  regStore.submitReg()
  router.push('/profile/data')
}

watch(
  () => route.fullPath,
  () => {
    regStore.clearError()
  },
)

onBeforeRouteUpdate(() => {
  regStore.clearError()
})

//function close() {
//  regStore.clearError()
//  regModalStore.closeModal()
//}
</script>
<template>
  <main class="main">
    <div class="main__content _cnt">
      <div class="main__inner">
        <UiButton class="main__back" :theme="ButtonThemes.BREADCRUMB"
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
          :title="t('Sign Un')"
        />
        <div class="main__top">
          <UiText :text="t('Already have an account?')" />
          <RouterLink to="/sign-in" class="menu__link _link">
            {{ t('Sign in') }}
          </RouterLink>
        </div>
        <form class="main__form" @submit.prevent="submitReg">
          <UiInput
            class="main__input"
            v-model="name"
            type="name"
            :placeholder="t('Name')"
            autocomplete="name"
          />
          <UiInput
            class="main__input"
            v-model="surname"
            type="surname"
            :placeholder="t('Surname')"
            autocomplete="surname"
          />
          <UiInput
            class="main__input"
            v-model="email"
            type="email"
            :placeholder="t('Email')"
            autocomplete="email"
          />
          <UiInput
            class="main__input"
            v-model="phone"
            type="phone"
            :placeholder="t('Phone')"
            autocomplete="phone"
          />
          <UiInput
            class="main__input"
            v-model="password"
            type="password"
            :placeholder="t('Password')"
            autocomplete="current-password"
          />
          <UiInput
            class="main__input"
            v-model="passConfirm"
            type="password"
            :placeholder="t('Password Confirm')"
            autocomplete="current-password"
          />
          <label class="main__checkbox">
            <input class="main__checkbox-input" type="checkbox" v-model="terms" />
            <div class="main__checkbox-checked">
              <div class="main__checkbox-image _ibg-contain">
                <img src="@/static/images/icons/action/check.png" />
              </div>
            </div>
            <div class="main__checkbox-text" v-if="staticStore.static && staticStore.static.length">
              {{ $t('By continuing, I confirm that I have read, understood, and agree to the ') }}
              <RouterLink
                class="main__checkbox-link _link"
                :to="
                  '/static/' +
                  staticStore.static
                    .find((item) => item.is_terms)
                    .title.toLowerCase()
                    .replace(/ /g, '-')
                "
                >{{ $t(staticStore.static.find((item) => item.is_terms).title) }}</RouterLink
              >
              {{ $t('and') }}
              <RouterLink
                class="main__checkbox-link _link"
                :to="
                  '/static/' +
                  staticStore.static
                    .find((item) => item.is_privacy)
                    .title.toLowerCase()
                    .replace(/ /g, '-')
                "
                >{{ $t(staticStore.static.find((item) => item.is_privacy).title) }}</RouterLink
              >.
              {{ $t('I also confirm that I am at least 18 years old') }}
            </div>
          </label>
          <UiButton
            class="main__submit _button_primary"
            :class="[
              { disabled: !name || !surname || !password || !passConfirm || !phone || !terms },
            ]"
            type="submit"
            >{{ t('Confirm') }}</UiButton
          >
          <Transition>
            <div class="main__error" v-if="regStore.error">
              {{ $t(regStore.error) }}
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
    @include adaptiveValue('padding-bottom', 100, 25);
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
  &__checkbox {
    cursor: pointer;
    display: flex;
    align-items: flex-start;
    gap: 15px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 15);
    }
    &-input {
      display: none;
    }
    &-checked {
      min-width: 24px;
      height: 24px;
      border: 1px solid var(--bg-fifth-color);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--bg-primary-color);
      transition: border 0.3s ease 0s;
      position: relative;
    }
    &-image {
      position: absolute;
      width: 10px;
      height: 10px;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      transition: opacity 0.3s ease 0s;
      opacity: 0;
    }
    &-input:checked + .main__checkbox-checked {
      .main__checkbox-image {
        opacity: 1;
      }
    }

    &-text {
      font-family: var(--font-family-sans);
    }
    &-link {
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
      width: 100%;
      margin: 0 auto;
    }
  }
  &__error {
    font-family: var(--font-family-sans);
    padding-top: 10px;
    display: inline-block;
    color: var(--error-color);
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
