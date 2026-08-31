<script setup>
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { computed, useSlots } from 'vue'
import { ArrowIcon, ChevronDownIcon } from '../icons'

const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary | bordered | secondary
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  icon: { type: String, default: '' }, // chevron | arrow
  class: { type: [String, Array, Object], default: '' },
})

const slots = useSlots()

const buttonClasses = computed(() => [
  'btn',
  props.variant,
  {
    'has-icon': props.icon,
    active: props.active,
  },
  props.class,
])
</script>

<template>
  <button :type="type" :disabled="disabled" :class="buttonClasses">
    <span v-if="slots.prefix" class="btn__addon">
      <slot name="prefix" />
    </span>

    <SvgIcon
      v-if="props.icon === 'chevron'"
      :icon="ChevronDownIcon"
      class="btn__icon btn__icon_chevron"
    />
    <SvgIcon
      v-else-if="props.icon === 'arrow'"
      :icon="ArrowIcon"
      class="btn__icon btn__icon_chevron"
    />

    <span v-if="$slots.default">
      <slot />
    </span>

    <span v-if="slots.postfix" class="btn__addon">
      <slot name="postfix" />
    </span>
  </button>
</template>

<style lang="scss" scoped>
.btn {
  @include adaptiveValue('min-height', 56, 40);
  position: relative;
  z-index: 1;

  display: flex;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  gap: 10px;

  width: 100%;
  height: fit-content;

  padding: 5px 10px;

  border: 1px solid transparent;
  border-radius: 6px;

  font-family: var(--font-spectral-sc);
  font-size: 16px;
  font-weight: 600;
  line-height: 150%;
  letter-spacing: 10%;
  text-align: center;
  text-transform: unquote($string: '');

  pointer-events: auto;

  transition: all 0.3s ease 0s;
  span {
    display: flex;
    gap: 10px;
  }
  &:disabled {
    opacity: 0.5;

    pointer-events: none;
  }

  &.has-icon {
    gap: 10px;
  }
  &.primary {
    background: transparent;

    color: var(--bg-primary-color);
    &::before {
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;

      width: 100%;
      height: 100%;

      background: var(--accent-gradient);

      content: '';

      transition: opacity 0.3s ease 0s;
    }
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--hint-third-color);

        color: var(--primary-color);
        &::before {
          opacity: 0;
        }
      }
    }
  }
  &.bordered {
    border-color: inherit;
    background-color: transparent;

    color: var(--hint-primary-color);
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--bg-fourth-color);

        color: var(--hint-secondary-color);
      }
    }
  }
  &.secondary {
    border-color: var(--hint-primary-color);
    background-color: var(--hint-primary-color);

    color: var(--bg-primary-color);
    @media (any-hover: hover) {
      &:hover {
        background-color: transparent;

        color: var(--hint-primary-color);
      }
    }
  }

  &__addon {
    position: relative;
    z-index: 1;

    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__icon {
    position: relative;
    z-index: 1;

    flex-shrink: 0;

    width: 16px;
    min-width: 16px;
    height: 16px;
    &_chevron {
    }
  }
}
</style>
