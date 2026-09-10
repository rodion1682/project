<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { useProfileStore } from '@/stores/profile'

const profileStore = useProfileStore()

const email = ref('')
const name = ref('')
const surname = ref('')

onMounted(() => {
  watchEffect(() => {
    if (profileStore.profile) {
      email.value = profileStore.profile.email
      name.value = profileStore.profile.name
      surname.value = profileStore.profile.surname
    }
  })
})
</script>

<template>
  <div class="profile-data-change">
    <div class="profile-right-block">
      <div class="title-container">
        <div class="text text-24 weight-700">{{ $t('Profile data') }}</div>
        <form class="form" @submit.prevent="profileStore.updateProfile(name, surname, email)">
          <label class="label flex items-center">
            <div class="text text-14">{{ $t('E-mail') }}:</div>
            <div class="input-container">
              <input type="text" v-model="email" />
            </div>
          </label>
          <label class="label flex items-center">
            <div class="text text-14">{{ $t('First name') }}:*</div>
            <div class="input-container">
              <input type="text" v-model="name" />
            </div>
          </label>
          <label class="label flex items-center">
            <div class="text text-14">{{ $t('Last name') }}:*</div>
            <div class="input-container">
              <input type="text" v-model="surname" />
            </div>
          </label>
          <!-- <label class="label flex items-center">
            <div class="text text-14">{{ $t('Phone') }}:*</div>
            <div class="input-container">
              <input type="text" v-model="phone" />
            </div>
          </label> -->
          <button :class="['button', { disabled: !name || !surname || !email }]">
            <span>{{ $t('Save Profile Information') }}</span>
          </button>
          <Transition>
            <div class="text text-14 text-red text-error" v-if="profileStore.error">
              {{ $t(profileStore.error) }}
            </div>
          </Transition>
          <Transition>
            <div class="text text-14 text-green text-error" v-if="profileStore.success">
              {{ $t(profileStore.success) }}
            </div>
          </Transition>
        </form>
      </div>
    </div>
  </div>
</template>
