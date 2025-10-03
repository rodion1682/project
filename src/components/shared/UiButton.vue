<template>
  <button
    :class="['UiButton', theme, className, { disabled, active }]"
    :disabled="disabled"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </button>
</template>

<script>
export const ButtonThemes = Object.freeze({
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  ROTATE: 'rotate',
  HEADER_PRIMARY: 'header_primary',
  HEADER_SECONDARY: 'header_secondary',
  BREADCRUMB: 'breadcrumb',
})

export default {
  name: 'UiButton',
  inheritAttrs: false,
  props: {
    theme: {
      type: String,
      default: ButtonThemes.PRIMARY,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    className: String,
    active: Boolean,
  },
  emits: ['click'],
  data() {
    return {}
  },
  methods: {},
}
</script>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;

.UiButton {
  transition: all 0.3s ease 0s;
  &:active {
    transform: scale(var(--downscale));
  }

  &.disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  &.secondary {
    border-radius: var(--border-radius);
    @include adaptiveValue('padding-left', 15, 15);
    @include adaptiveValue('padding-right', 15, 15);
    @include adaptiveValue('padding-top', 10, 8);
    @include adaptiveValue('padding-bottom', 10, 8);
    @include adaptiveValue('min-height', 40, 45);
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: uppercase;
    background-color: transparent;
    color: var(--primary-color);
    border: 1px solid var(--bg-primary-color-inverted);
    transition: all 0.3s ease;
    transform: scale(1);
    font-weight: 700;
    &:active {
      transform: scale(var(--downscale));
    }
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--bg-primary-color-inverted);
        color: var(--primary-color-inverted);
      }
    }
  }

  &.rotate {
    background-color: transparent;
    border: 1px solid transparent;
    padding: 15px;
    border-radius: var(--border-radius);
    z-index: var(--base-z-index);
    @media (any-hover: hover) {
      &:hover {
        border: 1px solid var(--bg-secondary-color-inverted);
      }
    }
  }

  &.header_primary,
  &.header_secondary {
    min-height: 40px;
    border-radius: var(--border-radius-third);
    overflow: hidden;
    text-transform: uppercase;
    font-weight: 700;
    padding: 8px 15px;
    font-family: var(--font-family-sans);
  }

  &.header_primary {
    border: 1px solid var(--bg-primary-color-inverted);
    transition: all 0.3s ease 0s;
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--bg-primary-color-inverted);
        color: var(--secondary-color-inverted);
      }
    }
  }

  &.header_secondary {
    display: flex;
    align-items: center;
    gap: 5px;
    background: var(--multi-gradient);
    position: relative;
    @media (any-hover: hover) {
      &:hover {
        &::before {
          background-color: transparent;
        }
      }
    }
    &::before {
      content: '';
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width: calc(100% - 4px);
      height: calc(100% - 2px);
      background-color: var(--bg-secondary-color);
      border-radius: var(--border-radius);
      transition: background-color 0.3s ease 0s;
    }
  }

  &.breadcrumb {
    background-color: transparent;
    cursor: pointer;
    display: flex;
    gap: 5px;
    padding: 5px 0px;
    color: var(--fourth-color);
    @media (any-hover: hover) {
      &:hover {
        color: var(--primary-color);
      }
    }
  }
}
</style>
