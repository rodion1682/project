<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 1,
  },

  totalItems: {
    type: Number,
    default: 0,
  },

  itemsPerPage: {
    type: Number,
    default: 1,
  },

  maxPagesShown: {
    type: Number,
    default: 5,
  },

  class: {
    type: [String, Array, Object],
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'change'])

const totalPages = computed(() => {
  if (!props.itemsPerPage) {
    return 1
  }

  return Math.max(1, Math.ceil(props.totalItems / props.itemsPerPage))
})

const mobilePages = computed(() => {
  const total = totalPages.value
  const current = props.modelValue

  if (total <= 3) {
    return Array.from(
      {
        length: total,
      },
      (_, index) => index + 1,
    )
  }

  if (current <= 2) {
    return [1, 2, 3]
  }

  if (current >= total - 1) {
    return [total - 2, total - 1, total]
  }

  return [current - 1, current, current + 1]
})

const setPage = (page) => {
  if (page < 1 || page > totalPages.value || page === props.modelValue) {
    return
  }

  emit('update:modelValue', page)
  emit('change', page)
}

const goPrev = () => {
  setPage(props.modelValue - 1)
}

const goNext = () => {
  setPage(props.modelValue + 1)
}

const handleDesktopChange = (page) => {
  emit('update:modelValue', page)
  emit('change', page)
}
</script>

<template>
  <div v-if="totalPages > 1" :class="['pagination', props.class]">
    <div class="pagination__desktop">
      <vue-awesome-paginate
        :model-value="modelValue"
        :total-items="totalItems"
        :items-per-page="itemsPerPage"
        :max-pages-shown="maxPagesShown"
        @update:model-value="handleDesktopChange"
      />
    </div>

    <div class="pagination__mobile">
      <button
        type="button"
        class="pagination__button pagination__button_arrow"
        :disabled="modelValue <= 1"
        @click="goPrev"
      >
        ‹
      </button>

      <button
        v-for="page in mobilePages"
        :key="page"
        type="button"
        class="pagination__button"
        :class="{
          active: page === modelValue,
        }"
        @click="setPage(page)"
      >
        {{ page }}
      </button>

      <button
        type="button"
        class="pagination__button pagination__button_arrow"
        :disabled="modelValue >= totalPages"
        @click="goNext"
      >
        ›
      </button>
    </div>
  </div>
</template>

<style lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;

  &__desktop {
    display: block;

    @media (max-width: $md8) {
      display: none;
    }
  }

  &__mobile {
    display: none;

    @media (max-width: $md8) {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
  }

  &__button {
    min-width: 38px;
    height: 38px;

    padding: 0 10px;

    display: flex;
    align-items: center;
    justify-content: center;

    border: 2px solid var(--border-primary-color);
    border-radius: 8px;

    background-color: var(--bg-secondary-color);

    color: var(--seconday-color);

    font-family: var(--font-open-sans);
    font-size: 13px;
    font-weight: 600;

    cursor: pointer;

    transition:
      border-color 0.3s ease,
      color 0.3s ease,
      background-color 0.3s ease;

    &.active {
      border-color: var(--hint-primary-color);
      color: var(--hint-primary-color);
    }

    &:disabled {
      opacity: 0.4;
      pointer-events: none;
    }

    @media (any-hover: hover) {
      &:hover:not(:disabled) {
        border-color: var(--hint-primary-color);
        color: var(--primary-color);
      }
    }

    &_arrow {
      font-size: 18px;
      line-height: 1;
    }
  }
}

.pagination__desktop {
  .pagination-container {
    display: flex;
    align-items: center;
    justify-content: center;

    gap: 8px;
  }

  .paginate-buttons {
    min-width: 38px;
    height: 38px;

    padding: 0 10px;

    display: flex;
    align-items: center;
    justify-content: center;

    border: 2px solid var(--border-primary-color);
    border-radius: 8px;

    background-color: var(--bg-secondary-color);

    color: var(--seconday-color);

    font-family: var(--font-open-sans);
    font-size: 13px;
    font-weight: 600;

    transition:
      border-color 0.3s ease,
      color 0.3s ease,
      background-color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--hint-primary-color);
        color: var(--primary-color);
      }
    }

    &:disabled {
      opacity: 0.4;
      pointer-events: none;
    }
  }

  .active-page {
    border-color: var(--hint-primary-color);
    background-color: var(--bg-secondary-color);
    color: var(--hint-primary-color);
  }
}
</style>
