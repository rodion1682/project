<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { useProfileStore } from '@/stores/profile'
import UiText, { TextAlign, TextSize, TextTheme, TextWeight } from '../shared/UiText.vue'
import UiInput from '../shared/UiInput.vue'
import UiButton from '../shared/UiButton.vue'

const profileStore = useProfileStore()

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
  <div class="data">
    <UiText
      class="data__title"
      :size="TextSize.H4"
      :weight="TextWeight.BOLD"
      :theme="TextTheme.SECONDARY"
      :align="TextAlign.CENTER"
      :title="$t('Personal information')"
    />
    <form
      class="data__form"
      @submit.prevent="profileStore.updateProfile(name, surname, email, phone)"
    >
      <div class="data__inputs">
        <UiInput
          class="data__input"
          v-model="name"
          type="text"
          :placeholder="$t('Name')"
          autocomplete="name"
        />
        <UiInput
          class="data__input"
          v-model="surname"
          type="text"
          :placeholder="$t('Surname')"
          autocomplete="surname"
        />
        <UiInput
          class="data__input"
          v-model="email"
          type="text"
          :placeholder="$t('Email')"
          autocomplete="email"
        />
        <UiInput
          class="data__input"
          v-model="phone"
          type="text"
          :placeholder="$t('Phone')"
          autocomplete="phone"
        />
      </div>
      <UiButton class="data__button _button_primary">{{ $t('Save changes') }}</UiButton>
    </form>
    <Transition>
      <UiText
        class="data__error"
        :theme="TextTheme.ERROR"
        :size="TextSize.H4"
        :align="TextAlign.CENTER"
        v-if="profileStore.error2"
        :title="$t(profileStore.error2)"
      />
    </Transition>
    <Transition>
      <UiText
        v-if="profileStore.success"
        class="data__success"
        :theme="TextTheme.SUCCESS"
        :size="TextSize.H4"
        :align="TextAlign.CENTER"
        :title="$t(profileStore.success)"
      />
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;
@use '@/styles/media' as *;
@use '@/styles/classes' as *;

.data {
  max-width: 372px;
  margin: 0 auto;
  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 15);
    }
  }
  &__form {
  }
  &__inputs {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 15);
    }
  }
  &__input {
    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }
  &__button {
    min-width: 222px;
    margin: 0 auto;
  }
  &__error,
  &__success {
    margin-top: 8px;
  }
}
</style>
