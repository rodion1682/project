<script setup>
import { ref, watch } from 'vue'
import { useChangePassStore } from '@/stores/changePass'

const changePassStore = useChangePassStore()
const curPass = ref('')
const newPass = ref('')
const repeatPass = ref('')

const passType = ref(true)

watch(
  () => changePassStore.success,
  () => {
    if (changePassStore.success) {
      curPass.value = ''
      newPass.value = ''
      repeatPass.value = ''
    }
  },
)
</script>

<template>
  <div class="profile-data-change profile-pass-change">
    <div class="profile-right-block">
      <div class="title-container">
        <div class="text text-24 weight-700">{{ $t('Password change') }}</div>
        <form class="form" @submit.prevent="changePassStore.setPass(curPass, newPass, repeatPass)">
          <label class="label flex items-center">
            <div class="text text-14">{{ $t('Current password') }}*:</div>
            <div class="input-container">
              <input class="pass" :type="passType ? 'password' : 'text'" v-model="curPass" />
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
          <label class="label flex items-center">
            <div class="text text-14">{{ $t('New password') }}*:</div>
            <div class="input-container">
              <input class="pass" :type="passType ? 'password' : 'text'" v-model="newPass" />
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
          <label class="label flex items-center">
            <div class="text text-14">{{ $t('Confirm new password') }}*:</div>
            <div class="input-container">
              <input class="pass" :type="passType ? 'password' : 'text'" v-model="repeatPass" />
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
          <button :class="['button', { disabled: !curPass || !newPass || !repeatPass }]">
            <span>{{ $t('Save Password') }}</span>
          </button>
          <Transition>
            <div class="text text-14 text-red text-error" v-if="changePassStore.error">
              {{ $t(changePassStore.error) }}
            </div>
          </Transition>
          <Transition>
            <div class="text text-14 text-green text-error" v-if="changePassStore.success">
              {{ $t(changePassStore.success) }}
            </div>
          </Transition>
        </form>
      </div>
    </div>
  </div>
</template>
