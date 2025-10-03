<script setup></script>
<template>
  <div class="create-center revive-center">
    <div class="bar">
      <div class="text text-20 text-inter">
        {{ $t('Set up a model for animation') }}
      </div>
      <button class="button big w-210">{{ $t('Installation') }}</button>

      <label class="label search">
        <img alt="search icon" class="img" src="@/assets/images/createNav/search.svg" />
        <input type="text" :placeholder="$t('Search an animation')" />
      </label>
      <div class="list flex flex-wrap">
        <div class="item link">
          <img alt="animation icon" class="img" src="@/assets/images/animation.webp" />
        </div>
        <div class="item link">
          <img alt="animation icon" class="img" src="@/assets/images/animation.webp" />
        </div>
        <div class="item link">
          <img alt="animation icon" class="img" src="@/assets/images/animation.webp" />
        </div>
        <div class="item link">
          <img alt="animation icon" class="img" src="@/assets/images/animation.webp" />
        </div>
        <div class="item link">
          <img alt="animation icon" class="img" src="@/assets/images/animation.webp" />
        </div>
        <div class="item link">
          <img alt="animation icon" class="img" src="@/assets/images/animation.webp" />
        </div>
        <div class="item link">
          <img alt="animation icon" class="img" src="@/assets/images/animation.webp" />
        </div>
      </div>
    </div>
  </div>
</template>
