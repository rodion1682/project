<!-- DefaultLayout.vue -->
<template>
  <div class="default-layout">
    <DefaultHeader />

    <div class="default-layout__main">
      <slot />
    </div>

    <Footer />

    <Transition name="cookies-modal">
      <CookiesModal v-if="cookiesModalStore.isModalOpen" />
    </Transition>

    <Transition name="cookies-button">
      <button
        v-if="
          !cookiesModalStore.isModalOpen && cookiesModalStore.isCookiesAccepted
        "
        type="button"
        class="default-layout__cookies-button"
        :aria-label="$t('Open cookie preferences')"
        :title="$t('Cookie preferences')"
        @click="cookiesModalStore.openModal"
      >
        <span
          class="default-layout__cookies-button-border"
          aria-hidden="true"
        />

        <span class="default-layout__cookies-button-inner" aria-hidden="true">
          <svg
            class="default-layout__cookies-icon"
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M23.846 13.175C22.996 13.494 22.075 13.668 21.113 13.668C16.816 13.668 13.332 10.184 13.332 5.887C13.332 4.925 13.506 4.004 13.825 3.154C7.837 3.244 3 8.137 3 14.146C3 20.211 7.935 25.146 14 25.146C20.009 25.146 24.902 20.309 24.992 14.321C24.606 13.963 24.223 13.582 23.846 13.175Z"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />

            <path
              d="M13.825 3.154C14.824 3.139 15.75 3.271 16.654 3.547C16.435 4.067 16.314 4.638 16.314 5.237C16.314 7.646 18.268 9.6 20.677 9.6C21.276 9.6 21.847 9.479 22.367 9.26C22.643 10.164 22.775 11.09 22.76 12.089C23.157 12.478 23.518 12.839 23.846 13.175"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              opacity="0.6"
            />

            <circle cx="10" cy="11" r="1.25" fill="currentColor" />

            <circle cx="9" cy="18" r="1" fill="currentColor" opacity="0.75" />

            <circle cx="16" cy="18.5" r="1.4" fill="currentColor" />

            <circle
              cx="13.5"
              cy="14"
              r="0.85"
              fill="currentColor"
              opacity="0.65"
            />

            <circle
              cx="19.5"
              cy="15"
              r="0.75"
              fill="currentColor"
              opacity="0.8"
            />
          </svg>
        </span>
      </button>
    </Transition>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

import Footer from '@/components/footer/Footer.vue'
import DefaultHeader from '@/components/headers/DefaultHeader.vue'
import CookiesModal from '@/components/modals/CookieModal.vue'
import { useCookiesModalStore } from '@/stores/cookiesModal'

const cookiesModalStore = useCookiesModalStore()

onMounted(() => {
  cookiesModalStore.checkInitialState()
})
</script>

<style lang="scss" scoped>
.default-layout {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;

  width: 100%;
  min-width: 0;
  min-height: 100vh;

  background-color: var(--bg-primary-color);

  &__main {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;

    min-width: 0;
  }

  &__cookies-button {
    @include adaptiveValue('bottom', 40, 15);
    @include adaptiveValue('left', 40, 15);
    @include adaptiveValue('width', 58, 48);
    @include adaptiveValue('height', 58, 48);

    position: fixed;
    z-index: calc(var(--header-z-index) - 1);

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 4px;

    border: 1px solid var(--border-secondary-color);
    border-radius: 50%;
    outline: none;
    background-color: rgb(7 8 14 / 88%);
    box-shadow:
      0 10px 30px rgb(0 0 0 / 45%),
      inset 0 0 16px rgb(179 154 107 / 8%);

    color: var(--hint-primary-color);

    cursor: pointer;

    transition:
      color 0.3s ease,
      border-color 0.3s ease,
      background-color 0.3s ease,
      box-shadow 0.3s ease,
      transform 0.3s ease;

    backdrop-filter: blur(8px);

    &::before,
    &::after {
      position: absolute;
      top: 50%;

      width: 9px;
      height: 1px;

      background-color: var(--hint-primary-color);
      opacity: 0.65;

      content: '';

      transition:
        width 0.3s ease,
        background-color 0.3s ease;
    }

    &::before {
      right: calc(100% + 4px);
    }

    &::after {
      left: calc(100% + 4px);
    }

    &:focus-visible {
      border-color: var(--hint-secondary-color);
      box-shadow:
        0 0 0 2px var(--bg-primary-color),
        0 0 0 3px var(--hint-secondary-color),
        0 10px 30px rgb(0 0 0 / 45%);

      color: var(--hint-secondary-color);
    }

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--hint-secondary-color);
        background-color: var(--bg-secondary-color);
        box-shadow:
          0 12px 35px rgb(0 0 0 / 55%),
          0 0 20px rgb(46 207 196 / 12%),
          inset 0 0 16px rgb(46 207 196 / 8%);

        color: var(--hint-secondary-color);

        transform: translateY(-3px);

        &::before,
        &::after {
          width: 13px;

          background-color: var(--hint-secondary-color);
        }

        .default-layout__cookies-icon {
          transform: rotate(-8deg) scale(1.06);
        }
      }
    }

    &:active {
      transform: translateY(-1px) scale(0.97);
    }
  }

  &__cookies-button-border {
    position: absolute;
    inset: 4px;

    border: 1px solid var(--border-secondary-color);
    border-radius: 50%;

    pointer-events: none;

    transition: border-color 0.3s ease;

    &::before,
    &::after {
      position: absolute;
      left: 50%;

      width: 4px;
      height: 4px;

      border: 1px solid var(--hint-primary-color);
      background-color: var(--bg-primary-color);

      content: '';

      transform: translateX(-50%) rotate(45deg);
      transition:
        border-color 0.3s ease,
        background-color 0.3s ease;
    }

    &::before {
      top: -3px;
    }

    &::after {
      bottom: -3px;
    }
  }

  &__cookies-button-inner {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    height: 100%;

    border-radius: 50%;
    background: radial-gradient(
      circle at 50% 40%,
      rgb(179 154 107 / 16%) 0%,
      rgb(7 8 14 / 5%) 62%,
      rgb(7 8 14 / 45%) 100%
    );

    pointer-events: none;
  }

  &__cookies-icon {
    @include adaptiveValue('width', 27, 23);
    @include adaptiveValue('height', 27, 23);

    display: block;

    color: inherit;

    transition:
      color 0.3s ease,
      transform 0.3s ease;

    filter: drop-shadow(0 2px 5px rgb(0 0 0 / 45%));
  }

  @media (any-hover: hover) {
    &__cookies-button:hover {
      .default-layout__cookies-button-border {
        border-color: var(--border-third-color);

        &::before,
        &::after {
          border-color: var(--hint-secondary-color);
        }
      }
    }
  }
}

.cookies-modal-enter-active,
.cookies-modal-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.cookies-modal-enter-from,
.cookies-modal-leave-to {
  opacity: 0;

  transform: translateY(30px);
}

.cookies-button-enter-active,
.cookies-button-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.cookies-button-enter-from,
.cookies-button-leave-to {
  opacity: 0;

  transform: translateY(15px) scale(0.85);
}
</style>
