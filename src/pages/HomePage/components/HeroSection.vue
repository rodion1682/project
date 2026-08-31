<template>
  <div class="hero">
    <div class="hero__bg _ibg">
      <img src="@/assets/img/hero-bg.jpg" alt="" />
    </div>
    <div class="hero__decor _ibg-contain">
      <img src="@/assets/img/hero-decor-left.png" alt="" />
    </div>
    <div class="hero__inner _cnt-home">
      <div class="hero__subtitle _h5">
        {{ $t('The Last Great Civilization of Magic') }}
      </div>

      <div class="hero__title _h1">
        {{ $t('Knowledge') }}
        <span>{{ $t('Is the Greatest') }}</span>
        {{ $t('Power') }}
      </div>
      <div class="hero__text">
        {{
          $t(
            'Explore the forgotten halls of Aroraium — a legendary civilization built upon knowledge, ancient magic, and timeless architecture. Collect powerful cards, master forgotten schools of magic, and uncover secrets hidden for centuries.',
          )
        }}
      </div>

      <div class="hero__actions">
        <BaseButton
          @click="openPlayPage"
          class="hero__button hero__button_play"
        >
          {{ $t('Play now') }}
        </BaseButton>

        <BaseButton
          @click="goToMarketPage"
          variant="bordered"
          class="hero__button hero__button_market"
        >
          {{ $t('Explore the card market') }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'

const router = useRouter()

const playRedirectLink = import.meta.env.VITE_PLAY_REDIRECT_LINK

const openPlayPage = () => {
  if (!playRedirectLink) {
    console.warn('VITE_PLAY_REDIRECT_LINK is not defined')
    return
  }

  window.open(playRedirectLink, '_blank', 'noopener,noreferrer')
}

const goToMarketPage = () => {
  router.push({
    name: 'ProductListPage',
  })
}
</script>

<style lang="scss" scoped>
.hero {
  @include adaptiveValue('margin-top', 67, 50, 1840, 1370, 1);
  @include adaptiveValue('padding-top', 121, 25);
  @include adaptiveValue('padding-bottom', 370, 25);
  position: relative;
  &__bg {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    pointer-events: none;
  }
  &__decor {
    position: absolute;
    right: 0;
    bottom: 0;

    width: 23vw;
    height: 13vw;

    transform: translate(0px, 50%);
  }

  &__inner {
    position: relative;
    z-index: 1;
  }

  &__subtitle {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 15);
    }
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 32, 15);
    }
    span {
      display: block;
    }
  }

  &__text {
    max-width: 792px;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 46, 15);
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  &__button {
    &_play {
      max-width: 229px;
    }
    &_market {
      max-width: 345px;
    }
  }
}
</style>
