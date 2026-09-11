<script setup>
import '@splidejs/splide/dist/css/splide.min.css'
import FeaturedSection from './components/FeaturedSection.vue'
import HeroSection from './components/HeroSection.vue'
import LauncherSection from './components/LauncherSection.vue'
import PlatformSection from './components/PlatformSection.vue'
import SetUpSection from './components/SetUpSection.vue'
import WhatMobSection from './components/WhatMobSection.vue'
import WhySection from './components/WhySection.vue'
import WorldMobSection from './components/WorldMobSection.vue'
</script>

<template>
  <div class="home">
    <div class="home__hero">
      <HeroSection />
    </div>
    <div class="home__world">
      <WorldMobSection />
    </div>
    <div class="home__featured">
      <FeaturedSection />
    </div>
    <div class="home__platform">
      <PlatformSection />
    </div>
    <div class="home__launcher">
      <LauncherSection />
    </div>
    <div class="home__what">
      <WhatMobSection />
    </div>
    <div class="home__why">
      <WhySection />
    </div>
    <div class="home__set-up">
      <SetUpSection />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/classes' as *;

.home {
  @include header-indent;
  display: flex;
  flex-direction: column;
  &__hero {
    @media (max-width: $md8) {
      order: 1;
    }
  }
  &__world {
    @media (min-width: $md8) {
      @include hide-item;
    }
    @media (max-width: $md8) {
      order: 2;
    }
  }
  &__featured {
    @media (max-width: $md8) {
      @include hide-item;
    }
  }

  &__platform {
    @media (max-width: $md8) {
      order: 7;
    }
  }

  &__launcher {
    @media (max-width: $md8) {
      order: 4;
    }
  }
  &__what {
    @media (min-width: $md8) {
      @include hide-item;
    }
    @media (max-width: $md8) {
      order: 5;
    }
  }

  &__why {
    @media (max-width: $md8) {
      order: 3;
    }
  }

  &__set-up {
    @media (max-width: $md8) {
      order: 6;
    }
  }
}
</style>
