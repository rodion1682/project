<script setup>
import icon1 from '@/assets/icons/advantages/1.svg'
import icon2 from '@/assets/icons/advantages/2.svg'
import icon3 from '@/assets/icons/advantages/3.svg'
import icon4 from '@/assets/icons/advantages/4.svg'
import icon5 from '@/assets/icons/advantages/5.svg'
import { useAuthStore } from '@/stores/auth'
import { useCategoriesStore } from '@/stores/categories'
import { useCurrStore } from '@/stores/currencies'
import { usePopularStore } from '@/stores/popular'
import { useRegModalStore } from '@/stores/regModal'
import { useSettingsStore } from '@/stores/settings'
import '@splidejs/splide/dist/css/splide.min.css'
import { onMounted, watchEffect } from 'vue'
import FeaturedSection from './components/FeaturedSection.vue'
import HeroSection from './components/HeroSection.vue'
const categoriesStore = useCategoriesStore()
const settingsStore = useSettingsStore()

const popularStore = usePopularStore()
const regModalStore = useRegModalStore()
const currStore = useCurrStore()
const authStore = useAuthStore()

const options = {
  pagination: false,
  loop: false,
  arrows: true,
  gap: 24,
  perPage: 5,
  breakpoints: {
    768: {
      autoWidth: true,
    },
  },
}

const advantages = [
  {
    title: 'Wide Selection',
    desc: 'A vast array of games for all platforms: PC, Xbox, PlayStation, and Nintendo.',
    icon: icon1,
  },
  {
    title: 'Instant Delivery',
    desc: 'Receive your keys and cards immediately after purchase.',
    icon: icon2,
  },
  {
    title: 'Secure Transactions',
    desc: 'Reliable payment systems and data protection.',
    icon: icon3,
  },
  {
    title: '24/7 Support',
    desc: 'Our team is always ready to assist you anytime.',
    icon: icon4,
  },
  {
    title: 'Authenticity Guarantee',
    desc: 'All keys and cards are official and verified.',
    icon: icon5,
  },
]

onMounted(() => {
  watchEffect(() => {
    if (currStore.currency.symbol) {
      popularStore.getProducts()
    }
  })
})
</script>

<template>
  <HeroSection />
  <FeaturedSection />
</template>
