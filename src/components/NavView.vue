<script setup>
import { useStaticStore } from '@/stores/static'
const staticStore = useStaticStore()
import { useContactModalStore } from '@/stores/contactModal'
const contactModalStore = useContactModalStore()
</script>

<template>
  <div class="section nav-section">
    <div class="wrapper">
      <div class="nav flex items-center justify-center flex-wrap" v-if="staticStore.static">
        <RouterLink to="/market" class="text text-14 weight-700 text-dark">{{
          $t('Market')
        }}</RouterLink>
        <button class="text text-14 weight-700 text-dark" @click="contactModalStore.openModal()">
          {{ $t('Contact Us') }}
        </button>
        <RouterLink to="/faq" class="text text-14 weight-700 text-dark">{{ $t('FAQ') }}</RouterLink>
        <RouterLink
          v-for="(item, i) in staticStore.static"
          :to="'/static/' + item?.title.toLowerCase().replace(/ /g, '-')"
          :key="i"
          class="text text-14 weight-700 text-dark"
          >{{ item.title }}</RouterLink
        >
      </div>
    </div>
  </div>
</template>
