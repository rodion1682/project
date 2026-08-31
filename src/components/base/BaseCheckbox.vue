<script setup>
import { computed, useAttrs } from 'vue'

import CheckIconActive from '@/components/icons/CheckIconActive.vue'
import { useStaticPages } from '@/composables/useStaticPages'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },

  id: {
    type: String,
    default: () => `checkbox-${Math.random().toString(36).slice(2, 9)}`,
  },

  name: {
    type: String,
    default: '',
  },

  disabled: {
    type: Boolean,
    default: false,
  },

  required: {
    type: Boolean,
    default: false,
  },

  error: {
    type: [String, Boolean],
    default: '',
  },

  /**
   * Displays the Terms and Privacy Policy text automatically.
   */
  terms: {
    type: Boolean,
    default: false,
  },

  /**
   * Adds the bordered visual variant.
   */
  bordered: {
    type: Boolean,
    default: false,
  },

  /**
   * Adds the secondary visual variant.
   */
  secondary: {
    type: Boolean,
    default: false,
  },

  /**
   * Additional class for the clickable row.
   */
  rowClass: {
    type: [String, Array, Object],
    default: '',
  },

  /**
   * Additional class for the checkbox square.
   */
  boxClass: {
    type: [String, Array, Object],
    default: '',
  },

  /**
   * Additional class for the checkbox text.
   */
  labelClass: {
    type: [String, Array, Object],
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const attrs = useAttrs()

const { termsPage, privacyPage, getPageUrl } = useStaticPages()

const rootClasses = computed(() => [
  'base-checkbox',

  {
    'base-checkbox_checked': props.modelValue,
    'base-checkbox_disabled': props.disabled,
    'base-checkbox_error': Boolean(props.error),
    'base-checkbox_bordered': props.bordered,
    'base-checkbox_secondary': props.secondary,
  },

  // Allows:
  // <BaseCheckbox class="sign-up__terms" />
  attrs.class,
])

const rowClasses = computed(() => ['base-checkbox__row', props.rowClass])

const boxClasses = computed(() => [
  'base-checkbox__box',

  {
    'base-checkbox__box_checked': props.modelValue,
    'base-checkbox__box_error': Boolean(props.error),
  },

  props.boxClass,
])

const labelClasses = computed(() => ['base-checkbox__label', props.labelClass])

const forwardedAttrs = computed(() => {
  const { class: ignoredClass, style: ignoredStyle, ...rest } = attrs

  return rest
})

function onChange(event) {
  const checked = event.target.checked

  emit('update:modelValue', checked)
  emit('change', checked)
}

function capitalizeWords(value) {
  if (!value) {
    return ''
  }

  return value
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map(word => {
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

function getPageTitle(page, fallback) {
  return page?.title ? capitalizeWords(page.title) : fallback
}
</script>

<template>
  <div :class="rootClasses" :style="attrs.style">
    <label :for="id" :class="rowClasses">
      <input
        :id="id"
        :name="name"
        class="base-checkbox__input"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        :required="required"
        v-bind="forwardedAttrs"
        @change="onChange"
      />

      <span :class="boxClasses" aria-hidden="true">
        <Transition name="checkbox-check">
          <CheckIconActive v-if="modelValue" class="base-checkbox__check" />
        </Transition>
      </span>

      <span :class="labelClasses">
        <!-- Normal custom checkbox text -->
        <slot v-if="!terms" />

        <!-- Automatically generated terms text -->
        <template v-else>
          <span>
            {{ $t('By creating an account, you agree to our') }}
          </span>

          <RouterLink
            v-if="termsPage"
            :to="getPageUrl(termsPage)"
            class="_link"
            target="_blank"
            @click.stop
          >
            {{ getPageTitle(termsPage, $t('Terms and Conditions')) }}
          </RouterLink>

          <span>
            {{ $t('and') }}
          </span>

          <RouterLink
            v-if="privacyPage"
            :to="getPageUrl(privacyPage)"
            class="_link"
            target="_blank"
            @click.stop
          >
            {{ getPageTitle(privacyPage) }}
          </RouterLink>
        </template>
      </span>
    </label>

    <div
      v-if="error"
      class="base-checkbox__error"
      role="alert"
      aria-live="polite"
    >
      {{ error }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.base-checkbox {
  width: 100%;

  &_disabled {
    opacity: 0.6;

    pointer-events: none;
  }

  &_bordered {
    padding: 14px;

    border: 1px solid var(--border-secondary-color, rgba(238, 201, 142, 0.23));
    border-radius: 8px;
    background: var(--bg-fourth-color, #252524);
  }

  &_secondary {
    .base-checkbox__box {
      background: var(--bg-fifth-color, #120b0b);
    }

    .base-checkbox__label {
      color: var(--secondary-color, #ffffff);
    }
  }
}

.base-checkbox__row {
  @include adaptiveValue('gap', 17, 15);
  display: flex;
  align-items: flex-start;

  width: 100%;

  cursor: pointer;
  user-select: none;

  @media (any-hover: hover) {
    &:hover {
      .base-checkbox__box {
        border-color: var(--accent-color, #eec98e);
      }

      .base-checkbox__box::before {
        opacity: 0.14;
      }
    }
  }
}

.base-checkbox__input {
  position: absolute;

  overflow: hidden;

  width: 1px;
  height: 1px;

  margin: -1px;
  padding: 0;

  border: 0;

  white-space: nowrap;

  clip: rect(0 0 0 0);
  clip-path: inset(50%);

  &:focus-visible + .base-checkbox__box {
    border-color: var(--accent-color, #eec98e);
    box-shadow:
      inset 0 4px 4px rgba(0, 0, 0, 0.25),
      0 0 0 3px rgba(238, 201, 142, 0.12);
  }

  &:disabled + .base-checkbox__box {
    cursor: not-allowed;
  }
}

.base-checkbox__box {
  position: relative;

  overflow: hidden;
  flex: 0 0 24px;

  width: 24px;
  height: 24px;

  border: 1px solid rgba(238, 201, 142, 0.23);
  border-radius: 6px;
  background: #30302f;
  box-shadow: inset 0 4px 4px rgba(0, 0, 0, 0.25);

  transition:
    border-color 0.25s ease,
    background-color 0.25s ease,
    box-shadow 0.25s ease;

  &::before {
    position: absolute;
    inset: 0;

    background: var(--accent-color, #eec98e);
    opacity: 0;

    content: '';

    transition: opacity 0.25s ease;
  }

  &_checked {
    border-color: var(--accent-color, #eec98e);

    &::before {
      opacity: 0.12;
    }
  }

  &_error {
    border-color: var(--error-color, #ff647c);
  }
}

.base-checkbox__check {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1;

  width: 100%;
  height: 100%;

  transform: translate(-50%, -50%);
}

.base-checkbox__label {
  display: inline;

  color: var(--secondary-color);
  font-size: 14px;
  line-height: 17px;
  text-align: left;

  cursor: pointer;
}

.base-checkbox__error {
  margin-top: 8px;
  padding-left: 36px;

  color: var(--error-color, #ff647c);
  font-size: 12px;
  line-height: 1.4;
}

.checkbox-check-enter-active,
.checkbox-check-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.checkbox-check-enter-from,
.checkbox-check-leave-to {
  opacity: 0;

  transform: translate(-50%, -50%) scale(0.7);
}
</style>
