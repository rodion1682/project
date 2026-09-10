<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import ProductItem from '../components/ProductItem.vue'
import { useCountriesStore } from '@/stores/countries'
import { useCartStore } from '@/stores/cart'
import { useStaticStore } from '@/stores/static'
import { useProductsStore } from '@/stores/products'
import { useProfileStore } from '@/stores/profile'
import { useCurrStore } from '@/stores/currencies'

const countriesStore = useCountriesStore()
const cartStore = useCartStore()
const staticStore = useStaticStore()
const productsStore = useProductsStore()
const profileStore = useProfileStore()
const currStore = useCurrStore()

const terms = ref(false)

const country = ref({})
const name = ref('')
const surname = ref('')
const email = ref('')
const phone = ref('')
const city = ref('')
const address = ref('')
const postCode = ref('')

onMounted(() => {
  watchEffect(() => {
    if (profileStore && Object.keys(profileStore.profile).length !== 0) {
      name.value = profileStore.profile.name
      surname.value = profileStore.profile.surname
      email.value = profileStore.profile.email
      phone.value = profileStore.profile.phone
    }
  })
})
</script>
<template>
  <main class="main">
    <div class="section breadcrumbs-section">
      <div class="wrapper flex">
        <RouterLink to="/" class="text text-14 text-white">{{ $t('Home') }}</RouterLink>
        <div class="text text-14 text-white">/</div>
        <div class="text text-14 text-pink">{{ $t('Cart') }}</div>
      </div>
    </div>
    <div class="section cart-section">
      <div class="wrapper flex justify-between flex-wrap">
        <div class="text text-24 text-russo uppercase text-center">{{ $t('Cart') }}</div>
        <div class="cart-right">
          <!-- <div class="text text-24 weight-700">Contact information</div> -->
          <form class="form" @submit.prevent="cartStore.payFromBalance">
            <!-- <label class="label flex items-center">
              <div class="text text-14">First name:*</div>
              <div class="input-container">
                <input type="text" v-model="name" />
              </div>
            </label>
            <label class="label flex items-center">
              <div class="text text-14">Last name:*</div>
              <div class="input-container">
                <input type="text" v-model="surname" />
              </div>
            </label>
            <label class="label flex items-center">
              <div class="text text-14">Phone:*</div>
              <div class="input-container">
                <input type="text" v-model="phone" />
              </div>
            </label>
            <label class="label flex items-center">
              <div class="text text-14">E-mail:*</div>
              <div class="input-container">
                <input type="text" v-model="email" />
              </div>
            </label>
            <label class="label flex items-center">
              <div class="text text-14">Country:*</div>
              <div class="input-container" v-if="countriesStore.countries">
                <select class="select" v-model="country">
                  <option v-for="(item, i) in countriesStore.countries" :value="item" :key="i">
                    {{ item.title }}
                  </option>
                </select>
              </div>
            </label>
            <label class="label flex items-center">
              <div class="text text-14">City:*</div>
              <div class="input-container">
                <input type="text" v-model="city" />
              </div>
            </label>
            <label class="label flex items-center">
              <div class="text text-14">Address:*</div>
              <div class="input-container">
                <input type="text" v-model="address" />
              </div>
            </label>
            <label class="label flex items-center">
              <div class="text text-14">Post code:*</div>
              <div class="input-container">
                <input type="text" v-model="postCode" />
              </div>
            </label>
            <label class="checkbox-label flex justify-center flex-wrap items-center">
              <input type="checkbox" v-model="terms" />
              <div class="dot"></div>
              <div class="text text-16" v-if="staticStore.static && staticStore.static.length">
                I’ve read and agree with
                <RouterLink
                  :to="
                    '/static/' +
                    staticStore.static
                      .find((item) => item.is_terms)
                      .title.toLowerCase()
                      .replace(/ /g, '-')
                  "
                  class="text-purple-custom"
                  >{{ staticStore.static.find((item) => item.is_terms).title }}</RouterLink
                >
                and
                <RouterLink
                  :to="
                    '/static/' +
                    staticStore.static
                      .find((item) => item.is_privacy)
                      .title.toLowerCase()
                      .replace(/ /g, '-')
                  "
                  class="text-purple-custom"
                  >{{ 'Privacy Policy' }}</RouterLink
                >
              </div>
            </label> -->
            <div class="cart-total-block">
              <div class="cart-total-block-wrapper flex items-center justify-between">
                <div class="text text-24 text-russo">{{ $t('Total to pay') }}</div>
                <div class="text text-32 weight-700 flex items-center">
                  {{ cartStore?.cart?.total?.toFixed(2) }} {{ currStore.currency.symbol }}
                </div>
              </div>

              <!-- <button
                :class="[
                  'button flex items-center justify-center',
                  {
                    disabled:
                      !terms ||
                      !name ||
                      !surname ||
                      !email ||
                      !phone ||
                      !city ||
                      !address ||
                      !country ||
                      !postCode,
                  },
                ]"
              >
                <img alt="mc image" class="img" src="@/assets/img/methods/mc.svg" width="80px" />
                <img
                  alt="visa image"
                  class="img"
                  src="@/assets/img/methods/visa.svg"
                  width="100px"
                />
              </button> -->
              <!-- <Transition>
                <div class="text text-14 text-red text-error" v-if="cartStore.error">
                  {{ cartStore.error }}
                </div>
              </Transition> -->
              <button
                v-if="cartStore.cart && cartStore.cart.products && cartStore.cart.products.length"
                class="button flex items-center justify-center w-200"
              >
                <span>{{ $t('Buy from balance') }}</span>
              </button>
              <Transition>
                <div class="text text-14 text-red text-error" v-if="cartStore.balanceError">
                  {{ $t(cartStore.balanceError) }}
                </div>
              </Transition>
            </div>
          </form>
        </div>
        <div class="cart-left">
          <div
            class="list product-list"
            v-if="cartStore.cart && cartStore.cart.products && cartStore.cart.products.length"
          >
            <div class="item flex items-end" v-for="(item, i) in cartStore.cart.products" :key="i">
              <ProductItem :item="item" />
              <img
                alt="Bin Icon"
                class="bin"
                src="@/assets/icons/bin.svg"
                @click="cartStore.remove(item.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
