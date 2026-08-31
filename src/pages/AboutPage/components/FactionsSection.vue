<template>
  <div class="factions">
    <div class="factions__bg _ibg">
      <img src="@/assets/img/heros-bg.png" />
    </div>
    <div class="factions__inner _cnt-home">
      <div class="factions__top">
        <div class="factions__subtitle _h5">{{ $t('Factions') }}</div>
        <div class="factions__title _h2">
          {{ $t('The Five') }}
          <span>{{ $t('Great Orders') }}</span>
        </div>
        <div class="factions__label _h3">
          {{
            $t(
              'After the Fall, five ancient orders preserved Aroraium`s legacy. Each carries a different shard of its forgotten power.',
            )
          }}
        </div>
      </div>
      <div v-if="heroes && heroes.length" class="factions__items">
        <template v-for="item in heroes" :key="item.id">
          <div @click="open(item)" class="factions__item">
            <div class="factions__image _ibg-contain">
              <img :src="item.image_plain" :alt="item.name" />
            </div>
            <div class="factions__info">
              <div class="factions__name _h3">{{ item.name }}</div>
              <div class="factions__playstyle">
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
.factions {
  @include adaptiveValue('margin-top', 146, 0);
  @include adaptiveValue('padding-bottom', 128, 25);
  @include adaptiveValue('padding-top', 0, 25);
  position: relative;
  &__bg {
    @include adaptiveValue('top', 35, 0);
    position: absolute;
    left: 0;

    width: 100%;
    height: 100%;
  }
  &__inner {
    position: relative;
    z-index: 1;
  }

  &__top {
    max-width: 675px;

    margin-right: auto;
    margin-left: auto;

    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 108, 15);
    }
  }

  &__subtitle {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 15);
    }
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 34, 15);
    }
  }
  &__label {
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
    color: var(--fourth-color);
  }
}
</style>
