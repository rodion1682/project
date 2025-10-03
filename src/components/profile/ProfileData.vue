<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { useProfileStore } from '@/stores/profile'
import { useTopUpModalStore } from '@/stores/topUpModal'
import { useLogoutStore } from '@/stores/logout.js'

const topUpModalStore = useTopUpModalStore()
const profileStore = useProfileStore()
const logoutStore = useLogoutStore()

const email = ref('')
const name = ref('')
const surname = ref('')
const phone = ref('')

onMounted(() => {
  watchEffect(() => {
    if (profileStore.profile) {
      if (profileStore.profile.email) {
        email.value = profileStore.profile.email
      } else {
        email.value = ''
      }
      if (profileStore.profile.name) {
        name.value = profileStore.profile.name
      } else {
        name.value = ''
      }
      if (profileStore.profile.surname) {
        surname.value = profileStore.profile.surname
      } else {
        surname.value = ''
      }
      if (profileStore.profile.phone) {
        phone.value = profileStore.profile.phone
      } else {
        phone.value = ''
      }
    }
  })
})
</script>

<template>
  <div class="profile-data-container flex flex-wrap">
    <div class="profile-data-change flex justify-between">
      <div class="profile-data-change-left">
        <div class="title-container">
          <form
            class="form"
            @submit.prevent="profileStore.updateProfile(name, surname, email, phone)"
          >
            <div class="label-list">
              <div class="flex labels">
                <label class="label flex items-center">
                  <div class="input-container">
                    <input type="text" v-model="name" :placeholder="$t('Name')" />
                  </div>
                </label>
                <label class="label flex items-center">
                  <div class="input-container">
                    <input type="text" v-model="surname" :placeholder="$t('Surname')" />
                  </div>
                </label>
              </div>
              <label class="label flex items-center">
                <div class="input-container">
                  <input type="text" v-model="email" :placeholder="$t('Email')" />
                </div>
              </label>
              <label class="label flex items-center">
                <div class="input-container">
                  <input type="text" v-model="phone" :placeholder="$t('Phone')" />
                </div>
              </label>
            </div>
            <button class="button big w-144">
              <span>{{ $t('Save changes') }}</span>
            </button>
          </form>
          <Transition>
            <div class="text text-14 text-red text-error" v-if="profileStore.error2">
              {{ $t(profileStore.error2) }}
            </div>
          </Transition>
          <Transition>
            <div class="text text-14 text-green text-error" v-if="profileStore.success">
              {{ $t(profileStore.success) }}
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>
