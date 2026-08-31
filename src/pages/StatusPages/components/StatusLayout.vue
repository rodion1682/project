StatusLayout.vue
<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: '',
  },

  text: {
    type: String,
    default: '',
  },

  subtext: {
    type: String,
    default: '',
  },

  tone: {
    type: String,
    default: 'primary',
    validator: value => {
      return ['primary', 'success', 'error', 'pending'].includes(value)
    },
  },

  showLoader: {
    type: Boolean,
    default: false,
  },

  loadingLabel: {
    type: String,
    default: 'Loading',
  },
})

const statusClasses = computed(() => {
  return [
    'status-layout',
    `status-layout_${props.tone}`,
    {
      'status-layout_loading': props.showLoader,
    },
  ]
})

const titleClasses = computed(() => {
  return ['status-layout__title', '_h3', `status-layout__title_${props.tone}`]
})

const ariaLive = computed(() => {
  return props.tone === 'error' ? 'assertive' : 'polite'
})

const statusRole = computed(() => {
  return props.tone === 'error' ? 'alert' : 'status'
})
</script>

<template>
  <div
    :class="statusClasses"
    :role="statusRole"
    :aria-live="ariaLive"
    :aria-busy="showLoader"
  >
    <div class="status-layout__box">
      <div class="status-layout__inner">
        <div
          v-if="showLoader"
          class="status-layout__loader"
          :aria-label="loadingLabel"
        >
          <span class="status-layout__spinner" aria-hidden="true" />
        </div>

        <div v-if="$slots.icon" class="status-layout__icon">
          <slot name="icon" />
        </div>

        <h1 v-if="title" :class="titleClasses">
          {{ title }}
        </h1>

        <div v-if="text || subtext" class="status-layout__information">
          <p v-if="text" class="status-layout__text">
            {{ text }}
          </p>

          <p v-if="subtext" class="status-layout__subtext">
            {{ subtext }}
          </p>
        </div>

        <div v-if="$slots.default" class="status-layout__body">
          <slot />
        </div>

        <div v-if="$slots.actions" class="status-layout__actions">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.status-layout {
  --status-color: var(--primary-color);
  --status-glow-color: rgb(255 255 255 / 10%);

  width: 100%;
  max-width: 570px;

  margin: 0 auto;

  &_primary {
    --status-color: var(--primary-color);
    --status-glow-color: rgb(255 255 255 / 10%);
  }

  &_success {
    --status-color: var(--success-color);
    --status-glow-color: rgb(55 190 112 / 15%);
  }

  &_error {
    --status-color: var(--error-color);
    --status-glow-color: rgb(231 67 83 / 15%);
  }

  &_pending {
    --status-color: var(--pending-color);
    --status-glow-color: rgb(195 155 83 / 18%);
  }

  &__box {
    @include adaptiveValue('border-radius', 10, 6);

    position: relative;

    padding: 5px;

    border: 1px solid var(--border-secondary-color);
    background-color: var(--bg-fourth-color);
    box-shadow: 0 24px 60px rgb(0 0 0 / 35%);

    &::before {
      position: absolute;
      top: -1px;
      left: 50%;

      width: min(45%, 220px);
      height: 1px;

      background: linear-gradient(
        90deg,
        transparent,
        var(--hint-primary-color),
        transparent
      );

      pointer-events: none;

      content: '';

      transform: translateX(-50%);
    }
  }

  &__inner {
    @include adaptiveValue('padding-top', 50, 28);
    @include adaptiveValue('padding-bottom', 50, 28);
    @include adaptiveValue('padding-left', 45, 18);
    @include adaptiveValue('padding-right', 45, 18);
    @include adaptiveValue('border-radius', 10, 6);

    position: relative;

    overflow: hidden;

    border: 1px solid var(--border-secondary-color);
    background-color: var(--bg-fifth-color);

    text-align: center;

    &::before {
      position: absolute;
      top: -100px;
      left: 50%;

      width: 260px;
      height: 200px;

      border-radius: 50%;
      background-color: var(--status-glow-color);

      pointer-events: none;

      content: '';

      transform: translateX(-50%);

      filter: blur(55px);
    }
  }

  &__loader,
  &__icon,
  &__title,
  &__information,
  &__body,
  &__actions {
    position: relative;
    z-index: 1;
  }

  &__loader {
    display: flex;
    justify-content: center;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 18);
    }
  }

  &__spinner {
    @include adaptiveValue('width', 64, 48);
    @include adaptiveValue('height', 64, 48);

    display: block;

    border: 4px solid rgb(255 255 255 / 14%);
    border-radius: 50%;
    box-shadow: 0 0 24px var(--status-glow-color);

    animation: status-layout-spin 0.85s linear infinite;

    border-top-color: var(--status-color);
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;

    color: var(--status-color);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 18);
    }

    :deep(svg) {
      @include adaptiveValue('width', 64, 48);
      @include adaptiveValue('height', 64, 48);

      display: block;
    }
  }

  &__title {
    color: var(--status-color);
    font-weight: 400;
    letter-spacing: 0.04em;
    text-align: center;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 15);
    }

    &_primary {
      color: var(--primary-color);
    }

    &_success {
      color: var(--success-color);
    }

    &_error {
      color: var(--error-color);
    }

    &_pending {
      color: var(--pending-color);
    }
  }

  &__information {
    max-width: 468px;

    margin-right: auto;
    margin-left: auto;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 20);
    }
  }

  &__text,
  &__subtext {
    margin: 0;

    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 400;
    line-height: 150%;
    text-align: center;
  }

  &__text {
    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__subtext {
    opacity: 0.75;

    font-size: 13px;
  }

  &__body {
    width: 100%;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 18);
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;

    width: 100%;

    :deep(.base-button) {
      flex: 1 1 180px;

      max-width: 230px;
      min-height: 44px;

      font-family: var(--font-inter);
      font-size: 14px;
      font-weight: 500;
    }
  }

  @media (max-width: $md6) {
    &__actions {
      flex-direction: column;

      :deep(.base-button) {
        flex: 0 0 auto;

        width: 100%;
        max-width: none;
      }
    }
  }
}

@keyframes status-layout-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .status-layout__spinner {
    animation-duration: 1.8s;
  }
}
</style>
