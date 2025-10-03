<script setup>
import { useForm, useField } from 'vee-validate'
import * as yup from 'yup'
import { useRestoreModalStore } from '@/stores/restorePasswordModal'

const restoreModalStore = useRestoreModalStore()

function close() {
  restoreModalStore.closeModal()
  restoreModalStore.reset()
}

// Схема валидации
const schema = yup.object({
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  password_confirmation: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirmation is required'),
})

const { handleSubmit, errors, meta, isSubmitting } = useForm({
  validationSchema: schema,
  initialValues: {
    password: '',
    password_confirmation: '',
  },
})

const { value: password } = useField('password')
const { value: password_confirmation } = useField('password_confirmation')

// Отправка формы
const onSubmit = handleSubmit(async (values) => {
  restoreModalStore.updateData({
    password: values.password,
    password_confirmation: values.password_confirmation,
  })
  await restoreModalStore.submitRestore()
})
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
          <div class="text text-24 text-inter">
            <b>{{ $t('Password restore') }}</b>
          </div>

          <form class="form" @submit.prevent="onSubmit">
            <label class="label">
              <div class="input-container">
                <input type="password" :placeholder="$t('New Password')" v-model="password" />
              </div>
              <div v-if="errors.password" class="text text-14 text-orange-red">
                {{ errors.password }}
              </div>
            </label>

            <label class="label">
              <div class="input-container">
                <input
                  type="password"
                  :placeholder="$t('Confirm Password')"
                  v-model="password_confirmation"
                />
              </div>
              <div v-if="errors.password_confirmation" class="text text-14 text-orange-red">
                {{ errors.password_confirmation }}
              </div>
            </label>

            <button class="button w-180 big" type="submit" :disabled="!meta.valid || isSubmitting">
              <span>{{ $t('Submit') }}</span>
            </button>

            <Transition>
              <div
                class="text text-14 text-orange-red text-error text-inter"
                v-if="restoreModalStore.error"
              >
                {{ $t(restoreModalStore.error) }}
              </div>
            </Transition>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
