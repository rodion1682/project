<template>
  <div class="modal offer-details-modal flex justify-center items-center">
    <div class="overlay" @click="offerDetailsModalStore.close()" />
    <div class="modal-wrapper">
      <div class="close flex items-center" @click="offerDetailsModalStore.close()">
        <img alt="Close icon" class="img" src="@/assets/imgs/close.svg" />
      </div>
      <div class="modal-form-container text-center">
        <div v-if="step == 1">
          <div class="text text-40 weight-500 uppercase">{{ $t('Details') }}</div>
          <div class="list">
            <div class="row flex" v-if="offerDetailsModalStore.offer.title">
              <div class="text text-16 text-inter text-slate-gray">{{ $t('Title') }}:</div>
              <div class="text text-16 text-inter">{{ offerDetailsModalStore.offer.title }}</div>
            </div>
            <div class="row flex" v-if="offerDetailsModalStore.offer.type">
              <div class="text text-16 text-inter text-slate-gray">{{ $t('Type') }}:</div>
              <div class="text text-16 text-inter">{{ offerDetailsModalStore.offer.type }}</div>
            </div>
            <div class="row flex" v-if="offerDetailsModalStore.offer.quality">
              <div class="text text-16 text-inter text-slate-gray">{{ $t('Quality') }}:</div>
              <div class="text text-16 text-inter">{{ offerDetailsModalStore.offer.quality }}</div>
            </div>
            <div class="row flex" v-if="offerDetailsModalStore.offer.user_price">
              <div class="text text-16 text-inter text-slate-gray">{{ $t('Desired Price') }}:</div>
              <div class="text text-16 text-inter weight-700">
                {{ offerDetailsModalStore.offer.user_price }}
                {{ offerDetailsModalStore.offer.currency }}
              </div>
            </div>
          </div>
          <div class="text text-16 text-inter text-orange-red">{{ $t('Our Price') }}:</div>
          <div class="service-price" v-if="offerDetailsModalStore.offer.service_price">
            <span class="text text-16 text-inter weight-500">
              <span class="text-slate-gray">{{ offerDetailsModalStore.offer.service_price }}</span>
              {{ offerDetailsModalStore.offer.currency }}
            </span>
          </div>
          <div class="buttons flex items-center justify-center">
            <div
              class="text text-16 text-inter text-bright-cyan"
              @click="offerDetailsModalStore.decline()"
            >
              {{ $t('Decline') }}
            </div>
            <button class="button text-dark w-190" @click="step = 2">
              {{ $t('Accept') }}
            </button>
          </div>
        </div>
        <div v-if="step == 2">
          <div class="text text-40 weight-500 uppercase">{{ $t('Confirm information') }}</div>
          <div class="form">
            <label class="label flex items-center">
              <div class="input-container">
                <input type="text" :placeholder="$t('First name')" v-model="name" />
              </div>
            </label>
            <label class="label flex items-center">
              <div class="input-container">
                <input type="text" :placeholder="$t('Last name')" v-model="surname" />
              </div>
            </label>
            <label class="label flex items-center">
              <div class="input-container">
                <input type="text" :placeholder="$t('Phone')" v-model="phone" />
              </div>
            </label>
            <label class="label flex items-center">
              <div class="input-container">
                <input type="text" :placeholder="$t('E-mail')" v-model="email" />
              </div>
            </label>
            <label class="label" v-if="countriesStore.countries && countriesStore.countries.length">
              <div class="input-container">
                <select class="select" v-model="country">
                  <option disabled selected :value="{}">{{ $t('Country') }}</option>
                  <option v-for="(item, i) in countriesStore.countries" :value="item" :key="i">
                    {{ item.title }}
                  </option>
                </select>
              </div>
            </label>
            <label class="label">
              <div class="input-container">
                <input type="text" :placeholder="$t('City')" v-model="city" />
              </div>
            </label>
            <label class="label">
              <div class="input-container">
                <input type="text" :placeholder="$t('Address')" v-model="address" />
              </div>
            </label>
            <label class="label">
              <div class="input-container">
                <input type="text" :placeholder="$t('Post code')" v-model="postCode" />
              </div>
            </label>
            <label class="checkbox-label flex justify-center flex-wrap items-center">
              <input type="checkbox" v-model="terms" />
              <div class="dot"></div>
              <div
                class="text text-14 text-inter"
                v-if="staticStore.static && staticStore.static.length"
              >
                {{ $t('I accept') }}
                <RouterLink
                  class="text-bright-cyan"
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
                  class="text-bright-cyan"
                  :to="
                    '/static/' +
                    staticStore.static
                      .find((item) => item.is_privacy)
                      .title.toLowerCase()
                      .replace(/ /g, '-')
                  "
                  >{{ $t(staticStore.static.find((item) => item.is_privacy).title) }}</RouterLink
                >
              </div>
            </label>
            <div class="buttons flex justify-center">
              <button
                :class="[
                  'button small text-dark  w-110',
                  {
                    disabled: !city || !address || !country || !postCode || !terms,
                  },
                ]"
                @click="toLastStep('sepa')"
              >
                <span> {{ $t('Sepa') }}</span>
              </button>
              <button
                :class="[
                  'button small text-dark  w-110',
                  {
                    disabled: !city || !address || !country || !postCode || !terms,
                  },
                ]"
                @click="toLastStep('card')"
              >
                <span> {{ $t('Cards') }}</span>
              </button>
            </div>
          </div>
        </div>

        <div v-if="step == 3 && method == 'card'">
          <div class="text text-40 weight-500 uppercase">{{ $t('Payment details') }}</div>
          <div class="form">
            <label class="label">
              <div class="input-container">
                <input
                  type="text"
                  pattern="\d*"
                  maxlength="19"
                  v-model="card_number"
                  :placeholder="$t('Card number')"
                />
              </div>
            </label>
            <label class="label">
              <div class="input-container">
                <input
                  type="text"
                  v-model="card_holder_name"
                  :placeholder="$t('Card holder name')"
                /></div
            ></label>
            <label class="label">
              <div class="input-container">
                <input
                  type="text"
                  pattern="\d*"
                  maxlength="2"
                  v-model="expire_month"
                  :placeholder="$t('Expiration month')"
                /></div
            ></label>
            <label class="label">
              <div class="input-container">
                <input
                  type="text"
                  pattern="\d*"
                  maxlength="4"
                  v-model="expire_year"
                  :placeholder="$t('Expiration year')"
                /></div
            ></label>
            <label class="checkbox-label flex justify-center flex-wrap items-center">
              <input type="checkbox" v-model="terms" />
              <div class="dot"></div>
              <div
                class="text text-14 text-inter"
                v-if="staticStore.static && staticStore.static.length"
              >
                {{ $t('I accept') }}
                <RouterLink
                  class="text-bright-cyan"
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
                  class="text-bright-cyan"
                  :to="
                    '/static/' +
                    staticStore.static
                      .find((item) => item.is_privacy)
                      .title.toLowerCase()
                      .replace(/ /g, '-')
                  "
                  >{{ $t(staticStore.static.find((item) => item.is_privacy).title) }}</RouterLink
                >
              </div>
            </label>
            <div class="buttons flex items-center justify-between">
              <div class="text text-16 text-inter text-bright-cyan" @click="step = 2">
                {{ $t('Back') }}
              </div>
              <button class="button text-dark w-190" @click="submit()">
                {{ $t('Confirm') }}
              </button>
            </div>
          </div>
        </div>
        <div v-if="step == 3 && method == 'sepa'">
          <div class="text text-40 weight-500 uppercase">{{ $t('Payment details') }}</div>
          <div class="form">
            <label class="label">
              <div class="input-container">
                <input
                  type="text"
                  v-model="bank_holder_name"
                  :placeholder="$t('First Name')"
                /></div
            ></label>
            <label class="label">
              <div class="input-container">
                <input
                  type="text"
                  v-model="bank_holder_surname"
                  :placeholder="$t('Last Name')"
                /></div
            ></label>
            <label class="label">
              <div class="input-container">
                <input type="text" maxlength="29" v-model="iban_number" :placeholder="$t('IBAN')" />
              </div>
            </label>
            <label class="checkbox-label flex justify-center flex-wrap items-center">
              <input type="checkbox" v-model="terms" />
              <div class="dot"></div>
              <div
                class="text text-14 text-inter"
                v-if="staticStore.static && staticStore.static.length"
              >
                {{ $t('I accept') }}
                <RouterLink
                  class="text-bright-cyan"
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
                  class="text-bright-cyan"
                  :to="
                    '/static/' +
                    staticStore.static
                      .find((item) => item.is_privacy)
                      .title.toLowerCase()
                      .replace(/ /g, '-')
                  "
                  >{{ $t(staticStore.static.find((item) => item.is_privacy).title) }}</RouterLink
                >
              </div>
            </label>
            <div class="buttons flex items-center justify-between">
              <div class="text text-16 text-inter text-bright-cyan" @click="step = 2">
                {{ $t('Back') }}
              </div>
              <button class="button text-dark w-190" @click="submit()">
                {{ $t('Confirm') }}
              </button>
            </div>
          </div>
        </div>

        <Transition>
          <div
            class="text text-14 text-orange-red text-error text-inter"
            v-if="offerDetailsModalStore.error"
          >
            {{ offerDetailsModalStore.error }}
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { useOfferDetailsModalStore } from '@/stores/offerDetailsModal'

