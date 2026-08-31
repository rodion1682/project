<template>
  <div class="heros">
    <div class="heros__bg _ibg">
      <img src="@/assets/img/heros-bg.png" />
    </div>
    <div class="heros__decor _ibg-contain">
      <img src="@/assets/img/heros-decor-top.png" />
    </div>
    <div class="heros__inner _cnt-home">
      <div class="heros__top">
        <div class="heros__subtitle _h5">{{ $t('Champions') }}</div>
        <div class="heros__title _h2">
          {{ $t('Choose') }}
          <span>{{ $t('Your Master') }}</span>
        </div>
      </div>
      <div v-if="heroes && heroes.length" class="heros__items">
        <template v-for="item in heroes" :key="item.id">
          <div @click="open(item)" class="heros__item">
            <div class="heros__image _ibg-contain">
              <img :src="item.image_plain" :alt="item.name" />
            </div>
            <div class="heros__info">
              <div class="heros__name _h3">{{ item.name }}</div>
              <div class="heros__playstyle">
                {{ item.playstyle }}
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHeroesStore } from '@/stores/heroes'
import { useModalStore } from '@/stores/modal'
import 'swiper/css'
import 'swiper/css/navigation'
import { computed } from 'vue'

const heroesStore = useHeroesStore()
const modalStore = useModalStore()

const heroes = computed(() => heroesStore.heroes)

const open = item => {
  modalStore.open('hero', item)
}
</script>

<style lang="scss" scoped>
.heros {
  @include adaptiveValue('padding-top', 156, 25);
  @include adaptiveValue('padding-bottom', 128, 25);
  position: relative;
  &__bg {
    position: absolute;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
  }
  &__decor {
    position: absolute;
    top: 0;
    left: 50%;
    z-index: 1;

    width: 15vw;
    height: 1.4vw;

    transform: translate(-50%, -50%);
  }
  &__inner {
    position: relative;
    z-index: 2;
  }

  &__top {
    max-width: 500px;

    margin-right: auto;
    margin-left: auto;

    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 39, 15);
    }
  }

  &__subtitle {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 15);
    }
  }

  &__title {
  }

  &__items {
    display: flex;
    @media (max-width: $md3) {
      flex-wrap: wrap;
      justify-content: center;
    }
  }

  &__item {
    flex: 0 1 20%;

    pointer-events: none !important;
    @media (max-width: $md3) {
      flex: 0 1 33.333%;
    }
    @media (max-width: $md5) {
      flex: 0 1 50%;
    }
  }

  &__image {
    width: 100%;

    padding-bottom: 149%;
    &:not(:last-child) {
      margin-bottom: 7px;
    }
  }
  &__info {
    padding: 0px 10px;

    text-align: center;
  }
  &__name {
    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }
  &__playstyle {
    max-width: 210px;

    margin: 0 auto;

    color: var(--fourth-color);
    text-align: center;
  }
}
</style>
