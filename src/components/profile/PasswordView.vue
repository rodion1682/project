<script setup>
import { ref, watch } from 'vue'
import { useChangePassStore } from '@/stores/changePass'
import UiText, { TextAlign, TextSize, TextTheme, TextWeight } from '@/components/shared/UiText.vue'
import UiInput from '@/components/shared/UiInput.vue'
import UiButton from '@/components/shared/UiButton.vue'
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
  <div class="change">
    <UiText
      class="change__title"
      :size="TextSize.H4"
      :weight="TextWeight.BOLD"
      :theme="TextTheme.SECONDARY"
      :align="TextAlign.CENTER"
      :title="$t('Change Password')"
    />
    <form
      class="change__form"
      @submit.prevent="changePassStore.setPass(curPass, newPass, repeatPass)"
    >
      <div class="change__inputs">
        <UiInput
          class="change__input"
          v-model="curPass"
          type="password"
          :placeholder="$t('Current Password')"
          autocomplete="current-passowrd"
        />
        <UiInput
          class="change__input"
          v-model="newPass"
          type="password"
          :placeholder="$t('New Password')"
          autocomplete="new-passowrd"
        />
        <UiInput
          class="change__input"
          v-model="repeatPass"
          type="password"
          :placeholder="$t('Confirm Password')"
          autocomplete="repeat-passowrd"
        />
      </div>
      <UiButton
        class="change__button _button_primary"
        :clas="[{ disabled: !curPass || !newPass || !repeatPass }]"
        >{{ $t('Chnage') }}</UiButton
      >
    </form>
    <Transition>
      <UiText
        class="change__error"
        :theme="TextTheme.ERROR"
        :size="TextSize.H4"
        :align="TextAlign.CENTER"
        v-if="changePassStore.error"
        :title="$t(changePassStore.error)"
      />
    </Transition>
    <Transition>
      <UiText
        v-if="changePassStore.success"
        class="change__success"
        :theme="TextTheme.SUCCESS"
        :size="TextSize.H4"
        :align="TextAlign.CENTER"
        :title="$t(changePassStore.success)"
      />
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/mixins' as *;
@use '@/styles/media' as *;
@use '@/styles/classes' as *;

.change {
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
