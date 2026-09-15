<template>
  <div :class="textareaClasses" :data-da="$attrs['data-da']">
    <div class="textarea__content">
      <textarea
        class="textarea__field"
        :value="modelValue"
        v-bind="textareaAttrs"
        @input="handleInput"
      />
    </div>

    <Transition name="textarea-error">
      <div v-if="error" class="textarea__error">
        {{ Array.isArray(error) ? error[0] : error }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'

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

const textareaAttrs = computed(() => {
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

const textareaClasses = computed(() => [
  'textarea',
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

.textarea {
  width: 100%;

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &.primary {
    .textarea__content {
      background-color: var(--bg-secondary-color);

      border-color: var(--border-primary-color);

      &:focus-within {
        border-color: var(--hint-primary-color);
      }
    }
  }

  &.error {
    .textarea__content {
      border-color: var(--error-color);

      &:focus-within {
        border-color: var(--error-color);
      }
    }
  }

  &__content {
    width: 100%;

    border: 2px solid transparent;

    border-radius: 10px;

    background-color: transparent;

    transition:
      border-color 0.3s ease,
      background-color 0.3s ease;
  }

  &__field {
    display: block;

    width: 100%;

    @include adaptiveValue('min-height', 96, 76);

    @include adaptiveValue('padding', 16, 14);

    border: none;
    outline: none;

    resize: none;

    border-radius: inherit;

    background-color: transparent;

    color: inherit;

    font-family: var(--font-open-sans);

    @include adaptiveValue('font-size', 15, 14);

    &::placeholder {
      color: var(--third-color);

      transition: opacity 0.3s ease;
    }

    &:focus {
      &::placeholder {
        opacity: 0;
      }
    }
  }

  &__error {
    margin-top: 6px;

    color: var(--error-color);

    font-size: 12px;
    line-height: 16px;
    font-weight: 500;
  }
}

.textarea-error-enter-active,
.textarea-error-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.textarea-error-enter-from,
.textarea-error-leave-to {
  opacity: 0;

  transform: translateY(-4px);
}
</style>
