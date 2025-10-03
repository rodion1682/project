<script setup></script>
<template>
  <div class="create-center texture-center">
    <div class="text text-36">
      <b>{{ $t('Texture') }}</b>
    </div>
    <div class="text text-24 text-inter">
      {{ $t('Describe your idea and let AI generate it.') }}
    </div>
    <div class="bar flex flex-col justify-around">
      <div class="bar-item">
        <div class="text text-20 text-inter">
          {{ $t('Select model for texture') }}
        </div>
        <div class="texture-list flex">
          <div class="texture-item">
            <div class="image">
              <img alt="model2 icon" class="img" src="@/assets/images/model2.webp" />
            </div>
            <img alt="selected icon" class="selected-icon" src="@/assets/images/selected.svg" />
          </div>
          <div class="texture-item">
            <div class="image">
              <img alt="model3 icon" class="img" src="@/assets/images/model3.webp" />
            </div>
            <img alt="selected icon" class="selected-icon" src="@/assets/images/selected.svg" />
          </div>
        </div>
      </div>
      <div class="bar-item">
        <div class="text text-20 text-inter">
          {{ $t('Another types of models') }}
        </div>
        <div class="texture-list flex">
          <div class="texture-item">
            <div class="image">
              <img alt="drafts icon" class="img" src="@/assets/images/drafts.webp" />
            </div>
            <div class="text text-16 text-inter">{{ $t('Drafts') }}</div>
          </div>
          <div class="texture-item">
            <div class="image">
              <img alt="stylize icon" class="icon" src="@/assets/images/createNav/stylize.svg" />
              <img alt="model2 icon" class="img" src="@/assets/images/model2.webp" />
            </div>
            <div class="text text-16 text-inter">{{ $t('Stylized') }}</div>
          </div>
          <div class="texture-item">
            <div class="image">
              <img alt="revive icon" class="icon" src="@/assets/images/createNav/revive.svg" />
              <img alt="model3 icon" class="img" src="@/assets/images/model3.webp" />
            </div>
            <div class="text text-16 text-inter">{{ $t('Animate') }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
