<template>
  <a v-bind="$attrs" :href="href" :class="classes"><slot></slot></a>
</template>

<script>
export const LinkTheme = Object.freeze({
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  BTN_PRIMARY: 'btn_primary',
  LINK: 'link',
})

export default {
  name: 'UiText',
  props: {
    title: String,
    text: String,
    className: String,
    theme: {
      type: String,
      default: LinkTheme.PRIMARY,
    },
    href: {
      type: String,
      required: true,
    },
  },
  computed: {
    classes() {
      return [
        'UiLink',
        this.theme,
        this.className,
        { _button_primary: this.theme === LinkTheme.BTN_PRIMARY },
      ]
    },
  },
}
</script>

<style lang="scss" scoped>
.UiLink {
  font-family: var(--font-family-sans);
  &.primary {
    color: var(--primary-color);
  }
  &.secondary {
    color: var(--secondary-color);
  }
  &.link {
    cursor: pointer;
    display: inline-block;
    text-decoration: underline;
    padding: 5px;
    color: var(--link-color);
    transition: color 0.3s ease 0s;
    @media (any-hover: hover) {
      &:hover {
        color: var(--link-hober-color);
      }
    }
  }
}
</style>
