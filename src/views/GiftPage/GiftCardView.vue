<script setup>
import { ref, watch } from 'vue'
import { useCurrStore } from '@/stores/currencies'
import { useGiftCardStore } from '@/stores/giftCard'
import { useCountriesStore } from '@/stores/countries'
import { useStaticStore } from '@/stores/static.js'

const currStore = useCurrStore()
const giftCardStore = useGiftCardStore()
const countriesStore = useCountriesStore()
const staticStore = useStaticStore()

const amount = ref()
const quantity = ref()
const holderFirstName = ref()
const holderLastName = ref()
const holderEmail = ref()
const holderPhone = ref()
const holderPhoneCountry = ref('AS')
const holderCountry = ref('AS')
const holderCity = ref()
const holderAddress = ref()
const holderZip = ref()

const terms = ref(false)

watch(
  () => giftCardStore.success,
  () => {
    if (giftCardStore.success) {
      amount.value = null
      quantity.value = null
      holderFirstName.value = null
      holderLastName.value = null
      holderEmail.value = null
      holderPhone.value = null
      holderPhoneCountry.value = null
      holderCountry.value = null
      holderCity.value = null
      holderAddress.value = null
      holderZip.value = null
    }
  },
)
</script>

<template>
  <main class="main">
    <div class="section breadcrumbs-section">
      <div class="wrapper flex">
        <RouterLink to="/" class="text text-14 text-white">{{ $t('Home') }}</RouterLink>
        <div class="text text-14 text-white">/</div>
        <div class="text text-14 text-pink">{{ $t('Gift card') }}</div>
      </div>
    </div>
    <div class="section gift-card-section">
      <div class="wrapper flex justify-between flex-wrap text-center">
        <div class="gift-card-left">
          <div class="text text-32 text-russo">
            {{ $t('Give the gift of gaming with GearMikey gift cards.') }}
          </div>
          <div class="text text-18">
            {{
              $t(
                'Look no further than our GearMikey gift cards! Our gift cards can be used to purchase any game key on our website, allowing your loved ones to choose the games they really want to play. ',
              )
            }}
          </div>
          <div class="text text-18">
            {{
              $t(
                'Plus, with our fast and reliable delivery, our gift cards make great last-minute presents.',
              )
            }}
          </div>
        </div>
        <div class="gift-card-right">
          <div class="text text-24 text-russo text-center">{{ $t('Gift card') }}</div>
          <form
            class="form"
            @submit.prevent="
              giftCardStore.submit(
                amount,
                quantity,
                holderFirstName,
                holderLastName,
                holderEmail,
                holderPhone,
                holderPhoneCountry,
                holderCountry,
                holderCity,
                holderAddress,
                holderZip,
              )
            "
          >
            <label class="label flex items-center">
              <div class="input-container" v-if="currStore.currency">
                <div class="text text-18 text-pink uppercase input-curr">
                  {{ currStore.currency.code }}
                </div>

                <input
                  class="pass"
                  type="text"
                  :placeholder="$t('Preferred amount')"
                  v-model="amount"
                />
              </div>
            </label>

            <label class="label flex items-center">
              <div class="input-container">
                <input type="text" :placeholder="$t('Quantity')" v-model="quantity" />
              </div>
            </label>

            <div class="label flex items-center holder-name">
              <div class="input-container">
                <input type="text" :placeholder="$t('Name')" v-model="holderFirstName" />
              </div>

              <div class="input-container">
                <input type="text" :placeholder="$t('Surname')" v-model="holderLastName" />
              </div>
            </div>

            <label class="label flex items-center">
              <div class="input-container">
                <input type="text" :placeholder="$t('E-mail')" v-model="holderEmail" />
              </div>
            </label>

            <div class="label flex items-center holder-phone">
              <div class="input-container" v-if="countriesStore.countries">
                <select class="select" v-model="holderPhoneCountry">
                  <option v-for="(item, i) in countriesStore.countries" :value="item.iso" :key="i">
                    +{{ item.phone_code }}
                  </option>
                </select>
              </div>

              <div class="input-container">
                <input type="text" :placeholder="$t('Phone')" v-model="holderPhone" />
              </div>
            </div>

            <label class="label flex items-center">
              <div class="input-container" v-if="countriesStore.countries">
                <select class="select" v-model="holderCountry">
                  <option v-for="(item, i) in countriesStore.countries" :value="item.iso" :key="i">
                    {{ $t(item.title) }}
                  </option>
                </select>
              </div>
            </label>

            <label class="label flex items-center">
              <div class="input-container">
                <input type="text" :placeholder="$t('City')" v-model="holderCity" />
              </div>
            </label>

            <label class="label flex items-center">
              <div class="input-container">
                <input type="text" :placeholder="$t('Address')" v-model="holderAddress" />
              </div>
            </label>

            <label class="label flex items-center">
              <div class="input-container">
                <input type="text" :placeholder="$t('Post code')" v-model="holderZip" />
              </div>
            </label>
            <div class="flex items-center justify-between button-container">
              <div class="label">
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
                      class="text-sky-blue weight-700"
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
                      class="text-sky-blue weight-700"
                      >{{
                        $t('Privacy Policy')
                      }}</RouterLink
                    >
                  </div>
                </label>
              </div>

              <button
                :class="[
                  'button colored w-150',
                  {
                    disabled:
                      !amount ||
                      !quantity ||
                      !holderFirstName ||
                      !holderLastName ||
                      !holderEmail ||
                      !holderPhone ||
                      !holderCountry ||
                      !holderCity ||
                      !holderAddress ||
                      !holderZip ||
                      !terms,
                  },
                ]"
                type="submit"
              >
                <span>{{ $t('PAY') }}</span>
              </button>
            </div>

            <Transition>
              <div class="text text-14 text-red text-error" v-if="giftCardStore.error">
                {{ $t(giftCardStore.error) }}
              </div>
            </Transition>

            <Transition>
              <div class="text text-14 text-green text-error" v-if="giftCardStore.success">
                {{ $t(giftCardStore.success) }}
              </div>
            </Transition>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>
