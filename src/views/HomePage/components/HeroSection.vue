<script setup>
import { watch } from 'vue'

import BaseButton from '@/components/ui/BaseButton.vue'

import PriceFormatter from '@/components/ui/PriceFormatter.vue'
import { useCurrStore } from '@/stores/currencies'
import { usePopularStore } from '@/stores/popular'
import { useRouter } from 'vue-router'

const router = useRouter()

const popularStore = usePopularStore()
const currStore = useCurrStore()

const goToCatalog = () => {
  router.push({ path: '/products' })
}

const goToShop = () => {
  router.push({ path: '/products/all/all' })
}

const getProductLink = (product) => {
  const category = product?.categories?.find((item) => item.parent !== null)

  if (!category?.parent) {
    return '/products'
  }

  return `/products/${category.parent.slug}/${category.slug}/${product.id}`
}

watch(
  () => currStore.currency.code,
  (currency) => {
    if (!currency) return

    popularStore.getDeal()
  },
  {
    immediate: true,
  },
)
</script>

<template>
  <div class="hero">
    <div class="hero__bg _ibg">
      <img src="@/assets/img/hero-bg.png" />
    </div>
    <div class="hero__container _cnt-home">
      <div class="hero__hint">
        {{ $t('Codes land in your inbox') }}
      </div>
      <div class="hero__title _h1">
        {{ $t('Instant access to') }}
        <span>{{ $t('new worlds') }}</span>
      </div>
      <div class="hero__text">
        {{
          $t(
            'Official keys and gift cards for every launcher, delivered the minute your payment clears. Thousands of titles, no queue, no publisher markup.',
          )
        }}
      </div>
      <div class="hero__actions">
        <BaseButton @click="goToShop" class="hero__action hero__action_shop">{{
          $t('Shop now')
        }}</BaseButton>
        <BaseButton
          @click="goToCatalog"
          class="hero__action hero__action_catalog"
          variant="link"
          icon="arrow"
          >{{ $t('Browse catalog') }}</BaseButton
        >
      </div>
      <div class="hero__bottom">
        <div class="hero__items">
          <div class="hero__item">
            <div class="hero__label _h7">{{ $t('12,400') }}</div>
            <div class="hero__value">{{ $t('keys in stock') }}</div>
          </div>
          <div class="hero__item">
            <div class="hero__label _h7">{{ $t('60 sec') }}</div>
            <div class="hero__value">{{ $t('average delivery') }}</div>
          </div>
          <div class="hero__item">
            <div class="hero__label _h7">{{ $t('4.8/5') }}</div>
            <div class="hero__value">{{ $t('12k reviews') }}</div>
          </div>
        </div>
        <RouterLink
          v-if="popularStore.deal"
          :to="getProductLink(popularStore.deal)"
          class="hero__deal deal"
        >
          <div class="deal__image _ibg">
            <img :src="popularStore.deal.image" :alt="popularStore.deal.title" />
            <div class="deal__gradient _ibg">
              <img src="@/assets/img/launcher-gradient.svg" />
            </div>
          </div>
          <div class="deal__content">
            <div class="deal__label">
              {{ $t('Deal of the day') }}
            </div>
            <div class="deal__title _h6">
              {{ popularStore.deal.title }}
            </div>

            <PriceFormatter size="size-21" :price="popularStore.deal.price" class="deal__price" />
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.hero {
  position: relative;
  @include adaptiveValue('padding-top', 50, 14);
  @include adaptiveValue('padding-bottom', 131, 18);
  @media (min-width: $md8) {
    &__bg {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
    }
  }

  &__container {
    position: relative;
    z-index: 1;
  }

  &__hint {
    color: var(--primary-color);
    text-transform: uppercase;
    letter-spacing: 1.92px;
    font-weight: 700;
    font-size: 12px;
    line-height: 16px;
    padding: 8px 16px;
    background-color: var(--cyan-color);
    border-radius: 8px;
    transform: rotate(-2deg);
    width: fit-content;
    &:not(:last-child) {
      margin-bottom: 15px;
    }
    @media (max-width: $md8) {
      @include hide-item;
    }
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 17, 15);
    }
    @media (max-width: $md8) {
      @include hide-item;
    }
  }

  &__text {
    max-width: 660px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 18, 15);
    }
    @media (max-width: $md8) {
      @include hide-item;
    }
  }

  &__actions {
    display: flex;
    gap: 20px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 15);
    }
    @media (max-width: $md8) {
      @include hide-item;
    }
  }
  &__action {
    &_shop {
      min-width: 155px;
    }
    &_catalog {
      min-width: fit-content;
    }
    @media (max-width: $md8) {
      @include hide-item;
    }
  }

  &__bottom {
    display: flex;
    align-items: center;
    @include adaptiveValue('gap', 18, 10);
    @media (max-width: $md3) {
      flex-wrap: wrap;
    }
    @media (max-width: $md8) {
      display: block;
    }
  }

  &__items {
    display: flex;
    @include adaptiveValue('gap', 14, 10);
    @media (max-width: $md6) {
      flex-wrap: wrap;
    }
    @media (max-width: $md8) {
      @include hide-item;
    }
  }

  &__item {
    height: fit-content;
    @include adaptiveValue('padding-top', 13, 15);
    @include adaptiveValue('padding-left', 20, 15);
    @include adaptiveValue('padding-bottom', 13, 15);
    @include adaptiveValue('padding-right', 20, 15);
    background-color: var(--bg-tenth-color);
    border: 2px solid var(--border-primary-color);
    @include adaptiveValue('border-radius', 12, 10);
    @media (max-width: $md8) {
      @include hide-item;
    }
  }

  &__label {
    &:not(:last-child) {
      margin-bottom: 2px;
    }
    @media (max-width: $md8) {
      @include hide-item;
    }
  }

  &__value {
    text-transform: uppercase;
    letter-spacing: 1.54px;
    font-size: 11px;
    line-height: 15px;
    font-weight: 400;
    color: var(--seconday-color);
    @media (max-width: $md8) {
      @include hide-item;
    }
  }
}

