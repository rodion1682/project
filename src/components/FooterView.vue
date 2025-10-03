<script setup>
import { RouterLink } from 'vue-router'
import { useSocialsStore } from '@/stores/socials'
import { useSettingsStore } from '@/stores/settings'
import { useStaticStore } from '@/stores/static'

const socialsStore = useSocialsStore()
const settingsStore = useSettingsStore()
const staticStore = useStaticStore()
const url = import.meta.env.VITE_APP_DOMAIN
</script>

<template>
  <div class="section footer">
    <div class="wrapper flex items-center">
      <div class="column flex flex-col">
        <RouterLink
          v-for="(item, i) in staticStore.static"
          :to="'/static/' + item.slug"
          :key="i"
          class="text text-14 text-white text-inter"
          >{{ item.title }}</RouterLink
        >
        <RouterLink to="/pricing" class="text text-16 text-white text-inter text-ice-blue">{{
          $t('Pricing')
        }}</RouterLink>
      </div>
      <div class="column flex flex-col">
        <RouterLink to="/" class="logo flex items-center justify-center">
          <img alt="Logo icon" class="img" src="@/assets/imgs/logo.svg" />
        </RouterLink>

        <div class="text text-14 text-inter text-gray">
          {{ settingsStore.settings.requisites }}
        </div>
      </div>
      <div class="column flex flex-col">
        <div class="column-wrapper">
          <div class="item">
            <div class="text text-14 weight-700 text-inter">{{ $t('Contact us') }}:</div>
            <a
              :href="'mailto:' + settingsStore.settings.support_email"
              class="text text-14 text-inter text-blue"
              >{{ settingsStore.settings.support_email }}</a
            >
          </div>
          <ul class="social-nav flex flex-wrap" v-if="socialsStore.socials">
            <li v-for="link in socialsStore.socials" :key="link.image" class="nav__item">
              <a :href="link.url" target="_blank">
                <img :src="url + `storage/${link.image}`" :alt="link.link" class="img" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="wrapper flex items-center justify-between">
      <div class="methods flex items-center flex-wrap">
        <img alt="visa image" class="img" src="@/assets/images/visa.svg" />
        <img alt="mc image" class="img" src="@/assets/images/mc.svg" />
        <img alt="3ds image" class="img" src="@/assets/images/3ds.svg" />
      </div>
      <div class="text text-12 text-inter text-gray">
        {{ settingsStore.settings.copyright }}
      </div>
    </div>
  </div>
</template>
