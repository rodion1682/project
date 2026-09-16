<script setup>
import BaseButton from '@/components/ui/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useRegModalStore } from '@/stores/regModal'
import { useRouter } from 'vue-router'

const router = useRouter()

const authStore = useAuthStore()
const regModalStore = useRegModalStore()

const openRegModal = () => {
  router.push({
    name: 'auth',
    query: {
      type: 'signup',
    },
  })
}

const topUpBalance = () => {
  router.push({ path: 'profile/balance' })
}
</script>

<template>
  <div class="set-up">
    <div class="set-up__container _cnt">
      <div class="set-up__desk desk">
        <div class="desk__content">
          <div class="desk__hint">
            {{ $t('Registration takes one click') }}
          </div>
          <div class="desk__title _h2">{{ $t('Set up in a minute') }}</div>
          <div class="desk__text">
            {{
              $t(
                'Load the balance once and every order after that takes two clicks. Library, orders and wishlist all live in the same account.',
              )
            }}
          </div>
          <div class="desk__actions">
            <BaseButton
              v-if="!authStore.isAuth"
              @click="openRegModal"
              class="desk__action desk__action_account"
              >{{ $t('Create an account') }}</BaseButton
            >
            <BaseButton
              v-else
              @click="topUpBalance"
              variant="white"
              icon="arrow"
              class="desk__action desk__action_balance"
              >{{ $t('Top up the balance') }}</BaseButton
            >
          </div>
        </div>
        <div class="desk__image _ibg">
          <img class="desk__image-desk" src="@/assets/img/set-up.jpg" />
          <img class="desk__image-mob" src="@/assets/img/set-up-mob.jpg" />
          <div class="desk__gradient _ibg">
            <img class="desk__gradient-desk" src="@/assets/img/set-up-gradient.svg" />
            <img class="desk__gradient-mob" src="@/assets/img/launcher-gradient.svg" />
          </div>
        </div>
      </div>
      <div class="set-up__mob mob"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.set-up {
  @include adaptiveValue('padding-top', 90, 36);
  @media (min-width: $md8) {
    @include adaptiveValue('padding-bottom', 90, 36);
  }
  &__container {
  }

  &__desk {
  }

  &__mob {
  }
}

.desk {
  @media (min-width: $md8) {
    @include adaptiveValue('padding-top', 55, 20);
    @include adaptiveValue('padding-bottom', 60, 20);
    @include adaptiveValue('border-radius', 18, 14);
    @include adaptiveValue('padding-left', 60, 20);
    @include adaptiveValue('padding-right', 60, 20);
    background-color: var(--hint-primary-color);
    position: relative;
  }
  @media (max-width: $md8) {
    display: flex;
    flex-direction: column-reverse;
    background-color: var(--bg-primary-color);
    border-radius: 14px;
    overflow: hidden;
    border: 2px solid var(--border-primary-color);
  }
  &__content {
    @media (min-width: $md8) {
      max-width: 490px;
      position: relative;
      z-index: 3;
    }
    @media (max-width: $md8) {
      padding: 20px;
    }
  }

  &__hint {
    @media (min-width: $md8) {
      color: var(--primary-color);
      text-transform: uppercase;
      letter-spacing: 1.92px;
      font-weight: 700;
      font-size: 12px;
      line-height: 16px;
      padding: 8px 16px;
      background-color: var(--yellow-color);
      border-radius: 8px;
      transform: rotate(-2deg);
      width: fit-content;
      &:not(:last-child) {
        margin-bottom: 15px;
      }
    }
    @media (max-width: $md8) {
      font-size: 10px;
      line-height: 14px;
      text-transform: uppercase;
      color: var(--hint-primary-color);
      letter-spacing: 1.8px;
      &:not(:last-child) {
        margin-bottom: 12px;
      }
    }
  }

  &__title {
    @media (min-width: $md8) {
      color: var(--light-color);
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 18, 15);
      }
    }
    @media (max-width: $md8) {
      font-size: 28px;
      line-height: 29.4px;
      letter-spacing: -0.84px;
      &:not(:last-child) {
        margin-bottom: 11px;
      }
    }
  }

  &__text {
    @media (min-width: $md8) {
      line-height: 26.4px;
      color: var(--sixth-color);
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 18, 15);
      }
    }
    @media (max-width: $md8) {
      font-size: 13px;
      line-height: 21.5px;
      color: var(--muted-color);
      &:not(:last-child) {
        margin-bottom: 12px;
      }
    }
  }

  &__actions {
    display: flex;
    @include adaptiveValue('gap', 20, 12);
  }

  &__action {
    @media (max-width: $md8) {
      width: 100%;
    }
    &_account {
      @media (min-width: $md8) {
        min-width: 223px;
      }
    }

    &_balance {
      @media (min-width: $md8) {
        width: fit-content;
      }
    }
  }

  &__image {
    @media (min-width: $md8) {
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      width: 35%;
      z-index: 1;
      border-top-right-radius: 14px;
      border-bottom-right-radius: 14px;
      overflow: hidden;
    }
    @media (max-width: $md8) {
      width: 100%;
      padding-bottom: 50%;
    }
    &-desk {
      @media (max-width: $md8) {
        @include hide-item;
      }
    }
    &_mob {
      @media (min-width: $md8) {
        @include hide-item;
      }
    }
  }

  &__gradient {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 2;
    &-desk {
      @media (max-width: $md8) {
        @include hide-item;
      }
    }
    &-mob {
      @media (min-width: $md8) {
        @include hide-item;
      }
    }
  }
}
</style>
