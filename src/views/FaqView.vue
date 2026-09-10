<script setup>
import { onMounted, ref } from 'vue'
import axios from '@/plugins/axios'

const faq = ref([])

function getFaq() {
  axios.get('faq').then((res) => {
    faq.value = res.data.payload
  })
}

onMounted(() => {
  getFaq()
})
</script>

<template>
  <main class="main">
    <div class="section breadcrumbs-section">
      <div class="wrapper flex">
        <RouterLink to="/" class="text text-14 text-white">{{ $t('Home') }}</RouterLink>
        <div class="text text-14 text-white">/</div>
        <div class="text text-14 text-pink">{{ $t('FAQ') }}</div>
      </div>
    </div>
    <div class="section static-section faq-section">
      <div class="wrapper">
        <div class="item" v-for="(item, i) in faq" :key="i">
          <div class="text text-24 text-russo uppercase">{{ item.question }}</div>
          <div class="static-desc text text-16" v-html="item.answer" />
        </div>
      </div>
    </div>
  </main>
</template>
