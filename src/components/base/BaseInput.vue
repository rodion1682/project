<script setup>
import { computed, ref, useAttrs, useSlots } from 'vue'
import { EyeIcon, EyeOpenIcon } from '../icons'
import SvgIcon from '../icons/SvgIcon.vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },

  id: {
    type: String,
    default: () => `input-${Math.random().toString(36).slice(2, 9)}`,
  },

  type: {
    type: String,
    default: 'text',
  },

  name: {
    type: String,
    default: '',
  },

  label: {
    type: String,
    default: '',
  },

  placeholder: {
    type: String,
    default: '',
  },

  autocomplete: {
    type: String,
    default: 'on',
  },

  error: {
    type: String,
    default: '',
  },

  disabled: {
    type: Boolean,
    default: false,
  },

  readonly: {
    type: Boolean,
    default: false,
  },

  required: {
    type: Boolean,
    default: false,
  },

  loading: {
    type: Boolean,
    default: false,
  },

  fullWidth: {
    type: Boolean,
    default: true,
  },

  dark: {
    type: Boolean,
    default: false,
  },

  amount: {
    type: Boolean,
    default: false,
  },

  inputClass: {
    type: [String, Array, Object],
    default: '',
  },

  labelClass: {
    type: [String, Array, Object],
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'focus', 'blur'])

const attrs = useAttrs()
const slots = useSlots()

const isFocused = ref(false)
const passwordVisible = ref(false)

const inputType = computed(() => {
  if (props.type !== 'password') {
    return props.type
  }

  return passwordVisible.value ? 'text' : 'password'
})

const isDisabled = computed(() => {
  return props.disabled || props.loading
})

const hasSuffix = computed(() => {
  return Boolean(slots.suffix || props.type === 'password' || props.loading)
})

const inputClasses = computed(() => [
  'base-input__control',

  {
    'base-input__control_error': Boolean(props.error),

    'base-input__control_dark': props.dark,

    'base-input__control_with-suffix': hasSuffix.value,
  },

  props.inputClass,
])

const rootClasses = computed(() => [
  'base-input',

  {
    'base-input_full-width': props.fullWidth,

    'base-input_disabled': isDisabled.value,

    'base-input_readonly': props.readonly,

    'base-input_error': Boolean(props.error),

    'base-input_focused': isFocused.value,

    'base-input_has-label': Boolean(props.label),
  },

  attrs.class,
])

const labelClasses = computed(() => [
  'base-input__label',

  {
    'base-input__label_amount': props.amount,

    'base-input__label_default': !props.amount,
  },

  props.labelClass,
])

const forwardedAttrs = computed(() => {
  const { class: ignoredClass, style: ignoredStyle, ...rest } = attrs

  return rest
})

function updateValue(event) {
  emit('update:modelValue', event.target.value)
}

function onFocus(event) {
  isFocused.value = true
  emit('focus', event)
}

function onBlur(event) {
  isFocused.value = false
  emit('blur', event)
}

function togglePasswordVisibility() {
  if (isDisabled.value || props.readonly) {
    return
  }

  passwordVisible.value = !passwordVisible.value
}
</script>

<template>
  <div :class="rootClasses" :style="$attrs.style">
    <div class="base-input__row">
      <label v-if="label" :for="id" :class="labelClasses">
        <span>{{ label }}</span>
      </label>

      <div class="base-input__field">
        <input
          :id="id"
          :value="modelValue"
          :name="name"
          :type="inputType"
          :placeholder="placeholder"
          :autocomplete="autocomplete"
          :disabled="isDisabled"
          :readonly="readonly"
          :required="required"
          :class="inputClasses"
          v-bind="forwardedAttrs"
          @input="updateValue"
          @focus="onFocus"
          @blur="onBlur"
        />

        <div
          v-if="loading"
          class="base-input__suffix"
          role="status"
          aria-live="polite"
        >
          <span class="base-input__loader" aria-hidden="true" />
        </div>

        <button
          v-else-if="type === 'password'"
          type="button"
          class="base-input__password-toggle"
          :aria-label="passwordVisible ? 'Hide password' : 'Show password'"
          :disabled="isDisabled"
          @click="togglePasswordVisibility"
        >
          <SvgIcon
            class="base-input__password-icon"
            :icon="passwordVisible ? EyeOpenIcon : EyeIcon"
          />
        </button>

        <div v-else-if="$slots.suffix" class="base-input__suffix">
          <slot name="suffix" />
        </div>
      </div>
    </div>

    <div v-if="error" class="base-input__error" role="alert" aria-live="polite">
      {{ error }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.base-input {
  display: inline-block;

  min-width: 0;

  &_full-width {
    width: 100%;
  }

  &_disabled {
    cursor: not-allowed;
  }

  &__label {
    display: block;

    color: var(--hint-primary-color);
    font-size: 12px;
    font-weight: 500;
    line-height: 15px;
    text-align: left;

    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__field {
    position: relative;
  }

  &__control {
    @include adaptiveValue('min-height', 36, 40);

    @include adaptiveValue('padding-left', 11, 10);

    @include adaptiveValue('padding-right', 11, 10);

    width: 100%;

    margin: 0;
    padding-top: 5px;
    padding-bottom: 5px;

    border: 1px solid var(--border-fourth-color);
    border-radius: 4px;
    outline: none;
    background-color: var(--bg-secondary-color);

    color: var(--primary-color);
    font-family: var(--font-inter);
    font-size: 14px;
    font-weight: 400;
    line-height: 17px;

    transition: all 0.3s ease;

    &::placeholder {
      opacity: 1;

      color: var(--secondary-color);
    }

    &:focus {
      border-color: var(--hint-primary-color);

      &::placeholder {
        opacity: 0;
      }
    }

    &:disabled {
      opacity: 0.5;

      cursor: not-allowed;
      pointer-events: none;
    }

    &:read-only:not(:disabled) {
      cursor: not-allowed;
    }

    &_with-suffix {
      padding-right: 42px;
    }

    &_dark {
      border-color: #120b0b;
      background: #120b0b;
    }

    &_error {
      border-color: var(--error-color);
    }
  }
}

.base-input__suffix,
.base-input__password-toggle {
  position: absolute;
  top: 50%;
  z-index: 1;

  display: flex;
  align-items: center;
  justify-content: center;

  transform: translateY(-50%);
}

.base-input__suffix {
  right: 14px;
}

.base-input__password-toggle {
  right: 10px;

  width: 32px;
  height: 32px;

  margin: 0;
  padding: 0;

  border: 0;
  border-radius: 6px;
  background: transparent;
  opacity: 0.35;

  color: var(--input-text-color, #ffffff);

  cursor: pointer;

  transition:
    color 0.2s ease,
    opacity 0.2s ease,
    background-color 0.2s ease;

  &:disabled {
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--accent-color, #eec98e);
    outline-offset: 1px;
  }

  @media (any-hover: hover) {
    &:not(:disabled):hover {
      background: rgba(238, 201, 142, 0.06);
      opacity: 1;

      color: var(--accent-color, #eec98e);
    }
  }
}

.base-input__password-icon {
  width: 20px;
  height: 20px;
}

.base-input__loader {
  width: 17px;
  height: 17px;

  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;

  animation: base-input-loader 0.7s linear infinite;

  border-top-color: var(--accent-color, #eec98e);
}

.base-input__error {
  width: 100%;

  margin-top: 6px;

  color: var(--error-color, #ff647c);
  font-size: 12px;
  line-height: 16px;
  text-align: left;
}

@keyframes base-input-loader {
  to {
    transform: rotate(360deg);
  }
}
</style>
