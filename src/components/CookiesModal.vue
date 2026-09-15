<script setup>
import { useCookiesModalStore } from '@/stores/cookiesModal'
import { useStaticStore } from '@/stores/static'
const cookiesModalStore = useCookiesModalStore()
const staticStore = useStaticStore()

function acceptCookies() {
  localStorage.setItem('cookiesAccepted', 'true')
  cookiesModalStore.closeModal()
}
</script>

<template>
  <div class="modal cookies-modal flex justify-start items-end">
    <div class="modal-wrapper">
      <div
        class="modal-form-container text-center"
        v-if="staticStore.static && staticStore.static.length"
      >
        <div class="right">
          <div class="text text-24 weight-500 text-white">
            {{ $t('Cookies are used on this Website') }}
          </div>
          <div class="text text-14 text-white">
            {{
              $t(
                'Our website uses cookies to enable essential features and improve your browsing experience. Essential cookies are automatically deployed to facilitate proper functioning of the website. Our website does not use non-essential cookies. For more detailed information on how we use cookies, please refer to our',
              )
            }}
            <RouterLink
              :to="
                '/static/' +
                staticStore.static
                  .find((item) => item.title.toLowerCase().includes('cookie'))
                  .title.toLowerCase()
                  .replace(/ /g, '-')
              "
              class="text-purple-custom"
              >{{
                $t(
                  staticStore.static.find((item) => item.title.toLowerCase().includes('cookie'))
                    .title,
                )
              }}</RouterLink
            >
          </div>

          <button class="button white w-150" @click="acceptCookies">
            <span>{{ $t('Ok') }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cookies-modal {
  display: none !important;
}
</style>
