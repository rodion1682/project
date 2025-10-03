<template>
  <div>
    <div class="overlay" v-if="!showCookieModal"></div>
    <div class="cookie-modal" v-if="!showCookieModal">
      <div class="cookie-content">
        <span v-if="manageIsVisible" class="managable-content">
          <div class="text-24 text-inter">
            {{ $t('Customise Consent Preferences') }}
          </div>

          <div class="chekbox-container">
            <label class="chekbox-label">
              <div class="chekbox-label-wrapper">
                <input type="checkbox" disabled v-model="necessary" />
                <div class="checkbox"></div>
                <div class="desc text text-inter">
                  <b>{{ $t('Essential Cookies (Always Active)') }}:</b>
                  {{
                    $t(
                      'These cookies are essential for the website tofunctionand cannot be switched off.',
                    )
                  }}
                </div>
              </div>
            </label>
          </div>
          <div class="chekbox-container">
            <label class="chekbox-label">
              <div class="chekbox-label-wrapper">
                <input type="checkbox" v-model="functional" />
                <div class="checkbox"></div>
                <div class="desc text text-inter">
                  <b>{{ $t('Functional & Performance Cookies') }}:</b>
                  {{
                    $t(
                      'These cookies improve the website`s performance and functionality by remembering your preferences and settings, such as login',
                    )
                  }}
                </div>
              </div>
            </label>
          </div>
          <div class="chekbox-container">
            <label class="chekbox-label">
              <div class="chekbox-label-wrapper">
                <input type="checkbox" v-model="analytics" />
                <div class="checkbox"></div>
                <div class="desc text text-inter">
                  <b>{{ $t('Analytics Cookies') }}:</b>
                  {{
                    $t(
                      'These cookies collect information on how visitors interact with our website, such as pages visited, time spent on the site, and traffic sources. This data helps us understand user behaviour and improve',
                    )
                  }}
                </div>
              </div>
            </label>
          </div>
          <button class="button" @click="acceptCookies">
            <span>{{ $t('Done') }}</span>
          </button>
        </span>
        <span v-else>
          <div class="text-24 small text-inter">
            {{ $t('We Value Your Privacy') }}
          </div>
          <p
            class="desc text-inter"
            v-if="
              staticStore.static &&
              staticStore.static.filter((item) => item.title.toLowerCase().includes('cookie'))[0]
            "
          >
            {{
              $t(
                'By clicking “Accept All”, you agree to the storing of cookies on your device to enhance site navigation, performance andanalyze website usage. Please visit our ',
              )
            }}
            <RouterLink
              class="desc text-inter link"
              :to="
                '/static/' +
                staticStore.static
                  .find((item) => item.title.toLowerCase().includes('cookie'))
                  .title.toLowerCase()
                  .replace(/ /g, '-')
              "
              >{{
                $t(
                  staticStore.static.find((item) => item.title.toLowerCase().includes('cookie'))
                    .title,
                )
              }}</RouterLink
            >
            {{ $t('to learn more.') }}
          </p>
          <button class="button small" @click="acceptCookies">
            <span>{{ $t('Accept All') }}</span>
          </button>
          <button @click="declineCookies" class="button button2 small decline-button">
            <span>{{ $t('Accept Only Essential') }}</span>
          </button>
          <button @click="declineCookies" class="button small">
            <span>{{ $t('Decline') }}</span>
          </button>
          <button @click="manageCookies" class="button button2 small manage-button">
            <span>{{ $t('Customize') }}</span>
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { useStaticStore } from '@/stores/static'

import VueCookies from 'vue-js-cookie'

export default {
  data() {
    return {
      showCookieModal: VueCookies.get('cookiesAccepted'), // Check if user accepted cookies
      manageIsVisible: false,
      necessary: true,
      analytics: false,
      functional: false,
      performance: false,
      advertisement: false,
      staticStore: '',
    }
  },
  mounted() {
    this.staticStore = useStaticStore()
  },
  methods: {
    acceptCookies() {
      this.showCookieModal = true
      VueCookies.set('cookiesAccepted', 'true', 365) // Set a cookie that lasts for a year
    },
    declineCookies() {
      this.showCookieModal = true
      VueCookies.set('cookiesAccepted', 'false', 365)
    },
    manageCookies() {
      this.manageIsVisible = true
    },
  },
}
</script>
<style scoped>
.cookie-modal {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 700px;
  background-color: #13151d;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  padding: 20px;
  text-align: center;
  z-index: 5;
  overflow: auto;
  max-height: calc(100vh - 40px);
}
.cookie-modal .title.samll {
  font-size: 24px;
  line-height: 32px;
}
.cookie-modal .desc {
  color: #fff;
  margin-top: 16px;
  font-size: 14px;
  line-height: 18px;
}
.cookie-modal .desc a {
  text-decoration: underline;
}
.button {
  margin: 16px 16px 0;
  width: 100px;
  display: inline-block;
  color: #fff;
  padding: 12px 32px;
  font-size: 14px;
}
.cookie-content {
  font-size: 16px;
  margin-bottom: 10px;
  text-align: center;
}
.managable-content {
  text-align: left;
}
.cookie-content .button {
  width: 190px;
  height: 56px;
  padding: 0;
}
.cookie-content .button span {
  justify-content: center;
}
.cookie-content .chekbox-label .title.small {
  color: #fff;
  font-size: 18px;
  line-height: 24px;
}
.cookie-content .chekbox-container {
  margin-top: 24px;
}
.cookie-content .chekbox-container + .chekbox-container {
  margin-top: 16px;
}
.accept-button {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}

.accept-button:hover {
  background-color: #0056b3;
}
.chekbox-label {
  display: block;
  cursor: pointer;
}
.chekbox-label-wrapper {
  padding-left: 38px;
  position: relative;
}
.chekbox-label-wrapper {
  &::before {
    content: '';
    width: 22px;
    height: 22px;
    border: 1px solid #7e7e83;
    border-radius: 4px;
    background: #1d1d23;
    position: absolute;
    left: 0;
    top: 0;
    cursor: pointer;
  }
  &.red::before {
    border-color: #dc4650;
  }
}
.checkbox {
  content: '';
  width: 24px;
  height: 24px;
  position: absolute;
  left: 0;
  top: 0;
  border-color: #70e2ff;
  background-color: #70e2ff;
  background-image: url('../../src/assets/img/check.svg');
  background-size: 12px 9px;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 4px;
  opacity: 0;
  visibility: hidden;
  transition: 0.3s;
}
input {
  display: none;
}
input:checked + .checkbox {
  opacity: 1;
  visibility: visible;
}
.chekbox-container {
  text-align: left;
  width: 100%;
}

@media screen and (max-width: 768px) {
  .cookie-modal {
    position: absolute;
    left: 50%;
    top: 20px;
    bottom: auto;
    transform: translateX(-50%);
  }
}
</style>
