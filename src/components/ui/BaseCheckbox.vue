<template>
  <div :class="checkboxClasses" :data-da="$attrs['data-da']">
    <label class="checkbox__label">
      <input
        class="checkbox__input"
        type="checkbox"
        :checked="modelValue"
        v-bind="inputAttrs"
        @change="handleChange"
      />

      <span class="checkbox__box" aria-hidden="true">
        <span class="checkbox__check" />
      </span>

      <span class="checkbox__text">
        <template v-if="terms">
          {{ $t('I accept the') }}

          <RouterLink v-if="termsLink" :to="termsLink" class="checkbox__link" @click.stop>
            {{ $t('Terms and Conditions') }}
          </RouterLink>

          <span v-else>
            {{ $t('Terms and Conditions') }}
          </span>

          {{ $t('and') }}

          <RouterLink v-if="privacyLink" :to="privacyLink" class="checkbox__link" @click.stop>
            {{ $t('Privacy Policy') }}
          </RouterLink>

          <span v-else>
            {{ $t('Privacy Policy') }} </span
          >.
        </template>

        <slot v-else />
      </span>
    </label>

    <Transition name="checkbox-error">
      <div v-if="error" class="checkbox__error">
        {{ Array.isArray(error) ? error[0] : error }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, useAttrs } from 'vue'

import { useStaticStore } from '@/stores/static'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },

  terms: {
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

const emit = defineEmits(['update:modelValue', 'change'])

const attrs = useAttrs()
const staticStore = useStaticStore()

const hasError = computed(() => {
  if (Array.isArray(props.error)) {
    return props.error.length > 0
  }

  return Boolean(props.error)
})

const checkboxClasses = computed(() => [
  'checkbox',
  props.class,
  {
    checked: props.modelValue,
    error: hasError.value,
    disabled: attrs.disabled !== undefined && attrs.disabled !== false,
  },
])

const inputAttrs = computed(() => {
  const rest = {
    ...attrs,
  }

  delete rest.class
  delete rest['data-da']

  return rest
})

const createStaticLink = (page) => {
  if (!page?.title) {
    return ''
  }

  return `/static/${page.title.toLowerCase().replace(/ /g, '-')}`
}

const termsPage = computed(() => {
  return staticStore.static?.find((item) => item.is_terms) || null
})

const privacyPage = computed(() => {
  return staticStore.static?.find((item) => item.is_privacy) || null
})

const termsLink = computed(() => {
  return createStaticLink(termsPage.value)
})

const privacyLink = computed(() => {
  return createStaticLink(privacyPage.value)
})

const handleChange = (event) => {
  const value = event.target.checked

  emit('update:modelValue', value)
  emit('change', value)
}
</script>

<style lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.checkbox {
  width: fit-content;
  max-width: 100%;

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &__label {
    display: flex;
    align-items: flex-start;

    gap: 10px;

    cursor: pointer;
  }

  &__input {
    position: absolute;

    width: 1px;
    height: 1px;

    opacity: 0;

    pointer-events: none;
  }

  &__box {
    position: relative;

    flex: 0 0 20px;

    width: 20px;
    height: 20px;

    display: flex;
    align-items: center;
    justify-content: center;

    border: 2px solid var(--border-primary-color);

    border-radius: 5px;

    background-color: var(--bg-secondary-color);

    transition:
      border-color 0.3s ease,
      background-color 0.3s ease;
  }

  &__check {
    width: 9px;
    height: 5px;

    border-left: 2px solid var(--light-color);
    border-bottom: 2px solid var(--light-color);

    opacity: 0;

    transform: translateY(-1px) rotate(-45deg) scale(0.7);

    transition:
      opacity 0.2s ease,
      transform 0.2s ease;
  }

  &__input:checked + &__box {
    border-color: var(--hint-primary-color);

    background-color: var(--hint-primary-color);

    .checkbox__check {
      opacity: 1;

      transform: translateY(-1px) rotate(-45deg) scale(1);
    }
  }

  &__input:focus-visible + &__box {
    border-color: var(--hint-primary-color);

    box-shadow: 0 0 0 3px var(--bg-third-color);
  }

  &__text {
    color: var(--seconday-color);

    font-family: var(--font-open-sans);

    font-size: 12px;
    line-height: 20px;
    font-weight: 400;
  }

  &__link {
    color: var(--hint-primary-color);

    font-weight: 600;

    transition: opacity 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        opacity: 0.7;
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

  &.error {
    .checkbox__box {
      border-color: var(--error-color);
    }

    .checkbox__input:focus-visible + .checkbox__box {
      border-color: var(--error-color);
    }
  }
}

.checkbox-error-enter-active,
.checkbox-error-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.checkbox-error-enter-from,
.checkbox-error-leave-to {
  opacity: 0;

  transform: translateY(-4px);
}
</style>
