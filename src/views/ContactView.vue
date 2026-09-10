<script setup>
import { ref, watch } from 'vue'
import { useStaticStore } from '@/stores/static'
import { useSettingsStore } from '@/stores/settings'
import { useContactStore } from '@/stores/contact'
const staticStore = useStaticStore()
const settingsStore = useSettingsStore()
const contactStore = useContactStore()

const name = ref('')
const email = ref('')
const phone = ref('')
const message = ref('')
const terms = ref('')

watch(
  () => contactStore.success,
  () => {
    if (contactStore.success) {
      name.value = ''
      email.value = ''
      phone.value = ''
      message.value = ''
      terms.value = ''
    }
  },
)

const removeCyrillic = (value) => {
  return value.replace(/[А-Яа-яЁёІіЇїЄєҐґ]/g, '')
}

watch(name, (val) => {
  name.value = removeCyrillic(val)
})

watch(email, (val) => {
  email.value = removeCyrillic(val)
})

watch(phone, (val) => {
  phone.value = removeCyrillic(val)
})

watch(message, (val) => {
  message.value = removeCyrillic(val)
})
</script>

<template>
  <main class="main">
    <div class="section breadcrumbs-section">
      <div class="wrapper flex">
        <RouterLink to="/" class="text text-14 text-white">{{ $t('Home') }}</RouterLink>
        <div class="text text-14 text-white">/</div>
        <div class="text text-14 text-pink">{{ $t('Contact Us') }}</div>
      </div>
    </div>
    <div class="section contact-section">
      <div class="wrapper flex justify-between flex-wrap">
        <div class="contact-left">
          <div class="contact-item">
            <div class="text text-32 text-russo">{{ $t('Our Address') }}</div>
            <div class="text text-16" v-if="settingsStore.settings">
              {{ $t(settingsStore.settings.requisites) }}
            </div>
          </div>
          <div class="contact-item">
            <div class="text text-32 text-russo">{{ $t('Customer Care') }}</div>
            <a
              :href="'mailto:' + settingsStore?.settings?.support_email"
              class="text text-16 text-sky-blue weight-700"
            >
              {{ settingsStore?.settings?.support_email }}
            </a>
            <a
              :href="
                'tel:' + (settingsStore?.settings?.support_phone?.replace(/[\s()-]/g, '') || '')
              "
              class="text text-16 text-sky-blue weight-700"
            >
              {{ settingsStore?.settings?.support_phone }}
            </a>
          </div>
        </div>
        <div class="contact-right">
          <div class="text text-24 text-russo text-center">{{ $t('Contact Us') }}</div>
          <form class="form" @submit.prevent="contactStore.submit(name, email, phone, message)">
            <label class="label flex items-center">
              <div class="input-container">
                <input type="text" :placeholder="$t('Name, Surname')" v-model="name" />
              </div>
            </label>
            <label class="label flex items-center">
              <div class="input-container">
                <input type="text" :placeholder="$t('E-mail')" v-model="email" />
              </div>
            </label>
            <label class="label flex items-center">
              <div class="input-container">
                <input type="text" :placeholder="$t('Phone')" v-model="phone" />
              </div>
            </label>
            <label class="label flex items-center">
              <div class="input-container">
                <textarea :placeholder="$t('Message')" v-model="message"></textarea>
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
                    >{{ $t('T&Cs') }}</RouterLink
                  >
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
                    >{{ $t('Privacy Policy') }}</RouterLink
                  >
                </div>
              </label>
              <button
                :class="[
                  'button colored w-150',
                  { disabled: !terms || !name || !email || !phone || !message },
                ]"
                type="submit"
              >
                <span> {{ $t('Send') }}</span>
              </button>
            </div>
            <Transition>
              <div class="text text-14 text-red text-error" v-if="contactStore.error">
                {{ $t(contactStore.error) }}
              </div>
            </Transition>
            <Transition>
              <div class="text text-14 text-green text-error" v-if="contactStore.success">
                {{ $t(contactStore.success) }}
              </div>
            </Transition>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>