import { useProfileStore } from '@/stores/profile'
import { useCountriesStore } from '@/stores/countries'
import { useStaticStore } from '@/stores/static'

const countriesStore = useCountriesStore()
const profileStore = useProfileStore()
const staticStore = useStaticStore()
const offerDetailsModalStore = useOfferDetailsModalStore()

const step = ref(1)

const country = ref({})
const city = ref('')
const address = ref('')
const postCode = ref('')
const email = ref('')
const name = ref('')
const surname = ref('')
const phone = ref('')
const terms = ref(false)
const method = ref('')
const iban_number = ref('')
const bank_holder_name = ref('')
const bank_holder_surname = ref('')
const card_holder_name = ref('')
const card_number = ref('')
const expire_month = ref('')
const expire_year = ref('')

function toLastStep(m) {
  method.value = m
  step.value = 3
}

function submit() {
  offerDetailsModalStore.setMethod(method.value)
  let data
  if (method.value == 'card') {
    data = {
      id: offerDetailsModalStore.offer.id,
      name: name.value,
      surname: surname.value,
      email: email.value,
      phone: phone.value,
      country: country.value.title,
      city: city.value,
      address: city.value,
      postCode: city.value,
      currency: offerDetailsModalStore.offer.currency,
      card_number: card_number.value,
      card_holder_name: card_holder_name.value,
      expire_month: expire_month.value,
      expire_year: expire_year.value,
    }
  } else {
    data = {
      account_number: iban_number.value,
      first_name: bank_holder_name.value,
      last_name: bank_holder_name.value,
      id: offerDetailsModalStore.offer.id,
      name: name.value,
      surname: surname.value,
      email: email.value,
      phone: phone.value,
      country: country.value.title,
      city: city.value,
      address: city.value,
      postCode: city.value,
      currency: offerDetailsModalStore.offer.currency,
    }
  }
  offerDetailsModalStore.setData(data)
  offerDetailsModalStore.confirm()
}

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
