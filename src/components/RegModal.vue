<script setup>
import { useLoginModalStore } from '@/stores/loginModal'
import { useRegStore } from '@/stores/reg'
import { useRegModalStore } from '@/stores/regModal'
import { useStaticStore } from '@/stores/static'
import { ref } from 'vue'

const loginModalStore = useLoginModalStore()
const regModalStore = useRegModalStore()
const regStore = useRegStore()
const staticStore = useStaticStore()

function openLoginModal() {
  loginModalStore.openModal()
  close()
}

const name = ref('')
const surname = ref('')
const password = ref('')
const passConfirm = ref('')
const email = ref('')
const phone = ref('')
const passType = ref(true)
const terms = ref(false)

const removeCyrillic = (value) => {
  return value.replace(/[А-Яа-яЁёІіЇїЄєҐґ]/g, '')
}

function submitReg() {
  let data = {
    name: name,
    surname: surname,
    password: password,
    passConfirm: passConfirm,
    email: email,
    phone: phone,
  }

  regStore.updateData(data)
  regStore.submitReg()
}

function close() {
  regStore.clearError()
  regModalStore.closeModal()
}
</script>

<template>
  <div class="modal flex justify-center items-center reg-modal">
    <div class="overlay" @click="close"></div>

    <div class="modal-wrapper flex">
      <img alt="Close icon" class="close" src="" @click="close" />

      <div class="left flex flex-col justify-around items-center">
        <div class="logo flex items-center">
          <img alt="yourkeys" class="img" src="@/assets/img/logo.svg" />
        </div>

        <div class="text text-52 text-russo">
          {{ $t('Create a free account in one click') }}
        </div>

        <div class="modal-bottom">
          <div class="text text-18">{{ $t('Have account') }}?</div>

          <div class="button w-132" @click="openLoginModal">
            <span>{{ $t('Login') }}</span>
          </div>
        </div>
      </div>

      <form class="form flex flex-col justify-center items-center" @submit.prevent="submitReg">
        <div class="text text-24 text-russo">
          {{ $t('Registration') }}
        </div>

        <div class="form-wrapper">
          <label class="label">
            <div class="text text-14">{{ $t('First name') }}:</div>

            <div class="input-container">
              <input
                type="text"
                :placeholder="$t('Enter your first name')"
                v-model="name"
                @input="name = removeCyrillic(name)"
              />
            </div>
          </label>

          <label class="label">
            <div class="text text-14">{{ $t('Last name') }}:</div>

            <div class="input-container">
              <input
                type="text"
                :placeholder="$t('Enter your last name')"
                v-model="surname"
                @input="surname = removeCyrillic(surname)"
              />
            </div>
          </label>

          <label class="label">
            <div class="text text-14">{{ $t('E-mail') }}:</div>

            <div class="input-container">
              <input
                type="text"
                :placeholder="$t('Enter your e-mail')"
                v-model="email"
                @input="email = removeCyrillic(email)"
              />
            </div>
          </label>

          <!-- PHONE -->
          <!--
          <label class="label">
            <div class="text text-14">
              {{ $t('Phone') }}:
            </div>

            <div class="input-container">
              <input
                type="text"
                :placeholder="$t('Enter your phone number')"
                v-model="phone"
                @input="phone = removeCyrillic(phone)"
              />
            </div>
          </label>
          -->

          <label class="label">
            <div class="text text-14">{{ $t('Password') }}:</div>

            <div class="input-container">
              <input
                class="pass"
                :type="passType ? 'password' : 'text'"
                :placeholder="$t('Enter your password')"
                v-model="password"
                @input="password = removeCyrillic(password)"
              />

              <img
                alt="Eye icon"
                class="eye"
                src=""
                v-if="passType"
                @click="passType = false"
              />

              <img
                alt="Eye icon active"
                class="eye"
                src=""
                v-if="!passType"
                @click="passType = true"
              />
            </div>
          </label>

          <label class="label">
            <div class="text text-14">{{ $t('Confirm password') }}:</div>

            <div class="input-container">
              <input
                class="pass"
                :type="passType ? 'password' : 'text'"
                :placeholder="$t('Confirm your password')"
                v-model="passConfirm"
                @input="passConfirm = removeCyrillic(passConfirm)"
              />

              <img
                alt="Eye icon"
                class="eye"
                src=""
                v-if="passType"
                @click="passType = false"
              />

              <img
                alt="Eye icon active"
                class="eye"
                src=""
                v-if="!passType"
                @click="passType = true"
              />
            </div>
          </label>

          <div class="button-container flex items-center justify-between">
            <label class="checkbox-label flex justify-center flex-wrap items-center">
              <input type="checkbox" v-model="terms" />

              <div class="dot"></div>

              <div class="text text-16" v-if="staticStore.static && staticStore.static.length">
                {{ $t('I’ve read and agree with') }}

                <RouterLink
                  :to="
                    '/static/' +
                    staticStore.static
                      .find((item) => item.is_terms)
                      .title.toLowerCase()
                      .replace(/ /g, '-')
                  "
                  class="text-sky-blue weight-700"
                >
                  {{ $t('T&Cs') }}
                </RouterLink>

                {{ $t('and') }}

                <RouterLink
                  :to="
                    '/static/' +
                    staticStore.static
                      .find((item) => item.is_privacy)
                      .title.toLowerCase()
                      .replace(/ /g, '-')
                  "
                  class="text-sky-blue weight-700"
                >
                  {{ $t('Privacy Policy') }}
                </RouterLink>
              </div>
            </label>

            <button
              :class="[
                'button w-150 colored',
                {
                  disabled: !terms || !name || !surname || !password || !passConfirm,
                },
              ]"
              type="submit"
            >
              <span>{{ $t('Register') }}</span>
            </button>
          </div>

          <Transition>
            <div class="text text-14 text-red text-error" v-if="regStore.error">
              {{ $t(regStore.error) }}
            </div>
          </Transition>
        </div>
      </form>
    </div>
  </div>
</template>
