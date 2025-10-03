<script setup>
import { ref, watch } from 'vue'
import { useChangePassStore } from '@/stores/changePass'
const changePassStore = useChangePassStore()

const curPass = ref('')
const newPass = ref('')
const repeatPass = ref('')

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
  <div class="password-change">
    <form class="form" @submit.prevent="changePassStore.setPass(curPass, newPass, repeatPass)">
      <label class="label">
        <div class="input-container">
          <input
            class="pass"
            type="password"
            :placeholder="$t('Current Password')"
            v-model="curPass"
          />
        </div>
      </label>
      <label class="label">
        <div class="input-container">
          <input class="pass" type="password" :placeholder="$t('New Password')" v-model="newPass" />
        </div>
      </label>
      <label class="label">
        <div class="input-container">
          <input
            class="pass"
            type="password"
            :placeholder="$t('Confirm Password')"
            v-model="repeatPass"
          />
        </div>
      </label>
      <div class="button-container flex items-center">
        <button :class="['button big w-144', { disabled: !curPass || !newPass || !repeatPass }]">
          <span>{{ $t('Change') }}</span>
        </button>
      </div>
      <Transition>
        <div class="text text-14 text-red text-inter text-error" v-if="changePassStore.error">
          {{ $t(changePassStore.error) }}
        </div>
      </Transition>
      <Transition>
        <div class="text text-14 text-green text-inter text-error" v-if="changePassStore.success">
          {{ $t(changePassStore.success) }}
        </div>
      </Transition>
    </form>
  </div>
</template>
