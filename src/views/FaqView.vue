<script setup>
import { useFaq } from '@/stores/faq'
const faqStore = useFaq()
</script>

<template>
  <main class="main">
    <div class="section static-section faq-section">
      <div class="wrapper">
        <div class="text text-48 weight-700">{{ $t('FAQ') }}</div>
        <div class="list">
          <div class="item" v-for="(item, i) in faqStore.faq" :key="i">
            <div class="text text-24 weight-700">{{ item.question }}</div>
            <div class="text text-14" v-html="item.answer" />
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
