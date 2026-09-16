<script setup>
import { computed } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => [],
  },

  class: {
    type: [String, Array, Object],
    default: '',
  },
})

const breadcrumbsClasses = computed(() => ['breadcrumbs', props.class])

const decodeHtmlEntities = (value) => {
  if (!value) {
    return ''
  }

  const textarea = document.createElement('textarea')
  textarea.innerHTML = value

  return textarea.value
}
</script>

<template>
  <div :class="breadcrumbsClasses" v-bind="$attrs">
    <template v-for="(item, index) in items" :key="`${item.title}-${index}`">
      <RouterLink v-if="item.link" :to="item.link" class="breadcrumbs__link">
        {{ decodeHtmlEntities(item.title) }}
      </RouterLink>

      <span v-else class="breadcrumbs__current">
        {{ decodeHtmlEntities(item.title) }}
      </span>

      <span v-if="index < items.length - 1" class="breadcrumbs__separator"> / </span>
    </template>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.breadcrumbs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  @include adaptiveValue('font-size', 14, 12);
  @include adaptiveValue('line-height', 19, 16);
  color: var(--muted-color);

  &__link {
    color: var(--seconday-color);
    transition: color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);
      }
    }
  }

  &__separator {
    color: var(--seconday-color);
  }

  &__current {
    color: var(--hint-primary-color);
  }
}
</style>
