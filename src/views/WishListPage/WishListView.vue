<script setup>
import { useWishListStore } from '@/stores/wishlist'
import ProductItem from '../components/ProductItem.vue'
import { useAuthStore } from '@/stores/auth'
import { useLoginModalStore } from '@/stores/loginModal'

const wishListStore = useWishListStore()
const authStore = useAuthStore()
const loginModalStore = useLoginModalStore()

function addToFavorites(id) {
  if (authStore.isAuth) {
    if (wishListStore.items.some((obj) => obj.id == id)) {
      wishListStore.remove(id)
    } else {
      wishListStore.add(id)
    }
  } else {
    loginModalStore.openModal()
  }
}
</script>
<template>
  <main class="main">
    <div class="section breadcrumbs-section">
      <div class="wrapper flex">
        <RouterLink to="/" class="text text-14 text-white">{{ $t('Home') }}</RouterLink>
        <div class="text text-14 text-white">/</div>
        <div class="text text-14 text-pink">{{ $t('Wish list') }}</div>
      </div>
    </div>
    <div class="section categories-section">
      <div class="wrapper">
        <div class="text text-24 text-center text-russo uppercase">{{ $t('Wish list') }}</div>
        <div
          class="list product-list flex flex-wrap"
          v-if="wishListStore.items && wishListStore.items.length"
        >
          <div class="item" v-for="(item, i) in wishListStore.items" :key="i">
            <ProductItem :item="item" />
            <button class="star favorites-btn" @click="addToFavorites(item.id)">
              <svg
                width="43"
                height="43"
                viewBox="0 0 43 43"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21.5 0.5C33.098 0.5 42.5 9.90202 42.5 21.5C42.5 33.098 33.098 42.5 21.5 42.5C9.90202 42.5 0.5 33.098 0.5 21.5C0.5 9.90202 9.90202 0.5 21.5 0.5Z"
                  fill="url(#paint0_linear_51_1013)"
                  stroke="url(#paint1_linear_51_1013)"
                />
                <g clip-path="url(#clip0_51_1013)">
                  <path
                    d="M26.7708 11.8372C25.6917 11.8539 24.6361 12.1552 23.7106 12.7105C22.7852 13.2657 22.0226 14.0554 21.5 14.9997C20.9774 14.0554 20.2148 13.2657 19.2894 12.7105C18.3639 12.1552 17.3083 11.8539 16.2292 11.8372C14.5089 11.9119 12.8881 12.6644 11.721 13.9304C10.5538 15.1963 9.93507 16.8727 10 18.5934C10 22.951 14.5866 27.71 18.4333 30.9367C19.2922 31.6585 20.3781 32.0542 21.5 32.0542C22.6219 32.0542 23.7078 31.6585 24.5667 30.9367C28.4134 27.71 33 22.951 33 18.5934C33.0649 16.8727 32.4462 15.1963 31.279 13.9304C30.1119 12.6644 28.4911 11.9119 26.7708 11.8372Z"
                    fill="#F4EFFF"
                  />
                </g>
                <defs>
                  <linearGradient
                    id="paint0_linear_51_1013"
                    x1="21.5"
                    y1="0"
                    x2="21.5"
                    y2="43"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#FF0582" />
                    <stop offset="1" stop-color="#9500FF" />
                  </linearGradient>
                  <linearGradient
                    id="paint1_linear_51_1013"
                    x1="21.5"
                    y1="0"
                    x2="21.5"
                    y2="43"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#FF0582" />
                    <stop offset="1" stop-color="#9500FF" />
                  </linearGradient>
                  <clipPath id="clip0_51_1013">
                    <rect width="23" height="23" fill="white" transform="translate(10 10)" />
                  </clipPath>
                </defs>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
