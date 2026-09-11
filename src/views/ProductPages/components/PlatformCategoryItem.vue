<script setup>
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },

  platform: {
    type: String,
    required: true,
  },
})

const getCategoryLink = () => {
  return `/products/${props.platform}/${props.item.slug}`
}
</script>

<template>
  <RouterLink :to="getCategoryLink()" class="category-item">
    <div class="category-item__title">
      {{ $t(item.title) }}
    </div>
  </RouterLink>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.category-item {
  min-width: 0;
  @include adaptiveValue('min-height', 120, 50);
  @include adaptiveValue('padding', 22, 18);

  display: flex;
  align-items: center;
  justify-content: center;

  border: 2px solid var(--border-primary-color);
  border-radius: 14px;
  color: var(--light-color);
  background-color: var(--hint-primary-color);

  box-shadow: var(--yellow-color) 5px 5px 0px;

  transition:
    border-color 0.3s ease,
    background-color 0.3s ease,
    box-shadow 0.3s ease,
    transform 0.3s ease;

  @media (any-hover: hover) {
    &:hover {
      color: var(--primary-color);
      border-color: var(--hint-primary-color);
      background-color: var(--yellow-color);
      box-shadow: var(--hint-primary-color) 5px 5px 0px;
      transform: translateY(-3px);
    }

    &_all:hover {
      background-color: var(--hint-primary-color);
    }
  }

  &__title {
    min-width: 0;

    color: inherit;

    @include adaptiveValue('font-size', 20, 15);
    line-height: 130%;
    font-weight: 700;

    text-align: center;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
