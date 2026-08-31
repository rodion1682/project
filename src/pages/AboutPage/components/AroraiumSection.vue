<template>
  <div class="aroraium">
    <div class="aroraium__decor aroraium__decor_center _ibg-contain">
      <img src="@/assets/img/heros-decor-top.png" />
    </div>
    <div class="aroraium__decor aroraium__decor_right _ibg-contain">
      <img src="@/assets/img/library-decor-right.png" />
    </div>
    <div class="aroraium__bg _ibg">
      <img src="@/assets/img/library-bg.jpg" />
    </div>
    <div class="aroraium__inner _cnt-home">
      <div class="aroraium__top">
        <div class="aroraium__subtitle _h5">{{ $t('Enter the World') }}</div>
        <div class="aroraium__title _h2">
          {{ $t('The Gates of') }}
          <span>{{ $t('Aroraium') }}</span>
          <div>{{ $t('Stand Open') }}</div>
        </div>
      </div>
      <div class="aroraium__label _h3">
        {{
          $t(
            'Three centuries of silence. Now the archives unlock. The Orders gather. And the relics of the greatest civilization await those with the courage — and the knowledge — to claim them.',
          )
        }}
      </div>
      <div class="aroraium__actions">
        <BaseButton
          @click="openPlayPage"
          class="aroraium__button aroraium__button_play"
        >
          {{ $t('Play now') }}
        </BaseButton>

        <BaseButton
          @click="goToMarketPage"
          variant="bordered"
          class="aroraium__button aroraium__button_market"
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
.aroraium {
  @include adaptiveValue('margin-top', 175, 0);
  @include adaptiveValue('padding-top', 119, 25);
  @include adaptiveValue('padding-bottom', 154, 25);
  position: relative;
  &__decor {
    position: absolute;
    top: 0;
    z-index: 1;
    &_center {
      left: 50%;

      width: 15vw;
      height: 1.4vw;

      transform: translate(-50%, -50%);
    }
    &_right {
      right: 0;

      width: 15.7vw;
      height: 10.4vw;

      transform: translate(0px, -50%);
    }
  }
  &__bg {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
  }

  &__inner {
    position: relative;
    z-index: 1;
  }

  &__top {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 34, 15);
    }
  }

  &__subtitle {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 15);
    }
  }

  &__title {
    max-width: 700px;

    margin: 0 auto;
  }

  &__label {
    max-width: 1141px;

    margin-right: auto;
    margin-left: auto;

    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 64, 15);
    }
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
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
