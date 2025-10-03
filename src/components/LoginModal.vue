<script setup>
import { ref } from 'vue'
import { useLoginModalStore } from '@/stores/loginModal'
import { useRegModalStore } from '@/stores/regModal'
import { useRecoverModalStore } from '@/stores/recoverModal'
import { useLoginStore } from '@/stores/login'

const loginModalStore = useLoginModalStore()
const regModalStore = useRegModalStore()
const recoverModalStore = useRecoverModalStore()
const loginStore = useLoginStore()

function openRegModal() {
  close()
  regModalStore.openModal()
}
function openRecoverModal() {
  close()
  regModalStore.closeModal()
  recoverModalStore.openModal()
}

const email = ref('')
const pass = ref('')
const passType = ref(true)

function submitLogin() {
  let data = {
    username: email,
    password: pass,
  }
  loginStore.updateData(data)
  loginStore.submitLogin()
}

function close() {
  loginStore.clearError()
  loginModalStore.closeModal()
}
</script>

<template>
  <div class="modal flex justify-center items-center">
    <div class="overlay" @click="close"></div>
    <div class="modal-wrapper">
      <div class="close flex items-center" @click="close">
        <img alt="Close icon" class="img" src="@/assets/imgs/close.svg" />
      </div>
      <div class="modal-form-container">
        <div class="flex flex-col justify-center text-center">
          <div class="text text-24">
            <b>{{ $t('Sign in') }}</b>
          </div>
          <form class="form" @submit.prevent="submitLogin">
            <label class="label">
              <div class="input-container">
                <input type="text" :placeholder="$t('Your Email')" v-model="email" />
              </div>
            </label>
            <label class="label">
              <div class="input-container">
                <input
                  class="pass"
                  :placeholder="$t('Your Password')"
                  :type="passType ? 'password' : 'text'"
                  v-model="pass"
                />
              </div>
            </label>

            <div class="link text text-14 text-blue text-inter" @click="openRecoverModal">
              {{ $t('Forgot password ?') }}
            </div>
            <button class="button w-180 big" type="submit">
              <span>{{ $t('Log In') }}</span>
            </button>

            <!-- <div class="text text-or text-20 text-inter">{{ $t('Or') }}</div>
            <button
              class="button google-button w-290 items-center"
              @click="loginStore.steamLogin()"
            >
              <img alt="google icon" class="img" src="@/assets/images/google.svg" />
              <span>{{ $t('Continue with Google') }}</span>
            </button> -->
            <Transition>
              <div
                class="text text-14 text-orange-red text-error text-inter"
                v-if="loginStore.error"
              >
                {{ $t(loginStore.error) }}
              </div>
            </Transition>
          </form>
        </div>
        <div class="modal-bottom flex justify-center flex-col items-center">
          <div class="text text-14 text-inter">
            {{ 'Don’t have an account yet?' }}
          </div>
          <button class="text text-14 text-blue text-inter" @click="openRegModal">
            <span>{{ $t('Sign up') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
