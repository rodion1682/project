<script setup>
import { ref } from 'vue'
import { useContactModalStore } from '@/stores/contactModal'
import { useContactStore } from '@/stores/contact'
import { useStaticStore } from '@/stores/static'
const contactModalStore = useContactModalStore()
const contactStore = useContactStore()
const staticStore = useStaticStore()

const name = ref('')
const surname = ref('')
const topic = ref('')
const email = ref('')
const phone = ref('')
const message = ref('')
const terms = ref(false)

function submit() {
  let data = {
    name: name.value,
    surname: surname.value,
    email: email.value,
    phone: phone.value,
    topic: topic.value,
    message: message.value,
  }
  contactStore.submit(data)
}
</script>

<template>
  <div class="modal contact-modal flex justify-center items-center">
    <div class="overlay" @click="contactModalStore.closeModal()"></div>
    <div class="modal-wrapper">
      <div class="close flex items-center" @click="contactModalStore.closeModal()">
        <div class="text text-white text-12">{{ $t('Close') }}</div>
        <img alt="Close icon" class="img" src="@/assets/imgs/close.svg" />
      </div>
      <div class="modal-form-container" v-if="staticStore.static && staticStore.static.length">
        <div class="right">
          <form class="form" @submit.prevent="submit">
            <div class="text text-52 weight-700">
              {{ $t('Contact Us') }}
            </div>
            <div class="input-list flex">
              <div class="left">
                <label class="label">
                  <div class="text text-12 text-slate-gray">{{ $t('First Name') }}:</div>
                  <div class="input-container">
                    <input type="text" v-model="name" />
                  </div>
                </label>
                <label class="label">
                  <div class="text text-12 text-slate-gray">{{ $t('Last Name') }}:</div>
                  <div class="input-container">
                    <input type="text" v-model="surname" />
                  </div>
                </label>
                <label class="label">
                  <div class="text text-12 text-slate-gray">{{ $t('Email') }}:</div>
                  <div class="input-container">
                    <input type="text" v-model="email" />
                  </div>
                </label>
                <label class="label">
                  <div class="text text-12 text-slate-gray">{{ $t('Phone') }}:</div>
                  <div class="input-container">
                    <input type="text" v-model="phone" />
                  </div>
                </label>
              </div>
              <div class="right flex flex-col">
                <label class="label">
                  <div class="text text-12 text-slate-gray">{{ $t('Topic') }}:</div>
                  <div class="input-container">
                    <input type="text" v-model="topic" />
                  </div>
                </label>
                <label class="label flex flex-col">
                  <div class="text text-12 text-slate-gray">{{ $t('Message') }}:</div>
                  <div class="input-container">
                    <textarea type="text" v-model="message"></textarea>
                  </div>
                </label>
              </div>
            </div>
            <div class="button-container flex items-center justify-between">
              <label class="checkbox-label flex justify-center flex-wrap items-center">
                <input type="checkbox" v-model="terms" />
                <div class="dot"></div>
                <div class="text text-14" v-if="staticStore.static && staticStore.static.length">
                  {{ $t('I accept') }}
                  <RouterLink
                    class="text-blue"
                    :to="
                      '/static/' +
                      staticStore.static
                        .find((item) => item.is_terms)
                        .title.toLowerCase()
                        .replace(/ /g, '-')
                    "
                    >{{ $t(staticStore.static.find((item) => item.is_terms).title) }}</RouterLink
                  >
                  {{ $t('and') }}
                  <RouterLink
                    class="text-blue"
                    :to="
                      '/static/' +
                      staticStore.static
                        .find((item) => item.is_privacy)
                        .title.toLowerCase()
                        .replace(/ /g, '-')
                    "
                    >{{ $t(staticStore.static.find((item) => item.is_privacy).title) }}</RouterLink
                  >
                </div>
              </label>
              <button
                :class="[
                  'button w-135',
                  {
                    disabled: !name || !surname || !email || !phone || !topic || !message || !terms,
                  },
                ]"
                type="submit"
              >
                <span>{{ $t('Send') }}</span>
              </button>
            </div>

            <Transition>
              <div class="text text-14 text-red text-error" v-if="contactStore.error">
                {{ contactStore.error }}
              </div>
            </Transition>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
