<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import axios from '@/plugins/axios'
import { useStaticStore } from '@/stores/static'

import Loader from '@/components/Loader.vue'
import Breadcrumbs from '@/components/ui/Breadcrumbs.vue'

const props = defineProps({
  page: {
    type: String,
    required: true,
  },
})

const { t } = useI18n()

const staticStore = useStaticStore()

const activePage = ref(null)
const isLoading = ref(false)
const error = ref('')

const normalizedPage = computed(() => {
  return String(props.page || '')
    .trim()
    .toLowerCase()
})

const selectedPage = computed(() => {
  const pages = Array.isArray(staticStore.static) ? staticStore.static : []

  return pages.find((item) => {
    const slug = String(item?.title || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')

    return slug === normalizedPage.value
  })
})

const pageTitle = computed(() => {
  if (activePage.value?.title) {
    return activePage.value.title
  }

  if (selectedPage.value?.title) {
    return selectedPage.value.title
  }

  return String(props.page || '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
})

const breadcrumbs = computed(() => [
  {
    title: t('Home'),
    link: '/',
  },
  {
    title: t(pageTitle.value),
  },
])

const getPage = async (id) => {
  if (!id) {
    activePage.value = null
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const response = await axios.get(`static-pages/${id}`)

    activePage.value = response.data?.payload || null
  } catch (requestError) {
    activePage.value = null

    error.value = requestError?.response?.data?.message || t('Failed to load page')
  } finally {
    isLoading.value = false
  }
}

watch(
  () => selectedPage.value?.id,
  async (id) => {
    if (!id) {
      activePage.value = null
      return
    }

    await getPage(id)
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <main class="static-page">
    <div class="static-page__container _cnt-home">
      <Breadcrumbs :items="breadcrumbs" class="static-page__breadcrumbs" />

      <div class="static-page__heading">
        <h1 class="static-page__title">
          {{ $t(pageTitle) }}
        </h1>
      </div>

      <div v-if="isLoading" class="static-page__loader">
        <Loader />
      </div>

      <div v-else-if="error" class="static-page__message">
        {{ error }}
      </div>

      <article v-else-if="activePage?.content" class="static-page__card">
        <div class="static-page__content" v-html="activePage.content" />
      </article>
    </div>
  </main>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.static-page {
  width: 100%;
  min-width: 0;

  @include header-indent;
  @include adaptiveValue('padding-top', 32, 18);
  @include adaptiveValue('padding-bottom', 104, 40);

  &__container {
    width: 100%;
    min-width: 0;
  }

  &__breadcrumbs {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 20);
    }
  }

  &__heading {
    width: 100%;
    min-width: 0;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 18);
    }
  }

  &__title {
    margin: 0;

    color: var(--primary-color);

    font-family: var(--font-gabarito);
    font-weight: 700;
    line-height: 1.1;

    @include adaptiveValue('font-size', 42, 30);
  }

  &__loader {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: center;

    @include adaptiveValue('min-height', 400, 240);
  }

  &__message {
    width: 100%;

    border: 2px solid var(--border-primary-color);
    border-radius: 14px;

    background-color: var(--bg-secondary-color);

    color: var(--primary-color);

    text-align: center;

    @include adaptiveValue('padding', 32, 20);
    @include adaptiveValue('font-size', 15, 14);
  }

  &__card {
    width: 100%;
    min-width: 0;

    border: 2px solid var(--border-primary-color);

    @include adaptiveValue('border-radius', 14, 10);
    @include adaptiveValue('padding-top', 40, 22);
    @include adaptiveValue('padding-right', 44, 18);
    @include adaptiveValue('padding-bottom', 44, 24);
    @include adaptiveValue('padding-left', 44, 18);

    background-color: var(--bg-secondary-color);

    overflow: hidden;
  }

  &__content {
    width: 100%;
    min-width: 0;

    color: var(--primary-color);

    font-family: var(--font-open-sans);

    @include adaptiveValue('font-size', 15, 13);
    @include adaptiveValue('line-height', 24, 21);

    /*
     * Server content contains inline styles such as:
     * style="color: #ffffff"
     *
     * !important is intentional here so the website theme
     * controls the rendered CMS content.
     */

    :deep(*) {
      box-sizing: border-box;
    }

    :deep(span),
    :deep(p),
    :deep(div),
    :deep(li),
    :deep(strong),
    :deep(b),
    :deep(em),
    :deep(i),
    :deep(td),
    :deep(th) {
      color: inherit !important;
      font-family: inherit !important;
    }

    :deep(p) {
      margin-top: 0 !important;

      color: var(--seconday-color) !important;

      @include adaptiveValue('margin-bottom', 16, 12);
    }

    :deep(p:last-child) {
      margin-bottom: 0 !important;
    }

    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      margin-top: 0 !important;

      color: var(--primary-color) !important;

      font-family: var(--font-gabarito) !important;
      font-weight: 700 !important;
      line-height: 1.25 !important;
    }

    :deep(h1) {
      @include adaptiveValue('font-size', 32, 24);
      @include adaptiveValue('margin-bottom', 20, 14);
    }

    :deep(h2) {
      @include adaptiveValue('font-size', 27, 21);
      @include adaptiveValue('margin-bottom', 18, 13);
    }

    :deep(h3) {
      @include adaptiveValue('font-size', 22, 18);
      @include adaptiveValue('margin-bottom', 16, 12);
    }

    :deep(h4),
    :deep(h5),
    :deep(h6) {
      @include adaptiveValue('font-size', 18, 16);
      @include adaptiveValue('margin-bottom', 14, 10);
    }

    :deep(strong),
    :deep(b) {
      color: var(--primary-color) !important;
      font-weight: 700 !important;
    }

    :deep(a) {
      color: var(--hint-primary-color) !important;

      text-decoration: none !important;

      transition: opacity 0.3s ease;
    }

    @media (any-hover: hover) {
      :deep(a:hover) {
        opacity: 0.7;
      }
    }

    :deep(hr) {
      width: 100%;
      height: 2px;

      margin-left: 0 !important;
      margin-right: 0 !important;

      border: 0 !important;

      background-color: var(--border-primary-color) !important;

      @include adaptiveValue('margin-top', 30, 22);
      @include adaptiveValue('margin-bottom', 30, 22);
    }

    :deep(ul),
    :deep(ol) {
      margin-top: 0 !important;

      padding-left: 0 !important;

      list-style: none !important;

      @include adaptiveValue('margin-bottom', 20, 16);
    }

    :deep(li) {
      position: relative;

      color: var(--seconday-color) !important;

      @include adaptiveValue('padding-left', 22, 18);
    }

    :deep(li:not(:last-child)) {
      @include adaptiveValue('margin-bottom', 10, 8);
    }

    :deep(li::before) {
      content: '';

      position: absolute;
      top: 0.72em;
      left: 2px;

      width: 7px;
      height: 2px;

      border-radius: 2px;

      background-color: var(--hint-primary-color);
    }

    :deep(li p) {
      margin: 0 !important;
    }

    :deep(blockquote) {
      margin-left: 0 !important;
      margin-right: 0 !important;

      border-left: 3px solid var(--hint-primary-color) !important;

      background-color: var(--bg-primary-color) !important;

      color: var(--seconday-color) !important;

      @include adaptiveValue('margin-top', 22, 16);
      @include adaptiveValue('margin-bottom', 22, 16);
      @include adaptiveValue('padding-top', 18, 14);
      @include adaptiveValue('padding-right', 20, 16);
      @include adaptiveValue('padding-bottom', 18, 14);
      @include adaptiveValue('padding-left', 20, 16);
    }

    :deep(img) {
      max-width: 100% !important;
      height: auto !important;

      border-radius: 10px;
    }

    /*
     * CMS TABLE
     */

    :deep(table) {
      width: 100% !important;
      min-width: 680px !important;

      margin-left: 0 !important;
      margin-right: 0 !important;

      border: 0 !important;
      border-collapse: collapse !important;
      border-spacing: 0 !important;

      background: transparent !important;

      color: var(--primary-color) !important;

      table-layout: auto !important;

      @include adaptiveValue('margin-top', 24, 18);
      @include adaptiveValue('margin-bottom', 28, 20);
    }

    :deep(thead),
    :deep(tbody),
    :deep(tr) {
      background: transparent !important;
    }

    :deep(th) {
      padding-top: 11px !important;
      padding-right: 14px !important;
      padding-bottom: 11px !important;
      padding-left: 14px !important;

      border: 0 !important;
      border-bottom: 2px solid var(--border-primary-color) !important;

      background: transparent !important;

      color: var(--seconday-color) !important;

      font-family: var(--font-open-sans) !important;
      font-size: 11px !important;
      font-weight: 700 !important;
      line-height: 16px !important;
      letter-spacing: 1.4px !important;
      text-align: left !important;
      text-transform: uppercase !important;
      vertical-align: middle !important;
    }

    :deep(td) {
      padding-top: 15px !important;
      padding-right: 14px !important;
      padding-bottom: 15px !important;
      padding-left: 14px !important;

      border: 0 !important;
      border-bottom: 2px solid var(--border-primary-color) !important;

      background: transparent !important;

      color: var(--primary-color) !important;

      font-family: var(--font-open-sans) !important;
      font-size: 14px !important;
      line-height: 20px !important;
      text-align: left !important;
      vertical-align: middle !important;
    }

    :deep(td:first-child),
    :deep(th:first-child) {
      padding-left: 0 !important;
    }

    :deep(td:last-child),
    :deep(th:last-child) {
      padding-right: 0 !important;
    }

    :deep(table p) {
      margin: 0 !important;

      color: inherit !important;
    }

    :deep(table a) {
      color: var(--hint-primary-color) !important;
    }

    /*
     * A table coming directly from CMS cannot receive
     * an extra Vue wrapper, so on mobile the content
     * container itself becomes the safe overflow boundary.
     */

    @media (max-width: $md4) {
      overflow-x: auto;
      overflow-y: hidden;

      -webkit-overflow-scrolling: touch;

      :deep(table) {
        min-width: 620px !important;
      }

      :deep(th) {
        padding-top: 10px !important;
        padding-right: 12px !important;
        padding-bottom: 10px !important;
        padding-left: 12px !important;

        font-size: 10px !important;
        line-height: 14px !important;
      }

      :deep(td) {
        padding-top: 12px !important;
        padding-right: 12px !important;
        padding-bottom: 12px !important;
        padding-left: 12px !important;

        font-size: 12px !important;
        line-height: 18px !important;
      }

      :deep(td:first-child),
      :deep(th:first-child) {
        padding-left: 0 !important;
      }
    }

    /*
     * Other CMS elements
     */

    :deep(pre) {
      max-width: 100% !important;

      overflow-x: auto !important;

      border: 2px solid var(--border-primary-color) !important;
      border-radius: 10px !important;

      background-color: var(--bg-primary-color) !important;

      color: var(--primary-color) !important;

      white-space: pre-wrap !important;
      word-break: break-word !important;

      @include adaptiveValue('padding', 18, 14);
    }

    :deep(code) {
      color: var(--primary-color) !important;
      font-family: monospace !important;
    }
  }

  @media (max-width: $md5) {
    &__card {
      border-radius: 10px;
    }
  }
}
</style>
