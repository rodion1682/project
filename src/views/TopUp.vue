<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { useCurrStore } from '@/stores/currencies'
import { useStaticStore } from '@/stores/static'
import { useCountriesStore } from '@/stores/countries'
import { useProfileStore } from '@/stores/profile'
import { useTopUpStore } from '@/stores/topUp'
const currStore = useCurrStore()
const staticStore = useStaticStore()
const countriesStore = useCountriesStore()
const profileStore = useProfileStore()
const topUpStore = useTopUpStore()

const amount = ref(20)
const country = ref({})
const city = ref('')
const address = ref('')
const postCode = ref('')
const email = ref('')
const name = ref('')
const surname = ref('')
const phone = ref('')
const terms = ref(false)

onMounted(() => {
  watchEffect(() => {
    if (profileStore.profile) {
      email.value = profileStore.profile.email
      name.value = profileStore.profile.name
      surname.value = profileStore.profile.surname
      phone.value = parseInt(profileStore.profile.phone)
    }
  })
})
</script>

<template>
  <main class="main">
    <div class="section profile-section topup-section">
      <div class="wrapper flex flex-wrap justify-between">
        <div class="profile-main flex">
          <div class="profile-left">
            <div class="text text-24 weight-700 text-royal-blue">
              {{ $t('Top up balance') }}
            </div>
            <div class="text text-14 weight-700">
              {{ $t('Enter amount') }}
            </div>
            <label class="label">
              <div class="text text-12 text-slate-gray">{{ $t('Amount:') }}:</div>
              <div class="input-container">
                <input type="text" v-model="amount" />
                <div class="text text-14 text-slate-gray weight-700">
                  {{ currStore.currency.symbol }}
                </div>
              </div>
            </label>
          </div>
          <div class="profile-center">
            <div class="profile-center-wrapper">
              <div class="text text-14 weight-700">
                {{ $t('Enter contact information') }}
              </div>
              <div class="label-list flex">
                <div class="label-column">
                  <label class="label">
                    <div class="text text-12 text-slate-gray">{{ $t('First Name') }}:</div>
                    <div class="input-container">
                      <input type="text" v-model="name" />
                    </div>
                  </label>
                  <label class="label">
                    <div class="text text-12 text-slate-gray">{{ $t('Last Name') }}:</div>
                    <div class="input-container">
                      <input type="text" v-model="surname" />
                    </div>
                  </label>
                  <label class="label">
                    <div class="text text-12 text-slate-gray">{{ $t('Email') }}:</div>
                    <div class="input-container">
                      <input type="text" v-model="email" />
                    </div>
                  </label>
                  <label class="label">
                    <div class="text text-12 text-slate-gray">{{ $t('Phone') }}:</div>
                    <div class="input-container">
                      <input type="text" v-model="phone" />
                    </div>
                  </label>
                </div>
                <div class="label-column">
                  <label class="label">
                    <div class="text text-12 text-slate-gray">{{ $t('Country') }}:</div>
                    <div class="input-container">
                      <select class="select" v-model="country">
                        <option disabled selected :value="{}">{{ $t('Country') }}</option>
                        <option
                          v-for="(item, i) in countriesStore.countries"
                          :value="item"
                          :key="i"
                        >
                          {{ item.name }}
                        </option>
                      </select>
                    </div>
                  </label>
                  <label class="label">
                    <div class="text text-12 text-slate-gray">{{ $t('City') }}:</div>
                    <div class="input-container">
                      <input type="text" v-model="city" />
                    </div>
                  </label>
                  <label class="label">
                    <div class="text text-12 text-slate-gray">{{ $t('Address') }}:</div>
                    <div class="input-container">
                      <input type="text" v-model="address" />
                    </div>
                  </label>
                  <label class="label">
                    <div class="text text-12 text-slate-gray">{{ $t('Post code') }}:</div>
                    <div class="input-container">
                      <input type="text" v-model="postCode" />
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div class="profile-right">
            <div class="profile-right-wrapper">
              <div class="total flex items-center justify-between">
                <div class="text text-white text-24 weight-700">
                  {{ $t('Top up') }}
                </div>
                <div class="text text-white weight-700 flex items-end">
                  <span class="text-24">{{ amount }}</span>
                  <span class="text-14">{{ currStore.currency.symbol }}</span>
                </div>
              </div>
              <div class="bottom">
                <label class="checkbox-label flex justify-center flex-wrap items-center">
                  <input type="checkbox" v-model="terms" />
                  <div class="dot"></div>
                  <div class="text text-14" v-if="staticStore.static && staticStore.static.length">
                    {{ $t('I accept') }}
                    <RouterLink
                      class="text-blue"
                      :to="
                        '/static/' +
                        staticStore.static
                          .find((item) => item.is_terms)
                          .title.toLowerCase()
                          .replace(/ /g, '-')
                      "
                      >{{ $t(staticStore.static.find((item) => item.is_terms).title) }}</RouterLink
                    >
                    {{ $t('and') }}
                    <RouterLink
                      class="text-blue"
                      :to="
                        '/static/' +
                        staticStore.static
                          .find((item) => item.is_privacy)
                          .title.toLowerCase()
                          .replace(/ /g, '-')
                      "
                      >{{
                        $t(staticStore.static.find((item) => item.is_privacy).title)
                      }}</RouterLink
                    >
                  </div>
                </label>
                <button
                  :class="[
                    'button',
                    {
                      disabled: !amount || !city || !address || !country || !postCode,
                    },
                  ]"
                  @click="topUpStore.topUp(amount, country.id, city, address, postCode, code)"
                >
                  <span> {{ $t('Debit/Credit card') }}</span>
                </button>
                <Transition>
                  <div class="text text-14 text-red text-error" v-if="topUpStore.error">
                    {{ $t(topUpStore.error) }}
                  </div>
                </Transition>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
