<script setup>
import { ref } from 'vue'
import { useRegModalStore } from '@/stores/regModal'
import { useLoginModalStore } from '@/stores/loginModal'
import { useRegStore } from '@/stores/reg'
import { useStaticStore } from '@/stores/static'
import { useLoginStore } from '@/stores/login'

const loginModalStore = useLoginModalStore()
const regModalStore = useRegModalStore()
const regStore = useRegStore()
const staticStore = useStaticStore()
const loginStore = useLoginStore()

function openLoginModal() {
  loginModalStore.openModal()
  close()
}
const name = ref('')
const surname = ref('')
const password = ref('')
const passConfirm = ref('')
const email = ref('')
const phone = ref('')
const terms = ref(false)

function submitReg() {
  let data = {
    name: name,
    surname: surname,
    password: password,
    password_confirmation: passConfirm,
    email: email,
    phone: phone,
  }
  regStore.updateData(data)
  regStore.submitReg()
}

function close() {
  regStore.clearError()
  regModalStore.closeModal()
}
</script>

<template>
  <div class="modal flex justify-center items-center reg-modal">
    <div class="overlay" @click="close"></div>
    <div class="modal-wrapper">
      <div class="close flex items-center" @click="close">
        <img alt="Close icon" class="img" src="@/assets/imgs/close.svg" />
      </div>
      <div class="modal-form-container text-center">
        <div class="text text-24">
          <b>{{ $t('Sign up') }}</b>
        </div>
        <form class="form" @submit.prevent="submitReg">
          <label class="label">
            <div class="input-container">
              <input type="text" v-model="name" :placeholder="$t('First Name')" />
            </div>
          </label>
          <label class="label">
            <div class="input-container">
              <input type="text" v-model="surname" :placeholder="$t('Last Name')" />
            </div>
          </label>
          <label class="label">
            <div class="input-container">
              <input type="text" v-model="email" :placeholder="$t('Email')" />
            </div>
          </label>
          <label class="label">
            <div class="input-container">
              <input type="text" v-model="phone" :placeholder="$t('Phone')" />
            </div>
          </label>
          <label class="label">
            <div class="input-container">
              <input
                class="pass"
                type="password"
                v-model="password"
                :placeholder="$t('Password')"
              />
            </div>
          </label>
          <label class="label">
            <div class="input-container">
              <input
                class="pass"
                type="password"
                v-model="passConfirm"
                :placeholder="$t('Confirm password')"
              />
            </div>
          </label>
          <label class="checkbox-label flex justify-center flex-wrap">
            <input type="checkbox" v-model="terms" />
            <div class="dot"></div>
            <div
              class="text text-14 text-inter"
              v-if="staticStore.static && staticStore.static.length"
            >
              {{ $t('By continuing, I confirm that I have read, understood, and agree to the ') }}
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
                >{{ $t(staticStore.static.find((item) => item.is_privacy).title) }}</RouterLink
              >.
              {{ $t('I also confirm that I am at least 18 years old') }}
            </div>
          </label>
          <button
            :class="[
              'button w-180 big',
              { disabled: !name || !surname || !password || !passConfirm || !phone || !terms },
            ]"
            type="submit"
          >
            <span>{{ $t('Continue') }}</span>
          </button>
          <Transition>
            <div class="text text-14 text-orange-red text-error text-inter" v-if="regStore.error">
              {{ $t(regStore.error) }}
            </div>
          </Transition>
          <!-- <div class="text text-or text-20 text-inter">{{ $t('Or') }}</div>
          <button class="button google-button w-290 items-center" @click="loginStore.steamLogin()">
            <img alt="google icon" class="img" src="@/assets/images/google.svg" />
            <span>{{ $t('Continue with Google') }}</span>
          </button> -->
        </form>
        <div class="modal-bottom flex justify-center flex-col items-center">
          <div class="text text-14 text-inter">
            {{ 'Already have an account?' }}
          </div>
          <button class="text text-14 text-blue text-inter" @click="openLoginModal">
            <span>{{ $t('Login') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
