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

const removeCyrillic = (value) => {
  return value.replace(/[А-Яа-яЁёІіЇїЄєҐґ]/g, '')
}
</script>

<template>
  <div class="modal flex justify-center items-center reg-modal">
    <div class="overlay" @click="close"></div>
    <div class="modal-wrapper flex">
      <img alt="Close icon" class="close" src="@/assets/icons/close.svg" @click="close" />
      <div class="left flex flex-col justify-around items-center">
        <div class="logo flex items-center">
          <img alt="getmikey logo" class="img" src="@/assets/img/logo.svg" />
        </div>
        <div class="text text-52 text-russo">
          {{ $t('Welcome back!') }}
        </div>
        <div class="modal-bottom">
          <div class="text text-18">{{ $t('Don`t have account') }}?</div>
          <div class="button w-132" @click="openRegModal">
            <span>{{ $t('Please register') }}</span>
          </div>
        </div>
      </div>
      <form class="form flex flex-col justify-center items-center" @submit.prevent="submitLogin">
        <div class="text text-24 text-russo">{{ $t('Login') }}</div>
        <div class="form-wrapper">
          <label class="label">
            <div class="text text-14">{{ $t('E-mail') }}:</div>
            <div class="input-container">
              <input
                type="text"
                :placeholder="$t('Enter your e-mail')"
                v-model="email"
                @input="email = removeCyrillic($event.target.value)"
              />
            </div>
          </label>
          <label class="label">
            <div class="text text-14">{{ $t('Password') }}:</div>
            <div class="input-container">
              <input
                class="pass"
                :type="passType ? 'password' : 'text'"
                @input="pass = removeCyrillic($event.target.value)"
                :placeholder="$t('Enter your password')"
                v-model="pass"
              />
              <img
                alt="Eye icon"
                class="eye"
                src="@/assets/icons/eye.svg"
                v-if="passType"
                @click="passType = false"
              />
              <img
                alt="Eye icon active"
                class="eye"
                src="@/assets/icons/eye2.svg"
                v-if="!passType"
                @click="passType = true"
              />
            </div>
          </label>
          <div class="button-container flex items-center justify-between">
            <div class="link text text-14 text-sky-blue weight-700" @click="openRecoverModal">
              {{ $t('Forgot password') }}?
            </div>
            <button class="button w-150 colored" type="submit">{{ $t('Login') }}</button>
          </div>

          <Transition>
            <div class="text text-14 text-red text-error" v-if="loginStore.error">
              {{ $t(loginStore.error) }}
            </div>
          </Transition>
        </div>
      </form>
    </div>
  </div>
</template>
