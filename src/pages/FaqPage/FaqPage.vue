<template>
  <div class="faq-page">
    <div class="faq-page__background _ibg">
      <img src="@/assets/img/faq-bg.jpg" alt="" aria-hidden="true" />
    </div>

    <div class="faq-page__inner _cnt-home">
      <div class="faq">
        <div class="faq__heading">
          <h1 class="faq__title _h3">
            {{ $t('Frequently Asked Questions') }}
          </h1>
        </div>
        <div v-if="isLoading" class="faq__items" aria-live="polite">
          <div v-for="item in 5" :key="item" class="faq__skeleton">
            <span class="faq__skeleton-line" />
            <span class="faq__skeleton-icon" />
          </div>
        </div>

        <!-- Questions -->
        <div v-else-if="faqItems.length" class="faq__items">
          <div
            v-for="(item, index) in faqItems"
            :key="getItemKey(item, index)"
            class="faq__item"
            :class="{
              faq__item_open: isOpen(index),
            }"
          >
            <button
              type="button"
              class="faq__question"
              :aria-expanded="isOpen(index)"
              :aria-controls="getAnswerId(index)"
              @click="toggle(index)"
            >
              <span class="faq__question-text">
                {{ getQuestion(item) }}
              </span>

              <span class="faq__toggle" aria-hidden="true">
                <span class="faq__toggle-line" />

                <span class="faq__toggle-line faq__toggle-line_vertical" />
              </span>
            </button>

            <div
              :id="getAnswerId(index)"
              class="faq__answer-wrapper"
              :class="{
                'faq__answer-wrapper_open': isOpen(index),
              }"
            >
              <div class="faq__answer-overflow">
                <div class="faq__answer">
                  <div class="faq__answer-content" v-html="getAnswer(item)" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else class="faq__empty">
          <div class="faq__empty-title _h3">
            {{ $t('No questions found') }}
          </div>

          <p class="faq__empty-text">
            {{ $t('Frequently asked questions will appear here.') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

import { useFaqStore } from '@/stores/faq'

const faqStore = useFaqStore()

/*
 * Keep null to start with every answer closed.
 * Change to ref(0) to open the first answer initially.
 */
const activeIndex = ref(null)

const isLoading = computed(() => {
  return Boolean(faqStore.isLoading)
})

const faqItems = computed(() => {
  const items =
    faqStore.faqs || faqStore.faq || faqStore.items || faqStore.questions || []

  return Array.isArray(items) ? items : []
})

const getItemKey = (item, index) => {
  return item?.id ?? item?.uuid ?? `faq-${index}`
}

const getQuestion = item => {
  return item?.question || item?.title || item?.name || ''
}

const getAnswer = item => {
  return item?.answer || item?.content || item?.description || item?.text || ''
}

const getAnswerId = index => {
  return `faq-answer-${index}`
}

const isOpen = index => {
  return activeIndex.value === index
}

const toggle = index => {
  activeIndex.value = activeIndex.value === index ? null : index
}
</script>

<style lang="scss" scoped>
.faq-page {
  @include adaptiveValue('padding-top', 135, 85);
  @include adaptiveValue('padding-bottom', 130, 50);

  position: relative;

  display: flex;
  flex: 1 1 auto;
  flex-direction: column;

  width: 100%;
  min-width: 0;

  &__background {
    position: absolute;
    inset: 0;
    z-index: 0;

    width: 100%;
    height: 100%;

    pointer-events: none;

    img {
      display: block;

      width: 100%;
      height: 100%;

      object-fit: cover;
      object-position: center top;
    }
  }

  &__inner {
    position: relative;
    z-index: 1;

    width: 100%;
    min-width: 0;
    max-width: 1170px;

    margin: 0 auto;
    margin-top: auto;
    margin-bottom: auto;
  }
}

.faq {
  width: 100%;
  min-width: 0;

  &__heading {
    max-width: 760px;

    margin-right: auto;
    margin-left: auto;

    text-align: center;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 20);
    }
  }

  &__subtitle {
    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }

  &__title {
    color: var(--primary-color);
    text-align: center;
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 10px;

    width: 100%;
  }

  &__item {
    width: 100%;
    min-width: 0;

    &_open {
      .faq__question {
        border-color: var(--border-secondary-color);

        color: var(--primary-color);
      }

      .faq__toggle {
        color: var(--hint-primary-color);
      }

      .faq__toggle-line_vertical {
        opacity: 0;

        transform: translate(-50%, -50%) rotate(90deg);
      }
    }
  }

  &__question {
    @include adaptiveValue('min-height', 88, 62);
    @include adaptiveValue('padding', 30, 10);
    @include adaptiveValue('font-size', 20, 18);

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    width: 100%;

    border: 1px solid var(--border-fourth-color);
    border-radius: 6px;
    outline: none;
    background-color: var(--bg-fourth-color);

    color: var(--hint-primary-color);
    font-family: var(--font-spectral-sc);
    font-weight: 400;
    line-height: 120%;
    text-align: left;
    text-transform: uppercase;

    cursor: pointer;

    transition: all 0.3s ease 0s;
    &:focus-visible {
      border-color: var(--hint-secondary-color);
    }

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--border-secondary-color);

        color: var(--primary-color);

        .faq__toggle {
          color: var(--hint-secondary-color);
        }
      }
    }
  }

  &__question-text {
    display: block;

    overflow-wrap: anywhere;
  }

  &__toggle {
    position: relative;

    flex: 0 0 24px;

    width: 24px;
    height: 24px;

    color: var(--hint-primary-color);

    transition: color 0.3s ease;
  }

  &__toggle-line {
    position: absolute;
    top: 50%;
    left: 50%;

    display: block;

    width: 16px;
    height: 1px;

    background-color: currentColor;

    transform: translate(-50%, -50%) rotate(0deg);
    transition:
      opacity 0.3s ease,
      transform 0.3s ease;

    &_vertical {
      transform: translate(-50%, -50%) rotate(90deg);
    }
  }

  &__answer-wrapper {
    display: grid;
    grid-template-rows: 0fr;

    opacity: 0;

    transition:
      grid-template-rows 0.35s ease,
      opacity 0.3s ease;

    &_open {
      grid-template-rows: 1fr;

      opacity: 1;
    }
  }

  &__answer-overflow {
    overflow: hidden;

    min-height: 0;
  }

  &__answer {
    @include adaptiveValue('padding', 32, 10);

    margin-top: 10px;

    border-radius: 6px;
    background-color: var(--bg-primary-color);
  }

  &__answer-content {
    color: var(--secondary-color);
    font-family: var(--font-inter);
    font-size: 15px;
    font-weight: 400;
    line-height: 150%;

    overflow-wrap: anywhere;

    :deep(p) {
      margin: 0;

      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 16, 15);
      }
    }

    :deep(a) {
      color: var(--hint-secondary-color);

      transition: color 0.3s ease;

      @media (any-hover: hover) {
        &:hover {
          color: var(--primary-color);
        }
      }
    }

    :deep(ul),
    :deep(ol) {
      margin: 14px 0;
      padding-left: 22px;
    }

    :deep(li) {
      &:not(:last-child) {
        margin-bottom: 7px;
      }
    }
  }

  &__skeleton {
    @include adaptiveValue('min-height', 88, 62);
    @include adaptiveValue('padding-left', 32, 15);
    @include adaptiveValue('padding-right', 32, 15);

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 30px;

    border: 1px solid var(--border-fourth-color);
    border-radius: 6px;
    background-color: rgb(28 29 29 / 76%);
  }

  &__skeleton-line {
    width: min(70%, 560px);
    height: 15px;

    border-radius: 4px;
    background: linear-gradient(
      90deg,
      var(--bg-secondary-color) 25%,
      var(--border-fourth-color) 50%,
      var(--bg-secondary-color) 75%
    );
    background-size: 200% 100%;

    animation: faq-skeleton 1.5s linear infinite;
  }

  &__skeleton-icon {
    flex: 0 0 18px;

    width: 18px;
    height: 18px;

    border-radius: 50%;
    background-color: var(--border-fourth-color);
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    min-height: 250px;

    padding: 30px;

    border: 1px solid var(--border-fourth-color);
    border-radius: 6px;
    background-color: rgb(28 29 29 / 76%);

    text-align: center;
  }

  &__empty-title {
    color: var(--hint-primary-color);

    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }

  &__empty-text {
    color: var(--secondary-color);
    font-size: 14px;
  }

  @media (max-width: $md4) {
    &__items {
      gap: 8px;
    }

    &__question {
      gap: 15px;
    }

    &__toggle {
      flex-basis: 20px;

      width: 20px;
      height: 20px;
    }

    &__toggle-line {
      width: 14px;
    }

    &__answer {
      margin-top: 3px;
    }
  }

  @media (max-width: $md7) {
    &__question {
      font-size: 14px;
    }

    &__answer-content {
      font-size: 13px;
    }
  }
}

@keyframes faq-skeleton {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}
</style>
