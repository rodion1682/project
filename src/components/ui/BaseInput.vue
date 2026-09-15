<template>
  <div :class="inputClasses" :data-da="$attrs['data-da']">
    <div class="input__content">
      <div v-if="slots.prefix" class="input__addon input__addon_prefix">
        <slot name="prefix" />
      </div>

      <input class="input__field" :value="modelValue" v-bind="inputAttrs" @input="handleInput" />

      <div v-if="slots.postfix" class="input__addon input__addon_postfix">
        <slot name="postfix" />
      </div>
    </div>

    <Transition name="input-error">
      <div v-if="error" class="input__error">
        {{ error }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, useAttrs, useSlots } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },

  variant: {
    type: String,
    default: 'primary',
  },

  active: {
    type: Boolean,
    default: false,
  },

  error: {
    type: [String, Array],
    default: '',
  },

  class: {
    type: [String, Array, Object],
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const attrs = useAttrs()
const slots = useSlots()

const inputAttrs = computed(() => {
  const rest = {
    ...attrs,
  }

  delete rest.class
  delete rest['data-da']

  return rest
})

const hasError = computed(() => {
  if (Array.isArray(props.error)) {
    return props.error.length > 0
  }

  return Boolean(props.error)
})

const inputClasses = computed(() => [
  'input',
  props.variant,
  props.class,
  {
    active: props.active,
    error: hasError.value,
    disabled: attrs.disabled !== undefined && attrs.disabled !== false,
  },
])

const handleInput = (event) => {
  emit('update:modelValue', event.target.value)
}
</script>

<style lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.input {
  width: 100%;

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &.primary {
    .input__content {
      background-color: var(--bg-secondary-color);

      border-color: var(--border-primary-color);

      &:focus-within {
        border-color: var(--hint-primary-color);
      }
    }
  }

  &.error {
    .input__content {
      border-color: var(--error-color);

      &:focus-within {
        border-color: var(--error-color);
      }
    }
  }

  &__content {
    width: 100%;

    display: flex;
    align-items: center;

    gap: 10px;

    @include adaptiveValue('padding-left', 20, 15);

    @include adaptiveValue('padding-right', 20, 15);

    border: 2px solid transparent;

    border-radius: 10px;

    background-color: transparent;

    transition:
      border-color 0.3s ease,
      background-color 0.3s ease;

    height: fit-content;

    @include adaptiveValue('min-height', 51, 45);
  }

  &__field {
    width: 100%;
    min-width: 0;

    border: none;
    outline: none;

    padding: 0;

    background-color: transparent;

    color: inherit;

    font-family: var(--font-open-sans);

    font-size: 15px;

    &:focus {
      &::placeholder {
        opacity: 0;
      }
    }

    &::placeholder {
      transition: opacity 0.3s ease;

      color: var(--third-color);
    }
  }

  &__error {
    margin-top: 6px;

    color: var(--error-color);

    font-size: 12px;
    line-height: 16px;
    font-weight: 500;
  }

  &__addon {
    display: flex;
    align-items: center;
    justify-content: center;

    flex: 0 0 auto;
  }
}

.input-error-enter-active,
.input-error-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.input-error-enter-from,
.input-error-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
