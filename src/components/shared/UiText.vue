<template>
  <div v-bind="$attrs" :class="['UiText', theme, align, size, font, weight, className]">
    <component v-if="title || titleBold" :is="headerTag" class="UiText__title">
      <component v-if="titleBefore || title || titleAfter" :is="headerTag" class="UiText__title">
        <strong v-if="titleBefore" class="UiText__before">{{ titleBefore }}</strong>

        <template v-if="title">{{ title }}</template>

        <strong v-if="titleAfter" class="UiText__after">{{ titleAfter }}</strong>
      </component>
    </component>

    <p v-if="text" class="UiText__text">
      {{ text }}
    </p>
  </div>
</template>

<script>
export const TextTheme = Object.freeze({
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SECONDARY_INVERTED: 'secondary_inverted',
  EMAIL: 'email',
  ERROR: 'error',
  SUCCESS: 'success',
})

export const TextAlign = Object.freeze({
  RIGHT: 'right',
  LEFT: 'left',
  CENTER: 'center',
})

export const TextWeight = Object.freeze({
  REGULAR: 'regular',
  MEDIUM: 'medium',
  BOLD: 'bold',
})

export const TextSize = Object.freeze({
  XS: 'size_xs',
  BASE: 'size_base',
  MD: 'size_md',
  L: 'size_l',
  H4: 'size_h4',
  H3: 'size_h3',
  H2: 'size_h2',
  H1: 'size_h1',
})

export const TextFont = Object.freeze({
  SANS: 'font_sans',
  RED: 'font_red',
  ROBOTO: 'font_roboto',
})

const mapSizeToHeaderTag = {
  [TextSize.M]: 'h3',
  [TextSize.M]: 'h3',
  [TextSize.L]: 'h2',
  [TextSize.XL]: 'h1',
}

export default {
  name: 'UiText',
  props: {
    title: String,
    titleAfter: String,
    titleBefore: String,
    text: String,
    className: String,
    theme: {
      type: String,
      default: TextTheme.PRIMARY,
    },
    align: {
      type: String,
      default: TextAlign.LEFT,
    },
    size: {
      type: String,
      default: TextSize.BASE,
    },
    font: {
      type: String,
      default: TextFont.SANS,
    },
    weight: {
      type: String,
      default: TextWeight.REGULAR,
    },
  },
  computed: {
    headerTag() {
      return mapSizeToHeaderTag[this.size] || 'h2'
    },
  },
}
</script>

<style lang="scss" scoped>
@use '@/styles/fonts' as *;

.UiText {
  strong {
    font-weight: 700;
  }
  &__before {
    margin-right: 10px;
  }
  &__after {
    margin-left: 10px;
  }
  &.primary {
    color: var(--primary-color);
  }
  &.secondary {
    color: var(--secondary-color);
  }
  &.secondary_inverted {
    color: var(--secondary-color-inverted);
  }
  &.email {
    color: var(--link-color);
  }
  &.error {
    color: var(--error-color);
  }
  &.success {
    color: var(--success-color);
  }

  &.left {
    text-align: left;
  }
  &.right {
    text-align: right;
  }
  &.center {
    text-align: center;
  }

  &.regular {
    font-weight: 400;
  }
  &.medium {
    font-weight: 500;
  }
  &.bold {
    font-weight: 700;
  }

  &.size_xs {
    font-size: var(--font-size-xs);
    line-height: var(--font-line-xs);
  }
  &.size_base {
    font-size: var(--font-size-base);
    line-height: var(--font-line-base);
  }
  &.size_md {
    font-size: var(--font-size-md);
    line-height: var(--font-line-md);
  }
  &.size_l {
    font-size: var(--font-size-l);
    line-height: var(--font-line-l);
  }
  &.size_h4 {
    @include font-h4;
  }
  &.size_h3 {
    @include font-h3;
  }
  &.size_h2 {
    @include font-h2;
  }
  &.size_h1 {
    @include font-h1;
  }

  &.font_sans {
    font-family: var(--font-family-sans);
  }
  &.font_red {
    font-family: var(--font-family-red);
  }
  &.font_roboto {
    font-family: var(--font-family-roboto);
  }
}
</style>
