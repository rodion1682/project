<template>
  <div :class="['UiInput', className]">
    <input
      v-bind="$attrs"
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @blur="$emit('blur', $event)"
      class="UiInput__field"
    />
  </div>
</template>

<script setup>
defineOptions({ inheritAttrs: false })

defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  className: String,
})

defineEmits(['update:modelValue', 'blur'])
</script>

<style lang="scss" scoped>
.UiInput {
  &__field {
    width: 100%;
    min-height: 46px;
    display: flex;
    align-items: center;
    padding: 0px 15px;
    background-color: var(--bg-primary-color);
    border: 1px solid var(--bg-fifth-color);
    box-shadow: var(--header-bottom-shadow);
    border-radius: var(--border-radius);
    font-family: var(--font-family-sans);
    color: var(--primary-color);
    transition: border 0.3s ease 0s;
    outline: transparent;
    &::placeholder {
      transition: opacity 0.3s ease 0s;
      color: var(--fourth-color);
    }
    &:focus {
      border: 1px solid var(--primary-color);
      &::placeholder {
        opacity: 0;
      }
    }
  }
}
</style>
