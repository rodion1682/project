<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { useTopUpModalStore } from '@/stores/topUpModal'
import { useCurrStore } from '@/stores/currencies'
import { useCountriesStore } from '@/stores/countries'
import { useTopUpStore } from '@/stores/topUp'
import { useSettingsStore } from '@/stores/settings'
import { useStaticStore } from '@/stores/static'
import { useProfileStore } from '@/stores/profile'

const topUpModalStore = useTopUpModalStore()
const currStore = useCurrStore()
const countriesStore = useCountriesStore()
const topUpStore = useTopUpStore()
const settingsStore = useSettingsStore()
const staticStore = useStaticStore()
const profileStore = useProfileStore()

const isCard = ref(false)
const amount = ref('')
const country = ref({})
const city = ref('')
const address = ref('')
const postCode = ref('')
const terms = ref(false)
const giftCode = ref()

const email = ref('')
const name = ref('')
const surname = ref('')
const phone = ref('')

onMounted(() => {
  watchEffect(() => {
    if (profileStore.profile) {
      email.value = profileStore.profile.email
      name.value = profileStore.profile.name
      surname.value = profileStore.profile.surname
      phone.value = profileStore.profile.phone
    }
  })
})
</script>

<template>
  <div class="topup-modal modal flex justify-center items-center">
    <div class="overlay" @click="topUpModalStore.closeModal"></div>
    <div class="modal-wrapper">
      <img
        alt="Close icon"
        class="close"
        src="@/assets/icons/close.svg"
        @click="topUpModalStore.closeModal"
      />

      <div class="text text-24 uppercase text-russo">{{ $t('Top up card') }}</div>

      <div class="form">
        <label class="checkbox-label flex items-center gift-card-checkbox"> </label>

        <form
          v-if="!isCard"
          @submit.prevent="topUpStore.topUp(amount, country.id, city, address, postCode)"
        >
          <label class="label">
            <div class="text text-14">{{ $t('Enter the replenishment amount') }}:*</div>
            <div class="input-container">
              <div class="text text-18 text-purple-custom uppercase input-curr">
                {{ currStore.currency.code }}
              </div>
              <input
                class="pass"
                type="number"
                v-model="amount"
                :min="settingsStore.settings.min_order_amount"
              />
            </div>
          </label>
          <label class="label flex items-center">
            <div class="text text-14">{{ $t('First name') }}:*</div>
            <div class="input-container">
              <input type="text" readonly v-model="name" />
            </div>
          </label>
          <label class="label flex items-center">
            <div class="text text-14">{{ $t('Last name') }}:*</div>
            <div class="input-container">
              <input type="text" readonly v-model="surname" />
            </div>
          </label>
          <!-- <label class="label flex items-center">
            <div class="text text-14">{{ $t('Phone') }}:*</div>
            <div class="input-container">
              <input type="text" v-model="phone" />
            </div>
          </label> -->
          <label class="label flex items-center">
            <div class="text text-14">{{ $t('E-mail') }}:*</div>
            <div class="input-container">
              <input type="text" readonly v-model="email" />
            </div>
          </label>
          <label class="label" v-if="countriesStore.countries && countriesStore.countries.length">
            <div class="text text-14">{{ $t('Country') }}:*</div>
            <div class="input-container">
              <select class="select" v-model="country">
                <option v-for="(item, i) in countriesStore.countries" :value="item" :key="i">
                  {{ $t(item.title) }}
                </option>
              </select>
            </div>
          </label>
          <label class="label">
            <div class="text text-14">{{ $t('City') }}:*</div>
            <div class="input-container">
              <input type="text" v-model="city" />
            </div>
          </label>
          <label class="label">
            <div class="text text-14">{{ $t('Address') }}:*</div>
            <div class="input-container">
              <input type="text" v-model="address" />
            </div>
          </label>
          <label class="label">
            <div class="text text-14">{{ $t('Post code') }}:*</div>
            <div class="input-container">
              <input type="text" v-model="postCode" />
            </div>
          </label>

          <label class="checkbox-label flex justify-center flex-wrap items-center">
            <input type="checkbox" v-model="terms" />
            <div class="dot"></div>
            <div class="text text-16" v-if="staticStore.static && staticStore.static.length">
              {{ $t('I’ve read and agree with') }}
              <RouterLink
                :to="
                  '/static/' +
                  staticStore.static
                    .find((item) => item.is_terms)
                    .title.toLowerCase()
                    .replace(/ /g, '-')
                "
                class="text-purple-custom"
                >{{ $t('T&Cs') }}</RouterLink
              >
              {{ $t('and') }}
              <RouterLink
                :to="
                  '/static/' +
                  staticStore.static
                    .find((item) => item.is_privacy)
                    .title.toLowerCase()
                    .replace(/ /g, '-')
                "
                class="text-purple-custom"
                >{{ $t('Privacy Policy') }}</RouterLink
              >
            </div>
          </label>
          <!-- <div class="min-amount text text-20 weight-600">
            {{ $t('Min top up amount is') }} {{ settingsStore.settings.min_order_amount }}
            {{ currStore.currency.symbol }}
          </div> -->
          <button
            :class="[
              'button flex items-center justify-center w-185',
              {
                disabled: !amount || !city || !address || !country || !postCode || !terms,
              },
            ]"
            type="submit"
          >
            <span>
              <!-- <img alt="mc image" class="img" src="@/assets/img/methods/mc.svg" width="40px" /> -->
              <!-- <img alt="visa image" class="img" src="@/assets/img/methods/visa.svg" width="50px" /> -->
              {{ $t('PAY') }}
            </span>
          </button>
        </form>

        <form v-if="isCard" @submit.prevent="topUpStore.useGiftCode(giftCode)">
          <label class="label">
            <div class="text text-14">{{ $t('Code') }}: *</div>

            <div class="input-container">
              <input type="text" v-model="giftCode" />
            </div>
          </label>
          <button :class="['button w-150', { disabled: !giftCode }]" type="submit">
            <span> {{ $t('Send') }}</span>
          </button>
        </form>
      </div>

      <Transition>
        <div class="text text-14 text-red text-error" v-if="topUpStore.error">
          {{ $t(topUpStore.error) }}
        </div>
      </Transition>

      <Transition>
        <div class="text text-14 text-green text-error" v-if="topUpStore.success">
          {{ $t(topUpStore.success) }}
        </div>
      </Transition>
    </div>
  </div>
</template>
