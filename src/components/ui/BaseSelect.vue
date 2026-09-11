<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean, Object],
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: '',
  },
  optionLabel: {
    type: String,
    default: 'label',
  },
  optionValue: {
    type: String,
    default: 'value',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  class: {
    type: [String, Array, Object],
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'change', 'open', 'close'])

const attrs = useAttrs()
const root = ref(null)
const list = ref(null)
const isOpen = ref(false)
const activeIndex = ref(-1)

const selectClasses = computed(() => [
  'base-select',
  props.class,
  {
    open: isOpen.value,
    disabled: props.disabled,
  },
])

const normalizedOptions = computed(() =>
  props.options.map((option) => {
    if (typeof option !== 'object' || option === null) {
      return {
        label: String(option),
        value: option,
        disabled: false,
        original: option,
      }
    }

    return {
      label: option[props.optionLabel] ?? '',
      value: option[props.optionValue],
      disabled: Boolean(option.disabled),
      original: option,
    }
  }),
)

const selectedOption = computed(() =>
  normalizedOptions.value.find((option) => option.value === props.modelValue),
)

const displayValue = computed(() => {
  return selectedOption.value?.label || props.placeholder || ''
})

const rootAttrs = computed(() => {
  const rest = { ...attrs }

  delete rest.class
  delete rest['data-da']

  return rest
})

const open = async () => {
  if (props.disabled) return

  isOpen.value = true
  activeIndex.value = Math.max(
    normalizedOptions.value.findIndex((option) => option.value === props.modelValue),
    0,
  )

  emit('open')

  await nextTick()

  list.value?.focus()
}

const close = () => {
  if (!isOpen.value) return

  isOpen.value = false
  emit('close')
}

const toggle = () => {
  if (isOpen.value) {
    close()
    return
  }

  open()
}

const selectOption = (option) => {
  if (option.disabled) return

  emit('update:modelValue', option.value)
  emit('change', option.original)
  close()
}

const moveActive = (direction) => {
  if (!normalizedOptions.value.length) return

  let index = activeIndex.value

  for (let step = 0; step < normalizedOptions.value.length; step += 1) {
    index = (index + direction + normalizedOptions.value.length) % normalizedOptions.value.length

    if (!normalizedOptions.value[index].disabled) {
      activeIndex.value = index
      return
    }
  }
}

const handleKeydown = (event) => {
  if (props.disabled) return

  if (!isOpen.value && ['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
    event.preventDefault()
    open()
    return
  }

  if (!isOpen.value) return

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    moveActive(1)
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    moveActive(-1)
  }

  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault()

    const option = normalizedOptions.value[activeIndex.value]

    if (option) {
      selectOption(option)
    }
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    close()
  }
}

const handleDocumentClick = (event) => {
  if (!root.value?.contains(event.target)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<template>
  <div ref="root" :class="selectClasses" :data-da="attrs['data-da']" v-bind="rootAttrs">
    <button
      type="button"
      class="base-select__control"
      :disabled="disabled"
      :aria-expanded="isOpen"
      aria-haspopup="listbox"
      @click="toggle"
      @keydown="handleKeydown"
    >
      <span v-if="label" class="base-select__label">
        {{ label }}
      </span>

      <span class="base-select__value" :class="{ placeholder: !selectedOption }">
        {{ displayValue }}
      </span>

      <span class="base-select__chevron" aria-hidden="true" />
    </button>

    <div
      v-if="isOpen"
      ref="list"
      class="base-select__dropdown"
      role="listbox"
      tabindex="-1"
      @keydown="handleKeydown"
    >
      <button
        v-for="(option, index) in normalizedOptions"
        :key="`${String(option.value)}-${index}`"
        type="button"
        class="base-select__option"
        :class="{
          selected: option.value === modelValue,
          active: index === activeIndex,
          disabled: option.disabled,
        }"
        :disabled="option.disabled"
        role="option"
        :aria-selected="option.value === modelValue"
        @mouseenter="activeIndex = index"
        @click="selectOption(option)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<style lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.base-select {
  position: relative;
  width: fit-content;
  min-width: 0;
  font-family: var(--font-open-sans);

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &__control {
    width: 100%;
    min-width: 0;
    min-height: 44px;
    padding: 0 42px 0 16px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 12px;
    border: 2px solid var(--border-primary-color);
    border-radius: 10px;
    background-color: var(--bg-secondary-color);
    color: var(--primary-color);
    font: inherit;
    cursor: pointer;
    transition:
      border-color 0.3s ease,
      box-shadow 0.3s ease;

    &:focus-visible {
      outline: none;
      border-color: var(--hint-primary-color);
      box-shadow: 0 0 0 3px var(--bg-third-color);
    }

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--border-secondary-color);
      }
    }
  }

  &.open {
    .base-select__control {
      border-color: var(--hint-primary-color);
    }

    .base-select__chevron {
      transform: translateY(-25%) rotate(225deg);
    }
  }

  &__label {
    flex: 0 0 auto;
    color: var(--seconday-color);
    font-size: 14px;
    line-height: 18px;
    font-weight: 400;
    white-space: nowrap;
  }

  &__value {
    min-width: 0;
    overflow: hidden;
    color: var(--primary-color);
    font-size: 14px;
    line-height: 18px;
    font-weight: 600;
    white-space: nowrap;
    text-overflow: ellipsis;

    &.placeholder {
      color: var(--seconday-color);
      font-weight: 400;
    }
  }

  &__chevron {
    position: absolute;
    top: 50%;
    right: 16px;
    width: 8px;
    height: 8px;
    border-right: 2px solid var(--seconday-color);
    border-bottom: 2px solid var(--seconday-color);
    transform: translateY(-70%) rotate(45deg);
    transition: transform 0.2s ease;
    pointer-events: none;
  }

  &__dropdown {
    position: absolute;
    z-index: var(--menu-z-index);
    top: calc(100% + 8px);
    left: 0;
    width: 100%;
    min-width: 180px;
    max-height: 260px;
    overflow-y: auto;
    padding: 6px;
    border: 2px solid var(--border-primary-color);
    border-radius: 10px;
    background-color: var(--bg-secondary-color);
    box-shadow: 0 12px 30px rgba(15, 27, 45, 0.12);
    outline: none;
  }

  &__option {
    width: 100%;
    padding: 10px 12px;
    border: 0;
    border-radius: 7px;
    background: transparent;
    color: var(--primary-color);
    font: inherit;
    font-size: 13px;
    line-height: 18px;
    text-align: left;
    cursor: pointer;
    transition:
      background-color 0.2s ease,
      color 0.2s ease;

    &.active {
      background-color: var(--bg-third-color);
    }

    @media (any-hover: hover) {
      &:hover:not(:disabled) {
        background-color: var(--bg-third-color);
      }
    }

    &.selected {
      background-color: var(--hint-primary-color);
      color: var(--light-color);
    }

    &.disabled {
      opacity: 0.45;
      cursor: default;
    }
  }

  @media (max-width: $md5) {
    width: 100%;

    &__control {
      min-height: 44px;
      padding: 0 34px 0 10px;
      justify-content: center;
      gap: 7px;
    }

    &__label {
      display: none;
    }

    &__value {
      font-size: 12px;
      line-height: 16px;
    }

    &__chevron {
      right: 12px;
      width: 7px;
      height: 7px;
    }

    &__dropdown {
      min-width: 100%;
    }
  }
}
</style>
