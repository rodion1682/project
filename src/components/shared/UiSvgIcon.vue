<template>
  <div :class="['UiSvgIcon', theme, size, className]">
    <slot />
  </div>
</template>

<script>
export const UiSvgIconThemes = Object.freeze({
  PRIMARY: 'primary',
})

export const UiSvgIconSizes = Object.freeze({
  SMALL: 'small',
  MEDIUM: 'medium',
})

export default {
  name: 'UiSvgIcon',
  props: {
    className: String,
    theme: {
      type: String,
      default: UiSvgIconThemes.PRIMARY,
    },
    size: {
      type: String,
      default: UiSvgIconSizes.SMALL,
    },
    isHoverable: {
      type: Boolean,
      default: false,
    },
  },
}
</script>

<style scoped lang="scss">
.UiSvgIcon {
  position: relative;

  svg {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  }
  &.primary {
    svg {
      path {
      }
    }
  }
  &.small {
    width: 24px;
    height: 20px;
  }

  &.medium {
    width: 30px;
    height: 30px;
  }
}
</style>
