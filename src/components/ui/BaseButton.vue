<template>
  <button :class="buttonClasses" v-bind="$attrs">
    <div v-if="slots.prefix" class="button__addon button__addon_prefix">
      <slot v-if="slots.prefix" name="prefix" />
    </div>
    <SvgIcon v-if="props.icon === 'more'" :icon="MoreIcon" class="button__icon" />
    <SvgIcon v-if="props.icon === 'close'" :icon="CloseIcon" class="button__icon" />
    <SvgIcon v-if="props.icon === 'profile'" :icon="ProfielIcon" class="button__icon" />

    <slot />

    <SvgIcon
      v-if="props.icon === 'arrow'"
      :icon="ArrowIcon"
      class="button__icon button__icon_arrow"
    />
    <div v-if="slots.postfix" class="button__addon button__addon_postfix">
      <slot name="postfix" />
    </div>
  </button>
</template>

<script setup>
import { computed, useSlots } from 'vue'
import { ArrowIcon, CloseIcon, MoreIcon, ProfielIcon } from './icons'
import SvgIcon from './icons/SvgIcon.vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | link
  // disabled: { type: Boolean, default: false },
  active: { type: Boolean, default: false },
  class: { type: [String, Array, Object], default: '' },
  icon: { type: String, default: '' }, // more | profile | close | arrow
})

const slots = useSlots()

const buttonClasses = computed(() => [
  'button',
  `${props.variant}`,
  props.class,
  { active: props.active },
])
</script>

<style lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;
.button {
  border: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 10px;
  padding: 10px;
  font-size: 14px;
  line-height: 100%;
  font-weight: 700;
  font-family: var(--font-open-sans);
  transition: all 0.3s ease 0s;
  box-shadow: transparent 4px 4px 0px;
  height: fit-content;
  min-height: 45px;
  &:disabled {
    opacity: 0.5;
    pointer-events: none;
  }
  &.primary {
    background-color: var(--yellow-color);
    box-shadow: var(--hint-primary-color) 4px 4px 0px;
    color: var(--primary-color);
    @media (any-hover: hover) {
      &:hover {
        color: var(--light-color);
        box-shadow: var(--yellow-color) 4px 4px 0px;
        background-color: var(--hint-primary-color);
      }
    }
  }
  &.secondary {
    color: var(--light-color);
    box-shadow: var(--yellow-color) 4px 4px 0px;
    background-color: var(--hint-primary-color);
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--yellow-color);
        box-shadow: var(--hint-primary-color) 4px 4px 0px;
        color: var(--primary-color);
      }
    }
  }
  &.link {
    color: var(--hint-primary-color);
    background-color: transparent;
    border-color: transparent;
    font-size: 15px;
    @media (any-hover: hover) {
      &:hover {
        background-color: var(--bg-primary-color);
      }
    }
  }
  &__addon {
    &_prefix {
    }

    &_postfix {
    }
  }

  &__icon {
    min-width: 14px;
    height: 14px;
    color: inherit;
    &_arrow {
      transform: rotate(-180deg);
      min-height: 10px;
      height: 10px;
    }
  }
}
</style>
