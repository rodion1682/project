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
  <div class="modal flex justify-center items-center">
    <div class="overlay" @click="close"></div>
    <div class="modal-wrapper">
      <div class="close flex items-center" @click="close">
        <img alt="Close icon" class="img" src="@/assets/images/close.svg" />
      </div>
      <div class="modal-form-container text-center">
        <div class="text text-24">
          <b>{{ $t('Password recovery') }}</b>
        </div>
        <form class="form" @submit.prevent="submitRecover">
          <label class="label">
            <div class="input-container">
              <input type="text" v-model="email" :placeholder="$t('Email')" />
            </div>
          </label>
          <button class="button w-180 big" type="submit">
            <span>{{ $t('Send') }}</span>
          </button>
          <Transition>
            <div
              class="text text-14 text-orange-red text-error text-inter"
              v-if="recoverStore.error"
            >
              {{ $t(recoverStore.error) }}
            </div>
          </Transition>
          <Transition>
            <div class="text text-14 text-green text-error text-inter" v-if="recoverStore.success">
              {{ $t(recoverStore.success) }}
            </div>
          </Transition>
        </form>
        <div class="modal-bottom flex justify-center items-center flex-col">
          <div class="text text-16 text-inter">
            {{ 'Already have an account?' }}
          </div>
          <button class="text text-16 text-blue text-inter" @click="openLoginModal">
            <span>{{ $t('Login') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
