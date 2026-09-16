<script setup>
import { onMounted, ref } from 'vue'

import axios from '@/plugins/axios'

import Loader from '@/components/Loader.vue'

const faq = ref([])
const isLoading = ref(false)

const getFaq = async () => {
  isLoading.value = true

  try {
    const response = await axios.get('faq')

    if (response.data?.status === 'OK' && Array.isArray(response.data?.payload)) {
      faq.value = response.data.payload
    } else {
      faq.value = []
    }
  } catch {
    faq.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  getFaq()
})
</script>

<template>
  <section v-if="isLoading || faq.length" class="faq-section">
    <div class="faq-section__title">
      {{ $t('Frequent questions') }}
    </div>

    <div v-if="isLoading" class="faq-section__loader">
      <Loader />
    </div>

    <div v-else class="faq-section__items">
      <div v-for="item in faq" :key="item.id" class="faq-section__item">
        <div class="faq-section__question">
          {{ item.question }}
        </div>

        <div v-if="item.answer" class="faq-section__answer" v-html="item.answer"></div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.faq-section {
  width: 100%;
  min-width: 0;

  padding: 28px 32px 30px;

  border: 2px solid var(--border-primary-color);
  border-radius: 14px;

  background-color: var(--bg-secondary-color);

  &__title {
    color: var(--seconday-color);

    font-size: 11px;
    font-weight: 500;
    line-height: 1.4;
    letter-spacing: 0.18em;
    text-transform: uppercase;

    margin-bottom: 18px;
  }

  &__loader {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 180px;
  }

  &__items {
    width: 100%;
    min-width: 0;
  }

  &__item {
    width: 100%;
    min-width: 0;

    padding-bottom: 16px;

    border-bottom: 1px solid var(--border-primary-color);

    &:not(:first-child) {
      padding-top: 16px;
    }

    &:last-child {
      padding-bottom: 0;

      border-bottom: 0;
    }
  }

  &__question {
    color: var(--primary-color);

    font-size: 15px;
    font-weight: 600;
    line-height: 1.4;

    &:not(:last-child) {
      margin-bottom: 6px;
    }
  }

  &__answer {
    color: var(--seconday-color);

    font-size: 13px;
    font-weight: 400;
    line-height: 1.6;

    overflow-wrap: anywhere;

    :deep(p) {
      margin: 0;
    }

    :deep(p + p) {
      margin-top: 8px;
    }

    :deep(a) {
      color: var(--hint-primary-color);

      text-decoration: none;

      transition: opacity 0.3s ease;

      @media (any-hover: hover) {
        &:hover {
          opacity: 0.7;
        }
      }
    }

    :deep(ul),
    :deep(ol) {
      margin-top: 6px;
      margin-bottom: 0;

      padding-left: 18px;
    }

    :deep(li + li) {
      margin-top: 4px;
    }

    :deep(strong),
    :deep(b) {
      color: var(--primary-color);

      font-weight: 600;
    }
  }

  @media (max-width: $md8) {
    padding: 0;

    border: 0;
    border-radius: 0;

    background-color: transparent;

    &__title {
      margin-bottom: 14px;

      color: var(--primary-color);

      font-size: 20px;
      font-weight: 500;
      line-height: 1.2;
      letter-spacing: -0.02em;
      text-transform: none;
    }

    &__loader {
      min-height: 140px;

      :deep(.loader) {
        min-width: 36px;
        max-width: 36px;
        min-height: 36px;
        max-height: 36px;

        border-width: 4px;
      }
    }

    &__item {
      padding-bottom: 13px;

      &:not(:first-child) {
        padding-top: 13px;
      }
    }

    &__question {
      font-size: 13px;
      font-weight: 500;
      line-height: 1.4;

      &:not(:last-child) {
        margin-bottom: 5px;
      }
    }

    &__answer {
      font-size: 11px;
      line-height: 1.55;

      :deep(p + p) {
        margin-top: 6px;
      }

      :deep(ul),
      :deep(ol) {
        padding-left: 16px;
      }
    }
  }
}
</style>