.deal {
  padding: 15px;
  background-color: var(--bg-primary-color);
  border-radius: 14px;
  border: 2px solid var(--border-primary-color);
  transition: border 0.3s ease 0s;
  display: flex;
  align-items: center;
  gap: 15px;
  @media (any-hover: hover) {
    &:hover {
      border-color: var(--hint-primary-color);
    }
  }
  @media (max-width: $md8) {
    padding: 0px;
    position: relative;
  }
  &__image {
    @media (min-width: $md8) {
      border-radius: 10px;
      overflow: hidden;
      min-width: 92px;
      height: 66px;
    }
    @media (max-width: $md8) {
      width: 100%;
      padding-bottom: 73%;
      border-radius: 14px;
      overflow: hidden;
    }
  }
  &__gradient {
    @media (min-width: $md8) {
      @include hide-item;
    }
    @media (max-width: $md8) {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
    }
  }

  &__content {
    @media (max-width: $md8) {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      z-index: 1;
      padding: 16px 18px;
      display: flex;
      align-items: flex-end;
    }
  }

  &__label {
    font-size: 11px;
    line-height: 15px;
    letter-spacing: 1.76px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--orange-color);
    &:not(:last-child) {
      margin-bottom: 5px;
    }
    @media (max-width: $md8) {
      @include hide-item;
    }
  }

  &__title {
    @media (min-width: $md8) {
      text-transform: none;
      &:not(:last-child) {
        margin-bottom: 5px;
      }
    }
    @media (max-width: $md8) {
      font-size: 15px;
      line-height: 20px;
      font-family: var(--font-open-sans);
      font-weight: 400;
    }
  }

  &__price {
    @media (max-width: $md8) {
      @include hide-item;
    }
  }
}
</style>
