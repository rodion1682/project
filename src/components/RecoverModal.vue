<script setup>
import { ref } from 'vue'
import { useRecoverModalStore } from '@/stores/recoverModal'
import { useRegModalStore } from '@/stores/regModal'
import { useLoginModalStore } from '@/stores/loginModal'
import { useRecoverStore } from '@/stores/recover'

const recoverModalStore = useRecoverModalStore()
const loginModalStore = useLoginModalStore()
const regModalStore = useRegModalStore()
const recoverStore = useRecoverStore()

function openLoginModal() {
  loginModalStore.openModal()
  regModalStore.closeModal()
  close()
}
function openRegModal() {
  loginModalStore.closeModal()
  regModalStore.openModal()
  close()
}

function close() {
  recoverModalStore.closeModal()
  recoverStore.clearError()
}

const email = ref('')

function submitRecover() {
  let data = {
    email: email,
  }
  recoverStore.updateData(data)
  recoverStore.submitRecover()
}

recoverStore
</script>

<template>
  <div class="modal modal-recover flex justify-center items-center">
    <div class="overlay" @click="close"></div>
    <div class="modal-wrapper flex">
      <img alt="Close icon" class="close" src="" @click="close" />
      <form class="form flex flex-col justify-center items-center" @submit.prevent="submitRecover">
        <div class="text text-24 uppercase text-russo">{{ $t('Password recovery') }}</div>
        <div class="form-wrapper">
          <label class="label">
            <div class="text text-14">{{ $t('E-mail') }}:</div>
            <div class="input-container">
              <input type="text" :placeholder="$t('Enter your e-mail')" v-model="email" />
            </div>
          </label>
          <button class="button w-150 colored" type="submit">
            <span>{{ $t('Send') }}</span>
          </button>
          <Transition>
            <div class="text text-14 text-red text-error" v-if="recoverStore.error">
              {{ $t(recoverStore.error) }}
            </div>
          </Transition>
          <Transition>
            <div class="text text-14 text-green text-error" v-if="recoverStore.success">
              {{ $t(recoverStore.success) }}
            </div>
          </Transition>
          <div class="link text text-14 text-sky-blue weight-700" @click="openLoginModal">
            {{ $t('Cancel') }}
          </div>
          <div class="modal-bottom">
            <div class="text text-18">{{ $t('Don`t have account') }}?</div>
            <div class="link text text-14 text-sky-blue weight-700" @click="openRegModal">
              {{ $t('Please register') }}
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
